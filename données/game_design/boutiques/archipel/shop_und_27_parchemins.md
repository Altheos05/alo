# 🌊 Parchemins & Encres — `SHOP_UND_27`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_UND_27` |
| **Propriétaire** | Marchand de Parchemins `NPC_UND_27` (`T_NPC.shop_ref` → ce SHOP_ID) |
| **Zone / Sous-lieu** | Archipel, Académie des Mages |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (5 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `CSM_PAR_001` | Parchemin de Retour à Alne | T1 | 50 | LOCAL | 10 | jour | — |
| `CSM_PAR_006` | Parchemin d'Identification | T1 | 30 | LOCAL | 15 | jour | — |
| `CSM_PAR_009` | Parchemin de Déliage Mineur | T2 | 135 | LOCAL | 8 | 7j | — |
| `CSM_PAR_010` | Parchemin de Purification | T2 | 140 | LOCAL | 8 | 7j | — |
| `CSM_PAR_003` | Parchemin de Rappel | T2 | 105 | LOCAL | 8 | 7j | — |

## 3. Politique de rachat
- **Rachète** : parchemins vierges usagés (20%), encres rares (30%)
- **Refuse** : armes, armures, minerais, nourriture, équipement de pêche

## 4. Ancrage zonal
Fournisseur de l'Académie. Parchemins, encres magiques, rouleaux pré-encodés.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_UND_27` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` — IA : `SYS_SET_SHOP_PRICES`, `SYS_GRANT_ITEM`
