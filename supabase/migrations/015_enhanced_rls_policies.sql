-- Enhanced Row Level Security (RLS) Policies
-- This migration adds comprehensive role-based access control with advanced security features

-- Create enhanced helper functions for role-based access control
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN (
        SELECT role FROM public.users 
        WHERE id = auth.uid() AND is_active = true
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Enhanced role checking functions
CREATE OR REPLACE FUNCTION has_role(required_role VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_role() = required_role;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_any_role(required_roles VARCHAR(50)[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_role() = ANY(required_roles);
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN has_any_role(ARRAY['Admin', 'Manager']);
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_approval_role()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN has_any_role(ARRAY['Admin', 'Manager', 'Project Manager']);
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to check if user can approve specific request
CREATE OR REPLACE FUNCTION can_approve_request(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    request_role VARCHAR(50);
BEGIN
    -- Get the role that created the request
    SELECT get_user_role(requested_by) INTO request_role
    FROM public.procurement_requests 
    WHERE id = request_id;
    
    -- Approval chain logic
    CASE request_role
        WHEN 'Employee' THEN
            -- Employee requests need Manager -> Project Manager approval
            RETURN get_current_user_role() IN ('Manager', 'Project Manager', 'Admin');
        WHEN 'Procurement Staff' THEN
            -- Procurement requests need Manager -> Project Manager approval
            RETURN get_current_user_role() IN ('Manager', 'Project Manager', 'Admin');
        WHEN 'Document Analyst' THEN
            -- Document requests need Manager -> Project Manager approval
            RETURN get_current_user_role() IN ('Manager', 'Project Manager', 'Admin');
        ELSE
            RETURN get_current_user_role() = 'Admin';
    END CASE;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to check if user can view project data
CREATE OR REPLACE FUNCTION can_view_project(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        -- User is assigned to the project
        EXISTS (
            SELECT 1 FROM public.staff_assignments 
            WHERE project_id = can_view_project.project_id 
            AND user_id = auth.uid()
        ) OR
        -- User is the project manager
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = can_view_project.project_id 
            AND project_manager_id = auth.uid()
        ) OR
        -- User is admin or manager
        is_admin_or_manager() OR
        -- User created the project
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = can_view_project.project_id 
            AND created_by = auth.uid()
        )
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Enhanced Users table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (has_role('Admin'));

DROP POLICY IF EXISTS "Managers can view users in their department" ON public.users;
CREATE POLICY "Managers can view users in their department" ON public.users
    FOR SELECT USING (
        has_role('Manager') AND 
        EXISTS (
            SELECT 1 FROM public.projects p
            JOIN public.staff_assignments sa ON p.id = sa.project_id
            WHERE sa.user_id = users.id
            AND p.department = (
                SELECT p2.department FROM public.projects p2
                WHERE p2.project_manager_id = auth.uid() 
                LIMIT 1
            )
        )
    );

CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (has_role('Admin'));

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Enhanced Projects policies
DROP POLICY IF EXISTS "Users can view projects they're assigned to" ON public.projects;
DROP POLICY IF EXISTS "Project managers can manage their projects" ON public.projects;

CREATE POLICY "Users can view accessible projects" ON public.projects
    FOR SELECT USING (can_view_project(id));

CREATE POLICY "Project managers can manage their projects" ON public.projects
    FOR ALL USING (
        project_manager_id = auth.uid() OR 
        has_role('Admin')
    );

CREATE POLICY "Managers can view all projects" ON public.projects
    FOR SELECT USING (has_role('Manager'));

-- Enhanced Procurement policies
DROP POLICY IF EXISTS "Users can view their own requests" ON public.procurement_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.procurement_requests;
DROP POLICY IF EXISTS "Managers can approve requests" ON public.procurement_requests;

CREATE POLICY "Users can view their own requests" ON public.procurement_requests
    FOR SELECT USING (
        requested_by = auth.uid() OR 
        is_admin_or_manager() OR
        (has_role('Project Manager') AND status IN ('manager_approved', 'pending'))
    );

CREATE POLICY "Users can create requests" ON public.procurement_requests
    FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Approvers can manage requests" ON public.procurement_requests
    FOR UPDATE USING (can_approve_request(id));

CREATE POLICY "Managers can view department requests" ON public.procurement_requests
    FOR SELECT USING (
        has_role('Manager') AND 
        department = (
            SELECT department FROM public.projects 
            WHERE project_manager_id = auth.uid() 
            LIMIT 1
        )
    );

-- Enhanced Purchase Orders policies
DROP POLICY IF EXISTS "Users can view orders they created" ON public.purchase_orders;
DROP POLICY IF EXISTS "Procurement staff can manage orders" ON public.purchase_orders;

CREATE POLICY "Users can view accessible orders" ON public.purchase_orders
    FOR SELECT USING (
        created_by = auth.uid() OR 
        is_admin_or_manager() OR
        (has_role('Project Manager') AND status IN ('approved', 'pending'))
    );

CREATE POLICY "Procurement staff can manage orders" ON public.purchase_orders
    FOR ALL USING (
        has_role('Procurement Staff') OR 
        has_role('Admin')
    );

CREATE POLICY "Managers can approve orders" ON public.purchase_orders
    FOR UPDATE USING (
        is_admin_or_manager() AND 
        status IN ('pending', 'manager_approved')
    );

-- Enhanced Inventory policies
DROP POLICY IF EXISTS "Users can view inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "SWS employees can manage inventory" ON public.inventory_items;

CREATE POLICY "All users can view inventory" ON public.inventory_items
    FOR SELECT USING (true);

CREATE POLICY "SWS employees can manage inventory" ON public.inventory_items
    FOR ALL USING (
        has_role('Employee') OR 
        has_role('Admin')
    );

CREATE POLICY "Managers can view inventory analytics" ON public.inventory_items
    FOR SELECT USING (is_admin_or_manager());

-- Enhanced Assets policies
DROP POLICY IF EXISTS "Users can view assets" ON public.assets;
DROP POLICY IF EXISTS "Maintenance staff can manage assets" ON public.assets;

CREATE POLICY "All users can view assets" ON public.assets
    FOR SELECT USING (true);

CREATE POLICY "Maintenance staff can manage assets" ON public.assets
    FOR ALL USING (
        has_role('Maintenance Staff') OR 
        has_role('Admin')
    );

CREATE POLICY "Managers can view asset analytics" ON public.assets
    FOR SELECT USING (is_admin_or_manager());

-- Enhanced Documents policies
DROP POLICY IF EXISTS "Users can view documents they uploaded" ON public.documents;
DROP POLICY IF EXISTS "Document analysts can manage documents" ON public.documents;

CREATE POLICY "Users can view accessible documents" ON public.documents
    FOR SELECT USING (
        uploaded_by = auth.uid() OR 
        has_role('Admin') OR
        (has_role('Document Analyst') AND status = 'pending_verification') OR
        (is_admin_or_manager() AND status = 'verified')
    );

CREATE POLICY "Users can upload documents" ON public.documents
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Document analysts can manage documents" ON public.documents
    FOR ALL USING (
        has_role('Document Analyst') OR 
        has_role('Admin')
    );

CREATE POLICY "Managers can view all documents" ON public.documents
    FOR SELECT USING (is_admin_or_manager());

-- Enhanced Workflow policies
DROP POLICY IF EXISTS "Users can view their workflow instances" ON public.workflow_instances;
DROP POLICY IF EXISTS "Managers can view all workflows" ON public.workflow_instances;

CREATE POLICY "Users can view their workflow instances" ON public.workflow_instances
    FOR SELECT USING (
        initiated_by = auth.uid() OR 
        has_role('Admin') OR
        (is_approval_role() AND EXISTS (
            SELECT 1 FROM public.workflow_steps ws 
            WHERE ws.workflow_id = workflow_instances.workflow_id 
            AND ws.step_order = workflow_instances.current_step 
            AND ws.required_role = get_current_user_role()
        ))
    );

CREATE POLICY "Users can initiate workflows" ON public.workflow_instances
    FOR INSERT WITH CHECK (initiated_by = auth.uid());

CREATE POLICY "Approvers can update workflows" ON public.workflow_instances
    FOR UPDATE USING (
        is_approval_role() AND 
        EXISTS (
            SELECT 1 FROM public.workflow_steps ws 
            WHERE ws.workflow_id = workflow_instances.workflow_id 
            AND ws.step_order = workflow_instances.current_step 
            AND ws.required_role = get_current_user_role()
        )
    );

CREATE POLICY "Managers can view all workflows" ON public.workflow_instances
    FOR SELECT USING (is_admin_or_manager());

-- Enhanced Notifications policies
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;

CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true); -- System-generated notifications

-- Enhanced System Activities policies
DROP POLICY IF EXISTS "Admins can view all activities" ON public.system_activities;
DROP POLICY IF EXISTS "Users can view their own activities" ON public.system_activities;

CREATE POLICY "Admins can view all activities" ON public.system_activities
    FOR SELECT USING (has_role('Admin'));

CREATE POLICY "Users can view their own activities" ON public.system_activities
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Managers can view department activities" ON public.system_activities;
CREATE POLICY "Managers can view department activities" ON public.system_activities
    FOR SELECT USING (
        has_role('Manager') AND 
        EXISTS (
            SELECT 1 FROM public.projects p
            JOIN public.staff_assignments sa ON p.id = sa.project_id
            WHERE sa.user_id = system_activities.user_id
            AND p.department = (
                SELECT p2.department FROM public.projects p2
                WHERE p2.project_manager_id = auth.uid() 
                LIMIT 1
            )
        )
    );

-- Enhanced Audit Logs policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (has_role('Admin'));

CREATE POLICY "System can create audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Enhanced Data Changes policies
DROP POLICY IF EXISTS "Admins can view data changes" ON public.data_changes;

CREATE POLICY "Admins can view data changes" ON public.data_changes
    FOR SELECT USING (has_role('Admin'));

CREATE POLICY "System can create data changes" ON public.data_changes
    FOR INSERT WITH CHECK (true);

-- Enhanced Error Logs policies
DROP POLICY IF EXISTS "Admins can view error logs" ON public.error_logs;

CREATE POLICY "Admins can view error logs" ON public.error_logs
    FOR SELECT USING (has_role('Admin'));

CREATE POLICY "System can create error logs" ON public.error_logs
    FOR INSERT WITH CHECK (true);

-- Enhanced Performance Logs policies
DROP POLICY IF EXISTS "Admins can view performance logs" ON public.performance_logs;

CREATE POLICY "Admins can view performance logs" ON public.performance_logs
    FOR SELECT USING (has_role('Admin'));

CREATE POLICY "System can create performance logs" ON public.performance_logs
    FOR INSERT WITH CHECK (true);

-- Enhanced System Metrics policies
DROP POLICY IF EXISTS "Admins can view system metrics" ON public.system_metrics;

CREATE POLICY "Admins can view system metrics" ON public.system_metrics
    FOR SELECT USING (has_role('Admin'));

CREATE POLICY "System can create metrics" ON public.system_metrics
    FOR INSERT WITH CHECK (true);

-- Enhanced Announcements policies
DROP POLICY IF EXISTS "All users can view active announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;

CREATE POLICY "All users can view active announcements" ON public.announcements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage announcements" ON public.announcements
    FOR ALL USING (has_role('Admin'));

CREATE POLICY "Managers can create announcements" ON public.announcements
    FOR INSERT WITH CHECK (has_role('Manager'));

-- Enhanced Suppliers policies
DROP POLICY IF EXISTS "Procurement staff can manage suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "All users can view suppliers" ON public.suppliers;

CREATE POLICY "All users can view suppliers" ON public.suppliers
    FOR SELECT USING (true);

CREATE POLICY "Procurement staff can manage suppliers" ON public.suppliers
    FOR ALL USING (
        has_role('Procurement Staff') OR 
        has_role('Admin')
    );

CREATE POLICY "Managers can view supplier analytics" ON public.suppliers
    FOR SELECT USING (is_admin_or_manager());

-- Enhanced Delivery Receipts policies
DROP POLICY IF EXISTS "Users can view receipts they created" ON public.delivery_receipts;
DROP POLICY IF EXISTS "Document analysts can manage receipts" ON public.delivery_receipts;

CREATE POLICY "Users can view accessible receipts" ON public.delivery_receipts
    FOR SELECT USING (
        received_by = auth.uid() OR 
        has_role('Admin') OR
        (has_role('Document Analyst') AND status = 'pending_verification') OR
        (is_admin_or_manager() AND status = 'verified')
    );

CREATE POLICY "Users can create receipts" ON public.delivery_receipts
    FOR INSERT WITH CHECK (received_by = auth.uid());

CREATE POLICY "Document analysts can manage receipts" ON public.delivery_receipts
    FOR ALL USING (
        has_role('Document Analyst') OR 
        has_role('Admin')
    );

-- Enhanced Budget Proposals policies
DROP POLICY IF EXISTS "Users can view their proposals" ON public.budget_proposals;
DROP POLICY IF EXISTS "Users can create proposals" ON public.budget_proposals;
DROP POLICY IF EXISTS "Managers can approve proposals" ON public.budget_proposals;

CREATE POLICY "Users can view accessible proposals" ON public.budget_proposals
    FOR SELECT USING (
        submitted_by = auth.uid() OR 
        is_admin_or_manager() OR
        (has_role('Project Manager') AND status IN ('manager_approved', 'pending'))
    );

CREATE POLICY "Users can create proposals" ON public.budget_proposals
    FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Approvers can manage proposals" ON public.budget_proposals
    FOR UPDATE USING (is_approval_role());

-- Enhanced Maintenance Logs policies
DROP POLICY IF EXISTS "Maintenance staff can manage logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "All users can view maintenance logs" ON public.maintenance_logs;

CREATE POLICY "All users can view maintenance logs" ON public.maintenance_logs
    FOR SELECT USING (true);

CREATE POLICY "Maintenance staff can manage logs" ON public.maintenance_logs
    FOR ALL USING (
        has_role('Maintenance Staff') OR 
        has_role('Admin')
    );

CREATE POLICY "Managers can view maintenance analytics" ON public.maintenance_logs
    FOR SELECT USING (is_admin_or_manager());

-- Enhanced RFID Tracking policies
DROP POLICY IF EXISTS "Users can view their RFID scans" ON public.rfid_tracking;
DROP POLICY IF EXISTS "Users can create RFID scans" ON public.rfid_tracking;

CREATE POLICY "Users can view their RFID scans" ON public.rfid_tracking
    FOR SELECT USING (
        scanned_by = auth.uid() OR 
        has_role('Admin') OR
        (has_role('Employee') AND item_id IN (
            SELECT id FROM public.inventory_items WHERE status = 'in_stock'
        ))
    );

CREATE POLICY "Users can create RFID scans" ON public.rfid_tracking
    FOR INSERT WITH CHECK (scanned_by = auth.uid());

CREATE POLICY "Managers can view RFID analytics" ON public.rfid_tracking
    FOR SELECT USING (is_admin_or_manager());

-- Enhanced Asset RFID Tracking policies
DROP POLICY IF EXISTS "Users can view their asset scans" ON public.asset_rfid_tracking;
DROP POLICY IF EXISTS "Users can create asset scans" ON public.asset_rfid_tracking;

CREATE POLICY "Users can view their asset scans" ON public.asset_rfid_tracking
    FOR SELECT USING (
        scanned_by = auth.uid() OR 
        has_role('Admin') OR
        (has_role('Maintenance Staff') AND asset_id IN (
            SELECT id FROM public.assets WHERE condition != 'decommissioned'
        ))
    );

CREATE POLICY "Users can create asset scans" ON public.asset_rfid_tracking
    FOR INSERT WITH CHECK (scanned_by = auth.uid());

CREATE POLICY "Managers can view asset RFID analytics" ON public.asset_rfid_tracking
    FOR SELECT USING (is_admin_or_manager());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role_active ON public.users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_projects_manager_department ON public.projects(project_manager_id, department);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_user_project ON public.staff_assignments(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_procurement_requests_status_role ON public.procurement_requests(status, requested_by);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_step_status ON public.workflow_instances(current_step, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_system_activities_user_action ON public.system_activities(user_id, action);

-- Create function to check if user has permission for specific action
CREATE OR REPLACE FUNCTION has_permission(action VARCHAR(100), resource VARCHAR(100))
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR(50);
    user_permissions TEXT[];
BEGIN
    user_role := get_current_user_role();
    
    -- Get user permissions
    SELECT permissions INTO user_permissions
    FROM public.users 
    WHERE id = auth.uid();
    
    -- Check if user has 'all' permission
    IF 'all' = ANY(user_permissions) THEN
        RETURN true;
    END IF;
    
    -- Check specific permissions based on role and action
    CASE user_role
        WHEN 'Admin' THEN
            RETURN true;
        WHEN 'Manager' THEN
            RETURN action IN ('view_all', 'approve_requests', 'analytics', 'manage_department');
        WHEN 'Project Manager' THEN
            RETURN action IN ('project_tracking', 'resource_assign', 'approve_project_requests');
        WHEN 'Employee' THEN
            RETURN action IN ('sws_module', 'rfid_scan', 'inventory_manage');
        WHEN 'Procurement Staff' THEN
            RETURN action IN ('psm_module', 'supplier_manage', 'purchase_orders');
        WHEN 'Maintenance Staff' THEN
            RETURN action IN ('alms_module', 'asset_tracking', 'maintenance_logs');
        WHEN 'Document Analyst' THEN
            RETURN action IN ('dtrs_module', 'document_upload', 'record_verify');
        ELSE
            RETURN false;
    END CASE;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    event_type VARCHAR(100),
    description TEXT,
    severity VARCHAR(20) DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id, action, resource, details, severity
    ) VALUES (
        auth.uid(), event_type, 'security', 
        jsonb_build_object('description', description), severity
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ language 'plpgsql' SECURITY DEFINER;
