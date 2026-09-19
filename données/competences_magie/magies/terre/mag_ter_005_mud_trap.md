# Mud Trap

## Identification Cardinal
- **Skill_ID** : `MAG_TER_005`
- **Catégorie** : Magie — Terre
- **Tier** : T2 · **Rareté** : Peu commun
- **Race Affinité** : Gnome (+30% efficacité si cette race)

## Paramètres de Combat
| Paramètre | Valeur |
|---|---|
| Coût MP | 110 |
| Temps d'Incantation | 2s |
| Cooldown | 10 s |
| Niveau Requis | 14 |
| Interruptible (Casting Break) | Oui (si dégâts > 5% Max HP reçus) |

## Effet
Effet de contrôle : entrave, immobilise ou repousse la ou les cible(s). Zone d’effet à partir du T3.

## Effet sur la cible (combat)
- **Effet_ID** : `EFF_MAG_TER_005` · **Nom** : Mud Trap
- **Stat** : `stat_agi` · **Valeur** : -30 % · **Durée** : 60 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort de contrôle — dégâts secondaires 300 × 0,3 ; durée indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast mud_trap` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : École de la Terre d’Alne, maître Roan `NPC_ALN_69`
- **Prix d'apprentissage** : 500 Yrds (≈ 50 % d’un équipement T2)
- **Commande** : `!learn_skill MAG_TER_005`

## Lore (Encyclopédie d'Argo)
Transforme le sol en bourbier collant qui immobilise les ennemis lourds.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_TER_005')`
