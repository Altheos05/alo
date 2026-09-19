# Banquet des Neuf Races

## Identification Cardinal
- **Item_ID** : `CSM_NOU_029`
- **Catégorie** : Nourriture · **Type** : Cuisine premium (buff majeur)
- **Tier** : T3 · **Rareté** : Rare
- **Niveau requis** : 25 · **Affinité raciale** : Aucune

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +10% VIT |
| Durée | 45 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : Chef Aubin `NPC_ALN_47` (Alne, sur commande de guilde)
- **Recette** : 1× plat de chaque territoire (assemblage) + Racine d'ambre *(haute cuisine)*
- **Prix** : 650 Yrds (achat) · 162 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Le chef-d'œuvre politique d'Aubin : un plat unique composé d'un élément de chacune des neuf cuisines raciales, servi à Alne la neutre comme un symbole d'unité fragile. Il fortifie durablement — et, dit la rumeur, adoucit les tensions entre convives ennemis le temps d'un repas. Le commander, c'est faire une déclaration autant que dîner.

## Intégration Bot
- Joueur : `!use CSM_NOU_029` — GM : `!sys_give CSM_NOU_029 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_029, 1)`
