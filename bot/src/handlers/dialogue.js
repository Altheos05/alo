import { render } from '../services/template.js';
import { retrieveKnowledge, getDialogueResponse } from '../services/rag.js';
import { enhanceDialogue } from '../services/llm.js';
import { executePipelineCommands } from '../services/sys-pipeline.js';
import logger from '../utils/logger.js';

const AFFINITY_LABELS = {
  hostile: 'Hostile',
  stranger: 'Étrangère',
  known: 'Connue',
  trusted: 'Confiante',
  confidant: 'Confidente',
};

async function getRelationLabel(db, playerId, npcId) {
  try {
    const result = await db.query(
      'SELECT affinity_tier FROM t_npc_relations WHERE avatar_uuid = $1 AND npc_id = $2',
      [playerId, npcId]
    );
    const tier = result.rows[0]?.affinity_tier || 'stranger';
    return AFFINITY_LABELS[tier] || tier;
  } catch (err) {
    logger.debug('Relation PNJ indisponible pour la carte de dialogue', { npcId, error: err.message });
    return AFFINITY_LABELS.stranger;
  }
}

export async function handleTalk(db, playerId, entities) {
  const npcName = entities.npcId || entities.keyword || entities.target;

  if (!npcName) {
    return `🗣️ À qui veux-tu parler ?`;
  }

  let npc;
  if (npcName.match(/^NPC_\w+_\d+$/i)) {
    const result = await db.query(
      'SELECT npc_id, display_name, role_type, zone_id, level FROM t_npc WHERE npc_id = $1',
      [npcName.toUpperCase()]
    );
    if (result.rows.length > 0) npc = result.rows[0];
  }

  if (!npc) {
    const result = await db.query(
      'SELECT npc_id, display_name, role_type, zone_id, level FROM t_npc WHERE display_name ILIKE $1 LIMIT 1',
      [`%${npcName}%`]
    );
    if (result.rows.length > 0) npc = result.rows[0];
  }

  if (!npc) {
    return render('talk_notfound', { npcName });
  }

  let dialogue = getDialogueResponse(npc, npcName);

  let knowledge;
  if (!dialogue) {
    knowledge = await retrieveKnowledge(db, npcName, { npcId: npc.npc_id });
    if (knowledge?.content) {
      dialogue = knowledge.content;
    }
  }

  if (!dialogue) {
    const ctx = {
      npcId: npc.npc_id,
      zoneId: npc.zone_id,
      ragContext: knowledge?.content || '',
      playerMessage: npcName,
    };
    const enhanced = await enhanceDialogue(npc.npc_id, npc.display_name, npc.role_type, npcName, ctx);
    if (enhanced) {
      const pipelineResult = await executePipelineCommands(db, enhanced, 'system');
      dialogue = pipelineResult.commands.length ? pipelineResult.modified || enhanced : enhanced;
    }
  }

  if (!dialogue) {
    const knowledgeResult = await db.query(
      "SELECT content FROM t_npc_knowledge WHERE npc_id = $1 AND k_level IN ('K0','K1','K2') ORDER BY k_level ASC LIMIT 1",
      [npc.npc_id]
    );
    dialogue = knowledgeResult.rows.length > 0
      ? knowledgeResult.rows[0].content
      : getDefaultDialogue(npc.role_type);
  }

  const text = render('talk', { npcName: npc.display_name, dialogue });
  const relationLabel = await getRelationLabel(db, playerId, npc.npc_id);

  return {
    text,
    card: {
      template: 'dialogue_talk',
      variables: { npcName: npc.display_name, npcId: npc.npc_id, dialogue, relationLabel },
    },
  };
}

function getDefaultDialogue(roleType) {
  const dialogues = {
    MERCHANT: 'Bienvenue dans ma boutique. J\'ai des marchandises de qualité à te proposer.',
    SKILL_MASTER: 'Tu veux apprendre une nouvelle compétence ? Montre-moi ce que tu sais faire.',
    QUEST_GIVER: 'J\'ai une mission pour toi, aventurier. Es-tu prêt ?',
    GUARD: 'Rien à signaler. Reste vigilant dans cette zone.',
    LORD: 'Que les vents d\'ALfheim te soient favorables.',
    SERVICE: 'En quoi puis-je t\'être utile ?',
    BLACK_MARKET: 'Psst... Je peux te procurer des articles... spéciaux.',
    default: 'Bonjour, aventurier. Que puis-je faire pour toi ?',
  };
  return dialogues[roleType] || dialogues.default;
}

export default { handleTalk };
