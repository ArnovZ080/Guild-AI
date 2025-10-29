-- Migration script to add missing columns to outcome_contracts table
-- Run this against your PostgreSQL database

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add target_audience column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'outcome_contracts' AND column_name = 'target_audience') THEN
        ALTER TABLE outcome_contracts ADD COLUMN target_audience JSON DEFAULT '{}';
    END IF;
    
    -- Add additional_notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'outcome_contracts' AND column_name = 'additional_notes') THEN
        ALTER TABLE outcome_contracts ADD COLUMN additional_notes TEXT;
    END IF;
    
    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'outcome_contracts' AND column_name = 'title') THEN
        ALTER TABLE outcome_contracts ADD COLUMN title VARCHAR(200) NOT NULL DEFAULT 'Untitled Contract';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'outcome_contracts' 
ORDER BY ordinal_position;
