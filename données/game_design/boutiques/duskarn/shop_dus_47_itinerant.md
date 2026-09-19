# 🌑 Marchand Itinérant, Colporteur Inter-Cités — `SHOP_DUS_47`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_DUS_47` |
| **Propriétaire** | Marchand Itinérant `NPC_DUS_47` |
| **Zone / Sous-lieu** | Duskarn, itinérant |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (6 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `CSM_PAR_001` | Parchemin de Retour à Alne | T1 | 85 | IMPORT Alne | 6 | jour | — |
| `CSM_PAR_002` | Parchemin de Retour à la Cité Natale | T1 | 85 | IMPORT Alne | 6 | jour | — |
| `CSM_PAR_003` | Parchemin de Rappel | T2 | 180 | IMPORT Alne | 4 | semaine | — |
| `CSM_PAR_004` | Parchemin de Retour de Guilde | T2 | 195 | IMPORT Alne | 3 | semaine | — |
| `CSM_PAR_005` | Parchemin de Sortie de Donjon | T2 | 170 | IMPORT Alne | 3 | semaine | — |
| `CSM_PAR_006` | Parchemin d'Identification | T1 | 55 | IMPORT Alne | 8 | jour | — |

## 3. Politique de rachat
- **Rachète** : Gadgets, curiosités, parchemins (25%)
- **Refuse** : Armes, armures, objets de lumière sacrée, équipement lourd Imp

## 4. Ancrage zonal
Colporteur de Duskarn, il sillonne les routes entre Alne, Voulg et Freelia, rapportant parchemins et gadgets.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_DUS_47 · !trade_route`
- GM : `!sys_market_price — IA : SYS_SET_SHOP_PRICES, SYS_GRANT_ITEM`
