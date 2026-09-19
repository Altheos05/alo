# Perche Chantante — `MAT_POI_008`

## Identification Cardinal
- **Item_ID** : `MAT_POI_008`
- **Famille** : Poisson · **Rareté** : Commun
- **Tier** : T1
- **Prix** : 6 Yrds (achat) · 1 Yrds (revente)

## Usage & Filière
| Champ | Valeur |
|---|---|
| Source | Pêche, nœud `FSH_008` (`ZONE_PUC_CAP_001`) |
| Entre dans | recettes de cuisine (`craft_type = cooking`) |
| Empilable | OUI (×99) |

## Intégration Bot
- Joueur : `!fish FSH_008` · `!inspect MAT_POI_008` — GM : `!sys_give MAT_POI_008 [Qty]` — IA : `SYS_GRANT_ITEM(Avatar_ID, MAT_POI_008, Qty)`
