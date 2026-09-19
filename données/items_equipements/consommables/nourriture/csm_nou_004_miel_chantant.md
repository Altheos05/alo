# Miel Chantant de Lioda

## Identification Cardinal
- **Item_ID** : `CSM_NOU_004`
- **Catégorie** : Nourriture · **Type** : Plat signature (Puca)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 10 · **Affinité raciale** : Puca (+5% aux bonus si Puca)

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +5% INT |
| Durée | 40 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : tavernes de Lioda (`ZONE_PUC_CAP_001`)
- **Recette** : 1× Miel des ruches-résonnantes + 1× Fleur-de-lune *(cuisine)*
- **Prix** : 120 Yrds (achat) · 30 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Récolté dans les ruches suspendues autour de l'Amphithéâtre, ce miel « chante » — un fin bourdonnement musical quand on remue le pot. Les bardes Puca en prennent une cuillerée avant de composer, jurant qu'il éclaircit les idées et accorde l'esprit. Doux, ambré, légèrement pétillant : c'est le petit-déjeuner des artistes de Lioda.

## Intégration Bot
- Joueur : `!use CSM_NOU_004` — GM : `!sys_give CSM_NOU_004 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_004, 1)`
