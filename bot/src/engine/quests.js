import logger from '../utils/logger.js';

export async function getQuestBoard(db, zoneId, playerLevel, avatarUuid) {
  const result = await db.query(
    `SELECT q.quest_id, q.title, q.quest_type, q.min_level, q.recommended_level, q.reward_xp, q.reward_yrds
     FROM t_quests_dict q
     WHERE q.zone_id = $1 AND q.min_level <= $2 AND q.is_hidden = FALSE
       AND NOT EXISTS (
         SELECT 1 FROM t_active_quests a
         WHERE a.quest_id = q.quest_id AND a.avatar_uuid = $3
           AND a.progress_status IN ('in_progress', 'completed')
       )
     ORDER BY q.min_level, q.title`,
    [zoneId, playerLevel, avatarUuid]
  );
  return result.rows;
}

export async function getQuestDetail(db, questId) {
  const result = await db.query(
    `SELECT quest_id, title, quest_type, min_level, total_steps, reward_xp, reward_yrds, description
     FROM t_quests_dict WHERE quest_id = $1 OR title ILIKE $2 LIMIT 1`,
    [questId, `%${questId}%`]
  );
  return result.rows[0] || null;
}

export async function acceptQuest(db, avatarUuid, questIdOrTitle) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const questResult = await client.query(
      'SELECT quest_id, title, min_level, total_steps, is_repeatable FROM t_quests_dict WHERE quest_id = $1 OR title ILIKE $2 LIMIT 1',
      [questIdOrTitle, `%${questIdOrTitle}%`]
    );
    if (questResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'QUEST_NOT_FOUND' };
    }
    const quest = questResult.rows[0];

    const playerResult = await client.query('SELECT level FROM t_avatars WHERE avatar_uuid = $1', [avatarUuid]);
    if (playerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }
    if (playerResult.rows[0].level < quest.min_level) {
      await client.query('ROLLBACK');
      return { success: false, error: 'LEVEL_TOO_LOW', required: quest.min_level };
    }

    const existing = await client.query(
      'SELECT progress_status FROM t_active_quests WHERE avatar_uuid = $1 AND quest_id = $2',
      [avatarUuid, quest.quest_id]
    );
    if (existing.rows.length > 0) {
      const already = existing.rows[0].progress_status;
      if (already === 'in_progress') {
        await client.query('ROLLBACK');
        return { success: false, error: 'ALREADY_ACTIVE' };
      }
      if (already === 'completed' && !quest.is_repeatable) {
        await client.query('ROLLBACK');
        return { success: false, error: 'ALREADY_COMPLETED' };
      }
    }

    // Q1 (table_t_active_quests.md) : plafond de 10 quêtes actives simultanées.
    // S'applique à toute activation atteinte ici (insertion neuve ou
    // réactivation d'une quête abandonnée/échouée/répétable) — les seules
    // sorties déjà passées (ALREADY_ACTIVE/ALREADY_COMPLETED) garantissent
    // que cette quête n'est pas déjà comptée dans l'actuel `in_progress`.
    const activeCount = await client.query(
      "SELECT COUNT(*) FROM t_active_quests WHERE avatar_uuid = $1 AND progress_status = 'in_progress'",
      [avatarUuid]
    );
    if (parseInt(activeCount.rows[0].count, 10) >= 10) {
      await client.query('ROLLBACK');
      return { success: false, error: 'QUEST_CAP_REACHED' };
    }

    await client.query(
      `INSERT INTO t_active_quests (avatar_uuid, quest_id, current_step, progress_status)
       VALUES ($1, $2, 1, 'in_progress')
       ON CONFLICT (avatar_uuid, quest_id) DO UPDATE SET current_step = 1, progress_status = 'in_progress', accepted_at = NOW(), completed_at = NULL`,
      [avatarUuid, quest.quest_id]
    );

    await client.query('COMMIT');
    return { success: true, questId: quest.quest_id, title: quest.title, totalSteps: quest.total_steps };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de l\'acceptation de quête', { error: err.message, avatarUuid, questIdOrTitle });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export async function turnInQuest(db, avatarUuid, questIdOrTitle) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const activeResult = await client.query(
      `SELECT a.quest_id, a.current_step, q.title, q.total_steps, q.reward_xp, q.reward_yrds, q.reward_items
       FROM t_active_quests a
       JOIN t_quests_dict q ON q.quest_id = a.quest_id
       WHERE a.avatar_uuid = $1 AND a.progress_status = 'in_progress' AND (a.quest_id = $2 OR q.title ILIKE $3)
       LIMIT 1 FOR UPDATE OF a`,
      [avatarUuid, questIdOrTitle, `%${questIdOrTitle}%`]
    );
    if (activeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'NOT_ACTIVE' };
    }
    const quest = activeResult.rows[0];
    if (quest.current_step < quest.total_steps) {
      await client.query('ROLLBACK');
      return { success: false, error: 'NOT_READY', current: quest.current_step, total: quest.total_steps };
    }

    await client.query(
      "UPDATE t_active_quests SET progress_status = 'completed', completed_at = NOW() WHERE avatar_uuid = $1 AND quest_id = $2",
      [avatarUuid, quest.quest_id]
    );
    await client.query(
      'UPDATE t_avatars SET yrd_balance = yrd_balance + $1, current_xp = COALESCE(current_xp, 0) + $2 WHERE avatar_uuid = $3',
      [quest.reward_yrds || 0, quest.reward_xp || 0, avatarUuid]
    );

    const items = Array.isArray(quest.reward_items) ? quest.reward_items : [];
    for (const item of items) {
      if (!item.item_id) continue;
      const qty = item.quantity || 1;
      const existing = await client.query(
        'SELECT quantity FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2 FOR UPDATE',
        [avatarUuid, item.item_id]
      );
      if (existing.rows.length > 0) {
        await client.query('UPDATE t_inventory SET quantity = quantity + $1 WHERE avatar_uuid = $2 AND item_id = $3', [qty, avatarUuid, item.item_id]);
      } else {
        await client.query(
          'INSERT INTO t_inventory (instance_uuid, avatar_uuid, item_id, quantity) VALUES (gen_random_uuid(), $1, $2, $3)',
          [avatarUuid, item.item_id, qty]
        );
      }
    }

    // Q2/Q4 (table_t_active_quests.md) : l'historisation est la source de
    // vérité des prérequis de quêtes légendaires (QST_LEG_*) — sans elle
    // ce gating ne peut jamais fonctionner.
    await client.query(
      `INSERT INTO t_quest_history (avatar_uuid, quest_id, progress_status, xp_earned, yrd_earned, items_earned)
       VALUES ($1, $2, 'completed', $3, $4, $5)`,
      [avatarUuid, quest.quest_id, quest.reward_xp || 0, quest.reward_yrds || 0, JSON.stringify(items)]
    );

    await client.query('COMMIT');
    return { success: true, title: quest.title, xp: quest.reward_xp || 0, yrds: quest.reward_yrds || 0, items };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors du rendu de quête', { error: err.message, avatarUuid, questIdOrTitle });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export default { getQuestBoard, getQuestDetail, acceptQuest, turnInQuest };
