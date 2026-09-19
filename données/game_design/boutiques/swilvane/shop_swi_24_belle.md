# 🍃 Belle — `SHOP_SWI_24`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_SWI_24` |
| **Propriétaire** | Belle `NPC_SWI_24` (`T_NPC.shop_ref` → `SHOP_SWI_24`) |
| **Zone / Sous-lieu** | `ZONE_SYL_CAP_001` — Swilvane, Place du Marché |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (7 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `MAT_MIN_007` | Cristal de Brise | T2 | 50 | LOCAL | ∞ | hebdo | — |
| `MAT_GEM_003` | Gemme de Brise | T2 | 65 | LOCAL | ∞ | hebdo | — |
| `MAT_GEM_006` | Saphir des Glaces | T3 | 335 | IMPORT Granzam | ∞ | hebdo | — |
| `MAT_GEM_004` | Perle d'Undine | T3 | 365 | IMPORT Undine | ∞ | hebdo | — |
| `MAT_MIN_011` | Cristal Violet | T3 | 560 | IMPORT Granzam | ∞ | hebdo | — |
| `MAT_GEM_009` | Gemme d'Ombre | T3 | 365 | IMPORT Duskarn | ∞ | hebdo | — |
| `MSC_ENG_001` | Anneau d'Engagement | T2 | 50000 | LOCAL | ∞ | semaine | Niv. 15+ |

## 3. Politique de rachat
- **Rachète** : cristaux de brise bruts (`MAT_MIN_007`, `MAT_GEM_003`) à 25 %.
- **Refuse** : objets liés, contrefaçons.

## 4. Ancrage zonal
Bijoutière du Marché : elle taille le **Cristal de Brise** et la **Gemme de Brise** locaux (signatures, LOCAL) et sertit des gemmes importées. Son fournisseur en pierres de Granzam est Torvin `NPC_SWI_93` (« un cristal qui écoute »).

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_SWI_24` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` · `!sys_shop_restock SHOP_SWI_24` — IA : `SYS_SET_SHOP_PRICES`, `SYS_SHOP_RESTOCK`, `SYS_GRANT_ITEM`
