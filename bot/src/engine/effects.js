// Effets actifs persistants hors combat (D90, amendement de table_t_status_effects.md).
// T_ACTIVE_EFFECTS est relue au début de chaque combat et réécrite à la fin (E1) ;
// l'expiration est paresseuse : toute lecture ignore expires_at <= NOW() (E2).
// E3 (négatifs jamais mortels hors combat) tient par construction : aucun effet
// n'inflige de dégâts hors d'une session de combat.
import { inTransaction } from './bank.js';

const REVIVE_SKILLS = ['MAG_GUE_006', 'MAG_GUE_010'];
const CLEANSE_SKILLS = { MAG_GUE_002: ['EFF_POISON'] };
const REVIVE_HP_PCT = 10;

// Instance au format du moteur de combat (engine/combat.js applyStatusEffect).
// Durée restante calculée en SQL (remaining_sec) : les TIMESTAMP sans fuseau
// relus en JS seraient interprétés dans le fuseau du bot, pas celui de la base.
function toCombatInstance(row) {
  const endTime = Date.now() + row.remaining_sec * 1000;
  return {
    effectId: row.effect_id,
    name: row.name,
    type: row.type,
    statModified: row.stat_modified,
    modifierValue: row.modifier_value || 0,
    modifierType: row.modifier_type || 'flat',
    tickDamage: row.tick_damage || 0,
    tickInterval: row.tick_interval || 0,
    durationMs: Math.max(0, endTime - Date.now()),
    endTime,
    maxStacks: row.max_stacks || 1,
    currentStacks: row.stacks || 1,
    lastTick: Date.now(),
    icon: row.icon_emoji || '',
    sourceKind: row.source_kind,
    sourceRef: row.source_ref,
  };
}

export async function listActiveEffects(db, avatarUuid) {
  const r = await db.query(
    `SELECT e.effect_id, e.stacks, e.expires_at, e.source_kind, e.source_ref, d.*,
            EXTRACT(EPOCH FROM (e.expires_at - NOW()))::float AS remaining_sec
     FROM t_active_effects e JOIN t_status_effects_dict d ON d.effect_id = e.effect_id
     WHERE e.target_type = 'avatar' AND e.target_id = $1 AND e.expires_at > NOW()
     ORDER BY e.expires_at`,
    [avatarUuid]
  );
  return r.rows;
}

export async function loadCombatEffects(db, avatarUuid) {
  return (await listActiveEffects(db, avatarUuid)).map(toCombatInstance);
}

// Fin de combat : l'état des effets du joueur remplace celui de la table.
export async function persistCombatEffects(db, avatarUuid, activeEffects) {
  await inTransaction(db, 'Erreur de persistance des effets', { avatarUuid }, async (client) => {
    await client.query("DELETE FROM t_active_effects WHERE target_type = 'avatar' AND target_id = $1", [avatarUuid]);
    for (const ef of activeEffects || []) {
      const remainingMs = ef.endTime - Date.now();
      if (remainingMs <= 0) continue;
      await client.query(
        `INSERT INTO t_active_effects (target_type, target_id, effect_id, stacks, expires_at, source_kind, source_ref)
         VALUES ('avatar', $1, $2, $3, NOW() + make_interval(secs => $4), $5, $6)`,
        [avatarUuid, ef.effectId, ef.currentStacks || 1, remainingMs / 1000, ef.sourceKind || 'system', ef.sourceRef || null]
      );
    }
    return { success: true };
  });
}

// Pose (ou rafraîchit, cumul borné par max_stacks) un effet sur un avatar.
export async function applyEffect(db, avatarUuid, effectId, { durationSec = null, sourceKind = 'system', sourceRef = null, sourceUuid = null } = {}) {
  const dict = await db.query('SELECT duration_sec, max_stacks FROM t_status_effects_dict WHERE effect_id = $1', [effectId]);
  if (!dict.rows.length) return { success: false, error: 'EFFECT_NOT_FOUND' };
  const duration = durationSec || dict.rows[0].duration_sec || 60;
  const existing = await db.query(
    `SELECT id FROM t_active_effects
     WHERE target_type = 'avatar' AND target_id = $1 AND effect_id = $2 AND expires_at > NOW() FOR UPDATE`,
    [avatarUuid, effectId]
  );
  if (existing.rows.length) {
    await db.query(
      `UPDATE t_active_effects SET stacks = LEAST(stacks + 1, $2),
              expires_at = GREATEST(expires_at, NOW() + make_interval(secs => $3))
       WHERE id = $1`,
      [existing.rows[0].id, dict.rows[0].max_stacks || 1, duration]
    );
  } else {
    await db.query(
      `INSERT INTO t_active_effects (target_type, target_id, effect_id, source_id, expires_at, source_kind, source_ref)
       VALUES ('avatar', $1, $2, $3, NOW() + make_interval(secs => $4), $5, $6)`,
      [avatarUuid, effectId, sourceUuid, duration, sourceKind, sourceRef]
    );
  }
  return { success: true, durationSec: duration };
}

