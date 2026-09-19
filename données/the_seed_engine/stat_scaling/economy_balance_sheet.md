# 💰 Balance Économique — ALfheim Online
## The Seed Engine — Module Économie (Yrd)

> **Version** : 2.0  
> **Dernière mise à jour** : 2026-07-10  
> **Devise** : **Yrd** (¥) — Monnaie universelle d'ALfheim Online  
> **Calibration** : valeurs réelles extraites du corpus items (`ARM_TET_*`, `WPN_*`, `CSM_*`, `MAT_*`, `FLO_*`) du 2026-07-10 — cf. `directives_generation/12_equilibrage_economique.md`

---

## 📊 Revenu Moyen par Heure de Jeu

| Tranche de Niveau | Yrds / Heure (PvE Solo) | Yrds / Heure (PvE Groupe) | Yrds / Heure (Donjon) | Yrds / Heure (Craft & Vente) |
|:---|---:|---:|---:|---:|
| Nv. 1-10 | 80 ¥ | 100 ¥ | — | 30 ¥ |
| Nv. 11-20 | 200 ¥ | 260 ¥ | 350 ¥ | 120 ¥ |
| Nv. 21-30 | 400 ¥ | 520 ¥ | 700 ¥ | 300 ¥ |
| Nv. 31-40 | 650 ¥ | 850 ¥ | 1 200 ¥ | 550 ¥ |
| Nv. 41-50 | 1 000 ¥ | 1 300 ¥ | 1 800 ¥ | 900 ¥ |
| Nv. 51-60 | 1 500 ¥ | 1 950 ¥ | 2 800 ¥ | 1 400 ¥ |
| Nv. 61-70 | 2 200 ¥ | 2 860 ¥ | 4 000 ¥ | 2 100 ¥ |
| Nv. 71-80 | 3 000 ¥ | 3 900 ¥ | 5 500 ¥ | 3 200 ¥ |
| Nv. 81-90 | 4 000 ¥ | 5 200 ¥ | 7 500 ¥ | 4 800 ¥ |
| Nv. 91-100 | 5 500 ¥ | 7 150 ¥ | 10 000 ¥ | 7 000 ¥ |

> **Note** : Le PvE solo inclut la revente des drops aux PNJ (25% prix catalogue). Les quêtes daily ajoutent ~100-400 ¥/h selon le niveau. Les donjons rapportent plus mais consomment consommables et réparations (~20% du brut).

---

## 🛒 Prix Catalogue par Tier (constantes d'item, avant modulation boutique)

Les prix ci-dessous sont les **fourchettes constatées** dans les fiches items réelles. Un item individuel peut varier de ±20% autour de la médiane selon sa rareté, ses stats et son lore. La modulation boutique applique LOCAL −20% / IMPORT +40% (cf. R4, `03_cdc_boutiques.md`).

### Armes (par pièce)

| Tier | Rareté | Prix Achat (catalogue) | Prix Craft (mats) | Revente PNJ (25%) |
|:---|:---|---:|---:|---:|
| T1 | Commun | 150–400 ¥ | 80–240 ¥ | 38–100 ¥ |
| T2 | Peu Commun | 800–1 200 ¥ | 480–720 ¥ | 200–300 ¥ |
| T3 | Rare | 4 000–5 500 ¥ | 2 400–3 300 ¥ | 1 000–1 375 ¥ |
| T4 | Épique | 14 000–20 000 ¥ | 8 400–12 000 ¥ | 3 500–5 000 ¥ |
| T5 | Légendaire | Lié à l'âme (invendable) | 40 000–60 000 ¥ | 0 ¥ |

### Armures (par pièce — tête, torse, bras, taille, jambes)

| Tier | Rareté | Prix Achat (catalogue) | Prix Craft (mats) | Revente PNJ (25%) |
|:---|:---|---:|---:|---:|
| T1 | Commun | 150–400 ¥ | 90–240 ¥ | 38–100 ¥ |
| T2 | Peu Commun | 280–400 ¥ | 170–240 ¥ | 70–100 ¥ |
| T3 | Rare | 4 000–6 000 ¥ | 2 400–3 600 ¥ | 1 000–1 500 ¥ |
| T4 | Épique | 14 000–20 000 ¥ | 8 400–12 000 ¥ | 3 500–5 000 ¥ |
| T5 | Légendaire | Lié à l'âme (invendable) | Craft quête | 0 ¥ |

