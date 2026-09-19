# Espadon Géant — `MAT_POI_005`

## Identification Cardinal
- **Item_ID** : `MAT_POI_005`
- **Famille** : Poisson · **Rareté** : Rare
- **Tier** : T3
- **Prix** : 120 Yrds (achat) · 30 Yrds (revente)

## Usage & Filière
| Champ | Valeur |
|---|---|
| Source | Pêche, nœud `FSH_005` (`ZONE_UND_HUNT_002`) |
| Entre dans | recettes de cuisine (`craft_type = cooking`) |
| Empilable | OUI (×99) |

## Intégration Bot
- Joueur : `!fish FSH_005` · `!inspect MAT_POI_005` — GM : `!sys_give MAT_POI_005 [Qty]` — IA : `SYS_GRANT_ITEM(Avatar_ID, MAT_POI_005, Qty)`
