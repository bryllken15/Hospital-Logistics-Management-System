-- Fix realtime_stats table unique constraint
-- This migration adds the missing unique constraint to the realtime_stats table

-- Add unique constraint to table_name column if it doesn't exist
DO $$
BEGIN
    -- Check if the unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'realtime_stats_table_name_key' 
        AND table_name = 'realtime_stats'
        AND table_schema = 'public'
    ) THEN
        -- Add the unique constraint
        ALTER TABLE public.realtime_stats 
        ADD CONSTRAINT realtime_stats_table_name_key UNIQUE (table_name);
    END IF;
END $$;
