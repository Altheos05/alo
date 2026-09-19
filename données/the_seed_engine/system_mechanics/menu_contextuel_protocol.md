# 🔢 PROTOCOLE MAÎTRE — Menu Contextuel Numéroté

> **Statut** : DOCUMENT MAÎTRE (étape 54) — décision **D83** actée par l'ACP, sur demande PE explicite (diagnostic UX : ~190-200 commandes joueur, interface superficielle par endroits — cf. §21 `whatsapp_commands_list.md`).
> **Rôle** : offrir un raccourci de résolution **100% déterministe** (zéro NLU, zéro LLM) entre l'état de jeu et l'action du joueur, pour qu'un joueur lambda n'ait jamais à *retenir* une commande au moment où il en a besoin — sans jamais retirer la commande texte, qui reste toujours valide en parallèle. Conçu pour rester fonctionnel **en C4 pur** (dégradé, sans IA) : c'est un renforcement du socle déterministe, pas une fonctionnalité IA.
> **Tables liées** : `T_PENDING_MENUS` (nouvelle, ce document), `T_AVATARS`, `T_NPC_KNOWLEDGE` (dialogue), `T_SHOPS`/`T_SHOP_ITEMS` (boutique), `T_ZONE_LINKS` (mouvement).
> **Principe non négociable** : le contenu d'un menu est **toujours calculé par L1** à partir de l'état réel (inventaire, sorts connus, zones adjacentes, stock boutique…). Un LLM peut écrire le texte narratif *au-dessus* du menu ; il ne choisit, ne génère et ne valide **jamais** les options elles-mêmes (cohérent avec D-DET-1 et l'anti-hallucination D-RAG-8 : un LLM qui halluciné une option de menu ferait exécuter une action invalide).

---

## 1. Concept

Après certains messages du bot (tour de combat, ouverture d'un dialogue PNJ, consultation d'une boutique, arrivée en zone, tableau de quêtes…), le bot ajoute un **bloc numéroté** listant les 1 à 8 actions les plus pertinentes à cet instant précis, chacune **déjà résolue** (paramètres inclus — pas de saisie complémentaire à faire) :

```
⚔️ Un Loup Alpha Sylvestre vous attaque !

1. Attaquer
2. Lancer Boule de Feu (MAG_SAL_003)
3. Utiliser Frappe Tournoyante (OSS)
4. Parer
5. Fuir
9. Aide (combat)
```

Le joueur répond par un **chiffre seul**, ou continue à taper une commande texte (`!attaque`, `!fuite`…) exactement comme avant — les deux voies coexistent, aucune n'est retirée. Ceci n'est **pas un remplacement des ~190 commandes** de `whatsapp_commands_list.md` : c'est une couche de présentation qui expose, à chaque instant, le petit sous-ensemble qui compte vraiment.

### 1.1 Deux modes de résolution

| Mode | Déclencheur | Fiabilité | Quand |
|---|---|---|---|
| **Citation (recommandé)** | Le joueur **répond en citant** (swipe/reply WhatsApp natif) le message-menu du bot | Garantie — zéro ambiguïté, fonctionne même après d'autres messages entretemps | Toujours disponible, mis en avant par le bot (« *Répondez à ce message par un chiffre* ») |
| **Chiffre nu (dégradé)** | Le message reçu est **exactement** un chiffre (`^[0-9]$`, rien d'autre) | Valable uniquement si un menu **non expiré** existe pour cet avatar (§2.2) | Confort mobile — évite le geste de citation en combat rapide |

Un message qui contient un chiffre **et** du texte (« *je prends l'option 2* ») n'est **jamais** intercepté ici — il repart dans le pipeline normal (regex `!*` → NLU). Ce protocole ne s'applique qu'aux deux formes strictes ci-dessus.

### 1.2 Convention de chiffres (universelle, tous contextes)

- **1-8** : options contextuelles, triées par pertinence décroissante (jamais plus de 8 — tient sur un clavier téléphone en un coup d'œil).
- **9** : **Aide contextuelle** — déclenche l'équivalent de `!help [Catégorie]` pour le contexte courant. Universel, ne modifie **jamais** l'état (ne consomme pas un tour de combat), et **ne fait pas expirer le menu** (le joueur peut consulter l'aide puis répondre quand même au menu affiché).
- **0** : **Pagination** (« Voir plus ») — apparaît **uniquement** si le nombre d'options valides dépasse 8 (ex. boutique à grand catalogue). Absent sinon — pas de « annuler » universel forcé là où le contexte n'a pas d'action d'annulation réelle.

---

## 2. Résolution technique (état L1)

### 2.1 Table `T_PENDING_MENUS`

```sql
CREATE TABLE T_PENDING_MENUS (
    avatar_uuid    UUID PRIMARY KEY REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    context_type   VARCHAR(20) NOT NULL
                       CHECK (context_type IN ('COMBAT','DIALOGUE','SHOP','MOVEMENT','QUEST_BOARD','FISHING','CONFIRM')),  -- FISHING (D87), CONFIRM (D92) ajoutés étape 60
    context_ref    VARCHAR(50),               -- Combat_ID / NPC_ID / Shop_ID / Zone_ID selon context_type
    options        JSONB NOT NULL,            -- [{"digit":1,"command":"!attaque","label":"Attaquer"}, ...]
    wa_message_id  VARCHAR(100) NOT NULL,     -- ID du message WhatsApp du menu (mode citation)
    shown_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at     TIMESTAMP NOT NULL         -- shown_at + TTL du contexte (table 2.3)
);

CREATE INDEX idx_pending_menus_expiry ON T_PENDING_MENUS(expires_at);
```

**Un seul menu actif par avatar** (`avatar_uuid` = clé primaire) : afficher un nouveau menu **écrase** l'ancien (UPSERT), pas d'empilement. C'est délibéré — un joueur ne doit jamais se demander « à quel menu est-ce que je réponds ».

### 2.2 Algorithme de résolution (priorité dans le pipeline)

À insérer **avant** la classification d'intention (regex `!*` puis NLU/ML — cf. pipeline `README.md`) : c'est la vérification la moins coûteuse et la plus déterministe, elle doit passer en premier.

```
SI message.hasQuotedMsg ET quotedMsg.id == T_PENDING_MENUS[sender].wa_message_id :
    chiffre = extraire_chiffre(message.body)   # regex ^[0-9]$
    SI chiffre trouvé ET chiffre DANS options   → résoudre (§2.4), STOP pipeline
SINON SI message.body correspond exactement à ^[0-9]$ :
    menu = T_PENDING_MENUS[sender]
    SI menu EXISTE ET menu.expires_at > NOW() ET chiffre DANS menu.options → résoudre (§2.4), STOP pipeline
# Sinon : aucune interception, le message continue vers le pipeline normal (!* puis NLU)
```

### 2.3 TTL par contexte

| `context_type` | TTL | Justification |
|---|---|---|
| `COMBAT` | 60 s | Rythme rapide — une option périmée = tour manqué, mieux vaut qu'elle retombe vite dans le pipeline normal |
| `DIALOGUE` | 300 s | Le joueur lit, réfléchit, discute autour de lui avant de répondre |
| `SHOP` | 180 s | Parcourir un catalogue prend du temps |
| `MOVEMENT` | 120 s | Choix de direction au rythme de la marche |
| `QUEST_BOARD` | 300 s | Lecture de plusieurs quêtes disponibles |
| `FISHING` | 120 s | Mini-jeu de pêche asynchrone (D87, §6) — pas de chronomètre de réflexe, le TTL borne seulement l'abandon |
| `CONFIRM` | 60 s | Confirmation d'une action irréversible (D92, §7) — une confirmation ne doit pas traîner |

### 2.4 Résolution d'un chiffre

1. Chercher `digit` dans `options` (JSONB) → obtenir `command` (déjà entièrement résolu, ex. `!cast MAG_SAL_003`, pas un gabarit à compléter).
2. Injecter `command` dans le pipeline **exactement comme si le joueur l'avait tapé** — même contrat `SYS_*` en 6 étapes (D-DET-2) que pour une commande texte, aucune dérogation de validation.
3. Si `digit = 9` (aide) : ne PAS injecter dans le pipeline de mutation d'état — appeler directement `!help [Catégorie]` en lecture seule, **conserver** la ligne `T_PENDING_MENUS` (ne pas la supprimer, ne pas la faire expirer prématurément).
4. Pour tout autre digit valide : une fois la commande résolue, **supprimer** la ligne `T_PENDING_MENUS` de cet avatar (le menu a servi, il ne doit pas pouvoir être répondu deux fois — évite le double-clic).

### 2.5 Génération du menu (post-traitement)

Toute réponse du bot — qu'elle vienne du Template Engine ou d'un spécialiste narratif LLM — qui correspond à un `context_type` éligible reçoit son bloc menu en **post-traitement systématique**, généré par L1 à partir de l'état réel de l'avatar (sorts connus, inventaire de combat, stock boutique, zones adjacentes de l'atlas, quêtes du board). Ce n'est **jamais** le LLM qui écrit les lignes numérotées — il peut écrire la phrase d'ambiance au-dessus, jamais la liste elle-même.

`SYS_MENU_RENDER` (§4) est une **primitive de lecture/formatage**, pas une commande de mutation : elle ne suit **pas** le contrat de validation en 6 étapes de D-DET-2 (existence → prérequis → autorisation → lock → exécution → résultat), qui est réservé aux commandes qui **modifient** l'état. Rendre un menu ne modifie rien tant que le joueur n'a pas répondu.

---

## 3. Gabarits par contexte (première tranche)

### 3.1 Combat

Options construites à partir de : cible verrouillée (`!target`), sorts `MAG_*` connus (max 2 les plus utilisés), OSS équipé, 1er consommable de combat de l'inventaire.

```
1. Attaquer
2. Lancer [1er sort connu]
3. Utiliser [OSS équipé]
4. Parer
5. Fuir
6. Utiliser [1er consommable de combat]
9. Aide (combat)
```

### 3.2 Dialogue (`!parler`)

Options construites à partir des sujets K0/K1 actuellement débloqués dans l'enveloppe QI du PNJ (`npc_knowledge_protocol.md`), jamais K3 (cohérent avec D22 — le pare-feu méta s'applique aussi à la génération du menu, pas seulement au LLM). Sur un PNJ de service, les **sujets de service** (D84, `npc_knowledge_protocol.md` §2-bis) apparaissent mélangés aux sujets d'information — le joueur n'a jamais besoin de connaître le mot-clé, il tape juste le chiffre.

```
1. [Sujet K0 #1 — information]
2. [Sujet de service #1 — ex. "Faire laver mon linge (buanderie)"]
3. [Sujet K1 #1 — information]
4. Offrir un cadeau
5. Voir la relation
6. Terminer la conversation
9. Aide (dialogue)
```

### 3.3 Boutique (`!shop_list`)

Top articles en stock par pertinence (niveau du joueur, tier). Pagination (`0`) si plus de 8 articles.

```
1-8. [Article — prix]
0. Voir plus d'articles
9. Aide (boutique)
```

### 3.4 Mouvement (arrivée en zone / `!where`)

Zones adjacentes réellement accessibles (`T_ZONE_LINKS`, atlas) — jamais plus de 8, une zone dépasse rarement 5-6 liaisons.

```
1-N. [Nom de la zone adjacente]
9. Aide (déplacement)
```

### 3.5 Tableau de quêtes (`!quest_board`)

```
1-8. [Nom de la quête disponible]
9. Aide (quêtes)
```

> Extension à d'autres contextes (guilde, artisanat…) : décision d'implémentation ultérieure, hors périmètre de cette première tranche — le mécanisme (§2) est générique, ajouter un `context_type` ne demande pas de nouvelle décision, juste un nouveau gabarit dans ce §3.

---

## 4. Équivalents Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Réafficher le dernier menu actif (s'il n'a pas expiré) | `!menu` | `!sys_menu_force [Avatar] [Contexte]` (debug/support — force l'affichage même hors contexte réel) | `SYS_MENU_RENDER(Avatar_ID, Context_Type, Context_Ref)` — primitive de lecture, cf. §2.5 |
| Résoudre un chiffre (citation ou chiffre nu) | *(pas une commande — mode de résolution du dispatcher, §2.2)* | — | — |

`!menu` réinjecte la même ligne `T_PENDING_MENUS` avec un nouveau `wa_message_id` (le nouveau message devient la référence de citation) sans changer `expires_at` — consulter `!menu` ne prolonge pas artificiellement la fenêtre.

---

## 5. Risques connus et arbitrages assumés

- **Ambiguïté en groupe partagé** : `T_PENDING_MENUS` est indexée par `avatar_uuid`, pas par groupe WhatsApp — deux joueurs avec un menu actif dans le même groupe territorial ne peuvent pas se marcher dessus, chacun ne résout que son propre menu. Le message-menu **mentionne** (`@avatar`) son destinataire pour la lisibilité humaine du fil, mais ce n'est pas ce qui garantit la résolution.
- **Chiffre nu accidentel** : un joueur qui tape « 2 » dans une conversation normale, dans la fenêtre TTL suivant un menu qui lui a été montré, déclenchera l'option 2 par erreur. Risque assumé et borné : les TTL sont courts (60-300 s), l'action reste visible immédiatement (le joueur voit le résultat et peut réagir), et le mode citation (zéro ambiguïté) reste toujours disponible pour qui veut la garantie absolue. Ne pas désactiver le chiffre nu en groupe : ALO se joue exclusivement en groupes territoriaux (jamais en DM), le désactiver là viderait le bénéfice de fluidité recherché.

---

## 6. Contexte `FISHING` — mini-jeu de pêche (D87, étape 60)

`!fish` affiche une description de la ligne (tension, remous, poids) suivie de **3 options** (ex. `1` tirer fort · `2` laisser filer · `3` ferrer doucement). Une seule est juste selon l'indice narratif ; la réussite est ensuite modulée par la DEX. Le contenu des options et la bonne réponse sont calculés par L1 à la génération du menu (jamais par le LLM, §2.5). Aucun chronomètre : la fenêtre de 10 s de l'ancienne spécification est abandonnée, la latence WhatsApp la rendait injuste. Détail : `gathering_cooking_system.md` v2.0 §2.

## 7. Contexte `CONFIRM` — confirmation générique (D92, étape 60)

Une action **irréversible** ne s'exécute pas à la première commande : le bot répond par un résumé de ses conséquences et un menu `1` confirmer · `2` annuler (TTL 60 s). Seul `1` exécute l'action, **en revérifiant tous ses prérequis sous verrou** (l'état a pu changer pendant la fenêtre). `2`, l'expiration ou toute autre commande l'annulent.

**Liste fermée** des actions concernées :

| Action | Pourquoi |
|---|---|
| `!jeter` un objet **lié à l'âme** (`is_bound`) | Destruction définitive d'un objet non rachetable (I4 de `T_INVENTORY` exige une double confirmation) |
| `!divorce` | Dissolution du mariage, règlement de séparation, cooldown 30 j |
| `!housing_sell`, `!housing_leave` | Perte du logement (et, pour la vente, reprise à 50 %) |
| Dissolution de guilde | Perte de la guilde et de son organisation |

Ajouter une action à cette liste est une décision (amendement de D92), pas un détail d'implémentation.

**Citation obligatoire (amendement D92, arbitrage PE étape 60)** : le §5 accepte le risque du *chiffre nu accidentel* parce que « l'action reste visible immédiatement et le joueur peut réagir ». Ce n'est plus vrai ici — un « 1 » tapé par hasard dans la minute suivant un `!divorce` ne se rattrape pas. En contexte `CONFIRM`, la réponse n'est donc acceptée **qu'en mode citation** (réponse au message-menu) ; un chiffre nu est ignoré et le bot rappelle qu'il faut citer le menu. Le chiffre nu reste valable pour tous les autres contextes.
