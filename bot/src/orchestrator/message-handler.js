import logger from '../utils/logger.js';
import { routeMessage } from '../agents/router.js';
import { render } from '../services/template.js';
import * as economy from '../handlers/economy.js';
import * as movement from '../handlers/movement.js';
import * as combat from '../handlers/combat.js';
import * as playerService from '../handlers/player.js';
import * as dialogue from '../handlers/dialogue.js';
import * as bank from '../handlers/bank.js';
import * as mailHandler from '../handlers/mail.js';
import * as encyclopedia from '../handlers/encyclopedia.js';
import * as achievements from '../handlers/achievements.js';
import * as skillsHandler from '../handlers/skills.js';
import * as petsHandler from '../handlers/pets.js';
import * as craftHandler from '../handlers/craft.js';
import * as partyHandler from '../handlers/party.js';
import * as guildHandler from '../handlers/guild.js';
import * as equipmentHandler from '../handlers/equipment.js';
import * as registrationHandler from '../handlers/registration.js';
import * as diplomacyHandler from '../handlers/diplomacy.js';
import { retrieveLore } from '../services/rag.js';
import { executeCommand, executePipelineCommands, parseCommands } from '../services/sys-pipeline.js';
import config from '../config.js';

export async function processMessage(db, text, playerId = null, groupId = null, phoneNumber = null) {
  if (!text || typeof text !== 'string') {
    return { response: render('error'), routing: { intent: 'ERROR', confidence: 0 } };
  }

  if (!playerId && phoneNumber) {
    try {
      const pr = await db.query('SELECT avatar_uuid FROM t_avatars WHERE whatsapp_phone = $1', [phoneNumber]);
      if (pr.rows.length > 0) playerId = pr.rows[0].avatar_uuid;
    } catch {}
  }
  if (!playerId) {
    playerId = '00000000-0000-0000-0000-000000000001';
  }

  const routing = await routeMessage(text);

  if (routing.confidence < 0.7) {
    return { response: render('error'), routing };
  }

  let result;
  try {
    result = await executeIntent(db, routing, playerId, phoneNumber);
  } catch (err) {
    logger.error('Erreur lors de l\'exécution de l\'intent', {
      intent: routing.intent,
      error: err.message,
    });
    result = `❌ Une erreur est survenue : ${err.message}`;
  }

  // Un handler peut renvoyer soit un texte brut, soit { text, card } quand une
  // carte visuelle (rendue par cardRenderer) accompagne la réponse (cf. dialogue.js).
  let response;
  let card = null;
  if (result && typeof result === 'object') {
    response = result.text;
    card = result.card || null;
  } else {
    response = result;
  }

  if (!response) {
    response = render('fallback', { intent: routing.intent });
  }

  logger.info('Message traité', {
    intent: routing.intent,
    confidence: routing.confidence.toFixed(2),
    playerId,
    responseLength: response.length,
    hasCard: !!card,
  });

  return {
    response,
    card,
    routing,
  };
}

