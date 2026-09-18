import { getUnlockedAchievements, getRankings } from '../engine/achievements.js';
import { menuRow, overflowLine, MAX_CARD_ROWS } from '../services/cardRenderer.js';

const RARITY_ICON = { common: '🥉', rare: '🥈', epic: '🥇', legendary: '💎' };

export async function handleAchievements(db, playerId) {
  const achievements = await getUnlockedAchievements(db, playerId);
  if (achievements.length === 0) {
    return `🏆 Aucun haut-fait débloqué pour l'instant.`;
  }

  const lines = achievements.map((a, idx) =>
    `${idx + 1}. ${RARITY_ICON[a.rarity] || '🏅'} **${a.name}** — ${a.description}`
  );
  const text = `🏆 **Hauts-faits** (${achievements.length})\n${lines.join('\n')}`;

  const rows = achievements.slice(0, MAX_CARD_ROWS)
    .map((a, idx) => menuRow(idx + 1, a.name, a.rarity))
    .join('');
  const overflow = overflowLine(achievements.length, 'autres hauts-faits');

  return {
    text,
    card: {
      template: 'succes',
      variables: { achievementCount: achievements.length, itemsHtml: rows + overflow },
    },
  };
}

export async function handleRankings(db, playerId, raw = '') {
  const sortBy = /niveau|level/i.test(raw) ? 'level' : 'yrds';
  const { label, rows } = await getRankings(db, sortBy);

  if (rows.length === 0) return `🏆 Aucun classement disponible.`;

  const lines = rows.map((r, idx) => `${idx + 1}. **${r.avatar_name}** — ${r.value} ${label}`);
  const text = `🏆 **Classement par ${label}**\n${lines.join('\n')}`;

  const cardRows = rows
    .map((r, idx) => menuRow(idx + 1, r.avatar_name, `${r.value} ${label}`))
    .join('');

  return {
    text,
    card: {
      template: 'classement',
      variables: { rankingLabel: label, itemsHtml: cardRows },
    },
  };
}

export default { handleAchievements, handleRankings };
