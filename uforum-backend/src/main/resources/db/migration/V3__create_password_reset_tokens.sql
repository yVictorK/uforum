-- ─────────────────────────────────────────────────────────────
--  PASSWORD RESET TOKENS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE password_reset_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token       VARCHAR(255) NOT NULL UNIQUE,
    user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    expiry_date TIMESTAMP NOT NULL
);

CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
