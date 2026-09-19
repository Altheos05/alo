// Cuisine libre « marmite » (D93) et niveau de cuisine (D94) — cuisine_libre.md.
// composeDish et les formules sont pures ; cookInPot / cookRecipe portent la transaction.
import { inTransaction, takeFromInventory, addToInventory } from './bank.js';
import { cookingPlace } from './gathering.js';

export const MAX_INGREDIENTS = 4;
// D95 : 5 min × tier par ingrédient, × facteur de palier ; 5 min au minimum.
const SECONDS_PER_TIER = 300;
const TIER_DURATION_FACTOR = { 1: 1.5, 2: 1, 3: 0.75 };
const MIN_DURATION_SEC = 300;
const SEASONING_BONUS = 1.25;
const MIN_HEAL = 1;
const DISHES = {
  inedible: 'CSM_CUI_001', dubious: 'CSM_CUI_002', meat: 'CSM_CUI_003', fish: 'CSM_CUI_004',
  veggies: 'CSM_CUI_005', flatbread: 'CSM_CUI_006', skewer: 'CSM_CUI_007', seafood: 'CSM_CUI_008',
  stew: 'CSM_CUI_009', broth: 'CSM_CUI_010',
};
const ESSENCE_STATS = { FORCE: 'STR', AGILITE: 'AGI', ENDURANCE: 'VIT', ESPRIT: 'INT' };
const MONSTER_PART = /^MAT_(DRP|CUI)_/;
const VEGETAL = ['LEGUME', 'FRUIT', 'CEREALE'];

// ─── D94 : formules ───

export function cookingLevel(xp) {
  return Math.min(50, Math.floor(Math.sqrt((xp || 0) / 25)) + 1);
}

export function successChance(level, complexity) {
  const advised = Math.max(0, 5 * (complexity - 2));
  return Math.min(0.98, Math.max(0.30, 0.90 + 0.04 * (level - advised)));
}

export function xpFor(complexity, succeeded) {
  return (succeeded ? 10 : 3) * complexity * complexity;
}

// ─── D93 : composition d'un plat de marmite ───

function potencyTier(count) {
  if (count >= 3) return 3;
  return count;
}

// ingredients : [{ item_id, tier, cook_profile }] (un élément par exemplaire jeté dans la marmite).
export function composeDish(ingredients) {
  const edible = ingredients.filter(i => i.cook_profile);
  if (edible.length < ingredients.length) {
    const monster = ingredients.some(i => !i.cook_profile && MONSTER_PART.test(i.item_id));
    const onlyMonsterParts = ingredients.every(i => i.cook_profile || MONSTER_PART.test(i.item_id));
    const kind = monster && onlyMonsterParts ? 'dubious' : 'inedible';
    return { kind, dishId: DISHES[kind], healHp: MIN_HEAL, effectId: null, durationSec: 0, complexity: 1 };
  }

  const cats = new Set(edible.map(i => i.cook_profile.category));
  const has = (c) => cats.has(c);
  const vegetal = VEGETAL.some(has);
  let dishId;
  if (has('VIANDE') && has('POISSON')) dishId = DISHES.stew;
  else if (has('VIANDE')) dishId = vegetal ? DISHES.skewer : DISHES.meat;
  else if (has('POISSON')) dishId = vegetal ? DISHES.seafood : DISHES.fish;
  else if (has('LEGUME') || has('FRUIT')) dishId = DISHES.veggies;
  else if (has('CEREALE')) dishId = DISHES.flatbread;
  else dishId = DISHES.broth;

  const seasoned = has('ASSAISONNEMENT');
  const healHp = Math.round(edible.reduce((n, i) => n + i.cook_profile.nutrition, 0) * (seasoned ? SEASONING_BONUS : 1));

  // Même essence ⇒ renforcement ; essences de stat différentes ⇒ elles s'annulent.
  const essences = edible.map(i => i.cook_profile.essence).filter(e => ESSENCE_STATS[e]);
  const distinct = [...new Set(essences)];
  const tier = distinct.length === 1 ? potencyTier(essences.length) : 0;
  const effectId = tier ? `EFF_CUI_${ESSENCE_STATS[distinct[0]]}_${tier}` : null;

  return {
    kind: 'generic', dishId, healHp, effectId,
    durationSec: effectId
      ? Math.max(MIN_DURATION_SEC, Math.round(edible.reduce((n, i) => n + SECONDS_PER_TIER * (i.tier || 1), 0) * TIER_DURATION_FACTOR[tier]))
      : 0,
    complexity: ingredients.length + tier,
  };
}

// ─── Transactions ───

function tally(itemIds) {
  const counts = new Map();
  for (const id of itemIds) counts.set(id, (counts.get(id) || 0) + 1);
  return counts;
}

// Recette dont les ingrédients sont identiques (nature et quantité) : la marmite la « découvre ».
async function findMatchingRecipe(client, counts) {
  const r = await client.query("SELECT recipe_id, ingredients, result_item_id FROM t_recipes WHERE craft_type = 'cooking'");
  return r.rows.find(rec => rec.ingredients.length === counts.size
    && rec.ingredients.every(ing => counts.get(ing.item_id) === ing.quantity)) || null;
}

