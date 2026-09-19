import {
  calculateDamage,
  tickStatusEffects,
  applyStatusEffect,
  calculateExpReward,
  generateCombatLog,
  formatActiveEffects,
  getStatModifiers,
} from '../engine/combat.js';
import { getPlayer } from '../services/player.js';
import { getGearStats, wearEquipment, COMBAT_WEAR_PVE } from '../engine/durability.js';
import { loadCombatEffects, persistCombatEffects } from '../engine/effects.js';
import { render } from '../services/template.js';
import logger from '../utils/logger.js';

const activeCombats = new Map();

const MONSTER_EFFECT_CHANCE = 0.2;

const FAMILY_EFFECTS = {
  araignée: 'EFF_POISON',
  insecte: 'EFF_POISON',
  serpent: 'EFF_POISON',
  plante: 'EFF_POISON',
  dragon: 'EFF_BURN',
  salamandre: 'EFF_BURN',
  feu: 'EFF_BURN',
  loup: 'EFF_BLEED',
  chauve: 'EFF_BLEED',
  requin: 'EFF_BLEED',
  glace: 'EFF_FREEZE',
  golem: 'EFF_STUN',
  mort: 'EFF_FEAR',
  spectre: 'EFF_FEAR',
  ombre: 'EFF_FEAR',
  démon: 'EFF_FEAR',
  fantôme: 'EFF_SILENCE',
  sirène: 'EFF_SILENCE',
  elfe: 'EFF_SILENCE',
  barde: 'EFF_CONFUSION',
  mage: 'EFF_CONFUSION',
  ogre: 'EFF_STUN',
  troll: 'EFF_SLOW',
};

let effectsCache = null;

async function getEffectsDict(db) {
  if (effectsCache) return effectsCache;
  const result = await db.query('SELECT * FROM t_status_effects_dict');
  effectsCache = {};
  for (const row of result.rows) {
    effectsCache[row.effect_id] = row;
  }
  return effectsCache;
}

export function invalidateEffectsCache() {
  effectsCache = null;
}

function getMonsterStatusEffect(monster) {
  if (!monster) return null;
  const name = (monster.name || '').toLowerCase();
  const family = (monster.family || '').toLowerCase();
  const element = (monster.element || '').toLowerCase();

  for (const [key, effectId] of Object.entries(FAMILY_EFFECTS)) {
    if (family.includes(key) || name.includes(key) || element.includes(key)) {
      return effectId;
    }
  }
  return null;
}

export async function handleAttack(db, playerUuid, entities) {
  const player = await getPlayer(db, playerUuid);
  if (!player) return render('error');

  if (activeCombats.has(playerUuid)) {
    return `⚔️ Tu es déjà en combat ! Termine-le avant d'en engager un autre.`;
  }

  const monsterId = entities.monsterId || entities.keyword || entities.target;
  if (!monsterId) {
    return `⚔️ Qui veux-tu attaquer ?`;
  }

  const monsterResult = await db.query(
    `SELECT m.monster_id, m.name, m.level, m.base_hp, m.base_mp, m.base_atk, m.base_def, m.base_agi,
            m.exp_yield, m.family, m.element, m.is_boss
     FROM t_monsters_dict m
     JOIN t_spawn_tables s ON s.monster_id = m.monster_id
     WHERE (m.monster_id = $1 OR m.name ILIKE $1) AND s.zone_id = $2
     LIMIT 1`,
    [`%${monsterId}%`, player.current_zone_id]
  );

  if (monsterResult.rows.length === 0) {
    const anyResult = await db.query(
      'SELECT monster_id, name FROM t_monsters_dict WHERE monster_id = $1 OR name ILIKE $1 LIMIT 1',
      [`%${monsterId}%`]
    );
    if (anyResult.rows.length) {
      return `❌ "${monsterId}" n'est pas dans ta zone actuelle.`;
    }
    return `❌ Monstre "${monsterId}" introuvable.`;
  }
  const monster = monsterResult.rows[0];

  // D88 : l'équipement porté (pièces non cassées) fournit l'ATQ/DEF du joueur.
  const gear = await getGearStats(db, playerUuid);
  const combatId = `${playerUuid}_${Date.now()}`;
  const combat = {
    combatId,
    playerUuid,
    monster: { ...monster, hp_current: monster.base_hp, hp_max: monster.base_hp, activeEffects: [] },
    // D90 E1 : les effets persistants (sorts, plats) entrent dans le combat.
    player: { ...player, base_atk: gear.atk, base_def: gear.def, hp_current: player.hp_current, hp_max: player.hp_max, activeEffects: await loadCombatEffects(db, playerUuid) },
    turn: 0,
    startedAt: Date.now(),
  };
  activeCombats.set(playerUuid, combat);

  try {
    await db.query(
      `INSERT INTO t_combat_sessions (session_id, avatar_uuid, monster_id, zone_id, status, started_at, turn_count)
       VALUES ($1, $2, $3, $4, 'active', NOW(), 0)`,
      [combatId, playerUuid, monster.monster_id, player.current_zone_id]
    );
  } catch (err) {
    logger.warn('Impossible de persister le combat', { error: err.message });
  }

  logger.info('Combat engagé', { playerUuid, monsterId: monster.monster_id, monsterLevel: monster.level });
  const text = render('attack_start', {
    monsterName: monster.name,
    monsterLevel: monster.level,
    monsterHp: monster.base_hp,
    skillName: 'Attaque de base',
  });

  return {
    text,
    card: {
      template: 'combat_rencontre',
      variables: {
        monsterName: monster.name,
        monsterLevel: monster.level,
        monsterHp: monster.base_hp,
        monsterHpMax: monster.base_hp,
        monsterHpPercent: 100,
        skillName: 'Attaque de base',
      },
    },
  };
}

