// Mariage (D85, D-SOC-8→10) : T_MARRIAGE_PROPOSALS, T_MARRIAGES, T_MARRIAGE_ASSETS,
// coffre conjugal T_BANK_VAULTS(owner_type='marriage').
// Invariant de provenance : les lignes T_MARRIAGE_ASSETS décrivent exactement
// le contenu du coffre conjugal (tout dépôt en ajoute, tout retrait en consomme),
// ce qui rend le règlement de séparation (M5) direct.
import logger from '../utils/logger.js';
import config from '../config.js';
import { queueDirect } from '../services/notifications.js';
import { inTransaction, depositItemTx, withdrawItemTx, addToInventory, DEFAULT_MAX_SLOTS } from './bank.js';

export const RING_ITEM_ID = 'MSC_ENG_001';
export const MIN_LEVEL = 15;
export const DIVORCE_COOLDOWN_DAYS = 30;

async function lockAvatars(client, uuids) {
  // Ordre stable pour éviter l'interblocage entre deux acceptations croisées.
  const sorted = [...uuids].sort();
  const result = await client.query(
    `SELECT avatar_uuid, avatar_name, whatsapp_phone, gender, level, current_zone_id, yrd_balance
     FROM t_avatars WHERE avatar_uuid = ANY($1) ORDER BY avatar_uuid FOR UPDATE`,
    [sorted]
  );
  return new Map(result.rows.map(r => [r.avatar_uuid, r]));
}

async function hasRing(client, avatarUuid) {
  const r = await client.query(
    'SELECT 1 FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2 AND NOT is_equipped LIMIT 1',
    [avatarUuid, RING_ITEM_ID]
  );
  return r.rows.length > 0;
}

async function isMarried(client, avatarUuid) {
  const r = await client.query(
    "SELECT 1 FROM t_marriages WHERE status = 'active' AND (spouse_male_uuid = $1 OR spouse_female_uuid = $1)",
    [avatarUuid]
  );
  return r.rows.length > 0;
}

async function inDivorceCooldown(client, avatarUuid) {
  const r = await client.query(
    `SELECT 1 FROM t_marriages
     WHERE status = 'divorced' AND (spouse_male_uuid = $1 OR spouse_female_uuid = $1)
       AND divorced_at > NOW() - make_interval(days => $2)`,
    [avatarUuid, DIVORCE_COOLDOWN_DAYS]
  );
  return r.rows.length > 0;
}

function complementary(a, b) {
  const genders = [a.gender, b.gender].sort().join('+');
  return genders === 'female+male';
}

// P1 : contrôles rapides à la demande (à distance, pas d'exigence de lieu).
async function proposalBlocker(client, proposer, target) {
  if (!complementary(proposer, target)) return 'GENDERS';
  if (await isMarried(client, proposer.avatar_uuid)) return 'PROPOSER_MARRIED';
  if (await isMarried(client, target.avatar_uuid)) return 'TARGET_MARRIED';
  if (proposer.level < MIN_LEVEL) return 'PROPOSER_LEVEL';
  if (!(await hasRing(client, proposer.avatar_uuid))) return 'PROPOSER_RING';
  if (await inDivorceCooldown(client, proposer.avatar_uuid)) return 'PROPOSER_COOLDOWN';
  if (await inDivorceCooldown(client, target.avatar_uuid)) return 'TARGET_COOLDOWN';
  return null;
}

async function findAvatarByPhone(client, phone) {
  const r = await client.query('SELECT avatar_uuid FROM t_avatars WHERE whatsapp_phone = $1', [phone]);
  return r.rows[0]?.avatar_uuid || null;
}

