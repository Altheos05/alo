# 📜 Registre des Décisions — Projet ALO

> **Règle d'usage (obligatoire)** : avant d'allouer un nouveau numéro `D<nn>` ou un nouveau préfixe `D-<SLUG>-<n>`, consulter ce fichier en premier — il remplace le grep manuel dans tout le projet. Prochain numéro simple libre : **D95**. Ce registre couvre le dépôt git (`données/`, `directives_generation/`, `cahier_des_charges.md`, `alo_context.md`, `alo_progression.md`). Il ne couvre **pas** `directives_generiques/` (kit générique du PE, non versionné, espace de nommage volontairement distinct — voir §4).
>
> Constitué le 2026-09-17 (étape 53, session de reprise) par inventaire exhaustif (agent Explore, lecture intégrale des 24 CDC `directives_generation/`, de `alo_progression.md`, `cahier_des_charges.md`, `alo_context.md`, `README.md`, des fiches de données référençant une décision). Deux anomalies réelles trouvées ont été corrigées dans la foulée (§3) ; le reste est classé par ordre croissant, avec statut et sources.

---

## 1. Décisions numérotées D1 → D94

| ID | Intitulé | Étape | Statut | Source(s) principale(s) |
|---|---|---|---|---|
| D1 | Capitale Salamander = Gattan ; Voulg requalifiée forteresse secondaire | 1 | ✅ | `cahier_des_charges.md` §7, `alo_progression.md` |
| D2 | Disposition radiale des 9 territoires autour d'Alne, frontières par paires `HUNT_002` | 1 | ✅ | idem |
| D3 | New Aincrad : seuls Palier 1 + palier de front persistants ; boss = instances éphémères | 1 | ✅ (réaffirmée étape 35 = D70) | idem |
| D4 | Taxonomie de groupes WA v2 (`location`/`dungeon_instance` vs hubs sociaux) | 1 | ✅ (harmonisée D76) | idem |
| D5 | Capitales nommées : Lioda/Duskarn/Granzam/Brokkheim (+ Penwether canon) | 1 | ✅ | idem |
| D6 | Plages d'ID mobs par secteur (001-004/010-013/020-026/030-034) | 2 | ✅ | `alo_progression.md` |
| D7 | PNJ capitale `01-07`, annexes `10+` | 2 | ✅ | idem |
| D8 | Mobs aériens `MOB_AIR_001-004` partagés par les 9 routes | 2 | ✅ | idem |
| D9 | `T_ZONE_LINKS` = source de vérité du graphe ; `connected_zones` = vue dénormalisée | 2 | ✅ | `alo_context.md`, `19_cdc_moteur_deterministe.md` |
| D10 | Mécanique signature WhatsApp par donjon territorial (7/9) | 2 | ✅ | `alo_progression.md` |
| D11 | Mécaniques des 2 derniers donjons : Surchauffe (Salamander), Apnée (Undine) | 3 | ✅ | `cahier_des_charges.md`, fiches donjon |
| D12 | Jauges environnementales unifiées `OXYGEN`/`HEAT`/`DOT`, commande générique | 3 | ✅ | `cahier_des_charges.md`, 29 fichiers |
| D13 | Convention ID items séquentielle stricte + gabarit 5 sections | 4 | ✅ | `alo_progression.md`, `02_cdc_items.md` |
| D14 | Structure d'un lot de 100 par slot (9 races×9 + 9 neutres + 9 boss + 1 légendaire) | 4 | ✅ | idem |
| D15 | Grille économique par tier (T1 150-400 → T4 9k-20k, revente 25%) | 4 | ✅ | `alo_progression.md` (⚠️ `02_cdc_items.md` §3 la citait par erreur comme D13 — corrigé étape 53) |
| D16 | Plages de numérotation PNJ (`00`/`01-07`/`08-09`/`10-19`/`20-99`) | 5 | ✅ | `npc_knowledge_protocol.md` §def. maîtresse |
| D17 | Gabarit de fiche PNJ / budget informationnel standard | 5 | ✅ | idem — **la plus citée après D22/D71/D76** (31 fichiers) |
| D18 | Pare-feu informationnel : pipeline `!parler`/`!demander` en 5 étapes | 5 | ✅ | `npc_knowledge_protocol.md` |
| D19 | Rencontres canoniques : matérialisation contrôlée (R-C1→R-C5) | 5 | ✅ | idem |
| D20 | Roster d'Alne figé (principes a→g) | 7 | ✅ | `alo_progression.md` |
| D21 | Barème QI Alne (budget 12 hubs / 10 autres) | 7 | ✅ | idem |
| D22 | Verrou du fil méta : slots K3 méta jamais injectés au LLM, révélation pilotée L1 | 7 | ✅ | **Règle mère la plus citée du projet (10+ fichiers)** — chaque verrou de ville (D26/D29/D32/D47/D50/D53) la cite |
| D23 | Preuve du fil « neutralité fragile » — convergente, non résolutive | 7 | ✅ | `alo_progression.md` |
| D24 | Barème QI Swilvane | 8 | ✅ | idem |
| D25 | Fils rouges Swilvane | 8 | ✅ | idem |
| D26 | Verrou fil méta Swilvane (règle D22) | 8 | ✅ | idem |
| D27 | Barème QI Voulg | 9 | ✅ | idem |
| D28 | Fils rouges Voulg | 9 | ✅ | idem |
| D29 | Verrou fil méta Voulg (règle D22) | 9 | ✅ | idem |
| D30 | Barème QI Freelia *(réservé a posteriori pour éviter collision avec le lot parallèle)* | 10 | ✅ | `01_cadrage_pnj.md`, `alo_progression.md` |
| D31 | Fils rouges Freelia | 10 | ✅ | idem |
| D32 | Verrou fil méta Freelia (règle D22) | 10 | ✅ | idem |
| D33 | Format D17 corrigé (pas de YAML, table, `QI_ID` normalisé) | 10 | ✅ | idem |
| D34 | Quotas de rôles par ville, contraignants | 10-bis | ✅ | `01_cadrage_pnj.md` |
| D35 | Contrat de fiche boutique (1 PNJ, 1 fichier, `SHOP_<VILLE>_<NN>`) | 10-bis | ✅ | `03_cdc_boutiques.md` |
| D36 | Matrice de différenciation zonale (PRODUIT/BESOIN/ABSENT/signatures) | 10-bis | ✅ (conflit R6 résolu par D64) | idem |
| D37 | Protocole du générateur délégué (`[BESOIN_*]`, jamais hors plage) | 10-bis | ✅ | cité en tête de 8 CDC |
| D38 | Taxonomie d'armures par SLOT (5 slots, pas plus) | 10-ter | ✅ (amendée PE, précisée D45b) | `04_cdc_armures_boucliers.md` |
| D39 | ❌ Accessoires 100 (30/30/20/20) | 10-ter | **Caduque** — gelée par directive PE, 14 fiches archivées `deprecated_v1/` (étape 53) | `05_cdc_accessoires.md` |
| D40 | 10 écoles de magie × 10 sorts, affinités raciales | 10-ter | ✅ | `06_cdc_skills.md` |
| D41 | Faune = 249+ fiches sur plages D6, renommage `MOB_CAT_*`→`MOB_CAI_*` | 10-ter | ✅ | `07_cdc_faune.md` |
| D42 | Flore = nodes produisant exclusivement des `MAT_*` existants | 10-ter | ✅ | `08_cdc_flore.md` |
| D43 | Quêtes v1 = 34 ; une quête ne résout jamais un fil rouge | 10-ter | ✅ | `09_cdc_quetes.md` |
| D44 | Capacité d'inventaire v1 (`32+niveau+...`, plafond 160) | 10-ter | **Primée** par le PE (étape 10-quater) puis par D45b | `alo_progression.md` |
| D45 | *(voir D81 — collision, résolue étape 53)* Barème QI Archipel | 11 | Renuméroté **D81** | — |
| D45 | Système de port dissocié de l'armure (ceinture/sac/sangle, plafond 130/160) | 10-quinquies | ✅ — **c'est le D45 qui fait autorité** (opérationnel, cité dans `02_cdc_items.md` annexe 4-bis, `table_t_avatars.md`) | `alo_context.md`, `alo_progression.md` |
| D46 | *(voir D82 — collision, résolue étape 53)* Fils rouges Undine | 11 | Renuméroté **D82** | — |
| D46 | Tenue par défaut à la création (`OFT_TOP/BOT_*`, variante régionale) | 10-quinquies | ✅ — **c'est le D46 qui fait autorité** | `10_cdc_tenue_defaut.md` |
| D47 | Verrou fil méta Undine (règle D22) | 11 | ✅ | `alo_progression.md` |
| D48 | Barème QI Lioda | 12 | ✅ | idem |
| D49 | Fils rouges Puca | 12 | ✅ | idem |
| D50 | Verrou fil méta Lioda (règle D22) | 12 | ✅ | idem |
| D51 | Barème QI Duskarn | 13 | ✅ | idem |
| D52 | Fils rouges Imp | 13 | ✅ | idem |
| D53 | Verrou fil méta Duskarn (règle D22) | 13 | ✅ | idem |
| D54 | Lots `wpn_`/`mat_` racine = junk v1 non conforme, à remplacer | 14 | ✅ | idem |
| D55 | Artefacts uniques hors CDC-ITM (`world_tree_droplet`, `familiar_heart`) | 14 | ✅ | idem |
| D56 | Dette de commandes tracée (`!enter_portal`, `!accept_rally`) | 14 | ✅ (résolue D63) | idem |
| D57 | Politique de reprise d'un lot délégué non conforme : normaliser si exploitable | 18 | ✅ | idem |
| D58 | Dette CDC-ITM §2 : famille « bois » manquante | 18 | ✅ (résolue étape 31, `MAT_WOD_*`) | idem |
| D59 | Revive → Guérison (`MAG_GUE_006`, T3) | 19 | ✅ | `_index_skills.md` |
| D60 | Codes école/domaine alignés CDC (`TEN`/`CBT`) | 19 | ✅ | idem |
| D61 | Plafonds R6 (T3≤4/T4≤2) régissent l'équipement, pas matériaux/consommables | 20 | ✅ | `_index_boutiques_gattan.md` |
| D62 | `!learn_skill` = face-joueur unique des 3 grants de compétence | 21 | ✅ | `alo_progression.md` |
| D63 | Téléports de cristaux consensuels uniquement | 21 | ✅ | idem |
| D64 | Armes de guerre T4 au marché noir (résolution conflit R6↔D36) | 22 | ✅ | `_index_boutiques_alne.md` |
| D65 | Chevauchement territorial Gattan/Voulg : pool racial partagé | 25 | ✅ | `_index_boutiques_freelia.md` |
| D66 | Non-autorité du contenu pré-généré (régénération intégrale obligatoire) | 25-bis | ✅ — très référencée (5+ fichiers) | `cahier_des_charges.md` §7 |
| D67 | Gabarit quête de titre T5 | 33 | ✅ | `alo_progression.md` |
| D68 | Gabarit quête de légendaire (EXP recalibrée par D74) | 34 | ✅ | idem |
| D69 | Gabarit boss d'axe vertical « Wiki ALO » | 35 | ✅ | idem, `15_cdc_rag.md` |
| D70 | Paliers New Aincrad = profil paramétrique (cohérent D3) | 35 | ✅ | idem |
| D71 | Clé canonique = `Item_ID` interne, jamais le nom de fichier | 36 | ✅ — **décision la plus citée du dépôt** (README, 5 CDC) | `11_audit_conformite_etape36.md` §7 |
| D72 | Prix catalogue = autorité (pas le balance sheet) | 37 | ✅ | `12_equilibrage_economique.md` |
| D73 | Drop rates = grille simple par type/tier | 37 | ✅ (non rouverte par D77) | idem |
| D74 | Récompenses T5/légendaires modestes ; le gain réel est fonctionnel | 37 | ✅ | idem |
| D75 | Package de départ (300 Yrds + 3 Pains + 3 Potions + tenue régionale) | 37 | ✅ | idem |
| D76 | **Pivot territorial WhatsApp** — 1 territoire = 1 groupe, 26 permanents/~74 dynamiques | 47 (PE) / 48 (docs ACP) | ✅ — décision produit la plus structurante du projet (12 fichiers). *Saut D71→D76 volontaire (D72-D75 déjà pris) — pas une collision, documenté dans `alo_progression.md`.* | `cahier_des_charges.md` §1/§7, `README.md`, atlas, protocole déplacement |
| D77 | Rareté découplée du Tier (créations futures uniquement, ne rouvre pas D73) | 49 | ✅ | `23_etude_patterns_rarete_drop.md` |
| D78 | Récolte par partie (dépeçage), formalisée moteur = D-DET-5 | 49-51 | ✅ (16/16 boss nommés) | idem |
| D79 | Variant de créature commune (P5), formalisée moteur = D-DET-6 | 49/52 | ✅ | idem |
| D80 | Corridor Souterrain de Lugru formalisé dans l'atlas (`ZONE_ROUTE_LUGRU`) + trigger L4 découplé (`link_type='FLY'`, pas `Type=ROUTE`) | 53 | ✅ | `cahier_des_charges.md` §7, atlas, `table_t_zone_links.md` |
| D81 | *(ex-D45, renuméroté étape 53)* Barème QI Archipel | 11 | ✅ | `alo_progression.md` |
| D82 | *(ex-D46, renuméroté étape 53)* Fils rouges Undine | 11 | ✅ | idem |
| D83 | Menu contextuel numéroté (couche déterministe, pré-NLU) : 1-8 options résolues par L1 + `9` aide universelle ; résolution par citation du message-menu ou chiffre nu avec TTL par contexte ; ne retire aucune commande texte existante | 54 | ✅ | `system_mechanics/menu_contextuel_protocol.md` |
| D84 | Sujets de service : sur les ~30 verbes dédiés de la §21 (services de Capitale Alne), **~21 seulement** deviennent des sujets `!demander [NPC] [sujet]` (K0/K1, jamais K2/K3) déclenchant leur primitive `SYS_*` déjà existante — **13 gardent une commande dédiée** (3 mécaniques à point d'accès multiple : réputation, sertissage de gemme, tutoriel ; **10 archétypes déjà répliqués dans 2 à 5 autres villes**, découverts par vérification croisée après le diagnostic initial : voyage, raid_register, mount_rent, sharpen, fence, oracle, memorial, laundry, loan, heal) ; 2 verbes purement redondants avec le K2 `PAY:<N>` existant retirés | 55 | ✅ | `system_mechanics/npc_knowledge_protocol.md` §2-bis |
| D85 | Flux de mariage : demande persistante `T_MARRIAGE_PROPOSALS` (TTL 48 h, pas de Map en mémoire) ; demande **à distance**, acceptation **en personne** (même zone, hors combat, prérequis revérifiés sous verrou) ; 1 demande sortante max, plusieurs entrantes (`!decline_proposal`/`!cancel_proposal`) ; foyer = **condition d'entrée** (`home_property_uuid` nullable, `ON DELETE SET NULL`) ; coffre conjugal Yrds **+ objets** dès la v1 | 60 | ✅ | `system_mechanics/marriage_housing_system.md` §1.4, `table_t_marriage_proposals.md`, `table_t_marriages.md` |
| D86 | Genre choisi à l'inscription (`!link_start [Race] [Nom] [Genre]`), **immuable** ; correction GM uniquement (`!sys_set_gender`) — le `male` codé en dur rendait tout mariage impossible | 60 | ✅ | `table_t_avatars.md` A8 |
| D87 | Ressources : table unique `T_RESOURCE_NODES` (`FLORA`/`ORE`/`FISH`) ; repousse **propre à chaque joueur** (`T_AVATAR_HARVESTS`, creuse) + état global du nœud réservé aux événements IA ; pêche, récolte et minage en v1 (lot de contenu Pêche `MAT_POI_*` d'abord) ; outils `OUT_*` en simple possession, tier de l'outil ≥ tier du nœud ; pêche = mini-jeu asynchrone à 3 options (D83), récolte/minage immédiats ; appâts en V2 ; cuisine limitée au feu de camp ou à la cuisine de logement (clause v1.0 conservée). Supersede la prose de `gathering_cooking_system.md` v1.0 | 60 | ✅ | `system_mechanics/gathering_cooking_system.md` v2.0, `table_t_resource_nodes.md` |
| D88 | Durabilité : usure des outils (par récolte) **et** de l'équipement de combat (−1/pièce/combat PvE, −3 PvP) ; réparation **dégressive** (chaque réparation ampute la durabilité max) au **forgeron PNJ uniquement** ; parchemins de réparation `CSM_PAR_007/008` retirés ; grille d'état Neuf/Quasi neuf/Bon état/État correct/Usé/Cassé et coefficients de valeur ; objet cassé = aucune statistique ; **T5 liés à l'âme exemptés de l'amputation** (usure et coût conservés) | 60 | ✅ | `system_mechanics/durability_repair_system.md` |
| D89 | `illusion_magic_system.md` et `music_magic_system.md` (prose héritée) **remplacés par le lot I-4** (application D66) : `!music` = alias de `!cast` pour l'école `SUP` ; `!illusion`, `!music_stop`, `!treasure_sense` et commandes IA associées retirés | 60 | ✅ | bandeaux des deux documents, `whatsapp_commands_list.md` §6-bis |
| D90 | Effets actifs persistants hors combat : `T_ACTIVE_EFFECTS` **existante** (déjà écrite en fin de combat, jamais relue) complétée — sorts **et** plats, expiration paresseuse (aucun planificateur) ; effets négatifs persistants mais **jamais mortels hors combat** (plancher 1 PV) ; ciblage T1-T2 unique (soi / allié même zone), T3+ = groupe présent dans la même zone ; hors combat, seuls les sorts sans dégâts directs | 60 | ✅ | `table_t_status_effects.md` (amendement D90) |
| D91 | Notifications sortantes : personnel → message privé, collectif → groupe de territoire (ou communautaire) ; file persistante et **bridée** `T_NOTIFICATIONS` (anti-bannissement du client non officiel) ; les handlers renvoient les notifications, seule la couche WhatsApp les émet | 60 | ✅ | `system_mechanics/notifications_protocol.md`, `table_t_notifications.md` |
| D92 | Confirmation générique des actions irréversibles via le menu D83 (contexte `CONFIRM`, 1 confirmer / 2 annuler, 60 s, revérification sous verrou) ; liste fermée : jeter un objet lié, divorce, vente/résiliation de logement, dissolution de guilde ; en `CONFIRM`, **citation du menu obligatoire** (chiffre nu ignoré) | 60 | ✅ | `system_mechanics/menu_contextuel_protocol.md` §7 |
| D93 | Cuisine libre (« marmite », inspirée de BotW/TotK et MH Wilds) : jusqu'à **4 ingrédients** jetés ensemble, sans recette ; plat déduit du profil culinaire (catégorie + essence) des ingrédients — grillés simples, brochette, poêlée, ragoût, bouillon ; même essence ⇒ effet renforcé (3 paliers), essences contraires ⇒ effet annulé ; parties de monstre ⇒ tambouille douteuse, non-comestibles ⇒ immangeable ; ingrédients égaux à une recette ⇒ le plat de la recette (découverte). S'ajoute aux recettes, ne les remplace pas | 63 | ✅ | `system_mechanics/cuisine_libre.md` |
| D94 | Niveau de cuisine : complexité d'un plat (ingrédients, tier, palier d'effet), réussite = 90 % + 4 %/niveau d'écart au niveau conseillé 5 × (c − 2), bornée 30-98 % ; XP 10 × c² (réussite) / 3 × c² (échec) ; niveau √(XP/25) + 1, max 50 ; remplace `success_rate` pour la cuisine seulement | 63 | ✅ | `system_mechanics/cuisine_libre.md` §5 |

---

## 2. Décisions à préfixe (`D-<SLUG>-<n>`)

Familles P3 (architecture IA/bot) — définitions maîtresses dans `directives_generation/`, jamais dans `directives_generiques/` (§4).

| Préfixe | Plage | Thème | CDC source | Étape |
|---|---|---|---|---|
| `D-SOC` | 1→14 | Systèmes sociaux (relations PNJ, housing, mariage, emploi, guildes) | `21_cdc_systemes_sociaux.md` §2 | 43 |
| `D-IA` | 1→6 | Constellation multi-IA, frontière déterministe, tiering modèles | `13_etude_architecture_multi_ia.md` §13 | 38 |
| `D-IA` | 7→12 | Orchestration hybride 100% gratuite (cascade C1-C4) | `14_architecture_hybride_orchestration.md` §15 | 39 |
| `D-RAG` | 1→9 | Fondation RAG (chunking, gating K0-K2, anti-hallucination) | `15_cdc_rag.md` §15 | 40 |
| `D-NLU` | 1→5 | Compréhension locale ONNX (jamais LLM), résolution D71 | `16_cdc_nlu_locale.md` §8 | 41 |
| `D-SPE` | 1→5 | Spécialistes narratifs, dialogue 2 modes | `17_cdc_specialistes_narratifs.md` §5 | 41 |
| `D-ORC` | 1→7 | Orchestration runtime, `generate()`, load-balancer | `18_cdc_orchestration_runtime.md` §10 | 41 |
| `D-DET` | 1→6 | Moteur déterministe L1 (combat/éco/inventaire) ; D-DET-5=D78, D-DET-6=D79 | `19_cdc_moteur_deterministe.md` §6 | 41, 50, 52 |
| `D-MOD` | 1→6 | Sélection de modèles francisée (e5-small, gazetteer, BT) | `20_cdc_selection_modeles.md` §5 | 42 |
| `D-P3` | 1→2 | `bot/` = propriété PE ; artefacts `.onnx` non versionnés | `alo_context.md` étape 44 | 44 |

Détail complet de chaque décision individuelle : voir le CDC source cité (chaque fichier liste ses propres `D-<SLUG>-<n>` en clair, pas de collision interne détectée dans cette couche).

---

## 3. Anomalies trouvées et résolues (étape 53)

1. **Collision D45 / D46** — deux décisions distinctes portaient chaque numéro (Barème QI Archipel / Système de port ; Fils rouges Undine / Tenue par défaut). Le couple « port/tenue » (étape 10-quinquies) est opérationnellement enraciné (cité dans `02_cdc_items.md` annexe 4-bis, `10_cdc_tenue_defaut.md`, `table_t_avatars.md`) → conservé. Le couple « QI Archipel/fils rouges Undine » (étape 11) n'était cité nulle part hors `alo_progression.md` → **renuméroté D81/D82**.
2. **Duplication littérale de blocs** — les sections « ÉTAPE 11 (Archipel) » et « ÉTAPE 12 (Lioda) » apparaissaient chacune deux fois, texte identique, dans `alo_progression.md` (conséquence probable d'une fusion de sessions parallèles mal résolue). **Blocs dupliqués supprimés**, une seule occurrence de chaque conservée.
3. **Citation croisée D13/D15** — `directives_generation/02_cdc_items.md` §3 attribuait la grille de prix par tier à D13 (qui est en réalité la convention d'ID/gabarit) au lieu de D15 (grille économique). **Corrigé.**
4. **D30-D33 « réservés a posteriori »** — pas une collision : `01_cadrage_pnj.md` documente explicitement que ces numéros ont été laissés libres pour ne pas percuter le lot Freelia en cours en session parallèle. Traçabilité correcte, aucune action requise.
5. **Saut D71→D76** — pas une collision : `alo_progression.md` (étape 48) documente explicitement que D72-D75 étaient déjà consommées (calibration économique, étape 37) au moment d'attribuer le numéro du pivot territorial. Aucune action requise.

---

## 4. Cluster générique — `directives_generiques/` (hors registre, à ne jamais confondre)

Ce dossier est un **kit méthodologique générique** extrait par le PE (réutilisable pour d'autres projets de bot IA, non spécifique à ALO), **non versionné par git** (`.gitignore` racine — `directives_generation/`, `directives_generiques/`, `ressources_brutes/`, `system_persona_architecte.md` en font partie). Il réutilise **délibérément ou par inadvertance** les mêmes libellés numériques que ce registre, avec un **contenu générique différent** :

- `D-DET-1/2/3` génériques (« l'IA ne décide jamais un chiffre d'état », « le moteur est testable sans IA », « cascade de fournisseurs ») ≠ `D-DET-1/2/3` ALO (frontière déterministe combat/éco réelle, contrat `SYS_*` en 6 étapes, comportement de mob ML).
- Pipeline générique `D71`(PRÉREQUIS)→`D72`(AUTORISATION)→`D73`(VERROU)→`D74`(EXÉCUTION)→`D75`(RÉSULTAT) dans `CDC_INTEGRATION_IA.md`/`GABARIT_COMMANDES_SYS.md` ≠ D71 (clé canonique Item_ID), D72-D75 (calibration économique) du registre réel.

**Ne jamais citer un numéro `directives_generiques/` comme s'il appartenait à ce registre, et ne jamais y allouer de nouveau numéro sans vérifier les deux espaces de nommage.** Le projet documentait déjà ce risque (`alo_progression.md`, étape 48, état de sortie) ; ce registre le formalise. Aucune action corrective sur `directives_generiques/` lui-même : c'est un artefact PE hors du périmètre ACP (livrables markdown/spéc du dépôt ALO), et le renommer casserait sa réutilisabilité inter-projets voulue par le PE.

---

## 5. Prochain numéro libre

**D95** (simple). Pour les préfixes `D-<SLUG>`, vérifier la plage déjà consommée en §2 avant d'ajouter — chaque famille est contiguë et complète, pas de trou à combler.
