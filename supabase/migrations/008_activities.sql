-- System Activities and Audit Logs Tables
-- This migration creates tables for comprehensive activity tracking and audit logs
-- Prerequisites: 001_users_and_auth.sql must be run first

-- Check if users table exists and has required columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        RAISE EXCEPTION 'Users table does not exist. Please run migration 001_users_and_auth.sql first.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_active') THEN
        RAISE EXCEPTION 'Users table is missing is_active column. Please run migration 001_users_and_auth.sql first.';
    END IF;
END $$;

-- System activities (comprehensive activity log)
CREATE TABLE IF NOT EXISTS public.system_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    username VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(100), -- 'user', 'project', 'procurement', 'inventory', etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs (security and compliance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: user_sessions table is already defined in 001_users_and_auth.sql
-- This migration focuses on system activities and audit logs

-- Data changes tracking
CREATE TABLE IF NOT EXISTS public.data_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES public.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- System metrics and monitoring
CREATE TABLE IF NOT EXISTS public.system_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4),
    metric_unit VARCHAR(50),
    tags JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error logs
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    request_url VARCHAR(500),
    request_method VARCHAR(10),
    ip_address INET,
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance logs
CREATE TABLE IF NOT EXISTS public.performance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation VARCHAR(100) NOT NULL,
    duration_ms INTEGER NOT NULL,
    user_id UUID REFERENCES public.users(id),
    request_id VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_activities_user ON public.system_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_system_activities_action ON public.system_activities(action);
CREATE INDEX IF NOT EXISTS idx_system_activities_entity ON public.system_activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_system_activities_created_at ON public.system_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
-- Note: user_sessions indexes are already defined in 001_users_and_auth.sql
CREATE INDEX IF NOT EXISTS idx_data_changes_table ON public.data_changes(table_name);
CREATE INDEX IF NOT EXISTS idx_data_changes_record ON public.data_changes(record_id);
CREATE INDEX IF NOT EXISTS idx_data_changes_operation ON public.data_changes(operation);
CREATE INDEX IF NOT EXISTS idx_error_logs_user ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON public.error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_performance_logs_operation ON public.performance_logs(operation);
CREATE INDEX IF NOT EXISTS idx_performance_logs_duration ON public.performance_logs(duration_ms);

-- Function to log system activities
CREATE OR REPLACE FUNCTION log_system_activity(
    p_user_id UUID,
    p_username VARCHAR(50),
    p_action VARCHAR(100),
    p_description TEXT,
    p_entity_type VARCHAR(100) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.system_activities (
        user_id, username, action, description, entity_type, entity_id, old_values, new_values
    ) VALUES (
        p_user_id, p_username, p_action, p_description, p_entity_type, p_entity_id, p_old_values, p_new_values
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ language 'plpgsql';

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id UUID,
    p_action VARCHAR(100),
    p_resource VARCHAR(100),
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_severity VARCHAR(20) DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id, action, resource, resource_id, details, severity
    ) VALUES (
        p_user_id, p_action, p_resource, p_resource_id, p_details, p_severity
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ language 'plpgsql';

-- Function to log data changes
CREATE OR REPLACE FUNCTION log_data_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.data_changes (table_name, record_id, operation, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.data_changes (table_name, record_id, operation, old_data, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.data_changes (table_name, record_id, operation, old_data)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Generic trigger for data change logging (can be applied to any table)
-- This would be applied manually to specific tables as needed
-- Example: CREATE TRIGGER log_users_changes AFTER INSERT OR UPDATE OR DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION log_data_change();
