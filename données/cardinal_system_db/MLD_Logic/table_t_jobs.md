# Table MLD : T_JOBS_DICT (+ T_AVATAR_JOB)

> Emploi du joueur (« avoir un travail — aubergiste, etc. », PE). Un métier = **revenu récurrent** + **réputation de faction** + déblocages de service. Nouveau domaine (D-SOC-11). Distinct des **métiers de récolte/artisanat** (pêche, cuisine, forge — cf. `gathering_cooking_system.md`), qui sont des *skills*, pas des *emplois salariés*.

## 1. Structure SQL

```sql
CREATE TABLE T_JOBS_DICT (
    job_id              VARCHAR(50) PRIMARY KEY,     -- JOB_<CAT>_<NNN>
    title               VARCHAR(60) NOT NULL,        -- « Aubergiste », « Garde de nuit », « Coursier »…
    job_category        VARCHAR(16) NOT NULL
                            CHECK (job_category IN ('hospitality','crafting','guard','logistics','commerce','service')),
    employer_type       VARCHAR(10) NOT NULL
                            CHECK (employer_type IN ('npc','property','guild','city')),
    employer_ref        VARCHAR(50),                 -- NPC_ID / property_uuid / ID guilde de métier (lore, PAS un guild_uuid T_GUILDS) / zone_id selon employer_type
    zone_id             VARCHAR(50) REFERENCES T_ZONES(zone_id),
    required_level      INT NOT NULL DEFAULT 1,
    wage_yrds_shift     INT NOT NULL DEFAULT 0,       -- salaire par service accompli
    shift_cooldown_h    INT NOT NULL DEFAULT 8,       -- délai entre deux services
    rep_faction         VARCHAR(20),                 -- faction dont la réputation monte (race/ville/guilde)
    description         TEXT
);

CREATE INDEX idx_jobs_zone     ON T_JOBS_DICT(zone_id);
CREATE INDEX idx_jobs_category ON T_JOBS_DICT(job_category);

CREATE TABLE T_AVATAR_JOB (
    avatar_uuid         UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    job_id              VARCHAR(50) NOT NULL REFERENCES T_JOBS_DICT(job_id),
    hired_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    shifts_done         INT NOT NULL DEFAULT 0,
    wage_accrued        BIGINT NOT NULL DEFAULT 0,    -- salaire cumulé non encore réclamé
    job_rank            VARCHAR(12) NOT NULL DEFAULT 'apprentice'
                            CHECK (job_rank IN ('apprentice','journeyman','master')),
    last_shift_at       TIMESTAMP,

    PRIMARY KEY (avatar_uuid)     -- un seul emploi actif à la fois (D-SOC-12)
);
```

## 2. Dictionnaire d'archétypes (seed structurel — dictionnaire complet délégué)

