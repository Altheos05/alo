// Enveloppe informationnelle des PNJ (D17-D18, npc_knowledge_protocol.md §2) et
// sujets de service (D84, §2-bis). Résolution 100 % déterministe, sans LLM :
// aucun match → KX ; K3 → déflection ; K2 → seulement si débloqué ; K0/K1 → libre.
import { inTransaction } from './bank.js';
import { getCommand } from '../services/sys-registry.js';
import { executeCommand } from '../services/sys-pipeline.js';

const norm = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/_/g, ' ').trim();

export async function findNpc(db, query, zoneId) {
  const r = await db.query(
    `SELECT npc_id, display_name, zone_id FROM t_npc
     WHERE is_alive AND (npc_id = UPPER($1) OR display_name ILIKE $2)
     ORDER BY (zone_id = $3) DESC, (npc_id = UPPER($1)) DESC LIMIT 1`,
    [query, `%${query.replace(/_/g, ' ')}%`, zoneId]
  );
  return r.rows[0] || null;
}

// R1 de T_NPC_RELATIONS : l'arête naît au premier dialogue, jamais avant.
export async function recordInteraction(db, avatarUuid, npcId) {
  await db.query(
    `INSERT INTO t_npc_relations (avatar_uuid, npc_id, interaction_count) VALUES ($1, $2, 1)
     ON CONFLICT (avatar_uuid, npc_id) DO UPDATE
       SET interaction_count = t_npc_relations.interaction_count + 1, last_talked_at = NOW()`,
    [avatarUuid, npcId]
  );
}

// Grammaire §1.3 (AFF / QUEST / TITLE / RACE / ITEM, composables par « + »).
// PAY est traité à part : il exige le consentement explicite du joueur.
async function conditionMet(db, avatarUuid, npcId, clause) {
  const [kind, value] = clause.split(/[:=]/).map(s => s.trim());
  if (kind.startsWith('AFF>')) {
    const need = parseInt(clause.match(/(\d+)/)[1], 10);
    const r = await db.query('SELECT affinity FROM t_npc_relations WHERE avatar_uuid = $1 AND npc_id = $2', [avatarUuid, npcId]);
    return (r.rows[0]?.affinity ?? 0) >= need;
  }
  const checks = {
    QUEST: ["SELECT 1 FROM t_active_quests WHERE avatar_uuid = $1 AND quest_id = $2 UNION SELECT 1 FROM t_quest_history WHERE avatar_uuid = $1 AND quest_id = $2"],
    TITLE: ['SELECT 1 FROM t_player_titles WHERE avatar_uuid = $1 AND title_id = $2 AND is_active'],  // « titre porté »
    RACE: ['SELECT 1 FROM t_avatars WHERE avatar_uuid = $1 AND race_id = $2'],
    ITEM: ['SELECT 1 FROM t_inventory WHERE avatar_uuid = $1 AND item_id = $2'],
  };
  if (!checks[kind]) return false;
  const r = await db.query(checks[kind][0], [avatarUuid, value]);
  return r.rows.length > 0;
}

