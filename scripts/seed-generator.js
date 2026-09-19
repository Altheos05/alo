#!/usr/bin/env node
/**
 * seed-generator.js — Convertit les ~3 289 fichiers markdown en INSERT SQL
 *
 * Usage :
 *   node seed-generator.js > seed_data.sql
 *   node seed-generator.js --append  (génère un .sql qui s'ajoute à seed.sql)
 *
 * Traite : items, monstres, PNJ, boutiques, compétences, quêtes
 */

const fs = require('fs');
const path = require('path');

const BASE = '/home/user1808/Bureau/alo/données';
const APPEND_MODE = process.argv.includes('--append');

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------
function walk(dir) {
  const files = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) files.push(...walk(full));
      else if (entry.name.endsWith('.md')) files.push(full);
    }
  } catch { /* ignore */ }
  return files;
}

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  const s = String(val);
  if (s === 'TRUE' || s === 'FALSE' || s === 'true' || s === 'false') return s.toUpperCase();
  if (s === 't' || s === 'f') return s.toUpperCase() === 'T' ? 'TRUE' : 'FALSE';
  return `'${s.replace(/'/g, "''")}'`;
}

// « racines, direction » → '{"racines","direction"}' (topic_tags est un TEXT[]).
function pgArray(csv) {
  const items = String(csv || '').split(',').map(t => t.trim()).filter(Boolean);
  return `{${items.map(t => `"${t.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`;
}

function batchInsert(table, columns, rows, chunk = 50, onConflict, onConflictAction = 'DO NOTHING') {
  const colList = columns.join(', ');
  const conflict = onConflict ? ` ON CONFLICT ${onConflict} ${onConflictAction}` : '';
  let sql = '';
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    sql += `INSERT INTO ${table} (${colList}) VALUES\n`;
    sql += slice.map(r => `(${r.map(esc).join(', ')})`).join(',\n');
    sql += conflict + ';\n';
  }
  return sql;
}

// ---------------------------------------------------------------------------
// 1. ITEMS → T_ITEMS_DICT
// ---------------------------------------------------------------------------
// Champ « - **Label** : valeur · … » du bloc d'identification (premier segment).
function bulletField(content, label) {
  const m = content.match(new RegExp(`\\*\\*${label}\\*\\*\\s*:\\s*([^·\\n]+)`, 'i'));
  return m ? m[1].trim() : null;
}

// Valeur d'une table markdown, verticale (| Label | Valeur |) ou horizontale
// (en-tête | A | Label | B | puis ligne de données).
// Comparaison insensible à la casse et aux accents (« Durabilite » existe dans ~150 fiches).
const norm = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function tableField(content, label) {
  const want = norm(label);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim().startsWith('|')) continue;
    const rows = [];
    while (i < lines.length && lines[i].trim().startsWith('|')) {
      const cells = lines[i].trim().split('|').slice(1, -1).map(c => c.replace(/\*/g, '').trim());
      if (!cells.every(c => /^[\s\-:]*$/.test(c))) rows.push(cells);
      i++;
    }
    const col = rows[0]?.findIndex(h => norm(h) === want) ?? -1;
    if (col >= 0) {
      if (rows[1]?.[col] !== undefined) return rows[1][col];
      continue;
    }
    for (const r of rows) {
      if (r[0] !== undefined && norm(r[0]) === want && r[1] !== undefined) return r[1];
    }
  }
  return null;
}

// « 1 350 Yrds », « 22 000 ¥ » → 1350, 22000 (espaces fines/insécables comprises).
function firstNumber(text) {
  const m = text?.match(/\d[\d\s  ]*/);
  return m ? parseInt(m[0].replace(/[\s  ]/g, ''), 10) : null;
}

const RARITY = {
  commun: 'common', commune: 'common', common: 'common',
  'peu commun': 'uncommon', 'peu commune': 'uncommon', uncommon: 'uncommon',
  rare: 'rare', épique: 'epic', epique: 'epic', epic: 'epic',
  légendaire: 'legendary', legendaire: 'legendary', legendary: 'legendary', unique: 'unique',
};

// Effet d'usage d'un consommable (colonne « Effet » de la fiche). Les bonus de stat
// deviennent un effet persistant EFF_<Item_ID> (D90 E6), collecté dans CONSUMABLE_EFFECTS.
const CONSUMABLE_EFFECTS = [];
const STAT_KEYS = { STR: 'stat_str', AGI: 'stat_agi', VIT: 'stat_vit', INT: 'stat_int' };

function parseUseEffect(itemId, name, content) {
  const effect = tableField(content, 'Effet') || '';
  const duration = tableField(content, 'Durée') || '';
  const out = {};
  const hp = effect.match(/Soin instantané de ([\d\s\u00a0\u202f]+)\s*HP/i);
  if (hp) out.heal_hp = firstNumber(hp[1]);
  const mp = effect.match(/Restaure ([\d\s\u00a0\u202f]+)\s*MP/i);
  if (mp) out.heal_mp = firstNumber(mp[1]);
  const regen = effect.match(/régénère (\d+) HP\/s(?: \+ (\d+) MP\/s)?[^\d]*?(\d+) s/i)
             || effect.match(/régénère (?:(\d+) HP\/s \+ )?(\d+) MP\/s[^\d]*?(\d+) s/i);
  if (/régénère/i.test(effect)) {
    const secs = parseInt(effect.match(/pendant (\d+) s/i)?.[1] || '0', 10);
    const hpRate = parseInt(effect.match(/(\d+) HP\/s/i)?.[1] || '0', 10);
    const mpRate = parseInt(effect.match(/(\d+) MP\/s/i)?.[1] || '0', 10);
    if (hpRate) out.regen_hp = hpRate * secs;
    if (mpRate) out.regen_mp = mpRate * secs;
  }
  const stat = effect.match(/\+(\d+)%\s*(STR|AGI|VIT|INT)\b/i);
  if (stat) {
    const mins = duration.match(/(\d+)\s*min/i);
    const hours = duration.match(/(\d+)\s*h/i);
    const secs = mins ? parseInt(mins[1], 10) * 60 : hours ? parseInt(hours[1], 10) * 3600 : 1800;
    out.effect_id = `EFF_${itemId}`;
    CONSUMABLE_EFFECTS.push([out.effect_id, name.slice(0, 50), 'buff', STAT_KEYS[stat[2].toUpperCase()], Number(stat[1]),
      'percent', secs, 0, 0, 'TRUE', 1, null]);
  }
  return Object.keys(out).length ? out : null;
}