export async function propose(db, proposerUuid, targetPhone) {
  return inTransaction(db, 'Erreur lors d\'une demande en mariage', { proposerUuid }, async (client) => {
    const targetUuid = await findAvatarByPhone(client, targetPhone);
    if (!targetUuid) return { success: false, error: 'TARGET_NOT_FOUND' };
    if (targetUuid === proposerUuid) return { success: false, error: 'SELF' };

    const avatars = await lockAvatars(client, [proposerUuid, targetUuid]);
    const proposer = avatars.get(proposerUuid);
    const target = avatars.get(targetUuid);

    // Une demande expirée ne bloque plus : elle est purgée à la volée.
    await client.query('DELETE FROM t_marriage_proposals WHERE proposer_uuid = $1 AND expires_at <= NOW()', [proposerUuid]);
    const pending = await client.query('SELECT 1 FROM t_marriage_proposals WHERE proposer_uuid = $1', [proposerUuid]);
    if (pending.rows.length) return { success: false, error: 'PROPOSAL_EXISTS' };

    const blocker = await proposalBlocker(client, proposer, target);
    if (blocker) return { success: false, error: blocker };

    await client.query(
      `INSERT INTO t_marriage_proposals (proposer_uuid, target_uuid, expires_at)
       VALUES ($1, $2, NOW() + make_interval(hours => $3))`,
      [proposerUuid, targetUuid, config.game.proposalTtlHours]
    );
    await queueDirect(client, targetUuid,
      `💍 **${proposer.avatar_name}** te demande en mariage ! La demande est valable ${config.game.proposalTtlHours} h. ` +
      `Retrouvez-vous dans la même zone, puis réponds dans ton groupe : "!accept_proposal ${proposer.whatsapp_phone}" ` +
      `ou "!decline_proposal ${proposer.whatsapp_phone}".`,
      'MARRIAGE_PROPOSAL');
    return { success: true, targetName: target.avatar_name };
  });
}

export async function listIncomingProposals(db, targetUuid) {
  const r = await db.query(
    `SELECT p.proposal_uuid, a.avatar_uuid, a.avatar_name, a.whatsapp_phone, p.expires_at
     FROM t_marriage_proposals p JOIN t_avatars a ON a.avatar_uuid = p.proposer_uuid
     WHERE p.target_uuid = $1 AND p.expires_at > NOW()
     ORDER BY p.proposed_at`,
    [targetUuid]
  );
  return r.rows;
}

// Foyer (M3) : au moins un des deux détient un logement actif (possédé, ou loué et à jour).
async function findHome(client, uuids) {
  const r = await client.query(
    `SELECT property_uuid FROM t_properties
     WHERE owner_avatar_uuid = ANY($1) AND (tenure = 'own' OR paid_until > NOW())
     ORDER BY acquired_at LIMIT 1`,
    [uuids]
  );
  return r.rows[0]?.property_uuid || null;
}

async function consumeRing(client, avatarUuid) {
  const r = await client.query(
    `SELECT instance_uuid, quantity FROM t_inventory
     WHERE avatar_uuid = $1 AND item_id = $2 AND NOT is_equipped
     ORDER BY acquired_at LIMIT 1 FOR UPDATE`,
    [avatarUuid, RING_ITEM_ID]
  );
  const row = r.rows[0];
  if (row.quantity > 1) {
    await client.query('UPDATE t_inventory SET quantity = quantity - 1 WHERE instance_uuid = $1', [row.instance_uuid]);
  } else {
    await client.query('DELETE FROM t_inventory WHERE instance_uuid = $1', [row.instance_uuid]);
  }
}

// M6 : tier du cadeau = fonction de la moyenne des niveaux (1-20 → T1 … 81-100 → T5).
export function giftTierForLevel(avgLevel) {
  return Math.min(5, Math.max(1, Math.ceil(avgLevel / 20)));
}

