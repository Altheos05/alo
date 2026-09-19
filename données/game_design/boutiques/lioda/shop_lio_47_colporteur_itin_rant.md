# 🎭 Colporteur Itinérant — `SHOP_LIO_47`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_LIO_47` |
| **Propriétaire** | Marchand Itinérant `NPC_LIO_47` |
| **Zone / Sous-lieu** | Lioda, itinérant |
| **Type** | ÉTAL |
| **Accès** | libre |

## 2. Inventaire (9 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `CSM_PAR_003` | Parchemin de Rappel | T2 | 105 | LOCAL | 6 | semaine | — |
| `CSM_PAR_004` | Parchemin de Retour de Guilde | T2 | 110 | LOCAL | 4 | semaine | Niv. 15+ |
| `CSM_PAR_013` | Parchemin d'Éclair | T2 | 120 | LOCAL | 4 | semaine | Niv. 15+ |
| `WPN_RAP_002` | Rapière du Zéphyr | T2 | 1260 | IMPORT | 2 | mois | — |
| `WPN_DAG_002` | Croc de Freelia | T2 | 1190 | IMPORT | 2 | mois | — |
| `WPN_BAG_002` | Baguette de Source | T2 | 1260 | IMPORT | 2 | mois | Niv. 15+ |
| `CSM_POT_012` | Potion de Mana | T2 | 180 | IMPORT | 6 | semaine | — |
| `CSM_CRI_003` | Cristal de Mana | T3 | 2100 | IMPORT | 4 | mois | Niv. 20+ |
| `MSC_ENG_001` | Anneau d'Engagement | T2 | 50000 | LOCAL | ∞ | semaine | Niv. 15+ |

## 3. Politique de rachat
- **Rachète** : Curiosités (20%), partitions (25%)
- **Refuse** : Armes lourdes, minerais bruts

## 4. Ancrage zonal
Le Marchand Itinérant relie les marchands d'Alne, Swilvane et Freelia à Lioda. Il commerce des parchemins et des accessoires. Ses articles LOCAUX (−20%) sont des trouvailles locales. Les armes et potions importées subissent la surtaxe IMPORT (+40%).

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_LIO_47` · `!buy CSM_PAR_003` · `!sell CSM_PAR_003`
- GM : `!sys_market_price` — IA : `SYS_SET_SHOP_PRICES`, `SYS_GRANT_ITEM`
