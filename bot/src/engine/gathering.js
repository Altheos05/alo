// Récolte, minage, pêche (D87, table_t_resource_nodes.md R1-R8) et lieu de
// cuisine (gathering_cooking_system.md §4). Repousse propre à chaque joueur
// (T_AVATAR_HARVESTS) ; l'état global des nœuds n'est écrit que par l'IA/GM.
import { inTransaction, addToInventory } from './bank.js';

export const TOOL_WEAR_PER_ATTEMPT = 1;
const EVENT_DURATION_MIN = 60;

// Pêche : l'indice narratif désigne la bonne réaction (options fixes 1-3).
export const FISHING_OPTIONS = ['Tirer fort', 'Laisser filer', 'Ferrer doucement'];
const FISHING_SITUATIONS = [
  { text: 'Un poids lourd, immobile au fond : la ligne ne bouge plus mais pèse.', correct: 1 },
  { text: 'La ligne se tend d\'un coup, le moulinet hurle et file vers le large.', correct: 2 },
  { text: 'Petites touches répétées, le bouchon danse sans plonger.', correct: 3 },
];

// La DEX module la réussite d'une bonne réaction (R8) : 70 % + 1 %/pt, plafonné à 95 %.
export function fishingSuccessChance(dex) {
  return Math.min(0.95, 0.7 + (dex || 0) * 0.01);
}

export function pickSituation(random = Math.random) {
  return FISHING_SITUATIONS[Math.floor(random() * FISHING_SITUATIONS.length)];
}

export async function listZoneNodes(db, zoneId, nodeType) {
  const r = await db.query(
    `SELECT n.node_id, n.name, n.node_tier, n.level_required, d.name AS item_name
     FROM t_resource_nodes n JOIN t_items_dict d ON d.item_id = n.yield_item_id
     WHERE n.zone_id = $1 AND n.node_type = $2 ORDER BY n.node_id`,
    [zoneId, nodeType]
  );
  return r.rows;
}

// R3 : meilleur outil possédé, de tier suffisant et non cassé (verrouillé).
async function findTool(client, avatarUuid, prefix, minTier) {
  const r = await client.query(
    `SELECT i.instance_uuid, d.name, d.tier
     FROM t_inventory i JOIN t_items_dict d ON d.item_id = i.item_id
     WHERE i.avatar_uuid = $1 AND i.item_id LIKE $2 AND d.tier >= $3
       AND COALESCE(i.current_durability, i.durability_cap, d.durability_max) > 0
     ORDER BY d.tier DESC LIMIT 1 FOR UPDATE OF i`,
    [avatarUuid, `${prefix}\\_%`, minTier]
  );
  return r.rows[0] || null;
}

async function wearTool(client, instanceUuid) {
  const r = await client.query(
    `UPDATE t_inventory i
     SET current_durability = GREATEST(0, COALESCE(i.current_durability, i.durability_cap, d.durability_max) - $2)
     FROM t_items_dict d WHERE d.item_id = i.item_id AND i.instance_uuid = $1
     RETURNING i.current_durability`,
    [instanceUuid, TOOL_WEAR_PER_ATTEMPT]
  );
  return r.rows[0].current_durability === 0;
}

