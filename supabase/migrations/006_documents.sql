-- Document Management and Verification Tables
-- This migration creates tables for document tracking and verification workflows

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL CHECK (document_type IN ('Purchase Order', 'Delivery Receipt', 'Invoice', 'Maintenance Report', 'Contract', 'Certificate', 'Budget Proposal', 'Project Report')),
    category VARCHAR(100) NOT NULL CHECK (category IN ('Procurement', 'Logistics', 'Maintenance', 'Financial', 'Compliance', 'Project')),
    description TEXT,
    file_path VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'rejected', 'archived')),
    uploaded_by UUID REFERENCES public.users(id),
    uploaded_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_by UUID REFERENCES public.users(id),
    verified_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document verification queue
CREATE TABLE IF NOT EXISTS public.verification_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to UUID REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery receipts
CREATE TABLE IF NOT EXISTS public.delivery_receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id),
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(15,2),
    delivery_date DATE NOT NULL,
    received_by UUID REFERENCES public.users(id),
    verified_by UUID REFERENCES public.users(id),
    verified_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'rejected')),
    file_path VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget proposals and tracking
CREATE TABLE IF NOT EXISTS public.budget_proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(15,2) NOT NULL,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    submitted_by UUID REFERENCES public.users(id),
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_date TIMESTAMP WITH TIME ZONE,
    approval_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document categories and types
CREATE TABLE IF NOT EXISTS public.document_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category_id UUID REFERENCES public.document_categories(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document access logs
CREATE TABLE IF NOT EXISTS public.document_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('view', 'download', 'edit', 'verify', 'archive')),
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_verification_queue_status ON public.verification_queue(status);
CREATE INDEX IF NOT EXISTS idx_verification_queue_assigned ON public.verification_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_delivery_receipts_supplier ON public.delivery_receipts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_delivery_receipts_status ON public.delivery_receipts(status);
CREATE INDEX IF NOT EXISTS idx_budget_proposals_project ON public.budget_proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_proposals_status ON public.budget_proposals(status);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_document ON public.document_access_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_user ON public.document_access_logs(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON public.documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_queue_updated_at 
    BEFORE UPDATE ON public.verification_queue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_receipts_updated_at 
    BEFORE UPDATE ON public.delivery_receipts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_proposals_updated_at 
    BEFORE UPDATE ON public.budget_proposals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
