# Truite Sylphe — `MAT_POI_001`

## Identification Cardinal
- **Item_ID** : `MAT_POI_001`
- **Famille** : Poisson · **Rareté** : Commun
- **Alias recette** : truite des cimes
- **Tier** : T1
- **Prix** : 6 Yrds (achat) · 1 Yrds (revente)

## Usage & Filière
| Champ | Valeur |
|---|---|
| Source | Pêche, nœud `FSH_001` (`ZONE_SYL_HUNT_001`) |
| Entre dans | recettes de cuisine (`craft_type = cooking`) |
| Empilable | OUI (×99) |

## Intégration Bot
- Joueur : `!fish FSH_001` · `!inspect MAT_POI_001` — GM : `!sys_give MAT_POI_001 [Qty]` — IA : `SYS_GRANT_ITEM(Avatar_ID, MAT_POI_001, Qty)`
