# 🌊 Perles & Éclats — `SHOP_UND_66`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_UND_66` |
| **Propriétaire** | Perla la Perlière `NPC_UND_66` (`T_NPC.shop_ref` → ce SHOP_ID) |
| **Zone / Sous-lieu** | Archipel, Quais de l'Archipel |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (7 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `ARM_TET_021` | Diadème de Nacre | T2 | 800 | LOCAL | 4 | 7j | — |
| `CSM_CRI_001` | Cristal de Soin | T3 | 1080 | LOCAL | 5 | 7j | — |
| `CSM_CRI_003` | Cristal de Mana | T3 | 1200 | LOCAL | 4 | 7j | — |
| `CSM_CRI_007` | Cristal de Fuite | T3 | 1120 | LOCAL | 4 | 7j | — |
| `CSM_POT_006` | Potion de Soin Suprême | T3 | 600 | LOCAL | 3 | 14j | — |
| `CSM_POT_009` | Potion de Régénération | T2 | 145 | LOCAL | 8 | 7j | — |
| `MSC_ENG_001` | Anneau d'Engagement | T2 | 50000 | LOCAL | ∞ | semaine | Niv. 15+ |

## 3. Politique de rachat
- **Rachète** : perles magiques (30%), bijoux de nacre (25%)
- **Refuse** : armes lourdes, minerais, nourriture, parchemins

## 4. Ancrage zonal
Perles enchantées des eaux cristallines. Diadème de Nacre réputé.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_UND_66` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` — IA : `SYS_SET_SHOP_PRICES`, `SYS_GRANT_ITEM`
