import logger from '../utils/logger.js';
import { queueDirect, queueZone, queueGlobal, getQueueSummary } from './notifications.js';
import { forceMarriage, settleDivorce, generateGiftIfMissing } from '../engine/marriage.js';
import { addToInventory } from '../engine/bank.js';
import { modifyDurability, breakItem, setDurability } from '../engine/durability.js';
import { setNodeEvent, restockFishingSpot, resetHarvest } from '../engine/gathering.js';
import { applyEffect, clearEffects } from '../engine/effects.js';

const COMMANDS = {};

function define(name, def) {
  COMMANDS[name] = def;
}

define('SYS_GRANT_ITEM', {
  description: 'Accorde un ou plusieurs exemplaires d\'un objet à un joueur',
  schema: { player_id: 'uuid', item_id: 'string', quantity: 'integer', reason: 'string' },
  async d71(db, params) {
    const pr = await db.query('SELECT 1 FROM t_avatars WHERE avatar_uuid = $1', [params.player_id]);
    if (!pr.rows.length) return `Joueur ${params.player_id} introuvable`;
    const ir = await db.query('SELECT 1 FROM t_items_dict WHERE item_id = $1', [params.item_id]);
    if (!ir.rows.length) return `Objet ${params.item_id} introuvable`;
    return null;
  },
  async prereqs(db, params) {
    const pr = await db.query('SELECT is_alive FROM t_avatars WHERE avatar_uuid = $1', [params.player_id]);
    if (pr.rows.length && !pr.rows[0].is_alive) return 'Le joueur est mort';
    return null;
  },
  async authorize(source) {
    return ['gm', 'system', 'quest_reward'].includes(source);
  },
  async execute(db, params) {
    const qty = Math.max(1, Math.min(9999, parseInt(params.quantity, 10) || 1));
    const placed = await addToInventory(db, params.player_id, { item_id: params.item_id, qty }, 'gm');
    if (placed.overflow > 0) return { ok: false, message: `Inventaire plein : ${placed.overflow} exemplaire(s) non accordé(s)` };
    logger.info('SYS_GRANT_ITEM ok', { player: params.player_id, item: params.item_id, qty });
    return { ok: true, message: `${qty}× ${params.item_id} accordé à ${params.player_id}` };
  },
});

define('SYS_ADVANCE_QUEST', {
  description: 'Avance une étape de quête pour un joueur',
  schema: { player_id: 'uuid', quest_id: 'string', steps: 'integer' },
  async d71(db, params) {
    const pr = await db.query('SELECT 1 FROM t_avatars WHERE avatar_uuid = $1', [params.player_id]);
    if (!pr.rows.length) return `Joueur ${params.player_id} introuvable`;
    const qr = await db.query('SELECT 1 FROM t_quests_dict WHERE quest_id = $1', [params.quest_id]);
    if (!qr.rows.length) return `Quête ${params.quest_id} introuvable`;
    return null;
  },
  async prereqs(db, params) {
    const aq = await db.query(
      'SELECT aq.current_step, aq.progress_status, qd.total_steps FROM t_active_quests aq JOIN t_quests_dict qd ON qd.quest_id = aq.quest_id WHERE aq.avatar_uuid = $1 AND aq.quest_id = $2',
      [params.player_id, params.quest_id]
    );
    if (!aq.rows.length) return 'Quête non active chez ce joueur';
    if (aq.rows[0].progress_status === 'completed') return 'Quête déjà terminée';
    return null;
  },
  async authorize(source) {
    return ['gm', 'system', 'quest_reward'].includes(source);
  },
  async execute(db, params) {
    const steps = Math.max(1, parseInt(params.steps, 10) || 1);
    const questInfo = await db.query(
      'SELECT qd.total_steps FROM t_active_quests aq JOIN t_quests_dict qd ON qd.quest_id = aq.quest_id WHERE aq.avatar_uuid = $1 AND aq.quest_id = $2',
      [params.player_id, params.quest_id]
    );
    if (!questInfo.rows.length) return { ok: false, message: 'Quête introuvable' };
    const totalSteps = questInfo.rows[0].total_steps || 10;
    const aq = await db.query(
      `UPDATE t_active_quests
       SET current_step = current_step + $1,
           progress_status = CASE WHEN current_step + $1 >= $2 THEN 'completed' ELSE progress_status END,
           completed_at = CASE WHEN current_step + $1 >= $2 THEN NOW() ELSE NULL END
       WHERE avatar_uuid = $3 AND quest_id = $4 AND progress_status = 'in_progress'
       RETURNING current_step, progress_status`,
      [steps, totalSteps, params.player_id, params.quest_id]
    );
    if (!aq.rows.length) return { ok: false, message: 'Échec mise à jour quête' };
    const row = aq.rows[0];
    const done = row.progress_status === 'completed';
    logger.info('SYS_ADVANCE_QUEST ok', { player: params.player_id, quest: params.quest_id, steps, done, totalSteps });
    return { ok: true, message: `Quête avancée (étape ${row.current_step}/${totalSteps})${done ? ' — TERMINÉE !' : ''}`, completed: done };
  },
});

