# Interface Système : Registre Global des Commandes (Index Cardinal SAO/ALO)

*Version 2.0 - Intégration de la gestion de Communauté WhatsApp, de l'Encyclopédie et des privilèges Game Master.*

## 1. 👑 Commandes Game Master & Système Cardinal (Admin Only)
*Le bot agit avec des droits de Super-Admin WhatsApp pour réguler les 200 joueurs.*
- `!sys_group_create [Nom_Lieu] [Type: Public/Secret]` : Le bot génère un nouveau groupe WhatsApp (ex: *Palier 27 - Salle du Boss*).
- `!sys_group_add [Num_WhatsApp] [Group_ID]` : Ajoute silencieusement un joueur à un groupe secret s'il en a les droits.
- `!sys_group_kick [Num_WhatsApp] [Group_ID]` : Expulse un joueur du groupe (ex: mort dans le donjon ou retour en ville).
- `!sys_announce [Texte]` : Ping global du bot (Message épinglé) dans tous les groupes de la communauté (ex: *L'Event de la Purge commence*).
- `!sys_ban [Num_WhatsApp]` : Blacklist un numéro.
- `!sys_give [Objet/Yrd] [Num_WhatsApp]` : Commande GM pour le support.
- `!sys_spawn_boss [Group_ID] [Boss_ID]` : Force l'apparition d'un Raid Boss dans un groupe WhatsApp spécifique.
- `!sys_sync [Num_WhatsApp]` : Resynchronise la présence d'un joueur (vérité = `T_AVATARS.current_zone`, cf. `zone_movement_protocol.md` R0).
- `!sys_zone_link [Zone_A] [Zone_B]` / `!sys_zone_unlink [Zone_A] [Zone_B]` : Ajoute/retire une liaison dans le graphe de voisinage (atlas).
- `!sys_zone_lock [Zone_ID]` : Verrouille les entrées/sorties d'une zone (équivalent GM de `SYS_LOCK_ZONE`).
- `!sys_spawn_set [Zone_ID] [Mob_ID] [Taux%]` : Ajuste le taux d'apparition d'un mob dans une zone (écrit dans `T_SPAWN_TABLES`, budget de zone ≤ 100%).
- `!sys_npc_move [NPC_ID] [Zone_ID]` : Déplace un PNJ vers une autre zone (met à jour `T_NPC.zone_id` — le bot annonce le départ/l'arrivée dans les groupes concernés).
- `!sys_env_set [Zone_ID] [Param] [Valeur]` : Règle un paramètre environnemental de zone/instance (`OXYGEN` — jauge d'Apnée du Gouffre de Léviathan, `HEAT` — jauge de Surchauffe de la Caldeira d'Obsidienne, `DOT`…). Équivalent GM de `SYS_SET_ENV_HAZARD`.
- `!sys_carve_set [Mob_ID] [Partie] [Seuil_%HP] [Item_ID] [Taux%]` : Déclare/modifie une ligne de dépeçage par partie (D78) — franchissement du seuil pendant le combat = roll garanti sur cette ligne, indépendant de la table de drop de fin de combat. Équivalent GM de `SYS_SET_CARVE_TABLE`.
- `!sys_variant_rate [Zone_ID|global] [Taux%]` : Règle la probabilité qu'un mob commun s'instancie en Variant (D79 — stats de sa fiche ×2,5 PV/×1,4 ATQ-DEF, loot existant garanti, +Yrds ×3 ; 5% par défaut). Équivalent GM de `SYS_SET_VARIANT_RATE`.
- `!sys_npc_info [NPC_ID]` : Audit de l'enveloppe informationnelle d'un PNJ (slots K0-KX, conditions, déblocages — cf. `npc_knowledge_protocol.md`). Équivalent IA : `SYS_NPC_KNOWLEDGE_CHECK`.
- `!sys_npc_unlock [NPC_ID] [QI_ID] [Num_WhatsApp]` : Débloque manuellement un slot K2/K3 pour un joueur (écrit dans `T_NPC_KNOWLEDGE_UNLOCKS`). Équivalent IA : `SYS_NPC_KNOWLEDGE_UNLOCK`.
- `!sys_canon_spawn [NPC_ID] [Zone_ID] [Durée_min]` : Matérialise un personnage canonique dans une zone pour une fenêtre limitée (D19 — seul moyen de rencontrer la trame principale). Équivalent IA : `SYS_SPAWN_CANON`.
- `!sys_grant_skill [Skill_ID] [Num_WhatsApp]` : Octroie une compétence (`MAG_*`/`OSS_*`/`PAS_*`) à un joueur, sans passer par un formateur ni les prérequis. Équivalent GM de `!learn_skill`. Équivalents IA selon la famille : `SYS_GRANT_SPELL`, `SYS_GRANT_OSS`, `SYS_GRANT_PASSIVE`.
- `!sys_shop_restock [SHOP_ID]` : Force le réassort d'une boutique (réécrit `T_SHOP_ITEMS.stock` selon `T_SHOPS.restock_days`). Employé par les fiches boutiques C-1+. Équivalent IA : `SYS_SHOP_RESTOCK`.
- `!sys_open_corridor [Zone_A] [Zone_B]` : Ouvre manuellement un portail bidirectionnel entre deux zones (équivalent GM du Cristal de Corridor `CSM_CRI_006`). Équivalent IA : `SYS_OPEN_CORRIDOR`. Les joueurs le franchissent par `!enter_portal`.
- `!sys_recall_party [Party_ID] [Ancre_Avatar_ID]` : Rappelle les membres consentants d'un groupe vers une ancre (équivalent GM du Cristal de Ralliement `CSM_CRI_010`). Équivalent IA : `SYS_GROUP_RECALL`. Chaque membre confirme par `!accept_rally`.
- `!sys_rag_reindex [scope]` : Force la ré-indexation incrémentale par hash de l'index vectoriel RAG (`scope` = `fiche`/`dossier`/`global` ; D-RAG-9, `15_cdc_rag.md`) — une fiche modifiée doit remonter à jour dans la constellation sans réentraînement. Respecte le verrou d'ingestion K3/méta/secret (D-RAG-2/D22). Équivalent IA : `SYS_RAG_REINDEX`.

## 2. 📚 Encyclopédie & Index Système (Guide d'Argo)
*Le savoir est verrouillé. Les joueurs débloquent la documentation en explorant.*
- `!help` : Index général des commandes.
- `!help [Catégorie]` : Manuel détaillé (ex: `!help craft`).
- `!encyclopedia` : Liste les pages de Lore débloquées par l'exploration du joueur.
- `!wiki [Nom_Monstre_ou_Lieu]` : Affiche la fiche Fandom détaillée (Stats, Faiblesses). *Requiert que le joueur ait vaincu le monstre au moins une fois ou exploré la zone (Discovery Level).*
- `!lore [Titre]` : Affiche un document d'histoire ancienne (ex: *La Chute de Jötunheimr*) trouvé en loot.

## 3. 🚪 Mouvement Dynamique & Architecture des Groupes WhatsApp
*Se déplacer dans ALO met à jour la zone du joueur (état L1 `current_zone_id`) ; le changement de groupe WhatsApp n'a lieu qu'au franchissement d'une frontière de **territoire** (13 territoires — atlas §2-bis, D76).*
*Règle d'exclusivité (cf. `system_mechanics/zone_movement_protocol.md` v2.0) : un joueur n'appartient qu'à UN groupe territoire/instance à la fois — la synchronisation se fait par retrait des groupes non autorisés. Les groupes permanents (4 communauté + 9 raciaux) ne sont jamais quittés.*
- `!enter_zone [Nom_Zone]` : Si la zone est adjacente (atlas `cartographie/atlas_monde_liaisons.md`) et les conditions remplies, le bot met à jour la position du joueur ; si la zone cible est dans un autre territoire, il l'ajoute au groupe du territoire cible et le retire de l'ancien. Alias : `!marcher [direction]`, `!voler [destination]`.
- `!leave_zone` : Le joueur quitte la zone (retour vers la zone parente — capitale ou zone précédente).
- `!where` : Affiche la zone actuelle du joueur, son type et ses zones adjacentes accessibles.
- `!dungeon_queue [Donjon_ID]` : Place le joueur en file d'attente. Quand 7 joueurs sont prêts, le bot crée un groupe WhatsApp éphémère (Raid Instance) et les ajoute dedans.
- `!portal [Ville]` : Utilise un cristal de téléportation pour changer de groupe WhatsApp instantanément (capitale).

## 4. ⚙️ Gestion de Compte & AmuSphere
- `!link_start [Race]` : Inscription, liaison du MSISDN.
- `!profil` / `!stats_view` / `!stats_add [Attribut] [Points]` / `!titre_set [ID]`.
- `!logout` : Déconnexion. Le bot retire temporairement le joueur des groupes de combat pour éviter le spam.
- `!ping` : Affiche la latence de réponse du bot (Simule le *Connection Status* de l'AmuSphere).

## 5. ⚔️ Moteur de Combat & Instances (PvE/PvP)
- `!attaque` / `!cast [Sort]` / `!oss [Skill]` / `!parry` / `!switch [Allié]` / `!analyze` / `!fuite`.
- `!target [ID_Ennemi]` : Verrouille une cible si la zone contient plusieurs monstres (le bot affiche les ID dans le groupe).
- `!use [Item_ID]` : Consomme/active un objet consommable (`CSM_*` : cristaux, potions, parchemins, nourriture, encens…). `!use_potion` et `!use_crystal [type]` sont des alias spécialisés historiques. GM : `!sys_give` (octroi) ; IA : `SYS_GRANT_ITEM` (octroi) + primitive de résolution d'effet propre à l'item (ex. `SYS_OPEN_CORRIDOR`, `SYS_GROUP_RECALL`).
- `!use_potion [Nom_Potion]` / `!revive_light [Cible]`.
- `!respirer` : Reprend son souffle dans une poche d'air (+50 à la jauge d'Apnée, canalisation 10 s — donjons sous-marins, cf. `ZONE_UND_DUN_001` Gouffre de Léviathan).
- `!duel_challenge [Num_WhatsApp]` : Lance une invitation au duel formel (Anti-PK). Si accepté, le bot arbitre les dégâts sans pénalité de mort.

## 6. 🎒 Inventaire, Équipement & Paramètres d'Avatar
- `!inventaire` / `!equiper [Item_ID] [Slot]` / `!unequip [Slot]` / `!jeter [Item_ID]`.
- `!inspect [Item_ID]` : Lit la description d'un objet.
- `!outfit [Cosmétique]` : Change la description visuelle publique de l'avatar.
- `!bank_depot` / `!bank_retrait` / `!mail_send [Destinataire] [Colis]`.

## 7. 🔨 Artisanat, Forgeron & Alchimie
- `!craft_list` / `!forge [Recette]` / `!repair [Objet]` / `!enchant [Objet]` / `!alchimie [Herbe]` / `!cook` / `!mine`.
- `!appraise [Objet_Non_Identifié]` : Identifie un loot mystère moyennant des Yrds (Marchand).

## 8. 🐾 Domptage & Familiers (Beast Taming)
- `!tame [Cible]` / `!pet_summon` / `!pet_attack` / `!pet_feed` / `!pet_resurrect`.

## 9. ⚖️ Économie, Hôtel des Ventes & Échanges
- `!shop_list` / `!buy` / `!sell`.
- `!market_view` / `!market_list` / `!market_buy` : Interaction avec l'Auction House.
- `!trade_request` / `!trade_add` / `!trade_confirm` : Échange P2P.
- `!bounty_board` / `!bounty_claim` : Registre des assassins.

## 10. 🛡️ Guildes, Groupes & Politique
- `!guild_create [Nom]` / `!guild_disband` / `!guild_leave` / `!guild_bank`.
- **Rejoindre** : `!guild_invite [Num]` → `!guild_accept` (invitation) · `!guild_apply [Nom]` → `!guild_approve [Num]` (candidature) · `!guild_kick [Num]`. Un joueur = **une** guilde à la fois (`T_GUILDS` G5). Équivalents IA : `SYS_GUILD_INVITE`, `SYS_GUILD_JOIN`.
- `!guild_war [Nom_Guilde]` : Déclare une guerre de faction. Autorise le PK sans pénalité de Karma entre les deux guildes.
- `!party_create` / `!party_invite` / `!party_leave` / `!party_leader [Allié]`.
- `!lord_vote` : Vote politique de la race.

## 11. 🏆 Quêtes, Succès & Tracking
- `!quest_board` / `!quest_accept` / `!quest_turnin`.
- `!achievements` : Liste les hauts-faits débloqués par le joueur (ex: "Survivant d'Aincrad").
- `!rankings` : Affiche le Top 10 des joueurs par Yrds, par Niveau ou par Boss tués.
- `!monument_view` : Affiche le Monument des Épéistes (noms gravés des joueurs ayant accompli des exploits).
- `!spectate [Combat_ID]` : Mode spectateur pour observer un combat en cours sans y participer.
- `!last_attack` : Affiche le joueur ayant porté le coup final lors du dernier Boss vaincu et sa récompense bonus.

## 12. 🕊️ Vol & Manœuvres Aériennes
*Commandes liées au système de vol d'ALfheim (cf. `voluntary_flight_system.md`).*
- `!fly_mode [assisté|libre]` : Bascule entre Vol Assisté (bridé, sûr) et Vol Libre (rapide, risqué). Vol Libre nécessite Niveau 20 + quête de déblocage.
- `!vol_libre [Direction]` : Déplacement en Vol Libre avec contrôle directionnel fin.
- `!barrel_roll` : Esquive rotative en vol (90% évasion vs projectiles, coût 30 MP).
- `!dive_bomb` : Piqué offensif (+50% dégâts prochaine attaque, risque de crash).
- `!hover` : Vol stationnaire pour caster en altitude.
- `!flight_gauge` : Affiche la barre de vol restante (10 min max, recharge au sol).

## 13. 🎭 Magie Illusoire (Spriggan)
*Commandes liées au système d'illusion (cf. `illusion_magic_system.md`).*
- `!illusion [Type]` : Lance une illusion (Leurre, Mirage, Nuit Artificielle, Transmutation, etc.).
- `!treasure_sense` : (Passif Spriggan) Détecte les coffres et objets cachés dans un rayon de 50m.

## 14. 🎵 Magie Musicale (Puca)
*Commandes liées au système de mélodies (cf. `music_magic_system.md`).*
- `!music [Nom_Mélodie]` : Joue une mélodie conférant un buff de zone au groupe (Hymne du Vent, Requiem de Guerre, Symphonie de Guérison, etc.).
- `!music_stop` : Arrête la mélodie en cours.
- `!melodies` : Liste les mélodies débloquées par le joueur.

## 15. 💍 Mariage & Housing
*Commandes liées au système social avancé (cf. `marriage_housing_system.md`).*
- `!propose [Num_WhatsApp]` : Envoie une demande de mariage (nécessite Ring of Betrothal).
- `!accept_proposal` : Accepte la demande. **Prérequis (D-SOC, `T_MARRIAGES` M3)** : les deux Niv ≥ 15, **homme + femme uniquement**, un Anneau d'Engagement chacun, et **au moins un foyer** (housing actif) entre les deux ; un seul mariage actif par personne.
- `!divorce` : Sépare le couple. **Chacun repart avec ce qu'il a apporté** (restitution par provenance via `T_MARRIAGE_ASSETS`) + partage 50/50 des biens communs ; cooldown 30 j.
- `!partner_status` : Statut du conjoint **en temps réel** (PV/PM/stamina/niveau/zone), sans coût, quelle que soit la zone.
- `!whisper_partner [Message]` : Message privé au conjoint, peu importe la zone.
- `!partner_locate` : Affiche la zone du conjoint.
- `!joint_bank` : Coffre conjugal commun (capacité **doublée**). *(ex-`!partner_bank`, alias conservé.)*
- `!joint_pay [Montant]` : Dépense depuis le **solde commun** conjugal.
- `!housing_list` : Affiche l'offre de logements de la ville (louer / acheter).
- `!housing_rent [Type]` : **Loue** un logement (`inn_room`) — loyer récurrent, `!housing_pay [Cycles]` pour avancer le loyer.
- `!housing_buy [Type]` : **Achète** un logement (`small_house`, `manor`, `estate`) — permanent, revente `!housing_sell` (50 %).
- `!home_return` : Rappel vers son logement (checkpoint sûr, **hors combat**) ; `!rest` chez soi : regen 5 %/min + logout sans *Remain Light*.
- `!home_storage` : Stockage domestique **massif** (armes admises, contrairement au sac).
- `!home_invite [Num_WhatsApp]` / `!home_kick [Num_WhatsApp]` : Gère les invités du logement.
- `!decorate [Item]` : Place un objet décoratif dans la maison (confère des buffs passifs).
- `!housing_leave` : Résilie une location.

> Équivalents GM/IA : `!sys_marry`/`!sys_divorce`/`!sys_grant_property`/`!sys_evict` · `SYS_GENERATE_CEREMONY`, `SYS_GENERATE_WEDDING_GIFT`, `SYS_DIVORCE_SETTLE`, `SYS_CREATE_HOME_GROUP`, `SYS_GRANT_PROPERTY`, `SYS_EVICT_TENANT`, `SYS_DESTROY_HOME` (cf. §10 orchestrateur). Détail : `system_mechanics/marriage_housing_system.md` (v2.0), tables `table_t_marriages.md` / `table_t_properties.md`.

## 16. 🎣 Pêche, Cuisine & Récolte Avancée
*Commandes liées aux métiers secondaires (cf. `gathering_cooking_system.md`).*
- `!fish` : Lance une session de pêche (nécessite canne + zone avec eau).
- `!reel` : Remonte la ligne au bon moment (mini-jeu textuel basé sur la DEX).
- `!cook [Recette]` : Prépare un repas avec des ingrédients (buffs temporaires).
- `!sew [Matériau]` : Couture d'armure textile ou de sacs d'inventaire.
- `!gather` : Récolte des herbes et plantes dans la zone.
- `!recolter <FLO_ID>` : Récolte un node de flore identifié (`FLO_*`) — déclenche le mini-jeu de récolte et crédite le matériau dans l'inventaire. L'ID du node est visible via `!inspect` ou les panneaux de zone.
- `!inspect <FLO_ID>` : Affiche les informations (nom, rareté, état de croissance, temps avant repousse) d'un node de flore `FLO_*` présent dans la zone.
- `!mine` : Extraction de minerais (nécessite pioche + zone minière).

## 17. 🧭 Navigation & Cristaux
*Commandes liées à la cartographie et aux cristaux (cf. `navigation_system.md`, `crystals_system.md`).*
- `!map` : Affiche la zone actuelle et les zones connectées (détail selon niveau de Navigation).
- `!compass [Destination]` : Indique la direction d'une zone.
- `!mark [Nom]` : Place un marqueur personnel sur la zone actuelle.
- `!fast_travel [Zone_ID]` : Téléportation instantanée (Navigation Lv.6 + Teleport Crystal requis).
- `!use_crystal teleport [Ville]` : Brise un Teleport Crystal pour se téléporter.
- `!use_crystal corridor [Zone]` : Ouvre un portail bidirectionnel pour le groupe (30s).
- `!use_crystal mirage` : Affiche les infos détaillées des zones adjacentes.
- `!use_crystal record` : Sauvegarde les 5 derniers logs de combat.
- `!enter_portal` : Traverse un portail ouvert par un Corridor Crystal allié (`CSM_CRI_006`). Équivalent IA de l'ouverture : `SYS_OPEN_CORRIDOR` ; GM : `!sys_open_corridor`.
- `!accept_rally` : Accepte un rappel de groupe émis par un Cristal de Ralliement allié (`CSM_CRI_010`) — téléporte le membre **consentant** du groupe (PARTY) vers le porteur. Consentement obligatoire (anti-kidnapping). Équivalent IA : `SYS_GROUP_RECALL` ; GM : `!sys_recall_party`.
- `!yui_analyze [Cible]` : (Nécessite Yui's Heart) Analyse complète d'un monstre ou joueur.

## 18. ⚔️ Compétences Avancées & OSS
*Commandes liées aux compétences passives et au système d'OSS (cf. `competences_magie/`).*
- `!skill_list` : Liste toutes les compétences actives et passives du joueur avec leur rang de maîtrise.
- `!learn_skill [Skill_ID]` : Apprend une compétence auprès d'un Maître de compétence (`role_type = SKILL_MASTER`) présent dans la zone : sort élémentaire `MAG_*`, Original Sword Skill `OSS_*`, ou compétence passive `PAS_*`. Prérequis (niveau, maîtrise d'arme, quête de maîtrise, Yrds) selon la fiche `competences_magie/`. Un rang passif ne peut dépasser III (+8 % plafond) et le joueur ne peut équiper que 2 passives du même domaine. Équivalent GM : `!sys_grant_skill` ; équivalents IA selon la famille : `SYS_GRANT_SPELL` (`MAG_*`), `SYS_GRANT_OSS` (`OSS_*`), `SYS_GRANT_PASSIVE` (`PAS_*`).
- `!skill_connect [OSS_1] [OSS_2]` : Tente un enchaînement Skill Connect (fenêtre de timing de 0.3s).
- `!oss_create [Nom]` : Commence le processus de création d'un OSS personnel (nécessite Maîtrise d'arme Avancée).
- `!oss_transfer [Parchemin] [Num_WhatsApp]` : Transfère un OSS à un autre joueur via un Parchemin d'OSS.
- `!meditate` : Active la méditation (régénération HP/MP x3 hors combat).
- `!track [Joueur/Monstre]` : Active le pistage d'une cible.
- `!search` : Recherche les pièges, coffres cachés et passages secrets dans la zone.
- `!hide` : Active la furtivité (invisible sur la map des autres joueurs).
- `!throw [Item]` : Lance une arme de jet (dague, pick, chakram).

## 19. 🏰 Alliances, Diplomatie & Événements Mondiaux
*Commandes liées aux Grand Quests et à la politique inter-raciale.*
- `!alliance_create [Guilde_Cible]` : Propose une alliance multi-guildes.
- `!alliance_invite [Guilde]` : Invite une guilde dans l'alliance.
- `!alliance_war [Alliance_Cible]` : Déclare la guerre entre deux alliances.
- `!race_council` : Convoque un conseil diplomatique inter-races (Lord uniquement).
- `!lord_campaign [Discours]` : Lance une campagne électorale pour le poste de Lord.
- `!lord_tax_set [Pourcentage]` : Le Lord ajuste les taxes de sa capitale (0-15%).

## 20. 🗣️ Dialogue PNJ & Quantité Informationnelle
*Commandes liées aux conversations avec les PNJ (cf. `system_mechanics/npc_knowledge_protocol.md`, D16-D19). Tout dialogue passe par le pare-feu informationnel : un PNJ ne révèle que ce qui est dans son enveloppe QI.*
- `!parler [NPC_ID|Nom]` : Engage la conversation avec un PNJ présent dans la zone. Le bot ouvre le dialogue avec la réplique d'accueil, puis les réponses libres du joueur sont résolues contre l'enveloppe QI du PNJ.
- `!demander [NPC_ID] [sujet]` : Interroge un PNJ sur un sujet précis. Hors enveloppe → ligne d'ignorance scriptée (aucun appel IA) ; secret K3 → ligne de déflection ; info conditionnelle K2 → le PNJ évoque sa condition (affinité, quête, paiement, titre).
- `!pnj_list` : Liste les PNJ visibles dans la zone actuelle (les PNJ cachés `NPC_*_00` et les canoniques hors fenêtre n'y figurent JAMAIS).
- `!relation [NPC_ID|Nom]` : Affiche la relation avec un PNJ — **nombre d'échanges**, palier d'**affinité** (`stranger`→`confidant`), sujets déjà abordés (`T_NPC_RELATIONS`). C'est la mémoire « ce joueur a parlé N fois à ce PNJ ».
- `!offrir [Item_ID] [NPC_ID]` : Offre un cadeau à un PNJ ⇒ gain d'affinité (pondéré par la valeur de l'item). L'affinité ouvre remises, couches QI conditionnelles (K2) et **side-quests d'affinité** (`T_QUESTS_DICT.prerequisites`).

> Équivalents GM/IA : `!sys_npc_relation`, `!sys_set_affinity` · `SYS_NPC_RELATION_GET`, `SYS_NPC_RELATION_TOUCH`, `SYS_SET_AFFINITY`. Détail : `table_t_npc_relations.md`.

## 21. 🌳 Services de Capitale Neutre — Alne (lot 2.3)
*Commandes de service introduites par le roster d'Alne (`NPC_ALN_00-99`, `ZONE_NEU_CAP_001`). Règle de complétude (D) : chaque commande Joueur possède un équivalent GM (`!sys_*`) et IA (`SYS_*`, cf. §14 de `ai_orchestrator_commands.md`). Les commandes déjà couvertes par les sections 1-20 (`!parler`, `!shop_list`, `!repair`, `!forge`, `!enchant`, `!tame`, `!bank_depot/retrait`, `!mail_send`, `!outfit`, `!learn_skill`, `!bounty`, `!appraise`, `!perform`, `!bet`) sont réutilisées telles quelles.*

| Commande Joueur | Rôle | PNJ type | Équivalent GM | Équivalent IA |
|---|---|---|---|---|
| `!voyage [Cité]` / `!routes` | Hub aérien : voyage inter-cités, état des 9 routes | Halvard `10`, Wrenna `11` | `!sys_route_state` | `SYS_SET_TRADE_ROUTE` |
| `!dome_enter` / `!dome_log [étage]` | Accès endgame / registre des raids | Dorn `12`, Sella `13` | `!sys_dome_gate` | `SYS_LOG_RAID` |
| `!raid_register` / `!raid_join` | Inscrire / rejoindre un raid | Dorn `12`, Vira `75` | `!sys_raid_form` | `SYS_QUEST_HOOK` |
| `!hire_guide [dome\|ville]` / `!courier` | Guide / coursier | Torin `14`, Pip `80` | `!sys_escort` | `SYS_SPAWN_ESCORT` |
| `!gather` | Récolte guidée (sève, flore) | Yssa `15` | *(réutilise récolte §16)* | `SYS_STOCK_HARVEST_NODE` |
| `!biblio_search` / `!translate [texte]` / `!copy_scroll` | Bibliothèque : recherche, traduction, copie | Nima `20`, Lingua `22`, Denn `23` | `!sys_lore_unlock` | `SYS_GRANT_LORE` |
| `!repair_book` | Restauration/datation d'ouvrage | Ombric `21` | `!sys_item_state` | `SYS_SET_ITEM_STATE` |
| `!reputation [race]` | Consulter/améliorer le standing racial | Cassia `25` | `!sys_faction_set` | `SYS_SET_FACTION_STANDING` |
| `!broker [denrée]` / `!market_stall` | Courtage de denrées / location d'étal | Grède `26`, Bost `24` | `!sys_market_price` | `SYS_SET_SHOP_PRICES` |
| `!gem_set [équip] [gemme]` | Sertissage de gemme | Vireth `34` | `!sys_item_enchant` | `SYS_APPLY_SOCKET` |
| `!buff` | Bénédictions/buffs de départ | Ilia `41` | `!sys_grant_buff` | `SYS_APPLY_BUFF` |
| `!vault` | Coffre/consigne personnel | Lom `46` | `!sys_vault` | `SYS_SET_VAULT` |
| `!fence` / `!smuggle` / `!loan` / `!forge_doc` / `!ink` | Marché noir : recel, contrebande, usure, faux, marquage | Morne `55`, Rask `57`, Sept-Doigts `53`, Quill `56`, Sten `59` | `!sys_flag [Avatar] [flag]` | `SYS_FLAG_ILLEGAL_GOODS` / `SYS_FLAG_SOUL_CONTRACT` / `SYS_CLEAR_PK_FLAG` |
| `!buy_info` / `!buy_silence` | Renseignement / discrétion payante | Wisp `58`, Tibbe `50` | `!sys_npc_unlock` | `SYS_NPC_KNOWLEDGE_UNLOCK` |
| `!contract` / `!write_letter` | Actes notariés / écriture publique | Verd `62`, Emm `67` | `!sys_contract` | `SYS_SEAL_CONTRACT` |
| `!tax_pay` | Acquitter les taxes de marché | Molk `63` | `!sys_tax` | `SYS_LEVY_TAX` |
| `!hire_merc [profil]` | Louer un mercenaire | Della `76`, Gorak `04` | `!sys_spawn_merc` | `SYS_SPAWN_ESCORT` |
| `!mount_rent` | Louer une monture aérienne | Wick `84` | `!sys_grant_mount` | `SYS_SUMMON_MOUNT` |
| `!laundry` | Lessive/entretien du linge | Sud `87` | `!sys_item_state` | `SYS_SET_ITEM_STATE` |
| `!sharpen` | Affûtage (buff tranchant) | Griss `88` | `!sys_grant_buff` | `SYS_APPLY_BUFF` |
| `!portrait` | Portrait cosmétique | Ode `83` | `!sys_cosmetic` | `SYS_SET_COSMETIC` |
| `!gazette` | Lire/publier une annonce | Prell `89` | `!sys_announce` | `SYS_ANNOUNCE` |
| `!oracle` | Consultation d'oracle (hooks de quête) | Isilde `98` | `!sys_quest_give` | `SYS_QUEST_HOOK` |
| `!memorial` | Registre/hommage aux comptes bannis | Sorne `97` | `!sys_registry` | `SYS_QUERY_REGISTRY` |
| `!heal` (mineur) | Soins de fortune/rue | Osmé `40`, Aeliss `91` | `!sys_heal` | `SYS_APPLY_HEAL` |
| `!tutorial` | Onboarding des mécaniques (R0, éco) | Pell `96` | `!sys_tutorial` | `SYS_TUTORIAL_STEP` |

## 22. 🎒 Système de port & loadout (D45/D46)

> Équipement porté = 5 slots d'armure (D44). Le port des armes et le stockage sont **dissociés** : mains (2) · ceinture `BELT_*` (2 fourreaux, dégainage instantané) · dos = sac `BAG_*` (stockage +30, accès rapide) **XOR** sangle `HRN_*` (armes au dos). Inventaire virtuel de base (sac non obligatoire). Détail : `cardinal_system_db/MLD_Logic/table_t_avatars.md`.

| Commande Joueur | Rôle | GM | IA |
|---|---|---|---|
| `!degainer [gauche\|droite\|dos]` | Dégaine une arme de la ceinture ou de la sangle (sans commande d'inventaire) | `!sys_set_loadout` | `SYS_SET_LOADOUT` |
| `!fetch [Item_ID]` | Sort un objet de l'inventaire virtuel (coûte une action ; inutile si un sac est porté) | `!sys_give` | `SYS_GRANT_ITEM` |
| `!equiper [ID] ceinture\|dos` | Équipe une ceinture / un sac / une sangle (dos = sac XOR sangle) | `!sys_set_loadout` | `SYS_SET_LOADOUT` |
| `!sew [Matériau]` | Coud un sac `BAG_*` ou une sangle `HRN_*` | — | — |
| `!outfit` | Change de tenue (cosmétique / rachat tenue par défaut `OFT_*`) | `!sys_cosmetic` | `SYS_SET_COSMETIC` |

## 23. 💼 Emploi salarié (D-SOC-11)

> Métier salarié du joueur (aubergiste, garde, coursier…), distinct des skills de récolte/artisanat (§16). Un seul emploi actif à la fois. Détail : `cardinal_system_db/MLD_Logic/table_t_jobs.md`.

| Commande Joueur | Rôle | GM | IA |
|---|---|---|---|
| `!jobs` | Liste les offres d'emploi de la ville | — | — |
| `!apply_job [JOB_ID]` / `!quit_job` | Postuler / démissionner (`required_level` requis) | `!sys_assign_job` / `!sys_fire` | `SYS_ASSIGN_JOB` / `SYS_FIRE` |
| `!work` | Accomplit un service (cooldown ; mini-jeu selon métier) ⇒ salaire + réputation | — | `SYS_JOB_EVENT` |
| `!payslip` | Touche le salaire cumulé (`wage_accrued` → solde) | — | `SYS_PAY_WAGE` |
