# Table : T_AVATARS

```sql
CREATE TABLE T_AVATARS (
    avatar_uuid             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_phone          VARCHAR(20) UNIQUE NOT NULL,
    avatar_name             VARCHAR(32) UNIQUE NOT NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at           TIMESTAMP,
    
    -- Race & Apparence
    race_id                 VARCHAR(20) NOT NULL REFERENCES T_RACES(race_id),
    gender                  VARCHAR(10) NOT NULL CHECK (gender IN ('male','female','neutral')),
    wing_color              VARCHAR(7) DEFAULT '#FFFFFF',
    appearance_data         JSONB,
    
    -- Stats Primaires
    level                   INT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 100),
    current_xp              BIGINT NOT NULL DEFAULT 0,
    total_xp                BIGINT NOT NULL DEFAULT 0,
    
    -- HP / MP / Stamina
    hp_current              INT NOT NULL,
    hp_max                  INT NOT NULL,
    mp_current              INT NOT NULL,
    mp_max                  INT NOT NULL,
    stamina_current         INT NOT NULL DEFAULT 100,
    stamina_max             INT NOT NULL DEFAULT 100,
    
    -- Stats de Combat
    stat_str                INT NOT NULL DEFAULT 1,
    stat_agi                INT NOT NULL DEFAULT 1,
    stat_vit                INT NOT NULL DEFAULT 1,
    stat_int                INT NOT NULL DEFAULT 1,
    stat_dex                INT NOT NULL DEFAULT 1,
    stat_luk                INT NOT NULL DEFAULT 1,
    stat_points_available   INT NOT NULL DEFAULT 0,
    
    -- Économie
    yrd_balance             BIGINT NOT NULL DEFAULT 100,
    total_yrd_earned        BIGINT NOT NULL DEFAULT 0,
    total_yrd_spent         BIGINT NOT NULL DEFAULT 0,
    
    -- Positionnement
    current_zone_id         VARCHAR(50) NOT NULL REFERENCES T_ZONES(zone_id),
    current_wa_group_id     VARCHAR(50),
    is_flying               BOOLEAN DEFAULT FALSE,
    flight_altitude         INT DEFAULT 0,
    
    -- PvP & Karma
    pk_karma                INT NOT NULL DEFAULT 0,
    pk_kills                INT NOT NULL DEFAULT 0,
    pk_deaths               INT NOT NULL DEFAULT 0,
    player_status           VARCHAR(10) DEFAULT 'green' CHECK (player_status IN ('green','orange','red')),
    pvp_enabled             BOOLEAN DEFAULT FALSE,
    
    -- État Vital
    is_alive                BOOLEAN NOT NULL DEFAULT TRUE,
    is_remain_light         BOOLEAN DEFAULT FALSE,
    remain_light_expires_at TIMESTAMP,
    is_in_combat            BOOLEAN DEFAULT FALSE,
    is_resting              BOOLEAN DEFAULT FALSE,
    is_banned               BOOLEAN DEFAULT FALSE,
    ban_reason              TEXT,
    
    -- Guilde
    guild_uuid              UUID,
    guild_rank              VARCHAR(20),
    guild_joined_at         TIMESTAMP,

    -- ═══ VIE SOCIALE (étape 43, D-SOC-*) ═══
    marriage_uuid           UUID REFERENCES T_MARRIAGES(marriage_uuid),   -- mariage actif (NULL = célibataire)
    home_property_uuid      UUID REFERENCES T_PROPERTIES(property_uuid),  -- logement principal (NULL = sans-abri)
    job_id                  VARCHAR(50) REFERENCES T_JOBS_DICT(job_id),   -- emploi actif (NULL = sans emploi)
    
    -- ═══ ÉQUIPEMENT PORTÉ — 5 slots d'armure, PAS PLUS (directive PE, D44) ═══
    equip_head              UUID,               -- ARM_TET_*
    equip_torso             UUID,               -- ARM_TOR_* — pré-rempli à la création par le HAUT de tenue OFT_TOP_* (D46)
    equip_arms              UUID,               -- ARM_BRA_*
    equip_waist             UUID,               -- ARM_TAI_* — armure de taille (PROTECTION), distincte de la ceinture porte-armes
    equip_legs              UUID,               -- ARM_JAM_* — pré-rempli à la création par le BAS de tenue OFT_BOT_* (D46)

    -- ═══ SYSTÈME DE PORT — dissocié de l'armure (D45) ═══
    -- Mains : objets activement tenus (accès combat immédiat)
    hand_main               UUID,               -- arme WPN_* / torche / objet ; requis pour attaquer
    hand_off                UUID,               -- bouclier WPN_BOU_* / 2e arme (dual wield sous passive) / objet ; NULL si arme 2 mains
    -- Ceinture : porte-armes à dégainage rapide (2 fourreaux) — sa SEULE fonction
    gear_belt               UUID,               -- item BELT_* équipé ; débloque belt_left + belt_right
    belt_left               UUID,               -- arme WPN_* au flanc gauche — exige gear_belt ; dégainage sans commande
    belt_right              UUID,               -- arme WPN_* au flanc droit — exige gear_belt ; dégainage sans commande
    -- Dos : UN conteneur, exclusif — sac OU sangle, jamais les deux (D45)
    gear_back               UUID,               -- BAG_* (stockage items/consommables) XOR HRN_* (sangle : armes au dos)
    back_type               VARCHAR(4) CHECK (back_type IN ('BAG','HRN')),   -- NULL = dos nu

    -- ═══ INVENTAIRE — virtuel par défaut, le sac n'est PAS obligatoire (D45) ═══
    inventory_capacity      INT NOT NULL DEFAULT 31,   -- VIRTUEL de base ; recalculé par trigger (formule ci-dessous)
    inventory_used          INT NOT NULL DEFAULT 0,    -- slots occupés (cache dénormalisé, tenu par T_INVENTORY)
    bag_quick_access        BOOLEAN NOT NULL DEFAULT FALSE,  -- VRAI si back_type='BAG' : retrait de consommables sans commande

    -- Titre & Cosmétique
    active_title_id         VARCHAR(30),
    bio_text                VARCHAR(200)
);

CREATE INDEX idx_avatars_whatsapp ON T_AVATARS(whatsapp_phone);
CREATE INDEX idx_avatars_zone ON T_AVATARS(current_zone_id);
CREATE INDEX idx_avatars_group ON T_AVATARS(current_wa_group_id);
CREATE INDEX idx_avatars_guild ON T_AVATARS(guild_uuid);
```

