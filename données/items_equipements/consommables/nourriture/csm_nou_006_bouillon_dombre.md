# Bouillon d'Ombre

## Identification Cardinal
- **Item_ID** : `CSM_NOU_006`
- **Catégorie** : Nourriture · **Type** : Plat signature (Imp)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 10 · **Affinité raciale** : Imp (+5% aux bonus si Imp)

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +5% STR |
| Durée | 40 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : tavernes de Duskarn (`ZONE_IMP_CAP_001`)
- **Recette** : 1× Champignon-des-ombres + 1× os à moelle + 1× Piment-de-braise *(cuisine)*
- **Prix** : 118 Yrds (achat) · 29 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Noir comme la nuit permanente de Duskarn, ce bouillon mijote pendant des jours sur les feux couverts du canyon. Les Imp le boivent brûlant, dans le silence — parler en mangeant, chez eux, porte malheur. Épais, terreux, presque intimidant, il donne une force sourde qui dure. Le goûter, c'est goûter à la patience d'un peuple qui n'a jamais vu l'aube.

## Intégration Bot
- Joueur : `!use CSM_NOU_006` — GM : `!sys_give CSM_NOU_006 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_006, 1)`
