# Eclipse

## Identification Cardinal
- **Skill_ID** : `MAG_TEN_009`
- **Catégorie** : Magie — Ténèbres
- **Tier** : T4 · **Rareté** : Épique
- **Race Affinité** : Spriggan (+30% efficacité si cette race)

## Paramètres de Combat
| Paramètre | Valeur |
|---|---|
| Coût MP | 430 |
| Temps d'Incantation | 4s |
| Cooldown | 3 min |
| Niveau Requis | 38 |
| Interruptible (Casting Break) | Oui (si dégâts > 5% Max HP reçus) |

## Effet
Effet d’affaiblissement : réduit une statistique de la ou des cible(s) ennemie(s) sur la durée. Zone d’effet à partir du T3.

## Effet sur la cible (combat)
- **Effet_ID** : `EFF_MAG_TEN_009` · **Nom** : Eclipse
- **Stat** : `stat_str` · **Valeur** : -30 % · **Durée** : 120 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort d’affaiblissement — aucun dégât direct. Intensité indexée sur INT et la résistance de la cible.

## Incantation
*Le joueur tape `!cast eclipse` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : Cercle des Ombres d’Alne, maître Roan `NPC_ALN_69`
- **Prix d'apprentissage** : 6500 Yrds (≈ 50 % d’un équipement T4)
- **Commande** : `!learn_skill MAG_TEN_009`

## Lore (Encyclopédie d'Argo)
Plonge une zone dans une nuit surnaturelle qui aveugle et affaiblit les ennemis.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_TEN_009')`
