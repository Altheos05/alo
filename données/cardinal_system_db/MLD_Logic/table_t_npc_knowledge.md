# Table MLD : T_NPC_KNOWLEDGE + T_NPC_KNOWLEDGE_UNLOCKS

> Stocke l'enveloppe informationnelle de chaque PNJ (protocole QI, D17-D18) et, depuis D84 (étape 55), les **sujets de service** (`system_mechanics/npc_knowledge_protocol.md` §2-bis).

## 1. Structure SQL

```sql
CREATE TABLE T_NPC_KNOWLEDGE (
    qi_id               VARCHAR(50) PRIMARY KEY,
    npc_id              VARCHAR(50) NOT NULL REFERENCES T_NPC(npc_id),
    k_level             VARCHAR(2) NOT NULL CHECK (k_level IN ('K0','K1','K2','K3','KX')),
    topic_tags          TEXT[] NOT NULL,
    content             TEXT NOT NULL,
    unlock_condition    TEXT,
    deflection_line     TEXT,
    is_service          BOOLEAN NOT NULL DEFAULT FALSE,   -- D84 : sujet de service (K0/K1 uniquement, cf. CHECK ci-dessous)
    service_sys_command VARCHAR(50),                      -- primitive SYS_* déclenchée après révélation (ex. SYS_APPLY_HEAL)
    service_cost_yrds   INT,                               -- coût à chaque invocation, nullable (service gratuit)
    CHECK (NOT is_service OR k_level IN ('K0','K1')),      -- un service ne se débloque pas (K2/K3 interdits), il se rend
    CHECK (NOT is_service OR service_sys_command IS NOT NULL)
);

CREATE INDEX idx_npc_knowledge_npc ON T_NPC_KNOWLEDGE(npc_id, k_level);
CREATE INDEX idx_npc_knowledge_tags ON T_NPC_KNOWLEDGE USING GIN(topic_tags);

CREATE TABLE T_NPC_KNOWLEDGE_UNLOCKS (
    avatar_uuid         UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    qi_id               VARCHAR(50) NOT NULL REFERENCES T_NPC_KNOWLEDGE(qi_id),
    unlocked_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (avatar_uuid, qi_id)
);

CREATE INDEX idx_npc_unlocks_avatar ON T_NPC_KNOWLEDGE_UNLOCKS(avatar_uuid);
```

## 2. Indexation et Optimisation

- **Index** `(npc_id, k_level)` : chargement de l'enveloppe à chaque `!parler` / `!demander`.
- **Index GIN** `topic_tags` : matching sujet → slots en une requête.
- **Index** `avatar_uuid` : résolution du scope personnel avant injection LLM.

## 3. Triggers / Procédures Stockées

| # | Contrat | Comportement |
|---|---|---|
| K1 | **Budget dur (D17)** | Un `npc_id` possède au plus 12 slots, dont exactement un KX. INSERT au-delà rejeté |
| K2 | **K3 défléchi** | INSERT d'un slot K3 sans `deflection_line` rejeté |
| K3 | **Pare-feu (D18/I1)** | Vue d'injection : K0 + K1 + (K2 ∩ unlocks) uniquement. Les couches de génération n'ont pas accès en lecture aux `content` K3 |
| K4 | **Paiement atomique** | Déblocage `PAY:<N>` : débit `T_AVATARS.yrds` et INSERT unlock dans la même transaction |
| K5 | **Sujet de service (D84)** | Résolution K0/K1 d'un slot `is_service=TRUE` → révélation **puis** invocation `service_sys_command` via le contrat `SYS_*` standard en 6 étapes (D-DET-2), débit `service_cost_yrds` inclus dans cette exécution — jamais dans la résolution QI elle-même |

## 4. Équivalents Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Dialogue | `!parler`, `!demander` | — | `SYS_NPC_DIALOGUE` |
| Audit | — | `!sys_npc_info [NPC_ID]` | `SYS_NPC_KNOWLEDGE_CHECK` |
| Déblocage | — | `!sys_npc_unlock` | `SYS_NPC_KNOWLEDGE_UNLOCK` |
