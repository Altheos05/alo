# 🔨 Marchand d'Outils, Bois et matériaux — `SHOP_BRO_33`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_BRO_33` |
| **Propriétaire** | Marchand d'Outils `NPC_BRO_33` |
| **Zone / Sous-lieu** | Brokkheim, Halle du Marteau |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (11 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `MAT_WOD_001` | Bois d'If — `MAT_WOD_001` | T1 | 6 | LOCAL | 10 | jour | — |
| `MAT_WOD_002` | Bois de Chêne — `MAT_WOD_002` | T1 | 5 | LOCAL | 10 | jour | — |
| `MAT_WOD_003` | Branche de Saule — `MAT_WOD_003` | T1 | 4 | LOCAL | 10 | jour | — |
| `MAT_WOD_004` | Bois de Frêne — `MAT_WOD_004` | T2 | 25 | LOCAL | 5 | semaine | — |
| `MAT_WOD_005` | Bois d'Ébène — `MAT_WOD_005` | T2 | 45 | LOCAL | 5 | semaine | — |
| `MAT_WOD_006` | Cèdre des Ombres — `MAT_WOD_006` | T2 | 30 | LOCAL | 5 | semaine | — |
| `MAT_WOD_007` | Bois de Charme — `MAT_WOD_007` | T2 | 35 | LOCAL | 5 | semaine | — |
| `MAT_WOD_013` | Bambou de Vent — `MAT_WOD_013` | T2 | 20 | LOCAL | 5 | semaine | — |
| `OUT_PIO_001` | Pioche en Fer | T1 | 150 | LOCAL | ∞ | semaine | — |
| `OUT_PIO_002` | Pioche en Acier | T2 | 600 | LOCAL | ∞ | semaine | Niv. 10+ |
| `OUT_PIO_003` | Pioche d'Obsidienne | T3 | 2400 | LOCAL | ∞ | semaine | Niv. 20+ |

## 3. Politique de rachat
- **Rachète** : Outils T1 (20%), bois (25%)
- **Refuse** : Armes, armures, gemmes, consommables

## 4. Ancrage zonal
Référence pour les matériaux de forge. Prix locaux ×1.0 (R4 Brokkheim).

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_BRO_33` · `!buy MAT_WOD_001` · `!sell MAT_WOD_001`
- GM : `!sys_market_price` — IA : `SYS_SET_SHOP_PRICES`, `SYS_GRANT_ITEM`