## Capacité d'inventaire — VIRTUELLE par défaut (D45)

L'inventaire de base est **virtuel** : il existe sans sac, le port d'un sac n'est **pas obligatoire**. Le sac apporte de l'espace **en plus** et surtout un **accès rapide** (pas de commande de retrait en plein combat).

```
inventory_capacity (VIRTUEL, toujours disponible, sans sac) =
      30  (poches de base)
    +  1 × niveau                       (Niv 1 = 31 … Niv 100 = 130)
    +  passives PAS_EXP_*               (rang I +2 / II +5 / III +8)
    —  plafond virtuel : 130

  Sac BAG_* équipé au dos (back_type='BAG') : +30 emplacements PHYSIQUES
    → contenu = items + petits consommables UNIQUEMENT (jamais d'armes, D45)
    → accès RAPIDE : retrait sans commande en combat (bag_quick_access = VRAI)
    → plafond total avec sac : 160
```

- 1 slot = 1 instance non empilable OU 1 pile (empilables ×99 : `CSM_*`, `MAT_*`).
- Recalcul par trigger à chaque : level-up, (dé)équipement du sac, apprentissage de passive.
- Retirer un sac dont le contenu déborderait le plafond virtuel est **refusé** tant que l'excédent n'est pas vidé.
- **Inventaire plein** : tout gain (`!buy`, loot, `SYS_GRANT_ITEM`) est refusé avec message narratif (jamais de perte silencieuse) ; les récompenses de quête partent en attente chez le Maître de Poste (`T_MAIL`, 7 jours).

## Où se rangent les ARMES (D45) — jamais dans le sac ni l'inventaire virtuel

Les armes sont **encombrantes** : elles ne tiennent ni dans le sac (`BAG_*` = items/consommables) ni dans l'inventaire virtuel. On ne les porte que **physiquement**, selon un gradient d'accès en combat :

| Emplacement | Capacité | Accès en combat |
|---|---|---|
| Mains (`hand_main` + `hand_off`) | 2 (ou 1 arme 2 mains) | **actif** — 0 coût |
| Ceinture (`belt_left` + `belt_right`) | 2 (flancs G/D) | **dégainage instantané**, sans commande |
| Sangle dorsale (`gear_back` = `HRN_*`) | 2 à 4 selon tier | **rapide**, sans commande (mais exclut le sac) |
| Banque (`T_BANK`) | illimité | **impossible en combat** (dépôt en ville) |

**Arbitrage de loadout imposé au joueur (D45)** : le dos ne porte qu'UN conteneur — soit un **sac** (stockage + consommables à accès rapide, mais 2 armes max à portée : mains + ceinture), soit une **sangle** (2-4 armes de plus au dos, mais aucun espace de stockage supplémentaire). Le surplus d'armes va à la banque, inaccessible en combat.

## Tenue par défaut à la création (D46)

À la création, l'avatar reçoit et équipe une **tenue de départ** (2 pièces `OFT_*`, durabilité négligeable, rachetable) déterminée par sa **ville d'apparition** (variante régionale) et son `gender` — cf. `directives_generation/10_cdc_tenue_defaut.md` :