define('SYS_NPC_KNOWLEDGE_UNLOCK', {
  description: 'Débloque une fiche de connaissance PNJ pour un joueur',
  schema: { player_id: 'uuid', qi_id: 'string' },
  async d71(db, params) {
    const pr = await db.query('SELECT 1 FROM t_avatars WHERE avatar_uuid = $1', [params.player_id]);
    if (!pr.rows.length) return `Joueur ${params.player_id} introuvable`;
    // §4 de table_t_npc_knowledge.md : le déblocage scénarisé couvre K2 et K3.
    const kr = await db.query("SELECT 1 FROM t_npc_knowledge WHERE qi_id = $1 AND k_level IN ('K2','K3')", [params.qi_id]);
    if (!kr.rows.length) return `Fiche ${params.qi_id} introuvable ou non débloquable (K2/K3 seulement)`;
    return null;
  },
  async prereqs(db, params) {
    const existing = await db.query(
      'SELECT 1 FROM t_npc_knowledge_unlocks WHERE avatar_uuid = $1 AND qi_id = $2',
      [params.player_id, params.qi_id]
    );
    if (existing.rows.length) return 'Fiche déjà débloquée';
    return null;
  },
  async authorize(source) {
    return ['gm', 'system'].includes(source);
  },
  async execute(db, params) {
    await db.query(
      'INSERT INTO t_npc_knowledge_unlocks (avatar_uuid, qi_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [params.player_id, params.qi_id]
    );
    logger.info('SYS_NPC_KNOWLEDGE_UNLOCK ok', { player: params.player_id, qi_id: params.qi_id });
    return { ok: true, message: `Fiche ${params.qi_id} débloquée` };
  },
});

define('SYS_SET_ENV_HAZARD', {
  description: 'Applique un changement climatique dans une zone pour une durée',
  schema: { zone_id: 'string', weather: 'string', temperature: 'integer' },
  async d71(db, params) {
    const zr = await db.query('SELECT 1 FROM t_zones WHERE zone_id = $1', [params.zone_id]);
    if (!zr.rows.length) return `Zone ${params.zone_id} introuvable`;
    const validWeather = ['clear', 'rain', 'storm', 'snow', 'fog', 'sandstorm', 'magic_surge', 'toxic_fog'];
    if (!validWeather.includes(params.weather)) return `Météo ${params.weather} invalide`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    const temp = parseInt(params.temperature, 10) || 20;
    await db.query(
      `INSERT INTO t_weather (zone_id, current_weather, temperature, last_changed, changed_by)
       VALUES ($1, $2, $3, NOW(), 'system')
       ON CONFLICT (zone_id) DO UPDATE SET current_weather = $2, temperature = $3, last_changed = NOW(), changed_by = 'system'`,
      [params.zone_id, params.weather, temp]
    );
    logger.info('SYS_SET_ENV_HAZARD ok', { zone: params.zone_id, weather: params.weather });
    return { ok: true, message: `Météo ${params.weather} (${temp}°C) appliquée dans ${params.zone_id}` };
  },
});

