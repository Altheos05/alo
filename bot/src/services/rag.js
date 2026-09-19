import logger from '../utils/logger.js';
import { search, formatResults, getStats } from './vector-index.js';
import { executePipelineCommands } from './sys-pipeline.js';

const LEVEL1_CACHE = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

const NPC_KNOWLEDGE_CACHE = new Map();
const ZONE_KNOWLEDGE_CACHE = new Map();

export async function retrieveKnowledge(db, query, context = {}) {
  const l1 = level1Cache(query);
  if (l1) return l1;

  const l1v = await level1Vector(query, context);
  if (l1v) {
    setCache(query, l1v);
    return l1v;
  }

  const l2Result = await level2DB(db, query, context);
  if (l2Result) {
    if (context.useApi) {
      const l3 = await level3Generate(db, query, { ...context, ragContext: l2Result.content });
      if (l3?.content) return l3;
    }
    return l2Result;
  }

  const l3 = await level3Generate(db, query, context);
  return l3;
}

async function level1Vector(query, context) {
  const stats = getStats();
  if (!stats.total) return null;

  const results = await search(query, 3);
  if (!results.length) return null;

  if (context.npcId) {
    const npcResults = results.filter(r => r.metadata?.npc_id === context.npcId);
    if (npcResults.length) {
      return { source: 'l1v_npc', content: npcResults.map(r => r.text).join('\n') };
    }
  }

  if (context.zoneId) {
    const zoneResults = results.filter(r => r.sourceId === context.zoneId && r.sourceTable === 't_zones');
    if (zoneResults.length) {
      return { source: 'l1v_zone', content: zoneResults.map(r => r.text).join('\n') };
    }
  }

  const content = formatResults(results);
  return content ? { source: 'l1v_general', content } : null;
}

function level1Cache(query) {
  const key = query.toLowerCase().trim();
  const cached = LEVEL1_CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    logger.debug('RAG L1 hit', { query: key });
    return cached.data;
  }
  if (cached) LEVEL1_CACHE.delete(key);
  return null;
}

async function level2DB(db, query, context) {
  const lower = query.toLowerCase();

  if (context.npcId) {
    const cached = NPC_KNOWLEDGE_CACHE.get(context.npcId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      logger.debug('RAG L2 NPC cache hit', { npcId: context.npcId });
      return { source: 'l2_npc_cache', content: cached.data, npcId: context.npcId };
    }

    try {
      const result = await db.query(
        // D18 : ce cache est partagé entre joueurs — K2 (débloqué par joueur) n'y entre jamais.
        'SELECT content FROM t_npc_knowledge WHERE npc_id = $1 AND k_level IN ($2, $3) ORDER BY k_level ASC LIMIT 3',
        [context.npcId, 'K0', 'K1']
      );
      if (result.rows.length > 0) {
        const content = result.rows.map(r => r.content).join('\n');
        NPC_KNOWLEDGE_CACHE.set(context.npcId, { data: { source: 'l2_npc_knowledge', content, npcId: context.npcId }, timestamp: Date.now() });
        return { source: 'l2_npc_knowledge', content, npcId: context.npcId };
      }
    } catch (err) {
      logger.warn('RAG L2 NPC query failed', { error: err.message });
    }
  }

  if (context.zoneId) {
    const cached = ZONE_KNOWLEDGE_CACHE.get(context.zoneId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      logger.debug('RAG L2 Zone cache hit', { zoneId: context.zoneId });
      return { source: 'l2_zone_cache', content: cached.data, zoneId: context.zoneId };
    }

    try {
      const result = await db.query(
        'SELECT zone_name, zone_type, description, lore FROM t_zones WHERE zone_id = $1',
        [context.zoneId]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        const content = `Zone: ${row.zone_name} (${row.zone_type})${row.description ? '\n' + row.description : ''}${row.lore ? '\n' + row.lore : ''}`;
        ZONE_KNOWLEDGE_CACHE.set(context.zoneId, { data: { source: 'l2_zone_db', content, zoneId: context.zoneId }, timestamp: Date.now() });
        return { source: 'l2_zone_db', content, zoneId: context.zoneId };
      }
    } catch (err) {
      logger.warn('RAG L2 Zone query failed', { error: err.message });
    }
  }

  if (lower.includes('race') || lower.includes('sylphe') || lower.includes('salamandre')) {
    try {
      const raceTerms = {
        sylphe: 'Sylphe', salamandre: 'Salamandre', gnome: 'Gnome',
        imp: 'Imp', undine: 'Undine', spr: 'Spriggan',
      };
      let raceName = null;
      for (const [term, name] of Object.entries(raceTerms)) {
        if (lower.includes(term)) { raceName = name; break; }
      }
      if (raceName) {
        const result = await db.query(
          'SELECT race_id, name, description, home_zone_id, base_stats FROM t_races WHERE name ILIKE $1',
          [raceName]
        );
        if (result.rows.length > 0) {
          const row = result.rows[0];
          const content = `${row.name}: ${row.description || 'Description non disponible.'}`;
          return { source: 'l2_race_db', content, raceId: row.race_id };
        }
      }
    } catch {}
  }

  if (lower.includes('quêt') || lower.includes('quest') || lower.includes('mission')) {
    try {
      const result = await db.query(
        'SELECT quest_id, title, quest_type, description, min_level FROM t_quests_dict ORDER BY min_level ASC LIMIT 5'
      );
      if (result.rows.length > 0) {
        const content = result.rows.map(q =>
          `• ${q.title} (${q.quest_type}) — Niv. ${q.min_level}${q.description ? ': ' + q.description.slice(0, 100) : ''}`
        ).join('\n');
        return { source: 'l2_quests', content };
      }
    } catch {}
  }

  const loreKeywords = ['légende', 'lore', 'histoire', 'dieu', 'création', 'alfheim', 'yggdrasil',
    'ancien', 'prophétie', 'mythe', 'origine', 'monde'];
  const hasLore = loreKeywords.some(k => lower.includes(k));
  if (hasLore) {
    try {
      const result = await db.query(
        "SELECT content FROM t_encyclopedia_dict WHERE category IN ('lore', 'history') LIMIT 5"
      );
      if (result.rows.length > 0) {
        const content = result.rows.map(r => r.content).join('\n');
        return { source: 'l2_lore', content };
      }
    } catch {}
  }

  return null;
}

