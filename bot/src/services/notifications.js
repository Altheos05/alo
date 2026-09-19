// File des messages sortants (D91, notifications_protocol.md, T_NOTIFICATIONS).
// Les moteurs insèrent dans la file DANS leur propre transaction : la
// notification naît ou meurt avec la mutation qui la déclenche. Seule la
// boucle d'envoi, démarrée par la couche WhatsApp, parle à WhatsApp.
import logger from '../utils/logger.js';
import config from '../config.js';
import { getGroupForZone } from './zone-groups.js';

export async function queueDirect(db, recipientUuid, body, eventType) {
  await db.query(
    `INSERT INTO t_notifications (channel, recipient_uuid, body, event_type)
     VALUES ('dm', $1, $2, $3)`,
    [recipientUuid, body, eventType]
  );
}

export async function queueGroup(db, waGroupId, body, eventType) {
  await db.query(
    `INSERT INTO t_notifications (channel, wa_group_id, body, event_type)
     VALUES ('group', $1, $2, $3)`,
    [waGroupId, body, eventType]
  );
}

// N2 : événement collectif ⇒ groupe du territoire de la zone (D76).
export async function queueZone(db, zoneId, body, eventType) {
  const group = getGroupForZone(zoneId);
  if (!group) return { success: false, error: 'NO_TERRITORY_GROUP' };
  await queueGroup(db, group.groupId, body, eventType);
  return { success: true, groupId: group.groupId };
}

// N2 : annonce mondiale ⇒ une ligne par groupe communautaire, éclatée à l'insertion.
export async function queueGlobal(db, body, eventType) {
  const groups = await db.query(
    "SELECT wa_group_id FROM t_wa_groups WHERE group_type = 'community_hub' AND is_active = TRUE"
  );
  for (const g of groups.rows) {
    await queueGroup(db, g.wa_group_id, body, eventType);
  }
  return { success: true, groups: groups.rows.length };
}

// Une passe de la boucle d'envoi. sendFn(chatId, body) est l'unique point de
// contact avec WhatsApp — injecté pour que la file reste testable sans client.
export async function sendPendingNotifications(db, sendFn, {
  batchSize = config.notifications.batchSize,
  maxAttempts = config.notifications.maxAttempts,
} = {}) {
  const client = await db.connect();
  const stats = { sent: 0, retried: 0, failed: 0 };
  try {
    await client.query('BEGIN');
    // N5 : numéro résolu au moment de l'envoi, pas à l'insertion.
    const pending = await client.query(
      `SELECT n.notification_uuid, n.channel, n.wa_group_id, n.body, n.attempts, a.whatsapp_phone
       FROM t_notifications n
       LEFT JOIN t_avatars a ON a.avatar_uuid = n.recipient_uuid
       WHERE n.sent_at IS NULL AND n.failed_at IS NULL
       ORDER BY n.created_at
       LIMIT $1
       FOR UPDATE OF n SKIP LOCKED`,
      [batchSize]
    );

    for (const n of pending.rows) {
      try {
        const chatId = n.channel === 'dm' ? `${n.whatsapp_phone}@c.us` : n.wa_group_id;
        // Un wa_group_id qui n'est pas un identifiant WhatsApp réel (seed logique
        // type WA_HUB_*) ne peut pas être envoyé : échec explicite, pas silencieux.
        if (!chatId.includes('@')) throw new Error(`Identifiant WhatsApp non résolu : ${chatId}`);
        await sendFn(chatId, n.body);
        await client.query('UPDATE t_notifications SET sent_at = NOW(), attempts = attempts + 1 WHERE notification_uuid = $1', [n.notification_uuid]);
        stats.sent++;
      } catch (err) {
        const exhausted = n.attempts + 1 >= maxAttempts;
        await client.query(
          `UPDATE t_notifications
           SET attempts = attempts + 1, last_error = $2, failed_at = CASE WHEN $3 THEN NOW() ELSE NULL END
           WHERE notification_uuid = $1`,
          [n.notification_uuid, err.message, exhausted]
        );
        if (exhausted) {
          stats.failed++;
          logger.error('Notification abandonnée', { notification: n.notification_uuid, error: err.message });
        } else {
          stats.retried++;
          logger.warn('Notification en échec, réessai prévu', { notification: n.notification_uuid, error: err.message });
        }
      }
    }

    await client.query('COMMIT');
    return stats;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur de la boucle de notifications', { error: err.message });
    return stats;
  } finally {
    client.release();
  }
}

// N3 : débit plafonné (batchSize messages toutes les intervalMs), jamais en rafale.
export function startNotificationSender(db, sendFn) {
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await sendPendingNotifications(db, sendFn);
    } catch (err) {
      // Pool indisponible : la passe suivante réessaiera ; ne jamais laisser le rejet tuer le process.
      logger.error('Passe de notifications impossible', { error: err.message });
    } finally {
      running = false;
    }
  }, config.notifications.intervalMs);
  logger.info('Boucle de notifications démarrée', config.notifications);
  return () => clearInterval(timer);
}

export async function getQueueSummary(db) {
  const result = await db.query(
    `SELECT COUNT(*) FILTER (WHERE sent_at IS NULL AND failed_at IS NULL) AS pending,
            COUNT(*) FILTER (WHERE failed_at IS NOT NULL) AS failed,
            COUNT(*) FILTER (WHERE sent_at IS NOT NULL) AS sent
     FROM t_notifications`
  );
  return result.rows[0];
}

export default { queueDirect, queueGroup, queueZone, queueGlobal, sendPendingNotifications, startNotificationSender, getQueueSummary };
