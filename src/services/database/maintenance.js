import { db } from './supabaseClient';

// Maintenance and asset management service
export class MaintenanceService {
  // Get all assets
  async getAllAssets(filters = {}) {
    const options = {
      columns: `
        id, name, description, tag_id, category, condition, location, department, 
        purchase_date, warranty_expiry, cost, supplier_id, last_maintenance, 
        next_maintenance, maintenance_interval, is_active, created_at, updated_at,
        supplier:suppliers!supplier_id(name, contact_person)
      `,
      orderBy: { column: 'name', ascending: true },
      ...filters
    };
    
    return await db.query('assets', 'select', options);
  }

  // Get asset by ID
  async getAssetById(assetId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: assetId }],
      limit: 1
    };
    
    const result = await db.query('assets', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Get asset by RFID tag
  async getAssetByTag(tagId) {
    const options = {
      filters: [{ column: 'tag_id', operator: 'eq', value: tagId }],
      limit: 1
    };
    
    const result = await db.query('assets', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create asset
  async createAsset(assetData) {
    const options = {
      data: {
        ...assetData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('assets', 'insert', options);
  }

  // Update asset
  async updateAsset(assetId, updateData) {
    const options = {
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: assetId }]
    };
    
    return await db.query('assets', 'update', options);
  }

  // Update asset condition
  async updateAssetCondition(assetId, condition) {
    return await this.updateAsset(assetId, { condition });
  }

  // Get assets by condition
  async getAssetsByCondition(condition) {
    const options = {
      filters: [{ column: 'condition', operator: 'eq', value: condition }],
      orderBy: { column: 'name', ascending: true }
    };
    
    return await db.query('assets', 'select', options);
  }

  // Get assets by category
  async getAssetsByCategory(category) {
    const options = {
      filters: [{ column: 'category', operator: 'eq', value: category }],
      orderBy: { column: 'name', ascending: true }
    };
    
    return await db.query('assets', 'select', options);
  }

  // Get assets needing maintenance
  async getAssetsNeedingMaintenance() {
    const options = {
      filters: [
        { column: 'next_maintenance', operator: 'lte', value: new Date().toISOString().split('T')[0] }
      ],
      orderBy: { column: 'next_maintenance', ascending: true }
    };
    
    return await db.query('assets', 'select', options);
  }

  // Maintenance logs
  async getMaintenanceLogs(assetId = null) {
    const options = {
      columns: `
        id, asset_id, maintenance_type, description, status, priority, 
        performed_by, scheduled_date, start_date, completion_date, 
        duration_hours, cost, parts_used, notes, created_at, updated_at,
        asset:assets!asset_id(name, tag_id, location),
        performer:users!performed_by(full_name, username)
      `,
      orderBy: { column: 'created_at', ascending: false }
    };
    
    if (assetId) {
      options.filters = [{ column: 'asset_id', operator: 'eq', value: assetId }];
    }
    
    return await db.query('maintenance_logs', 'select', options);
  }

  // Get maintenance log by ID
  async getMaintenanceLogById(logId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: logId }],
      limit: 1
    };
    
    const result = await db.query('maintenance_logs', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create maintenance log
  async createMaintenanceLog(logData) {
    const options = {
      data: {
        ...logData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('maintenance_logs', 'insert', options);
  }

  // Update maintenance log
  async updateMaintenanceLog(logId, updateData) {
    const options = {
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: logId }]
    };
    
    return await db.query('maintenance_logs', 'update', options);
  }

  // Update maintenance status
  async updateMaintenanceStatus(logId, status) {
    const updateData = { status };
    
    if (status === 'completed') {
      updateData.completion_date = new Date().toISOString();
    } else if (status === 'in_progress') {
      updateData.start_date = new Date().toISOString();
    }
    
    return await this.updateMaintenanceLog(logId, updateData);
  }

  // Get maintenance logs by status
  async getMaintenanceLogsByStatus(status) {
    const options = {
      filters: [{ column: 'status', operator: 'eq', value: status }],
      orderBy: { column: 'scheduled_date', ascending: true }
    };
    
    return await db.query('maintenance_logs', 'select', options);
  }

  // Scheduled maintenance
  async getScheduledMaintenance() {
    const options = {
      columns: `
        id, asset_id, maintenance_type, description, scheduled_date, 
        priority, estimated_duration, assigned_to, status, created_at, updated_at,
        asset:assets!asset_id(name, tag_id, location),
        assignee:users!assigned_to(full_name, username)
      `,
      orderBy: { column: 'scheduled_date', ascending: true }
    };
    
    return await db.query('scheduled_maintenance', 'select', options);
  }

  // Get scheduled maintenance by ID
  async getScheduledMaintenanceById(scheduleId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: scheduleId }],
      limit: 1
    };
    
    const result = await db.query('scheduled_maintenance', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create scheduled maintenance
  async createScheduledMaintenance(scheduleData) {
    const options = {
      data: {
        ...scheduleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('scheduled_maintenance', 'insert', options);
  }

  // Update scheduled maintenance
  async updateScheduledMaintenance(scheduleId, updateData) {
    const options = {
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: scheduleId }]
    };
    
    return await db.query('scheduled_maintenance', 'update', options);
  }

  // Get maintenance alerts
  async getMaintenanceAlerts() {
    const options = {
      columns: `
        id, asset_id, alert_type, message, priority, is_resolved, 
        resolved_by, resolved_at, created_at,
        asset:assets!asset_id(name, tag_id, location),
        resolver:users!resolved_by(full_name, username)
      `,
      filters: [{ column: 'is_resolved', operator: 'eq', value: false }],
      orderBy: { column: 'priority', ascending: false }
    };
    
    return await db.query('maintenance_alerts', 'select', options);
  }

  // Resolve maintenance alert
  async resolveMaintenanceAlert(alertId, resolvedBy) {
    const options = {
      data: {
        is_resolved: true,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: alertId }]
    };
    
    return await db.query('maintenance_alerts', 'update', options);
  }

  // Asset RFID tracking
  async getAssetRFIDTracking(assetId = null) {
    const options = {
      columns: `
        id, asset_id, rfid_code, action, location, scanned_by, scanned_at, notes,
        asset:assets!asset_id(name, tag_id, location),
        scanner:users!scanned_by(full_name, username)
      `,
      orderBy: { column: 'scanned_at', ascending: false }
    };
    
    if (assetId) {
      options.filters = [{ column: 'asset_id', operator: 'eq', value: assetId }];
    }
    
    return await db.query('asset_rfid_tracking', 'select', options);
  }

  // Record asset RFID scan
  async recordAssetRFIDScan(scanData) {
    const options = {
      data: {
        ...scanData,
        scanned_at: new Date().toISOString()
      }
    };
    
    return await db.query('asset_rfid_tracking', 'insert', options);
  }

  // Get maintenance statistics
  async getMaintenanceStats() {
    try {
      const [totalAssets, goodCondition, needsRepair, criticalAssets] = await Promise.all([
        db.query('assets', 'select', { columns: 'count' }),
        db.query('assets', 'select', { 
          filters: [{ column: 'condition', operator: 'eq', value: 'good' }],
          columns: 'count'
        }),
        db.query('assets', 'select', { 
          filters: [{ column: 'condition', operator: 'eq', value: 'needs_repair' }],
          columns: 'count'
        }),
        db.query('assets', 'select', { 
          filters: [{ column: 'condition', operator: 'eq', value: 'critical' }],
          columns: 'count'
        })
      ]);

      return {
        data: {
          totalAssets: totalAssets.data?.length || 0,
          goodCondition: goodCondition.data?.length || 0,
          needsRepair: needsRepair.data?.length || 0,
          criticalAssets: criticalAssets.data?.length || 0
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Get maintenance data for charts
  async getMaintenanceData() {
    const options = {
      columns: 'maintenance_type, status, scheduled_date, completion_date, duration_hours, cost',
      orderBy: { column: 'scheduled_date', ascending: true }
    };
    
    return await db.query('maintenance_logs', 'select', options);
  }

  // Subscribe to assets
  subscribeToAssets(callback) {
    return db.subscribe('assets', callback);
  }

  // Subscribe to maintenance logs
  subscribeToMaintenanceLogs(callback) {
    return db.subscribe('maintenance_logs', callback);
  }

  // Subscribe to scheduled maintenance
  subscribeToScheduledMaintenance(callback) {
    return db.subscribe('scheduled_maintenance', callback);
  }

  // Delete asset
  async deleteAsset(assetId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: assetId }]
    };
    
    return await db.query('assets', 'delete', options);
  }

  // Get assets with advanced filtering
  async getAssetsWithFilters(filters = {}) {
    const {
      category,
      condition,
      location,
      department,
      search,
      limit = 50,
      offset = 0
    } = filters;

    const queryFilters = [];
    
    if (category) queryFilters.push({ column: 'category', operator: 'eq', value: category });
    if (condition) queryFilters.push({ column: 'condition', operator: 'eq', value: condition });
    if (location) queryFilters.push({ column: 'location', operator: 'ilike', value: `%${location}%` });
    if (department) queryFilters.push({ column: 'department', operator: 'eq', value: department });
    if (search) {
      queryFilters.push({ column: 'name', operator: 'ilike', value: `%${search}%` });
    }

    const options = {
      columns: `
        id, name, description, tag_id, category, condition, location, department, 
        purchase_date, warranty_expiry, cost, supplier_id, last_maintenance, 
        next_maintenance, maintenance_interval, is_active, created_at, updated_at,
        supplier:suppliers!supplier_id(name, contact_person)
      `,
      filters: queryFilters,
      orderBy: { column: 'name', ascending: true },
      limit,
      offset
    };
    
    return await db.query('assets', 'select', options);
  }

  // Get asset maintenance history
  async getAssetMaintenanceHistory(assetId) {
    const options = {
      filters: [{ column: 'asset_id', operator: 'eq', value: assetId }],
      columns: `
        id, asset_id, maintenance_log_id, action, performed_by, action_date, notes,
        maintenance_log:maintenance_logs!maintenance_log_id(maintenance_type, description, status),
        performer:users!performed_by(full_name, username)
      `,
      orderBy: { column: 'action_date', ascending: false }
    };
    
    return await db.query('asset_maintenance_history', 'select', options);
  }

  // Add maintenance history entry
  async addMaintenanceHistory(assetId, maintenanceLogId, action, performedBy, notes = '') {
    const options = {
      data: {
        asset_id: assetId,
        maintenance_log_id: maintenanceLogId,
        action,
        performed_by: performedBy,
        action_date: new Date().toISOString(),
        notes
      }
    };
    
    return await db.query('asset_maintenance_history', 'insert', options);
  }

  // Get maintenance logs with filtering
  async getMaintenanceLogsWithFilters(filters = {}) {
    const {
      assetId,
      maintenanceType,
      status,
      priority,
      performedBy,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0
    } = filters;

    const queryFilters = [];
    
    if (assetId) queryFilters.push({ column: 'asset_id', operator: 'eq', value: assetId });
    if (maintenanceType) queryFilters.push({ column: 'maintenance_type', operator: 'eq', value: maintenanceType });
    if (status) queryFilters.push({ column: 'status', operator: 'eq', value: status });
    if (priority) queryFilters.push({ column: 'priority', operator: 'eq', value: priority });
    if (performedBy) queryFilters.push({ column: 'performed_by', operator: 'eq', value: performedBy });
    if (dateFrom) queryFilters.push({ column: 'scheduled_date', operator: 'gte', value: dateFrom });
    if (dateTo) queryFilters.push({ column: 'scheduled_date', operator: 'lte', value: dateTo });

    const options = {
      columns: `
        id, asset_id, maintenance_type, description, status, priority, 
        performed_by, scheduled_date, start_date, completion_date, 
        duration_hours, cost, parts_used, notes, created_at, updated_at,
        asset:assets!asset_id(name, tag_id, location),
        performer:users!performed_by(full_name, username)
      `,
      filters: queryFilters,
      orderBy: { column: 'created_at', ascending: false },
      limit,
      offset
    };
    
    return await db.query('maintenance_logs', 'select', options);
  }

  // Delete maintenance log
  async deleteMaintenanceLog(logId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: logId }]
    };
    
    return await db.query('maintenance_logs', 'delete', options);
  }

  // Get scheduled maintenance with filtering
  async getScheduledMaintenanceWithFilters(filters = {}) {
    const {
      assetId,
      maintenanceType,
      priority,
      assignedTo,
      status,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0
    } = filters;

    const queryFilters = [];
    
    if (assetId) queryFilters.push({ column: 'asset_id', operator: 'eq', value: assetId });
    if (maintenanceType) queryFilters.push({ column: 'maintenance_type', operator: 'eq', value: maintenanceType });
    if (priority) queryFilters.push({ column: 'priority', operator: 'eq', value: priority });
    if (assignedTo) queryFilters.push({ column: 'assigned_to', operator: 'eq', value: assignedTo });
    if (status) queryFilters.push({ column: 'status', operator: 'eq', value: status });
    if (dateFrom) queryFilters.push({ column: 'scheduled_date', operator: 'gte', value: dateFrom });
    if (dateTo) queryFilters.push({ column: 'scheduled_date', operator: 'lte', value: dateTo });

    const options = {
      columns: `
        id, asset_id, maintenance_type, description, scheduled_date, 
        priority, estimated_duration, assigned_to, status, created_at, updated_at,
        asset:assets!asset_id(name, tag_id, location),
        assignee:users!assigned_to(full_name, username)
      `,
      filters: queryFilters,
      orderBy: { column: 'scheduled_date', ascending: true },
      limit,
      offset
    };
    
    return await db.query('scheduled_maintenance', 'select', options);
  }

  // Delete scheduled maintenance
  async deleteScheduledMaintenance(scheduleId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: scheduleId }]
    };
    
    return await db.query('scheduled_maintenance', 'delete', options);
  }

  // Get maintenance alerts by type
  async getMaintenanceAlertsByType(alertType) {
    const options = {
      filters: [
        { column: 'alert_type', operator: 'eq', value: alertType },
        { column: 'is_resolved', operator: 'eq', value: false }
      ],
      columns: `
        id, asset_id, alert_type, message, priority, is_resolved, 
        resolved_by, resolved_at, created_at,
        asset:assets!asset_id(name, tag_id, location),
        resolver:users!resolved_by(full_name, username)
      `,
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('maintenance_alerts', 'select', options);
  }

  // Create maintenance alert
  async createMaintenanceAlert(alertData) {
    const options = {
      data: {
        ...alertData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('maintenance_alerts', 'insert', options);
  }

  // Scan asset RFID and get asset details
  async scanAssetRFID(rfidCode, scannedBy, location, action = 'scan', notes = '') {
    try {
      // Get asset by RFID
      const assetResult = await this.getAssetByTag(rfidCode);
      if (assetResult.error || !assetResult.data) {
        // Record the scan even if asset not found
        await this.recordAssetRFIDScan({
          rfid_code: rfidCode,
          action,
          location,
          scanned_by: scannedBy,
          notes: notes || 'Asset not found'
        });
        return { data: null, error: 'Asset not found for RFID code' };
      }

      // Record the RFID scan
      const scanResult = await this.recordAssetRFIDScan({
        asset_id: assetResult.data.id,
        rfid_code: rfidCode,
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
          asset: assetResult.data,
          scan: scanResult.data
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Get overdue maintenance
  async getOverdueMaintenance() {
    const options = {
      filters: [
        { column: 'next_maintenance', operator: 'lt', value: new Date().toISOString().split('T')[0] },
        { column: 'is_active', operator: 'eq', value: true }
      ],
      orderBy: { column: 'next_maintenance', ascending: true }
    };
    
    return await db.query('assets', 'select', options);
  }

  // Get upcoming maintenance (next 30 days)
  async getUpcomingMaintenance() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const options = {
      filters: [
        { column: 'next_maintenance', operator: 'lte', value: thirtyDaysFromNow.toISOString().split('T')[0] },
        { column: 'next_maintenance', operator: 'gte', value: new Date().toISOString().split('T')[0] },
        { column: 'is_active', operator: 'eq', value: true }
      ],
      orderBy: { column: 'next_maintenance', ascending: true }
    };
    
    return await db.query('assets', 'select', options);
  }

  // Get maintenance cost analysis
  async getMaintenanceCostAnalysis(period = 'month') {
    let dateFilter;
    const now = new Date();
    
    switch (period) {
      case 'week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFilter = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        dateFilter = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        dateFilter = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    const options = {
      filters: [
        { column: 'completion_date', operator: 'gte', value: dateFilter.toISOString().split('T')[0] },
        { column: 'status', operator: 'eq', value: 'completed' }
      ],
      columns: 'maintenance_type, cost, duration_hours, asset_id',
      orderBy: { column: 'completion_date', ascending: false }
    };
    
    return await db.query('maintenance_logs', 'select', options);
  }

  // Get asset utilization metrics
  async getAssetUtilizationMetrics() {
    const options = {
      columns: 'category, condition, cost, last_maintenance, next_maintenance',
      orderBy: { column: 'category', ascending: true }
    };
    
    return await db.query('assets', 'select', options);
  }

  // Subscribe to maintenance alerts
  subscribeToMaintenanceAlerts(callback) {
    return db.subscribe('maintenance_alerts', callback);
  }

  // Subscribe to asset RFID tracking
  subscribeToAssetRFIDTracking(callback) {
    return db.subscribe('asset_rfid_tracking', callback);
  }

  // Subscribe to asset maintenance history
  subscribeToAssetMaintenanceHistory(callback) {
    return db.subscribe('asset_maintenance_history', callback);
  }
}

export const maintenanceService = new MaintenanceService();
export default maintenanceService;
