-- ============================================================================
-- SCHEMA CARDINAL — ALfheim Online (PostgreSQL)
-- Compilation automatique des 33 fichiers MLD (2026-07-10)
-- Ordre topologique : indépendants → dépendances → sous-tables
-- ============================================================================

BEGIN;

-- ============================================================================
-- NIVEAU 0 — Aucune dépendance étrangère
-- ============================================================================

-- 1. T_TITLES (indépendant)
CREATE TABLE T_TITLES (
    title_id        VARCHAR(30) PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    description     TEXT NOT NULL,
    rarity          VARCHAR(15) NOT NULL,
    stat_bonus      JSONB DEFAULT '{}'::jsonb,
    visual_effect   VARCHAR(100),
    unlock_type     VARCHAR(20) NOT NULL,
    is_permanent    BOOLEAN DEFAULT TRUE,
    max_holders     INT DEFAULT 0
);

-- 2. T_STATUS_EFFECTS_DICT (indépendant)
CREATE TABLE T_STATUS_EFFECTS_DICT (
    effect_id       VARCHAR(30) PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('buff','debuff','neutral')),
    stat_modified   VARCHAR(20),
    modifier_value  FLOAT NOT NULL,
    modifier_type   VARCHAR(15) NOT NULL CHECK (modifier_type IN ('flat','percent','multiplier')),
    duration_sec    INT,
    tick_damage     INT DEFAULT 0,
    tick_interval   INT DEFAULT 0,
    is_dispellable  BOOLEAN DEFAULT TRUE,
    max_stacks      INT DEFAULT 1,
    icon_emoji      VARCHAR(10)
);

-- 3. T_ENCYCLOPEDIA_DICT (indépendant)
CREATE TABLE T_ENCYCLOPEDIA_DICT (
    knowledge_id        VARCHAR(100) PRIMARY KEY,
    category            VARCHAR(20) NOT NULL CHECK (category IN ('bestiary','geography','history','character','item','skill','faction','event')),
    title               VARCHAR(200) NOT NULL,
    content             TEXT NOT NULL,
    unlock_condition    VARCHAR(200),
    is_secret           BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_encyclopedia_cat ON T_ENCYCLOPEDIA_DICT(category);

-- 4. T_DAILY_CALENDAR (indépendant)
CREATE TABLE T_DAILY_CALENDAR (
    day_number      INT PRIMARY KEY,
    reward_yrds     INT NOT NULL,
    reward_item     VARCHAR(30),
    reward_exp      INT DEFAULT 0
);

-- 5. T_ITEMS_DICT (indépendant)
CREATE TABLE T_ITEMS_DICT (
    item_id             VARCHAR(30) PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    item_type           VARCHAR(10) NOT NULL CHECK (item_type IN ('ARM','WPN','CSM','MAT','BAG','HRN','BELT','OFT','MSC','KEY','TREASURE')),
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
    is_consumable        BOOLEAN DEFAULT FALSE,
    is_craftable         BOOLEAN DEFAULT FALSE,
    durability_max      INT DEFAULT 0,
    description         TEXT,
    lore_text           TEXT,
    icon                VARCHAR(50)
);
CREATE INDEX idx_items_type ON T_ITEMS_DICT(item_type);
CREATE INDEX idx_items_rarity ON T_ITEMS_DICT(rarity);
CREATE INDEX idx_items_tier ON T_ITEMS_DICT(tier);
CREATE INDEX idx_items_material ON T_ITEMS_DICT(item_type, tier) WHERE item_type = 'MAT';

-- 6. T_MONSTERS_DICT (indépendant)
CREATE TABLE T_MONSTERS_DICT (
    monster_id          VARCHAR(30) PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    level               INT NOT NULL CHECK (level BETWEEN 1 AND 100),
    family              VARCHAR(50),
    base_hp             INT NOT NULL,
    base_mp             INT DEFAULT 0,
    base_atk            INT NOT NULL,
    base_def            INT NOT NULL,
    base_agi            INT DEFAULT 10,
    element             VARCHAR(20),
    weakness            VARCHAR(100),
    resistance          VARCHAR(100),
    immune              VARCHAR(100),
    exp_yield           INT NOT NULL DEFAULT 0,
    bounty_yrds         INT NOT NULL DEFAULT 0,
    is_boss             BOOLEAN DEFAULT FALSE,
    is_flying           BOOLEAN DEFAULT FALSE,
    aggression_range    INT DEFAULT 10,
    spawn_behavior      VARCHAR(50) DEFAULT 'passive',
    lore_text           TEXT
);
CREATE INDEX idx_monsters_level ON T_MONSTERS_DICT(level);
CREATE INDEX idx_monsters_family ON T_MONSTERS_DICT(family);
CREATE INDEX idx_monsters_boss ON T_MONSTERS_DICT(is_boss) WHERE is_boss = TRUE;
CREATE INDEX idx_monsters_element ON T_MONSTERS_DICT(element);

-- 7. T_SKILLS_DICT (indépendant)
CREATE TABLE T_SKILLS_DICT (
    skill_id            VARCHAR(30) PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    skill_type          VARCHAR(3) NOT NULL CHECK (skill_type IN ('MAG','OSS','PAS')),
    domain              VARCHAR(3) NOT NULL CHECK (domain IN ('CBT','CRA','EXP','SOC')),
    tier                INT NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 5),
    hit_count           INT DEFAULT 1,
    mp_cost             INT DEFAULT 0,
    cast_frames         INT DEFAULT 30,
    cooldown_sec        INT DEFAULT 0,
    base_damage         INT DEFAULT 0,
    base_healing        INT DEFAULT 0,
    stat_scaling        VARCHAR(20),
    description         TEXT,
    unlock_requirement  VARCHAR(200),
    max_mastery         INT NOT NULL DEFAULT 3 CHECK (max_mastery BETWEEN 1 AND 3),
    is_equippable       BOOLEAN DEFAULT TRUE
);
CREATE INDEX idx_skills_type ON T_SKILLS_DICT(skill_type);
CREATE INDEX idx_skills_domain ON T_SKILLS_DICT(domain);
CREATE INDEX idx_skills_tier ON T_SKILLS_DICT(tier);

-- ============================================================================
-- NIVEAU 1 — FK vers niveau 0 seulement
-- ============================================================================

-- 8. T_ACHIEVEMENTS_DICT (FK → T_TITLES, T_ITEMS_DICT)
CREATE TABLE T_ACHIEVEMENTS_DICT (
    achievement_id  VARCHAR(30) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT NOT NULL,
    category        VARCHAR(20) NOT NULL,
    condition_type  VARCHAR(50) NOT NULL,
    condition_value INT NOT NULL,
    reward_title_id VARCHAR(30) REFERENCES T_TITLES(title_id),
    reward_item_id  VARCHAR(30) REFERENCES T_ITEMS_DICT(item_id),
    reward_yrds     INT DEFAULT 0,
    reward_exp      INT DEFAULT 0,
    rarity          VARCHAR(15) NOT NULL,
    is_hidden       BOOLEAN DEFAULT FALSE
);

