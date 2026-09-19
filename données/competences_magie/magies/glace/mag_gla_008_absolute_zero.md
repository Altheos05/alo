# Absolute Zero

## Identification Cardinal
- **Skill_ID** : `MAG_GLA_008`
- **Catégorie** : Magie — Glace
- **Tier** : T4 · **Rareté** : Épique
- **Race Affinité** : Cait Sith (+30% efficacité si cette race)

## Paramètres de Combat
| Paramètre | Valeur |
|---|---|
| Coût MP | 430 |
| Temps d'Incantation | 4s |
| Cooldown | 3 min |
| Niveau Requis | 38 |
| Interruptible (Casting Break) | Oui (si dégâts > 5% Max HP reçus) |

## Effet
Effet de contrôle : entrave, immobilise ou repousse la ou les cible(s). Zone d’effet à partir du T3.

## Effet sur la cible (combat)
- **Effet_ID** : `EFF_MAG_GLA_008` · **Nom** : Absolute Zero
- **Stat** : `stat_agi` · **Valeur** : -50 % · **Durée** : 120 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort de contrôle — dégâts secondaires 1250 × 0,3 ; durée indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast absolute_zero` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : École de Glace de Swilvane, maître Sora `NPC_SWI_79`
- **Prix d'apprentissage** : 6500 Yrds (≈ 50 % d’un équipement T4)
- **Commande** : `!learn_skill MAG_GLA_008`

## Lore (Encyclopédie d'Argo)
Abaisse la température d’une zone au zéro absolu, gelant net tout ce qui bouge.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_GLA_008')`