async function generateWeddingGift(client, marriageUuid, avgLevel) {
  const tier = giftTierForLevel(avgLevel);
  const pick = await client.query(
    `SELECT item_id FROM t_items_dict
     WHERE item_type IN ('WPN','ARM') AND tier = $1 AND buy_price > 0
     ORDER BY random() LIMIT 1`,
    [tier]
  );
  const itemId = pick.rows[0]?.item_id;
  if (!itemId) return null;

  const dict = await client.query('SELECT durability_max FROM t_items_dict WHERE item_id = $1', [itemId]);
  const durability = dict.rows[0].durability_max || null;
  const vault = await client.query(
    "SELECT vault_id, items_stored FROM t_bank_vaults WHERE owner_type = 'marriage' AND owner_id = $1 FOR UPDATE",
    [marriageUuid]
  );
  const items = [...(vault.rows[0].items_stored || []),
    { item_id: itemId, qty: 1, current_durability: durability, durability_cap: null, repair_count: 0 }];
  await client.query('UPDATE t_bank_vaults SET items_stored = $1 WHERE vault_id = $2', [JSON.stringify(items), vault.rows[0].vault_id]);

  const marriage = await client.query('SELECT spouse_male_uuid FROM t_marriages WHERE marriage_uuid = $1', [marriageUuid]);
  // Bien acquis en commun : attribué au couple (split 50/50 au divorce, M5).
  await client.query(
    `INSERT INTO t_marriage_assets (marriage_uuid, contributor_uuid, asset_type, item_id, qty, is_joint_earned)
     VALUES ($1, $2, 'item', $3, 1, TRUE)`,
    [marriageUuid, marriage.rows[0].spouse_male_uuid, itemId]
  );
  await client.query('UPDATE t_marriages SET wedding_gift_item_id = $1 WHERE marriage_uuid = $2', [itemId, marriageUuid]);
  return itemId;
}

// Crée le contrat, le coffre conjugal (M4) et le cadeau (M6), dans la transaction appelante.
async function createMarriage(client, a, b, { zoneId = null, homeUuid = null } = {}) {
  const male = a.gender === 'male' ? a : b;
  const female = a.gender === 'male' ? b : a;
  const avgLevel = Math.round((a.level + b.level) / 2);
  const m = await client.query(
    `INSERT INTO t_marriages (spouse_male_uuid, spouse_female_uuid, ceremony_zone_id, home_property_uuid, avg_level_at_wedding)
     VALUES ($1, $2, $3, $4, $5) RETURNING marriage_uuid`,
    [male.avatar_uuid, female.avatar_uuid, zoneId, homeUuid, avgLevel]
  );
  const marriageUuid = m.rows[0].marriage_uuid;
  const vault = await client.query(
    `INSERT INTO t_bank_vaults (owner_type, owner_id, max_slots, access_level)
     VALUES ('marriage', $1, $2, 'all_members') RETURNING vault_id`,
    [marriageUuid, DEFAULT_MAX_SLOTS * 2]
  );
  await client.query('UPDATE t_marriages SET joint_vault_id = $1 WHERE marriage_uuid = $2', [vault.rows[0].vault_id, marriageUuid]);
  const giftItemId = await generateWeddingGift(client, marriageUuid, avgLevel);
  // Une union scellée clôt toutes les autres demandes des deux conjoints.
  await client.query(
    'DELETE FROM t_marriage_proposals WHERE proposer_uuid = ANY($1) OR target_uuid = ANY($1)',
    [[a.avatar_uuid, b.avatar_uuid]]
  );
  return { marriageUuid, giftItemId };
}

