# Poisson au Sel

## Identification Cardinal
- **Item_ID** : `CSM_NOU_023`
- **Catégorie** : Nourriture · **Type** : Plat de taverne (buff mineur)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 12 · **Affinité raciale** : Aucune

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +5% INT |
| Durée | 40 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : tavernes portuaires (Archipel d'Écume, Alne)
- **Recette** : 1× poisson de lac + 1× Sel-de-lune, cuisson en croûte *(cuisine)*
- **Prix** : 100 Yrds (achat) · 25 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Cuit tout entier dans une croûte de sel qu'on brise à table, ce poisson garde une chair nacrée et parfumée. On dit dans l'Archipel que « le poisson nourrit la tête » — et les mages qui en mangent avant l'étude semblent leur donner raison. Un plat de fête bon marché, spectaculaire quand la croûte cède dans un nuage de vapeur.

## Intégration Bot
- Joueur : `!use CSM_NOU_023` — GM : `!sys_give CSM_NOU_023 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_023, 1)`
