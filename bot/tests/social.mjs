// D86 (genre à l'inscription), coffres d'objets, D85 (mariage) — base réelle.
import { test, assert, createAvatar, finish, pool, textOf } from './helpers.mjs';
import { handleLinkStart } from '../src/handlers/registration.js';
import { executeCommand } from '../src/services/sys-pipeline.js';
import { processMessage } from '../src/orchestrator/message-handler.js';
import { depositItem, withdrawItem, mergeIntoVault } from '../src/engine/bank.js';
import { bindMenuMessage } from '../src/services/menus.js';
import { giftTierForLevel } from '../src/engine/marriage.js';

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

const RING = 'MSC_ENG_001';

async function giveRing(avatarUuid) {
  await pool.query('INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, $2, 1)', [avatarUuid, RING]);
}

async function giveHome(avatarUuid) {
  await pool.query(
    `INSERT INTO t_properties (owner_avatar_uuid, property_type, tenure, zone_id)
     VALUES ($1, 'small_house', 'own', 'ZONE_SYL_CAP_001')`,
    [avatarUuid]
  );
}

// Couple prêt à se marier : niveaux, genres, anneaux, foyer, même zone.
async function readyCouple() {
  const him = await createAvatar({ gender: 'male' });
  const her = await createAvatar({ gender: 'female' });
  await giveRing(him.avatar_uuid);
  await giveRing(her.avatar_uuid);
  await giveHome(him.avatar_uuid);
  return { him, her };
}

async function marry(him, her) {
  const p = await processMessage(pool, `!propose ${her.whatsapp_phone}`, him.avatar_uuid);
  assert(p.response.startsWith('💍 Demande envoyée'), 'demande : ' + p.response);
  const a = await processMessage(pool, `!accept_proposal ${him.whatsapp_phone}`, her.avatar_uuid);
  assert(a.response.includes('unis'), 'acceptation : ' + a.response);
  return (await pool.query("SELECT * FROM t_marriages WHERE spouse_male_uuid = $1 AND status = 'active'", [him.avatar_uuid])).rows[0];
}

async function wallet(uuid) {
  return Number((await pool.query('SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1', [uuid])).rows[0].yrd_balance);
}