export async function clearEffects(db, avatarUuid, { dispellableOnly = true, effectIds = null } = {}) {
  const r = await db.query(
    `DELETE FROM t_active_effects e USING t_status_effects_dict d
     WHERE d.effect_id = e.effect_id AND e.target_type = 'avatar' AND e.target_id = $1
       AND ($2::boolean = FALSE OR d.is_dispellable)
       AND ($3::text[] IS NULL OR e.effect_id = ANY($3))`,
    [avatarUuid, dispellableOnly, effectIds]
  );
  return r.rowCount;
}

// D96-c : régénération de PM paresseuse — N % des PM max par minute écoulée depuis la
// dernière résolution, jusqu'à PM pleins (l'effet s'arrête alors) ou jusqu'à échéance.
export async function settleMpRegen(db, avatarUuid) {
  return inTransaction(db, 'Erreur de régénération de PM', { avatarUuid }, async (client) => {
    const effects = await client.query(
      `SELECT e.id, d.modifier_value,
              EXTRACT(EPOCH FROM (LEAST(NOW(), e.expires_at) - COALESCE(e.last_tick_at, e.applied_at)))::float AS elapsed,
              e.expires_at <= NOW() AS ended
       FROM t_active_effects e JOIN t_status_effects_dict d ON d.effect_id = e.effect_id
       WHERE e.target_type = 'avatar' AND e.target_id = $1 AND d.stat_modified = 'mp_regen'
       FOR UPDATE OF e`,
      [avatarUuid]
    );
    if (!effects.rows.length) return { success: true, gained: 0 };
    const avatar = await client.query('SELECT mp_current, mp_max FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE', [avatarUuid]);
    let { mp_current: mp } = avatar.rows[0];
    const { mp_max: max } = avatar.rows[0];
    const before = mp;
    for (const ef of effects.rows) {
      mp = Math.min(max, mp + Math.floor(max * (ef.modifier_value / 100) * (Math.max(0, ef.elapsed) / 60)));
      if (ef.ended || mp >= max) {
        await client.query('DELETE FROM t_active_effects WHERE id = $1', [ef.id]);
      } else {
        await client.query('UPDATE t_active_effects SET last_tick_at = NOW() WHERE id = $1', [ef.id]);
      }
    }
    if (mp !== before) await client.query('UPDATE t_avatars SET mp_current = $1 WHERE avatar_uuid = $2', [mp, avatarUuid]);
    return { success: true, gained: mp - before };
  });
}

// ─── !cast hors combat (E4, E5) ───

async function findKnownSpell(client, casterUuid, query) {
  const r = await client.query(
    `SELECT s.skill_id, s.name, s.tier, s.mp_cost, s.base_damage, s.base_healing, s.stat_scaling,
            (SELECT 1 FROM t_status_effects_dict d WHERE d.effect_id = 'EFF_' || s.skill_id AND d.type = 'buff') IS NOT NULL AS has_effect
     FROM t_avatar_skills a JOIN t_skills_dict s ON s.skill_id = a.skill_id
     WHERE a.avatar_uuid = $1 AND s.skill_type = 'MAG' AND (s.skill_id = UPPER($2) OR s.name ILIKE $2)
     LIMIT 1`,
    [casterUuid, query]
  );
  return r.rows[0] || null;
}