// P2 : acceptation en personne, tout M1-M3 revérifié sous verrou. Un échec
// laisse la demande intacte (P5). isInCombat(uuid) est fourni par l'appelant.
export async function acceptProposal(db, targetUuid, proposerPhone, isInCombat) {
  const incoming = await listIncomingProposals(db, targetUuid);
  if (incoming.length === 0) return { success: false, error: 'NO_PROPOSAL' };
  let chosen = incoming[0];
  if (proposerPhone) {
    chosen = incoming.find(p => p.whatsapp_phone === proposerPhone);
    if (!chosen) return { success: false, error: 'NO_PROPOSAL' };
  } else if (incoming.length > 1) {
    return { success: false, error: 'AMBIGUOUS', proposals: incoming };
  }
  const proposerUuid = chosen.avatar_uuid;

  return inTransaction(db, 'Erreur lors de la cérémonie de mariage', { targetUuid, proposerUuid }, async (client) => {
    const avatars = await lockAvatars(client, [proposerUuid, targetUuid]);
    const proposer = avatars.get(proposerUuid);
    const target = avatars.get(targetUuid);

    const still = await client.query(
      'SELECT 1 FROM t_marriage_proposals WHERE proposer_uuid = $1 AND target_uuid = $2 AND expires_at > NOW() FOR UPDATE',
      [proposerUuid, targetUuid]
    );
    if (!still.rows.length) return { success: false, error: 'NO_PROPOSAL' };

    const blocker = await proposalBlocker(client, proposer, target);
    if (blocker) return { success: false, error: blocker };
    if (target.level < MIN_LEVEL) return { success: false, error: 'TARGET_LEVEL' };
    if (!(await hasRing(client, targetUuid))) return { success: false, error: 'TARGET_RING' };
    if (proposer.current_zone_id !== target.current_zone_id) return { success: false, error: 'NOT_SAME_ZONE' };
    if (isInCombat(proposerUuid) || isInCombat(targetUuid)) return { success: false, error: 'IN_COMBAT' };
    const homeUuid = await findHome(client, [proposerUuid, targetUuid]);
    if (!homeUuid) return { success: false, error: 'NO_HOME' };

    await consumeRing(client, proposerUuid);
    await consumeRing(client, targetUuid);
    const { marriageUuid, giftItemId } = await createMarriage(client, proposer, target, {
      zoneId: target.current_zone_id, homeUuid,
    });
    await queueDirect(client, proposerUuid,
      `💍 **${target.avatar_name}** a accepté ta demande : vous êtes unis !`, 'MARRIAGE_ACCEPTED');
    logger.info('Mariage célébré', { marriageUuid, proposerUuid, targetUuid });
    return { success: true, marriageUuid, giftItemId, partnerName: proposer.avatar_name };
  });
}

export async function declineProposal(db, targetUuid, proposerPhone) {
  return inTransaction(db, 'Erreur lors d\'un refus de demande', { targetUuid }, async (client) => {
    const r = await client.query(
      `DELETE FROM t_marriage_proposals p USING t_avatars a
       WHERE a.avatar_uuid = p.proposer_uuid AND p.target_uuid = $1 AND a.whatsapp_phone = $2
       RETURNING p.proposer_uuid`,
      [targetUuid, proposerPhone]
    );
    if (!r.rows.length) return { success: false, error: 'NO_PROPOSAL' };
    const target = await client.query('SELECT avatar_name FROM t_avatars WHERE avatar_uuid = $1', [targetUuid]);
    await queueDirect(client, r.rows[0].proposer_uuid,
      `💔 **${target.rows[0].avatar_name}** a décliné ta demande en mariage.`, 'MARRIAGE_DECLINED');
    return { success: true };
  });
}

export async function cancelProposal(db, proposerUuid) {
  const r = await db.query('DELETE FROM t_marriage_proposals WHERE proposer_uuid = $1 RETURNING target_uuid', [proposerUuid]);
  return r.rows.length ? { success: true } : { success: false, error: 'NO_PROPOSAL' };
}

export async function getActiveMarriage(db, avatarUuid) {
  const r = await db.query(
    `SELECT m.marriage_uuid, m.married_at, m.joint_vault_id, m.home_property_uuid,
            p.avatar_uuid AS partner_uuid, p.avatar_name AS partner_name, p.level AS partner_level,
            p.hp_current, p.hp_max, p.mp_current, p.mp_max, p.stamina_current, p.stamina_max,
            z.zone_name AS partner_zone
     FROM t_marriages m
     JOIN t_avatars p ON p.avatar_uuid = CASE WHEN m.spouse_male_uuid = $1 THEN m.spouse_female_uuid ELSE m.spouse_male_uuid END
     JOIN t_zones z ON z.zone_id = p.current_zone_id
     WHERE m.status = 'active' AND (m.spouse_male_uuid = $1 OR m.spouse_female_uuid = $1)`,
    [avatarUuid]
  );
  return r.rows[0] || null;
}

// ─── Coffre conjugal (M4, M7) ───

async function lockActiveMarriage(client, avatarUuid) {
  const r = await client.query(
    `SELECT marriage_uuid FROM t_marriages
     WHERE status = 'active' AND (spouse_male_uuid = $1 OR spouse_female_uuid = $1) FOR UPDATE`,
    [avatarUuid]
  );
  return r.rows[0]?.marriage_uuid || null;
}

