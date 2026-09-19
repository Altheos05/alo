// Combat : sorts en combat, !fuite ; objet lié à l'acquisition ; forgeron de Freelia.
import { test, assert, createAvatar, finish, pool } from './helpers.mjs';
import { processMessage } from '../src/orchestrator/message-handler.js';
import { getCombatStatus } from '../src/handlers/combat.js';
import { zoneHasRepairer } from '../src/engine/durability.js';

async function spawnIn(zoneId) {
  return (await pool.query(
    `SELECT m.monster_id, m.name FROM t_spawn_tables s JOIN t_monsters_dict m ON m.monster_id = s.monster_id
     WHERE s.zone_id = $1 ORDER BY m.base_hp DESC LIMIT 1`, [zoneId])).rows[0];
}

async function learn(avatarUuid, skillId) {
  await pool.query("INSERT INTO t_avatar_skills (avatar_uuid, skill_id, source_type) VALUES ($1, $2, 'gm')", [avatarUuid, skillId]);
}

async function run() {
  console.log('\n🔬 Combat — sorts, fuite ; liaison à l\'acquisition\n');
  const zone = (await pool.query('SELECT zone_id FROM t_spawn_tables GROUP BY zone_id ORDER BY zone_id LIMIT 1')).rows[0].zone_id;
  const mob = await spawnIn(zone);

  await test('Un sort de soin en combat coûte des PM et soigne', async () => {
    const a = await createAvatar({ current_zone_id: zone, level: 99 });
    await pool.query('UPDATE t_avatars SET hp_current = 5000, hp_max = 10000, mp_current = 500, mp_max = 500 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    await learn(a.avatar_uuid, 'MAG_GUE_001');
    await processMessage(pool, `!attaque ${mob.monster_id}`, a.avatar_uuid);
    assert(getCombatStatus(a.avatar_uuid), 'combat non engagé');
    const r = await processMessage(pool, '!cast Heal', a.avatar_uuid);
    assert(r.response.includes('Heal') && r.response.includes('PV'), r.response);
    const mp = (await pool.query('SELECT mp_current FROM t_avatars WHERE avatar_uuid = $1', [a.avatar_uuid])).rows[0].mp_current;
    assert(mp === 460, 'PM non débités : ' + mp);
  });

  await test('Un sort inconnu ne consomme pas le tour', async () => {
    const a = await createAvatar({ current_zone_id: zone, level: 99 });
    await pool.query('UPDATE t_avatars SET hp_current = 5000, hp_max = 10000 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    await processMessage(pool, `!attaque ${mob.monster_id}`, a.avatar_uuid);
    const turn = getCombatStatus(a.avatar_uuid).turn;
    const r = await processMessage(pool, '!cast Météore', a.avatar_uuid);
    assert(r.response.includes('ne connais pas') && getCombatStatus(a.avatar_uuid).turn === turn, r.response);
  });

  await test('!fuite termine le combat', async () => {
    const a = await createAvatar({ current_zone_id: zone, level: 99 });
    await pool.query('UPDATE t_avatars SET hp_current = 5000, hp_max = 10000 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    await processMessage(pool, `!attaque ${mob.monster_id}`, a.avatar_uuid);
    const r = await processMessage(pool, '!fuite', a.avatar_uuid);
    assert(r.response.includes('fui') && !getCombatStatus(a.avatar_uuid), r.response);
  });

  await test('L\'anneau d\'engagement naît lié à l\'âme, quel que soit le canal', async () => {
    const a = await createAvatar();
    await pool.query("INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, 'MSC_ENG_001', 1)", [a.avatar_uuid]);
    const r = await pool.query("SELECT is_bound FROM t_inventory WHERE avatar_uuid = $1 AND item_id = 'MSC_ENG_001'", [a.avatar_uuid]);
    assert(r.rows[0].is_bound === true, 'anneau non lié');
  });

  await test('Freelia a désormais un forgeron qui répare', async () => {
    assert(await zoneHasRepairer(pool, 'ZONE_CAI_CAP_001'), 'aucun réparateur à Freelia');
  });

  await finish();
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
