import ww from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const { Client, LocalAuth, MessageMedia } = ww;
import logger from '../utils/logger.js';
import config from '../config.js';
import { processMessage } from '../orchestrator/message-handler.js';
import { renderCard } from './cardRenderer.js';
import pool from '../db/pool.js';

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

  client.on('ready', () => {
    logger.info('WhatsApp client connecté');
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
    const phoneNumber = msg.from.replace('@c.us', '').replace('@g.us', '');

    logger.debug('Message WhatsApp reçu', {
      from: phoneNumber,
      text: text.slice(0, 80),
      group: !!groupId,
    });

    try {
      const result = await processMessage(pool, text, null, groupId, phoneNumber);
      const reply = result.response;

      let sentAsCard = false;
      if (result.card) {
        const buffer = await renderCard(client, result.card.template, result.card.variables);
        if (buffer) {
          const media = new MessageMedia('image/png', buffer.toString('base64'), `${result.card.template}.png`);
          await msg.reply(media, undefined, { caption: reply });
          sentAsCard = true;
        } else {
          logger.warn('Carte non rendue — repli sur le texte', { template: result.card.template });
        }
      }

      if (!sentAsCard && reply) await msg.reply(reply);
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
