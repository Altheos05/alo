# War March

## Identification Cardinal
- **Skill_ID** : `MAG_SUP_007`
- **Catégorie** : Magie — Support
- **Tier** : T3 · **Rareté** : Rare
- **Race Affinité** : Puca (+30% efficacité si cette race)

## Paramètres de Combat
| Paramètre | Valeur |
|---|---|
| Coût MP | 240 |
| Temps d'Incantation | 3s |
| Cooldown | 40 s |
| Niveau Requis | 25 |
| Interruptible (Casting Break) | Oui (si dégâts > 5% Max HP reçus) |

## Effet
Effet de soutien : applique un bonus (+10%) à la ou aux cible(s) alliée(s). Zone d’effet à partir du T3.

## Effet persistant (D90)
- **Effet_ID** : `EFF_MAG_SUP_007` · **Nom** : Marche de guerre
- **Stat** : `stat_agi` · **Valeur** : +10 % · **Durée** : 900 s
- Lançable hors combat (`!cast`) : T1-T2 soi ou un allié désigné, T3+ tout le groupe présent dans la zone.

## Formule de Dégâts / Effet
Sort de soutien — aucun dégât direct. Intensité indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast war_march` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : Conservatoire Puca d’Alne, maître Zephyrine `NPC_ALN_68`
- **Prix d'apprentissage** : 2200 Yrds (≈ 50 % d’un équipement T3)
- **Commande** : `!learn_skill MAG_SUP_007`

## Lore (Encyclopédie d'Argo)
Une marche entraînante qui accroît la vitesse et l’endurance de tout un groupe en déplacement.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_SUP_007')`
