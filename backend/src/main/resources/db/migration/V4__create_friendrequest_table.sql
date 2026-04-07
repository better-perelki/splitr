CREATE TABLE friend_requests (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                 sender_id UUID NOT NULL,
                                 receiver_id UUID NOT NULL,

                                 status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

                                 created_at TIMESTAMP NOT NULL DEFAULT now(),

                                 CONSTRAINT fk_friend_requests_sender
                                     FOREIGN KEY (sender_id)
                                         REFERENCES users(id)
                                         ON DELETE CASCADE,

                                 CONSTRAINT fk_friend_requests_receiver
                                     FOREIGN KEY (receiver_id)
                                         REFERENCES users(id)
                                         ON DELETE CASCADE,

                                 CONSTRAINT uq_friend_requests_sender_receiver
                                     UNIQUE (sender_id, receiver_id),

                                 CONSTRAINT chk_friend_requests_status
                                     CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED'))
);

CREATE INDEX idx_friend_requests_sender_id
    ON friend_requests(sender_id);

CREATE INDEX idx_friend_requests_receiver_id
    ON friend_requests(receiver_id);

CREATE INDEX idx_friend_requests_status
    ON friend_requests(status);