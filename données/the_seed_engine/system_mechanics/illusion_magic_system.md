# Système de Magie Illusoire (Illusion Magic - Spriggan)

> ⛔ **REMPLACÉ (étape 60, D89)** — Prose héritée d'avant les conventions d'ID (D13) : aucune illusion n'a d'ID, aucune table ne les stocke, et le lot validé I-4 (D40, `competences_magie/`) ne contient pas d'école d'Illusion (l'école affine des Spriggan est `TEN`, Ténèbres). Par application de D66 (non-autorité du contenu pré-généré), **ce document n'est plus une source de vérité**. `!illusion` et `!treasure_sense` sont retirés, ainsi que `SYS_REVEAL_ILLUSION`, `SYS_CREATE_MIRAGE_ZONE` et `SYS_PLANT_TREASURE`. Conservé pour mémoire uniquement.

## 1. Définition Cardinal System
Les Spriggans sont les maîtres de l'illusion et de la chasse aux trésors dans ALfheim Online. Leur affinité magique unique leur permet de manipuler la perception des autres joueurs et des mobs en projetant des polygones fantômes.

## 2. Mécanique de Jeu
- **Activation** : `!illusion [Type_Illusion]`
- **Coût** : Variable selon la complexité de l'illusion. Plus l'illusion est réaliste, plus elle coûte en MP.
- **Détection** : Un joueur avec une INT supérieure à celle du lanceur a une chance de voir à travers l'illusion (`Chance = (INT_Cible / INT_Lanceur) * 50%`).

## 3. Liste des Illusions

| Illusion | Effet | Niveau | MP |
|---|---|---|---|
| Leurre Polygonal | Crée un clone immobile du lanceur. Les mobs l'attaquent pendant 10s. | 5 | 40 |
| Mirage de Groupe | Fait croire à l'ennemi que le groupe est 2x plus nombreux. | 20 | 80 |
| Nuit Artificielle | Plonge la zone dans l'obscurité pendant 30s. Les Imps gardent leur vision. | 25 | 100 |
| Transmutation Visuelle | Change l'apparence du joueur en celle d'un PNJ ou d'un mob pendant 5 min. | 30 | 60 |
| Coffre Fantôme | Crée un faux coffre au trésor piégé qui explose si ouvert par un ennemi. | 35 | 70 |
| Dédoublement | Crée un clone mobile qui imite les actions du joueur avec 50% des stats. | 50 | 150 |
| Cauchemar de Masse | Inflige le statut [Peur] à tous les ennemis dans un rayon de 20m. | 60 | 200 |

## 4. Affinité Spriggan : Détection de Trésors
- `!treasure_sense` : Compétence passive. Les Spriggans détectent les coffres cachés et les objets rares dans un rayon de 50m. Le bot affiche un indice textuel si un trésor est enfoui dans la zone.

## 5. Commandes IA Associées
- `SYS_REVEAL_ILLUSION(Zone_ID)` : L'IA dissipe toutes les illusions actives dans une zone (vent violent, aura divine).
- `SYS_CREATE_MIRAGE_ZONE(Zone_ID, Description)` : L'IA crée un mirage environnemental (ex: oasis dans le désert, faux chemin dans un labyrinthe).
- `SYS_PLANT_TREASURE(Zone_ID, Item_ID)` : L'IA cache un objet rare détectable uniquement par les Spriggans.
