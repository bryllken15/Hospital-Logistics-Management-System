import { db } from './supabaseClient';

// Document management service
export class DocumentService {
  // Get all documents
  async getAllDocuments(filters = {}) {
    const options = {
      columns: `
        id, name, document_type, category, description, file_path, file_size, 
        file_type, status, uploaded_by, uploaded_date, verified_by, verified_date, 
        rejection_reason, tags, is_active, created_at, updated_at,
        uploader:users!uploaded_by(full_name, username),
        verifier:users!verified_by(full_name, username)
      `,
      orderBy: { column: 'uploaded_date', ascending: false },
      ...filters
    };
    
    return await db.query('documents', 'select', options);
  }

  // Get document by ID
  async getDocumentById(documentId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: documentId }],
      limit: 1
    };
    
    const result = await db.query('documents', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create document
  async createDocument(documentData) {
    const options = {
      data: {
        ...documentData,
        uploaded_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('documents', 'insert', options);
  }

  // Update document
  async updateDocument(documentId, updateData) {
    const options = {
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: documentId }]
    };
    
    return await db.query('documents', 'update', options);
  }

  // Verify document
  async verifyDocument(documentId, verifiedBy, status, rejectionReason = null) {
    const updateData = {
      status,
      verified_by: verifiedBy,
      verified_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }
    
    const options = {
      data: updateData,
      filters: [{ column: 'id', operator: 'eq', value: documentId }]
    };
    
    return await db.query('documents', 'update', options);
  }

  // Archive document
  async archiveDocument(documentId) {
    return await this.updateDocument(documentId, { status: 'archived' });
  }

  // Get documents by status
  async getDocumentsByStatus(status) {
    const options = {
      filters: [{ column: 'status', operator: 'eq', value: status }],
      orderBy: { column: 'uploaded_date', ascending: false }
    };
    
    return await db.query('documents', 'select', options);
  }

  // Get documents by type
  async getDocumentsByType(documentType) {
    const options = {
      filters: [{ column: 'document_type', operator: 'eq', value: documentType }],
      orderBy: { column: 'uploaded_date', ascending: false }
    };
    
    return await db.query('documents', 'select', options);
  }

  // Get documents by category
  async getDocumentsByCategory(category) {
    const options = {
      filters: [{ column: 'category', operator: 'eq', value: category }],
      orderBy: { column: 'uploaded_date', ascending: false }
    };
    
    return await db.query('documents', 'select', options);
  }

  // Verification queue
  async getVerificationQueue() {
    const options = {
      columns: `
        id, document_id, priority, assigned_to, status, created_at, updated_at,
        document:documents!document_id(name, document_type, uploaded_by, uploaded_date),
        assignee:users!assigned_to(full_name, username)
      `,
      filters: [{ column: 'status', operator: 'eq', value: 'pending' }],
      orderBy: { column: 'priority', ascending: false }
    };
    
    return await db.query('verification_queue', 'select', options);
  }

  // Add to verification queue
  async addToVerificationQueue(documentId, priority = 'medium', assignedTo = null) {
    const options = {
      data: {
        document_id: documentId,
        priority,
        assigned_to: assignedTo,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('verification_queue', 'insert', options);
  }

  // Update verification queue
  async updateVerificationQueue(queueId, updateData) {
    const options = {
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: queueId }]
    };
    
    return await db.query('verification_queue', 'update', options);
  }

  // Delivery receipts
  async getAllDeliveryReceipts(filters = {}) {
    const options = {
      columns: `
        id, receipt_number, supplier_id, item_name, item_description, 
        quantity, unit_price, total_amount, delivery_date, received_by, 
        verified_by, verified_date, status, file_path, notes, created_at, updated_at,
        supplier:suppliers!supplier_id(name, contact_person),
        receiver:users!received_by(full_name, username),
        verifier:users!verified_by(full_name, username)
      `,
      orderBy: { column: 'delivery_date', ascending: false },
      ...filters
    };
    
    return await db.query('delivery_receipts', 'select', options);
  }

  // Get delivery receipt by ID
  async getDeliveryReceiptById(receiptId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: receiptId }],
      limit: 1
    };
    
    const result = await db.query('delivery_receipts', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create delivery receipt
  async createDeliveryReceipt(receiptData) {
    const options = {
      data: {
        ...receiptData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('delivery_receipts', 'insert', options);
  }

  // Verify delivery receipt
  async verifyDeliveryReceipt(receiptId, verifiedBy) {
    const options = {
      data: {
        status: 'verified',
        verified_by: verifiedBy,
        verified_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: receiptId }]
    };
    
    return await db.query('delivery_receipts', 'update', options);
  }

  // Budget proposals
  async getAllBudgetProposals(filters = {}) {
    const options = {
      columns: `
        id, project_id, title, description, total_amount, category, status, 
        submitted_by, submitted_date, reviewed_by, reviewed_date, approval_notes, 
        created_at, updated_at,
        project:projects!project_id(name, department),
        submitter:users!submitted_by(full_name, username),
        reviewer:users!reviewed_by(full_name, username)
      `,
      orderBy: { column: 'submitted_date', ascending: false },
      ...filters
    };
    
    return await db.query('budget_proposals', 'select', options);
  }

  // Get budget proposal by ID
  async getBudgetProposalById(proposalId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: proposalId }],
      limit: 1
    };
    
    const result = await db.query('budget_proposals', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create budget proposal
  async createBudgetProposal(proposalData) {
    const options = {
      data: {
        ...proposalData,
        submitted_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('budget_proposals', 'insert', options);
  }

  // Review budget proposal
  async reviewBudgetProposal(proposalId, reviewedBy, status, approvalNotes = null) {
    const options = {
      data: {
        status,
        reviewed_by: reviewedBy,
        reviewed_date: new Date().toISOString(),
        approval_notes: approvalNotes,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: proposalId }]
    };
    
    return await db.query('budget_proposals', 'update', options);
  }

  // Get document statistics
  async getDocumentStats() {
    try {
      const [totalDocuments, verifiedDocuments, pendingVerification, archivedDocuments] = await Promise.all([
        db.query('documents', 'select', { columns: 'count' }),
        db.query('documents', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'verified' }],
          columns: 'count'
        }),
        db.query('documents', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'pending_verification' }],
          columns: 'count'
        }),
        db.query('documents', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'archived' }],
          columns: 'count'
        })
      ]);

      return {
        data: {
          totalDocuments: totalDocuments.data?.length || 0,
          verifiedDocuments: verifiedDocuments.data?.length || 0,
          pendingVerification: pendingVerification.data?.length || 0,
          archivedDocuments: archivedDocuments.data?.length || 0
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Get document category data for charts
  async getDocumentCategoryData() {
    const options = {
      columns: 'category, document_type, uploaded_date',
      orderBy: { column: 'uploaded_date', ascending: true }
    };
    
    return await db.query('documents', 'select', options);
  }

  // Subscribe to documents
  subscribeToDocuments(callback) {
    return db.subscribe('documents', callback);
  }

  // Subscribe to verification queue
  subscribeToVerificationQueue(callback) {
    return db.subscribe('verification_queue', callback);
  }

  // Subscribe to delivery receipts
  subscribeToDeliveryReceipts(callback) {
    return db.subscribe('delivery_receipts', callback);
  }
}

export const documentService = new DocumentService();
export default documentService;
