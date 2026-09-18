import { getRaceRelations } from '../engine/diplomacy.js';
import { getPlayer } from '../services/player.js';
import { menuRow } from '../services/cardRenderer.js';

const STATUS_LABELS = {
  neutral: 'Neutre', allied: 'Alliée', at_war: 'En guerre', truce: 'Trêve', vassalized: 'Vassalisée',
};

export async function handleDiplomacy(db, playerId) {
  const player = await getPlayer(db, playerId);
  if (!player) return `❌ Impossible de déterminer ta race.`;

  const relations = await getRaceRelations(db, player.race_id);
  if (relations.length === 0) {
    return `🏰 Aucune relation diplomatique enregistrée pour ${player.race_name} pour l'instant.`;
  }

  const lines = relations.map((r) => `**${r.other_race_name}** — ${STATUS_LABELS[r.status] || r.status}`);
  const text = `🏰 **Diplomatie — ${player.race_name}**\n${lines.join('\n')}`;

  const rows = relations
    .map((r, idx) => menuRow(idx + 1, r.other_race_name, STATUS_LABELS[r.status] || r.status))
    .join('');

  return {
    text,
    card: {
      template: 'diplomatie',
      variables: { raceLabel: player.race_name, itemsHtml: rows },
    },
  };
}

export default { handleDiplomacy };