> **Set complet (5 pièces)** : multiplier par 5. Ex. T1 set = 750–2 000 ¥, T3 set = 20 000–30 000 ¥, T4 set = 70 000–100 000 ¥.
> **Boucliers** : prix equivalent arme T1-T4 (180–18 000 ¥).

### Consommables

| Catégorie | Gamme de Prix (catalogue) | Exemples |
|:---|---:|:---|
| Potion de Soin (T1→T4) | 25–2 400 ¥ | Soin mineure 25 ¥ → Élixir de Vie Complet 2 400 ¥ |
| Potion de Mana (T1→T4) | 30–1 800 ¥ | Mana mineure 30 ¥ → Élixir de Mana 1 800 ¥ |
| Antidotes / Dissipations | 40–600 ¥ | Antidote 40 ¥ → Purge Complète 600 ¥ |
| Anti-jauges D12 | 150–1 600 ¥ | Résine Ignifuge 150 ¥ → Perle d'Air 1 600 ¥ |
| Buffs (force, agilité, etc.) | 140–500 ¥ | Huile de Force 140 ¥ → Potion Force Majeure 500 ¥ |
| Nourriture simple (rations) | 15–55 ¥ | Pomme 15 ¥, Ration 55 ¥ |
| Nourriture taverne (buff 30 min) | 90–125 ¥ | Ratatouille 90 ¥, Brochette 115 ¥ |
| Nourriture chef (buff 1h) | 480–650 ¥ | Plateau du Gourmet 480 ¥, Banquet 650 ¥ |
| Vins/bières (amendement) | 12–120 ¥ | Lait de Chèvre 12 ¥, Whisky de Forge 120 ¥ |
| Parchemins (retour, utilitaire) | 80–300 ¥ | Retour 80 ¥ *(parchemins de réparation retirés, D88)* |
| Cristaux (téléportation, soin) | 150–800 ¥ | Soin instantané 150 ¥, Ralliement 800 ¥ |

### Matériaux (craft)

| Type | Gamme de Prix (catalogue) | Notes |
|:---|---:|:---|
| Minerais bruts (T1) | 30–60 ¥ | Fer, Cuivre, Étain |
| Minerais rares (T3-T4) | 200–800 ¥ | Mithril, Adamantium, Cristal Violet |
| Gemmes (T2-T4) | 85–1 960 ¥ | Gemme de Granit 85 ¥ → Diamant de Mithril 1 960 ¥ |
| Cuirs et Os (T1-T4) | 20–500 ¥ | Cuir brut 20 ¥ → Cuir de Dragon 500 ¥ |
| Drops de monstres (T1-T4) | 30–800 ¥ | Cendre 30 ¥ → Perle des Abysses 800 ¥ |
| Herbes et plantes (T1) | 4–25 ¥ | Plante des Ombres 4 ¥, Herbe des Marais 25 ¥ |
| Flore (FLO_*, récolte) | 4–100 ¥ | Prix de base node de récolte |
| Bois (MAT_WOD, T1-T4) | 15–500 ¥ | Bois d'If 15 ¥ → Bois Spectral 500 ¥ |

---

## 🔧 Coûts de Réparation

| Tier | Coût / Point de Durabilité | Réparation Complète (100%) | Par Combat PvE | Par Combat PvP |
|:---|---:|---:|---:|---:|
| T1 | 2 ¥ | 200 ¥ | 2 ¥ | 6 ¥ |
| T2 | 5 ¥ | 500 ¥ | 5 ¥ | 15 ¥ |
| T3 | 12 ¥ | 1 200 ¥ | 12 ¥ | 36 ¥ |
| T4 | 30 ¥ | 3 000 ¥ | 30 ¥ | 90 ¥ |
| T5 | 75 ¥ | 7 500 ¥ | 75 ¥ | 225 ¥ |

> **Durabilité max par tier** : T1 160, T2 240, T3 360, T4 520, T5 750 (constaté sur armures tête). La réparation complète coûte `coût/pt × durabilité_max`.
>
> **Étape 60 (D88)** : ce barème devient réellement actif — usure en combat (−1/pièce PvE, −3 PvP) et par tentative d'outil ; réparation **au forgeron PNJ uniquement** ; chaque réparation ampute définitivement la durabilité max (10 % de l'origine par défaut), jusqu'à l'objet irréparable. Voir `system_mechanics/durability_repair_system.md`.

