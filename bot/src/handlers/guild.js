import { getGuildForAvatar, getGuildMembers, createGuild, leaveGuild, disbandGuild } from '../engine/guild.js';
import { menuRow } from '../services/cardRenderer.js';
import { confirmationMenu } from '../services/menus.js';

const CREATE_RE = /(?:guilde?|guild)\s+(?:cr[ée]e|create)\s+(.+)/i;
const LEAVE_RE = /quitte|leave/i;
const DISBAND_RE = /dissoud|disband/i;

export async function handleGuildCommand(db, playerId, raw = '', { confirmed = false } = {}) {
  const createMatch = raw.match(CREATE_RE);
  if (createMatch) {
    const name = createMatch[1].trim();
    const result = await createGuild(db, playerId, name);
    if (!result.success) {
      const messages = {
        ALREADY_IN_GUILD: `❌ Tu es déjà dans une guilde (une seule à la fois).`,
        NAME_TAKEN: `❌ Ce nom de guilde est déjà pris.`,
      };
      return messages[result.error] || `❌ Impossible de créer la guilde.`;
    }
    return `🛡️ Guilde **${name}** fondée. Tu en es le chef.`;
  }

  if (DISBAND_RE.test(raw)) {
    // D92 : dissolution ⇒ confirmation citée ; disbandGuild revérifie sous verrou.
    if (!confirmed) {
      const guild = await getGuildForAvatar(db, playerId);
      if (!guild) return `❌ Tu n'as pas de guilde.`;
      if (!guild.is_leader) return `❌ Seul le chef peut dissoudre la guilde.`;
      return {
        text: `⚠️ Tu vas **dissoudre** la guilde **${guild.guild_name}** : tous les membres la perdent, définitivement.`,
        menu: confirmationMenu('!guild_disband', guild.guild_uuid),
      };
    }
    const result = await disbandGuild(db, playerId);
    if (!result.success) {
      return result.error === 'NOT_LEADER' ? `❌ Seul le chef peut dissoudre la guilde.` : `❌ Tu n'as pas de guilde.`;
    }
    return `🛡️ Guilde dissoute.`;
  }

  if (LEAVE_RE.test(raw)) {
    const result = await leaveGuild(db, playerId);
    if (!result.success) {
      return result.error === 'LEADER_CANNOT_LEAVE' ? `❌ Le chef doit dissoudre ou transmettre la guilde avant de partir.` : `❌ Tu n'as pas de guilde.`;
    }
    return `🛡️ Tu as quitté la guilde.`;
  }

  const guild = await getGuildForAvatar(db, playerId);
  if (!guild) return `🛡️ Tu n'as pas de guilde. Tape "guilde créer [Nom]" pour en fonder une.`;

  const members = await getGuildMembers(db, guild.guild_uuid);
  const lines = members.map((m, idx) => `${idx + 1}. **${m.avatar_name}** (${m.rank})`);
  const text = `🛡️ **${guild.guild_name}**${guild.guild_tag ? ` [${guild.guild_tag}]` : ''} — Niv. ${guild.guild_level}\n`
    + `💰 Trésorerie : ${guild.treasury_yrds} Yrds | 👥 ${members.length} membres\n${lines.join('\n')}`;

  const rows = members.map((m, idx) => menuRow(idx + 1, m.avatar_name, m.rank)).join('');

  return {
    text,
    card: {
      template: 'guilde',
      variables: {
        guildName: guild.guild_name,
        guildTag: guild.guild_tag || '',
        guildLevel: guild.guild_level,
        treasury: guild.treasury_yrds,
        memberCount: members.length,
        itemsHtml: rows,
      },
    },
  };
}

export default { handleGuildCommand };
