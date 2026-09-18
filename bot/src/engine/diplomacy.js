export async function getRaceRelations(db, raceId) {
  const result = await db.query(
    `SELECT
       CASE WHEN d.race_a_id = $1 THEN d.race_b_id ELSE d.race_a_id END AS other_race_id,
       ra.name AS other_race_name,
       d.status, d.trade_tax
     FROM t_diplomacy d
     JOIN t_races ra ON ra.race_id = CASE WHEN d.race_a_id = $1 THEN d.race_b_id ELSE d.race_a_id END
     WHERE d.race_a_id = $1 OR d.race_b_id = $1
     ORDER BY ra.name`,
    [raceId]
  );
  return result.rows;
}

export default { getRaceRelations };
