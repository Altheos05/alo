# Table MLD : T_RESOURCE_NODES (+ T_AVATAR_HARVESTS)

> Points de ressource du monde (D87) : **un seul modèle** pour la récolte (`FLORA`), le minage (`ORE`) et la pêche (`FISH`). Un nœud = un lieu qui produit un objet existant, avec une quantité, un niveau requis, un outil éventuel et une repousse. Les différences entre activités (mini-jeu de pêche, outil requis) sont du comportement de commande, pas des données. Aucune table ne stockait jusqu'ici ces points : `T_LOOT_TABLES` ne peut pas servir (FK `monster_id NOT NULL`), et `gathering_cooking_system.md` v1.0 ne citait aucun ID.

## 1. Structure SQL

```sql
CREATE TABLE T_RESOURCE_NODES (
    node_id              VARCHAR(30) PRIMARY KEY,          -- FLO_NNN (existants) / ORE_NNN / FSH_NNN — séquentiel strict (D13)
    node_type            VARCHAR(5) NOT NULL CHECK (node_type IN ('FLORA','ORE','FISH')),
    name                 VARCHAR(100) NOT NULL,
    zone_id              VARCHAR(50) NOT NULL REFERENCES T_ZONES(zone_id),
    yield_item_id        VARCHAR(50) NOT NULL REFERENCES T_ITEMS_DICT(item_id),  -- MAT_HRB_* / MAT_MIN_* / MAT_GEM_* / MAT_POI_*
    yield_min            INT NOT NULL DEFAULT 1 CHECK (yield_min >= 1),
    yield_max            INT NOT NULL DEFAULT 1,
    node_tier            INT NOT NULL CHECK (node_tier BETWEEN 1 AND 5),
    level_required       INT NOT NULL DEFAULT 1,
    required_tool_prefix VARCHAR(10),                      -- NULL (FLORA, cueillette à la main) / 'OUT_PIO' / 'OUT_CAN'
    respawn_sec          INT NOT NULL,                     -- repousse PAR JOUEUR (cf. T_AVATAR_HARVESTS)

    -- État global, réservé aux événements IA (jamais modifié par une récolte de joueur)
    depleted_until       TIMESTAMP,                        -- SYS_DEPLETE_RESOURCE : nœud indisponible pour tous
    yield_multiplier     NUMERIC(3,1) NOT NULL DEFAULT 1.0,-- SYS_BONUS_HARVEST : ×2 pour tous…
    multiplier_until     TIMESTAMP,                        -- …jusqu'à cette échéance

    CHECK (yield_max >= yield_min),
    CHECK ((node_type = 'FLORA' AND required_tool_prefix IS NULL)
        OR (node_type = 'ORE'   AND required_tool_prefix = 'OUT_PIO')
        OR (node_type = 'FISH'  AND required_tool_prefix = 'OUT_CAN'))
);

CREATE INDEX idx_nodes_zone ON T_RESOURCE_NODES(zone_id, node_type);

-- Repousse propre à chaque joueur : table CREUSE, ligne créée à la 1ʳᵉ récolte
-- (même philosophie que T_NPC_RELATIONS, D-SOC-1 — jamais matérialisée à l'inscription)
CREATE TABLE T_AVATAR_HARVESTS (
    avatar_uuid        UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    node_id            VARCHAR(30) NOT NULL REFERENCES T_RESOURCE_NODES(node_id),
    next_available_at  TIMESTAMP NOT NULL,
    harvest_count      INT NOT NULL DEFAULT 0,
    PRIMARY KEY (avatar_uuid, node_id)
);
```

## 2. Indexation et Optimisation

- **Index** `idx_nodes_zone` : liste des nœuds de la zone du joueur (`!mine` / `!fish` sans argument, panneaux de zone, `!inspect`).
- `T_AVATAR_HARVESTS` reste creuse : seules les paires (joueur, nœud) effectivement récoltées existent.
- Les échéances (`next_available_at`, `depleted_until`, `multiplier_until`) sont évaluées **à la lecture** : aucun planificateur requis.

