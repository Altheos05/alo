# Changelog — Projet ALO

Toutes les versions notables du projet, construites à partir de l'historique git réel (`git log`, dépôt local `main`) et enrichies par le journal narratif (`alo_progression.md`) et le registre de décisions (`registre_decisions.md`). Format inspiré de [Keep a Changelog](https://keepachangelog.com/) ; catégories adaptées à un projet de worldbuilding : **Ajouté / Modifié / Corrigé / Retiré / Décisions**.

Le projet suit une numérotation `0.x.y` tant qu'il n'est pas lancé publiquement (le backlog documente explicitement un audit CGU des API gratuites comme préalable au lancement — voir §« Vers 1.0.0 » en fin de fichier). **MINOR** = clôture d'un chantier/phase majeur déclaré par le projet lui-même ; **PATCH** = corrections/itérations à l'intérieur d'un chantier déjà ouvert.

> **Note de fiabilité des hachages** : certains hachages de commit cités dans `alo_progression.md`/`alo_context.md` pour les étapes 44-48 (ex. `1940f57`, `b0ab4dd`, `ca315f1`, `9d4143a`, `aa4386b`, `3ddf391`) ne correspondent à **aucun objet de l'historique git actuel** — le dépôt porte les traces d'une réécriture d'historique (`refs/original/refs/heads/main` présent, cf. commit `26a7e57` « nettoie .gitignore et synchronise l'index »). Ce changelog cite exclusivement les hachages **réels et résolvables aujourd'hui** sur `main` ; la correspondance de contenu avec les anciennes citations a été vérifiée narrativement, pas par hachage.

---

## [Non publié] — sujets de service (étape 55, 2026-09-17)

Travail effectué mais **non commité** au moment de la rédaction de ce changelog — voir `git status`.

### Modifié
- **Sujets de service (D84)** : sur les ~30 verbes dédiés de la §21 `whatsapp_commands_list.md` (services de Capitale Alne), ~21 deviennent des sujets `!demander [NPC] [sujet]` (K0/K1) déclenchant leur primitive `SYS_*` déjà existante ; **13 gardent une commande dédiée** — 3 mécaniques à point d'accès multiple (réputation, sertissage de gemme, tutoriel) et **10 archétypes déjà répliqués dans 2 à 5 autres villes**, trouvés par vérification croisée *après* le diagnostic initial (`!voyage`, `!raid_register`, `!mount_rent`, `!sharpen`, `!fence`, `!oracle`, `!memorial`, `!laundry`, `!loan`, `!heal`). Nouveau §2-bis dans `npc_knowledge_protocol.md`, colonnes `is_service`/`service_sys_command`/`service_cost_yrds` sur `T_NPC_KNOWLEDGE`, 26 fiches PNJ d'Alne mises à jour.

### Retiré
- `!buy_info`/`!buy_silence` — redondants avec le K2 `PAY:<N>` déjà supporté, aucune extension nécessaire.

### Décisions
- **D84** — Sujets de service.

