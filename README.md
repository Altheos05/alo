# ⚔️ ALO — ALfheim Online sur WhatsApp

MMORPG textuel inspiré de **Sword Art Online : ALfheim Online**, joué via des groupes WhatsApp
pilotés par le Système Cardinal (bot Node.js + LLM).

> **Principe fondateur (D76) : un territoire = un groupe WhatsApp** — la zone reste la granularité du gameplay
> (état L1 `current_zone_id`) ; changer de groupe, c'est franchir une frontière de territoire.
> La limite des 100 groupes par communauté WhatsApp impose ce design (13 groupes territoriaux,
> 13 groupes sociaux permanents, ~74 slots libres pour dynamiques).

> **Environnement cible** : 2 OCPUs / 12 Go RAM — le pool PostgreSQL (`DB_POOL_SIZE=4`), les quotas LLM et le chargement des modèles ONNX sont dimensionnés pour cette contrainte.

---

## 🏗️ Architecture

```
alo/
├── bot/                            # ★ CODE DU BOT (Node.js)
│   ├── src/
│   │   ├── index.js                # Point d'entrée, initialisation
│   │   ├── orchestrator/           # Message handler, routage d'intention
│   │   ├── handlers/               # movement, combat, economy, player, dialogue
│   │   ├── services/               # whatsapp, zone-groups, player, template, rag
│   │   ├── agents/                 # router (classifieur d'intention), models
│   │   └── engine/                 # movement (graphe de zones), combat engine
│   ├── tests/integration.mjs       # 37 tests d'intégration
│   └── .env.example
├── scripts/
│   └── seed-generator.js           # Convertit les fiches markdown en SQL
├── schema.sql                      # Modèle de données PostgreSQL (46 tables)
├── seed_data.sql                   # Données générées (items, monstres, PNJ, etc.)
├── données/                        # ★ FICHES DU MONDE (markdown structuré)
│   ├── cartographie/               # Atlas, territoires, routes
│   ├── personnages_bestiaire/      # Monstres (257), PNJ (300+), boss
│   ├── items_equipements/          # 851 items
│   ├── competences_magie/          # Sorts, OSS, passifs
│   └── the_seed_engine/            # Mécaniques, scaling, registres de commandes
└── cahier_des_charges.md           # Spécification projet
```

## 📱 Architecture Communautaire WhatsApp

La limite de **100 groupes par communauté** a conduit à un design en 3 couches :

| Couche | Groupes | Rôle |
|--------|---------|------|
| **Communauté** | 4 | 📢 Annonces, 📋 Enregistrement, 💬 Général, 🤝 LFG |
| **Raciaux** | 9 | 🏛️ Un par peuple (jamais quitté) |
| **Territoires** | 13 | 🌿 Terres Sylphes, 🔥 Terres Salamanders, … (auto-switch au déplacement) |

**13 territoires** couvrent les 52 zones du jeu (9 raciaux × 5 zones + Alne + Aincrad + Jotunheimr + Yggdrasil).
Quand un joueur se déplace, `syncPlayerGroups()` retire les groupes de territoire non autorisés
et le rejoint dans le bon — sans toucher aux groupes permanents.

**26 groupes permanents** (4 communauté + 9 raciaux + 13 territoriaux) — il reste **~74 slots** pour guildes,
instances et parties. Référentiel : atlas §2-bis + protocole de déplacement v2.0 (**D76**, docs maîtres amendés étape 48).

## 🏛️ Guilde d'Alne

Le **Hall de la Guilde** à Alne (ZONE_NEU_CAP_001) accueille 4 PNJ :

