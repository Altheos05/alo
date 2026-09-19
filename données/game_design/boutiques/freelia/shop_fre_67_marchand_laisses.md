# 🐾 Sellerie de Dressage — `SHOP_FRE_67`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_FRE_67` |
| **Propriétaire** | Marchand de Laisses `NPC_FRE_67` (`T_NPC.shop_ref` → `SHOP_FRE_67`) |
| **Zone / Sous-lieu** | `ZONE_CAI_CAP_001` — Freelia, Marché aux Crocs |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (3 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `MAT_MIN_003` | Étain des Collines | T1 | 5 | LOCAL | 40 | 3j | — |
| `MAT_MIN_005` | Charbon de Forge | T1 | 5 | LOCAL | 60 | 2j | — |
| `ARM_TET_038` | Cornes d'Apprenti | T1 | 250 | LOCAL | 15 | semaine | — |

## 3. Politique de rachat
- **Rachète** : fers, boucles et pièces de harnais (`MAT_MIN_003/005`) à 25 %.
- **Refuse** : viande, gemmes, faune vivante.

## 4. Ancrage zonal
Le Marchand de Laisses `NPC_FRE_67` vend colliers, muselières et fers de dressage. Une de ses laisses « n'a pas de fin » — on la déroule sans jamais en trouver le bout ; le Palefrenier `NPC_FRE_74` refuse d'en équiper ses montures.

> `[BESOIN_ITEM]` : **Laisses / colliers / muselières de dressage (`TAME_*`)** — équipement de dressage non fiché — fonds de commerce du Marchand de Laisses

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_FRE_67` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` · `!sys_shop_restock SHOP_FRE_67` — IA : `SYS_SET_SHOP_PRICES`, `SYS_SHOP_RESTOCK`, `SYS_GRANT_ITEM`
