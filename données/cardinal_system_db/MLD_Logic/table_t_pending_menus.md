# Table MLD : T_PENDING_MENUS

> Support technique du **menu contextuel numéroté** (D83, `system_mechanics/menu_contextuel_protocol.md`) — état éphémère, jamais un objet de lore. Une ligne = le dernier menu affiché à un avatar, en attente de résolution par chiffre.

## 1. Structure SQL

```sql
CREATE TABLE T_PENDING_MENUS (
    avatar_uuid    UUID PRIMARY KEY REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    context_type   VARCHAR(20) NOT NULL
                       CHECK (context_type IN ('COMBAT','DIALOGUE','SHOP','MOVEMENT','QUEST_BOARD')),
    context_ref    VARCHAR(50),
    options        JSONB NOT NULL,
    wa_message_id  VARCHAR(100) NOT NULL,
    shown_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at     TIMESTAMP NOT NULL
);

CREATE INDEX idx_pending_menus_expiry ON T_PENDING_MENUS(expires_at);
```

## 2. Indexation et Optimisation

- **Clé primaire** `avatar_uuid` : un seul menu actif par avatar (UPSERT à chaque nouvel affichage, jamais d'empilement).
- **Index** `expires_at` : purge périodique des lignes expirées (job de maintenance, pas de logique de jeu qui en dépend — une ligne expirée est simplement ignorée par l'algorithme de résolution avant d'être nettoyée).

## 3. Triggers / Procédures Stockées

| # | Contrat | Comportement |
|---|---|---|
| M1 | **Remplacement, jamais empilement** | `INSERT ... ON CONFLICT (avatar_uuid) DO UPDATE` — un nouveau menu écrase toujours l'ancien pour cet avatar |
| M2 | **Consommation à usage unique** | Une résolution réussie (digit ≠ 9) supprime la ligne — un menu déjà répondu ne peut pas l'être une seconde fois |
| M3 | **L'aide ne consomme pas** | digit = 9 (aide contextuelle) laisse la ligne intacte, ne touche pas `expires_at` |
| M4 | **Pas de prolongation par relecture** | `!menu` régénère `wa_message_id` mais ne recalcule pas `expires_at` |

## 4. Équivalents Commandes

Voir `system_mechanics/menu_contextuel_protocol.md` §4 — `!menu` (joueur), `!sys_menu_force` (GM), `SYS_MENU_RENDER` (IA, primitive de lecture hors contrat `SYS_*` de mutation D-DET-2).
