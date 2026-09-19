// D91 (notifications) + D83/D92 (menu, confirmation citée) — base réelle.
import { test, assert, createAvatar, finish, pool } from './helpers.mjs';
import { processMessage } from '../src/orchestrator/message-handler.js';
import { queueDirect, queueGroup, sendPendingNotifications } from '../src/services/notifications.js';
import { bindMenuMessage } from '../src/services/menus.js';
import { executeCommand } from '../src/services/sys-pipeline.js';
import { createGuild } from '../src/engine/guild.js';
import config from '../src/config.js';

async function pendingMenu(avatarUuid) {
  const r = await pool.query('SELECT context_type, options FROM t_pending_menus WHERE avatar_uuid = $1', [avatarUuid]);
  return r.rows[0] || null;
}

async function giveBoundItem(avatarUuid) {
  const item = (await pool.query("SELECT item_id FROM t_items_dict WHERE item_type = 'ARM' ORDER BY item_id LIMIT 1")).rows[0];
  await pool.query(
    'INSERT INTO t_inventory (avatar_uuid, item_id, quantity, is_bound) VALUES ($1, $2, 1, TRUE)',
    [avatarUuid, item.item_id]
  );
  return item.item_id;
}

async function ownsItem(avatarUuid, itemId) {
  const r = await pool.query('SELECT 1 FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2', [avatarUuid, itemId]);
  return r.rows.length > 0;
}

