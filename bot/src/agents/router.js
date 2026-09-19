import logger from '../utils/logger.js';
import { classifyIntent } from '../models/intent.js';
import { extractEntities } from '../models/ner.js';

const INTENT_PATTERNS = [
  { intent: 'MENU', pattern: /^!menu$/i },
  { intent: 'MOVE', pattern: /^(?:je )?(?:vais?|va|vé|va à|vais à|me déplace|teleporte|tp)\s*(?::\s*)?(`?\w+`?)?/i },
  { intent: 'SHOP_LIST', pattern: /^(?:boutique|shop|magasin|marchand|shop_list|!shop_list)$/i },
  { intent: 'BUY', pattern: /(?:achète|achete|achat|acheter|buy|prends?|je veux|donne moi|combien coûte|prix de)\s*(?::\s*)?(\d+)?\s*(.+)?/i },
  { intent: 'SELL', pattern: /(?:vends?|revends?|sell|vendre)\s*(?::\s*)?(\d+)?\s*(.+)?/i },
  { intent: 'ATTACK', pattern: /(?:attaqu?e?|attack|frappe?|cogne?|combat|engage)\s*(?::\s*)?(.+)?/i },
  { intent: 'SKILL_LIST', pattern: /^(?:skills?|compétences?|competences?|!skills|!skill_list)$/i },
  { intent: 'USE_SKILL', pattern: /(?:utilise?|use|lance?|cast|sort|compétence|skill)\s*(?::\s*)?(`?\w+`?)?/i },
  { intent: 'TALK', pattern: /(?:parle?|talk|discute?|dialogue|qui es-tu|que fais-tu)\s*(?::\s*)?(.+)?/i },
  { intent: 'INVENTORY', pattern: /^(?:inv|inventaire|sac|bag|items?|objets?|stuff)$/i },
  { intent: 'QUEST', pattern: /(?:quêt|quest|mission|contrat)\s*(?::\s*)?(.+)?/i },
  { intent: 'STATUS', pattern: /^(?:statut?|status|profil|profile|moi|perso|fiche|hp|mp)$/i },
  { intent: 'PARTY', pattern: /(?:groupe?|party|invite?|recrute?)\s*(?::\s*)?(.+)?/i },
  { intent: 'GUILD', pattern: /(?:guilde?|guild|clan)\s*(?::\s*)?(.+)?/i },
  { intent: 'CRAFT', pattern: /(?:craft_list|craft|fabrique?|forge?|artisanat|recette?|repair|enchant|alchimie|cook|mine)\s*(?::\s*)?(.+)?/i },
  { intent: 'ACHIEVEMENTS', pattern: /^(?:achievements|hauts?[- ]faits?|succes|succès|!achievements)$/i },
  { intent: 'RANKINGS', pattern: /^(?:rankings|classements?|!rankings)\b.*/i },
  { intent: 'ENCYCLOPEDIA', pattern: /^(?:encyclopedia|encyclop[ée]die|!encyclopedia)$/i },
  { intent: 'WIKI', pattern: /^(?:wiki|!wiki)\s+(.+)/i },
  { intent: 'LORE_DOC', pattern: /^(?:lore|!lore)\s+(.+)/i },
  { intent: 'LORE_QUERY', pattern: /(?:légende?|lore|histoire|dieu|création|mythe|origine|pourquoi|comment)\s*(?::\s*)?(.+)?/i },
  { intent: 'VAULT', pattern: /(?:bank_depot|bank_retrait|banque|coffre|dépôt|retrait|vault|banqu)\s*(?::\s*)?(.+)?/i },
  { intent: 'MAIL', pattern: /(?:mail|courrier|message|boîte)\s*(?::\s*)?(.+)?/i },
  { intent: 'PET', pattern: /^(?:!pet_feed|pet|familier|!pet)\b.*/i },
  { intent: 'DIPLOMACY', pattern: /^(?:diplomatie|alliances?|!diplomatie)$/i },
  { intent: 'EQUIP', pattern: /^[ée]quipement$/i },
  { intent: 'EQUIP', pattern: /(?:équipe?|equip|arme?|armure?|accessoir)\s*(?::\s*)?(.+)?/i },
  { intent: 'HELP', pattern: /^(?:help|aide|commandes?|menu|\/help|\/aide|!aide|!help)$/i },
  { intent: 'EMOTE', pattern: /^(?:\/me|\/emote|\/do|\/it)(?:\s+(.+))?$/i },
  { intent: 'WHISPER', pattern: /^(?:\/w|\/whisper|\/tell)\s+(\w+)\s+(.+)/i },
  { intent: 'HOUSING', pattern: /^(?:!?housing\w*|!?home_return|logement|!?rest|!?repos)\b.*/i },
  { intent: 'FLIGHT', pattern: /^!?(?:fly_mode|flight_gauge|vol_libre|barrel_roll|dive_bomb|hover|vol|voler)\b.*/i },
  { intent: 'INSPECT', pattern: /^!?inspect\s+(.+)/i },
  { intent: 'DROP_ITEM', pattern: /^!?jeter\s+(.+)/i },
  { intent: 'LINK_START', pattern: /^!link_start\b.*/i },
  { intent: 'SYS', pattern: /^!sys_\w+/i },
];

