# Table MLD : T_ZONE_LINKS

> Détail relationnel du graphe de voisinage de l'atlas (`cartographie/atlas_monde_liaisons.md`). Source de vérité des connexions ; `T_ZONES.connected_zones` est une vue dénormalisée.

## 1. Structure SQL

```sql
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
```

## 2. Indexation et Optimisation

- **Index** `zone_a` et `zone_b` : `!where`/`!map` résolvent les adjacences dans les deux sens.
- **Index partiel** `is_locked = TRUE` : le moteur de déplacement vérifie les verrous.

## 3. Triggers / Procédures Stockées

| # | Contrat | Comportement |
|---|---|---|
| L1 | **Canonisation** | À l'insertion, ordre lexical `zone_a < zone_b` — pas de doublon inversé |
| L2 | **Anti-boucle** | Refuser `zone_a = zone_b` |
| L3 | **Profondeur donjon** | Refuser une 3ᵉ liaison sur une zone DUN/RAID |
| L4 | **Vol requis** | Forcer `requires_flight = TRUE` si `link_type = 'FLY'` (et non plus « une extrémité est de type ROUTE » — corrigé D80 : `ZONE_ROUTE_LUGRU` est un `ROUTE` souterrain `link_type='UNDERGROUND'`, franchi à pied) |
| L5 | **Sync connected_zones** | Toute insertion/suppression régénère `T_ZONES.connected_zones` des deux zones concernées |

## 4. Équivalents Commandes

| Opération | Joueur | GM | IA |
|---|---|---|---|
| Voir adjacences | `!map`, `!where` | — | `SYS_REVEAL_MAP` |
| Créer / supprimer lien | — | `!sys_zone_link`, `!sys_zone_unlink` | `SYS_CONNECT_ZONES`, `SYS_DISCONNECT_ZONES` |
| Verrouiller | — | `!sys_zone_lock` | `SYS_LOCK_ZONE` |
