# Cuisine Libre (« Marmite ») & Niveau de Cuisine

> **v1.0 (étape 63, 2026-09-19, D93/D94)** — Demande PE : s'inspirer de la cuisine de *Zelda : Breath of the Wild / Tears of the Kingdom* et de *Monster Hunter Wilds*. On jette jusqu'à **4 ingrédients** dans la marmite ; le résultat se déduit de leur nature, sans recette à connaître. Ce mode **s'ajoute** aux recettes (`gathering_cooking_system.md` §4) et ne les remplace pas. Un **niveau de cuisine** progresse à chaque plat et fixe la réussite des plats compliqués.
>
> **Ce document est la source d'ingestion** : le générateur (`scripts/seed-generator.js`) lit les tableaux §2 (profil culinaire des ingrédients), §3 (plats génériques) et §4 (effets de marmite).

## 1. Principe (D93)

| Emprunt | Origine | Adaptation ALO |
|---|---|---|
| Marmite ouverte, pas de recette à connaître | BotW/TotK : jusqu'à 5 ingrédients | **4 ingrédients** (demande PE) : `!marmite A + B + C + D` |
| Plats simples « grillés » | MH Wilds : base viande / poisson / légumes | Un ingrédient de base suffit : viande grillée, poisson grillé, légumes grillés… |
| Même essence ⇒ effet renforcé | BotW : 5 ingrédients identiques = effet maximal | Palier de puissance selon le nombre d'ingrédients de la même essence |
| Deux essences contraires ⇒ effet annulé | BotW : effets en conflit s'annulent | Plus d'une essence ⇒ plat sans buff (les soins restent) |
| Plat douteux / immangeable | BotW : *Dubious Food*, *Rock-Hard Food* | Parties de monstre ⇒ Tambouille douteuse ; minéraux ⇒ Plat immangeable |
| Découverte de recettes | BotW : la marmite retrouve les recettes | Si les ingrédients correspondent **exactement** à une recette, la marmite produit ce plat |

Même lieu que les recettes : **feu de camp** (zones `HUNT` / `FLD`) ou **cuisine de logement**. Les ingrédients sont consommés dans tous les cas, réussite ou échec.

## 2. Profil culinaire des ingrédients

Catégories : `VIANDE`, `POISSON`, `LEGUME`, `FRUIT`, `CEREALE`, `LAITIER`, `ASSAISONNEMENT`. Tout autre objet est **non comestible** : les parties de monstre (`MAT_DRP_*`, `MAT_CUI_*`) donnent une Tambouille douteuse, tout le reste un Plat immangeable.

Essences : `FORCE` (STR), `AGILITE` (AGI), `ENDURANCE` (VIT), `ESPRIT` (INT) — effets de stat ; `VITALITE` — soin supplémentaire.

**Valeur nutritive** (PV rendus par ingrédient, × tier) : VIANDE 60 · POISSON 50 · CEREALE 30 · LAITIER 30 · LEGUME 25 · FRUIT 25 · ASSAISONNEMENT 10. Une essence `VITALITE` ajoute 40 × tier. Un assaisonnement présent augmente le total de 25 %.

