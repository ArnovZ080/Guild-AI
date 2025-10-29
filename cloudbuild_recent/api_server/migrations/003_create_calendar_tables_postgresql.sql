-- Calendar Events Table (PostgreSQL compatible)
CREATE TABLE IF NOT EXISTS calendar_events (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration INT,  -- in minutes
    location VARCHAR(500),
    attendees JSON,  -- Array of email addresses
    agent_created BOOLEAN DEFAULT FALSE,
    related_agents JSON,  -- Array of agent IDs
    agent_tasks JSON,  -- Array of task IDs
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule JSON,
    notification_enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT FALSE,
    tags JSON,  -- Array of tags
    metadata JSON,  -- Additional flexible data
    external_calendar_id VARCHAR(255),  -- Google/Outlook event ID
    external_source VARCHAR(50),  -- 'google', 'outlook', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Create indexes for calendar_events
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_external_calendar ON calendar_events(external_calendar_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, start_time);

-- Calendar Preferences Table (PostgreSQL compatible)
CREATE TABLE IF NOT EXISTS calendar_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    max_meetings_per_day INT DEFAULT 5,
    min_break_time INT DEFAULT 15,  -- minutes
    no_meetings_after TIME DEFAULT '18:00:00',
    no_meetings_before TIME DEFAULT '08:00:00',
    deep_work_hours JSON,  -- Array of time ranges
    preferred_meeting_days JSON,  -- Array of day names
    avoid_back_to_back BOOLEAN DEFAULT TRUE,
    auto_insert_breaks BOOLEAN DEFAULT TRUE,
    default_meeting_duration INT DEFAULT 60,  -- minutes
    default_break_duration INT DEFAULT 15,  -- minutes
    timezone VARCHAR(100) DEFAULT 'UTC',
    work_hours_start TIME DEFAULT '09:00:00',
    work_hours_end TIME DEFAULT '17:00:00',
    optimization_enabled BOOLEAN DEFAULT TRUE,
    learned_preferences JSON,  -- ML-learned patterns
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for calendar_preferences
CREATE INDEX IF NOT EXISTS idx_calendar_preferences_user_id ON calendar_preferences(user_id);

-- Calendar Sync Status Table (PostgreSQL compatible)
CREATE TABLE IF NOT EXISTS calendar_sync_status (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    source VARCHAR(50) NOT NULL,  -- 'google', 'outlook', 'notion'
    last_sync_at TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'pending',  -- 'active', 'pending', 'error', 'paused'
    error_message TEXT,
    events_synced INT DEFAULT 0,
    sync_token VARCHAR(255),  -- For incremental sync
    calendar_id VARCHAR(255),  -- External calendar ID
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, source)
);

-- Create indexes for calendar_sync_status
CREATE INDEX IF NOT EXISTS idx_calendar_sync_status_user_id ON calendar_sync_status(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_status_sync_status ON calendar_sync_status(sync_status);

-- Calendar Optimization History Table (PostgreSQL compatible)
CREATE TABLE IF NOT EXISTS calendar_optimizations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    optimization_type VARCHAR(50),  -- 'weekly', 'daily', 'manual'
    original_schedule JSON,  -- Snapshot of events before optimization
    optimized_schedule JSON,  -- Suggested optimizations
    accepted_changes JSON,  -- Which optimizations user accepted
    rejected_changes JSON,  -- Which optimizations user rejected
    time_saved INT,  -- minutes
    productivity_impact DECIMAL(5,2),  -- percentage
    ai_confidence DECIMAL(5,2),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for calendar_optimizations
CREATE INDEX IF NOT EXISTS idx_calendar_optimizations_user_id ON calendar_optimizations(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_optimizations_optimization_type ON calendar_optimizations(optimization_type);
CREATE INDEX IF NOT EXISTS idx_calendar_optimizations_executed_at ON calendar_optimizations(executed_at);

-- Calendar Analytics Table (PostgreSQL compatible)
CREATE TABLE IF NOT EXISTS calendar_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    total_events INT DEFAULT 0,
    total_meeting_time INT DEFAULT 0,  -- minutes
    total_deep_work_time INT DEFAULT 0,  -- minutes
    total_break_time INT DEFAULT 0,  -- minutes
    meetings_count INT DEFAULT 0,
    deep_work_count INT DEFAULT 0,
    breaks_count INT DEFAULT 0,
    overload_score DECIMAL(5,2),  -- 0-100
    efficiency_score DECIMAL(5,2),  -- 0-1
    burnout_risk VARCHAR(20),  -- 'low', 'medium', 'high'
    time_allocation JSON,  -- Detailed breakdown by type
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, date)
);

-- Create indexes for calendar_analytics
CREATE INDEX IF NOT EXISTS idx_calendar_analytics_user_id ON calendar_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_analytics_date ON calendar_analytics(date);

-- Agent Calendar Tasks Table (PostgreSQL compatible)
CREATE TABLE IF NOT EXISTS agent_calendar_tasks (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    agent_id VARCHAR(255) NOT NULL,
    task_type VARCHAR(100),  -- 'prepare_report', 'analyze_data', etc.
    task_status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'in_progress', 'completed', 'failed'
    input_data JSON,
    output_data JSON,
    progress INT DEFAULT 0,  -- 0-100
    error_message TEXT,
    scheduled_for TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
);

-- Create indexes for agent_calendar_tasks
CREATE INDEX IF NOT EXISTS idx_agent_calendar_tasks_event_id ON agent_calendar_tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_agent_calendar_tasks_agent_id ON agent_calendar_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_calendar_tasks_task_status ON agent_calendar_tasks(task_status);
CREATE INDEX IF NOT EXISTS idx_agent_calendar_tasks_scheduled_for ON agent_calendar_tasks(scheduled_for);

-- Recurring Events Master Table (PostgreSQL compatible)
CREATE TABLE IF NOT EXISTS recurring_events_master (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    template_event_id VARCHAR(255),  -- Reference to template event
    recurrence_rule JSON NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,  -- NULL for infinite recurrence
    next_occurrence TIMESTAMP,
    last_generated TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for recurring_events_master
CREATE INDEX IF NOT EXISTS idx_recurring_events_master_user_id ON recurring_events_master(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_events_master_next_occurrence ON recurring_events_master(next_occurrence);
CREATE INDEX IF NOT EXISTS idx_recurring_events_master_is_active ON recurring_events_master(is_active);

-- Add comments for documentation
COMMENT ON TABLE calendar_events IS 'User calendar events and scheduling data';
COMMENT ON TABLE calendar_preferences IS 'User calendar preferences and settings';
COMMENT ON TABLE calendar_sync_status IS 'External calendar sync status and tokens';
COMMENT ON TABLE calendar_optimizations IS 'AI-powered calendar optimization history';
COMMENT ON TABLE calendar_analytics IS 'Daily calendar analytics and productivity metrics';
COMMENT ON TABLE agent_calendar_tasks IS 'Agent tasks associated with calendar events';
COMMENT ON TABLE recurring_events_master IS 'Master records for recurring calendar events';

-- Migration complete
SELECT 'Calendar tables migration completed successfully' as status;

