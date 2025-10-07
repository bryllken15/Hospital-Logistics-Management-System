-- Seed Data for Initial Database Population
-- This migration populates the database with initial data for testing and development

-- Note: User creation should be done through Supabase Auth UI or API
-- This seed data creates sample data for testing, but users need to be created in auth.users first
-- For development, you can create users manually in the Supabase dashboard or use the auth API

-- Insert sample suppliers
INSERT INTO public.suppliers (name, contact_person, email, phone, address, rating, total_orders, is_active) VALUES
('MedSupply Co.', 'John Smith', 'john@medsupply.com', '+1-555-0123', '123 Medical St, Health City', 4.8, 45, true),
('HealthTech Solutions', 'Sarah Johnson', 'sarah@healthtech.com', '+1-555-0456', '456 Tech Ave, Innovation City', 4.6, 32, true),
('SafetyFirst Inc.', 'Mike Wilson', 'mike@safetyfirst.com', '+1-555-0789', '789 Safety Blvd, Secure City', 4.9, 28, true);

-- Insert sample projects (without user references for now)
INSERT INTO public.projects (name, description, status, progress, start_date, end_date, budget, spent, department) VALUES
('Emergency Ward Renovation', 'Complete renovation of emergency ward with new equipment', 'in_progress', 65, '2024-01-01', '2024-03-31', 150000.00, 97500.00, 'Emergency'),
('New ICU Equipment Setup', 'Installation and setup of new ICU monitoring equipment', 'planning', 20, '2024-02-01', '2024-04-30', 200000.00, 40000.00, 'ICU'),
('Pharmacy Automation System', 'Implementation of automated pharmacy management system', 'completed', 100, '2023-10-01', '2023-12-31', 80000.00, 78000.00, 'Pharmacy');

-- Insert sample inventory items
INSERT INTO public.inventory_items (name, description, category, quantity, min_quantity, location, rfid_code, status, cost_per_unit, supplier_id) VALUES
('Surgical Masks (Box of 50)', 'High-quality surgical masks', 'PPE', 45, 20, 'A-1-2', 'RFID-001-MASK', 'in_stock', 25.00, (SELECT id FROM public.suppliers WHERE name = 'MedSupply Co.')),
('IV Fluids - Normal Saline', 'Sterile normal saline solution', 'Medical Supplies', 12, 10, 'B-2-1', 'RFID-002-SALINE', 'low_stock', 3.00, (SELECT id FROM public.suppliers WHERE name = 'HealthTech Solutions')),
('Medical Gloves (Latex-free)', 'Sterile latex-free medical gloves', 'PPE', 78, 30, 'A-1-3', 'RFID-003-GLOVES', 'in_stock', 4.00, (SELECT id FROM public.suppliers WHERE name = 'SafetyFirst Inc.')),
('Bandages - Sterile', 'Sterile wound dressings', 'Medical Supplies', 5, 15, 'C-3-1', 'RFID-004-BANDAGES', 'out_of_stock', 2.50, (SELECT id FROM public.suppliers WHERE name = 'MedSupply Co.'));

-- Insert sample assets
INSERT INTO public.assets (name, description, tag_id, category, condition, location, department, purchase_date, warranty_expiry, cost, supplier_id, last_maintenance, next_maintenance) VALUES
('Ventilator - Model V200', 'Advanced patient ventilator', 'RFID-001-VENT', 'Medical Equipment', 'good', 'ICU Room 101', 'ICU', '2023-06-15', '2025-06-15', 45000.00, (SELECT id FROM public.suppliers WHERE name = 'HealthTech Solutions'), '2024-01-10', '2024-02-10'),
('X-Ray Machine - Model XR500', 'Digital X-ray imaging system', 'RFID-002-XRAY', 'Diagnostic Equipment', 'needs_repair', 'Radiology Department', 'Radiology', '2022-01-15', '2024-12-31', 125000.00, (SELECT id FROM public.suppliers WHERE name = 'MedSupply Co.'), '2023-12-15', '2024-01-25'),
('Patient Monitor - Model PM300', 'Multi-parameter patient monitor', 'RFID-003-MONITOR', 'Monitoring Equipment', 'good', 'Emergency Ward', 'Emergency', '2023-03-20', '2026-03-20', 8500.00, (SELECT id FROM public.suppliers WHERE name = 'HealthTech Solutions'), '2024-01-05', '2024-02-05');

-- Insert sample procurement requests (without user references for now)
INSERT INTO public.procurement_requests (item_name, item_description, quantity, unit_price, total_amount, priority, status, requested_date, department) VALUES
('Surgical Masks (Box of 50)', 'High-quality surgical masks for emergency ward', 100, 25.00, 2500.00, 'high', 'pending', '2024-01-15', 'Emergency'),
('IV Fluids - Normal Saline', 'Sterile normal saline solution', 500, 3.00, 1500.00, 'medium', 'pending', '2024-01-14', 'ICU'),
('Medical Gloves (Latex-free)', 'Sterile latex-free medical gloves', 200, 4.00, 800.00, 'high', 'approved', '2024-01-13', 'Emergency');

