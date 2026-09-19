// D87 — récolte, minage, pêche (mini-jeu FISHING), état global IA ; clause cuisine.
import { test, assert, createAvatar, finish, pool } from './helpers.mjs';
import { processMessage } from '../src/orchestrator/message-handler.js';
import { reelLine, cookingPlace, fishingSuccessChance } from '../src/engine/gathering.js';
import { executeCommand } from '../src/services/sys-pipeline.js';

async function node(where) {
  return (await pool.query(`SELECT * FROM t_resource_nodes WHERE ${where} ORDER BY node_id LIMIT 1`)).rows[0];
}

async function qty(avatarUuid, itemId) {
  const r = await pool.query('SELECT COALESCE(SUM(quantity), 0)::int AS q FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2', [avatarUuid, itemId]);
  return r.rows[0].q;
}

async function giveTool(avatarUuid, itemId, current = null) {
  const r = await pool.query(
    'INSERT INTO t_inventory (avatar_uuid, item_id, quantity, current_durability) VALUES ($1, $2, 1, $3) RETURNING instance_uuid',
    [avatarUuid, itemId, current]
  );
  return r.rows[0].instance_uuid;
}

async function durability(instanceUuid) {
  return (await pool.query('SELECT current_durability FROM t_inventory WHERE instance_uuid = $1', [instanceUuid])).rows[0].current_durability;
}