function recipeComplexity(recipe, resultTier) {
  return recipe.ingredients.length + 2 * (resultTier - 1);
}

// Cœur commun : consomme, tire la réussite, crédite le plat et l'XP.
async function cook(client, avatarUuid, counts, plan, random) {
  const avatar = await client.query('SELECT cooking_xp FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE', [avatarUuid]);
  const xpBefore = avatar.rows[0].cooking_xp;
  const level = cookingLevel(xpBefore);

  for (const [itemId, qty] of counts) {
    const took = await takeFromInventory(client, avatarUuid, itemId, qty, { allowBound: true });
    if (took.error) return { success: false, error: 'MISSING_INGREDIENT', itemId, available: took.available || 0 };
  }

  // Un plat raté d'avance (douteux, immangeable) « réussit » toujours : c'est le plat qui est mauvais.
  const guaranteed = plan.kind === 'inedible' || plan.kind === 'dubious';
  const chance = guaranteed ? 1 : successChance(level, plan.complexity);
  const succeeded = random() < chance;
  const xpGained = plan.kind === 'inedible' ? 0 : plan.kind === 'dubious' ? 1 : xpFor(plan.complexity, succeeded);

  if (succeeded) {
    const placed = await addToInventory(client, avatarUuid,
      { item_id: plan.dishId, qty: 1, instance_data: plan.instanceData || null }, 'cooking');
    if (placed.overflow > 0) return { success: false, error: 'INVENTORY_FULL' };
  }
  const updated = await client.query(
    'UPDATE t_avatars SET cooking_xp = cooking_xp + $1 WHERE avatar_uuid = $2 RETURNING cooking_xp',
    [xpGained, avatarUuid]
  );
  const newLevel = cookingLevel(updated.rows[0].cooking_xp);
  return { success: true, cooked: succeeded, chance, xpGained, level: newLevel, levelUp: newLevel > level };
}

async function dishName(client, itemId) {
  return (await client.query('SELECT name FROM t_items_dict WHERE item_id = $1', [itemId])).rows[0]?.name || itemId;
}

export async function cookInPot(db, avatarUuid, itemIds, random = Math.random) {
  if (!itemIds.length || itemIds.length > MAX_INGREDIENTS) return { success: false, error: 'INGREDIENT_COUNT' };
  if (!(await cookingPlace(db, avatarUuid))) return { success: false, error: 'NO_COOKING_PLACE' };

  return inTransaction(db, 'Erreur de cuisine en marmite', { avatarUuid }, async (client) => {
    const counts = tally(itemIds);
    const dict = await client.query(
      'SELECT item_id, tier, cook_profile FROM t_items_dict WHERE item_id = ANY($1)', [[...counts.keys()]]
    );
    if (dict.rows.length < counts.size) return { success: false, error: 'UNKNOWN_ITEM' };
    const byId = new Map(dict.rows.map(r => [r.item_id, r]));

    const recipe = await findMatchingRecipe(client, counts);
    let plan;
    if (recipe) {
      const tier = (await client.query('SELECT tier FROM t_items_dict WHERE item_id = $1', [recipe.result_item_id])).rows[0].tier;
      plan = { kind: 'recipe', dishId: recipe.result_item_id, complexity: recipeComplexity(recipe, tier) };
    } else {
      const dish = composeDish(itemIds.map(id => byId.get(id)));
      plan = {
        ...dish,
        instanceData: { use_effect: { heal_hp: dish.healHp, effect_id: dish.effectId, duration_sec: dish.durationSec } },
      };
    }
    const result = await cook(client, avatarUuid, counts, plan, random);
    if (!result.success) return result;
    return { ...result, discovered: !!recipe, kind: plan.kind, dishName: await dishName(client, plan.dishId),
      healHp: plan.healHp, effectId: plan.effectId };
  });
}

export async function cookRecipe(db, avatarUuid, recipe, random = Math.random) {
  if (!(await cookingPlace(db, avatarUuid))) return { success: false, error: 'NO_COOKING_PLACE' };
  return inTransaction(db, 'Erreur de cuisine', { avatarUuid, recipe: recipe.recipe_id }, async (client) => {
    const tier = (await client.query('SELECT tier FROM t_items_dict WHERE item_id = $1', [recipe.result_item_id])).rows[0].tier;
    const counts = new Map(recipe.ingredients.map(i => [i.item_id, i.quantity]));
    const plan = { kind: 'recipe', dishId: recipe.result_item_id, complexity: recipeComplexity(recipe, tier) };
    const result = await cook(client, avatarUuid, counts, plan, random);
    return result.success ? { ...result, dishName: await dishName(client, plan.dishId) } : result;
  });
}

export async function getCookingProfile(db, avatarUuid) {
  const xp = (await db.query('SELECT cooking_xp FROM t_avatars WHERE avatar_uuid = $1', [avatarUuid])).rows[0]?.cooking_xp || 0;
  const level = cookingLevel(xp);
  const nextXp = level >= 50 ? null : 25 * level * level;
  return { xp, level, nextXp };
}

export default { cookingLevel, successChance, xpFor, composeDish, cookInPot, cookRecipe, getCookingProfile, MAX_INGREDIENTS };
