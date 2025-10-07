import { db } from './supabaseClient';

// Activity logging service
export class ActivityService {
  // Get all system activities
  async getAllActivities(filters = {}) {
    const options = {
      columns: `
        id, user_id, username, action, description, entity_type, entity_id, 
        old_values, new_values, ip_address, user_agent, session_id, created_at,
        user:users!user_id(full_name, username, role)
      `,
      orderBy: { column: 'created_at', ascending: false },
      ...filters
    };
    
    return await db.query('system_activities', 'select', options);
  }

  // Get activities by user
  async getActivitiesByUser(userId) {
    const options = {
      filters: [{ column: 'user_id', operator: 'eq', value: userId }],
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('system_activities', 'select', options);
  }

  // Get recent activities
  async getRecentActivities(limit = 50) {
    const options = {
      limit,
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('system_activities', 'select', options);
  }

  // Get activities by action
  async getActivitiesByAction(action) {
    const options = {
      filters: [{ column: 'action', operator: 'eq', value: action }],
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('system_activities', 'select', options);
  }

  // Get activities by entity
  async getActivitiesByEntity(entityType, entityId) {
    const options = {
      filters: [
        { column: 'entity_type', operator: 'eq', value: entityType },
        { column: 'entity_id', operator: 'eq', value: entityId }
      ],
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('system_activities', 'select', options);
  }

  // Log activity
  async logActivity(activityData) {
    const options = {
      data: {
        ...activityData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('system_activities', 'insert', options);
  }

  // Log user activity
  async logUserActivity(userId, username, action, description, metadata = {}) {
    return await this.logActivity({
      user_id: userId,
      username,
      action,
      description,
      entity_type: metadata.entityType,
      entity_id: metadata.entityId,
      old_values: metadata.oldValues,
      new_values: metadata.newValues,
      ip_address: metadata.ipAddress,
      user_agent: metadata.userAgent,
      session_id: metadata.sessionId
    });
  }

  // Log login activity
  async logLogin(userId, username, ipAddress, userAgent) {
    return await this.logUserActivity(
      userId,
      username,
      'LOGIN',
      'User logged in successfully',
      { ipAddress, userAgent }
    );
  }

  // Log logout activity
  async logLogout(userId, username, ipAddress, userAgent) {
    return await this.logUserActivity(
      userId,
      username,
      'LOGOUT',
      'User logged out',
      { ipAddress, userAgent }
    );
  }

  // Log data change activity
  async logDataChange(userId, username, entityType, entityId, action, oldValues, newValues) {
    return await this.logUserActivity(
      userId,
      username,
      `${action}_${entityType.toUpperCase()}`,
      `${action} ${entityType}`,
      {
        entityType,
        entityId,
        oldValues,
        newValues
      }
    );
  }

  // Get audit logs
  async getAuditLogs(filters = {}) {
    const options = {
      columns: `
        id, user_id, action, resource, resource_id, details, ip_address, 
        user_agent, severity, created_at,
        user:users!user_id(full_name, username, role)
      `,
      orderBy: { column: 'created_at', ascending: false },
      ...filters
    };
    
    return await db.query('audit_logs', 'select', options);
  }

  // Log audit event
  async logAuditEvent(auditData) {
    const options = {
      data: {
        ...auditData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('audit_logs', 'insert', options);
  }

  // Get user sessions
  async getUserSessions(userId) {
    const options = {
      filters: [{ column: 'user_id', operator: 'eq', value: userId }],
      orderBy: { column: 'login_time', ascending: false }
    };
    
    return await db.query('user_sessions', 'select', options);
  }

  // Get active sessions
  async getActiveSessions() {
    const options = {
      filters: [{ column: 'is_active', operator: 'eq', value: true }],
      orderBy: { column: 'login_time', ascending: false }
    };
    
    return await db.query('user_sessions', 'select', options);
  }

  // Create user session
  async createUserSession(sessionData) {
    const options = {
      data: {
        ...sessionData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('user_sessions', 'insert', options);
  }

  // Update user session
  async updateUserSession(sessionId, updateData) {
    const options = {
      data: updateData,
      filters: [{ column: 'id', operator: 'eq', value: sessionId }]
    };
    
    return await db.query('user_sessions', 'update', options);
  }

  // End user session
  async endUserSession(sessionId) {
    return await this.updateUserSession(sessionId, {
      logout_time: new Date().toISOString(),
      is_active: false
    });
  }

  // Get data changes
  async getDataChanges(tableName = null, recordId = null) {
    const options = {
      columns: `
        id, table_name, record_id, operation, old_data, new_data, 
        changed_by, changed_at, ip_address, user_agent,
        changer:users!changed_by(full_name, username)
      `,
      orderBy: { column: 'changed_at', ascending: false }
    };
    
    if (tableName) {
      options.filters = [{ column: 'table_name', operator: 'eq', value: tableName }];
    }
    
    if (recordId) {
      options.filters = [
        ...(options.filters || []),
        { column: 'record_id', operator: 'eq', value: recordId }
      ];
    }
    
    return await db.query('data_changes', 'select', options);
  }

  // Get error logs
  async getErrorLogs(filters = {}) {
    const options = {
      columns: `
        id, user_id, error_type, error_message, stack_trace, request_url, 
        request_method, ip_address, user_agent, severity, resolved, 
        resolved_by, resolved_at, created_at,
        user:users!user_id(full_name, username),
        resolver:users!resolved_by(full_name, username)
      `,
      orderBy: { column: 'created_at', ascending: false },
      ...filters
    };
    
    return await db.query('error_logs', 'select', options);
  }

  // Log error
  async logError(errorData) {
    const options = {
      data: {
        ...errorData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('error_logs', 'insert', options);
  }

  // Resolve error
  async resolveError(errorId, resolvedBy) {
    const options = {
      data: {
        resolved: true,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: errorId }]
    };
    
    return await db.query('error_logs', 'update', options);
  }

  // Get performance logs
  async getPerformanceLogs(filters = {}) {
    const options = {
      columns: `
        id, operation, duration_ms, user_id, request_id, details, created_at,
        user:users!user_id(full_name, username)
      `,
      orderBy: { column: 'created_at', ascending: false },
      ...filters
    };
    
    return await db.query('performance_logs', 'select', options);
  }

  // Log performance
  async logPerformance(performanceData) {
    const options = {
      data: {
        ...performanceData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('performance_logs', 'insert', options);
  }

  // Get system metrics
  async getSystemMetrics(metricName = null) {
    const options = {
      columns: 'id, metric_name, metric_value, metric_unit, tags, recorded_at',
      orderBy: { column: 'recorded_at', ascending: false }
    };
    
    if (metricName) {
      options.filters = [{ column: 'metric_name', operator: 'eq', value: metricName }];
    }
    
    return await db.query('system_metrics', 'select', options);
  }

  // Log system metric
  async logSystemMetric(metricData) {
    const options = {
      data: {
        ...metricData,
        recorded_at: new Date().toISOString()
      }
    };
    
    return await db.query('system_metrics', 'insert', options);
  }

  // Get activity statistics
  async getActivityStats() {
    try {
      const [totalActivities, recentActivities, activitiesByAction] = await Promise.all([
        db.query('system_activities', 'select', { columns: 'count' }),
        db.query('system_activities', 'select', { 
          filters: [{ 
            column: 'created_at', 
            operator: 'gte', 
            value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() 
          }],
          columns: 'count'
        }),
        db.query('system_activities', 'select', { 
          columns: 'action, count(*)',
          orderBy: { column: 'action', ascending: true }
        })
      ]);

      return {
        data: {
          totalActivities: totalActivities.data?.length || 0,
          recentActivities: recentActivities.data?.length || 0,
          activitiesByAction: activitiesByAction.data || []
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Subscribe to system activities
  subscribeToActivities(callback) {
    return db.subscribe('system_activities', callback);
  }

  // Subscribe to audit logs
  subscribeToAuditLogs(callback) {
    return db.subscribe('audit_logs', callback);
  }

  // Subscribe to error logs
  subscribeToErrorLogs(callback) {
    return db.subscribe('error_logs', callback);
  }
}

export const activityService = new ActivityService();
export default activityService;
