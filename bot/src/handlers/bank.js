import { getVaultStatus, depositYrds, withdrawYrds, depositItem, withdrawItem, listVaultItems } from '../engine/bank.js';
import { findItem } from '../engine/items.js';
import { getPlayer } from '../services/player.js';
import { render } from '../services/template.js';
import { pct } from '../services/cardRenderer.js';

const DEPOSIT_RE = /d[ée]pos|d[ée]p[ôo]t|verse|deposit/i;
const WITHDRAW_RE = /retir|retrait|withdraw/i;
// « !bank_depot [Qté] [Objet] » : un argument non numérique désigne un objet.
const ITEM_ARG_RE = /(?:d[ée]pos\w*|d[ée]p[ôo]t|verse\w*|deposit|retir\w*|retrait|withdraw)\s+(?:(\d+)\s*x?\s+)?(\D.*)$/i;
const ITEM_ERRORS = {
  NOT_OWNED: '❌ Tu ne possèdes pas cet objet.',
  EQUIPPED: '❌ Cet objet est équipé — retire-le d\'abord.',
  BOUND_ITEM: '❌ Un objet lié à ton âme ne quitte pas ton inventaire.',
  VAULT_FULL: '❌ Ton coffre est plein.',
  NOT_IN_VAULT: '❌ Cet objet n\'est pas (ou pas en quantité suffisante) dans ton coffre.',
};

async function handleVaultItem(db, playerId, deposit, qty, query) {
  const item = await findItem(db, query);
  if (!item) return `❌ Aucun objet ne correspond à "${query}".`;
  const result = deposit
    ? await depositItem(db, playerId, item.item_id, qty)
    : await withdrawItem(db, playerId, item.item_id, qty);
  if (!result.success) {
    if (result.error === 'INSUFFICIENT_QUANTITY') return `❌ Tu n'as que ${result.available}× ${item.name}.`;
    return ITEM_ERRORS[result.error] || render('error');
  }
  return buildVaultCard(db, playerId, `🏦 ${qty}× **${item.name}** ${deposit ? 'déposé(s) au' : 'retiré(s) du'} coffre.`);
}

async function buildVaultCard(db, playerId, text) {
  const [status, player] = await Promise.all([getVaultStatus(db, playerId), getPlayer(db, playerId)]);
  return {
    text,
    card: {
      template: 'banque',
      variables: {
        playerName: player?.avatar_name || 'inconnu',
        vaultBalance: status.yrdsStored,
        walletBalance: player?.yrd_balance ?? 0,
        itemsStored: status.itemsStored,
        maxSlots: status.maxSlots,
        slotsPercent: pct(status.itemsStored, status.maxSlots),
      },
    },
  };
}

export async function handleVault(db, playerId, entities, raw = '') {
  const player = await getPlayer(db, playerId);
  if (!player) return render('error');

  const amount = entities.quantity || parseInt(raw.match(/\b(\d+)\b/)?.[1] || '', 10) || undefined;

  const itemArg = raw.match(ITEM_ARG_RE);
  if (itemArg && (DEPOSIT_RE.test(raw) || WITHDRAW_RE.test(raw))) {
    const qty = itemArg[1] ? parseInt(itemArg[1], 10) : 1;
    return handleVaultItem(db, playerId, DEPOSIT_RE.test(raw) && !WITHDRAW_RE.test(raw), qty, itemArg[2].trim());
  }

  if (DEPOSIT_RE.test(raw)) {
    if (!amount) return `🏦 Combien veux-tu déposer ? Ex. : "banque déposer 100"`;

    const result = await depositYrds(db, playerId, amount);
    if (!result.success) {
      if (result.error === 'INSUFFICIENT_FUNDS') {
        return render('bank_fail_insufficient', { required: result.required, available: result.available });
      }
      return render('error');
    }
    const text = render('bank_deposit', {
      amount: result.amount,
      vaultBalance: result.newVaultBalance,
      walletBalance: result.newWalletBalance,
    });
    return buildVaultCard(db, playerId, text);
  }

  if (WITHDRAW_RE.test(raw)) {
    if (!amount) return `🏦 Combien veux-tu retirer ? Ex. : "banque retirer 100"`;

    const result = await withdrawYrds(db, playerId, amount);
    if (!result.success) {
      if (result.error === 'INSUFFICIENT_VAULT_FUNDS') {
        return render('bank_fail_vault_insufficient', { available: result.available });
      }
      return render('error');
    }
    const text = render('bank_withdraw', {
      amount: result.amount,
      vaultBalance: result.newVaultBalance,
      walletBalance: result.newWalletBalance,
    });
    return buildVaultCard(db, playerId, text);
  }

  const status = await getVaultStatus(db, playerId);
  const items = await listVaultItems(db, 'avatar', playerId);
  const itemLines = items.length ? `\n\n📦 Objets :\n${items.map(i => `• ${i.qty}× ${i.name}`).join('\n')}` : '';
  const text = render('bank_status', {
    playerName: player.avatar_name,
    vaultBalance: status.yrdsStored,
    walletBalance: player.yrd_balance,
    itemsStored: status.itemsStored,
    maxSlots: status.maxSlots,
  }) + itemLines;

  return {
    text,
    card: {
      template: 'banque',
      variables: {
        playerName: player.avatar_name,
        vaultBalance: status.yrdsStored,
        walletBalance: player.yrd_balance,
        itemsStored: status.itemsStored,
        maxSlots: status.maxSlots,
        slotsPercent: pct(status.itemsStored, status.maxSlots),
      },
    },
  };
}

export default { handleVault };