export async function handleCombatAction(db, playerUuid, action) {
  const combat = activeCombats.get(playerUuid);
  if (!combat) {
    return `⚔️ Tu n'es pas en combat. Tape "attaque [monstre]" pour en engager un.`;
  }

  const effectsDict = await getEffectsDict(db);
  const response = [];

  const playerTick = tickStatusEffects(combat.player);
  const monsterTick = tickStatusEffects(combat.monster);

  for (const ev of playerTick.tickEvents) {
    if (ev.damage) {
      response.push(render('effect_tick', {
        targetName: combat.player.avatar_name,
        effectName: ev.name,
        damage: ev.damage,
      }));
    }
  }
  for (const ev of monsterTick.tickEvents) {
    if (ev.damage) {
      response.push(render('effect_tick', {
        targetName: combat.monster.name,
        effectName: ev.name,
        damage: ev.damage,
      }));
    }
  }
  for (const ev of monsterTick.tickEvents) {
    if (ev.healing) {
      response.push(render('effect_heal', {
        targetName: combat.monster.name,
        effectName: ev.name,
        healing: ev.healing,
      }));
    }
  }
  for (const ev of playerTick.tickEvents) {
    if (ev.healing) {
      response.push(render('effect_heal', {
        targetName: combat.player.avatar_name,
        effectName: ev.name,
        healing: ev.healing,
      }));
    }
  }

  if (combat.monster.hp_current <= 0) {
    const exp = calculateExpReward(combat.monster);
    const yrds = Math.floor(exp * 0.3);
    try {
      await db.query('UPDATE t_avatars SET hp_current = $1, yrd_balance = yrd_balance + $2 WHERE avatar_uuid = $3',
        [combat.player.hp_current, yrds, playerUuid]);
      await db.query('UPDATE t_avatars SET current_xp = COALESCE(current_xp, 0) + $1 WHERE avatar_uuid = $2',
        [exp, playerUuid]);
    } catch (err) {
      logger.error('Erreur récompense combat', { error: err.message });
    }
    await persistCombatEffects(db, playerUuid, combat.player.activeEffects);
    try {
      await db.query(
        'UPDATE t_combat_sessions SET status = $1, ended_at = NOW(), turn_count = $2 WHERE session_id = $3',
        ['victory', combat.turn, combat.combatId]
      );
    } catch {}
    response.push(render('attack_kill', { targetName: combat.monster.name, exp, yrds }));
    await applyCombatWear(db, playerUuid, response);
    activeCombats.delete(playerUuid);
    return response.join('\n');
  }

  if (combat.player.hp_current <= 0) {
    await persistCombatEffects(db, playerUuid, combat.player.activeEffects);
    try {
      await db.query('UPDATE t_avatars SET hp_current = $1, is_alive = FALSE WHERE avatar_uuid = $2',
        [0, playerUuid]);
    } catch (err) {
      logger.error('Erreur mort combat', { error: err.message });
    }
    try {
      await db.query(
        'UPDATE t_combat_sessions SET status = $1, ended_at = NOW(), turn_count = $2 WHERE session_id = $3',
        ['defeat', combat.turn, combat.combatId]
      );
    } catch {}
    response.push(render('attack_death'));
    await applyCombatWear(db, playerUuid, response);
    activeCombats.delete(playerUuid);
    return response.join('\n');
  }

  const playerMods = getStatModifiers(combat.player.activeEffects, combat.player);
  const dmg = calculateDamage(
    { ...combat.player, ...playerMods },
    combat.monster,
    null,
    combat.monster.activeEffects
  );
  combat.monster.hp_current = Math.max(0, combat.monster.hp_current - dmg);
  response.push(render('attack_damage', {
    actorName: combat.player.avatar_name,
    damage: dmg,
    targetName: combat.monster.name,
    targetHp: combat.monster.hp_current,
  }));

  if (combat.monster.hp_current <= 0) {
    const exp = calculateExpReward(combat.monster);
    const yrds = Math.floor(exp * 0.3);
    try {
      await db.query('UPDATE t_avatars SET hp_current = $1, yrd_balance = yrd_balance + $2 WHERE avatar_uuid = $3',
        [combat.player.hp_current, yrds, playerUuid]);
      await db.query('UPDATE t_avatars SET current_xp = COALESCE(current_xp, 0) + $1 WHERE avatar_uuid = $2',
        [exp, playerUuid]);
    } catch (err) {
      logger.error('Erreur récompense combat', { error: err.message });
    }
    await persistCombatEffects(db, playerUuid, combat.player.activeEffects);
    try {
      await db.query(
        'UPDATE t_combat_sessions SET status = $1, ended_at = NOW(), turn_count = $2 WHERE session_id = $3',
        ['victory', combat.turn, combat.combatId]
      );
    } catch {}
    response.push(render('attack_kill', { targetName: combat.monster.name, exp, yrds }));
    await applyCombatWear(db, playerUuid, response);
    activeCombats.delete(playerUuid);
    return response.join('\n');
  }

  const monsterMods = getStatModifiers(combat.monster.activeEffects, combat.monster);
  const monsterDmg = calculateDamage(
    { ...combat.monster, ...monsterMods },
    combat.player,
    null,
    combat.player.activeEffects
  );
  combat.player.hp_current = Math.max(0, combat.player.hp_current - monsterDmg);
  response.push(render('attack_damage', {
    actorName: combat.monster.name,
    damage: monsterDmg,
    targetName: combat.player.avatar_name,
    targetHp: combat.player.hp_current,
  }));

  if (Math.random() < MONSTER_EFFECT_CHANCE) {
    const effectId = getMonsterStatusEffect(combat.monster);
    if (effectId && effectsDict[effectId]) {
      const applied = applyStatusEffect(combat.player, effectsDict[effectId]);
      if (applied) {
        response.push(render('effect_applied', {
          targetName: combat.player.avatar_name,
          effectName: applied.name,
          duration: Math.ceil(applied.durationMs / 1000),
          sourceName: combat.monster.name,
        }));
      }
    }
  }

  if (combat.player.hp_current <= 0) {
    await persistCombatEffects(db, playerUuid, combat.player.activeEffects);
    try {
      await db.query('UPDATE t_avatars SET hp_current = $1, is_alive = FALSE WHERE avatar_uuid = $2',
        [0, playerUuid]);
    } catch (err) {
      logger.error('Erreur mort combat', { error: err.message });
    }
    try {
      await db.query(
        'UPDATE t_combat_sessions SET status = $1, ended_at = NOW(), turn_count = $2 WHERE session_id = $3',
        ['defeat', combat.turn, combat.combatId]
      );
    } catch {}
    response.push(render('attack_death'));
    await applyCombatWear(db, playerUuid, response);
    activeCombats.delete(playerUuid);
    return response.join('\n');
  }

  const playerActiveLine = formatActiveEffects(combat.player.activeEffects);
  if (playerActiveLine) {
    response.push(render('status_effects', { effects: playerActiveLine, targetName: combat.player.avatar_name }));
  }

  try {
    await db.query('UPDATE t_avatars SET hp_current = $1 WHERE avatar_uuid = $2',
      [combat.player.hp_current, playerUuid]);
  } catch (err) {
    logger.error('Erreur update HP', { error: err.message });
  }

  combat.turn++;
  return response.join('\n');
}

