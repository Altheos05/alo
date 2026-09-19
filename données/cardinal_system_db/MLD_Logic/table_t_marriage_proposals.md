# Table MLD : T_MARRIAGE_PROPOSALS

> État intermédiaire du flux de mariage (D85) : une demande envoyée par `!propose`, en attente de `!accept_proposal` / `!decline_proposal` / `!cancel_proposal`. `T_MARRIAGES` ne connaît que `active`/`divorced` — sans cette table, une demande n'existerait qu'en mémoire et disparaîtrait au premier redémarrage du bot. État éphémère, jamais un objet de lore (même statut que `T_PENDING_MENUS`).

## 1. Structure SQL

```sql
CREATE TABLE T_MARRIAGE_PROPOSALS (
    proposal_uuid    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposer_uuid    UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    target_uuid      UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    proposed_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at       TIMESTAMP NOT NULL,              -- proposed_at + 48 h (paramètre de configuration)
    CHECK (proposer_uuid <> target_uuid)
);

-- Une seule demande SORTANTE par demandeur (D85)
CREATE UNIQUE INDEX idx_proposal_proposer ON T_MARRIAGE_PROPOSALS(proposer_uuid);
-- Plusieurs demandes ENTRANTES possibles par cible
CREATE INDEX idx_proposal_target ON T_MARRIAGE_PROPOSALS(target_uuid, expires_at);
```

## 2. Indexation et Optimisation

- **Index unique** `idx_proposal_proposer` : garantit par le schéma la règle « une demande sortante max » — un second `!propose` échoue tant que la première n'a pas expiré, été refusée, retirée ou acceptée.
- **Index** `idx_proposal_target` : liste des demandes entrantes non expirées d'une cible (`!accept_proposal` sans argument, ou liste si plusieurs).
- Expiration **paresseuse** : une ligne avec `expires_at <= NOW()` est ignorée par toutes les lectures, puis purgée (maintenance) ; aucune logique de jeu n'attend sa suppression physique.

## 3. Triggers / Procédures Stockées

| # | Contrat | Comportement |
|---|---|---|
| P1 | **Contrôles à la demande** | `!propose [Num]` : vérification rapide pour échouer tôt — genres complémentaires (M1), aucun des deux marié (M2), demandeur Niv ≥ 15 et porteur d'un `MSC_ENG_001`, cooldown de divorce de 30 j écoulé pour les deux. **Aucune exigence de lieu** : la demande se fait à distance (la cible est désignée par son numéro). Émet une notification privée à la cible (D91) |
| P2 | **Acceptation en personne** | `!accept_proposal [Num?]` : dans **une seule transaction**, verrouille les deux `T_AVATARS` et revérifie **tout** M1-M3 (l'état a pu changer depuis la demande), exige que les deux fiancés soient dans la **même zone** (`current_zone_id` égaux) et **hors combat** ; puis crée `T_MARRIAGES` (`ceremony_zone_id` = zone commune), consomme les deux anneaux, crée le coffre conjugal (M4), tire le cadeau (M6), supprime la demande — et supprime toutes les autres demandes entrantes/sortantes des deux conjoints |
| P3 | **Ambiguïté** | Sans argument, `!accept_proposal` accepte la demande entrante unique ; s'il y en a plusieurs, le bot les liste et exige `!accept_proposal [Num]` |
| P4 | **Refus / retrait** | `!decline_proposal [Num]` (cible) et `!cancel_proposal` (demandeur) suppriment la ligne ; le demandeur est notifié d'un refus (D91) |
| P5 | **Échec d'acceptation** | Un prérequis manquant à l'acceptation (anneau vendu, zone différente, combat) **ne supprime pas** la demande : elle reste valable jusqu'à `expires_at` — le rendez-vous peut être retenté |

## 4. Équivalents Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Demander | `!propose [Num_WhatsApp]` | `!sys_marry [Avatar_A] [Avatar_B]` *(court-circuite le flux)* | — |
| Accepter | `!accept_proposal [Num?]` | — | `SYS_GENERATE_CEREMONY`, `SYS_GENERATE_WEDDING_GIFT` |
| Refuser / retirer | `!decline_proposal [Num]`, `!cancel_proposal` | `!sys_proposal_cancel [Avatar]` | `SYS_CANCEL_PROPOSAL(Avatar_ID)` |