| Item_ID | Nom | Tier | Catégorie | Essence |
|---|---|---|---|---|
| `MAT_ALI_001` | Algue-souffle | T1 | LEGUME | AGILITE |
| `MAT_ALI_002` | Avoine | T1 | CEREALE | — |
| `MAT_ALI_003` | Baies des collines | T1 | FRUIT | — |
| `MAT_ALI_004` | Champignon de roche | T1 | LEGUME | ENDURANCE |
| `MAT_ALI_005` | Champignon des ombres | T2 | LEGUME | ESPRIT |
| `MAT_ALI_006` | Crustacé du lac | T2 | POISSON | — |
| `MAT_ALI_007` | Eau de source | T1 | ASSAISONNEMENT | — |
| `MAT_ALI_008` | Farine de racine dure | T1 | CEREALE | — |
| `MAT_ALI_009` | Feuille de zéphyr | T2 | LEGUME | AGILITE |
| `MAT_ALI_010` | Fromage | T1 | LAITIER | — |
| `MAT_ALI_011` | Gibier des hauteurs | T2 | VIANDE | FORCE |
| `MAT_ALI_012` | Graisse animale | T1 | ASSAISONNEMENT | — |
| `MAT_ALI_013` | Herbe grise des terres grises | T2 | LEGUME | ESPRIT |
| `MAT_ALI_014` | Lait de pâturage | T1 | LAITIER | — |
| `MAT_ALI_015` | Légumes des champs | T1 | LEGUME | — |
| `MAT_ALI_016` | Miel commun | T1 | ASSAISONNEMENT | — |
| `MAT_ALI_017` | Miel des ruches résonnantes | T2 | ASSAISONNEMENT | ESPRIT |
| `MAT_ALI_018` | Minerai comestible | T3 | ASSAISONNEMENT | ENDURANCE |
| `MAT_ALI_019` | Os à moelle | T1 | VIANDE | — |
| `MAT_ALI_020` | Piment de braise | T2 | ASSAISONNEMENT | FORCE |
| `MAT_ALI_021` | Racine bouillie | T1 | LEGUME | — |
| `MAT_ALI_022` | Racine d'ambre | T2 | LEGUME | ENDURANCE |
| `MAT_ALI_023` | Résine d'obsidienne | T3 | ASSAISONNEMENT | ENDURANCE |
| `MAT_ALI_024` | Sel de lune | T2 | ASSAISONNEMENT | — |
| `MAT_ALI_025` | Sel de mine | T1 | ASSAISONNEMENT | — |
| `MAT_ALI_026` | Viande de gibier | T1 | VIANDE | — |
| `MAT_ALI_027` | Viande épicée | T2 | VIANDE | FORCE |
| `MAT_ALI_028` | Œufs de chauve-souris | T2 | VIANDE | AGILITE |
| `MAT_POI_001` | Truite Sylphe | T1 | POISSON | — |
| `MAT_POI_002` | Carpe Dorée | T2 | POISSON | ESPRIT |
| `MAT_POI_003` | Maquereau Bleu | T1 | POISSON | — |
| `MAT_POI_004` | Poisson-Corail | T2 | POISSON | — |
| `MAT_POI_005` | Espadon Géant | T3 | POISSON | FORCE |
| `MAT_POI_006` | Anguille des Abysses | T4 | POISSON | AGILITE |
| `MAT_POI_007` | Saumon d'Argent | T1 | POISSON | — |
| `MAT_POI_008` | Perche Chantante | T1 | POISSON | — |
| `MAT_POI_009` | Brochet des Échos | T2 | POISSON | — |
| `MAT_POI_010` | Poisson-Chat Tigré | T2 | POISSON | — |
| `MAT_POI_011` | Poisson-Mort des Marais | T4 | POISSON | ENDURANCE |
| `MAT_POI_012` | Léviathan Miniature | T5 | POISSON | FORCE |
| `MAT_HRB_001` | Lin Sylvestre | T1 | LEGUME | — |
| `MAT_HRB_002` | Fleur de Gravats | T1 | LEGUME | ENDURANCE |
| `MAT_HRB_003` | Prêle des Vapeurs | T1 | LEGUME | AGILITE |
| `MAT_HRB_004` | Mousse de Caillasse | T1 | LEGUME | ENDURANCE |
| `MAT_HRB_005` | Herbe des Steppes | T1 | LEGUME | AGILITE |
| `MAT_HRB_006` | Fleur de Soufre | T2 | LEGUME | FORCE |
| `MAT_HRB_007` | Plante des Ombres | T2 | LEGUME | ESPRIT |
| `MAT_HRB_008` | Fleur de Lune | T2 | LEGUME | ESPRIT |
| `MAT_HRB_009` | Herbe des Marais | T2 | LEGUME | — |
| `MAT_HRB_010` | Fleur de Savane | T2 | LEGUME | VITALITE |
| `MAT_HRB_011` | Pétale de Rose Grise | T2 | LEGUME | — |
| `MAT_HRB_012` | Herbe de Mithril | T3 | LEGUME | ENDURANCE |
| `MAT_HRB_013` | Fleur d'Obsidienne | T3 | LEGUME | ENDURANCE |
| `MAT_HRB_014` | Herbe des Neiges | T3 | LEGUME | VITALITE |
| `MAT_HRB_015` | Fleur de l'Âme | T3 | LEGUME | ESPRIT |
| `MAT_HRB_016` | Herbe des Ruines | T3 | LEGUME | — |
| `MAT_HRB_017` | Fleur des Forges | T2 | LEGUME | FORCE |
| `MAT_HRB_018` | Fleur de Lotus | T3 | LEGUME | ESPRIT |
| `MAT_HRB_019` | Herbe des Canaux | T2 | LEGUME | — |
| `MAT_HRB_020` | Herbe d'Eau Claire | T1 | LEGUME | VITALITE |
| `MAT_HRB_021` | Fleur de Grenat | T3 | LEGUME | FORCE |
| `MAT_HRB_022` | Herbe du Vent | T2 | LEGUME | AGILITE |
| `MAT_HRB_023` | Fleur du Crépuscule | T3 | LEGUME | ESPRIT |
| `MAT_HRB_024` | Herbe de Résine | T2 | LEGUME | — |
| `MAT_HRB_025` | Plante Primordiale | T4 | LEGUME | ESPRIT |

## 3. Plats génériques (première règle qui s'applique)

