# Festin du Chef

## Identification Cardinal
- **Item_ID** : `CSM_NOU_028`
- **Catégorie** : Nourriture · **Type** : Cuisine premium (buff majeur)
- **Tier** : T3 · **Rareté** : Rare
- **Niveau requis** : 25 · **Affinité raciale** : Aucune

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +10% STR |
| Durée | 45 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : Chef Aubin `NPC_ALN_47` (Alne) et grandes tables des capitales
- **Recette** : 2× Viande épicée + 1× Piment-de-braise + 1× Racine d'ambre + savoir-faire de maître-cuisinier *(haute cuisine)*
- **Prix** : 500 Yrds (achat) · 125 Yrds (revente)

## Lore (Encyclopédie d'Argo)
La pièce maîtresse du répertoire d'Aubin : un rôti glacé au feu, servi sur un plateau qui fume encore. Une heure entière de force accrue — les guildes en commandent des tablées avant un raid de palier, et Aubin en fait tout un cérémonial. « On ne se bat pas le ventre vide et l'âme triste », répète-t-il en découpant.

## Intégration Bot
- Joueur : `!use CSM_NOU_028` — GM : `!sys_give CSM_NOU_028 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_028, 1)`