// R1, R2, R4, R5 puis R3 : renvoie { node, tool } ou { error }.
async function checkAccess(client, avatarUuid, nodeId, expectedType) {
  const avatar = await client.query(
    'SELECT current_zone_id, level, stat_dex FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE',
    [avatarUuid]
  );
  const node = await client.query(
    `SELECT *, (depleted_until > NOW()) AS depleted, (multiplier_until > NOW()) AS boosted
     FROM t_resource_nodes WHERE node_id = $1`,
    [nodeId]
  );
  const n = node.rows[0];
  if (!n || n.node_type !== expectedType) return { error: 'NODE_NOT_FOUND' };
  const a = avatar.rows[0];
  if (a.current_zone_id !== n.zone_id) return { error: 'NOT_IN_ZONE' };
  if (a.level < n.level_required) return { error: 'LEVEL', required: n.level_required };
  if (n.depleted) return { error: 'DEPLETED' };

  const cooldown = await client.query(
    `SELECT next_available_at FROM t_avatar_harvests
     WHERE avatar_uuid = $1 AND node_id = $2 AND next_available_at > NOW() FOR UPDATE`,
    [avatarUuid, nodeId]
  );
  if (cooldown.rows.length) return { error: 'RESPAWN', nextAt: cooldown.rows[0].next_available_at };

  let tool = null;
  if (n.required_tool_prefix) {
    tool = await findTool(client, avatarUuid, n.required_tool_prefix, n.node_tier);
    if (!tool) return { error: 'NO_TOOL', prefix: n.required_tool_prefix, tier: n.node_tier };
  }
  return { node: n, tool, dex: a.stat_dex };
}

// R4 + R6 : rendement crédité et repousse consommée, dans la transaction.
async function collect(client, avatarUuid, node, random) {
  const base = node.yield_min + Math.floor(random() * (node.yield_max - node.yield_min + 1));
  const qty = Math.max(1, Math.floor(base * (node.boosted ? Number(node.yield_multiplier) : 1)));
  await addToInventory(client, avatarUuid, { item_id: node.yield_item_id, qty }, node.node_id);
  await client.query(
    `INSERT INTO t_avatar_harvests (avatar_uuid, node_id, next_available_at, harvest_count)
     VALUES ($1, $2, NOW() + make_interval(secs => $3), 1)
     ON CONFLICT (avatar_uuid, node_id) DO UPDATE
       SET next_available_at = EXCLUDED.next_available_at, harvest_count = t_avatar_harvests.harvest_count + 1`,
    [avatarUuid, node.node_id, node.respawn_sec]
  );
  const item = await client.query('SELECT name FROM t_items_dict WHERE item_id = $1', [node.yield_item_id]);
  return { qty, itemId: node.yield_item_id, itemName: item.rows[0].name };
}

// Récolte (FLORA, à la main) et minage (ORE, pioche) : résolution immédiate (R8).
export async function harvestNode(db, avatarUuid, nodeId, nodeType, random = Math.random) {
  return inTransaction(db, 'Erreur lors d\'une récolte', { avatarUuid, nodeId }, async (client) => {
    const access = await checkAccess(client, avatarUuid, nodeId, nodeType);
    if (access.error) return { success: false, ...access };
    const toolBroke = access.tool ? await wearTool(client, access.tool.instance_uuid) : false;
    const loot = await collect(client, avatarUuid, access.node, random);
    return { success: true, ...loot, toolBroke, toolName: access.tool?.name };
  });
}

// Pêche, étape 1 : vérifie l'accès et tire l'indice ; rien n'est écrit.
export async function castLine(db, avatarUuid, nodeId, random = Math.random) {
  return inTransaction(db, 'Erreur lors d\'un lancer de ligne', { avatarUuid, nodeId }, async (client) => {
    const access = await checkAccess(client, avatarUuid, nodeId, 'FISH');
    if (access.error) return { success: false, ...access };
    const situation = pickSituation(random);
    return { success: true, node: access.node, situation };
  });
}

// Pêche, étape 2 : tout est revérifié ; l'usure s'applique à chaque tentative,
// la repousse n'est consommée que sur une prise (R8).
export async function reelLine(db, avatarUuid, nodeId, chosen, correct, random = Math.random) {
  return inTransaction(db, 'Erreur lors d\'une prise', { avatarUuid, nodeId }, async (client) => {
    const access = await checkAccess(client, avatarUuid, nodeId, 'FISH');
    if (access.error) return { success: false, ...access };
    const toolBroke = await wearTool(client, access.tool.instance_uuid);
    const caught = chosen === correct && random() < fishingSuccessChance(access.dex);
    if (!caught) return { success: true, caught: false, rightMove: chosen === correct, toolBroke, toolName: access.tool.name };
    const loot = await collect(client, avatarUuid, access.node, random);
    return { success: true, caught: true, ...loot, toolBroke, toolName: access.tool.name };
  });
}

