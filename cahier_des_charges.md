# 📜 CAHIER DES CHARGES — Projet ALO : MMORPG Textuel sur WhatsApp

> **Version** : 1.1 (base + chantier de renflouement conforme) · **Date** : 2026-07-06, amendée 2026-07-10
> **Gouvernance** : toute exécution est conditionnée par `system_persona_architecte.md` (Architecte Créateur Primaire).
> **Phase actuelle** : établissement des données — **aucun code n'est produit à ce stade ; les livrables sont purement structurels.**
> **Principe de conformité (v1.1)** : le périmètre livrable est le **corpus conforme** (voir §10), **jamais le contenu pré-généré** hérité de sessions automatiques. Le pré-généré non validé **ne fait pas foi** et **ne compte pas comme livré** : il est à **régénérer intégralement** selon les gabarits actés, pas à compléter (D66).

---

## 1. Vision & Objet

Recréer l'expérience du VRMMO **ALfheim Online** (univers Sword Art Online) sous forme de **roman interactif
multijoueur opéré par un bot WhatsApp**. Le monde est simulé par un « Système Cardinal » (orchestrateur IA +
backend Node.js à venir) ; les joueurs (~200 au lancement) agissent par commandes textuelles et vivent des
restitutions narratives cinématiques, jamais des sorties de terminal brut.

