# Shadow Bind

## Identification Cardinal
- **Skill_ID** : `MAG_TEN_006`
- **Catégorie** : Magie — Ténèbres
- **Tier** : T3 · **Rareté** : Rare
- **Race Affinité** : Spriggan (+30% efficacité si cette race)

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
- **Effet_ID** : `EFF_MAG_TEN_006` · **Nom** : Shadow Bind
- **Stat** : `stat_agi` · **Valeur** : -50 % · **Durée** : 90 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort de contrôle — dégâts secondaires 620 × 0,3 ; durée indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast shadow_bind` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : Cercle des Ombres d’Alne, maître Roan `NPC_ALN_69`
- **Prix d'apprentissage** : 2200 Yrds (≈ 50 % d’un équipement T3)
- **Commande** : `!learn_skill MAG_TEN_006`

## Lore (Encyclopédie d'Argo)
Cloue l’ombre d’un ennemi au sol, l’immobilisant tant que dure le sort.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_TEN_006')`
