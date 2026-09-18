export async function getUnlockedList(db, avatarUuid) {
  const result = await db.query(
    `SELECT d.knowledge_id, d.category, d.title, u.unlocked_at
     FROM t_unlocked_lore u
     JOIN t_encyclopedia_dict d ON d.knowledge_id = u.knowledge_id
     WHERE u.avatar_uuid = $1
     ORDER BY u.unlocked_at DESC`,
    [avatarUuid]
  );
  return result.rows;
}

/**
 * Cherche une entrée par titre, tous catégories confondues, et ne renvoie son
 * contenu que si le joueur l'a réellement débloquée (T_UNLOCKED_LORE) — le
 * brouillard de guerre documenté dans table_t_encyclopedia.md : jamais de fuite
 * de contenu non débloqué, secret ou non.
 */
export async function getEntry(db, avatarUuid, titleQuery) {
  const result = await db.query(
    `SELECT d.knowledge_id, d.category, d.title, d.content, d.is_secret,
            (u.unlock_uuid IS NOT NULL) AS unlocked
     FROM t_encyclopedia_dict d
     LEFT JOIN t_unlocked_lore u ON u.knowledge_id = d.knowledge_id AND u.avatar_uuid = $2
     WHERE d.title ILIKE $1
     ORDER BY (u.unlock_uuid IS NOT NULL) DESC
     LIMIT 1`,
    [`%${titleQuery}%`, avatarUuid]
  );
  if (result.rows.length === 0) return { found: false };

  const row = result.rows[0];
  if (!row.unlocked) return { found: true, unlocked: false, title: row.title };

  return {
    found: true,
    unlocked: true,
    knowledgeId: row.knowledge_id,
    category: row.category,
    title: row.title,
    content: row.content,
  };
}

export default { getUnlockedList, getEntry };
