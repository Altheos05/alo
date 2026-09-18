export async function getAvatarSkills(db, avatarUuid) {
  const result = await db.query(
    `SELECT s.skill_id, s.name, s.skill_type, s.domain, s.max_mastery,
            a.mastery_rank, a.is_equipped
     FROM t_avatar_skills a
     JOIN t_skills_dict s ON s.skill_id = a.skill_id
     WHERE a.avatar_uuid = $1
     ORDER BY s.skill_type, s.name`,
    [avatarUuid]
  );
  return result.rows;
}

export default { getAvatarSkills };
