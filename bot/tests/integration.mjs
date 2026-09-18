import pool from '../src/db/pool.js';
import { processMessage } from '../src/orchestrator/message-handler.js';
import { executeCommand, parseCommands } from '../src/services/sys-pipeline.js';
import { getCommand } from '../src/services/sys-registry.js';
import * as combat from '../src/handlers/combat.js';
import * as movement from '../src/handlers/movement.js';
import * as economy from '../src/handlers/economy.js';
import * as dialogue from '../src/handlers/dialogue.js';
import * as bank from '../src/handlers/bank.js';
import * as mailHandler from '../src/handlers/mail.js';
import * as encyclopedia from '../src/handlers/encyclopedia.js';
import * as achievements from '../src/handlers/achievements.js';
import * as skillsHandler from '../src/handlers/skills.js';
import * as petsHandler from '../src/handlers/pets.js';
import * as craftHandler from '../src/handlers/craft.js';
import * as partyHandler from '../src/handlers/party.js';
import * as guildHandler from '../src/handlers/guild.js';
import * as equipmentHandler from '../src/handlers/equipment.js';
import * as registrationHandler from '../src/handlers/registration.js';
import * as diplomacyHandler from '../src/handlers/diplomacy.js';
import * as housingHandler from '../src/handlers/housing.js';
import * as flightHandler from '../src/handlers/flight.js';
import * as questsHandler from '../src/handlers/quests.js';
import * as itemsHandler from '../src/handlers/items.js';
import * as itemsEngine from '../src/engine/items.js';
import * as questsEngine from '../src/engine/quests.js';
import * as playerService from '../src/handlers/player.js';
import { loadGazetteer } from '../src/services/gazetteer.js';
import { applyStatusEffect, tickStatusEffects, getStatModifiers, formatActiveEffects } from '../src/engine/combat.js';

const TEST_PLAYER = '00000000-0000-0000-0000-000000000001';
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

