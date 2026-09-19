import { HOUSING_GRID, getProperty, acquireProperty, payRent, releaseProperty } from '../engine/housing.js';
import { getPlayer } from '../services/player.js';
import { getCombatStatus } from './combat.js';
import { syncPlayerGroups } from '../services/zone-groups.js';
import { menuRow } from '../services/cardRenderer.js';
import { confirmationMenu } from '../services/menus.js';

const TYPES = Object.keys(HOUSING_GRID);
const TYPE_RE = new RegExp(`\\b(${TYPES.join('|')})\\b`, 'i');

// Mots-clés = strictement le vocabulaire documenté (whatsapp_commands_list.md
// §15) — pas d'alias verbe libre ("acheter"/"louer"/...) : ces mots sont déjà
// le préfixe des intents BUY/SELL (router.js) et un alias ici ne serait de
// toute façon jamais atteint sans le préfixe "housing_"/"logement", tout en
// laissant croire à une vraie voie alternative.
const BUY_RE = /housing_buy/i;
const RENT_RE = /housing_rent/i;
const PAY_RE = /housing_pay/i;
const SELL_RE = /housing_sell/i;
const LEAVE_RE = /housing_leave/i;
const RETURN_RE = /home_return/i;
const REST_RE = /^!?(?:rest|repos)$/i;
const LIST_RE = /housing_list/i;

function formatStatus(property) {
  const grid = HOUSING_GRID[property.property_type];
  const lines = [
    `🏠 **${grid.label}** — ${property.zone_name}`,
    `Tenure : ${property.tenure === 'own' ? 'propriétaire' : 'locataire'}`,
  ];
  if (property.tenure === 'rent') {
    lines.push(`Loyer : ${property.rent_yrds_cycle} Yrds/7j`);
    lines.push(`Payé jusqu'au : ${property.paid_until ? new Date(property.paid_until).toLocaleDateString('fr-FR') : 'inconnu'}`);
    if (property.is_delinquent) lines.push(`⚠️ Loyer en retard !`);
  }
  lines.push(`Stockage : ${property.storage_used}/${property.storage_slots}`);
  return lines.join('\n');
}