define('SYS_SHOP_RESTOCK', {
  description: 'Réapprovisionne un stock de boutique',
  schema: { shop_id: 'string' },
  async d71(db, params) {
    const sr = await db.query('SELECT 1 FROM t_shops WHERE shop_id = $1', [params.shop_id]);
    if (!sr.rows.length) return `Boutique ${params.shop_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system', 'timer'].includes(source); },
  async execute(db, params) {
    const result = await db.query(
      `UPDATE t_shop_items SET stock = CASE
         WHEN stock < 0 THEN stock
         ELSE GREATEST(stock, (SELECT MAX(stock) FROM t_shop_items WHERE shop_id = $1))
       END
       WHERE shop_id = $1
       RETURNING item_id, stock`,
      [params.shop_id]
    );
    logger.info('SYS_SHOP_RESTOCK ok', { shop: params.shop_id, items: result.rows.length });
    return { ok: true, message: `Boutique ${params.shop_id} réapprovisionnée (${result.rows.length} articles)` };
  },
});

// ─── D86 : genre immuable côté joueur, correction GM uniquement (A8) ───

define('SYS_SET_GENDER', {
  description: 'Corrige le genre d\'un avatar (GM uniquement, D86)',
  schema: { player_id: 'uuid', gender: 'string' },
  async d71(db, params) {
    if (!['male', 'female', 'neutral'].includes(params.gender)) return `Genre ${params.gender} invalide (male/female/neutral)`;
    const pr = await db.query('SELECT 1 FROM t_avatars WHERE avatar_uuid = $1', [params.player_id]);
    if (!pr.rows.length) return `Joueur ${params.player_id} introuvable`;
    return null;
  },
  async prereqs(db, params) {
    // Changer le genre d'un conjoint violerait M1 (homme + femme) a posteriori.
    const m = await db.query(
      "SELECT 1 FROM t_marriages WHERE status = 'active' AND (spouse_male_uuid = $1 OR spouse_female_uuid = $1)",
      [params.player_id]
    );
    if (m.rows.length) return 'Avatar marié : divorce requis avant correction du genre';
    return null;
  },
  async authorize(source) { return source === 'gm'; },
  async execute(db, params) {
    await db.query('UPDATE t_avatars SET gender = $1 WHERE avatar_uuid = $2', [params.gender, params.player_id]);
    logger.info('SYS_SET_GENDER ok', { player: params.player_id, gender: params.gender });
    return { ok: true, message: `Genre de ${params.player_id} corrigé : ${params.gender}` };
  },
});

// ─── D85 : mariage (GM court-circuite le flux, jamais M1/M2) ───

const avatarExists = async (db, uuid) =>
  (await db.query('SELECT 1 FROM t_avatars WHERE avatar_uuid = $1', [uuid])).rows.length > 0;
const activeMarriageExists = async (db, uuid) =>
  (await db.query("SELECT 1 FROM t_marriages WHERE marriage_uuid = $1 AND status = 'active'", [uuid])).rows.length > 0;

define('SYS_MARRY', {
  description: 'Unit deux avatars (GM, sans anneau/niveau/lieu/foyer ; M1-M2 conservés)',
  schema: { player_a: 'uuid', player_b: 'uuid' },
  async d71(db, params) {
    if (!(await avatarExists(db, params.player_a))) return `Joueur ${params.player_a} introuvable`;
    if (!(await avatarExists(db, params.player_b))) return `Joueur ${params.player_b} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return source === 'gm'; },
  async execute(db, params) {
    const r = await forceMarriage(db, params.player_a, params.player_b);
    return r.success ? { ok: true, message: `Mariage ${r.marriageUuid} créé` } : { ok: false, message: `Refusé : ${r.error}` };
  },
});

