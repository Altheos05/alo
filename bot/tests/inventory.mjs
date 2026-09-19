// Capacité d'inventaire (emplacements, sac) et repli courrier au divorce.
import { test, assert, createAvatar, finish, pool } from './helpers.mjs';
import { processMessage } from '../src/orchestrator/message-handler.js';
import { executeCommand } from '../src/services/sys-pipeline.js';

async function wallet(uuid) {
  return Number((await pool.query('SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1', [uuid])).rows[0].yrd_balance);
}

async function run() {
  console.log('\n🔬 Capacité d\'inventaire\n');

  await test('Inventaire plein : l\'achat est refusé et rien n\'est débité', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_NEU_CAP_001' });
    await pool.query('UPDATE t_avatars SET inventory_capacity = 1 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    await pool.query("INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, 'MAT_ALI_001', 1)", [a.avatar_uuid]);
    const before = await wallet(a.avatar_uuid);
    const r = await processMessage(pool, '!buy MAT_ALI_002', a.avatar_uuid);
    assert(r.response.includes('Inventaire plein'), r.response);
    assert(await wallet(a.avatar_uuid) === before, 'Yrds débités malgré le refus');
  });

  await test('Une pile existante accueille encore des exemplaires quand l\'inventaire est plein', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_NEU_CAP_001' });
    await pool.query('UPDATE t_avatars SET inventory_capacity = 1 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    await pool.query("INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, 'MAT_ALI_001', 1)", [a.avatar_uuid]);
    const r = await processMessage(pool, '!buy MAT_ALI_001', a.avatar_uuid);
    const q = (await pool.query("SELECT quantity FROM t_inventory WHERE avatar_uuid = $1 AND item_id = 'MAT_ALI_001'", [a.avatar_uuid])).rows[0].quantity;
    assert(q === 2, r.response);
  });

  await test('Un sac porté ajoute 30 emplacements', async () => {
    const a = await createAvatar({ current_zone_id: 'ZONE_NEU_CAP_001' });
    await pool.query("UPDATE t_avatars SET inventory_capacity = 1, back_type = 'BAG' WHERE avatar_uuid = $1", [a.avatar_uuid]);
    await pool.query("INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, 'MAT_ALI_001', 1)", [a.avatar_uuid]);
    const r = await processMessage(pool, '!buy MAT_ALI_002', a.avatar_uuid);
    assert(!r.response.includes('Inventaire plein'), r.response);
  });

  await test('Divorce avec inventaire plein : l\'objet rendu part au courrier', async () => {
    const him = await createAvatar({ gender: 'male' });
    const her = await createAvatar({ gender: 'female' });
    const m = await executeCommand(pool, { command: 'SYS_MARRY', params: { player_a: him.avatar_uuid, player_b: her.avatar_uuid } }, 'gm');
    assert(m.ok, m.message);
    await pool.query("INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, 'WPN_ARC_001', 1)", [her.avatar_uuid]);
    await processMessage(pool, '!joint_bank depot 1 WPN_ARC_001', her.avatar_uuid);
    await pool.query('UPDATE t_avatars SET inventory_capacity = 0 WHERE avatar_uuid = $1', [her.avatar_uuid]);
    const marriage = (await pool.query("SELECT marriage_uuid FROM t_marriages WHERE spouse_female_uuid = $1 AND status = 'active'", [her.avatar_uuid])).rows[0];
    const r = await executeCommand(pool, { command: 'SYS_DIVORCE_SETTLE', params: { marriage_id: marriage.marriage_uuid } }, 'gm');
    assert(r.ok, r.message);
    const mail = await pool.query("SELECT 1 FROM t_mail WHERE recipient_id = $1 AND attached_item = 'WPN_ARC_001'", [her.avatar_uuid]);
    assert(mail.rows.length === 1, 'objet ni rendu ni posté');
  });

  await finish();
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
