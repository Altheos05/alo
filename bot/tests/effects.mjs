// D90 — effets persistants hors combat, !cast / !music, !effets ; D89 (!music = école SUP).
import { test, assert, createAvatar, finish, pool } from './helpers.mjs';
import { processMessage } from '../src/orchestrator/message-handler.js';
import { loadCombatEffects, persistCombatEffects } from '../src/engine/effects.js';
import { executeCommand } from '../src/services/sys-pipeline.js';

async function learn(avatarUuid, skillId) {
  await pool.query("INSERT INTO t_avatar_skills (avatar_uuid, skill_id, source_type) VALUES ($1, $2, 'gm')", [avatarUuid, skillId]);
}

async function avatar(uuid) {
  return (await pool.query('SELECT hp_current, mp_current, is_alive FROM t_avatars WHERE avatar_uuid = $1', [uuid])).rows[0];
}

async function effectsOf(uuid) {
  return (await pool.query("SELECT effect_id FROM t_active_effects WHERE target_type = 'avatar' AND target_id = $1 AND expires_at > NOW()", [uuid])).rows.map(r => r.effect_id);
}

async function party(leader, ...members) {
  const p = await pool.query('INSERT INTO t_parties (leader_id) VALUES ($1) RETURNING party_id', [leader]);
  for (const m of [leader, ...members]) {
    await pool.query('INSERT INTO t_party_members (party_id, avatar_uuid) VALUES ($1, $2)', [p.rows[0].party_id, m]);
  }
}