define('SYS_DIVORCE_SETTLE', {
  description: 'Prononce un divorce et règle la séparation par provenance (M5)',
  schema: { marriage_id: 'uuid' },
  async d71(db, params) {
    if (!(await activeMarriageExists(db, params.marriage_id))) return `Mariage actif ${params.marriage_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    const r = await settleDivorce(db, params.marriage_id);
    if (r.success) {
      for (const spouse of [r.male, r.female]) {
        await queueDirect(db, spouse, '💔 Ton divorce a été prononcé par un maître du jeu ; tes apports t\'ont été rendus.', 'DIVORCE');
      }
    }
    return r.success ? { ok: true, message: `Divorce ${params.marriage_id} réglé` } : { ok: false, message: `Refusé : ${r.error}` };
  },
});

define('SYS_CANCEL_PROPOSAL', {
  description: 'Retire les demandes en mariage émises par un avatar',
  schema: { player_id: 'uuid' },
  async d71(db, params) {
    if (!(await avatarExists(db, params.player_id))) return `Joueur ${params.player_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    const r = await db.query('DELETE FROM t_marriage_proposals WHERE proposer_uuid = $1', [params.player_id]);
    return { ok: true, message: `${r.rowCount} demande(s) retirée(s)` };
  },
});

define('SYS_GENERATE_WEDDING_GIFT', {
  description: 'Tire le cadeau de noces d\'un mariage qui n\'en a pas (M6)',
  schema: { marriage_id: 'uuid' },
  async d71(db, params) {
    if (!(await activeMarriageExists(db, params.marriage_id))) return `Mariage actif ${params.marriage_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    const r = await generateGiftIfMissing(db, params.marriage_id);
    return r.success ? { ok: true, message: `Cadeau ${r.itemId} déposé au coffre conjugal` } : { ok: false, message: `Refusé : ${r.error}` };
  },
});

// ─── D88 : durabilité ───

const instanceExists = async (db, uuid) =>
  (await db.query('SELECT 1 FROM t_inventory WHERE instance_uuid = $1', [uuid])).rows.length > 0;

define('SYS_MODIFY_DURABILITY', {
  description: 'Modifie la durabilité d\'une instance (delta signé, borné au plafond ; 0 = Cassé)',
  schema: { instance_id: 'uuid', delta: 'string' },
  async d71(db, params) {
    if (!/^-?\d+$/.test(params.delta)) return `delta ${params.delta} n'est pas un entier`;
    if (!(await instanceExists(db, params.instance_id))) return `Instance ${params.instance_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    const value = await modifyDurability(db, params.instance_id, parseInt(params.delta, 10));
    return value === null ? { ok: false, message: 'Objet sans durabilité' } : { ok: true, message: `Durabilité : ${value}` };
  },
});

define('SYS_BREAK_WEAPON', {
  description: 'Brise une arme (durabilité 0 : Cassé, réparable — plus de destruction, D88)',
  schema: { instance_id: 'uuid' },
  async d71(db, params) {
    if (!(await instanceExists(db, params.instance_id))) return `Instance ${params.instance_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    return (await breakItem(db, params.instance_id))
      ? { ok: true, message: 'Arme brisée (réparable)' }
      : { ok: false, message: 'Objet sans durabilité' };
  },
});

define('SYS_DURABILITY_SET', {
  description: 'Fixe la durabilité des exemplaires d\'un objet d\'un joueur (support, D88)',
  schema: { player_id: 'uuid', item_id: 'string', value: 'integer' },
  async d71(db, params) {
    if (!(await avatarExists(db, params.player_id))) return `Joueur ${params.player_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return source === 'gm'; },
  async execute(db, params) {
    const n = await setDurability(db, params.player_id, params.item_id, parseInt(params.value, 10));
    return n ? { ok: true, message: `${n} exemplaire(s) mis à jour` } : { ok: false, message: 'Aucun exemplaire à durabilité' };
  },
});

// ─── D87 : état global des nœuds de ressource (jamais écrit par une récolte) ───

const NODE_TYPES = ['FLORA', 'ORE', 'FISH'];
const zoneExists = async (db, zoneId) =>
  (await db.query('SELECT 1 FROM t_zones WHERE zone_id = $1', [zoneId])).rows.length > 0;

define('SYS_DEPLETE_RESOURCE', {
  description: 'Épuise pour tous les nœuds d\'un type dans une zone (60 min)',
  schema: { zone_id: 'string', resource_type: 'string' },
  async d71(db, params) {
    if (!(await zoneExists(db, params.zone_id))) return `Zone ${params.zone_id} introuvable`;
    if (!NODE_TYPES.includes(params.resource_type.toUpperCase())) return `Type ${params.resource_type} invalide (FLORA/ORE/FISH)`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    const n = await setNodeEvent(db, { zoneId: params.zone_id, nodeType: params.resource_type.toUpperCase() }, 'deplete');
    // D91 §3 : un événement du monde se vit dans le groupe du territoire.
    await queueZone(db, params.zone_id, `🍂 Les ressources de la zone s'épuisent : plus rien à tirer d'ici pour un moment.`, 'RESOURCE_DEPLETED');
    return { ok: true, message: `${n} nœud(s) épuisé(s)` };
  },
});

define('SYS_BONUS_HARVEST', {
  description: 'Multiplie les rendements d\'une zone pour tous (60 min)',
  schema: { zone_id: 'string', multiplier: 'string' },
  async d71(db, params) {
    if (!(await zoneExists(db, params.zone_id))) return `Zone ${params.zone_id} introuvable`;
    const m = Number(params.multiplier);
    if (!(m >= 1 && m <= 10)) return `Multiplicateur ${params.multiplier} invalide (1 à 10)`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    let n = 0;
    for (const nodeType of NODE_TYPES) {
      n += await setNodeEvent(db, { zoneId: params.zone_id, nodeType }, 'bonus', undefined, Number(params.multiplier));
    }
    await queueZone(db, params.zone_id, `✨ Récolte abondante dans la zone : rendements ×${params.multiplier} pendant une heure !`, 'RESOURCE_BONUS');
    return { ok: true, message: `${n} nœud(s) à ×${params.multiplier}` };
  },
});

define('SYS_STOCK_FISHING_SPOT', {
  description: 'Réapprovisionne les coins de pêche d\'un poisson dans une zone (lève l\'épuisement)',
  schema: { zone_id: 'string', fish_id: 'string', rarity: 'string' },
  async d71(db, params) {
    if (!(await zoneExists(db, params.zone_id))) return `Zone ${params.zone_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    const n = await restockFishingSpot(db, params.zone_id, params.fish_id);
    return n ? { ok: true, message: `${n} coin(s) de pêche réapprovisionné(s)` } : { ok: false, message: 'Aucun coin de pêche pour ce poisson ici' };
  },
});

define('SYS_NODE_EVENT', {
  description: 'Épuise ou abonde un nœud précis (GM)',
  schema: { node_id: 'string', event: 'string', duration_min: 'integer' },
  async d71(db, params) {
    if (!['deplete', 'bonus'].includes(params.event)) return `Événement ${params.event} invalide (deplete/bonus)`;
    const r = await db.query('SELECT 1 FROM t_resource_nodes WHERE node_id = $1', [params.node_id]);
    if (!r.rows.length) return `Nœud ${params.node_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return source === 'gm'; },
  async execute(db, params) {
    await setNodeEvent(db, { nodeId: params.node_id }, params.event, parseInt(params.duration_min, 10));
    return { ok: true, message: `${params.node_id} : ${params.event} pour ${params.duration_min} min` };
  },
});

define('SYS_NODE_RESET', {
  description: 'Remet à zéro la repousse d\'un nœud pour un joueur (support)',
  schema: { player_id: 'uuid', node_id: 'string' },
  async d71(db, params) {
    if (!(await avatarExists(db, params.player_id))) return `Joueur ${params.player_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return source === 'gm'; },
  async execute(db, params) {
    const n = await resetHarvest(db, params.player_id, params.node_id);
    return { ok: true, message: n ? 'Repousse remise à zéro' : 'Aucune repousse en cours' };
  },
});

// ─── D90 : effets actifs persistants ───

const effectOfType = async (db, effectId, type) =>
  (await db.query('SELECT 1 FROM t_status_effects_dict WHERE effect_id = $1 AND ($2::text IS NULL OR type = $2)', [effectId, type])).rows.length > 0;

function effectCommand(description, schemaKey, type, fixedDuration) {
  return {
    description,
    schema: fixedDuration ? { player_id: 'uuid', [schemaKey]: 'string' } : { player_id: 'uuid', [schemaKey]: 'string', duration_sec: 'integer' },
    async d71(db, params) {
      if (!(await avatarExists(db, params.player_id))) return `Joueur ${params.player_id} introuvable`;
      if (!(await effectOfType(db, params[schemaKey], type))) return `Effet ${params[schemaKey]} introuvable${type ? ` (type ${type})` : ''}`;
      return null;
    },
    async prereqs() { return null; },
    async authorize(source) { return ['gm', 'system'].includes(source); },
    async execute(db, params) {
      const r = await applyEffect(db, params.player_id, params[schemaKey], {
        durationSec: fixedDuration ? null : parseInt(params.duration_sec, 10), sourceKind: 'system',
      });
      return r.success ? { ok: true, message: `${params[schemaKey]} posé pour ${r.durationSec} s` } : { ok: false, message: r.error };
    },
  };
}

define('SYS_EFFECT_APPLY', effectCommand('Pose un effet actif persistant (GM)', 'effect_id', null, false));
define('SYS_BLESS_PLAYER', effectCommand('Accorde une bénédiction (buff persistant)', 'buff_type', 'buff', true));
define('SYS_DEBUFF_PLAYER', effectCommand('Applique une altération persistante (jamais mortelle hors combat)', 'status_effect', 'debuff', true));

define('SYS_CLEAR_EFFECTS', {
  description: 'Dissipe les effets actifs dissipables d\'un joueur',
  schema: { player_id: 'uuid' },
  async d71(db, params) {
    if (!(await avatarExists(db, params.player_id))) return `Joueur ${params.player_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    const n = await clearEffects(db, params.player_id);
    return { ok: true, message: `${n} effet(s) dissipé(s)` };
  },
});

// ─── D94 : XP de cuisine ───

define('SYS_GRANT_COOKING_XP', {
  description: 'Accorde de l\'XP de cuisine (récompense de quête culinaire, support)',
  schema: { player_id: 'uuid', xp: 'integer' },
  async d71(db, params) {
    if (!(await avatarExists(db, params.player_id))) return `Joueur ${params.player_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system', 'quest_reward'].includes(source); },
  async execute(db, params) {
    const r = await db.query('UPDATE t_avatars SET cooking_xp = cooking_xp + $1 WHERE avatar_uuid = $2 RETURNING cooking_xp',
      [parseInt(params.xp, 10), params.player_id]);
    return { ok: true, message: `XP de cuisine : ${r.rows[0].cooking_xp}` };
  },
});

// ─── D91 : notifications sortantes (file T_NOTIFICATIONS, services/notifications.js) ───

define('SYS_NOTIFY_PLAYER', {
  description: 'Envoie un message privé à un joueur (file bridée D91)',
  schema: { player_id: 'uuid', text: 'string' },
  async d71(db, params) {
    const pr = await db.query('SELECT 1 FROM t_avatars WHERE avatar_uuid = $1', [params.player_id]);
    if (!pr.rows.length) return `Joueur ${params.player_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    await queueDirect(db, params.player_id, params.text, 'SYS_NOTIFY');
    return { ok: true, message: `Message mis en file pour ${params.player_id}` };
  },
});

define('SYS_ANNOUNCE', {
  description: 'Annonce dans le groupe de territoire d\'une zone (D91 N2)',
  schema: { zone_id: 'string', text: 'string' },
  async d71(db, params) {
    const zr = await db.query('SELECT 1 FROM t_zones WHERE zone_id = $1', [params.zone_id]);
    if (!zr.rows.length) return `Zone ${params.zone_id} introuvable`;
    return null;
  },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    const result = await queueZone(db, params.zone_id, params.text, 'ANNOUNCE_ZONE');
    if (!result.success) return { ok: false, message: `Aucun groupe de territoire pour ${params.zone_id}` };
    return { ok: true, message: `Annonce mise en file pour ${result.groupId}` };
  },
});

const globalAnnounce = {
  description: 'Annonce mondiale : une ligne par groupe communautaire (D91 N2)',
  schema: { text: 'string' },
  async d71() { return null; },
  async prereqs() { return null; },
  async authorize(source) { return ['gm', 'system'].includes(source); },
  async execute(db, params) {
    const result = await queueGlobal(db, params.text, 'ANNOUNCE_GLOBAL');
    return { ok: true, message: `Annonce mise en file pour ${result.groups} groupe(s) communautaire(s)` };
  },
};
define('SYS_ANNOUNCE_GLOBAL', globalAnnounce);
define('SYS_BROADCAST_WORLD_MESSAGE', globalAnnounce);

define('SYS_NOTIF_QUEUE', {
  description: 'État de la file de notifications (lecture seule)',
  schema: {},
  async d71() { return null; },
  async prereqs() { return null; },
  async authorize(source) { return source === 'gm'; },
  async execute(db) {
    const q = await getQueueSummary(db);
    return { ok: true, message: `File : ${q.pending} en attente · ${q.sent} envoyée(s) · ${q.failed} abandonnée(s)` };
  },
});

export function getCommand(name) {
  return COMMANDS[name] || null;
}

export function listCommands() {
  return Object.keys(COMMANDS);
}

export default { getCommand, listCommands };