async function run() {
  console.log('\n🔬 Ressources (D87)\n');
  const flo = await node("node_type = 'FLORA' AND node_tier = 1 AND level_required = 1");
  const ore1 = await node("node_type = 'ORE' AND node_tier = 1");
  const ore2 = await node("node_type = 'ORE' AND node_tier = 2");
  const fsh = await node("node_type = 'FISH' AND node_tier = 1");

  await test('!recolter : récolte à la main, rendement dans la fourchette, repousse par joueur', async () => {
    const a = await createAvatar({ current_zone_id: flo.zone_id });
    const b = await createAvatar({ current_zone_id: flo.zone_id });
    const r = await processMessage(pool, `!recolter ${flo.node_id}`, a.avatar_uuid);
    const got = await qty(a.avatar_uuid, flo.yield_item_id);
    assert(got >= flo.yield_min && got <= flo.yield_max, `rendement ${got} : ${r.response}`);
    const again = await processMessage(pool, `!recolter ${flo.node_id}`, a.avatar_uuid);
    assert(again.response.includes('de retour'), 'repousse ignorée : ' + again.response);
    const other = await processMessage(pool, `!recolter ${flo.node_id}`, b.avatar_uuid);
    assert(!other.response.includes('de retour'), 'la repousse d\'un joueur bloque un autre joueur');
  });

  await test('R1 — hors de la zone du nœud : refusé', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_NEU_CAP_001' });
    const r = await processMessage(pool, `!recolter ${flo.node_id}`, a.avatar_uuid);
    assert(r.response.includes('pas dans ta zone'), r.response);
  });

  await test('R3 — !mine exige une pioche de tier suffisant, non cassée', async () => {
    const a = await createAvatar({ current_zone_id: ore2.zone_id });
    const none = await processMessage(pool, `!mine ${ore2.node_id}`, a.avatar_uuid);
    assert(none.response.includes('pioche'), none.response);
    await giveTool(a.avatar_uuid, 'OUT_PIO_001');
    const weak = await processMessage(pool, `!mine ${ore2.node_id}`, a.avatar_uuid);
    assert(weak.response.includes('T2'), 'une pioche T1 a suffi pour un filon T2 : ' + weak.response);
    await giveTool(a.avatar_uuid, 'OUT_PIO_002', 0);
    const broken = await processMessage(pool, `!mine ${ore2.node_id}`, a.avatar_uuid);
    assert(broken.response.includes('pioche'), 'une pioche cassée a suffi : ' + broken.response);
  });

  await test('R6/R7 — minage réussi : minerai crédité, pioche usée de 1', async () => {
    const a = await createAvatar({ current_zone_id: ore1.zone_id, level: 50 });
    const tool = await giveTool(a.avatar_uuid, 'OUT_PIO_001');
    const r = await processMessage(pool, `!mine ${ore1.node_id}`, a.avatar_uuid);
    assert(await qty(a.avatar_uuid, ore1.yield_item_id) >= 1, 'rien extrait : ' + r.response);
    assert(await durability(tool) === 159, 'usure de la pioche : ' + await durability(tool));
  });

  await test('R8 — !fish ouvre le menu FISHING, sans rien écrire', async () => {
    const a = await createAvatar({ current_zone_id: fsh.zone_id });
    const tool = await giveTool(a.avatar_uuid, 'OUT_CAN_001');
    const r = await processMessage(pool, `!fish ${fsh.node_id}`, a.avatar_uuid);
    assert(r.menuShown && r.response.includes('Ferrer doucement'), r.response);
    const menu = (await pool.query('SELECT context_type, context_ref FROM t_pending_menus WHERE avatar_uuid = $1', [a.avatar_uuid])).rows[0];
    assert(menu.context_type === 'FISHING' && menu.context_ref.startsWith(`${fsh.node_id}:`), JSON.stringify(menu));
    assert(await durability(tool) === null, 'la canne s\'est usée au simple lancer');
  });

  await test('R8 — mauvaise réaction (chiffre nu) : rien, canne usée, repousse non consommée', async () => {
    const a = await createAvatar({ current_zone_id: fsh.zone_id });
    const tool = await giveTool(a.avatar_uuid, 'OUT_CAN_001');
    await processMessage(pool, `!fish ${fsh.node_id}`, a.avatar_uuid);
    const ref = (await pool.query('SELECT context_ref FROM t_pending_menus WHERE avatar_uuid = $1', [a.avatar_uuid])).rows[0].context_ref;
    const wrong = (parseInt(ref.split(':')[1], 10) % 3) + 1;
    const r = await processMessage(pool, String(wrong), a.avatar_uuid);
    assert(r.response.includes('Mauvaise réaction'), r.response);
    assert(await durability(tool) === 159, 'usure non appliquée');
    const cd = await pool.query('SELECT 1 FROM t_avatar_harvests WHERE avatar_uuid = $1', [a.avatar_uuid]);
    assert(cd.rows.length === 0, 'repousse consommée sans prise');
  });

  await test('R8 — bonne réaction : prise créditée, repousse consommée', async () => {
    const a = await createAvatar({ current_zone_id: fsh.zone_id });
    await giveTool(a.avatar_uuid, 'OUT_CAN_001');
    const r = await reelLine(pool, a.avatar_uuid, fsh.node_id, 2, 2, () => 0);
    assert(r.success && r.caught, JSON.stringify(r));
    assert(await qty(a.avatar_uuid, fsh.yield_item_id) === 1, 'poisson non crédité');
  });

  await test('R8 — « !fish_reel » tapé à la main ne pêche rien', async () => {
    const a = await createAvatar({ current_zone_id: fsh.zone_id });
    await giveTool(a.avatar_uuid, 'OUT_CAN_001');
    const r = await processMessage(pool, '!fish_reel 1', a.avatar_uuid);
    assert(r.response.includes('Lance d\'abord'), r.response);
  });

  await test('La DEX module la réussite (70 % + 1 %/pt, plafond 95 %)', async () => {
    assert(fishingSuccessChance(0) === 0.7 && fishingSuccessChance(100) === 0.95, 'grille DEX');
  });

  await test('R5 — SYS_DEPLETE_RESOURCE bloque tout le monde, SYS_BONUS_HARVEST multiplie', async () => {
    const zone = flo.zone_id;
    const a = await createAvatar({ current_zone_id: zone });
    const dep = await executeCommand(pool, { command: 'SYS_DEPLETE_RESOURCE', params: { zone_id: zone, resource_type: 'FLORA' } }, 'system');
    assert(dep.ok, dep.message);
    const r = await processMessage(pool, `!recolter ${flo.node_id}`, a.avatar_uuid);
    assert(r.response.includes('épuisé'), r.response);
    await pool.query("UPDATE t_resource_nodes SET depleted_until = NULL WHERE zone_id = $1", [zone]);

    const bonus = await executeCommand(pool, { command: 'SYS_BONUS_HARVEST', params: { zone_id: zone, multiplier: '3' } }, 'system');
    assert(bonus.ok, bonus.message);
    await processMessage(pool, `!recolter ${flo.node_id}`, a.avatar_uuid);
    assert(await qty(a.avatar_uuid, flo.yield_item_id) >= flo.yield_min * 3, 'multiplicateur ignoré');
    await pool.query("UPDATE t_resource_nodes SET yield_multiplier = 1.0, multiplier_until = NULL WHERE zone_id = $1", [zone]);
  });

  await test('!inspect d\'un nœud : repousse personnelle', async () => {
    const a = await createAvatar({ current_zone_id: flo.zone_id });
    await processMessage(pool, `!recolter ${flo.node_id}`, a.avatar_uuid);
    const r = await processMessage(pool, `!inspect ${flo.node_id}`, a.avatar_uuid);
    assert(r.response.includes('de retour dans'), r.response);
  });

  await test('Cuisine : ville sans logement non, zone de chasse = feu de camp, logement = cuisine', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_SYL_CAP_001' });
    assert(await cookingPlace(pool, a.avatar_uuid) === null, 'cuisine autorisée en ville sans logement');
    await pool.query("UPDATE t_avatars SET current_zone_id = 'ZONE_SYL_HUNT_001' WHERE avatar_uuid = $1", [a.avatar_uuid]);
    assert(await cookingPlace(pool, a.avatar_uuid) === 'campfire', 'pas de feu de camp en zone de chasse');
    await pool.query("UPDATE t_avatars SET current_zone_id = 'ZONE_SYL_CAP_001' WHERE avatar_uuid = $1", [a.avatar_uuid]);
    await pool.query(
      "INSERT INTO t_properties (owner_avatar_uuid, property_type, tenure, zone_id) VALUES ($1, 'small_house', 'own', 'ZONE_SYL_CAP_001')",
      [a.avatar_uuid]
    );
    assert(await cookingPlace(pool, a.avatar_uuid) === 'home', 'cuisine du logement non reconnue');
  });

  await finish();
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
