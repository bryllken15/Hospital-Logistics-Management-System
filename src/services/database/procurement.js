import { db } from './supabaseClient';

// Procurement service
export class ProcurementService {
  // Get all procurement requests
  async getAllRequests(filters = {}) {
    const options = {
      columns: `
        id, item_name, item_description, quantity, unit_price, total_amount, 
        priority, status, requested_by, requested_date, approved_by, approved_date, 
        rejection_reason, department, created_at, updated_at,
        requester:users!requested_by(full_name, username),
        approver:users!approved_by(full_name, username)
      `,
      orderBy: { column: 'requested_date', ascending: false },
      ...filters
    };
    
    return await db.query('procurement_requests', 'select', options);
  }

  // Get request by ID
  async getRequestById(requestId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: requestId }],
      limit: 1
    };
    
    const result = await db.query('procurement_requests', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create procurement request
  async createRequest(requestData) {
    const options = {
      data: {
        ...requestData,
        requested_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('procurement_requests', 'insert', options);
  }

  // Approve/reject request
  async updateRequestStatus(requestId, status, approvedBy, rejectionReason = null) {
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'approved') {
      updateData.approved_by = approvedBy;
      updateData.approved_date = new Date().toISOString().split('T')[0];
    } else if (status === 'rejected') {
      updateData.rejection_reason = rejectionReason;
    }
    
    const options = {
      data: updateData,
      filters: [{ column: 'id', operator: 'eq', value: requestId }]
    };
    
    return await db.query('procurement_requests', 'update', options);
  }

  // Get requests by status
  async getRequestsByStatus(status) {
    const options = {
      filters: [{ column: 'status', operator: 'eq', value: status }],
      orderBy: { column: 'requested_date', ascending: false }
    };
    
    return await db.query('procurement_requests', 'select', options);
  }

  // Get requests by user
  async getRequestsByUser(userId) {
    const options = {
      filters: [{ column: 'requested_by', operator: 'eq', value: userId }],
      orderBy: { column: 'requested_date', ascending: false }
    };
    
    return await db.query('procurement_requests', 'select', options);
  }

  // Purchase orders
  async getAllPurchaseOrders(filters = {}) {
    const options = {
      columns: `
        id, order_number, supplier_id, item_name, item_description, quantity, 
        unit_price, total_amount, status, order_date, expected_delivery, 
        actual_delivery, rfid_code, tracking_number, created_by, approved_by, 
        approved_date, created_at, updated_at,
        supplier:suppliers!supplier_id(name, contact_person, email),
        creator:users!created_by(full_name, username),
        approver:users!approved_by(full_name, username)
      `,
      orderBy: { column: 'order_date', ascending: false },
      ...filters
    };
    
    return await db.query('purchase_orders', 'select', options);
  }

  // Get purchase order by ID
  async getPurchaseOrderById(orderId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: orderId }],
      limit: 1
    };
    
    const result = await db.query('purchase_orders', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create purchase order
  async createPurchaseOrder(orderData) {
    const options = {
      data: {
        ...orderData,
        order_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('purchase_orders', 'insert', options);
  }

  // Update purchase order status
  async updateOrderStatus(orderId, status) {
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'delivered') {
      updateData.actual_delivery = new Date().toISOString();
    }
    
    const options = {
      data: updateData,
      filters: [{ column: 'id', operator: 'eq', value: orderId }]
    };
    
    return await db.query('purchase_orders', 'update', options);
  }

  // Get orders by status
  async getOrdersByStatus(status) {
    const options = {
      filters: [{ column: 'status', operator: 'eq', value: status }],
      orderBy: { column: 'order_date', ascending: false }
    };
    
    return await db.query('purchase_orders', 'select', options);
  }

  // Suppliers
  async getAllSuppliers(filters = {}) {
    const options = {
      columns: 'id, name, contact_person, email, phone, address, rating, total_orders, last_order_date, is_active, created_at, updated_at',
      orderBy: { column: 'name', ascending: true },
      ...filters
    };
    
    return await db.query('suppliers', 'select', options);
  }

  // Get supplier by ID
  async getSupplierById(supplierId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: supplierId }],
      limit: 1
    };
    
    const result = await db.query('suppliers', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create supplier
  async createSupplier(supplierData) {
    const options = {
      data: {
        ...supplierData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('suppliers', 'insert', options);
  }

  // Update supplier
  async updateSupplier(supplierId, updateData) {
    const options = {
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: supplierId }]
    };
    
    return await db.query('suppliers', 'update', options);
  }

  // Get active suppliers
  async getActiveSuppliers() {
    const options = {
      filters: [{ column: 'is_active', operator: 'eq', value: true }],
      orderBy: { column: 'name', ascending: true }
    };
    
    return await db.query('suppliers', 'select', options);
  }

  // Get procurement statistics
  async getProcurementStats() {
    try {
      const [totalRequests, pendingRequests, approvedRequests, totalOrders, pendingOrders, deliveredOrders] = await Promise.all([
        db.query('procurement_requests', 'select', { columns: 'count' }),
        db.query('procurement_requests', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'pending' }],
          columns: 'count'
        }),
        db.query('procurement_requests', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'approved' }],
          columns: 'count'
        }),
        db.query('purchase_orders', 'select', { columns: 'count' }),
        db.query('purchase_orders', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'pending' }],
          columns: 'count'
        }),
        db.query('purchase_orders', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'delivered' }],
          columns: 'count'
        })
      ]);

      return {
        data: {
          totalRequests: totalRequests.data?.length || 0,
          pendingRequests: pendingRequests.data?.length || 0,
          approvedRequests: approvedRequests.data?.length || 0,
          totalOrders: totalOrders.data?.length || 0,
          pendingOrders: pendingOrders.data?.length || 0,
          deliveredOrders: deliveredOrders.data?.length || 0
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Get spending data for charts
  async getSpendingData() {
    const options = {
      columns: 'order_date, total_amount, status',
      orderBy: { column: 'order_date', ascending: true }
    };
    
    return await db.query('purchase_orders', 'select', options);
  }

  // Get order status data for charts
  async getOrderStatusData() {
    const options = {
      columns: 'status, count(*)',
      orderBy: { column: 'status', ascending: true }
    };
    
    return await db.query('purchase_orders', 'select', options);
  }

  // Subscribe to procurement requests
  subscribeToRequests(callback) {
    return db.subscribe('procurement_requests', callback);
  }

  // Subscribe to purchase orders
  subscribeToOrders(callback) {
    return db.subscribe('purchase_orders', callback);
  }

  // Subscribe to suppliers
  subscribeToSuppliers(callback) {
    return db.subscribe('suppliers', callback);
  }

  // Purchase Order Items
  async getPurchaseOrderItems(orderId) {
    const options = {
      filters: [{ column: 'purchase_order_id', operator: 'eq', value: orderId }],
      orderBy: { column: 'created_at', ascending: true }
    };
    
    return await db.query('purchase_order_items', 'select', options);
  }

  async createPurchaseOrderItem(itemData) {
    const options = {
      data: {
        ...itemData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('purchase_order_items', 'insert', options);
  }

  async updatePurchaseOrderItem(itemId, updateData) {
    const options = {
      data: updateData,
      filters: [{ column: 'id', operator: 'eq', value: itemId }]
    };
    
    return await db.query('purchase_order_items', 'update', options);
  }

  async deletePurchaseOrderItem(itemId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: itemId }]
    };
    
    return await db.query('purchase_order_items', 'delete', options);
  }

  // Supplier Ratings
  async getSupplierRatings(supplierId) {
    const options = {
      filters: [{ column: 'supplier_id', operator: 'eq', value: supplierId }],
      columns: `
        id, rating, review, rated_by, created_at,
        rater:users!rated_by(full_name, username)
      `,
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('supplier_ratings', 'select', options);
  }

  async rateSupplier(ratingData) {
    const options = {
      data: {
        ...ratingData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('supplier_ratings', 'insert', options);
  }

  async updateSupplierRating(ratingId, updateData) {
    const options = {
      data: updateData,
      filters: [{ column: 'id', operator: 'eq', value: ratingId }]
    };
    
    return await db.query('supplier_ratings', 'update', options);
  }

  async deleteSupplierRating(ratingId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: ratingId }]
    };
    
    return await db.query('supplier_ratings', 'delete', options);
  }

  // Update supplier rating average
  async updateSupplierRatingAverage(supplierId) {
    try {
      const ratingsResult = await this.getSupplierRatings(supplierId);
      if (ratingsResult.data && ratingsResult.data.length > 0) {
        const averageRating = ratingsResult.data.reduce((sum, rating) => sum + rating.rating, 0) / ratingsResult.data.length;
        
        const options = {
          data: { 
            rating: Math.round(averageRating * 100) / 100,
            updated_at: new Date().toISOString()
          },
          filters: [{ column: 'id', operator: 'eq', value: supplierId }]
        };
        
        return await db.query('suppliers', 'update', options);
      }
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Get supplier performance metrics
  async getSupplierPerformance(supplierId) {
    try {
      const [ratings, orders, totalSpent] = await Promise.all([
        this.getSupplierRatings(supplierId),
        db.query('purchase_orders', 'select', {
          filters: [{ column: 'supplier_id', operator: 'eq', value: supplierId }],
          columns: 'total_amount, status, order_date'
        }),
        db.query('purchase_orders', 'select', {
          filters: [
            { column: 'supplier_id', operator: 'eq', value: supplierId },
            { column: 'status', operator: 'eq', value: 'delivered' }
          ],
          columns: 'total_amount'
        })
      ]);

      const totalOrders = orders.data?.length || 0;
      const deliveredOrders = orders.data?.filter(order => order.status === 'delivered').length || 0;
      const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
      const totalSpentAmount = totalSpent.data?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;
      const averageRating = ratings.data?.length > 0 
        ? ratings.data.reduce((sum, rating) => sum + rating.rating, 0) / ratings.data.length 
        : 0;

      return {
        data: {
          totalOrders,
          deliveredOrders,
          deliveryRate: Math.round(deliveryRate * 100) / 100,
          totalSpent: totalSpentAmount,
          averageRating: Math.round(averageRating * 100) / 100,
          totalRatings: ratings.data?.length || 0
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Delete supplier (soft delete by setting is_active to false)
  async deleteSupplier(supplierId) {
    const options = {
      data: { 
        is_active: false,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: supplierId }]
    };
    
    return await db.query('suppliers', 'update', options);
  }

  // Reactivate supplier
  async reactivateSupplier(supplierId) {
    const options = {
      data: { 
        is_active: true,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: supplierId }]
    };
    
    return await db.query('suppliers', 'update', options);
  }

  // Get procurement requests with advanced filtering
  async getRequestsWithFilters(filters = {}) {
    const {
      status,
      priority,
      department,
      requestedBy,
      dateFrom,
      dateTo,
      search,
      limit = 50,
      offset = 0
    } = filters;

    const queryFilters = [];
    
    if (status) queryFilters.push({ column: 'status', operator: 'eq', value: status });
    if (priority) queryFilters.push({ column: 'priority', operator: 'eq', value: priority });
    if (department) queryFilters.push({ column: 'department', operator: 'eq', value: department });
    if (requestedBy) queryFilters.push({ column: 'requested_by', operator: 'eq', value: requestedBy });
    if (dateFrom) queryFilters.push({ column: 'requested_date', operator: 'gte', value: dateFrom });
    if (dateTo) queryFilters.push({ column: 'requested_date', operator: 'lte', value: dateTo });
    if (search) {
      // Note: This would need to be handled with a more complex query in a real implementation
      // For now, we'll filter by item_name containing the search term
      queryFilters.push({ column: 'item_name', operator: 'ilike', value: `%${search}%` });
    }

    const options = {
      columns: `
        id, item_name, item_description, quantity, unit_price, total_amount, 
        priority, status, requested_by, requested_date, approved_by, approved_date, 
        rejection_reason, department, created_at, updated_at,
        requester:users!requested_by(full_name, username),
        approver:users!approved_by(full_name, username)
      `,
      filters: queryFilters,
      orderBy: { column: 'requested_date', ascending: false },
      limit,
      offset
    };
    
    return await db.query('procurement_requests', 'select', options);
  }

  // Bulk operations
  async bulkUpdateRequestStatus(requestIds, status, approvedBy, rejectionReason = null) {
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'approved') {
      updateData.approved_by = approvedBy;
      updateData.approved_date = new Date().toISOString().split('T')[0];
    } else if (status === 'rejected') {
      updateData.rejection_reason = rejectionReason;
    }

    const results = [];
    const errors = [];

    for (const requestId of requestIds) {
      try {
        const options = {
          data: updateData,
          filters: [{ column: 'id', operator: 'eq', value: requestId }]
        };
        
        const result = await db.query('procurement_requests', 'update', options);
        results.push({ id: requestId, result });
      } catch (error) {
        errors.push({ id: requestId, error: error.message });
      }
    }

    return { results, errors, success: errors.length === 0 };
  }
}

export const procurementService = new ProcurementService();
export default procurementService;
