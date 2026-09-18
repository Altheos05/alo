import { getVaultStatus, depositYrds, withdrawYrds } from '../engine/bank.js';
import { getPlayer } from '../services/player.js';
import { render } from '../services/template.js';
import { pct } from '../services/cardRenderer.js';

const DEPOSIT_RE = /d[ée]pos|verse|deposit/i;
const WITHDRAW_RE = /retir|retrait|withdraw/i;

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

  const amount = entities.quantity;

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
  const text = render('bank_status', {
    playerName: player.avatar_name,
    vaultBalance: status.yrdsStored,
    walletBalance: player.yrd_balance,
    itemsStored: status.itemsStored,
    maxSlots: status.maxSlots,
  });

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
