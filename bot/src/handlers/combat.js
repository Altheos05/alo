import {
  calculateDamage,
  tickStatusEffects,
  applyStatusEffect,
  calculateExpReward,
  generateCombatLog,
  formatActiveEffects,
  getStatModifiers,
  elementalResistance,
} from '../engine/combat.js';
import { getPlayer } from '../services/player.js';
import { getGearStats, wearEquipment, COMBAT_WEAR_PVE } from '../engine/durability.js';
import { loadCombatEffects, persistCombatEffects } from '../engine/effects.js';
import { useItemInCombat } from '../engine/consumables.js';
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
     WHERE (m.monster_id = UPPER($3) OR m.name ILIKE $1) AND s.zone_id = $2
     LIMIT 1`,
    [`%${monsterId}%`, player.current_zone_id, monsterId]
  );

  if (monsterResult.rows.length === 0) {
    const anyResult = await db.query(
      'SELECT monster_id, name FROM t_monsters_dict WHERE monster_id = UPPER($2) OR name ILIKE $1 LIMIT 1',
      [`%${monsterId}%`, monsterId]
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
    const session = await db.query(
      `INSERT INTO t_combat_sessions (avatar_uuid, zone_id, enemy_type, enemy_id, enemy_name)
       VALUES ($1, $2, $3, $4, $5) RETURNING session_uuid`,
      [playerUuid, player.current_zone_id, monster.is_boss ? 'boss' : 'mob', monster.monster_id, monster.name.slice(0, 32)]
    );
    combat.sessionUuid = session.rows[0].session_uuid;
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
    menu: await combatMenu(db, playerUuid),
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

// Sort / OSS lancé en combat : coût en PM, puis soin, effet persistant ou dégâts.
// Renvoie la ligne de narration du joueur, ou { error } sans consommer le tour.
async function castInCombat(db, combat, skillQuery, effectsDict) {
  const r = await db.query(
    `SELECT s.skill_id, s.name, s.mp_cost, s.base_damage, s.base_healing, s.stat_scaling
     FROM t_avatar_skills a JOIN t_skills_dict s ON s.skill_id = a.skill_id
     WHERE a.avatar_uuid = $1 AND s.skill_type IN ('MAG','OSS') AND (s.skill_id = UPPER($2) OR s.name ILIKE $2)
     LIMIT 1`,
    [combat.playerUuid, skillQuery]
  );
  const skill = r.rows[0];
  if (!skill) return { error: `❌ Tu ne connais pas "${skillQuery}".` };
  if (combat.player.mp_current < skill.mp_cost) return { error: `❌ PM insuffisants (${skill.mp_cost} requis).` };

  combat.player.mp_current -= skill.mp_cost;
  await db.query('UPDATE t_avatars SET mp_current = GREATEST(0, mp_current - $1) WHERE avatar_uuid = $2', [skill.mp_cost, combat.playerUuid]);

  const scaling = skill.stat_scaling || {};
  if (skill.base_healing > 0) {
    const amount = Math.round(skill.base_healing + (combat.player.stat_int || 0) * (scaling.stat_int || 0));
    const before = combat.player.hp_current;
    combat.player.hp_current = Math.min(combat.player.hp_max, before + amount);
    return { line: `✨ ${combat.player.avatar_name} lance **${skill.name}** : +${combat.player.hp_current - before} PV.` };
  }
  const effect = effectsDict[`EFF_${skill.skill_id}`];
  if (effect) {
    // Soutien : sur soi ; contrôle / affaiblissement : sur l'ennemi.
    const target = effect.type === 'debuff' ? combat.monster : combat.player;
    applyStatusEffect(target, { ...effect });
    const targetName = target === combat.monster ? combat.monster.name : combat.player.avatar_name;
    return { line: `✨ ${combat.player.avatar_name} lance **${skill.name}** sur ${targetName} : ${effect.name}.` };
  }
  const playerMods = getStatModifiers(combat.player.activeEffects, combat.player);
  const dmg = calculateDamage({ ...combat.player, ...playerMods }, combat.monster, skill, combat.monster.activeEffects);
  combat.monster.hp_current = Math.max(0, combat.monster.hp_current - dmg);
  return { line: render('attack_damage', {
    actorName: `${combat.player.avatar_name} (${skill.name})`, damage: dmg,
    targetName: combat.monster.name, targetHp: combat.monster.hp_current,
  }) };
}

export async function handleCombatAction(db, playerUuid, action, skillQuery = null, itemId = null) {
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
    await endSession(db, combat, 'victory');
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
    await endSession(db, combat, 'defeat');
    response.push(render('attack_death'));
    await applyCombatWear(db, playerUuid, response);
    activeCombats.delete(playerUuid);
    return response.join('\n');
  }

  if (itemId) {
    const used = await useItemInCombat(db, combat, itemId, effectsDict, applyStatusEffect);
    if (!used.success) {
      return used.error === 'OUT_OF_COMBAT_ONLY' ? '❌ Ce plat ne se consomme qu\'hors combat.' : '❌ Tu ne peux pas utiliser cet objet.';
    }
    response.push(`🧪 ${combat.player.avatar_name} utilise **${used.name}**${used.hpGain ? ` : +${used.hpGain} PV` : ''}.`);
  } else if (skillQuery) {
    const cast = await castInCombat(db, combat, skillQuery, effectsDict);
    if (cast.error) return cast.error;
    response.push(cast.line);
  } else {
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
    await endSession(db, combat, 'victory');
    response.push(render('attack_kill', { targetName: combat.monster.name, exp, yrds }));
    await applyCombatWear(db, playerUuid, response);
    activeCombats.delete(playerUuid);
    return response.join('\n');
  }

  const monsterMods = getStatModifiers(combat.monster.activeEffects, combat.monster);
  const rawMonsterDmg = calculateDamage(
    { ...combat.monster, ...monsterMods },
    combat.player,
    null,
    combat.player.activeEffects
  );
  const monsterDmg = Math.round(rawMonsterDmg * (1 - elementalResistance(combat.player.activeEffects, combat.monster.element)));
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
    await endSession(db, combat, 'defeat');
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
  return { text: response.join('\n'), menu: await combatMenu(db, playerUuid) };
}

const MENU_SPELLS = 2;

// D83 §3.1 : attaquer, les sorts connus les plus accessibles, fuir.
async function combatMenu(db, playerUuid) {
  const spells = await db.query(
    `SELECT s.skill_id, s.name FROM t_avatar_skills a JOIN t_skills_dict s ON s.skill_id = a.skill_id
     WHERE a.avatar_uuid = $1 AND s.skill_type IN ('MAG','OSS') ORDER BY a.is_equipped DESC, s.mp_cost LIMIT $2`,
    [playerUuid, MENU_SPELLS]
  );
  const potion = await db.query(
    `SELECT d.item_id, d.name FROM t_inventory i JOIN t_items_dict d ON d.item_id = i.item_id
     WHERE i.avatar_uuid = $1 AND (d.use_effect ? 'heal_hp' OR d.use_effect ? 'heal_mp') ORDER BY d.tier LIMIT 1`,
    [playerUuid]
  );
  const options = [{ label: 'Attaquer', command: '!attaque' },
    ...spells.rows.map(s => ({ label: `Lancer ${s.name}`, command: `!cast ${s.skill_id}` })),
    ...potion.rows.map(p => ({ label: `Utiliser ${p.name}`, command: `!use ${p.item_id}` })),
    { label: 'Fuir', command: '!fuite' }];
  return { context: 'COMBAT', ref: activeCombats.get(playerUuid)?.combatId?.slice(0, 50) || null, options: options.map((o, i) => ({ digit: i + 1, ...o })) };
}

async function endSession(db, combat, outcome) {
  if (!combat.sessionUuid) return;
  try {
    await db.query(
      "UPDATE t_combat_sessions SET outcome = $1, ended_at = NOW(), turn_number = $2, turn_state = 'ended' WHERE session_uuid = $3",
      [outcome, combat.turn, combat.sessionUuid]
    );
  } catch (err) {
    logger.error('Impossible de clore la session de combat', { error: err.message });
  }
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
  await endSession(db, combat, 'flee');
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
