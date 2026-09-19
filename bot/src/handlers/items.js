import { findItem, dropItem } from '../engine/items.js';
import { confirmationMenu } from '../services/menus.js';
import { repairItem, durabilityState, currentDurability } from '../engine/durability.js';
import { inspectNode } from '../engine/gathering.js';
import { useItem } from '../engine/consumables.js';
import { getCombatStatus, handleCombatAction } from './combat.js';

export async function handleInspect(db, playerId, raw = '') {
  const match = raw.match(/inspect\s+(.+)/i);
  const query = match?.[1]?.trim();
  if (!query) return `🔍 Inspecte quoi ? Ex. : "inspect Potion de Soin".`;

  // Nœud de ressource (D87) : repousse restante pour soi et état global.
  if (/^(?:FLO|ORE|FSH)_\d{3}$/i.test(query)) {
    const node = await inspectNode(db, playerId, query.toUpperCase());
    if (!node) return `❌ Nœud "${query}" inconnu.`;
    const lines = [
      `🔍 **${node.name}** (${node.node_id}) — ${node.zone_name}`,
      `Produit : ${node.item_name} (${node.yield_min}-${node.yield_max}) · T${node.node_tier} · niv. ${node.level_required}`,
      node.remaining_sec ? `Pour toi : de retour dans ${Math.max(1, Math.ceil(node.remaining_sec / 60))} min` : 'Pour toi : disponible',
    ];
    if (node.depleted) lines.push('⚠️ Épuisé pour tous en ce moment.');
    if (node.boosted) lines.push(`✨ Récolte abondante : ×${node.yield_multiplier}.`);
    return lines.join('\n');
  }

  const item = await findItem(db, query);
  if (!item) return `❌ Aucun objet ne correspond à "${query}".`;

  const lines = [
    `🔍 **${item.name}** (${item.item_id})`,
    item.description || 'Aucune description disponible.',
    `Type : ${item.item_type} · Rareté : ${item.rarity}${item.tier ? ` · Tier ${item.tier}` : ''}`,
  ];
  // D88 : état et durabilité de chaque exemplaire possédé.
  if (item.durability_max > 0) {
    const owned = await db.query(
      'SELECT current_durability, durability_cap FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2',
      [playerId, item.item_id]
    );
    for (const row of owned.rows) {
      const current = currentDurability(row, item.durability_max);
      const cap = row.durability_cap ?? item.durability_max;
      lines.push(`Ton exemplaire : ${durabilityState(current, item.durability_max).label} — ${current}/${cap}${cap < item.durability_max ? ` (max d'origine ${item.durability_max})` : ''}`);
    }
  }
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

// D92 : jeter un objet lié à l'âme passe par une confirmation citée.
export async function handleDrop(db, playerId, raw = '', { confirmed = false } = {}) {
  const match = raw.match(/jeter\s+(\d+\s*x?\s*)?(.+)/i);
  const query = match?.[2]?.trim();
  if (!query) return `🗑️ Jeter quoi ? Ex. : "jeter Potion de Soin".`;

  const quantity = match?.[1] ? parseInt(match[1], 10) : 1;

  const item = await findItem(db, query);
  if (!item) return `❌ Aucun objet ne correspond à "${query}".`;

  const result = await dropItem(db, playerId, item.item_id, quantity, { allowBound: confirmed });
  if (!result.success) {
    if (result.error === 'BOUND_ITEM') {
      return {
        text: `⚠️ **${item.name}** est lié à ton âme : le jeter le détruit **définitivement**, il ne pourra pas être racheté.`,
        menu: confirmationMenu(`!jeter ${quantity} ${item.item_id}`, item.item_id),
      };
    }
    const messages = {
      NOT_OWNED: `❌ Tu ne possèdes pas ${item.name}.`,
      EQUIPPED: `❌ ${item.name} est équipé — retire-le d'abord ("unequip").`,
      INSUFFICIENT_QUANTITY: `❌ Tu n'as que ${result.available}× ${item.name}.`,
    };
    return messages[result.error] || `❌ Impossible de jeter cet objet.`;
  }
  return `🗑️ ${result.quantity}× **${item.name}** jeté(s).`;
}

const REPAIR_ERRORS = {
  NO_REPAIRER: '❌ Aucun forgeron ne propose de réparation ici. Rends-toi dans une ville.',
  NOT_OWNED: '❌ Tu ne possèdes pas cet objet.',
  NO_DURABILITY: '❌ Cet objet ne s\'use pas.',
  IRREPARABLE: '❌ Cet objet a été trop réparé : il est irréparable et doit être remplacé.',
  ALREADY_FULL: '✅ Rien à réparer : la réparation ne rendrait pas plus que son état actuel.',
};

// !repair [Objet] (D88) : chez un forgeron uniquement, réparation dégressive.
export async function handleRepair(db, playerId, raw = '') {
  const query = raw.replace(/^!?repair\s*/i, '').trim();
  if (!query) return `🔨 Réparer quoi ? Ex. : "!repair WPN_ARC_001".`;
  const item = await findItem(db, query);
  if (!item) return `❌ Aucun objet ne correspond à "${query}".`;

  const r = await repairItem(db, playerId, item.item_id);
  if (!r.success) {
    if (r.error === 'INSUFFICIENT_FUNDS') return `❌ Réparation : ${r.required} Yrds requis, tu en as ${r.available}.`;
    return REPAIR_ERRORS[r.error] || '❌ Réparation impossible.';
  }
  const note = r.newCap === r.previousCap
    ? 'Sa durabilité maximale est préservée.'
    : `Durabilité maximale désormais ${r.newCap}/${r.originalMax}.`;
  return `🔨 **${r.name}** réparé (${r.restored} pts) pour ${r.cost} Yrds. ${note}`;
}

// !use / !manger [Objet] : potions, plats (D90 E6). En combat, l'usage prend le tour.
export async function handleUse(db, playerId, raw = '') {
  const query = raw.replace(/^!?(?:use|manger|boire|consommer)\s*/i, '').trim();
  if (!query) return `🧪 Utiliser quoi ? Ex. : "!use CSM_NOU_001".`;
  const item = await findItem(db, query);
  if (!item) return `❌ Aucun objet ne correspond à "${query}".`;
  if (getCombatStatus(playerId)) return handleCombatAction(db, playerId, {}, null, item.item_id);

  const r = await useItem(db, playerId, item.item_id);
  if (!r.success) {
    return r.error === 'NOT_USABLE' ? `❌ **${item.name}** ne s'utilise pas.` : `❌ Tu ne possèdes pas **${item.name}**.`;
  }
  const gains = [r.hpGain && `+${r.hpGain} PV`, r.mpGain && `+${r.mpGain} PM`, r.buff && 'effet actif ("!effets")'].filter(Boolean);
  return `🧪 **${r.name}** consommé${gains.length ? ` : ${gains.join(' · ')}` : ''}.`;
}

export default { handleInspect, handleDrop, handleRepair, handleUse };
