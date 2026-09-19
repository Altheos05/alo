# 🔥 Onya — `SHOP_GAT_48`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_GAT_48` |
| **Propriétaire** | Onya `NPC_GAT_48` (`T_NPC.shop_ref` → `SHOP_GAT_48`) |
| **Zone / Sous-lieu** | `ZONE_SAL_CAP_001` — Gattan, Échoppe de la Bijoutière |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (7 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `MAT_GEM_001` | Gemme de Granit | T2 | 85 | IMPORT Granzam | ∞ | hebdo | — |
| `MAT_GEM_007` | Diamant de Mithril | T4 | 1960 | IMPORT Brokkheim | ∞ | hebdo | AFF>=80 |
| `MAT_MIN_004` | Minerai d'Argent | T2 | 85 | IMPORT Penwether | ∞ | hebdo | — |
| `MAT_DRP_010` | Perle des Abysses | T3 | 335 | IMPORT Archipel | ∞ | hebdo | — |
| `MAT_DRP_014` | Larme de Puca | T2 | 85 | IMPORT Lioda | ∞ | hebdo | — |
| `MAT_MIN_011` | Cristal Violet | T3 | 335 | IMPORT Duskarn | ∞ | hebdo | — |
| `MSC_ENG_001` | Anneau d'Engagement | T2 | 50000 | LOCAL | ∞ | semaine | Niv. 15+ |

## 3. Politique de rachat
- **Rachète** : gemmes et pierres à 25%.
- **Refuse** : objets liés à l'âme, T5, et l'équipement de vol Sylph (embargo de guerre Gattan).

## 4. Ancrage zonal
Bijoutière : sertit les gemmes de feu locales et importe le reste à prix fort. Achète le brut de Kolm `NPC_GAT_12`.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_GAT_48` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` · `!sys_shop_restock SHOP_GAT_48` — IA : `SYS_SET_SHOP_PRICES`, `SYS_SHOP_RESTOCK`, `SYS_GRANT_ITEM`
