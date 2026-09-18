export async function getUnlockedAchievements(db, avatarUuid) {
  const result = await db.query(
    `SELECT d.achievement_id, d.name, d.description, d.rarity, u.unlocked_at
     FROM t_unlocked_achievements u
     JOIN t_achievements_dict d ON d.achievement_id = u.achievement_id
     WHERE u.avatar_uuid = $1
     ORDER BY u.unlocked_at DESC`,
    [avatarUuid]
  );
  return result.rows;
}

const RANKING_COLUMNS = {
  yrds: { column: 'yrd_balance', label: 'Yrds' },
  level: { column: 'level', label: 'Niveau' },
};

export async function getRankings(db, sortBy = 'yrds') {
  const config = RANKING_COLUMNS[sortBy] || RANKING_COLUMNS.yrds;
  const result = await db.query(
    `SELECT avatar_name, ${config.column} AS value
     FROM t_avatars
     ORDER BY ${config.column} DESC NULLS LAST
     LIMIT 10`
  );
  return { label: config.label, rows: result.rows };
}

export default { getUnlockedAchievements, getRankings };