async function runMarriage() {
  await test('D85 — la demande est persistée et notifie la cible en privé (D91)', async () => {
    const { him, her } = await readyCouple();
    const r = await processMessage(pool, `!propose ${her.whatsapp_phone}`, him.avatar_uuid);
    assert(r.response.startsWith('💍 Demande envoyée'), r.response);
    const p = await pool.query('SELECT expires_at > NOW() + INTERVAL \'47 hours\' AS ok FROM t_marriage_proposals WHERE proposer_uuid = $1', [him.avatar_uuid]);
    assert(p.rows[0]?.ok, 'demande absente ou TTL incorrect');
    const n = await pool.query("SELECT 1 FROM t_notifications WHERE recipient_uuid = $1 AND event_type = 'MARRIAGE_PROPOSAL'", [her.avatar_uuid]);
    assert(n.rows.length === 1, 'cible non notifiée');
  });

  await test('D85 — une seule demande sortante', async () => {
    const { him, her } = await readyCouple();
    const other = await createAvatar({ gender: 'female' });
    await processMessage(pool, `!propose ${her.whatsapp_phone}`, him.avatar_uuid);
    const r = await processMessage(pool, `!propose ${other.whatsapp_phone}`, him.avatar_uuid);
    assert(r.response.includes('déjà une demande'), r.response);
  });

  await test('M1 — deux hommes ne peuvent pas se marier', async () => {
    const a = await createAvatar({ gender: 'male' });
    const b = await createAvatar({ gender: 'male' });
    await giveRing(a.avatar_uuid);
    const r = await processMessage(pool, `!propose ${b.whatsapp_phone}`, a.avatar_uuid);
    assert(r.response.includes('homme et une femme'), r.response);
  });

  await test('P1 — anneau du demandeur exigé', async () => {
    const him = await createAvatar({ gender: 'male' });
    const her = await createAvatar({ gender: 'female' });
    const r = await processMessage(pool, `!propose ${her.whatsapp_phone}`, him.avatar_uuid);
    assert(r.response.includes('Anneau'), r.response);
  });

  await test('P2/P5 — zones différentes : refus, la demande reste valable', async () => {
    const { him, her } = await readyCouple();
    await pool.query("UPDATE t_avatars SET current_zone_id = 'ZONE_NEU_CAP_001' WHERE avatar_uuid = $1", [her.avatar_uuid]);
    await processMessage(pool, `!propose ${her.whatsapp_phone}`, him.avatar_uuid);
    const r = await processMessage(pool, `!accept_proposal ${him.whatsapp_phone}`, her.avatar_uuid);
    assert(r.response.includes('même zone'), r.response);
    const p = await pool.query('SELECT 1 FROM t_marriage_proposals WHERE proposer_uuid = $1', [him.avatar_uuid]);
    assert(p.rows.length === 1, 'la demande a été supprimée malgré l\'échec');
  });

  await test('M3 — sans foyer, pas de mariage', async () => {
    const him = await createAvatar({ gender: 'male' });
    const her = await createAvatar({ gender: 'female' });
    await giveRing(him.avatar_uuid);
    await giveRing(her.avatar_uuid);
    await processMessage(pool, `!propose ${her.whatsapp_phone}`, him.avatar_uuid);
    const r = await processMessage(pool, `!accept_proposal ${him.whatsapp_phone}`, her.avatar_uuid);
    assert(r.response.includes('foyer'), r.response);
  });

  await test('P2 — cérémonie : contrat, anneaux consommés, coffre doublé, cadeau commun', async () => {
    const { him, her } = await readyCouple();
    const m = await marry(him, her);
    assert(m && m.ceremony_zone_id === 'ZONE_SYL_CAP_001' && m.home_property_uuid, JSON.stringify(m));
    const rings = await pool.query('SELECT 1 FROM t_inventory WHERE avatar_uuid = ANY($1) AND item_id = $2', [[him.avatar_uuid, her.avatar_uuid], RING]);
    assert(rings.rows.length === 0, 'anneaux non consommés');
    const v = await pool.query('SELECT max_slots, items_stored FROM t_bank_vaults WHERE vault_id = $1', [m.joint_vault_id]);
    assert(v.rows[0].max_slots === 100, 'coffre non doublé');
    assert(v.rows[0].items_stored.length === 1 && m.wedding_gift_item_id, 'cadeau absent');
    const gift = await pool.query('SELECT is_joint_earned FROM t_marriage_assets WHERE marriage_uuid = $1', [m.marriage_uuid]);
    assert(gift.rows[0]?.is_joint_earned === true, 'cadeau non commun');
    const left = await pool.query('SELECT 1 FROM t_marriage_proposals WHERE proposer_uuid = $1 OR target_uuid = $1', [him.avatar_uuid]);
    assert(left.rows.length === 0, 'demandes non purgées');
  });

  await test('M2 — un conjoint ne peut pas recevoir d\'autre demande', async () => {
    const { him, her } = await readyCouple();
    await marry(him, her);
    const rival = await createAvatar({ gender: 'male' });
    await giveRing(rival.avatar_uuid);
    const r = await processMessage(pool, `!propose ${her.whatsapp_phone}`, rival.avatar_uuid);
    assert(r.response.includes('déjà mariée'), r.response);
  });

  await test('M7/M5 — coffre conjugal puis divorce : chacun reprend ses apports, le commun est partagé', async () => {
    const { him, her } = await readyCouple();
    const m = await marry(him, her);
    const item = (await pool.query("SELECT item_id FROM t_items_dict WHERE max_stack > 1 ORDER BY item_id LIMIT 1")).rows[0].item_id;
    await pool.query('INSERT INTO t_inventory (avatar_uuid, item_id, quantity) VALUES ($1, $2, 3)', [her.avatar_uuid, item]);
    await processMessage(pool, '!joint_bank depot 1000', him.avatar_uuid);
    await processMessage(pool, `!joint_bank depot 3 ${item}`, her.avatar_uuid);
    await processMessage(pool, '!joint_pay 200', her.avatar_uuid);
    const himBefore = await wallet(him.avatar_uuid);
    const herBefore = await wallet(her.avatar_uuid);

    const ask = await processMessage(pool, '!divorce', her.avatar_uuid);
    assert(ask.menuShown, 'pas de confirmation : ' + ask.response);
    await bindMenuMessage(pool, her.avatar_uuid, 'WAMSG_DIV');
    const r = await processMessage(pool, '1', her.avatar_uuid, null, null, { quotedMessageId: 'WAMSG_DIV' });
    assert(r.response.includes('divorce est prononcé'), r.response);

    // Elle a retiré 200 : pris sur les apports de lui (elle n'avait pas de Yrds) → il récupère 800.
    assert(await wallet(him.avatar_uuid) === himBefore + 800, `lui : ${await wallet(him.avatar_uuid) - himBefore}`);
    assert(await wallet(her.avatar_uuid) === herBefore, 'elle ne devait récupérer aucun Yrd');
    const herItems = await pool.query('SELECT COALESCE(SUM(quantity),0)::int AS q FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2', [her.avatar_uuid, item]);
    assert(herItems.rows[0].q === 3, 'objets non rendus à leur contributrice');
    const giftOwner = await pool.query('SELECT avatar_uuid FROM t_inventory WHERE item_id = $1 AND avatar_uuid = ANY($2)', [m.wedding_gift_item_id, [him.avatar_uuid, her.avatar_uuid]]);
    assert(giftOwner.rows[0]?.avatar_uuid === him.avatar_uuid, 'cadeau indivisible : attendu chez le conjoint non demandeur');
    const status = await pool.query('SELECT status FROM t_marriages WHERE marriage_uuid = $1', [m.marriage_uuid]);
    assert(status.rows[0].status === 'divorced', 'statut non mis à jour');
  });

  await test('M5 — cooldown de 30 jours après un divorce', async () => {
    const { him, her } = await readyCouple();
    await marry(him, her);
    await processMessage(pool, '!divorce', him.avatar_uuid);
    await bindMenuMessage(pool, him.avatar_uuid, 'WAMSG_DIV2');
    await processMessage(pool, '1', him.avatar_uuid, null, null, { quotedMessageId: 'WAMSG_DIV2' });
    await giveRing(him.avatar_uuid);
    const r = await processMessage(pool, `!propose ${her.whatsapp_phone}`, him.avatar_uuid);
    assert(r.response.includes('30 jours'), r.response);
  });

  await test('D85 — la perte du foyer ne dissout pas le mariage', async () => {
    const { him, her } = await readyCouple();
    const m = await marry(him, her);
    await pool.query('DELETE FROM t_properties WHERE owner_avatar_uuid = $1', [him.avatar_uuid]);
    const after = await pool.query('SELECT status, home_property_uuid FROM t_marriages WHERE marriage_uuid = $1', [m.marriage_uuid]);
    assert(after.rows[0].status === 'active' && after.rows[0].home_property_uuid === null, JSON.stringify(after.rows[0]));
  });

  await test('Statut et message du conjoint', async () => {
    const { him, her } = await readyCouple();
    await marry(him, her);
    const s = await processMessage(pool, '!partner_status', him.avatar_uuid);
    assert(s.response.includes(her.avatar_name) && s.response.includes('PV'), s.response);
    await processMessage(pool, '!whisper_partner je t\'attends à Swilvane', him.avatar_uuid);
    const n = await pool.query("SELECT body FROM t_notifications WHERE recipient_uuid = $1 AND event_type = 'WHISPER_PARTNER'", [her.avatar_uuid]);
    assert(n.rows[0]?.body.includes('Swilvane'), 'message non transmis');
  });

  await test('SYS_MARRY — le GM ne contourne pas M1', async () => {
    const a = await createAvatar({ gender: 'female' });
    const b = await createAvatar({ gender: 'female' });
    const r = await executeCommand(pool, { command: 'SYS_MARRY', params: { player_a: a.avatar_uuid, player_b: b.avatar_uuid } }, 'gm');
    assert(!r.ok, 'deux femmes mariées par le GM');
  });

  await test('M6 — tier du cadeau selon la moyenne de niveau', async () => {
    assert(giftTierForLevel(15) === 1 && giftTierForLevel(40) === 2 && giftTierForLevel(100) === 5, 'grille incorrecte');
  });
}

async function run() {
  console.log('\n🔬 Social — genre (D86), coffres d\'objets, mariage (D85)\n');
  await runGender();
  await runVault();
  await runMarriage();
  await finish();
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
