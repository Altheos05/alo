# Ragoût des Geysers

## Identification Cardinal
- **Item_ID** : `CSM_NOU_008`
- **Catégorie** : Nourriture · **Type** : Plat signature (Leprechaun)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 10 · **Affinité raciale** : Leprechaun (+5% aux bonus si Leprechaun)

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +5% résistance au feu |
| Durée | 40 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : tavernes de Brokkheim (`ZONE_LEP_CAP_001`)
- **Recette** : 1× Racine bouillie + 1× minerai comestible (sel de scorie) + 1× graisse animale *(cuisine à la vapeur de geyser)*
- **Prix** : 118 Yrds (achat) · 29 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Cuit à la vapeur des geysers de la Vallée, ce ragoût a un fumet minéral que les Leprechaun revendiquent comme le meilleur du monde — les autres races restent poliment sceptiques. Il « tanne » l'intérieur, disent les artificiers, les rendant plus résistants à la chaleur de leurs propres ateliers. Un plat d'ingénieurs : fonctionnel avant d'être délicieux.

## Intégration Bot
- Joueur : `!use CSM_NOU_008` — GM : `!sys_give CSM_NOU_008 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_008, 1)`
