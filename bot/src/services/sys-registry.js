import logger from '../utils/logger.js';
import { queueDirect, queueZone, queueGlobal, getQueueSummary } from './notifications.js';
import { forceMarriage, settleDivorce, generateGiftIfMissing } from '../engine/marriage.js';

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
    const existing = await db.query(
      'SELECT instance_uuid, quantity FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2 LIMIT 1',
      [params.player_id, params.item_id]
    );
    if (existing.rows.length) {
      await db.query(
        'UPDATE t_inventory SET quantity = quantity + $1 WHERE instance_uuid = $2',
        [qty, existing.rows[0].instance_uuid]
      );
    } else {
      await db.query(
        'INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, $2, $3)',
        [params.player_id, params.item_id, qty]
      );
    }
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
    const kr = await db.query('SELECT 1 FROM t_npc_knowledge WHERE qi_id = $1 AND k_level IN ($2,$3,$4)',
      [params.qi_id, 'K0', 'K1', 'K2']);
    if (!kr.rows.length) return `Fiche ${params.qi_id} introuvable ou niveau > K2`;
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
