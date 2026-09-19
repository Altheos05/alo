# Table MLD : T_ITEMS_DICT

> Dictionnaire des items immuables. Source de vérité des items dans ALfheim Online.

## 1. Structure SQL

```sql
CREATE TABLE T_ITEMS_DICT (
    item_id             VARCHAR(30) PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    item_type           VARCHAR(10) NOT NULL CHECK (item_type IN ('ARM','WPN','CSM','MAT','BAG','HRN','BELT','OFT','MSC','KEY','TREASURE','DEC')),
    subtype             VARCHAR(20),
    rarity              VARCHAR(10) NOT NULL CHECK (rarity IN ('common','uncommon','rare','epic','legendary','unique')),
    tier                INT NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 5),
    base_atk            INT DEFAULT 0,
    base_def            INT DEFAULT 0,
    weight              FLOAT DEFAULT 0.5,
    str_req             INT DEFAULT 0,
    agi_req             INT DEFAULT 0,
    int_req             INT DEFAULT 0,
    buy_price           INT NOT NULL DEFAULT 0,
    resale_value        INT NOT NULL DEFAULT 0,
    max_stack           INT NOT NULL DEFAULT 1 CHECK (max_stack BETWEEN 1 AND 99),
    is_consumable       BOOLEAN DEFAULT FALSE,
    is_craftable        BOOLEAN DEFAULT FALSE,
    durability_max      INT DEFAULT 0,
    description         TEXT,
    lore_text           TEXT,
    icon                VARCHAR(50)
);

CREATE INDEX idx_items_type ON T_ITEMS_DICT(item_type);
CREATE INDEX idx_items_rarity ON T_ITEMS_DICT(rarity);
CREATE INDEX idx_items_tier ON T_ITEMS_DICT(tier);
CREATE INDEX idx_items_material ON T_ITEMS_DICT(item_type, tier) WHERE item_type = 'MAT';
```

## 2. Indexation et Optimisation

- **Index** sur `item_type` : filtres de catégorie dans `!shop_list`, `!inventaire`, crafting.
- **Index** sur `rarity` : requêtes économiques et loot.
- **Index partiel** `MAT` : listing des matériaux de craft.

## 3. Triggers / Procédures Stockées

| # | Contrat | Comportement |
|---|---|---|
| I1 | **Prix cohérents** | `buy_price` = `resale_value` × 4 minimum (marge PNJ 25%). `resale_value` jamais > `buy_price` |
| I2 | **Empilable** | `max_stack > 1` ⇒ `is_consumable = TRUE` et `item_type IN ('CSM','MAT')` |
| I3 | **Armure/Arme/Outil** | `item_type IN ('ARM','WPN')` et outils `OUT_*` (D88) ⇒ `durability_max > 0`. ⚠️ Étape 60 : la ligne de durabilité existe sur 100 % des fiches d'armes et d'armures, mais `seed-generator.js` ne l'ingère pas (valeurs à `0` en base) — contrat violé en base tant que le générateur n'est pas corrigé |
| I10 | **Profil culinaire (D93)** | `cook_profile JSONB` (nullable) : `{ category, essence, nutrition }`, ingéré depuis `system_mechanics/cuisine_libre.md` §2 ; `NULL` = non comestible en marmite |
| I11 | **Effet d'usage (étape 62)** | `use_effect JSONB` : `{ heal_hp, heal_mp, regen_hp, regen_mp, effect_id }` lu par `!use` ; `binds_on_acquire BOOLEAN` : l'exemplaire naît lié (trigger) |
| I4 | **Décoration (D-SOC-3)** | `item_type = 'DEC'` (`DEC_*`) : non équipable, `base_atk = base_def = 0` ; `deco_buffs` plafonné ≤ +5 %, actif **uniquement** placé dans un logement (`T_PROPERTIES.deco_buffs`, `!decorate`) |

## 4. Équivalents Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Info item | `!item_info [Item_ID]` | `!sys_item_info [Item_ID]` | `SYS_GET_ITEM_INFO` |