function parseItems() {
  const rows = [];
  const seen = new Set();
  const files = walk(path.join(BASE, 'items_equipements'));
  for (const f of files) {
    if (path.basename(f).startsWith('_')) continue; // skip index files
    // Les fiches de nœuds (FLO/ORE/FSH) ne sont pas des objets : elles citent
    // l'objet produit, que le repli d'ID attribuait à tort au nœud (parseNodes).
    if (NODE_DIRS.some(d => f.includes(`${path.sep}${d}${path.sep}`))) continue;
    const content = fs.readFileSync(f, 'utf-8');
    // Le bloc d'identification prime : le repli « premier ID du fichier »
    // attrapait un ID cité en préambule (ex. ACC_ANN_003 dans la fiche de MSC_ENG_001).
    const itemId = (content.match(/\*\*Item_ID\*\*\s*:\s*`?([A-Z0-9_]+)`?/) ||
                    content.match(/item_id[:\s]+`?([A-Z0-9_]+)`?/i) ||
                    content.match(/([A-Z]+_[A-Z]+_\d{3})/) ||
                    [])[1];
    if (!itemId || seen.has(itemId)) continue;
    seen.add(itemId);

    // « Bois d'If — `MAT_WOD_001` » / « ARM_TAI_001 — Ceinture… » → nom seul.
    const name = content.match(/^#\s+(.+)/m)?.[1]
      ?.replace(/\s*[—-]?\s*\(?`[^`]+`\)?\s*$/, '')
      .replace(new RegExp(`^${itemId}\\s*[—-]\\s*`), '')
      .trim() || itemId;
    const type = (itemId.startsWith('ARM_') ? 'ARM' :
                  itemId.startsWith('WPN_') ? 'WPN' :
                  itemId.startsWith('CSM_') ? 'CSM' :
                  itemId.startsWith('MAT_') ? 'MAT' :
                  itemId.startsWith('BAG_') ? 'BAG' :
                  itemId.startsWith('HRN_') ? 'HRN' :
                  itemId.startsWith('BELT_') ? 'BELT' :
                  itemId.startsWith('OFT_') ? 'OFT' : 'MSC');
    // Outils de récolte (D87/D88) : MSC dont le sous-type porte le préfixe d'outil.
    const subtype = itemId.match(/^(OUT_[A-Z]+)_/)?.[1] || null;
    const rarityRaw = (bulletField(content, 'Raret[ée]') || '').toLowerCase().replace(/[^a-zéè ]/g, '').trim();
    const rarity = RARITY[rarityRaw] || 'common';
    // T0 (tenues de départ) n'existe pas au schéma (CHECK 1..5) : ramené à T1.
    const tierRaw = parseInt((bulletField(content, 'Tier') || '').match(/(\d)/)?.[1] || '1', 10);
    const tier = Math.min(5, Math.max(1, tierRaw));
    const buyPrice = firstNumber(bulletField(content, 'Prix')) ??
                     firstNumber(bulletField(content, 'Prix base')) ??
                     firstNumber(tableField(content, 'Prix base')) ??
                     firstNumber(tableField(content, 'Prix')) ?? 0;
    const atk = firstNumber(tableField(content, 'ATQ')) ?? firstNumber(tableField(content, 'ATK')) ?? 0;
    const def = firstNumber(tableField(content, 'DEF')) ?? 0;
    const durability = firstNumber(tableField(content, 'Durabilité')) ?? 0;
    const isConsumable = type === 'CSM' ? 'TRUE' : 'FALSE';
    const isCraftable = type === 'MAT' ? 'TRUE' : 'FALSE';
    const maxStack = type === 'CSM' || type === 'MAT' ? 99 : 1;
    // Revente déclarée (« · 0 Yrds (revente) » pour un objet lié), sinon 25 %.
    const resaleValue = firstNumber(content.match(/\*\*Prix\*\*[^\n]*·\s*\**\s*([\d\s\u00a0\u202f]+)[^\n·]*revente/i)?.[1]) ??
                        Math.floor(buyPrice * 0.25);
    const desc = (content.match(/description\s*[:]\s*(.+)/i)?.[1] || '').slice(0, 200).replace(/'/g, "''");
    const useEffect = type === 'CSM' ? parseUseEffect(itemId, name, content) : null;

    rows.push([itemId, name, type, subtype, rarity, tier, atk, def, 0.5, 0, 0, 0,
               buyPrice, resaleValue, maxStack, isConsumable, isCraftable, durability,
               desc, '', null, /\*\*Lié\*\*\s*:\s*OUI/i.test(content) ? 'TRUE' : 'FALSE',
               useEffect ? JSON.stringify(useEffect) : null]);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 1-bis. NŒUDS DE RESSOURCE → T_RESOURCE_NODES (D87)
// ---------------------------------------------------------------------------
const NODE_DIRS = ['flore', 'filons', 'peche'];
const NODE_TYPES = { FLO: 'FLORA', ORE: 'ORE', FSH: 'FISH' };
const NODE_TOOLS = { FLORA: null, ORE: 'OUT_PIO', FISH: 'OUT_CAN' };

function parseNodes() {
  const rows = [];
  for (const dir of NODE_DIRS) {
    for (const f of walk(path.join(BASE, 'items_equipements', 'materiaux', dir))) {
      if (path.basename(f).startsWith('_')) continue;
      const content = fs.readFileSync(f, 'utf-8');
      const nodeId = path.basename(f, '.md');
      const nodeType = NODE_TYPES[nodeId.slice(0, 3)];
      if (!nodeType) continue;
      const name = (content.match(/^#\s+(.+?)\s+—\s+`/m)?.[1] || nodeId).trim();
      const zoneId = content.match(/\*\*Zone\*\*\s*:\s*`(ZONE_[A-Z0-9_]+)`/)?.[1];
      const itemId = content.match(/\*\*Item\*\*\s*:\s*`([A-Z0-9_]+)`/)?.[1];
      const [yMin, yMax] = (content.match(/\*\*Quantite\*\*\s*:\s*(\d+)-(\d+)/) || [null, 1, 1]).slice(1).map(Number);
      const tier = parseInt(bulletField(content, 'Tier')?.match(/(\d)/)?.[1] || '1', 10);
      const level = parseInt(bulletField(content, 'Niveau requis')?.match(/(\d+)/)?.[1] || '1', 10);
      const respawn = parseInt(bulletField(content, 'Repousse')?.match(/(\d+)/)?.[1] || '0', 10);
      if (!zoneId || !itemId || !respawn) {
        console.warn(`  [SKIP] ${nodeId} — zone, objet ou repousse manquant`);
        continue;
      }
      rows.push([nodeId, nodeType, name, zoneId, itemId, yMin, yMax, tier, level, NODE_TOOLS[nodeType], respawn]);
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 1-ter. EFFETS PERSISTANTS DES SORTS → T_STATUS_EFFECTS_DICT (D90)
// ---------------------------------------------------------------------------
// Bloc « ## Effet persistant (D90) » des fiches de sorts ; l'effet porte l'ID
// EFF_<Skill_ID>, ce qui relie sort et effet sans colonne supplémentaire.
function parseSpellEffects() {
  const rows = [];
  for (const f of walk(path.join(BASE, 'competences_magie'))) {
    const content = fs.readFileSync(f, 'utf-8');
    // Buff (« +5 % », allié) ou altération de combat (« -30 % », ennemi).
    const m = content.match(/\*\*Effet_ID\*\*\s*:\s*`(EFF_[A-Z0-9_]+)`\s*·\s*\*\*Nom\*\*\s*:\s*(.+)\n- \*\*Stat\*\*\s*:\s*`(\w+)`\s*·\s*\*\*Valeur\*\*\s*:\s*([+-])(\d+)\s*%\s*·\s*\*\*Durée\*\*\s*:\s*(\d+)\s*s/);
    if (!m) continue;
    const [, effectId, name, stat, sign, value, duration] = m;
    const type = sign === '-' ? 'debuff' : 'buff';
    rows.push([effectId, name.trim().slice(0, 50), type, stat, Number(value), 'percent', Number(duration), 0, 0, 'TRUE', 1, null]);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 1-quater. RECETTES DE CUISINE → T_RECIPES (D90 E6, étape 61)
// ---------------------------------------------------------------------------
// « **Recette** : 1× Truite des cimes + 1× Sel-de-lune *(cuisine)* » : chaque nom
// est résolu par le nom d'un objet ou son « **Alias recette** ». Une recette dont un
// ingrédient ne se résout pas est écartée et signalée.
function parseCookingRecipes() {
  const names = new Map();
  for (const f of walk(path.join(BASE, 'items_equipements'))) {
    const content = fs.readFileSync(f, 'utf-8');
    const id = content.match(/\*\*Item_ID\*\*\s*:\s*`([A-Z0-9_]+)`/)?.[1];
    if (!id) continue;
    const title = content.match(/^#\s+(.+)/m)?.[1]?.replace(/\s*[—-]?\s*\(?`[^`]+`\)?\s*$/, '').replace(new RegExp(`^${id}\\s*[—-]\\s*`), '');
    if (title) names.set(norm(title).replace(/-/g, ' '), id);
    const alias = bulletField(content, 'Alias recette');
    if (alias) names.set(norm(alias).replace(/-/g, ' '), id);
  }
  const rows = [];
  for (const f of walk(path.join(BASE, 'items_equipements', 'consommables', 'nourriture'))) {
    const content = fs.readFileSync(f, 'utf-8');
    const id = content.match(/\*\*Item_ID\*\*\s*:\s*`([A-Z0-9_]+)`/)?.[1];
    const line = content.match(/\*\*Recette\*\*\s*:\s*(.+)/)?.[1];
    if (!id || !line) continue;
    const ingredients = [];
    let unresolved = null;
    for (const [, qty, raw] of line.matchAll(/(\d+)×\s*([^+*(]+)/g)) {
      const key = norm(raw.split(',')[0]).replace(/-/g, ' ').trim();
      const itemId = names.get(key);
      if (!itemId) { unresolved = raw.trim(); break; }
      ingredients.push({ item_id: itemId, quantity: parseInt(qty, 10) });
    }
    if (unresolved || !ingredients.length) {
      console.warn(`  [SKIP] recette ${id} — ingrédient non résolu : ${unresolved}`);
      continue;
    }
    const name = content.match(/^#\s+(.+)/m)?.[1]?.trim() || id;
    rows.push([`RCP_${id}`, name.slice(0, 100), 'cooking', 'beginner', JSON.stringify(ingredients), id, 1, 0.9, 10, 0, null]);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 2. MONSTRES → T_MONSTERS_DICT
// ---------------------------------------------------------------------------
function parsePipeTableStats(content) {
  let hp = 100, atk = 10, def = 10, agi = 10, exp = 50;
  let element = null, weakness = null, resistance = null;
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l.startsWith('|')) continue;
    // Collect consecutive pipe rows (skip separator rows: all cells are dashes/spaces/colons)
    const rows = [];
    while (i < lines.length) {
      const r = lines[i].trim();
      if (!r.startsWith('|')) break;
      const cells = r.split('|').map(c => c.trim()).filter(c => c);
      if (!cells.every(c => /^[\s\-:]+$/.test(c))) rows.push(cells);
      i++;
    }
    if (rows.length < 2) continue;
    const hdr = rows[0].map(h => h.replace(/[*]/g, '').toLowerCase());
    const data = rows[1];
    const hpCol = hdr.findIndex(h => h === 'pv' || h === 'hp');
    const atkCol = hdr.findIndex(h => h === 'atq' || h === 'atk');
    const defCol = hdr.findIndex(h => h === 'def');
    const agiCol = hdr.findIndex(h => h === 'vitesse' || h === 'agi');
    const expCol = hdr.findIndex(h => h === 'xp');
    if (hpCol >= 0 && data[hpCol]) {
      const m = data[hpCol].match(/(\d+)/);
      if (m) hp = parseInt(m[1]);
    }
    if (atkCol >= 0 && data[atkCol]) {
      const m = data[atkCol].match(/(\d+)/);
      if (m) atk = parseInt(m[1]);
    }
    if (defCol >= 0 && data[defCol]) {
      const m = data[defCol].match(/(\d+)/);
      if (m) def = parseInt(m[1]);
    }
    if (agiCol >= 0 && data[agiCol]) {
      const m = data[agiCol].match(/(\d+)/);
      if (m) agi = parseInt(m[1]);
    }
    if (expCol >= 0 && data[expCol]) {
      const m = data[expCol].match(/(\d+)/);
      if (m) exp = parseInt(m[1]);
    }
    // Format 1 extended rows: élément, faiblesse, résistance (rows 2+ in the same table)
    for (let ri = 2; ri < rows.length; ri++) {
      const row = rows[ri];
      const label = row[0].replace(/[*]/g, '').toLowerCase();
      if (label.includes('élément') && row[1]) element = row[1].replace(/[*]/g, '').trim();
      if (label.includes('faiblesse') && row[1]) weakness = row[1].replace(/[*]/g, '').trim();
      if (label.includes('résistance') && row[1]) resistance = row[1].replace(/[*]/g, '').trim();
    }
    if (hpCol >= 0) break; // found our stats table
  }
  return { hp, atk, def, agi, exp, element, weakness, resistance };
}

function parseMonsters() {
  const rows = [];
  const seen = new Set();
  const files = walk(path.join(BASE, 'personnages_bestiaire', 'monstres'));
  for (const f of files) {
    if (path.basename(f).startsWith('_')) continue;
    const content = fs.readFileSync(f, 'utf-8');
    let mobId = (content.match(/MOB_ID\s*:\s*(\S+)/i) ||
                   content.match(/`(MOB_\w+)`/) ||
                   content.match(/(MOB_\w{3}_\d{3})/) ||
                   [])[1];
    if (!mobId || seen.has(mobId)) continue;
    // Skip malformed IDs (numeric suffix must be pure digits)
    const suffix = mobId.split('_').pop();
    if (!/^\d{3}$/.test(suffix)) continue;
    seen.add(mobId);

    const name = (content.match(/^#\s+(.+?)──?/)?.[1]?.trim() ||
                  content.match(/^#\s+(.+)/m)?.[1]?.replace(/`.*$/, '').trim() || mobId)
                  .replace(/^[─—]+\s*/, '').replace(/\s*[─—]+\s*$/, '').replace(/\s+$/, '').trim();
    const level = parseInt(content.match(/\*?Niveau\*?[^0-9]*(\d+)/i)?.[1] ||
                           content.match(/niveau\s*:\s*(\d+)/i)?.[1] || 1);
    const family = content.match(/Famille\s*:\s*(.+)/i)?.[1]?.trim() || null;
    const stats = parsePipeTableStats(content);
    const bounty = Math.floor(stats.exp * 0.3);
    const isBoss = content.includes('BOSS') || content.includes('boss') ? 'TRUE' : 'FALSE';
    const isFlying = content.includes('volant') || content.includes('ailé') || content.includes('aile') ? 'TRUE' : 'FALSE';
    const lore = (content.match(/Comportement\/Loot\/Bot\s*(.+?)(?:\n\n|\n#|$)/s)?.[1] || '').trim().slice(0, 500);

    rows.push([mobId, name, level, family, stats.hp, 0,
               stats.atk, stats.def, stats.agi,
               stats.element, stats.weakness, stats.resistance, null,
               stats.exp, bounty,
               isBoss, isFlying, 10, 'passive', lore]);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 2b. Spawns → T_SPAWN_TABLES
// ---------------------------------------------------------------------------
const DIR_TO_ZONE = {
  aincrad:    'ZONE_AIN_HUB_001',
  neutre:     'ZONE_SYL_HUNT_001',
  air:        'ZONE_SYL_HUNT_001',
  sylphe:     'ZONE_SYL_HUNT_001',
  sylph:      'ZONE_SYL_HUNT_001',
  salamander: 'ZONE_SAL_HUNT_001',
  salamandre: 'ZONE_SAL_HUNT_001',
  undine:     'ZONE_UND_HUNT_001',
  cait:       'ZONE_CAI_HUNT_001',
  caitsith:   'ZONE_CAI_HUNT_001',
  imp:        'ZONE_IMP_HUNT_001',
  gnome:      'ZONE_GNO_HUNT_001',
  puca:       'ZONE_PUC_HUNT_001',
  leprechaun: 'ZONE_LEP_HUNT_001',
  lepre:      'ZONE_LEP_HUNT_001',
  spriggan:   'ZONE_SPR_HUNT_001',
  jotun:      'ZONE_JOT_FLD_001',
  jotunheimr: 'ZONE_JOT_FLD_001',
  yggdrasil:  'ZONE_YGG_DUN_001',
  golden:     'ZONE_YGG_DUN_001',
};

const DIR_TO_BOSS_ZONE = {
  aincrad:    'ZONE_AIN_HUB_001',
  neutre:     'ZONE_SYL_DUN_001',
  air:        'ZONE_SYL_DUN_001',
  sylphe:     'ZONE_SYL_DUN_001',
  sylph:      'ZONE_SYL_DUN_001',
  salamander: 'ZONE_SAL_DUN_001',
  salamandre: 'ZONE_SAL_DUN_001',
  undine:     'ZONE_UND_DUN_001',
  cait:       'ZONE_CAI_DUN_001',
  caitsith:   'ZONE_CAI_DUN_001',
  imp:        'ZONE_IMP_DUN_001',
  gnome:      'ZONE_GNO_DUN_001',
  puca:       'ZONE_PUC_DUN_001',
  leprechaun: 'ZONE_LEP_DUN_001',
  lepre:      'ZONE_LEP_DUN_001',
  spriggan:   'ZONE_SPR_DUN_001',
  jotun:      'ZONE_JOT_RAID_001',
  jotunheimr: 'ZONE_JOT_RAID_001',
  yggdrasil:  'ZONE_YGG_DUN_001',
  golden:     'ZONE_YGG_TOP_001',
};

const KNOWN_ZONES = new Set([
  'ZONE_CAI_HUNT_001','ZONE_CAI_HUNT_002','ZONE_CAI_DUN_001',
  'ZONE_GNO_HUNT_001','ZONE_GNO_HUNT_002','ZONE_GNO_DUN_001',
  'ZONE_IMP_HUNT_001','ZONE_IMP_HUNT_002','ZONE_IMP_DUN_001',
  'ZONE_LEP_HUNT_001','ZONE_LEP_HUNT_002','ZONE_LEP_DUN_001',
  'ZONE_PUC_HUNT_001','ZONE_PUC_HUNT_002','ZONE_PUC_DUN_001',
  'ZONE_SAL_HUNT_001','ZONE_SAL_HUNT_002','ZONE_SAL_DUN_001',
  'ZONE_SPR_HUNT_001','ZONE_SPR_HUNT_002','ZONE_SPR_DUN_001',
  'ZONE_SYL_HUNT_001','ZONE_SYL_HUNT_002','ZONE_SYL_DUN_001',
  'ZONE_UND_HUNT_001','ZONE_UND_HUNT_002','ZONE_UND_DUN_001',
  'ZONE_AIN_HUB_001',
  'ZONE_JOT_FLD_001','ZONE_JOT_RAID_001',
  'ZONE_YGG_DUN_001','ZONE_YGG_TOP_001',
  'ZONE_ROUTE_CAI_ALN','ZONE_ROUTE_GNO_ALN','ZONE_ROUTE_IMP_ALN',
  'ZONE_ROUTE_LEP_ALN','ZONE_ROUTE_PUC_ALN','ZONE_ROUTE_SAL_ALN',
  'ZONE_ROUTE_SPR_ALN','ZONE_ROUTE_SYL_ALN','ZONE_ROUTE_UND_ALN',
]);

function parseSpawns() {
  const rows = [];
  const seen = new Set();
  const baseDir = path.join(BASE, 'personnages_bestiaire', 'monstres');
  const files = walk(baseDir);
  for (const f of files) {
    if (path.basename(f).startsWith('_')) continue;
    const content = fs.readFileSync(f, 'utf-8');
    const mobId = (content.match(/MOB_ID\s*:\s*(\S+)/i) ||
                   content.match(/`(MOB_\w+)`/) ||
                   content.match(/(MOB_\w{3}_\d{3})/) ||
                   [])[1];
    if (!mobId || seen.has(mobId)) continue;
    const suffix = mobId.split('_').pop();
    if (!/^\d{3}$/.test(suffix)) continue;
    seen.add(mobId);
    const isBoss = content.includes('BOSS') || content.includes('boss') || content.includes('raid');
    let dirName = path.basename(path.dirname(f)).toLowerCase().replace(/[^a-z]/g, '');
    // Root-level standalone files (golden_knights, thrym)
    if (dirName === 'monstres') {
      const fn = path.basename(f).toLowerCase();
      if (fn.includes('golden') || fn.includes('yggdrasil')) dirName = 'golden';
      else if (fn.includes('thrym') || fn.includes('geants')) dirName = 'jotunheimr';
    }
    const zone = isBoss
      ? (DIR_TO_BOSS_ZONE[dirName] || DIR_TO_ZONE[dirName] || 'ZONE_SYL_HUNT_001')
      : (DIR_TO_ZONE[dirName] || 'ZONE_SYL_HUNT_001');
    if (!KNOWN_ZONES.has(zone)) {
      console.error(`SKIP spawn ${mobId}: zone ${zone} inconnue`);
      continue;
    }
    rows.push([zone, mobId, isBoss ? 5 : 30, 1, 100, isBoss ? 1 : 5, 'always', 'any', isBoss ? 'TRUE' : 'FALSE']);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 3. PNJ → T_NPC + T_NPC_KNOWLEDGE
// ---------------------------------------------------------------------------
function parseNPCs() {
  const npcRows = [];
  const knowledgeRows = [];
  const seen = new Set();
  const files = walk(path.join(BASE, 'personnages_bestiaire', 'pnj'));
  for (const f of files) {
    if (path.basename(f).startsWith('_')) continue;
    let content = fs.readFileSync(f, 'utf-8');
    // Normalize pipe tables: strip **bold** markers so regexes match Field | Value
    content = content.replace(/^\|\s*\*\*(.+?)\*\*/gm, '| $1');
    const npcId = (content.match(/NPC_ID\s*[|]\s*`(\S+)`/i) ||
                   content.match(/`(NPC_\w+_\d+)`/) ||
                   content.match(/(NPC_\w{3}_\d{2})/) ||
                   [])[1];
    if (!npcId || seen.has(npcId)) continue;
    seen.add(npcId);

    function mapRace(r) {
      if (!r) return 'RACE_SYLPH';
      const rl = r.toLowerCase();
      if (rl.includes('system') || rl.includes('syst')) return 'RACE_SYLPH';
      if (rl.includes('sylphe') || rl.includes('sylph')) return 'RACE_SYLPH';
      if (rl.includes('salamander') || rl.includes('salamandre')) return 'RACE_SALAMANDER';
      if (rl.includes('undine')) return 'RACE_UNDINE';
      if (rl.includes('cait') || rl.includes('caitsith') || rl.includes('chat')) return 'RACE_CAIT_SITH';
      if (rl.includes('imp') && !rl.includes('gnome')) return 'RACE_IMP';
      if (rl.includes('gnome')) return 'RACE_GNOME';
      if (rl.includes('puca')) return 'RACE_PUCA';
      if (rl.includes('spriggan')) return 'RACE_SPRIGGAN';
      if (rl.includes('leprechaun') || rl.includes('lepre')) return 'RACE_LEPRECHAUN';
      return 'RACE_SYLPH';
    }
    function mapRole(r) {
      if (!r) return 'SERVICE';
      const rl = r.toLowerCase();
      if (rl.includes('merchant') || rl.includes('marchand') || rl.includes('commerçant') || rl.includes('boutique') || rl.includes('forge') || rl.includes('armurier') || rl.includes('joaillier') || rl.includes('tailleur') || rl.includes('apothicaire') || rl.includes('alchimiste') || rl.includes('aubergiste') || rl.includes('shop')) return 'MERCHANT';
      if (rl.includes('master') || rl.includes('maître') || rl.includes('instructor') || rl.includes('entraîneur') || rl.includes('professeur') || rl.includes('sensei') || rl.includes('tuteur') || rl.includes('coach') || rl.includes('formateur')) return 'SKILL_MASTER';
      if (rl.includes('quest') || rl.includes('quête') || rl.includes('mission') || rl.includes('contrat') || rl.includes('bounty') || rl.includes('chasseur')) return 'QUEST_GIVER';
      if (rl.includes('guard') || rl.includes('garde') || rl.includes('soldat') || rl.includes('milice') || rl.includes('vigile') || rl.includes('sentinel') || rl.includes('watch') || rl.includes('patrouille') || rl.includes('chevalier') || rl.includes('paladin')) return 'GUARD';
      if (rl.includes('lord') || rl.includes('seigneur') || rl.includes('maire') || rl.includes('comte') || rl.includes('duc') || rl.includes('roi') || rl.includes('reine') || rl.includes('baron') || rl.includes('noble') || rl.includes('gouverneur') || rl.includes('dirigeant')) return 'LORD';
      if (rl.includes('service') || rl.includes('domestique') || rl.includes('intendant') || rl.includes('majordome') || rl.includes('bibliothécaire') || rl.includes('scribe') || rl.includes('artisan') || rl.includes('paysan') || rl.includes('fermier') || rl.includes('pêcheur') || rl.includes('cuisinier') || rl.includes('serveur')) return 'SERVICE';
      if (rl.includes('black') || rl.includes('noir') || rl.includes('ombre') || rl.includes('contrebande') || rl.includes('assassin') || rl.includes('voleur') || rl.includes('thief') || rl.includes('bandit') || rl.includes('marché noir') || rl.includes('malfaiteur')) return 'BLACK_MARKET';
      if (rl.includes('pnj') || rl.includes('system') || rl.includes('admin') || rl.includes('développeur')) return 'SERVICE';
      return 'SERVICE';
    }

    const displayName = (content.match(/\|\s*Nom affiché\s*\|\s*(.+?)\s*\|/i)?.[1]?.trim() ||
                         content.match(/\|\s*Nom\s*\|\s*(.+?)\s*\|/i)?.[1]?.trim() ||
                         content.match(/^#\s+(.+?)\s*[—\-]/m)?.[1]?.trim() ||
                         npcId).slice(0, 100);
    const raceRaw = content.match(/\|\s*Race\s*\|\s*(.+?)\s*\|/i)?.[1]?.trim() || 'Sylphe';
    const race = mapRace(raceRaw);
    const roleRaw = (content.match(/\|\s*Rôle\b.*?\|\s*(.+?)\s*\|/i)?.[1]?.trim() ||
                     content.match(/\|\s*role_type\s*\|\s*(.+?)\s*\|/i)?.[1]?.trim() ||
                     'SERVICE').replace(/`/g, '');
    const roleType = mapRole(roleRaw);
    // Un sous-lieu « ZONE_SPR_CAP_001A — Penwether, … » appartient à la zone ZONE_SPR_CAP_001.
    const zoneId = (content.match(/`(ZONE_\w+_\d+)`/) ||
                    content.match(/\|\s*Zone\s*\|\s*`?(ZONE_[A-Z]+_[A-Z]+_\d{3})/i)
                   )?.[1]?.trim() || null;
    const levelMatch = content.match(/\|\s*Niveau\s*\/\s*HP\s*\/\s*MP\s*\|\s*(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/i) ||
                       content.match(/\|\s*Niveau\b.*?\|\s*(\d+).*?\|/i);
    const level = parseInt(levelMatch?.[1] || 1);
    const hp = parseInt(levelMatch?.[2] || 100);
    const mp = parseInt(levelMatch?.[3] || 50);
    const qiBudget = parseInt(content.match(/\|\s*qi_budget\s*\|\s*(\d+)/i)?.[1] ||
                              content.match(/qi_budget\s*[|]\s*(\d+)/i)?.[1] || 10);
    const isEssential = content.includes('VRAI') && (content.includes('is_essential') || content.match(/\|\s*is_essential\s*\|\s*VRAI/i)) ? 'TRUE' : 'FALSE';
    const isCanon = content.includes('VRAI') && (content.includes('is_canon') || content.match(/\|\s*is_canon\s*\|\s*VRAI/i)) ? 'TRUE' : 'FALSE';
    const shopRef = content.match(/\|\s*shop_ref\s*\|\s*`?(\S+?)`?\s*\|/i)?.[1] || null;
    const questRef = content.match(/\|\s*quest_ref\s*\|\s*`?(\S+?)`?\s*\|/i)?.[1] || null;

    npcRows.push([npcId, displayName, race,
                  roleType, zoneId, null, level, hp, mp, null,
                  shopRef, questRef, null, null, qiBudget, isCanon, isEssential, 'TRUE']);

    // QI slots
    const qiTable = content.match(/\|.*QI_ID.*Niv.*Sujet.*Contenu.*\|(?:\s*\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|)+/);
    if (qiTable) {
      const lines = content.split('\n');
      let inQISection = false;
      for (const line of lines) {
        if (line.includes('QI_ID') && line.includes('Niv') && line.includes('Sujet')) {
          inQISection = true; continue;
        }
        if (inQISection && line.startsWith('|') && line.split('|').length >= 6) {
          const parts = line.split('|').map(p => p.trim());
          // Gabarit réel (D33) : | # | QI_ID | Niv | Sujet | Contenu | Condition |
          // -> QI_ID est en parts[2] (parts[1] = numéro de ligne), jamais parts[1].
          const qiId = (parts[2] || '').replace(/`/g, '');
          if (parts.length >= 8 && /^QI_\w+/.test(qiId)) {
            const kLevel = (parts[3] || '').trim().toUpperCase();
            if (!['K0', 'K1', 'K2', 'K3', 'KX'].includes(kLevel)) {
              console.warn(`  [SKIP] ${qiId} — niveau QI invalide : "${kLevel}"`);
              continue;
            }
            // K3/KX sont stockés comme les autres : le pare-feu (D18) filtre à l'injection
            // (vue K0+K1+(K2∩unlocks)), pas à l'ingestion — cf. table_t_npc_knowledge.md trigger K3.
            knowledgeRows.push([
              qiId, npcId, kLevel, pgArray(parts[4]),
              parts[5]?.replace(/\n/g, ' ') || '',
              parts[6]?.includes('JAMAIS') ? null : (parts[6] || null),
              parts[6]?.includes('déflection') || parts[6]?.includes('deflection') ? parts.slice(6).join(' | ').replace(/^.*?d[ée]flection\s*[:\-–]\s*/i, '').replace(/\s*\|\s*$/, '').replace(/`/g, '').trim() : null,
              'FALSE', null
            ]);
          }
        }
      }
    }
  }
  return { npcRows, knowledgeRows };
}

// D84 : « `!demander wrenna routes` (sujet de service, K0) : … IA `SYS_SET_TRADE_ROUTE` ».
// Le slot K0/K1 portant ce sujet devient un sujet de service ; à défaut, un slot est créé.
function markServiceTopics(npcRows, knowledgeRows) {
  const byNpc = new Map();
  for (const f of walk(path.join(BASE, 'personnages_bestiaire', 'pnj'))) {
    const content = fs.readFileSync(f, 'utf-8');
    const npcId = content.match(/`(NPC_\w+_\d+)`/)?.[1];
    for (const line of content.split('\n')) {
      const m = line.match(/`!demander \S+ (\w+)[^`]*`\s*\(sujet de service, K[01][^)]*\)\s*:\s*(.*?IA `(SYS_\w+)`.*)$/);
      if (m && npcId) byNpc.set(`${npcId}|${m[1]}`, { npcId, topic: m[1], text: m[2], command: m[3] });
    }
  }
  const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/_/g, ' ');
  for (const svc of byNpc.values()) {
    const row = knowledgeRows.find(r => r[1] === svc.npcId && ['K0', 'K1'].includes(r[2]) &&
      r[3].slice(1, -1).split(',').some(t => norm(t.replace(/"/g, '')) === norm(svc.topic)));
    if (row) {
      row[7] = 'TRUE';
      row[8] = svc.command;
    } else {
      knowledgeRows.push([`QI_${svc.npcId.slice(4)}_SVC_${svc.topic.toUpperCase()}`.slice(0, 50), svc.npcId, 'K0',
        pgArray(svc.topic), svc.text.replace(/`/g, '').slice(0, 400), null, null, 'TRUE', svc.command]);
    }
  }
  return byNpc.size;
}

// ---------------------------------------------------------------------------
// 4. BOUTIQUES → T_SHOPS + T_SHOP_ITEMS
// ---------------------------------------------------------------------------
// Dossier de boutiques → zone de la ville (repli quand la fiche ne cite pas d'ID de zone).
const SHOP_CITY_ZONES = {
  alne: 'ZONE_NEU_CAP_001', archipel: 'ZONE_UND_CAP_001', brokkheim: 'ZONE_LEP_CAP_001',
  duskarn: 'ZONE_IMP_CAP_001', freelia: 'ZONE_CAI_CAP_001', gattan: 'ZONE_SAL_CAP_001',
  granzam: 'ZONE_GNO_CAP_001', lioda: 'ZONE_PUC_CAP_001', penwether: 'ZONE_SPR_CAP_001',
  swilvane: 'ZONE_SYL_CAP_001', voulg: 'ZONE_SAL_TWN_001',
};

function parseShops(npcZones = new Map()) {
  const shopRows = [];
  const itemRows = [];
  const seenShops = new Set();
  const files = walk(path.join(BASE, 'game_design', 'boutiques'));
  for (const f of files) {
    if (path.basename(f).startsWith('_')) continue;
    const content = fs.readFileSync(f, 'utf-8');
    const shopId = (content.match(/SHOP_ID\s*[|]\s*`(\S+)`/i) ||
                    content.match(/`(SHOP_\w+_\d+)`/) ||
                    content.match(/(SHOP_\w{3}_\d{2})/) ||
                    [])[1];
    if (!shopId || seenShops.has(shopId)) continue;
    seenShops.add(shopId);

    const ownerNpc = (content.match(/Propriétaire.*?`(NPC_\w+_\d+)`/i) ||
                      content.match(/owner_npc_id\s*[|]\s*`(\S+)`/i) ||
                      [])?.[1] || null;
    // 154 fiches nomment la zone en clair (« Archipel, Lac Cristallin ») : repli sur la
    // zone du propriétaire, puis sur la ville du dossier (elles tombaient toutes à Aincrad).
    const zoneId = (content.match(/Zone.*?[|]\s*`(ZONE_[A-Z]+_[A-Z]+_\d{3})/i) ||
                    content.match(/zone_id\s*[|]\s*`(\S+)`/i) ||
                    content.match(/`(ZONE_[A-Z]+_[A-Z]+_\d{3})`/) ||
                    [])?.[1] || npcZones.get(ownerNpc) || SHOP_CITY_ZONES[path.basename(path.dirname(f))] || 'ZONE_AIN_HUB_001';
    const shopType = (content.match(/Type\s*[|]\s*(\w+)/i)?.[1] ||
                      content.match(/shop_type\s*[|]\s*`(\w+)`/i)?.[1] ||
                      'BOUTIQUE').toUpperCase();
    const accessRule = content.match(/Accès\s*[|]\s*(.+)/i)?.[1]?.trim() || 'LIBRE';
    const buyback = content.match(/Rachète\s*[:]\s*(.+)/i)?.[1]?.trim() ||
                    content.match(/buyback_categories\s*[|]\s*(.+)/i)?.[1]?.trim() || null;

    shopRows.push([shopId, ownerNpc, zoneId, shopType, accessRule, buyback, 'TRUE']);

    // Shop items — parcours des lignes du fichier
    const lines = content.split('\n');
    let inShopTable = false;
    for (const line of lines) {
      if (line.includes('Item_ID') && line.includes('Prix')) { inShopTable = true; continue; }
      if (!inShopTable) continue;
      if (line.startsWith('|---')) continue;
      if (!line.startsWith('|')) { inShopTable = false; continue; }
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      if (parts.length >= 5 && parts[0].startsWith('`')) {
        const itemId = parts[0].replace(/`/g, '');
        const price = parseInt((parts[3] || '').replace(/[\sYrds]/g, '')) || 0;
        const origin = parts[4]?.includes('IMPORT') ? 'IMPORT' : 'LOCAL';
        const originCity = parts[4]?.replace(/^(IMPORT|LOCAL)\s*/i, '')?.trim() || null;
        const stockRaw = (parts[5] || '').trim();
        const stock = stockRaw === '∞' || stockRaw === '-1' ? -1 : parseInt(stockRaw) || -1;
        const restock = parseInt(parts[6] || 0) || null;
        const condition = (parts[7] || '').trim() || null;
        if (itemId && price > 0 && !itemId.startsWith('Item_ID')) {
          itemRows.push([shopId, itemId, price, origin, originCity, stock, restock, condition]);
        }
      }
    }
  }
  return { shopRows, itemRows };
}

// ---------------------------------------------------------------------------
// 5. COMPÉTENCES → T_SKILLS_DICT
// ---------------------------------------------------------------------------
function parseSkills() {
  const rows = [];
  const seen = new Set();
  const files = walk(path.join(BASE, 'competences_magie'));
  for (const f of files) {
    if (path.basename(f).startsWith('_')) continue;
    const content = fs.readFileSync(f, 'utf-8');
    const skillId = (content.match(/Skill_ID\s*:\s*`?(\S+)`?/i) ||
                     content.match(/skill_id\s*:\s*(\S+)/i) ||
                     content.match(/`?((?:MAG|OSS|PAS)_\w+_\d{3})`?/) ||
                     [])[1];
    if (!skillId || seen.has(skillId)) continue;
    seen.add(skillId);

    const name = content.match(/^#\s+(.+)/m)?.[1]?.trim() || skillId;
    const skillType = skillId.startsWith('MAG') ? 'MAG' : skillId.startsWith('OSS') ? 'OSS' : 'PAS';
    const domain = skillType === 'PAS' ?
                   (content.includes('CBT') ? 'CBT' : content.includes('CRA') ? 'CRA' : content.includes('EXP') ? 'EXP' : 'SOC') :
                   (content.includes('CBT') || content.includes('Combat') ? 'CBT' : 'SOC');
    const tier = parseInt(bulletField(content, 'Tier')?.match(/(\d)/)?.[1] || content.match(/Tier\s*:\s*T?(\d)/i)?.[1] || 1);
    const mpCost = parseInt(content.match(/Coût MP\s*[|]\s*(\d+)/i)?.[1] || 0);
    const castFrames = parseFloat(content.match(/Temps d'Incantation\s*[|]\s*([\d.]+)s/i)?.[1] || 0) * 20;
    // « Cooldown | 3 min » / « 40 s » / « Aucun » → secondes.
    const cd = content.match(/Cooldown\s*[|]\s*(\d+(?:[.,]\d+)?)\s*(min|s)?/i);
    const cooldown = cd ? Math.round(parseFloat(cd[1].replace(',', '.')) * (/min/i.test(cd[2] || '') ? 60 : 1)) : 0;
    const hitCount = parseInt(content.match(/Nombre de Hits\s*[|]\s*(\d+)/i)?.[1] || content.match(/hit_count\s*[:]\s*(\d+)/i)?.[1] || 1);
    // Sorts : « Inflige / Restaure **130 + (INT × 0.4)** » ; OSS : « Multiplicateur Total | x2.1 » sur l'ATQ.
    const dmg = content.match(/Inflige \*\*(\d+)\s*\+\s*\(INT\s*×\s*([\d.]+)\)\*\*/);
    const heal = content.match(/Restaure \*\*(\d+)\s*\+\s*\(INT\s*×\s*([\d.]+)\)\*\*/);
    const ossMult = content.match(/Multiplicateur Total\s*[|]\s*x?([\d.]+)/i);
    const baseDmg = dmg ? parseInt(dmg[1], 10) : 0;
    const baseHealing = heal ? parseInt(heal[1], 10) : 0;
    const statScaling = dmg ? JSON.stringify({ stat_int: parseFloat(dmg[2]) })
      : heal ? JSON.stringify({ stat_int: parseFloat(heal[2]) })
      : ossMult ? JSON.stringify({ multiplier: parseFloat(ossMult[1]) })
      : null;
    const desc = (content.match(/Effet\s*(.+?)(?:\n\n|\n#|$)/s)?.[1] || '').trim().slice(0, 300);
    const unlock = (content.match(/Acquisition.*?\n(?:.*\n)*?.*?`NPC_\w+_\d+`/i)?.[0] ||
                    content.match(/Enseignant\s*[:]\s*(.+)/i)?.[1]?.trim() || null)?.slice(0, 200);
    const maxMastery = 3;

    rows.push([skillId, name, skillType, domain, tier, hitCount, mpCost, Math.round(castFrames),
               cooldown, baseDmg, baseHealing, statScaling, desc, unlock, maxMastery, 'TRUE']);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 6. QUÊTES → T_QUESTS_DICT (partial)
// ---------------------------------------------------------------------------
// Donneur, zone (celle du donneur), niveau, récompenses et étapes lus dans le format
// réel des fiches : sans zone, aucune quête n'apparaissait jamais au tableau.
function parseQuests(npcZones = new Map()) {
  const rows = [];
  const seen = new Set();
  const files = walk(path.join(BASE, 'game_design', 'quetes'));
  for (const f of files) {
    if (path.basename(f).startsWith('_')) continue;
    const content = fs.readFileSync(f, 'utf-8');
    const questId = (content.match(/`?([A-Z]+_[A-Z]+_[A-Za-z]+_\d+)`?/) ||
                     content.match(/(QST_\w+_\d+)/) ||
                     [])[1];
    if (!questId || questId.startsWith('_index') || seen.has(questId)) continue;
    seen.add(questId);

    const title = content.match(/^#\s+(.+)/m)?.[1]?.trim() || questId;
    const qtype = questId.includes('DAILY') || questId.includes('daily') ? 'daily' :
                  questId.includes('LEG') || questId.includes('legendary') ? 'legendary' :
                  questId.includes('T5') || questId.includes('_t5') ? 't5' : 'side';
    const giver = content.match(/\*\*Donneur\*\*\s*:\s*`(NPC_\w+_\d+)`/)?.[1] || null;
    const prereq = bulletField(content, 'Prérequis') || '';
    const reward = bulletField(content, 'Récompense') || '';
    const minLevel = parseInt(prereq.match(/Niveau\s*(\d+)/i)?.[1] || content.match(/Niveau requis?\s*[:]\s*(\d+)/i)?.[1] || 1);
    const rewardXp = parseInt(reward.match(/([\d\s]+)\s*EXP/i)?.[1]?.replace(/\s/g, '') || content.match(/EXP\s*[:]\s*(\d+)/i)?.[1] || 0);
    const rewardYrds = parseInt(reward.match(/([\d\s]+)\s*Yrds?/i)?.[1]?.replace(/\s/g, '') || content.match(/Yrds?\s*[:]\s*(\d+)/i)?.[1] || 0);
    const steps = (content.split(/^## /m).find(sec => /^D[ée]roulement/.test(sec)) || '').match(/^\d+\.\s/gm)?.length || 1;
    const firstStep = (content.split(/^## /m).find(sec => /^D[ée]roulement/.test(sec)) || '').match(/^1\.\s+(.+)$/m)?.[1] || '';

    rows.push([questId, title.replace(/\s*—\s*`[^`]+`\s*$/, ''), qtype, minLevel, null, npcZones.get(giver) || null, giver, '{}', steps,
               rewardXp, rewardYrds, '[]', null, '{}',
               qtype === 'daily' ? 'TRUE' : 'FALSE', 'FALSE',
               qtype === 'daily' ? 'TRUE' : 'FALSE',
               qtype === 'daily' ? 24 : null, firstStep.slice(0, 500), '']);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
try {
  if (APPEND_MODE) {
    console.log('-- seed_data.sql — généré par seed-generator.js (append mode)');
  }

  // Items
  console.log('-- ============================================================');
  console.log('-- T_ITEMS_DICT');
  console.log('-- ============================================================');
  const items = parseItems();
  console.log(batchInsert('T_ITEMS_DICT', [
    'item_id','name','item_type','subtype','rarity','tier','base_atk','base_def','weight',
    'str_req','agi_req','int_req','buy_price','resale_value','max_stack','is_consumable',
    'is_craftable','durability_max','description','lore_text','icon','binds_on_acquire','use_effect'
  ], items, 50, '(item_id)'));
  console.log(`-- Items : ${items.length} lignes`);

  // Monsters
  console.log('-- ============================================================');
  console.log('-- T_MONSTERS_DICT');
  const recipes = parseCookingRecipes();
  console.log('-- ============================================================');
  console.log('-- T_RECIPES (cuisine)');
  console.log('-- ============================================================');
  console.log(batchInsert('T_RECIPES', [
    'recipe_id','name','craft_type','skill_level','ingredients','result_item_id','result_quantity',
    'success_rate','craft_time_sec','yrd_cost','unlock_cond'
  ], recipes, 1, '(recipe_id)'));
  console.log(`-- Recettes de cuisine : ${recipes.length} lignes`);

  const spellEffects = parseSpellEffects();
  console.log('-- ============================================================');
  console.log('-- T_STATUS_EFFECTS_DICT (effets persistants des sorts, D90)');
  console.log('-- ============================================================');
  console.log(batchInsert('T_STATUS_EFFECTS_DICT', [
    'effect_id','name','type','stat_modified','modifier_value','modifier_type','duration_sec',
    'tick_damage','tick_interval','is_dispellable','max_stacks','icon_emoji'
  ], [...spellEffects, ...CONSUMABLE_EFFECTS], 50, '(effect_id)'));
  console.log(`-- Effets de sorts : ${spellEffects.length} lignes`);

  const nodes = parseNodes();
  console.log('-- ============================================================');
  console.log('-- T_RESOURCE_NODES');
  console.log('-- ============================================================');
  console.log(batchInsert('T_RESOURCE_NODES', [
    'node_id','node_type','name','zone_id','yield_item_id','yield_min','yield_max',
    'node_tier','level_required','required_tool_prefix','respawn_sec'
  ], nodes, 1, '(node_id)'));
  console.log(`-- Nœuds de ressource : ${nodes.length} lignes`);

  console.log('-- ============================================================');
  const monsters = parseMonsters();
  console.log(batchInsert('T_MONSTERS_DICT', [
    'monster_id','name','level','family','base_hp','base_mp','base_atk','base_def','base_agi',
    'element','weakness','resistance','immune','exp_yield','bounty_yrds',
    'is_boss','is_flying','aggression_range','spawn_behavior','lore_text'
  ], monsters, 50, '(monster_id)', 'DO UPDATE SET name = EXCLUDED.name, level = EXCLUDED.level, family = EXCLUDED.family, base_hp = EXCLUDED.base_hp, base_atk = EXCLUDED.base_atk, base_def = EXCLUDED.base_def, base_agi = EXCLUDED.base_agi, exp_yield = EXCLUDED.exp_yield, is_boss = EXCLUDED.is_boss, lore_text = EXCLUDED.lore_text'));
  console.log(`-- Monstres : ${monsters.length} lignes`);

  // Spawn tables
  console.log('-- ============================================================');
  console.log('-- T_SPAWN_TABLES');
  console.log('-- ============================================================');
  const spawns = parseSpawns();
  if (spawns.length > 0) {
    console.log(batchInsert('T_SPAWN_TABLES', [
      'zone_id','monster_id','spawn_rate','min_level','max_level','max_concurrent','time_condition','weather_cond','is_boss'
    ], spawns, 50));
  }
  console.log(`-- Spawns : ${spawns.length} lignes`);

  // NPCs
  const npcData = parseNPCs();
  console.log('-- ============================================================');
  console.log('-- T_NPC');
  console.log('-- ============================================================');
  console.log(batchInsert('T_NPC', [
    'npc_id','display_name','race','role_type','zone_id','location_label','level','hp','mp',
    'stats_json','shop_ref','quest_ref','dialog_ref','secret_note','qi_budget',
    'is_canon','is_essential','is_alive'
  ], npcData.npcRows, 1, '(npc_id)'));
  console.log(`-- PNJ : ${npcData.npcRows.length} lignes`);

  if (npcData.knowledgeRows.length > 0) {
    console.log('-- ============================================================');
    console.log('-- T_NPC_KNOWLEDGE');
    console.log('-- ============================================================');
    const services = markServiceTopics(npcData.npcRows, npcData.knowledgeRows);
    console.log(batchInsert('T_NPC_KNOWLEDGE', [
      'qi_id','npc_id','k_level','topic_tags','content','unlock_condition','deflection_line',
      'is_service','service_sys_command'
    ], npcData.knowledgeRows, 1));
    console.log(`-- Sujets de service (D84) : ${services}`);
    console.log(`-- QI : ${npcData.knowledgeRows.length} lignes`);
  }

  // Shops
  const shopData = parseShops(new Map(npcData.npcRows.filter(r => r[4]).map(r => [r[0], r[4]])));
  console.log('-- ============================================================');
  console.log('-- T_SHOPS');
  console.log('-- ============================================================');
  console.log(batchInsert('T_SHOPS', [
    'shop_id','owner_npc_id','zone_id','shop_type','access_rule','buyback_categories','is_open'
  ], shopData.shopRows, 1, '(shop_id)'));
  console.log(`-- Boutiques : ${shopData.shopRows.length} lignes`);

  console.log('-- ============================================================');
  console.log('-- T_SHOP_ITEMS');
  console.log('-- ============================================================');
  console.log(batchInsert('T_SHOP_ITEMS', [
    'shop_id','item_id','price','origin','origin_city','stock','restock_days','condition'
  ], shopData.itemRows, 1));
  console.log(`-- Articles boutique : ${shopData.itemRows.length} lignes`);

  // Skills
  console.log('-- ============================================================');
  console.log('-- T_SKILLS_DICT');
  console.log('-- ============================================================');
  const skills = parseSkills();
  console.log(batchInsert('T_SKILLS_DICT', [
    'skill_id','name','skill_type','domain','tier','hit_count','mp_cost','cast_frames',
    'cooldown_sec','base_damage','base_healing','stat_scaling','description',
    'unlock_requirement','max_mastery','is_equippable'
  ], skills, 50, '(skill_id)'));
  console.log(`-- Compétences : ${skills.length} lignes`);

  // Quests
  console.log('-- ============================================================');
  console.log('-- T_QUESTS_DICT');
  console.log('-- ============================================================');
  const quests = parseQuests(new Map(npcData.npcRows.filter(r => r[4]).map(r => [r[0], r[4]])));
  if (quests.length > 0) {
    console.log(batchInsert('T_QUESTS_DICT', [
      'quest_id','title','quest_type','min_level','recommended_level','zone_id','giver_npc_id',
      'objective_json','total_steps','reward_xp','reward_yrds','reward_items','reward_title_id',
      'prerequisites','is_repeatable','is_hidden','has_deadline','deadline_hours',
      'description','lore_text'
    ], quests, 1, '(quest_id)'));
  }
  console.log(`-- Quêtes : ${quests.length} lignes`);

  console.log('-- ============================================================');
  console.log('-- FIN seed_data.sql');
  console.log('-- ============================================================');

} catch (err) {
  console.error('ERREUR:', err.message);
  process.exit(1);
}
