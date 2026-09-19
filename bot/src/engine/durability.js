// Durabilité & réparation (D88, durability_repair_system.md, T_INVENTORY I8).
// Une instance à durabilité_max > 0 dont current_durability est NULL est neuve
// (plafond courant) : les lignes créées par achat/loot n'ont pas à la renseigner.
import config from '../config.js';
import { inTransaction } from './bank.js';

// Slots qui s'usent au combat : armure (5) + mains. Ceinture et dos : non (§1).
const WEARING_SLOTS = ['head', 'torso', 'arms', 'waist', 'legs', 'hand_main', 'hand_off'];
// Le PvP (−3) n'existe pas encore : seule l'usure PvE est appliquée.
export const COMBAT_WEAR_PVE = 1;
// Barème étape 37 : Yrds par point restauré, selon le tier.
const REPAIR_COST_PER_POINT = { 1: 2, 2: 5, 3: 12, 4: 30, 5: 75 };

// Grille D88 : état selon courante ÷ max d'origine, coefficient de rachat PNJ.
const STATES = [
  { min: 100, label: 'Neuf', coef: 0.25 },
  { min: 75, label: 'Quasi neuf', coef: 0.22 },
  { min: 50, label: 'Bon état', coef: 0.18 },
  { min: 26, label: 'État correct', coef: 0.12 },
  { min: 1, label: 'Usé', coef: 0.05 },
];
const BROKEN = { label: 'Cassé', coef: 0.05 };

export function durabilityState(current, originalMax) {
  if (!(originalMax > 0)) return null;
  if (current <= 0) return BROKEN;
  const pct = (current / originalMax) * 100;
  return STATES.find(s => pct >= s.min) || STATES[STATES.length - 1];
}

// Durabilité courante effective d'une instance (NULL = neuve au plafond courant).
export function currentDurability(row, originalMax) {
  const cap = row.durability_cap ?? originalMax;
  return row.current_durability ?? cap;
}

// Plafond après une réparation : −10 % de l'origine (paramètre), sauf T5 lié (§5).
export function capAfterRepair(cap, originalMax, tier, isBound) {
  if (tier === 5 && isBound) return cap;
  const loss = Math.round(originalMax * config.durability.repairCapLossPct / 100);
  return Math.max(0, cap - loss);
}

export function repairCost(tier, points) {
  return (REPAIR_COST_PER_POINT[tier] || REPAIR_COST_PER_POINT[1]) * points;
}

// Usure de fin de combat (§1) ; renvoie les noms des pièces qui viennent de casser.
export async function wearEquipment(db, avatarUuid, points) {
  const result = await db.query(
    `UPDATE t_inventory i
     SET current_durability = GREATEST(0, COALESCE(i.current_durability, i.durability_cap, d.durability_max) - $2)
     FROM t_items_dict d
     WHERE d.item_id = i.item_id AND i.avatar_uuid = $1 AND i.is_equipped
       AND i.slot_equipped = ANY($3) AND d.durability_max > 0
       AND COALESCE(i.current_durability, i.durability_cap, d.durability_max) > 0
     RETURNING d.name, i.current_durability`,
    [avatarUuid, points, WEARING_SLOTS]
  );
  return result.rows.filter(r => r.current_durability === 0).map(r => r.name);
}

// Statistiques d'équipement ; une pièce cassée n'apporte plus rien (§3).
export async function getGearStats(db, avatarUuid) {
  const result = await db.query(
    `SELECT COALESCE(SUM(d.base_atk), 0)::int AS atk, COALESCE(SUM(d.base_def), 0)::int AS def
     FROM t_inventory i JOIN t_items_dict d ON d.item_id = i.item_id
     WHERE i.avatar_uuid = $1 AND i.is_equipped AND i.slot_equipped = ANY($2)
       AND (d.durability_max = 0 OR COALESCE(i.current_durability, i.durability_cap, d.durability_max) > 0)`,
    [avatarUuid, WEARING_SLOTS]
  );
  return result.rows[0];
}

// Un forgeron de service = un PNJ vivant de la zone dont une fiche de
// connaissance porte le sujet « réparation » (les données désignent déjà qui répare).
export async function zoneHasRepairer(db, zoneId) {
  const result = await db.query(
    `SELECT 1 FROM t_npc n JOIN t_npc_knowledge k ON k.npc_id = n.npc_id
     WHERE n.zone_id = $1 AND n.is_alive
       AND EXISTS (SELECT 1 FROM unnest(k.topic_tags) t WHERE t ~* '^r[ée]par')
     LIMIT 1`,
    [zoneId]
  );
  return result.rows.length > 0;
}

