import {
  listZoneNodes, harvestNode, castLine, reelLine, FISHING_OPTIONS,
} from '../engine/gathering.js';
import { getPlayer } from '../services/player.js';

const TYPES = {
  recolter: { nodeType: 'FLORA', verb: 'récolter', command: '!recolter', emoji: '🌿' },
  mine: { nodeType: 'ORE', verb: 'miner', command: '!mine', emoji: '⛏️' },
  fish: { nodeType: 'FISH', verb: 'pêcher', command: '!fish', emoji: '🎣' },
};
const TOOL_LABEL = { OUT_PIO: 'une pioche', OUT_CAN: 'une canne à pêche' };

function formatError(r) {
  switch (r.error) {
    case 'NODE_NOT_FOUND': return '❌ Nœud de ressource inconnu.';
    case 'NOT_IN_ZONE': return '❌ Ce nœud n\'est pas dans ta zone.';
    case 'LEVEL': return `❌ Niveau ${r.required} requis.`;
    case 'DEPLETED': return '❌ Ce nœud est épuisé pour l\'instant, pour tout le monde.';
    case 'RESPAWN': {
      const min = Math.max(1, Math.ceil((new Date(r.nextAt) - Date.now()) / 60000));
      return `⏳ Tu as déjà exploité ce nœud : de retour dans ${min} min.`;
    }
    case 'NO_TOOL': return `❌ Il te faut ${TOOL_LABEL[r.prefix]} de tier T${r.tier} ou plus, non cassée.`;
    default: return '❌ Action impossible.';
  }
}

function toolNote(r) {
  return r.toolBroke ? `\n💥 **${r.toolName}** est cassée — fais-la réparer ("!repair").` : '';
}

async function listNodes(db, playerId, spec) {
  const player = await getPlayer(db, playerId);
  const nodes = await listZoneNodes(db, player.current_zone_id, spec.nodeType);
  if (!nodes.length) return `${spec.emoji} Rien à ${spec.verb} dans cette zone.`;
  const lines = nodes.map(n => `• \`${n.node_id}\` — ${n.item_name} (T${n.node_tier}, niv. ${n.level_required})`);
  return `${spec.emoji} **À ${spec.verb} ici** :\n${lines.join('\n')}\n\n"${spec.command} [ID]"`;
}

export async function handleGathering(db, playerId, raw = '', { menuRef = null } = {}) {
  const [word, arg] = raw.trim().replace(/^!/, '').split(/\s+/);
  const command = word.toLowerCase();

  // Réponse au mini-jeu : n'existe qu'au travers du menu FISHING (réf. « FSH_x:bonne_option »).
  if (command === 'fish_reel') {
    const [nodeId, correct] = (menuRef || '').split(':');
    if (!nodeId?.startsWith('FSH_')) return '🎣 Lance d\'abord ta ligne ("!fish").';
    const r = await reelLine(db, playerId, nodeId, parseInt(arg, 10), parseInt(correct, 10));
    if (!r.success) return formatError(r);
    if (r.caught) return `🎣 Prise ! +${r.qty}× **${r.itemName}**.${toolNote(r)}`;
    const why = r.rightMove ? 'Bonne réaction, mais le poisson se décroche.' : 'Mauvaise réaction : la ligne se détend, le poisson file.';
    return `🎣 ${why}${toolNote(r)}`;
  }

  const spec = TYPES[command];
  if (!arg) return listNodes(db, playerId, spec);
  const nodeId = arg.toUpperCase();

  if (spec.nodeType === 'FISH') {
    const r = await castLine(db, playerId, nodeId);
    if (!r.success) return formatError(r);
    return {
      text: `🎣 Tu lances ta ligne… ${r.situation.text}`,
      menu: {
        context: 'FISHING',
        ref: `${nodeId}:${r.situation.correct}`,
        options: FISHING_OPTIONS.map((label, i) => ({ digit: i + 1, label, command: `!fish_reel ${i + 1}` })),
      },
    };
  }

  const r = await harvestNode(db, playerId, nodeId, spec.nodeType);
  if (!r.success) return formatError(r);
  return `${spec.emoji} +${r.qty}× **${r.itemName}**.${toolNote(r)}`;
}

export default { handleGathering };