-- Insert sample purchase orders (without user references for now)
INSERT INTO public.purchase_orders (order_number, supplier_id, item_name, item_description, quantity, unit_price, total_amount, status, order_date, expected_delivery, rfid_code) VALUES
('PO-000001', (SELECT id FROM public.suppliers WHERE name = 'MedSupply Co.'), 'Surgical Masks (Box of 50)', 'High-quality surgical masks', 100, 25.00, 2500.00, 'pending', '2024-01-15', '2024-01-25', 'RFID-001-MASK'),
('PO-000002', (SELECT id FROM public.suppliers WHERE name = 'HealthTech Solutions'), 'IV Fluids - Normal Saline', 'Sterile normal saline solution', 500, 3.00, 1500.00, 'approved', '2024-01-14', '2024-01-22', 'RFID-002-SALINE'),
('PO-000003', (SELECT id FROM public.suppliers WHERE name = 'SafetyFirst Inc.'), 'Medical Gloves (Latex-free)', 'Sterile latex-free medical gloves', 200, 4.00, 800.00, 'delivered', '2024-01-10', '2024-01-20', 'RFID-003-GLOVES');

-- Insert sample documents (without user references for now)
INSERT INTO public.documents (name, document_type, category, description, status, uploaded_date, file_size, tags) VALUES
('Purchase Order - MedSupply Co. #PO-2024-001', 'Purchase Order', 'Procurement', 'Purchase order for surgical masks', 'verified', '2024-01-15', 2300000, ARRAY['medical supplies', 'ventilators', 'emergency']),
('Delivery Receipt - SafetyFirst Inc. #DR-2024-002', 'Delivery Receipt', 'Logistics', 'Delivery receipt for medical gloves', 'pending_verification', '2024-01-14', 1800000, ARRAY['ppe', 'gloves', 'delivery']),
('Maintenance Report - Ventilator V200 #MR-2024-003', 'Maintenance Report', 'Maintenance', 'Preventive maintenance report for ventilator', 'verified', '2024-01-13', 3100000, ARRAY['maintenance', 'ventilator', 'repair']);

-- Insert sample announcements (without user references for now)
INSERT INTO public.announcements (title, message, priority, is_active, expires_at) VALUES
('System Maintenance', 'Scheduled maintenance will occur tonight from 11 PM to 1 AM. Please save your work.', 'normal', true, NOW() + INTERVAL '7 days'),
('New Equipment Training', 'Training session for new ICU equipment will be held tomorrow at 2 PM in Conference Room A.', 'high', true, NOW() + INTERVAL '3 days');

-- Insert sample workflow templates (without user references for now)
INSERT INTO public.workflow_templates (name, description, workflow_type, template_data, is_default) VALUES
('Standard Procurement Workflow', 'Standard workflow for procurement requests', 'procurement', '{"steps": [{"name": "Manager Approval", "role": "Manager", "order": 1}, {"name": "Project Manager Approval", "role": "Project Manager", "order": 2}]}', true),
('Inventory Change Workflow', 'Workflow for inventory change requests', 'inventory', '{"steps": [{"name": "Manager Approval", "role": "Manager", "order": 1}, {"name": "Project Manager Approval", "role": "Project Manager", "order": 2}]}', true),
('Budget Proposal Workflow', 'Workflow for budget proposals', 'budget', '{"steps": [{"name": "Manager Review", "role": "Manager", "order": 1}, {"name": "Project Manager Approval", "role": "Project Manager", "order": 2}]}', true);

-- Insert sample system activities (without user references for now)
INSERT INTO public.system_activities (username, action, description, entity_type, created_at) VALUES
('admin', 'LOGIN', 'User logged in successfully', 'user', NOW() - INTERVAL '1 hour'),
('manager1', 'LOGIN', 'User logged in successfully', 'user', NOW() - INTERVAL '2 hours'),
('employee1', 'INVENTORY_UPDATE', 'Updated inventory item: Surgical Masks', 'inventory', NOW() - INTERVAL '30 minutes'),
('procurement1', 'PURCHASE_ORDER_CREATE', 'Created purchase order: PO-000001', 'procurement', NOW() - INTERVAL '1 hour'),
('project1', 'PROJECT_CREATE', 'Created project: Emergency Ward Renovation', 'project', NOW() - INTERVAL '3 hours');

-- Insert sample notifications (without user references for now)
INSERT INTO public.notifications (title, message, notification_type, related_entity_type, is_read, created_at) VALUES
('New Procurement Request', 'A new procurement request requires your approval', 'approval_request', 'procurement', false, NOW() - INTERVAL '1 hour'),
('Project Update', 'Emergency Ward Renovation project progress updated', 'workflow_update', 'project', false, NOW() - INTERVAL '2 hours'),
('Document Verification', 'New document requires verification', 'approval_request', 'document', false, NOW() - INTERVAL '30 minutes');