---

## ⚒️ Coûts de Craft

| Type de Craft | Coût Matériaux (estimation) | Frais de Forge | Temps de Craft | Niveau Craft Min |
|:---|---:|---:|---:|---:|
| Arme T1 | 80–160 ¥ | 20 ¥ | 5 min | Craft Nv.1 |
| Arme T2 | 480–720 ¥ | 100 ¥ | 15 min | Craft Nv.15 |
| Arme T3 | 2 400–3 300 ¥ | 500 ¥ | 45 min | Craft Nv.30 |
| Arme T4 | 8 400–12 000 ¥ | 2 500 ¥ | 2h | Craft Nv.55 |
| Arme T5 | 40 000–60 000 ¥ | 12 000 ¥ | 6h | Craft Nv.80 |
| Armure T1 (pièce) | 90–240 ¥ | 12 ¥ | 3 min | Craft Nv.1 |
| Armure T2 (pièce) | 170–240 ¥ | 60 ¥ | 10 min | Craft Nv.15 |
| Armure T3 (pièce) | 2 400–3 600 ¥ | 300 ¥ | 30 min | Craft Nv.30 |
| Armure T4 (pièce) | 8 400–12 000 ¥ | 1 500 ¥ | 1.5h | Craft Nv.55 |
| Armure T5 (pièce) | Quête + raid | 6 000 ¥ | 4h | Craft Nv.80 |
| Potion T1 | 5–10 ¥ | 3 ¥ | 1 min | Alchimie Nv.1 |
| Potion T2 | 30–60 ¥ | 10 ¥ | 3 min | Alchimie Nv.10 |
| Potion T3 | 80–150 ¥ | 25 ¥ | 8 min | Alchimie Nv.25 |
| Potion T4 | 250–500 ¥ | 80 ¥ | 15 min | Alchimie Nv.45 |

> **Rentabilité du craft** : le craft coûte ~60% du prix catalogue (matériaux + frais). Le craftsman gagne la différence prix_catalogue − coût_craft = ~40% de marge brute avant taxe HdV (bonus non linéaire).

---

## ✨ Coûts d'Enchantement

| Type d'Enchantement | Coût Base | Cristal Élémentaire | Taux de Succès | Coût Total Estimé |
|:---|---:|---:|---:|---:|
| Enchantement T1 (basique) | 200 ¥ | 100 ¥ | 90% | ~333 ¥ |
| Enchantement T2 (intermédiaire) | 800 ¥ | 400 ¥ | 75% | ~1 600 ¥ |
| Enchantement T3 (avancé) | 3 000 ¥ | 1 500 ¥ | 55% | ~8 182 ¥ |
| Enchantement T4 (maître) | 10 000 ¥ | 5 000 ¥ | 35% | ~42 857 ¥ |
| Enchantement T5 (légendaire) | 30 000 ¥ | 15 000 ¥ | 15% | ~300 000 ¥ |

> **En cas d'échec** : les Yrds et le cristal sont consommés. L'item n'est pas détruit.
> **Coût Total Estimé** : coût moyen incluant les échecs statistiques.

---

## 🏦 Hôtel des Ventes (HdV)

| Paramètre | Valeur |
|:---|:---|
| Taxe de mise en vente | 2% du prix affiché (non remboursable) |
| Taxe de vente réussie | 5% du prix de vente |
| Taxe totale effective | 7% |
| Durée de mise en vente | 48h maximum |
| Slots de vente par joueur | 10 (extensible à 20 via upgrade de guilde) |
| Prix minimum | 10 ¥ |
| Prix maximum | 999 999 ¥ |
| Dépôt de garantie anti-arbitrage | Prix ≥ 2× valeur de revente PNJ (sinon refusé) |

> **Exemple** : vente à 10 000 ¥ → 200 ¥ taxe dépôt + 500 ¥ taxe vente = 9 300 ¥ net.

---

## 🏪 PNJ Marchands — Marges Commerciales

