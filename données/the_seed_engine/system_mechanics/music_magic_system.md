# Système de Magie Musicale (Puca Sound Magic)

> ⛔ **REMPLACÉ (étape 60, D89)** — Prose héritée d'avant les conventions d'ID (D13), qui **duplique** l'école `SUP` (Support, affine Puca) du lot validé I-4 (D40) : ses sorts sont déjà de la magie de barde (Battle Hymn, War March, Requiem `MAG_SUP_008`, Harmony of Valor, Overture of Genesis). La canalisation continue (« tant que le Puca joue », MP/seconde) n'a pas d'équivalent sur WhatsApp. Par application de D66, **ce document n'est plus une source de vérité** : `!music [sort]` devient un **alias de `!cast`** pour l'école `SUP`, `!melodies` liste les sorts `SUP` appris, `!music_stop` est retiré ; `SYS_GRANT_MELODY` est redirigée vers l'attribution de sort standard, `SYS_AMPLIFY_MUSIC` est retirée. Lancement hors combat : D90. Conservé pour mémoire uniquement.

## 1. Définition Cardinal System
La magie musicale est l'apanage exclusif de la race **Puca**. Contrairement aux autres races qui vocalisent des incantations en pseudo-vieux norrois, les Puca canalisent le mana à travers des instruments de musique virtuels (harpe, flûte, luth, tambour). La mélodie jouée détermine l'effet magique.

## 2. Mécanique de Jeu
- **Activation** : `!music [Nom_Mélodie]`
- **Durée** : Les buffs musicaux persistent tant que le Puca continue de jouer. S'il est interrompu (Casting Break), l'effet cesse immédiatement.
- **Portée** : Zone d'effet circulaire de 30m. Affecte tous les alliés du groupe (Party).
- **Coût** : `5 MP/seconde` de jeu continu.

## 3. Liste des Mélodies Connues

| Mélodie | Effet | Niveau Requis | MP/sec |
|---|---|---|---|
| Hymne du Vent | +20% Vitesse de vol pour le groupe | 5 | 3 |
| Requiem de Guerre | +15% ATK physique pour le groupe | 15 | 5 |
| Berceuse de Brume | -20% Précision des ennemis dans la zone | 20 | 6 |
| Symphonie de Guérison | Régénère 2% HP/sec pour le groupe | 25 | 8 |
| Marche Funèbre | -30% DEF des ennemis (debuff offensif) | 35 | 7 |
| Aria de Résurrection | Accélère le timer de Remain Light de 50% | 40 | 10 |
| Cacophonie Infernale | Inflige des dégâts sonores continus aux ennemis | 50 | 12 |
| Chant de l'Arbre-Monde | +50% EXP gagnée pour le groupe (hors combat) | 60 | 15 |

## 4. Commande IA Associée
- `SYS_GRANT_MELODY(Avatar_ID, Melody_ID)` : L'IA peut enseigner une mélodie secrète à un Puca qui résout une quête musicale.
- `SYS_AMPLIFY_MUSIC(Zone_ID, Multiplier)` : L'IA amplifie la portée de la musique dans certaines zones sacrées (ex: Cathédrale d'Alne).
