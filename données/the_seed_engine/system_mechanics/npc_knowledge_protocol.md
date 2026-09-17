# 🧾 PROTOCOLE MAÎTRE — Quantité Informationnelle des PNJ (QI) & Rencontres Canoniques

> **Statut** : DOCUMENT MAÎTRE (étape 5, lot 2.0) — décisions **D16 → D19** actées par l'ACP. **D84** (étape 55) ajoutée en §2-bis : les *sujets de service*.
> **Rôle** : définir l'enveloppe finie et auditable de ce qu'un PNJ **sait**, **révèle**, **cache** et **ignore**,
> afin qu'aucune requête joueur non traitée n'atteigne le LLM sans périmètre — un PNJ ne peut JAMAIS
> révéler une information qui n'est pas dans son enveloppe.
> **Tables liées** : `T_NPC` (registre), `T_NPC_KNOWLEDGE` + `T_NPC_KNOWLEDGE_UNLOCKS` (enveloppes),
> `T_NPC_AFFINITY` (seuils K2).

---

## 1. Concept — la Quantité Informationnelle (QI)

Chaque PNJ possède une **enveloppe informationnelle fermée** : une liste finie de *slots de connaissance*
classés par niveau de confidentialité. Le bot (couche `controller`) résout chaque question de joueur
**contre cette enveloppe AVANT tout appel au LLM**. Le LLM ne sert qu'à *mettre en forme* une information
autorisée — jamais à en *inventer* une.

### 1.1 Niveaux de connaissance

