# Pain de Roche de Granzam

## Identification Cardinal
- **Item_ID** : `CSM_NOU_007`
- **Catégorie** : Nourriture · **Type** : Plat signature (Gnome)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 10 · **Affinité raciale** : Gnome (+5% aux bonus si Gnome)

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +5% VIT |
| Durée | 40 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : tavernes de Granzam (`ZONE_GNO_CAP_001`)
- **Recette** : 1× Farine de racine dure + 1× Sel-de-mine + 1× eau de source *(boulangerie)*
- **Prix** : 110 Yrds (achat) · 27 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Dense au point de casser une dent mal habituée, ce pain gris se conserve des semaines au fond d'un sac de mineur. Les Gnomes le trempent dans la soupe pour l'attendrir, et affirment qu'il « lest » le corps — le rend plus solide, plus enraciné. C'est le pain des galeries profondes, taillé pour ceux qui ne remontent pas voir le soleil de la journée.

## Intégration Bot
- Joueur : `!use CSM_NOU_007` — GM : `!sys_give CSM_NOU_007 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_007, 1)`