export async function inspectNode(db, avatarUuid, nodeId) {
  const r = await db.query(
    `SELECT n.*, d.name AS item_name, z.zone_name,
            (n.depleted_until > NOW()) AS depleted, (n.multiplier_until > NOW()) AS boosted,
            h.next_available_at
     FROM t_resource_nodes n
     JOIN t_items_dict d ON d.item_id = n.yield_item_id
     JOIN t_zones z ON z.zone_id = n.zone_id
     LEFT JOIN t_avatar_harvests h ON h.node_id = n.node_id AND h.avatar_uuid = $2 AND h.next_available_at > NOW()
     WHERE n.node_id = $1`,
    [nodeId, avatarUuid]
  );
  return r.rows[0] || null;
}

// ─── État global (IA / GM uniquement, R5) ───

export async function setNodeEvent(db, where, event, durationMin = EVENT_DURATION_MIN, multiplier = 2) {
  const cond = where.nodeId ? 'node_id = $1' : 'zone_id = $1 AND node_type = $2';
  const params = where.nodeId ? [where.nodeId] : [where.zoneId, where.nodeType];
  const n = params.length;
  const set = event === 'deplete'
    ? `depleted_until = NOW() + make_interval(mins => $${n + 1})`
    : `yield_multiplier = $${n + 2}, multiplier_until = NOW() + make_interval(mins => $${n + 1})`;
  const values = event === 'deplete' ? [...params, durationMin] : [...params, durationMin, multiplier];
  const r = await db.query(`UPDATE t_resource_nodes SET ${set} WHERE ${cond}`, values);
  return r.rowCount;
}

export async function restockFishingSpot(db, zoneId, fishItemId) {
  const r = await db.query(
    "UPDATE t_resource_nodes SET depleted_until = NULL WHERE zone_id = $1 AND node_type = 'FISH' AND yield_item_id = $2",
    [zoneId, fishItemId]
  );
  return r.rowCount;
}

export async function resetHarvest(db, avatarUuid, nodeId) {
  const r = await db.query('DELETE FROM t_avatar_harvests WHERE avatar_uuid = $1 AND node_id = $2', [avatarUuid, nodeId]);
  return r.rowCount;
}

// ─── Cuisine (§4, clause v1.0 conservée) ───
// Cuisine de logement : être dans la zone d'un logement actif à soi ou du foyer
// conjugal. Feu de camp : possible en extérieur sauvage (zones HUNT / FLD).
const CAMPFIRE_ZONE_TYPES = ['HUNT', 'FLD'];

export async function cookingPlace(db, avatarUuid) {
  const r = await db.query(
    `SELECT z.zone_type,
       EXISTS (
         SELECT 1 FROM t_properties p
         WHERE p.zone_id = a.current_zone_id AND (p.tenure = 'own' OR p.paid_until > NOW())
           AND (p.owner_avatar_uuid = a.avatar_uuid OR p.property_uuid IN (
             SELECT home_property_uuid FROM t_marriages
             WHERE status = 'active' AND (spouse_male_uuid = a.avatar_uuid OR spouse_female_uuid = a.avatar_uuid)))
       ) AS at_home
     FROM t_avatars a JOIN t_zones z ON z.zone_id = a.current_zone_id
     WHERE a.avatar_uuid = $1`,
    [avatarUuid]
  );
  const row = r.rows[0];
  if (!row) return null;
  if (row.at_home) return 'home';
  if (CAMPFIRE_ZONE_TYPES.includes(row.zone_type)) return 'campfire';
  return null;
}

export default {
  listZoneNodes, harvestNode, castLine, reelLine, inspectNode, setNodeEvent, restockFishingSpot,
  resetHarvest, cookingPlace, fishingSuccessChance, pickSituation, FISHING_OPTIONS,
};
