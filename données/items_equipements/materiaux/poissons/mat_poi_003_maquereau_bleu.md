# Maquereau Bleu — `MAT_POI_003`

## Identification Cardinal
- **Item_ID** : `MAT_POI_003`
- **Famille** : Poisson · **Rareté** : Commun
- **Tier** : T1
- **Prix** : 8 Yrds (achat) · 2 Yrds (revente)

## Usage & Filière
| Champ | Valeur |
|---|---|
| Source | Pêche, nœud `FSH_003` (`ZONE_UND_CAP_001`) |
| Entre dans | recettes de cuisine (`craft_type = cooking`) |
| Empilable | OUI (×99) |

## Intégration Bot
- Joueur : `!fish FSH_003` · `!inspect MAT_POI_003` — GM : `!sys_give MAT_POI_003 [Qty]` — IA : `SYS_GRANT_ITEM(Avatar_ID, MAT_POI_003, Qty)`
