# Carpe Dorée — `MAT_POI_002`

## Identification Cardinal
- **Item_ID** : `MAT_POI_002`
- **Famille** : Poisson · **Rareté** : Peu commun
- **Tier** : T2
- **Prix** : 40 Yrds (achat) · 10 Yrds (revente)

## Usage & Filière
| Champ | Valeur |
|---|---|
| Source | Pêche, nœud `FSH_002` (`ZONE_SYL_HUNT_002`) |
| Entre dans | recettes de cuisine (`craft_type = cooking`) |
| Empilable | OUI (×99) |

## Intégration Bot
- Joueur : `!fish FSH_002` · `!inspect MAT_POI_002` — GM : `!sys_give MAT_POI_002 [Qty]` — IA : `SYS_GRANT_ITEM(Avatar_ID, MAT_POI_002, Qty)`
