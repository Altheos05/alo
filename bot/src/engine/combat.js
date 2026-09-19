import logger from '../utils/logger.js';

export function calculateDamage(attacker, defender, skill = null, activeEffects = null) {
  const atk = attacker.base_atk || 0;
  let def = defender.base_def || 0;

  // activeEffects = effets du DÉFENSEUR : ils ne modifient que sa DEF. L'ATQ de
  // l'attaquant arrive déjà modifiée par ses propres effets (getStatModifiers).
  if (activeEffects) {
    def = computeStatMod(activeEffects, 'stat_vit', def) ?? def;
  }

  const levelRatio = Math.min(3.0, attacker.level / Math.max(defender.level, 1));

  let baseDmg = (atk * atk) / (atk + Math.max(def, 1));
  baseDmg = Math.max(baseDmg, 1);

  if (skill) {
    baseDmg += skill.base_damage || 0;
    if (skill.stat_scaling) {
      const scaling = typeof skill.stat_scaling === 'object'
        ? skill.stat_scaling
        : JSON.parse(skill.stat_scaling || '{}');
      for (const [stat, ratio] of Object.entries(scaling)) {
        if (stat === 'multiplier') continue;
        baseDmg += (attacker[stat] || 0) * (ratio || 0);
      }
      // OSS : « Multiplicateur Total ×2.1 » multiplie les dégâts de l'arme.
      if (scaling.multiplier) baseDmg *= scaling.multiplier;
    }
  }

  baseDmg *= levelRatio;
  baseDmg *= (1 + (Math.random() - 0.5) * 0.2);

  return Math.round(Math.max(baseDmg, 0));
}

export function calculateHealing(caster, skill) {
  let baseHeal = skill.base_healing || 0;
  if (skill.stat_scaling) {
    const scaling = typeof skill.stat_scaling === 'object'
      ? skill.stat_scaling
      : JSON.parse(skill.stat_scaling || '{}');
    for (const [stat, ratio] of Object.entries(scaling)) {
      baseHeal += (caster[stat] || 0) * (ratio || 0);
    }
  }
  return Math.round(Math.max(baseHeal, 1));
}

export function applyStatusEffect(target, effect) {
  if (!effect || !target) return null;

  const durationMs = (effect.duration_sec || 10) * 1000;
  const effectInstance = {
    effectId: effect.effect_id,
    name: effect.name,
    type: effect.type,
    statModified: effect.stat_modified,
    modifierValue: effect.modifier_value || 0,
    modifierType: effect.modifier_type || 'flat',
    tickDamage: effect.tick_damage || 0,
    tickInterval: effect.tick_interval || 0,
    durationMs,
    endTime: Date.now() + durationMs,
    maxStacks: effect.max_stacks || 1,
    currentStacks: 1,
    lastTick: Date.now(),
    icon: effect.icon_emoji || '',
  };

  if (!target.activeEffects) target.activeEffects = [];
  const existing = target.activeEffects.find(e => e.effectId === effect.effect_id);
  if (existing) {
    existing.currentStacks = Math.min(existing.currentStacks + 1, existing.maxStacks);
    existing.endTime = Date.now() + durationMs;
    existing.lastTick = Date.now();
    return existing;
  }

  target.activeEffects.push(effectInstance);
  return effectInstance;
}

export function tickStatusEffects(target) {
  if (!target?.activeEffects?.length) return { expired: [], tickEvents: [] };

  const now = Date.now();
  const expired = [];
  const tickEvents = [];

  target.activeEffects = target.activeEffects.filter(ef => {
    if (now >= ef.endTime) {
      expired.push(ef);
      return false;
    }

    if (ef.tickDamage && ef.tickInterval > 0) {
      const elapsed = now - ef.lastTick;
      if (elapsed >= ef.tickInterval * 1000) {
        ef.lastTick = now;
        target.hp_current = Math.max(0, (target.hp_current || 0) - Math.abs(ef.tickDamage));
        tickEvents.push({
          effectId: ef.effectId,
          name: ef.name,
          damage: Math.abs(ef.tickDamage),
        });
      }
    }

    if (ef.statModified === 'hp_current' && ef.modifierValue && ef.tickDamage === 0) {
      if (ef.type === 'debuff') {
        const dmg = Math.min(Math.abs(ef.modifierValue), (target.hp_current || 0));
        target.hp_current = Math.max(0, (target.hp_current || 0) - dmg);
        tickEvents.push({ effectId: ef.effectId, name: ef.name, damage: dmg });
      } else if (ef.type === 'buff') {
        const heal = Math.abs(ef.modifierValue);
        target.hp_current = Math.min(target.hp_max || 9999, (target.hp_current || 0) + heal);
        tickEvents.push({ effectId: ef.effectId, name: ef.name, healing: heal });
      }
    }

    return true;
  });

  return { expired, tickEvents };
}

