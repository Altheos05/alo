# Table MLD : T_PROPERTIES (Housing — achat / location)

> Logement du joueur. Deux modes de tenure demandés par le PE : **acheter** (`own`, permanent) **ou louer** (`rent`, loyer récurrent, expulsion sur défaut). Supersede la prose de `system_mechanics/marriage_housing_system.md` §2 (D-SOC-4).
>
> **Avantages actés (PE)** : (1) **stockage domestique massif** ; (2) **checkpoint sûr** — repos + rappel à tout moment ; (3) **prérequis obligatoire au mariage**.

## 1. Structure SQL

```sql
CREATE TABLE T_PROPERTIES (
    property_uuid       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_avatar_uuid   UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    property_type       VARCHAR(16) NOT NULL
                            CHECK (property_type IN ('inn_room','small_house','manor','estate')),
    tenure              VARCHAR(4) NOT NULL CHECK (tenure IN ('rent','own')),
    zone_id             VARCHAR(50) NOT NULL REFERENCES T_ZONES(zone_id),  -- capitale de la race du joueur
    wa_group_id         VARCHAR(50) REFERENCES T_WA_GROUPS(wa_group_id),   -- groupe WhatsApp privé du logement
    acquired_at         TIMESTAMP NOT NULL DEFAULT NOW(),

    -- ═══ LOCATION (tenure = 'rent') ═══
    rent_yrds_cycle     INT NOT NULL DEFAULT 0,        -- loyer par cycle de 7 j ; 0 si 'own'
    paid_until          TIMESTAMP,                     -- échéance de loyer ; NULL si 'own'
    is_delinquent       BOOLEAN NOT NULL DEFAULT FALSE,-- loyer en retard (fenêtre de grâce active)

    -- ═══ AVANTAGES ═══
    storage_slots       INT NOT NULL DEFAULT 0,        -- coffre domestique MASSIF (cf. grille §2)
    storage_used        INT NOT NULL DEFAULT 0,
    is_safe_checkpoint   BOOLEAN NOT NULL DEFAULT TRUE, -- rappel + logout sûr (pas de Remain Light)
    rest_regen_pct      INT NOT NULL DEFAULT 5,        -- % HP/MP par minute au repos chez soi
    deco_buffs          JSONB NOT NULL DEFAULT '{}',   -- buffs passifs de décoration (actifs dans le logement)

    -- Invités (droit d'entrée dans le groupe privé)
    invited_avatars     JSONB NOT NULL DEFAULT '[]'
);

-- Un seul logement PRINCIPAL par joueur (D-SOC-5)
CREATE UNIQUE INDEX idx_property_owner ON T_PROPERTIES(owner_avatar_uuid);
CREATE INDEX idx_property_zone         ON T_PROPERTIES(zone_id);
CREATE INDEX idx_property_delinquent   ON T_PROPERTIES(is_delinquent) WHERE is_delinquent = TRUE;
```

## 2. Grille des logements (D-SOC-6 — calée balance sheet v2.0)