-- 9. T_RACES (sans la FK circulaire vers T_ZONES — ajoutée après T_ZONES)
CREATE TABLE T_RACES (
    race_id         VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    element_affinity VARCHAR(20) NOT NULL,
    bonus_hp        INT DEFAULT 0,
    bonus_mp        INT DEFAULT 0,
    bonus_str       INT DEFAULT 0,
    bonus_agi       INT DEFAULT 0,
    bonus_vit       INT DEFAULT 0,
    bonus_int       INT DEFAULT 0,
    bonus_dex       INT DEFAULT 0,
    flight_modifier FLOAT DEFAULT 1.0,
    racial_passive  VARCHAR(100) NOT NULL,
    racial_weakness VARCHAR(200),
    capital_zone_id VARCHAR(50),
    lore_description TEXT NOT NULL
);

-- ============================================================================
-- NIVEAU 2 — FK vers niveau 0-1
-- ============================================================================

-- 10. T_ZONES (FK → T_RACES)
CREATE TABLE T_ZONES (
    zone_id             VARCHAR(50) PRIMARY KEY,
    zone_name           VARCHAR(100) NOT NULL,
    zone_type           VARCHAR(10) NOT NULL CHECK (zone_type IN ('CAP','TWN','HUNT','DUN','RAID','ROUTE','FLD','TOP','HUB','FLR')),
    territory_race      VARCHAR(20) REFERENCES T_RACES(race_id),
    is_safe_zone        BOOLEAN NOT NULL DEFAULT FALSE,
    is_pvp_zone         BOOLEAN NOT NULL DEFAULT FALSE,
    min_level           INT DEFAULT 1,
    max_level           INT DEFAULT 100,
    flight_allowed      BOOLEAN DEFAULT TRUE,
    weather_enabled     BOOLEAN DEFAULT TRUE,
    connected_zones     JSONB DEFAULT '[]'::jsonb,
    description         TEXT
);
CREATE INDEX idx_zones_type ON T_ZONES(zone_type);
CREATE INDEX idx_zones_race ON T_ZONES(territory_race);
CREATE INDEX idx_zones_level ON T_ZONES(min_level, max_level);

-- Résolution de la dépendance circulaire RACES ↔ ZONES
ALTER TABLE T_RACES ADD CONSTRAINT fk_races_capital
    FOREIGN KEY (capital_zone_id) REFERENCES T_ZONES(zone_id);

-- ============================================================================
-- NIVEAU 3 — FK vers niveau 0-2
-- ============================================================================

