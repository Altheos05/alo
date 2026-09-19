# Glacier Spike

## Identification Cardinal
- **Skill_ID** : `MAG_GLA_007`
- **Catégorie** : Magie — Glace
- **Tier** : T3 · **Rareté** : Rare
- **Race Affinité** : Cait Sith (+30% efficacité si cette race)

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
- **Effet_ID** : `EFF_MAG_GLA_007` · **Nom** : Glacier Spike
- **Stat** : `stat_agi` · **Valeur** : -50 % · **Durée** : 90 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort de contrôle — dégâts secondaires 620 × 0,3 ; durée indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast glacier_spike` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : École de Glace de Swilvane, maître Sora `NPC_SWI_79`
- **Prix d'apprentissage** : 2200 Yrds (≈ 50 % d’un équipement T3)
- **Commande** : `!learn_skill MAG_GLA_007`

## Lore (Encyclopédie d'Argo)
Érige un glacier qui bloque le passage et emprisonne les ennemis pris dedans.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_GLA_007')`
