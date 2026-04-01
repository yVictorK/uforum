-- ============================================================
--  UForum - Schema Completo v1
-- ============================================================

-- ─────────────────────────────────────────────────────────────
--  USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE users (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username                 VARCHAR(50)  NOT NULL UNIQUE,
    email                    VARCHAR(255) NOT NULL UNIQUE,
    password                 VARCHAR(255) NOT NULL,
    student_id               VARCHAR(20)  NOT NULL UNIQUE,
    full_name                VARCHAR(100) NOT NULL,
    bio                      VARCHAR(500),
    course                   VARCHAR(100),
    semester                 INTEGER CHECK (semester BETWEEN 1 AND 12),
    age                      INTEGER CHECK (age BETWEEN 16 AND 100),
    neighborhood             VARCHAR(100),
    profile_picture_url      TEXT,
    whatsapp_number          VARCHAR(20),
    role                     VARCHAR(20)  NOT NULL DEFAULT 'STUDENT'
                             CHECK (role IN ('STUDENT','PROFESSOR','MODERATOR','EVENT_MANAGER','ADMIN')),
    email_verified           BOOLEAN NOT NULL DEFAULT FALSE,
    is_active                BOOLEAN NOT NULL DEFAULT TRUE,
    email_verification_token TEXT,
    refresh_token            TEXT,
    refresh_token_expiry     TIMESTAMP,
    created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_current_subjects (
    user_id UUID   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL
);

CREATE TABLE user_follows (
    follower_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id <> following_id)
);

-- ─────────────────────────────────────────────────────────────
--  COMMUNITIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE communities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(500) NOT NULL,
    banner_url  TEXT,
    icon_url    TEXT,
    is_private  BOOLEAN NOT NULL DEFAULT FALSE,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_by  UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE community_moderators (
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
    PRIMARY KEY (community_id, user_id)
);

