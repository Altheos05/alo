# Abyssal Grasp

## Identification Cardinal
- **Skill_ID** : `MAG_EAU_009`
- **Catégorie** : Magie — Eau
- **Tier** : T4 · **Rareté** : Épique
- **Race Affinité** : Undine (+30% efficacité si cette race)

## Paramètres de Combat
| Paramètre | Valeur |
|---|---|
| Coût MP | 430 |
| Temps d'Incantation | 4s |
| Cooldown | 3 min |
| Niveau Requis | 38 |
| Interruptible (Casting Break) | Oui (si dégâts > 5% Max HP reçus) |

## Effet
Effet de contrôle : entrave, immobilise ou repousse la ou les cible(s). Zone d’effet à partir du T3.

## Effet sur la cible (combat)
- **Effet_ID** : `EFF_MAG_EAU_009` · **Nom** : Abyssal Grasp
- **Stat** : `stat_agi` · **Valeur** : -50 % · **Durée** : 120 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort de contrôle — dégâts secondaires 1250 × 0,3 ; durée indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast abyssal_grasp` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : Guilde des Ondins d’Alne, maître Zephyrine `NPC_ALN_68`
- **Prix d'apprentissage** : 6500 Yrds (≈ 50 % d’un équipement T4)
- **Commande** : `!learn_skill MAG_EAU_009`

## Lore (Encyclopédie d'Argo)
Des tentacules d’eau noire jaillies du sol qui immobilisent plusieurs cibles à la fois.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_EAU_009')`
