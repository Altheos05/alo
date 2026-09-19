# Cyclone

## Identification Cardinal
- **Skill_ID** : `MAG_VEN_006`
- **Catégorie** : Magie — Vent
- **Tier** : T3 · **Rareté** : Rare
- **Race Affinité** : Sylph (+30% efficacité si cette race)

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
- **Effet_ID** : `EFF_MAG_VEN_006` · **Nom** : Cyclone
- **Stat** : `stat_agi` · **Valeur** : -50 % · **Durée** : 90 s
- Combat uniquement : altération posée sur l'ennemi (D90 E5 : aucun sort offensif hors combat).

## Formule de Dégâts / Effet
Sort de contrôle — dégâts secondaires 620 × 0,3 ; durée indexée sur INT et la maîtrise d’école.

## Incantation
*Le joueur tape `!cast cyclone` pour lancer le sort.*

## Acquisition (Enseignement)
- **Enseignant** : École du Vent de Swilvane, maître Zeph `NPC_SWI_71`
- **Prix d'apprentissage** : 2200 Yrds (≈ 50 % d’un équipement T3)
- **Commande** : `!learn_skill MAG_VEN_006`

## Lore (Encyclopédie d'Argo)
Un cyclone qui aspire et immobilise les ennemis légers ; signature des duellistes de Swilvane.

## Commande IA
- `SYS_GRANT_SPELL(Avatar_ID, 'MAG_VEN_006')`
