-- Inventory and RFID Tracking Tables
-- This migration creates tables for inventory management and RFID tracking

-- Inventory items
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER,
    unit VARCHAR(50) DEFAULT 'pieces',
    location VARCHAR(255),
    rfid_code VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'reserved', 'maintenance')),
    cost_per_unit DECIMAL(10,2),
    supplier_id UUID REFERENCES public.suppliers(id),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory movements (in/out transactions)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'transfer', 'adjustment')),
    quantity INTEGER NOT NULL,
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    reason VARCHAR(255),
    reference_number VARCHAR(100),
    performed_by UUID REFERENCES public.users(id),
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Deliveries tracking
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    quantity INTEGER NOT NULL,
    destination VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_transit', 'delivered', 'cancelled')),
    delivery_date DATE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    rfid_code VARCHAR(100),
    tracking_number VARCHAR(100),
    delivered_by UUID REFERENCES public.users(id),
    received_by UUID REFERENCES public.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFID tracking logs
CREATE TABLE IF NOT EXISTS public.rfid_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rfid_code VARCHAR(100) NOT NULL,
    item_id UUID REFERENCES public.inventory_items(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('scan', 'check_in', 'check_out', 'transfer', 'maintenance')),
    location VARCHAR(255),
    scanned_by UUID REFERENCES public.users(id),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Inventory alerts (low stock, expiry, etc.)
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiry', 'maintenance_due', 'overstock')),
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospital announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON public.inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_rfid ON public.inventory_items(rfid_code);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item ON public.inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON public.inventory_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON public.deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_rfid_tracking_code ON public.rfid_tracking(rfid_code);
CREATE INDEX IF NOT EXISTS idx_rfid_tracking_date ON public.rfid_tracking(scanned_at);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_item ON public.inventory_alerts(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_resolved ON public.inventory_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active);

-- Triggers for updated_at
CREATE TRIGGER update_inventory_items_updated_at 
    BEFORE UPDATE ON public.inventory_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at 
    BEFORE UPDATE ON public.deliveries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update inventory quantity based on movements
CREATE OR REPLACE FUNCTION update_inventory_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.movement_type = 'in' THEN
            UPDATE public.inventory_items 
            SET quantity = quantity + NEW.quantity,
                last_updated = NOW()
            WHERE id = NEW.item_id;
        ELSIF NEW.movement_type = 'out' THEN
            UPDATE public.inventory_items 
            SET quantity = quantity - NEW.quantity,
                last_updated = NOW()
            WHERE id = NEW.item_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update inventory quantities
CREATE TRIGGER update_inventory_on_movement 
    AFTER INSERT ON public.inventory_movements 
    FOR EACH ROW EXECUTE FUNCTION update_inventory_quantity();
