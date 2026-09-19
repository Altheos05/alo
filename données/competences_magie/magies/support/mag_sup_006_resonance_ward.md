# Resonance Ward

## Identification Cardinal
- **Skill_ID** : `MAG_SUP_006`
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
- **Effet_ID** : `EFF_MAG_SUP_006` · **Nom** : Garde de résonance
- **Stat** : `stat_int` · **Valeur** : +10 % · **Durée** : 900 s
- Lançable hors combat (`!cast`) : T1-T2 soi ou un allié désigné, T3+ tout le groupe présent dans la zone.

## Formule de Dégâts / Effet
Sort de soutien — aucun dégât direct. Intensité indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast resonance_ward` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : Conservatoire Puca d’Alne, maître Zephyrine `NPC_ALN_68`
- **Prix d'apprentissage** : 2200 Yrds (≈ 50 % d’un équipement T3)
- **Commande** : `!learn_skill MAG_SUP_006`

## Lore (Encyclopédie d'Argo)
Une onde de résonance qui protège le groupe des attaques magiques ; interagit avec l’Harmonie de Fond de Lioda.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_SUP_006')`
