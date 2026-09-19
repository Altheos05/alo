# Orchestrateur IA : Matrice Absolue des Commandes Cardinal (Function Calling)

*Dans ALfheim Online, le Système Cardinal gère l'auto-régulation du monde pour maintenir l'intérêt des joueurs. Via ces outils de `Function Calling`, notre modèle Gemini 1.5 agit avec l'autorité absolue d'un "Dungeon Master" automatisé sur l'intégralité du backend Node.js.*

## 1. 🌍 Manipulations Environnementales & Topographiques
- `SYS_CHANGE_WEATHER(Zone_ID, Type)` : Modifie la météo (Pluie, Tempête, Brume toxique, Neige) modifiant instantanément la physique de vol et la visibilité.
- `SYS_TIME_SHIFT(Zone_ID, Time_Target)` : Force le cycle Jour/Nuit, par exemple pour créer une éclipse qui paralyse la magie Sylphe.
- `SYS_ALTER_GRAVITY(Zone_ID, Valeur)` : Modifie la constante `9.8m/s²`. Utilisé dans les donjons spéciaux (Jötunheimr profond).
- `SYS_LOCK_ZONE(Zone_ID, Raison)` : Verrouille l'accès à une zone (ex: "Mur de ronces magiques") — tout `!enter_zone` vers elle est refusé (contrôle R4, au grain zone et non groupe, D76).
- `SYS_TRIGGER_DISASTER(Zone_ID, Disaster_Type)` : Invoque une catastrophe naturelle (Tremblement de terre, Éruption) causant des dégâts passifs dans la zone.
- `SYS_CONNECT_ZONES(Zone_A, Zone_B)` : Crée une liaison bidirectionnelle dans le graphe de voisinage (ex: un pont apparaît, un éboulement ouvre un passage). Met à jour l'atlas (`connected_zones` symétrique, règle L1).
- `SYS_DISCONNECT_ZONES(Zone_A, Zone_B)` : Supprime une liaison du graphe (ex: pont détruit). Les joueurs en transit sont renvoyés vers la zone source.
- `SYS_SYNC_PRESENCE(Avatar_ID)` : Résout toute désynchronisation entre les groupes WhatsApp et `T_AVATARS.current_zone_id` (source de vérité L1) — fait respecter l'invariant « 1 joueur = 1 groupe territoire » (protocole R0 v2, D76 ; implémentation : `sync_player_groups()`, idempotente).
- `SYS_SET_ENV_HAZARD(Zone_ID, Param, Valeur)` : Pilote les jauges environnementales de zone/instance (`OXYGEN` — Apnée du Gouffre de Léviathan, `HEAT` — Surchauffe de la Caldeira d'Obsidienne, `DOT` — dégâts continus type Désolation de Magma). Équivalent GM : `!sys_env_set`.

## 2. 🎭 Manipulations PNJ, Factions & Narratives
- `SYS_MODIFY_AFFINITY(Avatar_ID, NPC_ID, Valeur)` (alias `SYS_SET_AFFINITY`) : Altère le respect d'un PNJ envers un joueur selon son Roleplay textuel — **écrit `T_NPC_RELATIONS.affinity`** (clampé [−100,+100]), recalcule `affinity_tier` (D-SOC-2). Équivalent GM : `!sys_set_affinity`.
- `SYS_NPC_RELATION_TOUCH(Avatar_ID, NPC_ID, Δaffinity)` : Enregistre une interaction — **crée la ligne à la volée** si absente (D-SOC-1), incrémente `interaction_count`, `last_talked_at`, applique le delta d'affinité. Appelé à chaque `!parler`/`!demander`.
- `SYS_NPC_RELATION_GET(Avatar_ID, NPC_ID)` : Retourne la relation (nb d'échanges, affinité, sujets abordés) pour contextualiser une réplique. Équivalent GM : `!sys_npc_relation`.
- `SYS_NPC_DIALOG_OVERRIDE(NPC_ID, Dialogue_Urgent)` : Force un PNJ marchand ou garde à relayer un message critique au lieu de son menu habituel.
- `SYS_DECLARE_FACTION_WAR(Race_A, Race_B)` : L'IA détecte une tension diplomatique entre les joueurs de deux races et déclenche un état de guerre officiel (PK autorisé sans perte de Karma).
- `SYS_ASSASSINATE_NPC(NPC_ID)` : L'IA décide de tuer un Lord PNJ pour relancer une quête d'élection diplomatique.
- `SYS_REBUILD_TOWN(Town_ID)` : L'IA reconstruit ou modifie l'architecture d'une ville (après une invasion par exemple).
- `SYS_MOVE_NPC(NPC_ID, Zone_ID)` : Déplace un PNJ vers une autre zone (`T_NPC.zone_id`) — pèlerinages, fuites, exils narratifs. Équivalent GM : `!sys_npc_move`.
- `SYS_NPC_DIALOGUE(NPC_ID, Avatar_ID, Topic, Knowledge_Scope)` : Génère la réplique d'un PNJ **strictement dans le périmètre** `Knowledge_Scope` = K0 + K1 + K2 débloqués de l'avatar (vue `V_NPC_LLM_SCOPE`) + section « Bio & Personnalité » de la fiche. Invariants D18 : jamais de K3, jamais de sujet hors enveloppe (le bot a déjà répondu par la ligne d'ignorance). Cf. `npc_knowledge_protocol.md` §2.
- `SYS_NPC_KNOWLEDGE_CHECK(NPC_ID)` : Retourne l'enveloppe QI complète d'un PNJ (audit avant scène narrative). Équivalent GM : `!sys_npc_info`.
- `SYS_NPC_KNOWLEDGE_UNLOCK(NPC_ID, QI_ID, Avatar_ID)` : Débloque un slot K2/K3 pour un joueur (récompense d'arc narratif — écrit `T_NPC_KNOWLEDGE_UNLOCKS`). Équivalent GM : `!sys_npc_unlock`.
- `SYS_SPAWN_CANON(NPC_ID, Zone_ID, Duration, Silent?)` : Matérialise un personnage canonique (D19) pour `Duration` minutes — renseigne `T_NPC.zone_id` puis la remet à NULL à expiration. `Silent = VRAI` : aucune annonce, seuls les joueurs présents le découvrent. Équivalent GM : `!sys_canon_spawn`.
- Événement entrant `NPC_SECRET_PROBED(NPC_ID, Avatar_ID, QI_ID)` : émis par le bot quand un joueur sonde un secret K3 (trigger T4 de `T_NPC_KNOWLEDGE`) — hook narratif : l'IA peut décider d'en faire une quête, une filature, une rumeur.

## 3. ⚔️ Manipulation des Mobs & Bosses (Auto-Balancing)
- `SYS_BUFF_MONSTER(Mob_Instance, Stat, %)` : "Phase 2" dynamique si le boss est vaincu trop facilement (Boost HP, Force).
- `SYS_MUTATE_MONSTER(Mob_Instance, New_Element)` : L'IA adapte le Boss aux attaques des joueurs (ex: Si spammé de Feu, le Boss devient Immunisé au Feu).
- `SYS_SPAWN_INVASION(Zone_ID, Mob_ID, Qté)` : Déclenche un raid massif de monstres attaquant une capitale ou un campement de joueurs.
- `SYS_SPAWN_WORLD_BOSS(Zone_ID)` : Fait apparaître un Boss Unique non-instancié, nécessitant la coopération de multiples guildes (Ping Global).
- `SYS_MERGE_MOBS(Mob_ID_1, Mob_ID_2)` : Fusionne deux entités en plein combat pour créer une aberration si le chronomètre du combat est trop long.
- `SYS_ADJUST_SPAWN(Zone_ID, Mob_ID, Taux)` : Ajuste dynamiquement un taux d'apparition dans `T_SPAWN_TABLES` (surpopulation, événements, équilibrage). Équivalent GM : `!sys_spawn_set`.
- `SYS_SET_CARVE_TABLE(Mob_ID, Partie, Seuil_%HP, Item_ID, Taux)` : Déclare/modifie une ligne de dépeçage par partie (D78, `19_cdc_moteur_deterministe.md` §4) — résolue par L1, jamais par une IA : le franchissement du seuil de dégâts localisé déclenche un roll garanti, indépendant de la table de drop de fin de combat. Appliqué aux 9 boss territoriaux (étape 50). Équivalent GM : `!sys_carve_set`.
- `SYS_SET_VARIANT_RATE(Zone_ID_ou_global, Taux)` : Règle la probabilité de promotion d'un mob commun en Variant à l'instanciation (D79, `19_cdc_moteur_deterministe.md` §4/§6 D-DET-6) — résolu par L1 : stats de la fiche mob ×2,5 PV/×1,4 ATQ-DEF/×2 XP, loot existant garanti, +Yrds ×3. Zéro nouvelle ligne `T_SPAWN_TABLES`, zéro nouvel item. Équivalent GM : `!sys_variant_rate`.

## 4. 🧬 Manipulation Directe des Joueurs (Droit Divin)
- `SYS_DEBUFF_PLAYER(Avatar_ID, Status_Effect)` : Applique une altération d'état (Cécité, Poison, Silence) suite à une erreur critique du joueur. *(D90 : persistée dans `T_ACTIVE_EFFECTS`, jamais mortelle hors combat.)*
- `SYS_BLESS_PLAYER(Avatar_ID, Buff_Type)` : Accorde une bénédiction (ex: +50% EXP pendant 1h) pour récompenser un Roleplay héroïque. *(D90 : persistée dans `T_ACTIVE_EFFECTS`.)*
- `SYS_GRANT_COOKING_XP(Avatar_ID, XP)` : Accorde de l'XP de cuisine (D94, récompense de quête culinaire). Équivalent GM : `!sys_cooking_xp`.
- `SYS_CLEAR_EFFECTS(Avatar_ID)` : Dissipe les effets actifs dissipables d'un joueur (D90). Équivalent GM : `!sys_effect_clear`.
- `SYS_SET_GENDER(Avatar_ID, Genre)` : Corrige le genre d'un avatar — seule voie, le genre étant immuable côté joueur (D86). Équivalent GM : `!sys_set_gender`.
- `SYS_NOTIFY_PLAYER(Avatar_ID, Texte)` : Message privé système à un joueur, via la file bridée `T_NOTIFICATIONS` (D91). Équivalent GM : `!sys_notify`.
- `SYS_CURSE_KARMA(Avatar_ID, Yrd_Penalty)` : Si le joueur triche ou exploite une faille de langage, l'IA draine son compte bancaire ou brise son arme.
- `SYS_FORCE_TELEPORT(Avatar_ID, Zone_ID)` : Téléporte instantanément un joueur dans une prison système ou une dimension parallèle (ex: Salle blanche du GM).
- `SYS_WIPE_MEMORY(Avatar_ID, Knowledge_ID)` : Efface une entrée de l'Encyclopédie du joueur, simulant une amnésie due à un Boss Psychique.
- `SYS_OVERRIDE_HP(Avatar_ID, Valeur)` : Fixe les HP d'un joueur à 1 (Le laisse à l'article de la mort pour créer du drame narratif).

## 5. 💰 Manipulation de l'Économie & du Loot
- `SYS_INFLATION_CRASH()` : Augmente le coût de réparation des armes de 300% à l'échelle du serveur si la masse monétaire en circulation est trop grande.
- `SYS_DROP_SECRET_LORE(Avatar_ID, Knowledge_ID)` : Débloque la véritable histoire d'Aincrad dans l'Encyclopédie d'un joueur s'il fouille le bon endroit.
- `SYS_GRANT_ITEM(Avatar_ID, Item_ID, Qty)` : L'IA remet au joueur un objet existant du dictionnaire MLD (récompense de quête, drop scénarisé, compensation). Équivalent IA de la commande GM `!sys_give`.
- `SYS_GENERATE_UNIQUE_ITEM(Avatar_ID, Item_JSON)` : L'IA forge de toutes pièces une arme unique (Épée Démoniaque de Sang) qui n'existait pas dans le dictionnaire MLD et l'offre au joueur.
- `SYS_DESTROY_ITEM_INSTANCE(Instance_ID)` : L'IA brise volontairement une arme en plein combat, forçant le joueur à s'adapter sans équipement.
- `SYS_GENERATE_QUEST(Group_ID, Quest_JSON)` : L'IA génère et propose une "Emergency Quest" (Quête Urgente) directement aux joueurs présents dans la zone.

## 6. ⚙️ Gestion de l'Interface et du Cache Serveur
- `SYS_ANNOUNCE_GLOBAL(Texte)` : L'IA pousse un message épinglé dans tous les groupes WhatsApp de la communauté en tant qu'Alerte Rouge. *(Émis via `T_NOTIFICATIONS`, une ligne par groupe, débit bridé — D91.)*
- `SYS_OVERRIDE_BGM(Track_Name)` : (Narration) Le bot précise au joueur que la musique du monde virtuel vient de changer (ex: *BGM: Boss Theme*).
- `SYS_PAUSE_INSTANCE(Combat_ID)` : L'IA gèle le timer d'un combat asynchrone si une maintenance ou une vérification est requise.
- `SYS_RAG_REINDEX(scope)` : Force la ré-indexation incrémentale par hash de l'index vectoriel RAG (`scope` = `fiche`/`dossier`/`global` ; D-RAG-9, `15_cdc_rag.md`) — permet à une fiche modifiée de remonter à jour dans la constellation sans réentraînement complet. Respecte le verrou d'ingestion K3/méta/secret (D-RAG-2/D22) : les sections exclues à l'ingestion le restent après réindexation. Équivalent GM : `!sys_rag_reindex`.
- `SYS_MENU_RENDER(Avatar_ID, Context_Type, Context_Ref)` : Primitive de **lecture/formatage** (D83, `system_mechanics/menu_contextuel_protocol.md`) — calcule et attache le bloc de menu contextuel numéroté (1-8 options + `9` aide) à une réponse du bot, à partir de l'état réel de l'avatar (sorts connus, inventaire, stock boutique, zones adjacentes, quêtes du board). Jamais appelée par le LLM pour choisir les options — toujours L1. Ne suit **pas** le contrat `SYS_*` en 6 étapes de D-DET-2 (réservé aux mutations d'état) : cette primitive ne modifie rien. Équivalent GM : `!sys_menu_force`.

## 7. 🏰 Grand Quests & Événements Mondiaux
- `SYS_TRIGGER_GRAND_QUEST(Quest_Type, Quest_JSON)` : L'IA déclenche une Grand Quest serveur-wide (Excalibur, World Tree, Purge).
- `SYS_OPEN_WORLD_TREE_GATE(Floor_ID)` : L'IA ouvre un palier de l'Arbre-Monde pour l'ascension.
- `SYS_CLOSE_WORLD_TREE_GATE(Floor_ID)` : L'IA referme le palier après échec ou complétion.
- `SYS_SPAWN_INFINITE_GUARDIANS(Zone_ID, Guardian_Type)` : Génère les Chevaliers Dorés en boucle infinie pour l'assaut de l'Arbre-Monde.
- `SYS_TRIGGER_SIEGE(Target_Capital, Attacking_Race)` : L'IA lance un siège de capitale.
- `SYS_ACTIVATE_SEASONAL_EVENT(Event_Type, Duration_Days)` : L'IA active un événement saisonnier (Festival, Invasion, Tournoi).
- `SYS_BROADCAST_WORLD_MESSAGE(Text)` : Message scénarisé dans TOUS les groupes du serveur. *(Émis via `T_NOTIFICATIONS`, débit bridé — D91.)*
- `SYS_MODIFY_WORLD_STATE(State_Key, Value)` : Modifie une variable globale (ex: `eternal_winter = true`).
- `SYS_TRIGGER_SERVER_FREEZE(Zone_ID, Duration)` : Glaciation du serveur si quête échouée.
- `SYS_TRIGGER_BOSS_RACE(Boss_ID, Competing_Guilds[])` : Course au boss entre guildes.

## 8. 🕊️ Vol, Navigation & Cristaux
- `SYS_DISABLE_FLIGHT(Zone_ID)` : L'IA interdit le vol dans une zone (grottes, pièges, anti-vol magique).
- `SYS_EXTEND_FLIGHT_GAUGE(Avatar_ID, Seconds)` : L'IA octroie un bonus de vol pour une quête narrative.
- `SYS_FORCE_CRASH(Avatar_ID)` : L'IA force la chute d'un joueur en vol (piège, tempête).
- `SYS_DISABLE_CRYSTALS(Zone_ID)` : L'IA verrouille l'usage des cristaux dans une zone.
- `SYS_ENABLE_CRYSTALS(Zone_ID)` : L'IA réactive les cristaux après un événement.
- `SYS_DROP_RARE_CRYSTAL(Avatar_ID, Crystal_Type)` : L'IA fait tomber un cristal rare en récompense.
- `SYS_REVEAL_MAP(Avatar_ID, Zone_ID)` : L'IA révèle une zone sur la carte du joueur.
- `SYS_SCRAMBLE_MAP(Avatar_ID)` : L'IA brouille la carte (malédiction, labyrinthe).
- `SYS_CREATE_MAZE(Zone_ID, Complexity)` : L'IA reconfigure les connexions d'un donjon.
- `SYS_OPEN_CORRIDOR(Zone_A, Zone_B, Duration)` : Matérialise un portail bidirectionnel temporaire entre deux zones — résolution d'effet du Cristal de Corridor (`CSM_CRI_006`, `!use`). Le groupe le franchit via `!enter_portal` pendant `Duration` secondes (30 s par défaut). Équivalent GM : `!sys_open_corridor`.
- `SYS_GROUP_RECALL(Party_ID, Anchor_Avatar_ID)` : Rappelle les membres **consentants** d'un groupe vers une ancre (porteur/zone) — résolution d'effet du Cristal de Ralliement (`CSM_CRI_010`, `!use`). Chaque membre confirme par `!accept_rally` (aucun transfert sans consentement, invariant R0). Équivalent GM : `!sys_recall_party`.

## 9. 🎭 Magie Raciale & Compétences Spéciales
- `SYS_GRANT_SPELL(Avatar_ID, Spell_ID)` : L'IA enseigne un sort élémentaire (`MAG_*`) à un joueur. Face joueur : `!learn_skill` ; équivalent GM : `!sys_grant_skill`.
- `SYS_GRANT_OSS(Avatar_ID, OSS_JSON)` : L'IA valide un OSS créé par un joueur. *(Enseignement d'un OSS existant `OSS_*` : même primitive, face joueur `!learn_skill`.)*
- `SYS_GRANT_PASSIVE(Avatar_ID, Skill_ID, Rang)` : L'IA enseigne ou fait monter une compétence passive (`PAS_*`) à un rang I/II/III (bonus plafonné +8 %, max 2 passives du même domaine équipées — cf. `competences_magie/_index_skills.md`). Complète `SYS_GRANT_SPELL` (sorts `MAG_*`) et `SYS_GRANT_OSS` (`OSS_*`). Face joueur : `!learn_skill` ; équivalent GM : `!sys_grant_skill`.
- `SYS_TRANSFER_OSS(Source_ID, Target_ID, OSS_ID)` : Transfert d'OSS via parchemin.
- `SYS_VALIDATE_SKILL_CONNECT(Avatar_ID, Skill_A, Skill_B)` : Vérification du timing de Skill Connect.
- ~~`SYS_GRANT_MELODY(Avatar_ID, Melody_ID)`~~ — **redirigée vers `SYS_GRANT_SPELL`** (sorts `MAG_SUP_*`) : la musique Puca est l'école `SUP` (D89).
- ~~`SYS_AMPLIFY_MUSIC`~~, ~~`SYS_REVEAL_ILLUSION`~~, ~~`SYS_CREATE_MIRAGE_ZONE`~~, ~~`SYS_PLANT_TREASURE`~~ — **retirées** avec `illusion_magic_system.md` / `music_magic_system.md` (D89, application de D66).
- `SYS_TRIGGER_SACRIFICE(Avatar_ID, Damage_Radius)` : L'IA gère les conséquences d'un sort sacrificiel.

## 10. 💍 Social, Mariage, Housing & Emploi
> Domaine étendu à l'étape 43 (D-SOC-*). Tables : `T_MARRIAGES`, `T_PROPERTIES`, `T_JOBS_DICT`, `T_NPC_RELATIONS`. **Frontière déterministe** : la validation des prérequis (genre, monogamie, foyer, provenance de séparation, plafonds) est faite par le **moteur déterministe L1** ; l'IA ne fait que la narration + l'émission de la commande. Toute violation ⇒ rejet L1.
- `SYS_GENERATE_CEREMONY(Avatar_ID_1, Avatar_ID_2, Zone_ID)` : narration de cérémonie de mariage. *(D85 : `Zone_ID` = zone commune des deux fiancés à l'acceptation en personne.)*
- `SYS_CANCEL_PROPOSAL(Avatar_ID)` : Annule la demande en mariage sortante d'un avatar (D85, `T_MARRIAGE_PROPOSALS`). Équivalent GM : `!sys_proposal_cancel`.
- `SYS_GENERATE_WEDDING_GIFT(Marriage_ID, Avg_Level)` : tire le cadeau de noces (tier ∝ moyenne de niveau), déposé au coffre conjugal (`T_MARRIAGE_ASSETS.is_joint_earned=TRUE`).
- `SYS_DIVORCE_SETTLE(Marriage_ID)` : règlement de séparation atomique — restitution par provenance + split 50/50 du commun (M5).
- `SYS_CREATE_HOME_GROUP(Avatar_ID, House_Type)` : crée le groupe WhatsApp privé du logement.
- `SYS_GRANT_PROPERTY(Avatar_ID, Type, Tenure)` : attribue un logement (achat/location).
- `SYS_EVICT_TENANT(Property_UUID)` : expulse un locataire en défaut (biens → `T_MAIL` 30 j).
- `SYS_DESTROY_HOME(Avatar_ID, Reason)` : détruit la maison d'un joueur (invasion).
- `SYS_ASSIGN_JOB(Avatar_ID, JOB_ID)` / `SYS_FIRE(Avatar_ID)` : embauche / licenciement.
- `SYS_PAY_WAGE(Avatar_ID)` : verse le salaire cumulé au solde. `SYS_JOB_EVENT(Zone_ID, Type)` : incident de service (rush d'auberge, alerte de garde…).
- `SYS_GUILD_INVITE(Guild_ID, Avatar_ID)` / `SYS_GUILD_JOIN(Guild_ID, Avatar_ID)` : invitation / adhésion (G5).
- `SYS_INVADE_GUILD_HALL(Guild_ID, Attacker_Guild_ID)` : L'IA déclenche un siège de QG de guilde.
- `SYS_TRIGGER_ALLIANCE_EVENT(Race_A, Race_B, Type)` : L'IA déclenche un événement d'alliance.

## 11. 🎣 Récolte, Artisanat & Économie Dynamique
> **D87 (étape 60)** : les nœuds de toutes natures (`FLO_*`/`ORE_*`/`FSH_*`) vivent dans `T_RESOURCE_NODES` ; la repousse est **propre à chaque joueur**, l'épuisement collectif ne passe que par l'état global du nœud.
- `SYS_SPAWN_NODE(Zone_ID, Node_ID)` : Active (ou crée, pour un événement) un nœud dans une zone. *Réinterprété D87 : l'ancien paramètre `Qty` (« utilisations partagées avant épuisement ») est supprimé — incompatible avec la repousse par joueur.* Face joueur : `!recolter` / `!mine` / `!fish`.
- `SYS_REMOVE_NODE(Node_ID)` : Retire un nœud (tout type) — événement, déséquilibre. Distinct de `SYS_DEPLETE_RESOURCE`, qui le rend temporairement indisponible.
- `SYS_STOCK_FISHING_SPOT(Zone_ID, Fish_ID, Rarity)` : L'IA peuple un point de pêche (active un nœud `FSH_*` de la zone).
- `SYS_DEPLETE_RESOURCE(Zone_ID, Resource_Type)` : Rend les nœuds du type visé indisponibles **pour tous** pendant une durée (`depleted_until`, D87). Équivalent GM : `!sys_node_event … deplete`.
- `SYS_BONUS_HARVEST(Zone_ID, Multiplier)` : Multiplie les rendements **pour tous** jusqu'à échéance (`yield_multiplier`, D87). Équivalent GM : `!sys_node_event … bonus`.
- `SYS_MODIFY_DURABILITY(Item_Instance_ID, Delta)` : L'IA modifie la durabilité d'un item (D88 : bornée au plafond courant de l'instance ; à 0, l'objet est **Cassé**). Équivalent GM : `!sys_durability_set`.
- `SYS_DROP_WEAPON(Avatar_ID, Weapon_ID)` : L'IA force le drop d'une arme en récompense.
- `SYS_BREAK_WEAPON(Item_ID, Instance_ID)` : L'IA brise une arme en combat pour créer du drame. *(D88 : durabilité mise à 0 — **Cassé**, réparable au forgeron — et non destruction.)*
- `SYS_SET_SHOP_PRICES(NPC_ID, Multiplier)` : L'IA modifie les prix d'un marchand (inflation locale).
- `SYS_SHOP_RESTOCK(Shop_ID)` : Réassort d'une boutique (réécrit `T_SHOP_ITEMS.stock`), périodique (`T_SHOPS.restock_days`) ou événementiel (pénurie, afflux, siège). Employé par les 54 fiches boutiques C-1+. Équivalent GM : `!sys_shop_restock`. **Aucune face joueur** (anti-exploit) — le joueur ne voit que `!shop_list`/`!buy`/`!sell`.

## 12. 🧬 Gestion Avancée des Joueurs
- `SYS_GRANT_ADMIN_RIGHTS(Avatar_ID, Level)` : Octroyer des droits admin temporaires.
- `SYS_REVOKE_ADMIN_RIGHTS(Avatar_ID)` : Révoquer les droits admin.
- `SYS_SET_PAIN_ABSORBER(Avatar_ID, Level_0_to_10)` : Modifier le Pain Absorber.
- `SYS_ENGRAVE_MONUMENT(Monument_ID, Player_Names, Achievement)` : Graver un exploit sur le Monument.
- `SYS_REWARD_LAST_ATTACK(Avatar_ID, Boss_ID)` : Récompenser le Last Attack.
- `SYS_MANAGE_REMAIN_LIGHT(Avatar_ID, Extension_Seconds)` : Modifier le timer de Remain Light.
- `SYS_REVIVE_PLAYER(Avatar_ID, Target_ID)` : Valider une résurrection par sort.
- `SYS_CONVERT_CHARACTER(Avatar_ID, Target_Game)` : Conversion inter-jeux The Seed.

## 13. 🐉 Gestion Avancée des PNJ & Monstres
- `SYS_SUMMON_NPC_ARMY(Zone_ID, Faction, Count)` : Invoquer une armée PNJ alliée.
- `SYS_NPC_TRANSFORM(NPC_ID, New_Form)` : Transformation de PNJ (ex: Freyja → Thor).
- `SYS_ASSASSINATE_NPC(NPC_ID)` : L'IA tue un Lord PNJ pour relancer une élection.
- `SYS_SUMMON_MOUNT(Avatar_ID, Mount_ID)` : Invoquer une monture (Tonkii, dragons).
- `SYS_SEAL_LEGENDARY_WEAPON(Item_ID, Zone_ID)` : Sceller une arme dans un donjon.
- `SYS_COLLAPSE_DUNGEON(Dungeon_ID)` : Effondrement d'un donjon après complétion.
- `SYS_SET_ENV_HAZARD(Zone_ID, Hazard_Type, Value)` : Configurer un danger environnemental (Lave, Acide, Gel, Oxygène).
- `SYS_GENERATE_CARDINAL_QUEST(Myth_Source, Zone_ID)` : Quête auto-générée à partir de mythologie nordique.

## 14. 🌳 Services de Capitale Neutre — Alne (lot 2.3) — refonte D84

*Équivalents IA du roster d'Alne (`NPC_ALN_00-99`, cf. §21 de `whatsapp_commands_list.md`, réécrite en registre de sujets de service étape 55 — D84, `npc_knowledge_protocol.md` §2-bis). ~21 de ces primitives sont désormais déclenchées par un sujet `!demander`/`!parler` plutôt qu'une commande dédiée ; **13 exceptions gardent une commande de premier rang** (§21.1) — 3 mécaniques à point d'accès multiple (`SYS_SET_FACTION_STANDING`, `SYS_APPLY_SOCKET`, `SYS_TUTORIAL_STEP`) et 10 archétypes déjà répliqués dans d'autres villes (`SYS_SET_TRADE_ROUTE`, `SYS_QUEST_HOOK`/raid, `SYS_SUMMON_MOUNT`, `SYS_APPLY_BUFF`/sharpen, `SYS_FLAG_ILLEGAL_GOODS`/fence, `SYS_QUEST_HOOK`/oracle, `SYS_QUERY_REGISTRY`/memorial, `SYS_SET_ITEM_STATE`/laundry, `SYS_FLAG_SOUL_CONTRACT`/loan, `SYS_APPLY_HEAL`). Règle de complétude (D). Réutilisent quand c'est possible les primitives existantes (`SYS_GRANT_ITEM`, `SYS_SET_SHOP_PRICES`, `SYS_QUEST_HOOK`, `SYS_SET_ENV_HAZARD`, `SYS_SUMMON_MOUNT`).*
- `SYS_SET_TRADE_ROUTE(Route_ID, State)` : Ouvre/ferme/perturbe une des 9 routes aériennes (blocus, essaim `MOB_AIR_*`). Face joueur : `!routes` / `!voyage` (Halvard `10`, Wrenna `11`).
- `SYS_LOG_RAID(Raid_ID, Roster, Dome_Floor)` : Inscrit un raid montant au Dôme `ZONE_YGG_DUN_001` (Dorn `12`, Sella `13`).
- `SYS_SPAWN_ESCORT(Avatar_ID, Escort_Type)` : Matérialise guide/coursier/mercenaire (Torin `14`, Pip `80`, Della `76`).
- `SYS_STOCK_HARVEST_NODE(Zone_ID, Resource_ID, Rarity)` : Peuple un nœud de récolte (sève/flore d'Yggdrasil, Yssa `15`).
- `SYS_GRANT_LORE(Avatar_ID, Lore_ID)` : Débloque un contenu de lore traduit/copié (Lingua `22`, Denn `23`, Valerius `01`).
- `SYS_SET_FACTION_STANDING(Avatar_ID, Race_ID, Delta)` : Ajuste la réputation raciale (Cassia `25`).
- `SYS_APPLY_SOCKET(Item_ID, Gem_ID)` : Sertit une gemme dans un équipement (Vireth `34`).
- `SYS_APPLY_BUFF(Avatar_ID, Buff_ID, Duration)` : Applique un buff de départ/tranchant/food (Ilia `41`, Griss `88`, Aubin `47`).
- `SYS_SET_VAULT(Avatar_ID, Item_ID, Op)` : Dépôt/retrait de coffre (Lom `46`) — distinct de la banque (`!bank_*`, Ovena `60`).
- `SYS_FLAG_ILLEGAL_GOODS(Item_ID)` / `SYS_FLAG_SOUL_CONTRACT(Contract_ID)` / `SYS_CLEAR_PK_FLAG(Avatar_ID)` : Traçage du marché noir (Morne `55`, Sept-Doigts `53`, Sten `59`) — **exploits scénarisés, réservés orchestrateur**.
- `SYS_SEAL_CONTRACT(Contract_ID, Parties, Clauses)` : Scelle un acte notarié inviolable (Verd `62`) ; le « contrat fondateur » de l'anti-PK (`QI_ALN_62_09`) est non ouvrable.
- `SYS_LEVY_TAX(Avatar_ID, Amount)` : Prélève une taxe de marché (Molk `63`) ; la « taxe fantôme » (`QI_ALN_63_09`) est un flag méta.
- `SYS_SET_COSMETIC(Avatar_ID, Cosmetic_ID)` : Portrait/coiffure/tatouage cosmétique (Ode `83`, Vane `65`, Sten `59`).
- `SYS_ANNOUNCE(Zone_ID, Message)` : Diffuse une annonce publique (Perla `64`, Prell `89`) — vecteur des événements serveur. *(Émis dans le groupe du territoire de `Zone_ID` via `T_NOTIFICATIONS`, D91.)*
- `SYS_QUERY_REGISTRY(Registry, Key)` : Consulte les registres de disparus (Sorne `97`, Lom `46`, Wrenna `11`).
- `SYS_APPLY_HEAL(Avatar_ID, Amount)` : Soins de fortune (Osmé `40`, Aeliss `91`) ; résurrection = `SYS_REVIVE_PLAYER` (§12).
- `SYS_TUTORIAL_STEP(Avatar_ID, Step_ID)` : Progression du tutoriel d'onboarding (Pell `96`).
- **Note fil méta (D20)** : les slots K3 des PNJ `00`, `35`, `81`, `98`, `99` (lancement/relance du serveur, dessein du Cardinal) ne sont JAMAIS injectés au LLM — 1 révélation méta max/session, jamais confirmée frontalement, pilotée exclusivement par l'orchestrateur via `NPC_SECRET_PROBED`.

- `SYS_SET_LOADOUT(Avatar_ID, Slot, Item_ID)` : Assigne une arme/un conteneur à un slot de port (`hand_*`, `belt_left/right`, `gear_belt`, `gear_back`) — équivalent IA de `!degainer` / `!equiper ceinture|dos` (D45). Refus si l'arme irait en sac/inventaire virtuel (armes portées uniquement).