-- 11. T_NPC (FK → T_RACES, T_ZONES)
CREATE TABLE T_NPC (
    npc_id              VARCHAR(50) PRIMARY KEY,
    display_name        VARCHAR(100) NOT NULL,
    race                VARCHAR(20) NOT NULL REFERENCES T_RACES(race_id),
    role_type           VARCHAR(20) NOT NULL CHECK (role_type IN ('MERCHANT','SKILL_MASTER','QUEST_GIVER','GUARD','LORD','SERVICE','BLACK_MARKET')),
    zone_id             VARCHAR(50) REFERENCES T_ZONES(zone_id),
    location_label      VARCHAR(100),
    level               INT DEFAULT 1,
    hp                  INT DEFAULT 100,
    mp                  INT DEFAULT 50,
    stats_json          JSONB,
    shop_ref            VARCHAR(50),
    quest_ref           VARCHAR(50),
    dialog_ref          VARCHAR(50),
    secret_note         TEXT,
    qi_budget           INT NOT NULL DEFAULT 10 CHECK (qi_budget BETWEEN 1 AND 12),
    is_canon            BOOLEAN NOT NULL DEFAULT FALSE,
    is_essential        BOOLEAN NOT NULL DEFAULT FALSE,
    is_alive            BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_npc_zone ON T_NPC(zone_id);
CREATE INDEX idx_npc_role ON T_NPC(role_type, zone_id);
CREATE INDEX idx_npc_alive ON T_NPC(is_alive) WHERE is_alive = FALSE;

-- 12. T_WEATHER (FK → T_ZONES)
CREATE TABLE T_WEATHER (
    zone_id         VARCHAR(50) PRIMARY KEY REFERENCES T_ZONES(zone_id),
    current_weather VARCHAR(20) DEFAULT 'clear',
    temperature     INT DEFAULT 20,
    wind_speed      INT DEFAULT 0,
    visibility      FLOAT DEFAULT 1.0,
    time_of_day     VARCHAR(10) DEFAULT 'day',
    moon_phase      VARCHAR(10) DEFAULT 'full',
    last_changed    TIMESTAMP DEFAULT NOW(),
    changed_by      VARCHAR(20) DEFAULT 'natural_cycle'
);

-- 13. T_WA_GROUPS (FK → T_ZONES)
CREATE TABLE T_WA_GROUPS (
    wa_group_id     VARCHAR(50) PRIMARY KEY,
    zone_id         VARCHAR(50) REFERENCES T_ZONES(zone_id),
    group_type      VARCHAR(20) NOT NULL CHECK (group_type IN ('community_hub','location','dungeon_instance','private_party','housing','guild_hall','arena','system')),
    group_name      VARCHAR(100) NOT NULL,
    group_desc      TEXT,
    max_participants INT DEFAULT 256,
    current_count   INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    is_ephemeral    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_wa_zone ON T_WA_GROUPS(zone_id);
CREATE INDEX idx_wa_type ON T_WA_GROUPS(group_type);

-- 14. T_ZONE_LINKS (FK → T_ZONES)
CREATE TABLE T_ZONE_LINKS (
    link_id             SERIAL PRIMARY KEY,
    zone_a              VARCHAR(50) NOT NULL REFERENCES T_ZONES(zone_id),
    zone_b              VARCHAR(50) NOT NULL REFERENCES T_ZONES(zone_id),
    link_type           VARCHAR(15) NOT NULL CHECK (link_type IN ('WALK','FLY','UNDERGROUND','EXIT_INSTANCE')),
    mp_cost             INT NOT NULL DEFAULT 0 CHECK (mp_cost >= 0),
    travel_time_min     INT NOT NULL CHECK (travel_time_min > 0),
    requires_flight     BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked           BOOLEAN NOT NULL DEFAULT FALSE,
    lore_status         VARCHAR(100),
    UNIQUE (zone_a, zone_b)
);
CREATE INDEX idx_zonelinks_a ON T_ZONE_LINKS(zone_a);
CREATE INDEX idx_zonelinks_b ON T_ZONE_LINKS(zone_b);
CREATE INDEX idx_zonelinks_locked ON T_ZONE_LINKS(is_locked) WHERE is_locked = TRUE;

-- 15. T_LOOT_TABLES (FK → T_MONSTERS_DICT, T_ITEMS_DICT)
CREATE TABLE T_LOOT_TABLES (
    loot_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monster_id      VARCHAR(30) NOT NULL REFERENCES T_MONSTERS_DICT(monster_id),
    item_id         VARCHAR(30) NOT NULL REFERENCES T_ITEMS_DICT(item_id),
    drop_rate       FLOAT NOT NULL CHECK (drop_rate BETWEEN 0 AND 100),
    min_quantity    INT DEFAULT 1,
    max_quantity    INT DEFAULT 1,
    is_last_attack  BOOLEAN DEFAULT FALSE,
    level_req       INT DEFAULT 0
);
CREATE INDEX idx_loot_monster ON T_LOOT_TABLES(monster_id);

-- 16. T_SPAWN_TABLES (FK → T_ZONES, T_MONSTERS_DICT)
CREATE TABLE T_SPAWN_TABLES (
    spawn_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id         VARCHAR(50) NOT NULL REFERENCES T_ZONES(zone_id),
    monster_id      VARCHAR(30) NOT NULL REFERENCES T_MONSTERS_DICT(monster_id),
    spawn_rate      FLOAT NOT NULL CHECK (spawn_rate BETWEEN 0 AND 100),
    min_level       INT DEFAULT 1,
    max_level       INT DEFAULT 100,
    max_concurrent  INT DEFAULT 5,
    time_condition  VARCHAR(15) DEFAULT 'always',
    weather_cond    VARCHAR(15) DEFAULT 'any',
    is_boss         BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_spawn_zone ON T_SPAWN_TABLES(zone_id);

-- 17. T_RECIPES (FK → T_ITEMS_DICT)
CREATE TABLE T_RECIPES (
    recipe_id       VARCHAR(30) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    craft_type      VARCHAR(20) NOT NULL CHECK (craft_type IN ('forge','alchemy','sewing','cooking','enchanting')),
    skill_level     VARCHAR(20) NOT NULL DEFAULT 'beginner',
    ingredients     JSONB NOT NULL,
    result_item_id  VARCHAR(30) REFERENCES T_ITEMS_DICT(item_id),
    result_quantity INT DEFAULT 1,
    success_rate    FLOAT DEFAULT 0.8 CHECK (success_rate BETWEEN 0 AND 1),
    craft_time_sec  INT DEFAULT 10,
    yrd_cost        INT DEFAULT 0,
    unlock_cond     VARCHAR(200)
);
CREATE INDEX idx_recipe_type ON T_RECIPES(craft_type);
CREATE INDEX idx_recipe_result ON T_RECIPES(result_item_id);

-- 18. T_DIPLOMACY (FK → T_RACES)
CREATE TABLE T_DIPLOMACY (
    diplomacy_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_a_id       VARCHAR(20) NOT NULL REFERENCES T_RACES(race_id),
    race_b_id       VARCHAR(20) NOT NULL REFERENCES T_RACES(race_id),
    status          VARCHAR(20) DEFAULT 'neutral' CHECK (status IN ('neutral','allied','at_war','truce','vassalized')),
    pk_karma_mod    FLOAT DEFAULT 1.0,
    trade_tax       FLOAT DEFAULT 0.0 CHECK (trade_tax BETWEEN 0 AND 0.5),
    started_at      TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP,
    trigger_reason  TEXT,
    UNIQUE(race_a_id, race_b_id)
);

-- 19. T_QUESTS_DICT (FK → T_ZONES, T_NPC, T_TITLES)
CREATE TABLE T_QUESTS_DICT (
    quest_id            VARCHAR(50) PRIMARY KEY,
    title               VARCHAR(100) NOT NULL,
    quest_type          VARCHAR(10) NOT NULL CHECK (quest_type IN ('main','side','daily','faction','tutorial','legendary','t5')),
    min_level           INT DEFAULT 1,
    recommended_level   INT,
    zone_id             VARCHAR(50) REFERENCES T_ZONES(zone_id),
    giver_npc_id        VARCHAR(50) REFERENCES T_NPC(npc_id),
    objective_json      JSONB NOT NULL,
    total_steps         INT NOT NULL DEFAULT 1,
    reward_xp           INT DEFAULT 0,
    reward_yrds         INT DEFAULT 0,
    reward_items        JSONB DEFAULT '[]'::jsonb,
    reward_title_id     VARCHAR(30) REFERENCES T_TITLES(title_id),
    prerequisites       JSONB DEFAULT '{}'::jsonb,
    is_repeatable       BOOLEAN DEFAULT FALSE,
    is_hidden           BOOLEAN DEFAULT FALSE,
    has_deadline        BOOLEAN DEFAULT FALSE,
    deadline_hours      INT,
    description         TEXT,
    lore_text           TEXT
);
CREATE INDEX idx_quests_type ON T_QUESTS_DICT(quest_type);
CREATE INDEX idx_quests_zone ON T_QUESTS_DICT(zone_id);
CREATE INDEX idx_quests_level ON T_QUESTS_DICT(min_level);

-- 20. T_AVATARS (FK → T_RACES, T_ZONES)
CREATE TABLE T_AVATARS (
    avatar_uuid             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_phone          VARCHAR(20) UNIQUE NOT NULL,
    avatar_name             VARCHAR(32) UNIQUE NOT NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at           TIMESTAMP,
    race_id                 VARCHAR(20) NOT NULL REFERENCES T_RACES(race_id),
    gender                  VARCHAR(10) NOT NULL CHECK (gender IN ('male','female','neutral')),
    wing_color              VARCHAR(7) DEFAULT '#FFFFFF',
    appearance_data         JSONB,
    level                   INT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 100),
    current_xp              BIGINT NOT NULL DEFAULT 0,
    total_xp                BIGINT NOT NULL DEFAULT 0,
    hp_current              INT NOT NULL,
    hp_max                  INT NOT NULL,
    mp_current              INT NOT NULL,
    mp_max                  INT NOT NULL,
    stamina_current         INT NOT NULL DEFAULT 100,
    stamina_max             INT NOT NULL DEFAULT 100,
    stat_str                INT NOT NULL DEFAULT 1,
    stat_agi                INT NOT NULL DEFAULT 1,
    stat_vit                INT NOT NULL DEFAULT 1,
    stat_int                INT NOT NULL DEFAULT 1,
    stat_dex                INT NOT NULL DEFAULT 1,
    stat_luk                INT NOT NULL DEFAULT 1,
    stat_points_available   INT NOT NULL DEFAULT 0,
    yrd_balance             BIGINT NOT NULL DEFAULT 100,
    total_yrd_earned        BIGINT NOT NULL DEFAULT 0,
    total_yrd_spent         BIGINT NOT NULL DEFAULT 0,
    current_zone_id         VARCHAR(50) NOT NULL REFERENCES T_ZONES(zone_id),
    current_wa_group_id     VARCHAR(50),
    is_flying               BOOLEAN DEFAULT FALSE,
    flight_altitude         INT DEFAULT 0,
    pk_karma                INT NOT NULL DEFAULT 0,
    pk_kills                INT NOT NULL DEFAULT 0,
    pk_deaths               INT NOT NULL DEFAULT 0,
    player_status           VARCHAR(10) DEFAULT 'green' CHECK (player_status IN ('green','orange','red')),
    pvp_enabled             BOOLEAN DEFAULT FALSE,
    is_alive                BOOLEAN NOT NULL DEFAULT TRUE,
    is_remain_light         BOOLEAN DEFAULT FALSE,
    remain_light_expires_at TIMESTAMP,
    is_in_combat            BOOLEAN DEFAULT FALSE,
    is_resting              BOOLEAN DEFAULT FALSE,
    is_banned               BOOLEAN DEFAULT FALSE,
    ban_reason              TEXT,
    guild_uuid              UUID,
    guild_rank              VARCHAR(20),
    guild_joined_at         TIMESTAMP,
    equip_head              UUID,
    equip_torso             UUID,
    equip_arms              UUID,
    equip_waist             UUID,
    equip_legs              UUID,
    hand_main               UUID,
    hand_off                UUID,
    gear_belt               UUID,
    belt_left               UUID,
    belt_right              UUID,
    gear_back               UUID,
    back_type               VARCHAR(4) CHECK (back_type IN ('BAG','HRN')),
    inventory_capacity      INT NOT NULL DEFAULT 31,
    inventory_used          INT NOT NULL DEFAULT 0,
    bag_quick_access        BOOLEAN NOT NULL DEFAULT FALSE,
    active_title_id         VARCHAR(30),
    bio_text                VARCHAR(200)
);
CREATE INDEX idx_avatars_whatsapp ON T_AVATARS(whatsapp_phone);
CREATE INDEX idx_avatars_zone ON T_AVATARS(current_zone_id);
CREATE INDEX idx_avatars_group ON T_AVATARS(current_wa_group_id);
CREATE INDEX idx_avatars_guild ON T_AVATARS(guild_uuid);

-- 21. T_BANK_VAULTS (pas de FK stricte — owner_id UUID libre)
CREATE TABLE T_BANK_VAULTS (
    vault_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type      VARCHAR(10) NOT NULL CHECK (owner_type IN ('avatar','guild','marriage')),
    owner_id        UUID NOT NULL,
    yrds_stored     BIGINT DEFAULT 0 CHECK (yrds_stored >= 0),
    max_slots       INT DEFAULT 50,
    items_stored    JSONB DEFAULT '[]'::jsonb,
    access_level    VARCHAR(20) DEFAULT 'owner_only',
    last_accessed   TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_bank_owner ON T_BANK_VAULTS(owner_type, owner_id);

-- ============================================================================
-- NIVEAU 4 — FK vers niveau 0-3 (AVATARS et dépendances principales)
-- ============================================================================

-- 22. T_PARTIES (FK → T_AVATARS)
CREATE TABLE T_PARTIES (
    party_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leader_id       UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    name            VARCHAR(50),
    max_members     INT DEFAULT 7,
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','disbanded')),
    shared_exp      BOOLEAN DEFAULT TRUE,
    loot_rule       VARCHAR(20) DEFAULT 'round_robin',
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_party_leader ON T_PARTIES(leader_id);

-- 23. T_MAIL (FK → T_AVATARS, T_ITEMS_DICT)
CREATE TABLE T_MAIL (
    mail_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id       UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    recipient_id    UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    subject         VARCHAR(100) NOT NULL,
    body            TEXT,
    attached_yrds   INT DEFAULT 0 CHECK (attached_yrds >= 0),
    attached_item   VARCHAR(30) REFERENCES T_ITEMS_DICT(item_id),
    attached_qty    INT DEFAULT 0,
    status          VARCHAR(10) DEFAULT 'unread' CHECK (status IN ('unread','read','claimed','expired')),
    sent_at         TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);
CREATE INDEX idx_mail_recipient ON T_MAIL(recipient_id, status);

-- 24. T_PETS (FK → T_AVATARS, T_MONSTERS_DICT)
CREATE TABLE T_PETS (
    pet_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    species_id      VARCHAR(30) NOT NULL REFERENCES T_MONSTERS_DICT(monster_id),
    nickname        VARCHAR(30),
    level           INT DEFAULT 1 CHECK (level BETWEEN 1 AND 100),
    hp_current      INT NOT NULL,
    hp_max          INT NOT NULL,
    atk             INT NOT NULL,
    def             INT NOT NULL,
    agi             INT NOT NULL,
    loyalty         INT DEFAULT 50 CHECK (loyalty BETWEEN 0 AND 100),
    hunger          INT DEFAULT 100 CHECK (hunger BETWEEN 0 AND 100),
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','resting','dead','egg')),
    is_summoned     BOOLEAN DEFAULT FALSE,
    abilities       JSONB,
    tamed_at        TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_pet_owner ON T_PETS(owner_id);

-- 25. T_GUILDS (FK → T_AVATARS, T_RACES)
CREATE TABLE T_GUILDS (
    guild_uuid          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_name          VARCHAR(32) UNIQUE NOT NULL,
    guild_tag           VARCHAR(6) UNIQUE,
    leader_avatar_uuid  UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    vice_leader_uuid    UUID REFERENCES T_AVATARS(avatar_uuid),
    race_allegiance     VARCHAR(20) REFERENCES T_RACES(race_id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    member_count        INT NOT NULL DEFAULT 1 CHECK (member_count BETWEEN 1 AND 100),
    guild_level         INT NOT NULL DEFAULT 1 CHECK (guild_level BETWEEN 1 AND 50),
    treasury_yrds       BIGINT NOT NULL DEFAULT 0,
    tax_rate            DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (tax_rate BETWEEN 0.00 AND 0.20),
    qg_level            INT NOT NULL DEFAULT 0 CHECK (qg_level BETWEEN 0 AND 5),
    qg_unlocked_at      TIMESTAMP,
    qg_storage_capacity INT NOT NULL DEFAULT 0,
    qg_bonus_flags      JSONB,
    services            JSONB DEFAULT '{}',
    last_maintenance_at TIMESTAMP,
    maintenance_overdue BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_guilds_leader ON T_GUILDS(leader_avatar_uuid);
CREATE INDEX idx_guilds_race ON T_GUILDS(race_allegiance);

-- 26. T_INVENTORY (FK → T_AVATARS, T_ITEMS_DICT)
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
    storage_zone        VARCHAR(10) CHECK (storage_zone IN ('VIRTUAL','BAG','BANK','SADDLE')),
    is_bound            BOOLEAN NOT NULL DEFAULT FALSE,
    acquired_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    acquired_from       VARCHAR(30)
);
CREATE INDEX idx_inventory_avatar ON T_INVENTORY(avatar_uuid);
CREATE INDEX idx_inventory_equipped ON T_INVENTORY(avatar_uuid, is_equipped) WHERE is_equipped = TRUE;
CREATE INDEX idx_inventory_item ON T_INVENTORY(item_id);

-- 27. T_SHOPS (FK → T_NPC, T_ZONES)
CREATE TABLE T_SHOPS (
    shop_id             VARCHAR(50) PRIMARY KEY,
    owner_npc_id        VARCHAR(50) NOT NULL UNIQUE REFERENCES T_NPC(npc_id),
    zone_id             VARCHAR(50) NOT NULL REFERENCES T_ZONES(zone_id),
    shop_type           VARCHAR(15) NOT NULL CHECK (shop_type IN ('BOUTIQUE','ETAL','MARCHE_NOIR','TAVERNE')),
    access_rule         VARCHAR(50) DEFAULT 'LIBRE',
    buyback_categories  VARCHAR(100),
    is_open             BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_shops_zone ON T_SHOPS(zone_id);
CREATE INDEX idx_shops_owner ON T_SHOPS(owner_npc_id);

-- 28. T_AVATAR_SKILLS (FK → T_AVATARS, T_SKILLS_DICT)
CREATE TABLE T_AVATAR_SKILLS (
    avatar_uuid         UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    skill_id            VARCHAR(30) NOT NULL REFERENCES T_SKILLS_DICT(skill_id),
    mastery_rank        INT NOT NULL DEFAULT 1 CHECK (mastery_rank BETWEEN 1 AND 3),
    proficiency_exp     BIGINT NOT NULL DEFAULT 0,
    is_equipped         BOOLEAN NOT NULL DEFAULT FALSE,
    learned_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    taught_by           VARCHAR(50),
    source_type         VARCHAR(10) NOT NULL CHECK (source_type IN ('npc','quest','scroll','gm')),
    equipped_slot       INT,
    PRIMARY KEY (avatar_uuid, skill_id)
);
CREATE INDEX idx_avatar_skills_equipped ON T_AVATAR_SKILLS(avatar_uuid, is_equipped) WHERE is_equipped = TRUE;
CREATE INDEX idx_avatar_skills_domain ON T_AVATAR_SKILLS(avatar_uuid, skill_id);

-- 29. T_ACTIVE_QUESTS (FK → T_AVATARS, T_QUESTS_DICT)
CREATE TABLE T_ACTIVE_QUESTS (
    avatar_uuid         UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    quest_id            VARCHAR(50) NOT NULL REFERENCES T_QUESTS_DICT(quest_id),
    current_step        INT NOT NULL DEFAULT 1,
    progress_status     VARCHAR(20) NOT NULL DEFAULT 'in_progress'
                            CHECK (progress_status IN ('in_progress','completed','failed','abandoned')),
    progress_data       JSONB DEFAULT '{}',
    accepted_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMP,
    deadline_at         TIMESTAMP,
    xp_reward           INT,
    yrd_reward          INT,
    item_reward         JSONB,
    PRIMARY KEY (avatar_uuid, quest_id)
);
CREATE INDEX idx_active_quests_status ON T_ACTIVE_QUESTS(avatar_uuid, progress_status);

-- 30. T_COMBAT_SESSIONS (FK → T_AVATARS, T_ZONES)
CREATE TABLE T_COMBAT_SESSIONS (
    session_uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_uuid         UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    zone_id             VARCHAR(50) NOT NULL REFERENCES T_ZONES(zone_id),
    enemy_type          VARCHAR(10) NOT NULL CHECK (enemy_type IN ('mob','player','boss')),
    enemy_id            VARCHAR(50) NOT NULL,
    enemy_name          VARCHAR(32),
    turn_number         INT NOT NULL DEFAULT 0,
    turn_state          VARCHAR(20) NOT NULL DEFAULT 'avatar_action'
                            CHECK (turn_state IN ('avatar_action','enemy_action','calculating','resolving','ended')),
    combat_log_json     JSONB NOT NULL DEFAULT '[]',
    locked_until        TIMESTAMP,
    locked_by           VARCHAR(50),
    started_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    last_action_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    timeout_at          TIMESTAMP,
    ended_at            TIMESTAMP,
    outcome             VARCHAR(10) CHECK (outcome IN ('victory','defeat','flee','timeout','draw')),
    xp_gained           INT DEFAULT 0,
    yrd_gained          INT DEFAULT 0
);
CREATE INDEX idx_combat_avatar ON T_COMBAT_SESSIONS(avatar_uuid);
CREATE INDEX idx_combat_zone ON T_COMBAT_SESSIONS(zone_id);
CREATE INDEX idx_combat_locked ON T_COMBAT_SESSIONS(locked_until) WHERE locked_until IS NOT NULL;

-- 31. T_WHATSAPP_LOGS (FK → T_AVATARS)
CREATE TABLE T_WHATSAPP_LOGS (
    log_uuid            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_phone      VARCHAR(20) NOT NULL,
    wa_group_id         VARCHAR(50),
    avatar_uuid         UUID REFERENCES T_AVATARS(avatar_uuid),
    incoming_msg        TEXT NOT NULL,
    incoming_msg_type   VARCHAR(20) DEFAULT 'text'
                            CHECK (incoming_msg_type IN ('text','command','image','audio','location','system')),
    received_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    intent_classified   VARCHAR(30),
    confidence_score    DECIMAL(3,2),
    bot_response        TEXT,
    response_type       VARCHAR(20)
                            CHECK (response_type IN ('narrative','combat_result','error','system','gm_reply','ai_action')),
    response_time_ms    INT,
    model_used          VARCHAR(30),
    tokens_in           INT DEFAULT 0,
    tokens_out          INT DEFAULT 0,
    api_call_success    BOOLEAN DEFAULT TRUE,
    error_message       TEXT
);
CREATE INDEX idx_whatsapp_logs_phone ON T_WHATSAPP_LOGS(whatsapp_phone, received_at DESC);
CREATE INDEX idx_whatsapp_logs_group ON T_WHATSAPP_LOGS(wa_group_id, received_at DESC);
CREATE INDEX idx_whatsapp_logs_intent ON T_WHATSAPP_LOGS(intent_classified);
CREATE INDEX idx_whatsapp_logs_errors ON T_WHATSAPP_LOGS(received_at) WHERE api_call_success = FALSE;

-- 32. T_WHATSAPP_SESSIONS (FK → T_AVATARS)
CREATE TABLE T_WHATSAPP_SESSIONS (
    session_uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_phone      VARCHAR(20) NOT NULL UNIQUE,
    avatar_uuid         UUID REFERENCES T_AVATARS(avatar_uuid),
    current_group_id    VARCHAR(50),
    state               VARCHAR(20) NOT NULL DEFAULT 'idle'
                            CHECK (state IN ('idle','in_combat','in_shop','in_dialog','travelling','respawning','gm_mode')),
    state_expires_at    TIMESTAMP,
    last_message_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    message_count_hour  INT DEFAULT 0,
    is_throttled        BOOLEAN DEFAULT FALSE,
    throttle_until      TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_whatsapp_sessions_phone ON T_WHATSAPP_SESSIONS(whatsapp_phone);
CREATE INDEX idx_whatsapp_sessions_state ON T_WHATSAPP_SESSIONS(state);
CREATE INDEX idx_whatsapp_sessions_throttle ON T_WHATSAPP_SESSIONS(throttle_until)
    WHERE is_throttled = TRUE;

-- 33. T_UNLOCKED_LORE (FK → T_AVATARS, T_ENCYCLOPEDIA_DICT)
CREATE TABLE T_UNLOCKED_LORE (
    unlock_uuid         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_uuid         UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    knowledge_id        VARCHAR(100) NOT NULL REFERENCES T_ENCYCLOPEDIA_DICT(knowledge_id),
    unlocked_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    discovery_method    VARCHAR(50),
    UNIQUE (avatar_uuid, knowledge_id)
);
CREATE INDEX idx_lore_avatar ON T_UNLOCKED_LORE(avatar_uuid, knowledge_id);

-- 34. T_PLAYER_TITLES (FK → T_AVATARS, T_TITLES)
CREATE TABLE T_PLAYER_TITLES (
    avatar_uuid      UUID REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    title_id        VARCHAR(30) REFERENCES T_TITLES(title_id),
    is_active       BOOLEAN DEFAULT FALSE,
    earned_at       TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (avatar_uuid, title_id)
);
CREATE UNIQUE INDEX idx_active_title ON T_PLAYER_TITLES(avatar_uuid) WHERE is_active = TRUE;

-- 35. T_DAILY_REWARDS (FK → T_AVATARS, T_ITEMS_DICT)
CREATE TABLE T_DAILY_REWARDS (
    daily_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_uuid     UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    login_date      DATE NOT NULL,
    streak_count    INT DEFAULT 1,
    reward_yrds     INT NOT NULL,
    reward_item     VARCHAR(30) REFERENCES T_ITEMS_DICT(item_id),
    reward_exp      INT DEFAULT 0,
    claimed_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(avatar_uuid, login_date)
);

-- 36. T_ACTIVE_EFFECTS (FK → T_STATUS_EFFECTS_DICT, pas de FK stricte sur target_id)
CREATE TABLE T_ACTIVE_EFFECTS (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type     VARCHAR(10) NOT NULL CHECK (target_type IN ('avatar','monster')),
    target_id       UUID NOT NULL,
    effect_id       VARCHAR(30) REFERENCES T_STATUS_EFFECTS_DICT(effect_id),
    source_id       UUID,
    stacks          INT DEFAULT 1,
    applied_at      TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP NOT NULL
);
CREATE INDEX idx_active_effects_target ON T_ACTIVE_EFFECTS(target_id);

-- 37. T_NPC_KNOWLEDGE (FK → T_NPC)
CREATE TABLE T_NPC_KNOWLEDGE (
    qi_id               VARCHAR(50) PRIMARY KEY,
    npc_id              VARCHAR(50) NOT NULL REFERENCES T_NPC(npc_id),
    k_level             VARCHAR(2) NOT NULL CHECK (k_level IN ('K0','K1','K2')),
    topic_tags          TEXT[] NOT NULL,
    content             TEXT NOT NULL,
    unlock_condition    TEXT,
    deflection_line     TEXT
);
CREATE INDEX idx_npc_knowledge_npc ON T_NPC_KNOWLEDGE(npc_id, k_level);
CREATE INDEX idx_npc_knowledge_tags ON T_NPC_KNOWLEDGE USING GIN(topic_tags);

-- ============================================================================
-- NIVEAU 5 — Tables filles / sous-tables
-- ============================================================================

-- 38. T_GUILD_MEMBERS (FK → T_GUILDS, T_AVATARS)
CREATE TABLE T_GUILD_MEMBERS (
    guild_uuid      UUID NOT NULL REFERENCES T_GUILDS(guild_uuid) ON DELETE CASCADE,
    avatar_uuid     UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    rank            VARCHAR(20) NOT NULL CHECK (rank IN ('leader','vice_leader','officer','member','initiate')),
    joined_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    weekly_contribution BIGINT NOT NULL DEFAULT 0,
    total_contribution   BIGINT NOT NULL DEFAULT 0,
    last_active_at  TIMESTAMP,
    PRIMARY KEY (guild_uuid, avatar_uuid)
);
CREATE INDEX idx_guild_members_avatar ON T_GUILD_MEMBERS(avatar_uuid);

-- 39. T_PARTY_MEMBERS (FK → T_PARTIES, T_AVATARS)
CREATE TABLE T_PARTY_MEMBERS (
    party_id        UUID REFERENCES T_PARTIES(party_id) ON DELETE CASCADE,
    avatar_uuid     UUID REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    joined_at       TIMESTAMP DEFAULT NOW(),
    role            VARCHAR(20) DEFAULT 'member',
    PRIMARY KEY (party_id, avatar_uuid)
);
CREATE INDEX idx_party_member ON T_PARTY_MEMBERS(avatar_uuid);

-- 40. T_WA_PRESENCE (FK → T_AVATARS, T_WA_GROUPS)
CREATE TABLE T_WA_PRESENCE (
    avatar_uuid     UUID REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    wa_group_id     VARCHAR(50) REFERENCES T_WA_GROUPS(wa_group_id) ON DELETE CASCADE,
    joined_at       TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (avatar_uuid, wa_group_id)
);

-- 41. T_UNLOCKED_ACHIEVEMENTS (FK → T_AVATARS, T_ACHIEVEMENTS_DICT)
CREATE TABLE T_UNLOCKED_ACHIEVEMENTS (
    avatar_uuid     UUID REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    achievement_id  VARCHAR(30) REFERENCES T_ACHIEVEMENTS_DICT(achievement_id),
    unlocked_at     TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (avatar_uuid, achievement_id)
);

-- 42. T_NPC_KNOWLEDGE_UNLOCKS (FK → T_AVATARS, T_NPC_KNOWLEDGE)
CREATE TABLE T_NPC_KNOWLEDGE_UNLOCKS (
    avatar_uuid         UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    qi_id               VARCHAR(50) NOT NULL REFERENCES T_NPC_KNOWLEDGE(qi_id),
    unlocked_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (avatar_uuid, qi_id)
);
CREATE INDEX idx_npc_unlocks_avatar ON T_NPC_KNOWLEDGE_UNLOCKS(avatar_uuid);

-- 43. T_SHOP_ITEMS (FK → T_SHOPS, T_ITEMS_DICT)
CREATE TABLE T_SHOP_ITEMS (
    shop_id             VARCHAR(50) NOT NULL REFERENCES T_SHOPS(shop_id) ON DELETE CASCADE,
    item_id             VARCHAR(30) NOT NULL REFERENCES T_ITEMS_DICT(item_id),
    price               INT NOT NULL CHECK (price > 0),
    origin              VARCHAR(10) NOT NULL CHECK (origin IN ('LOCAL','IMPORT')),
    origin_city         VARCHAR(50),
    stock               INT NOT NULL DEFAULT -1,
    restock_days        INT,
    condition           VARCHAR(100),
    PRIMARY KEY (shop_id, item_id)
);
CREATE INDEX idx_shop_items_item ON T_SHOP_ITEMS(item_id);

-- 44. T_QUEST_HISTORY (FK → T_AVATARS seulement)
CREATE TABLE T_QUEST_HISTORY (
    history_uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_uuid         UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    quest_id            VARCHAR(50) NOT NULL,
    progress_status     VARCHAR(20) NOT NULL,
    completed_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    xp_earned           INT NOT NULL DEFAULT 0,
    yrd_earned          INT NOT NULL DEFAULT 0,
    items_earned        JSONB
);
CREATE INDEX idx_quest_history_avatar ON T_QUEST_HISTORY(avatar_uuid, completed_at DESC);

-- 45. T_COMBAT_ACTIONS (FK → T_COMBAT_SESSIONS)
CREATE TABLE T_COMBAT_ACTIONS (
    action_uuid      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_uuid     UUID NOT NULL REFERENCES T_COMBAT_SESSIONS(session_uuid) ON DELETE CASCADE,
    turn_number      INT NOT NULL,
    actor            VARCHAR(10) NOT NULL CHECK (actor IN ('avatar','enemy')),
    action_type      VARCHAR(20) NOT NULL CHECK (action_type IN ('attack','skill','magic','item','defend','flee','buff')),
    skill_id         VARCHAR(30),
    damage_dealt     INT DEFAULT 0,
    healing_done     INT DEFAULT 0,
    status_applied   VARCHAR(30),
    roll_dice        INT,
    narrative_text   TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_combat_actions_session ON T_COMBAT_ACTIONS(session_uuid);

-- 46. T_MARKET_LISTINGS (FK → T_AVATARS, T_INVENTORY)
CREATE TABLE T_MARKET_LISTINGS (
    listing_uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_avatar_uuid  UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    instance_uuid       UUID NOT NULL REFERENCES T_INVENTORY(instance_uuid),
    item_id             VARCHAR(30) NOT NULL,
    quantity            INT NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 99),
    price_per_unit      BIGINT NOT NULL CHECK (price_per_unit >= 10),
    total_price         BIGINT NOT NULL,
    listing_fee         BIGINT NOT NULL,
    status              VARCHAR(10) NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','sold','cancelled','expired')),
    listed_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    sold_at             TIMESTAMP,
    buyer_avatar_uuid   UUID REFERENCES T_AVATARS(avatar_uuid),
    sale_tax            BIGINT,
    net_revenue         BIGINT
);
CREATE INDEX idx_market_active ON T_MARKET_LISTINGS(status, listed_at) WHERE status = 'active';
CREATE INDEX idx_market_seller ON T_MARKET_LISTINGS(seller_avatar_uuid);
CREATE INDEX idx_market_item ON T_MARKET_LISTINGS(item_id);
CREATE INDEX idx_market_expires ON T_MARKET_LISTINGS(expires_at) WHERE status = 'active';

-- 47. T_MARKET_HISTORY (pas de FK stricte — données d'audit)
CREATE TABLE T_MARKET_HISTORY (
    history_uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id             VARCHAR(30) NOT NULL,
    sale_price          BIGINT NOT NULL,
    sold_at             TIMESTAMP NOT NULL DEFAULT NOW(),
    seller_avatar_uuid  UUID NOT NULL,
    buyer_avatar_uuid   UUID NOT NULL
);
CREATE INDEX idx_market_history_item ON T_MARKET_HISTORY(item_id, sold_at);

-- ============================================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================================

-- Trigger T_PETS : un seul familier invoqué à la fois
CREATE OR REPLACE FUNCTION check_single_summon() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_summoned = TRUE THEN
        UPDATE T_PETS SET is_summoned = FALSE
        WHERE owner_id = NEW.owner_id AND pet_id != NEW.pet_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_single_summon BEFORE UPDATE ON T_PETS
FOR EACH ROW EXECUTE FUNCTION check_single_summon();

-- Procédure T_WA_GROUPS : synchronisation par retrait des non-autorisés
-- Un joueur doit être dans : (a) tous les groupes permanents, (b) le groupe
-- du territoire correspondant à sa zone. Les groupes de territoires sont
-- mutuellement exclusifs ; les groupes permanents ne sont jamais retirés.
CREATE OR REPLACE FUNCTION sync_player_groups(p_avatar_uuid UUID, p_current_zone_id VARCHAR(50)) RETURNS VOID AS $$
DECLARE
    v_territory_group VARCHAR(50);
BEGIN
    -- Déterminer le groupe de territoire pour la zone actuelle
    SELECT wa_group_id INTO v_territory_group
    FROM T_WA_GROUPS
    WHERE zone_id = p_current_zone_id AND group_type = 'location'
    LIMIT 1;

    -- Retirer tous les groupes de territoire sauf celui autorisé
    DELETE FROM T_WA_PRESENCE
    WHERE avatar_uuid = p_avatar_uuid
      AND wa_group_id IN (
          SELECT wa_group_id FROM T_WA_GROUPS WHERE group_type = 'location'
      )
      AND wa_group_id IS DISTINCT FROM v_territory_group;

    -- Ajouter au groupe de territoire (si existant)
    IF v_territory_group IS NOT NULL THEN
        INSERT INTO T_WA_PRESENCE (avatar_uuid, wa_group_id)
        VALUES (p_avatar_uuid, v_territory_group)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Les groupes permanents (community_hub, racial, party, guild) ne sont
    -- jamais retirés par cette procédure.
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NIVEAU 5 — Tables postérieures à la compilation du 2026-07-10
-- (étapes 43-60 : D-SOC-*, D83, D85, D87, D88, D90, D91). Idempotent
-- (IF NOT EXISTS) : cette section peut être rejouée seule sur une base
-- existante sans rebuild. Source : fiches MLD_Logic/*.md correspondantes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS T_NPC_RELATIONS (
    avatar_uuid         UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    npc_id              VARCHAR(50) NOT NULL REFERENCES T_NPC(npc_id),
    interaction_count   INT NOT NULL DEFAULT 0,
    first_met_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    last_talked_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    affinity            INT NOT NULL DEFAULT 0 CHECK (affinity BETWEEN -100 AND 100),
    affinity_tier       VARCHAR(12) NOT NULL DEFAULT 'stranger'
                            CHECK (affinity_tier IN ('hostile','stranger','known','trusted','confidant')),
    topic_flags         JSONB NOT NULL DEFAULT '{}',
    gifts_given         INT NOT NULL DEFAULT 0,
    quests_done_for     INT NOT NULL DEFAULT 0,
    last_gift_at        TIMESTAMP,
    PRIMARY KEY (avatar_uuid, npc_id)
);
CREATE INDEX IF NOT EXISTS idx_npc_rel_affinity ON T_NPC_RELATIONS(avatar_uuid, affinity_tier);

CREATE TABLE IF NOT EXISTS T_PROPERTIES (
    property_uuid       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_avatar_uuid   UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    property_type       VARCHAR(16) NOT NULL
                            CHECK (property_type IN ('inn_room','small_house','manor','estate')),
    tenure              VARCHAR(4) NOT NULL CHECK (tenure IN ('rent','own')),
    zone_id             VARCHAR(50) NOT NULL REFERENCES T_ZONES(zone_id),
    wa_group_id         VARCHAR(50) REFERENCES T_WA_GROUPS(wa_group_id),
    acquired_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    rent_yrds_cycle     INT NOT NULL DEFAULT 0,
    paid_until          TIMESTAMP,
    is_delinquent       BOOLEAN NOT NULL DEFAULT FALSE,
    storage_slots       INT NOT NULL DEFAULT 0,
    storage_used        INT NOT NULL DEFAULT 0,
    is_safe_checkpoint  BOOLEAN NOT NULL DEFAULT TRUE,
    rest_regen_pct      INT NOT NULL DEFAULT 5,
    deco_buffs          JSONB NOT NULL DEFAULT '{}',
    invited_avatars     JSONB NOT NULL DEFAULT '[]'
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_owner ON T_PROPERTIES(owner_avatar_uuid);
CREATE INDEX IF NOT EXISTS idx_property_zone ON T_PROPERTIES(zone_id);

-- D85 / D-SOC-8→10
CREATE TABLE IF NOT EXISTS T_MARRIAGES (
    marriage_uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spouse_male_uuid     UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    spouse_female_uuid   UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    status               VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active','divorced')),
    married_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    divorced_at          TIMESTAMP,
    ceremony_zone_id     VARCHAR(50) REFERENCES T_ZONES(zone_id),
    home_property_uuid   UUID REFERENCES T_PROPERTIES(property_uuid) ON DELETE SET NULL,
    joint_vault_id       UUID REFERENCES T_BANK_VAULTS(vault_id),
    avg_level_at_wedding INT,
    wedding_gift_item_id VARCHAR(50),
    CHECK (spouse_male_uuid <> spouse_female_uuid)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_marriage_male_active ON T_MARRIAGES(spouse_male_uuid) WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS idx_marriage_female_active ON T_MARRIAGES(spouse_female_uuid) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS T_MARRIAGE_ASSETS (
    marriage_uuid     UUID NOT NULL REFERENCES T_MARRIAGES(marriage_uuid) ON DELETE CASCADE,
    contributor_uuid  UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid),
    asset_type        VARCHAR(6) NOT NULL CHECK (asset_type IN ('yrds','item')),
    item_id           VARCHAR(50),
    qty               BIGINT NOT NULL CHECK (qty > 0),
    is_joint_earned   BOOLEAN NOT NULL DEFAULT FALSE,
    contributed_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_marr_assets ON T_MARRIAGE_ASSETS(marriage_uuid, contributor_uuid);

CREATE TABLE IF NOT EXISTS T_MARRIAGE_PROPOSALS (
    proposal_uuid  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposer_uuid  UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    target_uuid    UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    proposed_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at     TIMESTAMP NOT NULL,
    CHECK (proposer_uuid <> target_uuid)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_proposal_proposer ON T_MARRIAGE_PROPOSALS(proposer_uuid);
CREATE INDEX IF NOT EXISTS idx_proposal_target ON T_MARRIAGE_PROPOSALS(target_uuid, expires_at);

-- D83 / D87 / D92
CREATE TABLE IF NOT EXISTS T_PENDING_MENUS (
    avatar_uuid    UUID PRIMARY KEY REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    context_type   VARCHAR(20) NOT NULL
                       CHECK (context_type IN ('COMBAT','DIALOGUE','SHOP','MOVEMENT','QUEST_BOARD','FISHING','CONFIRM')),
    context_ref    VARCHAR(50),
    options        JSONB NOT NULL,
    wa_message_id  VARCHAR(100) NOT NULL,
    shown_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at     TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pending_menus_expiry ON T_PENDING_MENUS(expires_at);

-- D91
CREATE TABLE IF NOT EXISTS T_NOTIFICATIONS (
    notification_uuid  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel            VARCHAR(5) NOT NULL CHECK (channel IN ('dm','group')),
    recipient_uuid     UUID REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    wa_group_id        VARCHAR(50) REFERENCES T_WA_GROUPS(wa_group_id),
    body               TEXT NOT NULL,
    event_type         VARCHAR(30) NOT NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    sent_at            TIMESTAMP,
    attempts           INT NOT NULL DEFAULT 0,
    failed_at          TIMESTAMP,
    last_error         TEXT,
    CHECK ((channel = 'dm'    AND recipient_uuid IS NOT NULL AND wa_group_id IS NULL)
        OR (channel = 'group' AND wa_group_id    IS NOT NULL AND recipient_uuid IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_notif_pending ON T_NOTIFICATIONS(created_at) WHERE sent_at IS NULL AND failed_at IS NULL;

-- D87
CREATE TABLE IF NOT EXISTS T_RESOURCE_NODES (
    node_id              VARCHAR(30) PRIMARY KEY,
    node_type            VARCHAR(5) NOT NULL CHECK (node_type IN ('FLORA','ORE','FISH')),
    name                 VARCHAR(100) NOT NULL,
    zone_id              VARCHAR(50) NOT NULL REFERENCES T_ZONES(zone_id),
    yield_item_id        VARCHAR(30) NOT NULL REFERENCES T_ITEMS_DICT(item_id),
    yield_min            INT NOT NULL DEFAULT 1 CHECK (yield_min >= 1),
    yield_max            INT NOT NULL DEFAULT 1,
    node_tier            INT NOT NULL CHECK (node_tier BETWEEN 1 AND 5),
    level_required       INT NOT NULL DEFAULT 1,
    required_tool_prefix VARCHAR(10),
    respawn_sec          INT NOT NULL,
    depleted_until       TIMESTAMP,
    yield_multiplier     NUMERIC(3,1) NOT NULL DEFAULT 1.0,
    multiplier_until     TIMESTAMP,
    CHECK (yield_max >= yield_min),
    CHECK ((node_type = 'FLORA' AND required_tool_prefix IS NULL)
        OR (node_type = 'ORE'   AND required_tool_prefix = 'OUT_PIO')
        OR (node_type = 'FISH'  AND required_tool_prefix = 'OUT_CAN'))
);
CREATE INDEX IF NOT EXISTS idx_nodes_zone ON T_RESOURCE_NODES(zone_id, node_type);

CREATE TABLE IF NOT EXISTS T_AVATAR_HARVESTS (
    avatar_uuid        UUID NOT NULL REFERENCES T_AVATARS(avatar_uuid) ON DELETE CASCADE,
    node_id            VARCHAR(30) NOT NULL REFERENCES T_RESOURCE_NODES(node_id),
    next_available_at  TIMESTAMP NOT NULL,
    harvest_count      INT NOT NULL DEFAULT 0,
    PRIMARY KEY (avatar_uuid, node_id)
);

-- D88 (I8 de T_INVENTORY)
ALTER TABLE T_INVENTORY ADD COLUMN IF NOT EXISTS durability_cap INT;
ALTER TABLE T_INVENTORY ADD COLUMN IF NOT EXISTS repair_count INT NOT NULL DEFAULT 0;

-- D90 (amendement T_ACTIVE_EFFECTS)
ALTER TABLE T_ACTIVE_EFFECTS ADD COLUMN IF NOT EXISTS source_kind VARCHAR(6) CHECK (source_kind IN ('skill','food','system'));
ALTER TABLE T_ACTIVE_EFFECTS ADD COLUMN IF NOT EXISTS source_ref VARCHAR(30);
CREATE INDEX IF NOT EXISTS idx_active_effects_expiry ON T_ACTIVE_EFFECTS(target_type, target_id, expires_at);


COMMIT;
