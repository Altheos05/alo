# Table : T_STATUS_EFFECTS (Actifs sur les Avatars)

```sql
CREATE TABLE T_STATUS_EFFECTS_DICT (
    effect_id       VARCHAR(30) PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('buff','debuff','neutral')),
    stat_modified   VARCHAR(20),
    modifier_value  FLOAT NOT NULL,
    modifier_type   VARCHAR(15) NOT NULL CHECK (modifier_type IN ('flat','percent','multiplier')),
    duration_sec    INT,
    tick_damage     INT DEFAULT 0,
    tick_interval   INT DEFAULT 0,
    is_dispellable  BOOLEAN DEFAULT TRUE,
    max_stacks      INT DEFAULT 1,
    icon_emoji      VARCHAR(10)
);

CREATE TABLE T_ACTIVE_EFFECTS (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type     VARCHAR(10) NOT NULL CHECK (target_type IN ('avatar','monster')),
    target_id       UUID NOT NULL,
    effect_id       VARCHAR(30) REFERENCES T_STATUS_EFFECTS_DICT(effect_id),
    source_id       UUID,
    stacks          INT DEFAULT 1,
    applied_at      TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP NOT NULL
);

CREATE INDEX idx_active_effects_target ON T_ACTIVE_EFFECTS(target_id);
```

## Amendement D90 (étape 60) — effets actifs persistants hors combat

**Constat** : la table existe au schéma et `handlers/combat.js` (`persistActiveEffects`) y **écrit** les effets restants en fin de combat, mais **rien ne les relit** — un buff n'existe qu'à l'intérieur d'une session de combat, et aucun effet ne peut être posé hors combat (`USE_SKILL` n'est câblé qu'en combat). Anomalie relevée au passage : pour une cible `monster`, le code écrit `monster_id` (un `VARCHAR` `MOB_*`) dans `target_id UUID` — l'écriture échoue et n'est journalisée qu'en avertissement.

**Colonnes ajoutées** :

```sql
ALTER TABLE T_ACTIVE_EFFECTS
    ADD COLUMN source_kind VARCHAR(6) CHECK (source_kind IN ('skill','food','system')),
    ADD COLUMN source_ref  VARCHAR(30);   -- MAG_* / CSM_NOU_* / NULL ; source_id reste l'UUID du lanceur
CREATE INDEX idx_active_effects_expiry ON T_ACTIVE_EFFECTS(target_type, target_id, expires_at);
```

| # | Contrat | Comportement |
|---|---|---|
| E1 | **Durée indépendante du combat** | Un effet vit jusqu'à `expires_at`, combat ou pas : lu au début de chaque combat (chargé dans la session), réécrit à la fin ; posé hors combat par un sort ou un plat |
| E2 | **Expiration paresseuse** | Une ligne `expires_at <= NOW()` est ignorée par toute lecture, puis purgée par maintenance. **Aucun planificateur requis** |
| E3 | **Négatifs non mortels hors combat** | Les effets `type = 'debuff'` persistent jusqu'à échéance (malus de stats compris), mais leurs dégâts périodiques, appliqués paresseusement hors combat, **ne descendent jamais sous 1 PV**. En combat, règles de combat inchangées |
| E4 | **Ciblage hors combat** | Sorts T1-T2 : cible unique — soi par défaut ou un allié désigné par son numéro, **dans la même zone**. Sorts T3+ (zone d'effet, règle des fiches I-4) : tous les membres du groupe (`T_PARTY_MEMBERS`) du lanceur **présents dans la même zone** |
| E5 | **Sorts admissibles hors combat** | Seuls les sorts **sans dégâts directs** (soutien, soin, buffs). `MAG_GUE_006` Revive hors combat ressuscite un allié mort de la même zone. Les sorts offensifs restent réservés au combat |
| E6 | **Plats** | Un repas cuisiné (`!cook`) pose son buff ici (`source_kind = 'food'`), avec la durée de la recette |

Équivalents : Joueur `!cast [sort] [Num?]` (hors combat, D90), `!effets` ; GM `!sys_effect_apply [Avatar] [Effect_ID] [Durée]`, `!sys_effect_clear [Avatar]` ; IA `SYS_BLESS_PLAYER` / `SYS_DEBUFF_PLAYER` *(existants, désormais persistés ici)*, `SYS_CLEAR_EFFECTS(Avatar_ID)`.

## Amendement D96 (étape 64) — nouvelles familles d'effets

- `stat_modified` accepte `res_feu`, `res_ombre`, `res_all` (résistance élémentaire, % de réduction des dégâts), `charisma` (discussion, usage unique) et `mp_regen` (% des PM max par minute).
- `T_ACTIVE_EFFECTS.last_tick_at TIMESTAMP` : horodatage de la dernière résolution paresseuse d'un effet périodique hors combat (régénération PM) ; `NULL` = `applied_at`.
- Détail : `system_mechanics/effets_consommables.md`.

