import { db } from './supabaseClient';

// Inventory management service
export class InventoryService {
  // Get all inventory items
  async getAllItems(filters = {}) {
    const options = {
      columns: `
        id, name, description, category, quantity, min_quantity, max_quantity, 
        unit, location, rfid_code, status, cost_per_unit, supplier_id, 
        last_updated, created_at, updated_at,
        supplier:suppliers!supplier_id(name, contact_person)
      `,
      orderBy: { column: 'name', ascending: true },
      ...filters
    };
    
    return await db.query('inventory_items', 'select', options);
  }

  // Get item by ID
  async getItemById(itemId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: itemId }],
      limit: 1
    };
    
    const result = await db.query('inventory_items', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Get item by RFID code
  async getItemByRFID(rfidCode) {
    const options = {
      filters: [{ column: 'rfid_code', operator: 'eq', value: rfidCode }],
      limit: 1
    };
    
    const result = await db.query('inventory_items', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create inventory item
  async createItem(itemData) {
    const options = {
      data: {
        ...itemData,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('inventory_items', 'insert', options);
  }

  // Update inventory item
  async updateItem(itemId, updateData) {
    const options = {
      data: {
        ...updateData,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: itemId }]
    };
    
    return await db.query('inventory_items', 'update', options);
  }

  // Update item quantity
  async updateQuantity(itemId, newQuantity) {
    return await this.updateItem(itemId, { quantity: newQuantity });
  }

  // Update item status
  async updateItemStatus(itemId, status) {
    return await this.updateItem(itemId, { status });
  }

  // Get items by category
  async getItemsByCategory(category) {
    const options = {
      filters: [{ column: 'category', operator: 'eq', value: category }],
      orderBy: { column: 'name', ascending: true }
    };
    
    return await db.query('inventory_items', 'select', options);
  }

  // Get items by status
  async getItemsByStatus(status) {
    const options = {
      filters: [{ column: 'status', operator: 'eq', value: status }],
      orderBy: { column: 'name', ascending: true }
    };
    
    return await db.query('inventory_items', 'select', options);
  }

  // Get low stock items
  async getLowStockItems() {
    const options = {
      filters: [
        { column: 'quantity', operator: 'lte', value: 'min_quantity' }
      ],
      orderBy: { column: 'quantity', ascending: true }
    };
    
    return await db.query('inventory_items', 'select', options);
  }

  // Get out of stock items
  async getOutOfStockItems() {
    const options = {
      filters: [{ column: 'quantity', operator: 'eq', value: 0 }],
      orderBy: { column: 'name', ascending: true }
    };
    
    return await db.query('inventory_items', 'select', options);
  }

  // Inventory movements
  async getInventoryMovements(itemId = null) {
    const options = {
      columns: `
        id, item_id, movement_type, quantity, from_location, to_location, 
        reason, reference_number, performed_by, movement_date, notes,
        item:inventory_items!item_id(name, category),
        performer:users!performed_by(full_name, username)
      `,
      orderBy: { column: 'movement_date', ascending: false }
    };
    
    if (itemId) {
      options.filters = [{ column: 'item_id', operator: 'eq', value: itemId }];
    }
    
    return await db.query('inventory_movements', 'select', options);
  }

  // Record inventory movement
  async recordMovement(movementData) {
    const options = {
      data: {
        ...movementData,
        movement_date: new Date().toISOString()
      }
    };
    
    return await db.query('inventory_movements', 'insert', options);
  }

  // Deliveries
  async getAllDeliveries(filters = {}) {
    const options = {
      columns: `
        id, item_name, item_description, quantity, destination, status, 
        delivery_date, actual_delivery_date, rfid_code, tracking_number, 
        delivered_by, received_by, notes, created_at, updated_at,
        deliverer:users!delivered_by(full_name, username),
        receiver:users!received_by(full_name, username)
      `,
      orderBy: { column: 'delivery_date', ascending: false },
      ...filters
    };
    
    return await db.query('deliveries', 'select', options);
  }

  // Get delivery by ID
  async getDeliveryById(deliveryId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: deliveryId }],
      limit: 1
    };
    
    const result = await db.query('deliveries', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create delivery
  async createDelivery(deliveryData) {
    const options = {
      data: {
        ...deliveryData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('deliveries', 'insert', options);
  }

  // Update delivery status
  async updateDeliveryStatus(deliveryId, status) {
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'delivered') {
      updateData.actual_delivery_date = new Date().toISOString();
    }
    
    const options = {
      data: updateData,
      filters: [{ column: 'id', operator: 'eq', value: deliveryId }]
    };
    
    return await db.query('deliveries', 'update', options);
  }

  // Get deliveries by status
  async getDeliveriesByStatus(status) {
    const options = {
      filters: [{ column: 'status', operator: 'eq', value: status }],
      orderBy: { column: 'delivery_date', ascending: false }
    };
    
    return await db.query('deliveries', 'select', options);
  }

  // RFID tracking
  async getRFIDTracking(rfidCode = null) {
    const options = {
      columns: `
        id, rfid_code, item_id, action, location, scanned_by, scanned_at, notes,
        item:inventory_items!item_id(name, category, status),
        scanner:users!scanned_by(full_name, username)
      `,
      orderBy: { column: 'scanned_at', ascending: false }
    };
    
    if (rfidCode) {
      options.filters = [{ column: 'rfid_code', operator: 'eq', value: rfidCode }];
    }
    
    return await db.query('rfid_tracking', 'select', options);
  }

  // Record RFID scan
  async recordRFIDScan(scanData) {
    const options = {
      data: {
        ...scanData,
        scanned_at: new Date().toISOString()
      }
    };
    
    return await db.query('rfid_tracking', 'insert', options);
  }

  // Inventory alerts
  async getInventoryAlerts() {
    const options = {
      columns: `
        id, item_id, alert_type, message, priority, is_resolved, 
        resolved_by, resolved_at, created_at,
        item:inventory_items!item_id(name, category, quantity),
        resolver:users!resolved_by(full_name, username)
      `,
      filters: [{ column: 'is_resolved', operator: 'eq', value: false }],
      orderBy: { column: 'priority', ascending: false }
    };
    
    return await db.query('inventory_alerts', 'select', options);
  }

  // Resolve alert
  async resolveAlert(alertId, resolvedBy) {
    const options = {
      data: {
        is_resolved: true,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: alertId }]
    };
    
    return await db.query('inventory_alerts', 'update', options);
  }

  // Announcements
  async getAnnouncements() {
    const options = {
      columns: `
        id, title, message, priority, is_active, created_by, 
        created_at, expires_at,
        creator:users!created_by(full_name, username)
      `,
      filters: [
        { column: 'is_active', operator: 'eq', value: true },
        { column: 'expires_at', operator: 'gt', value: new Date().toISOString() }
      ],
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('announcements', 'select', options);
  }

  // Create announcement
  async createAnnouncement(announcementData) {
    const options = {
      data: {
        ...announcementData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('announcements', 'insert', options);
  }

  // Update announcement
  async updateAnnouncement(announcementId, updateData) {
    const options = {
      data: updateData,
      filters: [{ column: 'id', operator: 'eq', value: announcementId }]
    };
    
    return await db.query('announcements', 'update', options);
  }

  // Get inventory statistics
  async getInventoryStats() {
    try {
      const [totalItems, lowStockItems, outOfStockItems, totalDeliveries] = await Promise.all([
        db.query('inventory_items', 'select', { columns: 'count' }),
        db.query('inventory_items', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'low_stock' }],
          columns: 'count'
        }),
        db.query('inventory_items', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'out_of_stock' }],
          columns: 'count'
        }),
        db.query('deliveries', 'select', { columns: 'count' })
      ]);

      return {
        data: {
          totalItems: totalItems.data?.length || 0,
          lowStockItems: lowStockItems.data?.length || 0,
          outOfStockItems: outOfStockItems.data?.length || 0,
          totalDeliveries: totalDeliveries.data?.length || 0
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Subscribe to inventory items
  subscribeToItems(callback) {
    return db.subscribe('inventory_items', callback);
  }

  // Subscribe to deliveries
  subscribeToDeliveries(callback) {
    return db.subscribe('deliveries', callback);
  }

  // Subscribe to announcements
  subscribeToAnnouncements(callback) {
    return db.subscribe('announcements', callback);
  }

  // Delete inventory item
  async deleteItem(itemId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: itemId }]
    };
    
    return await db.query('inventory_items', 'delete', options);
  }

  // Get items with advanced filtering
  async getItemsWithFilters(filters = {}) {
    const {
      category,
      status,
      location,
      search,
      minQuantity,
      maxQuantity,
      limit = 50,
      offset = 0
    } = filters;

    const queryFilters = [];
    
    if (category) queryFilters.push({ column: 'category', operator: 'eq', value: category });
    if (status) queryFilters.push({ column: 'status', operator: 'eq', value: status });
    if (location) queryFilters.push({ column: 'location', operator: 'ilike', value: `%${location}%` });
    if (minQuantity !== undefined) queryFilters.push({ column: 'quantity', operator: 'gte', value: minQuantity });
    if (maxQuantity !== undefined) queryFilters.push({ column: 'quantity', operator: 'lte', value: maxQuantity });
    if (search) {
      queryFilters.push({ column: 'name', operator: 'ilike', value: `%${search}%` });
    }

    const options = {
      columns: `
        id, name, description, category, quantity, min_quantity, max_quantity, 
        unit, location, rfid_code, status, cost_per_unit, supplier_id, 
        last_updated, created_at, updated_at,
        supplier:suppliers!supplier_id(name, contact_person)
      `,
      filters: queryFilters,
      orderBy: { column: 'name', ascending: true },
      limit,
      offset
    };
    
    return await db.query('inventory_items', 'select', options);
  }

  // Bulk update item quantities
  async bulkUpdateQuantities(updates) {
    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const result = await this.updateQuantity(update.itemId, update.quantity);
        results.push({ itemId: update.itemId, result });
      } catch (error) {
        errors.push({ itemId: update.itemId, error: error.message });
      }
    }

    return { results, errors, success: errors.length === 0 };
  }

  // Transfer items between locations
  async transferItem(itemId, fromLocation, toLocation, quantity, performedBy, notes = '') {
    try {
      // Record the transfer movement
      const movementResult = await this.recordMovement({
        item_id: itemId,
        movement_type: 'transfer',
        quantity: quantity,
        from_location: fromLocation,
        to_location: toLocation,
        reason: 'Location transfer',
        performed_by: performedBy,
        notes
      });

      if (movementResult.error) {
        return movementResult;
      }

      // Update item location
      const updateResult = await this.updateItem(itemId, { location: toLocation });
      
      return updateResult;
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Check in items (increase quantity)
  async checkInItem(itemId, quantity, location, performedBy, notes = '') {
    try {
      // Record the check-in movement
      const movementResult = await this.recordMovement({
        item_id: itemId,
        movement_type: 'in',
        quantity: quantity,
        to_location: location,
        reason: 'Check-in',
        performed_by: performedBy,
        notes
      });

      if (movementResult.error) {
        return movementResult;
      }

      // Get current quantity and update
      const itemResult = await this.getItemById(itemId);
      if (itemResult.error || !itemResult.data) {
        return { data: null, error: 'Item not found' };
      }

      const newQuantity = itemResult.data.quantity + quantity;
      const updateResult = await this.updateQuantity(itemId, newQuantity);
      
      return updateResult;
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Check out items (decrease quantity)
  async checkOutItem(itemId, quantity, location, performedBy, notes = '') {
    try {
      // Get current quantity and validate
      const itemResult = await this.getItemById(itemId);
      if (itemResult.error || !itemResult.data) {
        return { data: null, error: 'Item not found' };
      }

      if (itemResult.data.quantity < quantity) {
        return { data: null, error: 'Insufficient quantity available' };
      }

      // Record the check-out movement
      const movementResult = await this.recordMovement({
        item_id: itemId,
        movement_type: 'out',
        quantity: quantity,
        from_location: location,
        reason: 'Check-out',
        performed_by: performedBy,
        notes
      });

      if (movementResult.error) {
        return movementResult;
      }

      // Update quantity
      const newQuantity = itemResult.data.quantity - quantity;
      const updateResult = await this.updateQuantity(itemId, newQuantity);
      
      return updateResult;
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Scan RFID and get item details
  async scanRFID(rfidCode, scannedBy, location, action = 'scan', notes = '') {
    try {
      // Get item by RFID
      const itemResult = await this.getItemByRFID(rfidCode);
      if (itemResult.error || !itemResult.data) {
      // Record the scan even if item not found
        await this.recordRFIDScan({
          rfid_code: rfidCode,
          action,
          location,
          scanned_by: scannedBy,
          notes: notes || 'Item not found'
        });
        return { data: null, error: 'Item not found for RFID code' };
      }

      // Record the RFID scan
      const scanResult = await this.recordRFIDScan({
        rfid_code: rfidCode,
        item_id: itemResult.data.id,
        action,
        location,
        scanned_by: scannedBy,
        notes
      });

      if (scanResult.error) {
        return scanResult;
      }

      return {
        data: {
          item: itemResult.data,
          scan: scanResult.data
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Get inventory movement history for an item
  async getItemMovementHistory(itemId, limit = 50) {
    const options = {
      filters: [{ column: 'item_id', operator: 'eq', value: itemId }],
      columns: `
        id, movement_type, quantity, from_location, to_location, 
        reason, reference_number, performed_by, movement_date, notes,
        performer:users!performed_by(full_name, username)
      `,
      orderBy: { column: 'movement_date', ascending: false },
      limit
    };
    
    return await db.query('inventory_movements', 'select', options);
  }

  // Get inventory alerts by type
  async getAlertsByType(alertType) {
    const options = {
      filters: [
        { column: 'alert_type', operator: 'eq', value: alertType },
        { column: 'is_resolved', operator: 'eq', value: false }
      ],
      columns: `
        id, item_id, alert_type, message, priority, is_resolved, 
        resolved_by, resolved_at, created_at,
        item:inventory_items!item_id(name, category, quantity),
        resolver:users!resolved_by(full_name, username)
      `,
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('inventory_alerts', 'select', options);
  }

  // Create inventory alert
  async createAlert(alertData) {
    const options = {
      data: {
        ...alertData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('inventory_alerts', 'insert', options);
  }

  // Get delivery statistics
  async getDeliveryStats() {
    try {
      const [totalDeliveries, pendingDeliveries, deliveredCount, inTransitCount] = await Promise.all([
        db.query('deliveries', 'select', { columns: 'count' }),
        db.query('deliveries', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'scheduled' }],
          columns: 'count'
        }),
        db.query('deliveries', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'delivered' }],
          columns: 'count'
        }),
        db.query('deliveries', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'in_transit' }],
          columns: 'count'
        })
      ]);

      return {
        data: {
          totalDeliveries: totalDeliveries.data?.length || 0,
          pendingDeliveries: pendingDeliveries.data?.length || 0,
          deliveredCount: deliveredCount.data?.length || 0,
          inTransitCount: inTransitCount.data?.length || 0
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Get category statistics
  async getCategoryStats() {
    const options = {
      columns: 'category, count(*) as item_count, sum(quantity) as total_quantity',
      orderBy: { column: 'category', ascending: true }
    };
    
    return await db.query('inventory_items', 'select', options);
  }

  // Subscribe to inventory movements
  subscribeToMovements(callback) {
    return db.subscribe('inventory_movements', callback);
  }

  // Subscribe to RFID tracking
  subscribeToRFIDTracking(callback) {
    return db.subscribe('rfid_tracking', callback);
  }

  // Subscribe to inventory alerts
  subscribeToAlerts(callback) {
    return db.subscribe('inventory_alerts', callback);
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;
