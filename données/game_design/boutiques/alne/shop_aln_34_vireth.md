# 🌳 Joaillière Vireth — `SHOP_ALN_34`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_ALN_34` |
| **Propriétaire** | Joaillière Vireth `NPC_ALN_34` (`T_NPC.shop_ref` → `SHOP_ALN_34`) |
| **Zone / Sous-lieu** | `ZONE_NEU_CAP_001` — Alne, Marché Circulaire |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (7 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `MAT_GEM_001` | Gemme de Granit | T2 | 125 | IMPORT Granzam | ∞ | hebdo | — |
| `MAT_GEM_003` | Gemme de Brise | T2 | 110 | IMPORT Granzam | ∞ | hebdo | — |
| `MAT_GEM_002` | Gemme d'Obsidienne | T3 | 310 | IMPORT Gattan | ∞ | hebdo | — |
| `MAT_GEM_005` | Rubis de Feu | T3 | 335 | IMPORT Gattan | ∞ | hebdo | — |
| `MAT_GEM_006` | Saphir des Glaces | T3 | 335 | IMPORT Granzam | ∞ | hebdo | — |
| `MAT_GEM_007` | Diamant de Mithril | T4 | 1680 | IMPORT Brokkheim | ∞ | hebdo | — |
| `MSC_ENG_001` | Anneau d'Engagement | T2 | 50000 | LOCAL | ∞ | semaine | Niv. 15+ |

## 3. Politique de rachat
- **Rachète** : gemmes brutes et éclats (`MAT_GEM_*`) à 25 %.
- **Refuse** : objets liés, T5, armes.

## 4. Ancrage zonal
Sertit les **gemmes de Granzam** taillées : achète l'obsidienne d'Onya `NPC_GAT_48` (Gattan) et importe les gemmes gnomes (BESOIN d'Alne, +40 %). Sertit une gemme qui « regarde » (indice méta, gemmes-capteurs). Fournit le Runiste Vael `NPC_ALN_39`.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_ALN_34` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` · `!sys_shop_restock SHOP_ALN_34` — IA : `SYS_SET_SHOP_PRICES`, `SYS_SHOP_RESTOCK`, `SYS_GRANT_ITEM`
