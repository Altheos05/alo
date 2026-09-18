import logger from '../utils/logger.js';

// Grille D-SOC-6 (table_t_properties.md §2) — données de balance réelles et
// documentées, pas une table dédiée (le schéma stocke l'instance possédée,
// pas un catalogue commercial).
export const HOUSING_GRID = {
  inn_room: { tenure: 'rent', cost: 0, rentPerCycle: 1500, storageSlots: 50, label: "Chambre d'auberge" },
  small_house: { tenure: 'own', cost: 50000, rentPerCycle: 0, storageSlots: 150, label: 'Petite maison' },
  manor: { tenure: 'own', cost: 500000, rentPerCycle: 0, storageSlots: 400, label: 'Manoir' },
  estate: { tenure: 'own', cost: 3000000, rentPerCycle: 0, storageSlots: 1000, label: 'Domaine' },
};

export async function getProperty(db, avatarUuid) {
  const result = await db.query(
    `SELECT p.property_uuid, p.property_type, p.tenure, p.zone_id, p.rent_yrds_cycle, p.paid_until,
            p.is_delinquent, p.storage_slots, p.storage_used, z.zone_name
     FROM t_properties p
     JOIN t_zones z ON z.zone_id = p.zone_id
     WHERE p.owner_avatar_uuid = $1`,
    [avatarUuid]
  );
  return result.rows[0] || null;
}

export async function acquireProperty(db, avatarUuid, propertyType) {
  const grid = HOUSING_GRID[propertyType];
  if (!grid) return { success: false, error: 'INVALID_TYPE' };

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT 1 FROM t_properties WHERE owner_avatar_uuid = $1 FOR UPDATE',
      [avatarUuid]
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'ALREADY_OWNS_PROPERTY' };
    }

    // zone_id = capitale de la race du joueur (table_t_properties.md §1
    // commentaire de colonne), pas la zone où il se trouve à l'achat — sinon
    // un logement acquis en visite se retrouverait rattaché au territoire
    // d'une autre race.
    const raceLock = await client.query(
      `SELECT r.capital_zone_id FROM t_avatars a JOIN t_races r ON r.race_id = a.race_id
       WHERE a.avatar_uuid = $1 FOR UPDATE OF a`,
      [avatarUuid]
    );
    if (raceLock.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }
    const zoneId = raceLock.rows[0].capital_zone_id;
    if (!zoneId) {
      await client.query('ROLLBACK');
      return { success: false, error: 'NO_CAPITAL_ZONE' };
    }

    const cost = grid.tenure === 'own' ? grid.cost : grid.rentPerCycle;
    const lock = await client.query('SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE', [avatarUuid]);
    if (lock.rows[0].yrd_balance < cost) {
      await client.query('ROLLBACK');
      return { success: false, error: 'INSUFFICIENT_FUNDS', required: cost, available: lock.rows[0].yrd_balance };
    }
    await client.query('UPDATE t_avatars SET yrd_balance = yrd_balance - $1 WHERE avatar_uuid = $2', [cost, avatarUuid]);

    const paidUntil = grid.tenure === 'rent' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;
    await client.query(
      `INSERT INTO t_properties (owner_avatar_uuid, property_type, tenure, zone_id, rent_yrds_cycle, paid_until, storage_slots)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [avatarUuid, propertyType, grid.tenure, zoneId, grid.tenure === 'rent' ? grid.rentPerCycle : 0, paidUntil, grid.storageSlots]
    );

    await client.query('COMMIT');
    return { success: true, propertyType, tenure: grid.tenure };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de l\'acquisition du logement', { error: err.message, avatarUuid, propertyType });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export async function payRent(db, avatarUuid, cycles) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const propResult = await client.query(
      'SELECT property_uuid, tenure, rent_yrds_cycle FROM t_properties WHERE owner_avatar_uuid = $1 FOR UPDATE',
      [avatarUuid]
    );
    if (propResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'NO_PROPERTY' };
    }
    const property = propResult.rows[0];
    if (property.tenure !== 'rent') {
      await client.query('ROLLBACK');
      return { success: false, error: 'NOT_RENTED' };
    }

    const total = property.rent_yrds_cycle * cycles;
    const lock = await client.query('SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE', [avatarUuid]);
    if (lock.rows[0].yrd_balance < total) {
      await client.query('ROLLBACK');
      return { success: false, error: 'INSUFFICIENT_FUNDS', required: total, available: lock.rows[0].yrd_balance };
    }
    await client.query('UPDATE t_avatars SET yrd_balance = yrd_balance - $1 WHERE avatar_uuid = $2', [total, avatarUuid]);
    await client.query(
      `UPDATE t_properties SET paid_until = COALESCE(paid_until, NOW()) + ($1 || ' days')::INTERVAL, is_delinquent = FALSE
       WHERE property_uuid = $2`,
      [7 * cycles, property.property_uuid]
    );

    await client.query('COMMIT');
    return { success: true, total, cycles };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors du paiement du loyer', { error: err.message, avatarUuid });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export async function releaseProperty(db, avatarUuid, { refund = false } = {}) {
  const property = await getProperty(db, avatarUuid);
  if (!property) return { success: false, error: 'NO_PROPERTY' };

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM t_properties WHERE property_uuid = $1', [property.property_uuid]);

    let refundAmount = 0;
    if (refund && property.tenure === 'own') {
      const grid = HOUSING_GRID[property.property_type];
      refundAmount = Math.floor(grid.cost * 0.5);
      await client.query('UPDATE t_avatars SET yrd_balance = yrd_balance + $1 WHERE avatar_uuid = $2', [refundAmount, avatarUuid]);
    }

    await client.query('COMMIT');
    return { success: true, refundAmount };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de la libération du logement', { error: err.message, avatarUuid });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export default { HOUSING_GRID, getProperty, acquireProperty, payRent, releaseProperty };
