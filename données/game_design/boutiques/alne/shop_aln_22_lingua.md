# 🌳 Lingua — `SHOP_ALN_22`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_ALN_22` |
| **Propriétaire** | Lingua `NPC_ALN_22` (`T_NPC.shop_ref` → `SHOP_ALN_22`) |
| **Zone / Sous-lieu** | `ZONE_NEU_CAP_001` — Alne, Grande Bibliothèque de l'Arbre |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (4 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `CSM_PAR_006` | Parchemin d'Identification | T1 | 30 | LOCAL | ∞ | hebdo | — |
| `CSM_PAR_009` | Parchemin de Déliage Mineur | T2 | 135 | LOCAL | ∞ | hebdo | — |
| `CSM_PAR_010` | Parchemin de Purification | T2 | 140 | LOCAL | ∞ | hebdo | — |
| `ARM_TET_085` | Chapeau de l'Encyclopédiste | T3 | 3760 | LOCAL | 3 | hebdo | — |

## 3. Politique de rachat
- **Rachète** : vieux grimoires et parchemins à 25 %.
- **Refuse** : objets liés, T5, armes.

## 4. Ancrage zonal
Traductrice des 9 langues raciales, échoppe adossée à la Bibliothèque : elle vend les parchemins savants (identification, réparation, déliage, purification) et le nécessaire d'érudit. Traduit un mot qui n'existe dans aucune langue — indice du fil « mémoire réécrite » (Valerius `NPC_ALN_01`).

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_ALN_22` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` · `!sys_shop_restock SHOP_ALN_22` — IA : `SYS_SET_SHOP_PRICES`, `SYS_SHOP_RESTOCK`, `SYS_GRANT_ITEM`