// !repair : l'instance la plus usée de l'objet ; tout se joue sous verrou.
export async function repairItem(db, avatarUuid, itemId) {
  return inTransaction(db, 'Erreur lors d\'une réparation', { avatarUuid, itemId }, async (client) => {
    const avatar = await client.query(
      'SELECT current_zone_id, yrd_balance FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE',
      [avatarUuid]
    );
    if (!(await zoneHasRepairer(client, avatar.rows[0].current_zone_id))) return { success: false, error: 'NO_REPAIRER' };

    const inst = await client.query(
      `SELECT i.instance_uuid, i.current_durability, i.durability_cap, i.is_bound, d.durability_max, d.tier, d.name
       FROM t_inventory i JOIN t_items_dict d ON d.item_id = i.item_id
       WHERE i.avatar_uuid = $1 AND i.item_id = $2
       ORDER BY COALESCE(i.current_durability, i.durability_cap, d.durability_max) ASC
       LIMIT 1 FOR UPDATE OF i`,
      [avatarUuid, itemId]
    );
    const row = inst.rows[0];
    if (!row) return { success: false, error: 'NOT_OWNED' };
    if (!(row.durability_max > 0)) return { success: false, error: 'NO_DURABILITY' };

    const cap = row.durability_cap ?? row.durability_max;
    if (cap <= 0) return { success: false, error: 'IRREPARABLE' };
    const current = currentDurability(row, row.durability_max);
    // La réparation remet au plafond puis l'ampute : l'instance repart au
    // nouveau plafond, jamais au-dessus (I8 : courante ∈ [0, plafond]).
    const newCap = capAfterRepair(cap, row.durability_max, row.tier, row.is_bound);
    if (newCap <= 0) return { success: false, error: 'IRREPARABLE' };
    const points = newCap - current;
    if (points <= 0) return { success: false, error: 'ALREADY_FULL' };

    const cost = repairCost(row.tier, points);
    if (Number(avatar.rows[0].yrd_balance) < cost) {
      return { success: false, error: 'INSUFFICIENT_FUNDS', required: cost, available: Number(avatar.rows[0].yrd_balance) };
    }
    // Payé au PNJ : les Yrds sortent de la circulation (puits « Réparations »).
    await client.query(
      'UPDATE t_avatars SET yrd_balance = yrd_balance - $1, total_yrd_spent = total_yrd_spent + $1 WHERE avatar_uuid = $2',
      [cost, avatarUuid]
    );
    await client.query(
      `UPDATE t_inventory SET current_durability = $1, durability_cap = $2, repair_count = repair_count + 1
       WHERE instance_uuid = $3`,
      [newCap, newCap, row.instance_uuid]
    );
    return { success: true, name: row.name, cost, restored: points, newCap, previousCap: cap, originalMax: row.durability_max };
  });
}

// SYS_MODIFY_DURABILITY : delta borné à [0, plafond courant].
export async function modifyDurability(db, instanceUuid, delta) {
  const result = await db.query(
    `UPDATE t_inventory i
     SET current_durability = LEAST(COALESCE(i.durability_cap, d.durability_max),
                                    GREATEST(0, COALESCE(i.current_durability, i.durability_cap, d.durability_max) + $2))
     FROM t_items_dict d
     WHERE d.item_id = i.item_id AND i.instance_uuid = $1 AND d.durability_max > 0
     RETURNING i.current_durability`,
    [instanceUuid, delta]
  );
  return result.rows[0]?.current_durability ?? null;
}

// SYS_BREAK_WEAPON (D88) : Cassé (0), réparable — plus de destruction.
export async function breakItem(db, instanceUuid) {
  const r = await db.query(
    `UPDATE t_inventory i SET current_durability = 0
     FROM t_items_dict d WHERE d.item_id = i.item_id AND i.instance_uuid = $1 AND d.durability_max > 0`,
    [instanceUuid]
  );
  return r.rowCount === 1;
}

export async function setDurability(db, avatarUuid, itemId, value) {
  const result = await db.query(
    `UPDATE t_inventory i
     SET current_durability = LEAST(COALESCE(i.durability_cap, d.durability_max), GREATEST(0, $3))
     FROM t_items_dict d
     WHERE d.item_id = i.item_id AND i.avatar_uuid = $1 AND i.item_id = $2 AND d.durability_max > 0
     RETURNING i.current_durability`,
    [avatarUuid, itemId, value]
  );
  return result.rowCount;
}

export default {
  durabilityState, currentDurability, capAfterRepair, repairCost, wearEquipment, getGearStats,
  zoneHasRepairer, repairItem, modifyDurability, breakItem, setDurability, COMBAT_WEAR_PVE,
};
