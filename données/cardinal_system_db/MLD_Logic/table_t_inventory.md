# Table MLD : T_INVENTORY

> Instances des objets possédés par les avatars. Refonte complète (D44) : capacité virtuelle, piles, liaison d'âme, équipement typé.

## 1. Structure SQL

```sql
CREATE TABLE T_INVENTORY (
    instance_uuid       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_uuid         UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    item_id             VARCHAR(30) NOT NULL REFERENCES T_ITEMS_DICT(item_id),
    quantity            INT NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 99),
    current_durability  INT,
    is_equipped         BOOLEAN NOT NULL DEFAULT FALSE,
    slot_equipped       VARCHAR(15) CHECK (slot_equipped IN (
                            'head','torso','arms','waist','legs',
                            'hand_main','hand_off',
                            'gear_belt','belt_left','belt_right',
                            'gear_back','back_wpn')),
    storage_zone         VARCHAR(10) CHECK (storage_zone IN ('VIRTUAL','BAG','BANK','SADDLE')),
    is_bound            BOOLEAN NOT NULL DEFAULT FALSE,
    acquired_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    acquired_from       VARCHAR(30)
);

CREATE INDEX idx_inventory_avatar ON T_INVENTORY(avatar_uuid);
CREATE INDEX idx_inventory_equipped ON T_INVENTORY(avatar_uuid, is_equipped) WHERE is_equipped = TRUE;
CREATE INDEX idx_inventory_item ON T_INVENTORY(item_id);
```

## 2. Indexation et Optimisation

- **Index** `avatar_uuid` : `!inventaire` en une requête.
- **Index partiel** `(avatar_uuid, is_equipped = VRAI)` : feuille de stats au combat.
- **Index** `item_id` : audits économiques, détection de duplication.

## 3. Triggers / Procédures Stockées

| # | Contrat | Comportement |
|---|---|---|
| I1 | **Capacité respectée (D44)** | INSERT refusé si `T_AVATARS.inventory_used` ≥ `inventory_capacity`. Met à jour `inventory_used` à chaque INSERT/DELETE/fusion |
| I2 | **Empilage** | Ajout d'un empilable : fusion dans la pile existante jusqu'à `T_ITEMS_DICT.max_stack`, puis nouvelle instance |
| I3 | **Anti-duplication** | Verrou pessimiste sur l'instance pendant toute transaction. Une instance ne peut être ni vendue deux fois ni échangée pendant un calcul de dégâts |
| I4 | **Liaison d'âme** | `is_bound = TRUE` ⇒ rejet de tout transfert (vente, échange, marché, gage). `!jeter` demande double confirmation — mécanisme générique D92 (menu D83, contexte `CONFIRM`) : jeter est une destruction, pas un transfert, donc autorisé **après** confirmation |
| I5 | **Équipement cohérent** | `is_equipped = TRUE` exige `slot_equipped` compatible avec le type d'item : armure/tenue sur 5 slots, armes en mains/ceinture/sangle |
| I6 | **Armes hors sac/virtuel (D45)** | `item_id LIKE 'WPN_%'` non équipé ⇒ forcé en `storage_zone = 'BANK'`. INSERT/UPDATE en VIRTUAL ou BAG refusé |
| I7 | **Mort / Remain Light** | À la mort hors zone sûre : drop selon `pk_karma`. Instances `is_bound` ne droppent JAMAIS. Banque protégée |
| I8 | **Durabilité (D88)** | `current_durability` ∈ [0, plafond] où plafond = `durability_cap` (nouvelle colonne `INT`, `NULL` = `T_ITEMS_DICT.durability_max`) ; `repair_count INT NOT NULL DEFAULT 0` (nouvelle colonne). Usure : −1/pièce équipée par combat PvE, −3 PvP, par tentative pour les outils. À 0 : **Cassé**, aucune statistique. `!repair` (forgeron PNJ seul) remet au plafond puis ampute `durability_cap` de 10 % de l'origine ; plafond 0 = irréparable. Détail : `system_mechanics/durability_repair_system.md` |

## 4. Équivalents Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Inventaire / équiper / jeter | `!inventaire`, `!equiper [Item_ID] [Slot]`, `!jeter [Item_ID]` | `!sys_give [Item_ID]` | `SYS_GRANT_ITEM` |
| Retirer / dégainer | `!fetch [Item_ID]`, `!degainer [gauche|droite|dos]` | — | `SYS_SET_LOADOUT` |
| Réparer | `!repair` | — | — |
