# Brochette de Chasse Sauvage

## Identification Cardinal
- **Item_ID** : `CSM_NOU_003`
- **Catégorie** : Nourriture · **Type** : Plat signature (Cait Sith)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 10 · **Affinité raciale** : Cait Sith (+5% aux bonus si Cait Sith)

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +5% VIT |
| Durée | 40 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : tavernes de Freelia (`ZONE_CAI_CAP_001`)
- **Recette** : 2× Viande de gibier + 1× baies-des-collines *(cuisine au feu)*
- **Prix** : 115 Yrds (achat) · 28 Yrds (revente)

## Lore (Encyclopédie d'Argo)
De grosses pièces de gibier embrochées et cuites au feu vif, comme les Cait Sith les aiment depuis toujours : sans manières, mais nourrissantes. Les dompteurs en partagent avec leurs familiers, ce qui n'a aucun effet sur les bêtes mais scelle un lien qu'aucune commande ne remplace. Manger une brochette à Freelia, c'est comprendre le peuple des chasseurs.

## Intégration Bot
- Joueur : `!use CSM_NOU_003` — GM : `!sys_give CSM_NOU_003 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_003, 1)`
