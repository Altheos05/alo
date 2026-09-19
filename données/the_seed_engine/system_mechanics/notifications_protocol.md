# Protocole de Notifications Sortantes

> **v1.0 (étape 60, 2026-09-19, D91)** — Mécanisme transverse de messages poussés par le bot. Modèle de données : `cardinal_system_db/MLD_Logic/table_t_notifications.md`.

## 1. Constat de départ

Le bot ne sait que **répondre** au message qu'il vient de recevoir (`msg.reply`, `services/whatsapp.js`). Plusieurs systèmes spécifiés supposent pourtant d'écrire à un tiers : la cible d'une demande en mariage (D85), le destinataire d'un courrier, un invité de groupe ou de guilde, un locataire en retard de loyer, les groupes de territoire lors d'une annonce. Les commandes de diffusion `!sys_announce`, `SYS_ANNOUNCE`, `SYS_ANNOUNCE_GLOBAL` et `SYS_BROADCAST_WORLD_MESSAGE` étaient spécifiées sans aucun moyen d'être émises.

## 2. Architecture

1. Un handler (moteur L1) renvoie sa réponse **et** une liste de notifications `{ canal, destinataire, texte, type }`. Il reste testable sans WhatsApp, et L1 reste seul juge de *quoi* notifier (cohérent D-DET-1).
2. La couche WhatsApp insère ces notifications dans `T_NOTIFICATIONS`, dans la même unité de travail que la réponse.
3. Une **boucle d'envoi** vide la file à débit plafonné, réessaie en cas d'échec, et abandonne explicitement au-delà d'un maximum.

Cette boucle est le **premier processus de fond** de `bot/`. Elle n'héberge rien d'autre à ce stade : le prélèvement hebdomadaire de loyer (P1 de `T_PROPERTIES`) et la régénération par minute de `!rest` restent hors périmètre, mais disposeront d'un modèle à suivre.

## 3. Routage (D91)

| Famille | Canal | Exemples |
|---|---|---|
| **Personnel** | message privé au joueur | demande en mariage reçue / refusée, courrier reçu, invitation de groupe ou de guilde, loyer en retard, expulsion, divorce prononcé |
| **Collectif** | groupe WhatsApp du **territoire** concerné (D76) | apparition d'un boss, `SYS_BONUS_HARVEST` / `SYS_DEPLETE_RESOURCE`, `SYS_ANNOUNCE(Zone, …)` |
| **Mondial** | groupes communautaires / tous les groupes | `!sys_announce`, `SYS_ANNOUNCE_GLOBAL`, `SYS_BROADCAST_WORLD_MESSAGE` |

Justification : les affaires personnelles (divorce, loyer impayé) ne regardent pas le groupe ; les événements du monde se vivent ensemble, dans le lieu partagé qu'est déjà le groupe de territoire (invariant R0 v2).

Le message privé est un canal **sortant d'information** : il ne change pas le fait qu'ALO se joue dans les groupes de territoire (`menu_contextuel_protocol.md` §5). Le joueur prévenu en privé d'une demande en mariage agit ensuite dans son groupe, comme pour toute autre commande.

## 4. Bridage — protection du numéro

`whatsapp-web.js` est un client **non officiel** : WhatsApp bannit les numéros qui envoient beaucoup de messages sortants en rafale. Une annonce mondiale éclatée dans une vingtaine de groupes, suivie de messages privés en série, correspond exactement à ce profil — et un bannissement met tout le jeu hors ligne. Le débit maximal est un **paramètre de configuration**, jamais une constante du code.

## 5. Dépendances

- **D85 (mariage)** en dépend : la cible d'un `!propose` à distance doit être prévenue.
- **D92 (confirmation)** n'en dépend pas : une confirmation est une réponse au joueur lui-même.
