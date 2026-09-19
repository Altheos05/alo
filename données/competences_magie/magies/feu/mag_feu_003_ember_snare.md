# Ember Snare

## Identification Cardinal
- **Skill_ID** : `MAG_FEU_003`
- **Catégorie** : Magie — Feu
- **Tier** : T1 · **Rareté** : Commun
- **Race Affinité** : Salamander (+30% efficacité si cette race)

## Paramètres de Combat
| Paramètre | Valeur |
|---|---|
| Coût MP | 40 |
| Temps d'Incantation | 1.5s |
| Cooldown | Aucun |
| Niveau Requis | 5 |
| Interruptible (Casting Break) | Oui (si dégâts > 5% Max HP reçus) |

## Effet
Effet de contrôle : entrave, immobilise ou repousse la ou les cible(s). Zone d’effet à partir du T3.

## Effet sur la cible (combat)
- **Effet_ID** : `EFF_MAG_FEU_003` · **Nom** : Ember Snare
- **Stat** : `stat_agi` · **Valeur** : -30 % · **Durée** : 30 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort de contrôle — dégâts secondaires 130 × 0,3 ; durée indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast ember_snare` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : École du Feu de Gattan, maître Ferra `NPC_GAT_31`
- **Prix d'apprentissage** : 150 Yrds (≈ 50 % d’un équipement T1)
- **Commande** : `!learn_skill MAG_FEU_003`

## Lore (Encyclopédie d'Argo)
Un tapis de braises qui ralentit et brûle légèrement quiconque le traverse ; premier piège appris à la Forge-École.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_FEU_003')`
