# Saumon d'Argent — `MAT_POI_007`

## Identification Cardinal
- **Item_ID** : `MAT_POI_007`
- **Famille** : Poisson · **Rareté** : Commun
- **Tier** : T1
- **Prix** : 7 Yrds (achat) · 1 Yrds (revente)

## Usage & Filière
| Champ | Valeur |
|---|---|
| Source | Pêche, nœud `FSH_007` (`ZONE_NEU_CAP_001`) |
| Entre dans | recettes de cuisine (`craft_type = cooking`) |
| Empilable | OUI (×99) |

## Intégration Bot
- Joueur : `!fish FSH_007` · `!inspect MAT_POI_007` — GM : `!sys_give MAT_POI_007 [Qty]` — IA : `SYS_GRANT_ITEM(Avatar_ID, MAT_POI_007, Qty)`
