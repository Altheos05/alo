# 📇 INDEX — Dictionnaire d'emplois salariés (Lot SOC-1)

> **Lot SOC-1 du CDC-SOC-01 (`21_cdc_systemes_sociaux.md` §3).** 66 fiches d'emploi **neuves** (`T_JOBS_DICT`), numérotées à la suite des 12 archétypes seed de `table_t_jobs.md` (série `_003` → `_013` par catégorie). Convention : `JOB_<CAT>_<NNN>`. Catégories : `HOS` hospitality · `CRA` crafting · `GRD` guard · `LOG` logistics · `COM` commerce · `SRV` service.
>
> **Couverture** : 6 emplois × 11 capitales = 66 (≥ 5/capitale exigé). Salaires calés sur `economy_balance_sheet.md` v2.0 (fourchette seed 120–600 Yrds, cooldown 8 h). Variantes raciales cohérentes (forge gnome/leprechaun/salamander, pêche undine, musique puca, illusion imp/spriggan, familiers cait sith, vol sylphe).
>
> **Statut fichiers maîtres** : `table_t_jobs.md`, `whatsapp_commands_list.md`, `ai_orchestrator_commands.md` et fichiers d'état `alo_*` **non modifiés** (protocole D37). Réconciliation orchestrateur : voir §4.

---

## 1. Tableau récapitulatif (66 fiches)

