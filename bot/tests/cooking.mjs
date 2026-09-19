// D90 E6 — recettes de cuisine, plats (buff persistant, un seul à la fois), potions, !use.
import { test, assert, createAvatar, finish, pool } from './helpers.mjs';
import { processMessage } from '../src/orchestrator/message-handler.js';

async function give(uuid, itemId, qty = 1) {
  await pool.query('INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, $2, $3)', [uuid, itemId, qty]);
}
async function qty(uuid, itemId) {
  return (await pool.query('SELECT COALESCE(SUM(quantity),0)::int AS q FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2', [uuid, itemId])).rows[0].q;
}
async function foodEffects(uuid) {
  return (await pool.query("SELECT effect_id FROM t_active_effects WHERE target_id = $1 AND source_kind = 'food' AND expires_at > NOW()", [uuid])).rows.map(r => r.effect_id);
}

async function run() {
  console.log('\n🔬 Cuisine & consommables (D90 E6)\n');
  const recipe = (await pool.query("SELECT * FROM t_recipes WHERE craft_type = 'cooking' AND recipe_id = 'RCP_CSM_NOU_002'")).rows[0];

  await test('Les denrées se trouvent à la Halle d\'Alne', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_NEU_CAP_001' });
    const r = await processMessage(pool, '!buy MAT_ALI_024', a.avatar_uuid);
    assert(await qty(a.avatar_uuid, 'MAT_ALI_024') === 1, r.response);
  });

  await test('!cook au feu de camp transforme les ingrédients en plat', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_SYL_HUNT_001' });
    // D94 : cuisinier confirmé (niveau 21), pour que la réussite ne dépende pas d'un tirage bas.
    await pool.query('UPDATE t_avatars SET cooking_xp = 10000 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    for (const ing of recipe.ingredients) await give(a.avatar_uuid, ing.item_id, ing.quantity);
    let made = 0;
    for (let i = 0; i < 5 && !made; i++) {
      await processMessage(pool, `!cook ${recipe.name}`, a.avatar_uuid);
      made = await qty(a.avatar_uuid, recipe.result_item_id);
      if (!made) for (const ing of recipe.ingredients) await give(a.avatar_uuid, ing.item_id, ing.quantity);
    }
    assert(made === 1, 'plat non cuisiné');
  });

  await test('!cook en ville sans logement : refusé', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_SYL_CAP_001' });
    for (const ing of recipe.ingredients) await give(a.avatar_uuid, ing.item_id, ing.quantity);
    const r = await processMessage(pool, `!cook ${recipe.name}`, a.avatar_uuid);
    assert(r.response.includes('feu de camp'), r.response);
  });

  await test('Manger un plat pose son buff ; un second plat le remplace', async () => {
    const a = await createAvatar();
    await give(a.avatar_uuid, 'CSM_NOU_001');
    await give(a.avatar_uuid, 'CSM_NOU_004');
    await processMessage(pool, '!manger CSM_NOU_001', a.avatar_uuid);
    assert((await foodEffects(a.avatar_uuid)).join() === 'EFF_CSM_NOU_001', 'buff du premier plat absent');
    await processMessage(pool, '!manger CSM_NOU_004', a.avatar_uuid);
    const now = await foodEffects(a.avatar_uuid);
    assert(now.length === 1 && now[0] === 'EFF_CSM_NOU_004', 'deux buffs de nourriture : ' + now.join());
    assert(await qty(a.avatar_uuid, 'CSM_NOU_001') === 0, 'plat non consommé');
  });

  await test('Une potion de soin rend des PV', async () => {
    const pot = (await pool.query("SELECT item_id FROM t_items_dict WHERE use_effect ? 'heal_hp' ORDER BY item_id LIMIT 1")).rows[0].item_id;
    const a = await createAvatar();
    await pool.query('UPDATE t_avatars SET hp_current = 1 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    await give(a.avatar_uuid, pot);
    const r = await processMessage(pool, `!use ${pot}`, a.avatar_uuid);
    const hp = (await pool.query('SELECT hp_current FROM t_avatars WHERE avatar_uuid = $1', [a.avatar_uuid])).rows[0].hp_current;
    assert(hp > 1, r.response);
  });

  await test('Un objet sans effet d\'usage est refusé', async () => {
    const a = await createAvatar();
    await give(a.avatar_uuid, 'MAT_ALI_001');
    const r = await processMessage(pool, '!use MAT_ALI_001', a.avatar_uuid);
    assert(r.response.includes('ne s\'utilise pas'), r.response);
  });

  await finish();
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
