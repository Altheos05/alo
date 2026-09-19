# Parchemin de Réparation Mineure

## Identification Cardinal
- **Item_ID** : `CSM_PAR_007`
- **Catégorie** : Parchemin · **Type** : Utilitaire (réparation)
- **Tier** : T1 · **Rareté** : Commun
- **Niveau requis** : 3 · **Affinité raciale** : Aucune

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | Restaure 30% de la durabilité d'une pièce d'équipement (hors T5) |
| Durée | Instantané |
| Cooldown | 5 s |
| Cumulable | NON |

## Acquisition & Chaînage économique
- **Source** : forgerons ambulants et scribes (toutes villes)
- **Recette** : 1× Papier-rune + 1× limaille de fer + 1× Encre-de-seiche *(scribe-forgeron)*
- **Prix** : 55 Yrds (achat) · 13 Yrds (revente)

## Lore (Encyclopédie d'Argo)
La réparation de terrain, pour quand la forge est à trois jours de marche et que l'épée grince déjà. Un tiers de durabilité regagnée, le temps de rentrer sans se battre à mains nues. Les forgerons de ville le méprisent — « du rafistolage » — mais en vendent quand même, car un client vivant revient toujours à l'atelier.

## Intégration Bot
- Joueur : `!use CSM_PAR_007` — GM : `!sys_give CSM_PAR_007 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_PAR_007, 1)`
