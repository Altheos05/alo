# Ragoût de Taverne

## Identification Cardinal
- **Item_ID** : `CSM_NOU_019`
- **Catégorie** : Nourriture · **Type** : Plat de taverne (buff mineur)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 12 · **Affinité raciale** : Leprechaun (+5% aux bonus si Leprechaun)

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +5% VIT |
| Durée | 40 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : tavernes (toutes villes)
- **Recette** : 1× Viande de gibier + légumes des champs + 1× os à moelle *(cuisine)*
- **Prix** : 100 Yrds (achat) · 25 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Le plat que sert toute taverne qui se respecte, mijoté dans un chaudron qui ne s'éteint jamais vraiment. Épais, généreux, il « tient au corps » et endurcit pour l'après-midi de chasse. Les Leprechaun, éternels bricoleurs affamés, en commandent des rations doubles entre deux séances d'atelier.

## Intégration Bot
- Joueur : `!use CSM_NOU_019` — GM : `!sys_give CSM_NOU_019 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_019, 1)`
