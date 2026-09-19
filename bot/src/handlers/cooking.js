import { cookInPot, cookRecipe, getCookingProfile, MAX_INGREDIENTS } from '../engine/cooking.js';
import { findItem } from '../engine/items.js';

const ERRORS = {
  NO_COOKING_PLACE: '🍳 Il faut un feu de camp (en extérieur sauvage : zone de chasse ou plaine) ou la cuisine de ton logement pour cuisiner.',
  INGREDIENT_COUNT: `🍲 La marmite prend de 1 à ${MAX_INGREDIENTS} ingrédients.`,
  UNKNOWN_ITEM: '❌ Un de ces ingrédients n\'existe pas.',
  INVENTORY_FULL: '❌ Inventaire plein : fais de la place avant de cuisiner (rien n\'a été consommé).',
};

function outcome(r) {
  const xp = `+${r.xpGained} XP de cuisine (niveau ${r.level}${r.levelUp ? ' — **niveau supérieur !**' : ''})`;
  if (!r.cooked) return `💨 C'est raté : les ingrédients sont perdus. ${xp}.`;
  const effect = r.effectId ? ' · effet actif une fois mangé' : '';
  const heal = r.healHp ? ` · ${r.healHp} PV` : '';
  const discovery = r.discovered ? ' ✨ Tu as retrouvé une recette !' : '';
  return `🍲 **${r.dishName}** cuisiné(e)${heal}${effect}.${discovery} ${xp}.`;
}

// « 2x Viande de gibier + Sel de lune » ou « MAT_ALI_026 MAT_ALI_024 » → liste d'ID (une entrée par exemplaire).
async function parseIngredients(db, text) {
  // Sans « + » : une liste d'ID séparés par des espaces, sinon un seul ingrédient nommé.
  const tokens = text.split(/\s+/);
  const allIds = tokens.every(t => /^[A-Z]{3}_[A-Z0-9]+_\d{3}$/i.test(t));
  const parts = /[+,]/.test(text) ? text.split(/[+,]/) : allIds ? tokens : [text];
  const ids = [];
  for (const raw of parts.map(p => p.trim()).filter(Boolean)) {
    const m = raw.match(/^(\d+)\s*[x×]\s*(.+)$/i);
    const item = await findItem(db, m ? m[2].trim() : raw);
    if (!item) return { missing: raw };
    for (let i = 0; i < (m ? parseInt(m[1], 10) : 1); i++) ids.push(item.item_id);
  }
  return { ids };
}

// !marmite (D93).
export async function handleMarmite(db, playerId, raw = '') {
  const text = raw.replace(/^!?marmite\s*/i, '').trim();
  if (!text) return `🍲 Utilisation : "!marmite [Ingrédient] + [Ingrédient]" (jusqu'à ${MAX_INGREDIENTS}). Ex. : "!marmite Viande de gibier + Piment de braise".`;
  const parsed = await parseIngredients(db, text);
  if (parsed.missing) return `❌ Ingrédient inconnu : "${parsed.missing}".`;
  const r = await cookInPot(db, playerId, parsed.ids);
  if (!r.success) {
    if (r.error === 'MISSING_INGREDIENT') return `❌ Il te manque **${r.itemId}**.`;
    return ERRORS[r.error] || '❌ Cuisine impossible.';
  }
  return outcome(r);
}

// !cook [Recette] (D94 : réussite selon le niveau de cuisine).
export async function handleCookRecipe(db, playerId, recipe) {
  const r = await cookRecipe(db, playerId, recipe);
  if (!r.success) {
    if (r.error === 'MISSING_INGREDIENT') return `❌ Il te manque **${r.itemId}** pour "${recipe.name}".`;
    return ERRORS[r.error] || '❌ Cuisine impossible.';
  }
  return outcome(r);
}

export async function handleCookLevel(db, playerId) {
  const p = await getCookingProfile(db, playerId);
  const next = p.nextXp === null ? 'niveau maximal' : `${p.nextXp - p.xp} XP avant le niveau ${p.level + 1}`;
  return `🍳 Cuisine : niveau **${p.level}** (${p.xp} XP) — ${next}.`;
}

export default { handleMarmite, handleCookRecipe, handleCookLevel };
