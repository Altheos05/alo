import { CRAFT_TYPES, getTypeCounts, getRecipesByType, getRecipeByName, craftItem } from '../engine/craft.js';
import { menuRow, MAX_CARD_ROWS } from '../services/cardRenderer.js';
import { handleCookRecipe, handleCookLevel } from './cooking.js';

const TYPE_LABELS = { forge: 'Forge', alchemy: 'Alchimie', sewing: 'Couture', cooking: 'Cuisine', enchanting: 'Enchantement' };
const TYPE_KEYWORDS = {
  forge: /forge|forger/i,
  alchemy: /alchim/i,
  sewing: /couture|coudre/i,
  cooking: /cuisine|cuisiner|^cook\b/i,
  enchanting: /enchant/i,
};


function detectType(text) {
  for (const [type, re] of Object.entries(TYPE_KEYWORDS)) {
    if (re.test(text)) return type;
  }
  return null;
}

export async function handleCraft(db, playerId, raw = '') {
  const commandMatch = raw.match(/(?:craft_list|craft|fabrique?|forge?|artisanat|recette?|enchant|alchimie|cook)\s+(.+)/i);
  const arg = commandMatch?.[1]?.trim();

  if (arg && /^niveau$/i.test(arg)) return handleCookLevel(db, playerId);

  if (arg) {
    const type = detectType(arg);
    if (!type) {
      const recipe = await getRecipeByName(db, arg);
      if (recipe) {
        // Cuisine : lieu (§4), réussite par niveau et XP (D94) — moteur dédié.
        if (recipe.craft_type === 'cooking') return handleCookRecipe(db, playerId, recipe);
        const result = await craftItem(db, playerId, recipe.recipe_id);
        if (!result.success) {
          if (result.error === 'MISSING_INGREDIENT') {
            return `❌ Il te manque **${result.required - result.available}× ${result.itemId}** pour "${arg}".`;
          }
          if (result.error === 'INVENTORY_FULL') return `❌ Inventaire plein : fais de la place avant de fabriquer.`;
          if (result.error === 'INSUFFICIENT_FUNDS') {
            return `❌ Fonds insuffisants (${result.required} Yrds requis, tu as ${result.available}).`;
          }
          return `❌ Impossible de fabriquer "${arg}" pour l'instant.`;
        }
        return result.crafted
          ? `🔨 **${result.recipeName}** fabriqué avec succès : +${result.resultQuantity}× ${result.resultItemId}`
          : `💥 La fabrication de **${result.recipeName}** a échoué — les ingrédients sont consommés malgré tout.`;
      }
      return `❌ Aucune recette ne correspond à "${arg}".`;
    }

    const recipes = await getRecipesByType(db, type);
    if (recipes.length === 0) {
      return `🔨 Aucune recette de ${TYPE_LABELS[type]} enregistrée pour l'instant.`;
    }
    const lines = recipes.map((r, idx) => `${idx + 1}. **${r.name}** (${r.skill_level}) — ${Math.round(r.success_rate * 100)}% réussite`);
    const text = `🔨 **${TYPE_LABELS[type]}** (${recipes.length} recettes)\n${lines.join('\n')}\n\nTape "craft [nom de la recette]" pour fabriquer.`;

    const rows = recipes.slice(0, MAX_CARD_ROWS)
      .map((r, idx) => menuRow(idx + 1, r.name, `${Math.round(r.success_rate * 100)}%`))
      .join('');

    return {
      text,
      card: {
        template: 'artisanat',
        variables: { craftLabel: TYPE_LABELS[type], recipeCount: recipes.length, itemsHtml: rows },
      },
    };
  }

  const counts = await getTypeCounts(db);
  const lines = CRAFT_TYPES.map(t => `• **${TYPE_LABELS[t]}** — ${counts[t]} recettes`);
  const text = `🔨 **Artisanat**\n${lines.join('\n')}\n\nTape "craft [domaine]" (ex. "craft forge") pour voir les recettes.`;

  const rows = CRAFT_TYPES
    .map((t, idx) => menuRow(idx + 1, TYPE_LABELS[t], `${counts[t]} recettes`))
    .join('');

  return {
    text,
    card: {
      template: 'artisanat',
      variables: { craftLabel: 'Domaines', recipeCount: CRAFT_TYPES.length, itemsHtml: rows },
    },
  };
}

export default { handleCraft };
