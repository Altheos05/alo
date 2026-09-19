# Sanctuary

## Identification Cardinal
- **Skill_ID** : `MAG_GUE_007`
- **Catégorie** : Magie — Guérison
- **Tier** : T3 · **Rareté** : Rare
- **Race Affinité** : Undine (+30% efficacité si cette race)

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
- **Effet_ID** : `EFF_MAG_GUE_007` · **Nom** : Sanctuaire
- **Stat** : `stat_vit` · **Valeur** : +10 % · **Durée** : 900 s
- Lançable hors combat (`!cast`) : T1-T2 soi ou un allié désigné, T3+ tout le groupe présent dans la zone.

## Formule de Dégâts / Effet
Sort de soutien — aucun dégât direct. Intensité indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast sanctuary` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : Sanctuaire de Guérison d’Alne, maître Selene `NPC_ALN_70`
- **Prix d'apprentissage** : 2200 Yrds (≈ 50 % d’un équipement T3)
- **Commande** : `!learn_skill MAG_GUE_007`

## Lore (Encyclopédie d'Argo)
Un cercle sacré qui soigne en continu et réduit les dégâts subis à l’intérieur.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_GUE_007')`