| JOB_ID | Titre | Catégorie | Ville | Niv min | Salaire (Yrds) |
|---|---|---|---|---:|---:|
| `JOB_HOS_003` | Concierge de l'Auberge de la Racine | hospitality | Alne | 6 | 240 |
| `JOB_HOS_004` | Hôte de la Canopée | hospitality | Swilvane | 5 | 220 |
| `JOB_HOS_005` | Aubergiste-adjoint du Brasier | hospitality | Voulg | 7 | 260 |
| `JOB_HOS_006` | Tenancier-adjoint de La Braise Joyeuse | hospitality | Gattan | 9 | 320 |
| `JOB_HOS_007` | Hôte de l'Auberge du Chat Botté | hospitality | Freelia | 6 | 240 |
| `JOB_HOS_008` | Hôte de l'Auberge de l'Écume | hospitality | Archipel d'Écume | 6 | 250 |
| `JOB_HOS_009` | Hôte de l'Auberge du Lac | hospitality | Lioda | 5 | 220 |
| `JOB_HOS_010` | Hôte de l'Auberge de l'Encrier | hospitality | Duskarn | 7 | 270 |
| `JOB_HOS_011` | Hôte de l'Auberge du Socle | hospitality | Granzam | 8 | 300 |
| `JOB_HOS_012` | Intendant du dortoir de la Forge-Mère | hospitality | Brokkheim | 10 | 360 |
| `JOB_HOS_013` | Hôte de la Maison des Masques | hospitality | Penwether | 8 | 300 |
| `JOB_CRA_003` | Copiste-relieur de la Racine | crafting | Alne | 8 | 300 |
| `JOB_CRA_004` | Tailleur de topiaires vivantes | crafting | Swilvane | 9 | 320 |
| `JOB_CRA_005` | Souffleur de forge | crafting | Voulg | 10 | 360 |
| `JOB_CRA_006` | Graveur de runes de forge | crafting | Gattan | 12 | 440 |
| `JOB_CRA_007` | Harnacheur de familiers | crafting | Freelia | 9 | 330 |
| `JOB_CRA_008` | Écailleur-mareyeur | crafting | Archipel d'Écume | 8 | 300 |
| `JOB_CRA_009` | Facteur d'instruments | crafting | Lioda | 11 | 400 |
| `JOB_CRA_010` | Préparateur de poudres d'ombre | crafting | Duskarn | 11 | 400 |
| `JOB_CRA_011` | Apprenti-forgeron des Profondeurs | crafting | Granzam | 12 | 440 |
| `JOB_CRA_012` | Apprenti-trempeur de la Forge-Mère | crafting | Brokkheim | 14 | 500 |
| `JOB_CRA_013` | Mouleur de masques | crafting | Penwether | 11 | 400 |
| `JOB_GRD_003` | Vigie de la Canopée | guard | Alne | 8 | 340 |
| `JOB_GRD_004` | Vigie des Cimes | guard | Swilvane | 9 | 360 |
| `JOB_GRD_005` | Garde des Grottes de Lave | guard | Voulg | 11 | 420 |
| `JOB_GRD_006` | Garde-frontière des Plaines de Cendres | guard | Gattan | 14 | 520 |
| `JOB_GRD_007` | Maître-chien des rondes | guard | Freelia | 10 | 380 |
| `JOB_GRD_008` | Garde des Quais | guard | Archipel d'Écume | 10 | 380 |
| `JOB_GRD_009` | Garde du Balcon Résonant | guard | Lioda | 9 | 360 |
| `JOB_GRD_010` | Garde du Bazar des Ombres | guard | Duskarn | 11 | 420 |
| `JOB_GRD_011` | Garde des Carrières | guard | Granzam | 12 | 440 |
| `JOB_GRD_012` | Garde de la Halle aux Lames | guard | Brokkheim | 13 | 480 |
| `JOB_GRD_013` | Garde des Façades | guard | Penwether | 12 | 440 |
| `JOB_LOG_003` | Postier de la Racine | logistics | Alne | 5 | 240 |
| `JOB_LOG_004` | Coursier aérien des Branches | logistics | Swilvane | 7 | 280 |
| `JOB_LOG_005` | Porteur de minerai | logistics | Voulg | 6 | 250 |
| `JOB_LOG_006` | Estafette de l'État-Major | logistics | Gattan | 10 | 380 |
| `JOB_LOG_007` | Coursier félin des toits | logistics | Freelia | 8 | 300 |
| `JOB_LOG_008` | Passeur de barque inter-îles | logistics | Archipel d'Écume | 9 | 340 |
| `JOB_LOG_009` | Messager à cor | logistics | Lioda | 7 | 280 |
| `JOB_LOG_010` | Coursier furtif | logistics | Duskarn | 12 | 440 |
| `JOB_LOG_011` | Wagonnier des galeries | logistics | Granzam | 10 | 380 |
| `JOB_LOG_012` | Convoyeur de lingots | logistics | Brokkheim | 15 | 560 |
| `JOB_LOG_013` | Convoyeur de trésors voilés | logistics | Penwether | 14 | 520 |
| `JOB_COM_003` | Étalagiste du marché central | commerce | Alne | 4 | 190 |
| `JOB_COM_004` | Commis de l'échoppe de graines | commerce | Swilvane | 4 | 190 |
| `JOB_COM_005` | Commis de l'armurerie | commerce | Voulg | 6 | 240 |
| `JOB_COM_006` | Clerc de l'Hôtel des Ventes | commerce | Gattan | 8 | 300 |
| `JOB_COM_007` | Commis de l'animalerie | commerce | Freelia | 4 | 190 |
| `JOB_COM_008` | Commis de la criée aux poissons | commerce | Archipel d'Écume | 5 | 210 |
| `JOB_COM_009` | Commis du comptoir de cuivre | commerce | Lioda | 5 | 210 |
| `JOB_COM_010` | Commis de l'échoppe de dagues | commerce | Duskarn | 6 | 240 |
| `JOB_COM_011` | Commis du comptoir de minerais | commerce | Granzam | 6 | 240 |
| `JOB_COM_012` | Commis de l'armurerie | commerce | Brokkheim | 7 | 270 |
| `JOB_COM_013` | Commis de l'antiquaire | commerce | Penwether | 7 | 270 |
| `JOB_SRV_003` | Guide d'orientation des Débutants | service | Alne | 3 | 160 |
| `JOB_SRV_004` | Soigneur de montures ailées | service | Swilvane | 4 | 180 |
| `JOB_SRV_005` | Gardien du brasero éternel | service | Voulg | 5 | 200 |
| `JOB_SRV_006` | Manœuvre des remparts | service | Gattan | 6 | 230 |
| `JOB_SRV_007` | Toiletteur de familiers | service | Freelia | 3 | 160 |
| `JOB_SRV_008` | Palefrenier des montures marines | service | Archipel d'Écume | 4 | 180 |
| `JOB_SRV_009` | Ménestrel de rue accordé | service | Lioda | 5 | 210 |
| `JOB_SRV_010` | Allumeur de lanternes d'ombre | service | Duskarn | 4 | 180 |
| `JOB_SRV_011` | Boutefeu des galeries | service | Granzam | 9 | 340 |
| `JOB_SRV_012` | Charbonnier de la Forge-Mère | service | Brokkheim | 6 | 230 |
| `JOB_SRV_013` | Gardien de vestiaire des masques | service | Penwether | 5 | 200 |

---

## 2. Totaux par catégorie

| Catégorie | Nombre | Plage niveau | Plage salaire |
|---|---:|---:|---:|
| hospitality (`HOS`) | 11 | 5–10 | 220–360 |
| crafting (`CRA`) | 11 | 8–14 | 300–500 |
| guard (`GRD`) | 11 | 8–14 | 340–520 |
| logistics (`LOG`) | 11 | 5–15 | 240–560 |
| commerce (`COM`) | 11 | 4–8 | 190–300 |
| service (`SRV`) | 11 | 3–9 | 160–340 |
| **Total** | **66** | **3–15** | **160–560** |

> Toutes les valeurs restent dans la fourchette des 12 seed (120–600 Yrds) et cohérentes avec le revenu horaire par palier de `economy_balance_sheet.md` (l'emploi = revenu d'appoint stable, plafonné sous le farm PvE de la tranche).

---

## 3. Totaux par ville (6 emplois chacune, ≥ 5 exigé)

