import { getPlayer, getPlayerInventory, getPlayerQuests } from '../services/player.js';
import { render } from '../services/template.js';
import { menuRow, pct, overflowLine, MAX_CARD_ROWS } from '../services/cardRenderer.js';

export async function handleStatus(db, playerId) {
  const player = await getPlayer(db, playerId);
  if (!player) return render('error');

  const text = render('status', {
    playerName: player.avatar_name,
    hp: player.hp_current,
    hpMax: player.hp_max,
    mp: player.mp_current,
    mpMax: player.mp_max,
    zoneName: player.zone_name,
    level: player.level,
    race: player.race_name,
    yrds: player.yrd_balance,
  });

  return {
    text,
    card: {
      template: 'personnage',
      variables: {
        playerName: player.avatar_name,
        level: player.level,
        race: player.race_name,
        zoneName: player.zone_name,
        hp: player.hp_current,
        hpMax: player.hp_max,
        hpPercent: pct(player.hp_current, player.hp_max),
        mp: player.mp_current,
        mpMax: player.mp_max,
        mpPercent: pct(player.mp_current, player.mp_max),
        yrds: player.yrd_balance,
      },
    },
  };
}

export async function handleInventory(db, playerId) {
  const [items, player] = await Promise.all([
    getPlayerInventory(db, playerId),
    getPlayer(db, playerId),
  ]);
  const playerName = player?.avatar_name || 'inconnu';

  if (items.length === 0) return render('inventory_empty', { playerName });

  const itemLines = items.map(i => {
    const line = `• **${i.name}** (${i.item_id}) ×${i.quantity}`;
    return i.item_type === 'WPN' || i.item_type === 'ARM'
      ? `${line} — ⚔️ ${i.tier ? `T${i.tier}` : ''} ${i.rarity}`
      : line;
  });

  const text = render('inventory', {
    playerName,
    items: itemLines.join('\n'),
  });

  const rows = items.slice(0, MAX_CARD_ROWS)
    .map((i, idx) => menuRow(idx + 1, i.name, `×${i.quantity}`))
    .join('');
  const overflow = overflowLine(items.length, 'autres objets');

  return {
    text,
    card: {
      template: 'inventaire',
      variables: { playerName, itemCount: items.length, itemsHtml: rows + overflow },
    },
  };
}

export async function handleQuests(db, playerId) {
  const quests = await getPlayerQuests(db, playerId);
  if (quests.length === 0) {
    return `📜 Tu n'as aucune quête active. Rends-toi chez un PNJ pour en obtenir.`;
  }

  const text = quests.map(q =>
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
    card: {
      template: 'quetes',
      variables: { questCount: quests.length, questsHtml: rows },
    },
  };
}

export default { handleStatus, handleInventory, handleQuests };
