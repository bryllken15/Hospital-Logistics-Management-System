-- Migration Dependencies Check
-- Run this before running any other migrations to verify the correct order

-- Check if this is a fresh database
DO $$
DECLARE
    table_count INTEGER;
    users_exists BOOLEAN;
    users_has_is_active BOOLEAN;
BEGIN
    -- Check if users table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) INTO users_exists;
    
    -- Check if users table has is_active column
    IF users_exists THEN
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_active'
        ) INTO users_has_is_active;
    END IF;
    
    -- Provide guidance based on current state
    IF NOT users_exists THEN
        RAISE NOTICE 'Fresh database detected. Ready to run migrations in order.';
        RAISE NOTICE 'Start with: 001_users_and_auth.sql';
    ELSIF NOT users_has_is_active THEN
        RAISE EXCEPTION 'Users table exists but is missing is_active column. Please run 001_users_and_auth.sql first.';
    ELSE
        RAISE NOTICE 'Users table with is_active column found. Database appears to be set up correctly.';
    END IF;
    
    -- Show migration order
    RAISE NOTICE 'Migration order:';
    RAISE NOTICE '1. 001_users_and_auth.sql';
    RAISE NOTICE '2. 002_projects.sql';
    RAISE NOTICE '3. 003_procurement.sql';
    RAISE NOTICE '4. 004_inventory.sql';
    RAISE NOTICE '5. 005_maintenance.sql';
    RAISE NOTICE '6. 006_documents.sql';
    RAISE NOTICE '7. 007_workflows.sql';
    RAISE NOTICE '8. 008_activities.sql';
    RAISE NOTICE '9. 009_rls_policies.sql';
    RAISE NOTICE '10. 010_functions_triggers.sql';
    RAISE NOTICE '11. 011_realtime.sql';
    RAISE NOTICE '12. 012_seed_data.sql';
END $$;
