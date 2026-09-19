# ⛏️ Location d'Outils Miniers — `SHOP_GRA_32`

## 1. Identification Cardinal
| Champ | Valeur |
|---|---|
| **SHOP_ID** | `SHOP_GRA_32` |
| **Propriétaire** | Loueur d'Outils `NPC_GRA_32` |
| **Zone / Sous-lieu** | Granzam, Atelier des Profondeurs |
| **Type** | BOUTIQUE |
| **Accès** | libre |

## 2. Inventaire (10 articles)
| Item_ID | Nom | Tier | Prix (Yrds) | Origine | Stock | Restock | Condition |
|---|---|---|---|---|---|---|---|
|`CSM_CRI_008`|Cristal d'Enregistrement|T2|200|LOCAL (-20%)|15|jour|---|
|`CSM_CRI_009`|Pierre de Rappel|T2|200|LOCAL (-20%)|15|jour|---|
|`CSM_NOU_014`|Ration de Campagne|T1|45|LOCAL (-20%)|20|jour|---|
|`CSM_NOU_015`|Galette d'Avoine|T1|20|LOCAL (-20%)|25|jour|---|
|`MAT_HRB_018`|Fleur de Lotus|T3|10|IMPORT (+40%)|6|semaine|---|
|`OUT_PIO_001`|Pioche en Fer|T1|150|LOCAL|∞|semaine|—|
|`OUT_PIO_002`|Pioche en Acier|T2|600|LOCAL|∞|semaine|Niv. 10+|
|`OUT_PIO_003`|Pioche d'Obsidienne|T3|2400|LOCAL|∞|semaine|Niv. 20+|
|`OUT_PIO_004`|Pioche en Mithril|T4|9000|LOCAL|∞|semaine|Niv. 35+|
|`OUT_PIO_005`|Pioche d'Orichalque|T5|30000|LOCAL|∞|semaine|Niv. 50+|

## 3. Politique de rachat

## 4. Ancrage zonal

## 5. Intégration Bot
- Joueur : `!shop_list SHOP_GRA_32` · `!buy <Item_ID>` · `!sell <Item_ID>`
- GM : `!sys_market_price` — IA : `SYS_SET_SHOP_PRICES`, `SYS_GRANT_ITEM`
