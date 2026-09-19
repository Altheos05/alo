# 🌑 Marchand de Cristaux Fins, Bijoux & Cristaux Taillés — `SHOP_DUS_51`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_DUS_51` |
| **Propriétaire** | Marchand de Cristaux Fins `NPC_DUS_51` |
| **Zone / Sous-lieu** | Duskarn, Bazar des Ombres |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (9 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `CSM_CRI_005` | Cristal de Téléportation | T3 | 1 200 | LOCAL | 2 | semaine | Niv.20+ |
| `CSM_CRI_007` | Cristal de Fuite | T3 | 1 120 | LOCAL | 2 | semaine | Niv.20+ |
| `CSM_CRI_003` | Cristal de Mana | T3 | 1 200 | LOCAL | 2 | semaine | Niv.20+ |
| `CSM_NOU_004` | Miel Chantant de Lioda | T2 | 170 | IMPORT Lioda | 4 | semaine | — |
| `CSM_CRI_001` | Cristal de Soin | T3 | 1 080 | LOCAL | 3 | semaine | — |
| `CSM_NOU_005` | Sashimi de Perle | T2 | 100 | LOCAL | 4 | semaine | — |
| `MAT_MIN_002` | Cuivre Brut | T1 | 5 | LOCAL | 10 | jour | — |
| `MAT_MIN_003` | Étain des Collines | T1 | 5 | LOCAL | 10 | jour | — |
| `MSC_ENG_001` | Anneau d'Engagement | T2 | 50000 | LOCAL | ∞ | semaine | Niv. 15+ |

## 3. Politique de rachat
- **Rachète** : Cristaux T1-T2 (25%), bijoux, pierres taillées
- **Refuse** : Armes, armures, nourriture, objets de lumière sacrée

## 4. Ancrage zonal
Au Bazar des Ombres, il taille et vend les cristaux qui courent dans les veines du canyon.

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_DUS_51 · !taille_cristal`
- GM : `!sys_market_price — IA : SYS_SET_SHOP_PRICES, SYS_GRANT_ITEM`