async function recordContribution(client, marriageUuid, contributorUuid, assetType, itemId, qty) {
  await client.query(
    `INSERT INTO t_marriage_assets (marriage_uuid, contributor_uuid, asset_type, item_id, qty)
     VALUES ($1, $2, $3, $4, $5)`,
    [marriageUuid, contributorUuid, assetType, itemId, qty]
  );
}

// Un retrait consomme d'abord les apports du retirant, puis le commun, puis
// ceux du conjoint : le registre reste égal au contenu du coffre.
async function consumeProvenance(client, marriageUuid, withdrawerUuid, assetType, itemId, qty) {
  const rows = await client.query(
    `SELECT ctid, qty FROM t_marriage_assets
     WHERE marriage_uuid = $1 AND asset_type = $2 AND item_id IS NOT DISTINCT FROM $3
     ORDER BY CASE WHEN contributor_uuid = $4 AND NOT is_joint_earned THEN 0
                   WHEN is_joint_earned THEN 1 ELSE 2 END, contributed_at
     FOR UPDATE`,
    [marriageUuid, assetType, itemId, withdrawerUuid]
  );
  let remaining = qty;
  for (const row of rows.rows) {
    if (remaining === 0) break;
    const n = Math.min(remaining, Number(row.qty));
    if (n === Number(row.qty)) {
      await client.query('DELETE FROM t_marriage_assets WHERE ctid = $1', [row.ctid]);
    } else {
      await client.query('UPDATE t_marriage_assets SET qty = qty - $1 WHERE ctid = $2', [n, row.ctid]);
    }
    remaining -= n;
  }
}

export async function jointDepositYrds(db, avatarUuid, amount) {
  if (!(amount > 0)) return { success: false, error: 'INVALID_AMOUNT' };
  return inTransaction(db, 'Erreur lors d\'un dépôt conjugal', { avatarUuid }, async (client) => {
    const marriageUuid = await lockActiveMarriage(client, avatarUuid);
    if (!marriageUuid) return { success: false, error: 'NOT_MARRIED' };
    const wallet = await client.query('SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE', [avatarUuid]);
    if (Number(wallet.rows[0].yrd_balance) < amount) {
      return { success: false, error: 'INSUFFICIENT_FUNDS', available: Number(wallet.rows[0].yrd_balance) };
    }
    await client.query('UPDATE t_avatars SET yrd_balance = yrd_balance - $1 WHERE avatar_uuid = $2', [amount, avatarUuid]);
    await client.query(
      "UPDATE t_bank_vaults SET yrds_stored = yrds_stored + $1, last_accessed = NOW() WHERE owner_type = 'marriage' AND owner_id = $2",
      [amount, marriageUuid]
    );
    await recordContribution(client, marriageUuid, avatarUuid, 'yrds', null, amount);
    return { success: true, amount };
  });
}

// !joint_pay : dépense du solde commun, versée au portefeuille du conjoint qui paie.
export async function jointPay(db, avatarUuid, amount) {
  if (!(amount > 0)) return { success: false, error: 'INVALID_AMOUNT' };
  return inTransaction(db, 'Erreur lors d\'une dépense conjugale', { avatarUuid }, async (client) => {
    const marriageUuid = await lockActiveMarriage(client, avatarUuid);
    if (!marriageUuid) return { success: false, error: 'NOT_MARRIED' };
    const vault = await client.query(
      "SELECT vault_id, yrds_stored FROM t_bank_vaults WHERE owner_type = 'marriage' AND owner_id = $1 FOR UPDATE",
      [marriageUuid]
    );
    if (Number(vault.rows[0].yrds_stored) < amount) {
      return { success: false, error: 'INSUFFICIENT_VAULT_FUNDS', available: Number(vault.rows[0].yrds_stored) };
    }
    await client.query('UPDATE t_bank_vaults SET yrds_stored = yrds_stored - $1, last_accessed = NOW() WHERE vault_id = $2', [amount, vault.rows[0].vault_id]);
    await client.query('UPDATE t_avatars SET yrd_balance = yrd_balance + $1 WHERE avatar_uuid = $2', [amount, avatarUuid]);
    await consumeProvenance(client, marriageUuid, avatarUuid, 'yrds', null, amount);
    return { success: true, amount };
  });
}

