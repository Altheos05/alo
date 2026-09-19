# Poisson-Mort des Marais — `MAT_POI_011`

## Identification Cardinal
- **Item_ID** : `MAT_POI_011`
- **Famille** : Poisson · **Rareté** : Épique
- **Tier** : T4
- **Prix** : 400 Yrds (achat) · 100 Yrds (revente)

## Usage & Filière
| Champ | Valeur |
|---|---|
| Source | Pêche, nœud `FSH_011` (`ZONE_JOT_FLD_001`) |
| Entre dans | recettes de cuisine (`craft_type = cooking`) |
| Empilable | OUI (×99) |

## Intégration Bot
- Joueur : `!fish FSH_011` · `!inspect MAT_POI_011` — GM : `!sys_give MAT_POI_011 [Qty]` — IA : `SYS_GRANT_ITEM(Avatar_ID, MAT_POI_011, Qty)`