CREATE TABLE community_members (
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
    PRIMARY KEY (community_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
--  POSTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE posts (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title          VARCHAR(300),
    content        TEXT         NOT NULL,
    image_url      TEXT,
    author_id      UUID NOT NULL REFERENCES users(id),
    community_id   UUID          REFERENCES communities(id),
    parent_id      UUID          REFERENCES posts(id),
    depth          INTEGER NOT NULL DEFAULT 0,
    upvotes_count  INT      NOT NULL DEFAULT 0,
    downvotes_count INT     NOT NULL DEFAULT 0,
    replies_count  INT      NOT NULL DEFAULT 0,
    is_deleted     BOOLEAN  NOT NULL DEFAULT FALSE,
    is_pinned      BOOLEAN  NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_community ON posts(community_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_posts_author    ON posts(author_id)    WHERE is_deleted = FALSE;
CREATE INDEX idx_posts_parent    ON posts(parent_id)    WHERE is_deleted = FALSE;
CREATE INDEX idx_posts_created   ON posts(created_at DESC);

CREATE TABLE post_votes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES posts(id)  ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    vote_type  VARCHAR(10) NOT NULL CHECK (vote_type IN ('UPVOTE','DOWNVOTE')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (post_id, user_id)
);

CREATE TABLE post_saves (
    post_id UUID NOT NULL REFERENCES posts(id)  ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
--  MAP BLOCKS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE map_blocks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20)  NOT NULL UNIQUE,
    description     VARCHAR(500),
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    polygon_coords  TEXT,
    floor_count     INTEGER DEFAULT 1,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- ─────────────────────────────────────────────────────────────
--  EVENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE events (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title        VARCHAR(200) NOT NULL,
    description  TEXT         NOT NULL,
    image_url    TEXT,
    location     VARCHAR(300) NOT NULL,
    map_block_id UUID         REFERENCES map_blocks(id),
    start_date   TIMESTAMP    NOT NULL,
    end_date     TIMESTAMP,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_by   UUID NOT NULL REFERENCES users(id),
    community_id UUID          REFERENCES communities(id),
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_start ON events(start_date) WHERE is_active = TRUE;

CREATE TABLE event_attendees (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id  UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    PRIMARY KEY (event_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
--  MARKETPLACE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(200) NOT NULL,
    description TEXT         NOT NULL,
    price       NUMERIC(10,2) NOT NULL CHECK (price > 0),
    category    VARCHAR(100),
    status      VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
                CHECK (status IN ('AVAILABLE','RESERVED','SOLD')),
    seller_id   UUID NOT NULL REFERENCES users(id),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_status   ON products(status)    WHERE is_active = TRUE;
CREATE INDEX idx_products_category ON products(category)  WHERE is_active = TRUE;
CREATE INDEX idx_products_seller   ON products(seller_id) WHERE is_active = TRUE;

CREATE TABLE product_images (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url  TEXT NOT NULL
);

-- ─────────────────────────────────────────────────────────────
--  NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE notifications (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id       UUID          REFERENCES users(id) ON DELETE SET NULL,
    type           VARCHAR(50)  NOT NULL,
    message        VARCHAR(300) NOT NULL,
    reference_id   UUID,
    reference_type VARCHAR(50),
    is_read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);

-- ─────────────────────────────────────────────────────────────
--  REPORTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE reports (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id    UUID NOT NULL REFERENCES users(id),
    target_id      UUID NOT NULL,
    target_type    VARCHAR(20) NOT NULL CHECK (target_type IN ('POST','USER')),
    reason         VARCHAR(50) NOT NULL,
    description    VARCHAR(500),
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING','REVIEWED','RESOLVED','DISMISSED')),
    reviewed_by    UUID REFERENCES users(id),
    reviewer_notes VARCHAR(500),
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (reporter_id, target_id)
);

CREATE INDEX idx_reports_status ON reports(status);

-- ─────────────────────────────────────────────────────────────
--  SEED: Admin padrão
-- ─────────────────────────────────────────────────────────────
INSERT INTO users (id, username, email, password, student_id, full_name, role, email_verified)
VALUES (
    gen_random_uuid(),
    'admin',
    'admin@ufam.edu.br',
    -- senha: Admin@12345 (BCrypt)
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '00000001',
    'Administrador UForum',
    'ADMIN',
    TRUE
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
--  SEED: Blocos UFAM (coordenadas aproximadas do campus)
-- ─────────────────────────────────────────────────────────────
INSERT INTO map_blocks (name, code, description, latitude, longitude, floor_count) VALUES
    ('Instituto de Computação', 'IComp', 'Instituto de Computação da UFAM', -3.0992, -59.9937, 3),
    ('Faculdade de Tecnologia', 'FT',   'Faculdade de Tecnologia',          -3.1003, -59.9945, 4),
    ('Instituto de Ciências Exatas', 'ICE', 'Instituto de Ciências Exatas', -3.0985, -59.9930, 2),
    ('Biblioteca Central', 'BCT',  'Biblioteca Central da UFAM',            -3.0978, -59.9920, 3),
    ('Reitoria', 'REIT', 'Prédio da Reitoria',                              -3.0970, -59.9910, 5),
    ('Centro de Ciências do Ambiente', 'CCA', 'CCA - UFAM',                 -3.1010, -59.9950, 2),
    ('Faculdade de Medicina', 'FMed', 'Faculdade de Medicina',              -3.0960, -59.9900, 6),
    ('Ginásio Poliesportivo', 'GIN', 'Ginásio Poliesportivo',               -3.1020, -59.9960, 1),
    ('Restaurante Universitário', 'RU', 'Restaurante Universitário',        -3.0995, -59.9925, 1),
    ('Instituto de Ciências Biológicas', 'ICB', 'ICB - UFAM',              -3.0975, -59.9942, 3)
ON CONFLICT (code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
--  SEED: Comunidades iniciais
-- ─────────────────────────────────────────────────────────────
INSERT INTO communities (name, slug, description, created_by)
SELECT 'Computação', 'computacao',
       'Comunidade dos alunos de Ciência da Computação e Engenharia de Software',
       id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO communities (name, slug, description, created_by)
SELECT 'Geral UFAM', 'geral-ufam',
       'Discussões gerais sobre a vida universitária na UFAM',
       id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO communities (name, slug, description, created_by)
SELECT 'Calouros', 'calouros',
       'Espaço para dúvidas e dicas para quem está chegando na UFAM',
       id FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;
