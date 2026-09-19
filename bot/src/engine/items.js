import logger from '../utils/logger.js';

export async function findItem(db, itemQuery) {
  const result = await db.query(
    'SELECT item_id, name, item_type, description, rarity, tier, buy_price, resale_value FROM t_items_dict WHERE item_id = $1 OR name ILIKE $2 LIMIT 1',
    [itemQuery.toUpperCase(), `%${itemQuery}%`]
  );
  return result.rows[0] || null;
}

export async function dropItem(db, avatarUuid, itemId, quantity = 1, { allowBound = false } = {}) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const inv = await client.query(
      'SELECT instance_uuid, quantity, is_equipped, is_bound FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2 FOR UPDATE',
      [avatarUuid, itemId]
    );
    if (inv.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'NOT_OWNED' };
    }
    const row = inv.rows[0];
    if (row.is_equipped) {
      await client.query('ROLLBACK');
      return { success: false, error: 'EQUIPPED' };
    }
    // I4 (table_t_inventory.md) : un objet lié ne se jette qu'après
    // confirmation citée (D92) — allowBound n'est vrai que sur ce chemin.
    if (row.is_bound && !allowBound) {
      await client.query('ROLLBACK');
      return { success: false, error: 'BOUND_ITEM' };
    }
    if (row.quantity < quantity) {
      await client.query('ROLLBACK');
      return { success: false, error: 'INSUFFICIENT_QUANTITY', available: row.quantity };
    }

    if (row.quantity === quantity) {
      await client.query('DELETE FROM t_inventory WHERE instance_uuid = $1', [row.instance_uuid]);
    } else {
      await client.query('UPDATE t_inventory SET quantity = quantity - $1 WHERE instance_uuid = $2', [quantity, row.instance_uuid]);
    }

    await client.query('COMMIT');
    return { success: true, quantity };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de l\'abandon d\'objet', { error: err.message, avatarUuid, itemId });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export default { findItem, dropItem };
