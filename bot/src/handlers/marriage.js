import {
  propose, listIncomingProposals, acceptProposal, declineProposal, cancelProposal, getActiveMarriage,
  jointDepositYrds, jointPay, jointDepositItem, jointWithdrawItem, getJointVault, divorce, MIN_LEVEL,
} from '../engine/marriage.js';
import { findItem } from '../engine/items.js';
import { getCombatStatus } from './combat.js';
import { confirmationMenu } from '../services/menus.js';
import { queueDirect } from '../services/notifications.js';

const ERRORS = {
  TARGET_NOT_FOUND: '❌ Aucun joueur inscrit avec ce numéro.',
  SELF: '❌ Tu ne peux pas te demander toi-même en mariage.',
  PROPOSAL_EXISTS: '❌ Tu as déjà une demande en cours — retire-la d\'abord ("!cancel_proposal").',
  GENDERS: '❌ Le mariage unit un homme et une femme.',
  PROPOSER_MARRIED: '❌ Tu es déjà marié(e).',
  TARGET_MARRIED: '❌ Cette personne est déjà mariée.',
  PROPOSER_LEVEL: `❌ Il faut être niveau ${MIN_LEVEL} pour demander quelqu'un en mariage.`,
  TARGET_LEVEL: `❌ Il faut être niveau ${MIN_LEVEL} pour se marier.`,
  PROPOSER_RING: '❌ Le demandeur doit posséder un Anneau d\'Engagement (MSC_ENG_001, chez un bijoutier).',
  TARGET_RING: '❌ Il te faut toi aussi un Anneau d\'Engagement (MSC_ENG_001, chez un bijoutier).',
  PROPOSER_COOLDOWN: '❌ Un divorce de moins de 30 jours empêche une nouvelle union (demandeur).',
  TARGET_COOLDOWN: '❌ Un divorce de moins de 30 jours empêche une nouvelle union.',
  NO_PROPOSAL: '❌ Aucune demande en mariage correspondante en cours.',
  NOT_SAME_ZONE: '❌ Vous devez vous trouver tous les deux dans la même zone. La demande reste valable.',
  IN_COMBAT: '❌ Impossible pendant un combat. La demande reste valable.',
  NO_HOME: '❌ Il faut au moins un foyer (logement possédé ou loué à jour) pour se marier. La demande reste valable.',
  NOT_MARRIED: '❌ Tu n\'es pas marié(e).',
  INSUFFICIENT_FUNDS: '❌ Fonds insuffisants sur toi.',
  INSUFFICIENT_VAULT_FUNDS: '❌ Solde commun insuffisant.',
  INVALID_AMOUNT: '❌ Montant invalide.',
  NOT_OWNED: '❌ Tu ne possèdes pas cet objet.',
  EQUIPPED: '❌ Cet objet est équipé — retire-le d\'abord.',
  BOUND_ITEM: '❌ Un objet lié à ton âme ne va pas au coffre.',
  VAULT_FULL: '❌ Le coffre conjugal est plein.',
  NOT_IN_VAULT: '❌ Cet objet n\'est pas (ou pas en quantité suffisante) dans le coffre conjugal.',
  INSUFFICIENT_QUANTITY: '❌ Quantité insuffisante.',
};
const fail = (result) => ERRORS[result.error] || '❌ Action impossible.';

const PHONE_RE = /(\d{6,15})/;
const ITEM_ARG_RE = /(?:depot|dépôt|retrait)\s+(?:(\d+)\s*x?\s+)?(\D.*)$/i;

async function handleJointBank(db, playerId, raw) {
  const itemArg = raw.match(ITEM_ARG_RE);
  if (itemArg) {
    const item = await findItem(db, itemArg[2].trim());
    if (!item) return `❌ Aucun objet ne correspond à "${itemArg[2].trim()}".`;
    const qty = itemArg[1] ? parseInt(itemArg[1], 10) : 1;
    const deposit = /depot|dépôt/i.test(raw);
    const r = deposit
      ? await jointDepositItem(db, playerId, item.item_id, qty)
      : await jointWithdrawItem(db, playerId, item.item_id, qty);
    if (!r.success) return fail(r);
    return `💞 ${qty}× **${item.name}** ${deposit ? 'déposé(s) au' : 'retiré(s) du'} coffre conjugal.`;
  }
  const amount = parseInt(raw.match(/depot\s+(\d+)/i)?.[1] || '', 10);
  if (/depot|dépôt/i.test(raw)) {
    const r = await jointDepositYrds(db, playerId, amount);
    return r.success ? `💞 ${r.amount} Yrds versés au solde commun.` : fail(r);
  }

  const vault = await getJointVault(db, playerId);
  if (!vault) return ERRORS.NOT_MARRIED;
  const items = vault.items.length ? vault.items.map(i => `• ${i.qty}× ${i.name}`).join('\n') : '• (vide)';
  return `💞 **Coffre conjugal** (avec ${vault.marriage.partner_name})\nSolde commun : ${vault.yrdsStored} Yrds\nObjets (${vault.items.length}/${vault.maxSlots}) :\n${items}\n\n` +
    `"!joint_bank depot [Montant]" · "!joint_bank depot [Qté] [Objet]" · "!joint_bank retrait [Qté] [Objet]" · "!joint_pay [Montant]"`;
}

