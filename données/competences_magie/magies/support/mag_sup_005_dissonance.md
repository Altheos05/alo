# Dissonance

## Identification Cardinal
- **Skill_ID** : `MAG_SUP_005`
- **Catégorie** : Magie — Support
- **Tier** : T2 · **Rareté** : Peu commun
- **Race Affinité** : Puca (+30% efficacité si cette race)

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
- **Effet_ID** : `EFF_MAG_SUP_005` · **Nom** : Dissonance
- **Stat** : `stat_int` · **Valeur** : -20 % · **Durée** : 60 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort d’affaiblissement — aucun dégât direct. Intensité indexée sur INT et la résistance de la cible.

## Incantation
*Le joueur tape `!cast dissonance` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : Conservatoire Puca d’Alne, maître Zephyrine `NPC_ALN_68`
- **Prix d'apprentissage** : 500 Yrds (≈ 50 % d’un équipement T2)
- **Commande** : `!learn_skill MAG_SUP_005`

## Lore (Encyclopédie d'Argo)
Une fausse note ciblée qui brouille la concentration d’un ennemi et casse son incantation.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_SUP_005')`
