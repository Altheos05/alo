# Système de Récolte, Minage, Pêche & Cuisine

> **v2.0 (étape 60, 2026-09-19, D87/D88/D90)** — Supersede la v1.0 (prose héritée d'avant les conventions d'ID D13 : poissons, minerais et zones nommés sans aucun ID, aucune table de stockage, mini-jeu chronométré). **Source de vérité = `table_t_resource_nodes.md`** ; ce document est la spécification de comportement. Les tables de la v1.0 sont conservées en annexe comme **matière première non autoritaire** pour le lot de contenu Pêche.

## 1. Modèle commun (D87)

Récolte, minage et pêche partagent un seul modèle : le **nœud de ressource** (`T_RESOURCE_NODES`), un point d'une zone qui produit un objet existant.

| Activité | Commande | Nœuds | Produit | Outil | Résolution |
|---|---|---|---|---|---|
| Récolte | `!recolter <FLO_ID>` | `FLO_*` (100 fiches existantes) | `MAT_HRB_*` | aucun (à la main) | immédiate |
| Minage | `!mine [ORE_ID]` | `ORE_*` (dérivés des sources `MAT_MIN_*`/`MAT_GEM_*`) | `MAT_MIN_*`, `MAT_GEM_*` | pioche `OUT_PIO_*` | immédiate |
| Pêche | `!fish [FSH_ID]` | `FSH_*` (lot à produire) | `MAT_POI_*` (famille à produire) | canne `OUT_CAN_*` | mini-jeu à 3 options |

- **Repousse propre à chaque joueur** : récolter un nœud ne le retire à personne d'autre. Sur WhatsApp, une course « premier arrivé » ne mesurerait que la réactivité et pousserait au spam du groupe de territoire.
- **État global réservé aux événements IA** : `SYS_DEPLETE_RESOURCE` rend un nœud indisponible pour tous pendant une durée (surexploitation narrative), `SYS_BONUS_HARVEST` multiplie les rendements pour tous (« Récolte Abondante »). Le monde peut s'épuiser ou prospérer, par événement, jamais par course.
- **Outils** : simple possession dans l'inventaire (pas d'équipement en main) ; le **tier de l'outil doit être ≥ au tier du nœud** — progression pioche en fer → pioche en mithril. Un outil **cassé** (durabilité 0) ne compte pas.

## 2. Pêche — mini-jeu asynchrone (D87)

`!fish [FSH_ID]` lance la pêche ; le bot décrit la ligne (tension, remous, poids) et propose **3 options numérotées** (ex. « tirer fort », « laisser filer », « ferrer doucement ») via le menu contextuel D83 (contexte `FISHING`). Une seule est juste selon l'indice narratif ; la DEX module la réussite. **Aucun chronomètre** : la fenêtre de 10 s de la v1.0 est abandonnée, la latence de livraison WhatsApp la rendait injuste. Réponse fausse : aucune prise, l'usure de la canne s'applique, la repousse n'est pas consommée.

*Implémentation (étape 61)* : 3 situations fixes (poids immobile → tirer fort ; ligne qui file → laisser filer ; petites touches → ferrer doucement) ; une bonne réaction réussit avec une probabilité de 70 % + 1 % par point de DEX (plafond 95 %). La bonne option n'est connue que du serveur (référence du menu) ; `!fish_reel` tapé à la main ne pêche rien.

**V2** : appâts.

## 3. Usure des outils (D88)

Chaque tentative avec outil consomme de la durabilité ; la réparation est dégressive et se fait chez un forgeron PNJ uniquement. Détail complet : `durability_repair_system.md`.

## 4. Cuisine

- `!cook [Recette]` passe par le moteur d'artisanat existant (`T_RECIPES`, `craft_type = 'cooking'`, étape 58) — il ne manque que le contenu des recettes.
- Les buffs de repas sont des **effets actifs persistants** (`T_ACTIVE_EFFECTS`, D90) : un plat mangé en ville reste actif pendant les déplacements et les combats, jusqu'à son échéance.
- **Lieu de cuisine (clause v1.0 conservée, arbitrage PE étape 60)** : `!cook` nécessite un **feu de camp** ou une **cuisine de logement** (propriété possédée ou louée par le joueur, ou foyer conjugal). Hors de ces lieux, la commande est refusée avec l'indication du lieu requis.
  - *Implémentation (étape 61)* : la **cuisine de logement** = être dans la zone d'un logement actif à soi (possédé, ou loué et à jour) ou du foyer conjugal ; le **feu de camp** = toute zone d'extérieur sauvage (`HUNT`, `FLD`) — aucun objet « feu de camp » n'existant, c'est une règle de lieu, sans état.

## 5. Commandes IA

- `SYS_STOCK_FISHING_SPOT(Zone_ID, Fish_ID, Rarity)`, `SYS_DEPLETE_RESOURCE(Zone_ID, Resource_Type)`, `SYS_BONUS_HARVEST(Zone_ID, Multiplier)` — conservées, **réinterprétées** comme écritures de l'état global des nœuds (`depleted_until`, `yield_multiplier`, `multiplier_until`) de la zone et du type visés.

---

## Annexe — tables de la v1.0 (non autoritaires, matière première du lot Pêche)

Aucune de ces entrées n'a d'ID ; les zones sont nommées librement. À traduire en `MAT_POI_*` / `FSH_*` / `ORE_*` conformes à l'atlas, ou à écarter.

**Pêche** : Lac de Swilvane (Truite Sylphe 3 Y, Carpe Dorée 50 Y, Bague Rouillée) · Mer d'Undine (Maquereau Bleu 5 Y, Espadon Géant 100 Y, Perle d'Ondine) · Rivière d'Alne (Saumon d'Argent 4 Y, Anguille Électrique 80 Y, Coffre Submergé) · Marais de Jötunheimr (Poisson-Mort 1 Y, Léviathan Miniature 200 Y, Fragment d'Excalibur).

**Minage** : Mines Gnome (Fer 5 Y, Mithril 100 Y, Rubis 500 Y) · Cavernes Jötunheimr (Obsidienne 8 Y, Orichalque 150 Y, Diamant Noir 800 Y) · Montagnes Salamander (Cuivre 3 Y, Adamantite 120 Y, Saphir de Feu 600 Y). *Les `MAT_MIN_*` validés (étape 18) priment sur ces noms.*

**Recettes** : Ragoût de Viande (+10 % PV max, 30 min) · Poisson Grillé Royal (+15 % régén. PM, 30 min) · Pain de Voyage Elfique (+5 % EXP, 60 min) · Ragoût de Champion (+20 % ATQ, 15 min) · Thé Médicinal Undine (immunité poison, 60 min).
