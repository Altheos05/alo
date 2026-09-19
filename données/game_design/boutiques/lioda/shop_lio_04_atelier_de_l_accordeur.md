# 🎭 Atelier de l'Accordeur — `SHOP_LIO_04`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_LIO_04` |
| **Propriétaire** | Accordeur Fitz `NPC_LIO_04` |
| **Zone / Sous-lieu** | Lioda, Atelier des Cordes |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (6 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `CSM_PAR_006` | Parchemin d'Identification | T1 | 30 | LOCAL | 10 | jour | — |
| `CSM_PAR_009` | Parchemin de Déliage Mineur | T2 | 135 | LOCAL | 6 | semaine | — |
| `CSM_PAR_010` | Parchemin de Purification | T2 | 140 | LOCAL | 5 | semaine | — |
| `WPN_RAP_005` | Rapière de Contre-Chant | T3 | 6440 | IMPORT | 2 | mois | Niv. 20+ |
| `CSM_POT_003` | Potion de Soin | T2 | 170 | IMPORT | 8 | semaine | — |
| `CSM_CRI_008` | Cristal d'Enregistrement | T2 | 350 | IMPORT | 4 | semaine | — |

## 3. Politique de rachat
- **Rachète** : Instruments abîmés (25%), matériaux d'instrument (25%)
- **Refuse** : Armes lourdes, armures, gemmes

## 4. Ancrage zonal
Fitz reçoit les instruments de Cordelia pour les régler dans son Atelier des Cordes. Ses parchemins LOCAUX (−20%) sont préparés sur place avec des encres sonores. La Rapière de Contre-Chant est importée de l'extérieur et subit la surtaxe IMPORT (+40%).

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_LIO_04` · `!buy <Item_ID>` · `!repair (service)`
- GM : `!sys_market_price` — IA : `SYS_SET_SHOP_PRICES`, `SYS_GRANT_ITEM`
