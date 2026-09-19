import logger from '../utils/logger.js';
import { durabilityState, currentDurability } from './durability.js';

export function calculateBuyPrice(item, quantity = 1) {
  const unitPrice = item.buy_price || 0;
  const taxRate = 0.05;
  const total = unitPrice * quantity;
  const tax = Math.round(total * taxRate);
  return { unitPrice, total: total + tax, tax, quantity };
}

export function calculateSellPrice(item, quantity = 1) {
  const resaleValue = item.resale_value || Math.floor((item.buy_price || 0) * 0.25);
  return { unitPrice: resaleValue, total: resaleValue * quantity, quantity };
}

export async function buyItem(db, playerUuid, itemId, quantity = 1) {
  const itemResult = await db.query(
    'SELECT item_id, name, buy_price, max_stack, is_consumable FROM t_items_dict WHERE item_id = $1',
    [itemId]
  );
  if (itemResult.rows.length === 0) {
    return { success: false, error: 'ITEM_NOT_FOUND' };
  }
  const item = itemResult.rows[0];
  const { total, tax } = calculateBuyPrice(item, quantity);

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const lock = await client.query(
      'SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE',
      [playerUuid]
    );
    if (lock.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }
    const balance = lock.rows[0].yrd_balance;
    if (balance < total) {
      await client.query('ROLLBACK');
      return { success: false, error: 'INSUFFICIENT_FUNDS', required: total, available: balance };
    }

    const upd = await client.query(
      'UPDATE t_avatars SET yrd_balance = yrd_balance - $1, total_yrd_spent = COALESCE(total_yrd_spent, 0) + $2 WHERE avatar_uuid = $3 AND yrd_balance >= $4',
      [total, total, playerUuid, total]
    );
    if (upd.rowCount === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'INSUFFICIENT_FUNDS', required: total, available: balance };
    }

    const existing = await client.query(
      'SELECT quantity FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2 FOR UPDATE',
      [playerUuid, itemId]
    );

    if (existing.rows.length > 0) {
      await client.query(
        'UPDATE t_inventory SET quantity = quantity + $1 WHERE avatar_uuid = $2 AND item_id = $3',
        [quantity, playerUuid, itemId]
      );
    } else {
      await client.query(
        'INSERT INTO t_inventory (instance_uuid, avatar_uuid, item_id, quantity) VALUES (gen_random_uuid(), $1, $2, $3)',
        [playerUuid, itemId, quantity]
      );
    }

    await client.query('COMMIT');
    logger.info('Achat effectué', { playerUuid, itemId, quantity, total });
    return { success: true, item, quantity, total, tax, newBalance: balance - total };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de l\'achat', { error: err.message, playerUuid, itemId });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

// Rachat PNJ. Objets à durabilité : prix catalogue × coefficient de l'état de
// l'exemplaire vendu (D88). Les exemplaires équipés ou liés (I4) ne se vendent pas.
export async function sellItem(db, playerUuid, itemId, quantity = 1) {
  const itemResult = await db.query(
    'SELECT item_id, name, resale_value, buy_price, durability_max FROM t_items_dict WHERE item_id = $1',
    [itemId]
  );
  if (itemResult.rows.length === 0) {
    return { success: false, error: 'ITEM_NOT_FOUND' };
  }
  const item = itemResult.rows[0];
  const resaleValue = item.resale_value || Math.floor((item.buy_price || 0) * 0.25);

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const lock = await client.query(
      'SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE',
      [playerUuid]
    );
    if (lock.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }

    const inv = await client.query(
      `SELECT instance_uuid, quantity, current_durability, durability_cap FROM t_inventory
       WHERE avatar_uuid = $1 AND item_id = $2 AND NOT is_equipped AND NOT is_bound
       ORDER BY acquired_at FOR UPDATE`,
      [playerUuid, itemId]
    );
    const available = inv.rows.reduce((n, r) => n + r.quantity, 0);
    if (available < quantity) {
      await client.query('ROLLBACK');
      return { success: false, error: 'INSUFFICIENT_STOCK', available };
    }

    let total = 0;
    let remaining = quantity;
    for (const row of inv.rows) {
      if (remaining === 0) break;
      const n = Math.min(remaining, row.quantity);
      const unitPrice = item.durability_max > 0
        ? Math.floor((item.buy_price || 0) * durabilityState(currentDurability(row, item.durability_max), item.durability_max).coef)
        : resaleValue;
      total += unitPrice * n;
      if (n === row.quantity) {
        await client.query('DELETE FROM t_inventory WHERE instance_uuid = $1', [row.instance_uuid]);
      } else {
        await client.query('UPDATE t_inventory SET quantity = quantity - $1 WHERE instance_uuid = $2', [n, row.instance_uuid]);
      }
      remaining -= n;
    }

    await client.query(
      'UPDATE t_avatars SET yrd_balance = yrd_balance + $1, total_yrd_earned = COALESCE(total_yrd_earned, 0) + $2 WHERE avatar_uuid = $3',
      [total, total, playerUuid]
    );

    await client.query('COMMIT');
    logger.info('Revente effectuée', { playerUuid, itemId, quantity, total });
    return { success: true, item, quantity, total, newBalance: total };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de la revente', { error: err.message, playerUuid, itemId });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export async function getShopInventory(db, zoneId) {
  const result = await db.query(
    `SELECT si.item_id, id.name AS item_name, si.price, si.stock, n.display_name AS npc_name
     FROM t_shops s
     JOIN t_npc n ON n.npc_id = s.owner_npc_id
     JOIN t_shop_items si ON si.shop_id = s.shop_id
     JOIN t_items_dict id ON id.item_id = si.item_id
     WHERE s.zone_id = $1 AND s.is_open = TRUE
     ORDER BY n.display_name, id.name`,
    [zoneId]
  );
  return result.rows;
}

export default { calculateBuyPrice, calculateSellPrice, buyItem, sellItem, getShopInventory };