## 3. Triggers / Procédures Stockées

| # | Contrat | Comportement |
|---|---|---|
| R1 | **Présence** | Récolter exige `T_AVATARS.current_zone_id = zone_id` |
| R2 | **Niveau** | `T_AVATARS.level >= level_required` |
| R3 | **Outil (D87)** | Si `required_tool_prefix` non nul : l'avatar **possède** (simple possession dans `T_INVENTORY`, pas d'équipement requis) un outil de ce préfixe, **de tier ≥ `node_tier`**, et **non cassé** (`current_durability > 0`, D88). Le meilleur outil éligible est utilisé |
| R4 | **Repousse par joueur (D87)** | Refus si `T_AVATAR_HARVESTS.next_available_at > NOW()` pour ce couple ; succès ⇒ UPSERT `next_available_at = NOW() + respawn_sec`, `harvest_count + 1`. Aucune course entre joueurs : un nœud n'est jamais « pris » par un autre |
| R5 | **État global IA** | `depleted_until > NOW()` ⇒ refus pour tous ; `multiplier_until > NOW()` ⇒ quantité × `yield_multiplier` pour tous |
| R6 | **Rendement** | Quantité tirée dans `[yield_min, yield_max]` (× multiplicateur), créditée dans `T_INVENTORY` (piles, capacité), transaction unique avec l'usure |
| R7 | **Usure (D88)** | Chaque **tentative** avec outil coûte de la durabilité à l'outil utilisé (réussie ou non, taux calibré dans le lot de contenu) — cf. `durability_repair_system.md` |
| R8 | **Pêche = mini-jeu asynchrone (D87)** | `!fish` ne résout pas immédiatement : le bot décrit la ligne et propose **3 options numérotées** via le menu D83 (contexte `FISHING`) ; une seule est juste selon l'indice narratif, la DEX module la réussite. Pas de chronomètre (latence WhatsApp). Réponse fausse ⇒ aucune prise, usure appliquée, repousse **non** consommée. Récolte et minage résolvent immédiatement |

## 4. Équivalents Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Récolter / miner / pêcher | `!recolter <FLO_ID>`, `!mine [ORE_ID]`, `!fish [FSH_ID]` (sans ID : menu des nœuds accessibles de la zone) | `!sys_node_reset [Avatar] [Node_ID]` | — |
| Inspecter un nœud | `!inspect <Node_ID>` (repousse restante pour soi, état global) | — | — |
| Épuiser / abonder / peupler | — | `!sys_node_event [Node_ID] [deplete\|bonus] [Durée]` | `SYS_DEPLETE_RESOURCE`, `SYS_BONUS_HARVEST`, `SYS_STOCK_FISHING_SPOT` *(existants, réinterprétés sur l'état global du nœud)* |

## 5. Contenu à produire (tâches préalables, ACP)

1. **100 `FLO_*` existants** (`items_equipements/materiaux/flore/`) : à ingérer (0 en base à l'étape 60) et à **remapper** — leurs zones sont dans une convention hors atlas (`ZONE_GAT_HUNT_01` au lieu de `ZONE_SAL_HUNT_001`, 0 correspondance en base). Leur colonne « Temps » (ex. 8 s) est abandonnée ; `respawn_sec` est à calibrer.
2. **Nœuds `ORE_*`** : dérivés de la colonne « Source » des 25 `MAT_MIN_*` et des `MAT_GEM_*` (zones déjà conformes à l'atlas).
3. **Lot Pêche** : famille de poissons bruts `MAT_POI_*` (6ᵉ famille de matériaux, gabarit D13) + nœuds `FSH_*`.
4. **Outils** `OUT_PIO_*` (pioches) et `OUT_CAN_*` (cannes), T1→T5, avec `durability_max`, chaînage économique vers les forgerons/artisans existants.
5. **V2** : appâts de pêche.
