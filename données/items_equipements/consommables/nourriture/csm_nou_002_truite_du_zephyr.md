# Truite Grillée du Zéphyr

## Identification Cardinal
- **Item_ID** : `CSM_NOU_002`
- **Catégorie** : Nourriture · **Type** : Plat signature (Sylph)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 10 · **Affinité raciale** : Sylph (+5% aux bonus si Sylph)

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +5% AGI |
| Durée | 40 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : tavernes de Swilvane (`ZONE_SYL_CAP_001`)
- **Recette** : 1× Truite des cimes + 1× Feuille-de-zéphyr + 1× Sel-de-lune *(cuisine)*
- **Prix** : 120 Yrds (achat) · 30 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Pêchée dans les torrents d'altitude et grillée sur des braises de bois-vent, cette truite garde, dit-on, la légèreté de l'air où elle a vécu. Les voltigeurs Sylph la mangent avant les longues traversées aériennes : le corps s'allège, le vol devient plus sûr. Un filet parfaitement doré, une pincée d'herbe, et voilà toute la cuisine du peuple du ciel.

## Intégration Bot
- Joueur : `!use CSM_NOU_002` — GM : `!sys_give CSM_NOU_002 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_002, 1)`