function computeStatMod(activeEffects, statField, baseValue) {
  if (!activeEffects?.length) return null;
  let modified = baseValue;
  let changed = false;
  for (const ef of activeEffects) {
    if (ef.statModified !== statField) continue;
    // Les valeurs du dictionnaire sont positives : c'est le type qui donne le sens
    // (un « Lenteur 30 % » accélérait la cible avant ce correctif).
    const sign = ef.type === 'debuff' ? -1 : 1;
    if (ef.modifierType === 'percent') {
      modified += sign * baseValue * (ef.modifierValue / 100) * ef.currentStacks;
      changed = true;
    } else if (ef.modifierType === 'flat') {
      modified += sign * ef.modifierValue * ef.currentStacks;
      changed = true;
    } else if (ef.modifierType === 'multiplier') {
      modified *= ef.modifierValue * ef.currentStacks;
      changed = true;
    }
  }
  return changed ? Math.max(1, Math.round(modified)) : null;
}

// D96-a : part des dégâts élémentaires annulée par les résistances actives (plafond 75 %).
const RESIST_CAP = 0.75;
const ELEMENT_FAMILIES = { res_feu: /feu/i, res_ombre: /t[ée]n[èe]bres|ombre/i };

export function elementalResistance(activeEffects, element) {
  if (!element || /^aucun$/i.test(element) || !activeEffects?.length) return 0;
  let pct = 0;
  for (const ef of activeEffects) {
    if (ef.statModified === 'res_all' || (ELEMENT_FAMILIES[ef.statModified]?.test(element))) {
      pct += (ef.modifierValue || 0) * (ef.currentStacks || 1);
    }
  }
  return Math.min(RESIST_CAP, pct / 100);
}

export function getStatModifiers(activeEffects, baseStats) {
  if (!activeEffects?.length) return { ...baseStats };
  const result = { ...baseStats };
  for (const statField of ['stat_str', 'stat_vit', 'stat_agi', 'stat_int']) {
    const key = statField === 'stat_str' ? 'base_atk'
      : statField === 'stat_vit' ? 'base_def'
      : statField === 'stat_agi' ? 'base_agi'
      : 'base_int';
    const baseVal = baseStats[key] || 0;
    const modVal = computeStatMod(activeEffects, statField, baseVal);
    if (modVal !== null) {
      if (key === 'base_atk') result.base_atk = modVal;
      else if (key === 'base_def') result.base_def = modVal;
      else if (key === 'base_agi') result.base_agi = modVal;
      else result.base_int = modVal;
    }
  }
  return result;
}

export function formatActiveEffects(activeEffects) {
  if (!activeEffects?.length) return '';
  return activeEffects
    .map(ef => {
      const remaining = Math.max(0, Math.ceil((ef.endTime - Date.now()) / 1000));
      const stacks = ef.maxStacks > 1 ? ` x${ef.currentStacks}` : '';
      const icon = ef.icon || (ef.type === 'debuff' ? '🔴' : '🟢');
      return `${icon} ${ef.name}${stacks} (${remaining}s)`;
    })
    .join('\n');
}

export function calculateExpReward(monster, partySize = 1) {
  const base = monster.exp_yield || 50;
  const partyMultiplier = partySize > 1 ? 1 + (partySize - 1) * 0.15 : 1;
  return Math.round(base * partyMultiplier / partySize);
}

export function generateCombatLog(action, actor, target, damage, effects) {
  return {
    timestamp: Date.now(),
    action,
    actorId: actor.id || actor.npc_id,
    targetId: target?.id || target?.npc_id || null,
    damage: damage || 0,
    effects: effects || [],
    actorHp: actor.hp_current,
    targetHp: target?.hp_current,
  };
}

export default {
  calculateDamage,
  calculateHealing,
  applyStatusEffect,
  tickStatusEffects,
  getStatModifiers,
  formatActiveEffects,
  calculateExpReward,
  generateCombatLog,
};
