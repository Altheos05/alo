import logger from '../utils/logger.js';

export const CRAFT_TYPES = ['forge', 'alchemy', 'sewing', 'cooking', 'enchanting'];

export async function getTypeCounts(db) {
  const result = await db.query('SELECT craft_type, COUNT(*) AS total FROM t_recipes GROUP BY craft_type');
  const counts = {};
  for (const t of CRAFT_TYPES) counts[t] = 0;
  for (const row of result.rows) counts[row.craft_type] = Number(row.total);
  return counts;
}

export async function getRecipesByType(db, craftType) {
  const result = await db.query(
    'SELECT recipe_id, name, skill_level, result_item_id, result_quantity, success_rate, yrd_cost FROM t_recipes WHERE craft_type = $1 ORDER BY name',
    [craftType]
  );
  return result.rows;
}

export async function getRecipeByName(db, name) {
  const result = await db.query(
    `SELECT recipe_id, name, craft_type, ingredients, result_item_id, result_quantity, success_rate, yrd_cost
     FROM t_recipes WHERE name ILIKE $1 LIMIT 1`,
    [`%${name}%`]
  );
  return result.rows[0] || null;
}

/**
 * Transaction complète : vérifie/consomme les ingrédients réels de
 * l'inventaire (jamais fabriqués), le coût en Yrds, puis crédite le
 * résultat selon success_rate. Hypothèse de forme pour `ingredients`
 * (JSONB) : [{"item_id": "...", "quantity": N}, ...] — non vérifiable
 * sans données de seed réelles (T_RECIPES est vide dans seed_data.sql
 * actuel), à confirmer dès qu'une première recette réelle existe.
 */
export async function craftItem(db, avatarUuid, recipeId) {
  const recipeResult = await db.query(
    'SELECT recipe_id, name, ingredients, result_item_id, result_quantity, success_rate, yrd_cost FROM t_recipes WHERE recipe_id = $1',
    [recipeId]
  );
  if (recipeResult.rows.length === 0) return { success: false, error: 'RECIPE_NOT_FOUND' };
  const recipe = recipeResult.rows[0];
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    if (recipe.yrd_cost > 0) {
      const lock = await client.query('SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE', [avatarUuid]);
      if (lock.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, error: 'PLAYER_NOT_FOUND' };
      }
      if (lock.rows[0].yrd_balance < recipe.yrd_cost) {
        await client.query('ROLLBACK');
        return { success: false, error: 'INSUFFICIENT_FUNDS', required: recipe.yrd_cost, available: lock.rows[0].yrd_balance };
      }
    }

    for (const ing of ingredients) {
      const inv = await client.query(
        'SELECT quantity FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2 FOR UPDATE',
        [avatarUuid, ing.item_id]
      );
      const have = inv.rows[0]?.quantity || 0;
      if (have < ing.quantity) {
        await client.query('ROLLBACK');
        return { success: false, error: 'MISSING_INGREDIENT', itemId: ing.item_id, required: ing.quantity, available: have };
      }
    }

    for (const ing of ingredients) {
      await client.query(
        'UPDATE t_inventory SET quantity = quantity - $1 WHERE avatar_uuid = $2 AND item_id = $3',
        [ing.quantity, avatarUuid, ing.item_id]
      );
    }
    await client.query('DELETE FROM t_inventory WHERE avatar_uuid = $1 AND quantity <= 0', [avatarUuid]);

    if (recipe.yrd_cost > 0) {
      await client.query('UPDATE t_avatars SET yrd_balance = yrd_balance - $1 WHERE avatar_uuid = $2', [recipe.yrd_cost, avatarUuid]);
    }

    const crafted = Math.random() < recipe.success_rate;
    if (crafted) {
      const existing = await client.query(
        'SELECT quantity FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2 FOR UPDATE',
        [avatarUuid, recipe.result_item_id]
      );
      if (existing.rows.length > 0) {
        await client.query(
          'UPDATE t_inventory SET quantity = quantity + $1 WHERE avatar_uuid = $2 AND item_id = $3',
          [recipe.result_quantity, avatarUuid, recipe.result_item_id]
        );
      } else {
        await client.query(
          'INSERT INTO t_inventory (instance_uuid, avatar_uuid, item_id, quantity) VALUES (gen_random_uuid(), $1, $2, $3)',
          [avatarUuid, recipe.result_item_id, recipe.result_quantity]
        );
      }
    }

    await client.query('COMMIT');
    return { success: true, crafted, recipeName: recipe.name, resultItemId: recipe.result_item_id, resultQuantity: recipe.result_quantity };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors de l\'artisanat', { error: err.message, avatarUuid, recipeId });
    return { success: false, error: 'TRANSACTION_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

export default { CRAFT_TYPES, getTypeCounts, getRecipesByType, getRecipeByName, craftItem };
