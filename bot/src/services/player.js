import logger from '../utils/logger.js';

export async function getPlayer(db, playerUuid) {
  const result = await db.query(`
    SELECT a.avatar_uuid, a.avatar_name, a.race_id, a.level, a.hp_current, a.hp_max,
           a.mp_current, a.mp_max, a.yrd_balance, a.current_zone_id, a.is_alive,
           r.name as race_name, z.zone_name as zone_name
    FROM t_avatars a
    JOIN t_races r ON a.race_id = r.race_id
    JOIN t_zones z ON a.current_zone_id = z.zone_id
    WHERE a.avatar_uuid = $1
  `, [playerUuid]);

  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function getPlayerInventory(db, playerUuid) {
  const result = await db.query(`
    SELECT i.item_id, d.name, d.item_type, i.quantity, d.buy_price, d.rarity, d.tier,
           d.is_consumable, d.description, i.is_equipped
    FROM t_inventory i
    JOIN t_items_dict d ON i.item_id = d.item_id
    WHERE i.avatar_uuid = $1
    ORDER BY d.item_type, d.name
  `, [playerUuid]);
  return result.rows;
}

export async function createPlayer(db, whatsappPhone, avatarName, raceId, startingZone, gender) {
  const result = await db.query(`
    INSERT INTO t_avatars (avatar_uuid, whatsapp_phone, avatar_name, race_id, gender,
                          hp_current, hp_max, mp_current, mp_max, yrd_balance,
                          current_zone_id, is_alive, level)
    VALUES (gen_random_uuid(), $1, $2, $3, $5,
            100, 100, 50, 50, 500,
            $4, TRUE, 1)
    RETURNING avatar_uuid, avatar_name, level, yrd_balance, current_zone_id
  `, [whatsappPhone, avatarName, raceId, startingZone, gender]);
  return result.rows[0];
}

export async function getPlayerQuests(db, playerUuid) {
  const result = await db.query(`
    SELECT aq.quest_id, qd.title, qd.quest_type, aq.current_step, aq.progress_status,
           qd.total_steps, qd.reward_xp, qd.reward_yrds, qd.description
    FROM t_active_quests aq
    JOIN t_quests_dict qd ON aq.quest_id = qd.quest_id
    WHERE aq.avatar_uuid = $1 AND aq.progress_status = 'in_progress'
    ORDER BY aq.accepted_at DESC
  `, [playerUuid]);
  return result.rows;
}

export default { getPlayer, getPlayerInventory, createPlayer, getPlayerQuests };
