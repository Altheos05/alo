import logger from '../utils/logger.js';
import { getPipeline } from './loader.js';

const INTENT_KEYWORDS = {
  MOVE: ['va', 'vais', 'allé', 'déplace', 'tp', 'teleporte', 'direction', 'move', 'go', 'vers'],
  SHOP_LIST: ['boutique', 'shop', 'magasin', 'marchand'],
  BUY: ['achète', 'achete', 'achat', 'acheter', 'buy', 'prends', 'je veux', 'donne', 'combien', 'prix'],
  SELL: ['vends', 'revends', 'sell', 'vendre', 'brade'],
  ATTACK: ['attaque', 'attack', 'frappe', 'cogne', 'engage', 'combat', 'tue'],
  TALK: ['parle', 'talk', 'discute', 'dialogue', 'parler'],
  INVENTORY: ['inventaire', 'sac', 'bag', 'items', 'objets', 'equipement'],
  STATUS: ['statut', 'status', 'profil', 'fiche', 'niveau', 'level', 'stats'],
  HELP: ['aide', 'help', 'commandes', 'tutoriel'],
  QUEST: ['quête', 'quest', 'mission', 'quêtes'],
  CRAFT: ['craft', 'artisanat', 'forge', 'fabrique', 'artisan'],
  EMOTE: ['/dance', '/salut', '/pleure', '/rire', '/crie'],
  WHISPER: ['mp', 'message privé', 'whisper', 'dm'],
};

const INTENT_LABELS = Object.keys(INTENT_KEYWORDS);

function keywordScore(text) {
  const lower = text.toLowerCase();
  let best = 'UNKNOWN';
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (keywords.length > 0) score = score / keywords.length;
    if (text.length < 20 && score > 0) score += 0.2;
    if (score > bestScore) { bestScore = score; best = intent; }
  }

  return { intent: best, confidence: Math.min(1, bestScore * 2) };
}

export async function classifyIntent(text) {
  const kw = keywordScore(text);

  if (kw.confidence >= 0.7) return kw;

  if (kw.confidence >= 0.3) {
    const pipe = getPipeline('intent');
    if (pipe) {
      try {
        const result = await pipe(text, INTENT_LABELS, {
          hypothesis_template: 'This action is about {}.',
          multi_label: false,
        });

        const top = result.labels[0];
        const score = result.scores[0];

        if (score > 0.5) {
          logger.debug('Intent ML', { text, intent: top, score });
          return { intent: top, confidence: score };
        }
      } catch (err) {
        logger.debug('Intent ML failed, fallback keyword', { error: err.message });
      }
    }
  }

  return kw;
}

export default { classifyIntent };
