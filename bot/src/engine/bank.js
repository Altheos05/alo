import logger from '../utils/logger.js';

export const DEFAULT_MAX_SLOTS = 50;

async function getOrCreateVault(client, ownerType, ownerId) {
  const existing = await client.query(
    'SELECT vault_id, yrds_stored, max_slots, items_stored FROM t_bank_vaults WHERE owner_type = $1 AND owner_id = $2 FOR UPDATE',
    [ownerType, ownerId]
  );
  if (existing.rows.length > 0) return existing.rows[0];

  const created = await client.query(
    `INSERT INTO t_bank_vaults (owner_type, owner_id, yrds_stored, max_slots, items_stored)
     VALUES ($1, $2, 0, $3, '[]'::jsonb)
     RETURNING vault_id, yrds_stored, max_slots, items_stored`,
    [ownerType, ownerId, DEFAULT_MAX_SLOTS]
  );
  return created.rows[0];
}

export async function getVaultStatus(db, avatarUuid) {
  const result = await db.query(
    'SELECT yrds_stored, max_slots, items_stored FROM t_bank_vaults WHERE owner_type = $1 AND owner_id = $2',
    ['avatar', avatarUuid]
  );
  if (result.rows.length === 0) {
    return { yrdsStored: 0, maxSlots: DEFAULT_MAX_SLOTS, itemsStored: 0 };
  }
  const row = result.rows[0];
  return {
    yrdsStored: row.yrds_stored,
    maxSlots: row.max_slots,
    itemsStored: Array.isArray(row.items_stored) ? row.items_stored.length : 0,
  };
}

