# Baies des collines — `MAT_ALI_003`

## Identification Cardinal
- **Item_ID** : `MAT_ALI_003`
- **Famille** : Denrée de cuisine · **Rareté** : Commun
- **Tier** : T1
- **Prix** : 3 Yrds (achat) · 1 Yrds (revente)

## Usage & Filière
| Champ | Valeur |
|---|---|
| Source | Halle d'Alne (`SHOP_ALN_30`) |
| Entre dans | recettes de cuisine (`!cook`) |
| Empilable | OUI (×99) |

## Intégration Bot
- Joueur : `!buy MAT_ALI_003` · `!inspect MAT_ALI_003` — GM : `!sys_give MAT_ALI_003 [Qty]` — IA : `SYS_GRANT_ITEM(Avatar_ID, MAT_ALI_003, Qty)`