| `property_type` | Tenure | Coût | Loyer / 7 j | `storage_slots` | Note |
|---|---|---|---|---|---|
| `inn_room` (chambre d'auberge) | **`rent`** | — | 1 500 Yrds | +50 | entrée de gamme locative ; louée chez un aubergiste (PNJ ou joueur, cf. `T_JOBS`) |
| `small_house` (petite maison) | **`own`** | 50 000 Yrds | — | +150 | 1er palier de propriété ; suffit au prérequis de mariage |
| `manor` (manoir) | **`own`** | 500 000 Yrds | — | +400 | + emplacements de décoration à buffs |
| `estate` (domaine) | **`own`** | 3 000 000 Yrds | — | +1 000 | luxe personnel (≠ Château **de guilde**, qui reste dans `T_GUILDS.qg_level`) |

- **Stockage domestique ≠ banque ≠ inventaire porté.** C'est un coffre supplémentaire (`!home_storage`), accessible **uniquement depuis le logement**. La « augmentation massive » demandée = ces `storage_slots`.
- Les **armes** peuvent être déposées au stockage domestique (contrairement au sac `BAG_*`, cf. `T_AVATARS` A5).

## 3. Checkpoint sûr & protocole de déplacement (D-SOC-7)

Le logement est un **point de rappel personnel**, interaction directe avec l'invariant **R0** de `zone_movement_protocol.md` :

- `!home_return` : rappel depuis n'importe quelle zone — **hors combat uniquement** (`is_in_combat = FALSE`). Déplacement *sanctionné* (comme un cristal de rappel) : écriture L1 `current_zone_id` = zone de la propriété + `sync_player_groups()` vers le groupe territoire correspondant (R0 v2, D76). Le groupe HOME (`group_type='housing'`) est un canal social persistant, hors décompte R0, jamais quitté automatiquement.
- `!rest` chez soi : régénération `rest_regen_pct` %/min (5 % contre 1 % en extérieur) **et logout sûr** — aucune pénalité *Remain Light*, l'avatar réapparaît chez lui à la reconnexion.
- Le groupe HOME est **privé** : `invited_avatars` + le propriétaire (et le conjoint, cf. `T_MARRIAGES`) uniquement.

## 4. Triggers / Procédures Stockées

| # | Contrat | Comportement |
|---|---|---|
| P1 | **Cycle de loyer (`rent`)** | Maintenance hebdomadaire (lundi) : débit `rent_yrds_cycle` sur `T_AVATARS.yrd_balance`, `paid_until += 7 j`. Solde insuffisant ⇒ `is_delinquent = TRUE` + fenêtre de grâce 7 j |
| P2 | **Expulsion** | `is_delinquent` non résorbé après grâce ⇒ `SYS_EVICT_TENANT` : la ligne est supprimée, le contenu du `!home_storage` part en `T_MAIL` (conservation 30 j), le groupe WhatsApp est archivé |
| P3 | **Propriété permanente (`own`)** | `tenure = 'own'` ⇒ `rent_yrds_cycle = 0`, `paid_until = NULL`, jamais délinquant ; revente `!housing_sell` = 50 % du prix d'achat (aligné revente items) |
| P4 | **Rappel sûr borné** | `!home_return` / logout sûr rejetés si `is_in_combat = TRUE` (anti-fuite de combat) |
| P5 | **Prérequis de mariage** | La création d'un `T_MARRIAGES` lit cette table : au moins un des deux fiancés doit posséder une propriété active (own **ou** rent à jour). Cf. `T_MARRIAGES` M3. **Condition d'entrée uniquement (D85)** : après la cérémonie, vendre, résilier ou perdre par expulsion le foyer conjugal reste possible et ne dissout pas le mariage (`T_MARRIAGES.home_property_uuid` → `NULL`) ; vente et résiliation passent par la confirmation D92 |
| P6 | **Unicité** | Un joueur détient un seul logement principal (index unique) ; acheter/louer un second exige d'abord de libérer l'actuel |
| P7 | **Buffs de déco (D-SOC-3)** | `deco_buffs` (JSONB) n'accepte que les clés figées : `rest_hp_regen_pct`, `rest_mp_regen_pct`, `rest_exp_pct`, `craft_cost_pct` (réduction, valeur négative), `comfort_cosmetic` (lore, 0 %). Chaque clé **plafonnée à ±5 % par logement** (cumul de plusieurs `DEC_*` de même effet écrêté au plafond). Buffs actifs **uniquement dans le logement** (jamais extérieur/combat) — cohérent `T_ITEMS_DICT` I4 |

## 5. Équivalents Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Voir l'offre en ville | `!housing_list` | — | — |
| Louer / acheter | `!housing_rent [Type]`, `!housing_buy [Type]` | `!sys_grant_property [Avatar] [Type] [Tenure]` | `SYS_GRANT_PROPERTY`, `SYS_CREATE_HOME_GROUP` *(existant)* |
| Payer le loyer (avance) | `!housing_pay [Cycles]` | — | — |
| Rappel / repos | `!home_return`, `!rest` | — | — |
| Stockage domestique | `!home_storage` *(dépôt/retrait)* | — | — |
| Invités | `!home_invite [Num]`, `!home_kick [Num]` | — | — |
| Décoration | `!decorate [Item]` | — | — |
| Quitter / vendre / expulser | `!housing_sell`, `!housing_leave` | `!sys_evict [Avatar]` | `SYS_EVICT_TENANT`, `SYS_DESTROY_HOME` *(existant)* |

> **Règle de complétude** : nouvelles faces `!housing_list/rent/pay/sell/leave`, `!home_return`, `!housing_pay`, `!sys_grant_property`, `!sys_evict`, `SYS_GRANT_PROPERTY`, `SYS_EVICT_TENANT` à propager (§15 WhatsApp / §10 orchestrateur). Réutilisées telles quelles : `!home_storage`, `!home_invite/kick`, `!decorate`, `!rest`, `SYS_CREATE_HOME_GROUP`, `SYS_DESTROY_HOME`.