// D88 : chaque combat use les pièces portées.
async function applyCombatWear(db, playerUuid, response) {
  try {
    const broken = await wearEquipment(db, playerUuid, COMBAT_WEAR_PVE);
    for (const name of broken) response.push(`💥 **${name}** est cassé : il ne confère plus aucune statistique. Fais-le réparer chez un forgeron ("!repair").`);
  } catch (err) {
    logger.error('Erreur usure d\'équipement', { error: err.message, playerUuid });
  }
}

export async function handleFlee(db, playerUuid) {
  const combat = activeCombats.get(playerUuid);
  if (!combat) return `⚔️ Tu n'es pas en combat.`;
  await persistCombatEffects(db, playerUuid, combat.player.activeEffects);
  const response = [`🏃 Tu as fui le combat contre **${combat.monster.name}**.`];
  await applyCombatWear(db, playerUuid, response);
  activeCombats.delete(playerUuid);
  return response.join('\n');
}

export function getCombatStatus(playerUuid) {
  const combat = activeCombats.get(playerUuid);
  if (!combat) return null;
  const effectsLine = formatActiveEffects(combat.player.activeEffects);
  return {
    ...combat,
    playerEffects: effectsLine,
  };
}

export default { handleAttack, handleCombatAction, handleFlee, getCombatStatus, invalidateEffectsCache };
