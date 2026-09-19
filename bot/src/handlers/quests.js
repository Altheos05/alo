import { getQuestBoard, acceptQuest, turnInQuest } from '../engine/quests.js';
import { getPlayer, getPlayerQuests } from '../services/player.js';
import { render } from '../services/template.js';
import { menuRow, overflowLine, MAX_CARD_ROWS } from '../services/cardRenderer.js';

const BOARD_RE = /quest_board|quêtes?_disponibles|tableau de quêtes/i;
const ACCEPT_RE = /quest_accept\s+(.+)|accepter\s+(?:la\s+quête\s+)?(.+)/i;
const TURNIN_RE = /quest_turnin\s+(.+)|rendre\s+(?:la\s+quête\s+)?(.+)/i;

export async function handleQuestBoard(db, playerId) {
  const player = await getPlayer(db, playerId);
  if (!player) return render('error');

  const quests = await getQuestBoard(db, player.current_zone_id, player.level, playerId);
  if (quests.length === 0) {
    return `📜 Aucune quête disponible pour toi à ${player.zone_name} pour l'instant.`;
  }

  const lines = quests.map((q, idx) =>
    `${idx + 1}. **${q.title}** (${q.quest_type}, niv. ${q.min_level}+) — ${q.reward_xp} XP, ${q.reward_yrds} Yrds`
  );
  const text = `📜 **Tableau des quêtes — ${player.zone_name}**\n${lines.join('\n')}\n\nTape "accepter [nom]" pour en prendre une.`;

  const rows = quests.slice(0, MAX_CARD_ROWS)
    .map((q, idx) => menuRow(idx + 1, q.title, `niv. ${q.min_level}+`))
    .join('');
  const overflow = overflowLine(quests.length, 'autres quêtes');

  const menu = {
    context: 'QUEST_BOARD',
    ref: player.current_zone_id,
    options: quests.slice(0, MAX_CARD_ROWS).map((q, idx) => ({
      digit: idx + 1, label: q.title, command: `!quest_accept ${q.quest_id}`,
    })),
  };

  return {
    text,
    menu,
    card: { template: 'quete_tableau', variables: { zoneName: player.zone_name, questCount: quests.length, itemsHtml: rows + overflow } },
  };
}

export async function handleQuestAccept(db, playerId, raw = '') {
  const match = raw.match(ACCEPT_RE);
  const name = match?.[1] || match?.[2];
  if (!name) return `📜 Quelle quête veux-tu accepter ? Ex. : "accepter Chasse au Loup".`;

  const result = await acceptQuest(db, playerId, name.trim());
  if (!result.success) {
    const messages = {
      QUEST_NOT_FOUND: `❌ Aucune quête ne correspond à "${name.trim()}".`,
      LEVEL_TOO_LOW: `❌ Niveau ${result.required} requis.`,
      ALREADY_ACTIVE: `❌ Tu as déjà cette quête en cours.`,
      ALREADY_COMPLETED: `❌ Tu as déjà terminé cette quête (non répétable).`,
      QUEST_CAP_REACHED: `❌ Tu as déjà 10 quêtes actives — termine ou abandonne-en une d'abord.`,
    };
    return messages[result.error] || `❌ Impossible d'accepter cette quête.`;
  }
  return `📜 Quête acceptée : **${result.title}** (${result.totalSteps} étape${result.totalSteps > 1 ? 's' : ''}).`;
}

export async function handleQuestTurnin(db, playerId, raw = '') {
  const match = raw.match(TURNIN_RE);
  const name = match?.[1] || match?.[2];
  if (!name) return `📜 Quelle quête veux-tu rendre ? Ex. : "rendre Chasse au Loup".`;

  const result = await turnInQuest(db, playerId, name.trim());
  if (!result.success) {
    const messages = {
      NOT_ACTIVE: `❌ Tu n'as pas cette quête en cours.`,
      NOT_READY: `❌ Étape ${result.current}/${result.total} — pas encore terminée.`,
    };
    return messages[result.error] || `❌ Impossible de rendre cette quête.`;
  }
  let text = `🎉 Quête terminée : **${result.title}** — +${result.xp} XP, +${result.yrds} Yrds`;
  if (result.items.length > 0) {
    text += `\n🎁 ${result.items.map((i) => `${i.quantity || 1}× ${i.item_id}`).join(', ')}`;
  }
  return text;
}

export async function handleQuests(db, playerId, raw = '') {
  if (BOARD_RE.test(raw)) return handleQuestBoard(db, playerId);
  if (ACCEPT_RE.test(raw)) return handleQuestAccept(db, playerId, raw);
  if (TURNIN_RE.test(raw)) return handleQuestTurnin(db, playerId, raw);

  const quests = await getPlayerQuests(db, playerId);
  if (quests.length === 0) {
    return `📜 Tu n'as aucune quête active. Tape "quest_board" pour en trouver une.`;
  }

  const text = quests.map((q) =>
    render('quest_progress', {
      questTitle: q.title,
      progress: q.current_step,
      total: q.total_steps,
      stepDescription: q.description?.slice(0, 100) || '',
    })
  ).join('\n━━━━━━━━━━━━━━━━\n');

  const rows = quests.slice(0, MAX_CARD_ROWS)
    .map((q, idx) => menuRow(idx + 1, q.title, `${q.current_step}/${q.total_steps}`))
    .join('');

  return {
    text,
    card: { template: 'quetes', variables: { questCount: quests.length, questsHtml: rows } },
  };
}

export default { handleQuests, handleQuestBoard, handleQuestAccept, handleQuestTurnin };
