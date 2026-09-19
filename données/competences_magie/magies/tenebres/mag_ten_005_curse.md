# Curse

## Identification Cardinal
- **Skill_ID** : `MAG_TEN_005`
- **Catégorie** : Magie — Ténèbres
- **Tier** : T2 · **Rareté** : Peu commun
- **Race Affinité** : Spriggan (+30% efficacité si cette race)

## Paramètres de Combat
| Paramètre | Valeur |
|---|---|
| Coût MP | 110 |
| Temps d'Incantation | 2s |
| Cooldown | 10 s |
| Niveau Requis | 14 |
| Interruptible (Casting Break) | Oui (si dégâts > 5% Max HP reçus) |

## Effet
Effet d’affaiblissement : réduit une statistique de la ou des cible(s) ennemie(s) sur la durée. Zone d’effet à partir du T3.

## Effet sur la cible (combat)
- **Effet_ID** : `EFF_MAG_TEN_005` · **Nom** : Curse
- **Stat** : `stat_str` · **Valeur** : -20 % · **Durée** : 60 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort d’affaiblissement — aucun dégât direct. Intensité indexée sur INT et la résistance de la cible.

## Incantation
*Le joueur tape `!cast curse` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : Cercle des Ombres d’Alne, maître Roan `NPC_ALN_69`
- **Prix d'apprentissage** : 500 Yrds (≈ 50 % d’un équipement T2)
- **Commande** : `!learn_skill MAG_TEN_005`

## Lore (Encyclopédie d'Argo)
Une malédiction qui affaiblit les statistiques d’une cible dans la durée.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_TEN_005')`
