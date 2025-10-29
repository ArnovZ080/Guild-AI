-- Migration: Create OAuth tables for Guild-AI
-- This migration creates the necessary tables for OAuth authentication flows

-- Create oauth_states table for temporary OAuth state storage
CREATE TABLE IF NOT EXISTS oauth_states (
    id SERIAL PRIMARY KEY,
    state VARCHAR(100) UNIQUE NOT NULL,
    provider VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on state for fast lookups
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_provider ON oauth_states(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

-- Create connector_credentials table for storing OAuth tokens
CREATE TABLE IF NOT EXISTS connector_credentials (
    id VARCHAR(50) PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    account_id VARCHAR(200) NOT NULL,
    account_name VARCHAR(200),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    scopes JSON DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for connector_credentials
CREATE INDEX IF NOT EXISTS idx_connector_credentials_provider ON connector_credentials(provider);
CREATE INDEX IF NOT EXISTS idx_connector_credentials_account_id ON connector_credentials(account_id);
CREATE INDEX IF NOT EXISTS idx_connector_credentials_expires ON connector_credentials(expires_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_connector_credentials_updated_at ON connector_credentials;
CREATE TRIGGER update_connector_credentials_updated_at
    BEFORE UPDATE ON connector_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- INSERT INTO oauth_states (state, provider, expires_at) VALUES 
-- ('test_state_123', 'gdrive', CURRENT_TIMESTAMP + INTERVAL '1 hour');

-- Add comments for documentation
COMMENT ON TABLE oauth_states IS 'Temporary storage for OAuth state parameters during authentication flows';
COMMENT ON TABLE connector_credentials IS 'Stored OAuth credentials for connected cloud services';
COMMENT ON COLUMN oauth_states.state IS 'Unique state parameter for OAuth flow security';
COMMENT ON COLUMN oauth_states.provider IS 'OAuth provider (gdrive, dropbox, etc.)';
COMMENT ON COLUMN oauth_states.expires_at IS 'When this state expires (typically 1 hour)';
COMMENT ON COLUMN connector_credentials.id IS 'Unique identifier for the credential record';
COMMENT ON COLUMN connector_credentials.provider IS 'OAuth provider (gdrive, dropbox, etc.)';
COMMENT ON COLUMN connector_credentials.account_id IS 'User account identifier from the provider';
COMMENT ON COLUMN connector_credentials.account_name IS 'Human-readable account name';
COMMENT ON COLUMN connector_credentials.access_token IS 'OAuth access token (encrypted in production)';
COMMENT ON COLUMN connector_credentials.refresh_token IS 'OAuth refresh token (encrypted in production)';
COMMENT ON COLUMN connector_credentials.expires_at IS 'When the access token expires';
COMMENT ON COLUMN connector_credentials.scopes IS 'JSON array of granted OAuth scopes';
