# 🔨 Prêteur Fenn, Rachat et Enchères — `SHOP_BRO_05`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_BRO_05` |
| **Propriétaire** | Prêteur Fenn `NPC_BRO_05` |
| **Zone / Sous-lieu** | Brokkheim, Halle du Marteau |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (5 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
| `WPN_DAG_001` | Dague de Fer | T1 | 150 | LOCAL | 10 | jour | — |
| `WPN_MAS_001` | Masse Cloutée | T1 | 230 | LOCAL | 10 | jour | — |
| `MAT_CUI_014` | Cuir de Loup | T2 | 22 | LOCAL | 5 | semaine | — |
| `MAT_CUI_015` | Croc de Wyrm Mineur | T2 | 40 | LOCAL | 5 | semaine | — |
| `MAT_CUI_016` | Peau de Serpent | T2 | 25 | LOCAL | 5 | semaine | — |

## 3. Politique de rachat
- **Rachète** : Tout objet (20–30% selon état)
- **Refuse** : Armes siglées du Conseil, registres officiels

## 4. Ancrage zonal
Fenn tient le comptoir de prêt et d'enchères. Prix locaux ×1.0 (R4 Brokkheim).

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_BRO_05` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` — IA : `SYS_SET_SHOP_PRICES`, `SYS_GRANT_ITEM`
