# Effets des Plats & Boissons

> **v1.0 (étape 64, 2026-09-19, D95/D96)** — Directives PE : varier les plats par leurs effets **et** par leur durée ; donner un rôle à chaque consommable, y compris les « sans effet ». Complète `cuisine_libre.md` (marmite) et `gathering_cooking_system.md` §4. Les durées sont écrites dans chaque fiche (champ « Durée ») : le PE les ajuste sans toucher au code.

## 1. Durées variées (D95)

**Plats à recette ou vendus** : durée = base du tier × facteur de puissance, arrondie à la minute.

| Tier | T1 | T2 | T3 | T4 | T5 |
|---|---|---|---|---|---|
| Base | 15 min | 20 min | 30 min | 45 min | 60 min |

| Puissance | +5 % | +10 % | +15 % | +20 % |
|---|---|---|---|---|
| Facteur | × 2 | × 1,5 | × 1 | × 0,75 |

Un bonus faible dure longtemps, un bonus fort peu : à tier égal, le joueur choisit entre intensité et endurance. Cas à part :
- le **rassasiement** (régénération de PV) garde sa durée de fiche (45-60 s), créditée d'un coup ;
- le **charisme** dure 10 min (§3).

**Plats de marmite** (remplace la règle « 10 min par ingrédient » de `cuisine_libre.md` §4) : durée = Σ (5 min × tier de chaque ingrédient) × facteur de palier (palier 1 × 1,5 · palier 2 × 1 · palier 3 × 0,75), minimum 5 min. Deux plats de même effet diffèrent donc aussi par leur durée, selon la qualité des ingrédients.

## 2. Résistances élémentaires (D96-a)

- **Effet** : `+N % résistance au feu` / `à l'ombre` / `toutes résistances`. Un effet actif réduit de N % les dégâts élémentaires reçus.
- **Portée (première version)** : les **dégâts directs d'un monstre élémentaire** sur le joueur. Un monstre est élémentaire si son `T_MONSTERS_DICT.element` nomme un élément ; le feu comprend « Feu » et les éléments composés qui le contiennent (« Feu/Foudre/Glace ») ; l'ombre comprend « Ténèbres » et « Ombre ». `toutes résistances` couvre tout élément, jamais les dégâts non élémentaires (`element` vide ou « Aucun »).
- **Cumul** : les résistances d'un même élément s'additionnent, plafonnées à 75 %.
- **Hors portée** (à décider plus tard) : altérations élémentaires (Brûlure…), sorts élémentaires des joueurs (PvP), résistances des monstres.

## 3. Charisme (D96-b)

- **Effet** (Pain d'Épices, Gâteau de Miel) : pendant **10 min**, la prochaine discussion avec un PNJ (`!parler` ou `!demander`) a **30 %** de chances de faire monter la relation d'un palier (`T_NPC_RELATIONS` : l'affinité passe au seuil du palier suivant, grille D-SOC-2).
- **Usage unique** : l'effet est consommé par cette discussion, réussie ou non. Au-delà du palier « confident », rien ne se passe mais l'effet est tout de même consommé.
- La valeur « +5 % CHA » des fiches est remplacée par cette règle.

## 4. Régénération de PM (D96-c)

- **Effet** (Nectar des Fées +10 %, Élixir de Mana +20 %) : rend N % des PM max **par minute**.
- **Résolution paresseuse** (aucun planificateur) : à chaque message du joueur, les PM dus depuis le dernier calcul sont crédités.
- **Fin** : l'effet s'arrête dès que les PM sont pleins, ou à son échéance.
- C'est le moyen de regagner des PM hors combat, avec le repos (`!rest`, 5 % chez soi ou dans sa chambre d'auberge).

## 5. Boissons symboliques (D96-d)

- Bière d'Alne, Jus de fruit, Lait de chèvre et Eau de mer purifiée : **aucun effet mécanique**. Ce sont des « anti-soif » à boire ou à **offrir à un autre joueur** — geste purement symbolique.
- `!offrir [Objet] [Numéro]` : donne un objet non lié et non équipé à un joueur **présent dans la même zone**, qui en est prévenu en privé (D91). Tout objet transférable peut s'offrir, pas seulement les boissons ; les cadeaux aux PNJ (affinité) restent à construire.

## 6. Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Offrir | `!offrir [Objet] [Numéro]` | — | — |
| Consulter ses effets | `!effets` *(existant, affiche aussi la régénération en cours)* | `!sys_effect_apply` *(existant)* | `SYS_BLESS_PLAYER` *(existant)* |
