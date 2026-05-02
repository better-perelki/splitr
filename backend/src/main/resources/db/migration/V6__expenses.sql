CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL,
    category VARCHAR(32) NOT NULL,
    expense_date DATE NOT NULL,
    split_type VARCHAR(16) NOT NULL
        CHECK (split_type IN ('EQUAL', 'PERCENTAGE', 'EXACT', 'SHARES', 'ADJUSTMENT')),
    receipt_url VARCHAR(512),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_group_date ON expenses(group_id, expense_date DESC);

CREATE TABLE expense_payers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
    UNIQUE (expense_id, user_id)
);

CREATE INDEX idx_expense_payers_expense ON expense_payers(expense_id);

CREATE TABLE expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    amount NUMERIC(18, 2) NOT NULL,
    share NUMERIC(10, 4),
    percentage NUMERIC(7, 4),
    adjustment NUMERIC(18, 2),
    UNIQUE (expense_id, user_id)
);

CREATE INDEX idx_expense_splits_expense ON expense_splits(expense_id);
CREATE INDEX idx_expense_splits_user ON expense_splits(user_id);
