# 🕯️ Tailleur d'Illusions — `NPC_PEN_23`

## 1. Identification Cardinal

| Champ | Valeur |
|---|---|
| **NPC_ID** | `NPC_PEN_23` |
| **Nom affiché** | Tailleur d'Illusions |
| **Race** | Spriggan |
| **Rôle** (`T_NPC.role_type`) | `SERVICE` (création et filtrage d'illusions sur mesure) |
| **Zone** | `ZONE_SPR_CAP_001` — Penwether, Cloître Renversé |
| **Niveau / HP / MP** | 42 / 4 500 / 14 000 |
| **`qi_budget` / `is_essential`** | 10 / FAUX |

## 2. Bio & Personnalité

- **Bio** : Le Tailleur d'Illusions est un Spriggan discret qui travaille à l'ombre du Cloître Renversé. Il ne crée pas des illusions lui-même — il les « taille », les ajuste, les filtre. Un client vient avec une illusion brute et repart avec une illusion calibrée : durée précise, déclencheur spécifique, public cible. Il travaille aussi en suppression : il « nettoie » les résidus d'illusions usées qui flottent dans les rues de Penwether et pourraient révéler des secrets. Il est le seul à pouvoir manipuler une illusion sans la détruire — un art que même Vex `NPC_PEN_02` respecte.
- **Traits** : précis, esthète, parle des illusions comme d'un tissu.
- **Voix** : posée, avec des gestes qui accompagnent (« Cette illusion a un défaut de trame ici. Tu vois ? Le fil du temps se distend. Je peux le resserrer. Ce sera plus cher, mais elle durera trois fois plus longtemps. »).
- **Relations** : Prieur Vex `NPC_PEN_02` (respect mutuel — Vex dissipe, lui taille) ; Apprenti Illusionniste `NPC_PEN_21` (rivaux amicaux — l'Apprenti déchire ce que le Tailleur coud) ; Concierge Marché `NPC_PEN_20` (lui commande des « nettoyages » d'illusions usées au Marché).

## 3. QI — budget 10

| # | QI_ID | Niv | Sujet | Contenu / Ligne | Condition |
|---|---|---|---|---|---|
| 1 | `QI_PEN_23_01` | K0 | illusions, sur mesure | Service de création d'illusions sur mesure — prix, délais | — |
| 2 | `QI_PEN_23_02` | K0 | filtrage, nettoyage | Nettoyage des résidus d'illusions dans les espaces publics | — |
| 3 | `QI_PEN_23_03` | K0 | cloitre, atelier | Son atelier au Cloître Renversé | — |
| 4 | `QI_PEN_23_04` | K1 | residus, memoire | Les résidus d'illusions usées gardent des fragments de ce qu'ils montraient | `AFF>=65` |
| 5 | `QI_PEN_23_05` | K1 | suppression, secret | Il nettoie des illusions qui montrent des choses que le Chancelier ne veut pas voir | `AFF>=70` |
| 6 | `QI_PEN_23_06` | K1 | marche, illusions usées | Le Marché des Sept Façades produit des illusions usées qu'il nettoie chaque nuit | — |
| 7 | `QI_PEN_23_07` | K2 | trame, systeme | Les illusions sont « tramées » sur une structure de code — il peut lire la trame | `AFF>=85` |
| 8 | `QI_PEN_23_08` | K2 | illusion, piégée | Il a trouvé une illusion « piégée » — elle montrait un visage qui n'existe pas (Kirito) | `AFF>=88` |
| 9 | `QI_PEN_23_09` | K3 | trame, cardinal | Les trames d'illusions sont faites du même « matériau » que le monde — tailler une illusion, c'est réécrire une micro-portion du code du monde | JAMAIS — déflection : *(il range ses aiguilles)* « Je ne taille pas des illusions. Je réécris des lignes du monde. Chaque illusion que j'ajuste, c'est un fragment de code que je modifie. Le Cardinal ne le sait pas. Ou il le sait et il me laisse faire parce que ça n'affecte que la surface. Mais un jour, je taillerai trop profond. Et je couperai un fil qui ne devrait pas être coupé. » |
| 10 | `QI_PEN_23_10` | KX | *(hors-sujet)* | « Une illusion bien taillée est meilleure qu'une vérité mal dite. » | — |

## 4. Chaînage économique & quêtes

- **Service** : sujets de service D84 — `!demander tailleur_illusions illusions` / `!demander tailleur_illusions nettoyage` (narratifs, sans effet mécanique : D89, aucune magie d'illusion jouable).
- **Fils rouges** : rouage de **🎭 Les Illusions Qui Mentent** (les illusions sont des trames de code). Relais de **🪞 La Statue de Kirito** (l'illusion piégée montrant Kirito).
- Donneur de `QST_PEN_ILLUSION_TRAME_01` (enquêter sur une illusion anormale dans les rues).

## 5. Intégration Bot

- **Accueil** (`!parler tailleur_illusions`) : *« Entre, entre. J'allais justement tailler une illusion pour un client. Tu vois ça ? La trame est irrégulière. Un travail d'amateur. Moi, je peux faire mieux. Beaucoup mieux. Pour toi, un prix d'ami. »*
- `!demander tailleur_illusions [sujet]` — les anciennes commandes `!taille_illusion` / `!nettoyage` sont retirées (D89).