async function executeIntent(db, routing, playerId, phoneNumber = null) {
  switch (routing.intent) {
    case 'SHOP_LIST':
      return economy.handleShopList(db, playerId);

    case 'BUY':
      return economy.handleBuy(db, playerId, routing.entities);

    case 'SELL':
      return economy.handleSell(db, playerId, routing.entities);

    case 'MOVE': {
      const existingCombat = combat.getCombatStatus(playerId);
      if (existingCombat) {
        return '⚔️ Tu es en combat ! Tu ne peux pas te déplacer.';
      }
      return movement.handleMove(db, playerId, routing.entities);
    }

    case 'ATTACK': {
      const activeCombat = combat.getCombatStatus(playerId);
      if (activeCombat) {
        return combat.handleCombatAction(db, playerId, routing.entities);
      }
      return combat.handleAttack(db, playerId, routing.entities);
    }

    case 'SKILL_LIST':
      return skillsHandler.handleSkillList(db, playerId);

    case 'PET':
      return petsHandler.handlePet(db, playerId, routing.raw || '');

    case 'USE_SKILL': {
      const existingCombat = combat.getCombatStatus(playerId);
      if (existingCombat) {
        return combat.handleCombatAction(db, playerId, routing.entities);
      }
      return `⚔️ Tu n'es pas en combat. Tape "attaque [monstre]" pour en engager un.`;
    }

    case 'TALK':
      return dialogue.handleTalk(db, playerId, routing.entities);

    case 'INVENTORY':
      return playerService.handleInventory(db, playerId);

    case 'STATUS':
      return playerService.handleStatus(db, playerId);

    case 'QUEST':
      return playerService.handleQuests(db, playerId);

    case 'HELP':
      return render('help');

    case 'ENCYCLOPEDIA':
      return encyclopedia.handleEncyclopedia(db, playerId);

    case 'WIKI':
      return encyclopedia.handleWiki(db, playerId, routing.raw || '');

    case 'LORE_DOC':
      return encyclopedia.handleLoreDoc(db, playerId, routing.raw || '');

    case 'ACHIEVEMENTS':
      return achievements.handleAchievements(db, playerId);

    case 'RANKINGS':
      return achievements.handleRankings(db, playerId, routing.raw || '');

    case 'LORE_QUERY': {
      const lore = await retrieveLore(db, routing.raw || '');
      return lore || `📖 Mes connaissances sur ce sujet sont limitées. Interroge un PNJ ou explore le monde pour en apprendre plus.`;
    }

    case 'VAULT':
      return bank.handleVault(db, playerId, routing.entities, routing.raw || '');

    case 'MAIL':
      return mailHandler.handleMail(db, playerId, routing.raw || '');

    case 'EQUIP':
      return equipmentHandler.handleEquip(db, playerId, routing.raw || '');

    case 'PARTY':
      return partyHandler.handlePartyCommand(db, playerId, routing.raw || '');

    case 'GUILD':
      return guildHandler.handleGuildCommand(db, playerId, routing.raw || '');

    case 'SOCIAL':
      return `🤝 Tape "groupe" ou "guilde" pour gérer tes groupes et guildes.`;

    case 'CRAFT':
      return craftHandler.handleCraft(db, playerId, routing.raw || '');

    case 'EMOTE':
      return `🎭 ${routing.match?.[1] || '*fait une action mystérieuse*'}`;

    case 'WHISPER':
      return `📩 Message privé à **${routing.entities.target || 'inconnu'}** : ${routing.match?.[1] || ''}`;

    case 'LINK_START':
      return registrationHandler.handleLinkStart(db, phoneNumber, routing.raw || '');

    case 'DIPLOMACY':
      return diplomacyHandler.handleDiplomacy(db, playerId);

    case 'SYS':
      return handleSysCommand(db, routing, playerId, phoneNumber);

    default:
      return null;
  }
}

async function isGm(_db, _playerId, phoneNumber) {
  if (phoneNumber && config.game.gmPhones.includes(phoneNumber)) return true;
  return false;
}

async function handleSysCommand(db, routing, playerId, phoneNumber) {
  const text = routing.raw || '';
  if (text.match(/^!sys_help/i)) {
    return render('sys_help');
  }

  const parts = text.slice(1).split(/\s+/);
  const cmdName = parts[0]?.toUpperCase();
  if (!cmdName || !cmdName.startsWith('SYS_')) {
    return render('sys_unknown');
  }

  const gm = await isGm(db, playerId, phoneNumber);
  if (!gm) {
    logger.warn('Tentative SYS non-GM', { playerId, phoneNumber, command: cmdName });
    return `❌ Accès refusé. Seuls les GMs peuvent utiliser les commandes système.`;
  }

  const params = {};
  for (let i = 1; i < parts.length; i++) {
    const eq = parts[i].indexOf('=');
    if (eq === -1) continue;
    params[parts[i].slice(0, eq)] = parts[i].slice(eq + 1);
  }
  if (!params.player_id && playerId) params.player_id = playerId;

  const result = await executeCommand(db, { command: cmdName, params }, 'gm');
  return result.ok ? render('sys_ok', result) : render('sys_fail', result);
}

export default { processMessage };
