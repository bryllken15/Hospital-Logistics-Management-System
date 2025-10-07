import { db } from './supabaseClient';

// User management service
export class UserService {
  // Get all users with optional filtering
  async getAllUsers(filters = {}) {
    const options = {
      columns: 'id, username, email, full_name, role, is_active, last_login, created_at',
      orderBy: { column: 'created_at', ascending: false },
      ...filters
    };
    
    return await db.query('users', 'select', options);
  }

  // Get user by ID
  async getUserById(userId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: userId }],
      limit: 1
    };
    
    const result = await db.query('users', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Get user by username
  async getUserByUsername(username) {
    const options = {
      filters: [{ column: 'username', operator: 'eq', value: username }],
      limit: 1
    };
    
    const result = await db.query('users', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create new user
  async createUser(userData) {
    const options = {
      data: {
        ...userData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('users', 'insert', options);
  }

  // Update user
  async updateUser(userId, updateData) {
    const options = {
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: userId }]
    };
    
    return await db.query('users', 'update', options);
  }

  // Update user status (active/inactive)
  async updateUserStatus(userId, isActive) {
    return await this.updateUser(userId, { is_active: isActive });
  }

  // Update last login
  async updateLastLogin(userId) {
    return await this.updateUser(userId, { 
      last_login: new Date().toISOString() 
    });
  }

  // Get users by role
  async getUsersByRole(role) {
    const options = {
      filters: [{ column: 'role', operator: 'eq', value: role }],
      orderBy: { column: 'full_name', ascending: true }
    };
    
    return await db.query('users', 'select', options);
  }

  // Get active users
  async getActiveUsers() {
    const options = {
      filters: [{ column: 'is_active', operator: 'eq', value: true }],
      orderBy: { column: 'full_name', ascending: true }
    };
    
    return await db.query('users', 'select', options);
  }

  // Search users
  async searchUsers(searchTerm) {
    const options = {
      filters: [
        { column: 'full_name', operator: 'ilike', value: `%${searchTerm}%` },
        { column: 'username', operator: 'ilike', value: `%${searchTerm}%` },
        { column: 'email', operator: 'ilike', value: `%${searchTerm}%` }
      ],
      orderBy: { column: 'full_name', ascending: true }
    };
    
    return await db.query('users', 'select', options);
  }

  // Get user statistics
  async getUserStats() {
    try {
      const [totalUsers, activeUsers, usersByRole] = await Promise.all([
        db.query('users', 'select', { columns: 'count' }),
        db.query('users', 'select', { 
          filters: [{ column: 'is_active', operator: 'eq', value: true }],
          columns: 'count'
        }),
        db.query('users', 'select', { 
          columns: 'role, count(*)',
          orderBy: { column: 'role', ascending: true }
        })
      ]);

      return {
        data: {
          total: totalUsers.data?.length || 0,
          active: activeUsers.data?.length || 0,
          inactive: (totalUsers.data?.length || 0) - (activeUsers.data?.length || 0),
          byRole: usersByRole.data || []
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Subscribe to user changes
  subscribeToUsers(callback) {
    return db.subscribe('users', callback);
  }

  // Subscribe to user activities
  subscribeToUserActivities(callback) {
    return db.subscribe('user_activities', callback);
  }
}

export const userService = new UserService();
export default userService;