async function run() {
  console.log('\n🔬 Tests d\'intégration — Système Cardinal\n');

  await test('Gazetteer chargé', async () => {
    await loadGazetteer(pool);
  });

  await test('Handler STATUS (player)', async () => {
    const result = await playerService.handleStatus(pool, TEST_PLAYER);
    const text = typeof result === 'string' ? result : result?.text;
    if (!text || text.includes('❌')) throw new Error('Réponse invalide: ' + text);
    if (typeof result === 'object' && result.card?.template !== 'personnage') {
      throw new Error('Carte personnage manquante ou mal typée: ' + JSON.stringify(result.card));
    }
  });

  await test('Handler INVENTORY (player)', async () => {
    const result = await playerService.handleInventory(pool, TEST_PLAYER);
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('Handler QUESTS (quests) — liste active', async () => {
    const result = await questsHandler.handleQuests(pool, TEST_PLAYER, 'quêtes');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('Handler QUEST_BOARD', async () => {
    const result = await questsHandler.handleQuestBoard(pool, TEST_PLAYER);
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('acceptQuest — plafond 10 quêtes actives (régression Q1)', async () => {
    await pool.query("DELETE FROM t_active_quests WHERE avatar_uuid = $1 AND quest_id LIKE 'TEST_CAP_%'", [TEST_PLAYER]);
    try {
      for (let i = 0; i < 10; i++) {
        await pool.query(
          `INSERT INTO t_active_quests (avatar_uuid, quest_id, current_step, progress_status)
           VALUES ($1, $2, 1, 'in_progress') ON CONFLICT (avatar_uuid, quest_id) DO NOTHING`,
          [TEST_PLAYER, `TEST_CAP_${i}`]
        );
      }
      const questRow = await pool.query('SELECT quest_id FROM t_quests_dict LIMIT 1');
      if (questRow.rows.length === 0) return; // pas de quête seedée, régression non vérifiable ici
      const result = await questsEngine.acceptQuest(pool, TEST_PLAYER, questRow.rows[0].quest_id);
      if (result.success || result.error !== 'QUEST_CAP_REACHED') {
        throw new Error('Plafond 10 quêtes actives non appliqué : ' + JSON.stringify(result));
      }
    } finally {
      await pool.query("DELETE FROM t_active_quests WHERE avatar_uuid = $1 AND quest_id LIKE 'TEST_CAP_%'", [TEST_PLAYER]);
    }
  });

  await test('turnInQuest — écriture T_QUEST_HISTORY (régression Q2/Q4)', async () => {
    const questRow = await pool.query('SELECT quest_id, total_steps FROM t_quests_dict LIMIT 1');
    if (questRow.rows.length === 0) return; // pas de quête seedée, régression non vérifiable ici
    const { quest_id, total_steps } = questRow.rows[0];
    await pool.query(
      `INSERT INTO t_active_quests (avatar_uuid, quest_id, current_step, progress_status)
       VALUES ($1, $2, $3, 'in_progress')
       ON CONFLICT (avatar_uuid, quest_id) DO UPDATE SET current_step = $3, progress_status = 'in_progress', completed_at = NULL`,
      [TEST_PLAYER, quest_id, total_steps]
    );
    try {
      const result = await questsEngine.turnInQuest(pool, TEST_PLAYER, quest_id);
      if (!result.success) throw new Error('Rendu de quête échoué : ' + JSON.stringify(result));
      const history = await pool.query(
        'SELECT 1 FROM t_quest_history WHERE avatar_uuid = $1 AND quest_id = $2 ORDER BY completed_at DESC LIMIT 1',
        [TEST_PLAYER, quest_id]
      );
      if (history.rows.length === 0) throw new Error('Aucune ligne T_QUEST_HISTORY après rendu');
    } finally {
      await pool.query('DELETE FROM t_active_quests WHERE avatar_uuid = $1 AND quest_id = $2', [TEST_PLAYER, quest_id]);
      await pool.query('DELETE FROM t_quest_history WHERE avatar_uuid = $1 AND quest_id = $2', [TEST_PLAYER, quest_id]);
    }
  });

  await test('Handler VAULT (bank) — consultation', async () => {
    const result = await bank.handleVault(pool, TEST_PLAYER, {}, 'banque');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
    if (typeof result === 'object' && result.card?.template !== 'banque') {
      throw new Error('Carte banque manquante ou mal typée: ' + JSON.stringify(result.card));
    }
  });

  await test('Handler ENCYCLOPEDIA — vide ou liste', async () => {
    const result = await encyclopedia.handleEncyclopedia(pool, TEST_PLAYER);
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('Handler WIKI — terme absent', async () => {
    const result = await encyclopedia.handleWiki(pool, TEST_PLAYER, 'wiki');
    if (typeof result !== 'string') throw new Error('Devrait redemander un terme');
  });

  await test('ProcessMessage — encyclopedie', async () => {
    const result = await processMessage(pool, 'encyclopedie', TEST_PLAYER);
    if (result.routing.intent !== 'ENCYCLOPEDIA') throw new Error('Pas ENCYCLOPEDIA: ' + result.routing.intent);
  });

  await test('ProcessMessage — wiki', async () => {
    const result = await processMessage(pool, 'wiki Loup Alpha', TEST_PLAYER);
    if (result.routing.intent !== 'WIKI') throw new Error('Pas WIKI: ' + result.routing.intent);
  });

  await test('ProcessMessage — lore', async () => {
    const result = await processMessage(pool, 'lore Jötunheimr', TEST_PLAYER);
    if (result.routing.intent !== 'LORE_DOC') throw new Error('Pas LORE_DOC: ' + result.routing.intent);
  });

  await test('Handler ACHIEVEMENTS — vide ou liste', async () => {
    const result = await achievements.handleAchievements(pool, TEST_PLAYER);
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('Handler RANKINGS — top 10 Yrds', async () => {
    const result = await achievements.handleRankings(pool, TEST_PLAYER, 'classement');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('ProcessMessage — achievements', async () => {
    const result = await processMessage(pool, 'succès', TEST_PLAYER);
    if (result.routing.intent !== 'ACHIEVEMENTS') throw new Error('Pas ACHIEVEMENTS: ' + result.routing.intent);
  });

  await test('ProcessMessage — rankings', async () => {
    const result = await processMessage(pool, 'classement niveau', TEST_PLAYER);
    if (result.routing.intent !== 'RANKINGS') throw new Error('Pas RANKINGS: ' + result.routing.intent);
  });

  await test('Handler SKILL_LIST — vide ou liste', async () => {
    const result = await skillsHandler.handleSkillList(pool, TEST_PLAYER);
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('ProcessMessage — skills (pas confondu avec USE_SKILL)', async () => {
    const result = await processMessage(pool, 'compétences', TEST_PLAYER);
    if (result.routing.intent !== 'SKILL_LIST') throw new Error('Pas SKILL_LIST: ' + result.routing.intent);
  });

  await test('Handler PET — aucun familier ou statut', async () => {
    const result = await petsHandler.handlePet(pool, TEST_PLAYER, 'familier');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('ProcessMessage — familier', async () => {
    const result = await processMessage(pool, 'familier', TEST_PLAYER);
    if (result.routing.intent !== 'PET') throw new Error('Pas PET: ' + result.routing.intent);
  });

  await test('Handler CRAFT — domaines (table vide ou non)', async () => {
    const result = await craftHandler.handleCraft(pool, TEST_PLAYER, 'craft');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('ProcessMessage — craft', async () => {
    const result = await processMessage(pool, 'artisanat', TEST_PLAYER);
    if (result.routing.intent !== 'CRAFT') throw new Error('Pas CRAFT: ' + result.routing.intent);
  });

  await test('Handler PARTY — aucun groupe ou statut', async () => {
    const result = await partyHandler.handlePartyCommand(pool, TEST_PLAYER, 'groupe');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('Handler GUILD — aucune guilde ou statut', async () => {
    const result = await guildHandler.handleGuildCommand(pool, TEST_PLAYER, 'guilde');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('ProcessMessage — groupe', async () => {
    const result = await processMessage(pool, 'groupe', TEST_PLAYER);
    if (result.routing.intent !== 'PARTY') throw new Error('Pas PARTY: ' + result.routing.intent);
  });

  await test('ProcessMessage — guilde', async () => {
    const result = await processMessage(pool, 'guilde', TEST_PLAYER);
    if (result.routing.intent !== 'GUILD') throw new Error('Pas GUILD: ' + result.routing.intent);
  });

  await test('Handler EQUIP — aucun équipement ou liste', async () => {
    const result = await equipmentHandler.handleEquip(pool, TEST_PLAYER, 'equipement');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('ProcessMessage — equip', async () => {
    const result = await processMessage(pool, 'equipement', TEST_PLAYER);
    if (result.routing.intent !== 'EQUIP') throw new Error('Pas EQUIP: ' + result.routing.intent);
  });

  await test('Handler LINK_START — déjà inscrit (TEST_PLAYER existe)', async () => {
    const result = await registrationHandler.handleLinkStart(pool, '00000000000', '!link_start Sylph Test');
    if (typeof result !== 'string') throw new Error('Devrait renvoyer une chaîne (usage ou déjà inscrit)');
  });

  await test('ProcessMessage — link_start', async () => {
    const result = await processMessage(pool, '!link_start', TEST_PLAYER);
    if (result.routing.intent !== 'LINK_START') throw new Error('Pas LINK_START: ' + result.routing.intent);
  });

  await test('Handler DIPLOMACY — relations ou aucune', async () => {
    const result = await diplomacyHandler.handleDiplomacy(pool, TEST_PLAYER);
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('ProcessMessage — diplomatie', async () => {
    const result = await processMessage(pool, 'diplomatie', TEST_PLAYER);
    if (result.routing.intent !== 'DIPLOMACY') throw new Error('Pas DIPLOMACY: ' + result.routing.intent);
  });

  await test('Handler HOUSING — liste offre', async () => {
    const result = await housingHandler.handleHousing(pool, TEST_PLAYER, 'housing_list');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('Handler HOUSING — statut ou aucun logement', async () => {
    const result = await housingHandler.handleHousing(pool, TEST_PLAYER, 'logement');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('ProcessMessage — housing', async () => {
    const result = await processMessage(pool, 'logement', TEST_PLAYER);
    if (result.routing.intent !== 'HOUSING') throw new Error('Pas HOUSING: ' + result.routing.intent);
  });

  await test('Handler HOUSING — alias verbe libre non routé vers achat/location (régression scope-creep)', async () => {
    const result = await housingHandler.handleHousing(pool, TEST_PLAYER, 'logement acheter petite maison');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
    if (/Précise un type|achetée|louée/i.test(text)) {
      throw new Error('"acheter" a été traité comme housing_buy (alias non spécifié) : ' + text);
    }
  });

  await test('Handler FLIGHT — bascule décollage/atterrissage', async () => {
    const result = await flightHandler.handleFlight(pool, TEST_PLAYER, 'vol');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('ProcessMessage — vol', async () => {
    const result = await processMessage(pool, 'vol', TEST_PLAYER);
    if (result.routing.intent !== 'FLIGHT') throw new Error('Pas FLIGHT: ' + result.routing.intent);
  });

  await test('Handler FLIGHT — flight_gauge ne bascule pas is_flying (régression)', async () => {
    const before = await pool.query('SELECT is_flying FROM t_avatars WHERE avatar_uuid = $1', [TEST_PLAYER]);
    const result = await flightHandler.handleFlight(pool, TEST_PLAYER, 'flight_gauge');
    const text = typeof result === 'string' ? result : result?.text;
    const after = await pool.query('SELECT is_flying FROM t_avatars WHERE avatar_uuid = $1', [TEST_PLAYER]);
    if (!text) throw new Error('Pas de réponse');
    if (before.rows[0].is_flying !== after.rows[0].is_flying) {
      throw new Error('flight_gauge a modifié is_flying — devrait être une commande de lecture seule');
    }
  });

  await test('Handler INSPECT — objet introuvable ou trouvé', async () => {
    const result = await itemsHandler.handleInspect(pool, TEST_PLAYER, 'inspect Potion de Soin');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('ProcessMessage — inspect', async () => {
    const result = await processMessage(pool, 'inspect Potion', TEST_PLAYER);
    if (result.routing.intent !== 'INSPECT') throw new Error('Pas INSPECT: ' + result.routing.intent);
  });

  await test('ProcessMessage — jeter', async () => {
    const result = await processMessage(pool, 'jeter Potion', TEST_PLAYER);
    if (result.routing.intent !== 'DROP_ITEM') throw new Error('Pas DROP_ITEM: ' + result.routing.intent);
  });

  await test('dropItem — objet lié à l\'âme refusé (régression I4)', async () => {
    await pool.query(
      `INSERT INTO t_inventory (instance_uuid, avatar_uuid, item_id, quantity, is_bound)
       VALUES (gen_random_uuid(), $1, 'ITEM_POT_001', 1, TRUE)`,
      [TEST_PLAYER]
    );
    try {
      const result = await itemsEngine.dropItem(pool, TEST_PLAYER, 'ITEM_POT_001', 1);
      if (result.success || result.error !== 'BOUND_ITEM') {
        throw new Error('Objet lié jeté sans rejet : ' + JSON.stringify(result));
      }
    } finally {
      await pool.query(
        `DELETE FROM t_inventory WHERE avatar_uuid = $1 AND item_id = 'ITEM_POT_001' AND is_bound = TRUE`,
        [TEST_PLAYER]
      );
    }
  });

  await test('Handler MAIL (mail) — boîte vide ou liste', async () => {
    const result = await mailHandler.handleMail(pool, TEST_PLAYER, 'mail');
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('ProcessMessage — mail', async () => {
    const result = await processMessage(pool, 'courrier', TEST_PLAYER);
    if (result.routing.intent !== 'MAIL') throw new Error('Pas MAIL: ' + result.routing.intent);
  });

  await test('Handler SHOP_LIST (economy)', async () => {
    const result = await economy.handleShopList(pool, TEST_PLAYER);
    const text = typeof result === 'string' ? result : result?.text;
    if (!text) throw new Error('Pas de réponse');
  });

  await test('Handler BUY (economy)', async () => {
    const result = await economy.handleBuy(pool, TEST_PLAYER, { itemId: 'ITEM_POT_001', quantity: '1' });
    if (!result) throw new Error('Pas de réponse');
  });

  await test('Handler SELL (economy)', async () => {
    const result = await economy.handleSell(pool, TEST_PLAYER, { itemId: 'ITEM_POT_001', quantity: '1' });
    if (!result) throw new Error('Pas de réponse');
  });

  await test('Handler TALK (dialogue) — sans PNJ', async () => {
    const result = await dialogue.handleTalk(pool, TEST_PLAYER, {});
    if (!result || !result.includes('qui')) throw new Error('Devrait demander un nom: ' + result);
  });

  await test('Pipeline SYS — parseCommands', () => {
    const cmds = parseCommands('Bonjour SYS_GRANT_ITEM(player_id=abc, item_id=def, quantity=1)');
    if (cmds.length !== 1) throw new Error('Parse échoué: ' + JSON.stringify(cmds));
    if (cmds[0].command !== 'SYS_GRANT_ITEM') throw new Error('Mauvaise commande');
  });

  await test('Pipeline SYS — parseCommandes multiples', () => {
    const cmds = parseCommands('SYS_SET_ENV_HAZARD(zone_id=ZONE_A, weather=rain) et SYS_SHOP_RESTOCK(shop_id=SHOP_001)');
    if (cmds.length !== 2) throw new Error(`Attendu 2, trouvé ${cmds.length}`);
  });

  await test('Pipeline SYS — commande inconnue', async () => {
    const result = await executeCommand(pool, { command: 'SYS_FAKE', params: {} }, 'system');
    if (result.ok !== false) throw new Error('Devrait échouer');
  });

  await test('Pipeline SYS — paramètre manquant', async () => {
    const result = await executeCommand(pool, { command: 'SYS_GRANT_ITEM', params: {} }, 'system');
    if (result.ok !== false) throw new Error('Devrait échouer: ' + JSON.stringify(result));
  });

  await test('ProcessMessage — texte vide', async () => {
    const result = await processMessage(pool, '');
    if (result.routing.intent !== 'ERROR') throw new Error('Devrait être ERROR');
  });

  await test('ProcessMessage — aide', async () => {
    const result = await processMessage(pool, '!aide', TEST_PLAYER);
    if (result.routing.intent !== 'HELP') throw new Error('Pas HELP: ' + result.routing.intent);
  });

  await test('Router — entities résolues (régression : extractEntities non attendu)', async () => {
    const result = await processMessage(pool, 'banque déposer 50', TEST_PLAYER);
    if (result.routing.entities?.quantity !== 50) {
      throw new Error('quantity non résolue — routing.entities: ' + JSON.stringify(result.routing.entities));
    }
  });

  await test('ProcessMessage — boutique', async () => {
    const result = await processMessage(pool, 'boutique', TEST_PLAYER);
    if (result.routing.intent !== 'SHOP_LIST') throw new Error('Pas SHOP_LIST: ' + result.routing.intent);
  });

  await test('ProcessMessage — inventaire', async () => {
    const result = await processMessage(pool, 'inventaire', TEST_PLAYER);
    if (result.routing.intent !== 'INVENTORY') throw new Error('Pas INVENTORY: ' + result.routing.intent);
  });

  await test('ProcessMessage — statut', async () => {
    const result = await processMessage(pool, 'statut', TEST_PLAYER);
    if (result.routing.intent !== 'STATUS') throw new Error('Pas STATUS: ' + result.routing.intent);
  });

  await test('ProcessMessage — mouvement sans zone', async () => {
    const result = await processMessage(pool, 'je vais', TEST_PLAYER);
    if (!result.response || result.response.includes('❌')) throw new Error('Réponse erreur: ' + result.response);
  });

  await test('ProcessMessage — attaque sans cible', async () => {
    const result = await processMessage(pool, 'attaque', TEST_PLAYER);
    if (!result.response || result.response.includes('❌')) throw new Error('Réponse erreur: ' + result.response);
  });

  await test('ProcessMessage — quêtes', async () => {
    const result = await processMessage(pool, 'quêtes', TEST_PLAYER);
    if (result.routing.intent !== 'QUEST') throw new Error('Pas QUEST: ' + result.routing.intent);
  });

  await test('ProcessMessage — confidence basse', async () => {
    const result = await processMessage(pool, 'xyzzy flurp garble', TEST_PLAYER);
    if (result.routing.confidence >= 0.7) throw new Error('Confiance trop haute pour du charabia: ' + result.routing.confidence);
  });

  await test('Registre SYS — liste commandes', () => {
    const cmds = getCommand('SYS_GRANT_ITEM');
    if (!cmds) throw new Error('SYS_GRANT_ITEM manquante');
    if (typeof cmds.execute !== 'function') throw new Error('execute pas une fonction');
    if (typeof cmds.d71 !== 'function') throw new Error('d71 pas une fonction');
    if (typeof cmds.authorize !== 'function') throw new Error('authorize pas une fonction');
  });

  await test('Registre SYS — toutes les commandes', () => {
    for (const name of ['SYS_GRANT_ITEM', 'SYS_ADVANCE_QUEST', 'SYS_NPC_KNOWLEDGE_UNLOCK', 'SYS_SET_ENV_HAZARD', 'SYS_SHOP_RESTOCK']) {
      const cmd = getCommand(name);
      if (!cmd) throw new Error(`${name} manquante`);
      if (!cmd.schema) throw new Error(`${name} sans schema`);
    }
  });

  await test('SYS_GRANT_ITEM — D71 joueur inexistant', async () => {
    const result = await executeCommand(pool, {
      command: 'SYS_GRANT_ITEM',
      params: { player_id: '00000000-0000-0000-0000-000000000000', item_id: 'ITEM_POT_001', quantity: '1' }
    }, 'system');
    if (result.ok !== false) throw new Error('Devrait échouer D71');
  });

  await test('SYS_GRANT_ITEM — D71 item inexistant', async () => {
    const result = await executeCommand(pool, {
      command: 'SYS_GRANT_ITEM',
      params: { player_id: TEST_PLAYER, item_id: 'ITEM_FAKE_999', quantity: '1' }
    }, 'system');
    if (result.ok !== false) throw new Error('Devrait échouer D71');
  });

  await test('SYS_NPC_KNOWLEDGE_UNLOCK — D71 qi_id inexistant', async () => {
    const result = await executeCommand(pool, {
      command: 'SYS_NPC_KNOWLEDGE_UNLOCK',
      params: { player_id: TEST_PLAYER, qi_id: 'QI_FAKE_999' }
    }, 'system');
    if (result.ok !== false) throw new Error('Devrait échouer D71');
  });

  await test('SYS_SET_ENV_HAZARD — D71 zone inexistante', async () => {
    const result = await executeCommand(pool, {
      command: 'SYS_SET_ENV_HAZARD',
      params: { zone_id: 'ZONE_FAKE_999', weather: 'rain', temperature: '20' }
    }, 'system');
    if (result.ok !== false) throw new Error('Devrait échouer D71');
  });

  await test('SYS_SET_ENV_HAZARD — weather invalide', async () => {
    const result = await executeCommand(pool, {
      command: 'SYS_SET_ENV_HAZARD',
      params: { zone_id: 'ZONE_NEU_CAP_001', weather: 'invalid', temperature: '20' }
    }, 'system');
    if (result.ok !== false) throw new Error('Devrait échouer weather invalide');
  });

  await test('SYS_SHOP_RESTOCK — D71 boutique inexistante', async () => {
    const result = await executeCommand(pool, {
      command: 'SYS_SHOP_RESTOCK',
      params: { shop_id: 'SHOP_FAKE_999' }
    }, 'system');
    if (result.ok !== false) throw new Error('Devrait échouer D71');
  });

  await test('Spawn — t_spawn_tables a des lignes', async () => {
    const result = await pool.query('SELECT count(*)::int AS cnt FROM t_spawn_tables');
    if (result.rows[0].cnt === 0) throw new Error('t_spawn_tables est vide — relancer seed-generator');
    console.log(`      ${result.rows[0].cnt} entrées spawn`);
  });

  await test('Combat — monstre trouvable dans le spawn', async () => {
    const result = await pool.query(
      `SELECT m.monster_id, m.name FROM t_monsters_dict m
       JOIN t_spawn_tables s ON s.monster_id = m.monster_id
       WHERE s.zone_id = 'ZONE_SYL_HUNT_001' LIMIT 1`
    );
    if (!result.rows.length) throw new Error('Aucun monstre dans ZONE_SYL_HUNT_001');
    console.log(`      Ex: ${result.rows[0].name} (${result.rows[0].monster_id})`);
  });

  await test('GM — !sys_grant_item rejeté sans phone GM', async () => {
    const result = await processMessage(pool, '!sys_grant_item player_id=00000000-0000-0000-0000-000000000001 item_id=ITEM_POT_001 quantity=1',
      '00000000-0000-0000-0000-000000000001', null, '33600000000');
    if (!result.response || (!result.response.includes('refusé') && !result.response.includes('❌'))) {
      throw new Error('Devrait refuser: ' + (result.response || 'pas de réponse'));
    }
  });

  await test('Status — applyStatusEffect crée une instance', async () => {
    const target = { hp_current: 100, activeEffects: [] };
    const effect = {
      effect_id: 'EFF_BURN',
      name: 'Brûlure',
      type: 'debuff',
      stat_modified: null,
      modifier_value: 0,
      modifier_type: 'flat',
      tick_damage: 5,
      tick_interval: 3,
      duration_sec: 15,
      max_stacks: 3,
      is_dispellable: true,
      icon_emoji: '🔥',
    };
    const inst = applyStatusEffect(target, effect);
    if (!inst || inst.effectId !== 'EFF_BURN') throw new Error('Instance invalide');
    if (target.activeEffects.length !== 1) throw new Error('Devrait avoir 1 effet');
    if (inst.tickDamage !== 5) throw new Error('tickDamage non propagé');
  });

  await test('Status — applyStatusEffect stack et refresh', async () => {
    const target = { hp_current: 100, activeEffects: [] };
    const effect = {
      effect_id: 'EFF_BURN', name: 'Brûlure', type: 'debuff',
      stat_modified: null, modifier_value: 0, modifier_type: 'flat',
      tick_damage: 5, tick_interval: 3, duration_sec: 15,
      max_stacks: 3, is_dispellable: true, icon_emoji: '🔥',
    };
    applyStatusEffect(target, effect);
    const inst2 = applyStatusEffect(target, effect);
    if (inst2.currentStacks !== 2) throw new Error(`Stacks devrait être 2, trouvé ${inst2.currentStacks}`);
    if (target.activeEffects.length !== 1) throw new Error('Toujours 1 effet');
  });

  await test('Status — tickStatusEffects tick damage', async () => {
    const target = { hp_current: 100, hp_max: 100, activeEffects: [] };
    const effect = {
      effect_id: 'EFF_POISON', name: 'Poison', type: 'debuff',
      stat_modified: null, modifier_value: 0, modifier_type: 'flat',
      tick_damage: 8, tick_interval: 0.001, duration_sec: 30,
      max_stacks: 5, is_dispellable: true,
    };
    const inst = applyStatusEffect(target, effect);
    inst.lastTick = Date.now() - 100;
    const result = tickStatusEffects(target);
    if (result.tickEvents.length === 0) throw new Error('Devrait produire un tick event');
    if (target.hp_current >= 100) throw new Error('HP devrait avoir baissé');
  });

  await test('Status — tickStatusEffects expiration', async () => {
    const target = { hp_current: 100, activeEffects: [] };
    const effect = {
      effect_id: 'EFF_STUN', name: 'Stun', type: 'debuff',
      stat_modified: 'stat_agi', modifier_value: 100, modifier_type: 'percent',
      tick_damage: 0, tick_interval: 0, duration_sec: -1,
      max_stacks: 1, is_dispellable: true,
    };
    applyStatusEffect(target, effect);
    const result = tickStatusEffects(target);
    if (result.expired.length !== 1) throw new Error('Effet devrait être expiré');
    if (target.activeEffects.length !== 0) throw new Error('Aucun effet actif');
  });

  await test('Status — getStatModifiers avec buff', async () => {
    const base = { base_atk: 100, base_def: 50, base_agi: 30 };
    const activeEffects = [
      { statModified: 'stat_str', modifierValue: 20, modifierType: 'percent', currentStacks: 1 },
      { statModified: 'stat_vit', modifierValue: 10, modifierType: 'percent', currentStacks: 2 },
    ];
    const mods = getStatModifiers(activeEffects, base);
    if (mods.base_atk !== 120) throw new Error(`ATK devrait être 120, trouvé ${mods.base_atk}`);
    if (mods.base_def !== 60) throw new Error(`DEF devrait être 60, trouvé ${mods.base_def}`);
  });

  await test('Status — formatActiveEffects retourne chaîne', async () => {
    const activeEffects = [
      { effectId: 'EFF_BURN', name: 'Brûlure', type: 'debuff', icon: '🔥',
        endTime: Date.now() + 10000, maxStacks: 3, currentStacks: 2 },
    ];
    const str = formatActiveEffects(activeEffects);
    if (!str.includes('Brûlure')) throw new Error('Nom manquant');
    if (!str.includes('x2')) throw new Error('Stacks manquants');
    if (!str.includes('10s')) throw new Error('Durée manquante');
  });

  await test('GM — !sys_help accessible sans GM', async () => {
    const result = await processMessage(pool, '!sys_help',
      '00000000-0000-0000-0000-000000000001', null, '33600000000');
    if (!result.response || !result.response.toLowerCase().includes('commande')) {
      throw new Error('Devrait répondre: ' + (result.response || 'pas de réponse'));
    }
  });

  console.log(`\n📊 Résultat : ${passed} passé(s), ${failed} échec(s)\n`);
  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Erreur fatale:', err.message);
  process.exit(1);
});
