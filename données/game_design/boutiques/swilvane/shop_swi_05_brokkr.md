# 🍃 Brokkr Marteau-Feuille — `SHOP_SWI_05`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_SWI_05` |
| **Propriétaire** | Brokkr Marteau-Feuille `NPC_SWI_05` (`T_NPC.shop_ref` → `SHOP_SWI_05`) |
| **Zone / Sous-lieu** | `ZONE_SYL_CAP_001` — Swilvane, Forge des Brises |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (4 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `WPN_EP1_002` | Lame du Vent Sylphe | T1 | 240 | LOCAL | ∞ | hebdo | — |
| `WPN_ARC_004` | Arc du Vent Sylphe | T2 | 735 | LOCAL | ∞ | hebdo | — |
| `WPN_BOU_001` | Bouclier Rond en Bois | T1 | 145 | LOCAL | ∞ | hebdo | — |
| `WPN_EP1_010` | Faucon d'Émeraude | T4 | 11200 | LOCAL | ∞ | hebdo | AFF>=80 |

## 3. Politique de rachat
- **Rachète** : lames ébréchées et minerai (`MAT_MIN_*`) à 25 %.
- **Refuse** : armes lourdes, plaque (culture du vol), objets liés.

## 4. Ancrage zonal
Forgeron leprechaun établi à la Frontière : il ne bat que des armes ultra-légères adaptées au vol sylph. Le **Faucon d'Émeraude** (T4, `AFF>=80`) est l'unique arme T4 légale de la ville. Répare pour la Garde de Reylen `NPC_SWI_09` ; s'approvisionne en métal auprès de Venn `NPC_SWI_59`.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_SWI_05` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` · `!sys_shop_restock SHOP_SWI_05` — IA : `SYS_SET_SHOP_PRICES`, `SYS_SHOP_RESTOCK`, `SYS_GRANT_ITEM`
