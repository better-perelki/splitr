-- Exchange rates table for storing historical currency rates
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency_from VARCHAR(3) NOT NULL,
    currency_to VARCHAR(3) NOT NULL,
    rate NUMERIC(18, 8) NOT NULL,
    rate_date DATE NOT NULL,
    source VARCHAR(20) NOT NULL DEFAULT 'NBP',
    fetched_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(currency_from, currency_to, rate_date)
);

CREATE INDEX idx_exchange_rates_lookup ON exchange_rates(currency_from, currency_to, rate_date);

-- Add conversion columns to expenses for multi-currency support
ALTER TABLE expenses ADD COLUMN converted_amount NUMERIC(18, 2);
ALTER TABLE expenses ADD COLUMN exchange_rate NUMERIC(18, 8);
ALTER TABLE expenses ADD COLUMN group_currency VARCHAR(3);

-- Backfill existing expenses: if currency matches group currency, converted_amount = amount
UPDATE expenses e
SET converted_amount = e.amount,
    exchange_rate = 1,
    group_currency = g.currency
FROM groups g
WHERE e.group_id = g.id;
