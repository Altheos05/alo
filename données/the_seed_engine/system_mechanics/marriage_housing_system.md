# Systèmes Sociaux — Mariage, Housing, Emploi & Mémoire relationnelle PNJ

> **v2.1 (étape 60, 2026-09-19)** — ajout du flux de demande (§1.4, D85) et du genre à l'inscription (D86) ; foyer requalifié en condition d'entrée.
>
> **v2.0 (étape 43, 2026-07-10)** — Spécification alignée sur la directive PE. Supersede la v1.0 (prose SAO générique : deux joueurs quelconques, sans genre, sans provenance de séparation, sans prérequis de foyer). **Source de vérité = les tables MLD** citées ci-dessous ; ce document est la spécification de comportement, pas le modèle de données.

Tables adossées : `T_NPC_RELATIONS`, `T_PROPERTIES`, `T_MARRIAGES` (+ `T_MARRIAGE_ASSETS`), `T_JOBS_DICT` (+ `T_AVATAR_JOB`), `T_BANK_VAULTS` (`owner_type='marriage'`), `T_GUILDS` (rejoindre).

---

## 0. Mémoire relationnelle joueur ↔ PNJ (réponse à la question PE)

**« Comment le programme sait qu'un joueur a discuté N fois avec un PNJ, et quelles infos il possède ? »**

