-- Asset and Maintenance Management Tables
-- This migration creates tables for asset lifecycle and maintenance tracking

-- Assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tag_id VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    condition VARCHAR(50) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'critical', 'needs_repair')),
    location VARCHAR(255),
    department VARCHAR(100),
    purchase_date DATE,
    warranty_expiry DATE,
    cost DECIMAL(15,2),
    supplier_id UUID REFERENCES public.suppliers(id),
    last_maintenance DATE,
    next_maintenance DATE,
    maintenance_interval INTEGER DEFAULT 30, -- days
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance logs
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('preventive', 'repair', 'emergency', 'inspection', 'calibration')),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    performed_by UUID REFERENCES public.users(id),
    scheduled_date DATE,
    start_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    duration_hours DECIMAL(5,2),
    cost DECIMAL(10,2) DEFAULT 0,
    parts_used TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled maintenance
CREATE TABLE IF NOT EXISTS public.scheduled_maintenance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    estimated_duration INTEGER, -- hours
    assigned_to UUID REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset maintenance history
CREATE TABLE IF NOT EXISTS public.asset_maintenance_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    maintenance_log_id UUID REFERENCES public.maintenance_logs(id),
    action VARCHAR(100) NOT NULL,
    performed_by UUID REFERENCES public.users(id),
    action_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Maintenance alerts
CREATE TABLE IF NOT EXISTS public.maintenance_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('maintenance_due', 'warranty_expiring', 'condition_critical', 'overdue_maintenance')),
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset RFID tracking
CREATE TABLE IF NOT EXISTS public.asset_rfid_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    rfid_code VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('scan', 'check_in', 'check_out', 'maintenance', 'transfer')),
    location VARCHAR(255),
    scanned_by UUID REFERENCES public.users(id),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_condition ON public.assets(condition);
CREATE INDEX IF NOT EXISTS idx_assets_location ON public.assets(location);
CREATE INDEX IF NOT EXISTS idx_assets_tag_id ON public.assets(tag_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_asset ON public.maintenance_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_status ON public.maintenance_logs(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_type ON public.maintenance_logs(maintenance_type);
CREATE INDEX IF NOT EXISTS idx_scheduled_maintenance_asset ON public.scheduled_maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_maintenance_date ON public.scheduled_maintenance(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_asset ON public.maintenance_alerts(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_resolved ON public.maintenance_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_asset_rfid_tracking_asset ON public.asset_rfid_tracking(asset_id);

-- Triggers for updated_at
CREATE TRIGGER update_assets_updated_at 
    BEFORE UPDATE ON public.assets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_logs_updated_at 
    BEFORE UPDATE ON public.maintenance_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_maintenance_updated_at 
    BEFORE UPDATE ON public.scheduled_maintenance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update asset condition based on maintenance
CREATE OR REPLACE FUNCTION update_asset_condition()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update asset's last maintenance date
        UPDATE public.assets 
        SET last_maintenance = NEW.completion_date,
            next_maintenance = NEW.completion_date + INTERVAL '1 day' * (
                SELECT maintenance_interval FROM public.assets WHERE id = NEW.asset_id
            )
        WHERE id = NEW.asset_id;
        
        -- Update asset condition based on maintenance type
        IF NEW.maintenance_type = 'repair' THEN
            UPDATE public.assets 
            SET condition = 'good'
            WHERE id = NEW.asset_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update asset condition after maintenance completion
CREATE TRIGGER update_asset_after_maintenance 
    AFTER UPDATE ON public.maintenance_logs 
    FOR EACH ROW EXECUTE FUNCTION update_asset_condition();
