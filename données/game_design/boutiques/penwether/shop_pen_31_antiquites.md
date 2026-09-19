# 🕯️ Marchand d'Antiquités — `SHOP_PEN_31`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_PEN_31` |
| **Propriétaire** | Marchand d'Antiquités `NPC_PEN_31` |
| **Zone / Sous-lieu** | Penwether, Marché des Sept Façades |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (8 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `MAT_DRP_017` | Éclat de Miroir | T3 | 400 | LOCAL | 2 | 10j | Niv. 20+ |
| `MAT_DRP_016` | Braise de Forge | T3 | 400 | LOCAL | 3 | semaine | — |
| `MAT_DRP_013` | Croc de Salamander | T2 | 120 | LOCAL | 5 | semaine | — |
| `MAT_DRP_015` | Épine Imp | T2 | 120 | LOCAL | 5 | semaine | — |
| `MAT_GEM_005` | Rubis de Feu | T3 | 190 | LOCAL | 4 | semaine | — |
| `MAT_GEM_006` | Saphir des Glaces | T3 | 190 | LOCAL | 4 | semaine | — |
| `MAT_DRP_001` | Glande Bouillante Pure | T2 | 120 | LOCAL | 4 | semaine | — |
| `MSC_ENG_001` | Anneau d'Engagement | T2 | 50000 | LOCAL | ∞ | semaine | Niv. 15+ |

## 3. Politique de rachat
- **Rachète** : Antiquités des ruines (20%), Bijoux anciens (20%)
- **Refuse** : Objets neufs, équipement standard

## 4. Ancrage zonal
Le Marchand d'Antiquités vend des pièces qu'il dit « vieilles de 500 ans ».

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_PEN_31` · `!buy MAT_DRP_017` · `!sell MAT_DRP_017`
- GM : `!sys_market_price` — IA : `SYS_SET_SHOP_PRICES`, `SYS_GRANT_ITEM`