> **Dictionnaire complet livré (lot SOC-1, étape 43)** : **66 emplois** (11 par catégorie × 6 catégories, ≥ 5 par capitale × 11 villes, ancrage racial), numérotés `_003`→`_013` par catégorie à la suite des seed ci-dessous (aucune collision). Source de vérité des fiches : `données/game_design/emplois/` + `_index_emplois.md`. Les 12 lignes ci-dessous restent les **archétypes de référence**. `[BESOIN_*]` du lot — **résolus** (session de reprise post-étape 52) : les 2 aubergistes Brokkheim/Penwether sont entérinés `npc`/`city` (dortoir de la Forge-Mère, maison d'hôtes municipale — choix thématique définitif, pas un pis-aller) ; les 3 employeurs `employer_type='guild'` (`JOB_LOG_002/012/013`) référencent désormais un ID de **guilde de métier** stable (`table_t_guilds.md` §5) — jamais un `guild_uuid` de `T_GUILDS`, réservée aux guildes de joueurs (précision de portée ajoutée en tête de `table_t_guilds.md`).


| `job_id` | Titre | Catégorie | Employeur | Niv. min | Salaire/service | Réputation |
|---|---|---|---|---|---|---|
| `JOB_HOS_001` | Aubergiste | hospitality | `npc` (auberge PNJ)¹ | 10 | 400 | ville |
| `JOB_HOS_002` | Serveur de taverne | hospitality | npc | 3 | 180 | ville |
| `JOB_GRD_001` | Garde de nuit | guard | city | 12 | 500 | race |
| `JOB_GRD_002` | Sentinelle de porte | guard | city | 8 | 350 | ville |
| `JOB_LOG_001` | Coursier | logistics | npc | 5 | 250 | ville |
| `JOB_LOG_002` | Caravanier | logistics | guild | 15 | 600 | guilde |
| `JOB_CRA_001` | Apprenti forgeron | crafting | npc | 8 | 300 | ville |
| `JOB_CRA_002` | Aide-alchimiste | crafting | npc | 8 | 300 | ville |
| `JOB_COM_001` | Commis de boutique | commerce | npc | 4 | 200 | ville |
| `JOB_COM_002` | Crieur de marché | commerce | city | 3 | 150 | ville |
| `JOB_SRV_001` | Palefrenier | service | npc | 2 | 120 | ville |
| `JOB_SRV_002` | Ménestrel de rue | service | city | 5 | 220 | race |

> ¹ **Aubergiste** (`JOB_HOS_001`) — étape 43 : exercé au service d'un **aubergiste PNJ** (`employer_type='npc'`). La variante « joueur propriétaire d'auberge qui **loue** des `inn_room` et perçoit les loyers » (pont `T_JOBS` ↔ `T_PROPERTIES` ↔ économie) est **reportée au backlog** (décision PE, `[BESOIN_ENTITE]` auberge exploitable).

## 3. Triggers / Procédures Stockées

| # | Contrat | Comportement |
|---|---|---|
| J1 | **Emploi unique** | PK `avatar_uuid` ⇒ un seul emploi actif ; `!apply_job` sur un joueur déjà employé exige `!quit_job` d'abord |
| J2 | **Service** | `!work` : refusé si `NOW() < last_shift_at + shift_cooldown_h` ; sinon mini-jeu textuel selon `job_category`, puis `shifts_done + 1`, `wage_accrued += wage_yrds_shift × mult(job_rank)`, gain de réputation `rep_faction`, `last_shift_at = NOW()` |
| J3 | **Barrière de niveau** | Embauche refusée si `T_AVATARS.level < required_level` |
| J4 | **Promotion** | `shifts_done` ≥ 50 ⇒ `journeyman` (×1.5) ; ≥ 200 ⇒ `master` (×2.0) — appliqué au salaire |
| J5 | **Paie** | `!payslip` transfère `wage_accrued` → `T_AVATARS.yrd_balance` (remise à 0) ; loggé dans `T_WHATSAPP_LOGS` |

## 4. Équivalents Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Voir les offres | `!jobs` | — | — |
| Postuler / démissionner | `!apply_job [JOB_ID]`, `!quit_job` | `!sys_assign_job [Avatar] [JOB_ID]`, `!sys_fire [Avatar]` | `SYS_ASSIGN_JOB`, `SYS_FIRE` |
| Accomplir un service | `!work` | — | `SYS_JOB_EVENT(Zone_ID, Type)` *(rush, incident)* |
| Toucher la paie | `!payslip` | — | `SYS_PAY_WAGE(Avatar_ID)` |

> **Règle de complétude** : `!jobs`, `!apply_job`, `!quit_job`, `!work`, `!payslip`, `!sys_assign_job`, `!sys_fire`, `SYS_ASSIGN_JOB`, `SYS_FIRE`, `SYS_PAY_WAGE`, `SYS_JOB_EVENT` à propager (nouvelle §23 WhatsApp / §10 orchestrateur). Fait à la clôture de l'étape 43.
