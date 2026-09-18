import logger from '../utils/logger.js';

const SLOT_PREFIXES = {
  head: ['ARM_TET_'],
  torso: ['ARM_TOR_', 'OFT_TOP_'],
  arms: ['ARM_BRA_'],
  waist: ['ARM_TAI_'],
  legs: ['ARM_JAM_', 'OFT_BOT_'],
  hand_main: ['WPN_'],
  hand_off: ['WPN_'],
  gear_belt: ['BELT_'],
  belt_left: ['WPN_'],
  belt_right: ['WPN_'],
  gear_back: ['BAG_', 'HRN_'],
  back_wpn: ['WPN_'],
};

// T_AVATARS mirroire TOUS ces slots (schema.sql lignes 417-428), pas seulement
// les 5 slots d'armure — corrigé après revue : gear_back a en plus une colonne
// back_type ('BAG'|'HRN') dérivée du préfixe de l'objet.
const AVATAR_SLOT_COLUMNS = {
  head: 'equip_head', torso: 'equip_torso', arms: 'equip_arms', waist: 'equip_waist', legs: 'equip_legs',
  hand_main: 'hand_main', hand_off: 'hand_off',
  gear_belt: 'gear_belt', belt_left: 'belt_left', belt_right: 'belt_right',
  gear_back: 'gear_back',
};

export const VALID_SLOTS = Object.keys(SLOT_PREFIXES);

export async function getEquipment(db, avatarUuid) {
  const result = await db.query(
    `SELECT i.slot_equipped, i.item_id, d.name
     FROM t_inventory i
     JOIN t_items_dict d ON d.item_id = i.item_id
     WHERE i.avatar_uuid = $1 AND i.is_equipped = TRUE`,
    [avatarUuid]
  );
  return result.rows;
}

export async function equipItem(db, avatarUuid, itemId, slot) {
  if (!SLOT_PREFIXES[slot]) return { success: false, error: 'INVALID_SLOT' };

  const prefixOk = SLOT_PREFIXES[slot].some((p) => itemId.startsWith(p));
  if (!prefixOk) return { success: false, error: 'WRONG_SLOT_TYPE' };

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const inv = await client.query(
      'SELECT instance_uuid FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2 AND is_equipped = FALSE LIMIT 1 FOR UPDATE',
      [avatarUuid, itemId]
    );
    if (inv.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'ITEM_NOT_FOUND' };
    }

    // A2 (table_t_avatars.md) : une 2e arme en hand_off exige la passive PAS_CBT_*.
    if (slot === 'hand_off') {
      const passive = await client.query(
        "SELECT 1 FROM t_avatar_skills WHERE avatar_uuid = $1 AND skill_id LIKE 'PAS_CBT_%' LIMIT 1",
        [avatarUuid]
      );
      if (passive.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, error: 'MISSING_DUAL_WIELD_PASSIVE' };
      }
    }

    // A3 : belt_left/belt_right exigent gear_belt déjà équipée.
    if (slot === 'belt_left' || slot === 'belt_right') {
      const belt = await client.query('SELECT gear_belt FROM t_avatars WHERE avatar_uuid = $1', [avatarUuid]);
      if (!belt.rows[0]?.gear_belt) {
        await client.query('ROLLBACK');
        return { success: false, error: 'NO_BELT_EQUIPPED' };
      }
    }

    const instanceUuid = inv.rows[0].instance_uuid;

    await client.query(
      'UPDATE t_inventory SET is_equipped = FALSE, slot_equipped = NULL WHERE avatar_uuid = $1 AND slot_equipped = $2',
      [avatarUuid, slot]
    );
    await client.query(
      'UPDATE t_inventory SET is_equipped = TRUE, slot_equipped = $1 WHERE instance_uuid = $2',
      [slot, instanceUuid]
    );

    const avatarColumn = AVATAR_SLOT_COLUMNS[slot];
    if (avatarColumn) {
      await client.query(`UPDATE t_avatars SET ${avatarColumn} = $1 WHERE avatar_uuid = $2`, [instanceUuid, avatarUuid]);
    }
    if (slot === 'gear_back') {
      const backType = itemId.startsWith('BAG_') ? 'BAG' : 'HRN';
      await client.query('UPDATE t_avatars SET back_type = $1 WHERE avatar_uuid = $2', [backType, avatarUuid]);
    }

    await client.query('COMMIT');
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de l\'équipement', { error: err.message, avatarUuid, itemId, slot });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export async function unequipItem(db, avatarUuid, slot) {
  if (!SLOT_PREFIXES[slot]) return { success: false, error: 'INVALID_SLOT' };

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const upd = await client.query(
      'UPDATE t_inventory SET is_equipped = FALSE, slot_equipped = NULL WHERE avatar_uuid = $1 AND slot_equipped = $2 RETURNING instance_uuid',
      [avatarUuid, slot]
    );
    if (upd.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'SLOT_EMPTY' };
    }

    const avatarColumn = AVATAR_SLOT_COLUMNS[slot];
    if (avatarColumn) {
      await client.query(`UPDATE t_avatars SET ${avatarColumn} = NULL WHERE avatar_uuid = $1`, [avatarUuid]);
    }
    if (slot === 'gear_back') {
      await client.query('UPDATE t_avatars SET back_type = NULL WHERE avatar_uuid = $1', [avatarUuid]);
    }

    await client.query('COMMIT');
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors du retrait d\'équipement', { error: err.message, avatarUuid, slot });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export default { VALID_SLOTS, getEquipment, equipItem, unequipItem };
