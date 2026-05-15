CREATE TABLE notifications (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type          VARCHAR(50) NOT NULL,
    title         VARCHAR(255) NOT NULL,
    message       TEXT NOT NULL,
    link          VARCHAR(500),
    actor_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    is_read       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
