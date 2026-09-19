import logger from '../utils/logger.js';

export async function getGuildForAvatar(db, avatarUuid) {
  const result = await db.query(
    `SELECT g.guild_uuid, g.guild_name, g.guild_tag, g.guild_level, g.treasury_yrds,
            (g.leader_avatar_uuid = $1) AS is_leader
     FROM t_guilds g
     JOIN t_guild_members m ON m.guild_uuid = g.guild_uuid
     WHERE m.avatar_uuid = $1`,
    [avatarUuid]
  );
  return result.rows[0] || null;
}

export async function getGuildMembers(db, guildUuid) {
  const result = await db.query(
    `SELECT a.avatar_name, m.rank
     FROM t_guild_members m
     JOIN t_avatars a ON a.avatar_uuid = m.avatar_uuid
     WHERE m.guild_uuid = $1
     ORDER BY CASE m.rank WHEN 'leader' THEN 0 WHEN 'vice_leader' THEN 1 WHEN 'officer' THEN 2 WHEN 'member' THEN 3 ELSE 4 END, m.joined_at`,
    [guildUuid]
  );
  return result.rows;
}

export async function createGuild(db, avatarUuid, name) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Même raisonnement que party.js : pas de ligne à verrouiller pour une nouvelle
    // guilde, l'avisory lock scopé à l'avatar ferme la fenêtre TOCTOU (une seule
    // guilde à la fois, G5 — non garanti par une contrainte SQL sur T_GUILD_MEMBERS).
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [avatarUuid]);

    const existing = await client.query(
      'SELECT 1 FROM t_guild_members WHERE avatar_uuid = $1',
      [avatarUuid]
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'ALREADY_IN_GUILD' };
    }

    const guild = await client.query(
      'INSERT INTO t_guilds (guild_name, leader_avatar_uuid) VALUES ($1, $2) RETURNING guild_uuid',
      [name, avatarUuid]
    );
    await client.query(
      "INSERT INTO t_guild_members (guild_uuid, avatar_uuid, rank) VALUES ($1, $2, 'leader')",
      [guild.rows[0].guild_uuid, avatarUuid]
    );

    await client.query('COMMIT');
    return { success: true, guildUuid: guild.rows[0].guild_uuid };
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return { success: false, error: 'NAME_TAKEN' };
    logger.error('Erreur lors de la création de la guilde', { error: err.message, avatarUuid, name });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export async function leaveGuild(db, avatarUuid) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const guildResult = await client.query(
      `SELECT g.guild_uuid, (g.leader_avatar_uuid = $1) AS is_leader
       FROM t_guilds g
       JOIN t_guild_members m ON m.guild_uuid = g.guild_uuid
       WHERE m.avatar_uuid = $1 FOR UPDATE OF g`,
      [avatarUuid]
    );
    if (guildResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'NOT_IN_GUILD' };
    }
    const guild = guildResult.rows[0];
    if (guild.is_leader) {
      await client.query('ROLLBACK');
      return { success: false, error: 'LEADER_CANNOT_LEAVE' };
    }

    await client.query('DELETE FROM t_guild_members WHERE guild_uuid = $1 AND avatar_uuid = $2', [guild.guild_uuid, avatarUuid]);
    await client.query('UPDATE t_guilds SET member_count = GREATEST(1, member_count - 1) WHERE guild_uuid = $1', [guild.guild_uuid]);

    await client.query('COMMIT');
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de la sortie de la guilde', { error: err.message, avatarUuid });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export async function disbandGuild(db, avatarUuid) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const guild = await client.query(
      `SELECT g.guild_uuid, (g.leader_avatar_uuid = $1) AS is_leader
       FROM t_guilds g JOIN t_guild_members m ON m.guild_uuid = g.guild_uuid
       WHERE m.avatar_uuid = $1
       FOR UPDATE OF g`,
      [avatarUuid]
    );
    if (guild.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'NOT_IN_GUILD' };
    }
    if (!guild.rows[0].is_leader) {
      await client.query('ROLLBACK');
      return { success: false, error: 'NOT_LEADER' };
    }
    // t_guild_members suit par ON DELETE CASCADE.
    await client.query('DELETE FROM t_guilds WHERE guild_uuid = $1', [guild.rows[0].guild_uuid]);
    await client.query('COMMIT');
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de la dissolution de la guilde', { error: err.message, avatarUuid });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export default { getGuildForAvatar, getGuildMembers, createGuild, leaveGuild, disbandGuild };