export function getAgentForIntent(intent) {
  const map = {
    MOVE: 'movement', SHOP_LIST: 'economy', BUY: 'economy', SELL: 'economy',
    ENCYCLOPEDIA: 'lore', WIKI: 'lore', LORE_DOC: 'lore',
    ACHIEVEMENTS: 'player', RANKINGS: 'player', SKILL_LIST: 'player', PET: 'player', LINK_START: 'player',
    DIPLOMACY: 'lore', HOUSING: 'player', MENU: 'system', FLIGHT: 'player', INSPECT: 'player', DROP_ITEM: 'player',
    ATTACK: 'combat', USE_SKILL: 'combat',
    TALK: 'dialogue', INVENTORY: 'player', QUEST: 'player',
    STATUS: 'player', PARTY: 'social', GUILD: 'social',
    CRAFT: 'economy', LORE_QUERY: 'lore', VAULT: 'economy',
    MAIL: 'social', EQUIP: 'player',
    HELP: 'system', EMOTE: 'social', WHISPER: 'social',
    SYS: 'system',
  };
  return map[intent] || 'fallback';
}

export async function routeMessage(text) {
  if (!text || typeof text !== 'string') {
    return { intent: 'UNKNOWN', confidence: 0, entities: {}, match: null, agent: 'fallback' };
  }

  const cleaned = text.trim();

  let intent;
  let confidence;
  let resultMatch = null;

  if (cleaned.startsWith('!')) {
    // Une commande « !mot » est déterministe : elle est aussi essayée sans son
    // « ! », sinon tout motif qui ne prévoit pas le préfixe (ex. GUILD pour
    // « !guild disband ») la laissait retomber dans le classifieur.
    const bare = cleaned.slice(1);
    for (const { intent: fi, pattern } of INTENT_PATTERNS) {
      let m = cleaned.match(pattern);
      if (!m || m.index !== 0) m = bare.match(pattern);
      if (m && m.index === 0) {
        intent = fi;
        confidence = 0.95;
        resultMatch = m;
        break;
      }
    }
  }

  // Un mot-clé exact (motif ancré ^…$ couvrant tout le message) est
  // déterministe : il prime sur le classifieur (« compétences » partait en WHISPER).
  if (!intent) {
    for (const { intent: fi, pattern } of INTENT_PATTERNS) {
      if (!pattern.source.startsWith('^') || !pattern.source.endsWith('$')) continue;
      const m = cleaned.match(pattern);
      if (m) {
        intent = fi;
        confidence = 0.95;
        resultMatch = m;
        break;
      }
    }
  }

  if (!intent) {
    const modelResult = await classifyIntent(cleaned);
    intent = modelResult.intent;
    confidence = modelResult.confidence;

    if (confidence < 0.7) {
      for (const { intent: fi, pattern } of INTENT_PATTERNS) {
        const m = cleaned.match(pattern);
        if (m) {
          const coverage = m[0].length / cleaned.length;
          if (coverage > 0.5) {
            intent = fi;
            confidence = Math.min(1, coverage);
            resultMatch = m;
            break;
          }
        }
      }
    }

    if (intent === 'UNKNOWN') {
      for (const { intent: fi, pattern } of INTENT_PATTERNS) {
        if (cleaned.match(pattern)) {
          intent = fi;
          confidence = fi === 'SYS' || fi === 'EMOTE' || fi === 'WHISPER' ? 0.9 : 0.5;
          break;
        }
      }
    }
  }

  const entities = await extractEntities(cleaned);

  if (intent === 'BUY' || intent === 'SELL') {
    for (const kw of ['potion', 'arme', 'armure', 'épée', 'bouclier', 'anneau', 'bague', 'minerai', 'plante']) {
      if (cleaned.toLowerCase().includes(kw)) {
        entities.keyword = kw;
        break;
      }
    }
  }

  if (intent === 'ATTACK' && !entities.monsterId) {
    const atkMatch = cleaned.match(/(?:attaqu?e?|attack|frappe?|cogne?|combat|engage)\s+(.+)/i);
    if (atkMatch) entities.target = atkMatch[1].trim();
  }

  if (!resultMatch) {
    for (const { intent: fi, pattern } of INTENT_PATTERNS) {
      if (fi === intent) {
        resultMatch = cleaned.match(pattern);
        break;
      }
    }
  }

  const agent = getAgentForIntent(intent);

  logger.debug('Message routé', {
    intent,
    confidence: confidence.toFixed(2),
    agent,
    entities: Object.keys(entities).length,
  });

  return {
    raw: text,
    intent,
    confidence,
    entities,
    agent,
    match: resultMatch?.slice(1) || null,
  };
}

export default { routeMessage, getAgentForIntent };
