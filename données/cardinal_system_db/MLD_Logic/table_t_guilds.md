# Table MLD : T_GUILDS

> **Périmètre** : `T_GUILDS` modélise exclusivement les **guildes de joueurs** — dynamiques, fondées via `!guild_create` par un avatar (`leader_avatar_uuid NOT NULL`), avec trésorerie/QG/recrutement. Les emplois `T_JOBS_DICT.employer_type='guild'` référencent des **guildes de métier** (factions de lore statiques : Forges de Brokkheim, Chercheurs de Trésors de Penwether, Caravaniers) — ce ne sont **jamais** des lignes `T_GUILDS` (elles n'ont pas de fondateur-joueur). Registre de ces guildes de métier : §5.

## 1. Structure SQL

```sql
CREATE TABLE T_GUILDS (
    guild_uuid          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_name          VARCHAR(32) UNIQUE NOT NULL,
    guild_tag           VARCHAR(6) UNIQUE,
    leader_avatar_uuid  UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    vice_leader_uuid    UUID REFERENCES T_AVATARS(avatar_uuid),
    race_allegiance     VARCHAR(20) REFERENCES T_RACES(race_id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    member_count        INT NOT NULL DEFAULT 1 CHECK (member_count BETWEEN 1 AND 100),
    guild_level         INT NOT NULL DEFAULT 1 CHECK (guild_level BETWEEN 1 AND 50),

    -- Trésorerie
    treasury_yrds       BIGINT NOT NULL DEFAULT 0,
    tax_rate            DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (tax_rate BETWEEN 0.00 AND 0.20),

    -- Quartier général
    qg_level            INT NOT NULL DEFAULT 0 CHECK (qg_level BETWEEN 0 AND 5),
    qg_unlocked_at      TIMESTAMP,
    qg_storage_capacity INT NOT NULL DEFAULT 0,
    qg_bonus_flags      JSONB,

    -- Services installés (booléens dans JSONB)
    services            JSONB DEFAULT '{}',

    -- Entretien
    last_maintenance_at TIMESTAMP,
    maintenance_overdue BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_guilds_leader ON T_GUILDS(leader_avatar_uuid);
CREATE INDEX idx_guilds_race ON T_GUILDS(race_allegiance);

CREATE TABLE T_GUILD_MEMBERS (
    guild_uuid      UUID NOT NULL REFERENCES T_GUILDS(guild_uuid) ON DELETE CASCADE,
    avatar_uuid     UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    rank            VARCHAR(20) NOT NULL CHECK (rank IN ('leader','vice_leader','officer','member','initiate')),
    joined_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    weekly_contribution BIGINT NOT NULL DEFAULT 0,
    total_contribution   BIGINT NOT NULL DEFAULT 0,
    last_active_at  TIMESTAMP,
    PRIMARY KEY (guild_uuid, avatar_uuid)
);

CREATE INDEX idx_guild_members_avatar ON T_GUILD_MEMBERS(avatar_uuid);
```

## 2. Indexation et Optimisation

- **Index** sur `leader_avatar_uuid` : recherche rapide du fondateur (gestion GM `!sys_guild_info`).
- **Index** sur `race_allegiance` : guildes mono-raciales (bonus territoriaux).
- **Index** sur `T_GUILD_MEMBERS(avatar_uuid)` : quelles guildes un joueur a-t-il fréquentées (anti-sabotage).

## 3. Triggers / Procédures Stockées

| # | Contrat | Comportement |
|---|---|---|
| G1 | **Trésorerie** | `treasury_yrds` ≥ 0 ; les retraits GM `!sys_guild_treasury` sont loggés dans `T_WHATSAPP_LOGS` |
| G2 | **Taxe** | `tax_rate` appliqué automatiquement sur tout gain Yrd des membres en zone alliée (défausse vers treasury, plafonné à 20%) |
| G3 | **QG** | `qg_level` = 0 ⇒ pas de QG ; les paliers 1-5 suivent les coûts du balance sheet (`economy_balance_sheet.md` §Guildes). L'entretien hebdomadaire est prélevé chaque lundi ; solde insuffisant ⇒ `maintenance_overdue = TRUE`, bonus QG suspendus |
| G4 | **Démission** | Quitter la guilde : `rank` historique conservé, les biens du coffre restent ; un `leader` doit transférer avant de partir |
| G5 | **Rejoindre (D-SOC-14)** | Deux voies : **invitation** (`!guild_invite` par un officier ⇒ `!guild_accept` du candidat) **ou candidature** (`!guild_apply` ⇒ `!guild_approve` d'un officier). INSERT dans `T_GUILD_MEMBERS` (`rank='initiate'`), `member_count + 1` (plafond 100), `T_AVATARS.guild_uuid` mis à jour. Un joueur n'est membre que d'**une** guilde à la fois |

## 4. Équivalents Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Créer / quitter / dissoudre | `!guild_create [Nom]`, `!guild_leave`, `!guild_disband` | `!sys_guild_info`, `!sys_guild_treasury` | `SYS_GUILD_CREATE`, `SYS_GUILD_DISBAND` |
| **Rejoindre** (invitation / candidature) | `!guild_invite [Num]`, `!guild_accept` · `!guild_apply [Nom]`, `!guild_approve [Num]`, `!guild_kick [Num]` | `!sys_guild_add [Avatar] [Guild]` | `SYS_GUILD_INVITE`, `SYS_GUILD_JOIN` |
| Coffre | `!guild_deposit [Montant]`, `!guild_withdraw [Montant]` | — | `SYS_GUILD_TRANSFER` |
| Taxe | `!guild_tax [%]` (leader only) | — | `SYS_GUILD_SET_TAX` |
| QG | `!guild_upgrade` | — | `SYS_GUILD_UPGRADE` |

## 5. Guildes de métier (lore, hors `T_GUILDS`) — peuplement backlog résolu

Factions statiques référencées par `T_JOBS_DICT.employer_ref` quand `employer_type='guild'`. Aucun `guild_uuid` : identifiant textuel stable, pas de trésorerie/QG/membership joueur — ce sont des employeurs de lore, pas des guildes jouables.

| ID lore | Nom | Ancrage | Rôle | Emplois |
|---|---|---|---|---|
| `GUILDE_LEP_FORGES` | Guilde des Forges de Brokkheim | Brokkheim (`ZONE_LEP_CAP_001`) | Corporation leprechaun du travail des métaux précieux ; exporte lingots de mithril/orichalque vers les autres capitales sous escorte | `JOB_LOG_012` |
| `GUILDE_SPR_TRESORS` | Guilde des Chercheurs de Trésors de Penwether | Penwether (`ZONE_SPR_CAP_001`) | Corporation spriggan des fouilleurs de ruines ; achemine ses trouvailles sous illusion pour déjouer les pilleurs | `JOB_LOG_013` |
| `GUILDE_CARAVANIERS` | Guilde des Caravaniers d'Alfheim | Neutre / inter-cités (aucune capitale d'attache) | Corporation de transporteurs opérant sur l'ensemble des routes terrestres et aériennes ; archétype seed sans zone fixe | `JOB_LOG_002` |

Ce registre clôt les trois `[BESOIN_GUILD]` relevés dans `_index_emplois.md` (étape 43) : les emplois `guild` référencent désormais un ID lore stable au lieu d'un `guild_uuid` en attente.