function parseCondition(raw) {
  const cleaned = String(raw || '').replace(/`/g, '').trim();
  if (!cleaned || cleaned === '—' || cleaned === '-') return { clauses: [], pay: 0 };
  const clauses = cleaned.split('+').map(s => s.trim()).filter(Boolean);
  const payClause = clauses.find(c => /^PAY/i.test(c));
  return {
    clauses: clauses.filter(c => !/^PAY/i.test(c)),
    pay: payClause ? parseInt(payClause.match(/(\d+)/)?.[1] || '0', 10) : 0,
  };
}

// §2 : résolution d'un sujet. wantsToPay = le joueur a explicitement accepté un PAY.
export async function askTopic(db, avatarUuid, npc, topic, { wantsToPay = false } = {}) {
  await recordInteraction(db, avatarUuid, npc.npc_id);
  const rows = (await db.query(
    `SELECT k.*, (u.qi_id IS NOT NULL) AS unlocked
     FROM t_npc_knowledge k
     LEFT JOIN t_npc_knowledge_unlocks u ON u.qi_id = k.qi_id AND u.avatar_uuid = $2
     WHERE k.npc_id = $1`,
    [npc.npc_id, avatarUuid]
  )).rows;
  const wanted = norm(topic);
  const match = rows
    .filter(r => r.k_level !== 'KX' && (r.topic_tags || []).some(t => norm(t) === wanted || norm(t).startsWith(wanted)))
    .sort((a, b) => a.k_level.localeCompare(b.k_level))[0];

  if (!match) {
    const kx = rows.find(r => r.k_level === 'KX');
    return { kind: 'ignorance', text: kx?.content || '« Je ne sais rien de ça. »' };
  }
  // K3 : révélé seulement après déblocage scénarisé (IA/GM, SYS_NPC_KNOWLEDGE_UNLOCK).
  if (match.k_level === 'K3' && !match.unlocked) return { kind: 'deflection', text: match.deflection_line || '« Je n\'en parlerai pas. »' };

  if (match.k_level === 'K2' && !match.unlocked) {
    const cond = parseCondition(match.unlock_condition);
    for (const clause of cond.clauses) {
      if (!(await conditionMet(db, avatarUuid, npc.npc_id, clause))) return { kind: 'locked' };
    }
    if (cond.pay > 0) {
      if (!wantsToPay) return { kind: 'price', price: cond.pay, topic };
      // K4 : débit et déblocage dans la même transaction.
      const paid = await inTransaction(db, 'Erreur de paiement d\'information', { avatarUuid, qi: match.qi_id }, async (client) => {
        const w = await client.query('SELECT yrd_balance FROM t_avatars WHERE avatar_uuid = $1 FOR UPDATE', [avatarUuid]);
        if (Number(w.rows[0].yrd_balance) < cond.pay) return { success: false, error: 'INSUFFICIENT_FUNDS' };
        await client.query('UPDATE t_avatars SET yrd_balance = yrd_balance - $1, total_yrd_spent = total_yrd_spent + $1 WHERE avatar_uuid = $2', [cond.pay, avatarUuid]);
        await client.query('INSERT INTO t_npc_knowledge_unlocks (avatar_uuid, qi_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [avatarUuid, match.qi_id]);
        return { success: true };
      });
      if (!paid.success) return { kind: 'too_poor', price: cond.pay };
    } else {
      await db.query('INSERT INTO t_npc_knowledge_unlocks (avatar_uuid, qi_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [avatarUuid, match.qi_id]);
    }
  }

  const answer = { kind: 'answer', text: match.content, qiId: match.qi_id };
  if (!match.is_service) return answer;

  // 2-bis.2 : la révélation est acquise ; seule l'action de service peut échouer.
  const def = getCommand(match.service_sys_command);
  const needsOnlyPlayer = def && Object.keys(def.schema).every(k => k === 'player_id');
  if (!needsOnlyPlayer) return { ...answer, service: { ok: false, message: 'Ce service n\'est pas encore ouvert.' } };
  if (match.service_cost_yrds > 0) {
    // 2-bis.2 : le coût est payé à chaque invocation, avant l'action.
    const paid = await db.query(
      'UPDATE t_avatars SET yrd_balance = yrd_balance - $1, total_yrd_spent = total_yrd_spent + $1 WHERE avatar_uuid = $2 AND yrd_balance >= $1',
      [match.service_cost_yrds, avatarUuid]
    );
    if (!paid.rowCount) return { ...answer, service: { ok: false, message: `Ce service coûte ${match.service_cost_yrds} Yrds.` } };
  }
  const result = await executeCommand(db, { command: match.service_sys_command, params: { player_id: avatarUuid } }, 'system');
  if (!result.ok && match.service_cost_yrds > 0) {
    // Une action refusée n'est pas facturée.
    await db.query('UPDATE t_avatars SET yrd_balance = yrd_balance + $1, total_yrd_spent = total_yrd_spent - $1 WHERE avatar_uuid = $2',
      [match.service_cost_yrds, avatarUuid]);
  }
  return { ...answer, service: result };
}

// Sujets proposés au menu DIALOGUE (D83 §3.2) : K0/K1 seulement, jamais K3.
export async function menuTopics(db, npcId, limit) {
  const r = await db.query(
    `SELECT topic_tags[1] AS tag, is_service FROM t_npc_knowledge
     WHERE npc_id = $1 AND k_level IN ('K0','K1') AND array_length(topic_tags, 1) > 0
     ORDER BY is_service DESC, k_level, qi_id LIMIT $2`,
    [npcId, limit]
  );
  return r.rows;
}

export default { findNpc, recordInteraction, askTopic, menuTopics };
