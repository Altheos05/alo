# 🕯️ Marchand de Parchemins — `SHOP_PEN_32`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_PEN_32` |
| **Propriétaire** | Marchand de Parchemins `NPC_PEN_32` |
| **Zone / Sous-lieu** | Penwether, Marché des Sept Façades |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (7 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `CSM_PAR_001` | Parchemin de Retour à Alne | T1 | 50 | LOCAL | 8 | jour | — |
| `CSM_PAR_006` | Parchemin d'Identification | T1 | 30 | LOCAL | 10 | jour | — |
| `CSM_PAR_009` | Parchemin de Déliage Mineur | T2 | 135 | LOCAL | 4 | semaine | — |
| `CSM_PAR_010` | Parchemin de Purification | T2 | 140 | LOCAL | 4 | semaine | — |
| `CSM_PAR_012` | Parchemin de Soin | T1 | 55 | LOCAL | 6 | jour | — |
| `CSM_PAR_014` | Parchemin de Bouclier | T1 | 60 | LOCAL | 6 | jour | — |
| `CSM_PAR_011` | Parchemin de Boule de Feu | T1 | 55 | LOCAL | 6 | jour | — |

## 3. Politique de rachat
- **Rachète** : Parchemins usagés (20%), Livres anciens (25%)
- **Refuse** : Armes, armures, équipement

## 4. Ancrage zonal
Le Marchand de Parchemins récupère des textes anciens dans les ruines.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_PEN_32` · `!buy CSM_PAR_001` · `!sell CSM_PAR_001`
- GM : `!sys_market_price` — IA : `SYS_SET_SHOP_PRICES`, `SYS_GRANT_ITEM`
