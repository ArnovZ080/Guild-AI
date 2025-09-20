-- Migration: Create subscription and user management tables
-- Version: 002
-- Date: 2024-01-XX
-- Description: Add User, Subscription, UsageLog, and CreditTransaction tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    supabase_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    
    -- Subscription info
    subscription_status VARCHAR(50) DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'cancelled', 'past_due')),
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
    paystack_customer_id VARCHAR(255),
    
    -- Usage tracking
    credits_used_this_month INTEGER DEFAULT 0 CHECK (credits_used_this_month >= 0),
    credits_limit INTEGER DEFAULT 100 CHECK (credits_limit > 0),
    bonus_credits INTEGER DEFAULT 0 CHECK (bonus_credits >= 0),
    api_calls_this_month INTEGER DEFAULT 0 CHECK (api_calls_this_month >= 0),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Paystack details
    paystack_subscription_code VARCHAR(255) UNIQUE,
    paystack_plan_code VARCHAR(255) NOT NULL,
    
    -- Subscription details
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'cancelled', 'incomplete', 'past_due')),
    tier VARCHAR(50) NOT NULL CHECK (tier IN ('starter', 'professional', 'enterprise')),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'ZAR',
    
    -- Billing cycle
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    
    -- Credits and limits
    monthly_credits INTEGER NOT NULL CHECK (monthly_credits > 0),
    api_calls_limit INTEGER NOT NULL CHECK (api_calls_limit > 0),
    features JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create usage_logs table
CREATE TABLE IF NOT EXISTS usage_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Usage details
    action_type VARCHAR(100) NOT NULL,
    credits_consumed INTEGER DEFAULT 1 CHECK (credits_consumed >= 0),
    api_endpoint VARCHAR(255),
    
    -- Metadata
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Package details
    package_id VARCHAR(100) NOT NULL,
    credits_purchased INTEGER NOT NULL CHECK (credits_purchased > 0),
    bonus_credits INTEGER DEFAULT 0 CHECK (bonus_credits >= 0),
    total_credits INTEGER NOT NULL CHECK (total_credits > 0),
    
    -- Pricing details
    usd_amount NUMERIC(10, 2) NOT NULL CHECK (usd_amount >= 0),
    zar_amount NUMERIC(10, 2) NOT NULL CHECK (zar_amount >= 0),
    exchange_rate NUMERIC(10, 4) NOT NULL CHECK (exchange_rate > 0),
    
    -- Payment details
    paystack_reference VARCHAR(255) UNIQUE NOT NULL,
    paystack_transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    
    -- Metadata
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Add user_id to existing workflows table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workflows' AND column_name = 'user_id') THEN
        ALTER TABLE workflows ADD COLUMN user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_code ON subscriptions(paystack_subscription_code);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action_type ON usage_logs(action_type);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_paystack_ref ON credit_transactions(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default free plan configuration (for reference)
INSERT INTO users (supabase_id, email, subscription_status, subscription_tier, credits_limit)
VALUES ('system', 'system@guild.ai', 'free', 'free', 100)
ON CONFLICT (supabase_id) DO NOTHING;

-- Create a view for user subscription summary
CREATE OR REPLACE VIEW user_subscription_summary AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.subscription_status,
    u.subscription_tier,
    u.credits_used_this_month,
    u.credits_limit,
    u.bonus_credits,
    (u.credits_limit - u.credits_used_this_month + u.bonus_credits) as total_available_credits,
    u.api_calls_this_month,
    s.id as subscription_id,
    s.status as subscription_status_detail,
    s.amount as subscription_amount,
    s.currency as subscription_currency,
    s.current_period_end,
    s.monthly_credits,
    s.api_calls_limit,
    s.features as subscription_features,
    u.created_at,
    u.last_login
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON users TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON usage_logs TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON credit_transactions TO your_app_user;
-- GRANT SELECT ON user_subscription_summary TO your_app_user;

-- Create a function to reset monthly usage (for cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE users 
    SET 
        credits_used_this_month = 0,
        api_calls_this_month = 0,
        updated_at = NOW()
    WHERE subscription_status = 'active' OR subscription_tier = 'free';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Log the reset
    INSERT INTO usage_logs (user_id, action_type, credits_consumed, metadata)
    VALUES ('system', 'monthly_reset', 0, jsonb_build_object('reset_count', updated_count, 'reset_date', NOW()));
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts with subscription and usage tracking';
COMMENT ON TABLE subscriptions IS 'Active and historical subscription records';
COMMENT ON TABLE usage_logs IS 'Detailed usage tracking for billing and analytics';
COMMENT ON TABLE credit_transactions IS 'Credit purchase transactions and top-ups';

COMMENT ON COLUMN users.bonus_credits IS 'Purchased credits that never expire';
COMMENT ON COLUMN users.credits_used_this_month IS 'Credits consumed in current billing period';
COMMENT ON COLUMN subscriptions.amount IS 'Subscription amount in ZAR (South African Rand)';
COMMENT ON COLUMN credit_transactions.exchange_rate IS 'USD to ZAR rate at time of purchase';

-- Migration complete
SELECT 'Migration 002 completed successfully' as status;
