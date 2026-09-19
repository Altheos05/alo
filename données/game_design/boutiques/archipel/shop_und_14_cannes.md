# 🌊 Le Coin du Pêcheur — `SHOP_UND_14`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_UND_14` |
| **Propriétaire** | Marchand de Cannes `NPC_UND_14` (`T_NPC.shop_ref` → ce SHOP_ID) |
| **Zone / Sous-lieu** | Archipel, Lac Cristallin |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (11 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `ARM_TET_020` | Bandana du Pêcheur | T1 | 305 | LOCAL | 5 | 7j | — |
| `MAT_CUI_007` | Queue Annelée | T1 | 10 | LOCAL | 20 | jour | — |
| `MAT_CUI_012` | Plume de Corbeau | T1 | 5 | LOCAL | 25 | jour | — |
| `MAT_WOD_013` | Bambou de Vent — MAT_WOD_013 | T2 | 15 | LOCAL | 15 | 7j | — |
| `MAT_WOD_016` | Acacia des Savanes — MAT_WOD_016 | T2 | 20 | LOCAL | 12 | 7j | — |
| `MAT_WOD_014` | Bois de Rose — MAT_WOD_014 | T2 | 30 | LOCAL | 10 | 7j | — |
| `OUT_CAN_001` | Canne en Bambou | T1 | 120 | LOCAL | ∞ | semaine | — |
| `OUT_CAN_002` | Canne en Frêne | T2 | 500 | LOCAL | ∞ | semaine | Niv. 10+ |
| `OUT_CAN_003` | Canne Nacrée | T3 | 2000 | LOCAL | ∞ | semaine | Niv. 20+ |
| `OUT_CAN_004` | Canne de Corail Noir | T4 | 8000 | LOCAL | ∞ | semaine | Niv. 35+ |
| `OUT_CAN_005` | Canne du Léviathan | T5 | 28000 | LOCAL | ∞ | semaine | Niv. 50+ |

## 3. Politique de rachat
- **Rachète** : matériel de pêche usagé (20%), appâts naturels (25%)
- **Refuse** : armes, armures, potions, minerais, objets magiques

## 4. Ancrage zonal
Cannes en bambou de Vent, appâts et matériel pour les pêcheurs du Lac Cristallin. Bandana du Pêcheur exclusif.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_UND_14` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` — IA : `SYS_SET_SHOP_PRICES`, `SYS_GRANT_ITEM`
