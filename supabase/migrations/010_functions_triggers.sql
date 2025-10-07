-- Database Functions and Triggers
-- This migration creates essential database functions and triggers for automation

-- Function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get the current counter value
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'PO-(\d+)') AS INTEGER)), 0) + 1
    INTO counter
    FROM public.purchase_orders
    WHERE order_number LIKE 'PO-%';
    
    -- Format the new number
    new_number := 'PO-' || LPAD(counter::TEXT, 6, '0');
    
    RETURN new_number;
END;
$$ language 'plpgsql';

-- Function to generate unique receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get the current counter value
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 'DR-(\d+)') AS INTEGER)), 0) + 1
    INTO counter
    FROM public.delivery_receipts
    WHERE receipt_number LIKE 'DR-%';
    
    -- Format the new number
    new_number := 'DR-' || LPAD(counter::TEXT, 6, '0');
    
    RETURN new_number;
END;
$$ language 'plpgsql';

-- Function to check inventory levels and create alerts
CREATE OR REPLACE FUNCTION check_inventory_levels()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if quantity is below minimum threshold
    IF NEW.quantity <= NEW.min_quantity THEN
        INSERT INTO public.inventory_alerts (
            item_id, 
            alert_type, 
            message, 
            priority
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.quantity = 0 THEN 'out_of_stock'
                ELSE 'low_stock'
            END,
            CASE 
                WHEN NEW.quantity = 0 THEN 'Item is out of stock'
                ELSE 'Item quantity is below minimum threshold'
            END,
            CASE 
                WHEN NEW.quantity = 0 THEN 'critical'
                ELSE 'high'
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check maintenance due dates
CREATE OR REPLACE FUNCTION check_maintenance_due()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if maintenance is due
    IF NEW.next_maintenance <= CURRENT_DATE THEN
        INSERT INTO public.maintenance_alerts (
            asset_id,
            alert_type,
            message,
            priority
        ) VALUES (
            NEW.id,
            'maintenance_due',
            'Maintenance is due for this asset',
            'high'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically assign workflow steps
CREATE OR REPLACE FUNCTION assign_workflow_step()
RETURNS TRIGGER AS $$
DECLARE
    step_record RECORD;
BEGIN
    -- Get the first step for this workflow
    SELECT * INTO step_record
    FROM public.workflow_steps
    WHERE workflow_id = NEW.workflow_id
    ORDER BY step_order
    LIMIT 1;
    
    IF FOUND THEN
        -- Create the first approval step
        INSERT INTO public.workflow_approvals (
            workflow_instance_id,
            step_id,
            step_order,
            approval_status
        ) VALUES (
            NEW.id,
            step_record.id,
            step_record.step_order,
            'pending'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to send notifications
CREATE OR REPLACE FUNCTION send_notification(
    p_user_id UUID,
    p_title VARCHAR(255),
    p_message TEXT,
    p_type VARCHAR(50),
    p_entity_type VARCHAR(100) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id, title, message, notification_type, related_entity_type, related_entity_id
    ) VALUES (
        p_user_id, p_title, p_message, p_type, p_entity_type, p_entity_id
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ language 'plpgsql';

-- Function to log user activities
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_action VARCHAR(100),
    p_description TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.user_activities (
        user_id, action, description, ip_address, user_agent
    ) VALUES (
        p_user_id, p_action, p_description, p_ip_address, p_user_agent
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ language 'plpgsql';

-- Function to update user last login
CREATE OR REPLACE FUNCTION update_last_login(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET last_login = NOW()
    WHERE id = p_user_id;
END;
$$ language 'plpgsql';

-- Function to calculate project progress
CREATE OR REPLACE FUNCTION calculate_project_progress(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    progress_percentage INTEGER;
BEGIN
    -- Count total tasks
    SELECT COUNT(*) INTO total_tasks
    FROM public.project_tasks
    WHERE project_id = p_project_id;
    
    -- Count completed tasks
    SELECT COUNT(*) INTO completed_tasks
    FROM public.project_tasks
    WHERE project_id = p_project_id AND status = 'completed';
    
    -- Calculate percentage
    IF total_tasks > 0 THEN
        progress_percentage := (completed_tasks * 100) / total_tasks;
    ELSE
        progress_percentage := 0;
    END IF;
    
    -- Update project progress
    UPDATE public.projects
    SET progress = progress_percentage
    WHERE id = p_project_id;
    
    RETURN progress_percentage;
END;
$$ language 'plpgsql';

-- Triggers for automatic order number generation
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_purchase_order_number
    BEFORE INSERT ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Triggers for automatic receipt number generation
CREATE OR REPLACE FUNCTION set_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_number IS NULL OR NEW.receipt_number = '' THEN
        NEW.receipt_number := generate_receipt_number();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_delivery_receipt_number
    BEFORE INSERT ON public.delivery_receipts
    FOR EACH ROW EXECUTE FUNCTION set_receipt_number();

-- Triggers for inventory level checking
CREATE TRIGGER check_inventory_levels_trigger
    AFTER UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION check_inventory_levels();

-- Triggers for maintenance due checking
CREATE TRIGGER check_maintenance_due_trigger
    AFTER UPDATE ON public.assets
    FOR EACH ROW EXECUTE FUNCTION check_maintenance_due();

-- Triggers for workflow step assignment
CREATE TRIGGER assign_workflow_step_trigger
    AFTER INSERT ON public.workflow_instances
    FOR EACH ROW EXECUTE FUNCTION assign_workflow_step();

-- Function to handle project progress calculation trigger
CREATE OR REPLACE FUNCTION calculate_project_progress_trigger()
RETURNS TRIGGER AS $$
DECLARE
    project_id_to_update UUID;
BEGIN
    -- Get the project_id from NEW or OLD record
    project_id_to_update := COALESCE(NEW.project_id, OLD.project_id);
    
    -- Only proceed if we have a valid project_id
    IF project_id_to_update IS NOT NULL THEN
        PERFORM calculate_project_progress(project_id_to_update);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers for project progress calculation
CREATE TRIGGER calculate_project_progress_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.project_tasks
    FOR EACH ROW EXECUTE FUNCTION calculate_project_progress_trigger();

-- Function to clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_sessions
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Function to clean up old activities (keep last 1000 per user)
CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH user_activity_counts AS (
        SELECT user_id, COUNT(*) as activity_count
        FROM public.user_activities
        GROUP BY user_id
        HAVING COUNT(*) > 1000
    ),
    activities_to_delete AS (
        SELECT ua.id
        FROM public.user_activities ua
        JOIN user_activity_counts uac ON ua.user_id = uac.user_id
        WHERE ua.created_at < (
            SELECT created_at
            FROM public.user_activities
            WHERE user_id = ua.user_id
            ORDER BY created_at DESC
            LIMIT 1 OFFSET 1000
        )
    )
    DELETE FROM public.user_activities
    WHERE id IN (SELECT id FROM activities_to_delete);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Function to update supplier ratings
CREATE OR REPLACE FUNCTION update_supplier_rating(p_supplier_id UUID)
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    total_orders INTEGER;
BEGIN
    -- Calculate average rating
    SELECT AVG(rating) INTO avg_rating
    FROM public.supplier_ratings
    WHERE supplier_id = p_supplier_id;
    
    -- Count total orders
    SELECT COUNT(*) INTO total_orders
    FROM public.purchase_orders
    WHERE supplier_id = p_supplier_id;
    
    -- Update supplier
    UPDATE public.suppliers
    SET rating = COALESCE(avg_rating, 0),
        total_orders = total_orders,
        last_order_date = (
            SELECT MAX(order_date)
            FROM public.purchase_orders
            WHERE supplier_id = p_supplier_id
        )
    WHERE id = p_supplier_id;
END;
$$ language 'plpgsql';

-- Trigger to update supplier ratings when new ratings are added
CREATE OR REPLACE FUNCTION update_supplier_rating_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_supplier_rating(NEW.supplier_id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_supplier_rating_after_rating
    AFTER INSERT OR UPDATE ON public.supplier_ratings
    FOR EACH ROW EXECUTE FUNCTION update_supplier_rating_trigger();
