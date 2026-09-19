# Breeze Step

## Identification Cardinal
- **Skill_ID** : `MAG_VEN_003`
- **Catégorie** : Magie — Vent
- **Tier** : T1 · **Rareté** : Commun
- **Race Affinité** : Sylph (+30% efficacité si cette race)

## Paramètres de Combat
| Paramètre | Valeur |
|---|---|
| Coût MP | 40 |
| Temps d'Incantation | 1.5s |
| Cooldown | Aucun |
| Niveau Requis | 5 |
| Interruptible (Casting Break) | Oui (si dégâts > 5% Max HP reçus) |

## Effet
Effet de soutien : applique un bonus (+5%) à la ou aux cible(s) alliée(s). Zone d’effet à partir du T3.

## Effet persistant (D90)
- **Effet_ID** : `EFF_MAG_VEN_003` · **Nom** : Breeze Step
- **Stat** : `stat_agi` · **Valeur** : +5 % · **Durée** : 300 s
- Lançable hors combat (`!cast`) : T1-T2 soi ou un allié désigné, T3+ tout le groupe présent dans la zone.

## Formule de Dégâts / Effet
Sort de soutien — aucun dégât direct. Intensité indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast breeze_step` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : École du Vent de Swilvane, maître Zeph `NPC_SWI_71`
- **Prix d'apprentissage** : 150 Yrds (≈ 50 % d’un équipement T1)
- **Commande** : `!learn_skill MAG_VEN_003`

## Lore (Encyclopédie d'Argo)
Un souffle porteur qui augmente brièvement la vitesse de vol du lanceur.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_VEN_003')`
