// D93 (cuisine libre « marmite ») et D94 (niveau de cuisine).
import { test, assert, createAvatar, finish, pool } from './helpers.mjs';
import { processMessage } from '../src/orchestrator/message-handler.js';
import { composeDish, successChance, xpFor, cookingLevel, cookInPot } from '../src/engine/cooking.js';

const P = (category, essence = null, nutrition = 50) => ({ category, essence, nutrition });
const ing = (item_id, profile) => ({ item_id, cook_profile: profile });

async function give(uuid, itemId, qty = 1) {
  await pool.query('INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, $2, $3)', [uuid, itemId, qty]);
}
async function rows(uuid, itemId) {
  return (await pool.query('SELECT quantity, instance_data FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2', [uuid, itemId])).rows;
}
async function xp(uuid) {
  return (await pool.query('SELECT cooking_xp FROM t_avatars WHERE avatar_uuid = $1', [uuid])).rows[0].cooking_xp;
}
const campfire = () => createAvatar({ current_zone_id: 'ZONE_SYL_HUNT_001' });

async function run() {
  console.log('\n🔬 Marmite (D93) · niveau de cuisine (D94)\n');

  await test('Un seul ingrédient de base donne un plat grillé simple', async () => {
    assert(composeDish([ing('A', P('VIANDE'))]).dishId === 'CSM_CUI_003', 'viande');
    assert(composeDish([ing('A', P('POISSON'))]).dishId === 'CSM_CUI_004', 'poisson');
    assert(composeDish([ing('A', P('LEGUME'))]).dishId === 'CSM_CUI_005', 'légumes');
  });

  await test('Les combinaisons donnent brochette, poêlée, ragoût, bouillon', async () => {
    assert(composeDish([ing('A', P('VIANDE')), ing('B', P('LEGUME'))]).dishId === 'CSM_CUI_007', 'brochette');
    assert(composeDish([ing('A', P('POISSON')), ing('B', P('CEREALE'))]).dishId === 'CSM_CUI_008', 'poêlée');
    assert(composeDish([ing('A', P('VIANDE')), ing('B', P('POISSON'))]).dishId === 'CSM_CUI_009', 'ragoût');
    assert(composeDish([ing('A', P('ASSAISONNEMENT'))]).dishId === 'CSM_CUI_010', 'bouillon');
  });

  await test('Même essence ⇒ palier renforcé ; essences contraires ⇒ aucun effet', async () => {
    const two = composeDish([ing('A', P('VIANDE', 'FORCE')), ing('B', P('ASSAISONNEMENT', 'FORCE'))]);
    assert(two.effectId === 'EFF_CUI_STR_2' && two.durationSec === 1200, JSON.stringify(two));
    const four = composeDish([1, 2, 3, 4].map(i => ing(`A${i}`, P('VIANDE', 'FORCE'))));
    assert(four.effectId === 'EFF_CUI_STR_3', four.effectId);
    const clash = composeDish([ing('A', P('VIANDE', 'FORCE')), ing('B', P('LEGUME', 'ESPRIT'))]);
    assert(clash.effectId === null && clash.healHp > 0, JSON.stringify(clash));
  });

  await test('Parties de monstre ⇒ tambouille douteuse ; minéral ⇒ immangeable', async () => {
    assert(composeDish([ing('MAT_DRP_013', null), ing('A', P('VIANDE'))]).dishId === 'CSM_CUI_002', 'douteux');
    assert(composeDish([ing('MAT_MIN_001', null), ing('A', P('VIANDE'))]).dishId === 'CSM_CUI_001', 'immangeable');
  });

  await test('D94 — formules : réussite, XP, niveau', async () => {
    assert(Math.abs(successChance(1, 2) - 0.94) < 1e-9, 'plat simple niveau 1');
    assert(successChance(1, 8) === 0.30, 'plat complexe débutant plafonné bas');
    assert(Math.abs(successChance(30, 8) - 0.90) < 1e-9, 'au niveau conseillé : 90 %');
    assert(xpFor(4, true) === 160 && xpFor(4, false) === 48, 'XP');
    assert(cookingLevel(0) === 1 && cookingLevel(400) === 5 && cookingLevel(1e9) === 50, 'niveaux');
  });

  await test('!marmite : viande épicée ×2 au feu de camp → viande grillée de force, exemplaire unique', async () => {
    const a = await campfire();
    await give(a.avatar_uuid, 'MAT_ALI_027', 2);
    const r = await processMessage(pool, '!marmite 2x Viande épicée', a.avatar_uuid);
    const dish = await rows(a.avatar_uuid, 'CSM_CUI_003');
    if (r.response.includes('raté')) return; // 94 %… mais un tirage raté reste un comportement valide
    assert(dish.length === 1 && dish[0].instance_data.use_effect.effect_id === 'EFF_CUI_STR_2', r.response);
    assert(await xp(a.avatar_uuid) > 0, 'aucune XP');
  });

  await test('Manger un plat de marmite applique ses PV et son effet, avec sa durée', async () => {
    const a = await campfire();
    await give(a.avatar_uuid, 'MAT_ALI_027', 2);
    await cookInPot(pool, a.avatar_uuid, ['MAT_ALI_027', 'MAT_ALI_027'], () => 0);
    await pool.query('UPDATE t_avatars SET hp_current = 1 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    await processMessage(pool, '!manger CSM_CUI_003', a.avatar_uuid);
    const eff = await pool.query(
      "SELECT EXTRACT(EPOCH FROM (expires_at - NOW())) AS s FROM t_active_effects WHERE target_id = $1 AND effect_id = 'EFF_CUI_STR_2'",
      [a.avatar_uuid]);
    assert(eff.rows[0] && eff.rows[0].s > 1100, 'effet absent ou mauvaise durée');
    const hp = (await pool.query('SELECT hp_current FROM t_avatars WHERE avatar_uuid = $1', [a.avatar_uuid])).rows[0].hp_current;
    assert(hp > 1, 'PV non rendus');
  });

  await test('Deux plats de même type mais d\'ingrédients différents ne s\'empilent pas', async () => {
    const a = await campfire();
    // Deux viandes seules qui ne forment aucune recette (MAT_ALI_026 seule = Viande séchée).
    await give(a.avatar_uuid, 'MAT_ALI_027');
    await give(a.avatar_uuid, 'MAT_ALI_028');
    await cookInPot(pool, a.avatar_uuid, ['MAT_ALI_027'], () => 0);
    await cookInPot(pool, a.avatar_uuid, ['MAT_ALI_028'], () => 0);
    assert((await rows(a.avatar_uuid, 'CSM_CUI_003')).length === 2, 'plats différents fusionnés');
  });

  await test('La marmite retrouve une recette quand les ingrédients correspondent', async () => {
    const recipe = (await pool.query("SELECT * FROM t_recipes WHERE recipe_id = 'RCP_CSM_NOU_002'")).rows[0];
    const a = await campfire();
    const ids = [];
    for (const i of recipe.ingredients) { await give(a.avatar_uuid, i.item_id, i.quantity); for (let k = 0; k < i.quantity; k++) ids.push(i.item_id); }
    const r = await cookInPot(pool, a.avatar_uuid, ids, () => 0);
    assert(r.success && r.discovered && (await rows(a.avatar_uuid, recipe.result_item_id)).length === 1, JSON.stringify(r));
  });

  await test('Échec : ingrédients perdus, XP réduite', async () => {
    const a = await campfire();
    await give(a.avatar_uuid, 'MAT_ALI_027');
    const r = await cookInPot(pool, a.avatar_uuid, ['MAT_ALI_027'], () => 0.999);
    assert(r.success && !r.cooked && r.xpGained === xpFor(2, false), JSON.stringify(r));
    assert(!(await rows(a.avatar_uuid, 'MAT_ALI_027')).length, 'ingrédient non consommé');
  });

  await test('Plus de 4 ingrédients : refusé', async () => {
    const a = await campfire();
    const r = await processMessage(pool, '!marmite MAT_ALI_026 MAT_ALI_026 MAT_ALI_026 MAT_ALI_026 MAT_ALI_026', a.avatar_uuid);
    assert(r.response.includes('1 à 4'), r.response);
  });

  await test('!cook recette : XP gagnée ; !cook niveau l\'affiche', async () => {
    const recipe = (await pool.query("SELECT * FROM t_recipes WHERE recipe_id = 'RCP_CSM_NOU_002'")).rows[0];
    const a = await campfire();
    for (const i of recipe.ingredients) await give(a.avatar_uuid, i.item_id, i.quantity);
    await processMessage(pool, `!cook ${recipe.name}`, a.avatar_uuid);
    assert(await xp(a.avatar_uuid) > 0, 'aucune XP pour une recette');
    const lvl = await processMessage(pool, '!cook niveau', a.avatar_uuid);
    assert(lvl.response.includes('niveau'), lvl.response);
  });

  await finish();
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
