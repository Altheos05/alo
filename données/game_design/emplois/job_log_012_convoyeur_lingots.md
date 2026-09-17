# Convoyeur de lingots — `JOB_LOG_012`

## Identification
- **JOB_ID** : `JOB_LOG_012`
- **Titre** : Convoyeur de lingots
- **Catégorie** : logistics
- **Employeur** : `guild` → `GUILDE_LEP_FORGES` (Guilde des Forges de Brokkheim — guilde de métier, lore ; cf. `table_t_guilds.md` §5, distincte de `T_GUILDS`)
- **Zone** : Brokkheim (`ZONE_LEP_CAP_001`)

## Paramètres
- **Niveau requis** : 15
- **Salaire par service** : 560 Yrds
- **Cooldown** : 8 h
- **Réputation gagnée** : guilde (Forges de Brokkheim)

## Déroulement du service (`!work`)
La guilde des forges exporte ses lingots de métal précieux vers les autres capitales — cargaison qui attire les brigands. Le mini-jeu : sceller les caisses de mithril et d'orichalque, choisir l'escorte et l'itinéraire, puis défendre le convoi lors d'une embuscade scriptée. Convoi arrivé intact = solde de guilde ; lingots perdus = dette, −20 % et réputation guilde entamée.

## Progression
- **Apprenti → Compagnon** (50 services, ×1.5) : convois inter-capitales de haute valeur.
- **Compagnon → Maître** (200 services, ×2.0) : maîtrise « Maître-convoyeur » — bonus de capacité de transport et de défense d'escorte (documenté) et la guilde te confie les cargaisons légendaires (revenu majoré).

## Intégration Bot
- Joueur : `!apply_job JOB_LOG_012`, `!work`, `!payslip`
- GM : `!sys_assign_job [Avatar] JOB_LOG_012`, `!sys_fire [Avatar]`
- IA : `SYS_ASSIGN_JOB`, `SYS_JOB_EVENT(ZONE_LEP_CAP_001, embuscade_convoi)`, `SYS_PAY_WAGE`
