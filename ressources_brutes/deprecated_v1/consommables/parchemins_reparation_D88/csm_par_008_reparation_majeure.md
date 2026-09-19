# Parchemin de Réparation Majeure

## Identification Cardinal
- **Item_ID** : `CSM_PAR_008`
- **Catégorie** : Parchemin · **Type** : Utilitaire (réparation)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 15 · **Affinité raciale** : Aucune

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | Restaure 100% de la durabilité d'une pièce d'équipement (hors T5) |
| Durée | Instantané |
| Cooldown | 5 s |
| Cumulable | NON |

## Acquisition & Chaînage économique
- **Source** : forgerons de capitale et scribes confirmés
- **Recette** : 2× Papier-rune + 1× lingot de fer + 1× Éclat de saphir brut *(scribe-forgeron)*
- **Prix** : 180 Yrds (achat) · 45 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Là où le parchemin mineur rafistole, celui-ci restitue une pièce à l'état neuf, comme sortie de l'enclume. Précieux au cœur d'un long donjon, quand une armure de raid menace de céder avant le boss. Cher, mais infiniment moins qu'une pièce épique perdue faute d'un point de durabilité.

## Intégration Bot
- Joueur : `!use CSM_PAR_008` — GM : `!sys_give CSM_PAR_008 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_PAR_008, 1)`
