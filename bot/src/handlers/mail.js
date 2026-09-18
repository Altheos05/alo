import { getInbox, claimMail, sendMail } from '../engine/mail.js';
import { getPlayer } from '../services/player.js';
import { render } from '../services/template.js';
import { menuRow, overflowLine, MAX_CARD_ROWS } from '../services/cardRenderer.js';

const SEND_RE = /(?:mail|courrier)\s+(?:envoyer|envoie|send)\s+(\d{8,15})\s+(.+)/i;
const READ_RE = /(?:mail|courrier)\s+(?:lire|lis|read)\s+(\d+)/i;

export async function handleMail(db, playerId, raw = '') {
  const player = await getPlayer(db, playerId);
  if (!player) return render('error');

  const sendMatch = raw.match(SEND_RE);
  if (sendMatch) {
    const [, phone, body] = sendMatch;
    const result = await sendMail(db, playerId, phone, body.trim());
    if (!result.success) {
      return result.error === 'RECIPIENT_NOT_FOUND'
        ? `❌ Aucun joueur trouvé avec ce numéro.`
        : render('error');
    }
    return `📫 Courrier envoyé à **${result.recipientName}**.`;
  }

  const readMatch = raw.match(READ_RE);
  if (readMatch) {
    const inbox = await getInbox(db, playerId);
    const index = parseInt(readMatch[1], 10) - 1;
    const target = inbox[index];
    if (!target) return `❌ Pas de courrier n°${readMatch[1]}.`;

    const result = await claimMail(db, playerId, target.mail_id);
    if (!result.success) return `❌ Ce courrier a déjà été récupéré.`;

    const m = result.mail;
    let text = `📬 **${target.sender_name}** : "${m.subject}"\n${m.body}`;
    if (m.attached_yrds > 0) text += `\n💰 +${m.attached_yrds} Yrds récupérés`;
    if (m.attached_item) text += `\n🎁 +${m.attached_qty}× ${m.attached_item} récupéré(s)`;
    return text;
  }

  const inbox = await getInbox(db, playerId);
  if (inbox.length === 0) {
    return `📭 Ta boîte aux lettres est vide.`;
  }

  const lines = inbox.map((m, idx) =>
    `${idx + 1}. ${m.status === 'unread' ? '🔵' : '⚪'} **${m.sender_name}** — ${m.subject}`
  );
  const text = `📬 **Courrier** (${inbox.length})\n${lines.join('\n')}\n\nTape "mail lire [numéro]" pour ouvrir.`;

  const rows = inbox.slice(0, MAX_CARD_ROWS)
    .map((m, idx) => menuRow(idx + 1, m.sender_name, m.status === 'unread' ? 'Non lu' : 'Lu'))
    .join('');
  const overflow = overflowLine(inbox.length, 'autres messages');

  return {
    text,
    card: {
      template: 'courrier',
      variables: { mailCount: inbox.length, itemsHtml: rows + overflow },
    },
  };
}

export default { handleMail };
