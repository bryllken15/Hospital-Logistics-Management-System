-- Row Level Security (RLS) Policies
-- This migration creates comprehensive RLS policies for role-based access control

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budget_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfid_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_rfid_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN (
        SELECT role FROM public.users 
        WHERE id = user_id AND is_active = true
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) = 'Admin';
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Helper function to check if user is manager or admin
CREATE OR REPLACE FUNCTION is_manager_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) IN ('Admin', 'Manager');
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert users" ON public.users
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Projects policies
CREATE POLICY "Users can view projects they're assigned to" ON public.projects
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.staff_assignments WHERE project_id = projects.id
        ) OR 
        project_manager_id = auth.uid() OR
        is_admin(auth.uid())
    );

CREATE POLICY "Project managers can manage their projects" ON public.projects
    FOR ALL USING (
        project_manager_id = auth.uid() OR is_admin(auth.uid())
    );

-- Staff assignments policies
CREATE POLICY "Users can view their assignments" ON public.staff_assignments
    FOR SELECT USING (
        user_id = auth.uid() OR 
        auth.uid() IN (SELECT project_manager_id FROM public.projects WHERE id = project_id) OR
        is_admin(auth.uid())
    );

CREATE POLICY "Project managers can manage assignments" ON public.staff_assignments
    FOR ALL USING (
        auth.uid() IN (SELECT project_manager_id FROM public.projects WHERE id = project_id) OR
        is_admin(auth.uid())
    );

-- Procurement requests policies
CREATE POLICY "Users can view their own requests" ON public.procurement_requests
    FOR SELECT USING (
        requested_by = auth.uid() OR is_manager_or_admin(auth.uid())
    );

CREATE POLICY "Users can create requests" ON public.procurement_requests
    FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Managers can approve requests" ON public.procurement_requests
    FOR UPDATE USING (is_manager_or_admin(auth.uid()));

-- Purchase orders policies
CREATE POLICY "Users can view orders they created" ON public.purchase_orders
    FOR SELECT USING (
        created_by = auth.uid() OR is_manager_or_admin(auth.uid())
    );

CREATE POLICY "Procurement staff can manage orders" ON public.purchase_orders
    FOR ALL USING (
        get_user_role(auth.uid()) = 'Procurement Staff' OR is_admin(auth.uid())
    );

-- Inventory policies
CREATE POLICY "Users can view inventory" ON public.inventory_items
    FOR SELECT USING (true); -- All users can view inventory

CREATE POLICY "SWS employees can manage inventory" ON public.inventory_items
    FOR ALL USING (
        get_user_role(auth.uid()) = 'Employee' OR is_admin(auth.uid())
    );

-- Assets policies
CREATE POLICY "Users can view assets" ON public.assets
    FOR SELECT USING (true); -- All users can view assets

CREATE POLICY "Maintenance staff can manage assets" ON public.assets
    FOR ALL USING (
        get_user_role(auth.uid()) = 'Maintenance Staff' OR is_admin(auth.uid())
    );

-- Documents policies
CREATE POLICY "Users can view documents they uploaded" ON public.documents
    FOR SELECT USING (
        uploaded_by = auth.uid() OR is_admin(auth.uid())
    );

CREATE POLICY "Document analysts can manage documents" ON public.documents
    FOR ALL USING (
        get_user_role(auth.uid()) = 'Document Analyst' OR is_admin(auth.uid())
    );

-- Workflow policies
CREATE POLICY "Users can view their workflow instances" ON public.workflow_instances
    FOR SELECT USING (
        initiated_by = auth.uid() OR is_admin(auth.uid())
    );

CREATE POLICY "Managers can view all workflows" ON public.workflow_instances
    FOR SELECT USING (is_manager_or_admin(auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- System activities policies (admin only)
CREATE POLICY "Admins can view all activities" ON public.system_activities
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own activities" ON public.system_activities
    FOR SELECT USING (user_id = auth.uid());

-- Audit logs policies (admin only)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (is_admin(auth.uid()));

-- Data changes policies (admin only)
CREATE POLICY "Admins can view data changes" ON public.data_changes
    FOR SELECT USING (is_admin(auth.uid()));

-- Error logs policies (admin only)
CREATE POLICY "Admins can view error logs" ON public.error_logs
    FOR SELECT USING (is_admin(auth.uid()));

-- Performance logs policies (admin only)
CREATE POLICY "Admins can view performance logs" ON public.performance_logs
    FOR SELECT USING (is_admin(auth.uid()));

-- System metrics policies (admin only)
CREATE POLICY "Admins can view system metrics" ON public.system_metrics
    FOR SELECT USING (is_admin(auth.uid()));

-- Announcements policies
CREATE POLICY "All users can view active announcements" ON public.announcements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage announcements" ON public.announcements
    FOR ALL USING (is_admin(auth.uid()));

-- Suppliers policies
CREATE POLICY "Procurement staff can manage suppliers" ON public.suppliers
    FOR ALL USING (
        get_user_role(auth.uid()) = 'Procurement Staff' OR is_admin(auth.uid())
    );

CREATE POLICY "All users can view suppliers" ON public.suppliers
    FOR SELECT USING (true);

-- Delivery receipts policies
CREATE POLICY "Users can view receipts they created" ON public.delivery_receipts
    FOR SELECT USING (
        received_by = auth.uid() OR is_admin(auth.uid())
    );

CREATE POLICY "Document analysts can manage receipts" ON public.delivery_receipts
    FOR ALL USING (
        get_user_role(auth.uid()) = 'Document Analyst' OR is_admin(auth.uid())
    );

-- Budget proposals policies
CREATE POLICY "Users can view their proposals" ON public.budget_proposals
    FOR SELECT USING (
        submitted_by = auth.uid() OR is_manager_or_admin(auth.uid())
    );

CREATE POLICY "Users can create proposals" ON public.budget_proposals
    FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Managers can approve proposals" ON public.budget_proposals
    FOR UPDATE USING (is_manager_or_admin(auth.uid()));

-- Maintenance logs policies
CREATE POLICY "Maintenance staff can manage logs" ON public.maintenance_logs
    FOR ALL USING (
        get_user_role(auth.uid()) = 'Maintenance Staff' OR is_admin(auth.uid())
    );

CREATE POLICY "All users can view maintenance logs" ON public.maintenance_logs
    FOR SELECT USING (true);

-- RFID tracking policies
CREATE POLICY "Users can view their RFID scans" ON public.rfid_tracking
    FOR SELECT USING (
        scanned_by = auth.uid() OR is_admin(auth.uid())
    );

CREATE POLICY "Users can create RFID scans" ON public.rfid_tracking
    FOR INSERT WITH CHECK (scanned_by = auth.uid());

-- Asset RFID tracking policies
CREATE POLICY "Users can view their asset scans" ON public.asset_rfid_tracking
    FOR SELECT USING (
        scanned_by = auth.uid() OR is_admin(auth.uid())
    );

CREATE POLICY "Users can create asset scans" ON public.asset_rfid_tracking
    FOR INSERT WITH CHECK (scanned_by = auth.uid());