async function run() {
  console.log('\n🔬 Effets hors combat (D90) · Musique (D89)\n');

  await test('!cast Heal hors combat : PM débités, PV rendus', async () => {
    const a = await createAvatar();
    await pool.query('UPDATE t_avatars SET hp_current = 10 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    await learn(a.avatar_uuid, 'MAG_GUE_001');
    const r = await processMessage(pool, '!cast Heal', a.avatar_uuid);
    const s = await avatar(a.avatar_uuid);
    assert(s.hp_current === 100 && s.mp_current === 10, `${JSON.stringify(s)} : ${r.response}`);
  });

  await test('E5 — un sort offensif ne se lance pas hors combat', async () => {
    const a = await createAvatar();
    await learn(a.avatar_uuid, 'MAG_FEU_001');
    const r = await processMessage(pool, '!cast MAG_FEU_001', a.avatar_uuid);
    assert(r.response.includes('qu\'en combat'), r.response);
    assert((await avatar(a.avatar_uuid)).mp_current === 50, 'PM débités pour rien');
  });

  await test('E1 — un buff de soutien est persisté et listé par !effets', async () => {
    const a = await createAvatar();
    await learn(a.avatar_uuid, 'MAG_SUP_001');
    await processMessage(pool, '!cast MAG_SUP_001', a.avatar_uuid);
    assert((await effectsOf(a.avatar_uuid)).includes('EFF_MAG_SUP_001'), 'effet absent');
    const r = await processMessage(pool, '!effets', a.avatar_uuid);
    assert(r.response.includes('Barrière sonore'), r.response);
  });

  await test('E4 — T1 sur un allié désigné de la même zone ; ailleurs, refusé', async () => {
    const a = await createAvatar();
    const b = await createAvatar();
    const far = await createAvatar({ current_zone_id: 'ZONE_NEU_CAP_001' });
    await pool.query('UPDATE t_avatars SET mp_current = 500, mp_max = 500 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    await learn(a.avatar_uuid, 'MAG_SUP_001');
    await processMessage(pool, `!cast MAG_SUP_001 ${b.whatsapp_phone}`, a.avatar_uuid);
    assert((await effectsOf(b.avatar_uuid)).includes('EFF_MAG_SUP_001'), 'allié non affecté');
    const r = await processMessage(pool, `!cast MAG_SUP_001 ${far.whatsapp_phone}`, a.avatar_uuid);
    assert(r.response.includes('pas dans ta zone'), r.response);
  });

  await test('E4 — T3+ : tout le groupe présent dans la zone, pas les absents', async () => {
    const a = await createAvatar({ level: 50 });
    await pool.query('UPDATE t_avatars SET mp_current = 500, mp_max = 500 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    const here = await createAvatar();
    const away = await createAvatar({ current_zone_id: 'ZONE_NEU_CAP_001' });
    await party(a.avatar_uuid, here.avatar_uuid, away.avatar_uuid);
    await learn(a.avatar_uuid, 'MAG_SUP_006');
    await processMessage(pool, '!cast MAG_SUP_006', a.avatar_uuid);
    assert((await effectsOf(here.avatar_uuid)).includes('EFF_MAG_SUP_006'), 'membre présent non affecté');
    assert(!(await effectsOf(away.avatar_uuid)).length, 'membre absent affecté');
  });

  await test('E5 — Revive ressuscite un allié mort du groupe dans la zone', async () => {
    const a = await createAvatar();
    await pool.query('UPDATE t_avatars SET mp_current = 500, mp_max = 500 WHERE avatar_uuid = $1', [a.avatar_uuid]);
    const dead = await createAvatar();
    await pool.query('UPDATE t_avatars SET is_alive = FALSE, hp_current = 0 WHERE avatar_uuid = $1', [dead.avatar_uuid]);
    await party(a.avatar_uuid, dead.avatar_uuid);
    await learn(a.avatar_uuid, 'MAG_GUE_006');
    await processMessage(pool, '!cast MAG_GUE_006', a.avatar_uuid);
    const s = await avatar(dead.avatar_uuid);
    assert(s.is_alive && s.hp_current === 10, JSON.stringify(s));
  });

  await test('D89 — !music ne lance que l\'école Support', async () => {
    const a = await createAvatar();
    await learn(a.avatar_uuid, 'MAG_GUE_001');
    await learn(a.avatar_uuid, 'MAG_SUP_002');
    const wrong = await processMessage(pool, '!music Heal', a.avatar_uuid);
    assert(wrong.response.includes('Support'), wrong.response);
    await processMessage(pool, '!music Haste', a.avatar_uuid);
    assert((await effectsOf(a.avatar_uuid)).includes('EFF_MAG_SUP_002'), '!music Haste sans effet');
  });

  await test('E1 — les effets entrent dans le combat et en ressortent', async () => {
    const a = await createAvatar();
    await executeCommand(pool, { command: 'SYS_BLESS_PLAYER', params: { player_id: a.avatar_uuid, buff_type: 'EFF_STR_UP' } }, 'system');
    const loaded = await loadCombatEffects(pool, a.avatar_uuid);
    assert(loaded.length === 1 && loaded[0].statModified === 'stat_str', JSON.stringify(loaded));
    await persistCombatEffects(pool, a.avatar_uuid, loaded);
    assert((await effectsOf(a.avatar_uuid)).includes('EFF_STR_UP'), 'effet perdu à la fin du combat');
  });

  await test('SYS_DEBUFF_PLAYER refuse un buff ; SYS_CLEAR_EFFECTS dissipe', async () => {
    const a = await createAvatar();
    const bad = await executeCommand(pool, { command: 'SYS_DEBUFF_PLAYER', params: { player_id: a.avatar_uuid, status_effect: 'EFF_STR_UP' } }, 'system');
    assert(!bad.ok, 'un buff accepté comme altération');
    await executeCommand(pool, { command: 'SYS_DEBUFF_PLAYER', params: { player_id: a.avatar_uuid, status_effect: 'EFF_SLOW' } }, 'system');
    const clear = await executeCommand(pool, { command: 'SYS_CLEAR_EFFECTS', params: { player_id: a.avatar_uuid } }, 'system');
    assert(clear.ok && !(await effectsOf(a.avatar_uuid)).length, clear.message);
  });

  await finish();
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
