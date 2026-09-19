# Spike Field

## Identification Cardinal
- **Skill_ID** : `MAG_TER_007`
- **Catégorie** : Magie — Terre
- **Tier** : T3 · **Rareté** : Rare
- **Race Affinité** : Gnome (+30% efficacité si cette race)

## Paramètres de Combat
| Paramètre | Valeur |
|---|---|
| Coût MP | 240 |
| Temps d'Incantation | 3s |
| Cooldown | 40 s |
| Niveau Requis | 25 |
| Interruptible (Casting Break) | Oui (si dégâts > 5% Max HP reçus) |

## Effet
Effet de contrôle : entrave, immobilise ou repousse la ou les cible(s). Zone d’effet à partir du T3.

## Effet sur la cible (combat)
- **Effet_ID** : `EFF_MAG_TER_007` · **Nom** : Spike Field
- **Stat** : `stat_agi` · **Valeur** : -50 % · **Durée** : 90 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort de contrôle — dégâts secondaires 620 × 0,3 ; durée indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast spike_field` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : École de la Terre d’Alne, maître Roan `NPC_ALN_69`
- **Prix d'apprentissage** : 2200 Yrds (≈ 50 % d’un équipement T3)
- **Commande** : `!learn_skill MAG_TER_007`

## Lore (Encyclopédie d'Argo)
Fait jaillir un champ de pics rocheux qui empale quiconque avance.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_TER_007')`