**Principe cardinal du projet (amendé D76, étape 48)** : *un territoire = un groupe WhatsApp*. La géographie du
monde reste découpée en **zones** (granularité du gameplay, portée par l'état L1 `current_zone_id`) ; sa
matérialisation WhatsApp est agrégée en **13 territoires** (contrainte réelle : ~100 groupes max par communauté).
La géographie du monde EST l'architecture des groupes — au grain territoire.

## 2. Périmètre

| Inclus | Exclus (phase base) |
|---|---|
| Base de données du monde en markdown structuré (`données/`) | Tout code d'implémentation (Node.js, SQL exécutable) |
| Atlas des zones + graphe de liaisons complet | Fiches narratives détaillées des zones nouvellement référencées |
| Protocole de déplacement inter-groupes | Intégration API WhatsApp réelle |
| Registres de commandes Joueur / GM / IA | Économie fine, équilibrage chiffré exhaustif |
| Cahier des charges + README | Hébergement, monitoring, CI |

## 3. Acteurs

| Acteur | Rôle | Interface |
|---|---|---|
| **Joueur** | Incarne un avatar d'une des 9 races | Commandes `!*` dans les groupes WhatsApp |
| **Game Master (humain)** | Support, modération, événements | Commandes `!sys_*` (admin only) |
| **Orchestrateur IA (Cardinal)** | Dungeon Master automatisé : météo, quêtes, équilibrage, narration | Function Calling `SYS_*` (`the_seed_engine/ai_orchestrator_commands.md`) |
| **Bot WhatsApp (à implémenter)** | Exécute les règles, gère les groupes, restitue la narration | Backend Node.js (phase ultérieure) |

## 4. Exigences Fonctionnelles (par module de données)

| Réf. | Module | Source de vérité | Exigence |
|---|---|---|---|
| EF-01 | **Cartographie & Monde** | `données/cartographie/atlas_monde_liaisons.md` | Le monde est découpé en zones identifiées (`ZONE_*`), reliées par un graphe symétrique ; 9 territoires raciaux + axe neutre Alne/Yggdrasil/Jötunheimr/New Aincrad |
| EF-02 | **Déplacement** | `the_seed_engine/system_mechanics/zone_movement_protocol.md` (v2.0) | Invariant R0 (v2, D76) : un joueur connecté est dans exactement un groupe **territoire**/instance ; la zone exacte est l'état L1 `current_zone_id` ; changement de groupe seulement au franchissement de frontière de territoire (`sync_player_groups()` par retrait) ; les groupes permanents (4 communauté + 9 raciaux) ne sont jamais quittés |
| EF-03 | **Commandes** | `the_seed_engine/whatsapp_commands_list.md` | Toute mécanique du monde a son équivalent commande (Joueur, GM et/ou IA) — règle de complétude obligatoire pour tout ajout |
| EF-04 | **Progression & Stats** | `the_seed_engine/stat_scaling/*` | 9 races équilibrées (60 pts base), formules de dérivation, scaling par niveau |
| EF-05 | **Combat** | `system_mechanics/damage_calculation_algorithm.md`, `physics_combat.md` | Combat asynchrone verrouillé (anti-duplication), Remain Light à la mort |
| EF-06 | **Bestiaire** | `personnages_bestiaire/` | 200 boss New Aincrad (2/palier), mobs par territoire, PNJ à secret narratif |
| EF-07 | **Économie & Objets** | `items_equipements/`, `stat_scaling/economy_balance_sheet.md` | Chaîne de dépendances économiques (drop → marchand → craft), monnaie Yrd |
| EF-08 | **Magie & Skills** | `compétences_magie/`, `données/skills.md` | Systèmes de cast, OSS, magie musicale/illusion |
| EF-09 | **Modèle de données** | `cardinal_system_db/MCD_Concept/` + `MLD_Logic/` | Chaque entité conceptuelle (MCD) a sa table logique (MLD) ; identifiants stricts |
| EF-10 | **Lore & Règles du monde** | `lore_mecaniques/` | Vol, PK/justice, respawn, flore par territoire |

## 5. Exigences Non Fonctionnelles (filtres du Persona)

| Réf. | Exigence | Critère |
|---|---|---|
| ENF-01 | **Scalabilité** | Architecture pensée pour 10 000 messages simultanés (asynchrone, cache d'état, locking) |
| ENF-02 | **Sécurité** | Anti-injection, anti-spam, karma anti-exploit (`SYS_CURSE_KARMA`) |
| ENF-03 | **Intégrité** | Graphe de zones symétrique (règle L1) ; transactions atomiques de déplacement ; resynchronisation `SYS_SYNC_PRESENCE` |
| ENF-04 | **Narration** | Zéro réponse minimaliste : toute sortie bot est une restitution narrative (`whatsapp_narrative_io.md`) |
| ENF-05 | **Cohérence écologique/économique** | Tout drop, PNJ et ressource s'insère dans l'arbre de dépendances du monde |
| ENF-06 | **Traçabilité** | Tout mouvement/action journalisé (`T_WHATSAPP_LOGS`) |

## 6. Architecture des Données (couches)

```
system_persona_architecte.md          ← gouvernance (conditionne toute exécution)
données/
 ├─ cartographie/                     ← COUCHE MONDE : atlas (maître) + fiches zones + routes
 ├─ cardinal_system_db/               ← COUCHE MODÈLE : MCD (concepts) → MLD (tables)
 ├─ the_seed_engine/                  ← COUCHE MOTEUR : mécaniques, scaling, commandes
 ├─ personnages_bestiaire/            ← COUCHE ENTITÉS : boss, mobs, PNJ
 ├─ items_equipements/                ← COUCHE OBJETS
 ├─ competences_magie/                ← COUCHE SKILLS
 └─ lore_mecaniques/                  ← COUCHE LORE : règles du monde, géographie narrative, flore
ressources/ & ressources_brutes/      ← matière première (light novels, guides de worldbuilding)
```

**Règle de propagation** : toute modification (description, statistique, ID) doit être répercutée dans TOUTES
les couches où l'élément est référencé (atlas ↔ fiche zone ↔ table MLD ↔ commande).

## 7. Décisions de Design Actées

| # | Décision | Justification |
|---|---|---|
| D1 | Capitale Salamander = **Gattan** (`ZONE_SAL_CAP_001`) ; **Voulg** requalifiée forteresse secondaire (`ZONE_SAL_TWN_001`) | Conflit entre deux fichiers ; l'ID cartographique existant fait foi |
| D2 | Disposition radiale des 9 territoires autour d'Alne, frontières par paires de zones `HUNT_002` | Supporte les liaisons terrestres + tension PvP frontalière du lore |
| D3 | New Aincrad : seuls le Palier 1 et le palier de front ont des groupes persistants ; salles de boss = groupes `INSTANCE` éphémères | 100 paliers ≠ 100 groupes WhatsApp (limite opérationnelle) |
| D4 | Taxonomie de groupes (v2, harmonisée D76 sur l'enum implémenté) : `location` (= territoire) / `dungeon_instance` (exclusifs) vs `community_hub` / `guild_hall` / `private_party` / `housing` / `arena` / `system` (persistants ou sociaux) | Fonde l'invariant R0 du protocole de déplacement |
| D5 | Capitales nommées pour les 4 territoires sans fiche : Lioda (Puca), Duskarn (Imp), Granzam (Gnome), Brokkheim (Leprechaun), Penwether (Spriggan — canon) | Complétude du découpage en 9 territoires |
| D11 | Mécaniques signatures des 2 donjons restants (complète D10 sur 9/9) : Caldeira d'Obsidienne = jauge de **Surchauffe** (chaque message du groupe chauffe l'instance — anti-spam) ; Gouffre de Léviathan = jauge d'**Apnée** individuelle (chaque action consomme de l'oxygène, `!respirer` en poche d'air) | Exploiter nativement WhatsApp ; transformer les contraintes anti-spam (ENF-02) en gameplay |
| D12 | Paramètres environnementaux de zone unifiés (`OXYGEN`, `HEAT`, `DOT`) pilotés par une commande générique unique : GM `!sys_env_set`, IA `SYS_SET_ENV_HAZARD` | Éviter une commande par jauge ; extensible aux futurs environnements (froid Jötunheimr, etc.) |
| D76 | **Pivot territorial WhatsApp** (décision produit PE, étape 47 `b0ab4dd` ; docs maîtres amendés étape 48). La matérialisation WhatsApp passe du grain **zone** (52 groupes + dynamiques) au grain **territoire** : **13 territoires** couvrent les 52 zones (9 raciaux + `alne` + `aincrad` + `jotunheimr` + `yggdrasil` — registre maître : atlas §2-bis), soit **26 groupes permanents** (4 communauté + 9 raciaux + 13 territoires) et ~74 slots dynamiques. La **zone** reste la granularité du gameplay (adjacence R3, spawns, capacité, jauges D12), portée exclusivement par l'état L1 `T_AVATARS.current_zone_id` ; le changement de groupe n'a lieu qu'au franchissement de frontière de territoire (`sync_player_groups()` par retrait, idempotente). R0 reformulé en conséquence (protocole v2.0). Aucune commande ajoutée ni retirée (sémantique joueur préservée). | Contrainte réelle : ~100 groupes maximum par communauté WhatsApp — 52 groupes de zones + instances + guildes + parties auraient dépassé le plafond dès le lancement |
| D80 | **Corridor Souterrain de Lugru formalisé.** `ZONE_ROUTE_LUGRU` (cité par la fiche Forêt de Lugru depuis l'étape 2, jamais entré dans l'atlas) devient une liaison atlas à part entière : raccourci direct `SYL_HUNT_002` ↔ `NEU_CAP_001` (Alne), zone PK à haut risque, `link_type='UNDERGROUND'` (à pied, `!entrer corridor`, 0 MP, 3 min). Trigger L4 de `T_ZONE_LINKS` reformulé en conséquence : `requires_flight` dépend du `link_type='FLY'` de la liaison, pas du `Type` atlas ROUTE de la zone (jusqu'ici les deux coïncidaient pour les 9 `ROUTE_*_ALN` aériennes, ce corridor les découple). | Point ouvert non bloquant depuis l'étape 2 (« arbitrage `ZONE_ROUTE_LUGRU` ») ; risk/reward cohérent avec le lore (chemin le plus direct vers Alne mais infesté de PK/mobs) plutôt qu'un doublon de route aérienne |
| D66 | **Non-autorité du contenu pré-généré.** Toute donnée héritée de sessions automatiques (ID à hash, lore d'une ligne, zéro chaînage éco, doublons `Item_ID` R2, noms d'items fabriqués, zones erronées) est réputée **non conforme** : elle **ne fait pas foi**, **n'est jamais citée comme source de vérité**, et **ne compte pas comme livrée**. Un dossier pré-rempli est traité comme **vide** tant qu'il n'a pas été **régénéré et validé** selon les gabarits (D13-D15 items, D34-D37 rosters/boutiques, D61/D64/D65 tiers/marché noir/chevauchement). La régénération est **intégrale** (remplacement), jamais un complément. L'original non conforme part en `ressources_brutes/deprecated_v1/`. | Deux sessions parallèles ont pré-rempli les dossiers de villes/slots ; les compter comme « faits » masquerait des doublons R2, de faux `Item_ID` et des prix inventés — incompatibles avec ENF-05 (cohérence éco) et le persona (profondeur 200 %) |

## 8. Critères d'Acceptation de la Base

- [x] Chaque race possède un secteur identifié avec capitale, zones de chasse, donjon et route vers Alne.
- [x] Le graphe de liaisons est complet, symétrique et documenté en un point unique (atlas).
- [x] La logique de déplacement (exclusivité de groupe, exceptions HUB) est spécifiée avec ses cas limites.
- [x] Chaque mécanique ajoutée dispose de ses équivalents commande (Joueur / GM / IA).
- [x] Cahier des charges et README publiés à la racine.

## 9. Backlog Structurel (phases suivantes — hors périmètre base)

| Priorité | Tâche | Statut |
|---|---|---|
| P1 | Fiches détaillées des zones nouvellement référencées (Freelia, Lioda, Duskarn, Granzam, Brokkheim, Penwether + chasses/donjons/routes) au format `capitale_swilvane.md` | ✅ Étape 2 (2026-07-06) — 30 fiches |
| P1 | Tables MLD manquantes : `T_WA_GROUPS`, `T_SPAWN_TABLES`, `T_NPC`, `T_ZONE_LINKS` (détail des liaisons) | ✅ Étape 2 (2026-07-06) |
| P1-bis | Fiches manquantes des territoires « anciens » : Salamander (`SAL_DUN_001` Caldeira d'Obsidienne, `ROUTE_SAL_ALN`), Undine (`UND_HUNT_001/002`, `UND_DUN_001`, `ROUTE_UND_ALN`), Gattan (registre PNJ `NPC_GAT_*`) | ✅ Étape 3 (2026-07-07) — 7 fichiers |
| **P2** | **Chantier de renflouement conforme « ≥100 unités par type » — voir §10** (le pré-généré non validé ne clôt aucune ligne, D66) | ✅ **CLOS** (étapes 4-37 ; audit de conformité étape 36, équilibrage économique étape 37) |
| P2 | Détail MLD des mobs de donjons (plage réservée `MOB_<SEC>_030-034`) | ⏳ |
| P3 | Implémentation Node.js du bot (hors phase données) | 🚧 **LANCÉ PAR LE PE** (2026-07-11, étape 44) — chantier `bot/`, voir §11 |

> **⚠️ Le statut d'une tâche ne peut être ✅ que sur du contenu conforme validé** (§10). Un dossier pré-rempli par une session automatique reste **⏳/🚧 « à régénérer »**, jamais ✅ (D66).

## 10. Chantier de Renflouement Conforme (« ≥100 unités par type », directive PE 2026-07-07)

**Objet** : chaque type d'objet (PNJ, armes, skills, équipements par slot, matériaux, consommables, boutiques, faune, flore, quêtes) doit compter **au moins 100 unités conformes** (1 unité = 1 fichier, précision persona 200 %, chaînage éco ENF-05, cohérence SAO/ALO). **Le pré-généré non validé n'entre pas dans ce compte (D66).**

**Gabarits de conformité (source de vérité)** :
- **Items** (`ARM_*`/`WPN_*`/`CSM_*`/`MAT_*`) : ID séquentiel strict, 5 sections, grille de prix par tier, chaînage éco réel (D13-D15). Détail : `directives_generation/02_cdc_items.md`, `04`/`05`.
- **PNJ** : gabarit D17 (5 sections, budget QI, secret K3 non avoué), quotas de rôles D34. Détail : `directives_generation/01_cadrage_pnj.md`.
- **Boutiques** : **CDC-SHP-01** (`directives_generation/03_cdc_boutiques.md`) — 1 boutique par PNJ `MERCHANT`/`BLACK_MARKET`, règles **R1-R8** (R1 panier universel à la seule taverne · R2 exclusivité intra-ville, **allocation disjointe, 0 doublon `Item_ID`** · R3 ≥10 exclusifs mondiaux vs villes closes · R4 prix **lus sur les fiches item réelles** modulés LOCAL −20 %/IMPORT +40 % · R5 taille · R6 tiers, T4 équipement légal ≤2/ville · R7 rachat · R8 cohérence roster), matrice D36, chevauchement territorial D65, marché noir T4 D64. **0 `Item_ID` inexistant, 0 prix inventé.**

**Procédé de mise en conformité d'un lot pré-généré** : (1) le dossier pré-rempli est réputé **vide** (D66) ; (2) régénération **intégrale** par script outillé (extraction disque des familles conformes → catalogue, allocation disjointe assertée) ; (3) validation automatisée (comptage, unicité, prix multiples de 5, exclusivité) ; (4) l'original non conforme est archivé en `ressources_brutes/deprecated_v1/`.

### État de conformité (au 2026-07-11 — chantier §10 CLOS)

| Lot | Cible | Statut conforme | Reste (pré-généré à régénérer/auditer) |
|---|---|---|---|
| **PNJ** (Phase A) | 12 villes ×100 + 10 canoniques | ✅ validé (gabarit D17, quotas D34) | — |
| **Items I-1 consommables** `CSM_*` | 100 + 30 portage | ✅ validé | — |
| **Items I-2 armes** `WPN_*` | 100 / 13 familles | ✅ validé | — |
| **Items I-3 matériaux** `MAT_*` | 100 / 5 familles + bois | ✅ validé (normalisé ; `MAT_WOD_*` créé étape 31) | — |
| **Items I-4 skills** `MAG_`/`OSS_`/`PAS_` | 300 | ✅ validé (parasite 303 doublons archivé étape 36) | — |
| **Équipement tête** `ARM_TET_*` | 100 | ✅ validé | — |
| **Boutiques** (Phase C) | 11 villes | ✅ **11/11 validées** (C-1→C-5 puis 6 villes régénérées étape 25 : 160 boutiques, 1 128 articles, 0 `Item_ID` fabriqué, 0 doublon R2) | — |
| **Autres slots d'armure** (torse/jambes/bras/taille) | 4 ×100 | ✅ validé (étapes 26-27 ; junk co-résident archivé étape 36) | — |
| **Accessoires** (anneaux/capes/ceintures/colliers) | dérogation ≥100 gelée (D39 caduque) | ✅ clos (session post-étape 52) — 14 fiches archivées `ressources_brutes/deprecated_v1/accessoires/`, dossiers vides conservés | — |
| **Faune** `MOB_*` par territoire | 249+ (plages D6) | ✅ validé (256 fiches étape 28 ; legacy 223 archivé étape 36) | — |
| **Flore** `MAT_HRB_*`/nodes | 100 | ✅ validé (étape 27) | — |
| **Quêtes** `QST_*` | 34+ | ✅ validé (étapes 29/32/33/34 ; +22 side-quests d'affinité étape 43 → 79 au total) | — |
| **Social SOC-1→4** (étape 43) | emplois 66 / quêtes affinité 22 / décorations 36 / cadeaux noces | ✅ validé | reste : **auberge exploitable joueur** (backlog PE explicite, non rouvert) — taverniers dédiés et guildes de métier **résolus** (session post-étape 52) |

> **Lecture** : un ✅ n'est accordé qu'après validation par la méthode ci-dessus. **Le chantier §10 est clos** (audit de conformité étape 36 : 766 fichiers non conformes archivés, 0 collision d'ID ; équilibrage économique étape 37). `alo_context.md` / `alo_progression.md` tiennent l'état fin par étape.

## 11. Chantier P3 — Implémentation du bot (`bot/`, propriété PE)

**Décision PE (2026-07-11, actée étape 44)** : la phase P3 « implémentation Node.js » est **lancée et portée par le Producteur Exécutif lui-même**, en parallèle des sessions ACP. Le code vit dans `bot/` (Node.js 20+, `whatsapp-web.js`, PostgreSQL, Redis, ONNX Runtime, Docker/nginx/systemd), structuré selon les CDC `directives_generation/16-20` (NLU locale, spécialistes narratifs, orchestration runtime, moteur déterministe L1, sélection de modèles).

**Règles de gouvernance du chantier** :
1. La directive « zéro code » reste applicable **aux livrables ACP** (markdown/spéc), sauf demande explicite du PE sur `bot/`.
2. Les CDC 13-21 sont le **contrat de conformité** du code : frontière déterministe absolue (combat/éco/inventaire jamais neuronaux, L1 seul écrivain), statelessness, interface `generate()` agnostique, verrou K3/D22 à l'ingestion RAG.
3. Hygiène dépôt : `bot/.gitignore` exclut `node_modules/`, `.env` (secrets), `wa_session/` (session WhatsApp authentifiée), `models/*.onnx` ; seuls sources, configs et petits artefacts d'inférence sont versionnés.
4. Réserve toujours ouverte avant lancement public : **audit des CGU des API gratuites** (Groq, Gemini, Cerebras, OpenRouter…) — étape 39.