| Paramètre | Valeur |
|:---|:---|
| Prix d'achat PNJ → Joueur | 100% du prix catalogue |
| Prix de revente Joueur → PNJ | 25% du prix catalogue |
| Marge PNJ | 75% |
| Remise de réputation (max, `AFF>=80`) | −15% sur prix d'achat |
| Remise de guilde marchande | −10% supplémentaire (cumulable, max −25%) |
| Modulation LOCAL (R4) | −20% sur prix catalogue |
| Modulation IMPORT (R4) | +40% sur prix catalogue (ville source nommée) |
| Arrondi R4 | Aux 5 Yrds les plus proches |
| Plancher anti-arbitrage (R4) | Prix boutique ≥ 2× prix de revente |

### Prix de Rachat PNJ (% du prix catalogue)

> **Grille remplacée à l'étape 60 (D88)** — nouveaux paliers définis par le PE, taux de rachat de l'étape 37 conservés. Détail : `system_mechanics/durability_repair_system.md` §3.

| Condition de l'Item | % Rachat |
|:---|---:|
| Neuf (100 % durabilité) | 25% |
| Quasi neuf (75–99 %) | 22% |
| Bon état (50–74 %) | 18% |
| État correct (26–49 %) | 12% |
| Usé (1–25 %) | 5% |
| Cassé (0 %, inutilisable jusqu'à réparation) | 5% |

---

## 🏰 Coûts de Guilde

### Création et Upgrades

| Action | Coût | Prérequis |
|:---|---:|:---|
| Création de guilde | 5 000 ¥ | Nv.30 + 5 membres minimum |
| QG Nv.1 (Petite Maison) | 10 000 ¥ | Guilde créée |
| QG Nv.2 (Manoir) | 50 000 ¥ | 10 membres + guilde Nv.5 |
| QG Nv.3 (Forteresse) | 200 000 ¥ | 25 membres + guilde Nv.15 |
| QG Nv.4 (Château) | 800 000 ¥ | 50 membres + guilde Nv.30 |
| QG Nv.5 (Citadelle) | 3 000 000 ¥ | 100 membres + guilde Nv.50 |

### Entretien de Guilde (Coûts Hebdomadaires)

| Niveau de QG | Entretien / Semaine | Capacité de Stockage | Bonus |
|:---|---:|---:|:---|
| Nv.1 | 500 ¥ | 100 items | Coffre partagé |
| Nv.2 | 2 000 ¥ | 500 items | +Atelier de craft |
| Nv.3 | 8 000 ¥ | 2 000 items | +Bonus EXP guilde (+5%) |
| Nv.4 | 25 000 ¥ | 10 000 items | +Téléportation au QG |
| Nv.5 | 80 000 ¥ | 50 000 items | +Défense de territoire |

### Services de Guilde

| Service | Coût d'Installation | Coût / Semaine |
|:---|---:|---:|
| Forge de guilde | 15 000 ¥ | 1 500 ¥ |
| Atelier d'alchimie | 12 000 ¥ | 1 200 ¥ |
| Bibliothèque magique | 20 000 ¥ | 2 000 ¥ |
| Écurie (montures) | 10 000 ¥ | 1 000 ¥ |
| Salle d'entraînement | 8 000 ¥ | 800 ¥ |
| Salle de stratégie | 5 000 ¥ | 500 ¥ |

---

## 💀 Death Penalty — Pénalité de Mort

| Niveau du Joueur | Perte d'Yrds | Perte d'EXP | Perte d'Items | Temps de Récupération Estimé |
|:---|---:|---:|:---|:---|
| Nv. 1-10 | 50 ¥ | 0% | Aucune | <1 min |
| Nv. 11-20 | 150 ¥ | 2% du niveau | Aucune | 2-5 min |
| Nv. 21-30 | 400 ¥ | 3% du niveau | 5% chance 1 consommable | 5-10 min |
| Nv. 31-40 | 800 ¥ | 4% du niveau | 5% chance 1 consommable | 10-20 min |
| Nv. 41-50 | 1 500 ¥ | 5% du niveau | 8% chance 1 consommable | 20-30 min |
| Nv. 51-60 | 2 500 ¥ | 5% du niveau | 8% chance 1 matériau | 30-45 min |
| Nv. 61-70 | 4 000 ¥ | 6% du niveau | 10% chance 1 matériau | 45-60 min |
| Nv. 71-80 | 6 500 ¥ | 7% du niveau | 10% chance 1 matériau | 1-1.5h |
| Nv. 81-90 | 10 000 ¥ | 8% du niveau | 12% chance 1 matériau | 1.5-2h |
| Nv. 91-100 | 15 000 ¥ | 10% du niveau | 15% chance 1 matériau | 2-3h |

> **Règle immuable** : la perte d'EXP ne peut jamais causer un delevel.
> **Plume de Résurrection** (500 ¥) : annule toutes les pénalités de mort (y compris perte d'Yrds).
> **Résurrection par Undine** : réduit la pénalité de moitié (arrondi inférieur).
> **Remain Light** (règle canon ALO) : le joueur reste au sol 30s après une mort PvP avec perte de 30% des Yrds portés (plafond = perte PvE max de la tranche).

---

## 📊 Répartition des Richesses — Objectifs par Palier

| Palier | Yrds Recommandés | Équipement Attendu | Temps de Jeu Cumulé | Coût Set Attendu |
|:---|---:|:---|:---|:---|
| Nv. 10 | 1 500 ¥ | Full T1 + consommables | ~5h | 1 000 ¥ |
| Nv. 20 | 8 000 ¥ | Mix T1/T2 | ~15h | 5 000 ¥ |
| Nv. 30 | 25 000 ¥ | Full T2 | ~35h | 15 000 ¥ |
| Nv. 40 | 60 000 ¥ | Mix T2/T3 | ~65h | 35 000 ¥ |
| Nv. 50 | 150 000 ¥ | Full T3 | ~110h | 75 000 ¥ |
| Nv. 60 | 300 000 ¥ | Mix T3/T4 | ~170h | 175 000 ¥ |
| Nv. 70 | 600 000 ¥ | Full T4 | ~250h | 350 000 ¥ |
| Nv. 80 | 1 200 000 ¥ | Mix T4/T5 | ~350h | 500 000 ¥ |
| Nv. 90 | 2 500 000 ¥ | Full T5 début | ~470h | — |
| Nv. 100 | 5 000 000 ¥ | Full T5 enchanté | ~600h | — |

> **Temps de jeu** : cumul estimé pour un joueur casual-efficace (ni farmer acharné ni touriste). Un farmer actif atteint le palier Nv.100 en ~400h.

---

## 🏠 Immobilier Personnel

| Propriété | Coût d'Achat | Loyer / Semaine | Capacité Stockage |
|:---|---:|---:|---:|
| Chambre d'auberge | 0 ¥ | 100 ¥ | 20 items |
| Petite maison | 5 000 ¥ | 300 ¥ | 100 items |
| Maison moyenne | 25 000 ¥ | 1 000 ¥ | 300 items |
| Grande maison | 100 000 ¥ | 3 000 ¥ | 800 items |
| Manoir | 500 000 ¥ | 10 000 ¥ | 2 000 items |

> Le loyer est prélevé automatiquement chaque lundi à la maintenance. Si le solde est insuffisant, les items passent en garde-meuble (7 jours avant dispersion).

---

## 📈 Courbe d'EXP par Niveau (Formule de Leveling)

| Niveau | EXP Requis | EXP/Mob Standard | Mob Kill pour Monter |
|:---|---:|---:|---:|
| 1-5 | 2 000 | 40 (T1) | ~50 kills |
| 6-10 | 4 000 | 80 (T1) | ~50 kills |
| 11-15 | 8 000 | 200 (T2) | ~40 kills |
| 16-20 | 14 000 | 400 (T2) | ~35 kills |
| 21-25 | 22 000 | 600 (T3) | ~37 kills |
| 26-30 | 34 000 | 1 000 (T3) | ~34 kills |
| 31-35 | 50 000 | 1 500 (T3) | ~33 kills |
| 36-40 | 72 000 | 2 000 (T3) | ~36 kills |
| 41-45 | 100 000 | 2 500 (T3-T4) | ~40 kills |
| 46-50 | 140 000 | 3 000 (T4) | ~47 kills |
| 51-60 | 400 000 | 4 000 (T4) | ~100 kills |
| 61-70 | 800 000 | 5 500 (T4) | ~145 kills |
| 71-80 | 1 500 000 | 7 500 (T4-T5) | ~200 kills |
| 81-90 | 3 000 000 | 10 000 (T5) | ~300 kills |
| 91-100 | 6 000 000 | 15 000 (T5) | ~400 kills |

> **Formule** : `EXP_requis(niveau) = 1000 × (niveau^1.5)`. Les valeurs ci-dessus sont les cumuls par palier.
> **Quêtes** : les daily donnent 100-400 EXP (10-20% d'un niveau pour leur palier). Les T5 donnent 5 000 EXP (5% d'un niveau palier 45+). Les légendaires donnent 8 000-10 000 EXP (crédit serveur, ~1 niveau palier 75+).
> **Mob Standard** : mob de niveau équivalent au bas du palier. Les boss de zone donnent ×3 à ×5 l'XP d'un mob standard.

---

## 💱 Taux de Change et Limites

| Paramètre | Valeur |
|:---|:---|
| Yrds max par joueur | 99 999 999 ¥ |
| Transaction max entre joueurs | 500 000 ¥ (par 24h) |
| Taxe de transaction directe | 3% (prélevé sur l'envoyeur) |
| Don de guilde max | 1 000 000 ¥ / semaine |
| Coffre de guilde max | Dépend du QG (voir ci-dessus) |

---

## 🎲 Drop Rates — Grille de Calibration (liée à la faune)

### Taux par Type et Tier de Mob

| Type de Mob | T1 | T2 | T3 | T4 | T5 |
|:---|---:|---:|---:|---:|---:|
| Commun (001-004, 010-013) | 50-65% | 40-55% | 30-45% | 20-35% | — |
| Élite (020-024) | — | 55-70% | 40-60% | 30-50% | 20-35% |
| Mini-boss (025) | — | 100% (×1) | 100% (×1) | 100% (×1) | 80-100% |
| Boss zone (026) | — | — | 100% (×2) | 100% (×2) | 100% (×2) |
| Donjon (030-034) | — | 60-75% | 45-65% | 35-55% | 25-40% |

### Règle de Précision

- Un mob drop **toujours** au moins 1 item (jamais de « loot vide »).
- Les drops ont des taux **indépendants** (plusieurs lignes = plusieurs rolls).
- Le nombre de lignes max : communs 1-2, élites 2-3, boss 3-4, donjon 2-3.
- Le loot `MAT_*` doit toujours correspondre à l'écologie du mob (un loup → `MAT_CUI`, jamais `MAT_MIN`).
- Les mobs T5 ne se trouvent qu'en donjon T5, raid ou axe vertical (Yggdrasil, Jötunheimr, Aincrad).

---

## 💰 Subventions de Départ et Anti-Inflation

### Package Initial (à la création du personnage)

| Item | Quantité | Valeur |
|:---|:---:|---:|
| Yrds | — | 300 ¥ |
| `CSM_NOU_010` Pain de Voyage | ×3 | 15 ¥ |
| `CSM_POT_001` Potion Soin Mineure | ×3 | 25 ¥ |
| `OFT_TOP_<VILLE>` Tenue de départ | ×1 | 0 ¥ |
| `OFT_BOT_<VILLE>` Tenue de départ | ×1 | 0 ¥ |
| **Total package** | | **~400 ¥ valeur** |

> Le package initial permet d'acheter une arme T1 (150-250 ¥) et de commencer à jouer sans farm obligatoire.

### Gold Sinks (sorties d'argent) — Classement par Impact

| Sink | Impact | Fréquence |
|:---|---:|:---|
| Réparations d'équipement | Élevé | Continue |
| Consommables (potions, nourriture) | Élevé | Continue |
| Pénalité de mort | Modéré | Épisodique |
| Taxes HdV | Modéré | Continue |
| Achat d'équipement en boutique | Modéré | Palier |
| Loyer immobilier | Faible | Hebdomadaire |
| Craft (frais de forge) | Faible | Continue |
| Enchantement | Très élevé | Palier (T4+) |
| Guilde (création + entretien) | Très élevé | Une fois + hebdo |
| Transaction directe (taxe 3%) | Faible | Épisodique |

> **Ratio entrées/sorties** calibré pour que le joueur moyen gagne ~20% de son revenu horaire net après sinks (hors farming intensif).
> **Inflation maîtrisée** : les sinks fixes (réparations, taxes, loyers) s'ajustent au niveau via le coût des équipements. Pas de création monétaire illimitée (les drops de mobs sont des items, pas de l'argent direct).
