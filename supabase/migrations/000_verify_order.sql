-- Migration Order Verification
-- This script helps verify that migrations are run in the correct order
-- Run this before running any other migrations to check the current state

-- Check if this is a fresh database
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'projects', 'procurement_requests', 'inventory_items', 'assets', 'documents', 'workflows', 'system_activities');
    
    IF table_count > 0 THEN
        RAISE NOTICE 'Database already has some tables. Make sure to run migrations in the correct order.';
        RAISE NOTICE 'Expected order: 001_users_and_auth.sql, 002_projects.sql, 003_procurement.sql, 004_inventory.sql, 005_maintenance.sql, 006_documents.sql, 007_workflows.sql, 008_activities.sql, 009_rls_policies.sql, 010_functions_triggers.sql, 011_realtime.sql, 012_seed_data.sql';
    ELSE
        RAISE NOTICE 'Fresh database detected. Ready to run migrations in order.';
    END IF;
END $$;
