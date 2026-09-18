import { findItem, dropItem } from '../engine/items.js';

export async function handleInspect(db, playerId, raw = '') {
  const match = raw.match(/inspect\s+(.+)/i);
  const query = match?.[1]?.trim();
  if (!query) return `🔍 Inspecte quoi ? Ex. : "inspect Potion de Soin".`;

  const item = await findItem(db, query);
  if (!item) return `❌ Aucun objet ne correspond à "${query}".`;

  const lines = [
    `🔍 **${item.name}** (${item.item_id})`,
    item.description || 'Aucune description disponible.',
    `Type : ${item.item_type} · Rareté : ${item.rarity}${item.tier ? ` · Tier ${item.tier}` : ''}`,
  ];
  if (item.buy_price) lines.push(`Prix d'achat : ${item.buy_price} Yrds`);
  if (item.resale_value) lines.push(`Valeur de revente : ${item.resale_value} Yrds`);

  return {
    text: lines.join('\n'),
    card: {
      template: 'objet_inspect',
      variables: {
        itemName: item.name,
        itemId: item.item_id,
        description: item.description || 'Aucune description disponible.',
        itemType: item.item_type,
        rarity: item.rarity,
      },
    },
  };
}

export async function handleDrop(db, playerId, raw = '') {
  const match = raw.match(/jeter\s+(\d+\s*x?\s*)?(.+)/i);
  const query = match?.[2]?.trim();
  if (!query) return `🗑️ Jeter quoi ? Ex. : "jeter Potion de Soin".`;

  const quantity = match?.[1] ? parseInt(match[1], 10) : 1;

  const item = await findItem(db, query);
  if (!item) return `❌ Aucun objet ne correspond à "${query}".`;

  const result = await dropItem(db, playerId, item.item_id, quantity);
  if (!result.success) {
    const messages = {
      NOT_OWNED: `❌ Tu ne possèdes pas ${item.name}.`,
      EQUIPPED: `❌ ${item.name} est équipé — retire-le d'abord ("unequip").`,
      INSUFFICIENT_QUANTITY: `❌ Tu n'as que ${result.available}× ${item.name}.`,
      BOUND_ITEM: `❌ ${item.name} est lié à ton âme — impossible de le jeter.`,
    };
    return messages[result.error] || `❌ Impossible de jeter cet objet.`;
  }
  return `🗑️ ${result.quantity}× **${item.name}** jeté(s).`;
}

export default { handleInspect, handleDrop };
