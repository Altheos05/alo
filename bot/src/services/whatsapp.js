import ww from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const { Client, LocalAuth, MessageMedia } = ww;
import logger from '../utils/logger.js';
import config from '../config.js';
import { processMessage } from '../orchestrator/message-handler.js';
import { renderCard } from './cardRenderer.js';
import pool from '../db/pool.js';
import { bindMenuMessage } from './menus.js';
import { startNotificationSender } from './notifications.js';

let client = null;

export async function initWhatsApp() {
  if (config.env === 'test') {
    logger.info('Mode test — WhatsApp désactivé');
    return null;
  }

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: config.wa.sessionPath }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
      ],
    },
  });

  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    logger.info('QR Code WhatsApp généré — scanne avec WhatsApp');
  });

  let stopNotifications = null;
  client.on('ready', () => {
    logger.info('WhatsApp client connecté');
    // D91 : seule la couche WhatsApp émet ; la boucle vide la file à débit plafonné.
    if (!stopNotifications) {
      stopNotifications = startNotificationSender(pool, (chatId, body) => client.sendMessage(chatId, body));
    }
  });

  client.on('authenticated', () => {
    logger.info('WhatsApp authentifié');
  });

  client.on('auth_failure', (msg) => {
    logger.error('WhatsApp échec d\'authentification', { message: msg });
  });

  client.on('message', async (msg) => {
    if (msg.from === 'status@broadcast' || msg.isStatus) return;
    if (msg.type !== 'chat' && msg.type !== 'extended_text') return;

    const text = msg.body?.trim();
    if (!text) return;

    const groupId = msg.from.endsWith('@g.us') ? msg.from : null;
    // En groupe, msg.from est l'identifiant du GROUPE : l'expéditeur réel est
    // msg.author. Sans cela, tout joueur d'un groupe était résolu par l'id du groupe.
    const sender = groupId ? (msg.author || '') : msg.from;
    const phoneNumber = sender.replace(/@.*$/, '');

    let quotedMessageId = null;
    if (msg.hasQuotedMsg) {
      const quoted = await msg.getQuotedMessage().catch(() => null);
      quotedMessageId = quoted?.id?._serialized || null;
    }

    logger.debug('Message WhatsApp reçu', {
      from: phoneNumber,
      text: text.slice(0, 80),
      group: !!groupId,
    });

    try {
      const result = await processMessage(pool, text, null, groupId, phoneNumber, { quotedMessageId });
      const reply = result.response;

      let sent = null;
      if (result.card) {
        const buffer = await renderCard(client, result.card.template, result.card.variables);
        if (buffer) {
          const media = new MessageMedia('image/png', buffer.toString('base64'), `${result.card.template}.png`);
          sent = await msg.reply(media, undefined, { caption: reply });
        } else {
          logger.warn('Carte non rendue — repli sur le texte', { template: result.card.template });
        }
      }

      if (!sent && reply) sent = await msg.reply(reply);
      // D83 : le message envoyé devient la référence de citation du menu.
      if (result.menuShown && sent?.id?._serialized) {
        await bindMenuMessage(pool, result.playerId, sent.id._serialized);
      }
    } catch (err) {
      logger.error('Erreur traitement message WhatsApp', { error: err.message });
      await msg.reply('❌ Une erreur est survenue. Réessaie plus tard.');
    }
  });

  client.on('message_create', async (msg) => {
    if (msg.fromMe && msg.type === 'chat') {
      logger.debug('Message sortant', { text: msg.body?.slice(0, 80) });
    }
  });

  client.on('disconnected', (reason) => {
    logger.warn('WhatsApp déconnecté', { reason });
  });

  try {
    await client.initialize();
    logger.info('WhatsApp initialisé');
  } catch (err) {
    logger.error('Échec initialisation WhatsApp', { error: err.message });
    throw err;
  }

  return client;
}

export function getClient() {
  return client;
}

export default { initWhatsApp, getClient };
