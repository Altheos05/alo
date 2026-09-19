# Tourte du Chasseur

## Identification Cardinal
- **Item_ID** : `CSM_NOU_021`
- **Catégorie** : Nourriture · **Type** : Plat de taverne (buff mineur)
- **Tier** : T2 · **Rareté** : Peu commun
- **Niveau requis** : 12 · **Affinité raciale** : Cait Sith (+5% aux bonus si Cait Sith)

## Effet
| Paramètre | Valeur |
|---|---|
| Effet | +5% AGI |
| Durée | 40 min |
| Cooldown | — (à la consommation) |
| Cumulable | OUI avec 1 buff potion (1 buff nourriture max) |

## Acquisition & Chaînage économique
- **Source** : tavernes de Freelia et des zones de chasse
- **Recette** : 1× Viande de gibier + 1× Farine de racine dure + légumes *(pâtisserie salée)*
- **Prix** : 105 Yrds (achat) · 26 Yrds (revente)

## Lore (Encyclopédie d'Argo)
Une tourte dorée bourrée de gibier, assez compacte pour se glisser dans une sacoche et se manger en poursuite. Les traqueurs Cait Sith l'ont perfectionnée : légère à porter, riche à manger, elle aiguise les réflexes sans alourdir. Mordre dedans en pleine filature fait partie du folklore des chasseurs de Freelia.

## Intégration Bot
- Joueur : `!use CSM_NOU_021` — GM : `!sys_give CSM_NOU_021 [Num]` — IA : `SYS_GRANT_ITEM(Avatar_ID, CSM_NOU_021, 1)`
