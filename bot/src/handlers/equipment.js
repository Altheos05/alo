import { getEquipment, equipItem, unequipItem } from '../engine/equipment.js';
import { menuRow } from '../services/cardRenderer.js';

const SLOT_LABELS = {
  head: 'Tête', torso: 'Torse', arms: 'Bras', waist: 'Taille', legs: 'Jambes',
  hand_main: 'Main principale', hand_off: 'Main secondaire',
  gear_belt: 'Ceinture', belt_left: 'Ceinture gauche', belt_right: 'Ceinture droite',
  gear_back: 'Dos', back_wpn: 'Sangle dorsale',
};

const SLOT_ALIASES = {
  tete: 'head', torse: 'torso', bras: 'arms', taille: 'waist', jambes: 'legs',
  main: 'hand_main', ceinture: 'gear_belt', dos: 'gear_back',
};

const EQUIP_RE = /(?:équipe?|equip)\s+(`?[\w-]+`?)\s+(\S+)/i;
const UNEQUIP_RE = /unequip\s+(\S+)/i;

function resolveSlot(raw) {
  const norm = raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return SLOT_ALIASES[norm] || (SLOT_LABELS[norm] ? norm : null);
}

export async function handleEquip(db, playerId, raw = '') {
  const equipMatch = raw.match(EQUIP_RE);
  if (equipMatch) {
    const itemId = equipMatch[1].replace(/`/g, '').toUpperCase();
    const slot = resolveSlot(equipMatch[2]);
    if (!slot) return `❌ Emplacement inconnu. Essaie : tête, torse, bras, taille, jambes, main, ceinture, dos.`;

    const result = await equipItem(db, playerId, itemId, slot);
    if (!result.success) {
      const messages = {
        ITEM_NOT_FOUND: `❌ Tu ne possèdes pas ${itemId} (ou il est déjà équipé).`,
        WRONG_SLOT_TYPE: `❌ ${itemId} ne peut pas s'équiper à cet emplacement.`,
        INVALID_SLOT: `❌ Emplacement invalide.`,
        MISSING_DUAL_WIELD_PASSIVE: `❌ Il te faut une passive de combat au corps-à-corps pour manier une arme en main secondaire.`,
        NO_BELT_EQUIPPED: `❌ Équipe d'abord une ceinture (gear_belt) avant d'y accrocher une arme.`,
      };
      return messages[result.error] || `❌ Impossible d'équiper cet objet.`;
    }
    return `⚔️ ${itemId} équipé (${SLOT_LABELS[slot]}).`;
  }

  const unequipMatch = raw.match(UNEQUIP_RE);
  if (unequipMatch) {
    const slot = resolveSlot(unequipMatch[1]);
    if (!slot) return `❌ Emplacement inconnu.`;
    const result = await unequipItem(db, playerId, slot);
    if (!result.success) return result.error === 'SLOT_EMPTY' ? `❌ Rien n'est équipé à cet emplacement.` : `❌ Impossible.`;
    return `⚔️ Emplacement ${SLOT_LABELS[slot]} vidé.`;
  }

  const equipment = await getEquipment(db, playerId);
  if (equipment.length === 0) {
    return `⚔️ Aucun équipement porté. Tape "équiper [Item_ID] [emplacement]".`;
  }

  const bySlot = {};
  for (const e of equipment) bySlot[e.slot_equipped] = e;

  const worn = Object.entries(SLOT_LABELS).filter(([slot]) => bySlot[slot]);
  const lines = worn.map(([slot, label]) => `**${label}** : ${bySlot[slot].name}`);
  const text = `⚔️ **Équipement**\n${lines.join('\n')}`;

  const rows = worn.map(([slot, label], idx) => menuRow(idx + 1, label, bySlot[slot].name)).join('');

  return {
    text,
    card: { template: 'equipement', variables: { slotCount: equipment.length, itemsHtml: rows } },
  };
}

export default { handleEquip };
