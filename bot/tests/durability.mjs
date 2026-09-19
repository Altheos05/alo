// D88 — durabilité, usure, réparation dégressive, rachat selon l'état (base réelle).
import { test, assert, createAvatar, finish, pool } from './helpers.mjs';
import { processMessage } from '../src/orchestrator/message-handler.js';
import { wearEquipment, getGearStats, durabilityState, capAfterRepair } from '../src/engine/durability.js';
import { sellItem } from '../src/engine/economy.js';
import { executeCommand } from '../src/services/sys-pipeline.js';

async function weapon(tier = 1) {
  return (await pool.query(
    "SELECT item_id, base_atk, durability_max, buy_price FROM t_items_dict WHERE item_type = 'WPN' AND tier = $1 AND durability_max > 0 AND base_atk > 0 ORDER BY item_id LIMIT 1",
    [tier]
  )).rows[0];
}

async function equip(avatarUuid, itemId, { current = null, cap = null, bound = false } = {}) {
  const r = await pool.query(
    `INSERT INTO t_inventory (avatar_uuid, item_id, quantity, is_equipped, slot_equipped, current_durability, durability_cap, is_bound)
     VALUES ($1, $2, 1, TRUE, 'hand_main', $3, $4, $5) RETURNING instance_uuid`,
    [avatarUuid, itemId, current, cap, bound]
  );
  return r.rows[0].instance_uuid;
}

async function instance(uuid) {
  return (await pool.query('SELECT current_durability, durability_cap, repair_count FROM t_inventory WHERE instance_uuid = $1', [uuid])).rows[0];
}

async function wallet(uuid) {
  return Number((await pool.query('SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1', [uuid])).rows[0].yrd_balance);
}

async function run() {
  console.log('\n🔬 Durabilité (D88)\n');
  const w1 = await weapon(1);

  await test('Grille d\'état D88 (Neuf → Cassé)', async () => {
    const labels = [100, 80, 60, 30, 10, 0].map(c => durabilityState(c, 100).label);
    assert(labels.join('|') === 'Neuf|Quasi neuf|Bon état|État correct|Usé|Cassé', labels.join('|'));
  });

  await test('Une arme équipée donne son ATQ ; cassée, plus rien', async () => {
    const a = await createAvatar();
    const inst = await equip(a.avatar_uuid, w1.item_id);
    assert((await getGearStats(pool, a.avatar_uuid)).atk === w1.base_atk, 'ATQ de l\'arme absente');
    await pool.query('UPDATE t_inventory SET current_durability = 0 WHERE instance_uuid = $1', [inst]);
    assert((await getGearStats(pool, a.avatar_uuid)).atk === 0, 'arme cassée encore comptée');
  });

  await test('Usure de combat : −1 par pièce portée, signal de casse à 0', async () => {
    const a = await createAvatar();
    const inst = await equip(a.avatar_uuid, w1.item_id, { current: 1 });
    const broken = await wearEquipment(pool, a.avatar_uuid, 1);
    assert((await instance(inst)).current_durability === 0, 'usure non appliquée');
    assert(broken.length === 1, 'casse non signalée');
    await wearEquipment(pool, a.avatar_uuid, 1);
    assert((await instance(inst)).current_durability === 0, 'durabilité négative');
  });

  await test('Une arme neuve (durabilité NULL) s\'use depuis son maximum', async () => {
    const a = await createAvatar();
    const inst = await equip(a.avatar_uuid, w1.item_id);
    await wearEquipment(pool, a.avatar_uuid, 1);
    assert((await instance(inst)).current_durability === w1.durability_max - 1, 'mauvais point de départ');
  });

  await test('!repair hors d\'une zone de forgeron : refusé', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_SYL_HUNT_001' });
    await equip(a.avatar_uuid, w1.item_id, { current: 10 });
    const r = await processMessage(pool, `!repair ${w1.item_id}`, a.avatar_uuid);
    assert(r.response.includes('forgeron'), r.response);
  });

  await test('!repair à Alne : coût par point, plafond amputé de 10 %', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_NEU_CAP_001' });
    const inst = await equip(a.avatar_uuid, w1.item_id, { current: 10 });
    const before = await wallet(a.avatar_uuid);
    const r = await processMessage(pool, `!repair ${w1.item_id}`, a.avatar_uuid);
    const expectedCap = w1.durability_max - Math.round(w1.durability_max * 0.1);
    const row = await instance(inst);
    assert(row.durability_cap === expectedCap && row.current_durability === expectedCap && row.repair_count === 1,
      JSON.stringify(row) + ' ' + r.response);
    assert(before - await wallet(a.avatar_uuid) === 2 * (expectedCap - 10), 'coût T1 = 2 Yrds/pt');
  });

  await test('T5 lié à l\'âme : réparé sans amputation (amendement D88)', async () => {
    assert(capAfterRepair(750, 750, 5, true) === 750, 'T5 lié amputé');
    assert(capAfterRepair(750, 750, 5, false) === 675, 'T5 non lié non amputé');
  });

  await test('Plafond épuisé : irréparable', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_NEU_CAP_001' });
    const loss = Math.round(w1.durability_max * 0.1);
    await equip(a.avatar_uuid, w1.item_id, { current: 0, cap: loss });
    const r = await processMessage(pool, `!repair ${w1.item_id}`, a.avatar_uuid);
    assert(r.response.includes('irréparable'), r.response);
  });

  await test('Rachat PNJ selon l\'état de l\'exemplaire ; objet lié invendable', async () => {
    const a = await createAvatar();
    await pool.query(
      'INSERT INTO t_inventory (avatar_uuid, item_id, quantity, current_durability) VALUES ($1, $2, 1, $3)',
      [a.avatar_uuid, w1.item_id, Math.floor(w1.durability_max * 0.6)]
    );
    const r = await sellItem(pool, a.avatar_uuid, w1.item_id, 1);
    assert(r.success && r.total === Math.floor(w1.buy_price * 0.18), `Bon état = 18 % : ${JSON.stringify(r)}`);

    await pool.query('INSERT INTO t_inventory (avatar_uuid, item_id, quantity, is_bound) VALUES ($1, $2, 1, TRUE)', [a.avatar_uuid, w1.item_id]);
    const bound = await sellItem(pool, a.avatar_uuid, w1.item_id, 1);
    assert(!bound.success, 'objet lié vendu');
  });

  await test('SYS_BREAK_WEAPON casse sans détruire ; SYS_MODIFY_DURABILITY borne au plafond', async () => {
    const a = await createAvatar();
    const inst = await equip(a.avatar_uuid, w1.item_id);
    const br = await executeCommand(pool, { command: 'SYS_BREAK_WEAPON', params: { instance_id: inst } }, 'system');
    assert(br.ok && (await instance(inst)).current_durability === 0, br.message);
    await executeCommand(pool, { command: 'SYS_MODIFY_DURABILITY', params: { instance_id: inst, delta: '99999' } }, 'system');
    assert((await instance(inst)).current_durability === w1.durability_max, 'plafond dépassé');
  });

  await test('!inspect affiche l\'état de son exemplaire', async () => {
    const a = await createAvatar();
    await equip(a.avatar_uuid, w1.item_id, { current: 1 });
    const r = await processMessage(pool, `!inspect ${w1.item_id}`, a.avatar_uuid);
    assert(r.response.includes('Usé'), r.response);
  });

  await finish();
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
