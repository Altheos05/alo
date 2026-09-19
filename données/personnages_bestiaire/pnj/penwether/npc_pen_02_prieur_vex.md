# 🕯️ Prieur Vex — `NPC_PEN_02`

## 1. Identification Cardinal

| Champ | Valeur |
|---|---|
| **NPC_ID** | `NPC_PEN_02` |
| **Nom affiché** | Prieur Vex |
| **Race** | Spriggan |
| **Rôle** (`T_NPC.role_type`) | `SKILL_MASTER` (maître d'illusions — montre la vraie ville sous les masques) |
| **Zone** | `ZONE_SPR_CAP_001` — Penwether, Cloître Renversé |
| **Niveau / HP / MP** | 82 / 14 500 / 22 000 |
| **`qi_budget` / `is_essential`** | 12 / VRAI |

## 2. Bio & Personnalité

- **Bio** : Vex est le plus ancien illusionniste de Penwether — un Spriggan au masque de pierre fendue qui ne l'enlève jamais, même quand il dort. Il enseigne l'Illusion au Cloître Renversé, un jardin suspendu dont les arcades poussent vers le bas. Sa spécialité n'est pas de créer des illusions, mais de les dissiper : il apprend à ses élèves à voir sous les masques du monde, y compris les masques des Spriggans eux-mêmes. Il est l'un des rares à savoir que les rues changeantes de Penwether ne sont pas une illusion civique — ce sont des strates de code qui se réallouent. Et il craint que plus personne ne veuille voir la vérité.
- **Traits** : ascétique, patient, troublant de lucidité ; parle comme s'il lisait un texte que personne d'autre ne voit.
- **Voix** : calme, comme désillusionnée (« Tu portes un masque. Je ne parle pas de celui sur ton visage. Je parle de celui que tu crois être. Enlève-le. Ou reste. Mais ne mens pas sur ton mensonge. »).
- **Relations** : Apprenti Illusionniste `NPC_PEN_21` (son élève — talent brut, mais a peur de voir trop loin) ; Chancelier Masques `NPC_PEN_07` (le sait dangereux, mais ne peut rien contre lui) ; Fantôme des Ruines `NPC_PEN_00` (a entrevu sa présence dans une illusion trop profonde).

## 3. QI — budget 12

| # | QI_ID | Niv | Sujet | Contenu / Ligne | Condition |
|---|---|---|---|---|---|
| 1 | `QI_PEN_02_01` | K0 | illusion, enseignement | Base des illusions — types, durée, coût en MP | — |
| 2 | `QI_PEN_02_02` | K0 | cloitre, histoire | Le Cloître Renversé : autrefois un temple, renversé par un « vent de compilation » | — |
| 3 | `QI_PEN_02_03` | K0 | masques, perception | Les masques des Spriggans sont des « filtres » — sans eux, on voit le code | — |
| 4 | `QI_PEN_02_04` | K1 | ville, verite | Penwether n'est pas une ville : c'est une structure de données que les Spriggans habitent par erreur | `AFF>=65` |
| 5 | `QI_PEN_02_05` | K1 | rues, changement | Les rues changent parce que l'index mémoire se réorganise la nuit — ce n'est pas magique | `AFF>=70` |
| 6 | `QI_PEN_02_06` | K1 | vex, crainte | Il craint que le jour où les Spriggans verront tous la vérité, la ville s'effondre | — |
| 7 | `QI_PEN_02_07` | K2 | illusion, profonde | Il sait percer les faux-semblants — une discipline de l'esprit, pas un sort (D89 : aucune école d'Illusion) | `AFF>=85` |
| 8 | `QI_PEN_02_08` | K2 | apparition, fantome | Il a vu le Fantôme `NPC_PEN_00` dans une illusion — une silhouette en négatif | `AFF>=88` |
| 9 | `QI_PEN_02_09` | K2 | chancelier, secret | Le Chancelier `NPC_PEN_07` porte un masque qui n'est pas un masque — c'est un écran de terminal | `AFF>=90` |
| 10 | `QI_PEN_02_10` | K3 | seed, reset | Les illusions sont des « fenêtres sur les resets passés » — il peut montrer ce qui était là avant | JAMAIS — déflection : *(il ferme les yeux)* « Je ne montre pas ce qui était là avant. Je ne suis pas un guide. Je suis un prieur. Les morts du passé n'ont pas besoin de témoins. » |
| 11 | `QI_PEN_02_11` | K3 | cardinal, verrou | Le Cardinal a verrouillé certaines strates de Penwether — l'illusion ne peut pas tout montrer | JAMAIS — déflection : *(son masque fendu semble se resserrer)* « Il y a des portes que même la vérité ne doit pas ouvrir. Pas parce qu'elles sont interdites. Parce que derrière, il n'y a plus de vérité. Juste du blanc. Du vide. Du code qui n'attend qu'à être écrit. » |
| 12 | `QI_PEN_02_12` | KX | *(hors service)* | « Va. Entraîne-toi à voir. Reviens quand tu sauras distinguer ton reflet du reflet de ton reflet. » | — |

## 4. Chaînage économique & quêtes

- **Skill Master** : enseigne les sorts de l'école `TEN` (Ténèbres), école affine des Spriggan (D89 : l'Illusion n'est pas une école du lot I-4 ; elle reste la lecture narrative de ces sorts). Quête d'apprentissage : `QST_PEN_ILLUSION_01`.
- **Fils rouges** : rouage central de **🎭 Les Illusions Qui Mentent** (les illusions sont des fuites mémoire de la compilation). Relais de **🔮 Fil méta — La Ville Fantôme** (il connaît la nature de Penwether).
- Donneur de `QST_PEN_VRAIE_VILLE_01` (trouver trois « ancres d'illusion » dans Penwether).

## 5. Intégration Bot

- **Accueil** (`!parler vex`) : *« Un autre qui veut voir derrière le rideau. Tu es sûr ? Parce que derrière le rideau, il y a un autre rideau. Et au bout, il y a moi. Assieds-toi. »*
- `!learn_skill MAG_TEN_*` (apprentissage auprès de lui) — les anciennes commandes `!illusion_vex` / `!true_seeing` sont retirées (D89).
- `is_essential = VRAI` — `SYS_ASSASSINATE_NPC` interdit.
