// Outils partagés des suites d'intégration de l'étape 61 (base réelle requise).
import pool from '../src/db/pool.js';

let passed = 0;
let failed = 0;

export async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

export function assert(cond, message) {
  if (!cond) throw new Error(message);
}

export function textOf(result) {
  return typeof result === 'string' ? result : result?.text ?? result?.response;
}

let seq = 0;
// Avatar jetable, supprimé par cleanupAvatars() (cascade sur les tables filles).
export async function createAvatar(overrides = {}) {
  seq++;
  const suffix = `${process.pid}${seq}`.slice(-9);
  const row = {
    whatsapp_phone: `339${suffix}`,
    avatar_name: `T61_${suffix}`,
    race_id: 'RACE_SYLPH',
    gender: 'male',
    level: 20,
    yrd_balance: 10000,
    current_zone_id: 'ZONE_SYL_CAP_001',
    ...overrides,
  };
  const result = await pool.query(
    `INSERT INTO t_avatars (whatsapp_phone, avatar_name, race_id, gender, level, yrd_balance,
                            current_zone_id, hp_current, hp_max, mp_current, mp_max)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 100, 100, 50, 50)
     RETURNING avatar_uuid, whatsapp_phone, avatar_name`,
    [row.whatsapp_phone, row.avatar_name, row.race_id, row.gender, row.level, row.yrd_balance, row.current_zone_id]
  );
  return result.rows[0];
}

// Les tables sans ON DELETE CASCADE vers t_avatars sont vidées explicitement.
export async function cleanupAvatars() {
  const ids = (await pool.query("SELECT avatar_uuid FROM t_avatars WHERE avatar_name LIKE 'T61\\_%'")).rows.map(r => r.avatar_uuid);
  if (!ids.length) return;
  await pool.query('DELETE FROM t_marriage_assets WHERE contributor_uuid = ANY($1)', [ids]);
  const marriages = await pool.query(
    'DELETE FROM t_marriages WHERE spouse_male_uuid = ANY($1) OR spouse_female_uuid = ANY($1) RETURNING joint_vault_id', [ids]);
  const vaults = marriages.rows.map(r => r.joint_vault_id).filter(Boolean);
  if (vaults.length) await pool.query('DELETE FROM t_bank_vaults WHERE vault_id = ANY($1)', [vaults]);
  await pool.query('DELETE FROM t_bank_vaults WHERE owner_id = ANY($1)', [ids]);
  await pool.query('DELETE FROM t_inventory WHERE avatar_uuid = ANY($1)', [ids]);
  await pool.query('DELETE FROM t_mail WHERE sender_id = ANY($1) OR recipient_id = ANY($1)', [ids]);
  await pool.query('DELETE FROM t_guilds WHERE leader_avatar_uuid = ANY($1)', [ids]);
  await pool.query('DELETE FROM t_parties WHERE leader_id = ANY($1)', [ids]);
  await pool.query('DELETE FROM t_combat_sessions WHERE avatar_uuid = ANY($1)', [ids]);
  await pool.query('DELETE FROM t_npc_knowledge_unlocks WHERE avatar_uuid = ANY($1)', [ids]);
  await pool.query('DELETE FROM t_active_quests WHERE avatar_uuid = ANY($1)', [ids]);
  await pool.query('DELETE FROM t_quest_history WHERE avatar_uuid = ANY($1)', [ids]);
  await pool.query("DELETE FROM t_active_effects WHERE target_type = 'avatar' AND target_id = ANY($1)", [ids]);
  await pool.query('DELETE FROM t_avatars WHERE avatar_uuid = ANY($1)', [ids]);
}

export async function finish() {
  await cleanupAvatars();
  console.log(`\n📊 Résultat : ${passed} passé(s), ${failed} échec(s)\n`);
  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

export { pool };
