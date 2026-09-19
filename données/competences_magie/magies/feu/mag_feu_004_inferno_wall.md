# Inferno Wall

## Identification Cardinal
- **Skill_ID** : `MAG_FEU_004`
- **Catégorie** : Magie — Feu
- **Tier** : T2 · **Rareté** : Peu commun
- **Race Affinité** : Salamander (+30% efficacité si cette race)

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
- **Effet_ID** : `EFF_MAG_FEU_004` · **Nom** : Inferno Wall
- **Stat** : `stat_agi` · **Valeur** : -30 % · **Durée** : 60 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort de contrôle — dégâts secondaires 300 × 0,3 ; durée indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast inferno_wall` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : École du Feu de Gattan, maître Ferra `NPC_GAT_31`
- **Prix d'apprentissage** : 500 Yrds (≈ 50 % d’un équipement T2)
- **Commande** : `!learn_skill MAG_FEU_004`

## Lore (Encyclopédie d'Argo)
Un mur de flammes dressé sur le champ de bataille, hérité des tactiques défensives de la Désolation de Magma.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_FEU_004')`
