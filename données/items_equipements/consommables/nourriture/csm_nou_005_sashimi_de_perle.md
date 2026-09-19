# Sashimi de Perle

## Identification Cardinal
- **Item_ID** : `CSM_NOU_005`
- **Catégorie** : Nourriture · **Type** : Plat signature (Undine)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 10 · **Affinité raciale** : Undine (+5% aux bonus si Undine)

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +5% INT |
| Durée | 40 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : tavernes de l'Archipel d'Écume (`ZONE_UND_CAP_001`)
- **Recette** : 1× Chair de poisson-nacre + 1× Algue-souffle + 1× Sel-de-lune *(cuisine crue)*
- **Prix** : 125 Yrds (achat) · 31 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Des tranches translucides de poisson-nacre disposées comme des pétales, servies sur un lit de glace du Lac Cristallin. La cuisine Undine ne cache rien sous la cuisson : elle montre la fraîcheur, et la fraîcheur suffit. On dit que la chair « nacrée » nourrit l'esprit autant que le corps — les mages-soigneurs de l'Archipel en font leur repas d'avant-plongée.

## Intégration Bot
- Joueur : `!use CSM_NOU_005` — GM : `!sys_give CSM_NOU_005 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_005, 1)`