export async function jointDepositItem(db, avatarUuid, itemId, qty) {
  return inTransaction(db, 'Erreur lors d\'un dépôt d\'objet conjugal', { avatarUuid, itemId }, async (client) => {
    const marriageUuid = await lockActiveMarriage(client, avatarUuid);
    if (!marriageUuid) return { success: false, error: 'NOT_MARRIED' };
    return depositItemTx(client, avatarUuid, itemId, qty, { ownerType: 'marriage', ownerId: marriageUuid },
      (c) => recordContribution(c, marriageUuid, avatarUuid, 'item', itemId, qty));
  });
}

export async function jointWithdrawItem(db, avatarUuid, itemId, qty) {
  return inTransaction(db, 'Erreur lors d\'un retrait d\'objet conjugal', { avatarUuid, itemId }, async (client) => {
    const marriageUuid = await lockActiveMarriage(client, avatarUuid);
    if (!marriageUuid) return { success: false, error: 'NOT_MARRIED' };
    const result = await withdrawItemTx(client, avatarUuid, itemId, qty, { ownerType: 'marriage', ownerId: marriageUuid });
    if (result.success) await consumeProvenance(client, marriageUuid, avatarUuid, 'item', itemId, qty);
    return result;
  });
}

export async function getJointVault(db, avatarUuid) {
  const marriage = await getActiveMarriage(db, avatarUuid);
  if (!marriage) return null;
  const v = await db.query(
    `SELECT v.yrds_stored, v.max_slots, COALESCE(
       (SELECT json_agg(json_build_object('item_id', e->>'item_id', 'name', d.name, 'qty', (e->>'qty')::int))
        FROM jsonb_array_elements(v.items_stored) e JOIN t_items_dict d ON d.item_id = e->>'item_id'), '[]') AS items
     FROM t_bank_vaults v WHERE v.owner_type = 'marriage' AND v.owner_id = $1`,
    [marriage.marriage_uuid]
  );
  return { marriage, yrdsStored: Number(v.rows[0].yrds_stored), maxSlots: v.rows[0].max_slots, items: v.rows[0].items };
}

// ─── Séparation (M5) ───

// Règlement dans la transaction appelante. Apports individuels rendus au
// contributeur ; commun partagé 50/50 — unité impaire (Yrd ou objet
// indivisible) attribuée au conjoint qui n'a pas demandé la séparation.
export async function settleDivorce(client, marriageUuid, initiatorUuid = null) {
  const m = await client.query(
    "SELECT spouse_male_uuid, spouse_female_uuid FROM t_marriages WHERE marriage_uuid = $1 AND status = 'active' FOR UPDATE",
    [marriageUuid]
  );
  if (!m.rows.length) return { success: false, error: 'NOT_MARRIED' };
  const { spouse_male_uuid: male, spouse_female_uuid: female } = m.rows[0];
  const first = initiatorUuid === male ? female : male;
  const second = first === male ? female : male;

  const vault = await client.query(
    "SELECT vault_id, items_stored FROM t_bank_vaults WHERE owner_type = 'marriage' AND owner_id = $1 FOR UPDATE",
    [marriageUuid]
  );
  const stored = vault.rows[0]?.items_stored || [];
  // États d'instance (durabilité) conservés : chaque unité rendue reprend un état du coffre.
  const takeState = (itemId) => {
    const e = stored.find(x => x.item_id === itemId && x.qty > 0);
    if (!e) return { item_id: itemId };
    e.qty -= 1;
    return e;
  };
  const giveItem = (to, itemId) => {
    const s = takeState(itemId);
    return addToInventory(client, to, { item_id: itemId, qty: 1, current_durability: s.current_durability, durability_cap: s.durability_cap, repair_count: s.repair_count }, 'divorce');
  };
  const giveYrds = (to, n) => n > 0 && client.query('UPDATE t_avatars SET yrd_balance = yrd_balance + $1 WHERE avatar_uuid = $2', [n, to]);

  const assets = await client.query(
    'SELECT contributor_uuid, asset_type, item_id, qty, is_joint_earned FROM t_marriage_assets WHERE marriage_uuid = $1 ORDER BY contributed_at',
    [marriageUuid]
  );
  let jointYrds = 0;
  let turn = 0;
  for (const a of assets.rows) {
    const qty = Number(a.qty);
    if (a.asset_type === 'yrds') {
      if (a.is_joint_earned) jointYrds += qty;
      else await giveYrds(a.contributor_uuid, qty);
      continue;
    }
    for (let i = 0; i < qty; i++) {
      const to = a.is_joint_earned ? (turn++ % 2 === 0 ? first : second) : a.contributor_uuid;
      await giveItem(to, a.item_id);
    }
  }
  await giveYrds(first, Math.ceil(jointYrds / 2));
  await giveYrds(second, Math.floor(jointYrds / 2));

  await client.query('DELETE FROM t_marriage_assets WHERE marriage_uuid = $1', [marriageUuid]);
  await client.query(
    "UPDATE t_bank_vaults SET yrds_stored = 0, items_stored = '[]'::jsonb, access_level = 'closed' WHERE owner_type = 'marriage' AND owner_id = $1",
    [marriageUuid]
  );
  await client.query("UPDATE t_marriages SET status = 'divorced', divorced_at = NOW() WHERE marriage_uuid = $1", [marriageUuid]);
  return { success: true, male, female };
}

