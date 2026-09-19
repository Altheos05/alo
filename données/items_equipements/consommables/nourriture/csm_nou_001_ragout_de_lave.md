# Ragoût de Lave

## Identification Cardinal
- **Item_ID** : `CSM_NOU_001`
- **Catégorie** : Nourriture · **Type** : Plat signature (Salamander)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 10 · **Affinité raciale** : Salamander (+5% aux bonus si Salamander)

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +5% STR |
| Durée | 40 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : tavernes de Gattan (`ZONE_SAL_CAP_001`) et de Voulg
- **Recette** : 1× Viande épicée + 1× Piment-de-braise + 1× Champignon-de-roche *(cuisine)*
- **Prix** : 120 Yrds (achat) · 30 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Servi bouillonnant dans un bol de pierre volcanique qui garde la chaleur une heure durant, ce ragoût brûle la langue de tous sauf des Salamander, qui le mangent en riant. On raconte qu'un forgeron de Gattan en avale un bol entier avant chaque grande commande — pour « avoir le feu dans les bras ». Le goût est indescriptible ; la force qu'il donne, indéniable.

## Intégration Bot
- Joueur : `!use CSM_NOU_001` — GM : `!sys_give CSM_NOU_001 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_001, 1)`
