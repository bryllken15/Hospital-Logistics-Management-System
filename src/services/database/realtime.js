import { db } from './supabaseClient';

// Real-time subscription management service
export class RealtimeService {
  constructor() {
    this.subscriptions = new Map();
  }

  // Subscribe to table changes
  subscribe(table, callback, filter = null) {
    try {
      const subscription = db.subscribe(table, callback, filter);
      
      if (subscription) {
        this.subscriptions.set(`${table}_${Date.now()}`, subscription);
        return subscription;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to subscribe to ${table}:`, error);
      return null;
    }
  }

  // Subscribe to user-specific data
  subscribeToUserData(userId, callback) {
    const subscriptions = [];
    
    // Subscribe to user's notifications
    const notificationSub = this.subscribe('notifications', (payload) => {
      if (payload.new?.user_id === userId || payload.old?.user_id === userId) {
        callback('notifications', payload);
      }
    }, { filter: `user_id=eq.${userId}` });
    
    if (notificationSub) subscriptions.push(notificationSub);
    
    // Subscribe to user's workflow instances
    const workflowSub = this.subscribe('workflow_instances', (payload) => {
      if (payload.new?.initiated_by === userId || payload.old?.initiated_by === userId) {
        callback('workflow_instances', payload);
      }
    }, { filter: `initiated_by=eq.${userId}` });
    
    if (workflowSub) subscriptions.push(workflowSub);
    
    // Subscribe to user's approval requests
    const approvalSub = this.subscribe('approval_requests', (payload) => {
      if (payload.new?.requested_by === userId || payload.old?.requested_by === userId) {
        callback('approval_requests', payload);
      }
    }, { filter: `requested_by=eq.${userId}` });
    
    if (approvalSub) subscriptions.push(approvalSub);
    
    return subscriptions;
  }

  // Subscribe to project data
  subscribeToProjects(callback) {
    return this.subscribe('projects', callback);
  }

  // Subscribe to procurement data
  subscribeToProcurement(callback) {
    const subscriptions = [];
    
    // Subscribe to procurement requests
    const requestsSub = this.subscribe('procurement_requests', callback);
    if (requestsSub) subscriptions.push(requestsSub);
    
    // Subscribe to purchase orders
    const ordersSub = this.subscribe('purchase_orders', callback);
    if (ordersSub) subscriptions.push(ordersSub);
    
    // Subscribe to suppliers
    const suppliersSub = this.subscribe('suppliers', callback);
    if (suppliersSub) subscriptions.push(suppliersSub);
    
    return subscriptions;
  }

  // Subscribe to inventory data
  subscribeToInventory(callback) {
    const subscriptions = [];
    
    // Subscribe to inventory items
    const itemsSub = this.subscribe('inventory_items', callback);
    if (itemsSub) subscriptions.push(itemsSub);
    
    // Subscribe to deliveries
    const deliveriesSub = this.subscribe('deliveries', callback);
    if (deliveriesSub) subscriptions.push(deliveriesSub);
    
    // Subscribe to announcements
    const announcementsSub = this.subscribe('announcements', callback);
    if (announcementsSub) subscriptions.push(announcementsSub);
    
    return subscriptions;
  }

  // Subscribe to maintenance data
  subscribeToMaintenance(callback) {
    const subscriptions = [];
    
    // Subscribe to assets
    const assetsSub = this.subscribe('assets', callback);
    if (assetsSub) subscriptions.push(assetsSub);
    
    // Subscribe to maintenance logs
    const logsSub = this.subscribe('maintenance_logs', callback);
    if (logsSub) subscriptions.push(logsSub);
    
    // Subscribe to scheduled maintenance
    const scheduledSub = this.subscribe('scheduled_maintenance', callback);
    if (scheduledSub) subscriptions.push(scheduledSub);
    
    return subscriptions;
  }

  // Subscribe to document data
  subscribeToDocuments(callback) {
    const subscriptions = [];
    
    // Subscribe to documents
    const documentsSub = this.subscribe('documents', callback);
    if (documentsSub) subscriptions.push(documentsSub);
    
    // Subscribe to verification queue
    const queueSub = this.subscribe('verification_queue', callback);
    if (queueSub) subscriptions.push(queueSub);
    
    // Subscribe to delivery receipts
    const receiptsSub = this.subscribe('delivery_receipts', callback);
    if (receiptsSub) subscriptions.push(receiptsSub);
    
    return subscriptions;
  }

  // Subscribe to workflow data
  subscribeToWorkflows(callback) {
    const subscriptions = [];
    
    // Subscribe to workflow instances
    const instancesSub = this.subscribe('workflow_instances', callback);
    if (instancesSub) subscriptions.push(instancesSub);
    
    // Subscribe to workflow approvals
    const approvalsSub = this.subscribe('workflow_approvals', callback);
    if (approvalsSub) subscriptions.push(approvalsSub);
    
    // Subscribe to approval requests
    const requestsSub = this.subscribe('approval_requests', callback);
    if (requestsSub) subscriptions.push(requestsSub);
    
    return subscriptions;
  }

  // Subscribe to system activities (admin only)
  subscribeToSystemActivities(callback) {
    const subscriptions = [];
    
    // Subscribe to system activities
    const activitiesSub = this.subscribe('system_activities', callback);
    if (activitiesSub) subscriptions.push(activitiesSub);
    
    // Subscribe to audit logs
    const auditSub = this.subscribe('audit_logs', callback);
    if (auditSub) subscriptions.push(auditSub);
    
    // Subscribe to error logs
    const errorsSub = this.subscribe('error_logs', callback);
    if (errorsSub) subscriptions.push(errorsSub);
    
    return subscriptions;
  }

  // Subscribe to all data (admin only)
  subscribeToAllData(callback) {
    const subscriptions = [];
    
    // Subscribe to all major tables
    const tables = [
      'users', 'projects', 'procurement_requests', 'purchase_orders', 
      'inventory_items', 'deliveries', 'assets', 'maintenance_logs',
      'documents', 'workflow_instances', 'notifications', 'system_activities'
    ];
    
    tables.forEach(table => {
      const sub = this.subscribe(table, callback);
      if (sub) subscriptions.push(sub);
    });
    
    return subscriptions;
  }

  // Unsubscribe from specific subscription
  unsubscribe(subscription) {
    if (subscription) {
      try {
        db.client.removeChannel(subscription);
        return true;
      } catch (error) {
        console.error('Failed to unsubscribe:', error);
        return false;
      }
    }
    return false;
  }

  // Unsubscribe from all subscriptions
  unsubscribeAll() {
    this.subscriptions.forEach((subscription, key) => {
      this.unsubscribe(subscription);
      this.subscriptions.delete(key);
    });
  }

  // Get subscription status
  getSubscriptionStatus() {
    return {
      totalSubscriptions: this.subscriptions.size,
      subscriptions: Array.from(this.subscriptions.keys())
    };
  }

  // Health check for real-time connections
  async healthCheck() {
    try {
      const { data, error } = await db.client
        .from('system_activities')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      return { connected: true, error: null };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  // Create real-time event handler
  createEventHandler(handlers = {}) {
    return (payload) => {
      const { eventType, new: newRecord, old: oldRecord, table } = payload;
      
      // Call specific handler if available
      if (handlers[table]) {
        handlers[table](payload);
      }
      
      // Call generic handler if available
      if (handlers.default) {
        handlers.default(payload);
      }
      
      // Log real-time events
      console.log(`Real-time event: ${eventType} on ${table}`, {
        new: newRecord,
        old: oldRecord
      });
    };
  }

  // Create role-based subscription
  createRoleBasedSubscription(userRole, callback) {
    const subscriptions = [];
    
    switch (userRole) {
      case 'Admin':
        subscriptions.push(...this.subscribeToAllData(callback));
        break;
        
      case 'Manager':
        subscriptions.push(...this.subscribeToProjects(callback));
        subscriptions.push(...this.subscribeToProcurement(callback));
        subscriptions.push(...this.subscribeToWorkflows(callback));
        break;
        
      case 'Project Manager':
        subscriptions.push(...this.subscribeToProjects(callback));
        subscriptions.push(...this.subscribeToWorkflows(callback));
        break;
        
      case 'Employee':
        subscriptions.push(...this.subscribeToInventory(callback));
        break;
        
      case 'Procurement Staff':
        subscriptions.push(...this.subscribeToProcurement(callback));
        break;
        
      case 'Maintenance Staff':
        subscriptions.push(...this.subscribeToMaintenance(callback));
        break;
        
      case 'Document Analyst':
        subscriptions.push(...this.subscribeToDocuments(callback));
        break;
        
      default:
        console.warn(`Unknown role: ${userRole}`);
    }
    
    return subscriptions;
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;
