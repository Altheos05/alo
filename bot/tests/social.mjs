// D86 (genre à l'inscription), coffres d'objets, D85 (mariage) — base réelle.
import { test, assert, createAvatar, finish, pool, textOf } from './helpers.mjs';
import { handleLinkStart } from '../src/handlers/registration.js';
import { executeCommand } from '../src/services/sys-pipeline.js';
import { processMessage } from '../src/orchestrator/message-handler.js';
import { depositItem, withdrawItem, mergeIntoVault } from '../src/engine/bank.js';

async function genderOf(phone) {
  const r = await pool.query('SELECT gender FROM t_avatars WHERE whatsapp_phone = $1', [phone]);
  return r.rows[0]?.gender;
}

async function runGender() {
  await test('D86 — !link_start enregistre le genre choisi (femme → female)', async () => {
    const phone = `3398${process.pid}`.slice(0, 12);
    const r = await handleLinkStart(pool, phone, `!link_start Sylph T61_Aelwen femme`);
    assert(textOf(r).startsWith('🎉'), textOf(r));
    assert(await genderOf(phone) === 'female', 'genre non enregistré');
  });

  await test('D86 — le genre est obligatoire', async () => {
    const phone = `3397${process.pid}`.slice(0, 12);
    const r = await handleLinkStart(pool, phone, `!link_start Sylph T61_Sansgenre`);
    assert(textOf(r).includes('Genre'), 'usage attendu : ' + textOf(r));
    assert(!(await genderOf(phone)), 'avatar créé sans genre');
  });

  await test('D86 — race en deux mots (Cait Sith) et neutre', async () => {
    const phone = `3396${process.pid}`.slice(0, 12);
    const r = await handleLinkStart(pool, phone, `!link_start Cait Sith T61_Miaou neutre`);
    assert(textOf(r).startsWith('🎉'), textOf(r));
    const row = (await pool.query('SELECT gender, race_id FROM t_avatars WHERE whatsapp_phone = $1', [phone])).rows[0];
    assert(row.gender === 'neutral' && row.race_id === 'RACE_CAIT_SITH', JSON.stringify(row));
  });

  await test('D86 — SYS_SET_GENDER corrige le genre (source GM)', async () => {
    const a = await createAvatar();
    const r = await executeCommand(pool, { command: 'SYS_SET_GENDER', params: { player_id: a.avatar_uuid, gender: 'female' } }, 'gm');
    assert(r.ok, r.message);
    assert(await genderOf(a.whatsapp_phone) === 'female', 'genre non corrigé');
  });

  await test('D86 — SYS_SET_GENDER refuse une source non GM', async () => {
    const a = await createAvatar();
    const r = await executeCommand(pool, { command: 'SYS_SET_GENDER', params: { player_id: a.avatar_uuid, gender: 'female' } }, 'system');
    assert(!r.ok, 'une source système a pu changer le genre');
  });
}

async function stackableItem() {
  return (await pool.query("SELECT item_id, name FROM t_items_dict WHERE max_stack > 1 ORDER BY item_id LIMIT 1")).rows[0];
}

async function invQty(avatarUuid, itemId) {
  const r = await pool.query('SELECT COALESCE(SUM(quantity), 0)::int AS q FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2', [avatarUuid, itemId]);
  return r.rows[0].q;
}

async function runVault() {
  await test('Coffre — dépôt puis retrait d\'objets empilables', async () => {
    const a = await createAvatar();
    const item = await stackableItem();
    await pool.query('INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, $2, 5)', [a.avatar_uuid, item.item_id]);
    const dep = await depositItem(pool, a.avatar_uuid, item.item_id, 3);
    assert(dep.success, JSON.stringify(dep));
    assert(await invQty(a.avatar_uuid, item.item_id) === 2, 'inventaire non débité');
    const wd = await withdrawItem(pool, a.avatar_uuid, item.item_id, 3);
    assert(wd.success, JSON.stringify(wd));
    assert(await invQty(a.avatar_uuid, item.item_id) === 5, 'inventaire non recrédité');
  });

  await test('Coffre — un objet lié ne se dépose pas (I4)', async () => {
    const a = await createAvatar();
    const item = await stackableItem();
    await pool.query('INSERT INTO t_inventory (avatar_uuid, item_id, quantity, is_bound) VALUES ($1, $2, 1, TRUE)', [a.avatar_uuid, item.item_id]);
    const dep = await depositItem(pool, a.avatar_uuid, item.item_id, 1);
    assert(!dep.success && dep.error === 'BOUND_ITEM', JSON.stringify(dep));
  });

  await test('Coffre — dépôt refusé et inventaire intact quand le coffre est plein', async () => {
    const a = await createAvatar();
    const item = await stackableItem();
    await pool.query('INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, $2, 2)', [a.avatar_uuid, item.item_id]);
    await pool.query("INSERT INTO t_bank_vaults (owner_type, owner_id, max_slots) VALUES ('avatar', $1, 0)", [a.avatar_uuid]);
    const dep = await depositItem(pool, a.avatar_uuid, item.item_id, 1);
    assert(!dep.success && dep.error === 'VAULT_FULL', JSON.stringify(dep));
    assert(await invQty(a.avatar_uuid, item.item_id) === 2, 'objet perdu malgré le rejet');
  });

  await test('Coffre — l\'état de durabilité ne se fond pas dans une autre pile', async () => {
    const next = mergeIntoVault(
      [{ item_id: 'X', qty: 1, current_durability: 100, durability_cap: null, repair_count: 0 }],
      [{ item_id: 'X', qty: 1, current_durability: 40, durability_cap: null, repair_count: 0 }],
      10
    );
    assert(next.length === 2, 'deux états différents fusionnés');
  });

  await test('Coffre — « !bank_depot 2 [Objet] » passe par le message', async () => {
    const a = await createAvatar();
    const item = await stackableItem();
    await pool.query('INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, $2, 4)', [a.avatar_uuid, item.item_id]);
    const r = await processMessage(pool, `!bank_depot 2 ${item.item_id}`, a.avatar_uuid);
    assert(r.routing.intent === 'VAULT', 'routage : ' + r.routing.intent);
    assert(await invQty(a.avatar_uuid, item.item_id) === 2, 'dépôt non effectué : ' + r.response);
  });

  await test('Coffre — « !bank_depot 100 » reste un dépôt de Yrds', async () => {
    const a = await createAvatar();
    await processMessage(pool, '!bank_depot 100', a.avatar_uuid);
    const v = await pool.query("SELECT yrds_stored FROM t_bank_vaults WHERE owner_type = 'avatar' AND owner_id = $1", [a.avatar_uuid]);
    assert(Number(v.rows[0]?.yrds_stored) === 100, 'Yrds non déposés');
  });
}

async function run() {
  console.log('\n🔬 Social — genre (D86), coffres d\'objets\n');
  await runGender();
  await runVault();
  await finish();
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
