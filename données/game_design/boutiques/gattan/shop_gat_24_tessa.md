# 🔥 Tessa — `SHOP_GAT_24`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_GAT_24` |
| **Propriétaire** | Tessa `NPC_GAT_24` (`T_NPC.shop_ref` → `SHOP_GAT_24`) |
| **Zone / Sous-lieu** | `ZONE_SAL_CAP_001` — Gattan, Atelier des Runes |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (4 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `CSM_PAR_006` | Parchemin d'Identification | T1 | 40 | LOCAL | ∞ | hebdo | — |
| `CSM_PAR_009` | Parchemin de Déliage Mineur | T2 | 145 | LOCAL | ∞ | hebdo | — |
| `CSM_PAR_010` | Parchemin de Purification | T2 | 145 | LOCAL | ∞ | hebdo | — |
| `CSM_PAR_011` | Parchemin de Boule de Feu | T1 | 40 | LOCAL | ∞ | hebdo | — |

## 3. Politique de rachat
- **Rachète** : parchemins usagés à 25%.
- **Refuse** : objets liés à l'âme, T5, et l'équipement de vol Sylph (embargo de guerre Gattan).

## 4. Ancrage zonal
Graveuse de runes : parchemins utilitaires et de skill, gravés au stylet de braise. Achète l’encre de Mortis `NPC_GAT_03`.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_GAT_24` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` · `!sys_shop_restock SHOP_GAT_24` — IA : `SYS_SET_SHOP_PRICES`, `SYS_SHOP_RESTOCK`, `SYS_GRANT_ITEM`