| Niveau | Nom | Définition | Comportement du bot |
|---|---|---|---|
| **K0** | Public | Ce que tout habitant sait (directions, horaires, prix publics, rumeurs de place) | Révélé librement, injecté au LLM |
| **K1** | Domaine | Expertise métier du PNJ (recettes connues, dangers de sa zone, clients réguliers) | Révélé librement, injecté au LLM |
| **K2** | Conditionnel | Information verrouillée par une condition (affinité, quête, paiement, titre) | Injecté au LLM **uniquement si débloqué** pour cet avatar (`T_NPC_KNOWLEDGE_UNLOCKS`) |
| **K3** | Secret gardé | Le PNJ **sait mais ne révélera jamais** hors déclencheur scénarisé (flag de quête posé par l'IA/GM) | **Jamais injecté au LLM.** Le bot répond par la **ligne de déflection** scriptée de la fiche |
| **KX** | Ignorance | Tout sujet **hors enveloppe** — le PNJ ne sait pas | Le bot répond par la **ligne d'ignorance** scriptée, **sans appel LLM** |

### 1.2 Budget informationnel standard (D17)

| Profil | Budget | Répartition |
|---|---|---|
| PNJ population (`20-99`) | **10 slots** | 3×K0 + 3×K1 + 2×K2 + 1×K3 (+ déflection) + 1×KX (ligne d'ignorance) |
| Notables & gouvernance (`00-19`) | **12 slots** | 3×K0 + 3×K1 + 3×K2 + 2×K3 + 1×KX |
| Canoniques (trame principale) | **12 slots** | 2×K0 + 2×K1 + 3×K2 + **4×K3** + 1×KX |

Le budget est un **plafond dur** : un PNJ dont l'enveloppe est épuisée sur un sujet bascule sur KX.
C'est ce qui rend le monde crédible — un forgeron ne connaît pas la politique d'Alne.

### 1.3 Grammaire des conditions K2 (colonne `unlock_condition`)

| Syntaxe | Signification | Vérifiée contre |
|---|---|---|
| `AFF>=N` | Affinité du joueur ≥ N | `T_NPC_AFFINITY.affinity` |
| `QUEST:<QST_ID>` | Quête acceptée ou terminée | `T_ACTIVE_QUESTS` |
| `PAY:<N>` | Paiement de N Yrds (débit à la révélation) | `T_AVATARS.yrds` |
| `TITLE:<TITLE_ID>` | Titre porté | `T_TITLES` |
| `RACE:<RACE_ID>` | Réservé aux joueurs de cette race | `T_AVATARS.race_id` |
| `ITEM:<ITEM_ID>` | Objet présenté (non consommé) | `T_INVENTORY` |

Conditions composables avec `+` (ET logique) : `AFF>=70+QUEST:QST_SAL_012`.

---

## 2. Pare-feu informationnel (D18) — pipeline de résolution

Pipeline contractuel de `!parler` / `!demander` (ordre **impératif**, couche `controller`) :

1. **Résolution du sujet** : le bot normalise la question du joueur en *tags de sujet* et la matche
   contre les `topic_tags` de l'enveloppe du PNJ (`T_NPC_KNOWLEDGE`).
2. **Aucun match → KX** : réponse = ligne d'ignorance de la fiche. **Aucun appel LLM.** Fin.
3. **Match K3 → déflection** : réponse = ligne de déflection scriptée. **Aucun appel LLM.**
   Le bot émet un événement `NPC_SECRET_PROBED` vers l'orchestrateur (l'IA peut en faire un hook narratif).
4. **Match K2 verrouillé** : le bot vérifie `unlock_condition`. Non remplie → le PNJ *évoque* l'existence
   de l'information et son prix/condition (formulation générée, mais contenu NON injecté). Remplie →
   enregistrement dans `T_NPC_KNOWLEDGE_UNLOCKS`, puis traitement comme K0/K1.
5. **Match K0/K1/K2 débloqué → génération** : appel `SYS_NPC_DIALOGUE` avec un `knowledge_scope`
   strictement égal aux slots autorisés + la section « Bio & Personnalité » de la fiche.

**Invariant I1** : le prompt LLM ne contient JAMAIS un contenu K3 ni un contenu K2 non débloqué.
**Invariant I2** : une question sans match n'atteint JAMAIS le LLM (économie de tokens + zéro hallucination).
**Invariant I3** : dialogues PNJ↔PNJ (scènes générées par l'IA) : le scope de CHAQUE participant est
l'union de ses K0+K1 uniquement — deux PNJ ne « fuient » pas leurs secrets entre eux.

---

## 2-bis. Sujets de Service (D84) — quand une question déclenche une action

> **Contexte** : diagnostic UX étape 54 — §21 de `whatsapp_commands_list.md` exposait ~30 verbes joueur quasi jetables, un par PNJ de service (`!laundry`, `!sharpen`, `!gazette`, `!fence`…), une interface superficielle qui recopiait 1:1 la liste des PNJ au lieu de la cacher derrière un petit nombre de verbes. **D84** : ces services ne sont pas un système à part — ce sont des sujets `!demander` comme les autres, qui déclenchent en plus une primitive `SYS_*` déjà existante.

### 2-bis.1 Définition

Un **sujet de service** est un slot `T_NPC_KNOWLEDGE` (K0 ou K1, jamais K2/K3 — un service ne se "débloque" pas, il se **rend**) marqué `is_service = TRUE`, avec deux colonnes supplémentaires :

| Colonne | Rôle |
|---|---|
| `service_sys_command` | Primitive `SYS_*` déclenchée après la révélation (ex. `SYS_APPLY_HEAL`, `SYS_SEAL_CONTRACT`) — c'est exactement l'ancien « Équivalent IA » de la commande dédiée qu'il remplace |
| `service_cost_yrds` | Coût à chaque invocation (nullable — certains services sont gratuits, ex. `!routes` consultation) |

### 2-bis.2 Pipeline (étend §2, n'ajoute pas de nouvel appel LLM)

1. Étapes 1-4 du pare-feu (§2) **inchangées** : résolution du sujet, KX/K3/K2 comme avant.
2. **Nouvelle étape 4-bis** : si le slot matché a `is_service = TRUE`, après la ligne de révélation (K0/K1, donc toujours visible — pas de condition à vérifier), le bot **invoque `service_sys_command`** via le contrat `SYS_*` standard en 6 étapes (**D-DET-2**, inchangé : existence → prérequis → autorisation → lock → exécution transactionnelle → résultat). Le débit de `service_cost_yrds` (si non nul) fait partie de cette exécution, pas de la résolution QI.
3. Si le contrat `SYS_*` échoue (Yrds insuffisants, prérequis non rempli…), le bot répond par l'échec **normal** de cette primitive (le même message qu'aurait produit l'ancienne commande dédiée) — la ligne de révélation K0/K1 reste acquise (le PNJ a répondu), seule l'action peut échouer.

**Invariant I4** : un sujet de service n'est **jamais** injecté au LLM pour décider s'il faut l'exécuter — la primitive est fixe, déclarée à l'avance dans la fiche du PNJ, jamais choisie dynamiquement (cohérent D-DET-1).

### 2-bis.3 Ce qui NE devient PAS un sujet de service

- **Paiement pour une information** (l'ancien `!buy_info`/`!buy_silence`) : c'est un K2 avec `unlock_condition = PAY:<N>` **déjà supporté** (§1.3) — aucune extension nécessaire, ce n'était pas un vrai service, juste une info payante.
- **Mécaniques universelles** (réputation raciale, artisanat de gemmes, onboarding) : quand un mécanisme est appelé à exister dans plusieurs villes/PNJ (pas un seul point d'accès), il garde une commande dédiée de premier rang plutôt que de passer par un sujet — un sujet de service n'a de sens que pour un point d'accès **unique** (« un seul adaptateur = un seam hypothétique, deux adaptateurs = un seam réel »).
- **Archétypes déjà répliqués dans plusieurs villes** : découvert en vérifiant chaque candidat avant conversion (étape 55) — près de la moitié des « verbes Alne » du diagnostic initial (`!voyage`, `!raid_register`, `!mount_rent`, `!sharpen`, `!fence`, `!oracle`, `!memorial`, `!laundry`, `!loan`, `!heal`) sont en réalité déjà utilisés tels quels par des PNJ équivalents dans 2 à 5 autres villes (ex. `!oracle` : Voulg, Swilvane, Gattan, Lioda ont chacune un oracle). Ce sont de vrais verbes génériques (deux adaptateurs ou plus = un seam réel), pas des services à point d'accès unique — les convertir en sujet propre à Alne aurait désynchronisé Alne du reste du monde. **Toujours vérifier par un grep multi-villes avant de convertir un verbe en sujet, jamais seulement dans le roster de la ville en cours.**

### 2-bis.4 Découverte : le menu contextuel fait le travail de mémorisation

Le joueur n'a jamais besoin de connaître le mot-clé exact du sujet : `!parler [NPC]` sur un PNJ de service affiche, via le **menu contextuel numéroté** (D83, `menu_contextuel_protocol.md` §3.2), les sujets d'information ET les sujets de service disponibles comme options numérotées — répondre par un chiffre compose et résout `!demander [NPC] [sujet]` automatiquement. Le mot-clé texte (`!demander sud buanderie`) reste disponible pour qui le connaît déjà, exactement comme pour n'importe quel autre sujet QI.

---

## 3. Rencontres canoniques (D19) — les personnages de la trame principale

Les personnages canoniques (Kirito, Asuna, Leafa, Sinon, Yuuki, Klein, Lisbeth, Silica, Argo, Yui,
Alicia Rue, Sakuya, Mortimer*, Eugene*…) sont **difficiles à rencontrer** par conception :

| Règle | Contrat |
|---|---|
| **R-C1** | Un canonique n'apparaît JAMAIS dans `!where` ni dans les registres de PNJ résidents par défaut (`T_NPC.zone_id = NULL` au repos — état « hors monde ») |
| **R-C2** | Seule l'IA (`SYS_SPAWN_CANON`) ou le GM (`!sys_canon_spawn`) peut matérialiser un canonique dans une zone, pour une **fenêtre limitée** (durée en minutes, annoncée ou non) |
| **R-C3** | Chaque canonique a des **conditions d'éligibilité de rencontre** (heure, zone, flag d'événement mondial, titre du joueur) consignées au `_registre_rencontres_canoniques.md` |
| **R-C4** | La QI des canoniques est massivement K3 (4 slots) : ils SAVENT des éléments de la trame principale et ne les révèlent que sur déclencheurs scénarisés d'arc narratif |
| **R-C5** | Un canonique n'est jamais tuable (`is_essential = VRAI`, `SYS_ASSASSINATE_NPC` interdit) |
| **Exception** | *Mortimer et Eugene, Lords Salamander, sont résidents permanents (`NPC_GAT_08/09`) : figures de gouvernance territoriale, pas des apparitions d'arc — mais leur accès est filtré (audience, grade)* |

---

## 4. Équivalents commandes (règle de complétude)

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Parler (dialogue libre dans le scope) | `!parler [NPC_ID\|nom]` | — | `SYS_NPC_DIALOGUE(NPC_ID, Avatar_ID, Topic, Knowledge_Scope)` |
| Interroger sur un sujet précis | `!demander [NPC_ID] [sujet]` | — | *(même pipeline, étape 2 §2)* |
| Consulter une enveloppe QI | — | `!sys_npc_info [NPC_ID]` | `SYS_NPC_KNOWLEDGE_CHECK(NPC_ID)` |
| Débloquer un slot K2/K3 pour un joueur | — | `!sys_npc_unlock [NPC_ID] [QI_ID] [Avatar]` | `SYS_NPC_KNOWLEDGE_UNLOCK(NPC_ID, QI_ID, Avatar_ID)` |
| Matérialiser un canonique | — | `!sys_canon_spawn [NPC_ID] [Zone_ID] [Durée_min]` | `SYS_SPAWN_CANON(NPC_ID, Zone_ID, Duration, Silent?)` |
| Sonde d'un secret (événement) | *(implicite via question K3)* | — | Réception `NPC_SECRET_PROBED(NPC_ID, Avatar_ID, QI_ID)` |
| Sujet de service (D84) | *(aucune nouvelle — `!demander [NPC] [sujet]` ci-dessus)* | *(équivalent GM déjà existant, propre à chaque service — inchangé, cf. `whatsapp_commands_list.md` §21)* | *(équivalent IA déjà existant, propre à chaque service — inchangé, ex. `SYS_APPLY_HEAL`)* |

Commandes propagées dans `whatsapp_commands_list.md` (§ Joueur / § GM) et `ai_orchestrator_commands.md` (§ PNJ).

---

## 5. Chaînage fiches ↔ tables

- 1 PNJ = 1 fiche fandom (`personnages_bestiaire/pnj/<ville>/npc_<ville>_<nn>_<slug>.md`, gabarit D17
  décrit dans `pnj/_index_pnj.md`) = 1 ligne `T_NPC` + 10-12 lignes `T_NPC_KNOWLEDGE`.
- Les `QI_ID` suivent le format `QI_<VILLE>_<NN>_<n>` (ex : `QI_GAT_26_07`), séquentiels dans la fiche.
- La section « Bio & Personnalité » de la fiche est le **seul** matériau de style injecté au LLM
  (voix, traits, relations) — le lore GM (`secret_note` de `T_NPC`) n'est jamais injecté.
