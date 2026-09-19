// Consommables (!use) : soins instantanés, rassasiement (régénération hors combat)
// et buffs de repas persistants (D90 E6, colonne T_ITEMS_DICT.use_effect).
// Un seul buff de nourriture à la fois : un nouveau plat remplace le précédent.
import { inTransaction } from './bank.js';
import { applyEffect } from './effects.js';

const FOOD_PREFIXES = ['CSM_NOU_', 'CSM_CUI_'];

async function takeOne(client, avatarUuid, itemId) {
  const r = await client.query(
    `SELECT i.instance_uuid, i.quantity, d.name, COALESCE(i.instance_data->'use_effect', d.use_effect) AS use_effect
     FROM t_inventory i JOIN t_items_dict d ON d.item_id = i.item_id
     WHERE i.avatar_uuid = $1 AND i.item_id = $2 AND NOT i.is_equipped
     ORDER BY i.acquired_at LIMIT 1 FOR UPDATE OF i`,
    [avatarUuid, itemId]
  );
  const row = r.rows[0];
  if (!row) return { error: 'NOT_OWNED' };
  if (!row.use_effect) return { error: 'NOT_USABLE' };
  if (row.quantity > 1) {
    await client.query('UPDATE t_inventory SET quantity = quantity - 1 WHERE instance_uuid = $1', [row.instance_uuid]);
  } else {
    await client.query('DELETE FROM t_inventory WHERE instance_uuid = $1', [row.instance_uuid]);
  }
  return { name: row.name, effect: row.use_effect };
}

// Hors combat : tout s'applique (la régénération de rassasiement est créditée d'un coup).
export async function useItem(db, avatarUuid, itemId) {
  return inTransaction(db, 'Erreur d\'utilisation d\'objet', { avatarUuid, itemId }, async (client) => {
    const taken = await takeOne(client, avatarUuid, itemId);
    if (taken.error) return { success: false, error: taken.error };
    const e = taken.effect;
    const hp = (e.heal_hp || 0) + (e.regen_hp || 0);
    const mp = (e.heal_mp || 0) + (e.regen_mp || 0);
    const before = (await client.query('SELECT hp_current, mp_current FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE', [avatarUuid])).rows[0];
    const after = (await client.query(
      `UPDATE t_avatars SET hp_current = LEAST(hp_max, hp_current + $1), mp_current = LEAST(mp_max, mp_current + $2)
       WHERE avatar_uuid = $3 RETURNING hp_current, mp_current`,
      [hp, mp, avatarUuid]
    )).rows[0];
    const isFood = FOOD_PREFIXES.some(p => itemId.startsWith(p));
    if (e.effect_id) {
      if (isFood) {
        await client.query("DELETE FROM t_active_effects WHERE target_type = 'avatar' AND target_id = $1 AND source_kind = 'food'", [avatarUuid]);
      }
      // Plat de marmite (D93) : la durée vient de l'exemplaire, pas du dictionnaire.
      await applyEffect(client, avatarUuid, e.effect_id, {
        durationSec: e.duration_sec || null, sourceKind: isFood ? 'food' : 'system', sourceRef: itemId,
      });
    }
    return {
      success: true, name: taken.name,
      hpGain: after.hp_current - before.hp_current, mpGain: after.mp_current - before.mp_current,
      buff: !!e.effect_id,
    };
  });
}

// En combat : seuls soins instantanés et buffs ; le rassasiement est « hors combat ».
// Retrait de l'objet et PM dans la même transaction ; les PV restent ceux du combat.
export async function useItemInCombat(db, combat, itemId, effectsDict, applyStatusEffect) {
  const taken = await inTransaction(db, 'Erreur d\'utilisation en combat', { itemId }, async (client) => {
    const probe = await client.query('SELECT use_effect FROM t_items_dict WHERE item_id = $1', [itemId]);
    const e = probe.rows[0]?.use_effect;
    if (e && !e.heal_hp && !e.heal_mp && !e.effect_id) return { success: false, error: 'OUT_OF_COMBAT_ONLY' };
    const t = await takeOne(client, combat.playerUuid, itemId);
    if (t.error) return { success: false, error: t.error };
    if (t.effect.heal_mp) {
      await client.query('UPDATE t_avatars SET mp_current = LEAST(mp_max, mp_current + $1) WHERE avatar_uuid = $2', [t.effect.heal_mp, combat.playerUuid]);
    }
    return { success: true, ...t };
  });
  if (!taken.success) return taken;
  const before = combat.player.hp_current;
  combat.player.hp_current = Math.min(combat.player.hp_max, before + (taken.effect.heal_hp || 0));
  combat.player.mp_current = Math.min(combat.player.mp_max, combat.player.mp_current + (taken.effect.heal_mp || 0));
  if (taken.effect.effect_id && effectsDict[taken.effect.effect_id]) {
    applyStatusEffect(combat.player, { ...effectsDict[taken.effect.effect_id] });
  }
  return { success: true, name: taken.name, hpGain: combat.player.hp_current - before };
}

export default { useItem, useItemInCombat };
