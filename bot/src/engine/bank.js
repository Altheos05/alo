import logger from '../utils/logger.js';

const DEFAULT_MAX_SLOTS = 50;

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

export default { getVaultStatus, depositYrds, withdrawYrds };
