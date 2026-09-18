import logger from '../utils/logger.js';

export async function getInbox(db, avatarUuid) {
  const result = await db.query(
    `SELECT m.mail_id, m.subject, m.body, m.attached_yrds, m.attached_item, m.attached_qty, m.status, m.sent_at,
            a.avatar_name AS sender_name
     FROM t_mail m
     JOIN t_avatars a ON a.avatar_uuid = m.sender_id
     WHERE m.recipient_id = $1 AND m.status != 'expired' AND m.expires_at > NOW()
     ORDER BY (m.status = 'unread') DESC, m.sent_at DESC`,
    [avatarUuid]
  );
  return result.rows;
}

export async function claimMail(db, avatarUuid, mailId) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const upd = await client.query(
      `UPDATE t_mail SET status = 'claimed'
       WHERE mail_id = $1 AND recipient_id = $2 AND status != 'claimed'
       RETURNING subject, body, attached_yrds, attached_item, attached_qty`,
      [mailId, avatarUuid]
    );
    if (upd.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'NOT_FOUND_OR_ALREADY_CLAIMED' };
    }
    const mail = upd.rows[0];

    if (mail.attached_yrds > 0) {
      await client.query('UPDATE t_avatars SET yrd_balance = yrd_balance + $1 WHERE avatar_uuid = $2', [mail.attached_yrds, avatarUuid]);
    }
    if (mail.attached_item && mail.attached_qty > 0) {
      const existing = await client.query(
        'SELECT quantity FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2 FOR UPDATE',
        [avatarUuid, mail.attached_item]
      );
      if (existing.rows.length > 0) {
        await client.query(
          'UPDATE t_inventory SET quantity = quantity + $1 WHERE avatar_uuid = $2 AND item_id = $3',
          [mail.attached_qty, avatarUuid, mail.attached_item]
        );
      } else {
        await client.query(
          'INSERT INTO t_inventory (instance_uuid, avatar_uuid, item_id, quantity) VALUES (gen_random_uuid(), $1, $2, $3)',
          [avatarUuid, mail.attached_item, mail.attached_qty]
        );
      }
    }

    await client.query('COMMIT');
    return { success: true, mail };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors du retrait de courrier', { error: err.message, avatarUuid, mailId });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export async function sendMail(db, senderUuid, recipientPhone, body) {
  const recipientResult = await db.query(
    'SELECT avatar_uuid, avatar_name FROM t_avatars WHERE whatsapp_phone = $1',
    [recipientPhone]
  );
  if (recipientResult.rows.length === 0) {
    return { success: false, error: 'RECIPIENT_NOT_FOUND' };
  }
  const recipient = recipientResult.rows[0];
  const subject = body.length > 40 ? `${body.slice(0, 40)}…` : body;

  await db.query(
    'INSERT INTO t_mail (sender_id, recipient_id, subject, body) VALUES ($1, $2, $3, $4)',
    [senderUuid, recipient.avatar_uuid, subject, body]
  );
  return { success: true, recipientName: recipient.avatar_name };
}

export default { getInbox, claimMail, sendMail };