### Note méthodologique
Le diagnostic initial (étape 54) n'avait vérifié la duplication de verbe qu'à l'intérieur du roster d'Alne. La conversion mécanique a été interrompue à deux reprises (correction de scope envoyée à un agent en cours d'exécution, puis limite de session) ; à la reprise, l'état réel des fichiers a été vérifié par `git diff` avant de continuer plutôt que supposé — un seul fichier converti par erreur (`heal`/Osmé) a été restauré.

---

## [0.12.0] — 2026-09-17 — Menu contextuel numéroté (D83)

**Commit** `b2be09d` — *« Étape 54 : menu contextuel numéroté (D83) »*

### Ajouté
- **Menu contextuel numéroté** : `system_mechanics/menu_contextuel_protocol.md` + table `T_PENDING_MENUS` — couche de présentation 100% déterministe (pré-NLU), diagnostic UX (skill `codebase-design`) sur la surface de ~190-200 commandes joueur. Après un tour de combat/dialogue/boutique/mouvement/tableau de quêtes, 1-8 options numérotées résolues par L1 + `9` aide universelle ; résolution par citation ou chiffre nu (TTL par contexte). Coexiste avec toutes les commandes texte existantes, aucune retirée. Commandes `!menu`/`!sys_menu_force`/`SYS_MENU_RENDER`, pipeline amendé d'un « étage 0 ».

### Corrigé
- Fusion de paragraphes ratée dans `alo_context.md` (le texte de l'ancienne entrée étape 52 était resté accroché à la fin du paragraphe étape 53, introduite par erreur pendant la session précédente) → scindée en deux entrées distinctes.

### Décisions
- **D83** — Menu contextuel numéroté.

---

## [0.11.0] — 2026-09-17 — Backlog documentaire clos + registre de décisions

**Commit** `fedf152` — *« Étape 53 : backlog documentaire clos (D80) + registre de décisions + changelog »*

### Ajouté
- `registre_decisions.md` — registre consolidé de toutes les décisions `D1`–`D82` + familles `D-SOC/IA/RAG/NLU/SPE/ORC/DET/MOD/P3`, avec source/étape/statut. Remplace le grep manuel pour toute allocation future de numéro.
- `CHANGELOG.md` — ce fichier.
- Registre de « guildes de métier » hors `T_GUILDS` (`table_t_guilds.md` §5) : `GUILDE_LEP_FORGES`, `GUILDE_SPR_TRESORS`, `GUILDE_CARAVANIERS`.
- Zone `ZONE_ROUTE_LUGRU` (Corridor Souterrain de Lugru) dans l'atlas — raccourci direct Sylph ↔ Alne, point ouvert depuis l'étape 2.
- Commandes `!sys_rag_reindex [scope]` / `SYS_RAG_REINDEX(scope)` propagées dans les registres GM/IA (spécifiées depuis l'étape 40, jamais propagées).

### Modifié
- Trigger `L4` de `T_ZONE_LINKS` : `requires_flight` dépend désormais de `link_type='FLY'` et non plus de l'étiquette `Type=ROUTE` de la zone.
- `JOB_HOS_012`/`JOB_HOS_013` (taverniers Brokkheim/Penwether) : statut « en attente » entériné en solution définitive — aucun nouveau PNJ créé.
- `JOB_LOG_002/012/013` : employeur `guild` référence désormais un ID de guilde de métier stable au lieu d'un `guild_uuid` en attente.

### Corrigé
- Collision de numérotation **D45/D46** (deux décisions distinctes par numéro) → renumérotées **D81/D82**.
- Bloc de journal dupliqué mot pour mot (« ÉTAPE 11 »/« ÉTAPE 12 » présentes deux fois dans `alo_progression.md`) → dédupliqué.
- Citation croisée D13/D15 dans `02_cdc_items.md` (grille de prix attribuée au mauvais numéro).

### Retiré
- 14 fiches d'accessoires (`anneaux/ceintures/colliers/capes`) → archivées dans `ressources_brutes/deprecated_v1/accessoires/` (conséquence de D39, actée depuis l'étape 10-quater mais jamais exécutée).

### Décisions
- **D80** — Corridor Souterrain de Lugru formalisé + correction du trigger L4.

---

## [0.10.0] — 2026-08-10 — Patterns de rareté et de drop (D77–D79)

**Commit** `6a56305` — *« Étapes 50-52 : dépeçage par partie (D78) + variants de créature (D79) »*

### Ajouté
- Récolte par partie (dépeçage) sur les **16 boss nommés** du jeu (9 territoriaux + 7 d'axe vertical) : section « Parties Récoltables » par fiche, seuils de phase HP déjà écrits réutilisés comme déclencheur.
- Variant de créature commune (pattern P5) sur les 256 mobs communs : résolution paramétrique à l'instanciation (roll 5% par défaut), zéro nouveau fichier ni nouvelle ligne `T_SPAWN_TABLES`.
- Commandes `!sys_carve_set`/`SYS_SET_CARVE_TABLE`, `!sys_variant_rate`/`SYS_SET_VARIANT_RATE`.

### Modifié
- Rareté d'obtention découplée du Tier pour les créations futures (sans rétroaction sur le contenu déjà clos).

### Décisions
- **D77** (rareté ≠ tier), **D78** (récolte par partie, = `D-DET-5`), **D79** (variant de créature, = `D-DET-6`).

### État de sortie
Chantier ouvert par l'étude `23_etude_patterns_rarete_drop.md` (D77-D79) entièrement clos, aucun arbitrage PE en attente sur ce sujet.

---

## [0.9.2] — 2026-07-13 — Nettoyage du dépôt

**Commit** `26a7e57` — *« chore: nettoie .gitignore et synchronise l'index »*

### Retiré
- `directives_generation/`, `directives_generiques/`, `ressources_brutes/`, `system_persona_architecte.md` et fichiers de méthodologie retirés du suivi git (restent sur disque, non versionnés). *(C'est cette opération qui explique la note de fiabilité des hachages en tête de fichier.)*

---

## [0.9.1] — 2026-07-12 — Réalignement des docs maîtres sur le pivot territorial

**Commit** `a957744` — *« Étape 48 : réalignement docs maîtres sur le pivot territorial WA (D76) »*

### Modifié
- `zone_movement_protocol.md` passe en **v2.0** : invariant R0 reformulé (`card(TERRITOIRE ∪ INSTANCE) = 1`), synchro par retrait (`sync_player_groups()`).
- Atlas amendé : §2-bis = registre maître des 13 territoires, taxonomie de groupes refondue, budget **26 permanents / ~74 slots dynamiques**.
- `cahier_des_charges.md`, README, registres de commandes réalignés sur D76 (incohérence 16/29/71 → 26/74 corrigée).

### Corrigé
- Divergence entre les docs maîtres (encore en logique « 1 zone = 1 groupe ») et le pivot territorial déjà en production, détectée à l'étape 47 et résorbée ici.

---

## [0.9.0] — 2026-07-11 — Pivot territorial WhatsApp (D76), mise en œuvre initiale

**Commits** `da15de1`, `2102720`, `adde15f`, `41f9be8`

### Ajouté
- **Hall de Guilde d'Alne** (`ZONE_NEU_CAP_001`) avec 4 PNJ : Aldric (Maître de Guilde), Bryn (Forgeronne), Élara (Quêtatrice), Selma (Greffière).
- Réorganisation des groupes WhatsApp par **territoire** plutôt que par zone (D76, décision produit PE) — mouvement géré par retrait/ajout de groupe au franchissement de frontière territoriale.

### Corrigé
- 18 apostrophes mal échappées dans le corpus de fiches d'axe vertical.

### Modifié
- README mis à jour (architecture complète, WA par territoires, guilde, audit).

### Décisions
- **D76** actée côté produit (PE) à cette étape ; formalisation documentaire complète repoussée à la version suivante (divergence docs/code détectée en fin de cycle).

---

## [0.8.0] — 2026-07-11 — Audit de conformité `bot/` (cycle R1 → nR15)

**Commits** `f68567e` → `cbf51f8` (17 commits, même journée) : `f68567e`, `2fe4310`, `ad32e00`, `eead5ea`, `4e32b6b`, `7ffe38a`, `a312002`, `d91aac7`, `a0e77c9`, `da7131f`, `124cba1`, `c7ee710`, `6b262da`, `35e1a4c`, `958cc53`, `24798e2`, `cbf51f8`

Cycle intensif d'audits ACP / corrections PE sur le code du bot (`bot/`), fraîchement ouvert (v0.7.0). Chaque « vague » PE est contre-auditée par exécution avant d'être déclarée close.

### Corrigé (findings clos au fil du cycle)
- **R1** — verrou D22 (fil méta) absent du pipeline QI.
- **R2** — `combat.onnx` : résolution de dégâts ML entraînée et chargée en dormant (violait la frontière déterministe D-DET-1).
- **R3** — économie sans verrou anti-duplication (contrôles hors transaction).
- **nR1-nR4** — filtre `k_level` cassé, quotas jamais réapprovisionnés, script `run_all.sh` cassé.
- **nR5-nR10** — trous d'autorisation `SYS_*`, 5/5 commandes `SYS_*` inopérantes (schéma imaginaire), combat cassé à 100% (`zone_id` inexistant sur `T_MONSTERS_DICT`), gazetteer HS, lock advisory en autocommit.
- **nR11-nR15** — `t_avatars.role` inexistant (GM cassé), `T_SPAWN_TABLES` à 0 ligne (bloqueur gameplay n°1, résolu à 257/257 en fin de cycle), axe vertical déversé dans une seule zone de chasse (boss niveau 1 chassables), base non régénérée par doublons `ON CONFLICT DO NOTHING`.

### Ajouté
- Pipeline `SYS_*` en 6 étapes (parse → D71 → prérequis → autorisation → lock → exécution).
- Index vectoriel RAG (1 243 chunks), grounding + anti-injection, gazetteer nom→ID branché.
- Suite de tests d'intégration (31 tests, `bot/tests/integration.mjs`).

### État de sortie
**0 finding ouvert** en fin de cycle ; combat fonctionnel de bout en bout pour la première fois sur les 8 zones peuplées. Dette résiduelle non bloquante : gating K2/L1, parseur QI, P2 RAG fiches+e5, sanitizer, dettes corpus AIN/YGG (transférées à la version suivante).

---

## [0.7.0] — 2026-07-11 — Ouverture de la phase P3 (implémentation bot)

**Commit** `55570c7` — *« étape 44 — régularisation P3 : chantier bot/ officialisé »*

### Ajouté
- `bot/` : Node.js 20 + `whatsapp-web.js` + PostgreSQL/Redis + ONNX (modèles intent/NER/combat entraînés), Docker/nginx/systemd — chantier lancé et porté par le Producteur Exécutif lui-même.

### Modifié
- Persona §5.1 amendé : la clause « zéro code » ACP reste en vigueur **hors `bot/`** ; `bot/` devient territoire PE (CDC §11).
- `cahier_des_charges.md` §9/§10 réalignés (chantier de renflouement P2 clos).

### Décisions
- **D-P3-1** (`bot/` = propriété PE, CDC 13-21 = contrat de conformité), **D-P3-2** (artefacts `.onnx` non versionnés).

---

## [0.6.0] — 2026-07-11 — Architecture IA et systèmes sociaux

**Commit** `8ef9e3f` — *« étapes 38-43 — CDC IA (13-20), systèmes sociaux (21_cdc + 4 tables MLD + 124 fiches SOC), persona §5 »*

### Ajouté
- Études d'architecture IA : constellation multi-spécialistes (`D-IA-1→6`), stack hybride 100% gratuite en cascade C1-C4 (`D-IA-7→12`), fondation RAG (`D-RAG-1→9`), compréhension locale ONNX (`D-NLU-1→5`), spécialistes narratifs (`D-SPE-1→5`), orchestration runtime (`D-ORC-1→7`), moteur déterministe L1 (`D-DET-1→4`), sélection de modèles francisée (`D-MOD-1→6`).
- Systèmes sociaux complets (`D-SOC-1→14`) : mémoire relationnelle PNJ, housing (achat/location), mariage (homme+femme, monogame), emploi salarié, guildes — 4 nouvelles tables MLD (`T_NPC_RELATIONS`, `T_PROPERTIES`, `T_MARRIAGES`+`T_MARRIAGE_ASSETS`, `T_JOBS_DICT`+`T_AVATAR_JOB`).
- **124 fiches de contenu** : 66 emplois, 22 quêtes d'affinité, 36 décorations, table des cadeaux de noces.

### Modifié
- Persona amendé §5 : 4ᵉ pilier de game design (social/vie de joueur), doctrine IA (frontière déterministe absolue).

---

## [0.4.0] — 2026-07-10 — Équilibrage économique (étape 37)

**Commit** `51cf0d1` — *« equilibrage economique etape 37 — balance sheet v2.0, rewards T5/legendaires, rapport »*

### Modifié
- Balance sheet v2.0 (prix réels calibrés), drop rates formalisés (grille simple par type/tier), récompenses de quêtes T5 (5 000→8 000 EXP + 500 Yrds) et légendaires (8-10k→50k EXP + 2-5k Yrds + titres) — 28 fichiers modifiés.

### Décisions
- **D72** (prix catalogue = autorité), **D73** (grille de drop rates simple), **D74** (récompenses T5/légendaires modestes, gain réel fonctionnel), **D75** (package de départ standard).

### État de sortie
Dernier chantier transverse de la « phase données » — **phase données officiellement close** à l'issue de cette version (CDC §10 ✅).

---

## [0.3.0] — 2026-07-10 — Audit de conformité (étape 36)

**Commit** `dd70dbb` — *« audit conformité étape 36 — purge skills parasite, rapport consolidé »*

### Retiré
- **766 fichiers non conformes archivés** au total sur l'audit (junk armures 240, faune legacy 223 `mobs_sauvages/`, parasite skills 303) → `ressources_brutes/deprecated_v1/` — 0 collision d'ID résiduelle.

### Décisions
- **D71** — la clé canonique d'un item/entité est son `Item_ID` interne, jamais le nom de fichier (décision la plus citée transversalement du projet par la suite).

---

## [0.2.0] — 2026-07-10 — Régénération Phase C + Skills 300/300

**Commit** `103846a` — *« feat: Phase C 11/11 boutiques régénérées + CDC-06 skills 300/300 »* (4 444 fichiers modifiés, +108 648/−25 306 lignes)

### Ajouté
- **Boutiques** : 11/11 villes régénérées conformément au CDC-SHP-01 (matrice de différenciation zonale D36).
- **Skills** : 300/300 (`MAG_*`/`OSS_*`/`PAS_*`) — 10 écoles de magie × 10 sorts, 100 OSS (10 familles), 100 passives.

### Retiré
- Contenu hérité non conforme lié aux boutiques/skills pré-génération (junk `wpn_`/`mat_`/skills racine).

---

## [0.1.0] — 2026-07-08 — Fondations

**Commit** `3da2976` — *« feat: initial commit — ALO worldbuilding data »* (1 844 fichiers, +117 519 lignes)

Première version versionnée dans git. Capture l'essentiel du contenu produit lors des toutes premières étapes : cartographie complète (9 territoires raciaux + Alne + axe vertical Yggdrasil/Jötunheimr/New Aincrad), rosters PNJ (Phase A), premiers lots d'items/armures/matériaux/consommables, magies, faune, quelques boutiques, système de persona ACP (`system_persona_architecte.md`).

### Ajouté
- Atlas et graphe de zones (`atlas_monde_liaisons.md`, `T_ZONE_LINKS`), conventions d'ID (`D1`-`D9`).
- Rosters PNJ de capitale (D16-D22 : plages de numérotation, gabarit de fiche, pare-feu informationnel, rencontres canoniques, verrou du fil méta).
- Premiers lots d'équipement, matériaux, magies, faune.

> **Contient encore du contenu hérité non conforme** à ce stade (`mobs_sauvages/` 223 fichiers, `boss_aincrad/` legacy, junk d'armures) — purgé en v0.3.0 (D66, D71).

---

## Vers 1.0.0

Le projet se considère lui-même en phase de **pré-lancement**. D'après le backlog documenté dans `alo_context.md`, les conditions avant une version `1.0.0` (lancement public) incluent au minimum :
- Audit CGU des API IA gratuites utilisées (Groq, Gemini Flash, Cerebras, Cloudflare, OpenRouter, Mistral, HuggingFace, GitHub Models) — réserve posée dès l'étape 39, jamais levée.
- Correction complète des dettes résiduelles de `bot/` (gating K2/L1, parseur QI, P2 RAG fiches+e5, sanitizer FR) — propriété PE, hors périmètre ACP sauf demande explicite.
- Décision produit sur l'auberge exploitable par un joueur (actuellement en report PE explicite, non rouverte à l'étape 53).

Voir `registre_decisions.md` pour le détail décisionnel et `alo_progression.md` pour le journal complet étape par étape (plus fin que ce changelog, qui reste à l'altitude « version »).
