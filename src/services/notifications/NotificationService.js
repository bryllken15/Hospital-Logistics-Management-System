import { db } from '../database/supabaseClient';
import { RealtimeService } from '../database/realtime';

/**
 * Real-time Notification Service for managing user notifications
 * Handles workflow notifications, system announcements, and custom triggers
 */
export class NotificationService {
  constructor() {
    this.realtimeService = new RealtimeService();
    this.subscriptions = new Map();
  }

  /**
   * Subscribe to user-specific notifications
   * @param {string} userId - User ID
   * @param {Function} callback - Callback function for notifications
   */
  subscribeToUserNotifications(userId, callback) {
    try {
      const subscription = this.realtimeService.subscribe('notifications', (payload) => {
        if (payload.new && payload.new.user_id === userId) {
          callback(payload);
        }
      }, { user_id: userId });

      this.subscriptions.set(`user_${userId}`, subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to user notifications:', error);
      return null;
    }
  }

  /**
   * Create a new notification
   * @param {string} userId - User ID to notify
   * @param {string} type - Notification type (info, warning, error, success, workflow)
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Object} relatedEntity - Related entity data
   * @param {string} priority - Notification priority (low, medium, high, urgent)
   */
  async createNotification(userId, type, title, message, relatedEntity = null, priority = 'medium') {
    try {
      const notificationData = {
        user_id: userId,
        type: type,
        title: title,
        message: message,
        priority: priority,
        is_read: false,
        related_entity_type: relatedEntity?.type || null,
        related_entity_id: relatedEntity?.id || null,
        metadata: relatedEntity?.metadata || null,
        created_at: new Date().toISOString()
      };

      const result = await db.query('notifications', 'insert', {
        data: notificationData
      });

      if (result.error) {
        throw new Error(`Failed to create notification: ${result.error.message}`);
      }

      return {
        data: result.data,
        error: null
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   */
  async markAsRead(notificationId) {
    try {
      const result = await db.query('notifications', 'update', {
        data: {
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        filters: [{ column: 'id', operator: 'eq', value: notificationId }]
      });

      if (result.error) {
        throw new Error(`Failed to mark notification as read: ${result.error.message}`);
      }

      return {
        data: result.data,
        error: null
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Mark all notifications as read for user
   * @param {string} userId - User ID
   */
  async markAllAsRead(userId) {
    try {
      const result = await db.query('notifications', 'update', {
        data: {
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        filters: [{ column: 'user_id', operator: 'eq', value: userId }]
      });

      if (result.error) {
        throw new Error(`Failed to mark all notifications as read: ${result.error}`);
      }

      return {
        data: result.data,
        error: null
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Get unread count for user
   * @param {string} userId - User ID
   */
  async getUnreadCount(userId) {
    try {
      const result = await db.query('notifications', 'select', {
        filters: [
          { column: 'user_id', operator: 'eq', value: userId },
          { column: 'is_read', operator: 'eq', value: false }
        ],
        columns: 'id',
        count: true
      });

      if (result.error) {
        throw new Error(`Failed to get unread count: ${result.error.message}`);
      }

      return {
        data: result.count || 0,
        error: null
      };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return {
        data: 0,
        error: error.message
      };
    }
  }

  /**
   * Get user notifications
   * @param {string} userId - User ID
   * @param {Object} filters - Additional filters
   */
  async getUserNotifications(userId, filters = {}) {
    try {
      const options = {
        filters: [
          { column: 'user_id', operator: 'eq', value: userId },
          ...(filters.filters || [])
        ],
        orderBy: { column: 'created_at', ascending: false },
        ...filters
      };

      const result = await db.query('notifications', 'select', options);

      if (result.error) {
        throw new Error(`Failed to get user notifications: ${result.error.message}`);
      }

      return {
        data: result.data || [],
        error: null
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return {
        data: [],
        error: error.message
      };
    }
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   */
  async deleteNotification(notificationId) {
    try {
      const result = await db.query('notifications', 'delete', {
        filters: [{ column: 'id', operator: 'eq', value: notificationId }]
      });

      if (result.error) {
        throw new Error(`Failed to delete notification: ${result.error.message}`);
      }

      return {
        data: result.data,
        error: null
      };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Create workflow approval notification
   * @param {string} approverId - Approver user ID
   * @param {Object} workflowInstance - Workflow instance data
   * @param {Object} stepData - Step data
   */
  async createWorkflowApprovalNotification(approverId, workflowInstance, stepData) {
    const title = `Approval Required: ${workflowInstance.request_type}`;
    const message = `You have a pending ${workflowInstance.request_type} approval from ${workflowInstance.initiator?.full_name || 'Unknown User'}. Step ${workflowInstance.current_step} of ${workflowInstance.total_steps}.`;
    
    const relatedEntity = {
      type: 'workflow_instance',
      id: workflowInstance.id,
      metadata: {
        workflow_id: workflowInstance.workflow_id,
        request_type: workflowInstance.request_type,
        current_step: workflowInstance.current_step,
        total_steps: workflowInstance.total_steps
      }
    };

    return await this.createNotification(
      approverId,
      'workflow',
      title,
      message,
      relatedEntity,
      'high'
    );
  }

  /**
   * Create workflow completion notification
   * @param {string} requesterId - Requester user ID
   * @param {Object} workflowInstance - Workflow instance data
   */
  async createWorkflowCompletionNotification(requesterId, workflowInstance) {
    const title = `Workflow Approved: ${workflowInstance.request_type}`;
    const message = `Your ${workflowInstance.request_type} request has been approved and is ready for implementation.`;
    
    const relatedEntity = {
      type: 'workflow_instance',
      id: workflowInstance.id,
      metadata: {
        workflow_id: workflowInstance.workflow_id,
        request_type: workflowInstance.request_type,
        completed_at: workflowInstance.completed_at
      }
    };

    return await this.createNotification(
      requesterId,
      'success',
      title,
      message,
      relatedEntity,
      'medium'
    );
  }

  /**
   * Create workflow rejection notification
   * @param {string} requesterId - Requester user ID
   * @param {Object} workflowInstance - Workflow instance data
   * @param {string} reason - Rejection reason
   */
  async createWorkflowRejectionNotification(requesterId, workflowInstance, reason) {
    const title = `Workflow Rejected: ${workflowInstance.request_type}`;
    const message = `Your ${workflowInstance.request_type} request has been rejected. Reason: ${reason}`;
    
    const relatedEntity = {
      type: 'workflow_instance',
      id: workflowInstance.id,
      metadata: {
        workflow_id: workflowInstance.workflow_id,
        request_type: workflowInstance.request_type,
        rejection_reason: reason,
        rejected_at: workflowInstance.completed_at
      }
    };

    return await this.createNotification(
      requesterId,
      'error',
      title,
      message,
      relatedEntity,
      'high'
    );
  }

  /**
   * Create system announcement notification
   * @param {string} title - Announcement title
   * @param {string} message - Announcement message
   * @param {string} priority - Priority level
   */
  async createSystemAnnouncement(title, message, priority = 'medium') {
    try {
      // Get all active users
      const usersResult = await db.query('users', 'select', {
        filters: [{ column: 'is_active', operator: 'eq', value: true }],
        columns: 'id'
      });

      if (usersResult.error) {
        throw new Error(`Failed to get users: ${usersResult.error.message}`);
      }

      const users = usersResult.data || [];
      const notifications = [];

      // Create notification for each user
      for (const user of users) {
        const notificationData = {
          user_id: user.id,
          type: 'announcement',
          title: title,
          message: message,
          priority: priority,
          is_read: false,
          related_entity_type: 'system_announcement',
          related_entity_id: null,
          metadata: { announcement_type: 'system' },
          created_at: new Date().toISOString()
        };

        notifications.push(notificationData);
      }

      // Batch insert notifications
      const result = await db.query('notifications', 'insert', {
        data: notifications
      });

      if (result.error) {
        throw new Error(`Failed to create system announcement: ${result.error.message}`);
      }

      return {
        data: result.data,
        error: null
      };
    } catch (error) {
      console.error('Error creating system announcement:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Create project update notification
   * @param {string} userId - User ID
   * @param {Object} project - Project data
   * @param {string} updateType - Type of update
   */
  async createProjectUpdateNotification(userId, project, updateType) {
    const title = `Project Update: ${project.name}`;
    let message = '';
    
    switch (updateType) {
      case 'progress':
        message = `Project "${project.name}" progress updated to ${project.progress}%`;
        break;
      case 'budget':
        message = `Project "${project.name}" budget has been updated`;
        break;
      case 'status':
        message = `Project "${project.name}" status changed to ${project.status}`;
        break;
      default:
        message = `Project "${project.name}" has been updated`;
    }

    const relatedEntity = {
      type: 'project',
      id: project.id,
      metadata: {
        project_name: project.name,
        update_type: updateType,
        updated_at: new Date().toISOString()
      }
    };

    return await this.createNotification(
      userId,
      'info',
      title,
      message,
      relatedEntity,
      'medium'
    );
  }

  /**
   * Unsubscribe from user notifications
   * @param {string} userId - User ID
   */
  unsubscribeFromUserNotifications(userId) {
    const subscriptionKey = `user_${userId}`;
    const subscription = this.subscriptions.get(subscriptionKey);
    
    if (subscription && subscription.unsubscribe) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    }
  }

  /**
   * Unsubscribe from all notifications
   */
  unsubscribeAll() {
    this.subscriptions.forEach((subscription, key) => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    });
    this.subscriptions.clear();
  }

  /**
   * Get notification statistics for user
   * @param {string} userId - User ID
   */
  async getNotificationStats(userId) {
    try {
      const [unreadResult, totalResult, recentResult] = await Promise.all([
        this.getUnreadCount(userId),
        this.getUserNotifications(userId, { limit: 1, count: true }),
        this.getUserNotifications(userId, { 
          filters: [
            { column: 'created_at', operator: 'gte', value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
          ],
          count: true
        })
      ]);

      return {
        data: {
          unread: unreadResult.data || 0,
          total: totalResult.count || 0,
          recent: recentResult.count || 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        data: { unread: 0, total: 0, recent: 0 },
        error: error.message
      };
    }
  }
}
