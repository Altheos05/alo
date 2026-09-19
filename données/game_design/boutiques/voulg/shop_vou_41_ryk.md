# ⚒️ Forge Rapide de Ryk — `SHOP_VOU_41`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_VOU_41` |
| **Propriétaire** | Forgeron du Marché Ryk `NPC_VOU_41` (`T_NPC.shop_ref` → `SHOP_VOU_41`) |
| **Zone / Sous-lieu** | `ZONE_SAL_TWN_001` — Voulg, Marché de la Lave |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (5 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `CSM_PAR_009` | Parchemin de Déliage Mineur | T2 | 135 | LOCAL | 12 | jour | — |
| `WPN_DAG_001` | Dague de Fer | T1 | 120 | LOCAL | 20 | semaine | — |
| `WPN_KAT_001` | Katana d'Acier Poli | T1 | 255 | LOCAL | 8 | semaine | — |
| `MAT_MIN_003` | Étain des Collines | T1 | 5 | LOCAL | 40 | 3j | — |
| `MAT_MIN_014` | Minerai d'Étain Fin | T3 | 490 | IMPORT Granzam | 10 | semaine | — |

## 3. Politique de rachat
- **Rachète** : armes cassées et lames de base (`WPN_DAG_001`, `WPN_KAT_001`) à 25 %, étain (`MAT_MIN_003/014`) à 20 %.
- **Refuse** : objets liés, gemmes, cosmétique.

## 4. Ancrage zonal
Ryk `NPC_VOU_41` répare et refond au pied du Marché de la Lave. On lui apporte parfois des armes « qui ne doivent pas exister » : il les refond sans poser de question, mais le Fondeur Brann `NPC_VOU_67` jure qu'un de ces métaux « n'a pas voulu fondre ».

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_VOU_41` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` · `!sys_shop_restock SHOP_VOU_41` — IA : `SYS_SET_SHOP_PRICES`, `SYS_SHOP_RESTOCK`, `SYS_GRANT_ITEM`
