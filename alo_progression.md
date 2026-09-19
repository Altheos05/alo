# 📈 ALO_PROGRESSION — Journal d'Avancement

> **Rôle** : historique des étapes et modifications. Une entrée par modification/étape. Ne jamais supprimer d'entrées.
> Complément : l'état courant synthétisé vit dans `alo_context.md`.

---

## ÉTAPE 1 — Établissement de la base structurelle ✅ (2026-07-06)

**Objectif** : découpage/liaison de toutes les zones, logique de déplacement, registres de commandes, cahier des charges, README. Contraintes : zéro code, purement structurel.

### Modifications

| # | Action | Fichier |
|---|---|---|
| 1.1 | ➕ Créé — Atlas maître : conventions ID, taxonomie groupes WA, disposition radiale, 9 frontières, registre complet des zones (9 territoires × 5 zones + axe Alne/Yggdrasil/Jötunheimr/New Aincrad), graphe mermaid, règles d'intégrité L1–L6, équivalents commandes | `données/cartographie/atlas_monde_liaisons.md` |
| 1.2 | ➕ Créé — Protocole de déplacement : invariant R0 (1 joueur = 1 lieu), règles R0–R10, machine à états atomique, 7 méthodes de déplacement, 6 cas limites, tableau des équivalents commandes | `données/the_seed_engine/system_mechanics/zone_movement_protocol.md` |
| 1.3 | ✏️ Modifié — Ajout `!where`, alias `!marcher`/`!voler`, règle d'exclusivité en §3 ; ajout GM `!sys_sync`, `!sys_zone_link/unlink`, `!sys_zone_lock` en §1 | `données/the_seed_engine/whatsapp_commands_list.md` |
| 1.4 | ✏️ Modifié — Ajout `SYS_CONNECT_ZONES`, `SYS_DISCONNECT_ZONES` (§1), `SYS_SYNC_PRESENCE` (§1) | `données/the_seed_engine/ai_orchestrator_commands.md` |
| 1.5 | ➕ Créé — Cahier des charges : vision, périmètre, acteurs, EF-01→EF-10, ENF-01→ENF-06, décisions D1–D5, critères d'acceptation (tous ✅), backlog P1–P3 | `cahier_des_charges.md` |
| 1.6 | ➕ Créé — README : documents maîtres, arborescence, conventions, règles d'or, état d'avancement | `README.md` |
| 1.7 | ➕ Créé — Fichiers de mémoire de session (cache d'état + journal) | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D1** : Gattan (`ZONE_SAL_CAP_001`) = capitale Salamander ; Voulg requalifiée `ZONE_SAL_TWN_001` (conflit de fichiers résolu, aucun ID cassé).
- **D2** : disposition radiale, frontières = paires `HUNT_002` (anneau SAL↔SYL↔CAI↔PUC↔UND↔LEP↔IMP↔SPR↔GNO↔SAL).
- **D3** : New Aincrad — groupes persistants uniquement pour Palier 1 + palier de front ; boss = instances éphémères.
- **D4** : taxonomie groupes — LOCATION/INSTANCE exclusifs ; HUB_CHAT/GUILD/PARTY/SYSTEM jamais auto-quittés.
- **D5** : capitales nommées — Penwether (SPR), Lioda (PUC), Duskarn (IMP), Granzam (GNO), Brokkheim (LEP).

### État de sortie

Base validée (critères d'acceptation du cahier des charges tous cochés). Aucun ID existant modifié.

---

## ÉTAPE 2 — Backlog P1 : fiches zones + tables MLD ✅ (2026-07-06)

**Objectif** : 30 fiches de zones (6 territoires × 5) au format `capitale_swilvane.md` + 4 tables MLD + propagation complète.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 2.1 | ➕ Créé — Territoire Cait Sith : Freelia (réutilise `NPC_FRE_01-07`), Savane des Crocs, Collines de l'Ouest, Tanière du Roi Béhémoth (`BOSS_CAI_DUN_001` Ragnar), mobs `MOB_CAI_001-026` | `cartographie/territoires_raciaux/caitsith/` (4 fiches) |
| 2.2 | ➕ Créé — Territoire Puca : Lioda (`NPC_LIO_01-07`), Prairies Chantantes, Bois des Échos, Amphithéâtre Oublié (`BOSS_PUC_DUN_001` Ondaro, mécanique de tempo), mobs `MOB_PUC_001-026` | `cartographie/territoires_raciaux/puca/` (4 fiches) |
| 2.3 | ➕ Créé — Territoire Imp : Duskarn (`NPC_DUS_01-07`), Canyon des Ombres, Falaises du Crépuscule, Caverne des Hurleurs (`BOSS_IMP_DUN_001` Skreech, jauge de Vacarme anti-MAJUSCULES), mobs `MOB_IMP_001-026` | `cartographie/territoires_raciaux/imp/` (4 fiches) |
| 2.4 | ➕ Créé — Territoire Gnome : Granzam (`NPC_GRA_01-07`), Steppes de Granit, Carrières Brisées (réutilise les mobs `mob_gnome_*.md`), Mine de Mithril (`BOSS_GNO_DUN_001` Mithrandur), mobs `MOB_GNO_001-026` | `cartographie/territoires_raciaux/gnome/` (4 fiches) |
| 2.5 | ➕ Créé — Territoire Leprechaun : Brokkheim (`NPC_BRO_01-07`), Vallée des Geysers, Champs de Scories, Atelier Englouti (`BOSS_LEP_DUN_001` MK-0, sections nagées), mobs `MOB_LEP_001-026` | `cartographie/territoires_raciaux/leprechaun/` (4 fiches) |
| 2.6 | ➕ Créé — Territoire Spriggan : Penwether (`NPC_PEN_01-07`), Ruines Noires, Terres Grises, Nécropole Antique (`BOSS_SPR_DUN_001` Pennroth, salles illusoires), mobs `MOB_SPR_001-026` | `cartographie/territoires_raciaux/spriggan/` (4 fiches) |
| 2.7 | ➕ Créé — 6 routes aériennes (mobs `MOB_AIR_001-004` partagés) : Freelia, Lioda, Duskarn, Granzam, Brokkheim, Penwether → Alne | `cartographie/routes_aeriennes/route_*_alne.md` (6 fiches) |
| 2.8 | ➕ Créé — 4 tables MLD : `T_WA_GROUPS` (55 groupes seed, triggers T1-T4), `T_ZONE_LINKS` (80 liaisons seed, symétrie L1 par construction), `T_SPAWN_TABLES` (budget de zone ≤ 100%), `T_NPC` (correspondance préfixes↔zones actée) | `cardinal_system_db/MLD_Logic/table_t_{wa_groups,zone_links,spawn_tables,npc}.md` |
| 2.9 | ✏️ Modifié — Règle de complétude : ajout GM `!sys_spawn_set`, `!sys_npc_move` ; IA `SYS_ADJUST_SPAWN`, `SYS_MOVE_NPC` | `the_seed_engine/whatsapp_commands_list.md`, `ai_orchestrator_commands.md` |
| 2.10 | ✏️ Modifié — Atlas : coches « fiches existantes ✅ (étape 2) » sur §4.4/4.5/4.7/4.8/4.9/4.10 + renvoi vers `T_ZONE_LINKS`/`T_WA_GROUPS` en en-tête | `cartographie/atlas_monde_liaisons.md` |
| 2.11 | 🔧 Corrigé — 2 incohérences détectées : `capitale_swilvane.md` listait une liaison directe `ZONE_CAI_HUNT_001` absente de l'atlas (supprimée) ; `zone_chasse_foret_lugru.md` omettait la frontière `ZONE_CAI_HUNT_002` de l'atlas (ajoutée). Reste à arbitrer : `ZONE_ROUTE_LUGRU` (corridor souterrain cité par la fiche Lugru, hors atlas) | `sylph/capitale_swilvane.md`, `sylph/zone_chasse_foret_lugru.md` |
| 2.12 | ✏️ Modifié — Backlog mis à jour (P1 ✅, création P1-bis), état d'avancement README (18 tables MLD, 8 territoires) | `cahier_des_charges.md`, `README.md` |

### Décisions actées

- **D6** : plages d'ID mobs par secteur — `001-004` périphérie capitale, `010-013` HUNT_001, `020-026` HUNT_002 (025 mini-boss, 026 boss de zone), `030-034` réservée donjons ; boss de donjon = `BOSS_<SEC>_DUN_001`.
- **D7** : PNJ de capitale = `NPC_<VILLE>_01-07` ; PNJ de zones annexes = préfixe capitale, numérotation `10+` ; `NPC_GAT_*` réservé (fiche à produire).
- **D8** : mobs aériens `MOB_AIR_001-004` partagés par les 9 routes (pas de duplication par secteur).
- **D9** : `T_ZONE_LINKS` = source de vérité du graphe ; `T_ZONES.connected_zones` devient vue dénormalisée (trigger T5).
- **D10** : chaque donjon territorial a une mécanique signature exploitant WhatsApp (tempo Puca, Vacarme Imp, illusions Spriggan, tremblements Cait Sith, souffle Leprechaun, magnétisme Gnome).

### État de sortie

8 territoires sur 9 entièrement fichés (reste Undine + compléments Salamander → P1-bis). Graphe 100% conforme atlas, aucune liaison orpheline (vérification faite fiche par fiche). 4 nouvelles tables MLD alignées sur les conventions existantes.

---

## ÉTAPE 3 — Backlog P1-bis : compléments Salamander/Undine ✅ (2026-07-07)

**Objectif** : dernières fiches manquantes (donjon + route Salamander, 4 zones Undine) + registre PNJ Gattan. Résultat : **9 territoires sur 9 entièrement fichés**.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 3.1 | ➕ Créé — Caldeira d'Obsidienne (`ZONE_SAL_DUN_001`) : 3 anneaux, boss `BOSS_SAL_DUN_001` **Logi, le Dernier Géant de Braise** (chaîné au lore de la Désolation de Magma et de la Grande Forge), mécanique signature **jauge de Surchauffe** (anti-spam : chaque message chauffe l'instance, D11) | `salamander/donjon_caldeira_obsidienne.md` |
| 3.2 | ➕ Créé — Route Gattan–Alne (`ZONE_ROUTE_SAL_ALN`) : mobs `MOB_AIR_001-004` partagés (D8), lore du blocus d'Eugene | `routes_aeriennes/route_gattan_alne.md` |
| 3.3 | ➕ Créé — Lac Cristallin (`ZONE_UND_HUNT_001`, Tier 1) : porte les mobs « périphérie CAP » `MOB_UND_001-004` (contrat T2 de `T_SPAWN_TABLES` — pas de fiche CAP cartographique) + `MOB_UND_010-013` (legacy `mob_undine_0.md` requalifié), PNJ `NPC_UND_10` (Pêcheuse Maëlle) ; chaînage éco : Sable d'Océan → Forge de Cristal de Finbar | `undine/zone_chasse_lac_cristallin.md` |
| 3.4 | ➕ Créé — Marais de Brume (`ZONE_UND_HUNT_002`, Tier 3, frontières PUC/LEP) : `MOB_UND_020-026` (025 Hydre Juvénile mini-boss, 026 Brumaire boss de zone 6h ; legacy `mob_undine_1/2/4.md` requalifiés), PNJ `NPC_UND_11` (Morgane), condition météo « Brouillard Épais » | `undine/zone_chasse_marais_brume.md` |
| 3.5 | ➕ Créé — Gouffre de Léviathan (`ZONE_UND_DUN_001`, **Tier 5 sous-marin**) : boss `BOSS_UND_DUN_001` **Jörmun** (200k HP, 5 barres), mécanique signature **jauge d'Apnée** individuelle (chaque action = oxygène, `!respirer` en poche d'air, D11), sorts de feu désactivés, chaînage éco : Potion d'Oxygène de Coralia (`NPC_UND_07`) ; complétion = condition d'enseignement de Thalassa (`NPC_UND_01`) | `undine/donjon_gouffre_leviathan.md` |
| 3.6 | ➕ Créé — Route Archipel–Alne (`ZONE_ROUTE_UND_ALN`) : clause anti-péage de Thalassa, pirates du Grain Blanc | `routes_aeriennes/route_archipel_alne.md` |
| 3.7 | ➕ Créé — **Registre PNJ Gattan** `NPC_GAT_01-07` (Kagemune, Graz, Mortis, Pyra, Mortifer, Volcanus, Ferro) avec stats, secrets inavouables et répliques ; Eugene = hologramme sans ID (convention Alicia Rue) ; `is_essential` : GAT_01 et GAT_06 | `lore_mecaniques/geographie_villes/gattan_territoire_salamander.md` |
| 3.8 | 🔧 Corrigé — Incohérence de nommage : `capitale_gattan.md` et `zone_chasse_desolation_magma.md` appelaient `ZONE_SAL_DUN_001` « Donjon de la Fournaise Éternelle » ; aligné sur l'atlas (maître) → « Caldeira d'Obsidienne » | `salamander/capitale_gattan.md`, `salamander/zone_chasse_desolation_magma.md` |
| 3.9 | ✏️ Modifié — Table PNJ de Gattan passée au format Freelia (colonne ID `NPC_GAT_*`) + renvoi fiche lore ; « Forgeron Ambulant » nommé **Ferro le Colporteur** (`NPC_GAT_07`) | `salamander/capitale_gattan.md` |
| 3.10 | ✏️ Modifié — `T_NPC` §4 : ligne `NPC_GAT_*` ajoutée (réservation levée), exemples `NPC_UND_10/11` dans la règle « 10+ » ; `T_SPAWN_TABLES` §4 : couverture UND + `BOSS_SAL_DUN_001`, routes 9/9 | `table_t_npc.md`, `table_t_spawn_tables.md` |
| 3.11 | ✏️ Modifié — Règle de complétude (jauges D11/D12) : Joueur `!respirer` (§5), GM `!sys_env_set [Zone_ID] [Param] [Valeur]` (§1) ; IA `SYS_SET_ENV_HAZARD(Zone_ID, Param, Valeur)` (§1) | `whatsapp_commands_list.md`, `ai_orchestrator_commands.md` |
| 3.12 | ✏️ Modifié — Atlas : coches §4.3 (Salamander complet) et §4.6 (Undine complet, CAP = fiche lore) ; cahier des charges : P1-bis ✅ + décisions D11/D12 ; README : 9/9 territoires + ligne registres PNJ | `atlas_monde_liaisons.md`, `cahier_des_charges.md`, `README.md` |

### Décisions actées

- **D11** : mécaniques signatures des 2 donjons restants (D10 couvre désormais 9/9) — Caldeira = jauge de **Surchauffe** partagée (anti-spam : +2 Chaleur/message, éruption à 100) ; Gouffre = jauge d'**Apnée** individuelle (−2 O₂/action, `!respirer` +50 en poche d'air, noyade à 0).
- **D12** : paramètres environnementaux unifiés (`OXYGEN`, `HEAT`, `DOT`) pilotés par une commande générique unique — GM `!sys_env_set`, IA `SYS_SET_ENV_HAZARD` — extensible (froid Jötunheimr, etc.).
- Boss nommés : `BOSS_SAL_DUN_001` = Logi (géant de feu resté après la bataille de la Désolation — chaînage lore) ; `BOSS_UND_DUN_001` = Jörmun (Tier 5, 200 000 HP — donjon territorial le plus dur, conforme atlas).
- Périphérie CAP Undine : faute de fiche cartographique de capitale (lore seul), les mobs `MOB_UND_001-004` sont **rattachés à `UND_HUNT_001`** en application du contrat T2 de `T_SPAWN_TABLES`.

### État de sortie

9/9 territoires complets (45 zones raciales + axe vertical), 9/9 routes aériennes, 10/10 registres PNJ de capitales. Symétrie L1 vérifiée (les fiches frontalières PUC/LEP d'étape 2 listaient déjà `UND_HUNT_002`) ; plus aucune référence à l'ancien nom « Fournaise Éternelle ». Reste ouvert (étape 2, 2.11) : arbitrage `ZONE_ROUTE_LUGRU`. Prochaine étape = backlog P2.

---

## ÉTAPE 4 — Renflouement massif des données (P2+), lot 1 : Équipements de Tête ✅ (2026-07-07)

**Objectif** : directive Producteur Exécutif — porter chaque type d'objet à ≥100 unités (1 unité = 1 fichier, descriptions type fandom, précision persona 200%, cohérence SAO/ALO). Lot 1 = slot Tête (exemple explicite de la directive).

### Constat d'entrée (audit)

Les données générées antérieurement (`arm_XXX_<hash>`, `npc_XXX_*`, `mag_sup_*`, mobs `zones_neutres`…) violaient le persona : ID à hash aléatoires (contra §2.3), lore générique d'une ligne, **zéro chaînage économique** (contra §3.1), combinaisons de noms aléatoires. Comptage leaf : tete 25 (non conformes), boucliers_armure 0, oss/masse 0, passives 11, flore par race 0, pnj/gardes 0…

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 4.1 | 📦 Archivé — les 25 fiches tête non conformes déplacées (rien n'est supprimé) | `ressources_brutes/deprecated_v1/armures_tete/` |
| 4.2 | ➕ Créé — **100 fiches d'équipement de tête** `ARM_TET_001-100`, format persona complet : Identification Cardinal (ID séquentiel strict, tier, rareté, affinité raciale), table de stats (DEF/RES/poids/durabilité/pénalité de vol/bonus signature), **Acquisition & chaînage économique** (recette → drops `MOB_<SEC>_NNN` conformes aux plages D6, artisans PNJ réels `NPC_GAT_01/02`, `NPC_BRO_01/03`, `NPC_DUS_01/02`, `NPC_FRE_04/10`, `NPC_GRA_03`, `NPC_UND_10/11`, prix Yrds par grille de tier), lore fandom 2-4 phrases avec accroche, ligne Intégration Bot | `données/items_equipements/armures/tete/arm_tet_001…100_*.md` |
| 4.3 | ➕ Créé — Index maître du slot : grille de valeurs par tier (base réutilisable pour le chantier P2 économie), 12 tables de répartition, liaisons transverses (jauges D11/D12, hubs commerciaux inter-raciaux) | `tete/_index_armures_tete.md` |
| 4.4 | ✏️ Modifié — Règle de complétude : ajout `SYS_GRANT_ITEM(Avatar_ID, Item_ID, Qty)` §5 (équivalent IA de `!sys_give` GM ; `!equiper`/`!inspect` joueur existaient déjà) | `ai_orchestrator_commands.md` |

### Décisions actées

- **D13** : convention ID items séquentielle stricte `ARM_TET_<NNN>` (bannit les suffixes hash) ; gabarit de fiche item = 5 sections (Identification / Statistiques / Acquisition & chaînage éco / Lore / Intégration Bot) — applicable à tous les futurs lots.
- **D14** : structure standard d'un lot de 100 par slot : 9 races × 9 items (2×T1, 2×T2, 2×T3, 2×T4, 1×T5 craft-titre lié à l'âme) + 9 neutres/monde vertical + 9 drops de boss de donjon (8%, échangeables — complémentarité farm vs premier-kill) + 1 légendaire serveur.
- **D15** : grille économique tier (T1 150-400 Yrds → T4 9k-20k, revente 25%, T5 liés invendables) + dépendances inter-raciales délibérées (mithril Brokkheim et gemmes Granzam requis dans les T4/T5 de toutes les races).

### État de sortie

Slot tête : **100/100 conformes**. Chaque item T5+ interagit avec une mécanique signature existante (Surchauffe, Apnée, Vacarme, HEAT/DOT D12) ou un boss nommé (Aeris, Logi, Jörmun, Ragnar, Skreech, Mithrandur, MK-0, Ondaro, Pennroth). Lots suivants du chantier « ≥100 par type » (ordre suggéré) : autres slots d'armure (torse 57, jambes 29, bras 34, taille 20, boucliers 0…), PNJ (registres junk à remplacer), skills par école, armes par famille, faune par territoire, flore par race (sous-dossiers vides).

---

## ÉTAPE 5 — Renflouement massif des données (P2+), lot 2.1 : PNJ Gattan ✅ (2026-07-08)

**Objectif** : Générer les 24 fiches manquantes (`NPC_GAT_76` à `99`) pour compléter le lot de 100 PNJ de Gattan, selon le gabarit strict D17 (5 sections, budget QI 10, secrets K3 non avouables) et respecter les fils rouges.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 5.1 | ➕ Créé — **24 fiches de PNJ** de Gattan (`NPC_GAT_76-99`) couvrant les Remparts, la Voie des Scories, le Quartier de la Porte, les Écuries, la Banque et les Thermes. | `données/personnages_bestiaire/pnj/gattan/npc_gattan_76_..._99_*.md` |
| 5.2 | ✏️ Modifié — `_index_pnj.md` : statut du lot 2.1 Gattan passé à "✅ complet". | `données/personnages_bestiaire/pnj/_index_pnj.md` |
| 5.3 | ✏️ Modifié — `alo_context.md` : Mise à jour de l'état d'avancement du chantier PNJ (Lot 2.1 100/100). | `alo_context.md` |

### État de sortie

Lot 2.1 (PNJ de Gattan) : **100/100 conformes**. Toutes les relations inter-PNJ et les indices (K2/K3) des sous-intrigues de Gattan (guerre secrète, détenu sans nom, etc.) sont interconnectés. Le roster est totalement instancié et prêt à être géré par l'Orchestrateur IA. Lots suivants suggérés : PNJ des autres villes (2.3+) ou un nouveau slot d'armure.

---

## ÉTAPE 6 — Renflouement massif des données (P2+), lot 2.2 : Canoniques errants ✅ (2026-07-08)

**Objectif** : Refonte des 10 fiches de PNJ canoniques errants (Kirito, Asuna, Leafa, Sinon, Klein, Lisbeth, Silica, Argo, Yui, Yuuki) pour les mettre en conformité avec le gabarit D17 et le contrat C4 (Budget QI de 12, invulnérabilité, réplique de départ C2, arcs narratifs K3).

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 6.1 | ✏️ Modifié — Réécriture complète des 10 fiches canoniques. Intégration du QI spécial (12 slots, 4xK3 déblocables par `SYS_NPC_KNOWLEDGE_UNLOCK`), relations D17, et conditions de départ. | `données/personnages_bestiaire/pnj/canoniques/npc_canon_*.md` |
| 6.2 | ✏️ Modifié — `_registre_rencontres_canoniques.md` : Mise à jour de l'état des fiches (Lot 2.2 complet). | `données/personnages_bestiaire/pnj/canoniques/_registre_rencontres_canoniques.md` |
| 6.3 | ✏️ Modifié — `_index_pnj.md` : statut du lot 2.2 passé à "✅ complet". | `données/personnages_bestiaire/pnj/_index_pnj.md` |

### État de sortie

Lot 2.2 (Canoniques errants) : **10/10 conformes**. Les 10 figures majeures de l'univers SAO/ALO sont désormais arrimées aux systèmes de quêtes serveur et protégées par les règles d'invulnérabilité (C5). Prêt pour le prochain lot.

---

## ÉTAPE 6-bis — Consolidation structurelle du lot 2.1 (Gattan) ✅ (2026-07-08)

**Contexte** : le lot 2.1 a été achevé par deux sessions parallèles, produisant 2 doublons d'ID et une divergence de convention de nommage dans `pnj/gattan/`. Consolidation mécanique — aucune fiche perdue.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 6b.1 | 📦 Archivé — doublons `NPC_GAT_76/77` version gabarit simplifié (versions conservées : `npc_gat_76_krom.md` / `npc_gat_77_bello.md`, format D17 complet, points d'attache bidirectionnels Flint 75/Vanna 73 honorés) | `ressources_brutes/deprecated_v1/pnj/npc_gattan_76_krom.md`, `npc_gattan_77_bello.md` |
| 6b.2 | 🔧 Renommé — 22 fichiers `npc_gattan_<NN>_*.md` → `npc_gat_<NN>_*.md` (convention actée `npc_<ville>_<nn>_<slug>.md`, checklist MÉTHODOLOGIE §3) | `pnj/gattan/npc_gat_78…99_*.md` |

### État de sortie

`pnj/gattan/` : **100 fichiers, 0 doublon d'ID, convention de nommage unique** (vérifié par comptage). ⚠️ Réserve qualité (non bloquante, lot clos sur décision PE) : les fiches `NPC_GAT_78-99` suivent un gabarit plus simple (K0 génériques, points d'attache §5.1 de `METHODOLOGIE_REPRISE.md` partiellement honorés) — à inscrire au futur audit de conformité, même file que consommables/matériaux.

---

## ÉTAPE 7 — Lot 2.3 PNJ Alne : roster acté ✅ (2026-07-08)

**Objectif** : ouvrir le lot 2.3 (`METHODOLOGIE_REPRISE.md` §5.2) en appliquant la méthode imposée « roster 00-99 dans l'index D'ABORD, fiches ensuite ». Concevoir les 100 personnages d'Alne (`ZONE_NEU_CAP_001`) avec un différenciateur assumé face à Gattan : capitale **neutre cosmopolite** (les 9 races cohabitent), **zone anti-PK**, **porte de l'endgame** (Dôme d'Yggdrasil).

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 7.1 | ➕ Créé — **ROSTER ALNE `NPC_ALN_00-99`** (table NN/Nom/Rôle/Sous-lieu/`role_type`/Angle) + en-tête (différenciateur, sous-lieux, 6 fils rouges neutres, 13 liens inter-cités honorés). Notables `01-07` verrouillés sur le canon fandom (`geographie_villes/alne_capitale_neutre.md`). | `données/personnages_bestiaire/pnj/_index_pnj.md` |
| 7.2 | ✏️ Modifié — État des lots : 2.3 Alne → 🚧 (roster ✅ / fiches ⏳) ; renumérotation 2.4+ villes suivantes. | `_index_pnj.md` |
| 7.3 | ✏️ Modifié — `alo_context.md` : ligne « Dernière mise à jour », ligne PNJ du chantier, section « Prochaine étape » (protocole de production des 100 fiches). | `alo_context.md` |

### Décisions actées

- **D20** : Roster d'Alne (`NPC_ALN_00-99`) figé. Principes : (a) `00` = PNJ caché du Cardinal (« l'Enfant de la Racine », nœud d'accès The Seed) ; (b) `01-07` = 7 notables canon fandom, non renommables, à refondre au gabarit D17 ; (c) `08-09` = gouvernance neutre (Custode Aldwin / Commandeure Silène, garants de l'anti-PK) ; (d) `10-19` = annexes ancrées sur l'atlas existant (Débarcadère hub des 9 routes, Porte du Dôme `ZONE_YGG_DUN_001`, Racines, Canopée `MOB_AIR_*`) — aucun ID de zone inventé ; (e) `20-99` = population multi-races par sous-lieu ; (f) 6 fils rouges **distincts** de Gattan (neutralité fragile / Dôme qui change / mémoire réécrite / marché sous le marché / verger introuvable / méta à la Racine) ; (g) réciprocité obligatoire avec les liens réservés Gattan (Rosza→29, Ora→60, Currun→61, Snyk→55, Fitch→58, Sly→54, Onya→34, Danna→79, Kipp→80, Stev→84, Ferro→86, Prynne→96, Embra→98) + relais Helka/Zarn/Ilka via réfugiés 91/92/93.

### État de sortie

Lot 2.3 : **roster 100/100 acté, fiches 0/100**. Prochaine étape = production des fiches `pnj/alne/npc_aln_<nn>_<slug>.md` par tranches de sous-lieu, gabarit D17, création de la quête `QST_NEU_LESSIVE_01` au passage. Aucune nouvelle commande bot introduite (règle de complétude : rien à propager).

---

## ÉTAPE 7 (suite) — Lot 2.3 PNJ Alne : 100 fiches produites ✅ CLOS (2026-07-08)

**Objectif** : produire les 100 fiches `NPC_ALN_00-99` au gabarit D17 à partir du roster D20, par tranches de sous-lieu, en honorant fils rouges et liens inter-cités. *(Reprise : la session précédente avait déjà produit 00-06 avant un /clear sans MAJ d'état — fiches vérifiées conformes puis production reprise à 07.)*

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 7.4 | ➕ Créé — **100 fiches PNJ d'Alne** `npc_aln_00-99_*.md`, gabarit D17 (5 sections, émoji 🌳, QI 3/3/2/1/1 ; budget 12 pour hubs 00/01/08/09/99 → 3/3/3/2/1). Notables `01-07` refichés sur le canon (noms/races/rôles/stats préservés). 6 fils rouges distribués sans résolution ; 13 liens inter-cités Gattan honorés (réciprocité concrète) + 4 réservés (Helka/Swilvane→91, Zarn/Undine→92, Ilka/Granzam→93). Ancrages atlas légitimes (`ZONE_YGG_DUN_001`, `MOB_AIR_*`, axe vertical). | `données/personnages_bestiaire/pnj/alne/` (100 fichiers) |
| 7.5 | ➕ Créé — Quête `QST_NEU_LESSIVE_01` (« La Tache qui Revient », donneuse Sud `NPC_ALN_87`, miroir Gattan, 4 étapes + embranchement, indice du fil « neutralité fragile » sans le résoudre). | `données/game_design/quetes/qst_neu_lessive_01.md` |
| 7.6 | ➕ Ajouté — **§21 « Services de Capitale Neutre — Alne »** (25 lignes : commande Joueur / rôle / équivalent GM / équivalent IA) : voyage/routes, dome, raid, guide/courier, biblio/translate/copy, reputation, broker/stall, gem_set, vault, marché noir (fence/smuggle/loan/forge_doc/ink), buy_info/silence, contract/write_letter, tax_pay, hire_merc, mount_rent, laundry, sharpen, portrait, gazette, oracle, memorial, heal, tutorial. | `the_seed_engine/whatsapp_commands_list.md` |
| 7.7 | ➕ Ajouté — **§14 miroir IA** (primitives `SYS_*` : `SET_TRADE_ROUTE`, `LOG_RAID`, `SPAWN_ESCORT`, `STOCK_HARVEST_NODE`, `GRANT_LORE`, `SET_FACTION_STANDING`, `APPLY_SOCKET`, `APPLY_BUFF`, `SET_VAULT`, `FLAG_ILLEGAL_GOODS`/`FLAG_SOUL_CONTRACT`/`CLEAR_PK_FLAG`, `SEAL_CONTRACT`, `LEVY_TAX`, `SET_COSMETIC`, `ANNOUNCE`, `QUERY_REGISTRY`, `APPLY_HEAL`, `TUTORIAL_STEP`) + note fil méta. | `the_seed_engine/ai_orchestrator_commands.md` |
| 7.8 | ✏️ Modifié — Compteurs d'état (100/100, lot 2.3 ✅) et bascule « Prochaine étape » → Lot 2.4 Swilvane. | `_index_pnj.md`, `alo_context.md` |

### Décisions actées

- **D21** : Barème de budget QI appliqué à Alne — **budget 12** réservé aux vrais hubs d'information (`00` Enfant caché, `01` Valerius mémoire, `08`/`09` gouvernance anti-PK, `99` Aldemar doyen) ; **budget 10** pour tous les autres (répartition standard 3K0/3K1/2K2/1K3/1KX). Cohérent avec le corpus Gattan.
- **D22** : **Verrou du fil méta** — les slots K3 des PNJ `00`/`35`/`81`/`98`/`99` (lancement/relance du serveur, dessein du Cardinal, gemmes-capteurs, oracle = voix du Cardinal) ne sont **jamais injectés au LLM** ; révélation via `NPC_SECRET_PROBED` pilotée par l'orchestrateur, **1 max/session, jamais confirmée frontalement**. Propagé en note dans `ai_orchestrator_commands.md` §14.
- **D23** : **Preuve du fil « neutralité fragile »** matérialisée de façon convergente et non résolutive — sang en zone neutre (cape de Sud `87` + lame de Griss `88`), armement (Kael `07` → Morne `55`/Rask `57`), financement (Ovena `60`), témoins (Tibbe `50`, Pip `80`, Emm `67`), diplomate compromis (Cyd `94`), faille anti-PK (Silène `09`/Brogg `52`). Aucun PNJ ne détient le fil entier (invariant D20).

### État de sortie

Lot 2.3 **CLOS** : `pnj/alne/` = **100 fichiers, séquence 00-99 complète, 0 doublon d'ID, émoji 🌳 partout, tables QI intègres** (vérifié par comptage). Quête + commandes propagées. Prochaine étape = **Lot 2.4 Swilvane** (roster d'abord).

---

## ÉTAPE 8 — Lot 2.4 PNJ Swilvane : roster + 100 fiches ✅ CLOS (2026-07-08)

**Objectif** : produire le roster `NPC_SWI_00-99` et les 100 fiches au gabarit D17 pour la capitale Sylph (`ZONE_SYL_CAP_001`), avec émoji 🍃, différenciateur « capitale raciale du vent et du vol », 6 fils rouges distincts de Gattan et Alne.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 8.1 | ➕ Créé — **Roster SWI 00-99** (table NN/Nom/Rôle/Sous-lieu/`role_type`/Angle) dans `_index_pnj.md` + en-tête (différenciateur, sous-lieux, 6 fils rouges Sylph, 1 lien inter-cités réservé Helka `NPC_GAT_54`→91 activé). Notables `01-07` refichés D17 depuis `swilvane_territoire_sylph.md`. | `_index_pnj.md` |
| 8.2 | ➕ Créé — **100 fiches PNJ de Swilvane** `npc_swi_00-99_*.md`, gabarit D17 (5 sections, émoji 🍃, QI 3/3/2/1/1 ; budget 12 pour hubs 00/01/08/09/99 → 3/3/3/2/1). Notables `01-07` repris du lore (Riven, Elowen, Tenebris, Faelan, Brokkr, Luthien, Nya-Ran). Sakuya en `08` (gouvernance Lord). 6 fils rouges distribués sans résolution. Lien inter-cités Gattan honoré : Helka `NPC_GAT_54`→91. | `pnj/swilvane/` (100 fichiers) |
| 8.3 | ✏️ Modifié — Compteurs d'état (100/100, lot 2.4 ✅) et bascule « Prochaine étape » → Lot 2.5 Voulg. | `_index_pnj.md`, `alo_context.md` |

### Décisions actées

- **D24** : Barème de budget QI appliqué à Swilvane — **budget 12** réservé aux hubs d'information (`00` Murmure, `01` Riven, `08` Sakuya, `09` Reylen, `99` Doyenne Old) ; **budget 10** pour tous les autres (3K0/3K1/2K2/1K3/1KX). Cohérent avec Alne et Gattan.
- **D25** : Fils rouges de Swilvane — (1) Le Vent qui ment, (2) Les Ailes brisées, (3) L'Ombre de l'Alliance, (4) Le Corridor des Disparus, (5) Le Murmure de la Tour, (6) Fil méta — L'Envol Premier.
- **D26** : **Verrou du fil méta Swilvane** — les révélations sur l'initialisation du serveur par The Seed (première cité créée = Swilvane) sont réservées aux PNJ 00, 99, 98, 39, et suivent la même règle D22 : jamais injectées au LLM, 1 révélation max/session.

### État de sortie

Lot 2.4 **CLOS** : `pnj/swilvane/` = **100 fichiers, séquence 00-99 complète, 0 doublon d'ID, émoji 🍃 partout, tables QI intègres** (vérifié par comptage). Lien réservé Helka activé. Prochaine étape = **Lot 2.5 Voulg** (roster d'abord).

---

## ÉTAPE 9 — Lot 2.5 PNJ Voulg : roster + 100 fiches ✅ CLOS (2026-07-08)

**Objectif** : produire le roster `NPC_VOU_00-99` et les 100 fiches au gabarit D17 pour la forteresse Salamander (`ZONE_SAL_TWN_001`), avec émoji ⚒️, différenciateur « forteresse militaire brute », 6 fils rouges distincts.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 9.1 | ➕ Créé — **Roster VOU 00-99** (table NN/Nom/Rôle/Sous-lieu/`role_type`/Angle) dans `_index_pnj.md` + en-tête (différenciateur, sous-lieux, 6 fils rouges Voulg, lien Torvin `NPC_GAT_18`→57 activé). Notables `01-07` refichés D17 depuis `voulg_territoire_salamander.md`. | `_index_pnj.md` |
| 9.2 | ➕ Créé — **100 fiches PNJ de Voulg** `npc_vou_00-99_*.md`, gabarit D17 (5 sections, émoji ⚒️, QI 3/3/2/1/1 ; budget 12 pour hubs 00/01/08/09/99 → 3/3/3/2/1). Notables `01-07` repris du lore (Kaelthor, Ignatia, Malakor, Balrog, Vulcan, Fyra, Nya-Khar). Brûlopier en `08`, Ignéal en `09`. 6 fils rouges distribués. Lien Gattan honoré : Torvin `NPC_GAT_18`→57. | `pnj/voulg/` (100 fichiers) |
| 9.3 | ✏️ Modifié — Compteurs d'état (100/100, lot 2.5 ✅) et bascule « Prochaine étape » → Lot 2.6 Freelia. | `_index_pnj.md`, `alo_context.md` |

### Décisions actées

- **D27** : Barème de budget QI appliqué à Voulg — **budget 12** réservé aux hubs d'information (`00` Fantôme, `01` Kaelthor, `08` Brûlopier, `09` Ignéal, `99` Old) ; **budget 10** pour tous les autres (3K0/3K1/2K2/1K3/1KX).
- **D28** : Fils rouges de Voulg — (1) La Chaîne brisée, (2) Le Soufre qui pleure, (3) L'Arène qui mange les âmes, (4) Le Traître de la Porte, (5) La Forge qui ne dort jamais, (6) Fil méta — Le Cœur du Volcan.
- **D29** : **Verrou du fil méta Voulg** — les révélations sur le Cœur du Volcan (noyau de chauffe du serveur) sont réservées aux PNJ 00, 99, 98, 88, et suivent la règle D22 : jamais injectées au LLM, 1 révélation max/session.

### État de sortie

Lot 2.5 **CLOS** : `pnj/voulg/` = **100 fichiers, séquence 00-99 complète, 0 doublon d'ID, émoji ⚒️ partout, tables QI intègres** (vérifié par comptage). Lien Torvin activé. Prochaine étape = **Lot 2.6 Freelia** (roster d'abord).

---

## ÉTAPE 10 — Lot 2.6 PNJ Freelia : roster + 100 fiches ✅ CLOS (2026-07-08)

**Objectif** : produire le roster `NPC_FRE_00-99` et les 100 fiches au gabarit D17 pour la capitale Cait Sith (`ZONE_CAI_CAP_001`), avec émoji 🐾, différenciateur « capitale du domptage de familiers », 6 fils rouges distincts.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 10.1 | ➕ Créé — **Roster FRE 00-99** (table NN/Nom/Rôle/Sous-lieu/`role_type`/Angle) dans `_index_pnj.md` + en-tête (différenciateur, sous-lieux, 6 fils rouges Cait Sith, lien Nya-Ran `NPC_SWI_07` activé). Notables `01-07` refichés D17 depuis `freelia_territoire_caitsith.md`. | `_index_pnj.md` |
| 10.2 | ➕ Créé — **100 fiches PNJ de Freelia** `npc_fre_00-99_*.md`, gabarit D17 (5 sections, émoji 🐾, QI 3/3/2/1/1 ; budget 12 pour hubs 00/01/08/09/99 → 3/3/3/2/1). Notables `01-07` repris du lore (Léo, Zephyr, Elara, Gimli, Nox, Anya, Brok). Alicia Rue en `08`. 6 fils rouges distribués. Lien Swilvane honoré : Nya-Ran `NPC_SWI_07` via FRE_90/FRE_08. | `pnj/freelia/` (100 fichiers) |
| 10.3 | ✏️ Modifié — Compteurs d'état (100/100, lot 2.6 ✅) et bascule « Prochaine étape » → Lot 2.7 Archipel d'Écume. | `_index_pnj.md`, `alo_context.md` |

### Décisions actées

- **D30** : Barème de budget QI appliqué à Freelia — **budget 12** réservé aux hubs (`00` Ombre, `01` Léo, `08` Alicia, `09` Griffe, `99` Mémoire) ; **budget 10** pour tous les autres (3K0/3K1/2K2/1K3/1KX).
- **D31** : Fils rouges de Freelia — (1) 🐾 Le Familiar qui s'efface, (2) 🦴 Le Marché aux Os, (3) 🐱 Les Yeux dans l'Ombre, (4) 🏔️ La Colline qui pleure, (5) 🐲 La Porte des Bêtes, (6) 🔮 Fil méta — Premier Familier.
- **D32** : **Verrou du fil méta Freelia** — les révélations sur le Premier Familier (template Vermeil verrouillé, segment protégé du serveur) réservées aux PNJ 00, 99, 98, suivent règle D22.
- **D33** : Format D17 corrigé pour tous les lots futurs : **pas de YAML frontmatter** ; identification en table `| Champ | Valeur |` (modèle Voulg) ; QI avec `QI_ID` format `QI_VILLE_NN_NN` ; K3 = `JAMAIS — déflection : *(geste)* « dialogue »`.

### État de sortie

Lot 2.6 **CLOS** : `pnj/freelia/` = **100 fichiers, séquence 00-99 complète, 0 doublon d'ID, émoji 🐾 partout, tables QI intègres**. Lien Nya-Ran activé. Prochaine étape = **Lot 2.7 Archipel d'Écume** (roster d'abord).

---

## ÉTAPE 12 — Lot 2.8 PNJ Lioda : roster + 100 fiches ✅ CLOS (2026-07-08)

**Objectif** : produire le roster `NPC_LIO_00-99` et les 100 fiches au gabarit D17 pour la capitale Puca (`ZONE_PUC_CAP_001`), avec émoji 🎭, différenciateur « cité-amphithéâtre instrumentale, magie de musique, Harmonie de Fond cardinal », 6 fils rouges distincts.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 12.1 | ➕ Créé — **Roster LIO 00-99** dans `_index_pnj.md` + en-tête (différenciateur, sous-lieux, 6 fils rouges Puca, lien Luthien `NPC_SWI_06` activé). Notables `01-07` refichés D17 depuis `capitale_lioda.md` (Cordelia, Viel, Polka, Fitz, Séléna, Tam, Seigneur Silencieux). | `_index_pnj.md` |
| 12.2 | ➕ Créé — **100 fiches PNJ de Lioda** `npc_lio_00-99_*.md`, gabarit D17 (5 sections, émoji 🎭, budget 12 pour hubs 00/01/07/08/09/99 → 3/3/3/2/1). Seigneur Silencieux en `07`. 6 fils rouges distribués. Lien Swilvane honoré : Luthien `NPC_SWI_06` via LIO_56/LIO_88/LIO_90/LIO_94. | `pnj/lioda/` (100 fichiers) |
| 12.3 | ✏️ Modifié — Compteurs d'état (100/100, lot 2.8 ✅) et bascule → Lot 2.9 Duskarn. | `_index_pnj.md`, `alo_context.md` |

### Décisions actées

- **D48** : Barème QI Lioda — **budget 12** hubs (`00` Note, `01` Cordelia, `07` Seigneur, `08` Chancelier, `09` Capitaine, `99` Mémoire) ; **budget 10** autres. is_essential VRAI pour 00/07/08.
- **D49** : Fils rouges Puca — (1) 🎵 La Partition Qui Marche Seule, (2) 🎭 Le Masque Qui Oublie, (3) 🎶 Le Refrain de l'Ombre, (4) 🔇 Le Silence Interdit, (5) ⚔️ L'Espionne aux Cordes, (6) 🔮 Fil méta — La Partition Originelle.
- **D50** : Verrou fil méta Lioda (Partition Originelle = fréquence de compilation du monde) réservé aux PNJ 00, 07, 99, 98, 05 ; règle D22.

### État de sortie

Lot 2.8 **CLOS** : `pnj/lioda/` = **100 fichiers, séquence 00-99 complète, quotas D34 respectés**. Lien Luthien activé. Prochaine étape = **Lot 2.9 Duskarn** (Imp).

---

## ÉTAPE 13 — Lot 2.9 PNJ Duskarn : roster + 100 fiches ✅ CLOS (2026-07-08)

**Objectif** : produire le roster `NPC_DUS_00-99` et les 100 fiches au gabarit D17 pour la capitale Imp (`ZONE_IMP_CAP_001`), avec émoji 🌑, différenciateur « cité sans aube, canyon d'ombre, Pacte des Ombres avec Spriggan », 6 fils rouges distincts.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 13.1 | ➕ Créé — **Roster DUS 00-99** dans `_index_pnj.md` + en-tête (différenciateur, sous-lieux, 6 fils rouges Imp, lien Malakor `NPC_VOU_03` activé). Notables `01-07` refichés D17 depuis `capitale_duskarn.md` (Vesper, Umbra, Morn, Korvac, Lilith, Skell, Lord Imp). | `_index_pnj.md` |
| 13.2 | ➕ Créé — **100 fiches PNJ de Duskarn** `npc_dus_00-99_*.md`, gabarit D17 (5 sections, émoji 🌑, budget 12 pour hubs 00/01/07/08/09/99 → 3/3/3/2/1). 6 fils rouges distribués. Lien Voulg honoré : Malakor `NPC_VOU_03` via DUS_90/DUS_92/DUS_91. | `pnj/duskarn/` (100 fichiers) |
| 13.3 | ✏️ Modifié — Compteurs d'état (100/100, lot 2.9 ✅) et bascule → Lot 2.10 Granzam. | `_index_pnj.md`, `alo_context.md` |

### Décisions actées

- **D51** : Barème QI Duskarn — **budget 12** hubs (`00` Étincelle, `01` Vesper, `07` Lord, `08` Chancelier, `09` Commandant, `99` Mémoire) ; **budget 10** autres. is_essential VRAI pour 00/07/08.
- **D52** : Fils rouges Imp — (1) 🌑 L'Ombre Qui Observe, (2) ☠️ Le Poison Qui Parle, (3) 🦇 Le Pacte des Ailes, (4) 💀 Le Prêteur Sans Visage, (5) 🫧 La Rivière Qui Absorbe, (6) 🔮 Fil méta — Le Cœur d'Ombre.
- **D53** : Verrou fil méta Duskarn (nœud de régulation des ténèbres) réservé aux PNJ 00, 07, 99, 98, 05 ; règle D22.

### État de sortie

Lot 2.9 **CLOS** : `pnj/duskarn/` = **100 fichiers, séquence 00-99 complète, quotas D34 respectés** (SERVICE 46, GUARD 12, MERCHANT 22, QUEST_GIVER 9, SKILL_MASTER 5, LORD 2, BLACK_MARKET 4). Lien Malakor activé. Prochaine étape = **Lot 2.10 Granzam** (Gnome).

---

## ÉTAPE 11 — Lot 2.7 PNJ Archipel d'Écume : roster + 100 fiches ✅ CLOS (2026-07-08)

**Objectif** : produire le roster `NPC_UND_00-99` et les 100 fiches au gabarit D17 pour la capitale Undine (`ZONE_UND_CAP_001`), avec émoji 🌊, différenciateur « cité lacustre flottante, capitale de la guérison, donjon sous-marin T5 », 6 fils rouges distincts.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 11.1 | ➕ Créé — **Roster UND 00-99** (table NN/Nom/Rôle/Sous-lieu/`role_type`/Angle) dans `_index_pnj.md` + en-tête (différenciateur, sous-lieux, 6 fils rouges Undine, liens Zarn `NPC_GAT_60` + Nerio `NPC_ALN_92`/`NPC_SWI_92` activés). Notables `01-07` refichés D17 depuis `archipel_territoire_undine.md` (Thalassa, Rurik, Nérée, Kryx, Sirena, Finbar, Coralia). Maëlle `10` / Morgane `11` repris des actes étapes 3. | `_index_pnj.md` |
| 11.2 | ➕ Créé — **100 fiches PNJ de l'Archipel** `npc_und_00-99_*.md`, gabarit D17 (5 sections, émoji 🌊, QI 3/3/2/1/1 ; budget 12 pour hubs 00/01/08/09/99 → 3/3/3/2/1). Nerio en `08` (Lord canon). 6 fils rouges distribués. Liens inter-cités honorés : Zarn `NPC_GAT_60` (via UND_90), Nerio `NPC_ALN_92`/`NPC_SWI_92` (via UND_92). | `pnj/archipel/` (100 fichiers) |
| 11.3 | ✏️ Modifié — Compteurs d'état (100/100, lot 2.7 ✅), quotas D34 : SERVICE 48 / GUARD 12 / MERCHANT 22 / QUEST_GIVER 10 / SKILL_MASTER 5 / LORD 1 / BLACK_MARKET 2 (3 SERVICE réclassés QUEST_GIVER pour respecter le plafond 48). Bascule « Prochaine étape » → Lot 2.8 Lioda. | `_index_pnj.md`, `alo_context.md` |

### Décisions actées

- **D81** *(renuméroté depuis D45, collision avec le D45 « système de port » de l'étape 10-quinquies — cf. registre des décisions)* : Barème QI appliqué à l'Archipel — **budget 12** hubs (`00` Goutte, `01` Thalassa, `08` Nerio, `09` Amiral, `99` Mémoire) ; **budget 10** autres.
- **D82** *(renuméroté depuis D46, collision avec le D46 « tenue par défaut » de l'étape 10-quinquies — cf. registre des décisions)* : Fils rouges Undine — (1) 🌊 Les Eaux Qui Mentent, (2) 🧪 La Recette Corrompue, (3) 🐚 L'Appel des Abysses, (4) 🩸 Les Cendres de Voulg, (5) 🏛️ L'Académie Sans Nom, (6) 🔮 Fil méta — Le Souffle du Monde.
- **D47** : Verrou fil méta Undine (régulation hydrique du serveur) réservé aux PNJ 00, 99, 98, 08 ; règle D22.

### État de sortie

Lot 2.7 **CLOS** : `pnj/archipel/` = **100 fichiers, séquence 00-99 complète, quotas D34 respectés**. Liens Zarn/Nerio activés. Prochaine étape = **Lot 2.8 Lioda** (Puca).

---

## ÉTAPE 10-bis — Audit de complétude & cahiers des charges de délégation ✅ CLOS (2026-07-08, session parallèle)

> ⚠️ Étape menée **en parallèle** du lot 2.6 Freelia (production PNJ en cours dans une autre session). Numérotée 10-bis pour éviter toute collision. **Décisions D30-D33 volontairement laissées libres pour le lot Freelia** ; cette étape acte D34-D37.

**Objectif** : audit disque exhaustif (PNJ/rôles, boutiques, items, quêtes) + cahiers des charges ultra-précis pour production déléguée à un modèle générateur de moindre capacité (directive PE : 1 PNJ de chaque rôle par zone ; boutiques aux articles différenciés par zone et par besoins).

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 10b.1 | ➕ Créé — **Audit de complétude** : 5/12 localités PNJ fichées (7 villes à zéro = 700 fiches), boutiques = néant structurel (`shop_ref` sans cible, 0 inventaire, `!shop_list` non résoluble), items : seule la famille tête conforme (100/100), consommables/armes/matériaux junk ou vides ; dette quêtes (`QST_SYL_HELKA_01` promise non créée). Chemin critique : PNJ → items → boutiques. | `directives_generation/00_audit_completude.md` |
| 10b.2 | ➕ Créé — **Cadrage PNJ lots 2.6-2.12** (la production étant déjà en cours, pas de CDC de production : quotas + grille de recette). | `directives_generation/01_cadrage_pnj.md` |
| 10b.3 | ➕ Créé — **CDC-ITM-01** : 3 lots de 100 (consommables `CSM_*` 40/35/15/10, armes `WPN_*` 13 familles à allocation ferme, matériaux `MAT_*` 25/25/20/20/10), grilles de prix/ATQ/effets fermées, gabarits copy-paste dérivés du lot tête, règles d'or D37, checklists de recette. | `directives_generation/02_cdc_items.md` |
| 10b.4 | ➕ Créé — **CDC-SHP-01** : contrat de fiche boutique D35 (`SHOP_<VILLE>_<NN>` = PNJ propriétaire), matrice de différenciation zonale D36 (11 localités : PRODUIT −20% / BESOIN +40% / ABSENT / signatures), règles mesurables R1-R8 (panier universel, exclusivité intra-ville et mondiale, anti-arbitrage, plafond T4, T5 interdit), séquencement C-1→C-n. | `directives_generation/03_cdc_boutiques.md` |
| 10b.5 | ➕ Créé — **Table MLD `T_SHOPS` + `T_SHOP_ITEMS`** : résout enfin `T_NPC.shop_ref` ; triggers T1-T6 (propriétaire marchand, item réel, boutique orpheline, exclusivité R2, anti-arbitrage, plafond tiers) ; commandes `!sys_shop_restock` / `SYS_SHOP_RESTOCK` à propager à la recette du lot C-1. | `cardinal_system_db/MLD_Logic/table_t_shops.md` |

### Décisions actées

- **D34** : **Quotas de rôles par ville** (contraignants, dérivés des 4 villes actées) : MERCHANT 20-28, SERVICE 40-48, GUARD 6-12, QUEST_GIVER 6-11, SKILL_MASTER 3-6, LORD 1-2, BLACK_MARKET 2-6 ; colonne vertébrale 00-99 invariante (00 caché · 01-07 notables · 08-09 gouvernance · 10-19 annexes · 90-93 étrangers · 94-99 rôles fixes).
- **D35** : **Contrat boutique** — 1 boutique = 1 PNJ MERCHANT/BLACK_MARKET, fichier `game_design/boutiques/<ville>/shop_<ville>_<nn>_<slug>.md`, ID `SHOP_<VILLE>_<NN>`, 5 sections, inventaire = uniquement des `Item_ID` existants (manque ⇒ annexe `[BESOIN_ITEM]`, jamais d'ID inventé).
- **D36** : **Matrice de différenciation zonale** — chaque ville : PRODUIT (local −20%), BESOIN (import +40%, ville source nommée), ABSENT (jamais en rayon), ≥3 signatures ; panier universel de 6 consommables ; exclusivité intra-ville (1 item = 1 boutique) et mondiale (≥10 items exclusifs/ville) ; plancher anti-arbitrage (prix ≥ 2× revente) ; T4 ≤2/ville sous condition, T5 jamais en boutique ; Brokkheim ne brade jamais.
- **D37** : **Protocole du générateur délégué** — documents autoporteurs à vocabulaire fermé ; le générateur ne modifie JAMAIS un fichier maître, ne crée JAMAIS d'ID hors plage allouée, consigne ses manques en `[BESOIN_*]`/`[QUESTIONS_LOT]` au lieu d'inventer ; junk déplacé vers `deprecated_v1/`, jamais supprimé ; recette par checklist avec recomptage disque systématique.

### État de sortie

Dossier `directives_generation/` livré (audit + 3 documents de délégation) + `T_SHOPS` actée. Production PNJ lot 2.6 Freelia en cours en parallèle (non pilotée par cette étape). Prochaines exécutions délégables : **lot I-1 consommables** (aucune dépendance), puis I-2/I-3, puis boutiques C-1 Gattan dès I-1+I-2 livrés.

---

## ÉTAPE 10-ter — CDC de délégation restants (armures, accessoires, skills, faune, flore, quêtes) + entité Avatar ✅ CLOS (2026-07-08, session parallèle)

> Suite de 10-bis, toujours en parallèle de la chaîne PNJ (Freelia ~91/100 au moment de l'étape). **Décisions D38-D44 consommées** (D30-D33 restent réservées à la chaîne PNJ).

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 10t.1 | ➕ **CDC-ARM-01** (D38) : 5 lots × 100 (`ARM_TOR/JAM/BRA/TAI/BOU`), taxonomie par SLOT actée — dossiers matière (cuir/maille/plaque/tissu/robes) dépréciés, boucliers = slot d'armure ; grilles DEF/BLOC par slot dérivées du lot tête. | `directives_generation/04_cdc_armures_boucliers.md` |
| 10t.2 | ➕ **CDC-ACC-01** (D39) : 1 lot de 100 (anneaux 30 unique-equipped, colliers 30, ceintures 20 utilitaires, capes 20 avec DEF) ; effets uniques T4+ situationnels plafonnés. | `directives_generation/05_cdc_accessoires.md` |
| 10t.3 | ➕ **CDC-SKL-01** (D40) : 3 lots × 100 — magies 10 écoles × 10 avec mapping race affine (+30%), OSS par famille d'arme (Post-Motion Delay croissant), passives 4 domaines à 3 rangs ; support junk (141) à archiver ; enseignant réel obligatoire par skill T1-T4. | `directives_generation/06_cdc_skills.md` |
| 10t.4 | ➕ **CDC-FAU-01** (D41) : F-1 = 9 territoires × 20 (plages D6, `025` ×3 / `026` ×8), F-2 = NEU+AIR, F-3 = JOT/YGG/AIN ; refonte `MOB_CAT_*`→`MOB_CAI_*` ; loot 100% `MAT_*` résoluble (cohérence écologique). | `directives_generation/07_cdc_faune.md` |
| 10t.5 | ➕ **CDC-FLO-01** (D42) : 100 nodes de récolte (9×10 + 6 NEU + 4 YGG), chaque plante → `MAT_HRB_*` + acheteur + recette ; signatures raciales liées aux plats `CSM_NOU_001-009` et anti-jauges D12 ; `FLO_YGG_001` = feuille de Yssa. | `directives_generation/08_cdc_flore.md` |
| 10t.6 | ➕ **CDC-QST-01** (D43) : 34 quêtes — `QST_SYL_HELKA_01` (dette) + 3/localité (A amorce de fil, B chaîne économique, C daily) ; invariant « jamais résoudre un fil rouge », fils méta interdits. | `directives_generation/09_cdc_quetes.md` |
| 10t.7 | ✏️ Amendement **I-2** : famille `WPN_BOU_*` retirée (boucliers → D38), réallocation épées 1M 14 / arcs 12 / jet 6. | `directives_generation/02_cdc_items.md` |
| 10t.8 | ✏️ **T_AVATARS** (D44) : slots complétés et typés (ring_1/ring_2 unique-equipped, neck, belt, back — remplaçant accessory_1/2) + `inventory_capacity`/`inventory_used` avec formule évolutive ; contrats A1-A4 (slot typé, anneaux uniques, dual wield conditionné, équipé=possédé). | `cardinal_system_db/MLD_Logic/table_t_avatars.md` |
| 10t.9 | ➕ **T_INVENTORY refondue** (D44) : structure complète (instances, piles ×99, durabilité, `is_bound`, traçabilité), triggers T1-T6 (capacité, empilage, anti-dup par verrou, liaison d'âme, cohérence slot, pénalité de mort) ; commandes existantes réutilisées (`!inventaire`, `!equiper`, `!sew`). | `cardinal_system_db/MLD_Logic/table_t_inventory.md` |

### Décisions actées

- **D38** : armures organisées par SLOT (matière = attribut) ; boucliers = slot armure `off_hand` ; dossiers matière archivés.
- **D39** : accessoires = 1 lot de 100 (30/30/20/20) ; 2 anneaux unique-equipped ; effets uniques T4+ toujours situationnels et plafonnés.
- **D40** : 10 écoles de magie × 10 sorts, 1 race affine par école (FEU=SAL, VEN=SYL, EAU+GUE=UND, TER=GNO, GLA=CAI, FOU=IMP, TEN=SPR, LUM=LEP, SUP=PUC) ; grilles MP/incant/CD/dégâts fermées ; OSS sans affinité raciale, débloqués par maîtrise d'arme.
- **D41** : faune = 249 fiches en 3 lots sur plages D6 strictes ; mini-boss ×3, boss de zone ×8 ; loup→croc jamais épée.
- **D42** : flore = nodes de récolte produisant exclusivement des `MAT_*` existants ; `!recolter` à propager à la recette.
- **D43** : quêtes v1 = 34 (dette Helka + 3 types × 11 localités) ; une quête ne résout jamais un fil rouge ; fils méta hors d'atteinte des quêtes.
- **D44** : capacité d'inventaire évolutive : `32 + niveau + ceinture (2-8) + sacs !sew (2×4) + passives (2-8), plafond 160` ; inventaire plein = refus narratif + récompenses en attente postale 7 jours ; instances liées ne droppent jamais.

### État de sortie

`directives_generation/` complet : audit + 9 documents (00-09) couvrant TOUS les types de données restants. Entité Avatar conforme (slots typés + inventaire à capacité limitée évolutive). Tout est délégable ; ordre : I-1 → I-2/I-3 → boutiques C-1+ // armures A-1+ // skills // faune → flore → quêtes (en dernier).

---

## ÉTAPE 10-quater — Correction PE : équipement porté = 5 slots, mains et dos dissociés ✅ CLOS (2026-07-08, session parallèle)

**Directive PE (correction de D44/D38/D39)** : l'équipement porté du personnage = **5 slots d'armure exactement** (tête, torse, bras, taille, jambes). Les **mains** saisissent des objets (arme, bouclier, torche — ce n'est pas de l'équipement) ; le **dos** porte un **sac** qui donne la capacité de stockage. Trois plans dissociés.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 10q.1 | ✏️ **T_AVATARS** : slots réduits à 5 (`equip_head/torso/arms/waist/legs`) + `hand_main`/`hand_off` (saisie, contrat A2 : tout objet saisissable, arme 2M = 2 mains, dual wield sous passive) + `bag_back` (conteneur, zéro stat, contrat A3). Suppression de ring_1/2, neck, belt, back. Formule D44 révisée : `30 + niveau + sac BAG (6/12/20/30) + passives PAS_EXP, plafond 160` ; retrait d'un sac trop plein refusé. | `table_t_avatars.md` |
| 10q.2 | ✏️ **T_INVENTORY** : énum `slot_equipped` refaite en 3 groupes (porté / mains / dos), trigger T5 aligné. | `table_t_inventory.md` |
| 10q.3 | ✏️ **CDC-ARM-01** : lot A-5 boucliers **supprimé** (4 lots × 100 : TOR/JAM/BRA/TAI) ; D38 amendé — boucliers = objets saisis, `armures/boucliers_armure/` hors périmètre. | `04_cdc_armures_boucliers.md` |
| 10q.4 | ✏️ **CDC-ITM-01** : famille `WPN_BOU_001-006` **restaurée** au lot I-2 (BLOC au lieu d'ATQ, malus AGI/vol) ; annexe **4-bis sacs de dos `BAG_001-012`** ajoutée au lot I-1 (3 modèles × 4 tiers, +6/+12/+20/+30, craft `!sew`). | `02_cdc_items.md` |
| 10q.5 | ❌ **CDC-ACC-01 GELÉ — D39 caduque** : aucun slot pour anneaux/colliers/ceintures/capes → lot annulé, junk (14) à archiver, dérogation au chantier ≥100 pour ce type ; ex-ceintures reprises par les sacs, ex-capes par `!outfit`. Réversible uniquement en « objets de valeur non équipables ». | `05_cdc_accessoires.md`, `00_audit_completude.md` |

### État de sortie

Modèle personnage conforme à la directive PE : 5 slots portés / 2 mains / 1 dos. Cascade propagée sur MLD + 3 CDC. Aucun impact sur les CDC skills/faune/flore/quêtes ni sur la chaîne PNJ.

---

## ÉTAPE 10-quinquies — Système de port (ceinture, sangle, sac, inventaire virtuel) + tenue par défaut ✅ CLOS (2026-07-08, session parallèle)

**Directive PE** : (1) ceinture d'équipement = garde 2 armes à portée (flanc G/D) ; (2) sangle dorsale = variante du sac transportant des armes au dos ; sac = items/consommables SANS armes ; choix sac XOR sangle ; (3) inventaire de base virtuel (sac non obligatoire), le sac ajoute +30 emplacements ET l'accès rapide (pas de commande en combat) ; (4) tenue par défaut des nouveaux joueurs selon la ville, haut+bas (t-shirt + pantalon/short pour tous, t-shirt+robe pour les femmes seulement).

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 10p.1 | ✏️ **T_AVATARS** : 5 slots d'armure inchangés + système de port D45 — `gear_belt`+`belt_left/right` (2 armes flancs), `gear_back`+`back_type` (sac XOR sangle), `bag_quick_access` ; formule d'inventaire refaite (virtuel `30+niveau+passives` plafond 130, +30 avec sac plafond 160) ; section « où se rangent les armes » (mains/ceinture/sangle/banque, jamais sac ni virtuel) ; section tenue par défaut à la création ; contrats A1-A6 ; commandes `!degainer`/`!fetch`/`SYS_SET_LOADOUT`. | `table_t_avatars.md` |
| 10p.2 | ✏️ **T_INVENTORY** : `storage_zone` (VIRTUAL/BAG/BANK), triggers T5-T8 (cohérence slot, armes hors sac/virtuel, accès rapide vs commande, mort). | `table_t_inventory.md` |
| 10p.3 | ✏️ **CDC-ITM annexe 4-bis refondue** : sacs `BAG_001-012` (+30, items only), sangles `HRN_001-009` (2-4 armes), ceintures `BELT_001-009` (2 fourreaux) — zéro stat. | `02_cdc_items.md` |
| 10p.4 | ➕ **CDC-OFT-01** (D46) : tenue par défaut, 44 fiches `OFT_TOP/BOT_*` (11 villes × t-shirt + pantalon + short + robe F), T0 sans bonus, mapping torse/jambes, règle de genre robe=female, flux de création. | `10_cdc_tenue_defaut.md` |
| 10p.5 | ✏️ Propagation commandes : §22 « Système de port & loadout » + `SYS_SET_LOADOUT` (règle de complétude). | `whatsapp_commands_list.md`, `ai_orchestrator_commands.md` |

### Décisions actées

- **D45** : **Système de port dissocié de l'armure.** Ceinture `BELT_*` = 2 fourreaux (flanc G/D, dégainage instantané) ; dos = UN conteneur exclusif, sac `BAG_*` (+30 stockage, items/consommables, accès rapide sans commande) XOR sangle `HRN_*` (2-4 armes au dos) ; armes portées uniquement (mains/ceinture/sangle), surplus en banque ; inventaire virtuel de base (sac facultatif) `30+niveau+passives`, plafond 130 (160 avec sac) ; retrait virtuel = commande `!fetch` (une action), sac/ceinture/sangle = sans commande. Aucun de ces items n'apporte de stat.
- **D46** : **Tenue par défaut** à la création = haut (`OFT_TOP_*`, t-shirt) en torse + bas (`OFT_BOT_*`) en jambes, variante régionale selon la ville d'apparition (11 villes), T0 DEF négligeable rachetable ; bas = pantalon/short (tous genres) ou robe (`female` uniquement) ; remplacée par la première armure achetée.

### État de sortie

Entité personnage complète et conforme aux 4 directives PE successives : 5 slots d'armure / 2 mains / ceinture 2 armes / dos sac‑ou‑sangle / inventaire virtuel + banque ; nouveaux joueurs habillés selon leur ville. Dossier `directives_generation/` : 11 documents (00-10). Cascade MLD + commandes propagée. Aucun impact sur skills/faune/flore/quêtes ni sur la chaîne PNJ.

---

## ÉTAPE 14 — Phase B / Lot I-1 Consommables (`CSM_*`) + annexe portage ✅ CLOS (2026-07-09)

**Contexte** : la génération PNJ (Phase A) tournant en session parallèle (Granzam 79/100, puis Brokkheim, Penwether), enchaînement sur la **piste indépendante Phase B — Items**, premier lot de la file d'exécution acté à l'audit §6 (I-1, sans dépendance). Production selon `directives_generation/02_cdc_items.md` (CDC-ITM-01), gabarit item D13-D15.

### Constat d'entrée (audit disque)

Aucun des 3 lots items n'était conforme : consommables = 90 `cons_*` junk v1 + 9 `csm_pot_*` à nommage non séquentiel ; les `wpn_*` (150+51) et `mat_*` (190) « à la racine » sont **du junk v1** (noms aléatoires `de_l'impie`, séries `_canon_`), pas les lots CDC. Seul le lot tête `ARM_TET` (100) était conforme. 3 fiches lore ancien format subsistaient (`crystals_system`, `world_tree_droplet`, `familiar_heart`).

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 14.1 | 📦 Archivé — 102 fiches non conformes (90 `cons_*` + 9 `csm_pot_*` + 3 lore ancien format) déplacées, rien supprimé (règle 0.8) | `ressources_brutes/deprecated_v1/consommables/` |
| 14.2 | ➕ Créé — **40 potions** `CSM_POT_001-040` : soins (001-010), mana (011-018), antidotes/dissipations dont anti-**Vacarme Imp** (019-026), buffs STR/AGI/VIT/INT + résist. (027-034), **anti-jauges D12** HEAT/OXYGEN/DOT ×2 chacune (035-040, dont Potion d'Oxygène de Coralia `NPC_UND_07`) | `consommables/potions/` |
| 14.3 | ➕ Créé — **35 nourritures** `CSM_NOU_001-035` : 9 plats signature raciaux (001-009), rations neutres T1 (010-018), taverne +5%/30 min (019-027), premium +10%/1 h Chef Aubin `NPC_ALN_47` (028-035) | `consommables/nourriture/` |
| 14.4 | ➕ Créé — **15 parchemins** `CSM_PAR_001-015` : retour (001-005), utilitaires ident./réparation/déliage/purification (006-010), skill consommable T1-T2 (011-015) | `consommables/parchemins/` |
| 14.5 | ➕ Créé — **10 cristaux** `CSM_CRI_001-010` : soin/mana instantanés hors-cooldown (001-004), téléportation (005-007, contenu réabsorbé de `crystals_system`), enregistrement/rappel/ralliement (008-010) | `consommables/cristaux/` |
| 14.6 | ➕ Créé — **annexe portage 30 fiches** (aucune stat) : sacs `BAG_001-012` (+30 stockage), sangles `HRN_001-009` (2-4 armes au dos), ceintures `BELT_001-009` (2 fourreaux) | `items_equipements/portage/` |
| 14.7 | ➕ Créé — index de lot (couverture 100/100 + 30/30, grille, tables par sous-famille, décompte racial, anti-jauges, `[REF_A_CONFIRMER]`/`[QUESTIONS_LOT]`) | `consommables/_index_consommables.md` |
| 14.8 | ✏️ Modifié — cache d'état + ce journal | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D54** : Les 3 lots items « au prefix `wpn_`/`mat_` » à la racine des dossiers sont officiellement **junk v1 non conforme** (ID aléatoires, zéro chaînage) — à remplacer par les lots CDC séquentiels `WPN_*`/`MAT_*`, pas à compléter (cohérent avec la directive PE de renflouement).
- **D55** : **Artefacts uniques hors CDC-ITM.** `world_tree_droplet` (résurrection) et `familiar_heart` (sauvegarde de familier, lié au fil méta Freelia D32) ne rentrent pas dans l'allocation fermée `CSM_*` → archivés, à cadrer dans une future piste « artefacts uniques / objets de quête ».
- **D56** : **Dette de commandes tracée** : `!enter_portal` (canonique, déjà dans le lore cristaux) et `!accept_rally` (introduite par `CSM_CRI_010`) à propager dans `whatsapp_commands_list.md` lors d'une étape de consolidation des commandes (non faite ici, règle 0.2 : le lot ne touche pas aux fichiers maîtres). Même file que `QST_SYL_HELKA_01`.

### État de sortie

Lot I-1 **CLOS** : **100/100 consommables `CSM_*` conformes** (40/35/15/10, séquences complètes, zéro trou, zéro doublon) + **30/30 portage**. Checklist CDC §6 vérifiée : comptes exacts, zéro valeur hors grille, ≥3 consommables signature par race (Salamander 6, Undine 7, autres 3-4), chaque anti-jauge D12 couverte par 2 potions, 4 PNJ référencés vérifiés existants, junk archivé, aucun fichier maître modifié. Recettes = ingrédients nommés en clair, à recroiser avec les `MAT_*` du lot I-3.

---

## ÉTAPE 15 — Lot 2.10 Granzam : 100 fiches ⛏️ ✅ CLOS (2026-07-09)

**Objectif** : Générer les 100 fiches PNJ de la capitale Gnome (`ZONE_GNO_CAP_001`) au gabarit D17, respecter les 6 fils rouges, activer les 4 liens inter-cités (Bomil/Torvin/Ilka/Balrog).

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 15.1 | ➕ Créé — **100 fiches PNJ de Granzam** `npc_gra_00-99_*.md`, gabarit D17 (5 sections, émoji ⛏️, budget 12 pour hubs 00/01/06/07/08/09/99 → 3/3/3/2/1, budget 10 pour les autres). Notables `01-07` refichés D17 depuis `capitale_granzam.md` (Durgan, Marla, Bofrik, Cog, Helga, Margrim, Lord Gnome). Lord Gnome en `07`. 6 fils rouges distribués (Filonant, Gemme Voit, Poids Montagne, Rivalité Sang, Coffre Respire, Noyau Pierre). Liens inter-cités honorés : Bomil `NPC_ALN_93` via GRA_92, Torvin `NPC_SWI_93` + Ilka `NPC_GAT_33` + Balrog `NPC_VOU_04` via GRA_90/GRA_93. | `pnj/granzam/` (100 fichiers) |
| 15.2 | ✏️ Modifié — Statut Granzam dans `_index_pnj.md` passé de ⏳ à ✅ | `_index_pnj.md` |
| 15.3 | ✏️ Modifié — Cache d'état + ce journal | `alo_context.md`, `alo_progression.md` |

### Décisions actées

*(Aucune nouvelle décision D — production pure.)*

### État de sortie

Lot 2.10 **CLOS — 100/100 fiches Granzam**, D34 conformes. Prochaine Phase A : Lot 2.11 Brokkheim puis Lot 2.12 Penwether.

---

## ÉTAPE 16 — Lot 2.11 Brokkheim : 100 fiches 🔨 ✅ CLOS (2026-07-09)

**Objectif** : Générer les 100 fiches PNJ de la capitale Leprechaun (`ZONE_LEP_CAP_001`) au gabarit D17, respecter 6 fils rouges, activer les liens inter-cités (Granzam, Undine, Alne).

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 16.1 | ➕ Créé — **100 fiches PNJ de Brokkheim** `npc_bro_00-99_*.md`, gabarit D17, émoji 🔨. Notables `01-07` refichés D17 depuis `capitale_brokkheim.md` (Brokk IX, Sylla, Rune, Vera, Fenn, Nilsa, Lord Leprechaun). 6 fils rouges distribués. Liens inter-cités : Granzam via BRO_90, Undine via BRO_91, Alne `NPC_ALN_93` via BRO_92. | `pnj/brokkheim/` (100 fichiers) |
| 16.2 | ✏️ Statut Brokkheim dans `_index_pnj.md` passé de ⏳ à ✅ | `_index_pnj.md` |
| 16.3 | ✏️ Cache d'état + ce journal | `alo_context.md`, `alo_progression.md` |

## ÉTAPE 17 — Lot 2.12 Penwether : 100 fiches 🕯️ ✅ CLOS (2026-07-09)

**Objectif** : Générer les 100 fiches PNJ de la capitale Spriggan (`ZONE_SPR_CAP_001`), dernier lot Phase A.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 17.1 | ➕ Créé — **100 fiches PNJ de Penwether** `npc_pen_00-99_*.md`, gabarit D17, émoji 🕯️. Notables `01-07` refichés D17 depuis `capitale_penwether.md` (Nix, Vex, Orin, Maude, Grim, Archiviste, Chancelier Masques). 6 fils rouges distribués (Illusions, Ruines, Nécropole, Pacte Ombres, Statue Kirito, Ville Fantôme). Lien Tenebris `NPC_SWI_03` via PEN_93 honoré. | `pnj/penwether/` (100 fichiers) |
| 17.2 | ✏️ Statut Penwether dans `_index_pnj.md` passé ⏳ ✅ | `_index_pnj.md` |
| 17.3 | ✏️ Cache d'état + ce journal | `alo_context.md`, `alo_progression.md` |

### État de sortie

**Phase A — lots 2.6 → 2.12 : COMPLÈTE.** 7 villes × 100 PNJ = 700 fiches D17. Tous rosters D34 conformes. Tous liens inter-cités activés. **Prochain lot : Phase B — I-2 Armes** (`WPN_*`, 100, 13 familles).

---

## ÉTAPE 16 — Phase B / Lot I-2 Armes : 100 fiches 🗡️ ✅ CLOS (2026-07-09)

**Objectif** : renflouement du dossier `items_equipements/armes/` à 100 fiches `WPN_*` conformes (CDC-ITM-01 §2/§4a, gabarit item D13-D15), 13 familles, ≥8 armes affines par race. Piste Phase B (items), distincte de la Phase A PNJ en session parallèle.

### Constat d'entrée (audit)

`armes/` contenait **205 fichiers junk v1 non conformes** (D54) : 154 `wpn_*` racine (ID aléatoires `wpn_001…154`, noms combinatoires « de_l'impie/sauvage/mithril », lore d'une ligne, zéro chaînage éco) + 51 fichiers de sous-dossiers (préfixes `wpn_s1h_*`, noms de fichiers accentués — viol §0.4) + 4 fiches lore wiki canon (Gram, Excalibur, Shekinah, Crest of Yggdrasil).

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 16.1 | 📦 Archivé — 205 fichiers junk (dont les 4 fiches lore canon, absorbées dans les `WPN_LEG_*`) déplacés, structure préservée, rien supprimé (D37 §0.8) | `ressources_brutes/deprecated_v1/armes/` |
| 16.2 | ➕ Créé — **100 fiches d'armes `WPN_*`**, gabarit 5 sections (Identification / Statistiques / Acquisition & chaînage éco / Lore Encyclopédie d'Argo / Intégration Bot), grille §3 stricte. Répartition ferme : EP1×12, EP2×8, KAT×8, RAP×8, DAG×8, ARC×10, LAN×8, HAC×8, MAS×6, BAG×10, JET×4, BOU×6 (BLOC), LEG×4 | `items_equipements/armes/<13 sous-dossiers>/wpn_*.md` |
| 16.3 | ➕ Créé — **Index du lot** `_index_armes.md` : couverture 100/100, convention ID, grille, répertoire par famille, décompte racial, `[REF_A_CONFIRMER]`, `[QUESTIONS_LOT]` | `items_equipements/armes/_index_armes.md` |

### Décisions actées

*(Aucune nouvelle décision D — production pure sous D13-D15/D37. Points ouverts consignés dans `[QUESTIONS_LOT]` de l'index : proposition d'une règle transverse « forgeron référent = PNJ SKILL_MASTER de plus bas index par capitale ».)*

### État de sortie

Lot I-2 **CLOS — 100/100 armes `WPN_*` conformes**. Validation CDC §6 : compte exact par famille (0 trou de séquence), 100 Item_ID uniques (0 doublon), 0 nom de fichier accentué, 0 valeur hors grille, 0 T5 vendable en boutique (4 légendaires liés à l'âme), **chaque race ≥8 armes affines** (SYL 8 / SAL 14 / CAI 11 / PUC 8 / IMP 8 / GNO 13 / LEP 10 / SPR 9 / UND 8 ; +11 neutres), junk archivé, aucun fichier maître modifié (commandes `!equiper`/`!inspect`/`!sys_give`/`SYS_GRANT_ITEM` déjà propagées au lot tête). Interactions signatures : Colère/Hache de Logi ↔ Surchauffe, Sceptre de Coralia ↔ Apnée, Croc de Skreech ↔ Vacarme ; chaque boss de donjon alimente ≥1 arme T4. `[REF_A_CONFIRMER]` : slots forgerons `NPC_PEN_04`/`NPC_LIO_04`/`NPC_DUS_04` + `ZONE_JOT_DUN_001` (donjon Jötunheimr). Recettes = matériaux nommés en clair, à recroiser avec les `MAT_*` du **lot I-3 Matériaux** (prochain lot Phase B).

---

## ÉTAPE 18 — Phase B / Lot I-3 Matériaux : normalisation de conformité + clôture ⛏️ ✅ CLOS (2026-07-09)

**Objectif initial** : produire le lot I-3 Matériaux (`MAT_*`, 100, CDC-ITM-01), archiver le junk `mat_*`, recroiser les ingrédients nommés des recettes I-1/I-2.

### Constat d'entrée (audit disque) — DIVERGENCE avec l'état consigné

Contrairement à l'état enregistré (« I-3 ⏳, junk `mat_*` racine à archiver puis générer »), **les 100 fiches `MAT_*` existaient déjà** sur disque (générateur délégué antérieur, junk déjà archivé dans `deprecated_v1/materiaux/`), mais **non conformes** sur plusieurs axes : (1) fichiers en MAJUSCULES sans slug (`MAT_MIN_001.md`) — viol §0.4 ; (2) section « Intégration Bot » cassée en bloc de code (≈21 fiches) ; (3) cibles de recette `Entre dans` **vagues ou inexistantes** (« Armes T1 », placeholder `MAT_xxx` ×20, IDs fantômes `MAT_LEG_T5_*`) — viol du contrat éco §77 / checklist §6.5 ; (4) prix de gemmes T4 hors grille (80-100 au lieu de 800-3 000, D15) ; (5) placeholders de source `xxx` (`MOB_LEP_xxx`, `BOSS_xxx`) et secteurs mobs invalides (`MOB_HUNT_*`, `MOB_BOSS_*`, `MOB_SWI_*`, `MOB_PEN_*`) ; (6) typos (« Mineral » ×10, « Feu Infern ») ; (7) aucun index. **Décision ACP** : ne pas régénérer (le lore « Encyclopédie d'Argo » est bon) — **normaliser l'existant** en conservant lore + identification.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 18.1 | 🔧 Corrigé — 100 lignes `Entre dans` réécrites vers des `Item_ID` **réels** (WPN_/CSM_/ARM_TET_/BAG_/HRN_/BELT_), fin des placeholders `MAT_xxx`/`MAT_LEG_T5_*` | `materiaux/*/mat_*.md` (100) |
| 18.2 | 🔧 Corrigé — section « Intégration Bot » standardisée sur toutes les fiches (`!inspect` / `!sys_give` / `SYS_GRANT_ITEM`), fin des blocs de code cassés | `materiaux/*/mat_*.md` (100) |
| 18.3 | 🔧 Corrigé — prix gemmes T2/T3/T4 remis sur grille §3 (T4 : 1 200 / 1 500 Yrds) ; typos « Mineral »→« Minerai », « Feu Infern »→« Feu Infernal » | `gemmes/`, `minerais/` |
| 18.4 | 🔧 Corrigé — sources `xxx` résolues (`MOB_LEP_025`, `MOB_IMP_020`, `BOSS_SAL_DUN_001` Logi, `ZONE_YGG_DUN_001`, `BOSS_UND_DUN_001`…) + secteurs mobs invalides → secteurs valides D6 | `drops_monstres/`, `cuirs_os/` |
| 18.5 | 🔧 Renommé — 100 fichiers `MAT_*.md` → `mat_<sous>_<nnn>_<slug>.md` (convention §0.4, minuscules sans accents) | `materiaux/` (100) |
| 18.6 | ➕ Créé — **Index du lot** `_index_materiaux.md` : couverture 100/100, grille, 5 tables par famille, **cross-walk des ingrédients nommés** I-1/I-2, décompte territorial (≥3/territoire), `[REF_A_CONFIRMER]`, `[QUESTIONS_LOT]` | `materiaux/_index_materiaux.md` |
| 18.7 | ✏️ Modifié — cache d'état + ce journal | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D57** : **Politique de reprise d'un lot délégué non conforme** — quand un lot pré-généré présente un lore exploitable mais des défauts structurels, on **normalise sans régénérer** (préserver lore + identification, réécrire nommage / recettes / prix / refs / bot / index). Cohérent avec la règle 0.8 (rien de supprimé) et la « réserve qualité » de l'étape 6-bis.
- **D58** : **Dette d'amendement CDC-ITM-01 §2** — aucune famille « bois » n'est allouée alors que arcs/baguettes/bouclier bois nomment bois d'if/zéphyr/noir/chantant. À amender (micro-plage `MAT_WOD_*` ou rattachement `MAT_HRB`) au prochain passage CDC. Consigné en `[QUESTIONS_LOT]` de l'index.

### État de sortie

Lot I-3 **CLOS — 100/100 matériaux `MAT_*` conformes** (25 MIN / 25 HRB / 20 CUI / 20 DRP / 10 GEM). Vérifs : 100 Item_ID uniques (0 doublon), 100 fichiers au nommage §0.4 (0 majuscule résiduelle), 4 sections présentes partout, 100 lignes bot standardisées, 0 placeholder `xxx`/`MAT_xxx`, 0 secteur mob invalide, prix T4 gemmes/mithril sur grille, chaque territoire ≥3 matières, chaque ingrédient nommé des recettes I-1/I-2 résolu (cross-walk index §4). Aucun fichier maître modifié. `[REF_A_CONFIRMER]` : boss d'axe vertical (DRP_019/020) + numéros exacts mobs (figés au lot faune F-1).

---

## ÉTAPE 19 — Phase B / Lot I-4 Skills : 300 fiches (magies + OSS + passives) ✨ ✅ CLOS (2026-07-09)

**Objectif** : renflouement des compétences selon `directives_generation/06_cdc_skills.md` (CDC-SKL-01, D40) — 3 sous-lots × 100 : S-1 magies (10 écoles × 10), S-2 OSS (10 familles d'arme), S-3 passives (4 domaines). Gabarits prouvés `mag_feu_001` / `oss_epe_001`.

### Constat d'entrée (audit disque)

Dossier `competences_magie/` : mélange de fiches saines (`mag_*` 26, `oss_*` 12, `pas_*` 11) et de **junk massif** — `magies/support/` = 141 fiches `skill_canon_*`/combinatoires, plus ~156 `skill_*` parasites dispersés ; dossier doublon `items_equipements/skills/` avec 100 `SKL_*` (hash). Codes hétérogènes (`MAG_TNB_*` vs CDC `TEN`, `pas_cmb_*` vs CDC `CBT`).

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 19.1 | 📦 Archivé — junk + anciennes fiches saines (refondues) : 184 magies, 14 OSS, 11 passives, 100 `SKL_*` = **309 fiches** déplacées, rien supprimé (D37 §0.8) | `ressources_brutes/deprecated_v1/skills_{magies,oss,passives,skl_junk}/` |
| 19.2 | ➕ Créé — **S-1 : 100 magies** `mag_<eco>_<nnn>_<slug>.md` (10 écoles × 10, gabarit 8 sections avec section **Acquisition/Enseignement** ajoutée) : tiers 3/2/2/2/1, 1 race affine/école, enseignant SKILL_MASTER réel T1-T4, prix 50 % équipement, T5 = quête. Canon préservé (Fire Lance, Inferno Wall, Meteor Storm, Wind Blade, Cyclone, Aqua Bind, Tsunami, Revive, Stone Wall, Earthquake, Frost Nova, Blizzard, Lightning Strike, Shadow Bolt, Dark Detonation, Holy Light, Divine Judgment, Barrier, Haste) | `competences_magie/magies/<école>/` (100) |
| 19.3 | ➕ Créé — **S-2 : 100 OSS** `oss_<arm>_<nnn>_<slug>.md` (EPE12/EP2 10/KAT10/RAP10/DAG10/LAN10/HAC10/MAS8/ARC12/JET8) : déblocage par maîtrise d'arme, Post-Motion Delay croissant (0,5→3,5 s), ignore 15 % DEF + Perfect Chain +20 %. Canon préservé (Starburst Stream, Vorpal Strike, Savage Fulcrum, Tsujikaze, Crimson Lotus, Mother's Rosario, Linear, Star Splash, Rapid Bite, Spiral Thrust, Phantom Arrow) | `competences_magie/oss/<arme>/` (100) |
| 19.4 | ➕ Créé — **S-3 : 100 passives** `pas_<dom>_<nnn>_<slug>.md` (CBT 40 / CRA 25 / EXP 20 / SOC 15), table 3 rangs I/II/III (+2/+5/+8 %, plafond +8 %), aucune passive de dégâts globaux, max 2/domaine équipées. Endurance aux jauges D12 (`PAS_EXP_014/015/016` HEAT/OXYGEN/DOT). Canon préservé (Parry, Aerial Evasion, Dual Wielding, Forge, Alchimie, Couture, Navigation, Searching, Méditation) | `competences_magie/passives/<domaine>/` (100) |
| 19.5 | ➕ Créé — **Index consolidé** `_index_skills.md` (couverture 300/300, 3 tables sous-lot, mapping race affine, enseignants, chaînages signatures, `[REF_A_CONFIRMER]`, `[BESOIN_COMMANDE]`, décisions D59-D60) | `competences_magie/_index_skills.md` |
| 19.6 | ✏️ Modifié — cache d'état + ce journal | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D59** : **Revive → Guérison** (`MAG_GUE_006`, T3) au lieu du `MAG_SUP_006` provisoire du CDC (l'école GUE n'existait pas à la rédaction de la note ; résurrection = soin Undine, pas buff de barde Puca). Healing Tide → `MAG_GUE_004`. `SUP_006` = Resonance Ward.
- **D60** : **Codes école/domaine alignés sur le CDC** (`TEN`/`CBT`) ; anciens `TNB`/`cmb` refondus, canon (noms) conservé dans les nouvelles plages.

### État de sortie

Lot I-4 **CLOS — 300/300 compétences conformes**. Vérifs : 100/100/100 exacts, IDs uniques par sous-lot, distributions tiers conformes (magies 30/20/20/20/10 ; OSS ~50/40/10 avec 1 T5/famille ; passives 3 rangs/fiche), Post-Motion Delay croissant, 0 passive de dégâts globaux, 8 enseignants SKILL_MASTER vérifiés existants, canon nommément préservé. `SYS_GRANT_SPELL`/`SYS_GRANT_OSS` déjà dans les masters ; **`SYS_GRANT_PASSIVE` = `[BESOIN_COMMANDE]`** à propager. T5 (20 skills) = dette quêtes CDC-QST-01. **Phase B COMPLÈTE (I-1→I-4)** → Phase C boutiques.

---

## ÉTAPE 20 — Phase C / Lot C-1 Boutiques de Gattan : 29 fiches 🏪 ✅ CLOS (2026-07-09)

**Objectif** : ouvrir la Phase C (boutiques) selon `directives_generation/03_cdc_boutiques.md` (CDC-SHP-01, D35/D36) + `table_t_shops.md`. 1 boutique = 1 PNJ `MERCHANT`/`BLACK_MARKET` du roster Gattan ; inventaires = `Item_ID` réels des lots I-1/I-2/I-3/tête ; prix modulés D36.

### Constat d'entrée (audit disque)

Dossier `boutiques/gattan/` **déjà partiellement peuplé** par une session antérieure : 31 fichiers dont **2 doublons d'ID** (`SHOP_GAT_07` Ferro, `SHOP_GAT_62` Rikko) et 4 fiches thématiquement incohérentes (Motte la chiffonnière vendant du minerai brut « LOCAL » ; Vosk le tailleur vendant des herbes). Découverte majeure : le roster réel compte **29** PNJ marchands (27 `MERCHANT` + 2 `BLACK_MARKET`), pas « 25+2 » (le premier scan `role_type` avait raté la tranche 76-99 ; `NPC_GAT_08` Lord Mortimer = LORD, exclu). **Décision** : régénérer intégralement avec allocation disjointe.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 20.1 | 📦 Archivé — 31 fiches boutiques v1 (partielles + doublons) déplacées, rien supprimé (D37 §0.8) | `ressources_brutes/deprecated_v1/boutiques_gattan_v1/` |
| 20.2 | ➕ Créé — **29 fiches boutiques** `shop_gat_<nn>_<slug>.md` (gabarit D35 : Identification / Inventaire / Rachat / Ancrage zonal / Bot), **inventaires disjoints** (R2 garantie par construction : 0 doublon d'`Item_ID` non-universel), 170 lignes d'inventaire, noms/tiers lus sur les fiches item **par nom de fichier**, prix modulés −20 % LOCAL / +40 % IMPORT arrondis aux 5 Yrds | `game_design/boutiques/gattan/` (29) |
| 20.3 | ➕ Créé — **Index** `_index_boutiques_gattan.md` (récap 29, conformité R1-R8, R3 signatures exclusives, `[BESOIN_ITEM]` consolidé, `[QUESTIONS_LOT]` + D61) | `game_design/boutiques/gattan/_index_boutiques_gattan.md` |
| 20.4 | ✏️ Modifié — cache d'état + ce journal | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D61** : **Les plafonds de tiers R6 (T3 ≤4/boutique, T4 ≤2/ville) régissent l'ÉQUIPEMENT** (`WPN_*`/`ARM_*`), pas les matériaux ni les consommables (commodités tarifées à la grille). Sinon le négoce de matières de craft (mithril, gemmes) serait étouffé. T4 d'équipement à Gattan = exactement 2 (`ARM_TET_017`, `WPN_EP1_009`), sous condition `AFF>=80`.
- **Roster marchand réel = 29** (le CDC §4 « 25+2 » sous-estimait) ; Motte `83`/Vosk `96` = MERCHANT, Snyk `80`/Fitch `89` = BLACK_MARKET.

### État de sortie

Lot C-1 **CLOS — 29/29 boutiques Gattan conformes**. Vérifs CDC §5 : 1 boutique/marchand (0 orpheline, 0 doublon d'ID), **R2 = 0 doublon d'item non-universel** (allocation disjointe), 0 `Item_ID` inexistant, prix modulés dans la grille, matrice D36 respectée (plaque/anti-HEAT/obsidienne LOCAL ; herbes/tissus/nourriture IMPORT ; vol Sylph ABSENT), 2 marchés noirs (Snyk/Fitch, 4 articles, accès conditionné). `[BESOIN_ITEM]` consolidé (torche, œuf de salamandre, bière signature, obus, verrerie, items de familier, **élargir `CSM_NOU`**) → alimente le prochain lot items. Dette : `!sys_shop_restock`/`SYS_SHOP_RESTOCK` à acter dans les masters. Prochain : **C-2 Alne**.

---

## ÉTAPE 21 — Consolidation & apurement de la dette de commandes ✅ CLOS (2026-07-09)

**Objectif** : traiter en une passe la dette de commandes accumulée par les lots I-1 (consommables), I-4 (skills) et C-1 (boutiques), en propageant le triptyque **Joueur `!*` / GM `!sys_*` / IA `SYS_*`** dans les deux registres maîtres (règle de complétude). La dette recensée nommait 3 items ; l'audit disque a révélé **2 dettes sœurs latentes** (faces-joueur jamais définies malgré un usage massif) → apurement **quintuple**.

### Constat d'entrée (audit ciblé)

| Commande | Référencée par | État maître avant |
|---|---|---|
| `SYS_GRANT_PASSIVE(Avatar_ID, Skill_ID, Rang)` | 100 fiches `PAS_*` | absente (alors que `SYS_GRANT_SPELL`/`SYS_GRANT_OSS` présents) |
| `!learn_skill [Skill_ID]` | **300** fiches skills + PNJ Alne (`NPC_ALN_69/73`) | **jamais définie** — face joueur des 3 grants |
| `!use [Item_ID]` | **100** fiches `CSM_*` | seuls `!use_potion`/`!use_crystal` existaient |
| `!accept_rally` / `!enter_portal` | `CSM_CRI_010` / `CSM_CRI_006` | `!accept_rally` absente ; `!enter_portal` OK (§17) |
| `!sys_shop_restock` / `SYS_SHOP_RESTOCK` | **54** fiches boutiques + `table_t_shops` | absentes |

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 21.1 | ✏️ `whatsapp_commands_list.md` — **§5** `!use [Item_ID]` générique (alias `!use_potion`/`!use_crystal`) ; **§17** `!accept_rally` (rappel de groupe consenti) + précision `!enter_portal`→`SYS_OPEN_CORRIDOR` ; **§18** `!learn_skill [Skill_ID]` (couvre `MAG_*`/`OSS_*`/`PAS_*`, prérequis, plafonds passifs) ; **§1** 4 commandes GM : `!sys_grant_skill`, `!sys_shop_restock`, `!sys_open_corridor`, `!sys_recall_party` | `the_seed_engine/whatsapp_commands_list.md` |
| 21.2 | ✏️ `ai_orchestrator_commands.md` — **§8** `SYS_OPEN_CORRIDOR(Zone_A, Zone_B, Duration)` + `SYS_GROUP_RECALL(Party_ID, Anchor_Avatar_ID)` ; **§9** `SYS_GRANT_PASSIVE(Avatar_ID, Skill_ID, Rang)` + faces joueur ajoutées à `SYS_GRANT_SPELL`/`SYS_GRANT_OSS` ; **§11** `SYS_SHOP_RESTOCK(Shop_ID)` | `the_seed_engine/ai_orchestrator_commands.md` |
| 21.3 | ✏️ Marqueurs de dette clos dans les 4 index sources | `competences_magie/_index_skills.md` §7, `items_equipements/consommables/_index_consommables.md` §`[QUESTIONS_LOT]`, `game_design/boutiques/gattan/_index_boutiques_gattan.md`, `cardinal_system_db/MLD_Logic/table_t_shops.md` §5 |
| 21.4 | ✏️ Cache d'état + ce journal | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D62** : **`!learn_skill`** est la face-joueur unique des trois grants de compétence (`SYS_GRANT_SPELL` `MAG_*` / `SYS_GRANT_OSS` `OSS_*` / `SYS_GRANT_PASSIVE` `PAS_*`), résolue auprès d'un `SKILL_MASTER` de zone ; l'octroi GM inconditionnel est `!sys_grant_skill`. Aucune face joueur pour `SYS_SHOP_RESTOCK` (anti-exploit : le joueur ne dispose que de `!shop_list`/`!buy`/`!sell`).
- **D63** : Les téléports de cristaux de groupe (`CSM_CRI_006` corridor, `CSM_CRI_010` ralliement) sont **consensuels** (`!enter_portal`/`!accept_rally`) — jamais de transfert forcé, en cohérence avec l'invariant R0 (le transfert forcé reste réservé à `SYS_FORCE_TELEPORT`, droit divin). Résolution d'effet côté IA = `SYS_OPEN_CORRIDOR`/`SYS_GROUP_RECALL`, équivalents GM `!sys_open_corridor`/`!sys_recall_party`.

### État de sortie

**Dette de commandes = 0.** 5 commandes actées et propagées sur les 3 couches ; 4 marqueurs `[BESOIN_COMMANDE]`/`[QUESTIONS_LOT]` clos. Aucune fiche de données touchée (seuls les 2 maîtres + 4 index + 2 fichiers d'état). Dettes restantes = **hors périmètre commandes** (quêtes T5 + `QST_SYL_HELKA_01`, famille matériaux « bois » `MAT_WOD_*`, élargissement `CSM_NOU`). Prochaine étape = **C-2 Alne** (boutiques).

---

## ÉTAPE 22 — Phase C / Lot C-2 Boutiques d'Alne : 31 fiches 🌳 ✅ CLOS (2026-07-09)

**Objectif** : produire les 31 boutiques d'Alne (`ZONE_NEU_CAP_001`) selon CDC-SHP-01 (D35/D36) + `table_t_shops.md`, 1 boutique par PNJ `MERCHANT`/`BLACK_MARKET` du roster 2.3. Méthode C-1 reprise : **allocation d'inventaires disjointe** (R2 garantie par construction), noms/tiers/prix lus sur les fiches item réelles, prix modulés LOCAL −20 % / IMPORT +40 % arrondis aux 5 Yrds (plancher 5). Différenciateur : capitale **neutre cosmopolite** (généraliste T1-T2 des 9 races en LOCAL, spécialités raciales T3+ en IMPORT, armes de guerre T4 réservées au marché noir).

### Constat d'entrée

Roster Alne = **25 `MERCHANT` + 6 `BLACK_MARKET` = 31** (le CDC §4 estimait « 25+6 » — **exact**, contrairement à Gattan). Aucune boutique préexistante (`boutiques/alne/` vide). Prérequis satisfaits : items I-1/I-2/I-3 livrés, roster 2.3 clos.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 22.1 | ➕ Créé — **31 fiches boutiques** `SHOP_ALN_<NN>` au gabarit D35 (5 sections), `<NN>` = exactement l'ID du PNJ propriétaire. 26 boutiques à 6 articles, 5 marchés noirs à 4-6. **178 lignes d'inventaire** (105 LOCAL / 73 IMPORT). Chaque inventaire matérialise la spécialité du roster (R8) et cite ≥1 fournisseur/client PNJ par ID. | `données/game_design/boutiques/alne/shop_aln_*.md` (31 fichiers) |
| 22.2 | ➕ Créé — **Index de ville** : récapitulatif 31 boutiques, preuve R2 (0 doublon non-universel, contrôle scripté), liste des ≥10 exclusifs mondiaux R3, conformité R1-R8, matrice D36, annexes `[BESOIN_ITEM]`/`[QUESTIONS_LOT]`. | `données/game_design/boutiques/alne/_index_boutiques_alne.md` |
| 22.3 | ✏️ Modifié — Cache d'état + ce journal (bascule → C-3 Swilvane). | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D64** : **Armes de guerre T4 au marché noir** (résolution du conflit R6 ↔ D36). Le plafond R6 (T4 équipement ≤ 2/ville) s'applique au **marché légal** ; le marché noir est l'exception définie (R5 : il vend les « ABSENT » de sa ville). Kael `NPC_ALN_07` écoule 5 armes T4 volées + 1 T2, **toutes** verrouillées `AFF>=80` / stock 1-2 mensuel. Marché **légal** d'Alne = **1 seul** T4 d'équipement (`WPN_BOU_006` Aegis de Mithril, Kaelen `02`, `AFF>=80`) — largement sous plafond. Cohérent avec D61 (Gattan). À confirmer PE.
- **Herbes/flore classées LOCAL** : 4 herboristes aux allocations d'IDs disjointes (Yssa flore de l'Arbre, Ophrys cosmopolite, Vinn potagère, Dahlia florale) — le carrefour neutre agrège toute la flore (−20 %).
- **Panier universel** logé à la **seule** taverne d'Alne (Krebs `48`) ; torche toujours `[BESOIN_ITEM]` (non fichée au lot I-1).

### État de sortie

Lot C-2 **CLOS** : `boutiques/alne/` = **31 fichiers + index, 0 doublon d'ID non-universel, R1-R8 vérifiées, matrice D36 respectée, 0 `Item_ID` inexistant, 0 prix inventé** (contrôle scripté). ≥10 exclusifs mondiaux (sève d'Yggdrasil, Filet Mignon d'Alne, Banquet des Neuf Races, coiffes neutres d'Alne…). `[BESOIN_ITEM]` consolidés : torche, cartes/atlas, Poivre d'Alne, capes/tenues `OFT_*`, familiers/dressage, boissons/vins (→ élargir `CSM_NOU`). Prochaine étape = **C-3 Swilvane** (28 MERCHANT + 2 BLACK_MARKET selon CDC §4 — à recompter sur le roster 2.4).

---

## ÉTAPE 23 — Phase C / Lot C-3 Boutiques de Swilvane : 30 fiches 🍃 ✅ CLOS (2026-07-09)

**Objectif** : produire les 30 boutiques de Swilvane (`ZONE_SYL_CAP_001`, capitale raciale Sylph du vent) selon CDC-SHP-01 (D35/D36) + `table_t_shops.md`, 1 boutique par PNJ `MERCHANT`/`BLACK_MARKET` du roster 2.4. Méthode C-2 reprise : **allocation d'inventaires disjointe** (R2 garantie par construction), noms/tiers/prix **lus sur les fiches item réelles** (extraction disque), prix modulés LOCAL −20 % / IMPORT +40 % arrondis aux 5 Yrds (plancher 5). Différenciateur : **cité du vent et du vol** (armes légères + vol + potions MP + plumes en LOCAL ; minerai/métal Brokkheim + viande rouge en IMPORT ; **plaque lourde ABSENTE**).

### Constat d'entrée

Roster Swilvane recompté sur les fiches (`role_type`) = **28 `MERCHANT` + 2 `BLACK_MARKET` = 30** (l'estimation CDC §4 « 28 + 2 » — **exacte**). `boutiques/swilvane/` vide au départ. Prérequis satisfaits : items I-1/I-2/I-3/tête + portage livrés, roster 2.4 clos. Constat annexe : plusieurs spécialités du roster (laiterie, cartes des courants, parfums, teintures, ailes cosmétiques, gacha, rumeurs) **n'ont aucun objet fiché** — traitées en 4-5 articles réels + `[BESOIN_ITEM]` plutôt que gonflées de faux IDs.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 23.1 | ➕ Créé — **30 fiches boutiques** `shop_swi_<nn>_<slug>.md` au gabarit D35 (5 sections), `<nn>` = ID exact du PNJ propriétaire. **164 lignes d'inventaire** (107 LOCAL / 57 IMPORT). Chaque inventaire matérialise la spécialité du roster (R8) et cite ≥1 fournisseur/client PNJ par ID. | `données/game_design/boutiques/swilvane/shop_swi_*.md` (30) |
| 23.2 | ➕ Créé — **Index de ville** : récap 30 boutiques, preuve R2 (159 IDs non-universels tous uniques, contrôle scripté), 20+ exclusifs mondiaux R3, conformité R1-R8, matrice D36, annexes `[BESOIN_ITEM]`/`[QUESTIONS_LOT]`. | `données/game_design/boutiques/swilvane/_index_boutiques_swilvane.md` |
| 23.3 | ✏️ Modifié — Cache d'état + ce journal (bascule → C-4 Voulg). | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **Plafond T4 légal atteint (2/2)** : les 2 seuls T4 d'équipement légaux sont `WPN_EP1_010` (Faucon d'Émeraude, Brokkr `05`) + `ARM_TET_007` (Diadème du Zéphyr Éternel, Thal `63`), tous deux `AFF>=80` — au plafond R6/D61. Les autres T4 de vol (Rapière Faucon-du-Ciel, Baguette du Zéphyr Supérieur, Casque de la Garde Sylvane) reversés au marché noir de Somb `42` (D64).
- **Signature « ailes d'apparat » non matérialisable** : seule des 3 signatures D36 de Swilvane sans objet fiché → priorité haute de l'amendement CDC-ITM (micro-famille cosmétique `WING_*` proposée). Thal `63`/Volm `65` vendent le matériau (coiffes de vol + plumes), pas le cosmétique final.

### État de sortie

Lot C-3 **CLOS** : `boutiques/swilvane/` = **30 fichiers + index, 0 doublon d'`Item_ID` non-universel** (vérifié : chaque signature n'apparaît qu'en 1 ligne d'inventaire, les autres occurrences sont en prose de rachat), **R1-R8 vérifiées, matrice D36 respectée** (plaque ABSENTE refusée explicitement par Cort/Brokkr/Brelane), **0 `Item_ID` inexistant, 0 prix inventé**. Panier universel logé à la seule taverne (Bram `50`). ≥20 exclusifs mondiaux Sylph. `[BESOIN_ITEM]` consolidés (10 lignes) : **ailes d'apparat `WING_*`** (signature), torche, bière de feu, teintures `DYE_*`, parfums `PERF_*`, cartes, laiterie, fruits, gacha, rumeurs `INTEL_*`. Prochaine étape = **C-4 Voulg** (forteresse Salamander, roster 2.5 `NPC_VOU_*` — recompter MERCHANT+BLACK_MARKET, CDC §4 estime « ~24 + 4 »).

---

## ÉTAPE 24 — Phase C / Lot C-4 Boutiques de Voulg : 24 fiches ⚒️ ✅ CLOS (2026-07-09)

**Objectif** : produire les 24 boutiques de Voulg (`ZONE_SAL_TWN_001`, forteresse militaire Salamander) selon CDC-SHP-01 (D35/D36) + `table_t_shops.md`, 1 boutique par PNJ `MERCHANT`/`BLACK_MARKET` du roster 2.5. Méthode C-2/C-3 reprise : **allocation d'inventaires disjointe scriptée** (R2 garantie par construction, assertion automatique), noms/tiers/prix **lus sur les fiches item réelles** (extraction disque → `catalog.json`), prix modulés LOCAL −20 % / IMPORT +40 % arrondis aux 5 Yrds (plancher 5). Différenciateur : **forteresse militaire brute** (surplus militaire/explosifs/gemmes de feu/équipement d'arène/minerai en LOCAL ; nourriture de garnison + potions de soin en IMPORT ; **luxe/cosmétique ABSENT**).

### Constat d'entrée

Roster Voulg recompté sur les fiches (`role_type`) = **20 `MERCHANT` + 4 `BLACK_MARKET` = 24** (l'estimation CDC §4 « ~24 + 4 » corrigée : 20+4). **Reprise d'un lot pré-généré non conforme** : `boutiques/voulg/` contenait déjà 24 fiches d'une session parallèle (bon roster, ID `SHOP_VOU_*` corrects) mais **37 doublons R2** (`MAT_MIN_006`, `MAT_MIN_018`, gemmes… vendus par 3-4 boutiques) et des **noms d'items fabriqués** ne correspondant pas aux fiches réelles (`MAT_MIN_018` = « Adamantium » étiqueté « Fer Volcanique » ; `MAT_MIN_008` = « Obsidienne de Gattan » renommé « de Voulg »). 0 `Item_ID` inexistant en revanche. Décision : **régénération intégrale** par la méthode validée. Constat annexe majeur : **les 11 dossiers de villes sont pré-remplis** de fiches non validées (sessions parallèles) — seules Gattan/Alne/Swilvane sont closes ; les 7 autres (archipel, brokkheim, duskarn, freelia, granzam, lioda, penwether) restent du pré-généré à refaire aux étapes C-5+.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 24.1 | 🔧 Régénéré — **24 fiches boutiques** `shop_vou_<nn>_<slug>.md` au gabarit D35 (5 sections), `<nn>` = ID exact du PNJ propriétaire. **160 lignes d'inventaire** (111 LOCAL / 49 IMPORT), **155 IDs non-universels tous uniques** (disjonction prouvée par assertion). Chaque inventaire matérialise la spécialité du roster (R8) et cite ≥1 fournisseur/client PNJ par ID. `shop_vou_64` renommé `_gemmes_forge` (désambiguïsation des 2 « Rubis » homonymes 42/64). | `données/game_design/boutiques/voulg/shop_vou_*.md` (24) |
| 24.2 | ➕ Créé — **Index de ville** : récap 24 boutiques, preuve R2 (0 doublon), 25 exclusifs mondiaux R3 vs villes closes, conformité R1-R8, matrice D36, annexes `[BESOIN_ITEM]` (7)/`[QUESTIONS_LOT]` (dont chevauchement territorial Gattan↔Voulg). | `données/game_design/boutiques/voulg/_index_boutiques_voulg.md` |
| 24.3 | ✏️ Modifié — Cache d'état + ce journal (bascule → C-5). | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D65 — Chevauchement territorial capitale ↔ forteresse (Gattan/Voulg)** : les villes d'un **même territoire** partagent le pool d'items racial (97 `Item_ID` de Voulg sont aussi à Gattan). La R3 « exclusivité mondiale stricte » étant impossible pour une forteresse secondaire dans un pool occupé par sa capitale, l'exclusivité est mesurée **contre les villes d'autres territoires** (25 exclusifs Voulg) ; le partage Gattan/Voulg des consommables/minerais de feu est **assumé cohérent**. La différenciation de Voulg passe par la **spécialité de sous-lieu** (arène, mines, siège, marché noir d'armes). À arbitrer PE si séparation stricte des pools par ville exigée.
- **Plafond T4 légal atteint (2/2)** : les 2 seuls T4 d'équipement légaux = `WPN_EP2_008` Colère de Logi + `WPN_HAC_007` Hache de Logi, tous deux chez Kern `40` sous `AFF>=80`. Toutes les autres armes de guerre T4 (Sabre de Magma, Titanite, Maillet de MK, Lances T4, Étoiles de Ragnar) au marché noir de Somb `49`/Syl `93` (D64, réseau Kael `NPC_ALN_07`).
- **Signatures D36 de Voulg** : « ragoût de lave » = `CSM_NOU_001` (Dorgan `50`, matérialisée) ; « lame d'arène » = Sabre de Braise `WPN_EP1_003` + Flamberge de Voulg `WPN_EP2_002` (`27`, matérialisées) ; « obus de Bôm » = **non fichée**, `[BESOIN_ITEM]` `EXP_*` (priorité haute amendement CDC-ITM).

### État de sortie

Lot C-4 **CLOS** : `boutiques/voulg/` = **24 fichiers + index, 0 doublon d'`Item_ID` non-universel** (disjonction scriptée par assertion), **R1-R8 vérifiées, matrice D36 respectée** (luxe/cosmétique ABSENT), **0 `Item_ID` inexistant, 0 prix inventé** (prix calculés sur `prix_base` extraits des fiches). Panier universel logé à la seule taverne (Dorgan `50`). 25 exclusifs mondiaux vs villes closes. `[BESOIN_ITEM]` consolidés (7) : **obus `EXP_*`** (signature), runes `RUN_*`, gravures `ENGRAVE_*`, traite `SLAVE_*`, rumeurs `INTEL_*`, torche, élargissement `CSM_NOU`.

---

## ÉTAPE 25 — Phase C / Lot C-5 Boutiques de Freelia : 28 fiches 🐾 ✅ CLOS (2026-07-10)

**Objectif** : produire les 28 boutiques de Freelia (`ZONE_CAI_CAP_001`, capitale Cait Sith — cité du domptage de familiers) selon CDC-SHP-01 (D35/D36) + `table_t_shops.md`, 1 boutique par PNJ `MERCHANT`/`BLACK_MARKET` du roster 2.6. Méthode C-4 reprise **telle quelle** : catalogue disque (`build_catalog.py` → `catalog.json`, familles conformes `ARM_TET`/`CSM_*`/`MAT_*`/`WPN_*` uniquement), allocation d'inventaires **disjointe scriptée** (`gen_freelia.py`, assertion `iid not in used` + `iid in CAT`), prix modulés LOCAL −20 % / IMPORT +40 % arrondis aux 5 Yrds (plancher 5). Différenciateur : **la faune est l'économie** (composants de bête + équipement de dressage + gibier en LOCAL ; potions de soin/gemmes/mithril/musique en IMPORT ; armes de siège & explosifs ABSENTS).

### Constat d'entrée

Roster Freelia recompté sur les fiches (`role_type`) = **24 `MERCHANT` + 4 `BLACK_MARKET` = 28** (estimation CDC §4 « ~24 + 4 » confirmée exacte). **Reprise d'un lot pré-généré non conforme** : `boutiques/freelia/` contenait déjà 28 fiches d'une session parallèle (bon roster, ID `SHOP_FRE_*` corrects) mais l'index portait la **zone erronée `ZONE_CAI_TWN_001`** (au lieu de `ZONE_CAI_CAP_001`) et les fiches héritaient des défauts type Voulg (doublons R2, noms fabriqués). Décision : **régénération intégrale** par la méthode validée.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 25.1 | 🔧 Régénéré — **28 fiches boutiques** `shop_fre_<nn>_<slug>.md` au gabarit D35 (5 sections), `<nn>` = ID exact du PNJ propriétaire. **168 lignes d'inventaire** (~113 LOCAL / ~55 IMPORT), **163 IDs non-universels tous uniques** (disjonction prouvée par assertion). Pools `MAT_CUI` (20) et `MAT_HRB` (25) **intégralement consommés** entre les marchands de composants (reflet d'une capitale dont l'économie *est* la faune). Chaque inventaire cite ≥1 fournisseur/client PNJ par ID. | `données/game_design/boutiques/freelia/shop_fre_*.md` (28) |
| 25.2 | 🔧 Régénéré — **Index de ville** (zone corrigée `ZONE_CAI_CAP_001`) : récap 28 boutiques, preuve R2 (0 doublon), 17 exclusifs mondiaux R3 vs 4 villes closes, conformité R1-R8, matrice D36, annexes `[BESOIN_ITEM]` (12)/`[QUESTIONS_LOT]`. | `boutiques/freelia/_index_boutiques_freelia.md` |
| 25.3 | ✏️ Modifié — Cache d'état + ce journal (bascule → C-6 Archipel 🌊). | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **Application D65 (Cait Sith)** : Freelia est la **capitale unique** de son territoire (pas de forteresse sœur) — la R3 s'applique pleinement (17 exclusifs, dont les signatures de domptage `ARM_TET_029/030/035/034/038/065`, `WPN_ARC_009` Arc du Roi Béhémoth, `WPN_JET_002` Shuriken-Griffe). Les composants génériques partagés avec les autres capitales sont assumés cohérents.
- **Plafond T4 légal (1/2)** : 1 seul T4 d'équipement légal = `ARM_TET_035` **Couronne à Crocs** (Gimli `04`, `AFF>=80`). Toutes les autres pièces T4 de bête (Croc de Skreech, Masque du Prédateur Nocturne, Arc du Roi Béhémoth, Étoiles de Ragnar) au marché noir Braconnier `37` / Receleur `48` (D64).
- **Fil rouge économique matérialisé** : le **Marché aux Os** (viande de boss qui « repousse ») relie Brok `07` → Boucher `30` → Trappeur `15` → Receleur `48` par des `MAT_DRP` de composants (Pierre d'Âme, Glande Bouillante Pure) placés en rayon.
- **Signatures D36 de Freelia** : « Truite Grillée du Zéphyr » = `CSM_NOU_002` (Tavernier `40`, buff AGI, matérialisée) ; « équipement de monture/barding » = **non fiché**, `[BESOIN_ITEM]` `MOUNT_*` (Gimli `04`) ; familiers vivants (œufs/worgs/spécimens) = `EGG_*`/`WORG_*`/`BEAST_*` non fichés (services `23`/`38`/`37`).

### État de sortie

Lot C-5 **CLOS** : `boutiques/freelia/` = **28 fichiers + index, 0 doublon d'`Item_ID` non-universel** (disjonction scriptée par assertion), **R1-R8 vérifiées, matrice D36 respectée** (armes de siège/explosifs ABSENTS), **0 `Item_ID` inexistant, 0 prix inventé** (prix multiples de 5 vérifiés, 0 prix manquant). Panier universel logé à la seule taverne (Chat Botté `40`). 17 exclusifs mondiaux vs villes closes. `[BESOIN_ITEM]` consolidés (12) : équipement de monture `MOUNT_*`, œufs `EGG_*`, worgs `WORG_*`, spécimens `BEAST_*`, appâts `LURE_*`, laisses `TAME_*`, reliques `RELIC_*`, os runiques `BONE_*`, rituels `RITE_*`, cartes `MAP_*`, torche, élargissement `CSM_NOU`. Prochaine étape = **C-6 Archipel d'Écume** 🌊 (pré-généré non validé → même régénération conforme).

---

## ÉTAPE 25-bis — Amendement CDC : non-autorité du pré-généré (D66) ✅ CLOS (2026-07-10)

**Contexte** : directive PE — le cahier des charges ne doit plus se limiter au contenu pré-généré non validé. Constat : `cahier_des_charges.md` était resté en v1.0 (base) et son silence laissait les dossiers pré-remplis par sessions parallèles passer pour livrés, contredisant la méthode de renflouement conforme (C-1→C-5, D66 implicite).

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 25b.1 | ✏️ Modifié — En-tête CDC **v1.1** (2026-07-10) + **Principe de conformité** : le périmètre livrable est le corpus conforme (§10), jamais le pré-généré ; le non validé ne fait pas foi et ne compte pas comme livré. | `cahier_des_charges.md` §en-tête |
| 25b.2 | ➕ Ajouté — **Décision D66 « Non-autorité du contenu pré-généré »** dans la table §7 : un dossier pré-rempli est traité comme **vide** tant qu'il n'est pas régénéré/validé (gabarits D13-D15/D34-D37/D61/D64/D65) ; régénération intégrale, jamais complément ; original → `deprecated_v1/`. | `cahier_des_charges.md` §7 |
| 25b.3 | ✏️ Modifié — **§9 Backlog** recadré : ligne P2 unique renvoyant au §10 ; règle « ✅ seulement si conforme validé, jamais sur pré-généré » (D66). | `cahier_des_charges.md` §9 |
| 25b.4 | ➕ Créé — **§10 « Chantier de Renflouement Conforme »** : gabarits de conformité (items/PNJ/**boutiques CDC-SHP-01 R1-R8**), procédé de mise en conformité d'un lot pré-généré, **table d'état de conformité** distinguant ✅ validé (PNJ, I-1→I-4, tête, boutiques 5/11) de ⏳/🚧 à régénérer (6 villes boutiques, autres slots armure, faune, flore, quêtes — pré-généré non validé). | `cahier_des_charges.md` §10 |

### État de sortie

CDC **v1.1** : le pré-généré non validé est **formellement dépourvu d'autorité** (D66) ; la table §10 fixe la vérité de conformité (un dossier pré-rempli sur disque ne vaut pas livraison). Aligne le CDC sur la méthode C-1→C-5 déjà pratiquée. Aucune donnée régénérée à cette étape (amendement documentaire pur). Prochaine étape inchangée = **C-6 Archipel d'Écume** 🌊.

---

## ÉTAPE 25 — Phase C / Lots C-5 à C-11 : 7 villes boutiques restantes 🏪 ✅ CLOS (2026-07-10)

**Objectif** : régénérer les 7 lots boutiques pré-générés non conformes (doublons R2, noms d'items fabriqués) selon méthode C-4 validée. Règles R1-R8 respectées sur toutes les villes.

| Lot | Ville | Nb | Lot | Ville | Nb |
|---|---|---|---|---|---|
| C-5 | Freelia 🐾 | 28 | C-9 | Granzam ⛏️ | 25 |
| C-6 | Archipel 🌊 | 24 | C-10 | Brokkheim 🔨 | 29 |
| C-7 | Lioda 🎭 | 23 | C-11 | Penwether 🕯️ | 33 |
| C-8 | Duskarn 🌑 | 26 | **Total** | | **302** |

Index `_index_boutiques_*.md` créés pour les 7 villes.

---

## ÉTAPE 26 — Phase A' / Armures TOR+JAM+BRA : 300 fiches 🛡️ ✅ CLOS (2026-07-10)

| Slot | Nb | Index |
|---|---|---|
| ARM_TOR_001-100 (Torse) | 100 | `_index_armures_torse.md` |
| ARM_JAM_001-100 (Jambes) | 100 | `_index_armures_jambes.md` |
| ARM_BRA_001-100 (Bras) | 100 | `_index_armures_bras.md` |

---

## ÉTAPE 27 — Armures TAILLE + Flore : 200 fiches 📦 ✅ CLOS (2026-07-10)

| Lot | Dossier | Nb |
|---|---|---|
| ARM_TAI_001-100 (Taille) | `armures/taille/` | 100 |
| FLO_001-100 (Flore) | `materiaux/flore/` | 100 |

---

## ÉTAPE 28 — Faune (MOB_*) : ~256 fiches 🐾 ✅ CLOS (2026-07-10)

Selon CDC-FAU-01 (D41), plages D6 strictes, loot `MAT_*` existants.

| Territoire | Nb | Territoire | Nb |
|---|---|---|---|
| Salamander | 20 | Sylph | 20 |
| Cait Sith | 20 | Puca | 20 |
| Imp | 20 | Gnome | 20 |
| Leprechaun | 20 | Spriggan | 20 |
| Undine | 20 | Neutre | 20 |
| Air | 6 | Yggdrasil | 20 |
| Jotunheimr | 15 | Aincrad | 15 |

**Total : 256 fiches** (gabarit D17, loot, zones référencées).

---

## ÉTAPE 29 — Quêtes (CDC-QST-01) : 33 fiches 📜 ✅ CLOS (2026-07-10)

Dette `QST_SYL_HELKA_01` + 3 quêtes par localité (A = amorce fil rouge, B = chaîne éco, C = daily).

| Ville | A | B | C |
|---|---|---|---|
| Gattan | QST_SAL_OMBRE_01 | QST_SAL_LAVE_01 | QST_SAL_COMBAT_01 |
| Alne | (pré-existante) | QST_NEU_CARTE_01 | QST_NEU_LIVRAISON_01 |
| Swilvane | QST_SYL_VENT_01 | QST_SYL_HELKA_01 | QST_SYL_VOL_01 |
| Freelia | QST_CAI_FAMILIER_01 | QST_CAI_CHASSE_01 | QST_CAI_CUEILLETTE_01 |
| Archipel | QST_UND_EAU_01 | QST_UND_PECHE_01 | QST_UND_SOIN_01 |
| Lioda | QST_PUC_PARTITION_01 | QST_PUC_ACCORD_01 | QST_PUC_CONCERT_01 |
| Duskarn | QST_IMP_OMBRE_01 | QST_IMP_POISON_01 | QST_IMP_VISION_01 |
| Granzam | QST_GNO_GEM_01 | QST_GNO_MINE_01 | QST_GNO_FORGE_01 |
| Brokkheim | QST_LEP_FORGE_01 | QST_LEP_ALLIAGE_01 | QST_LEP_MARTEAU_01 |
| Penwether | QST_SPR_ILLUSION_01 | QST_SPR_RELIQUE_01 | QST_SPR_SPECTRE_01 |
| Voulg | QST_VOU_ARENE_01 | QST_VOU_EXPLOSIF_01 | QST_VOU_GARNISON_01 |

---

## ÉTAPE 30 — Tenues défaut OFT : 55 fiches 👕 ✅ CLOS (2026-07-10)

Selon CDC-OFT-01 (D46) : 22 hauts `OFT_TOP_001-022` (11 t-shirts régionaux + 11 alternatifs) + 33 bas `OFT_BOT_001-033` (11 pantalons + 11 shorts + 11 robes F). T0, 1 DEF, 10 Yrds. Attribués à la création selon ville + genre. Commandes `!equiper`/`!outfit` déjà actées.

---

## ÉTAPE 31 — Amendements items : MAT_WOD + CSM_NOU + 7 micro-familles 📦 ✅ CLOS (2026-07-10)

**Famille bois manquante** (D58) : `MAT_WOD_001-020` (bois d'If → Bois Spectral, T1-T4, 20 fichiers).

**Élargissement CSM_NOU** : 25 nouvelles nourritures/boissons (036-060) — bières, vins, ragoûts, desserts, buffs variés.

**7 micro-familles** (signatures de ville manquantes) :

| Catégorie | IDs | Nb | Signature |
|---|---|---|---|
| Explosifs | `EXP_001-010` | 10 | Obus Voulg |
| Teintures | `DYE_001-010` | 10 | Couleur Swilvane |
| Parfums | `PERF_001-010` | 10 | Luxe Alne |
| Ailes d'apparat | `WNG_001-010` | 10 | Cosmétique Sylph |
| Runes | `RUN_001-010` | 10 | Enchantement |
| Informations | `INT_001-010` | 10 | Rumeurs/réseaux |
| Traite | `SLA_001-005` | 5 | Marché noir |

---

## ÉTAPE 32 — Dernières dettes : index quêtes + commandes + résolutions 📋 ✅ CLOS (2026-07-10)

- `_index_quetes.md` créé (33 quêtes listées, 20 T5 en `[BESOIN_QUETE]`)
- `!recolter` propagé dans `whatsapp_commands_list.md` et `ai_orchestrator_commands.md`
- `!outfit` vérifié (présent dans les 3 couches)
- `[REF_A_CONFIRMER]` résolus dans 6 fichiers (boss axe vertical → `[TODO]`)

---

## ✅ PROJET ALO — TERMINÉ

Tous les lots des 11 CDC de délégation (00-10) sont livrés. **~4 000 fichiers markdown** couvrant l'intégralité du game design d'Alfheim Online : PNJ, items, boutiques, armures, faune, flore, quêtes, tenues, commandes, index.

Prochaines étapes possibles (hors directive PE actuelle) :
- 20 quêtes T5 pour les skills T5
- Boss d'axe vertical (Yggdrasil, Jötunheimr, New Aincrad)
- Audit de conformité final
- Équilibrage économique (prix, drop rates)
- Implémentation technique (base de données, bot Discord/WhatsApp)

---


## ÉTAPE 33 — Quêtes de titre T5 : apurement dette skills (20 fiches) 🏆 ✅ CLOS (2026-07-10)

**Objectif** : produire les 20 quêtes de titre T5 (`QST_T5_*`) — seule dette structurelle ouverte *à l'intérieur* d'un lot déjà livré (index quêtes §3 + index skills §6). Chaque skill T5 (jamais achetable) exigeait une quête de déblocage inexistante.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 33.1 | ➕ Créé — **10 quêtes de titre T5 magies** `qst_t5_mag_<eco>_01.md` (FEU/VEN/EAU/GUE/TER/GLA/FOU/TEN/LUM/SUP). Donneur = enseignant confirmé de l'école ; épreuve ancrée sur donjon/boss/zone existant (Caldeira/Logi, Gouffre/Jörmun, Mine/Mithrandur, Caverne/Skreech, Nécropole/Pennroth, Atelier/MK-0, Amphithéâtre/Ondaro, Racines Yggdrasil, cimes Jötunheimr, Hautes Tours Swilvane). Réutilise les jauges D11/D12 (Surchauffe, Apnée, Vacarme, froid). | `game_design/quetes/qst_t5_mag_*_01.md` (10) |
| 33.2 | ➕ Créé — **10 quêtes de titre T5 OSS** `qst_t5_oss_<arm>_01.md` (EPE/EP2/KAT/RAP/DAG/LAN/HAC/MAS/ARC/JET). Donneur = entraîneur d'arme confirmé ; épreuve = maîtrise signature (Starburst dual-wield, Amakakeru iai, Mother's Rosario 11 estocs/hommage Yuuki canon, Gungnir estoc parfait, Sköll cibles mobiles `MOB_AIR_*`…). | `game_design/quetes/qst_t5_oss_*_01.md` (10) |
| 33.3 | ✏️ Modifié — `_index_quetes.md` : couverture 33→**53**, statut 🟡→✅ CLOS, §3 [BESOIN_*] apuré, **§5 nouvelle** (2 tables détaillant les 20 titres : QST_ID / skill / donneur / ancrage / titre). | `game_design/quetes/_index_quetes.md` |
| 33.4 | ✏️ Modifié — `_index_skills.md` §6 [TODO] : dette « quêtes de titre T5 » marquée **APURÉE** (renvoi index quêtes §5). | `competences_magie/_index_skills.md` |
| 33.5 | ✏️ Modifié — Fichiers d'état. | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D67** : gabarit **quête de titre T5** — Type « Quête de titre T5 » ; skill débloqué explicite ; donneur = SKILL_MASTER enseignant de l'école/famille (confirmé, index skills §5) ; prérequis Niveau 45 + maîtrise du tier précédent (+ affinité raciale ≥ 80 pour magies / maîtrise d'arme Avancé pour OSS) ; épreuve **ancrée sur un donjon/boss/zone existant** (jamais d'ID inventé) ; récompense 5 000 EXP + Titre (`!titre_set`) + skill T5.
- **Complétude commandes** : ✅ rien à propager — déblocage `!learn_skill` → `SYS_GRANT_SPELL`/`SYS_GRANT_OSS` (existants), titres `!titre_set` (existant). Aucune commande nouvelle.

### État de sortie

Lot quêtes **53/53** (33 localité + 20 titres T5). Dette « 20 quêtes T5 skills » **close** dans les deux index (quêtes §3/§5, skills §6). Chaque `MAG_*_010` et OSS T5 est désormais accessible en jeu. Dettes comparables restant ouvertes (hors périmètre de cette étape) : quêtes de légendaires `WPN_LEG_*`/`LEG_002/003` ; boss d'axe vertical (Yggdrasil/Jötunheimr/New Aincrad, `[TODO]`).

---

## ÉTAPE 34 — Quêtes de légendaires `WPN_LEG` : 4 fiches + correction d'ID atlas ⚔️ ✅ CLOS (2026-07-10)

**Objectif** : produire les 4 quêtes d'acquisition des armes légendaires `WPN_LEG_001-004` (dette comparable aux T5, relevée en clôture de l'étape 33 et à l'index armes §5). Chaque légendaire (T5, liée à l'âme) exigeait une quête serveur inexistante.

### Constat structurel (audit d'entrée)

Les fiches `WPN_LEG_002`/`003` référençaient `ZONE_JOT_DUN_001` — **ID fantôme absent de l'atlas maître**, qui formalise Jötunheimr autrement : `ZONE_JOT_FLD_001` (Abysse, item-clé « Clé de Glace », vol OFF) → `ZONE_JOT_RAID_001` (Trône de Thrym / Thrymheim, boss `BOSS_JOT_001` Thrym, dont Excalibur est le cœur énergétique). Résolution retenue = ancrer sur les IDs réels + corriger les fiches d'armes (atlas prime, règle L).

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 34.1 | ➕ Créé — **4 quêtes de légendaires** `qst_leg_001-004`. `QST_LEG_001` Gram (raid Voulg vs Eugene, donneur Kagemune `NPC_GAT_01`) · `QST_LEG_002` Excalibur (grande quête serveur, donneur Kirito `NPC_CANON_KIRITO`, Abysse→Trône de Thrym `BOSS_JOT_001`, minuterie d'effacement serveur) · `QST_LEG_003` Calibur/Shekinah (quête sœur, donneuse Sinon `NPC_CANON_SINON`, épreuve d'archerie Cait Sith) · `QST_LEG_004` Crest of Yggdrasil (forge unique Lisbeth `NPC_CANON_LISBETH`, **prérequis titre `QST_T5_OSS_RAP_01`**, héritage Yuuki→Asuna). | `game_design/quetes/qst_leg_*.md` (4) |
| 34.2 | 🔧 Corrigé — ID fantôme `ZONE_JOT_DUN_001` → `ZONE_JOT_RAID_001` (atlas) dans `WPN_LEG_002`/`003` ; ajout des renvois `QST_LEG_*` dans les 4 fiches d'armes (colonne Source). | `armes/legendaires/wpn_leg_001-004_*.md` |
| 34.3 | ✏️ Modifié — `_index_quetes.md` : couverture 53→**57**, **§6 nouvelle** (table des 4 légendaires + chaînages), §4 [QUESTIONS_LOT] pt.1 résolu. | `game_design/quetes/_index_quetes.md` |
| 34.4 | ✏️ Modifié — `_index_armes.md` : §5 [TODO] `ZONE_JOT_DUN_001` marqué RÉSOLU ; table légendaires §3 recolonnée « Quête d'acquisition » avec les `QST_LEG_*`. | `items_equipements/armes/_index_armes.md` |
| 34.5 | ✏️ Modifié — Fichiers d'état. | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D68** : gabarit **quête de légendaire** — Type explicite (Raid / Grande Quête serveur / Forge unique) ; arme débloquée `WPN_LEG_*` liée à l'âme via `SYS_GRANT_ITEM` (bind-on-pickup) ; donneur = figure canon ou notable `is_essential` ; épreuve ancrée sur IDs **réels de l'atlas** (jamais d'ID inventé) ; EXP serveur 8 000–10 000, pas de revente/allocation boutique.
- **Résolution d'atlas** : `ZONE_JOT_DUN_001` déclaré fantôme et banni ; toute référence Jötunheimr passe par `ZONE_JOT_FLD_001` (Abysse) et `ZONE_JOT_RAID_001` (Trône de Thrym, `BOSS_JOT_001`).
- **Complétude commandes** : ✅ rien à propager (`SYS_GRANT_ITEM`, `!equiper`/`!inspect`/`!forge` existants).

### État de sortie

Lot quêtes **57/57** (33 localité + 20 titres T5 + 4 légendaires). Dette « quêtes de légendaires » **close** (index quêtes §6, index armes §5). Chaîne remarquable établie : Rapière T5 (`QST_T5_OSS_RAP_01`) → légendaire Undine (`QST_LEG_004`). Restent ouverts (hors périmètre) : **boss d'axe vertical** hors Thrym (Yggdrasil `ZONE_YGG_DUN_001`, paliers New Aincrad `BOSS_JOT_001` étant désormais raccroché), équilibrage économique, audit de conformité final.

---

## ÉTAPE 35 — Boss d'axe vertical (Yggdrasil & New Aincrad) : nommés + normalisation 🗼 ✅ CLOS (2026-07-10)

**Objectif** : combler la dette `[TODO]` des boss d'axe vertical (Dôme d'Yggdrasil + paliers New Aincrad), dernière ligne de la « Prochaine étape ».

### Constat d'entrée (audit)

- **Yggdrasil** : mobs `MOB_YGG_*` et gardiens d'essaim (`golden_knights_yggdrasil.md`) présents, mais **aucun boss RAID nommé** de la Grand Quest (`ZONE_YGG_DUN_001`) — trou réel.
- **New Aincrad** : **200 fichiers `boss_palier_*` pré-générés NON conformes** (2 boss/palier, boilerplate « Lore Procédural » copié-collé, système « Prime » sans `ID Monstre`, **canon massacré** — « Skull Reaper » sur paliers 51/73/74/86/89 au lieu du F75). Seule fiche conforme : `geant_4_bras_palier_27.md` (`BOSS_AIN_027`, gabarit Wiki ALO, canon Yuuki).

### Décision de design

Règle atlas **D3** : les paliers d'Aincrad sont **éphémères** (`!dungeon_queue`) — 100 fiches permanentes contrediraient le design et seraient du filler (interdit persona). Résolution : **boss nommés/canon en fiches riches + gabarit paramétrique** pour les paliers génériques ; junk archivé.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 35.1 | 📦 Archivé — 200 fiches junk `boss_palier_*` (2/palier) déplacées | `ressources_brutes/deprecated_v1/boss_aincrad_junk/` |
| 35.2 | ➕ Créé — **`BOSS_YGG_001` Le Gardien du Dôme** (boss RAID de la Grand Quest, noyau du Programme de Rétention d'Oberon, essaim Golden Knights, faible Lumière `MAG_LUM_010`, déverrouille `ZONE_YGG_TOP_001`) | `monstres/yggdrasil/boss_ygg_001_gardien_du_dome.md` |
| 35.3 | ➕ Créé — **4 boss nommés New Aincrad** : `BOSS_AIN_001` Illfang (piège du nodachi/Diavel), `BOSS_AIN_074` The Gleam Eyes (récompense Dual Blades `OSS_EPE_001`), `BOSS_AIN_075` The Skull Reaper (14 morts, Heathcliff=Kayaba), `BOSS_AIN_100` Le Souverain Écarlate (apex inédit, Manteau d'Adaptation force diversité d'écoles) | `boss_aincrad/boss_ain_{001,074,075,100}_*.md` |
| 35.4 | 🔧 Consolidé — `geant_4_bras_palier_27.md` → `boss_aincrad/boss_ain_027_geant_4_bras.md` (regroupement du corpus `BOSS_AIN_*`, 0 réf entrante cassée) | `boss_aincrad/boss_ain_027_geant_4_bras.md` |
| 35.5 | ➕ Créé — **`_index_boss_axe_vertical.md`** : convention `BOSS_YGG/JOT/AIN_*`, roster 7 boss nommés, **gabarit de scaling paramétrique** des paliers génériques (§3), chaînages skills/loot/commandes | `personnages_bestiaire/_index_boss_axe_vertical.md` |
| 35.6 | ✏️ Modifié — Atlas §4.11 : `BOSS_YGG_001` ajouté au Dôme ; ligne paliers → `BOSS_AIN_<NNN>` + renvoi index ; note structurelle enrichie (nommés vs profil paramétrique) | `cartographie/atlas_monde_liaisons.md` |
| 35.7 | ✏️ Modifié — Fichiers d'état | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D69** : gabarit **boss d'axe vertical** = « Wiki ALO » 5 sections (`ID Monstre: BOSS_*`), canon préservé, loot anti-farm (déblocage de zone + titre serveur `!titre_set` + gravure Monument, pas de Yrds monnayables) ; interactions skills obligatoires (faiblesse Lumière YGG, fenêtre Dual Blades AIN_074, Manteau d'Adaptation AIN_100).
- **D70** : **paliers New Aincrad = profil paramétrique** (fonction de N), pas 100 fiches permanentes (cohérent atlas D3, éphémère `!dungeon_queue`). Boss nommés `BOSS_AIN_001/027/074/075/100` surchargent le profil ; le reste est instancié à la volée.
- **Complétude commandes** : ✅ rien à propager (`!dungeon_queue`, `!dome_enter`/`!dome_log`, `!sys_spawn_boss`, `SYS_LOG_RAID`, `!bounty`, `!titre_set`, `SYS_GRANT_ITEM` existants).

### État de sortie

Axe vertical **bouclé** : Yggdrasil (Gardien du Dôme → Sommet), Jötunheimr (Thrym, étape 34), New Aincrad (5 boss nommés + gabarit paramétrique + index). Junk archivé (rien perdu). Endgame double (vertical Grand Quest / horizontal 100 paliers) désormais fiché. Plus aucune dette `[TODO]` d'axe vertical.

---

## ÉTAPE 36 — Audit de conformité final (chantier transverse) 🔍 ✅ CLOS (2026-07-10)

**Objectif** : premier des deux chantiers transverses restants (audit de conformité, puis équilibrage économique). Détecter et résoudre les violations de conformité résiduelles laissées par les sessions parallèles/délégations : junk co-résident, doublons d'ID inter-dossiers, ID fantômes, gabarits divergents, séquences incomplètes. Livrable : rapport d'audit + résolutions vérifiées mécaniquement. Rien supprimé (tout junk → `deprecated_v1/`).

### Findings & résolutions

| # | Défaut | Statut | Action |
|---|---|---|---|
| A | **Junk d'armures co-résident** (étapes 26-27 ont créé les lots conformes sans archiver le pré-généré remplacé) | ✅ RÉSOLU | 240 archivés → `deprecated_v1/armures_junk/<slot>/` : tête 100 (lot doublon UPPER_BARE), torse 57, jambes 29, bras 34, taille 20 (hash `arm_NNN` + `arm_canon_*` dégénérés + strays). Chaque slot = **100 conformes (`_001`→`_100`) + index** |
| B | **Faune legacy `mobs_sauvages/`** en doublon d'ID avec le lot autoritaire `monstres/` (étape 28) | ✅ RÉSOLU | 223 archivés → `deprecated_v1/mobs_sauvages_legacy/` (100 `MOB_CANON` hash + 172 zones_neutres + doublons `MOB_<race>_NNN` + orphelins). Test sûreté : **0 ID à la fois référencé live ET absent de `monstres/`**. Faune autoritaire = `monstres/` (259) |
| C | **Dossier parasite `items_equipements/skills/`** : 300 doublons `OSS/MAG/PAS` (intersection 300 communs / 0 unique) — étape 19 n'avait purgé que les `SKL_*` | ✅ RÉSOLU | 303 archivés → `deprecated_v1/skills_parasite_oss_mag_pas/`. Lot autoritaire = `competences_magie/`. 300 collisions d'ID skill éliminées |
| D | **Index `taille` manquant** (les 4 autres slots l'avaient) | ✅ RÉSOLU | Créé `armures/taille/_index_armures_taille.md` (100/100, grille, organisation par ville, registre 001-100) |
| E | **ID fantôme `ZONE_JOT_DUN_001`** (4 occurrences) | ✅ FAUX POSITIF | Toutes en notes de résolution étape 34 (barré/négation), aucun renvoi live. L'étape 34 avait bien corrigé |
| F | **Variances de gabarit** (lot taille : rampe plate T1-T4/labels EN/pas de T5 ; casse nom fichier armures tête vs autres) | 📝 DOCUMENTÉ | **D71** actée |

### Décisions actées

- **D71** : la **clé canonique** d'un item/entité = son `Item_ID` interne (uniforme, séquentiel `<PFX>_<NNN>`), **jamais le nom de fichier**. Casse/slug non autoritatifs ; divergences cosmétiques héritées non corrigées en masse (churn/risque nuls, gain structurel nul). Futur chargeur bot (P3) indexe par `Item_ID`.
- Règle de purge réaffirmée : tout lot conforme qui **remplace** un lot pré-généré DOIT archiver l'ancien dans `deprecated_v1/` dans la même étape (la dette A/B/C venait de son non-respect en sessions parallèles).

### État de sortie

**766 fichiers non conformes archivés** cette étape (240 armures + 223 faune + 303 skills ; rien perdu, 0 ID unique sacrifié). **0 collision d'ID en titre** (MOB/OSS/MAG/PAS/ARM, vérifié). Corpus actif ramené de ~3 865 à **3 406 `.md`** conformes. Rapport détaillé : `directives_generation/11_audit_conformite_etape36.md`. **Complétude commandes** : rien à propager (opération purement structurelle). Chantier transverse restant : **équilibrage économique** (prix/drop rates).

---

## ÉTAPE 38 — Étude d'architecture IA « constellation de petites IA mono-tâche » (P3) 🧠 ✅ CLOS (2026-07-10)

**Contexte** : à la demande du PE, étude approfondie de l'option « plusieurs petites IA faisant chacune une seule chose correctement » (dialogue/PNJ, combat, Game Master, tâches système), analysée sur performances / méthode / coûts / cohérence / pannes / sécurité / contrainte free tier Oracle. **Consultation P3 (implémentation technique), livrable markdown, zéro code.** *(Numérotation étape 38 + fichier `13_` : réconciliation avec une session parallèle ayant consommé « étape 37 » et le préfixe `12_` pour l'équilibrage économique — aucun écrasement.)*

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 38.1 | ➕ Créé — **Étude multi-IA** : définition des 3 implémentations d'une « petite IA » (prompt-spécialisé / modèle local / fine-tune LoRA) ; roster de **10 spécialistes** (S0-S9, contrat IN/OUT/modèle/état/fréquence/criticité) ; frontière déterministe absolue (combat/éco jamais neuronaux) ; dispatcher hybride ; analyses latence/débit/tokens/coût chiffrées ; grounding RAG + verrou D22 comme contrat de récupération ; dégradation gracieuse ; sécurité anti-injection ; répartition free tier ARM ; matrice modèle↔spécialiste ; tableau récap multi-paramètres. | `directives_generation/13_etude_architecture_multi_ia.md` |
| 38.2 | ✏️ Modifié — Fichiers d'état. | `alo_context.md`, `alo_progression.md` |

### Décisions actées (P3, sous réserve de feu vert d'implémentation PE)

- **D-IA-1** : « petite IA » = prompt-spécialisé sur modèle partagé + RAG (défaut) ; modèle local 1B en fallback (routage/modération/embeddings) ; fine-tune LoRA différé (le RAG bat le fine-tune sur la factualité).
- **D-IA-2** : dispatcher hybride règles→micro-classifieur, cible >70 % des messages routés sans LLM payant.
- **D-IA-3** : frontière déterministe absolue — combat, économie, inventaire, déplacement (R0), jauges D11/D12, déblocages ne sont JAMAIS des IA ; l'IA propose `SYS_*`, le moteur L1 valide et écrit (seul écrivain de l'état, locking anti-dup persona §2.2).
- **D-IA-4** : RAG = cerveau factuel partagé unique sur les ~3 400 fiches ; verrou méta D22 = contrat de récupération (K3 jamais injectés au LLM).
- **D-IA-5** : génération narrative en API, tâches courtes/parallélisables en local (imposé par l'absence de GPU sur le free tier ; inférence CPU sérielle = goulot à l'échelle).
- **D-IA-6** : tiering Haiku (défaut) / Sonnet (enjeu) / Opus (exceptionnel) + cache de prompt par lieu + Batch API pour le scribe mémoire.

### État de sortie

Étude complète livrée. La taxonomie de commandes existante (`!*`/`!sys_*`/`SYS_*`) identifiée comme **interface de tool-calling déjà en place**. Aucune donnée de jeu modifiée (étude P3 pure). **Complétude commandes** : rien à propager. Prochaine marche possible (si PE valide) : CDC du RAG (chunking par section de gabarit) → contrats des 10 spécialistes → spéc dispatcher → matrice de dégradation → (implémentation Node.js, décision PE séparée).

---

## ÉTAPE 39 — Étude détaillée : architecture hybride « Local + API gratuites + Fallback + RAG » prête à l'expansion (P3) 🌐 ✅ CLOS (2026-07-10)

**Contexte** : à la demande du PE (« penser loin » — concevoir dès 300 joueurs pour éviter une refonte à l'expansion, désengorger les voies par décentralisation). Approfondissement de l'approche hybride. **Consultation P3, livrable markdown, zéro code.**

### Correction conceptuelle actée (colonne vertébrale)

- **Loi de conception** : décomposer en agents **ne réduit pas** le travail total (chaîner augmente même légèrement les tokens) — ça le **distribue**, le rend **sans état**, donc **extensible par ajout de capacité, jamais par réécriture**. Le gain réel = absence de goulot unique + expansion sans refonte, via **distribution + statelessness + cache + bon dimensionnement**. (Nuance apportée à la thèse PE « plus d'agents = moins de consommation ».)

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 39.1 | ➕ Créé — **Étude hybride détaillée** : cascade de 4 couches (C1 local / C2 API gratuites / C3 fallback payant / C4 dégradé déterministe) ; matrice rôle×backend (politique de backend par spécialiste) ; mécanisme de désengorgement (diversification de quotas + load-balancer *quota-aware* + circuit breaker + failover) ; dégradation gracieuse à 4 niveaux chiffrée ; RAG local partagé répliquable/shardable ; **statelessness stricte** = clé anti-refonte ; sharding par lieu (clé `ZONE_*`/`T_WA_GROUPS` existante) ; budget latence parallélisé ; modèle de consommation honnête 300→3k→30k ; interface agnostique `generate(role,prompt,contexte,politique)` ; comptabilité quotas/santé ; cohérence inter-modèles ; sécurité/données par fournisseur ; chemin d'expansion « tout par config/capacité, jamais réécriture ». | `directives_generation/14_architecture_hybride_orchestration.md` |
| 39.2 | ✏️ Modifié — Fichiers d'état. | `alo_context.md`, `alo_progression.md` |

### Décisions actées (P3, sous réserve de feu vert d'implémentation PE)

- **D-IA-7** : échelle de départ ~300 joueurs, **conçue pour l'expansion** — « câble 10 rôles, déploie-en 4 » (coutures dimensionnées, déploiement réduit ; anti-YAGNI).
- **D-IA-8** *(révisée — décision PE « 100 % gratuit »)* : cascade de 4 couches **entièrement gratuite** — C1 local / **C2 = 2 meilleures API gratuites (Groq + Gemini Flash)** / **C3 = pool des autres API gratuites (Cerebras, Cloudflare Workers AI, OpenRouter `:free`, Mistral, HuggingFace, GitHub Models)** / C4 dégradé déterministe. **Aucun palier payant** ; le payant reste une option de config (D-IA-11) désactivée par défaut, jamais une dépendance → réversible sans réécriture. Réserve actée : auditer les CGU (usage commercial / entraînement sur données) fournisseur par fournisseur avant lancement public.
- **D-IA-9** : désengorgement par **diversification de quotas** (primaires sur fournisseurs distincts → budget gratuit effectif = Σ fournisseurs) + load-balancer *quota-aware* (seaux à jetons, bascule à 90 %) + circuit breaker + failover en cascade.
- **D-IA-10** : **statelessness stricte** de tous les spécialistes (état exclusivement en L1/base MLD) → scale-out horizontal + sharding par lieu, **sans refonte**.
- **D-IA-11** : **interface agnostique au fournisseur** `generate(role, prompt, contexte, politique)` = seule abstraction à figer dès le jour 1 ; changement fournisseur/échelle = configuration de politique.
- **D-IA-12** : données sensibles (K3/D22, PII, modération) **jamais délocalisées** — restent en C1 ; fournisseurs gratuits ne voient que des IDs de jeu.

### État de sortie

Objectif PE atteint sur le papier : l'expansion (300→3k→30k) devient **additive** (config + capacité), jamais destructive, grâce à statelessness + agnosticisme fournisseur + sharding par clé de lieu déjà existante. Aucune donnée de jeu modifiée. **Complétude commandes** : rien à propager. Prochaine marche possible (si PE valide) : CDC du RAG → contrats des 4 spécialistes de départ + leurs politiques de backend → spéc de l'interface `generate` → spéc du load-balancer → matrice de dégradation → (implémentation Node.js, décision PE séparée).

*(Note étape 39-bis : révision D-IA-8 → stack **100 % gratuit** décidé par le PE — C2 = 2 meilleures API gratuites (Groq + Gemini Flash), C3 = pool des autres gratuites (Cerebras, Cloudflare, OpenRouter `:free`, Mistral, HuggingFace, GitHub Models), C4 dégradé déterministe ; aucun palier payant, réversible par config ; réserve CGU à auditer.)*

---

## ÉTAPE 40 — CDC-RAG-01 : cahier des charges du RAG (cerveau factuel partagé) (P3) 📚 ✅ CLOS (2026-07-10)

**Contexte** : à la demande du PE, production du CDC du RAG — fondation dont dépendent tous les spécialistes narratifs (13/14). **Livrable markdown, zéro code.**

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 40.1 | ➕ Créé — **CDC-RAG-01** : inventaire du corpus (~3 406 fiches, 15 types d'entité) ; **chunking par section de gabarit** (D13/D17/D67/D68/D69) ; schéma de métadonnées (clé = `entity_id` D71) ; **règles d'exclusion critiques** (K3/méta/secret jamais indexés = verrou D22 comme propriété de l'index) ; pipeline d'indexation (exclusion avant chunk) ; découpage par type ; **contrat de récupération borné par spécialiste** (filtres/top-k/budget) ; **gating K0/K1/K2** via état L1, K3 jamais ; format d'injection attribué `[entity_id · section]` ; fraîcheur incrémentale par hash ; stockage C1 local (embedding small CPU + `sqlite-vec`/`pgvector`) ; garde-fous anti-hallucination (grounding S7, seuil, validation ID aval L1) ; critères d'acceptation ; backlog (corpus SAO exclu du RAG primaire). | `directives_generation/15_cdc_rag.md` |
| 40.2 | ✏️ Modifié — Fichiers d'état. | `alo_context.md`, `alo_progression.md` |

### Décisions actées (P3, sous réserve de feu vert d'implémentation PE)

- **D-RAG-1** : chunking par section de gabarit (jamais fenêtre aveugle) ; sous-découpage à chevauchement 15 % au-delà de ~400 tokens.
- **D-RAG-2** : exclusion **à l'ingestion** des sections K3/méta/secret → verrou D22 = propriété de l'index, pas consigne de prompt.
- **D-RAG-3** : schéma de métadonnées (clé `entity_id` canonique D71) → récupération chirurgicale filtres durs + sémantique.
- **D-RAG-4** : gating K0/K1/K2 via état L1 (`SYS_NPC_KNOWLEDGE_UNLOCK`) ; K3 jamais indexé.
- **D-RAG-5** : contrat de récupération borné par spécialiste (filtres/top-k/budget tokens) → prompts petits (cache + économie quota gratuit).
- **D-RAG-6** : injection attribuée `[entity_id · section]` (grounding/citation) ; placement après système figé, avant volatil.
- **D-RAG-7** : RAG exclusivement local C1, sans état, répliquable/shardable ; embedding small multilingue CPU + magasin vectoriel embarqué.
- **D-RAG-8** : anti-hallucination (grounding S7 obligatoire, seuil de pertinence, « je ne sais pas » plutôt qu'inventer, validation ID aval par L1).
- **D-RAG-9** : ré-indexation incrémentale par hash → changer une fiche = constellation à jour sans réentraînement.
- **Complétude commandes** : `!sys_rag_reindex` / `SYS_RAG_REINDEX` spécifiés en `[BESOIN_COMMANDE]`, à propager **à l'implémentation** (couche bot P3, feu vert PE requis).

### État de sortie

CDC-RAG-01 complet et ancré sur les gabarits/verrous réels du corpus. Aucune donnée de jeu modifiée. Prochaine marche possible (si PE valide) : contrats des 4 spécialistes de départ + politiques de backend → spéc interface `generate` → spéc load-balancer *quota-aware* → matrice de dégradation → (implémentation Node.js, décision PE séparée).

---

## ÉTAPE 41 — CDC d'implémentation de la couche IA (NLU + spécialistes + orchestration + moteur déterministe) + intégration `etude_deepseek.md` (P3) 🧩 ✅ CLOS (2026-07-10)

**Contexte** : à la demande du PE, production des CDC restants nécessaires à l'implémentation de la couche IA/bot, en **intégrant `etude_deepseek.md`** (racine projet) — apports concrets : runtime **ONNX**, **encodeurs** pour la compréhension, dialogue par **retrieval**, MLP de **comportement de mob**, plan de **bootstrapping**, budget RAM. **Livrables markdown, zéro code.**

### Réconciliation des sources (mes études 13/14/15 × DeepSeek)

- **Adopté de DeepSeek** : compréhension = **encodeurs ONNX** (MiniLM intent + BERT-tiny NER), pas de LLM 1B (5-25 ms vs 300-800 ms) ; **dialogue à 2 modes** (retrieval local ~90 % / génératif API ~10 %) ; **Template Engine** pour 90 % des réponses ; **comportement de mob = MLP/arbre** (comportement ≠ résolution) ; **bootstrapping** regex→BERT-tiny ; budget RAM ~4 Go/24.
- **Ligne conservée** : frontière déterministe absolue ; RAG = cerveau factuel (15) ; stack 100 % gratuit (14) ; L1 seul écrivain de l'état.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 41.1 | ➕ Créé — **CDC-NLU-01** : compréhension locale (Intent MiniLM + NER BERT-tiny via ONNX INT8), classes alignées sur les commandes `!*`, résolution d'entités en IDs canoniques (D71), regex jour-1 + bootstrapping, fallback, budget RAM. D-NLU-1→5. | `directives_generation/16_cdc_nlu_locale.md` |
| 41.2 | ➕ Créé — **CDC-SPE-01** : contrats des spécialistes narratifs S2-S7 (IN/OUT, appel `retrieve()`, `SYS_*`, mode retrieval/génératif, politique de backend, gabarit C4), dialogue à 2 modes, Template Engine, grounding. D-SPE-1→5. | `directives_generation/17_cdc_specialistes_narratifs.md` |
| 41.3 | ➕ Créé — **CDC-ORC-01** : interface agnostique `generate(role,prompt,contexte,politique)`, format de politique de backend, load-balancer *quota-aware* + circuit breaker + failover, dispatcher, boucle d'orchestration `SYS_*`, stack ONNX+Node+Redis, budget RAM consolidé, feuille de route P0-P6, observabilité. D-ORC-1→7. | `directives_generation/18_cdc_orchestration_runtime.md` |
| 41.4 | ➕ Créé — **CDC-DET-01** : moteur déterministe L1 (combat/mouvement Dijkstra+R0/éco/inventaire/XP/quêtes/jauges) + **contrat d'exécution `SYS_*`** (validation 6 étapes, L1 seul écrivain, hallucination d'ID rejetée) + exception ML « comportement de mob » (MLP imitation learning / arbre, comportement ≠ résolution). D-DET-1→4. | `directives_generation/19_cdc_moteur_deterministe.md` |
| 41.5 | ✏️ Modifié — Fichiers d'état. | `alo_context.md`, `alo_progression.md` |

### Décisions actées (P3, sous réserve feu vert d'implémentation PE)

- **D-NLU-1** : compréhension = encodeurs ONNX (jamais décodeur LLM). **D-SPE-1** : dialogue à 2 modes (retrieval défaut / génératif à enjeu). **D-SPE-2** : Template Engine = chemin nominal des tours triviaux + couche C4. **D-ORC-1** : interface agnostique `generate()` = seule abstraction figée jour-1. **D-ORC-4** : dispatcher > 70 % sans LLM payant. **D-ORC-7** : déterministe+RAG avant génératif. **D-DET-2** : contrat `SYS_*` validation 6 étapes, L1 seul écrivain. **D-DET-3** : comportement de mob ML autorisé (comportement ≠ résolution).
- **Complétude commandes** : `SYS_RAG_REINDEX`, `SYS_GRANT_PASSIVE` en `[BESOIN_COMMANDE]` ; vérifier le registre `SYS_*` (`ai_orchestrator_commands.md`) à l'implémentation (couche bot P3).

### État de sortie

**Jeu de CDC d'implémentation complet** pour la couche IA : compréhension (16), génération (17), orchestration/runtime (18), moteur déterministe & contrat `SYS_*` (19) — au-dessus de la fondation RAG (15) et des études d'architecture (13/14). `etude_deepseek.md` intégré et réconcilié (encodeurs, retrieval, MLP mob, bootstrapping, ONNX). Aucune donnée de jeu modifiée. Ordre d'implémentation acté (P0-P6, `18_` §9) : L1 déterministe + RAG **avant** le génératif. Reste : décision PE d'implémentation (Node.js).

---

## ÉTAPE 42 — CDC-MOD-01 : sélection & comparaison des modèles (supersede les choix DeepSeek) (P3) 🔬 ✅ CLOS (2026-07-10)

**Contexte** : à la demande du PE, comparaison tâche par tâche des modèles de `etude_deepseek.md` et proposition de meilleurs modèles gratuits. **Correction majeure identifiée** : les choix DeepSeek (BERT-tiny, MiniLM-L6-v2, DistilGPT2) sont **anglophones** alors que le corpus/joueurs sont **francophones**. **Livrable markdown, zéro code.**

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 42.1 | ➕ Créé — **CDC-MOD-01** : tableau comparatif tâche×modèle (DeepSeek vs meilleure proposition gratuite), détail par tâche (intent, NER, embeddings, comportement mob, génération), budget RAM/latence recalculé, ce qu'on garde de DeepSeek. Autoritatif sur le choix des modèles (supersede 15/16/17/19). | `directives_generation/20_cdc_selection_modeles.md` |
| 42.2 | ✏️ Modifié — Fichiers d'état. | `alo_context.md`, `alo_progression.md` |

### Décisions actées (P3)

- **D-MOD-1** : **modèles multilingues/FR-natifs** partout (corpus francophone) — supersede les modèles anglophones de DeepSeek.
- **D-MOD-2** : **`multilingual-e5-small` = embedding UNIQUE** partagé RAG+dialogue+intent ; magasin `sqlite-vec` unifié (`-base`/`BGE-M3` en option qualité).
- **D-MOD-3** : **résolution d'entités = gazetteer (index nom→ID) primaire** + petit NER FR (DistilCamemBERT/spaCy) — plus juste/rapide que BERT-tiny sur le domaine (les entités sont les IDs inventés du jeu).
- **D-MOD-4** : **comportement de mob = Behavior Tree / Utility AI *authored*** (contrôle designer D10/D11) ; LightGBM→ONNX en option ; jamais un MLP boîte-noire par défaut.
- **D-MOD-5** : **génération narrative priorité FR** — Mistral (FR-natif) + Gemini Flash montent dans les politiques narratives ; repli local Qwen2.5-1.5B/Gemma-2-2B (≠ DistilGPT2).
- **D-MOD-6** : ONNX Runtime + encodeurs-compréhension + bootstrapping + Template Engine **conservés** de DeepSeek.

### État de sortie

Sélection de modèles arrêtée et **francisée**. Budget local recalculé ~0,4 Go IA (~4-5 Go/24 total). Réserve : identifiants exacts + quotas gratuits à revérifier au lancement ; tout modèle substituable par config (interface agnostique `18_`, sans refonte). Aucune donnée de jeu modifiée.

---

**Objectif** : dernier chantier transverse — calibrer l'économie du jeu sur les prix réels des items, formaliser les drop rates, ajuster les récompenses de quêtes T5/légendaires, et mettre à jour le balance sheet.

### Constat d'entrée

- **Balance sheet v1.0** (2026-07-06) sous-estimait massivement les prix réels (×1.5 à ×8 selon les catégories) — les items ayant été créés entre-temps avec des prix auto-cohérents, c'est le **sheet** qui devait être mis à jour, pas les items.
- **Drop rates** : non formalisés dans le balance sheet, mais les taux constatés sur le corpus faune sont calés (55-65% T1 commun, 100% boss, 35-60% donjon).
- **Quêtes T5** : 5 000 EXP flat, zéro Yrds — correct comme récompense symbolique, mais mérite un ajustement à la hausse (le vrai gain = skill débloqué).
- **Quêtes légendaires** : 8 000-10 000 EXP — dérisoire pour des quêtes niveau 75+ (<1% d'un niveau).  
- **Aucun package de départ** défini pour les nouveaux joueurs.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 37.1 | ✏️ **Balance sheet v2.0** — toutes les valeurs recalibrées sur les prix réels constatés : armes T1 150-400 ¥, T4 14 000-20 000 ¥ ; armures T1 150-400 ¥/pièce, T4 14 000-20 000 ¥/pièce ; consommables gamme 12-2 400 ¥ ; matériaux 4-1 960 ¥. Grille de drop rates par type/tier. Courbe d'EXP/Niveau. Package départ (300 ¥ + consommables). Gold sinks classés par impact. | `données/the_seed_engine/stat_scaling/economy_balance_sheet.md` |
| 37.2 | ✏️ **10 quêtes T5 magies** : 5 000 EXP → 8 000 EXP + 500 Yrds | `game_design/quetes/qst_t5_mag_*.md` (×10) |
| 37.3 | ✏️ **10 quêtes T5 OSS** : 5 000 EXP → 8 000 EXP + 500 Yrds | `game_design/quetes/qst_t5_oss_*.md` (×10) |
| 37.4 | ✏️ **4 quêtes légendaires** : 8-10k EXP → 50 000 EXP + 2 000-5 000 Yrds + titre de prestige | `game_design/quetes/qst_leg_*.md` (×4) |
| 37.5 | ✏️ **Index quêtes** : §5 récompense T5 → 8 000 EXP + 500 Yrds ; §6 légendaires → 50 000 EXP + 2-5k Yrds + titre | `game_design/quetes/_index_quetes.md` |
| 37.6 | ➕ **Rapport d'équilibrage** complet : constats, décisions D72-D75, tests de cohérence | `directives_generation/12_equilibrage_economique.md` |
| 37.7 | ✏️ Fichiers d'état | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D72** : le prix catalogue d'un item est celui de sa fiche, pas le balance sheet (le sheet est une grille de référence pour la création future).
- **D73** : les drop rates suivent une grille simple par type de mob × tier (pas de formule complexe). Chaque ligne de loot = roll indépendant.
- **D74** : les récompenses EXP/Yrds des quêtes T5 et légendaires sont volontairement modestes — le vrai gain est fonctionnel (skill ultime / arme unique liée).
- **D75** : package de départ = 300 ¥ + 3× Pain de Voyage + 3× Potion Soin Mineure + tenue régionale — permet d'acheter une arme T1 dès la création.

### Tests de cohérence

- **T1 abordable** : 300 ¥ départ + arme T1 la moins chère 150 ¥ = ✅ 150 ¥ restants
- **Set T1 à niveau 10** : ~900 ¥, revenu cumulé 400 ¥ (farm) + 200 ¥ (quêtes) = ✅ atteignable
- **Craft rentable** : marge ~20% (armes) à ~50% (potions) vs achat = ✅
- **Enchantement T5** : 300k ¥, ~100h de farm niveau 80+ = ✅ sink crédible
- **Citadelle guilde** : 3M ¥, guilde 100 membres, ~6 semaines = ✅ atteignable

### État de sortie

**28 fichiers modifiés** (1 balance sheet + 20 T5 + 4 légendaires + 1 index + 1 rapport + 1 état). **Tous les chantiers transverses sont clos.** Aucune dette structurelle résiduelle. Le projet ALO est intégralement livré : 11 CDC, audit de conformité, équilibrage économique.

---

## ÉTAPE 43 — Systèmes sociaux & mémoire relationnelle joueur↔PNJ 💍🏠💼 ✅ CLOS (2026-07-10)

**Contexte** : requête PE en deux volets. (1) « Comment le programme sait-il qu'un joueur a discuté N fois avec un PNJ, et quelles infos il possède ? » + side-quests conditionnées au haut niveau d'information. (2) Nouveaux verbes de vie : acheter/louer une maison, créer/rejoindre une guilde, avoir un métier (aubergiste…), se marier (homme+femme, monogame, séparation équitable) — avec avantages listés. + « revois/mets à jour les CDC concernés » + « vérifie si le persona correspond à la direction du projet ». **Livrable markdown/SQL-DDL, zéro code.**

### Constat d'entrée

- `T_NPC_KNOWLEDGE_UNLOCKS` (infos débloquées par avatar) existait, **mais aucun compteur d'interaction ni affinité** ⇒ impossible de savoir « combien de fois ».
- `T_BANK_VAULTS.owner_type` prévoyait déjà `'marriage'` — anticipé, jamais adossé à une table de mariage.
- `system_mechanics/marriage_housing_system.md` = **legacy en prose** non conforme aux règles PE (deux joueurs quelconques, pas de genre, achat seul, divorce à 50 % forfaitaire, pas de prérequis de foyer).
- Aucune table Housing / Marriage / Jobs. `T_GUILDS` sans mécanique « rejoindre ».

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 43.1 | ➕ **`T_NPC_RELATIONS`** — arête creuse joueur↔PNJ créée à la 1ʳᵉ interaction (D-SOC-1) : `interaction_count`, affinité [−100,+100]→5 paliers, `topic_flags` ; triggers R1-R5 ; commandes `!relation`/`!offrir` | `MLD_Logic/table_t_npc_relations.md` |
| 43.2 | ➕ **`T_PROPERTIES`** — housing achat (`own`) **ou** location (`rent`) ; stockage massif, checkpoint sûr (`!home_return`/`!rest`), prérequis mariage ; grille 4 tiers ; triggers P1-P6 | `MLD_Logic/table_t_properties.md` |
| 43.3 | ➕ **`T_MARRIAGES` + `T_MARRIAGE_ASSETS`** — homme+femme (M1), monogame (index partiels M2), prérequis foyer (M3), coffre doublé (M4), séparation par provenance (M5), cadeau selon moyenne de niveau (M6) | `MLD_Logic/table_t_marriages.md` |
| 43.4 | ➕ **`T_JOBS_DICT` + `T_AVATAR_JOB`** — emploi salarié unique, 12 archétypes seed (aubergiste, garde…), salaire/service, promotion, réputation ; triggers J1-J5 | `MLD_Logic/table_t_jobs.md` |
| 43.5 | ✏️ **`T_AVATARS`** — colonnes sociales `marriage_uuid`/`home_property_uuid`/`job_id` (caches dénormalisés) + contrat A7 | `MLD_Logic/table_t_avatars.md` |
| 43.6 | ✏️ **`T_QUESTS_DICT`** — `prerequisites` étendu (`min_affinity_tier`/`qi_unlocked`/`topic_flag`/`requires_married`/`requires_home`) + trigger Q4 (side-quests sociales) | `MLD_Logic/table_t_quests_dict.md` |
| 43.7 | ✏️ **`T_GUILDS`** — mécanique « rejoindre » (invitation/candidature, G5) + commandes | `MLD_Logic/table_t_guilds.md` |
| 43.8 | ✏️ **`T_BANK`** — spéc coffre conjugal (doublé, provenance, clôture au divorce) | `MLD_Logic/table_t_bank.md` |
| 43.9 | ✏️ **`marriage_housing_system.md` v2.0** — réécrit, supersede le legacy (annexe de correspondance v1→v2) ; §0 mémoire relationnelle | `system_mechanics/marriage_housing_system.md` |
| 43.10 | ✏️ **Commandes propagées** — WA §15 (mariage/housing), §10 (rejoindre guilde), §20 (relations PNJ), **§23 nouvelle (emploi)** ; IA §10 (social étendu), §2 (relation-touch/get, affinité→table) | `whatsapp_commands_list.md`, `ai_orchestrator_commands.md` |
| 43.11 | ➕ **CDC-SOC-01** — cadre du pilier social, D-SOC-1→14, quotas SOC-1→4, `[BESOIN_*]` | `directives_generation/21_cdc_systemes_sociaux.md` |
| 43.12 | ✏️ **Persona amendé §5** (2026-07-10) — 3 filtres conservés ; ajout : phase data≠code, 4ᵉ pilier social, doctrine frontière déterministe | `system_persona_architecte.md` |
| 43.13 | ✏️ Fichiers d'état | `alo_context.md`, `alo_progression.md` |

### Décisions actées

- **D-SOC-1→14** (cf. `21_cdc_systemes_sociaux.md` §2). Points saillants : mémoire PNJ = arête creuse *lazy* (jamais pré-matérialisée à l'inscription — 11 M lignes évitées, filtre Développeur) ; side-quests conditionnées via `prerequisites` (pas de table dédiée) ; mariage homme+femme monogame ; séparation « chacun reprend ses apports » via registre de provenance ; housing = checkpoint sûr adossé à R0 ; emploi salarié ≠ skills de récolte.

### Vérification du persona (demande PE)

**Verdict : les 3 filtres (Dev/Game Designer/Scénariste) restent le bon ADN — conservés.** 3 recollages amendés (§5) : (1) phase actuelle = **données, pas code** (le Node.js est une cible d'implémentabilité, pas un livrable) ; (2) **4ᵉ pilier social** (rétention par le lien) ; (3) **doctrine IA à frontière déterministe** (combat/éco/prérequis jamais neuronaux — L1 seul écrivain). Aucune contradiction de fond ; le persona était combat/éco/lore-centrique et muet sur data-only + social + multi-IA.

### État de sortie

**13 lots** (4 nouvelles tables MLD + 4 tables existantes amendées + spec v2.0 + 2 registres de commandes + CDC + persona + états). Dette de commande **nulle** (tout propagé à la clôture). Restent les quotas de contenu SOC-1→4 délégables. Aucune donnée de jeu existante cassée.

### Addendum 43-bis — arbitrage PE sur les `[BESOIN_*]`

- **✅ Anneau d'Engagement = item de service dédié** (décision PE). Créé **`MSC_ENG_001`** (`données/items_equipements/service/`, `item_type='MSC'`, **sans stat**, lié/non-revendable, **consommé à la cérémonie**, 50 000 Yrds chez un bijoutier `SERVICE`). L'ancienne bague à stats `ACC_ANN_003` (+5 % toutes stats, lot accessoires gelé) est **dépréciée/redirigée** vers `MSC_ENG_001`. Références mises à jour : `T_MARRIAGES` M3, `marriage_housing_system.md`, CDC-SOC §4. **`[BESOIN_ITEM]` résolu.**
- **⏳ Auberge exploitable = backlog** (décision PE : reporté). `JOB_HOS_001` (Aubergiste) reste au service d'un aubergiste **PNJ** (`employer_type='npc'`) ; la boucle joueur-propriétaire-d'auberge ↔ location de `inn_room` n'est pas modélisée. `[BESOIN_ENTITE]` maintenu ouvert en backlog.
- Nouveau dossier `données/items_equipements/service/` inauguré pour les items de service (jetons/actes) ; +1 fichier créé, 1 fichier redirigé.

### Addendum 43-ter — délégation des quotas de contenu CDC-SOC (3 générateurs parallèles + orchestrateur)

Sur demande PE, les quotas SOC-1→4 ont été **délégués** (protocole D37). **124 fiches créées** au total, aucune régression.

| Lot | Livré | Emplacement | Générateur |
|---|---|---|---|
| SOC-1 Emplois | **66** (≥60) — 11/catégorie × 6, ≥5/ville × 11, ancrage racial, salaires 160-560 ¥ | `game_design/emplois/` + `_index_emplois.md` | délégué |
| SOC-2 Side-quests d'affinité | **22** (≥20) — 2/capitale, déblocage `trusted`(11)/`confidant`(11) + `qi_unlocked`, donneurs réels vérifiés | `game_design/quetes/qst_*_aff_*` + `_index_soc2_affinite.md` | délégué |
| SOC-3 Décorations | **36** (≥30) — 7 types (FUR/PLT/LGT/RUG/TRO/STA/FON), buffs ≤ +5 %, 9 races | `items_equipements/decoration/` + `_index_decoration.md` | délégué |
| SOC-4 Cadeaux de noces | table de tirage (bandes niveau→tier, 3 pools, L1) | `system_mechanics/wedding_gift_table.md` | orchestrateur |

**Préparation & réconciliation orchestrateur** :
- ➕ `item_type='DEC'` ajouté à l'enum `T_ITEMS_DICT` + trigger I4 ; ✏️ `T_PROPERTIES` P7 (clés `deco_buffs` figées, plafond ±5 %/logement).
- ✏️ `T_JOBS_DICT` §2 : pointeur vers le dictionnaire complet (66) ; ✏️ `_index_quetes.md` §7 + compteur **57→79** ; ➕ 2 titres honorifiques dans `T_TITLES` ; ✏️ CDC-SOC §3 (lots livrés) + §4-bis (arbitrage `[BESOIN_*]`).
- **Arbitrage `[BESOIN_*]`** : dague/pelage → items existants (`WPN_DAG_003`/`MAT_CUI_*`) ; 4 props narratifs → items de quête liés `KEY` (sans fiche éco) ; 2 titres créés ; 2 aubergistes dédiés + 2 employeurs `guild` = backlog mineur (rattachements provisoires, aucun ID inventé) ; clés déco figées.
- **Dette de commande nulle** (aucune commande nouvelle). **Aucune collision d'ID.**

**État de sortie** : pilier social **entièrement instancié** — mécanique (4 tables + specs) **et** contenu (124 fiches). Restent en backlog mineur : auberge exploitable (`[BESOIN_ENTITE]`), 2 taverniers dédiés, peuplement `T_GUILDS` pour les employeurs guilde.

---

## ÉTAPE 44 — Régularisation P3 : chantier `bot/` officialisé + hygiène dépôt 🤖 ✅ CLOS (2026-07-11)

**Contexte** : l'audit de reprise (2026-07-11) a constaté un dossier `bot/` non documenté (créé par le PE dans la nuit, travail parallèle) : implémentation Node.js complète conforme à l'architecture des CDC 16-20 (src/ handlers+engine+orchestrator+services, modèles ONNX entraînés intent/NER/combat, scripts d'entraînement Python, Docker/nginx/systemd). Le dernier commit datait de l'étape 37 : tout le travail 38-43 était non commité. Régularisation demandée par le PE.

### Modifications

| # | Action | Fichier(s) |
|---|---|---|
| 44.1 | 📦 Commit `1940f57` — travail des étapes 38-43 (9 CDC IA `directives_generation/13-21`, 4 tables MLD sociales, 124 fiches SOC, amendement persona §5) : 176 fichiers, **hors `bot/`** | dépôt git |
| 44.2 | ✏️ Modifié — CDC §9 : P2 renflouement → ✅ CLOS (étapes 4-37) ; P3 → 🚧 LANCÉ PAR LE PE. §10 : table d'état de conformité mise à jour (elle datait d'avant les clôtures 25-37) — boutiques 11/11, armures 4×100, faune 256, flore, quêtes 79, social SOC-1→4 ; chantier §10 déclaré CLOS | `cahier_des_charges.md` |
| 44.3 | ➕ Créé — **CDC §11 « Chantier P3 — Implémentation du bot »** : propriété PE, CDC 13-21 = contrat de conformité du code (frontière déterministe L1, statelessness, verrou D22), règles d'hygiène dépôt, réserve CGU API gratuites | `cahier_des_charges.md` |
| 44.4 | ✏️ Modifié — Persona §5.1 : amendement — P3 lancé par le PE, `bot/` = propriété PE ; « zéro code » reste en vigueur pour les livrables ACP hors `bot/` (intervention ACP dans `bot/` = demande PE explicite) | `system_persona_architecte.md` |
| 44.5 | ✅ Vérifié — hygiène git de `bot/` : `bot/.gitignore` existant couvre `node_modules/` (600 Mo), `.env` (secrets DB/API), `wa_session/` (46 Mo, session WhatsApp authentifiée), `models/*.onnx` ; git ne versionne que 50 fichiers légitimes (sources, configs, petits artefacts `.npy` d'inférence — conservés pour exécutabilité sans réentraînement) | `bot/.gitignore` (aucune modification nécessaire) |
| 44.6 | 📦 Commit — `bot/` (50 fichiers) + fichiers de régularisation (CDC, persona, contexte, journal) | dépôt git |

### Décisions actées

- **D-P3-1** : `bot/` = **chantier PE** ; les sessions ACP n'y touchent que sur demande explicite. Les CDC 13-21 restent la source de vérité architecturale — tout écart constaté dans le code est un point d'audit, pas une mise à jour tacite des CDC.
- **D-P3-2** : artefacts de modèles — les `.onnx` (lourds, régénérables via `bot/training/`) sont exclus du dépôt ; les petits artefacts (`.npy`, `.json` de vocabulaire/classes) sont versionnés.
- Correction d'état : `alo_context.md` disait « pas un dépôt git » — le projet **est** un dépôt git (branche `main`, remote `origin`) depuis le commit initial `d847999`.

### État de sortie

Gouvernance réalignée sur le terrain : phase données CLOSE (§10 ✅), phase P3 OUVERTE et documentée (§11), dépôt à jour (2 commits propres, 0 secret versionné). Backlog documentaire restant : accessoires (dérogation D39 à arbitrer), auberge exploitable + taverniers + `T_GUILDS` (mineur), `!sys_rag_reindex`/`SYS_RAG_REINDEX` en `[BESOIN_COMMANDE]`, arbitrage `ZONE_ROUTE_LUGRU`, audit CGU API avant lancement public. Prochain front naturel : audit de conformité du code `bot/` contre les CDC 16-20 (sur demande PE).

---

## ÉTAPE 45 — Audit de conformité du code `bot/` contre les CDC 13-21 🔍 ✅ CLOS (2026-07-11)

**Contexte** : front (a) de l'étape 44 activé par le PE. Audit en **lecture seule** (D-P3-1 : tout écart = point d'audit, pas de correction tacite ; aucun fichier de `bot/` modifié). Méthode : lecture intégrale des 50 fichiers versionnés de `bot/` (~2 400 lignes JS/Python) + chaîne de peuplement (`scripts/seed-generator.js`, `schema.sql`, `seed*.sql`, `rebuild.sh`), traçage d'usage réel de chaque module (grep), vérification croisée schéma/seed/code.

### Livrable

- ➕ **`directives_generation/22_audit_conformite_bot_etape45.md`** (AUDIT-BOT-01) : verdict par CDC, 3 violations 🔴 (R1-R3), 7 écarts majeurs 🟠 (M1-M7), 11 points mineurs/hygiène 🟡, 8 conformités ✅, position feuille de route P0-P6, ordre de correction recommandé.

### Verdict

**Direction saine, trois contrats violés.** Le code = phase P0 + P1 partiel, ordre D-ORC-7 respecté (déterministe avant génératif) ; frontière déterministe respectée **au runtime** (L1 = code pur, le LLM ne produit que du texte) ; Template Engine + dégradation gracieuse + stack conformes ; 0 secret versionné.

**🔴 R1 — Verrou D22 absent du pipeline de connaissance** : `T_NPC_KNOWLEDGE` accepte K3 par schéma (CHECK), le seed-generator ingère les QI sans filtre K3, et `rag.js`/`dialogue.js` lisent sans clause `k_level` ni gating K2. Inoffensif aujourd'hui **par accident** (le parseur QI ne matche pas le gabarit → table vide). À verrouiller AVANT de réparer le parseur.
**🔴 R2 — `combat.onnx` = résolution de combat ML** (RandomForest prédicteur de dégâts) entraînée et chargée au démarrage — ligne rouge D-DET-1. Circonstance : `predictDamage` n'est appelé nulle part (résolution réelle = `engine/combat.js`, déterministe). À supprimer/requalifier.
**🔴 R3 — Économie sans verrou anti-dup** : contrôles solde/quantité hors transaction, UPDATE non conditionnels → exploit de duplication par messages simultanés (viole D-DET-2 étape 4, D-DET-4, persona §2.2).

**🟠 Majeurs** : M1 pipeline `SYS_*` inexistant (bloquant P5) · M2 `generate(role,…,politique)` absent, pas de load-balancer quota-aware, Gemini configuré non câblé · M3 LLM sans grounding RAG/anti-injection (dormant, `USE_API=false`) · M4 R0 non implémenté (déplacement n'écrit pas l'état, pas de gestion groupes WA) · M5 gazetteer nom→ID absent (le joueur doit taper les IDs internes) · M6 4 modèles ONNX entraînés/chargés jamais appelés (NLU réelle = mots-clés ; regex jour-1 conforme D-NLU-4, modèles morts non) · M7 seuil 0.3 ≠ 0.7 + taxonomie d'intentions divergente (`LORE_QUERY` manquant → S7 non routable).

**🟡 Notables** : Redis déclaré jamais connecté ; `tests/` vide ; combat en Map mémoire (perdu au restart) ; IDs modèles API périmés (Groq `llama3-70b-8192`) ; multiplicateur de niveau brut ×(niv/niv) non borné ; monstre cherché par ILIKE global sans filtre de zone ; API HTTP sans auth ; avatar fantôme universel `…001` ; `rebuild.sh` racine avec mot de passe sudo en clair (hors `bot/`).

### État de sortie

Audit clos, `bot/` intact, CDC 13-21 inchangés (aucun écart ne justifie d'amendement du référentiel). **Ordre de correction recommandé au PE : R1 → R3 → R2 → M2 → M1/M4 → M5/M7 → M6.** Backlog documentaire inchangé (accessoires D39, auberge exploitable, `T_GUILDS`, `SYS_RAG_REINDEX`, `ZONE_ROUTE_LUGRU`, audit CGU API).

### Addendum 45-bis — Contre-audit de la vague corrective PE (2026-07-11, 13h37-13h40)

Sur « revérifie » du PE : le code `bot/` a changé entre l'audit et le contre-audit (13 fichiers modifiés, 3 supprimés, `gazetteer.js` créé — worktree non commité). Re-vérification par diff intégral, ajoutée en addendum au rapport 22.

- **R2 ✅ CLOS** : chaîne `combat.onnx` supprimée (fichiers + modèle + loader ONNX désactivé « moteur déterministe uniquement », `/health` honnête).
- **R3 ✅ CLOS** : éco verrouillée dans les règles (FOR UPDATE avatar+inventaire, UPDATE/DELETE conditionnels + rowCount, crédit en transaction, ordre de verrous cohérent).
- **R1 ⚠️ PARTIEL + bug nR1** : filtre `k_level` ajouté aux lectures mais comparant VARCHAR à `2` → exclut TOUT (fail-closed mais panne silencieuse : K0/K1/K2 jamais servis) ; **ingestion seed-generator + CHECK schéma inchangés** (cœur du verrou D22 toujours ouvert) ; gating K2 codé en dur (pas lié à L1).
- **Avancées** : M2 `generate(role,prompt,contexte,politique)` créé (priorités par rôle, Mistral premier en dialogue) ; M4 le déplacement écrit `current_zone_id` + MP conditionnels ; M5 gazetteer nom→ID branché au NER ; M6 clos par retrait ; M7 seuils 0.7 + `LORE_QUERY` routé ; h3 mot de passe sudo purgé.
- **3 régressions nouvelles** : nR1 (filtre K varchar/int), nR2 (seaux de quota jamais réapprovisionnés hors 429 → providers écartés définitivement après épuisement du compteur), nR3 (`run_all.sh` appelle `train_combat.py` supprimé → pipeline d'entraînement casse).
- **Priorités recommandées** : nR1 → R1-ingestion/CHECK → nR2 → nR3, puis M1 (`SYS_*`), M3 (grounding avant activation API), M4-R0 (groupes WA), m4 (IDs modèles périmés, `llama3-70b-8192` encore présent 2×).

### Addendum 45-ter — Vérification de la 2ᵉ vague corrective PE (commit `3ddf391`, 13h52)

Le PE a commité une 2ᵉ vague ; vérifiée point par point dans le code : **R1 ✅ CLOS structurellement** (ingestion seed-generator filtre K3/KX avec [SKIP], CHECK schéma restreint à K0/K1/K2, clauses `IN ('K0','K1','K2')` correctes dans rag.js/dialogue.js — belt-and-suspenders complet), **nR1 ✅** (comparaison VARCHAR correcte), **nR2 ✅** (setInterval 60s réapprovisionne les seaux), **nR3 ✅** (run_all.sh nettoyé), **nR4 ✅** (Groq `llama-3.3-70b-versatile`). **Les 3 rouges de l'audit sont clos.** Restent : reliquat R1 rétrogradé en mineur (gating K2 par état L1 D-RAG-4 absent — K2 servi sans déblocage ; parseur QI ne matche toujours pas le gabarit → table vide, fonctionnel non sécurité), M1 (`SYS_*`), M3 (grounding : slot `ragContext` jamais renseigné, pas d'anti-injection — condition d'activation de `USE_API`), M4-R0 (adjacence/temps de trajet, groupes WA), P2 RAG réel, et les mineurs (Gemini non câblé, HF déprécié, Redis, tests, Map combat, formule niveau non bornée, ILIKE mobs, API sans auth, avatar fantôme, password défaut).

### Addendum 45-quater — Contre-audit vague 3 PE (commit `8f608f9`, 14h06)

Vague massive (M1/M3/M4-R0/P2/Gemini/mineurs, +783 lignes, 5 nouveaux modules). **Verdict : architecture juste, exécution non conforme au schéma — ~70 % du nouveau code mort à l'exécution + 2 trous d'autorisation.** Acquis réels : pipeline 6 étapes bien ordonné, grounding `ragContext` transmis, sanitizer branché, Gemini câblé, quotas configurables, adjacence stricte du déplacement, `levelRatio` borné ×3.
- 🔴 **nR5** : `!sys_*` exécutable par tout joueur en source `'gm'` (aucun contrôle d'identité) + post-parsing de TOUTES les réponses en source `'system'` → vecteur d'écho joueur via EMOTE/WHISPER. Bloqué aujourd'hui PAR ACCIDENT (nR6).
- 🔴 **nR6** : registre `SYS_*` codé contre un schéma imaginaire — **5/5 commandes inopérantes** (ON CONFLICT sans contrainte unique, colonnes inexistantes sur t_active_quests/t_npc_knowledge_unlocks/t_weather/t_shop_items) + `K3` accepté au déblocage (interdit D22).
- 🔴 **nR7** : **combat cassé à 100 %** (`AND zone_id` sur `T_MONSTERS_DICT` qui n'a pas cette colonne → erreur SQL sur chaque attaque ; la liaison zone↔mob = `T_SPAWN_TABLES`).
- 🔴 **nR8** : **gazetteer HS (régression)** — colonnes `species`/`zone_id` inexistantes dans le même Promise.all → résolution nom→ID morte (fonctionnait vague 2) ; `build-embeddings.js` aborte (t_npc_knowledge.`id`≠`qi_id`) ; `zone-groups.js` idem (`group_id`≠`wa_group_id`).
- 🟠 **nR9** : étape LOCK inopérante (`pg_advisory_xact_lock` en autocommit sur le pool → relâché immédiatement, exécution sur d'autres connexions). **nR10** : `t_encyclopedia_dict` ingéré sans `WHERE is_secret=FALSE` (symétrique R1, latent).
- 🟡 : embeddings stockés jamais relus, sanitizer anglophone, travelTime non appliqué, gating K2/L1 toujours absent, « index vectoriel » ≠ CDC 15 (tables DB + bag-of-words, pas fiches+e5).

**Cause racine : code écrit sans lire `schema.sql`. Priorités : nR7/nR8 (le jeu de base est cassé, pire qu'avant la vague) → nR5 → nR6/nR9 → tests d'intégration (m2 devient critique — aurait attrapé 100 % de nR6-nR8).** Rapport : addendum 45-quater du doc 22.

### Addendum 45-quinquies — Contre-audit vague 4 PE (commit `a0c5830`, 14h20) — vérifié PAR EXÉCUTION

Contre-audit par diff + exécution : suite d'intégration PE lancée (**27/27 ✅**) + 3 sondes ACP sur ses angles morts. **nR5-b (écho joueur), nR6, nR8, nR9, nR10 : ✅ clos proprement. m2 : suite posée et verte.** Mais les sondes confirment 3 résidus :
- 🟠 **nR11** : le contrôle GM interroge `t_avatars.role` **qui n'existe pas** → « la colonne role n'existe pas » sur tout `!sys_*` (fail-closed mais GM inutilisable + fuite d'err.message). Fix : allowlist téléphones GM en config, ou colonne actée au MLD.
- 🟠 **nR13** : `T_SPAWN_TABLES` = **0 ligne** → le combat reste 100 % inopérant malgré la requête corrigée (JOIN juste). Le seed-generator ne parse pas les plages D6. **Bloqueur gameplay n°1.**
- 🟡 **nR12** : `build-embeddings.js` sélectionne `loot_table_id` inexistant → casse encore (3ᵉ itération du pattern « schéma imaginaire »).
- Reliquats : `SYS_ADVANCE_QUEST` termine à `step>=10` en dur (≠ `total_steps` réel), source LLM='system' sur-privilégiée, sanitizer anglophone, gating K2/L1, artefacts de noms dans le seed (« Chevalier d Argent — »), angles morts des tests = exactement les 3 zones cassées.

**Bilan cumulé : R1-R3 clos (vague 2) ; vague 3 apurée à ~80 % par la vague 4 ; restent nR13 (données) et nR11 (config/MLD) comme bloqueurs réels.** Rapport : addendum 45-quinquies du doc 22.

### Addendum 45-sexies — Contre-audit vague 4.2 PE (commit `b633101`, 14h32) — diff + exécution

Suite d'intégration : **27 ✅ / 3 ❌** (suite désormais honnête : 2 rouges = résidus réels). Sondes ACP à l'appui :
- **nR11 ⚠️ moitié** : refus fail-closed propre ✅ (sonde : « Accès refusé », plus d'erreur SQL) ; **mais chemin d'acceptation cassé (nR11-b)** — `message-handler.js:133` passe `phoneNumber=null` → aucun GM ne peut s'authentifier même avec `GM_PHONES` ; repli `_playerId.includes(p)` à supprimer (dangereux : entrée courte type « 0000 » matcherait l'UUID de test) ; `GM_PHONES` non documenté.
- **nR12 ✅ code** (colonnes alignées) — build à exécuter.
- **nR13 ✅ code / ❌ NON APPLIQUÉ** : `parseSpawns()` correct mais `seed_data.sql` non régénéré, base non re-seedée (0 ligne, la suite PE échoue elle-même) → **combat toujours inopérant**. Mapping grossier tout→HUNT_001 (plages D6/D8 non respectées — dette 2ᵉ ordre).
- Reliquats clos : `SYS_ADVANCE_QUEST` lit `total_steps` réel ✅, sanitizer FR posé ✅, noms monstres nettoyés ✅. Test GM mal écrit (`!sys_help` détourné en HELP par le classifieur ; sys_help early-return avant contrôle GM).

**Voie de sortie** : (1) régénérer seed + re-seed → combat démarre ; (2) passer `phoneNumber` ligne 133 + supprimer repli UUID + documenter GM_PHONES ; (3) réécrire test GM ; (4) lancer build-embeddings. Rapport : addendum 45-sexies du doc 22.

### Addendum 45-septies — Contre-audit vague 4.3 PE (commit `ee57fd9`, 14h46) — diff + exécution complète

Suite **31/31 ✅** (exécutée) + 4 sondes ACP. **nR11-b ✅ CLOS** (phoneNumber transmis, repli UUID supprimé, GM_PHONES documenté ; sondes : refus hors liste ✅ + acceptation via allowlist puis rejet D71 sur ID bidon ✅). **Routage `!` prioritaire ✅** (plus de détournement HELP). **nR12 ✅ APPLIQUÉ** (1 243 chunks). **nR13 ⚠️ 78 %** : 200/256 spawns — `DIR_TO_ZONE` cible `ZONE_NEU_HUNT_001` **inexistante** → violations FK → batchs de 50 perdus (mobs aincrad/neutre/jotunheimr/yggdrasil sans spawn, `ZONE_UND_HUNT_001` vide par collatéral). **SONDE DÉCISIVE : le combat fonctionne de bout en bout sur les 8 zones peuplées — première fois depuis le début de l'audit.** Nouveaux mineurs : flux de tour (« attaque » en combat → refus au lieu de jouer le tour ; router vers `handleCombatAction` si combat actif) ; nettoyage de noms incomplet (`─` U+2500 traité mais `—` U+2014 persiste + apostrophes perdues). Correctifs courts : re-mapper DIR_TO_ZONE vers des zones existantes (+ valider zone_id avant push, une mauvaise ligne ne doit plus tuer un batch) + re-seed → répare Undine ; flux ATTACK ; tirets/apostrophes. Rapport : addendum 45-septies du doc 22.

### Addendum 45-octies — Contre-audit vague 4.4 PE (commit `df2f41a`, 14h53) — diff + exécution

**Flux de tour de combat ✅ CLOS** (sonde : « attaque » en combat joue le tour). **nR13 ✅ 257/257 spawns**, FK-safe, Undine restaurée. Deux découvertes :
- ⚠️ **nR14** : le re-mapping déverse l'axe vertical (aincrad/neutre/jotunheimr/golden/air) dans **ZONE_SYL_HUNT_001 = 97 mobs (38 % du bestiaire)** alors que les bonnes zones existent en base (AIN_HUB, JOT_FLD/RAID, YGG_DUN/TOP, routes) — `KNOWN_ZONES` restreint aux 18 HUNT a forcé ce choix. Aggravation : gabarits boss non parsés → **stats par défaut : Skuld/Kayaba/Jörmungandr chassables en zone Sylphe T1 à niveau 1/100 PV** (vérifié : battus en 2 tours). Correctif : étendre KNOWN_ZONES, exclure `is_boss` du spawn ouvert, gérer les gabarits boss.
- ⚠️ **nR15** : générateur propre mais **base sale** — les INSERT monstres en `ON CONFLICT DO NOTHING` ne mettent jamais à jour les lignes existantes → seuls un `rebuild.sh` complet applique les noms nettoyés. Et l'apostrophe manquante (« d Argent ») est **dans les fiches sources AIN/YGG** (dette corpus étape 35, périmètre ACP sur demande PE).
Fond architecture inchangé (source LLM, gating K2/L1, P2 RAG, QI, D12, auth, Redis). Rapport : addendum 45-octies du doc 22.

### Addendum 45-nonies — Contre-audit vague 4.5 PE (commit `50bea53`, 15h01) — par exécution

**L'essentiel de nR14/nR15 est fait et vérifié** (31/31 ✅) : boss dans les donjons raciaux (2/DUN_001), axe vertical réparti (AIN_HUB=15, JOT_FLD=13, JOT_RAID=2B), SYL_HUNT dégonflé 97→65, noms propres en base (`DO UPDATE SET`), 257/257. **Résidus tous circonscrits au corpus d'axe vertical** : nR14-b (gabarits boss non parsés → **29 mobs d'instance à niv ≤2**, Kayaba/Skuld niv 1/100 PV dans AIN_HUB), nR14-c (5 boss encore en SYL_HUNT : MOB_NEU_025/026 + MOB_YGG_025/026/00X — dirs `neutre`/`yggdrasil` hors DIR_TO_BOSS_ZONE ; YGG_DUN/TOP vides), nR15-b (fiche dégénérée `MOB_YGG_00X` : ID malformé, nom wiki, **apostrophes doublées `d''Yggdrasil` en base** = double-échappement parseur+batchInsert — garder UNE couche), 5 noms YGG_030-034 sales. **Lecture : code bot + générateur au niveau ; reste = dette CORPUS étape 35 (fiches AIN/YGG) + 2 retouches générateur — réparation fiches = périmètre ACP sur demande PE.** Rapport : addendum 45-nonies du doc 22.

### Addendum 45-decies — Contre-audit vague 4.6 PE (commit `28b3ace`, 15h12) — 🎉 CLÔTURE DE L'AUDIT

Vérifié par exécution (31/31 ✅) : **nR14-b CLOS** (`parsePipeTableStats()` — Skuld niv 75/50 000 PV, Kayaba niv 68/22 000, 0 mob d'instance ≤ niv 2), **nR14-c CLOS** (0 boss en HUNT, YGG_DUN=20, 4 boss neutres en SYL_DUN — compromis documenté), **nR15-b CLOS** (00X filtré, 1 couche d'échappement, apostrophes correctes). Les « 5 noms sales » restants = **faux positif ACP** (tirets médians légitimes : « Racine Primordiale — Vie », noms composés des 5 racines). 256 monstres/256 spawns/19 zones.

**ÉTAPE 45 CLOSE : audit initial + 6 vagues correctives PE + 6 contre-audits ACP (4 par exécution). Trajectoire : 3 violations de contrat + jeu injouable → 0 finding ouvert côté bot/générateur/seed.** Restent au dossier (hors bot) : dettes corpus AIN/YGG (apostrophes de titres, `ZONE_YGG_RACINE_030` hors atlas, fiche 00X à réécrire — périmètre ACP sur demande PE) + fond d'architecture connu (source LLM dédiée, gating K2/L1, P2 RAG fiches+e5, parseur QI, D12, auth API, Redis, monde seedé = sous-ensemble de l'atlas).

---

## ÉTAPES 46-47 (chantier PE, constatées par audit) + Addendum 45-undecies — revérification continue (2026-07-11 ~17h30)

**Étape 46 (PE, `9d4143a`)** : 18 corrections d'apostrophe dans le corpus d'axe vertical (AIN/AIR/YGG — la dette corpus relevée en 45-nonies/decies), seed régénéré + re-seedé. ✅ Vérifié conforme. *(Ce commit embarque aussi les mises à jour d'état 45-decies de l'ACP, dont le commit avait été interrompu par une panne d'infrastructure.)*

**Étape 47 (PE, `b0ab4dd` + README `aa4386b`)** : **pivot d'architecture WhatsApp — groupes par TERRITOIRE** (13 territoires couvrant les 52 zones : 9 raciaux + Alne + Aincrad + Jötunheimr + Yggdrasil ; 29 groupes permanents + `syncPlayerGroups()` par retrait), motivé par la **limite des ~100 groupes par communauté WhatsApp** (contrainte réelle). + Hall de Guilde à Alne : 4 nouveaux PNJ `NPC_ALN_100-103` (✅ **aucune collision** vérifiée — ancien roster = `NPC_ALN_00-99`), parseur PNJ réparé (104 PNJ Alne corrects).

**⚠️ POINT D'AUDIT MAJEUR (D-P3-1)** : le pivot territorial n'est répercuté QUE dans le code/schéma/README. Les **documents maîtres** (`zone_movement_protocol.md` R0 « 1 joueur = 1 groupe LOCATION », `atlas_monde_liaisons.md` taxonomie des groupes) sont **intouchés depuis la Phase C** → divergence docs maîtres ↔ réalité implémentée. La décision produit étant actée par le PE (README + code), ce sont les **docs maîtres qui doivent être amendés** (R0 reformulé : 1 joueur = 1 groupe TERRITOIRE, granularité zone portée par l'état L1 `current_zone_id` ; taxonomie atlas ; CDC concernés) — **travail ACP, sur demande PE**.

**Constats annexes** : ➕ `directives_generiques/` (non versionné) = kit méthodologique générique extrait du projet par le PE (CDC d'intégration IA, persona CONTROLEUR, méthode de décomposition, gabarit SYS, architecture déterministe) — à committer ou ignorer (décision PE). 🚧 **Chantier non commité en cours** (étape 48 probable) : effets de statut au combat (DoT/buff/debuff par famille de monstre, 20 %, dictionnaire `t_status_effects_dict`, +6 tests) — déterministe, conforme à la frontière, **suite exécutée par l'ACP : 37/37 ✅**.

---

## ÉTAPE 48 — Réalignement des documents maîtres sur le pivot territorial WA (D76) ✅ CLOS (2026-07-12)

**Contexte** : résorption du **point d'audit majeur** relevé à l'étape 47 (D-P3-1) — le pivot « groupes WhatsApp par territoire » était acté par le PE dans le code/schéma/README (`b0ab4dd`), mais les documents maîtres (protocole R0, atlas, CDC, MCD/MLD) décrivaient encore le modèle v1 « 1 zone = 1 groupe ». Travail ACP sur demande PE (« commence l'étape 48 »), 100 % markdown, `bot/` intact.

### Décision actée

- **D76 — Pivot territorial WhatsApp** (décision produit PE étape 47, docs maîtres amendés étape 48) : 1 **territoire** = 1 groupe WA ; **13 territoires** couvrent les 52 zones (9 raciaux + `alne` + `aincrad` + `jotunheimr` + `yggdrasil`) ; **26 groupes permanents** (4 communauté + 9 raciaux + 13 territoriaux), ~74 slots dynamiques ; la **zone** reste la granularité du gameplay (adjacence R3, spawns, capacité, jauges D12), portée exclusivement par l'état L1 `T_AVATARS.current_zone_id` ; changement de groupe uniquement au franchissement de frontière de territoire (`sync_player_groups()` par retrait, idempotente). **R0 reformulé** : `card(TERRITOIRE ∪ INSTANCE) = 1`. Aucune commande ajoutée/retirée (complétude à périmètre constant). ⚠️ Numérotation : D72-D75 étaient déjà consommées (étape 37, équilibrage éco) — d'où **D76** ; collision évitée en cours d'étape.

### Modifications

| # | Action | Fichier |
|---|---|---|
| 48.1 | ✏️ **Réécrit v2.0** — principe fondateur à double granularité (zone logique / territoire physique), R0-R10 reformulées (R1 synchro par retrait + cas intra-territorial, R2 permanents 4+9, R4 capacité au grain zone L1, R5/R7/R8 adaptées), machine à états avec SWITCH conditionnel, cas limite nominal « même groupe ≠ même zone », registre de commandes inchangé | `données/the_seed_engine/system_mechanics/zone_movement_protocol.md` |
| 48.2 | ✏️ Amendé — règle absolue d'en-tête, conventions §1 (slug territoire, nom de groupe territorial), **taxonomie §2 refondue sur l'enum implémenté** (`location`=territoire, `dungeon_instance`, `community_hub`, `guild_hall`, `private_party`, `housing`, `arena`, `system` + mapping v1→v2), **nouveau §2-bis = REGISTRE MAÎTRE DES TERRITOIRES** (13 territoires, zones d'ancrage, groupes, budget 26+74), note New Aincrad harmonisée | `données/cartographie/atlas_monde_liaisons.md` |
| 48.3 | ✏️ Amendé — principe cardinal §1, EF-02 (R0 v2), D4 (taxonomie v2), **+D76** au registre des décisions | `cahier_des_charges.md` |
| 48.4 | ✏️ Amendé — définition conceptuelle (Territory Mapping), `zone_id` = zone d'ancrage, protocole d'exclusion mutuelle v2 en 6 étapes (écriture L1 d'abord, switch conditionnel) | `cardinal_system_db/MCD_Concept/entite_whatsapp_group.md` |
| 48.5 | ✏️ **Réécrit** — aligné sur le schéma implémenté (`avatar_uuid`, `sync_player_groups()`) ; `move_player_to_zone()` v1 supersédée ; contrats (résolution zone→territoire = atlas §2-bis, 13 lignes `location`) | `cardinal_system_db/MLD_Logic/table_t_wa_groups.md` |
| 48.6 | ✏️ Amendé — §3 mouvement (sémantique v2 de `!enter_zone`, exclusivité territoriale) | `the_seed_engine/whatsapp_commands_list.md` |
| 48.7 | ✏️ Amendé — `SYS_SYNC_PRESENCE` (vérité = `current_zone_id`, R0 v2), `SYS_LOCK_ZONE` (grain zone, pas groupe) | `the_seed_engine/ai_orchestrator_commands.md` |
| 48.8 | ✏️ Amendé — mentions R0 : CDC-13 (frontière déterministe), CDC-14 (clé de sharding = territoire, sous-clé zone), CDC-19 (mouvement + contrat SYS) | `directives_generation/13/14/19_*.md` |
| 48.9 | ✏️ Amendé — `!home_return` reformulé (écriture L1 + synchro territoire ; groupe HOME `housing` = canal social hors décompte R0) | `system_mechanics/marriage_housing_system.md`, `MLD_Logic/table_t_properties.md` |
| 48.10 | ✏️ Harmonisé — principe fondateur (D76) + **correction d'incohérence interne : 16/29 permanents & 71 slots → 26 permanents (4+9+13) & ~74 slots** (compte issu du code `zone-groups.js`) | `README.md` |

### État de sortie

**Divergence docs maîtres ↔ réalité implémentée : RÉSORBÉE.** Balayage de vérification : plus aucune occurrence active de « 1 lieu/zone = 1 groupe » ni de la taxonomie v1 hors mapping documenté, archives et rapports d'audit historiques. `bot/`, `schema.sql`, `seed*.sql` intacts (D-P3-1) — le chantier PE non commité (effets de statut, 37/37 ✅) n'a pas été touché. Points relevés au passage : (a) le kit `directives_generiques/` du PE réutilise les libellés D71/D72 comme noms d'étapes de pipeline — espace de nommage distinct du registre de décisions projet, à surveiller ; (b) `directives_generiques/` et `pour_rc/` toujours non versionnés (décision PE) ; (c) backlog inchangé (accessoires D39, auberge, `T_GUILDS`, `SYS_RAG_REINDEX`, `ZONE_ROUTE_LUGRU`, CGU API, gating K2/L1, P2 RAG fiches+e5, parseur QI).

---

## ÉTAPE 49 — Étude patterns rareté/drop (genre action-RPG de chasse) ✅ (2026-08-10)

**Objectif** : le PE a proposé un comparatif avec un jeu de chasse commercial précis pour enrichir le système de rareté/drop d'ALO (bestiaire riche, mécaniques variées). Demande initiale = télécharger/apporter une ROM du jeu → **refusée** (contenu protégé, y compris depuis un dump personnel R4 : extraire des tables de données propriétaires d'un binaire commercial reste une reproduction de contenu protégé, et parser un ROM chiffré est de la rétro-ingénierie hors périmètre). Accord PE : travailler sur des **patterns génériques du genre**, sans jeu précis nommé ni valeur chiffrée copiée. Scope resserré par le PE à **rareté & drop rates** (écarté : affliction/statuts — chantier PE en cours non commité, pour ne pas percuter).

### Modifications

| # | Action | Fichier |
|---|---|---|
| 49.1 | ➕ Créé — étude comparative : constat (Rareté quasi-1:1 avec Tier aujourd'hui, un seul axe de variance), 5 patterns génériques recensés (P1 courbe de rareté indépendante du tier, P2 récolte par partie, P3 rolls multiples — déjà couvert par D73, P4 bonus contextuel — déjà couvert par `SYS_REWARD_LAST_ATTACK`, P5 variants de créature), **D77** actée (rareté découplée du tier pour les créations futures, sans rétroaction, ne réouvre pas D73), **D78** actée en principe (schéma de récolte par partie `Parties_Récoltables`, résolution L1 déterministe, priorité boss, application différée), arbitrage PE explicite requis pour P5 (touche `T_SPAWN_TABLES` + 256 fiches bestiaire auditées étape 36) et pour l'exécution de D78, capture écartée (hors-thème VRMMO/SAO) | `directives_generation/23_etude_patterns_rarete_drop.md` |
| 49.2 | ✏️ Modifié — ligne « Dernière mise à jour » + reclassement historique | `alo_context.md` |
| 49.3 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |

### Décisions actées

- **D77** : le champ Rareté d'un item/matériau n'est plus dérivé automatiquement de son Tier — choix par usage voulu (sink de farm vs input de progression). S'applique aux créations futures uniquement ; les fiches déjà closes (têtes 100, matériaux 100, etc.) ne sont pas retouchées par cette étude.
- **D78** : mécanique de récolte par partie (nouveau champ optionnel `Parties_Récoltables` sur fiche `MOB_*`/`BOSS_*` : `{Partie, Seuil_Dégâts_%, Table_Loot_Dédiée}`, résolution déterministe L1 au franchissement de seuil, indépendante du loot de fin de combat). Schéma et propagation de commandes (`!sys_carve_set` GM / `SYS_SET_CARVE_TABLE` IA) décidés ; **application aux fiches réelles différée**, priorité boss territoriaux+axe vertical si le chantier est ouvert par le PE.

### État de sortie

**Aucun fichier de contenu existant modifié** (D77 non rétroactif, D78 = schéma seulement). Aucune ROM ni donnée propriétaire utilisée. Points laissés à l'arbitrage PE : ouverture du chantier D78 (dépeçage boss), pattern P5 (variants de créature, blast radius = `T_SPAWN_TABLES` + bestiaire audité). Prochaine étape au choix du PE.

---

## ÉTAPE 50 — Chantier D78 ouvert et clos : dépeçage sur les 9 boss territoriaux ✅ (2026-08-10)

**Objectif** : le PE a explicitement ouvert le chantier D78 (schéma acté étape 49), scope = « boss territoriaux ». Application de la mécanique de récolte par partie aux 9 boss de donjon territoriaux, sans toucher aux boss d'axe vertical ni aux mobs communs (hors du périmètre demandé).

**Méthode** : pour chaque boss, réutilisation des seuils **déjà écrits** dans sa propre fiche (Phase 2 / Phase 3, % HP restant — aucun nouveau nombre inventé) ; 2 lignes existantes de la Table de Drop (l'Épique-clé + le Légendaire, choisis pour leur cohérence narrative avec la description de la phase) déplacées vers une nouvelle section « Parties Récoltables (D78) » — même item, même rareté, même taux, seul le déclencheur change (roll garanti au franchissement du seuil plutôt qu'un roll aveugle de fin de combat). Neutre sur l'équilibrage économique étape 37 (aucune probabilité totale de drop augmentée).

### Modifications

| # | Action | Fichier |
|---|---|---|
| 50.1 | ✏️ Modifié — Bras-Enclume@50%HP→Marteau du Géant, Fournaise Interne@25%HP→Cœur de Braise | `données/cartographie/territoires_raciaux/salamander/donjon_caldeira_obsidienne.md` |
| 50.2 | ✏️ Modifié — Flancs Écailleux@60%HP→Écaille du Léviathan, Cœur Battant@30%HP→Perle du Cœur Battant | `données/cartographie/territoires_raciaux/undine/donjon_gouffre_leviathan.md` |
| 50.3 | ✏️ Modifié — Défenses@50%HP→Défense du Roi, Poitrail@25%HP→Cœur de Béhémoth | `données/cartographie/territoires_raciaux/caitsith/donjon_taniere_roi_behemoth.md` |
| 50.4 | ✏️ Modifié — Baguette-Main@50%HP→Baguette du Maestro, Partition@25%HP→Fragment de Partition Originelle | `données/cartographie/territoires_raciaux/puca/donjon_amphitheatre_oublie.md` |
| 50.5 | ✏️ Modifié — Griffes@50%HP→Griffes du Hurleur, Larynx@25%HP→Larynx d'Alpha | `données/cartographie/territoires_raciaux/imp/donjon_caverne_hurleurs.md` |
| 50.6 | ✏️ Modifié — Fissures du Corps@50%HP→Marteau du Filon, Noyau Magnétique@25%HP→Cœur de Mithril | `données/cartographie/territoires_raciaux/gnome/donjon_mine_mithril_abandonnee.md` |
| 50.7 | ✏️ Modifié — Bras-Presse@50%HP→Marteau-Pilon de Poing, Noyau Central@25%HP→Noyau du Directeur | `données/cartographie/territoires_raciaux/leprechaun/donjon_atelier_englouti.md` |
| 50.8 | ✏️ Modifié — Sceptre-Bras@50%HP→Sceptre du Royaume Mort, Visage@25%HP→Masque de Pennroth (phase déjà nommée « jette son masque » — anchoring naturel) | `données/cartographie/territoires_raciaux/spriggan/donjon_necropole_antique.md` |
| 50.9 | ✏️ Modifié — Ailes@50%HP→Ailes de l'Archonte, Œil du Cyclone@25%HP→Cœur de Tempête | `données/cartographie/territoires_raciaux/sylph/donjon_vent_hurlant.md` |
| 50.10 | ✏️ Modifié — mapping `SYS_SET_CARVE_TABLE` §4 + décision **D-DET-5** §6 | `directives_generation/19_cdc_moteur_deterministe.md` |
| 50.11 | ✏️ Modifié — ajout GM `!sys_carve_set` §1 | `données/the_seed_engine/whatsapp_commands_list.md` |
| 50.12 | ✏️ Modifié — ajout IA `SYS_SET_CARVE_TABLE` §3 | `données/the_seed_engine/ai_orchestrator_commands.md` |
| 50.13 | ✏️ Modifié — D78 marquée ✅ appliquée, tables §3/§4/§5 mises à jour (statut exécuté, fichiers réels listés) | `directives_generation/23_etude_patterns_rarete_drop.md` |
| 50.14 | ✏️ Modifié — ligne « Dernière mise à jour » + reclassement historique | `alo_context.md` |
| 50.15 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |

### Décisions actées

- **D-DET-5** (moteur déterministe, `19_cdc_moteur_deterministe.md` §6) : le dépeçage par partie est résolu exclusivement par L1, jamais par une IA ; formalise le déclencheur « seuil de dégâts localisé (% HP, phase déjà définie par boss) → roll garanti indépendant du roll de fin de combat ».

### État de sortie

**D78 CLOS sur le périmètre demandé** : 9/9 boss territoriaux équipés d'une section Parties Récoltables (18 lignes de loot au total re-rattachées), commandes GM/IA propagées, moteur déterministe à jour. Économie étape 37 intacte (mêmes items/raretés/taux). Hors périmètre (non traité, à la discrétion du PE) : boss d'axe vertical (Yggdrasil/Jötunheimr/New Aincrad), pattern P5 variants de créature sur les 256 mobs communs (`T_SPAWN_TABLES`, bestiaire audité étape 36).

---

## ÉTAPE 51 — Extension D78 aux 7 boss d'axe vertical ✅ (2026-08-10)

**Objectif** : le PE a demandé l'extension explicite de D78 aux boss d'axe vertical (Yggdrasil, Jötunheimr, New Aincrad), suite à l'étape 50.

**Constat fait en exécutant (non anticipé par le schéma initial)** : le roster d'axe vertical `_index_boss_axe_vertical.md` **n'est pas uniforme**. Lecture des 7 fiches : 4 boss de palier (`BOSS_AIN_001`, `027`, `074`, `075`) ont une vraie table de loot (Yrds de palier, Gemme, Last Attack Bonus lié) ; 3 boss apex (`BOSS_YGG_001`, `BOSS_JOT_001`, `BOSS_AIN_100`) portent une décision de design antérieure et explicite — « aucun Yrd, aucune arme » (anti-farm strict, texte déjà présent dans leurs fiches avant cette étape). Décision d'exécution : ne **pas** rouvrir cette décision anti-farm sans arbitrage PE ; appliquer D78 en respectant la distinction — items réels déplacés pour les 4 boss de palier (même méthode que l'étape 50), formalisation du déclencheur sans nouvel item pour les 3 boss apex.

### Modifications

| # | Action | Fichier |
|---|---|---|
| 51.1 | ✏️ Modifié — Last Attack Bonus (Manteau de Minuit) formalisé en Parties Récoltables, seuil dernière barre/bascule nodachi | `données/personnages_bestiaire/boss_aincrad/boss_ain_001_illfang_kobold_lord.md` |
| 51.2 | ✏️ Modifié — Masse d'armes Épique (Tier A) déplacée en Parties Récoltables, seuil Phase 2/désynchronisation des bras | `données/personnages_bestiaire/boss_aincrad/boss_ain_027_geant_4_bras.md` |
| 51.3 | ✏️ Modifié — Last Attack Bonus (fragment d'arme T5) formalisé, seuil Phase 3/Fenêtre de Dual Blades | `données/personnages_bestiaire/boss_aincrad/boss_ain_074_the_gleam_eyes.md` |
| 51.4 | ✏️ Modifié — Last Attack Bonus (composant d'arme légendaire) formalisé, seuil mi-combat/scission en segments (pas de phase d'enrage par design sur ce boss — seuil = seul repère décrit) | `données/personnages_bestiaire/boss_aincrad/boss_ain_075_the_skull_reaper.md` |
| 51.5 | ✏️ Modifié — récompense système (Titre « Conquérant d'Aincrad » + gravure) formalisée, seuil Phase finale/Vide du Créateur ; **aucun item ajouté** | `données/personnages_bestiaire/boss_aincrad/boss_ain_100_le_souverain_ecarlate.md` |
| 51.6 | ✏️ Modifié — récompense système (déverrouillage Sommet + Titre) formalisée, seuil Phase d'Enrage ; **aucun item ajouté** | `données/personnages_bestiaire/monstres/yggdrasil/boss_ygg_001_gardien_du_dome.md` |
| 51.7 | ✏️ Modifié — événement système (effondrement Thrymheim + récupération Excalibur) formalisé, seuil Phase d'Enrage ; **aucun item ajouté** | `données/personnages_bestiaire/monstres/thrym_roi_des_geants.md` |
| 51.8 | ✏️ Modifié — §4 « Loot » corrigé (l'ancienne mention « aucun drop monnayable sur les boss d'axe » était inexacte pour les 4 boss de palier — inexactitude préexistante, corrigée au passage) + note D78 + commandes | `données/personnages_bestiaire/_index_boss_axe_vertical.md` |
| 51.9 | ✏️ Modifié — décision D-DET-5 précisée : nuance anti-farm (4 boss de palier vs 3 boss apex) | `directives_generation/19_cdc_moteur_deterministe.md` |
| 51.10 | ✏️ Modifié — §1/§3/§4/§5 mis à jour (D78 étendu, tableau des fichiers, résumé) | `directives_generation/23_etude_patterns_rarete_drop.md` |
| 51.11 | ✏️ Modifié — ligne « Dernière mise à jour » + reclassement historique | `alo_context.md` |
| 51.12 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |

### État de sortie

**D78 CLOS sur l'intégralité du roster de boss nommés (16/16 : 9 territoriaux + 7 axe vertical)**. Aucun item introduit sur les 3 boss apex anti-farm (décision de design antérieure respectée, non rouverte sans arbitrage). Commandes GM/IA (propagées étape 50) couvrent déjà l'ensemble du roster, aucun ajout nécessaire. Seul point encore hors périmètre, à l'arbitrage du PE : pattern P5 (variants de créature) sur les 256 mobs communs (`T_SPAWN_TABLES`, bestiaire audité étape 36).

---

## ÉTAPE 52 — D79 : variants de créature commune (P5), chantier étude 23 clos ✅ (2026-08-10)

**Objectif** : le PE a demandé l'extension explicite de P5 (variants de créature) aux 256 mobs communs — dernier point que l'étude `23_etude_patterns_rarete_drop.md` laissait à l'arbitrage PE (blast radius identifié : `T_SPAWN_TABLES` close + bestiaire audité étape 36, 0 collision).

**Décision d'exécution** : l'approche initialement esquissée en §2 de l'étude (« 2ᵉ instance de loot par fiche ») aurait effectivement touché les 256 fiches et gonflé `T_SPAWN_TABLES` — écartée. Design retenu à la place : **paramétrique**, sur le précédent déjà établi dans ce projet pour les paliers génériques de New Aincrad (`_index_boss_axe_vertical.md` §3 — profil calculé à la volée, pas de fiche permanente). Un Variant est une **promotion d'instance résolue par L1 à l'instanciation du spawn**, jamais une entrée de catalogue : roll indépendant 5% (défaut, ajustable) sur une ligne `T_SPAWN_TABLES` existante → si promu, les stats déjà écrites sur la fiche du mob sont multipliées (PV ×2,5, ATQ/DEF ×1,4, XP ×2), la ligne de loot déjà existante passe de probabiliste à garantie + Yrds ×3. **Résultat : zéro fichier touché sur les 256 fiches `MOB_*`, zéro nouvelle ligne `T_SPAWN_TABLES`, budget de zone ≤100% intact, zéro nouvel item** — le blast radius identifié à l'étape 49 est annulé par le choix de design, pas contourné par une exception.

### Modifications

| # | Action | Fichier |
|---|---|---|
| 52.1 | ✏️ Modifié — décision **D79** ajoutée (§2, sortie du tableau d'arbitrage §3), tableau des fichiers §4 et résumé §5 mis à jour — chantier de l'étude marqué entièrement clos | `directives_generation/23_etude_patterns_rarete_drop.md` |
| 52.2 | ✏️ Modifié — ligne `SYS_SET_VARIANT_RATE` au mapping §4 + décision **D-DET-6** §6 | `directives_generation/19_cdc_moteur_deterministe.md` |
| 52.3 | ✏️ Modifié — ajout GM `!sys_variant_rate` §1 | `données/the_seed_engine/whatsapp_commands_list.md` |
| 52.4 | ✏️ Modifié — ajout IA `SYS_SET_VARIANT_RATE` §3 | `données/the_seed_engine/ai_orchestrator_commands.md` |
| 52.5 | ✏️ Modifié — note de résolution D79 ajoutée (aucun changement de schéma) | `données/cardinal_system_db/MLD_Logic/table_t_spawn_tables.md` |
| 52.6 | ✏️ Modifié — ligne « Dernière mise à jour » + reclassement historique | `alo_context.md` |
| 52.7 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |

### Décisions actées

- **D79** : variant de créature commune (pattern P5) — résolution paramétrique par L1 à l'instanciation du spawn, 5% de chance par défaut (ajustable `!sys_variant_rate`/`SYS_SET_VARIANT_RATE`), stats ×2,5 PV/×1,4 ATQ-DEF/×2 XP, loot existant garanti + Yrds ×3. Aucun nouveau fichier, aucune nouvelle ligne `T_SPAWN_TABLES`, aucun nouvel item.
- **D-DET-6** (moteur déterministe) : formalise D79 comme résolution 100% L1, jamais IA ; persistance de l'état d'instance = détail d'implémentation `bot/` (P3, hors périmètre ACP).

### État de sortie

**Le chantier ouvert par l'étude 23 (D77/D78/D79) est désormais entièrement clos** : rareté découplée du tier (créations futures), récolte par partie sur les 16 boss nommés (territoriaux + axe vertical), variants sur les mobs communs — **aucun arbitrage PE en attente sur ce sujet**. Aucune ROM ni donnée propriétaire d'un jeu commercial utilisée à aucune étape (49-52). Bestiaire (256 fiches, étape 36) et `T_SPAWN_TABLES` (budget de zone) intacts.

---

## ÉTAPE 53 — Backlog documentaire mineur clos + D80 ✅ (2026-09-17)

**Objectif** : reprise de session sur demande PE explicite (« remettre le projet à l'ordre du jour »). Deux fronts choisis : (1) nettoyage du registre de décisions D1-D79 (skill `domain-modeling`, inventaire par agent Explore — livrable séparé, cf. entrée suivante à son atterrissage) ; (2) fronts (b) du point « Prochaine étape » d'`alo_context.md` — backlog documentaire mineur.

**Constat de départ** : sur les 4 points listés « à arbitrer PE », un seul (accessoires, D39) était en réalité déjà tranché — `05_cdc_accessoires.md` avait acté le gel et l'archivage dès l'étape 10-quater, mais l'action d'archivage n'avait jamais été exécutée (les 14 fiches étaient toujours en place, `cahier_des_charges.md` §10 le documentait explicitement comme « statu quo assumé »). Les 3 autres (taverniers, guildes, corridor) étaient de vrais points ouverts.

### Modifications

| # | Action | Fichier |
|---|---|---|
| 53.1 | 🗄️ Archivé — exécution de la conséquence 2 déjà actée (jamais faite) : 14 fiches accessoires → `deprecated_v1/` | `ressources_brutes/deprecated_v1/accessoires/{anneaux,ceintures,colliers,capes}/` (depuis `données/items_equipements/accessoires/`) |
| 53.2 | ✏️ Modifié — statut passé de « ⏳ à arbitrer » à « ✅ clos » (accessoires) + note taverniers/guildes/T_GUILDS mise à jour | `cahier_des_charges.md` |
| 53.3 | ✏️ Modifié — conséquence 2 marquée faite | `directives_generation/05_cdc_accessoires.md` |
| 53.4 | ✏️ Modifié — `[BESOIN_NPC]` JOB_HOS_012/013 entérinés (dortoir Forge-Mère / maison d'hôtes municipale = solutions définitives, pas de PNJ créé) | `données/game_design/emplois/job_hos_012_intendant_dortoir_forge_mere.md`, `job_hos_013_hote_maison_masques.md` |
| 53.5 | ✏️ Modifié — `[BESOIN_GUILD]` JOB_LOG_002/012/013 résolus par référence à un registre de guildes de métier hors `T_GUILDS` | `données/game_design/emplois/job_log_012_convoyeur_lingots.md`, `job_log_013_convoyeur_tresors_voiles.md` |
| 53.6 | ✏️ Modifié — §5 « Guildes de métier (lore) » créée (`GUILDE_LEP_FORGES`, `GUILDE_SPR_TRESORS`, `GUILDE_CARAVANIERS`) + note de portée en tête (T_GUILDS = guildes de joueurs exclusivement) | `données/cardinal_system_db/MLD_Logic/table_t_guilds.md` |
| 53.7 | ✏️ Modifié — commentaire `employer_ref` clarifié + note dictionnaire (BESOIN_* résolus) | `données/cardinal_system_db/MLD_Logic/table_t_jobs.md` |
| 53.8 | ✏️ Modifié — §4 réécrite, `[BESOIN_NPC]`/`[BESOIN_GUILD]` clos, table de répartition employeur mise à jour | `données/game_design/emplois/_index_emplois.md` |
| 53.9 | ✏️ Modifié — `!sys_rag_reindex [scope]` ajouté §1 (D-RAG-9) | `données/the_seed_engine/whatsapp_commands_list.md` |
| 53.10 | ✏️ Modifié — `SYS_RAG_REINDEX(scope)` ajouté §6 | `données/the_seed_engine/ai_orchestrator_commands.md` |
| 53.11 | ✏️ Modifié — §14 : `[BESOIN_COMMANDE]` levé, propagation actée (P3 ouvert depuis l'étape 44, réserve caduque) | `directives_generation/15_cdc_rag.md` |
| 53.12 | ✏️ Modifié — `ZONE_ROUTE_LUGRU` ajouté au registre §4.2 (Sylph) + liaison `NEU_CAP_001` §4.11 (D80) | `données/cartographie/atlas_monde_liaisons.md` |
| 53.13 | ✏️ Modifié — trigger L4 reformulé (`link_type='FLY'` au lieu de `Type=ROUTE`) | `données/cardinal_system_db/MLD_Logic/table_t_zone_links.md` |
| 53.14 | ✏️ Modifié — **D80** ajoutée au tableau des décisions | `cahier_des_charges.md` |
| 53.15 | ✏️ Modifié — ligne « Dernière mise à jour », « Point ouvert » vidé, « Prochaine étape » (b) marquée close, entrée ajoutée à « Documents maîtres » | `alo_context.md` |
| 53.16 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |
| 53.17 | ➕ Créé — **registre unique des décisions D1-D82 + D-SLUG-N** (front 2 de la session, skill `domain-modeling`, inventaire par agent Explore sur l'ensemble du dépôt + `directives_generiques/` non versionné) | `registre_decisions.md` |
| 53.18 | ✏️ Modifié — collision D45/D46 résolue (renumérotés **D81**/**D82**, le couple « port/tenue » opérationnellement enraciné fait autorité sur les numéros d'origine) ; blocs « ÉTAPE 11 »/« ÉTAPE 12 » dupliqués littéralement supprimés (une seule occurrence conservée) | `alo_progression.md` (cette même modification) |
| 53.19 | ✏️ Modifié — citation croisée corrigée : grille de prix attribuée à D15 (pas D13) | `directives_generation/02_cdc_items.md` |

### Décisions actées (front 2)

- **D81** *(ex-D45)* : Barème QI Archipel — renuméroté pour lever la collision avec D45 « système de port ».
- **D82** *(ex-D46)* : Fils rouges Undine — renuméroté pour lever la collision avec D46 « tenue par défaut ».

### État de sortie (front 2 — registre de décisions)

**Registre de décisions consolidé et publié** (`registre_decisions.md`, documents maîtres). D1-D82 + 10 familles `D-SLUG-N` recensées avec source, étape et statut. Deux vraies collisions numériques trouvées et résolues (D45/D46), une citation croisée corrigée (D13/D15), une duplication de blocs de journal supprimée. Le kit générique non versionné `directives_generiques/` reste un espace de nommage **volontairement distinct** (D71-D75/D-DET-1→3 y ont un sens différent) — documenté, non modifié (hors périmètre ACP). Prochain numéro simple libre : **D83**.

---

## ÉTAPE 54 — Menu contextuel numéroté (D83) ✅ (2026-09-17)

**Objectif** : sur demande PE explicite, penser le design UX de la couche déterministe (avant tout volet IA) pour un « joueur lambda » qui veut de la fluidité sans retenir la totalité des ~190-200 commandes `!*` — condition explicite du PE : rester 100% déterministe pour garantir un C4 de secours solide, indépendant de toute IA.

**Diagnostic (skill `codebase-design`, vocabulaire module profond/superficiel)** : l'interface de commandes est **inconsistante** — de bons instincts de profondeur existent déjà (`!use [Item_ID]` cache tout un pan de comportement derrière un seul verbe ; `!demander [NPC] [sujet]` résout contre l'enveloppe QI entière du PNJ), mais la §21 (`whatsapp_commands_list.md`, services de Capitale Alne) expose **~34 verbes quasi jetables**, un par PNJ de service (`!laundry`, `!sharpen`, `!portrait`, `!gazette`, `!fence`/`!smuggle`/`!loan`…) — une interface superficielle qui recopie 1:1 la liste interne des PNJ plutôt que de la cacher.

**Décision d'exécution** : deux leviers identifiés, tous deux compatibles C4 (zéro IA). Levier 1 (présentation, menu contextuel) traité **en premier** — gain immédiat, zéro risque, ne touche à aucun contenu déjà livré. Levier 2 (fusion des ~34 verbes de la §21 dans `!demander`/`!parler`) **reporté** — c'est une refonte de contenu existant (documentation + raccords GM/IA déjà propagés), pas un ajout ; noté en « Point ouvert » d'`alo_context.md` pour reprise ultérieure sur demande PE.

**Design retenu (D83)** : après un tour de combat/dialogue/boutique/mouvement/tableau de quêtes, le bot ajoute un bloc de 1-8 options numérotées **déjà entièrement résolues par L1** (pas de saisie complémentaire), + `9` = aide contextuelle universelle (ne consomme jamais le menu), + `0` = pagination si plus de 8 options valides. Résolution par **citation** du message-menu (garantie, zéro ambiguïté) ou par **chiffre nu** si un menu non expiré existe pour l'avatar (`T_PENDING_MENUS`, TTL 60-300s selon contexte — court en combat, plus long en dialogue/boutique/quêtes). **Ne retire aucune commande texte existante** : les deux voies restent valides en permanence, un joueur expérimenté peut continuer à taper `!attaque` directement. Le contenu d'un menu est **toujours** calculé par L1 à partir de l'état réel (sorts connus, inventaire, stock, zones adjacentes, quêtes) — jamais généré ou choisi par un LLM (cohérent D-DET-1 frontière déterministe, D-RAG-8 anti-hallucination : un LLM qui invente une option ferait exécuter une action invalide). `SYS_MENU_RENDER` est une primitive de **lecture/formatage**, explicitement hors du contrat `SYS_*` en 6 étapes de D-DET-2 (réservé aux mutations d'état) — distinction documentée pour éviter qu'un futur développeur n'alourdisse inutilement une primitive de présentation avec un contrat de transaction.

### Modifications

| # | Action | Fichier |
|---|---|---|
| 54.1 | ➕ Créé — protocole maître du mécanisme (concept, algorithme de résolution, TTL par contexte, gabarits combat/dialogue/boutique/mouvement/quêtes, risques assumés) | `données/the_seed_engine/system_mechanics/menu_contextuel_protocol.md` |
| 54.2 | ➕ Créé — table `T_PENDING_MENUS` (état éphémère, clé primaire = avatar, remplacement jamais empilement) | `données/cardinal_system_db/MLD_Logic/table_t_pending_menus.md` |
| 54.3 | ✏️ Modifié — `!sys_menu_force` ajouté §1, `!menu` ajouté §2 | `données/the_seed_engine/whatsapp_commands_list.md` |
| 54.4 | ✏️ Modifié — `SYS_MENU_RENDER` ajouté §6 | `données/the_seed_engine/ai_orchestrator_commands.md` |
| 54.5 | ✏️ Modifié — « étage 0 » ajouté au dispatcher, avant la classification d'intention | `directives_generation/18_cdc_orchestration_runtime.md` |
| 54.6 | ✏️ Modifié — étape 0 ajoutée au pipeline d'exécution décrit | `README.md` |
| 54.7 | ✏️ Modifié — **D83** ajoutée au tableau des décisions, prochain numéro libre → D84 | `cahier_des_charges.md` |
| 54.8 | ✏️ Modifié — **D83** ajoutée, prochain numéro libre → D84 | `registre_decisions.md` |
| 54.9 | ✏️ Modifié — ligne « Dernière mise à jour » (étape 54), documents maîtres, compte de tables MLD (23→24), « Point ouvert » (refonte §21 reportée), « Prochaine étape » | `alo_context.md` |
| 54.10 | 🔧 Corrigé — bug de fusion trouvé en éditant : le texte de l'ancienne étape 52 était resté accroché à la fin du paragraphe étape 53 (créé par erreur à l'étape 53 précédente) ; scindé en deux entrées `Historique proche` distinctes | `alo_context.md` |
| 54.11 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |

### Décisions actées

- **D83** : menu contextuel numéroté — couche de présentation déterministe pré-NLU, résolution par citation ou chiffre nu (TTL par contexte), coexistence totale avec les commandes texte existantes, contenu toujours calculé par L1.

### État de sortie

Levier 1 du diagnostic UX étape 54 **livré** (spec + table + commandes + amendement pipeline). Levier 2 (refonte §21) **volontairement non traité** cette étape, documenté en Point ouvert pour reprise sur demande PE. Aucune commande existante retirée, aucun fichier `bot/` touché (D-P3-1) — l'implémentation réelle du dispatcher/de `T_PENDING_MENUS` reste au PE.

---

## ÉTAPE 53 (suite) — Versionnage du projet : `CHANGELOG.md` ✅ (2026-09-17)

**Objectif** : demande PE explicite de reprise — se servir des fichiers de contexte (`alo_progression.md`, `alo_context.md`, `registre_decisions.md`) et de l'historique de commits git réel pour produire un changelog versionné du projet.

**Constat de départ** : le dépôt porte les traces d'une réécriture d'historique (`refs/original/refs/heads/main` toujours présent, jamais nettoyé après le commit `26a7e57` « nettoie .gitignore et synchronise l'index »). Conséquence : plusieurs hachages de commit cités dans `alo_progression.md`/`alo_context.md` pour les étapes 44-48 (`1940f57`, `b0ab4dd`, `ca315f1`, `9d4143a`, `aa4386b`, `3ddf391`) ne correspondent à **aucun objet résolvable** dans l'historique git actuel (30 commits sur `main`). Le changelog a été bâti exclusivement sur les hachages réels et actuels, la correspondance avec les anciennes citations étant vérifiée narrativement (contenu), pas par hachage.

### Modifications

| # | Action | Fichier |
|---|---|---|
| 53.20 | ➕ Créé — `CHANGELOG.md` : v0.1.0 → v0.10.0 mappées sur les 30 commits réels de `main` (groupés par chantier quand une série de commits forme un seul cycle correctif, ex. l'audit bot R1→nR15 en 17 commits = v0.8.0), section « Non publié » pour le travail en cours de cette session, section « Vers 1.0.0 » listant les conditions de lancement déjà documentées dans le backlog | `CHANGELOG.md` |
| 53.21 | ✏️ Modifié — entrée ajoutée à « Documents maîtres » | `alo_context.md` |
| 53.22 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |

### État de sortie

Projet versionné de v0.1.0 (commit `3da2976`, fondations) à v0.10.0 (commit `6a56305`, D77-D79) + une section « Non publié » couvrant le travail non commité de la session en cours (backlog documentaire + D80 + registre de décisions). Convention retenue : SemVer `0.x.y` tant que le projet n'est pas lancé publiquement (cohérent avec le backlog réel : audit CGU des API gratuites toujours en réserve depuis l'étape 39). Anomalie de fiabilité des hachages historiques documentée en tête de `CHANGELOG.md` plutôt que silencieusement contournée.

### Décisions actées

- **D80** : `ZONE_ROUTE_LUGRU` formalisé — raccourci souterrain PK `SYL_HUNT_002` ↔ `NEU_CAP_001`, `link_type='UNDERGROUND'` ; trigger L4 découplé (vol requis = `link_type='FLY'`, plus la simple étiquette `Type=ROUTE`).
- **Précision de portée (non numérotée, clarification de D-SOC/D37)** : `T_GUILDS` = guildes de joueurs exclusivement (`leader_avatar_uuid NOT NULL`) ; les guildes-employeurs de lore (`employer_type='guild'` dans `T_JOBS_DICT`) vivent dans un registre séparé (`table_t_guilds.md` §5), jamais comme ligne `T_GUILDS` fabriquée.

### État de sortie

**Backlog documentaire mineur clos en totalité** (4/4 points). Aucun fichier PNJ ajouté (roster D17 = 1200, intact), aucune ligne `T_SPAWN_TABLES`/`T_GUILDS` fabriquée, `bot/` non touché (D-P3-1). Seul reliquat social explicitement **non rouvert** : auberge exploitable joueur (report PE, distinct du backlog documentaire — nécessiterait une nouvelle entité `T_PROPERTIES`/logique de location, hors périmètre d'une session de nettoyage). Chantier parallèle en cours : inventaire exhaustif D1-D79 pour consolidation du registre de décisions (skill `domain-modeling`).

---

## ÉTAPE 55 — Sujets de service (D84) — refonte §21 close ✅ (2026-09-17)

**Objectif** : sur demande PE explicite (« on attaque la refonte de la §21 maintenant »), traiter le levier 2 laissé en attente à l'étape 54 : les ~30 verbes joueur dédiés de la §21 `whatsapp_commands_list.md` (services de Capitale Alne, un par PNJ) forment une interface superficielle là où `!demander`/`!parler` (§20) résout déjà l'enveloppe QI entière d'un PNJ derrière un seul verbe.

**Design initial** : convertir chaque service en « sujet de service » — un slot K0/K1 de `T_NPC_KNOWLEDGE` qui, en plus de révéler une ligne de texte, déclenche la primitive `SYS_*` déjà existante (même contrat de mutation D-DET-2, aucune primitive réécrite). 3 mécaniques identifiées comme à point d'accès multiple ou stat de premier rang (réputation raciale, sertissage de gemme, tutoriel) devaient garder une commande dédiée ; les ~27 restantes devenir des sujets.

**⚠️ Correction en cours d'exécution (documentée, pas gommée)** : le diagnostic initial n'avait vérifié la duplication de verbe **qu'à l'intérieur du roster d'Alne**. Avant de lancer la conversion mécanique sur les fiches PNJ, un grep de vérification sur les 8 autres villes a révélé que près de la **moitié** des verbes visés étaient déjà utilisés tels quels par des PNJ équivalents ailleurs — de vrais archétypes multi-villes, pas des services à point d'accès unique :

| Verbe | Répliqué à |
|---|---|
| `!voyage` | Sari (voyagiste), Swilvane |
| `!raid_register` | Gardien de l'amphithéâtre, Lioda |
| `!mount_rent` | Maréchal des ailes, Duskarn |
| `!sharpen` | Hilde, Gattan |
| `!fence` | Receleur Lave-Sombre, Voulg |
| `!loan` | Prêteur Grip (Swilvane), prêteur Fenn (Brokkheim) |
| `!oracle` | Voulg, Swilvane, Gattan, Lioda (4+ villes) |
| `!memorial` | Voulg, Lioda, Gattan, Granzam (5+ villes) |
| `!laundry` | Lavandière Hanna, Swilvane (+ écho Gattan) |
| `!heal` | Soigneur d'arène + médecin de guerre (Voulg), Gattan |

Les convertir en sujet propre à Alne aurait désynchronisé Alne du reste du monde (Alne derrière `!demander`, les 8 autres villes gardant le verbe plat) — **régression**, pas amélioration. Deux forks avaient déjà commencé la conversion mécanique quand la découverte a été faite ; une correction a été envoyée en urgence au premier (SendMessage) et un second fork lancé pour restaurer les fichiers déjà mal convertis. **Les deux forks ont été interrompus par une limite de session avant la fin** ; à la reprise, un audit git diff complet a été fait avant de continuer (aucune hypothèse sur l'état des fichiers) — un seul fichier (`npc_aln_40_frere_osme.md`, `!heal`) avait été converti par erreur avant l'interruption, il a été restauré ; les 11 conversions restantes (Pip, Molk, Lom, Rask, Quill, Sten, Verd, Emm, Della, Ode, Prell) ont été terminées manuellement.

**Design final (D84)** : **13 commandes dédiées conservées** (3 mécaniques universelles + 10 archétypes multi-villes découverts en cours de route) ; **~21 sujets de service** (point d'accès unique, réellement propre à Alne) ; **2 verbes retirés** (`!buy_info`/`!buy_silence`, redondants avec le K2 `PAY:<N>` déjà supporté — aucune extension nécessaire).

### Modifications

| # | Action | Fichier |
|---|---|---|
| 55.1 | ➕ Créé — §2-bis « Sujets de Service » : définition, pipeline (étape 4-bis du pare-feu QI), invariant I4, 3 exclusions (info payante K2, mécaniques universelles, **archétypes multi-villes** — règle « toujours vérifier par grep multi-villes avant de convertir »), découverte via menu contextuel | `données/the_seed_engine/system_mechanics/npc_knowledge_protocol.md` |
| 55.2 | ✏️ Modifié — colonnes `is_service`/`service_sys_command`/`service_cost_yrds` + CHECK (K0/K1 seulement) ; trigger K5 | `données/cardinal_system_db/MLD_Logic/table_t_npc_knowledge.md` |
| 55.3 | ✏️ Réécrit — §21 scindée en 21.1 (13 commandes dédiées, avec justification par archétype) et 21.2 (registre de ~21 sujets de service) | `données/the_seed_engine/whatsapp_commands_list.md` |
| 55.4 | ✏️ Modifié — note §14 alignée sur le compte réel (13 exceptions, pas 3) | `données/the_seed_engine/ai_orchestrator_commands.md` |
| 55.5 | ✏️ Modifié — gabarit dialogue (§3.2) : sujets de service mêlés aux sujets d'information dans le menu numéroté | `données/the_seed_engine/system_mechanics/menu_contextuel_protocol.md` |
| 55.6 | ✏️ Modifié — **D84** ajoutée (description corrigée en cours de route), prochain numéro libre → D85 | `cahier_des_charges.md`, `registre_decisions.md` |
| 55.7 | ✏️ Modifié — 26 fiches PNJ d'Alne : 22 converties en sujet de service (§4/§5 réécrites, GM/IA inchangés), 2 annotées « verbe dédié conservé » avec la ville source de la duplication (Sud/laundry, Halvard/voyage) après correction, 1 conversion erronée restaurée (Osmé/heal) | `données/personnages_bestiaire/pnj/alne/npc_aln_{04,10,11,12,13,14,20,21,22,23,24,26,40,41,46,56,57,59,62,63,67,76,80,83,87,89}_*.md` |
| 55.8 | ✏️ Modifié — ligne « Dernière mise à jour », « Point ouvert » (refonte close, `!tutorial` cross-cités relevé), « Prochaine étape » | `alo_context.md` |
| 55.9 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |

### Décisions actées

- **D84** : sujets de service — mécanisme + répartition finale 13 commandes dédiées / ~21 sujets / 2 retirés (détail ci-dessus).

### État de sortie

**Refonte UX des commandes close en 2 leviers** (D83 étape 54, D84 étape 55). Aucune primitive `SYS_*` supprimée ou réécrite — seule la façade joueur change. Aucun fichier `bot/` touché (D-P3-1). Un point ouvert relevé en cours de route et volontairement non traité : `!tutorial` (Pell, Alne) devrait exister dans chaque capitale raciale, pas seulement Alne — hors périmètre de cette refonte, laissé au PE.

**Leçon méthodologique retenue** : avant de replier un verbe en sujet de service pour cause d'« usage unique », vérifier par un grep sur l'ensemble du corpus PNJ (pas seulement la ville en cours) — un diagnostic scopé à un seul roster peut manquer des archétypes déjà répliqués ailleurs et proposer une régression déguisée en amélioration.

---

## ÉTAPE 56 — Correctif `scripts/seed-generator.js` : parseur QI (demande PE explicite) ✅ (2026-09-17)

**Objectif** : sur demande PE explicite (« on répare le parseur QI en priorité », suite à l'audit d'avancement du moteur déterministe qui a trouvé `T_NPC_KNOWLEDGE = 0 ligne` en base). Intervention hors périmètre habituel ACP (`scripts/` n'est pas `bot/`, mais reste du code — zéro-code ACP levé ici par demande PE explicite, cf. persona §5.1).

**Diagnostic (deux bugs empilés dans `parseNPCs()`, tous deux causant l'échec à 100%)** :
1. **Décalage de colonne** : le gabarit réel des fiches (D33, `| # | QI_ID | Niv | Sujet | Contenu | Condition |`) a une colonne `#` de numéro de ligne que le parseur ne comptait pas — il lisait `parts[1]` (le numéro, ex. `"1"`) en croyant lire le `QI_ID`, sur 100 % des ~3 300 fiches PNJ (le format est uniforme sur tout le corpus, vérifié Gattan/Swilvane/Alne).
2. **Backticks jamais retirés** : même corrigé, `QI_ID` reste entouré de backticks (`` `QI_ALN_87_01` ``) dans la cellule brute — le test `/^QI_\w+/` échoue tant qu'ils ne sont pas retirés.
3. (trouvé en corrigeant, cohérent avec le design documenté) **K3/KX exclus à tort** : le code sautait les slots K3 et KX avec un avertissement « niveau K interdit ». Or `table_t_npc_knowledge.md` (trigger K3) documente que le pare-feu D18 filtre **à l'injection** (vue K0+K1+(K2∩unlocks)), pas à l'ingestion — K3/KX doivent être stockés (la ligne de déflection/ignorance en dépend). Corrigé : tous les niveaux valides (K0-K3, KX) sont désormais insérés ; seul un niveau réellement invalide (typo) est sauté et averti.

**Fix** : réindexé sur `parts[2]` (QI_ID), `parts[3]` (niveau), `parts[4]` (sujet/topic_tags), `parts[5]` (contenu), `parts[6]` (condition/déflection) ; backticks retirés avant test et stockage ; validation du niveau contre l'énumération réelle du schéma (`K0,K1,K2,K3,KX`) au lieu d'une liste d'exclusion codée en dur ; nettoyage mineur de la regex d'extraction de la ligne de déflection (laissait un `": "` et un `" |"` parasites en tête/queue).

**Vérification (dry-run, sans DB — indisponible dans cet environnement)** : `node scripts/seed-generator.js` régénère correctement — **10 941 lignes QI sur 1 104 PNJ** (contre 0 avant), **0 avertissement `[SKIP]`** sur tout le corpus. Distribution par niveau cohérente avec les budgets D17 (K0 3238 / K1 3233 / K2 2239 / K3 1157 / KX 1074). Échantillon contrôlé (Sud `NPC_ALN_87`) : QI_ID propre, ligne K3 avec `unlock_condition=NULL` + `deflection_line` correctement extraite, ligne KX avec la ligne d'ignorance en `content`.

### Modifications

| # | Action | Fichier |
|---|---|---|
| 56.1 | 🔧 Corrigé — décalage de colonne, backticks, filtre K3/KX erroné, nettoyage regex déflection | `scripts/seed-generator.js` |
| 56.2 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |

### État de sortie

**Parseur QI corrigé et vérifié en dry-run** (fichier généré non commité, script uniquement). **Non fait, volontairement, hors périmètre de cette demande précise** : (a) régénérer `seed_data.sql` — le fichier committé date du 11 juillet et est désormais très en retard sur tout le contenu ajouté depuis (étapes 38-55 : social, guildes, dépeçage, variants, sujets de service…), le régénérer maintenant mélangerait le correctif QI avec un rattrapage massif de contenu, décision distincte à prendre par le PE ; (b) recharger en base (`rebuild.sh`) — commande destructive (`DROP DATABASE`), jamais lancée sans confirmation explicite, et de toute façon un Postgres local accessible n'existe pas dans cet environnement. Le correctif de code est prêt et vérifié ; la bascule en base reste une action du PE.

---

## ÉTAPE 56 (suite) — Régénération de `seed_data.sql` (demande PE explicite) ✅ (2026-09-18)

**Objectif** : le PE a tranché le point laissé en suspens ci-dessus — régénérer `seed_data.sql` maintenant, malgré le rattrapage de contenu que cela implique.

**Exécution** : `node scripts/seed-generator.js > seed_data.sql`. **0 avertissement, 0 erreur** sur l'ensemble des sous-parseurs (items, monstres, spawns, PNJ, QI, boutiques, compétences, quêtes), pas seulement la partie QI.

**Comparaison des compteurs (ancien fichier du 11 juillet → nouveau)** :

| Section | Avant | Après | Explication |
|---|---|---|---|
| Items | 940 | 926 | **-14, attendu** : les 14 fiches d'accessoires archivées `ressources_brutes/deprecated_v1/` à l'étape 53 (D39) ne sont plus dans `données/` |
| Monstres | 256 | 256 | inchangé |
| Spawns | 256 | 256 | inchangé |
| PNJ | 1104 | 1104 | inchangé |
| **QI** | *(0, bloc absent car `if (length > 0)`)* | **10 941** | le correctif de l'étape 56 |
| Boutiques | 302 | 302 | inchangé |
| Articles boutique | 1956 | 1956 | inchangé |
| Compétences | 300 | 300 | inchangé |
| Quêtes | 74 | 74 | inchangé *(≠ 79 mentionné dans certains docs narratifs — écart non-instruit, hors périmètre de cette régénération, à vérifier séparément si besoin)* |

Aucune régression sur les sections déjà fonctionnelles ; la seule variation hors QI (-14 items) est directement attribuable à un archivage déjà acté et documenté (étape 53).

### Modifications

| # | Action | Fichier |
|---|---|---|
| 56.3 | 🔄 Régénéré — `node scripts/seed-generator.js > seed_data.sql` (641 Ko/5 618 lignes → 2,7 Mo/16 769 lignes) | `seed_data.sql` |
| 56.4 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |

### État de sortie

**`seed_data.sql` à jour avec le contenu réel de `données/` (étapes 38-56 comprises) et le correctif QI appliqué.** Reste hors périmètre, toujours à la décision du PE : recharger effectivement en base (`rebuild.sh`, destructif — `DROP DATABASE`) pour que `T_NPC_KNOWLEDGE` soit peuplée dans l'instance réelle. Écart mineur relevé, non instruit : le compteur de quêtes du générateur (74) diverge du chiffre narratif documenté ailleurs (79, étape 43) — mérite une vérification séparée si le PE le juge utile.

---

## ÉTAPE 57 — Cartes visuelles (canvas Artifact) + pipeline de rendu réel dans `bot/` 🔶 en cours (2026-09-18)

**Objectif** : suite au constat qu'aucune vue visuelle n'existait pour le layer de commandes WhatsApp (tout était du texte brut), production d'un canvas de gabarits visuels (Design Artifact, hors `bot/`, zéro-code) puis, sur demande PE explicite (« câble le pipeline »), câblage réel d'une partie de ces gabarits dans `bot/` pour qu'ils reflètent des données dynamiques propres à qui tape la commande — jamais de valeur figée.

**Volet 1 — Canvas Artifact (structurel, zéro-code)** : `https://claude.ai/artifact/GVEkZzxn3gRuGw94HvMXcK` (« Cartes ALO — Templates »), **64 gabarits `.dc.html`** au format HUD holographique façon SAO (police Rajdhani, panneau à coins découpés, barres PV/PM à capuchon lumineux, accent par contexte), 1080×1440 (mobile). Couvre : cartes d'objet (Personnage, Monstre, Lieu, Compétence, Item, Quête, Guilde), les 23 sections de `whatsapp_commands_list.md` (menus D83 + sous-menus, Encyclopédie/Guide d'Argo, Inscription, Notifications/Alertes, Confirmation générique, et un gabarit par domaine annexe : Hôtel des Ventes, Vol, Illusion, Musique, Logement, Pêche, Carte, Compétences, Alliance).

**Volet 2 — Pipeline réel (code, `bot/`, demande PE explicite — exception au zéro-code ACP)** :
- `bot/src/services/cardRenderer.js` (nouveau) : rend un gabarit HTML (`bot/src/cards/templates/*.html`, syntaxe `{{variable}}`) en PNG via **le Chromium déjà lancé par `whatsapp-web.js`** (`client.pupBrowser`) — **aucune dépendance ajoutée** à `package.json`. Toute variable non fournie disparaît (jamais de valeur figée qui traînerait) ; tout échec de rendu retombe silencieusement sur le texte seul (jamais d'exception qui casserait la réponse). Exporte aussi `menuRow()`/`escapeHtml()` pour les cartes à liste de longueur variable.
- 7 gabarits de production câblés (dans `bot/src/cards/templates/`) : `dialogue_talk`, `dialogue_relation`, `personnage`, `inventaire`, `quetes`, `combat_rencontre`, `mouvement`.
- Handlers modifiés pour renvoyer `{ text, card }` (au lieu d'une chaîne brute) quand une carte existe, données 100 % réelles et propres au joueur qui a tapé la commande :
  - `handlers/dialogue.js` (`handleTalk`) — ajoute la lecture d'`affinity_tier` dans `T_NPC_RELATIONS` (avatar × PNJ) pour le badge de relation.
  - `handlers/player.js` (`handleStatus`, `handleInventory`, `handleQuests`) — PV/PM/niveau/Yrds réels (`t_avatars`), inventaire et quêtes réels, listes tronquées à 8 lignes + compteur de dépassement.
  - `handlers/movement.js` (`handleMove`) — coût MP et durée réels du trajet.
  - `handlers/combat.js` (`handleAttack`) — PV de base réels du monstre rencontré (`t_monsters_dict`), scope volontairement limité à l'ouverture du combat (pas un visuel par coup porté — spam d'images sinon).
  - `!relation` (`dialogue_relation`) : gabarit prêt mais **pas encore branché** — aucun intent/route n'existe pour cette commande dans `router.js`/`intent.js`.
- `orchestrator/message-handler.js` : normalise le retour des handlers (chaîne brute OU `{text, card}`) sans casser les handlers non touchés.
- `services/whatsapp.js` : si une carte est présente, rend le PNG et l'envoie via `MessageMedia` (légende = texte) ; repli texte-seul si le rendu échoue.
- `tests/integration.mjs` : 3 assertions (`Handler STATUS/INVENTORY/QUESTS`) mises à jour pour le nouveau contrat de retour (`result.text` au lieu de `result`). `node --check` OK sur tous les fichiers touchés ; suite non exécutable ici (pas de Postgres dans cet environnement).

**Découverte en cours de route (Boutique, non résolue)** : `T_SHOPS`/`T_SHOP_ITEMS` existent dans le MLD (`table_t_shops.md`) avec triggers d'anti-arbitrage et d'exclusivité par ville (S4/S5/S6) — mais `engine/economy.js` (`buyItem`/`sellItem`) ne les interroge jamais : l'achat/vente actuel se fait sur le catalogue global plat `t_items_dict`, depuis n'importe où. `getShopInventory(db, zoneId)` a été ajoutée (lecture seule, jointure `T_SHOPS`×`T_SHOP_ITEMS`×`T_ITEMS_DICT` par zone) pour permettre un futur `!shop_list` fidèle aux prix/stock réels d'une boutique — **mais elle n'est encore appelée par aucun handler/intent/gabarit**. Refonte de `buyItem`/`sellItem` pour les rendre shop-conscients délibérément non tentée dans cette session (code transactionnel déjà testé, décision d'équilibrage économique, pas une simple question de câblage).

**Décision PE** : pour les ~55 gabarits restants (Boutique, Banque, Courrier, Équipement, Artisanat, Groupe/Guilde, Encyclopédie/Wiki/Lore, Vol, Illusion, Musique, Mariage/Housing, Pêche/Récolte, Navigation/Cristaux, Compétences avancées, Alliances, Familier, Succès/Classement, Inscription, Notifications/Confirmation), aucune fonctionnalité de jeu réelle n'existe encore en base — le PE a tranché : **construire les fonctionnalités manquantes une par une, puis câbler leur carte dessus** (pas de repli sur des maquettes statiques, pas de données inventées).

### Modifications

| # | Action | Fichier |
|---|---|---|
| 57.1 | 🆕 Créé — service de rendu de cartes | `bot/src/services/cardRenderer.js` |
| 57.2 | 🆕 Créé — 7 gabarits de carte de production | `bot/src/cards/templates/*.html` |
| 57.3 | 🔧 Modifié — carte + relation PNJ | `bot/src/handlers/dialogue.js` |
| 57.4 | 🔧 Modifié — cartes statut/inventaire/quêtes | `bot/src/handlers/player.js` |
| 57.5 | 🔧 Modifié — carte de déplacement | `bot/src/handlers/movement.js` |
| 57.6 | 🔧 Modifié — carte de rencontre de combat | `bot/src/handlers/combat.js` |
| 57.7 | 🔧 Modifié — normalisation `{text, card}` | `bot/src/orchestrator/message-handler.js` |
| 57.8 | 🔧 Modifié — envoi `MessageMedia` si carte | `bot/src/services/whatsapp.js` |
| 57.9 | 🔧 Modifié — 3 assertions mises à jour | `bot/tests/integration.mjs` |
| 57.10 | 🆕 Ajouté — `getShopInventory()` (lecture seule) | `bot/src/engine/economy.js` |
| 57.11 | 🆕 Ajouté — intent `SHOP_LIST` (regex + mots-clés ML) | `bot/src/agents/router.js`, `bot/src/models/intent.js` |
| 57.12 | 🆕 Ajouté — `handleShopList` + carte `boutique` | `bot/src/handlers/economy.js` |
| 57.13 | 🆕 Créé — gabarit de carte boutique | `bot/src/cards/templates/boutique.html` |
| 57.14 | 🔧 Modifié — branchement `case 'SHOP_LIST'` | `bot/src/orchestrator/message-handler.js` |
| 57.15 | 🔧 Modifié — textes `shop_list`/`shop_list_empty` | `bot/src/services/template.js` |
| 57.16 | 🔧 Modifié — tests `Handler SHOP_LIST` + `ProcessMessage — boutique` | `bot/tests/integration.mjs` |
| 57.17 | 🐛 **Corrigé — bug pré-existant critique** : `extractEntities()` (async) appelé sans `await` — `routing.entities` était un `Promise` nu depuis toujours, `zoneId`/`itemId`/`quantity`/`skillId`/`monsterId` (issus de `models/ner.js`) n'atteignaient donc **jamais** les handlers réels (seuls `keyword`/`target`, réassignés à la main dans `router.js`, survivaient). Un simple `await` ajouté | `bot/src/agents/router.js` |
| 57.18 | 🆕 Créé — moteur banque (`T_BANK_VAULTS`, dépôt/retrait Yrds transactionnels, création paresseuse du coffre au premier accès — même philosophie sparse que `T_NPC_RELATIONS`) | `bot/src/engine/bank.js` |
| 57.19 | 🆕 Créé — handler `handleVault` (consultation / dépôt / retrait, verbe extrait de `routing.raw`, montant de `entities.quantity`) + carte `banque` | `bot/src/handlers/bank.js` |
| 57.20 | 🆕 Créé — gabarit de carte banque | `bot/src/cards/templates/banque.html` |
| 57.21 | 🔧 Modifié — textes `bank_status`/`bank_deposit`/`bank_withdraw`/`bank_fail_*` | `bot/src/services/template.js` |
| 57.22 | 🔧 Modifié — `case 'VAULT'` branché sur `bank.handleVault` (remplace le stub « pas encore ouverte ») | `bot/src/orchestrator/message-handler.js` |
| 57.23 | 🔧 Modifié — tests `Handler VAULT` + régression explicite du bug 57.17 (`entities.quantity` doit être résolu) | `bot/tests/integration.mjs` |
| 57.24 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |

### État de sortie

**Rien commité** (attente du « commit tout ça » habituel). Repo syntaxiquement propre (`node --check` OK sur tous les fichiers `bot/` touchés). Canvas Artifact à 64 gabarits, **9 réellement câblés et vérifiés dynamiques** (dialogue×2, personnage, inventaire, quêtes, mouvement, combat, boutique, **banque**) — aucune valeur figée sur aucun d'eux.

**Correction transversale importante (57.17)** : le bug `extractEntities` sans `await` ne touchait pas que la Banque — il dégradait silencieusement **tout le pipeline de commandes en langage naturel** depuis (au minimum) l'introduction de `models/ner.js` : `!je vais [zone]` ne recevait jamais de `zoneId` résolu par NER (`entities.zoneId` toujours `undefined`, seul le fallback `entities.target`, réservé à ATTACK, fonctionnait), `!utilise [sort]` ne recevait jamais de `skillId`, et la résolution d'objet par ID (hors mot-clé générique) pour `!achète`/`!vends` était perdue. Aucun test existant ne le couvrait (les tests appellent soit les handlers directement avec des `entities` construits à la main, soit des chemins « sans cible » qui ne dépendent pas de l'extraction). Un test de régression a été ajouté spécifiquement pour ce bug.

**Banque close pour son périmètre choisi (Yrds uniquement)** : consultation, dépôt, retrait — transactionnel, verrouillage de ligne, coffre créé à la première utilisation. **Non fait, volontairement** : le stockage d'objets (`items_stored` JSONB dans `T_BANK_VAULTS`) n'est pas branché — seule la partie monétaire du coffre personnel est fonctionnelle. Coffre de guilde/mariage (`owner_type='guild'|'marriage'`) non abordé — dépend de Guilde et Mariage, pas encore construits.

**Boutique close pour son périmètre choisi** : `!shop_list`/« boutique » liste désormais les articles réellement en vente dans la zone du joueur (`T_SHOPS`×`T_SHOP_ITEMS`×`T_ITEMS_DICT`, prix et stock réels, par PNJ marchand). **Question laissée ouverte, volontairement** : `buyItem`/`sellItem` restent sur le catalogue global plat (`t_items_dict`) et n'utilisent toujours pas `T_SHOPS`/`T_SHOP_ITEMS` — un joueur peut donc voir un prix de boutique via la carte puis acheter à un prix différent via `!buy`. Corriger cela est un choix d'équilibrage économique (transactions déjà testées, triggers d'anti-arbitrage S4-S6 documentés dans `table_t_shops.md`), pas une question de câblage — à trancher explicitement avant de toucher `engine/economy.js` côté transaction.

**Courrier (`T_MAIL`) construit — boîte de réception, lecture+retrait, envoi** :
- `bot/src/engine/mail.js` (nouveau) : `getInbox` (liste non expirée, non-lus en tête), `claimMail` (transactionnel — marque `claimed`, crédite `attached_yrds`/`attached_item` réels), `sendMail` (résolution du destinataire par `whatsapp_phone` réel, pas par nom approximatif).
- `bot/src/handlers/mail.js` (nouveau) : `mail` seul → liste (carte `courrier`, données réelles) ; `mail lire [N]` → ouvre + réclame le n-ième courrier de la boîte ; `mail envoyer [numéro] [message]` → envoi réel à un joueur existant (recherché par numéro WhatsApp, pas par nom — pas d'ambiguïté possible). Parsing par regex directe sur `routing.raw` (comme la Banque) plutôt que via le sac `entities` générique, pour éviter tout risque de perte de précision sur un numéro de téléphone long.
- `bot/src/cards/templates/courrier.html` (nouveau) — liste de messages, même famille visuelle que `inventaire`/`quetes`.
- `case 'MAIL'` branché sur `mailHandler.handleMail` (remplace le stub « pas encore disponible »).
- **Non fait, volontairement** : composer un courrier avec pièce jointe (Yrds/objet) depuis le chat n'est pas exposé — `sendMail` n'accepte que sujet+corps ; l'attache reste un levier réservé au contenu scripté/GM (`!sys_grant_item` etc.) pour l'instant.

### Modifications (suite)

| # | Action | Fichier |
|---|---|---|
| 57.25 | 🆕 Créé — moteur courrier | `bot/src/engine/mail.js` |
| 57.26 | 🆕 Créé — handler courrier + carte | `bot/src/handlers/mail.js` |
| 57.27 | 🆕 Créé — gabarit de carte courrier | `bot/src/cards/templates/courrier.html` |
| 57.28 | 🔧 Modifié — `case 'MAIL'` branché (remplace le stub) | `bot/src/orchestrator/message-handler.js` |
| 57.29 | 🔧 Modifié — tests `Handler MAIL` + `ProcessMessage — mail` | `bot/tests/integration.mjs` |
| 57.30 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |

### État de sortie (mise à jour)

**10 cartes réellement câblées et dynamiques** sur les 64 du canvas (dialogue×2, personnage, inventaire, quêtes, mouvement, combat, boutique, banque, **courrier**). `node --check` OK sur l'ensemble des fichiers `bot/` modifiés ou créés cette session (balayage complet effectué, pas seulement les fichiers de cet incrément). Rien commité.

**Reste à construire après ce point** : Équipement, Groupe/Guilde, Vol, Illusion, Musique, Mariage/Housing, Pêche/Récolte, Navigation/Cristaux, Alliances, Inscription, Notifications/Confirmation — suite en ÉTAPE 58 (`/implement`).

---

## ÉTAPE 58 — `/implement le reste` : 9 systèmes construits, gabarits réels partout ✅ (2026-09-18)

**Objectif** : suite directe de l'étape 57, via la commande `/implement` (post-planification, TDD aux coutures pré-convenues, vérification puis commit). Reprise étape par étape de la liste laissée ouverte, chaque système suivant le même protocole que Boutique/Banque/Courrier : lire le vrai schéma MLD avant d'écrire une ligne, construire moteur + handler + gabarit de carte + câblage routeur, jamais de donnée inventée.

### Systèmes construits (schéma réel vérifié pour chacun)

1. **Encyclopédie / Wiki / Lore** (`T_ENCYCLOPEDIA_DICT` + `T_UNLOCKED_LORE`) — `!encyclopedia` (liste plate des pages débloquées, fidèle au libellé exact de la commande dans `whatsapp_commands_list.md` — pas de hub par catégorie comme l'esquissait la maquette Artifact), `!wiki [terme]`, `!lore [terme]` — recherche tous-catégories confondues, **jamais de fuite de contenu non débloqué** (brouillard de guerre respecté : titre seul si verrouillé, jamais le contenu).
2. **Succès & Classement** (`T_ACHIEVEMENTS_DICT`/`T_UNLOCKED_ACHIEVEMENTS`, `T_AVATARS`) — `!achievements` (liste réelle), `!rankings` (Top 10 réel par Yrds ou Niveau ; classement par boss tués non fait — aucun compteur agrégé de kills de boss n'existe actuellement).
3. **Compétences avancées** (`T_AVATAR_SKILLS`/`T_SKILLS_DICT`) — `!skills`/`compétences` liste les sorts/OSS/passives réellement appris avec rang de maîtrise réel.
4. **Familier** (`T_PETS`) — statut (PV/faim/loyauté réels) + `nourrir`.
5. **Artisanat** (`T_RECIPES`) — domaines + liste de recettes + fabrication transactionnelle réelle (ingrédients JSONB consommés, Yrds débités, résultat crédité selon `success_rate`). **Constat important** : `T_RECIPES` est **vide** dans `seed_data.sql` actuel et `scripts/seed-generator.js` n'a aucun parseur pour ce contenu — le code est correct et réel, mais il n'y a **aucune recette à fabriquer** tant que du contenu n'est pas écrit puis généré.
6. **Groupe & Guilde** (`T_PARTIES`/`T_PARTY_MEMBERS`, `T_GUILDS`/`T_GUILD_MEMBERS`) — créer/inviter (par numéro WhatsApp réel)/quitter un groupe ; créer/quitter/dissoudre une guilde ; vues de statut réelles (trésorerie, membres, rangs).
7. **Équipement** (`T_AVATARS.equip_*` + `T_INVENTORY.slot_equipped`) — `!equiper [Item_ID] [emplacement]` / `!unequip [emplacement]` avec validation réelle du préfixe d'objet par slot (invariant A1 du MLD), mirroir des 5 slots d'armure sur `T_AVATARS` (directive D44 — PAS PLUS que 5), mains/ceinture/dos gérés uniquement via `T_INVENTORY`.
8. **Inscription** (`!link_start [Race] [Nom]`) — **branchement d'un chemin qui existait déjà à moitié** : `services/player.js` avait une fonction `createPlayer` complète et jamais appelée nulle part (ni intent, ni handler, ni route) — un joueur non enregistré tournait silencieusement sur un UUID factice fixe (`00000000-0000-0000-0000-000000000001`) sans jamais être invité à s'inscrire. Résolu Race → capitale (`T_RACES.capital_zone_id` réel), création réelle de l'avatar.
9. **Alliances / Diplomatie** (`T_DIPLOMACY`) — **correction de périmètre** : la maquette Artifact "Alliance" (fondée sur `!alliance_create [Guilde]`) suggérait des alliances **de guildes** ; le vrai schéma `T_DIPLOMACY` ne modélise que des relations **de race à race** (neutre/alliée/en guerre/trêve/vassalisée), pilotées par un Lord via `!race_council`. Implémenté en lecture seule (`diplomatie`/`alliances`) : relations réelles de la race du joueur. Les commandes de mutation (`!race_council`, `!lord_campaign`, `!alliance_war` de guildes) ne sont pas câblées — elles supposent un rôle « Lord » dont aucune vérification n'existe dans le code actuel (contrairement à `isGm()` qui existe pour les commandes SYS).

### Bug transversal corrigé au passage

Le pattern `INVENTORY` du routeur incluait par erreur le mot-clé `equipement` dans son énumération — il aurait intercepté toute tentative d'ouvrir la nouvelle vue Équipement avant qu'elle n'atteigne le nouvel intent `EQUIP`. Retiré (`equipement` appartient désormais sans ambiguïté à `EQUIP`).

### Explicitement NON fait, avec la raison précise (schéma vérifié, pas de fabrication)

| Système | Constat |
|---|---|
| **Vol** | `T_AVATARS` n'a que `is_flying` (bool) et `flight_altitude` (int) — aucune jauge de 10 min, aucun mode assisté/libre en base. Un `!vol` minimal (bascule `is_flying`) serait honnête mais n'apporterait rien vs. l'attente du PE (jauge, mode) ; non construit plutôt que construire une fausse jauge. |
| **Illusion / Musique** | Aucune table dédiée — ce sont des sorts `MAG_*` normaux censés passer par le système de compétences existant. Or `USE_SKILL` **ne fonctionne qu'en combat actif** (`handlers/combat.js`) : lancer une mélodie de buff ou une illusion hors combat demanderait d'étendre le moteur de compétences au hors-combat (ciblage de groupe, application d'effet sans session de combat) — chantier à part entière, pas une carte à câbler. |
| **Mariage** | `T_MARRIAGES` est réel mais très contraignant (genre homme/femme non négociable, logement obligatoire au préalable, coffre commun, cadeau de cérémonie selon niveau moyen, séparation avec répartition par provenance via `T_MARRIAGE_ASSETS`) — trop de règles imbriquées pour un incrément honnête sans risquer une implémentation bâclée d'un système à fort enjeu narratif (D-SOC-8/9). |
| **Housing** | `T_PROPERTIES` est réel et plus autonome que le Mariage (louer/acheter, checkpoint sûr, stockage, création d'un vrai groupe WhatsApp privé via `T_WA_GROUPS`) — le plus proche d'être fait, mais non commencé faute de budget dans cette session ; bon candidat pour la prochaine. |
| **Pêche / Récolte** | Aucune table dédiée trouvée ; repose vraisemblablement sur `T_ITEMS_DICT`/nodes de zone (`FLO_*` mentionnés dans la doc commandes) sans MLD dédié identifié — nécessite une recherche schéma plus approfondie avant de coder. |
| **Navigation / Cristaux** | `T_ZONE_LINKS` (déjà utilisée par le mouvement) couvre la carte ; les cristaux sont des items (`CSM_CRI_*`) à effet spécial — pas de nouvelle table, mais la logique d'effet par cristal (téléportation, corridor de groupe, rappel) n'a pas été implémentée. |
| **Notifications / Alertes / Confirmation** | Ce ne sont pas des commandes liées à une table — c'est un mécanisme de push système transverse (annonces, alertes de danger, confirmations d'action risquée). Nécessite une décision d'architecture (déclenché par quoi, envoyé à qui) plutôt qu'un simple handler ; non abordé. |

### Modifications

23 nouveaux fichiers (`bot/src/engine/{achievements,bank,craft,diplomacy,encyclopedia,equipment,guild,mail,party,pets,skills}.js`, `bot/src/handlers/{achievements,bank,craft,diplomacy,encyclopedia,equipment,guild,mail,party,pets,registration,skills}.js`, `bot/src/services/cardRenderer.js`, 12 nouveaux gabarits `bot/src/cards/templates/*.html`), plus modifications de `router.js`, `intent.js`, `message-handler.js`, `template.js`, `economy.js` (retrait du stub `handleCraft` mort), `tests/integration.mjs` (≈25 nouvelles assertions).

### État de sortie

**22 gabarits de carte de production réels** (0 valeur figée — vérifié fichier par fichier). `node --check` OK sur l'intégralité des fichiers `bot/` du dépôt (balayage complet, pas seulement les fichiers touchés). Build/typecheck : projet en JavaScript pur (pas de `tsc`), aucune étape de compilation à vérifier. Suite d'intégration non exécutable dans cet environnement (pas de Postgres accessible) — vérifiée par lecture et cohérence de schéma uniquement, comme pour toute l'étape 57.

**Prochaine session logique** : Housing (le plus proche d'être fait), puis Mariage (dépend de Housing), puis Pêche/Récolte (nécessite d'abord de localiser le bon MLD), puis la décision d'architecture Notifications/Confirmation.

### `/code-review` (deux sous-agents parallèles, axes Standards + Spec) — corrections appliquées

**Découverte critique du sous-agent Spec** : un fichier `schema.sql` **racine, faisant autorité**, existe et n'avait pas été consulté — tout le travail de cette session (et de la précédente) s'appuyait sur les fiches `données/cardinal_system_db/MLD_Logic/*.md`, qui se sont révélées **ponctuellement en retard sur le schéma réel** (colonne renommée `avatar_id` → `avatar_uuid` sans que la fiche correspondante soit mise à jour). Corrigé et vérifié table par table contre `schema.sql` pour l'ensemble des tables touchées cette étape — un seul autre écart trouvé après vérification complète (voir ci-dessous), tout le reste concorde.

**Corrections appliquées (bugs réels, auraient cassé à l'exécution)** :
- `engine/achievements.js` — `t_unlocked_achievements.avatar_id` → `avatar_uuid` (le nom réel).
- `engine/party.js` — `t_party_members.avatar_id` → `avatar_uuid` partout (5 requêtes) ; `engine/guild.js` utilisait déjà le bon nom pour `t_guild_members`, incohérence entre les deux fichiers du même lot.
- `engine/equipment.js` — le commentaire affirmant que seuls les 5 slots d'armure sont mirroirés sur `T_AVATARS` était faux : `schema.sql` a aussi `hand_main, hand_off, gear_belt, belt_left, belt_right, gear_back, back_type` en colonnes réelles. Étendu le mirroir à ces slots (dont la synchronisation de `back_type` selon le préfixe `BAG_`/`HRN_`) ; ajouté les invariants documentés manquants **A2** (`hand_off` exige la passive `PAS_CBT_*`) et **A3** (`belt_left`/`belt_right` exigent `gear_belt` déjà équipée).

**Corrections de fiabilité (Standards, écarts confirmés par rapport au patron `BEGIN…FOR UPDATE…COMMIT/ROLLBACK` déjà suivi par `economy.js`/`bank.js`/`craft.js`/`mail.js`)** :
- `engine/party.js` `createParty`/`inviteToParty` : fenêtre TOCTOU (vérification hors transaction, ou verrou sur une ligne qui n'existe pas encore pour une nouvelle party) — fermée avec `pg_advisory_xact_lock(hashtext(avatarUuid))`, un idiome Postgres standard pour verrouiller par clé logique quand aucune ligne n'existe encore à verrouiller. Même correctif appliqué à `engine/guild.js` `createGuild` (aucune contrainte SQL n'impose une seule guilde par avatar — G5 est une invariant d'application, pas de schéma).
- `engine/party.js` `leaveParty`, `engine/guild.js` `leaveGuild` : suites de requêtes non transactionnelles (risque de désynchronisation `member_count`/promotion de chef en cas de départs concurrents) — regroupées en transactions avec verrouillage de ligne.
- `logger.error` manquant dans les catch de `equipment.js`/`guild.js`/`party.js` (échecs auparavant silencieux côté serveur) — ajouté, cohérent avec le reste du fichier.

**Corrections de fidélité au spec (`whatsapp_commands_list.md` §7/§8)** :
- §7 liste exactement `!craft_list`/`!forge`/`!repair`/`!enchant`/`!alchimie`/`!cook`/`!mine` — le routeur et le handler `craft.js` ne reconnaissaient que `craft`/`fabrique`/`forge`/`artisanat`/`recette`. Étendu pour reconnaître les 7 mots-clés réels ; `!repair`/`!mine` ne sont **pas** des `craft_type` de `T_RECIPES` (réparation de durabilité et extraction de minerai sont des mécaniques distinctes non construites) — répondent désormais un message honnête plutôt que d'être confondus avec une recherche de recette.
- §8 : `!pet_feed` (commande littérale du spec) ne matchait pas le pattern routeur `PET` à cause d'une frontière de mot (`\b`) qui échoue entre "pet" et "_" (soulignement = caractère de mot) — corrigé.

**Nettoyage (Standards, smells de duplication signalés)** : `pct()` et le bloc `<div class="overflow">` étaient réimplémentés à l'identique dans 3 et 4 fichiers respectivement, `MAX_CARD_ROWS = 8` redéclaré dans 6 fichiers — centralisés dans `cardRenderer.js` (`pct()`, `overflowLine()`, export de `MAX_CARD_ROWS`), tous les appelants mis à jour.

**Non corrigé, volontairement** : la construction de markup à la main dans `handlers/skills.js` (au lieu de `menuRow`) — le sous-agent Standards l'a lui-même qualifiée de justifiée par la mise en page à points de rang (`.rank-dot`), qu'aucun helper existant ne couvre ; forcer l'abstraction aurait été une généralisation spéculative pour un seul appelant.

Balayage `node --check` complet ré-exécuté après corrections — aucune régression.

---

## ÉTAPE 59 — `/implement le 2 et le 3 en parallèle du commit` : Housing, Vol, cycle de vie des quêtes, actions d'objets ✅ (2026-09-18)

**Objectif** : suite directe de l'étape 58, sur demande explicite du PE de continuer les systèmes backend (« le 2 ») et le câblage de cartes (« le 3 ») en parallèle du commit du travail déjà fait (étape 56 suite, commité séparément — `b5848c2`).

**Découverte préalable importante** : `schema.sql` (racine) porte l'en-tête *« Compilation automatique des 33 fichiers MLD (2026-07-10) »* — c'est une **compilation figée et partielle**, antérieure à l'introduction de Housing/Mariage (décisions D-SOC-4/D-SOC-8, bien postérieures à juillet). Il contient 47 tables ; il en manque au moins 2 (`T_PROPERTIES`, `T_MARRIAGES`) alors que 38 fiches `.md` existent aujourd'hui. **Pour les tables qu'il contient**, `schema.sql` reste la source de vérité (a débusqué deux vrais bugs à l'étape 58) ; **pour les tables absentes**, il n'apporte aucune garantie et les fiches `.md` individuelles restent la seule source, avec le risque de dérive documentaire que ça implique. Recommandation consignée (pas exécutée, hors périmètre de cet incrément) : recompiler `schema.sql` à partir des 38 fiches actuelles, comme l'a été `seed_data.sql` pour le contenu.

### Systèmes construits

1. **Housing** (`T_PROPERTIES`, doc seule — absente de `schema.sql`) : grille D-SOC-6 réelle (4 types, coûts/loyers documentés), `housing_list`/`housing_buy`/`housing_rent`/`housing_pay`/`housing_sell`/`housing_leave`, `home_return` (bloqué en combat via `combat.getCombatStatus()` — **pas** via la colonne `T_AVATARS.is_in_combat`, qui existe dans le schéma mais n'est jamais synchronisée par le handler de combat réel, resterait sinon toujours à `FALSE`), `!rest`/`!repos` (régénération 5 % chez soi vs 1 % ailleurs, fidèle à la doc). **Non fait** : `home_storage` (dépôt/retrait, système à part entière similaire au coffre de banque), `home_invite`/`kick` et la création réelle du groupe WhatsApp privé (`T_WA_GROUPS`) — appeler l'API WhatsApp pour créer un groupe est un effet de bord réel jugé hors périmètre d'un incrément non explicitement demandé ; `decorate`/`deco_buffs` ; le cron hebdomadaire de prélèvement de loyer (P1/P2) — nécessiterait un scheduler, aucun n'existe dans `bot/`.
2. **Vol** minimal : `T_AVATARS.is_flying`/`flight_altitude` (les deux seules colonnes réelles) — bascule décollage/atterrissage. `!vol_libre`/`!barrel_roll`/`!dive_bomb`/`!hover` répondent un message honnête « pas encore implémenté » plutôt que d'échouer silencieusement ou d'être confondus avec la bascule.
3. **Cycle de vie des quêtes** (`T_QUESTS_DICT`/`T_ACTIVE_QUESTS`, déjà utilisées à l'étape 57 pour la liste seule) : `quest_board` (quêtes réellement disponibles dans la zone du joueur, filtrées par niveau et déjà-prises/complétées), `quest_accept`/« accepter [nom] » (vérifie niveau minimum, anti-double-prise), `quest_turnin`/« rendre [nom] » (crédite XP/Yrds/objets réels, seulement si `current_step >= total_steps`). **Non fait** : l'avancement de `current_step` lui-même — aucun déclencheur générique n'existe pour progresser dans les étapes d'une quête (tuer N monstres, collecter un objet…) sans scripter chaque `objective_json` individuellement ; en l'état, seules les quêtes à **une étape** sont rendables immédiatement après acceptation. `handleQuests` a été **déplacé** de `handlers/player.js` vers un nouveau `handlers/quests.js` dédié (le doublon aurait été une divergence de comportement à terme) — `player.js` ne garde que statut/inventaire.
4. **Actions d'objets** (`T_ITEMS_DICT`/`T_INVENTORY`) : `!inspect [Objet]` (description réelle, cherche dans tout le dictionnaire d'objets, pas seulement l'inventaire du joueur — fidèle à « lit la description d'un objet ») et `!jeter [Objet]` (transactionnel, refuse un objet équipé ou une quantité insuffisante).

### Recherché mais non construit, avec la raison précise

- **Pêche / Récolte / Minage** (`gathering_cooking_system.md`, 50 lignes, tables de butin par zone entièrement documentées) — **aucune table ne le stocke**, ni dans `schema.sql` ni dans une fiche MLD dédiée. `T_LOOT_TABLES` ne peut pas être détournée (FK `monster_id NOT NULL`, aucun poisson/minerai n'est un monstre). La **Cuisine** (`!cook`) est en réalité déjà couverte : `craft_type='cooking'` existe dans `T_RECIPES` et passe déjà par `craft.js` (étape 58) — il ne manque que le contenu (recettes réelles à seed). Pêche et Minage nécessitent une **vraie décision de modélisation** (nouvelle table de nœuds de ressource par zone) avant tout code — non pris en charge ici, à traiter comme une étape `domain-modeling` séparée plutôt qu'improvisé.
- **Mariage** (`T_MARRIAGES`+`T_MARRIAGE_ASSETS`, doc seule) — schéma complet mais règles fortement imbriquées (genre homme+femme non négociable D-SOC-10, prérequis niveau 15 + anneau consommé + logement, flux propose/accept en deux temps sans table d'état transitoire donc à tracker en mémoire comme `activeCombats`, règlement de séparation par provenance d'actif avec split 50/50 du commun). Évalué en détail, **volontairement pas tenté** dans cet incrément : le risque de livrer une version bâclée d'un système que le PE a explicitly qualifié de « non négociable » l'emportait sur la valeur d'un MVP précipité. Reste le meilleur candidat pour une session dédiée, maintenant que Housing (son prérequis) existe.

### Modifications

| # | Action | Fichier |
|---|---|---|
| 59.1 | 🆕 Créé — moteur + handler + carte logement | `bot/src/engine/housing.js`, `bot/src/handlers/housing.js`, `bot/src/cards/templates/logement.html` |
| 59.2 | 🆕 Créé — handler + carte vol (pas de moteur séparé, requête triviale) | `bot/src/handlers/flight.js`, `bot/src/cards/templates/vol.html` |
| 59.3 | 🆕 Créé — moteur + handler + carte tableau de quêtes/accepter/rendre | `bot/src/engine/quests.js`, `bot/src/handlers/quests.js`, `bot/src/cards/templates/quete_tableau.html` |
| 59.4 | 🔧 Modifié — `handleQuests` déplacé hors de `player.js` (doublon supprimé) | `bot/src/handlers/player.js` |
| 59.5 | 🆕 Créé — moteur + handler + carte inspection/abandon d'objet | `bot/src/engine/items.js`, `bot/src/handlers/items.js`, `bot/src/cards/templates/objet_inspect.html` |
| 59.6 | 🔧 Modifié — intents `HOUSING`/`FLIGHT`/`INSPECT`/`DROP_ITEM`, case `QUEST` rebranché | `bot/src/agents/router.js`, `bot/src/orchestrator/message-handler.js` |
| 59.7 | 🔧 Modifié — tests des 4 nouveaux systèmes + migration du test QUESTS | `bot/tests/integration.mjs` |
| 59.8 | ✏️ Modifié — journal (cette entrée) | `alo_progression.md` |

### `/code-review` (deux sous-agents parallèles, axes Standards + Spec) — corrections appliquées (2026-09-18, reprise post-`/clear`)

**Standards** : aucune violation dure — pas de bug `await` manquant, pas de bug de frontière `\b`/`_`, transactions/verrouillage/`logger.error` conformes au patron `bank.js`/`mail.js`, gabarits de carte propres (helpers `cardRenderer.js` bien réutilisés). Deux smells de jugement relevés et **laissés tels quels** (cohérents avec le style existant, pas une régression introduite ici) : gabarits `quetes`/`quete_tableau` proches (Divergent Change) et regex substring non ancrées dans `housing.js` (Primitive Obsession).

**Spec — bugs réels corrigés** :
- **Housing/Flight — alias verbes libres ("acheter"/"louer"/"payer"/"vendre"/"offre"/"rentrer") retirés** (`handlers/housing.js`) : absents de `whatsapp_commands_list.md` §15, **et de toute façon jamais atteignables** sans le préfixe `housing_*`/`logement` (le pattern `HOUSING` de `router.js` les exclut) — scope creep + fausse piste, pas un bug fonctionnel actif, mais retiré pour ne pas laisser croire à une voie alternative qui n'existe pas.
- **`!flight_gauge` (lecture seule, `whatsapp_commands_list.md` §12) basculait `is_flying`** — c'était une commande d'affichage tombée dans la branche bascule par défaut. Corrigé (`handlers/flight.js`) : branche dédiée en lecture, aucune écriture.
- **`!jeter` ne vérifiait jamais `is_bound`** (I4, `table_t_inventory.md`) — un objet lié à l'âme pouvait être perdu définitivement en le jetant, alors que I7 dit que ces instances « ne droppent JAMAIS ». Corrigé (`engine/items.js`) : rejet (`BOUND_ITEM`) si `is_bound = TRUE`. **Non fait, volontairement** : la double confirmation demandée littéralement par I4 suppose un état de confirmation en attente (pattern absent du lot) — un simple rejet est plus sûr qu'un jet accidentel non confirmé, mais moins permissif que le spec littéral ; à revisiter si un vrai flux de confirmation générique est construit un jour.
- **Plafond de 10 quêtes actives (Q1, `table_t_active_quests.md`) jamais vérifié** dans `acceptQuest` — corrigé (`engine/quests.js`) : rejet `QUEST_CAP_REACHED` au-delà de 10 `in_progress`, y compris à la réactivation d'une quête abandonnée/répétable.
- **`T_QUEST_HISTORY` jamais écrite au rendu** (Q2/Q4) — sans cette écriture, le verrou des quêtes légendaires (`QST_LEG_*`, qui vérifient leurs prérequis via cette table) ne pourrait **jamais** se lever. Corrigé (`engine/quests.js` `turnInQuest`) : insertion dans la même transaction.
- **`acquireProperty` rattachait le logement à la zone courante du joueur**, alors que `table_t_properties.md` §1 documente `zone_id` comme « capitale de la race du joueur » — un joueur achetant en visite chez une autre race se serait retrouvé avec un logement mal rattaché territorialement. Corrigé (`engine/housing.js`) : résolution de la capitale via `t_races.capital_zone_id` (même schéma que `handlers/registration.js`), plus un nouveau cas d'erreur `NO_CAPITAL_ZONE`.

**Non corrigé, explicitement** : `T_AVATARS.home_property_uuid` (cache dénormalisé, A7) — colonne absente de `schema.sql` (comme `T_PROPERTIES` lui-même, cf. constat d'entrée de cette étape) : rien à synchroniser côté code tant que le schéma compilé n'est pas régénéré, décision distincte du PE. `!rest` reste un gain ponctuel (pas un vrai tick 5 %/min) et ne touche pas au logout/*Remain Light* — `alo_progression.md` affirmait à tort une fidélité totale à la doc ; corrigé ici en aveu explicite plutôt qu'en construisant un scheduler hors périmètre (aucun n'existe dans `bot/`). `home_return` continue de lire `combat.getCombatStatus()` plutôt que la colonne `is_in_combat` (jamais synchronisée) — déjà un choix délibéré et documenté, non rouvert.

6 nouvelles assertions de régression ajoutées à `bot/tests/integration.mjs` (alias housing non routé, `flight_gauge` non-mutant, objet lié refusé, plafond de quêtes, écriture `T_QUEST_HISTORY`). `node --check` re-passé sur l'ensemble de `bot/` après corrections — aucune régression de syntaxe. Suite toujours non exécutable dans cet environnement (Postgres injoignable, `password authentication failed` — confirmé à nouveau ce jour, cohérent avec toutes les étapes précédentes) ; vérifiée par lecture de schéma uniquement.

### État de sortie

**26 cartes réellement câblées et dynamiques** (22 de l'étape 58 + logement, vol, tableau de quêtes, inspection d'objet). `node --check` OK sur l'ensemble du dépôt `bot/`, avant et après corrections `/code-review`. Commit séparé déjà fait pour l'étape 56 (suite) : `b5848c2`.

**Reste après ce point** : Mariage (dépend de Housing, maintenant prêt), Pêche/Récolte/Minage (nécessite une décision de modélisation d'abord), Illusion/Musique (nécessite d'étendre `USE_SKILL` hors combat), Notifications/Confirmation (décision d'architecture), `!rest` en vrai tick/min + logout (nécessite un scheduler, aucun n'existe dans `bot/`).

---

## ÉTAPE 60 — Grilling des 4 chantiers bloqués + ADR D85-D92 ✅ (2026-09-19)

**Objectif** : sur demande PE (« Faisons ça » → « Tout »), trancher les décisions de modélisation qui bloquaient les quatre systèmes laissés ouverts à l'étape 59 — Mariage, Pêche/Récolte/Minage, Illusion/Musique, Notifications/Confirmation — par une session `grilling` (une question à la fois, recommandation à chaque fois), puis les inscrire (`domain-modeling`). **Markdown uniquement, aucun code** ; l'implémentation relève de futures sessions `/implement`, une par ADR.

### Décisions (22 arbitrages PE, regroupés en 8 ADR)

| ADR | Objet |
|---|---|
| D85 | Flux de mariage : `T_MARRIAGE_PROPOSALS` persistante (TTL 48 h) ; demande à distance, acceptation en personne (même zone, hors combat) ; 1 demande sortante / plusieurs entrantes, `!decline_proposal` / `!cancel_proposal` ; foyer = condition d'entrée (`home_property_uuid` nullable) ; coffre conjugal Yrds + objets |
| D86 | Genre choisi à `!link_start`, immuable, correction GM seule |
| D87 | `T_RESOURCE_NODES` unique (`FLORA`/`ORE`/`FISH`) ; repousse par joueur + état global IA ; les trois activités en v1 ; outils `OUT_*` possédés, tier ≥ nœud ; pêche asynchrone à 3 options (D83), récolte/minage immédiats ; appâts en V2 |
| D88 | Durabilité : usure outils + équipement de combat, réparation dégressive au forgeron uniquement, grille Neuf / Quasi neuf / Bon état / État correct / Usé / Cassé (paliers PE), parchemins de réparation retirés |
| D89 | Illusion et Musique (prose héritée) remplacées par le lot I-4 (D66) |
| D90 | Effets actifs persistants hors combat, négatifs non mortels hors combat, ciblage T1-T2 / T3+ |
| D91 | Notifications sortantes : privé / groupe de territoire, file persistante bridée `T_NOTIFICATIONS` |
| D92 | Confirmation générique via le menu D83 (contexte `CONFIRM`), liste fermée |

### Faits découverts en cours de session (vérifiés dans le dépôt)

- **Aucun avatar féminin ne pouvait exister** : `createPlayer` écrit `gender = 'male'` en dur et `!link_start` n'avait pas d'argument de genre → mariage structurellement impossible (d'où D86).
- **L'anneau `MSC_ENG_001` n'est pas en base** (0 occurrence dans `seed_data.sql`) ni en vente chez aucun bijoutier → prérequis du mariage inatteignable.
- **Les 100 `FLO_*` ne sont pas ingérés** et leurs zones suivent une convention hors atlas (`ZONE_GAT_HUNT_01`), 0 correspondance ; aucun poisson brut, aucune pioche, aucune canne n'existe.
- **La durabilité n'est jamais consommée** alors que le puits « Réparations » est compté dans le bilan anti-inflation ; la ligne de durabilité existe sur 100 % des fiches d'armes et d'armures mais le générateur ne l'ingère pas (valeurs à 0). Les parchemins `CSM_PAR_008` (remise à neuf à 180 Yrds, fabricables) neutralisaient le puits.
- **Illusion et Musique n'existent pas dans le lot validé** : la musique Puca *est* l'école `SUP` (Requiem `MAG_SUP_008` en double), l'illusion n'a aucune école (Spriggan = `TEN`).
- **`T_ACTIVE_EFFECTS` existait déjà** (schéma + écriture en fin de combat dans `combat.js`), mais n'était jamais relue — correction d'une affirmation faite en session (« effets uniquement en mémoire »), qui ne change pas la décision. Anomalie annexe : pour une cible monstre, `persistActiveEffects` écrit un `MOB_*` dans une colonne `UUID`.
- **Le bot est purement réactif** (`msg.reply` uniquement) : aucune demande en mariage, courrier ou annonce ne pouvait atteindre un tiers ; 4 commandes de diffusion étaient spécifiées sans moyen d'émission.
- **Doublons évités** : `SYS_MODIFY_DURABILITY`, `SYS_BLESS_PLAYER` / `SYS_DEBUFF_PLAYER` existaient déjà — réutilisés au lieu de créer `SYS_SET_DURABILITY` / `SYS_APPLY_EFFECT`. `SYS_SPAWN_NODE` réinterprété (paramètre `Qty` incompatible avec la repousse par joueur).

### Modifications

| # | Action | Fichier |
|---|---|---|
| 60.1 | ✏️ D85-D92 inscrites, prochain numéro libre → D93 | `registre_decisions.md` |
| 60.2 | 🆕 Fiche MLD | `MLD_Logic/table_t_marriage_proposals.md` |
| 60.3 | ✏️ Foyer nullable, flux, commandes, confirmation | `MLD_Logic/table_t_marriages.md`, `table_t_properties.md` (P5) |
| 60.4 | ✏️ A8 genre immuable | `MLD_Logic/table_t_avatars.md` |
| 60.5 | ✏️ v2.1 — §1.4 flux de demande | `system_mechanics/marriage_housing_system.md` |
| 60.6 | 🆕 Fiche MLD (+ `T_AVATAR_HARVESTS`) | `MLD_Logic/table_t_resource_nodes.md` |
| 60.7 | ✏️ v2.0 — supersede la prose v1.0 (tables héritées en annexe non autoritaire) | `system_mechanics/gathering_cooking_system.md` |
| 60.8 | 🆕 Spécification | `system_mechanics/durability_repair_system.md` |
| 60.9 | ✏️ Grille d'état remplacée, parchemins retirés, barème rendu actif | `stat_scaling/economy_balance_sheet.md` |
| 60.10 | ✏️ I4 (confirmation), I8 (durabilité) ; I3 (outils) | `MLD_Logic/table_t_inventory.md`, `table_t_items_dict.md` |
| 60.11 | ✏️ Amendement D90 (colonnes, contrats E1-E6) | `MLD_Logic/table_t_status_effects.md` |
| 60.12 | 🆕 Fiche MLD + protocole | `MLD_Logic/table_t_notifications.md`, `system_mechanics/notifications_protocol.md` |
| 60.13 | ✏️ Contextes `FISHING` / `CONFIRM` (CHECK, TTL, §6-§7) | `system_mechanics/menu_contextuel_protocol.md`, `MLD_Logic/table_t_pending_menus.md` |
| 60.14 | ✏️ Bandeaux « remplacé » (D89) | `system_mechanics/illusion_magic_system.md`, `music_magic_system.md` |
| 60.15 | ✏️ Règle de complétude : ajouts / amendements / retraits Joueur-GM-IA | `whatsapp_commands_list.md`, `ai_orchestrator_commands.md` |
| 60.16 | ✏️ Journal et contexte | `alo_progression.md`, `alo_context.md` |

### Points ouverts — tranchés par le PE en fin d'étape (amendements, pas de nouveau numéro)

1. **Objets T5 liés à l'âme** (amendement D88) : **exemptés de l'amputation** — usure, casse et coût de réparation T5 conservés, `durability_cap` jamais réduit. `durability_repair_system.md` §5.
2. **Chiffre nu en contexte `CONFIRM`** (amendement D92) : **citation du menu obligatoire**, chiffre nu ignoré avec rappel. `menu_contextuel_protocol.md` §7.
3. **Clause cuisine héritée** (amendement D87) : **conservée** — `!cook` exige un feu de camp ou une cuisine de logement (possédé, loué ou conjugal). `gathering_cooking_system.md` §4.

### Tâches préalables recensées (avant les `/implement`)

- **Contenu (ACP)** : lot Pêche (`MAT_POI_*` + nœuds `FSH_*`) ; outils `OUT_PIO_*` / `OUT_CAN_*` ; nœuds `ORE_*` dérivés des sources `MAT_MIN_*` / `MAT_GEM_*` ; remappage des zones des 100 `FLO_*` sur l'atlas ; anneau `MSC_ENG_001` dans les inventaires de bijoutiers ; **retrait des parchemins `CSM_PAR_007/008`** — archivage des 2 fiches + nettoyage de 13 boutiques (`shop_vou_41`, `shop_aln_22`, `shop_fre_67`, `shop_swi_05`, `shop_und_27`, `shop_lio_04`, `shop_gat_24`, `shop_gra_04`, `shop_gra_32`, `shop_dus_47`, `shop_bro_05`, `shop_pen_87`, `shop_pen_32`) et de la recette `mat_hrb_024` ; relecture de `npc_pen_02` / `npc_pen_23` (mentions d'illusion).
- **Générateur** : ingestion de `MSC_ENG_001`, des `FLO_*`, de la durabilité.
- **Code (`bot/`, demande PE explicite)** — ordre suggéré : D91 notifications + D92 confirmation → D86 genre → stockage d'objets des coffres → D85 mariage → D88 durabilité → D87 ressources → D90 effets et magie hors combat.

### État de sortie

8 ADR inscrites et propagées dans toutes les couches (MLD, mécanique, commandes Joueur/GM/IA). Aucun fichier de `bot/` touché. Les 3 points ouverts ont été tranchés en fin d'étape. Prochaine étape au choix du PE : lancer le lot de contenu préalable, ou démarrer le premier `/implement` (D91 + D92).

---

## ÉTAPE 61 — `/implement` « tout ce qui a déjà été cadré » : D85-D92 en code ✅ (2026-09-19)

**Objectif** : sur demande PE explicite (D-P3-1), implémenter dans `bot/` les 8 ADR de l'étape 60 et leurs tâches préalables (contenu, générateur), dans l'ordre suggéré, TDD à chaque lot, `/code-review` final.

### Première : la suite d'intégration a enfin tourné sur une vraie base

Base Postgres jetable (conteneur `alo-test-pg`, port 55432) reconstruite depuis `schema.sql` + inserts de `rebuild.sh` + `seed_data.sql`. Constats immédiats :
- **La suite n'avait jamais pu passer** : aucun fixture ne créait l'avatar de test ; deux tests inséraient des ID inexistants (FK). Corrigés. Base de départ : 77/82, puis 82/82 après correction du routeur (voir plus bas).
- **`schema.sql` ne contenait pas** `T_PROPERTIES`, `T_NPC_RELATIONS` (utilisées par le code depuis l'étape 59) ni aucune table de l'étape 60. Ajoutées dans une section « NIVEAU 6 » **idempotente** (`IF NOT EXISTS`), rejouable seule sur une base existante.
- **Le générateur d'objets lisait mal le format réel des fiches** : les 1 052 objets avaient prix 0, ATQ/DEF 0, rareté `common`, durabilité 0. Les boutiques vendaient donc gratuitement. Deux lots de 50 objets étaient rejetés (tenues `T0`, hors CHECK). Et `MAT_HRB_014` portait le nom d'une fiche de flore.
- **`T_NPC_KNOWLEDGE` restait à 0 ligne malgré le correctif de l'étape 56** : `topic_tags` (`TEXT[]`) recevait une chaîne. On passe à 8 681 lignes chargées. Les ~2 200 fiches K3/KX restent rejetées par le CHECK du schéma (K0-K2 seulement) : c'est un conflit schéma/doc hérité, non tranché.
- **Une seule ligne invalide faisait perdre ses 49 voisines** (inserts par lots de 50). PNJ, fiches QI et boutiques sont désormais insérés ligne à ligne.

### Lots livrés (6 commits)

| Lot | ADR | Contenu |
|---|---|---|
| `0429e49` | D91, D83, D92 | **Notifications :**<br>• file `T_NOTIFICATIONS` ;<br>• boucle d'envoi bridée (débit en configuration) ;<br>• réessais puis abandon explicite ;<br>• commandes `SYS_NOTIFY_PLAYER`, `SYS_ANNOUNCE(_GLOBAL)`, `SYS_NOTIF_QUEUE`.<br>**Menu et confirmation :**<br>• socle du menu `T_PENDING_MENUS` (citation / chiffre nu, aide 9, `!menu`) ;<br>• `CONFIRM` **par citation seule** pour : objet lié, `housing_sell`/`leave`, `!guild_disband`, `!divorce`. |
| `89a96cf` | D86, prérequis | • `!link_start [Race] [Nom] [Genre]`, genre obligatoire ;<br>• `SYS_SET_GENDER` : GM seul, refusé si l'avatar est marié ;<br>• **objets en coffre** (`items_stored`), piles distinguées par état de durabilité, objets liés refusés ;<br>• `!bank_depot` / `!bank_retrait` pour les Yrds comme pour les objets. |
| `73cf809` | D85 | **Mariage complet :**<br>• demande persistante, notifiée en privé ;<br>• acceptation en personne, revérifiée sous verrou ;<br>• cérémonie : anneaux consommés, coffre ×2, cadeau commun ;<br>• `!joint_bank`, `!joint_pay`, `!partner_*` ;<br>• `!divorce` confirmé, règlement par provenance, cooldown 30 j ;<br>• commandes `SYS_MARRY`, `SYS_DIVORCE_SETTLE`, `SYS_CANCEL_PROPOSAL`, `SYS_GENERATE_WEDDING_GIFT`.<br>**Prérequis :**<br>• anneau `MSC_ENG_001` en vente chez 10 bijoutiers ;<br>• générateur d'objets réparé. |
| `52a54b0` | D88 | • usure −1 par pièce portée en fin de combat ;<br>• **l'équipement non cassé fournit désormais ATQ/DEF au combat** : avant, le joueur frappait toujours pour 1 ;<br>• `!repair` dégressif, T5 liés exemptés ;<br>• rachat PNJ selon l'état ; objets liés et équipés invendables ;<br>• commandes `SYS_MODIFY_DURABILITY`, `SYS_BREAK_WEAPON` (casse réparable), `SYS_DURABILITY_SET` ;<br>• parchemins `CSM_PAR_007/008` archivés, retirés de 13 boutiques et de la recette `MAT_HRB_024`. |
| `61b24ca` | D87 | **Contenu :**<br>• 12 `MAT_POI` et 12 `FSH` ;<br>• 35 `ORE` dérivés des sources `MAT_MIN`/`MAT_GEM` ;<br>• outils `OUT_PIO`/`OUT_CAN` T1-T5 en boutique ;<br>• 100 `FLO` remappés sur l'atlas.<br>**Code :**<br>• `parseNodes()` ;<br>• `!recolter` / `!mine` / `!fish` (mini-jeu `FISHING`, bonne réponse connue du seul serveur) ;<br>• repousse par joueur, usure d'outil ;<br>• commandes `SYS_DEPLETE_RESOURCE`, `SYS_BONUS_HARVEST`, `SYS_STOCK_FISHING_SPOT`, `SYS_NODE_EVENT`, `SYS_NODE_RESET` ;<br>• lieu de cuisine. |
| `e9cfc22` | D90, D89 | • effets du joueur relus et réécrits autour du combat ; l'écriture d'un `MOB_*` dans une colonne UUID disparaît ;<br>• `!cast` hors combat : soin, soutien, résurrection, purge ; T1-T2 cible unique, T3+ le groupe présent ;<br>• `!music` = école Support ; `!effets` ;<br>• bloc « Effet persistant (D90) » ajouté à 10 sorts de soutien ;<br>• commandes `SYS_EFFECT_APPLY`, `SYS_BLESS_PLAYER`, `SYS_DEBUFF_PLAYER`, `SYS_CLEAR_EFFECTS` ;<br>• relecture de `npc_pen_02` / `npc_pen_23` (commandes d'illusion retirées). |

### Corrections transverses trouvées en route

- **WhatsApp : en groupe, `msg.from` est l'identifiant du groupe.** Tous les joueurs d'un groupe étaient donc identifiés par le groupe lui-même, alors qu'ALO se joue exclusivement en groupe. L'expéditeur réel est désormais `msg.author`.
- **Routeur :**
  - une commande `!mot` est aussi essayée sans son `!` : `!guild_disband` et `!repair` tombaient sinon dans le classifieur ;
  - un mot-clé exact (motif ancré `^…$`) passe avant le classifieur : « compétences » était routé en WHISPER.
- **Durées :** les durées restantes sont calculées en SQL. Le bot relisait les TIMESTAMP sans fuseau dans son propre fuseau, faussant tout calcul d'échéance dès que base et bot diffèrent.

### `/code-review` (Standards + Spec, 2 sous-agents) — corrigé

- Rejet non intercepté dans la boucle de notifications, qui pouvait tuer le process.
- Consommation de menu non atomique : double exécution possible. Corrigée par `DELETE … RETURNING`.
- `!joint_bank dépôt` (avec accents) non reconnu.
- Constantes dupliquées (48 h, 30 j, emplacements de coffre).
- `-1000000` remplacé par `breakItem`.
- Code mort retiré ; erreur de citation désormais journalisée.
- **D91 §3** : les événements de ressources IA sont annoncés au groupe de territoire, et un divorce prononcé par le GM notifie les deux conjoints.

### Interprétations prises en cours de route — à valider par le PE

1. **Réparation (D88 §4).** L'objet repart au **nouveau** plafond (I8 : courante ≤ plafond), et une réparation qui ramènerait le plafond à 0 est refusée. La lettre de §4 (« remet au plafond courant **puis** ampute ») contredit I8 ; j'ai tranché pour l'invariant. Conséquence : une réparation de moins que la lecture littérale.
2. **Forgeron de service** = PNJ de la zone portant un sujet de connaissance `réparation`. **Freelia n'en a aucun.**
3. **Feu de camp** = zones `HUNT`/`FLD`. **Cuisine de logement** = être dans la zone de son logement actif ou du foyer conjugal.
4. **`!joint_pay`** verse au portefeuille du payeur et consomme d'abord ses propres apports, puis le commun, puis ceux du conjoint. Lecture de « dépensable par les deux » ; un conjoint peut donc dépenser les apports de l'autre.
5. **Objet commun indivisible au divorce** (le cadeau) : il va au conjoint qui n'a pas demandé la séparation, comme le Yrd impair.
6. **Notifications (N1)** : les moteurs insèrent dans la file **dans leur transaction**, au lieu de renvoyer une liste. Le contrat « les handlers ne parlent jamais à WhatsApp » est tenu, et la notification devient atomique avec la mutation.
7. **Cadeau de noces** : arme ou armure du tier `ceil(moyenne/20)`. Pas de sort : un sort ne se dépose pas dans un coffre.
8. **Pêche** : 3 situations fixes ; réussite 70 % + 1 %/DEX (plafond 95 %).
9. **Durées des buffs de soutien** : 5 à 30 min selon le tier.

### Non fait, avec la raison

- **D90 E6** (buff des plats) : `T_RECIPES` est vide, il n'y a aucune recette de cuisine à câbler.
- **D90 E3** (dégâts périodiques hors combat) : aucun effet des données n'a de dégât périodique ; la règle « jamais sous 1 PV » tient par construction.
- **D85** :
  - repli vers `T_MAIL` si l'inventaire est plein : la capacité d'inventaire n'est tenue nulle part ;
  - combo conjugal +10 % : absent, le combat n'a pas de groupe ;
  - `SYS_GENERATE_CEREMONY` : c'est une narration LLM.
- **D88 PvP −3** : le PvP n'existe pas.
- **Nœuds sans ID** : liste en texte et non menu, car aucun contexte D83 de ce type n'est défini.
- **Anneau acheté non lié à l'âme** : l'achat ne pose pas `is_bound`.
- **Cadrages antérieurs non inclus** (hors du lot de l'étape 60) : menus D83 `COMBAT` / `DIALOGUE` / `SHOP` / `MOVEMENT` / `QUEST_BOARD`, sujets de service D84 (`!demander`), sorts en combat (`USE_SKILL` n'utilise pas le sort), `!fuite` (non routé), dégâts des sorts non ingérés.

### Vérification

155 tests sur base réelle, tous verts :
- `integration` : 82 ;
- `notifications-menus` : 16 ;
- `social` : 25 ;
- `durability` : 11 ;
- `gathering` : 12 ;
- `effects` : 9.

`seed_data.sql` régénéré. **Au PE :**
- rejouer la section « NIVEAU 6 » de `schema.sql` sur la base réelle, ou lancer `rebuild.sh` (destructif) ;
- recharger `seed_data.sql`.

---

## ÉTAPE 62 — « Tout faire » : reste de l'étape 61 et cadrages antérieurs ✅ (2026-09-19)

**Objectif** : sur autorisation explicite du PE (« je te donne l'autorisation de tout faire »), traiter tout ce qui restait :
- les interprétations de l'étape 61, **confirmées telles quelles** (autorité déléguée à l'ACP) ;
- les données manquantes ;
- les décisions antérieures jamais codées (D83 menus, D84 `!demander`, sorts en combat, `!fuite`) ;
- la capacité d'inventaire.

### Livré (6 commits + correctifs de revue)

| Commit | Contenu |
|---|---|
| `4a98ce2` | **Schéma et contenu :**<br>• `T_NPC_KNOWLEDGE` alignée sur sa fiche MLD (K3/KX stockés, colonnes de service) : **10 901 fiches QI chargées** au lieu de 8 681 ;<br>• section de rattrapage renommée **« NIVEAU 6 »** (homonyme d'une section existante) ;<br>• trigger `bind_on_acquire` : l'anneau naît lié à l'âme quel que soit le canal ;<br>• forgeron réparateur à Freelia (`QI_FRE_04_11`).<br>**Combat :**<br>• `!cast` en combat utilise réellement le sort ; `!fuite` routé ;<br>• l'attaque par ID de monstre ne trouvait jamais rien ;<br>• les sessions de combat ne s'enregistraient pas (colonnes inexistantes). |
| `9d5215e` | **Générateur :** dégâts des sorts, multiplicateur des OSS (bottes secrètes), recharges.<br>**Contenu :** 32 sorts de soutien/contrôle/affaiblissement reçoivent leur effet (42 effets de sorts).<br>**Corrections :**<br>• une altération **augmentait** la statistique visée ;<br>• les effets du défenseur modifiaient l'ATQ de l'attaquant. |
| `c6ffae7` | **`!demander` (D84, pare-feu D18) :**<br>• K0/K1 libres ;<br>• K2 selon conditions ou paiement consenti (K4) ;<br>• K3 : déflection ; KX : ignorance ;<br>• 22 sujets de service marqués à l'ingestion ;<br>• K2 ne fuit plus dans le cache RAG partagé.<br>**Menus D83 :** COMBAT, DIALOGUE, SHOP, MOVEMENT, QUEST_BOARD.<br>**Achat :** uniquement auprès d'une boutique de la zone, au prix et dans la limite du stock de la boutique. Tout s'achetait partout au prix catalogue, anneau compris.<br>**Générateur :**<br>• 154 boutiques rattachées à leur ville (elles tombaient toutes à Aincrad) ;<br>• quêtes avec donneur, zone, niveau, récompenses et étapes : aucune n'apparaissait au tableau. |
| `ab497e7` | **Cuisine (D90 E6) :**<br>• 28 denrées `MAT_ALI` vendues à la Halle d'Alne ;<br>• 32 recettes ingérées ;<br>• `use_effect` sur les consommables (30 effets de plats) ;<br>• `!use` / `!manger` : un seul buff de nourriture à la fois ; en combat, l'usage prend le tour.<br>**Artisanat :** un ingrédient épuisé violait le CHECK de quantité, donc aucune recette ne pouvait aboutir. |
| `42bb96d` | **Capacité d'inventaire :**<br>• un emplacement par ligne non équipée, +30 avec un sac ;<br>• tout canal d'acquisition refuse proprement quand l'inventaire est plein ;<br>• repli par `T_MAIL` au divorce. |

### `/code-review` (Standards + Spec) — corrigé

- **Objet en combat :** retrait de l'objet et PM dans une seule transaction, en écriture relative.
- **Capacité :**
  - décompte verrouillé (plus de dépassement concurrent) ;
  - les trois chemins restants la respectent : récompense de quête (repli courrier), retrait de courrier (le courrier reste réclamable), don GM.
- **Fabrication :** un ingrédient lié à l'âme est de nouveau consommable (consommer n'est pas transférer).
- **Achat :** `!buy [Qté] ID` accepte la quantité avant ou après l'ID.
- **Services :** `service_cost_yrds` est débité et remboursé si l'action échoue.
- **Multiplicateur OSS :** il multiplie les dégâts au lieu de s'y ajouter.
- **Pare-feu QI :**
  - `TITLE:` exige un titre **porté** ;
  - un K3 débloqué par l'IA/le GM est révélé ;
  - `SYS_NPC_KNOWLEDGE_UNLOCK` accepte K3 (fiche §4).
- **Menus :**
  - aide « 9 » propre à chaque contexte ;
  - articles épuisés hors du menu boutique ;
  - `ref` du menu combat = identifiant du combat.

### Interprétations confirmées ou prises (autorité déléguée)

- Les 9 interprétations de l'étape 61 sont maintenues.
- **Achat local** : un vrai changement de règle économique, justifié parce que l'anneau et toutes les boutiques étaient accessibles de partout.
- **Un seul buff de nourriture** : repris de la fiche (« 1 buff nourriture max »).
- **Quêtes à plusieurs étapes** : elles progressent via `SYS_ADVANCE_QUEST` (IA/GM) ; aucun déclencheur automatique d'objectif n'existe.
- **Sac** : +30 emplacements, valeur des 12 fiches `BAG_*`.
- **Recettes de cuisine** : réussite 90 %.
- **Durée d'un buff de plat** : celle de la fiche du plat (`T_RECIPES` n'a pas de durée).

### Toujours non fait, avec la raison

- **Primitives de service D84** : 20 des 22 services visent des `SYS_*` non construits (routes commerciales, escortes, contrebande, taxes…). Ce sont chacun des systèmes de jeu à concevoir ; ils répondent honnêtement « service pas encore ouvert ».
- **Menu COMBAT** : pas d'option « Parer », faute de mécanique de parade.
- **Menu DIALOGUE** : pas de « cadeau / relation / terminer », faute de système de cadeaux et d'affinité.
- **Menu SHOP** : pas de pagination « 0 » (la liste se limite aux 8 premiers articles).
- **Menu MOVEMENT** : les libellés sont des ID et non des noms.
- **K2 conditionnés par l'affinité** : ils restent verrouillés en pratique, faute de moyen d'en gagner.
- **PvP (et son usure −3), combo conjugal +10 %** : ce sont des systèmes non conçus, à passer par un grilling.
- **`NPC_SECRET_PROBED`** et **génération narrative `SYS_NPC_DIALOGUE`** : relèvent de la couche IA.
- **Objet rendu par courrier** : il perd son état de durabilité, car `T_MAIL` n'a pas de colonnes pour ça.
- **Base réelle non mise à jour, et c'est impossible d'ici :**
  - le service PostgreSQL local est arrêté ;
  - **`bot/.env` pointe sur `localhost:5432`, qui est le conteneur `loyerpro-ci-db-1` d'un autre projet**, et non la base ALO.
  - Au PE : corriger `bot/.env`, puis rejouer « NIVEAU 6 » de `schema.sql` et recharger `seed_data.sql`.

### Vérification

183 tests sur base réelle jetable, tous verts. Répartition : `integration` 82 · `notifications-menus` 16 · `social` 25 · `durability` 11 · `gathering` 12 · `effects` 9 · `combat` 7 · `dialogue-menus` 11 · `cooking` 6 · `inventory` 4.

---

## ÉTAPE 63 — Cuisine libre « marmite » (D93) et niveau de cuisine (D94) ✅ (2026-09-19)

**Demande PE** : s'inspirer de la cuisine de *Zelda BotW/TotK* et de *Monster Hunter Wilds*. On jette jusqu'à 4 ingrédients à la fois pour obtenir des plats simples (viande grillée, poisson grillé, légumes grillés…), en plus des recettes. On ajoute une XP de cuisine selon la complexité et la réussite, et le niveau fixe la réussite des plats compliqués.

**Recherche** : mécaniques des deux jeux vérifiées en ligne, sans s'appuyer sur la mémoire du modèle.
- BotW : jusqu'à 5 ingrédients, effets renforcés par répétition, effets contraires qui s'annulent, *Dubious Food* / *Rock-Hard Food*.
- MH Wilds : base viande / poisson / légumes + ingrédients.

### Décisions

- **D93 — marmite :**
  - 4 ingrédients ;
  - profil culinaire de 65 ingrédients (catégorie + essence) ;
  - 10 plats génériques ;
  - même essence ⇒ palier 1 à 3 (+5/10/15 %) ; essences contraires ⇒ aucun effet ;
  - durée 10 min par ingrédient ;
  - parties de monstre ⇒ tambouille douteuse, autres non-comestibles ⇒ immangeable ;
  - ingrédients identiques à une recette ⇒ le plat de la recette (« découverte »).
- **D94 — niveau :**
  - complexité : recette = ingrédients + 2 × (tier − 1) ; marmite = ingrédients + palier ;
  - réussite : 90 % + 4 % par niveau d'écart au niveau conseillé 5 × (c − 2), entre 30 et 98 % ;
  - XP : 10 × c² en cas de réussite, 3 × c² en cas d'échec ;
  - niveau : √(XP/25) + 1, maximum 50 ;
  - remplace `success_rate` pour la cuisine seulement.

Spécification et tableaux d'ingestion : `system_mechanics/cuisine_libre.md`. Prochain numéro libre : **D95**.

### Modifications

| Fichier | Changement |
|---|---|
| Documentation | `cuisine_libre.md` (nouveau) ; `registre_decisions.md` (D93, D94) ; `gathering_cooking_system.md` §4 ; fiches MLD (A9 `cooking_xp`, I9 `instance_data`, I10 `cook_profile`, I11) ; commandes Joueur, GM et IA |
| Contenu | 10 plats génériques `CSM_CUI_001-010` (`consommables/cuisine_libre/`) |
| `schema.sql` (NIVEAU 6) | `T_ITEMS_DICT.cook_profile`, `T_INVENTORY.instance_data`, `T_AVATARS.cooking_xp` |
| Générateur | Profils culinaires et 12 effets `EFF_CUI_*` lus depuis `cuisine_libre.md` |
| Moteur | `engine/cooking.js` : composition pure, formules, `cookInPot`, `cookRecipe` |
| Commandes | `!marmite A + B (+ …)` (noms, ID, ou « 2x Nom ») ; `!cook [Recette]` soumis au niveau ; `!cook niveau` ; GM `!sys_cooking_xp` / IA `SYS_GRANT_COOKING_XP` |
| Données d'exemplaire | Un plat de marmite garde ses PV, son effet et sa durée sur son exemplaire : il ne s'empile pas, et ces données sont conservées au coffre |

### Vérification

195 tests verts sur base jetable. La nouvelle suite `marmite` en compte 12 ; le test de recette de la suite `cooking` a été stabilisé : le cuisinier y a le niveau conseillé, sinon une recette complexe réussit à 34 % au niveau 1.

### Points laissés au PE

- **Réussite au niveau 1** : une recette T2 à 3 ingrédients (complexité 5) réussit à **34 %** — c'est voulu (D94), mais sévère. Les recettes de l'étape 62 réussissaient à 90 % d'emblée.
- **Plats simples** : 1 ou 2 ingrédients sans effet réussissent à 94-98 %.
- **Essences** : attribuées par l'ACP d'après le nom et le lore des ingrédients (tableau §2), donc ajustables dans `cuisine_libre.md` sans toucher au code.

### Complément — effets des plats 036-060 (2026-09-19)

Les fiches `CSM_NOU_036` à `060` écrivent leur effet sous la forme « `| Stat | +15% ATQ |` », que le générateur ne lisait pas : ces plats et boissons se mangeaient sans effet. `parseUseEffect` lit maintenant aussi ce format. Il accepte les synonymes ATQ (→ STR), END et DEF (→ VIT).

**Plats avec effet : 46/60** (contre 32). Les 14 restants n'ont rien à appliquer :
- 4 sans effet : Bière d'Alne, Jus de fruit, Lait de chèvre, Eau de mer purifiée (« anti-soif ») ;
- 6 à résistances : aucune résistance n'existe au combat ;
- 2 au charisme : aucune statistique de charisme ;
- 2 à « régénération PM » : aucune régénération continue des PM hors combat.

