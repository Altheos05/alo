# Fricassée de la Nécropole

## Identification Cardinal
- **Item_ID** : `CSM_NOU_009`
- **Catégorie** : Nourriture · **Type** : Plat signature (Spriggan)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 10 · **Affinité raciale** : Spriggan (+5% aux bonus si Spriggan)

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +5% INT |
| Durée | 40 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : tavernes de Penwether (`ZONE_SPR_CAP_001`)
- **Recette** : 2× Champignon-des-ombres + 1× herbe grise des Terres Grises *(cuisine sombre)*
- **Prix** : 120 Yrds (achat) · 30 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Un plat de champignons cueillis à la lisière de la Nécropole Antique, là où personne d'autre n'ose récolter. Les Spriggan les cuisinent avec une audace tranquille, persuadés que ce qui pousse près des morts nourrit l'esprit des vivants. Terreux, umami, légèrement enivrant, il aiguise la pensée — parfait avant une plongée dans les salles illusoires de Pennroth.

## Intégration Bot
- Joueur : `!use CSM_NOU_009` — GM : `!sys_give CSM_NOU_009 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_009, 1)`
