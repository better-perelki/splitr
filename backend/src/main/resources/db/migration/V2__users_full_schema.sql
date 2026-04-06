ALTER TABLE users
    ADD COLUMN phone            VARCHAR(20)  UNIQUE,
    ADD COLUMN username         VARCHAR(50)  NOT NULL UNIQUE DEFAULT '',
    ADD COLUMN password_hash    VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN avatar_url       TEXT,
    ADD COLUMN default_currency CHAR(3)      NOT NULL DEFAULT 'PLN',
    ADD COLUMN timezone         VARCHAR(50)  NOT NULL DEFAULT 'Europe/Warsaw',
    ADD COLUMN is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    ADD COLUMN is_email_verified BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN updated_at       TIMESTAMP    NOT NULL DEFAULT now(),
    ADD COLUMN last_login_at    TIMESTAMP;

ALTER TABLE users ALTER COLUMN username DROP DEFAULT;
ALTER TABLE users ALTER COLUMN password_hash DROP DEFAULT;

CREATE TABLE refresh_tokens (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP   NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
