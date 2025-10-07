-- Create Initial Users Script
-- This script provides instructions for creating users in Supabase Auth
-- Users must be created through the Supabase Auth system first

-- IMPORTANT: Before running this script, you need to create users in Supabase Auth
-- You can do this through:
-- 1. Supabase Dashboard > Authentication > Users > Add User
-- 2. Supabase Auth API
-- 3. Supabase CLI

-- Example users to create in Supabase Auth:
-- 1. Email: admin@logistics1.com, Password: admin123, Role: Admin
-- 2. Email: manager@logistics1.com, Password: manager123, Role: Manager  
-- 3. Email: employee@logistics1.com, Password: employee123, Role: Employee
-- 4. Email: procurement@logistics1.com, Password: procurement123, Role: Procurement Staff
-- 5. Email: project@logistics1.com, Password: project123, Role: Project Manager
-- 6. Email: maintenance@logistics1.com, Password: maintenance123, Role: Maintenance Staff
-- 7. Email: document@logistics1.com, Password: document123, Role: Document Analyst

-- After creating users in auth.users, you can run this script to populate the public.users table
-- with the corresponding user data

-- Function to create user profile after auth user is created
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        username,
        email,
        full_name,
        role,
        is_active,
        permissions,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Employee'),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, true),
        CASE 
            WHEN NEW.raw_user_meta_data->>'role' = 'Admin' THEN ARRAY['all']
            WHEN NEW.raw_user_meta_data->>'role' = 'Manager' THEN ARRAY['view_all', 'approve_requests', 'analytics']
            WHEN NEW.raw_user_meta_data->>'role' = 'Employee' THEN ARRAY['sws_module', 'rfid_scan', 'inventory_manage']
            WHEN NEW.raw_user_meta_data->>'role' = 'Procurement Staff' THEN ARRAY['psm_module', 'supplier_manage', 'purchase_orders']
            WHEN NEW.raw_user_meta_data->>'role' = 'Project Manager' THEN ARRAY['plt_module', 'project_tracking', 'resource_assign']
            WHEN NEW.raw_user_meta_data->>'role' = 'Maintenance Staff' THEN ARRAY['alms_module', 'asset_tracking', 'maintenance_logs']
            WHEN NEW.raw_user_meta_data->>'role' = 'Document Analyst' THEN ARRAY['dtrs_module', 'document_upload', 'record_verify']
            ELSE ARRAY['basic']
        END,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to automatically create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Note: This trigger will automatically create user profiles when users are created in auth.users
-- Make sure to set the role in the user metadata when creating users in Supabase Auth
-- Example metadata: {"role": "Admin", "full_name": "System Administrator", "username": "admin"}
