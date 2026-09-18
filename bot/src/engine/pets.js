export async function getActivePet(db, avatarUuid) {
  const result = await db.query(
    `SELECT p.pet_id, p.nickname, p.level, p.hp_current, p.hp_max, p.atk, p.def, p.agi,
            p.loyalty, p.hunger, p.status, p.is_summoned, m.name AS species_name
     FROM t_pets p
     JOIN t_monsters_dict m ON m.monster_id = p.species_id
     WHERE p.owner_id = $1
     ORDER BY p.is_summoned DESC, p.tamed_at DESC
     LIMIT 1`,
    [avatarUuid]
  );
  return result.rows[0] || null;
}

export async function feedPet(db, avatarUuid, petId) {
  const result = await db.query(
    `UPDATE t_pets SET hunger = LEAST(100, hunger + 30), loyalty = LEAST(100, loyalty + 2)
     WHERE pet_id = $1 AND owner_id = $2
     RETURNING hunger, loyalty`,
    [petId, avatarUuid]
  );
  if (result.rows.length === 0) return { success: false };
  return { success: true, hunger: result.rows[0].hunger, loyalty: result.rows[0].loyalty };
}

export default { getActivePet, feedPet };
