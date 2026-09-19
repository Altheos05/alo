# 🔨 Marchand de Gemmes, Pierres précieuses — `SHOP_BRO_34`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_BRO_34` |
| **Propriétaire** | Marchand de Gemmes `NPC_BRO_34` |
| **Zone / Sous-lieu** | Brokkheim, Halle du Marteau |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (8 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `MAT_GEM_002` | Gemme d'Obsidienne | T3 | 220 | LOCAL | 2 | semaine | Niv. 20+ |
| `MAT_GEM_004` | Perle d'Undine | T3 | 260 | LOCAL | 2 | semaine | Niv. 20+ |
| `MAT_GEM_006` | Saphir des Glaces | T3 | 240 | LOCAL | 2 | semaine | Niv. 20+ |
| `MAT_GEM_008` | Opale des Ruines | T3 | 300 | LOCAL | 2 | semaine | Niv. 20+ |
| `MAT_HRB_008` | Fleur de Lune | T2 | 5 | LOCAL | 5 | semaine | — |
| `MAT_HRB_017` | Fleur des Forges | T2 | 4 | LOCAL | 5 | semaine | — |
| `MAT_HRB_022` | Herbe du Vent | T2 | 4 | LOCAL | 5 | semaine | — |
| `MSC_ENG_001` | Anneau d'Engagement | T2 | 50000 | LOCAL | ∞ | semaine | Niv. 15+ |

## 3. Politique de rachat
- **Rachète** : Gemmes taillées (25%), gemmes brutes (20%)
- **Refuse** : Armes, armures, outils, consommables

## 4. Ancrage zonal
Vend des pierres précieuses. Prix locaux ×1.0 (R4 Brokkheim).

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_BRO_34` · `!buy MAT_GEM_002` · `!sell MAT_GEM_002`
- GM : `!sys_market_price` — IA : `SYS_SET_SHOP_PRICES`, `SYS_GRANT_ITEM`