- **Aldric** `NPC_ALN_100` — Maître de Guilde (orientation, création de guilde)
- **Bryn** `NPC_ALN_101` — Forgeronne (vente d'armes/armures, réparation)
- **Élara** `NPC_ALN_102` — Quétatrice (4 quêtes de guilde)
- **Selma** `NPC_ALN_103` — Greffière (inscriptions, registres, annuaire)

## 🧠 Pipeline d'exécution

```
Message WA → processMessage() → Intent (regex + ML zero-shot)
                                     │
                          ┌──────────┼──────────┐
                          ▼          ▼          ▼
                     Action hdlr   Lore/RAG    SYS/Flow
                          │          │          │
                          ▼          ▼          ▼
                     Template ← ── LLM ── → Pipeline SYS
                          │          │          │
                          ▼          ▼          ▼
                     Réponse ← ─── Synthèse ─── Lock + DB
```

0. **Résolution du menu contextuel numéroté (D83)** : citation d'un message-menu du bot, ou chiffre nu avec menu non expiré → résolution directe vers la commande déjà paramétrée, sans passer par la classification d'intention. Cf. `system_mechanics/menu_contextuel_protocol.md`.
1. **Message entrant** → `whatsapp.js` → `processMessage()` dans `message-handler.js`
2. **Classification d'intention** : keyword scoring → ML zero-shot (`models/intent.js`) → regex patterns (`agents/router.js`)
3. **Extraction d'entités** : NER ONNX → regex IDs → fuzzy gazetteer (`models/ner.js` + `services/gazetteer.js`)
4. **Routage** vers le handler approprié (movement, combat, economy, player, dialogue)
5. **Si GM** (`!sys_*`) → pipeline SYS : parse → D71 → prérequis → autorisation → lock advisory PostgreSQL → exécution transactionnelle
6. **Si LLM nécessaire** → cascade de providers (Groq → Mistral → OpenRouter → HuggingFace → Gemini) avec quotas et fallback template
7. **RAG** : 3 niveaux (cache → index vectoriel 1243 chunks → DB → LLM) pour enrichir le contexte
8. **Post-traitement** : les sorties LLM sont parsées pour les commandes SYS_* embarquées, puis rendues via `services/template.js`

## 📖 Lexique technique

| Terme | Définition |
|---|---|
| **D76** | Décision fondatrice : 1 territoire = 1 groupe WhatsApp. La zone reste l'unité de gameplay (`current_zone_id`), le groupe change lors d'un franchissement de frontière. |
| **D71** | Vérification pré-exécution d'une commande SYS : existence de l'entité (joueur, item, PNJ, zone) avant de modifier l'état. |
| **L1** | État léger : données volatiles du joueur en session (position, PV, effets actifs), stockées en mémoire + DB. |
| **ACP** | Architecture, Code, Procédure — les trois piliers de la gouvernance du projet. |
| **R0–R3 / nR5–nR15** | Références d'audit de conformité entre le code et le cahier des charges. |
| **SYS_*** | Commandes système intégrées au jeu : `SYS_GRANT_ITEM`, `SYS_ADVANCE_QUEST`, `SYS_NPC_KNOWLEDGE_UNLOCK`, `SYS_SET_ENV_HAZARD`, `SYS_SHOP_RESTOCK`. Accessibles via `!sys_*` (GM) ou générées par l'IA. |
| **Pipeline SYS** | Parseur de commandes intégrées dans les sorties LLM : regex → D71 → prérequis → autorisation → lock advisory PostgreSQL → exécution transactionnelle. |
| **RAG** | Retrieval-Augmented Generation : 3 niveaux (cache mémoire → index vectoriel → DB → LLM) pour enrichir les réponses de l'IA avec les connaissances du jeu. |
| **Embedding** | Vecteur 384 dimensions (`Xenova/all-MiniLM-L6-v2`) représentant le sens d'un texte. Utilisé pour la recherche sémantique et le RAG vectoriel. |
| **Zero-shot** | Classification d'intention sans entraînement préalable, via `Xenova/distilbert-base-uncased-mnli` (ONNX). |
| **NER** | Named Entity Recognition — extraction des entités (PNJ, monstres, zones, items) depuis le texte du joueur, via `Xenova/bert-base-NER` + regex + gazetteer. |
| **ONNX** | Open Neural Network Exchange — format de modèle ML inféré localement via `onnxruntime-node`. |
| **Gazetteer** | Index mémoire de toutes les entités du jeu (items, PNJ, zones, monstres) chargé au démarrage, utilisé par le NER et les handlers pour la résolution floue. |
| **LLM Cascade** | Chaîne de fallback entre providers LLM : Groq → Mistral → OpenRouter → HuggingFace → Gemini, avec quotas et rate-limiting par provider. |
| **YRDS** | Monnaie du jeu (Yrd). Solde initial : 500. |
| **OSS** | Original Spell System — compétences propres à chaque race (MAG = magie commune, PAS = passifs). |
| **Quota LLM** | Limite de requêtes par minute par provider (ex: Groq 60/min, Mistral 50/min). Réinitialisation toutes les 60s avec recharge progressive. |

## 🧪 Tests

```bash
node bot/tests/integration.mjs
```

37 tests couvrent : handler STATUS/INVENTORY/QUESTS/BUY/SELL/TALK, pipeline SYS (5 commandes),
processMessage (9 cas), spawn/combat, routage GM, status effects (6 cas).

## ⚙️ Intégrations IA

| Technologie | Usage | Modèle / Provider | Exécution |
|---|---|---|---|
| **LLM narratif** | Narration, dialogues, lore, combats | Groq → Mistral → OpenRouter → Gemini | Distant (API) |
| **LLM fallback** | Réponses sans API | ~25 templates statiques | Local (template.js) |
| **Embeddings** | Recherche sémantique vectorielle | `Xenova/all-MiniLM-L6-v2` (384 dims) | Local ONNX |
| **Zero-shot intent** | Classification d'intention | `Xenova/distilbert-base-uncased-mnli` | Local ONNX |
| **NER** | Extraction d'entités | `Xenova/bert-base-NER` + regex + gazetteer | Local ONNX |
| **RAG** | Enrichissement de contexte | Vector index (1243 chunks, 7 sources) + DB + LLM | Hybride |
| **Pipeline SYS** | IA → Game state | Parseur regex + 5 commandes + lock DB | Local |
| **Anti-injection** | Sécurisation des prompts LLM | 22 patterns regex (FR/EN) | Local |

## 📊 État d'Avancement

| Chantier | Statut |
|---|---|
| Architecture & gouvernance | ✅ |
| Base de données (46 tables, schéma complet) | ✅ |
| Atlas & graphe des zones (52 zones, 13 territoires) | ✅ |
| Bestiaire (257 monstres, stats réelles parsées) | ✅ |
| Items (851, dont armes/armures/matériaux) | ✅ |
| PNJ (300+, noms et rôles corrects) | ✅ |
| Bot Node.js (whatsapp-web.js, orchestration, handlers) | ✅ |
| Combat (recherche monstre, tours, dégâts nivelés) | ✅ |
| Pipeline SYS (5 commandes d'administration) | ✅ |
| Index vectoriel RAG (1243 chunks, 7 sources) | ✅ |
| Audit CDC (R1-R3, nR5-nR15 — 100% clos) | ✅ |
| Guilde d'Alne & PNJ associés | ✅ |
| Architecture WA par territoires | ✅ |
| Guildes joueurs, groupes sociaux, instances | ⏳ À venir |
| ML ONNX (classifieur d'intention neuronal) | ⏳ Modèle chargé, non branché |

## 📜 Licence

MIT — voir [LICENSE](LICENSE).
