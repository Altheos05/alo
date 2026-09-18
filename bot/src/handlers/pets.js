import { getActivePet, feedPet } from '../engine/pets.js';
import { pct } from '../services/cardRenderer.js';

const FEED_RE = /nourrir|nourris|feed/i;

export async function handlePet(db, playerId, raw = '') {
  const pet = await getActivePet(db, playerId);
  if (!pet) return `🐾 Tu n'as pas encore de familier. Domestique un monstre pour en obtenir un.`;

  const displayName = pet.nickname || pet.species_name;

  if (FEED_RE.test(raw)) {
    const result = await feedPet(db, playerId, pet.pet_id);
    if (!result.success) return `❌ Impossible de nourrir ton familier pour l'instant.`;
    return `🐾 **${displayName}** a été nourri. Faim : ${result.hunger}/100, Loyauté : ${result.loyalty}/100.`;
  }

  const text = `🐾 **${displayName}** (${pet.species_name}) — Niv. ${pet.level}\n`
    + `PV : ${pet.hp_current}/${pet.hp_max} | Faim : ${pet.hunger}/100 | Loyauté : ${pet.loyalty}/100\n`
    + `Statut : ${pet.status}${pet.is_summoned ? ' (invoqué)' : ''}`;

  return {
    text,
    card: {
      template: 'familier',
      variables: {
        petName: displayName,
        species: pet.species_name,
        level: pet.level,
        hp: pet.hp_current,
        hpMax: pet.hp_max,
        hpPercent: pct(pet.hp_current, pet.hp_max),
        hunger: pet.hunger,
        loyalty: pet.loyalty,
        status: pet.is_summoned ? `${pet.status} · invoqué` : pet.status,
      },
    },
  };
}

export default { handlePet };
