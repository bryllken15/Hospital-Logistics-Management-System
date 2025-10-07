-- Workflow and Approval System Tables
-- This migration creates tables for multi-level approval workflows

-- Workflow definitions
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(100) NOT NULL CHECK (workflow_type IN ('procurement', 'inventory', 'maintenance', 'project', 'document', 'budget')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow steps (approval levels)
CREATE TABLE IF NOT EXISTS public.workflow_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    step_name VARCHAR(255) NOT NULL,
    step_order INTEGER NOT NULL,
    required_role VARCHAR(100),
    required_user_id UUID REFERENCES public.users(id),
    is_required BOOLEAN DEFAULT true,
    auto_approve_condition TEXT, -- JSON condition for auto-approval
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow instances (actual approval requests)
CREATE TABLE IF NOT EXISTS public.workflow_instances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID REFERENCES public.workflows(id),
    request_type VARCHAR(100) NOT NULL,
    request_id UUID, -- References the actual request (procurement, inventory, etc.)
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'cancelled')),
    current_step INTEGER DEFAULT 1,
    initiated_by UUID REFERENCES public.users(id),
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_steps INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow step approvals
CREATE TABLE IF NOT EXISTS public.workflow_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_instance_id UUID REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
    step_id UUID REFERENCES public.workflow_steps(id),
    step_order INTEGER NOT NULL,
    approved_by UUID REFERENCES public.users(id),
    approval_status VARCHAR(50) NOT NULL CHECK (approval_status IN ('pending', 'approved', 'rejected', 'skipped')),
    approval_notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval requests (specific request types)
CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_type VARCHAR(100) NOT NULL CHECK (request_type IN ('inventory_change', 'procurement_request', 'budget_proposal', 'maintenance_request', 'project_change')),
    request_data JSONB NOT NULL, -- Flexible data storage for different request types
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'manager_approved', 'project_manager_approved', 'approved', 'rejected')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    requested_by UUID REFERENCES public.users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    manager_approved_by UUID REFERENCES public.users(id),
    manager_approved_at TIMESTAMP WITH TIME ZONE,
    project_manager_approved_by UUID REFERENCES public.users(id),
    project_manager_approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification system
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('approval_request', 'approval_decision', 'workflow_update', 'system_alert', 'reminder')),
    is_read BOOLEAN DEFAULT false,
    is_urgent BOOLEAN DEFAULT false,
    related_entity_type VARCHAR(100), -- 'workflow', 'procurement', 'project', etc.
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Workflow templates for common processes
CREATE TABLE IF NOT EXISTS public.workflow_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(100) NOT NULL,
    template_data JSONB NOT NULL, -- JSON structure of the workflow
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflows_type ON public.workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON public.workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON public.workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_order ON public.workflow_steps(step_order);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON public.workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_type ON public.workflow_instances(request_type);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_initiated_by ON public.workflow_instances(initiated_by);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_instance ON public.workflow_approvals(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_status ON public.workflow_approvals(approval_status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_type ON public.approval_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON public.approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by ON public.approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(notification_type);

-- Triggers for updated_at
CREATE TRIGGER update_workflows_updated_at 
    BEFORE UPDATE ON public.workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at 
    BEFORE UPDATE ON public.workflow_instances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_requests_updated_at 
    BEFORE UPDATE ON public.approval_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to advance workflow to next step
CREATE OR REPLACE FUNCTION advance_workflow_step()
RETURNS TRIGGER AS $$
DECLARE
    total_steps INTEGER;
    next_step INTEGER;
BEGIN
    -- Get total steps for this workflow
    SELECT COUNT(*) INTO total_steps 
    FROM public.workflow_steps 
    WHERE workflow_id = NEW.workflow_id;
    
    -- Update workflow instance with total steps
    UPDATE public.workflow_instances 
    SET total_steps = total_steps
    WHERE id = NEW.workflow_instance_id;
    
    -- If this step is approved, check if we can advance
    IF NEW.approval_status = 'approved' THEN
        next_step := NEW.step_order + 1;
        
        -- Check if there are more steps
        IF next_step <= total_steps THEN
            -- Create next step approval
            INSERT INTO public.workflow_approvals (
                workflow_instance_id, 
                step_id, 
                step_order, 
                approval_status
            )
            SELECT 
                NEW.workflow_instance_id,
                ws.id,
                ws.step_order,
                'pending'
            FROM public.workflow_steps ws
            WHERE ws.workflow_id = (SELECT workflow_id FROM public.workflow_instances WHERE id = NEW.workflow_instance_id)
            AND ws.step_order = next_step;
            
            -- Update current step
            UPDATE public.workflow_instances 
            SET current_step = next_step
            WHERE id = NEW.workflow_instance_id;
        ELSE
            -- Workflow completed
            UPDATE public.workflow_instances 
            SET status = 'approved',
                completed_at = NOW()
            WHERE id = NEW.workflow_instance_id;
        END IF;
    ELSIF NEW.approval_status = 'rejected' THEN
        -- Workflow rejected
        UPDATE public.workflow_instances 
        SET status = 'rejected',
            completed_at = NOW()
        WHERE id = NEW.workflow_instance_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to advance workflow steps
CREATE TRIGGER advance_workflow_trigger 
    AFTER UPDATE ON public.workflow_approvals 
    FOR EACH ROW EXECUTE FUNCTION advance_workflow_step();