| Item_ID | Nom | Règle |
|---|---|---|
| `CSM_CUI_001` | Plat immangeable | un ingrédient non comestible autre qu'une partie de monstre |
| `CSM_CUI_002` | Tambouille douteuse | une partie de monstre |
| — | *(plat de la recette)* | ingrédients identiques, en nature et en quantité, à une recette existante |
| `CSM_CUI_003` | Viande grillée | viande seule (+ assaisonnements) |
| `CSM_CUI_004` | Poisson grillé | poisson seul (+ assaisonnements) |
| `CSM_CUI_005` | Légumes grillés | légumes / fruits seuls (+ assaisonnements, laitiers) |
| `CSM_CUI_006` | Galette | céréales, sans viande ni poisson |
| `CSM_CUI_007` | Brochette mixte | viande + légumes / fruits / céréales |
| `CSM_CUI_008` | Poêlée de la mer | poisson + légumes / fruits / céréales |
| `CSM_CUI_009` | Ragoût terre-mer | viande + poisson |
| `CSM_CUI_010` | Bouillon | uniquement assaisonnements et laitiers |

Chaque plat de marmite garde **sur son exemplaire** (`T_INVENTORY.instance_data`) ses PV, son effet et sa durée : deux plats du même type faits d'ingrédients différents ne sont pas identiques et ne s'empilent pas.

## 4. Effets de marmite

- **Une seule essence de stat** parmi les ingrédients ⇒ effet selon le nombre d'ingrédients qui la portent : 1 → palier 1 (+5 %), 2 → palier 2 (+10 %), 3 ou 4 → palier 3 (+15 %).
- **Plusieurs essences de stat** ⇒ elles s'annulent : aucun effet (les PV sont conservés).
- **Durée** : 10 minutes par ingrédient (10 à 40 min). Un plat de marmite est un buff de nourriture : il remplace le précédent (règle « un buff de nourriture à la fois »).

| Effet_ID | Nom | Stat | Valeur |
|---|---|---|---|
| `EFF_CUI_STR_1` | Plat de force I | `stat_str` | +5 % |
| `EFF_CUI_STR_2` | Plat de force II | `stat_str` | +10 % |
| `EFF_CUI_STR_3` | Plat de force III | `stat_str` | +15 % |
| `EFF_CUI_AGI_1` | Plat d'agilité I | `stat_agi` | +5 % |
| `EFF_CUI_AGI_2` | Plat d'agilité II | `stat_agi` | +10 % |
| `EFF_CUI_AGI_3` | Plat d'agilité III | `stat_agi` | +15 % |
| `EFF_CUI_VIT_1` | Plat d'endurance I | `stat_vit` | +5 % |
| `EFF_CUI_VIT_2` | Plat d'endurance II | `stat_vit` | +10 % |
| `EFF_CUI_VIT_3` | Plat d'endurance III | `stat_vit` | +15 % |
| `EFF_CUI_INT_1` | Plat d'esprit I | `stat_int` | +5 % |
| `EFF_CUI_INT_2` | Plat d'esprit II | `stat_int` | +10 % |
| `EFF_CUI_INT_3` | Plat d'esprit III | `stat_int` | +15 % |

## 5. Niveau de cuisine (D94)

- **Complexité** `c` d'un plat :
  - recette : nombre d'ingrédients distincts + 2 × (tier du plat − 1) ;
  - marmite : nombre d'ingrédients + palier d'effet (0 sans effet).
- **Réussite** : niveau conseillé `N_c = 5 × (c − 2)` (0 pour `c ≤ 2`) ; chance = 90 % + 4 % × (niveau − N_c), bornée entre 30 % et 98 %. Un plat simple réussit presque toujours ; un plat complexe exige de la pratique.
- **Expérience** : réussite → `10 × c²` ; échec → `3 × c²` (on apprend aussi de ses ratés) ; plat douteux → 1 ; plat immangeable → 0.
- **Niveau** : `floor(√(XP / 25)) + 1`, plafonné à 50 (niveau 2 à 25 XP, 5 à 400, 10 à 2 025, 20 à 9 025, 50 à 60 025).
- Le taux de réussite des recettes de cuisine (`T_RECIPES.success_rate`) est remplacé par ce calcul ; les autres artisanats gardent le leur.

## 6. Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Marmite | `!marmite [Ingrédient] + [Ingrédient] (+ …, 4 max)` — ID ou nom | — | — |
| Recette | `!cook [Recette]` *(existant, désormais soumis au niveau)* | — | — |
| Niveau | `!cook niveau` | `!sys_cooking_xp [Avatar] [XP]` | `SYS_GRANT_COOKING_XP(Avatar_ID, XP)` |
| Manger | `!manger [Plat]` / `!use [Plat]` *(existant)* | — | — |
