import logger from '../utils/logger.js';

export async function getPartyForAvatar(db, avatarUuid) {
  const result = await db.query(
    `SELECT p.party_id, p.name, p.max_members, p.loot_rule, (p.leader_id = $1) AS is_leader
     FROM t_parties p
     JOIN t_party_members m ON m.party_id = p.party_id
     WHERE m.avatar_uuid = $1 AND p.status = 'active'`,
    [avatarUuid]
  );
  return result.rows[0] || null;
}

export async function getPartyMembers(db, partyId) {
  const result = await db.query(
    `SELECT a.avatar_name, pm.role
     FROM t_party_members pm
     JOIN t_avatars a ON a.avatar_uuid = pm.avatar_uuid
     WHERE pm.party_id = $1
     ORDER BY pm.joined_at`,
    [partyId]
  );
  return result.rows;
}

export async function createParty(db, avatarUuid) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Verrou consultatif scopé à l'avatar : aucune ligne T_PARTY_MEMBERS n'existe
    // encore pour un nouveau groupe, donc un simple FOR UPDATE ne verrouillerait rien —
    // l'avisory lock ferme la fenêtre TOCTOU même sans ligne à verrouiller.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [avatarUuid]);

    const existing = await client.query(
      `SELECT p.party_id FROM t_parties p
       JOIN t_party_members m ON m.party_id = p.party_id
       WHERE m.avatar_uuid = $1 AND p.status = 'active'`,
      [avatarUuid]
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'ALREADY_IN_PARTY' };
    }

    const party = await client.query('INSERT INTO t_parties (leader_id) VALUES ($1) RETURNING party_id', [avatarUuid]);
    await client.query(
      "INSERT INTO t_party_members (party_id, avatar_uuid, role) VALUES ($1, $2, 'leader')",
      [party.rows[0].party_id, avatarUuid]
    );

    await client.query('COMMIT');
    return { success: true, partyId: party.rows[0].party_id };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de la création du groupe', { error: err.message, avatarUuid });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export async function inviteToParty(db, avatarUuid, recipientPhone) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const partyResult = await client.query(
      `SELECT p.party_id, p.max_members, p.leader_id
       FROM t_parties p
       JOIN t_party_members m ON m.party_id = p.party_id
       WHERE m.avatar_uuid = $1 AND p.status = 'active' FOR UPDATE OF p`,
      [avatarUuid]
    );
    if (partyResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'NOT_IN_PARTY' };
    }
    const party = partyResult.rows[0];
    if (party.leader_id !== avatarUuid) {
      await client.query('ROLLBACK');
      return { success: false, error: 'NOT_LEADER' };
    }

    const recipientResult = await client.query(
      'SELECT avatar_uuid, avatar_name FROM t_avatars WHERE whatsapp_phone = $1',
      [recipientPhone]
    );
    if (recipientResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'RECIPIENT_NOT_FOUND' };
    }
    const recipient = recipientResult.rows[0];

    const alreadyIn = await client.query(
      `SELECT 1 FROM t_party_members m JOIN t_parties p ON p.party_id = m.party_id
       WHERE m.avatar_uuid = $1 AND p.status = 'active'`,
      [recipient.avatar_uuid]
    );
    if (alreadyIn.rows.length > 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'RECIPIENT_ALREADY_IN_PARTY' };
    }

    const countResult = await client.query(
      'SELECT COUNT(*) AS n FROM t_party_members WHERE party_id = $1',
      [party.party_id]
    );
    if (Number(countResult.rows[0].n) >= party.max_members) {
      await client.query('ROLLBACK');
      return { success: false, error: 'PARTY_FULL' };
    }

    await client.query('INSERT INTO t_party_members (party_id, avatar_uuid) VALUES ($1, $2)', [party.party_id, recipient.avatar_uuid]);

    await client.query('COMMIT');
    return { success: true, recipientName: recipient.avatar_name };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de l\'invitation au groupe', { error: err.message, avatarUuid, recipientPhone });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export async function leaveParty(db, avatarUuid) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const partyResult = await client.query(
      `SELECT p.party_id, (p.leader_id = $1) AS is_leader
       FROM t_parties p
       JOIN t_party_members m ON m.party_id = p.party_id
       WHERE m.avatar_uuid = $1 AND p.status = 'active' FOR UPDATE OF p`,
      [avatarUuid]
    );
    if (partyResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'NOT_IN_PARTY' };
    }
    const party = partyResult.rows[0];

    await client.query('DELETE FROM t_party_members WHERE party_id = $1 AND avatar_uuid = $2', [party.party_id, avatarUuid]);

    const remaining = await client.query('SELECT COUNT(*) AS n FROM t_party_members WHERE party_id = $1', [party.party_id]);
    if (Number(remaining.rows[0].n) === 0) {
      await client.query("UPDATE t_parties SET status = 'disbanded' WHERE party_id = $1", [party.party_id]);
    } else if (party.is_leader) {
      const next = await client.query(
        'SELECT avatar_uuid FROM t_party_members WHERE party_id = $1 ORDER BY joined_at LIMIT 1',
        [party.party_id]
      );
      if (next.rows.length > 0) {
        await client.query('UPDATE t_parties SET leader_id = $1 WHERE party_id = $2', [next.rows[0].avatar_uuid, party.party_id]);
        await client.query("UPDATE t_party_members SET role = 'leader' WHERE party_id = $1 AND avatar_uuid = $2", [party.party_id, next.rows[0].avatar_uuid]);
      }
    }

    await client.query('COMMIT');
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de la sortie du groupe', { error: err.message, avatarUuid });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export default { getPartyForAvatar, getPartyMembers, createParty, inviteToParty, leaveParty };
