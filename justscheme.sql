CREATE TABLE submission_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_hash TEXT NOT NULL,
  reward NUMERIC(10, 2) DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validity_factor NUMERIC(3, 2) NOT NULL
);

-- Index for faster queries by wallet address
CREATE INDEX idx_submission_history_wallet ON submission_history(wallet_address);

-- Index for time-based queries
CREATE INDEX idx_submission_history_timestamp ON submission_history(timestamp);

-- Index for image hash to quickly check duplicates
CREATE UNIQUE INDEX idx_submission_history_image_hash ON submission_history(image_hash);

-- Grant permissions to service role only
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE submission_history TO service_role;

-- Revoke permissions from other roles for security
REVOKE ALL ON TABLE submission_history FROM anon, authenticated; 