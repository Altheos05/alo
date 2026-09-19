# Flash

## Identification Cardinal
- **Skill_ID** : `MAG_LUM_002`
- **Catégorie** : Magie — Lumière
- **Tier** : T1 · **Rareté** : Commun
- **Race Affinité** : Leprechaun (+30% efficacité si cette race)

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

## Effet sur la cible (combat)
- **Effet_ID** : `EFF_MAG_LUM_002` · **Nom** : Flash
- **Stat** : `stat_agi` · **Valeur** : -20 % · **Durée** : 30 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort de soutien — aucun dégât direct. Intensité indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast flash` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : Ordre de Lumière d’Alne, maître Selene `NPC_ALN_70`
- **Prix d'apprentissage** : 150 Yrds (≈ 50 % d’un équipement T1)
- **Commande** : `!learn_skill MAG_LUM_002`

## Lore (Encyclopédie d'Argo)
Un éclat aveuglant qui désoriente brièvement les ennemis en face.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_LUM_002')`
