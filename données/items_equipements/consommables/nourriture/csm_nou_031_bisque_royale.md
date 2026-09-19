# Bisque Royale

## Identification Cardinal
- **Item_ID** : `CSM_NOU_031`
- **Catégorie** : Nourriture · **Type** : Cuisine premium (buff majeur)
- **Tier** : T3 · **Rareté** : Rare
- **Niveau requis** : 25 · **Affinité raciale** : Aucune

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +10% INT |
| Durée | 45 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : Chef Aubin `NPC_ALN_47` / grandes tables de l'Archipel d'Écume
- **Recette** : 1× Chair de poisson-nacre + 1× crustacé du Lac + crème + Sel-de-lune *(haute cuisine)*
- **Prix** : 520 Yrds (achat) · 130 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Un velouté orangé si riche qu'une petite tasse suffit, tiré des crustacés les plus délicats du Lac Cristallin. Les archimages en font leur repas d'avant-grande-incantation : l'esprit s'aiguise pour une heure entière. Aubin refuse d'en révéler l'assaisonnement, prétextant qu'« un secret est le meilleur exhausteur de goût ».

## Intégration Bot
- Joueur : `!use CSM_NOU_031` — GM : `!sys_give CSM_NOU_031 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_031, 1)`
