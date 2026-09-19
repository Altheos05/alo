// Menu contextuel numéroté (D83, menu_contextuel_protocol.md, T_PENDING_MENUS).
// Couche déterministe pré-NLU : les options sont toujours calculées par le
// moteur (jamais par un LLM), un seul menu actif par avatar (M1).
import { render } from './template.js';

const TTL_SEC = {
  COMBAT: 60,
  DIALOGUE: 300,
  SHOP: 180,
  MOVEMENT: 120,
  QUEST_BOARD: 300,
  FISHING: 120,
  CONFIRM: 60,
};

const DIGIT_RE = /^[0-9]$/;
// Le message-menu n'existe pas encore quand la ligne est écrite : la couche
// WhatsApp lie son identifiant réel après l'envoi (bindMenuMessage).
const UNBOUND = 'UNBOUND';
const HELP_DIGIT = 9;

const HELP_TEXT = {
  CONFIRM: `ℹ️ Cette action est irréversible. Réponds **en citant le menu** : 1 pour confirmer, 2 pour annuler. Toute autre commande l'annule.`,
  FISHING: `ℹ️ Lis la description de la ligne et choisis la réaction qui s'y accorde. Réponds par le chiffre (ou en citant le menu).`,
};

export function formatMenu(menu) {
  const lines = menu.options.map(o => `${o.digit}. ${o.label}`);
  lines.push(`${HELP_DIGIT}. Aide`);
  lines.push(menu.context === 'CONFIRM'
    ? `_Réponds **en citant ce message** par un chiffre._`
    : `_Réponds par un chiffre (ou en citant ce message)._`);
  return lines.join('\n');
}

// Affiche (UPSERT, M1) un menu ; renvoie le bloc texte à ajouter à la réponse.
export async function showMenu(db, avatarUuid, menu) {
  const ttl = TTL_SEC[menu.context];
  await db.query(
    `INSERT INTO t_pending_menus (avatar_uuid, context_type, context_ref, options, wa_message_id, shown_at, expires_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + make_interval(secs => $6))
     ON CONFLICT (avatar_uuid) DO UPDATE
       SET context_type = EXCLUDED.context_type, context_ref = EXCLUDED.context_ref,
           options = EXCLUDED.options, wa_message_id = EXCLUDED.wa_message_id,
           shown_at = EXCLUDED.shown_at, expires_at = EXCLUDED.expires_at`,
    [avatarUuid, menu.context, menu.ref || null, JSON.stringify(menu.options), UNBOUND, ttl]
  );
  return formatMenu(menu);
}

export async function bindMenuMessage(db, avatarUuid, waMessageId) {
  await db.query(
    'UPDATE t_pending_menus SET wa_message_id = $2 WHERE avatar_uuid = $1',
    [avatarUuid, waMessageId]
  );
}

async function getActiveMenu(db, avatarUuid) {
  const result = await db.query(
    `SELECT context_type, context_ref, options, wa_message_id
     FROM t_pending_menus WHERE avatar_uuid = $1 AND expires_at > NOW()`,
    [avatarUuid]
  );
  const row = result.rows[0];
  return row ? { context: row.context_type, ref: row.context_ref, options: row.options, waMessageId: row.wa_message_id } : null;
}

async function consumeMenu(db, avatarUuid) {
  await db.query('DELETE FROM t_pending_menus WHERE avatar_uuid = $1', [avatarUuid]);
}

// §2.2 : résolution d'un message comme réponse de menu. Renvoie null si le
// message n'est pas une réponse de menu (il repart alors dans le pipeline).
//   { kind: 'command', command, confirmed } — commande à réinjecter
//   { kind: 'text', text }                  — réponse directe (aide, annulation, rappel)
export async function resolveMenuReply(db, avatarUuid, text, quotedMessageId = null) {
  const body = (text || '').trim();
  if (!DIGIT_RE.test(body)) return null;

  const menu = await getActiveMenu(db, avatarUuid);
  if (!menu) return null;

  const quoted = !!quotedMessageId && quotedMessageId === menu.waMessageId;
  // D92 amendé : en CONFIRM, seule la citation vaut — un chiffre nu est ignoré.
  if (menu.context === 'CONFIRM' && !quoted) {
    return { kind: 'text', text: `⚠️ Pour une action irréversible, réponds **en citant le menu de confirmation** (1 confirmer · 2 annuler).` };
  }

  const digit = parseInt(body, 10);
  // M3 : l'aide ne consomme pas le menu.
  if (digit === HELP_DIGIT) {
    return { kind: 'text', text: HELP_TEXT[menu.context] || render('help') };
  }

  const option = menu.options.find(o => o.digit === digit);
  if (!option) return null;

  // M2 : consommation à usage unique, avant exécution (évite le double envoi).
  await consumeMenu(db, avatarUuid);
  if (!option.command) return { kind: 'text', text: '❎ Action annulée.' };
  return { kind: 'command', command: option.command, confirmed: option.confirmed === true, context: menu.context, ref: menu.ref };
}

// D92 : « toute autre commande l'annule ».
export async function cancelPendingConfirmation(db, avatarUuid) {
  await db.query(
    "DELETE FROM t_pending_menus WHERE avatar_uuid = $1 AND context_type = 'CONFIRM'",
    [avatarUuid]
  );
}

// !menu : réaffiche le menu actif sans prolonger son échéance (M4).
export async function redisplayMenu(db, avatarUuid) {
  const menu = await getActiveMenu(db, avatarUuid);
  if (!menu) return null;
  await bindMenuMessage(db, avatarUuid, UNBOUND);
  return formatMenu(menu);
}

// Gabarit CONFIRM (D92, §7) : 1 confirmer (réexécute la commande avec
// confirmed=true, prérequis revérifiés sous verrou par le moteur) · 2 annuler.
export function confirmationMenu(command, ref = null) {
  return {
    context: 'CONFIRM',
    ref,
    options: [
      { digit: 1, label: 'Confirmer', command, confirmed: true },
      { digit: 2, label: 'Annuler', command: null },
    ],
  };
}

export default { formatMenu, showMenu, bindMenuMessage, resolveMenuReply, cancelPendingConfirmation, redisplayMenu, confirmationMenu };