async function level3Generate(db, query, context) {
  if (context.useApi) {
    const { generateResponse } = await import('./llm.js').catch(() => ({ generateResponse: null }));
    if (generateResponse) {
      try {
        const result = await generateResponse(query, context);
        const pipelineResult = await executePipelineCommands(db, result || '', 'system');
        const content = pipelineResult.commands.length ? pipelineResult.modified || result : result;
        return { source: 'l3_llm', content };
      } catch {
        return { source: 'l3_fallback', content: null };
      }
    }
  }
  return { source: 'l3_fallback', content: null };
}

export function getDialogueResponse(npc, query) {
  const lower = query.toLowerCase();

  if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello')) {
    return `Bonjour ! ${npc.display_name || 'Je'} suis là pour t'aider.`;
  }
  if (lower.includes('qui')) {
    return `Je suis ${npc.display_name || 'un habitant'}, ${npc.role_type || 'ici pour servir'}.`;
  }
  if (lower.includes('merci')) {
    return 'De rien ! Reviens quand tu veux.';
  }

  return null;
}

export async function retrieveLore(db, query) {
  const lower = query.toLowerCase();
  const topics = {
    yggdrasil: ['Yggdrasil', 'Arbre-Monde', "l'arbre sacré qui relie les neuf mondes d'ALfheim"],
    alfheim: ['ALfheim', 'Le monde des Alfes', 'le royaume où vivent Alfes et humains'],
    cardinal: ['Système Cardinal', 'Le système qui régit les lois de ce monde'],
  };

  for (const [key, [name, ...desc]] of Object.entries(topics)) {
    if (lower.includes(key)) {
      return `**${name}** : ${desc.join(' ')}`;
    }
  }

  try {
    const result = await db.query(
      "SELECT title, content FROM t_encyclopedia_dict WHERE category = 'lore' LIMIT 5"
    );
    if (result.rows.length > 0) {
      const best = result.rows.find(r =>
        query.split(' ').some(w => r.title.toLowerCase().includes(w) || r.content.toLowerCase().includes(w))
      );
      if (best) return `**${best.title}** : ${best.content.slice(0, 300)}`;
    }
  } catch {}

  return null;
}

export function setCache(key, data) {
  LEVEL1_CACHE.set(key.toLowerCase().trim(), { data, timestamp: Date.now() });
}

export default { retrieveKnowledge, getDialogueResponse, retrieveLore, setCache };
