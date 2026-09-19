# Battle Hymn

## Identification Cardinal
- **Skill_ID** : `MAG_SUP_004`
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
Effet de soutien : applique un bonus (+5%) à la ou aux cible(s) alliée(s). Zone d’effet à partir du T3.

## Effet persistant (D90)
- **Effet_ID** : `EFF_MAG_SUP_004` · **Nom** : Hymne de bataille
- **Stat** : `stat_str` · **Valeur** : +5 % · **Durée** : 600 s
- Lançable hors combat (`!cast`) : T1-T2 soi ou un allié désigné, T3+ tout le groupe présent dans la zone.

## Formule de Dégâts / Effet
Sort de soutien — aucun dégât direct. Intensité indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast battle_hymn` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : Conservatoire Puca d’Alne, maître Zephyrine `NPC_ALN_68`
- **Prix d'apprentissage** : 500 Yrds (≈ 50 % d’un équipement T2)
- **Commande** : `!learn_skill MAG_SUP_004`

## Lore (Encyclopédie d'Argo)
Un hymne guerrier qui augmente l’attaque de tous les alliés à portée de voix.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_SUP_004')`
