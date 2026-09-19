# Gaia Fortress

## Identification Cardinal
- **Skill_ID** : `MAG_TER_009`
- **Catégorie** : Magie — Terre
- **Tier** : T4 · **Rareté** : Épique
- **Race Affinité** : Gnome (+30% efficacité si cette race)

## Paramètres de Combat
| Paramètre | Valeur |
|---|---|
| Coût MP | 430 |
| Temps d'Incantation | 4s |
| Cooldown | 3 min |
| Niveau Requis | 38 |
| Interruptible (Casting Break) | Oui (si dégâts > 5% Max HP reçus) |

## Effet
Effet de soutien : applique un bonus (+10%) à la ou aux cible(s) alliée(s). Zone d’effet à partir du T3.

## Effet persistant (D90)
- **Effet_ID** : `EFF_MAG_TER_009` · **Nom** : Gaia Fortress
- **Stat** : `stat_vit` · **Valeur** : +10 % · **Durée** : 1200 s
- Lançable hors combat (`!cast`) : T1-T2 soi ou un allié désigné, T3+ tout le groupe présent dans la zone.

## Formule de Dégâts / Effet
Sort de soutien — aucun dégât direct. Intensité indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast gaia_fortress` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : École de la Terre d’Alne, maître Roan `NPC_ALN_69`
- **Prix d'apprentissage** : 6500 Yrds (≈ 50 % d’un équipement T4)
- **Commande** : `!learn_skill MAG_TER_009`

## Lore (Encyclopédie d'Argo)
Une forteresse de pierre vivante autour du groupe, quasi imprenable un court instant.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_TER_009')`
