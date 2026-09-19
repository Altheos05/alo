// D95 (durées variées) et D96 (résistances, charisme, régénération PM, cadeaux).
import { test, assert, createAvatar, finish, pool } from './helpers.mjs';
import { processMessage } from '../src/orchestrator/message-handler.js';
import { composeDish } from '../src/engine/cooking.js';
import { elementalResistance, resolveAlteration } from '../src/engine/combat.js';
import { executeCommand } from '../src/services/sys-pipeline.js';
import { applyCharisma } from '../src/engine/knowledge.js';

const give = (uuid, itemId, qty = 1) =>
  pool.query('INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, $2, $3)', [uuid, itemId, qty]);
const dur = async (effectId) =>
  (await pool.query('SELECT duration_sec FROM t_status_effects_dict WHERE effect_id = $1', [effectId])).rows[0].duration_sec;
const res = (stat, value) => ({ statModified: stat, modifierValue: value, currentStacks: 1 });

async function run() {
  console.log('\n🔬 Effets des consommables (D95/D96)\n');

  await test('D95 — les durées varient selon tier et puissance', async () => {
    assert(await dur('EFF_CSM_NOU_001') === 2400, 'T2 +5 % → 40 min');
    assert(await dur('EFF_CSM_NOU_056') === 1320, 'T3 +20 % → 22 min');
    assert(await dur('EFF_CSM_NOU_046') === 600, 'charisme → 10 min');
  });

  await test('D95 — marmite : la durée dépend du tier des ingrédients et du palier', async () => {
    const P = { category: 'VIANDE', essence: 'FORCE', nutrition: 60 };
    const one = composeDish([{ item_id: 'A', tier: 1, cook_profile: P }]);
    const twoT2 = composeDish([1, 2].map(i => ({ item_id: `A${i}`, tier: 2, cook_profile: P })));
    assert(one.durationSec === 450, `palier 1, T1 : ${one.durationSec}`);
    assert(twoT2.durationSec === 1200, `palier 2, 2 × T2 : ${twoT2.durationSec}`);
  });

  await test('D96-a — résistance : élément visé, « toutes », jamais le non-élémentaire, plafond 75 %', async () => {
    assert(elementalResistance([res('res_feu', 10)], 'Feu/Foudre/Glace') === 0.1, 'feu composé');
    assert(elementalResistance([res('res_feu', 10)], 'Glace') === 0, 'autre élément');
    assert(elementalResistance([res('res_ombre', 10)], 'Ténèbres') === 0.1, 'ténèbres = ombre');
    assert(elementalResistance([res('res_all', 15)], 'Terre') === 0.15, 'toutes');
    assert(elementalResistance([res('res_all', 15)], null) === 0, 'non élémentaire');
    assert(elementalResistance([res('res_all', 60), res('res_feu', 60)], 'Feu') === 0.75, 'plafond');
  });

  await test('D96-a — altération élémentaire : ignorée ou raccourcie selon la résistance', async () => {
    const burn = { effect_id: 'EFF_BURN', element: 'Feu', duration_sec: 15 };
    const shield = [res('res_feu', 40)];
    assert(resolveAlteration(shield, burn, () => 0.1) === null, 'tirage sous 40 % : altération ignorée');
    assert(resolveAlteration(shield, burn, () => 0.9).duration_sec === 9, 'sinon durée −40 % (15 → 9 s)');
    assert(resolveAlteration(shield, { ...burn, element: null }, () => 0) !== null, 'une altération sans élément passe toujours');
    assert(resolveAlteration([], burn, () => 0) === burn, 'sans résistance : inchangée');
  });

  await test('D96-a — l\'élément des altérations est en base', async () => {
    const r = await pool.query("SELECT effect_id, element FROM t_status_effects_dict WHERE effect_id IN ('EFF_BURN','EFF_STUN') ORDER BY effect_id");
    assert(r.rows[0].element === 'Feu' && r.rows[1].element === null, JSON.stringify(r.rows));
  });

  await test('D96-a — hors combat, SYS_DEBUFF_PLAYER tient compte des résistances', async () => {
    const a = await createAvatar();
    await executeCommand(pool, { command: 'SYS_EFFECT_APPLY', params: { player_id: a.avatar_uuid, effect_id: 'EFF_CSM_NOU_055', duration_sec: '600' } }, 'gm');
    await executeCommand(pool, { command: 'SYS_DEBUFF_PLAYER', params: { player_id: a.avatar_uuid, status_effect: 'EFF_BURN' } }, 'system');
    const burn = await pool.query(
      "SELECT EXTRACT(EPOCH FROM (expires_at - NOW())) AS s FROM t_active_effects WHERE target_id = $1 AND effect_id = 'EFF_BURN'",
      [a.avatar_uuid]);
    // 15 % de chances d'être ignorée ; sinon 15 s × 0,85 ≈ 13 s.
    assert(!burn.rows.length || burn.rows[0].s <= 13, 'durée non réduite : ' + burn.rows[0]?.s);
  });

  await test('D96-b — charisme : usage unique, fait monter la relation d\'un palier', async () => {
    const npc = (await pool.query("SELECT npc_id FROM t_npc WHERE zone_id = 'ZONE_NEU_CAP_001' ORDER BY npc_id LIMIT 1")).rows[0].npc_id;
    const a = await createAvatar({ current_zone_id: 'ZONE_NEU_CAP_001' });
    await give(a.avatar_uuid, 'CSM_NOU_046');
    await processMessage(pool, '!manger CSM_NOU_046', a.avatar_uuid);
    await pool.query('INSERT INTO t_npc_relations (avatar_uuid, npc_id) VALUES ($1, $2)', [a.avatar_uuid, npc]);
    const tier = await applyCharisma(pool, a.avatar_uuid, npc, () => 0);
    assert(tier === 'known', 'palier : ' + tier);
    const rel = (await pool.query('SELECT affinity, affinity_tier FROM t_npc_relations WHERE avatar_uuid = $1', [a.avatar_uuid])).rows[0];
    assert(rel.affinity === 10 && rel.affinity_tier === 'known', JSON.stringify(rel));
    assert(await applyCharisma(pool, a.avatar_uuid, npc, () => 0) === null, 'effet non consommé');
  });

  await test('D96-c — régénération PM paresseuse, arrêtée quand les PM sont pleins', async () => {
    const a = await createAvatar();
    await pool.query('UPDATE t_avatars SET mp_current = 0, mp_max = 100 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    await give(a.avatar_uuid, 'CSM_NOU_053');
    await processMessage(pool, '!manger CSM_NOU_053', a.avatar_uuid);
    await pool.query("UPDATE t_active_effects SET last_tick_at = NOW() - INTERVAL '2 minutes' WHERE target_id = $1", [a.avatar_uuid]);
    await processMessage(pool, '!effets', a.avatar_uuid);
    const mp = (await pool.query('SELECT mp_current FROM t_avatars WHERE avatar_uuid = $1', [a.avatar_uuid])).rows[0].mp_current;
    assert(mp === 40, `2 min × 20 % : ${mp}`);
    await pool.query("UPDATE t_active_effects SET last_tick_at = NOW() - INTERVAL '10 minutes' WHERE target_id = $1", [a.avatar_uuid]);
    await processMessage(pool, '!effets', a.avatar_uuid);
    const full = (await pool.query('SELECT mp_current FROM t_avatars WHERE avatar_uuid = $1', [a.avatar_uuid])).rows[0].mp_current;
    const left = await pool.query("SELECT 1 FROM t_active_effects WHERE target_id = $1", [a.avatar_uuid]);
    assert(full === 100 && left.rows.length === 0, `PM ${full}, effet encore là : ${left.rows.length}`);
  });

  await test('D96-d — !offrir : même zone, destinataire prévenu ; ailleurs, refusé', async () => {
    const a = await createAvatar();
    const b = await createAvatar();
    const far = await createAvatar({ current_zone_id: 'ZONE_NEU_CAP_001' });
    await give(a.avatar_uuid, 'CSM_NOU_036', 2);
    const r = await processMessage(pool, `!offrir CSM_NOU_036 ${b.whatsapp_phone}`, a.avatar_uuid);
    const got = await pool.query("SELECT quantity FROM t_inventory WHERE avatar_uuid = $1 AND item_id = 'CSM_NOU_036'", [b.avatar_uuid]);
    assert(got.rows[0]?.quantity === 1, r.response);
    const note = await pool.query("SELECT 1 FROM t_notifications WHERE recipient_uuid = $1 AND event_type = 'GIFT'", [b.avatar_uuid]);
    assert(note.rows.length === 1, 'destinataire non prévenu');
    const no = await processMessage(pool, `!offrir CSM_NOU_036 ${far.whatsapp_phone}`, a.avatar_uuid);
    assert(no.response.includes('même zone'), no.response);
  });

  await test('Les 4 boissons anti-soif restent sans effet mécanique', async () => {
    const r = await pool.query("SELECT count(*)::int AS n FROM t_items_dict WHERE item_id IN ('CSM_NOU_036','CSM_NOU_039','CSM_NOU_040','CSM_NOU_041') AND use_effect IS NULL");
    assert(r.rows[0].n === 4, 'une boisson a un effet');
  });

  await finish();
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
