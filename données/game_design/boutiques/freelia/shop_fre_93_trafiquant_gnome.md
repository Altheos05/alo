# 🐾 Comptoir Gnome des Gemmes — `SHOP_FRE_93`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_FRE_93` |
| **Propriétaire** | Trafiquant Gnome `NPC_FRE_93` (`T_NPC.shop_ref` → `SHOP_FRE_93`) |
| **Zone / Sous-lieu** | `ZONE_CAI_CAP_001` — Freelia, Marché aux Crocs |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (8 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `MAT_GEM_002` | Gemme d'Obsidienne | T3 | 310 | IMPORT Granzam | 6 | semaine | — |
| `MAT_GEM_005` | Rubis de Feu | T3 | 335 | IMPORT Granzam | 6 | semaine | — |
| `MAT_GEM_003` | Gemme de Brise | T2 | 110 | IMPORT Granzam | 8 | semaine | — |
| `MAT_GEM_008` | Opale des Ruines | T3 | 420 | IMPORT Granzam | 4 | 10j | — |
| `MAT_MIN_009` | Granit de Granzam | T3 | 350 | IMPORT Granzam | 10 | semaine | — |
| `MAT_MIN_004` | Minerai d'Argent | T2 | 110 | IMPORT Granzam | 8 | semaine | — |
| `MAT_GEM_007` | Diamant de Mithril | T4 | 1 680 | IMPORT Granzam | 1 | mois | AFF>=60 |
| `MSC_ENG_001` | Anneau d'Engagement | T2 | 50000 | LOCAL | ∞ | semaine | Niv. 15+ |

## 3. Politique de rachat
- **Rachète** : gemmes et minerais de Granzam contre fourrures fauves (25 %).
- **Refuse** : faune vivante, denrées périssables.

## 4. Ancrage zonal
Le Trafiquant Gnome `NPC_FRE_93` échange les gemmes et le granit de Granzam (+40 %) contre les fourrures de Freelia — troc inter-territorial ouvert. Son Diamant de Mithril passe sous le manteau ; le lien Granzam qu'il incarne double celui, plus discret, du Réfugié Sylph `NPC_FRE_90`.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_FRE_93` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` · `!sys_shop_restock SHOP_FRE_93` — IA : `SYS_SET_SHOP_PRICES`, `SYS_SHOP_RESTOCK`, `SYS_GRANT_ITEM`