export async function divorce(db, avatarUuid) {
  return inTransaction(db, 'Erreur lors d\'un divorce', { avatarUuid }, async (client) => {
    const marriageUuid = await lockActiveMarriage(client, avatarUuid);
    if (!marriageUuid) return { success: false, error: 'NOT_MARRIED' };
    const result = await settleDivorce(client, marriageUuid, avatarUuid);
    const partner = result.male === avatarUuid ? result.female : result.male;
    const me = await client.query('SELECT avatar_name FROM t_avatars WHERE avatar_uuid = $1', [avatarUuid]);
    await queueDirect(client, partner,
      `💔 **${me.rows[0].avatar_name}** a demandé la séparation. Le divorce est prononcé ; tes apports t'ont été rendus.`,
      'DIVORCE');
    return result;
  });
}

// GM (!sys_marry) : court-circuite le flux (anneaux, niveau, lieu, foyer) mais
// jamais les invariants M1 (homme + femme) et M2 (monogamie).
export async function forceMarriage(client, uuidA, uuidB) {
  const avatars = await lockAvatars(client, [uuidA, uuidB]);
  const a = avatars.get(uuidA);
  const b = avatars.get(uuidB);
  if (!a || !b) return { success: false, error: 'AVATAR_NOT_FOUND' };
  if (!complementary(a, b)) return { success: false, error: 'GENDERS' };
  if (await isMarried(client, uuidA) || await isMarried(client, uuidB)) return { success: false, error: 'ALREADY_MARRIED' };
  const created = await createMarriage(client, a, b);
  return { success: true, ...created };
}

export async function generateGiftIfMissing(client, marriageUuid) {
  const m = await client.query(
    "SELECT avg_level_at_wedding, wedding_gift_item_id FROM t_marriages WHERE marriage_uuid = $1 AND status = 'active' FOR UPDATE",
    [marriageUuid]
  );
  if (!m.rows.length) return { success: false, error: 'NOT_MARRIED' };
  if (m.rows[0].wedding_gift_item_id) return { success: false, error: 'GIFT_EXISTS' };
  const itemId = await generateWeddingGift(client, marriageUuid, m.rows[0].avg_level_at_wedding || 1);
  return itemId ? { success: true, itemId } : { success: false, error: 'NO_GIFT_ITEM' };
}

export default {
  propose, listIncomingProposals, acceptProposal, declineProposal, cancelProposal, getActiveMarriage,
  jointDepositYrds, jointPay, jointDepositItem, jointWithdrawItem, getJointVault, settleDivorce, divorce, forceMarriage,
};
