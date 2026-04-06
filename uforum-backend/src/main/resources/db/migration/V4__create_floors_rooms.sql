-- ============================================================
--  V4: Indoor Navigation — floors + rooms
-- ============================================================

-- ─────────────────────────────────────────────────────────────
--  FLOORS (andares dos blocos)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE floors (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id    UUID        NOT NULL REFERENCES map_blocks(id) ON DELETE CASCADE,
    number      INTEGER     NOT NULL,
    name        VARCHAR(100),
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (block_id, number)
);

CREATE INDEX idx_floors_block ON floors(block_id);

-- ─────────────────────────────────────────────────────────────
--  ROOMS (salas dentro de cada andar)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE rooms (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_id       UUID             NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    name           VARCHAR(100)     NOT NULL,
    number         VARCHAR(20),
    type           VARCHAR(20)      NOT NULL DEFAULT 'OTHER'
                   CHECK (type IN ('CLASSROOM','LAB','ADMIN','OTHER')),
    x              DOUBLE PRECISION NOT NULL,
    y              DOUBLE PRECISION NOT NULL,
    width          DOUBLE PRECISION NOT NULL,
    height         DOUBLE PRECISION NOT NULL,
    metadata_json  TEXT,
    created_at     TIMESTAMP        NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rooms_floor ON rooms(floor_id);
CREATE INDEX idx_rooms_name  ON rooms(LOWER(name));
