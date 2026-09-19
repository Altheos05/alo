# Tambouille douteuse — `CSM_CUI_002`

## Identification Cardinal
- **Item_ID** : `CSM_CUI_002`
- **Catégorie** : Nourriture · **Type** : Plat de marmite (D93)
- **Tier** : T1 · **Rareté** : Commun
- **Prix** : 0 Yrds (achat) · 5 Yrds (revente)

## Effet
Variable : PV, effet et durée sont calculés à la cuisson à partir des ingrédients et gardés sur l'exemplaire (`T_INVENTORY.instance_data`) — `system_mechanics/cuisine_libre.md` §3-4.

## Lore
Une mixture où surnagent des morceaux de monstre. Nourrissant, à peine.

## Intégration Bot
- Joueur : `!marmite …` (obtention) · `!manger CSM_CUI_002` — GM : `!sys_give CSM_CUI_002 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_CUI_002, 1)`
