import { castOutOfCombat, listActiveEffects } from '../engine/effects.js';

const ERRORS = {
  CASTER_DEAD: '❌ Tu es mort — impossible d\'incanter.',
  SPELL_UNKNOWN: '❌ Tu ne connais pas ce sort.',
  TARGET_NOT_FOUND: '❌ Aucun joueur inscrit avec ce numéro.',
  TARGET_NOT_IN_ZONE: '❌ Ta cible n\'est pas dans ta zone.',
};

// !cast [Sort] [Num?] / !music [Sort] hors combat (D90 E4-E5 ; D89 : !music = !cast école SUP).
export async function handleCast(db, playerId, raw = '') {
  const tokens = raw.trim().split(/\s+/);
  const music = /^!?music$/i.test(tokens[0]);
  const args = tokens.slice(1);
  const targetPhone = /^\d{6,15}$/.test(args.at(-1) || '') ? args.pop() : null;
  const query = args.join(' ');
  if (!query) return `✨ Quel sort ? Ex. : "!cast Heal" ou "!cast Heal [Numéro d'un allié]".`;

  const r = await castOutOfCombat(db, playerId, query, targetPhone, { school: music ? 'MAG_SUP' : null });
  if (!r.success) {
    if (r.error === 'NO_MP') return `❌ PM insuffisants (${r.required} requis).`;
    if (r.error === 'COMBAT_ONLY') return `⚔️ **${r.spellName}** ne se lance qu'en combat (hors combat : soins, soutien et résurrection seulement).`;
    if (r.error === 'WRONG_SCHOOL') return `🎵 "!music" ne lance que les sorts de l'école Support (Puca).`;
    return ERRORS[r.error] || '❌ Incantation impossible.';
  }
  const detail = r.outcomes.length ? r.outcomes.join(' · ') : 'aucune cible affectée';
  return `✨ **${r.spellName}** (−${r.mpCost} PM) : ${detail}.`;
}

// !effets : effets actifs et temps restant (D90).
export async function handleEffects(db, playerId) {
  const effects = await listActiveEffects(db, playerId);
  if (!effects.length) return '✨ Aucun effet actif.';
  const lines = effects.map(e => {
    const min = Math.max(1, Math.ceil(e.remaining_sec / 60));
    const icon = e.icon_emoji || (e.type === 'debuff' ? '🔴' : '🟢');
    return `${icon} ${e.name}${e.stacks > 1 ? ` ×${e.stacks}` : ''} — ${min} min`;
  });
  return `✨ **Effets actifs**\n${lines.join('\n')}`;
}

export default { handleCast, handleEffects };
