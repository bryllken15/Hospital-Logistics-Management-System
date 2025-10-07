-- Enable Real-time on All Tables
-- This migration enables real-time subscriptions for all relevant tables

-- Enable real-time for core tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activities;

-- Enable real-time for project management
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_logistics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_budget_tracking;

-- Enable real-time for procurement
ALTER PUBLICATION supabase_realtime ADD TABLE public.suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.procurement_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.supplier_ratings;

-- Enable real-time for inventory
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_movements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rfid_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;

-- Enable real-time for maintenance
ALTER PUBLICATION supabase_realtime ADD TABLE public.assets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_maintenance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.asset_maintenance_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.asset_rfid_tracking;

-- Enable real-time for documents
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_types;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_access_logs;

-- Enable real-time for workflows
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_steps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_templates;

-- Enable real-time for system monitoring (admin only)
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.data_changes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.error_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_logs;

-- Create real-time subscription management functions
CREATE OR REPLACE FUNCTION get_realtime_subscriptions()
RETURNS TABLE (
    table_name TEXT,
    is_enabled BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM pg_publication_tables 
                WHERE pubname = 'supabase_realtime' 
                AND schemaname = 'public' 
                AND tablename = t.tablename
            ) THEN true 
            ELSE false 
        END as is_enabled
    FROM pg_tables t
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    ORDER BY tablename;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to enable real-time for a specific table
CREATE OR REPLACE FUNCTION enable_realtime_for_table(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to disable real-time for a specific table
CREATE OR REPLACE FUNCTION disable_realtime_for_table(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', table_name);
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create real-time event logging
CREATE TABLE IF NOT EXISTS public.realtime_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id UUID,
    user_id UUID REFERENCES public.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB
);

-- Index for real-time events
CREATE INDEX IF NOT EXISTS idx_realtime_events_table ON public.realtime_events(table_name);
CREATE INDEX IF NOT EXISTS idx_realtime_events_timestamp ON public.realtime_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_realtime_events_user ON public.realtime_events(user_id);

-- Function to log real-time events
CREATE OR REPLACE FUNCTION log_realtime_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.realtime_events (
        table_name,
        event_type,
        record_id,
        user_id,
        data
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        auth.uid(),
        CASE 
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
            ELSE to_jsonb(NEW)
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply real-time event logging to key tables
CREATE TRIGGER log_projects_realtime_events
    AFTER INSERT OR UPDATE OR DELETE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION log_realtime_event();

CREATE TRIGGER log_procurement_requests_realtime_events
    AFTER INSERT OR UPDATE OR DELETE ON public.procurement_requests
    FOR EACH ROW EXECUTE FUNCTION log_realtime_event();

CREATE TRIGGER log_purchase_orders_realtime_events
    AFTER INSERT OR UPDATE OR DELETE ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION log_realtime_event();

CREATE TRIGGER log_inventory_items_realtime_events
    AFTER INSERT OR UPDATE OR DELETE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION log_realtime_event();

CREATE TRIGGER log_workflow_instances_realtime_events
    AFTER INSERT OR UPDATE OR DELETE ON public.workflow_instances
    FOR EACH ROW EXECUTE FUNCTION log_realtime_event();

CREATE TRIGGER log_notifications_realtime_events
    AFTER INSERT OR UPDATE OR DELETE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION log_realtime_event();

-- Create real-time subscription statistics
CREATE TABLE IF NOT EXISTS public.realtime_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL UNIQUE,
    event_count INTEGER DEFAULT 0,
    last_event TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update real-time statistics
CREATE OR REPLACE FUNCTION update_realtime_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.realtime_stats (table_name, event_count, last_event)
    VALUES (TG_TABLE_NAME, 1, NOW())
    ON CONFLICT (table_name) 
    DO UPDATE SET 
        event_count = realtime_stats.event_count + 1,
        last_event = NOW(),
        updated_at = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply statistics tracking to key tables
CREATE TRIGGER update_projects_realtime_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_realtime_stats();

CREATE TRIGGER update_procurement_requests_realtime_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.procurement_requests
    FOR EACH ROW EXECUTE FUNCTION update_realtime_stats();

CREATE TRIGGER update_notifications_realtime_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION update_realtime_stats();