| Ville | Zone | Préfixe PNJ | Emplois |
|---|---|---|---:|
| Alne | `ZONE_NEU_CAP_001` | NPC_ALN | 6 |
| Swilvane | `ZONE_SYL_CAP_001` | NPC_SWI | 6 |
| Voulg | `ZONE_SAL_TWN_001` | NPC_VOU | 6 |
| Gattan | `ZONE_SAL_CAP_001` | NPC_GAT | 6 |
| Freelia | `ZONE_CAI_CAP_001` | NPC_FRE | 6 |
| Archipel d'Écume | `ZONE_UND_CAP_001` | NPC_UND | 6 |
| Lioda | `ZONE_PUC_CAP_001` | NPC_LIO | 6 |
| Duskarn | `ZONE_IMP_CAP_001` | NPC_DUS | 6 |
| Granzam | `ZONE_GNO_CAP_001` | NPC_GRA | 6 |
| Brokkheim | `ZONE_LEP_CAP_001` | NPC_BRO | 6 |
| Penwether | `ZONE_SPR_CAP_001` | NPC_PEN | 6 |
| **Total** | | | **66** |

Chaque ville couvre les 6 catégories (1 emploi/catégorie), avec ancrage racial : forge/feu (Voulg, Gattan Salamander ; Granzam Gnome ; Brokkheim Leprechaun), pêche/mer (Undine), vol/canopée (Sylph), musique (Puca), ombre/illusion (Imp, Spriggan), familiers (Cait Sith), hub d'accueil (Alne neutre).

### Répartition des types d'employeur

| `employer_type` | Occurrences | Emplois concernés |
|---|---:|---|
| `npc` | 47 | Employeur PNJ vérifié (dossier `pnj/<ville>/`) |
| `city` | 17 | Gardes municipaux, temple, voirie, guides, maison d'hôtes |
| `guild` | 2 | `JOB_LOG_012`, `JOB_LOG_013` — référencent une guilde de métier lore (`table_t_guilds.md` §5), pas une ligne `T_GUILDS` |
| `property` | 0 | **Non utilisé** — auberge exploitable joueur = BACKLOG (CDC §4) |

---

## 4. `[BESOIN_*]` relevés — **tous résolus** (session de reprise post-étape 52)

### `[BESOIN_NPC]` — employeur PNJ manquant → entériné, pas de PNJ créé
- **`JOB_HOS_012` (Brokkheim)** : le dortoir de la Forge-Mère (`NPC_BRO_20`, concierge) est la solution **définitive**, pas un pis-aller — cohérent avec la culture leprechaun d'hébergement collectif d'atelier. Aucun nouveau PNJ créé (le roster Brokkheim reste 100/100, D17).
- **`JOB_HOS_013` (Penwether)** : la maison d'hôtes municipale (`employer_type='city'`) est la solution **définitive** — un aubergiste nommé et récurrent contredirait l'étiquette du Voile (anonymat). Aucun nouveau PNJ créé (roster Penwether 100/100, D17).

### `[BESOIN_GUILD]` — guilde employeur non instanciée → résolu par un registre de guildes de métier
- **`JOB_LOG_012` (Brokkheim)** → `GUILDE_LEP_FORGES`.
- **`JOB_LOG_013` (Penwether)** → `GUILDE_SPR_TRESORS`.
- **`JOB_LOG_002` (seed, Caravanier)** → `GUILDE_CARAVANIERS`.

Constat structurel qui a débloqué le point : `T_GUILDS` exige `leader_avatar_uuid NOT NULL` (un fondateur **joueur**) — une guilde de métier PNJ ne peut donc jamais y avoir de ligne légitime sans inventer un faux avatar. Les 3 emplois référencent désormais un identifiant de guilde de métier stable, documenté dans `table_t_guilds.md` §5 (registre séparé, hors `T_GUILDS`) — zéro `guild_uuid` fabriqué, zéro ligne `T_GUILDS` polluée par une entrée non-joueur. `T_GUILDS` elle-même reste vide tant qu'aucun joueur n'a fondé de guilde (comportement normal, pas un manque de peuplement).

### `[BESOIN_RECONCILIATION]` — fichiers maîtres non touchés (attendu par D37)
1. **`table_t_jobs.md`** : ajouter les 66 lignes ci-dessus au dictionnaire `T_JOBS_DICT` (le §2 du fichier maître n'accueille pour l'instant que les 12 archétypes seed). Aucune collision d'ID (les seed s'arrêtent à `_002` par catégorie ; ce lot démarre à `_003`).
2. **Commandes** : aucune commande nouvelle introduite — toutes les fiches réutilisent le contrat déjà propagé (`!apply_job`, `!work`, `!payslip`, `!quit_job`, `!sys_assign_job`, `!sys_fire`, `SYS_ASSIGN_JOB`, `SYS_FIRE`, `SYS_PAY_WAGE`, `SYS_JOB_EVENT`). Dette de commande **nulle**.
3. **Crochets inter-systèmes déclarés** (progression « maître ») à confirmer côté systèmes cibles : slots HdV (`JOB_COM_006`), réductions de frais de forge/enchantement (`JOB_CRA_005/006/011/012`, `JOB_SRV_012`), items `DEC_*` de logement (`JOB_CRA_004/007/009/013`, lot SOC-3), réseau social (`JOB_SRV_003/007/013`). Ce sont des intentions de design, à valider quand les lots correspondants seront instanciés.
