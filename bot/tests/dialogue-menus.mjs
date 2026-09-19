// D18/D84 (!demander, pare-feu QI, sujets de service) et menus D83 restants.
import { test, assert, createAvatar, finish, pool } from './helpers.mjs';
import { processMessage } from '../src/orchestrator/message-handler.js';
import { loadZoneGraph } from '../src/engine/movement.js';

async function qi(where) {
  return (await pool.query(`SELECT k.*, n.zone_id FROM t_npc_knowledge k JOIN t_npc n ON n.npc_id = k.npc_id WHERE ${where} ORDER BY k.qi_id LIMIT 1`)).rows[0];
}
const tag = (row) => row.topic_tags[0].replace(/\s+/g, '_');
const menuOf = async (uuid) => (await pool.query('SELECT context_type, options FROM t_pending_menus WHERE avatar_uuid = $1', [uuid])).rows[0];

async function run() {
  console.log('\n🔬 Dialogue (D18/D84) · menus D83\n');
  await loadZoneGraph(pool);

  await test('!demander : un sujet K0 est révélé et l\'arête de relation naît', async () => {
    const k0 = await qi("k.k_level = 'K0' AND NOT k.is_service AND n.zone_id IS NOT NULL");
    const a = await createAvatar({ current_zone_id: k0.zone_id });
    const r = await processMessage(pool, `!demander ${k0.npc_id} ${tag(k0)}`, a.avatar_uuid);
    assert(r.response.includes(k0.content.slice(0, 20)), r.response);
    const rel = await pool.query('SELECT interaction_count FROM t_npc_relations WHERE avatar_uuid = $1 AND npc_id = $2', [a.avatar_uuid, k0.npc_id]);
    assert(rel.rows[0]?.interaction_count === 1, 'relation non créée');
  });

  await test('D18 — sujet inconnu : ligne d\'ignorance KX', async () => {
    const kx = await qi("k.k_level = 'KX' AND n.zone_id IS NOT NULL");
    const a = await createAvatar({ current_zone_id: kx.zone_id });
    const r = await processMessage(pool, `!demander ${kx.npc_id} xylophone_quantique`, a.avatar_uuid);
    assert(r.response.includes(kx.content.slice(0, 15)), r.response);
  });

  await test('D18 — un sujet K3 ne livre que la déflection', async () => {
    const k3 = await qi("k.k_level = 'K3' AND k.deflection_line IS NOT NULL AND n.zone_id IS NOT NULL");
    const a = await createAvatar({ current_zone_id: k3.zone_id });
    const r = await processMessage(pool, `!demander ${k3.npc_id} ${tag(k3)}`, a.avatar_uuid);
    assert(!r.response.includes(k3.content.slice(0, 25)), 'contenu K3 divulgué');
  });

  await test('D18 — K2 verrouillé par l\'affinité, révélé puis débloqué quand elle suffit', async () => {
    const k2 = await qi("k.k_level = 'K2' AND k.unlock_condition = '`AFF>=85`' AND n.zone_id IS NOT NULL");
    const a = await createAvatar({ current_zone_id: k2.zone_id });
    const locked = await processMessage(pool, `!demander ${k2.npc_id} ${tag(k2)}`, a.avatar_uuid);
    assert(!locked.response.includes(k2.content.slice(0, 20)), 'K2 révélé sans affinité');
    await pool.query('UPDATE t_npc_relations SET affinity = 90 WHERE avatar_uuid = $1 AND npc_id = $2', [a.avatar_uuid, k2.npc_id]);
    const open = await processMessage(pool, `!demander ${k2.npc_id} ${tag(k2)}`, a.avatar_uuid);
    assert(open.response.includes(k2.content.slice(0, 20)), open.response);
    const u = await pool.query('SELECT 1 FROM t_npc_knowledge_unlocks WHERE avatar_uuid = $1 AND qi_id = $2', [a.avatar_uuid, k2.qi_id]);
    assert(u.rows.length === 1, 'déblocage non enregistré');
  });

  await test('K4 — PAY : prix annoncé, puis débit et révélation sur consentement', async () => {
    const k2 = await qi("k.unlock_condition LIKE '%PAY:%' AND n.zone_id IS NOT NULL");
    const price = parseInt(k2.unlock_condition.match(/PAY:(\d+)/)[1], 10);
    const a = await createAvatar({ current_zone_id: k2.zone_id });
    await processMessage(pool, `!demander ${k2.npc_id} ${tag(k2)}`, a.avatar_uuid);
    await pool.query('UPDATE t_npc_relations SET affinity = 100 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    const ask = await processMessage(pool, `!demander ${k2.npc_id} ${tag(k2)}`, a.avatar_uuid);
    assert(ask.response.includes(`${price} Yrds`), ask.response);
    const paid = await processMessage(pool, `!demander ${k2.npc_id} ${tag(k2)} payer`, a.avatar_uuid);
    assert(paid.response.includes(k2.content.slice(0, 20)), paid.response);
    const w = await pool.query('SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1', [a.avatar_uuid]);
    assert(Number(w.rows[0].yrd_balance) === 10000 - price, 'débit incorrect');
  });

  await test('D84 — un sujet de service révèle, puis annonce honnêtement une primitive absente', async () => {
    const svc = await qi("k.is_service AND n.zone_id IS NOT NULL AND (k.unlock_condition IS NULL OR k.unlock_condition = '—')");
    const a = await createAvatar({ current_zone_id: svc.zone_id });
    const r = await processMessage(pool, `!demander ${svc.npc_id} ${tag(svc)}`, a.avatar_uuid);
    assert(r.response.includes('🛠️'), r.response);
  });

  await test('D83 §3.2 — !parler affiche les sujets ; un chiffre résout « !demander »', async () => {
    const k0 = await qi("k.k_level = 'K0' AND n.zone_id IS NOT NULL");
    const a = await createAvatar({ current_zone_id: k0.zone_id });
    await processMessage(pool, `!parler ${k0.npc_id}`, a.avatar_uuid);
    const menu = await menuOf(a.avatar_uuid);
    assert(menu?.context_type === 'DIALOGUE', 'menu dialogue absent');
    const r = await processMessage(pool, '1', a.avatar_uuid);
    assert(r.routing.intent === 'ASK', 'le chiffre n\'a pas résolu !demander : ' + r.routing.intent);
  });

  await test('D83 §3.3 — boutique : un chiffre achète au prix de la boutique locale', async () => {
    const offer = (await pool.query(
      `SELECT s.zone_id, si.item_id, si.price FROM t_shop_items si JOIN t_shops s ON s.shop_id = si.shop_id
       JOIN t_npc n ON n.npc_id = s.owner_npc_id JOIN t_items_dict d ON d.item_id = si.item_id
       WHERE si.stock < 0 AND s.zone_id = 'ZONE_NEU_CAP_001' ORDER BY n.display_name, d.name LIMIT 1`)).rows[0];
    const a = await createAvatar({ current_zone_id: offer.zone_id });
    await processMessage(pool, '!shop_list', a.avatar_uuid);
    assert((await menuOf(a.avatar_uuid))?.context_type === 'SHOP', 'menu boutique absent');
    await processMessage(pool, '1', a.avatar_uuid);
    const inv = await pool.query('SELECT 1 FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2', [a.avatar_uuid, offer.item_id]);
    assert(inv.rows.length === 1, 'achat non effectué');
  });

  await test('Achat refusé si aucune boutique de la zone ne vend l\'objet', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_SYL_HUNT_001' });
    const r = await processMessage(pool, '!buy MSC_ENG_001', a.avatar_uuid);
    assert(r.response.includes('Aucune boutique'), r.response);
  });

  await test('D83 §3.4 — déplacement : les sorties sont proposées, un chiffre déplace', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_SYL_CAP_001' });
    await processMessage(pool, '!tp', a.avatar_uuid);
    const menu = await menuOf(a.avatar_uuid);
    assert(menu?.context_type === 'MOVEMENT', 'menu déplacement absent');
    const dest = menu.options[0].command.split(' ')[1];
    await pool.query('UPDATE t_avatars SET mp_current = 500 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    await processMessage(pool, '1', a.avatar_uuid);
    const z = await pool.query('SELECT current_zone_id FROM t_avatars WHERE avatar_uuid = $1', [a.avatar_uuid]);
    assert(z.rows[0].current_zone_id === dest, `pas arrivé à ${dest}`);
  });

  await test('D83 §3.5 — tableau de quêtes : un chiffre accepte la quête', async () => {
    const q = (await pool.query("SELECT quest_id, zone_id FROM t_quests_dict WHERE min_level <= 20 AND zone_id IS NOT NULL AND NOT is_hidden ORDER BY quest_id LIMIT 1")).rows[0];
    const a = await createAvatar({ current_zone_id: q.zone_id });
    await processMessage(pool, '!quest_board', a.avatar_uuid);
    const menu = await menuOf(a.avatar_uuid);
    assert(menu?.context_type === 'QUEST_BOARD', 'menu quêtes absent');
    await processMessage(pool, '1', a.avatar_uuid);
    const aq = await pool.query('SELECT 1 FROM t_active_quests WHERE avatar_uuid = $1', [a.avatar_uuid]);
    assert(aq.rows.length === 1, 'quête non acceptée');
  });

  await finish();
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