// T1-T2 : soi ou l'allié désigné (même zone). T3+ : le groupe présent dans la zone.
async function resolveTargets(client, caster, spell, targetPhone) {
  if (spell.tier >= 3) {
    const r = await client.query(
      `SELECT a.avatar_uuid, a.avatar_name, a.hp_current, a.hp_max, a.is_alive
       FROM t_avatars a
       WHERE a.current_zone_id = $2 AND (a.avatar_uuid = $1 OR a.avatar_uuid IN (
         SELECT m2.avatar_uuid FROM t_party_members m1 JOIN t_party_members m2 ON m2.party_id = m1.party_id
         WHERE m1.avatar_uuid = $1))
       FOR UPDATE`,
      [caster.avatar_uuid, caster.current_zone_id]
    );
    return { targets: r.rows };
  }
  if (!targetPhone) return { targets: [caster] };
  const r = await client.query(
    'SELECT avatar_uuid, avatar_name, hp_current, hp_max, is_alive, current_zone_id FROM t_avatars WHERE whatsapp_phone = $1 FOR UPDATE',
    [targetPhone]
  );
  const t = r.rows[0];
  if (!t) return { error: 'TARGET_NOT_FOUND' };
  if (t.current_zone_id !== caster.current_zone_id) return { error: 'TARGET_NOT_IN_ZONE' };
  return { targets: [t] };
}

export async function castOutOfCombat(db, casterUuid, query, targetPhone = null, { school = null } = {}) {
  return inTransaction(db, 'Erreur de lancer hors combat', { casterUuid, query }, async (client) => {
    const casterRow = await client.query(
      'SELECT avatar_uuid, avatar_name, current_zone_id, mp_current, stat_int, hp_current, hp_max, is_alive FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE',
      [casterUuid]
    );
    const caster = casterRow.rows[0];
    if (!caster.is_alive) return { success: false, error: 'CASTER_DEAD' };
    const spell = await findKnownSpell(client, casterUuid, query);
    if (!spell) return { success: false, error: 'SPELL_UNKNOWN' };
    if (school && !spell.skill_id.startsWith(`${school}_`)) return { success: false, error: 'WRONG_SCHOOL' };

    const isRevive = REVIVE_SKILLS.includes(spell.skill_id);
    const cleanse = CLEANSE_SKILLS[spell.skill_id];
    // E5 : seuls les sorts sans dégâts directs se lancent hors combat.
    if (spell.base_damage > 0 || !(spell.base_healing > 0 || spell.has_effect || isRevive || cleanse)) {
      return { success: false, error: 'COMBAT_ONLY', spellName: spell.name };
    }
    if (caster.mp_current < spell.mp_cost) return { success: false, error: 'NO_MP', required: spell.mp_cost };

    const resolved = await resolveTargets(client, caster, spell, targetPhone);
    if (resolved.error) return { success: false, error: resolved.error };

    await client.query('UPDATE t_avatars SET mp_current = mp_current - $1 WHERE avatar_uuid = $2', [spell.mp_cost, casterUuid]);
    const scaling = typeof spell.stat_scaling === 'string' ? JSON.parse(spell.stat_scaling) : (spell.stat_scaling || {});
    const healAmount = Math.round((spell.base_healing || 0) + (caster.stat_int || 0) * (scaling.stat_int || 0));

    const outcomes = [];
    for (const t of resolved.targets) {
      if (!t.is_alive) {
        if (!isRevive) continue;
        const hp = Math.max(1, Math.floor(t.hp_max * REVIVE_HP_PCT / 100));
        await client.query('UPDATE t_avatars SET is_alive = TRUE, hp_current = $1 WHERE avatar_uuid = $2', [hp, t.avatar_uuid]);
        outcomes.push(`${t.avatar_name} revient à la vie (${hp} PV)`);
        continue;
      }
      if (healAmount > 0) {
        const hp = Math.min(t.hp_max, t.hp_current + healAmount);
        await client.query('UPDATE t_avatars SET hp_current = $1 WHERE avatar_uuid = $2', [hp, t.avatar_uuid]);
        outcomes.push(`${t.avatar_name} +${hp - t.hp_current} PV`);
      }
      if (cleanse) {
        const n = await clearEffects(client, t.avatar_uuid, { effectIds: cleanse });
        outcomes.push(`${t.avatar_name} : ${n ? 'purgé' : 'rien à purger'}`);
      }
      if (spell.has_effect) {
        await applyEffect(client, t.avatar_uuid, `EFF_${spell.skill_id}`, { sourceKind: 'skill', sourceRef: spell.skill_id, sourceUuid: casterUuid });
        outcomes.push(`${t.avatar_name} bénéficie de ${spell.name}`);
      }
    }
    return { success: true, spellName: spell.name, mpCost: spell.mp_cost, outcomes };
  });
}

export default {
  listActiveEffects, loadCombatEffects, persistCombatEffects, applyEffect, clearEffects, castOutOfCombat, settleMpRegen,
};
