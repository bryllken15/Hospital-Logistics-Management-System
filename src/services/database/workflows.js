import { db } from './supabaseClient';

// Workflow and approval management service
export class WorkflowService {
  // Get all workflows
  async getAllWorkflows(filters = {}) {
    const options = {
      columns: 'id, name, description, workflow_type, is_active, created_by, created_at, updated_at',
      orderBy: { column: 'name', ascending: true },
      ...filters
    };
    
    return await db.query('workflows', 'select', options);
  }

  // Get workflow by ID
  async getWorkflowById(workflowId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: workflowId }],
      limit: 1
    };
    
    const result = await db.query('workflows', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create workflow
  async createWorkflow(workflowData) {
    const options = {
      data: {
        ...workflowData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('workflows', 'insert', options);
  }

  // Workflow steps
  async getWorkflowSteps(workflowId) {
    const options = {
      filters: [{ column: 'workflow_id', operator: 'eq', value: workflowId }],
      orderBy: { column: 'step_order', ascending: true }
    };
    
    return await db.query('workflow_steps', 'select', options);
  }

  // Create workflow step
  async createWorkflowStep(stepData) {
    const options = {
      data: stepData
    };
    
    return await db.query('workflow_steps', 'insert', options);
  }

  // Workflow instances
  async getAllWorkflowInstances(filters = {}) {
    const options = {
      columns: `
        id, workflow_id, request_type, request_id, status, current_step, 
        initiated_by, initiated_at, completed_at, total_steps, created_at, updated_at,
        workflow:workflows!workflow_id(name, workflow_type),
        initiator:users!initiated_by(full_name, username)
      `,
      orderBy: { column: 'initiated_at', ascending: false },
      ...filters
    };
    
    return await db.query('workflow_instances', 'select', options);
  }

  // Get workflow instance by ID
  async getWorkflowInstanceById(instanceId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: instanceId }],
      limit: 1
    };
    
    const result = await db.query('workflow_instances', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create workflow instance
  async createWorkflowInstance(instanceData) {
    const options = {
      data: {
        ...instanceData,
        initiated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('workflow_instances', 'insert', options);
  }

  // Update workflow instance
  async updateWorkflowInstance(instanceId, updateData) {
    const options = {
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: instanceId }]
    };
    
    return await db.query('workflow_instances', 'update', options);
  }

  // Get workflow instances by status
  async getWorkflowInstancesByStatus(status) {
    const options = {
      filters: [{ column: 'status', operator: 'eq', value: status }],
      orderBy: { column: 'initiated_at', ascending: false }
    };
    
    return await db.query('workflow_instances', 'select', options);
  }

  // Get workflow instances by user
  async getWorkflowInstancesByUser(userId) {
    const options = {
      filters: [{ column: 'initiated_by', operator: 'eq', value: userId }],
      orderBy: { column: 'initiated_at', ascending: false }
    };
    
    return await db.query('workflow_instances', 'select', options);
  }

  // Get workflow instances by status
  async getWorkflowInstancesByStatus(status) {
    const options = {
      filters: [{ column: 'status', operator: 'eq', value: status }],
      orderBy: { column: 'initiated_at', ascending: false }
    };
    
    return await db.query('workflow_instances', 'select', options);
  }

  // Update workflow step
  async updateWorkflowStep(instanceId, stepOrder, stepData) {
    const options = {
      data: {
        ...stepData,
        updated_at: new Date().toISOString()
      },
      filters: [
        { column: 'workflow_instance_id', operator: 'eq', value: instanceId },
        { column: 'step_order', operator: 'eq', value: stepOrder }
      ]
    };
    
    return await db.query('workflow_approvals', 'update', options);
  }

  // Complete workflow
  async completeWorkflow(instanceId) {
    const options = {
      data: {
        status: 'approved',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: instanceId }]
    };
    
    return await db.query('workflow_instances', 'update', options);
  }

  // Workflow approvals
  async getWorkflowApprovals(instanceId) {
    const options = {
      filters: [{ column: 'workflow_instance_id', operator: 'eq', value: instanceId }],
      columns: `
        id, workflow_instance_id, step_id, step_order, approved_by, 
        approval_status, approval_notes, approved_at, due_date, created_at,
        approver:users!approved_by(full_name, username),
        step:workflow_steps!step_id(step_name, required_role)
      `,
      orderBy: { column: 'step_order', ascending: true }
    };
    
    return await db.query('workflow_approvals', 'select', options);
  }

  // Create workflow approval
  async createWorkflowApproval(approvalData) {
    const options = {
      data: approvalData
    };
    
    return await db.query('workflow_approvals', 'insert', options);
  }

  // Update workflow approval
  async updateWorkflowApproval(approvalId, updateData) {
    const options = {
      data: {
        ...updateData,
        approved_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: approvalId }]
    };
    
    return await db.query('workflow_approvals', 'update', options);
  }

  // Approve workflow step
  async approveWorkflowStep(approvalId, approvedBy, notes = null) {
    return await this.updateWorkflowApproval(approvalId, {
      approval_status: 'approved',
      approved_by: approvedBy,
      approval_notes: notes
    });
  }

  // Reject workflow step
  async rejectWorkflowStep(approvalId, approvedBy, notes = null) {
    return await this.updateWorkflowApproval(approvalId, {
      approval_status: 'rejected',
      approved_by: approvedBy,
      approval_notes: notes
    });
  }

  // Approval requests
  async getAllApprovalRequests(filters = {}) {
    const options = {
      columns: `
        id, request_type, request_data, status, priority, requested_by, 
        requested_at, manager_approved_by, manager_approved_at, 
        project_manager_approved_by, project_manager_approved_at, 
        rejection_reason, created_at, updated_at,
        requester:users!requested_by(full_name, username),
        manager_approver:users!manager_approved_by(full_name, username),
        project_manager_approver:users!project_manager_approved_by(full_name, username)
      `,
      orderBy: { column: 'requested_at', ascending: false },
      ...filters
    };
    
    return await db.query('approval_requests', 'select', options);
  }

  // Get approval request by ID
  async getApprovalRequestById(requestId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: requestId }],
      limit: 1
    };
    
    const result = await db.query('approval_requests', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create approval request
  async createApprovalRequest(requestData) {
    const options = {
      data: {
        ...requestData,
        requested_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('approval_requests', 'insert', options);
  }

  // Update approval request
  async updateApprovalRequest(requestId, updateData) {
    const options = {
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: requestId }]
    };
    
    return await db.query('approval_requests', 'update', options);
  }

  // Manager approve request
  async managerApproveRequest(requestId, managerId) {
    return await this.updateApprovalRequest(requestId, {
      status: 'manager_approved',
      manager_approved_by: managerId,
      manager_approved_at: new Date().toISOString()
    });
  }

  // Project manager approve request
  async projectManagerApproveRequest(requestId, projectManagerId) {
    return await this.updateApprovalRequest(requestId, {
      status: 'approved',
      project_manager_approved_by: projectManagerId,
      project_manager_approved_at: new Date().toISOString()
    });
  }

  // Reject request
  async rejectRequest(requestId, rejectedBy, rejectionReason) {
    return await this.updateApprovalRequest(requestId, {
      status: 'rejected',
      rejection_reason: rejectionReason
    });
  }

  // Get requests by status
  async getRequestsByStatus(status) {
    const options = {
      filters: [{ column: 'status', operator: 'eq', value: status }],
      orderBy: { column: 'requested_at', ascending: false }
    };
    
    return await db.query('approval_requests', 'select', options);
  }

  // Get requests by user
  async getRequestsByUser(userId) {
    const options = {
      filters: [{ column: 'requested_by', operator: 'eq', value: userId }],
      orderBy: { column: 'requested_at', ascending: false }
    };
    
    return await db.query('approval_requests', 'select', options);
  }

  // Notifications
  async getNotifications(userId) {
    const options = {
      filters: [{ column: 'user_id', operator: 'eq', value: userId }],
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('notifications', 'select', options);
  }

  // Get unread notifications
  async getUnreadNotifications(userId) {
    const options = {
      filters: [
        { column: 'user_id', operator: 'eq', value: userId },
        { column: 'is_read', operator: 'eq', value: false }
      ],
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('notifications', 'select', options);
  }

  // Create notification
  async createNotification(notificationData) {
    const options = {
      data: {
        ...notificationData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('notifications', 'insert', options);
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    const options = {
      data: {
        is_read: true,
        read_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: notificationId }]
    };
    
    return await db.query('notifications', 'update', options);
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(userId) {
    const options = {
      data: {
        is_read: true,
        read_at: new Date().toISOString()
      },
      filters: [{ column: 'user_id', operator: 'eq', value: userId }]
    };
    
    return await db.query('notifications', 'update', options);
  }

  // Get workflow statistics
  async getWorkflowStats() {
    try {
      const [totalInstances, pendingInstances, approvedInstances, rejectedInstances] = await Promise.all([
        db.query('workflow_instances', 'select', { columns: 'count' }),
        db.query('workflow_instances', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'pending' }],
          columns: 'count'
        }),
        db.query('workflow_instances', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'approved' }],
          columns: 'count'
        }),
        db.query('workflow_instances', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'rejected' }],
          columns: 'count'
        })
      ]);

      return {
        data: {
          totalInstances: totalInstances.data?.length || 0,
          pendingInstances: pendingInstances.data?.length || 0,
          approvedInstances: approvedInstances.data?.length || 0,
          rejectedInstances: rejectedInstances.data?.length || 0
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Subscribe to workflow instances
  subscribeToWorkflowInstances(callback) {
    return db.subscribe('workflow_instances', callback);
  }

  // Subscribe to workflow approvals
  subscribeToWorkflowApprovals(callback) {
    return db.subscribe('workflow_approvals', callback);
  }

  // Subscribe to approval requests
  subscribeToApprovalRequests(callback) {
    return db.subscribe('approval_requests', callback);
  }

  // Subscribe to notifications
  subscribeToNotifications(callback) {
    return db.subscribe('notifications', callback);
  }
}

export const workflowService = new WorkflowService();
export default workflowService;