export async function depositYrds(db, avatarUuid, amount) {
  if (!(amount > 0)) return { success: false, error: 'INVALID_AMOUNT' };

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const lock = await client.query(
      'SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE',
      [avatarUuid]
    );
    if (lock.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }
    const balance = lock.rows[0].yrd_balance;
    if (balance < amount) {
      await client.query('ROLLBACK');
      return { success: false, error: 'INSUFFICIENT_FUNDS', required: amount, available: balance };
    }

    const vault = await getOrCreateVault(client, 'avatar', avatarUuid);

    await client.query('UPDATE t_avatars SET yrd_balance = yrd_balance - $1 WHERE avatar_uuid = $2', [amount, avatarUuid]);
    await client.query(
      'UPDATE t_bank_vaults SET yrds_stored = yrds_stored + $1, last_accessed = NOW() WHERE vault_id = $2',
      [amount, vault.vault_id]
    );

    await client.query('COMMIT');
    logger.info('Dépôt en banque effectué', { avatarUuid, amount });
    return { success: true, amount, newVaultBalance: Number(vault.yrds_stored) + amount, newWalletBalance: balance - amount };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors du dépôt en banque', { error: err.message, avatarUuid });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export async function withdrawYrds(db, avatarUuid, amount) {
  if (!(amount > 0)) return { success: false, error: 'INVALID_AMOUNT' };

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const vault = await getOrCreateVault(client, 'avatar', avatarUuid);
    if (vault.yrds_stored < amount) {
      await client.query('ROLLBACK');
      return { success: false, error: 'INSUFFICIENT_VAULT_FUNDS', available: vault.yrds_stored };
    }

    const lock = await client.query(
      'SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE',
      [avatarUuid]
    );
    if (lock.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }

    await client.query(
      'UPDATE t_bank_vaults SET yrds_stored = yrds_stored - $1, last_accessed = NOW() WHERE vault_id = $2',
      [amount, vault.vault_id]
    );
    await client.query('UPDATE t_avatars SET yrd_balance = yrd_balance + $1 WHERE avatar_uuid = $2', [amount, avatarUuid]);

    await client.query('COMMIT');
    logger.info('Retrait de banque effectué', { avatarUuid, amount });
    return {
      success: true,
      amount,
      newVaultBalance: Number(vault.yrds_stored) - amount,
      newWalletBalance: Number(lock.rows[0].yrd_balance) + amount,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors du retrait de banque', { error: err.message, avatarUuid });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

// ─── Objets en coffre (T_BANK_VAULTS.items_stored) ───
// Une entrée = une pile homogène : { item_id, qty, current_durability,
// durability_cap, repair_count }. Les objets à durabilité (max_stack 1)
// gardent leur état d'instance ; les objets liés (I4) ne se déposent pas.
// Le nombre d'entrées est borné par max_slots.

function sameState(entry, row) {
  return entry.item_id === row.item_id
    && (entry.current_durability ?? null) === (row.current_durability ?? null)
    && (entry.durability_cap ?? null) === (row.durability_cap ?? null)
    && (entry.repair_count ?? 0) === (row.repair_count ?? 0)
    && JSON.stringify(entry.instance_data ?? null) === JSON.stringify(row.instance_data ?? null);
}

// Retire qty exemplaires de l'inventaire (verrou ligne) ; renvoie les états retirés.
// allowBound : consommer un objet lié (fabrication) n'est pas le transférer (I4).
export async function takeFromInventory(client, avatarUuid, itemId, qty, { allowBound = false } = {}) {
  const rows = await client.query(
    `SELECT instance_uuid, item_id, quantity, is_equipped, is_bound,
            current_durability, durability_cap, repair_count, instance_data
     FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2
     ORDER BY acquired_at FOR UPDATE`,
    [avatarUuid, itemId]
  );
  const usable = rows.rows.filter(r => !r.is_equipped && (allowBound || !r.is_bound));
  if (rows.rows.length === 0) return { error: 'NOT_OWNED' };
  if (usable.length === 0) return { error: rows.rows.some(r => r.is_bound) ? 'BOUND_ITEM' : 'EQUIPPED' };
  const available = usable.reduce((n, r) => n + r.quantity, 0);
  if (available < qty) return { error: 'INSUFFICIENT_QUANTITY', available };

  const taken = [];
  let remaining = qty;
  for (const r of usable) {
    if (remaining === 0) break;
    const n = Math.min(remaining, r.quantity);
    if (n === r.quantity) {
      await client.query('DELETE FROM t_inventory WHERE instance_uuid = $1', [r.instance_uuid]);
    } else {
      await client.query('UPDATE t_inventory SET quantity = quantity - $1 WHERE instance_uuid = $2', [n, r.instance_uuid]);
    }
    taken.push({ ...r, qty: n });
    remaining -= n;
  }
  return { taken };
}

// Capacité : un emplacement par ligne d'inventaire non équipée ; un sac porté
// au dos en ajoute 30 (toutes les fiches BAG_* : « Stockage +30 emplacements »).
const BAG_BONUS_SLOTS = 30;

async function freeSlots(client, avatarUuid) {
  const r = await client.query(
    // Verrou sur l'avatar : deux ajouts concurrents ne peuvent pas compter la même place libre.
    `SELECT a.inventory_capacity + CASE WHEN a.back_type = 'BAG' THEN $2 ELSE 0 END
            - (SELECT COUNT(*) FROM t_inventory i WHERE i.avatar_uuid = a.avatar_uuid AND NOT i.is_equipped) AS free
     FROM t_avatars a WHERE a.avatar_uuid = $1 FOR UPDATE OF a`,
    [avatarUuid, BAG_BONUS_SLOTS]
  );
  return Number(r.rows[0]?.free ?? 0);
}

// Ajoute des exemplaires à l'inventaire en respectant max_stack (CHECK quantity 1..99)
// et la capacité. Renvoie { overflow } : les exemplaires qui n'ont pas trouvé de place
// (l'appelant annule, ou les envoie par courrier).
export async function addToInventory(client, avatarUuid, entry, acquiredFrom = null) {
  const dict = await client.query('SELECT max_stack FROM t_items_dict WHERE item_id = $1', [entry.item_id]);
  const maxStack = dict.rows[0]?.max_stack || 1;
  let remaining = entry.qty;
  // Un exemplaire porteur d'état (durabilité, données de plat D93) ne s'empile jamais.
  if (maxStack > 1 && entry.current_durability == null && entry.instance_data == null) {
    const stack = await client.query(
      `SELECT instance_uuid, quantity FROM t_inventory
       WHERE avatar_uuid = $1 AND item_id = $2 AND NOT is_bound AND instance_data IS NULL AND quantity < $3
       ORDER BY acquired_at LIMIT 1 FOR UPDATE`,
      [avatarUuid, entry.item_id, maxStack]
    );
    if (stack.rows.length) {
      const n = Math.min(remaining, maxStack - stack.rows[0].quantity);
      await client.query('UPDATE t_inventory SET quantity = quantity + $1 WHERE instance_uuid = $2', [n, stack.rows[0].instance_uuid]);
      remaining -= n;
    }
  }
  let free = remaining > 0 ? await freeSlots(client, avatarUuid) : 0;
  while (remaining > 0 && free > 0) {
    const n = Math.min(remaining, maxStack);
    free--;
    await client.query(
      `INSERT INTO t_inventory (avatar_uuid, item_id, quantity, current_durability, durability_cap, repair_count, acquired_from, instance_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [avatarUuid, entry.item_id, n, entry.current_durability ?? null, entry.durability_cap ?? null, entry.repair_count ?? 0, acquiredFrom,
       entry.instance_data ? JSON.stringify(entry.instance_data) : null]
    );
    remaining -= n;
  }
  return { overflow: remaining };
}

// Ajoute des états d'objets à un tableau d'entrées de coffre ; null si plein.
export function mergeIntoVault(items, additions, maxSlots) {
  const next = items.map(e => ({ ...e }));
  for (const add of additions) {
    const existing = next.find(e => sameState(e, add));
    if (existing) {
      existing.qty += add.qty;
    } else {
      next.push({
        item_id: add.item_id,
        qty: add.qty,
        current_durability: add.current_durability ?? null,
        durability_cap: add.durability_cap ?? null,
        repair_count: add.repair_count ?? 0,
        instance_data: add.instance_data ?? null,
      });
    }
  }
  return next.length > maxSlots ? null : next;
}

// Retire qty exemplaires d'un objet d'un tableau d'entrées ; null si insuffisant.
export function takeFromVault(items, itemId, qty) {
  const available = items.filter(e => e.item_id === itemId).reduce((n, e) => n + e.qty, 0);
  if (available < qty) return null;
  const taken = [];
  let remaining = qty;
  const next = [];
  for (const e of items) {
    if (e.item_id !== itemId || remaining === 0) {
      next.push({ ...e });
      continue;
    }
    const n = Math.min(remaining, e.qty);
    taken.push({ ...e, qty: n });
    remaining -= n;
    if (e.qty > n) next.push({ ...e, qty: e.qty - n });
  }
  return { next, taken };
}

async function lockVault(client, ownerType, ownerId) {
  if (ownerType === 'avatar') return getOrCreateVault(client, ownerType, ownerId);
  const r = await client.query(
    'SELECT vault_id, yrds_stored, max_slots, items_stored FROM t_bank_vaults WHERE owner_type = $1 AND owner_id = $2 FOR UPDATE',
    [ownerType, ownerId]
  );
  return r.rows[0] || null;
}

// Dépôt d'objets dans un coffre, dans la transaction de l'appelant.
// onDeposit(client, taken) : crochet de provenance (T_MARRIAGE_ASSETS, M7).
export async function depositItemTx(client, avatarUuid, itemId, qty, vaultRef = null, onDeposit = null) {
  if (!(qty > 0)) return { success: false, error: 'INVALID_AMOUNT' };
  const { ownerType, ownerId } = vaultRef || { ownerType: 'avatar', ownerId: avatarUuid };
  const vault = await lockVault(client, ownerType, ownerId);
  if (!vault) return { success: false, error: 'NO_VAULT' };

  const took = await takeFromInventory(client, avatarUuid, itemId, qty);
  if (took.error) return { success: false, error: took.error, available: took.available };

  const next = mergeIntoVault(vault.items_stored || [], took.taken, vault.max_slots);
  if (!next) return { success: false, error: 'VAULT_FULL', maxSlots: vault.max_slots };

  await client.query(
    'UPDATE t_bank_vaults SET items_stored = $1, last_accessed = NOW() WHERE vault_id = $2',
    [JSON.stringify(next), vault.vault_id]
  );
  if (onDeposit) await onDeposit(client, took.taken);
  return { success: true, qty };
}

export async function withdrawItemTx(client, avatarUuid, itemId, qty, vaultRef = null) {
  if (!(qty > 0)) return { success: false, error: 'INVALID_AMOUNT' };
  const { ownerType, ownerId } = vaultRef || { ownerType: 'avatar', ownerId: avatarUuid };
  const vault = await lockVault(client, ownerType, ownerId);
  if (!vault) return { success: false, error: 'NO_VAULT' };

  const took = takeFromVault(vault.items_stored || [], itemId, qty);
  if (!took) return { success: false, error: 'NOT_IN_VAULT' };

  await client.query(
    'UPDATE t_bank_vaults SET items_stored = $1, last_accessed = NOW() WHERE vault_id = $2',
    [JSON.stringify(took.next), vault.vault_id]
  );
  for (const entry of took.taken) {
    const placed = await addToInventory(client, avatarUuid, entry, 'vault');
    if (placed.overflow > 0) return { success: false, error: 'INVENTORY_FULL' };
  }
  return { success: true, qty, taken: took.taken };
}

async function inTransaction(db, label, context, fn) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query(result.success ? 'COMMIT' : 'ROLLBACK');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error(label, { error: err.message, ...context });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export async function depositItem(db, avatarUuid, itemId, qty) {
  return inTransaction(db, 'Erreur lors du dépôt d\'objet en banque', { avatarUuid, itemId },
    client => depositItemTx(client, avatarUuid, itemId, qty));
}

export async function withdrawItem(db, avatarUuid, itemId, qty) {
  return inTransaction(db, 'Erreur lors du retrait d\'objet de banque', { avatarUuid, itemId },
    client => withdrawItemTx(client, avatarUuid, itemId, qty));
}

export async function listVaultItems(db, ownerType, ownerId) {
  const r = await db.query(
    `SELECT e->>'item_id' AS item_id, d.name, SUM((e->>'qty')::int) AS qty
     FROM t_bank_vaults v, jsonb_array_elements(v.items_stored) e
     JOIN t_items_dict d ON d.item_id = e->>'item_id'
     WHERE v.owner_type = $1 AND v.owner_id = $2
     GROUP BY 1, 2 ORDER BY 2`,
    [ownerType, ownerId]
  );
  return r.rows.map(row => ({ ...row, qty: Number(row.qty) }));
}

export { inTransaction };
export default { getVaultStatus, depositYrds, withdrawYrds, depositItem, withdrawItem, listVaultItems };
