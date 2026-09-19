# Table MLD : T_NOTIFICATIONS

> File d'attente des messages **sortants** (D91) : tout message que le bot envoie à quelqu'un d'autre que l'expéditeur du message en cours de traitement. Jusqu'à l'étape 60, le bot était purement réactif (`msg.reply` uniquement, `services/whatsapp.js`) — aucune demande en mariage, courrier ou annonce ne pouvait atteindre son destinataire. Protocole : `system_mechanics/notifications_protocol.md`.

## 1. Structure SQL

```sql
CREATE TABLE T_NOTIFICATIONS (
    notification_uuid  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel            VARCHAR(5) NOT NULL CHECK (channel IN ('dm','group')),
    recipient_uuid     UUID REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,  -- channel = 'dm'
    wa_group_id        VARCHAR(50) REFERENCES T_WA_GROUPS(wa_group_id),           -- channel = 'group'
    body               TEXT NOT NULL,
    event_type         VARCHAR(30) NOT NULL,          -- ex. MARRIAGE_PROPOSAL, MAIL_RECEIVED, ANNOUNCE_GLOBAL
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    sent_at            TIMESTAMP,                     -- NULL = en attente
    attempts           INT NOT NULL DEFAULT 0,
    failed_at          TIMESTAMP,                     -- abandon après le nombre max de tentatives
    last_error         TEXT,
    CHECK ((channel = 'dm'    AND recipient_uuid IS NOT NULL AND wa_group_id IS NULL)
        OR (channel = 'group' AND wa_group_id    IS NOT NULL AND recipient_uuid IS NULL))
);

CREATE INDEX idx_notif_pending ON T_NOTIFICATIONS(created_at) WHERE sent_at IS NULL AND failed_at IS NULL;
```

## 2. Indexation et Optimisation

- **Index partiel** `idx_notif_pending` : la boucle d'envoi ne lit que les messages en attente, dans l'ordre d'arrivée (FIFO).
- Les lignes envoyées ou abandonnées sont conservées pour audit puis purgées par maintenance.

## 3. Triggers / Procédures Stockées

| # | Contrat | Comportement |
|---|---|---|
| N1 | **Production déterministe** | Seul le moteur L1 décide *quoi* notifier : un handler renvoie, en plus de sa réponse, une liste de notifications ; la couche WhatsApp les insère ici. Les handlers ne parlent **jamais** directement à WhatsApp |
| N2 | **Routage (D91)** | Événement personnel ⇒ `channel = 'dm'` ; événement collectif ⇒ `channel = 'group'`, groupe du territoire concerné (ou groupe communautaire pour une annonce mondiale : une ligne par groupe, éclatement à l'insertion) |
| N3 | **Envoi bridé** | Une boucle d'envoi vide la file à un **débit plafonné** (paramètre de configuration) : protection du numéro contre le bannissement (client `whatsapp-web.js` non officiel) |
| N4 | **Réessai** | Échec ⇒ `attempts + 1`, `last_error` ; au-delà du maximum (configuration) ⇒ `failed_at = NOW()`, journalisé |
| N5 | **Résolution tardive du destinataire** | Le numéro WhatsApp d'un `dm` est lu dans `T_AVATARS.whatsapp_phone` **au moment de l'envoi**, pas à l'insertion |
| N6 | **Persistance** | La file survit à un redémarrage du bot : une notification insérée est envoyée tôt ou tard, ou explicitement abandonnée |

## 4. Équivalents Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Message personnel | — (produit par les handlers) | `!sys_notify [Avatar] [Texte]` | `SYS_NOTIFY_PLAYER(Avatar_ID, Texte)` |
| Annonce de zone / territoire | — | — | `SYS_ANNOUNCE(Zone_ID, Message)` *(existant)* |
| Annonce mondiale | — | `!sys_announce [Texte]` *(existant)* | `SYS_ANNOUNCE_GLOBAL`, `SYS_BROADCAST_WORLD_MESSAGE` *(existants)* |
| Consulter la file | — | `!sys_notif_queue` | — |