export async function handleHousing(db, playerId, raw = '', { confirmed = false } = {}) {
  const player = await getPlayer(db, playerId);
  if (!player) return `❌ Impossible de déterminer ta zone.`;

  if (LIST_RE.test(raw)) {
    const lines = TYPES.map((t, idx) => {
      const g = HOUSING_GRID[t];
      const price = g.tenure === 'own' ? `${g.cost} Yrds (achat)` : `${g.rentPerCycle} Yrds/7j (location)`;
      return `${idx + 1}. **${g.label}** — ${price} — stockage +${g.storageSlots}`;
    });
    const text = `🏠 **Offre de logements**\n${lines.join('\n')}\n\nTape "housing_buy [type]" ou "housing_rent [type]".`;
    const rows = TYPES.map((t, idx) => menuRow(idx + 1, HOUSING_GRID[t].label, HOUSING_GRID[t].tenure === 'own' ? `${HOUSING_GRID[t].cost} Y` : `${HOUSING_GRID[t].rentPerCycle} Y/7j`)).join('');
    return { text, card: { template: 'logement', variables: { housingLabel: 'Offre', itemsHtml: rows } } };
  }

  if (BUY_RE.test(raw) || RENT_RE.test(raw)) {
    const typeMatch = raw.match(TYPE_RE);
    if (!typeMatch) return `❌ Précise un type : ${TYPES.join(', ')}.`;
    const propertyType = typeMatch[1].toLowerCase();
    const grid = HOUSING_GRID[propertyType];
    const wantsOwn = BUY_RE.test(raw);
    if ((wantsOwn && grid.tenure !== 'own') || (!wantsOwn && grid.tenure !== 'rent')) {
      return `❌ ${grid.label} ne s'obtient qu'en ${grid.tenure === 'own' ? 'achat' : 'location'}.`;
    }

    const result = await acquireProperty(db, playerId, propertyType);
    if (!result.success) {
      const messages = {
        ALREADY_OWNS_PROPERTY: `❌ Tu possèdes déjà un logement — libère-le d'abord ("housing_leave"/"housing_sell").`,
        INSUFFICIENT_FUNDS: `❌ Fonds insuffisants (${result.required} Yrds requis, tu as ${result.available}).`,
        INVALID_TYPE: `❌ Type de logement invalide.`,
        NO_CAPITAL_ZONE: `❌ Ta race n'a pas de capitale enregistrée — logement impossible pour l'instant.`,
      };
      return messages[result.error] || `❌ Acquisition impossible.`;
    }
    return `🏠 ${grid.label} ${result.tenure === 'own' ? 'achetée' : 'louée'} avec succès !`;
  }

  if (PAY_RE.test(raw)) {
    const cyclesMatch = raw.match(/(\d+)/);
    const cycles = cyclesMatch ? parseInt(cyclesMatch[1], 10) : 1;
    const result = await payRent(db, playerId, cycles);
    if (!result.success) {
      const messages = {
        NO_PROPERTY: `❌ Tu n'as pas de logement.`,
        NOT_RENTED: `❌ Ton logement est en propriété, pas de loyer à payer.`,
        INSUFFICIENT_FUNDS: `❌ Fonds insuffisants (${result.required} Yrds requis, tu as ${result.available}).`,
      };
      return messages[result.error] || `❌ Paiement impossible.`;
    }
    return `🏠 Loyer avancé de ${result.cycles} cycle(s) : ${result.total} Yrds débités.`;
  }

  if (SELL_RE.test(raw) || LEAVE_RE.test(raw)) {
    const selling = SELL_RE.test(raw);
    // D92 : perte du logement ⇒ confirmation citée ; l'existence du logement
    // est revérifiée sous verrou par releaseProperty à la confirmation.
    if (!confirmed) {
      const property = await getProperty(db, playerId);
      if (!property) return `❌ Tu n'as pas de logement.`;
      const label = HOUSING_GRID[property.property_type].label;
      const consequence = selling
        ? `Tu vas **vendre** ton logement (${label}) — seuls 50 % du prix d'achat te seront rendus.`
        : `Tu vas **quitter** ton logement (${label}) — aucun remboursement.`;
      return { text: `⚠️ ${consequence}`, menu: confirmationMenu(selling ? '!housing_sell' : '!housing_leave') };
    }
    const result = await releaseProperty(db, playerId, { refund: selling });
    if (!result.success) return `❌ Tu n'as pas de logement.`;
    return result.refundAmount > 0
      ? `🏠 Logement vendu — ${result.refundAmount} Yrds crédités (50% du prix d'achat).`
      : `🏠 Logement libéré.`;
  }

  if (RETURN_RE.test(raw)) {
    const activeCombat = getCombatStatus(playerId);
    if (activeCombat) return `❌ Impossible de rentrer chez toi en plein combat.`;

    const property = await getProperty(db, playerId);
    if (!property) return `❌ Tu n'as pas de logement où rentrer.`;

    await db.query('UPDATE t_avatars SET current_zone_id = $1 WHERE avatar_uuid = $2', [property.zone_id, playerId]);
    await syncPlayerGroups(db, playerId, property.zone_id);
    return `🏠 Retour chez toi — **${property.zone_name}**.`;
  }

  if (REST_RE.test(raw)) {
    const property = await getProperty(db, playerId);
    const atHome = property && property.zone_id === player.current_zone_id;
    const regenPct = atHome ? 5 : 1;
    const hpGain = Math.floor(player.hp_max * (regenPct / 100));
    const mpGain = Math.floor(player.mp_max * (regenPct / 100));
    await db.query(
      'UPDATE t_avatars SET hp_current = LEAST(hp_max, hp_current + $1), mp_current = LEAST(mp_max, mp_current + $2) WHERE avatar_uuid = $3',
      [hpGain, mpGain, playerId]
    );
    return `💤 Tu te reposes${atHome ? ' chez toi' : ''} : +${hpGain} PV, +${mpGain} PM (${regenPct}%).`;
  }

  const property = await getProperty(db, playerId);
  if (!property) {
    return `🏠 Tu n'as pas de logement. Tape "housing_list" pour voir l'offre.`;
  }

  return {
    text: formatStatus(property),
    card: {
      template: 'logement',
      variables: {
        housingLabel: HOUSING_GRID[property.property_type].label,
        itemsHtml: `<div class="fact-row"><span class="fact-lbl">Zone</span><span class="fact-val">${property.zone_name}</span></div>`
          + `<div class="fact-row"><span class="fact-lbl">Tenure</span><span class="fact-val">${property.tenure === 'own' ? 'Propriétaire' : 'Locataire'}</span></div>`
          + `<div class="fact-row" style="border-bottom:none;"><span class="fact-lbl">Stockage</span><span class="fact-val">${property.storage_used}/${property.storage_slots}</span></div>`,
      },
    },
  };
}

export default { handleHousing };
