# Système de Durabilité & Réparation

> **v1.0 (étape 60, 2026-09-19, D88)** — Directive PE : les outils et l'équipement **ne durent pas pour la vie**, et les Yrds doivent circuler avec une **friction qui en réduit la quantité**. Le puits « Réparations » était déjà compté dans le bilan anti-inflation (`directives_generation/12_equilibrage_economique.md` §1.4) et calibré (`stat_scaling/economy_balance_sheet.md`), mais **rien ne consommait jamais de durabilité** et `!repair` n'était pas construit : ce puits ne retirait aucun Yrd. Ce document le rend réel.

## 1. Périmètre

| Famille | S'use ? | Quand |
|---|---|---|
| Outils `OUT_PIO_*`, `OUT_CAN_*` | Oui | à chaque **tentative** de minage / pêche (réussie ou non) |
| Armes `WPN_*` (dont boucliers `WPN_BOU_*`) | Oui | à chaque combat, si tenues en main (`hand_main` / `hand_off`) |
| Armures `ARM_*` (5 slots) | Oui | à chaque combat, si équipées |
| Tenue par défaut `OFT_*` | Oui (durabilité négligeable, D46) | idem armures |
| Objets de port `BELT_*`, `BAG_*`, `HRN_*` | Non | aucune statistique (D45), rien à user |

**Taux de combat** (déduits du barème étape 37, « coût par combat PvE / PvP » = 1 et 3 points) : **−1 point par pièce équipée par combat PvE, −3 par combat PvP.** Les armes rangées à la ceinture ou au dos ne s'usent pas. **Taux des outils** : calibré dans le lot de contenu outils (défaut −1 par tentative).

## 2. Données

- `T_ITEMS_DICT.durability_max` : durabilité d'origine (existe au schéma). **Toutes les fiches d'armes (100/100) et d'armures (500/500) portent déjà leur ligne de durabilité**, mais le générateur ne l'ingère pas (valeurs à `0` en base à l'étape 60) — tâche préalable : parser la durabilité dans `scripts/seed-generator.js`. Les nouvelles fiches d'outils porteront la même ligne.
- `T_INVENTORY.current_durability` : durabilité courante de l'instance (existe au schéma).
- `T_INVENTORY.durability_cap` *(nouvelle colonne)* : durabilité max **courante** de l'instance après amputations (`NULL` = `durability_max` d'origine), et `repair_count` *(nouvelle colonne)*.

Grille de durabilité max constatée par tier : T1 160 · T2 240 · T3 360 · T4 520 · T5 750.

## 3. États et valeur (D88)

| État | Durabilité (courante ÷ max d'origine) | Coefficient de valeur (rachat PNJ, référence hôtel des ventes) |
|---|---|---|
| Neuf | 100 % | 25 % du prix catalogue |
| Quasi neuf | 75–99 % | 22 % |
| Bon état | 50–74 % | 18 % |
| État correct | 26–49 % | 12 % |
| Usé | 1–25 % | 5 % |
| **Cassé** | 0 % | 5 % — **inutilisable jusqu'à réparation** |

- Les boutiques PNJ ne vendent que du neuf ; le coefficient s'applique au **rachat PNJ** et sert de **valeur de référence** entre joueurs.
- **Objet cassé** : il reste équipé mais **ne confère plus aucune statistique** (une armure cassée ne protège plus, une arme cassée frappe comme à mains nues) ; un outil cassé ne permet plus de récolter.
- Cette grille **remplace** celle de l'étape 37 (Neuf / Bon état / Usé / Endommagé / Cassé), dont les taux de rachat sont conservés et reportés sur les nouveaux paliers.

## 4. Réparation dégressive (D88)

- **Où** : `!repair [Objet]` **uniquement** dans une zone où se trouve un forgeron PNJ de service. **Aucun autre canal** : les parchemins de réparation `CSM_PAR_007` (mineure) et `CSM_PAR_008` (majeure) sont **retirés du jeu** — à 180 Yrds pour une remise à neuf (3 000 Yrds au forgeron pour un T4), et fabricables par les joueurs, ils neutralisaient entièrement le puits.
- **Coût** : barème étape 37 — `coût/point (tier) × points restaurés` (T1 2 · T2 5 · T3 12 · T4 30 · T5 75 Yrds/pt), payé **au PNJ** : les Yrds sortent de la circulation.
- **Dégressivité** : chaque réparation remet `current_durability` au plafond courant **puis ampute définitivement** `durability_cap` de 10 % de la durabilité max d'origine (valeur par défaut, paramètre de configuration). Quand le plafond atteint 0, l'objet est **irréparable** et doit être remplacé — second puits (rachat en boutique PNJ).
- **Précision d'implémentation (étape 61)** : l'instance repart au **nouveau** plafond (jamais au-dessus, I8 : courante ∈ [0, plafond]) ; le coût porte sur les points réellement restaurés. Une réparation qui ne rendrait rien est refusée sans amputation. Un « forgeron de service » est un PNJ vivant de la zone dont une fiche de connaissance porte le sujet `réparation` — les données désignent déjà qui répare (Freelia n'en a aucun à ce jour).
- Transaction unique, verrou sur l'instance et sur le solde.

## 5. Exemption T5 liés à l'âme (amendement D88, arbitrage PE étape 60)

Les objets **T5 liés à l'âme** (`tier = 5` **et** `is_bound`) — crafts-titres, drops légendaires, arme légendaire de quête — sont uniques et non rachetables : ils sont **exemptés de l'amputation**. Ils s'usent et peuvent casser comme les autres, et chaque réparation coûte le barème T5 (75 Yrds/pt), mais `durability_cap` n'est jamais réduit. Le puits reste actif par le coût ; seule la destruction définitive d'une récompense d'endgame est évitée.

## 6. Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Réparer | `!repair [Objet]` (chez un forgeron) | `!sys_durability_set [Avatar] [Item_ID] [Valeur]` | `SYS_MODIFY_DURABILITY(Item_Instance_ID, Delta)` *(existant)* ; `SYS_BREAK_WEAPON` *(existant)* met désormais la durabilité à 0 (**Cassé**, réparable) au lieu de détruire l'arme |
| Consulter l'état | `!inspect [Objet]` (état + durabilité) | — | — |
