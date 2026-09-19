import { buyItem, sellItem, getShopInventory } from '../engine/economy.js';
import { getPlayer } from '../services/player.js';
import { render } from '../services/template.js';
import { menuRow, overflowLine, MAX_CARD_ROWS } from '../services/cardRenderer.js';
import logger from '../utils/logger.js';

export async function handleShopList(db, playerId) {
  const player = await getPlayer(db, playerId);
  if (!player) return render('error');

  const items = await getShopInventory(db, player.current_zone_id);
  if (items.length === 0) return render('shop_list_empty', { zoneName: player.zone_name });

  const lines = items.map(i =>
    `• **${i.item_name}** — ${i.price} Yrds${i.stock >= 0 ? ` (stock: ${i.stock})` : ''} — ${i.npc_name}`
  );
  const text = render('shop_list', { zoneName: player.zone_name, shopLines: lines.join('\n') });

  const rows = items.slice(0, MAX_CARD_ROWS)
    .map((i, idx) => menuRow(idx + 1, i.item_name, `${i.price} Y · ${i.npc_name}`))
    .join('');
  const overflow = overflowLine(items.length, 'autres articles');

  // D83 §3.3 : les 8 premiers articles, achetables d'un chiffre (pagination « 0 » non construite).
  const menu = {
    context: 'SHOP',
    ref: player.current_zone_id,
    options: items.slice(0, MAX_CARD_ROWS).map((i, idx) => ({
      digit: idx + 1, label: `${i.item_name} — ${i.price} Y`, command: `!buy ${i.item_id}`,
    })),
  };

  return {
    text,
    menu,
    card: {
      template: 'boutique',
      variables: { zoneName: player.zone_name, itemCount: items.length, itemsHtml: rows + overflow },
    },
  };
}

export async function handleBuy(db, playerId, entities) {
  const player = await getPlayer(db, playerId);
  if (!player) return render('error');

  if (!entities.itemId) {
    return render('buy_fail_notfound', { itemName: entities.keyword || 'objet inconnu' });
  }
  const qty = entities.quantity || 1;

  const result = await buyItem(db, playerId, entities.itemId, qty);
  if (!result.success) {
    if (result.error === 'INSUFFICIENT_FUNDS') {
      return render('buy_fail_insufficient', { required: result.required, available: result.available });
    }
    if (result.error === 'ITEM_NOT_FOUND') {
      return render('buy_fail_notfound', { itemName: entities.itemId });
    }
    if (result.error === 'INVENTORY_FULL') {
      return `❌ Inventaire plein : fais de la place (coffre, vente) avant d'acheter.`;
    }
    if (result.error === 'NOT_SOLD_HERE') {
      return `❌ Aucune boutique ne vend **${result.item.name}** ici (ou stock épuisé). "!shop_list" pour l'offre de la zone.`;
    }
    return render('error');
  }

  return render('buy_success', {
    quantity: qty,
    itemName: result.item.name,
    total: result.total,
    tax: result.tax,
    balance: result.newBalance,
  });
}

export async function handleSell(db, playerId, entities) {
  const player = await getPlayer(db, playerId);
  if (!player) return render('error');

  if (!entities.itemId) {
    return render('buy_fail_notfound', { itemName: entities.keyword || 'objet inconnu' });
  }
  const qty = entities.quantity || 1;

  const result = await sellItem(db, playerId, entities.itemId, qty);
  if (!result.success) {
    if (result.error === 'INSUFFICIENT_STOCK') {
      return render('sell_fail_insufficient', { itemName: entities.itemId, available: result.available });
    }
    return render('error');
  }

  return render('sell_success', { quantity: qty, itemName: result.item.name, total: result.total });
}

export default { handleShopList, handleBuy, handleSell };
