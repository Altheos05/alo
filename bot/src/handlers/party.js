import { getPartyForAvatar, getPartyMembers, createParty, inviteToParty, leaveParty } from '../engine/party.js';
import { menuRow } from '../services/cardRenderer.js';

const CREATE_RE = /cr[ée]e|create/i;
const INVITE_RE = /invite?r?\s+(\d{8,15})/i;
const LEAVE_RE = /quitte|leave|d[ée]part/i;

export async function handlePartyCommand(db, playerId, raw = '') {
  if (CREATE_RE.test(raw)) {
    const result = await createParty(db, playerId);
    if (!result.success) {
      return result.error === 'ALREADY_IN_PARTY' ? `❌ Tu es déjà dans un groupe.` : `❌ Impossible de créer le groupe.`;
    }
    return `🤝 Groupe créé. Tu en es le chef.`;
  }

  const inviteMatch = raw.match(INVITE_RE);
  if (inviteMatch) {
    const result = await inviteToParty(db, playerId, inviteMatch[1]);
    if (!result.success) {
      const messages = {
        NOT_IN_PARTY: `❌ Tu n'as pas de groupe. Tape "groupe créer" d'abord.`,
        NOT_LEADER: `❌ Seul le chef du groupe peut inviter.`,
        RECIPIENT_NOT_FOUND: `❌ Aucun joueur trouvé avec ce numéro.`,
        RECIPIENT_ALREADY_IN_PARTY: `❌ Ce joueur est déjà dans un groupe.`,
        PARTY_FULL: `❌ Le groupe est complet.`,
      };
      return messages[result.error] || `❌ Invitation impossible.`;
    }
    return `🤝 **${result.recipientName}** a rejoint le groupe.`;
  }

  if (LEAVE_RE.test(raw)) {
    const result = await leaveParty(db, playerId);
    return result.success ? `🤝 Tu as quitté le groupe.` : `❌ Tu n'as pas de groupe à quitter.`;
  }

  const party = await getPartyForAvatar(db, playerId);
  if (!party) return `🤝 Tu n'as pas de groupe. Tape "groupe créer" pour en fonder un.`;

  const members = await getPartyMembers(db, party.party_id);
  const lines = members.map((m, idx) => `${idx + 1}. **${m.avatar_name}**${m.role === 'leader' ? ' (chef)' : ''}`);
  const text = `🤝 **${party.name || 'Groupe'}** (${members.length}/${party.max_members})\n${lines.join('\n')}`;

  const rows = members
    .map((m, idx) => menuRow(idx + 1, m.avatar_name, m.role === 'leader' ? 'Chef' : 'Membre'))
    .join('');

  return {
    text,
    card: {
      template: 'groupe',
      variables: { memberCount: members.length, maxMembers: party.max_members, itemsHtml: rows },
    },
  };
}

export default { handlePartyCommand };
