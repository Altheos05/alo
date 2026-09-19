# 🌳 Boucher Halle — `SHOP_ALN_30`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_ALN_30` |
| **Propriétaire** | Boucher Halle `NPC_ALN_30` (`T_NPC.shop_ref` → `SHOP_ALN_30`) |
| **Zone / Sous-lieu** | `ZONE_NEU_CAP_001` — Alne, Marché Circulaire |
| **Type** | ÉTAL |
| **Accès** | libre |

## 2. Inventaire (34 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `CSM_NOU_002` | Truite Grillée du Zéphyr | T2 | 95 | LOCAL | ∞ | hebdo | — |
| `CSM_NOU_003` | Brochette de Chasse Sauvage | T2 | 90 | LOCAL | ∞ | hebdo | — |
| `CSM_NOU_021` | Tourte du Chasseur | T2 | 85 | LOCAL | ∞ | hebdo | — |
| `CSM_NOU_025` | Côtelette Fumée | T2 | 85 | LOCAL | ∞ | hebdo | — |
| `CSM_NOU_030` | Filet Mignon d'Alne | T3 | 385 | LOCAL | ∞ | hebdo | — |
| `CSM_NOU_032` | Rôti des Cimes | T3 | 400 | LOCAL | ∞ | hebdo | — |
| `MAT_ALI_001` | Algue-souffle | T1 | 6 | LOCAL | ∞ | jour | — |
| `MAT_ALI_002` | Avoine | T1 | 2 | LOCAL | ∞ | jour | — |
| `MAT_ALI_003` | Baies des collines | T1 | 3 | LOCAL | ∞ | jour | — |
| `MAT_ALI_004` | Champignon de roche | T1 | 5 | LOCAL | ∞ | jour | — |
| `MAT_ALI_005` | Champignon des ombres | T2 | 12 | LOCAL | ∞ | jour | — |
| `MAT_ALI_006` | Crustacé du lac | T2 | 14 | LOCAL | ∞ | jour | — |
| `MAT_ALI_007` | Eau de source | T1 | 1 | LOCAL | ∞ | jour | — |
| `MAT_ALI_008` | Farine de racine dure | T1 | 4 | LOCAL | ∞ | jour | — |
| `MAT_ALI_009` | Feuille de zéphyr | T2 | 10 | LOCAL | ∞ | jour | — |
| `MAT_ALI_010` | Fromage | T1 | 6 | LOCAL | ∞ | jour | — |
| `MAT_ALI_011` | Gibier des hauteurs | T2 | 18 | LOCAL | ∞ | jour | — |
| `MAT_ALI_012` | Graisse animale | T1 | 3 | LOCAL | ∞ | jour | — |
| `MAT_ALI_013` | Herbe grise des terres grises | T2 | 9 | LOCAL | ∞ | jour | — |
| `MAT_ALI_014` | Lait de pâturage | T1 | 3 | LOCAL | ∞ | jour | — |
| `MAT_ALI_015` | Légumes des champs | T1 | 3 | LOCAL | ∞ | jour | — |
| `MAT_ALI_016` | Miel commun | T1 | 4 | LOCAL | ∞ | jour | — |
| `MAT_ALI_017` | Miel des ruches résonnantes | T2 | 15 | LOCAL | ∞ | jour | — |
| `MAT_ALI_018` | Minerai comestible | T3 | 30 | LOCAL | ∞ | jour | — |
| `MAT_ALI_019` | Os à moelle | T1 | 4 | LOCAL | ∞ | jour | — |
| `MAT_ALI_020` | Piment de braise | T2 | 11 | LOCAL | ∞ | jour | — |
| `MAT_ALI_021` | Racine bouillie | T1 | 2 | LOCAL | ∞ | jour | — |
| `MAT_ALI_022` | Racine d'ambre | T2 | 13 | LOCAL | ∞ | jour | — |
| `MAT_ALI_023` | Résine d'obsidienne | T3 | 28 | LOCAL | ∞ | jour | — |
| `MAT_ALI_024` | Sel de lune | T2 | 12 | LOCAL | ∞ | jour | — |
| `MAT_ALI_025` | Sel de mine | T1 | 3 | LOCAL | ∞ | jour | — |
| `MAT_ALI_026` | Viande de gibier | T1 | 8 | LOCAL | ∞ | jour | — |
| `MAT_ALI_027` | Viande épicée | T2 | 14 | LOCAL | ∞ | jour | — |
| `MAT_ALI_028` | Œufs de chauve-souris | T2 | 10 | LOCAL | ∞ | jour | — |

## 3. Politique de rachat
- **Rachète** : viandes, cuirs et os (`MAT_CUI_*`, drops de bête) à 25 %.
- **Refuse** : objets liés, T5, armes.

## 4. Ancrage zonal
Boucherie inter-races : sert neuf régimes contradictoires sous un seul étal. **Achète les drops de viande** des chasseurs de tous les territoires (rachat R7) et vend les pièces nobles jusqu'au Filet Mignon d'Alne (signature LOCAL). Fournit le Chef Aubin `NPC_ALN_47`.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_ALN_30` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` · `!sys_shop_restock SHOP_ALN_30` — IA : `SYS_SET_SHOP_PRICES`, `SYS_SHOP_RESTOCK`, `SYS_GRANT_ITEM`
