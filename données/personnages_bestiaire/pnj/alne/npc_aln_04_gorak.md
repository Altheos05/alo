# 🌳 Gorak le Roc, Mercenaire Indépendant — `NPC_ALN_04`

> Notable canon refiché au gabarit D17 — nom/race/rôle/stats préservés.

## 1. Identification Cardinal

| Champ | Valeur |
|---|---|
| **NPC_ID** | `NPC_ALN_04` |
| **Nom affiché** | Gorak le Roc |
| **Race** | Gnome |
| **Rôle** (`T_NPC.role_type`) | `QUEST_GIVER` (mercenaire tank recrutable) |
| **Zone** | `ZONE_NEU_CAP_001` — Alne, Taverne du Sous-Sol |
| **Niveau / HP / MP** | 70 / 35 000 / 1 500 (STR 750 · VIT 999 · AGI 100 · INT 100 · DEX 200) |
| **`qi_budget` / `is_essential`** | 10 / FAUX |

## 2. Bio & Personnalité (matériau LLM)

- **Bio** : montagne de muscle gnome qui loue son aggro aux petites parties trop faibles pour tenir le Dôme. 500 Yrds de l'heure, contrat clair, une seule règle : on paie à la fin du chrono. Sinon, dès que le groupe quitte la zone neutre, le Roc se retourne. Ce n'est pas de la cupidité — c'est la seule loi qu'il lui reste depuis qu'il a compris qu'un mercenaire sans parole n'est qu'un monstre payé. Il tient sa parole avec une rigidité de pierre parce que c'est tout ce qui le distingue des mobs qu'il tue.
- **Traits** : taciturne, d'une fiabilité minérale, terrifiant quand une clause est rompue.
- **Voix** : phrases courtes, comptables (« Une heure. Cinq cents. On avait dit. »).
- **Relations** : Courtière Della `NPC_ALN_76` (qui gère ses contrats et prend sa commission) ; Tenancier Krebs `NPC_ALN_48` (chez qui il attend les clients, à la même table depuis des mois) ; Commandeure Silène `NPC_ALN_09` (le surveille — un tank qui se retourne aux portes de la ville neutre est un risque calculé).

## 3. Quantité Informationnelle (budget 10)

| # | QI_ID | Niv | Sujet (`topic_tags`) | Contenu / Ligne | Condition |
|---|---|---|---|---|---|
| 1 | `QI_ALN_04_01` | K0 | services, tarif | Location : 500 Yrds/heure, tank/aggro, paiement à la fin du chrono | — |
| 2 | `QI_ALN_04_02` | K0 | regle, contrat | LA règle : payer à l'heure dite. Sinon, hors zone neutre, il se retourne | — |
| 3 | `QI_ALN_04_03` | K0 | dome, escorte | Il escorte les groupes faibles jusqu'aux premiers étages du Dôme `ZONE_YGG_DUN_001` | — |
| 4 | `QI_ALN_04_04` | K1 | tank, technique | Conseils d'aggro et de positionnement (débloque un micro-bonus de menace) | `AFF>=60` |
| 5 | `QI_ALN_04_05` | K1 | della, contrats | Passer par Della `NPC_ALN_76` pour un contrat « propre » (assurance, clauses) | — |
| 6 | `QI_ALN_04_06` | K1 | clients, avis | Les groupes à éviter : ceux qui « oublient » de payer (il tient une liste mentale) | `AFF>=70` |
| 7 | `QI_ALN_04_07` | K2 | trahison, passe | Une fois, il a laissé mourir un groupe qui l'avait floué — il vérifie encore s'il a eu raison | `AFF>=85` |
| 8 | `QI_ALN_04_08` | K2 | granzam, exil | Pourquoi il a quitté Granzam (lien réservé Gnome) — une dette qu'il ne pouvait pas tank | `+QUEST:QST_NEU_MERC_01` |
| 9 | `QI_ALN_04_09` | K3 | meurtre, parole | Il a un jour tué un employeur QUI avait payé, par erreur de chrono — depuis, sa rigidité sur les règles est de l'expiation, pas de la cupidité | JAMAIS — déflection : *(il pose ses deux poings sur la table, lentement)* « On avait dit une heure. J'ai compté juste. J'ai TOUJOURS compté juste. Suivant. » |
| 10 | `QI_ALN_04_10` | KX | *(hors sujet)* | « Pas payé pour causer. Payé pour tenir. Tu embauches ou pas ? » | — |

## 4. Chaînage économique & quêtes

- **Sujet de service `mercenaire`** (D84, `npc_knowledge_protocol.md` §2-bis) : `!demander gorak mercenaire` — tank temporaire (500 Yrds/h), soutient les petits groupes vers le Dôme, canal de dépense pour joueurs solos/duos.
- Mécanique **Risk/Reward** signature : contrat non honoré → flag `MERC_BETRAYED` → Gorak devient hostile hors zone neutre (le seul cas où un notable d'Alne attaque). Donneur de `QST_NEU_MERC_01` via Della 76.

## 5. Intégration Bot

- **Accueil** (`!parler gorak`) : *« Cinq cents l'heure. Payé à la fin. Casse pas la règle. Tu veux un mur ou pas ? »*
- `!demander gorak mercenaire <heures>` (sujet de service, K0) : pose un contrat (débit à échéance). Non-paiement → `MERC_BETRAYED` actif à la sortie de `ZONE_NEU_CAP_001`. Équivalent GM `!sys_spawn_merc` ; IA `SYS_SPAWN_ESCORT`.
- Hors zone neutre uniquement : peut passer hostile (anti-PK d'Alne le protège en ville).