- `equip_torso` ← **haut** `OFT_TOP_*` (t-shirt régional).
- `equip_legs` ← **bas** `OFT_BOT_*` : pantalon **ou** short (`male`/`female`), **ou** robe (`female` uniquement).
- Ces pièces sont de vraies armures T0 (DEF minime) : la première armure achetée les remplace dans leur slot.

## Contrats d'intégrité (D44/D45)

| # | Contrat | Comportement |
|---|---|---|
| A1 | **Slot d'armure typé** | `equip_<slot>` n'accepte que le préfixe du slot (`ARM_TET_*`→head, `ARM_TOR_*`/`OFT_TOP_*`→torso, `ARM_JAM_*`/`OFT_BOT_*`→legs, …) — un casque ne va jamais aux jambes, et RIEN d'autre que de l'armure/tenue ne s'équipe |
| A2 | **Mains = saisie libre** | `hand_main`/`hand_off` acceptent tout objet saisissable (`WPN_*`, bouclier `WPN_BOU_*`, torche, objet de quête) ; attaquer exige une arme en `hand_main` ; 2e arme en `hand_off` seulement si la passive `PAS_CBT_*` est apprise ; les armes 2 mains occupent les DEUX mains |
| A3 | **Ceinture = 2 armes** | `belt_left`/`belt_right` n'acceptent que des `WPN_*` et exigent `gear_belt` non nul (item `BELT_*`) ; la ceinture n'apporte aucune stat, seulement les 2 fourreaux |
| A4 | **Dos exclusif** | `gear_back` = 1 seul item ; `back_type='BAG'` ⇒ conteneur d'items (jamais d'arme), `bag_quick_access`=VRAI ; `back_type='HRN'` ⇒ sangle d'armes (2-4 `WPN_*`), aucun stockage d'items. Basculer de l'un à l'autre vide/relit les slots concernés |
| A5 | **Armes hors sac/virtuel** | aucune arme `WPN_*` ne peut occuper l'inventaire virtuel ni un sac ; le surplus va en `T_BANK` |
| A6 | **Tenu/porté = possédé** | toute valeur `equip_*`/`hand_*`/`belt_*`/`gear_*` doit exister dans `T_INVENTORY` avec `is_equipped = VRAI` pour ce même avatar (anti-duplication) |
| A7 | **Miroirs sociaux (D-SOC-13)** | `marriage_uuid`/`home_property_uuid`/`job_id` sont des **caches dénormalisés** (accès rapide `!profil`) ; la **source de vérité** reste `T_MARRIAGES`/`T_PROPERTIES`/`T_AVATAR_JOB`. Tenus à jour par trigger à chaque mariage/divorce, acquisition/expulsion de logement, embauche/démission |
| A8 | **Genre choisi à l'inscription, immuable (D86)** | `gender` est fourni par le joueur à `!link_start [Race] [Nom] [Genre]` (`homme`/`femme`/`neutre` → `male`/`female`/`neutral`) et **jamais modifiable par le joueur** ensuite (UPDATE rejeté hors source GM). Correction uniquement via `!sys_set_gender` / `SYS_SET_GENDER`. Justification : le genre conditionne le mariage (D-SOC-10, trigger M1 de `T_MARRIAGES`) et la tenue par défaut (D46) — un genre libre permettrait de contourner D-SOC-10. Les avatars créés avant D86 (tous `male` par défaut, valeur codée en dur dans l'ancienne inscription) sont conservés tels quels, correction GM au cas par cas |

### Équivalents commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Inventaire / équiper armure / jeter | `!inventaire`, `!equiper [Item_ID] [Slot]`, `!unequip [Slot]`, `!jeter [Item_ID]` | `!sys_give [Item_ID] [Num]` | `SYS_GRANT_ITEM(Avatar_ID, Item_ID, Qty)` |
| Saisir / lâcher (mains) | `!equiper [Item_ID] main`, `!degainer [gauche\|droite\|dos]` *(nouveau, D45)*, `!unequip main` | `!sys_set_loadout` *(nouveau)* | `SYS_SET_LOADOUT(Avatar_ID, Slot, Item_ID)` *(nouveau)* |
| Ceinture / sangle / sac (dos) | `!equiper [BELT_ID] ceinture`, `!equiper [BAG_ID\|HRN_ID] dos` ; couture : `!sew [Matériau]` | — | — |
| Retirer un item du sac/inventaire | `!fetch [Item_ID]` *(nouveau, D45 — coûte une action ; ignoré si `bag_quick_access`)* | — | — |

> **Règle de complétude** : `!degainer`, `!fetch`, `!sys_set_loadout`, `SYS_SET_LOADOUT` sont à propager dans `whatsapp_commands_list.md` et `ai_orchestrator_commands.md` (fait à la clôture de cette étape).