export async function handleMarriage(db, playerId, raw = '', { confirmed = false } = {}) {
  const command = raw.trim().replace(/^!/, '').split(/\s+/)[0].toLowerCase();
  const phone = raw.match(PHONE_RE)?.[1] || null;

  switch (command) {
    case 'propose': {
      if (!phone) return '💍 Utilisation : "!propose [Numéro WhatsApp]".';
      const r = await propose(db, playerId, phone);
      return r.success ? `💍 Demande envoyée à **${r.targetName}**. Elle a 48 h pour l'accepter, en ta présence.` : fail(r);
    }
    case 'accept_proposal': {
      const r = await acceptProposal(db, playerId, phone, (uuid) => !!getCombatStatus(uuid));
      if (r.success) return `💍 Vous êtes unis, **${r.partnerName}** et toi ! Le coffre conjugal est ouvert ("!joint_bank") et un cadeau de noces y a été déposé.`;
      if (r.error === 'AMBIGUOUS') {
        const list = r.proposals.map(p => `• ${p.avatar_name} — "!accept_proposal ${p.whatsapp_phone}"`).join('\n');
        return `💍 Plusieurs demandes en cours :\n${list}`;
      }
      return fail(r);
    }
    case 'decline_proposal': {
      if (!phone) {
        const incoming = await listIncomingProposals(db, playerId);
        if (!incoming.length) return ERRORS.NO_PROPOSAL;
        return `💍 Précise la demande : ${incoming.map(p => `"!decline_proposal ${p.whatsapp_phone}" (${p.avatar_name})`).join(' · ')}`;
      }
      const r = await declineProposal(db, playerId, phone);
      return r.success ? '💍 Demande déclinée.' : fail(r);
    }
    case 'cancel_proposal': {
      const r = await cancelProposal(db, playerId);
      return r.success ? '💍 Ta demande a été retirée.' : fail(r);
    }
    case 'divorce': {
      const marriage = await getActiveMarriage(db, playerId);
      if (!marriage) return ERRORS.NOT_MARRIED;
      // D92 : dissolution ⇒ confirmation citée ; divorce() revérifie sous verrou.
      if (!confirmed) {
        return {
          text: `⚠️ Tu vas **divorcer** de **${marriage.partner_name}**. Chacun reprend ses apports, le commun est partagé, et aucune nouvelle union n'est possible pendant 30 jours.`,
          menu: confirmationMenu('!divorce', marriage.marriage_uuid),
        };
      }
      const r = await divorce(db, playerId);
      return r.success ? '💔 Le divorce est prononcé. Tes apports t\'ont été rendus.' : fail(r);
    }
    case 'joint_bank':
    case 'partner_bank':
      return handleJointBank(db, playerId, raw);
    case 'joint_pay': {
      const amount = parseInt(raw.match(/(\d+)/)?.[1] || '', 10);
      const r = await jointPay(db, playerId, amount);
      return r.success ? `💞 ${r.amount} Yrds prélevés sur le solde commun.` : fail(r);
    }
    case 'partner_status': {
      const m = await getActiveMarriage(db, playerId);
      if (!m) return ERRORS.NOT_MARRIED;
      return `💞 **${m.partner_name}** — Niv. ${m.partner_level}\nPV ${m.hp_current}/${m.hp_max} · PM ${m.mp_current}/${m.mp_max} · Endurance ${m.stamina_current}/${m.stamina_max}\nZone : ${m.partner_zone}`;
    }
    case 'partner_locate': {
      const m = await getActiveMarriage(db, playerId);
      if (!m) return ERRORS.NOT_MARRIED;
      return `📍 **${m.partner_name}** se trouve à : ${m.partner_zone}.`;
    }
    case 'whisper_partner': {
      const m = await getActiveMarriage(db, playerId);
      if (!m) return ERRORS.NOT_MARRIED;
      const message = raw.replace(/^!?whisper_partner\s*/i, '').trim();
      if (!message) return '💞 Utilisation : "!whisper_partner [Message]".';
      const me = await db.query('SELECT avatar_name FROM t_avatars WHERE avatar_uuid = $1', [playerId]);
      await queueDirect(db, m.partner_uuid, `💞 ${me.rows[0].avatar_name} : ${message}`, 'WHISPER_PARTNER');
      return `💞 Message transmis à **${m.partner_name}**.`;
    }
    default: {
      const m = await getActiveMarriage(db, playerId);
      if (m) return `💞 Marié(e) à **${m.partner_name}** depuis le ${new Date(m.married_at).toLocaleDateString('fr-FR')}.`;
      const incoming = await listIncomingProposals(db, playerId);
      if (incoming.length) return `💍 Demande(s) reçue(s) : ${incoming.map(p => p.avatar_name).join(', ')}. "!accept_proposal [Num]" en sa présence.`;
      return `💍 Tu n'es pas marié(e). "!propose [Numéro]" pour faire ta demande (niveau ${MIN_LEVEL}, Anneau d'Engagement).`;
    }
  }
}

export default { handleMarriage };
