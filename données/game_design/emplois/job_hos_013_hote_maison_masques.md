# Hôte de la Maison des Masques — `JOB_HOS_013`

## Identification
- **JOB_ID** : `JOB_HOS_013`
- **Titre** : Hôte de la Maison des Masques
- **Catégorie** : hospitality
- **Employeur** : `city` → `ZONE_SPR_CAP_001` (Maison d'hôtes municipale de Penwether)
- **Zone** : Penwether (`ZONE_SPR_CAP_001`)
- **Note** : entériné (session de reprise post-étape 52) — Penwether n'aura pas d'aubergiste PNJ nommé : la maison d'hôtes municipale (`employer_type='city'`) est la solution définitive. Cohérent avec la culture spriggan du Voile (anonymat de rigueur) — un hôte identifié et récurrent contredirait l'étiquette qui interdit de reconnaître un client démasqué.

## Paramètres
- **Niveau requis** : 8
- **Salaire par service** : 300 Yrds
- **Cooldown** : 8 h
- **Réputation gagnée** : ville (Penwether)

## Déroulement du service (`!work`)
À Penwether, chaque voyageur porte un masque et personne ne demande le vrai nom. Le mini-jeu : loger les hôtes en respectant l'étiquette du Voile (ne jamais reconnaître un client démasqué), assigner les chambres selon les affinités devinées et gérer un quiproquo d'identité. Étiquette tenue = pourboire discret ; masque involontairement dévoilé = scandale, −20 %.

## Progression
- **Apprenti → Compagnon** (50 services, ×1.5) : gestion des suites voilées.
- **Compagnon → Maître** (200 services, ×2.0) : maîtrise « Hôte du Voile » — accès au coffre de la maison d'hôtes et l'intendance te confie les secrets que les masques laissent filer (crochet side-quest affinité).

## Intégration Bot
- Joueur : `!apply_job JOB_HOS_013`, `!work`, `!payslip`
- GM : `!sys_assign_job [Avatar] JOB_HOS_013`, `!sys_fire [Avatar]`
- IA : `SYS_ASSIGN_JOB`, `SYS_JOB_EVENT(ZONE_SPR_CAP_001, bal_masque)`, `SYS_PAY_WAGE`
