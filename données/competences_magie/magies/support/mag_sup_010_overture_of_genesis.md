# Overture of Genesis

## Identification Cardinal
- **Skill_ID** : `MAG_SUP_010`
- **Catégorie** : Magie — Support
- **Tier** : T5 · **Rareté** : Légendaire
- **Race Affinité** : Puca (+30% efficacité si cette race)

## Paramètres de Combat
| Paramètre | Valeur |
|---|---|
| Coût MP | 680 |
| Temps d'Incantation | 5s |
| Cooldown | 1 / combat |
| Niveau Requis | 46 |
| Interruptible (Casting Break) | Oui (si dégâts > 5% Max HP reçus) |

## Effet
Effet de soutien : applique un bonus (+10%) à la ou aux cible(s) alliée(s). Zone d’effet à partir du T3.

## Effet persistant (D90)
- **Effet_ID** : `EFF_MAG_SUP_010` · **Nom** : Ouverture de la Genèse
- **Stat** : `stat_int` · **Valeur** : +10 % · **Durée** : 1800 s
- Lançable hors combat (`!cast`) : T1-T2 soi ou un allié désigné, T3+ tout le groupe présent dans la zone.

## Formule de Dégâts / Effet
Sort de soutien — aucun dégât direct. Intensité indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast overture_of_genesis` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : **Quête de titre** (T5 jamais enseigné en boutique de skill) — récompense de haut niveau
- **Prix d'apprentissage** : Non achetable (déblocage par quête)
- **Commande** : `!learn_skill MAG_SUP_010`

## Lore (Encyclopédie d'Argo)
L’ouverture de la Genèse, fréquence proche de la Partition Originelle ; titre-quête des grands bardes Puca.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_SUP_010')`