- **Combien de fois / affinité / sujets abordés** → `T_NPC_RELATIONS`, une **arête creuse créée à la 1ʳᵉ interaction** (jamais matérialisée à l'inscription : 10 000 joueurs × 1 100 PNJ = 11 M de lignes mortes — écarté au filtre du Développeur, D-SOC-1). Chaque `!parler` incrémente `interaction_count`.
- **Quelles infos débloquées** → `T_NPC_KNOWLEDGE_UNLOCKS` (table existante) : l'enveloppe QI cochée par avatar. Le pare-feu K3 reste propriété de `T_NPC_KNOWLEDGE` (D18).
- **Side-quests conditionnées au haut niveau d'info** → `T_QUESTS_DICT.prerequisites` interroge les deux tables (`min_affinity_tier`, `qi_unlocked`, `topic_flag`) : une quête secrète n'apparaît au `!quest_board` du PNJ que si le joueur a assez discuté / assez d'affinité / débloqué la bonne info (D-SOC-3).

L'affinité (−100…+100) se traduit en 5 paliers (`hostile`→`confidant`) qui portent les remises, l'ouverture des quêtes et l'accès aux couches QI conditionnelles.

---

## 1. Mariage (`T_MARRIAGES`)

### 1.1 Règles dures (PE)
- **Homme + femme uniquement** : exactement un `male` + un `female` (le `neutral` ne se marie pas). Trigger M1.
- **Un seul mariage actif** par individu (monogamie stricte, index partiels M2).
- **Prérequis** : les deux Niv ≥ 15, chacun un **Anneau d'Engagement** (`MSC_ENG_001`, item de service, consommé à la cérémonie), et **au moins un foyer** entre les deux (prérequis PE, M3 ↔ `T_PROPERTIES` P5).

### 1.2 Avantages (PE)
| Avantage | Face joueur | Table |
|---|---|---|
| Inventaire commun **doublé** | `!joint_bank` | coffre `owner_type='marriage'`, `max_slots` ×2 |
| Solde commun | `!joint_pay` | `T_BANK_VAULTS.yrds_stored` du couple |
| Statut de l'autre en temps réel (PV/PM…) | `!partner_status` | lecture directe `T_AVATARS` du conjoint |
| Cadeau système aléatoire (selon moyenne de niveau) | (cérémonie) | `SYS_GENERATE_WEDDING_GIFT`, tier ∝ `avg_level_at_wedding` |
| Télépathie / localisation / combo +10 % | `!whisper_partner`, `!partner_locate` | *(conservés v1)* |

### 1.3 Séparation — « chacun repart avec ce qu'il a apporté »
`!divorce` déclenche `SYS_DIVORCE_SETTLE` (transaction atomique) :
- apports **individuels** (`T_MARRIAGE_ASSETS.is_joint_earned = FALSE`) **rendus au contributeur** ;
- biens **communs** (cadeau système, gains non attribués) **partagés 50/50** ;
- le **foyer** reste au propriétaire d'origine ; cooldown **30 j** ; coffre conjugal clos.
- `!divorce` exige une confirmation explicite (menu D83, contexte `CONFIRM`, D92).

### 1.4 Flux de demande (D85, D86 — étape 60)

- **Genre** : choisi à l'inscription (`!link_start [Race] [Nom] [Genre]`), immuable, correction GM seule (D86, `T_AVATARS` A8). Prérequis structurel : sans lui, aucun avatar `female` ne peut exister.
- **Demande à distance** : `!propose [Num]` depuis n'importe quelle zone ; contrôles rapides (genres, célibat, niveau, anneau du demandeur, cooldown) ; la cible reçoit une **notification privée** (D91). La demande est persistée dans `T_MARRIAGE_PROPOSALS`, valable **48 h**.
- **Une demande sortante max** par demandeur (retrait : `!cancel_proposal`) ; **plusieurs demandes entrantes** possibles pour une cible, qui accepte (`!accept_proposal [Num?]`) ou refuse (`!decline_proposal [Num]`).
- **Acceptation en personne** : les deux fiancés doivent être **dans la même zone** et **hors combat**. Tous les prérequis sont revérifiés sous verrou ; la cérémonie a lieu immédiatement, `ceremony_zone_id` = la zone commune (narration `SYS_GENERATE_CEREMONY`). Un échec (zone différente, anneau manquant) laisse la demande valable jusqu'à son échéance.
- **Foyer = condition d'entrée** : vérifié à la cérémonie seulement ; sa perte ultérieure ne dissout pas le mariage (`home_property_uuid` → `NULL`).
- **Coffre conjugal** : Yrds **et objets** dès la v1 (le stockage d'objets des coffres est construit d'abord).
- **Tâches préalables** : genre à l'inscription ; anneau `MSC_ENG_001` réellement en base (0 occurrence dans `seed_data.sql` à l'étape 60 — le générateur ne l'ingère pas) et en vente chez les bijoutiers d'Alne et des capitales raciales ; stockage d'objets des coffres ; notifications (D91) ; confirmation (D92).

---

## 2. Housing (`T_PROPERTIES`) — acheter **ou** louer

### 2.1 Modes & avantages (PE)
- **Louer** (`inn_room`, 1 500 Yrds / 7 j) : loyer récurrent, expulsion sur défaut (grâce 7 j → `SYS_EVICT_TENANT`, biens en `T_MAIL` 30 j).
- **Acheter** (`small_house` 50 k / `manor` 500 k / `estate` 3 M) : permanent, revente 50 %.
- **Avantages** : (1) **stockage domestique massif** (`!home_storage`, +50 à +1 000 slots, armes admises) ; (2) **checkpoint sûr** — `!home_return` (rappel hors combat) + `!rest` (regen 5 %/min, logout sans *Remain Light*) ; (3) **prérequis de mariage**.

### 2.2 Interaction protocole de déplacement (R0)
`!home_return` = déplacement **sanctionné** (comme un cristal de rappel) : écriture L1 `current_zone_id` = zone de la propriété + `sync_player_groups()` vers le groupe territoire correspondant (invariant R0 v2, D76 — `zone_movement_protocol.md` v2.0). Le **groupe WhatsApp privé du logement** (`group_type='housing'`) est un canal social persistant — jamais quitté automatiquement, hors décompte R0 — où se joue la vie domestique (`!rest`, `!home_storage`). Interdit en combat (P4).

---

## 3. Emploi (`T_JOBS_DICT` / `T_AVATAR_JOB`)

- Un **seul emploi actif** à la fois (`!apply_job` / `!quit_job`). Revenu par service (`!work`, cooldown), réputation de faction, promotion apprenti→compagnon→maître (×1→×1.5→×2).
- **Aubergiste** (`JOB_HOS_001`) : à l'étape 43, au service d'un aubergiste **PNJ**. La variante joueur-propriétaire d'auberge (loue des `inn_room`) est en **backlog** (`[BESOIN_ENTITE]`).
- Distinct des skills de récolte/artisanat (`gathering_cooking_system.md`), qui ne sont pas des emplois salariés.

---

## 4. Guildes (`T_GUILDS`) — créer & **rejoindre**
Création/dissolution/coffre/taxe/QG déjà spécifiés. Ajout étape 43 : **rejoindre** par invitation (`!guild_invite` → `!guild_accept`) ou candidature (`!guild_apply` → `!guild_approve`) ; un joueur = une guilde à la fois (G5).

---

## 5. Commandes IA associées
- `SYS_GENERATE_CEREMONY(A1, A2, Zone)` *(existant)* · `SYS_GENERATE_WEDDING_GIFT(Marriage_ID, avg_level)` · `SYS_DIVORCE_SETTLE(Marriage_ID)`
- `SYS_CREATE_HOME_GROUP(Avatar, Type)` *(existant)* · `SYS_DESTROY_HOME(Avatar, Reason)` *(existant)* · `SYS_GRANT_PROPERTY` · `SYS_EVICT_TENANT`
- `SYS_ASSIGN_JOB` · `SYS_FIRE` · `SYS_PAY_WAGE` · `SYS_JOB_EVENT`
- `SYS_NPC_RELATION_TOUCH` · `SYS_SET_AFFINITY` · `SYS_NPC_RELATION_GET`
- `SYS_GUILD_INVITE` · `SYS_GUILD_JOIN`

---

## Annexe — Correspondance v1.0 → v2.0 (ce qui change)
| v1.0 (prose SAO) | v2.0 (PE) |
|---|---|
| Deux joueurs quelconques | **Homme + femme uniquement** |
| (pas de limite explicite) | **Un mariage actif** par personne |
| Divorce = 50 % du coffre, point | **Provenance** : chacun reprend ses apports + 50/50 du commun |
| Maison = achat seul, « double l'inventaire » | **Achat *ou* location** ; stockage domestique massif chiffré ; **prérequis de mariage** |
| — | **Emploi salarié** (aubergiste, garde…), pont vers le housing |
| `!partner_bank` | renommé **`!joint_bank`** (+ `!joint_pay` pour le solde commun) |
