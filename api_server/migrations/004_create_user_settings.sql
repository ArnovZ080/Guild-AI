-- 004_create_user_settings_table.sql

CREATE TABLE user_settings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    settings_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