async function run() {
  console.log('\n🔬 Notifications (D91) · Menu (D83) · Confirmation (D92)\n');
  await pool.query('DELETE FROM t_notifications');

  await test('D91 — un message privé est envoyé au numéro résolu à l\'envoi (N5)', async () => {
    const a = await createAvatar();
    await queueDirect(pool, a.avatar_uuid, 'Bonjour', 'TEST');
    const sent = [];
    const stats = await sendPendingNotifications(pool, async (chatId, body) => { sent.push({ chatId, body }); }, { batchSize: 10 });
    assert(stats.sent === 1, 'attendu 1 envoi : ' + JSON.stringify(stats));
    assert(sent[0].chatId === `${a.whatsapp_phone}@c.us`, 'mauvais destinataire : ' + sent[0].chatId);
    const row = (await pool.query('SELECT sent_at FROM t_notifications WHERE recipient_uuid = $1', [a.avatar_uuid])).rows[0];
    assert(row.sent_at, 'sent_at non renseigné');
  });

  await test('D91 — le débit est plafonné par batchSize (N3)', async () => {
    const a = await createAvatar();
    for (let i = 0; i < 3; i++) await queueDirect(pool, a.avatar_uuid, `m${i}`, 'TEST');
    const stats = await sendPendingNotifications(pool, async () => {}, { batchSize: 1 });
    assert(stats.sent === 1, 'une passe ne doit envoyer qu\'un message : ' + JSON.stringify(stats));
    await sendPendingNotifications(pool, async () => {}, { batchSize: 10 });
  });

  await test('D91 — réessai puis abandon explicite au-delà du maximum (N4)', async () => {
    const a = await createAvatar();
    await queueDirect(pool, a.avatar_uuid, 'KO', 'TEST');
    const boom = async () => { throw new Error('réseau'); };
    const first = await sendPendingNotifications(pool, boom, { batchSize: 10, maxAttempts: 2 });
    assert(first.retried === 1, 'premier échec = réessai : ' + JSON.stringify(first));
    const second = await sendPendingNotifications(pool, boom, { batchSize: 10, maxAttempts: 2 });
    assert(second.failed === 1, 'second échec = abandon : ' + JSON.stringify(second));
    const row = (await pool.query('SELECT failed_at, attempts, last_error FROM t_notifications WHERE recipient_uuid = $1', [a.avatar_uuid])).rows[0];
    assert(row.failed_at && row.attempts === 2 && row.last_error === 'réseau', 'état final incorrect : ' + JSON.stringify(row));
  });

  await test('D91 — un groupe sans identifiant WhatsApp réel échoue explicitement', async () => {
    await pool.query(
      "INSERT INTO t_wa_groups (wa_group_id, group_type, group_name) VALUES ('T61_LOGICAL', 'community_hub', 'test') ON CONFLICT DO NOTHING"
    );
    await queueGroup(pool, 'T61_LOGICAL', 'annonce', 'TEST');
    const stats = await sendPendingNotifications(pool, async () => {}, { batchSize: 10, maxAttempts: 1 });
    assert(stats.failed === 1, 'attendu un abandon : ' + JSON.stringify(stats));
    await pool.query("DELETE FROM t_notifications WHERE wa_group_id = 'T61_LOGICAL'");
    await pool.query("DELETE FROM t_wa_groups WHERE wa_group_id = 'T61_LOGICAL'");
  });

  await test('SYS_NOTIFY_PLAYER — met en file un message privé', async () => {
    const a = await createAvatar();
    const result = await executeCommand(pool, { command: 'SYS_NOTIFY_PLAYER', params: { player_id: a.avatar_uuid, text: 'Salut' } }, 'gm');
    assert(result.ok, result.message);
    const row = (await pool.query('SELECT body FROM t_notifications WHERE recipient_uuid = $1', [a.avatar_uuid])).rows[0];
    assert(row?.body === 'Salut', 'message absent de la file');
  });

  if (config.game.gmPhones.length) {
    await test('GM — !sys_notify (alias) accepte un texte entre guillemets', async () => {
      const a = await createAvatar();
      const r = await processMessage(pool, `!sys_notify player_id=${a.avatar_uuid} text="Bonjour à toi"`, null, null, config.game.gmPhones[0]);
      assert(r.response.startsWith('✅'), r.response);
      const row = (await pool.query('SELECT body FROM t_notifications WHERE recipient_uuid = $1', [a.avatar_uuid])).rows[0];
      assert(row?.body === 'Bonjour à toi', 'texte tronqué : ' + row?.body);
    });
  }

  await test('D92 — jeter un objet lié ouvre une confirmation, sans rien détruire', async () => {
    const a = await createAvatar();
    const itemId = await giveBoundItem(a.avatar_uuid);
    const r = await processMessage(pool, `!jeter ${itemId}`, a.avatar_uuid);
    assert(r.menuShown, 'aucun menu affiché : ' + r.response);
    assert((await pendingMenu(a.avatar_uuid))?.context_type === 'CONFIRM', 'menu CONFIRM absent');
    assert(await ownsItem(a.avatar_uuid, itemId), 'objet détruit avant confirmation');
  });

  await test('D92 amendé — un chiffre nu ne confirme pas', async () => {
    const a = await createAvatar();
    const itemId = await giveBoundItem(a.avatar_uuid);
    await processMessage(pool, `!jeter ${itemId}`, a.avatar_uuid);
    const r = await processMessage(pool, '1', a.avatar_uuid);
    assert(r.response.includes('citant'), 'rappel de citation attendu : ' + r.response);
    assert(await ownsItem(a.avatar_uuid, itemId), 'objet détruit par un chiffre nu');
  });

  await test('D92 — « 1 » en citant le menu détruit l\'objet lié', async () => {
    const a = await createAvatar();
    const itemId = await giveBoundItem(a.avatar_uuid);
    await processMessage(pool, `!jeter ${itemId}`, a.avatar_uuid);
    await bindMenuMessage(pool, a.avatar_uuid, 'WAMSG_1');
    const r = await processMessage(pool, '1', a.avatar_uuid, null, null, { quotedMessageId: 'WAMSG_1' });
    assert(!(await ownsItem(a.avatar_uuid, itemId)), 'objet toujours là : ' + r.response);
    assert(!(await pendingMenu(a.avatar_uuid)), 'menu non consommé (M2)');
  });

  await test('D92 — « 2 » cité annule, l\'objet reste', async () => {
    const a = await createAvatar();
    const itemId = await giveBoundItem(a.avatar_uuid);
    await processMessage(pool, `!jeter ${itemId}`, a.avatar_uuid);
    await bindMenuMessage(pool, a.avatar_uuid, 'WAMSG_2');
    const r = await processMessage(pool, '2', a.avatar_uuid, null, null, { quotedMessageId: 'WAMSG_2' });
    assert(r.response.includes('annulée'), r.response);
    assert(await ownsItem(a.avatar_uuid, itemId), 'objet détruit malgré l\'annulation');
  });

  await test('D92 — toute autre commande annule la confirmation en attente', async () => {
    const a = await createAvatar();
    const itemId = await giveBoundItem(a.avatar_uuid);
    await processMessage(pool, `!jeter ${itemId}`, a.avatar_uuid);
    await bindMenuMessage(pool, a.avatar_uuid, 'WAMSG_3');
    await processMessage(pool, 'statut', a.avatar_uuid);
    assert(!(await pendingMenu(a.avatar_uuid)), 'la confirmation aurait dû être annulée');
    await processMessage(pool, '1', a.avatar_uuid, null, null, { quotedMessageId: 'WAMSG_3' });
    assert(await ownsItem(a.avatar_uuid, itemId), 'une confirmation annulée a été exécutée');
  });

  await test('D92 — une commande tapée à la main ne peut pas se prétendre confirmée', async () => {
    const a = await createAvatar();
    const itemId = await giveBoundItem(a.avatar_uuid);
    await processMessage(pool, `!jeter 1 ${itemId}`, a.avatar_uuid);
    await processMessage(pool, `!jeter 1 ${itemId}`, a.avatar_uuid);
    assert(await ownsItem(a.avatar_uuid, itemId), 'la commande répétée a contourné la confirmation');
  });

  await test('D83 — l\'aide (9) ne consomme pas le menu (M3)', async () => {
    const a = await createAvatar();
    const itemId = await giveBoundItem(a.avatar_uuid);
    await processMessage(pool, `!jeter ${itemId}`, a.avatar_uuid);
    await bindMenuMessage(pool, a.avatar_uuid, 'WAMSG_4');
    const r = await processMessage(pool, '9', a.avatar_uuid, null, null, { quotedMessageId: 'WAMSG_4' });
    assert(r.response.includes('irréversible'), r.response);
    assert(await pendingMenu(a.avatar_uuid), 'l\'aide a consommé le menu');
  });

  await test('D83 — !menu réaffiche le menu actif sans le consommer', async () => {
    const a = await createAvatar();
    const itemId = await giveBoundItem(a.avatar_uuid);
    await processMessage(pool, `!jeter ${itemId}`, a.avatar_uuid);
    const r = await processMessage(pool, '!menu', a.avatar_uuid);
    assert(r.routing.intent === 'MENU' && r.response.includes('Confirmer') && r.menuShown, r.response);
  });

  await test('D92 — housing_leave demande confirmation puis libère le logement', async () => {
    const a = await createAvatar();
    await pool.query(
      `INSERT INTO t_properties (owner_avatar_uuid, property_type, tenure, zone_id, rent_yrds_cycle, paid_until)
       VALUES ($1, 'inn_room', 'rent', 'ZONE_SYL_CAP_001', 50, NOW() + INTERVAL '7 days')`,
      [a.avatar_uuid]
    );
    const ask = await processMessage(pool, '!housing_leave', a.avatar_uuid);
    assert(ask.menuShown, 'pas de confirmation : ' + ask.response);
    await bindMenuMessage(pool, a.avatar_uuid, 'WAMSG_5');
    await processMessage(pool, '1', a.avatar_uuid, null, null, { quotedMessageId: 'WAMSG_5' });
    const left = await pool.query('SELECT 1 FROM t_properties WHERE owner_avatar_uuid = $1', [a.avatar_uuid]);
    assert(left.rows.length === 0, 'logement toujours détenu');
  });

  await test('D92 — dissolution de guilde demande confirmation puis dissout', async () => {
    const a = await createAvatar();
    const created = await createGuild(pool, a.avatar_uuid, `G${a.avatar_name}`.slice(0, 32));
    assert(created.success, 'création de guilde échouée');
    const ask = await processMessage(pool, '!guild disband', a.avatar_uuid);
    assert(ask.menuShown, 'pas de confirmation : ' + ask.response);
    await bindMenuMessage(pool, a.avatar_uuid, 'WAMSG_6');
    await processMessage(pool, '1', a.avatar_uuid, null, null, { quotedMessageId: 'WAMSG_6' });
    const g = await pool.query('SELECT 1 FROM t_guilds WHERE guild_uuid = $1', [created.guildUuid]);
    assert(g.rows.length === 0, 'guilde toujours présente');
  });

  await pool.query('DELETE FROM t_notifications');
  await finish();
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
