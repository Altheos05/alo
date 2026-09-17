# Convoyeur de trésors voilés — `JOB_LOG_013`

## Identification
- **JOB_ID** : `JOB_LOG_013`
- **Titre** : Convoyeur de trésors voilés
- **Catégorie** : logistics
- **Employeur** : `guild` → `GUILDE_SPR_TRESORS` (Guilde des Chercheurs de Trésors de Penwether — guilde de métier, lore ; cf. `table_t_guilds.md` §5, distincte de `T_GUILDS`)
- **Zone** : Penwether (`ZONE_SPR_CAP_001`)

## Paramètres
- **Niveau requis** : 14
- **Salaire par service** : 520 Yrds
- **Cooldown** : 8 h
- **Réputation gagnée** : guilde (Chercheurs de Trésors)

## Déroulement du service (`!work`)
Les Spriggan sont les fouilleurs de ruines d'ALfheim ; leurs trouvailles voyagent sous illusion pour tromper les pilleurs. Le mini-jeu : dissimuler la cargaison sous un leurre d'illusion, choisir la route et le faux itinéraire de diversion, puis défendre le vrai convoi lors d'une embuscade scriptée. Trésor livré sans éveiller les soupçons = solde de guilde ; leurre percé et convoi pillé = perte, −20 %.

## Progression
- **Apprenti → Compagnon** (50 services, ×1.5) : convois d'artefacts de fouille de haute valeur.
- **Compagnon → Maître** (200 services, ×2.0) : maîtrise « Maître du leurre » — bonus de furtivité/transport (documenté) et la guilde te confie l'acheminement des reliques légendaires (revenu majoré).

## Intégration Bot
- Joueur : `!apply_job JOB_LOG_013`, `!work`, `!payslip`
- GM : `!sys_assign_job [Avatar] JOB_LOG_013`, `!sys_fire [Avatar]`
- IA : `SYS_ASSIGN_JOB`, `SYS_JOB_EVENT(ZONE_SPR_CAP_001, embuscade_pilleurs)`, `SYS_PAY_WAGE`
