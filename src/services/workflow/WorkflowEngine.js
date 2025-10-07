import { db } from '../database/supabaseClient';
import { WorkflowService } from '../database/workflows';
import { ActivityService } from '../database/activities';

/**
 * Centralized Workflow Engine for managing multi-level approval workflows
 * Handles approval chains: Employee → Manager → Project Manager
 */
export class WorkflowEngine {
  constructor() {
    this.workflowService = new WorkflowService();
    this.activityService = new ActivityService();
  }

  /**
   * Initiate a new workflow instance
   * @param {string} type - Workflow type (inventory_request, procurement_request, document_verification)
   * @param {Object} requestData - Request data
   * @param {string} requestedBy - User ID who initiated the request
   * @param {string} workflowTemplateId - Optional workflow template ID
   */
  async initiateWorkflow(type, requestData, requestedBy, workflowTemplateId = null) {
    try {
      // Get workflow template
      let workflowId;
      if (workflowTemplateId) {
        workflowId = workflowTemplateId;
      } else {
        // Get default workflow for type
        const defaultWorkflow = await this.getDefaultWorkflowForType(type);
        if (!defaultWorkflow) {
          throw new Error(`No default workflow found for type: ${type}`);
        }
        workflowId = defaultWorkflow.id;
      }

      // Get workflow steps
      const stepsResult = await this.workflowService.getWorkflowSteps(workflowId);
      if (stepsResult.error) {
        throw new Error(`Failed to get workflow steps: ${stepsResult.error.message}`);
      }

      const steps = stepsResult.data || [];
      if (steps.length === 0) {
        throw new Error('Workflow has no steps defined');
      }

      // Create workflow instance
      const instanceData = {
        workflow_id: workflowId,
        request_type: type,
        request_id: requestData.id || null,
        status: 'pending',
        current_step: 1,
        initiated_by: requestedBy,
        total_steps: steps.length,
        metadata: {
          request_data: requestData,
          initiated_at: new Date().toISOString()
        }
      };

      const result = await this.workflowService.createWorkflowInstance(instanceData);
      if (result.error) {
        throw new Error(`Failed to create workflow instance: ${result.error.message}`);
      }

      // Log activity
      await this.activityService.logActivity({
        user_id: requestedBy,
        action: 'WORKFLOW_INITIATED',
        description: `Initiated ${type} workflow`,
        entity_type: 'workflow_instance',
        entity_id: result.data.id,
        metadata: { workflow_type: type, request_data: requestData }
      });

      // Create notifications for first approver
      await this.notifyNextApprover(result.data.id, steps[0]);

      return {
        data: result.data,
        error: null
      };
    } catch (error) {
      console.error('Error initiating workflow:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Approve current workflow step
   * @param {string} workflowInstanceId - Workflow instance ID
   * @param {string} approverId - User ID of approver
   * @param {string} comments - Optional approval comments
   */
  async approveStep(workflowInstanceId, approverId, comments = '') {
    try {
      // Get workflow instance
      const instanceResult = await this.workflowService.getWorkflowInstanceById(workflowInstanceId);
      if (instanceResult.error || !instanceResult.data) {
        throw new Error('Workflow instance not found');
      }

      const instance = instanceResult.data;
      const workflowId = instance.workflow_id;
      const currentStep = instance.current_step;

      // Get workflow steps
      const stepsResult = await this.workflowService.getWorkflowSteps(workflowId);
      if (stepsResult.error) {
        throw new Error('Failed to get workflow steps');
      }

      const steps = stepsResult.data || [];
      const currentStepData = steps.find(step => step.step_order === currentStep);

      if (!currentStepData) {
        throw new Error('Current step not found');
      }

      // Check if user can approve this step
      const canApprove = await this.canUserApproveStep(approverId, currentStepData);
      if (!canApprove) {
        throw new Error('User not authorized to approve this step');
      }

      // Update workflow step
      const stepUpdateData = {
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        comments: comments,
        status: 'approved'
      };

      const stepResult = await this.workflowService.updateWorkflowStep(
        workflowInstanceId, 
        currentStep, 
        stepUpdateData
      );

      if (stepResult.error) {
        throw new Error(`Failed to update workflow step: ${stepResult.error.message}`);
      }

      // Check if this is the last step
      const isLastStep = instance.current_step >= instance.total_steps;
      
      if (isLastStep) {
        // Complete workflow
        await this.completeWorkflow(workflowInstanceId, approverId);
      } else {
        // Move to next step
        await this.moveToNextStep(workflowInstanceId, approverId);
      }

      // Log activity
      await this.activityService.logActivity({
        user_id: approverId,
        action: 'WORKFLOW_APPROVED',
        description: `Approved step ${currentStep} of ${instance.request_type} workflow`,
        entity_type: 'workflow_instance',
        entity_id: workflowInstanceId,
        metadata: { 
          step: currentStep, 
          comments: comments,
          is_completed: isLastStep
        }
      });

      return {
        data: { 
          approved: true, 
          step: currentStep, 
          is_completed: isLastStep 
        },
        error: null
      };
    } catch (error) {
      console.error('Error approving workflow step:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Reject workflow
   * @param {string} workflowInstanceId - Workflow instance ID
   * @param {string} approverId - User ID of approver
   * @param {string} reason - Rejection reason
   */
  async rejectWorkflow(workflowInstanceId, approverId, reason) {
    try {
      // Update workflow instance status
      const updateResult = await this.workflowService.updateWorkflowInstance(workflowInstanceId, {
        status: 'rejected',
        completed_at: new Date().toISOString(),
        metadata: {
          rejected_by: approverId,
          rejection_reason: reason,
          rejected_at: new Date().toISOString()
        }
      });

      if (updateResult.error) {
        throw new Error(`Failed to reject workflow: ${updateResult.error.message}`);
      }

      // Log activity
      await this.activityService.logActivity({
        user_id: approverId,
        action: 'WORKFLOW_REJECTED',
        description: `Rejected ${workflowInstanceId} workflow`,
        entity_type: 'workflow_instance',
        entity_id: workflowInstanceId,
        metadata: { reason: reason }
      });

      // Notify requester of rejection
      await this.notifyWorkflowRejection(workflowInstanceId, reason);

      return {
        data: { rejected: true, reason: reason },
        error: null
      };
    } catch (error) {
      console.error('Error rejecting workflow:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Get workflow status
   * @param {string} workflowInstanceId - Workflow instance ID
   */
  async getWorkflowStatus(workflowInstanceId) {
    try {
      const result = await this.workflowService.getWorkflowInstanceById(workflowInstanceId);
      if (result.error) {
        throw new Error(`Failed to get workflow status: ${result.error.message}`);
      }

      return {
        data: result.data,
        error: null
      };
    } catch (error) {
      console.error('Error getting workflow status:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Get pending approvals for user
   * @param {string} userId - User ID
   * @param {string} role - User role
   */
  async getUserPendingApprovals(userId, role) {
    try {
      const result = await this.workflowService.getWorkflowInstancesByUser(userId);
      if (result.error) {
        throw new Error(`Failed to get pending approvals: ${result.error.message}`);
      }

      // Filter for pending approvals where user can approve
      const pendingApprovals = result.data.filter(instance => {
        return instance.status === 'pending' && 
               instance.current_step <= instance.total_steps &&
               this.canUserApproveWorkflow(userId, role, instance);
      });

      return {
        data: pendingApprovals,
        error: null
      };
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      return {
        data: [],
        error: error.message
      };
    }
  }

  /**
   * Get default workflow for request type
   * @param {string} type - Request type
   */
  async getDefaultWorkflowForType(type) {
    try {
      const result = await this.workflowService.getAllWorkflows({
        filters: [
          { column: 'workflow_type', operator: 'eq', value: type },
          { column: 'is_active', operator: 'eq', value: true }
        ],
        limit: 1
      });

      if (result.error || !result.data || result.data.length === 0) {
        return null;
      }

      return result.data[0];
    } catch (error) {
      console.error('Error getting default workflow:', error);
      return null;
    }
  }

  /**
   * Check if user can approve a specific step
   * @param {string} userId - User ID
   * @param {Object} stepData - Step data
   */
  async canUserApproveStep(userId, stepData) {
    // Check if step requires specific user
    if (stepData.required_user_id && stepData.required_user_id !== userId) {
      return false;
    }

    // Check if step requires specific role
    if (stepData.required_role) {
      // Get user role from database
      const userResult = await db.query('users', 'select', {
        filters: [{ column: 'id', operator: 'eq', value: userId }],
        columns: 'role',
        limit: 1
      });

      if (userResult.error || !userResult.data || userResult.data.length === 0) {
        return false;
      }

      const userRole = userResult.data[0].role;
      return userRole === stepData.required_role;
    }

    return true;
  }

  /**
   * Check if user can approve workflow
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @param {Object} workflowInstance - Workflow instance
   */
  canUserApproveWorkflow(userId, role, workflowInstance) {
    // Admin can approve any workflow
    if (role === 'Admin') {
      return true;
    }

    // Check role-based approval logic
    const requestType = workflowInstance.request_type;
    const currentStep = workflowInstance.current_step;

    switch (requestType) {
      case 'inventory_request':
        // Employee requests need Manager or Project Manager approval
        if (currentStep === 1) {
          return role === 'Manager' || role === 'Project Manager';
        }
        break;
      
      case 'procurement_request':
        // Procurement requests need Manager then Project Manager approval
        if (currentStep === 1) {
          return role === 'Manager';
        } else if (currentStep === 2) {
          return role === 'Project Manager';
        }
        break;
      
      case 'document_verification':
        // Document verification needs Manager then Project Manager approval
        if (currentStep === 1) {
          return role === 'Manager';
        } else if (currentStep === 2) {
          return role === 'Project Manager';
        }
        break;
    }

    return false;
  }

  /**
   * Move workflow to next step
   * @param {string} workflowInstanceId - Workflow instance ID
   * @param {string} approverId - User ID of approver
   */
  async moveToNextStep(workflowInstanceId, approverId) {
    try {
      // Get current instance
      const instanceResult = await this.workflowService.getWorkflowInstanceById(workflowInstanceId);
      if (instanceResult.error || !instanceResult.data) {
        throw new Error('Workflow instance not found');
      }

      const instance = instanceResult.data;
      const nextStep = instance.current_step + 1;

      // Update instance to next step
      const updateResult = await this.workflowService.updateWorkflowInstance(workflowInstanceId, {
        current_step: nextStep,
        updated_at: new Date().toISOString()
      });

      if (updateResult.error) {
        throw new Error(`Failed to move to next step: ${updateResult.error.message}`);
      }

      // Get workflow steps for next step notification
      const stepsResult = await this.workflowService.getWorkflowSteps(instance.workflow_id);
      if (!stepsResult.error && stepsResult.data) {
        const nextStepData = stepsResult.data.find(step => step.step_order === nextStep);
        if (nextStepData) {
          await this.notifyNextApprover(workflowInstanceId, nextStepData);
        }
      }

      return { data: { moved: true, nextStep: nextStep }, error: null };
    } catch (error) {
      console.error('Error moving to next step:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Complete workflow
   * @param {string} workflowInstanceId - Workflow instance ID
   * @param {string} approverId - User ID of final approver
   */
  async completeWorkflow(workflowInstanceId, approverId) {
    try {
      const updateResult = await this.workflowService.updateWorkflowInstance(workflowInstanceId, {
        status: 'approved',
        completed_at: new Date().toISOString(),
        metadata: {
          completed_by: approverId,
          completed_at: new Date().toISOString()
        }
      });

      if (updateResult.error) {
        throw new Error(`Failed to complete workflow: ${updateResult.error.message}`);
      }

      // Notify requester of completion
      await this.notifyWorkflowCompletion(workflowInstanceId);

      return { data: { completed: true }, error: null };
    } catch (error) {
      console.error('Error completing workflow:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Notify next approver
   * @param {string} workflowInstanceId - Workflow instance ID
   * @param {Object} stepData - Step data
   */
  async notifyNextApprover(workflowInstanceId, stepData) {
    // This will be implemented with the NotificationService
    console.log(`Notifying approver for workflow ${workflowInstanceId}, step ${stepData.step_order}`);
  }

  /**
   * Notify workflow rejection
   * @param {string} workflowInstanceId - Workflow instance ID
   * @param {string} reason - Rejection reason
   */
  async notifyWorkflowRejection(workflowInstanceId, reason) {
    // This will be implemented with the NotificationService
    console.log(`Notifying rejection for workflow ${workflowInstanceId}: ${reason}`);
  }

  /**
   * Notify workflow completion
   * @param {string} workflowInstanceId - Workflow instance ID
   */
  async notifyWorkflowCompletion(workflowInstanceId) {
    // This will be implemented with the NotificationService
    console.log(`Notifying completion for workflow ${workflowInstanceId}`);
  }
}
