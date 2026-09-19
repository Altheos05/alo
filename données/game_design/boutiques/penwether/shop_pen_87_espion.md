# 🕯️ Espion de Duskarn — `SHOP_PEN_87`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_PEN_87` |
| **Propriétaire** | Espion de Duskarn `NPC_PEN_87` |
| **Zone / Sous-lieu** | Penwether, Faubourg des Masques (cache) |
| **Type** | BLACK_MARKET |
| **Accès** | caché (sur rendez-vous) |

## 2. Inventaire (4 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `CSM_PAR_013` | Parchemin d'Éclair | T2 | 120 | LOCAL | 4 | semaine | — |
| `CSM_PAR_015` | Parchemin de Bourrasque | T2 | 120 | LOCAL | 4 | semaine | — |
| `CSM_POT_002` | Potion de Soin Légère | T1 | 65 | IMPORT | 8 | jour | — |
| `CSM_POT_004` | Potion de Soin Supérieure | T2 | 280 | IMPORT | 4 | semaine | — |

## 3. Politique de rachat
- **Rachète** : Renseignements (30%), Objets de contrebande (15%)
- **Refuse** : Objets traçables, équipement standard

## 4. Ancrage zonal
L'Espion de Duskarn est un agent Imp infiltré.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_PEN_87` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` — IA : `SYS_SET_SHOP_PRICES`, `SYS_GRANT_ITEM`
