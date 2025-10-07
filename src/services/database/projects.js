import { db } from './supabaseClient';

// Project management service
export class ProjectService {
  // Get all projects with optional filtering
  async getAllProjects(filters = {}) {
    const options = {
      columns: `
        id, name, description, status, progress, start_date, end_date, 
        budget, spent, department, project_manager_id, created_by, created_at, updated_at,
        project_manager:users!project_manager_id(full_name, username)
      `,
      orderBy: { column: 'created_at', ascending: false },
      ...filters
    };
    
    return await db.query('projects', 'select', options);
  }

  // Get project by ID
  async getProjectById(projectId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: projectId }],
      limit: 1
    };
    
    const result = await db.query('projects', 'select', options);
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }

  // Create new project
  async createProject(projectData) {
    const options = {
      data: {
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('projects', 'insert', options);
  }

  // Update project
  async updateProject(projectId, updateData) {
    const options = {
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: projectId }]
    };
    
    return await db.query('projects', 'update', options);
  }

  // Update project progress
  async updateProjectProgress(projectId, progress) {
    return await this.updateProject(projectId, { progress });
  }

  // Update project status
  async updateProjectStatus(projectId, status) {
    return await this.updateProject(projectId, { status });
  }

  // Get projects by status
  async getProjectsByStatus(status) {
    const options = {
      filters: [{ column: 'status', operator: 'eq', value: status }],
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('projects', 'select', options);
  }

  // Get projects by department
  async getProjectsByDepartment(department) {
    const options = {
      filters: [{ column: 'department', operator: 'eq', value: department }],
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('projects', 'select', options);
  }

  // Get project statistics
  async getProjectStats() {
    try {
      const [totalProjects, activeProjects, completedProjects, totalBudget] = await Promise.all([
        db.query('projects', 'select', { columns: 'count' }),
        db.query('projects', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'in_progress' }],
          columns: 'count'
        }),
        db.query('projects', 'select', { 
          filters: [{ column: 'status', operator: 'eq', value: 'completed' }],
          columns: 'count'
        }),
        db.query('projects', 'select', { 
          columns: 'budget, spent'
        })
      ]);

      const totalBudgetAmount = totalBudget.data?.reduce((sum, project) => sum + (project.budget || 0), 0) || 0;
      const totalSpentAmount = totalBudget.data?.reduce((sum, project) => sum + (project.spent || 0), 0) || 0;

      return {
        data: {
          total: totalProjects.data?.length || 0,
          active: activeProjects.data?.length || 0,
          completed: completedProjects.data?.length || 0,
          totalBudget: totalBudgetAmount,
          totalSpent: totalSpentAmount,
          remainingBudget: totalBudgetAmount - totalSpentAmount
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Get project progress data for charts
  async getProjectProgressData() {
    const options = {
      columns: 'name, progress, status',
      orderBy: { column: 'progress', ascending: false }
    };
    
    return await db.query('projects', 'select', options);
  }

  // Get budget vs spending data
  async getBudgetSpendingData() {
    const options = {
      columns: 'name, budget, spent, start_date, end_date',
      orderBy: { column: 'start_date', ascending: true }
    };
    
    return await db.query('projects', 'select', options);
  }

  // Staff assignments
  async getStaffAssignments(projectId) {
    const options = {
      filters: [{ column: 'project_id', operator: 'eq', value: projectId }],
      columns: `
        id, project_id, user_id, role_in_project, assigned_date, status,
        user:users!user_id(full_name, username, role)
      `,
      orderBy: { column: 'assigned_date', ascending: false }
    };
    
    return await db.query('staff_assignments', 'select', options);
  }

  // Assign staff to project
  async assignStaff(projectId, userId, roleInProject) {
    const options = {
      data: {
        project_id: projectId,
        user_id: userId,
        role_in_project: roleInProject,
        assigned_date: new Date().toISOString().split('T')[0],
        status: 'active'
      }
    };
    
    return await db.query('staff_assignments', 'insert', options);
  }

  // Remove staff from project
  async removeStaff(assignmentId) {
    const options = {
      data: { status: 'removed' },
      filters: [{ column: 'id', operator: 'eq', value: assignmentId }]
    };
    
    return await db.query('staff_assignments', 'update', options);
  }

  // Project logistics
  async getProjectLogistics(projectId) {
    const options = {
      filters: [{ column: 'project_id', operator: 'eq', value: projectId }],
      columns: `
        id, project_id, item_name, item_description, quantity, status, 
        delivery_date, assigned_staff_id, location, rfid_code, created_at, updated_at,
        assigned_staff:users!assigned_staff_id(full_name, username)
      `,
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('project_logistics', 'select', options);
  }

  // Add logistics item
  async addLogisticsItem(projectId, logisticsData) {
    const options = {
      data: {
        project_id: projectId,
        ...logisticsData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('project_logistics', 'insert', options);
  }

  // Update logistics status
  async updateLogisticsStatus(logisticsId, status) {
    const options = {
      data: { 
        status,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: logisticsId }]
    };
    
    return await db.query('project_logistics', 'update', options);
  }

  // Project tasks
  async getProjectTasks(projectId) {
    const options = {
      filters: [{ column: 'project_id', operator: 'eq', value: projectId }],
      columns: `
        id, project_id, task_name, description, status, priority, 
        assigned_to, due_date, completed_date, created_at, updated_at,
        assigned_user:users!assigned_to(full_name, username)
      `,
      orderBy: { column: 'due_date', ascending: true }
    };
    
    return await db.query('project_tasks', 'select', options);
  }

  // Create project task
  async createTask(projectId, taskData) {
    const options = {
      data: {
        project_id: projectId,
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return await db.query('project_tasks', 'insert', options);
  }

  // Update task status
  async updateTaskStatus(taskId, status) {
    const updateData = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'completed') {
      updateData.completed_date = new Date().toISOString();
    }
    
    const options = {
      data: updateData,
      filters: [{ column: 'id', operator: 'eq', value: taskId }]
    };
    
    return await db.query('project_tasks', 'update', options);
  }

  // Subscribe to project changes
  subscribeToProjects(callback) {
    return db.subscribe('projects', callback);
  }

  // Subscribe to staff assignments
  subscribeToStaffAssignments(callback) {
    return db.subscribe('staff_assignments', callback);
  }

  // Subscribe to project logistics
  subscribeToProjectLogistics(callback) {
    return db.subscribe('project_logistics', callback);
  }

  // Delete project
  async deleteProject(projectId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: projectId }]
    };
    
    return await db.query('projects', 'delete', options);
  }

  // Get projects with advanced filtering
  async getProjectsWithFilters(filters = {}) {
    const {
      status,
      department,
      projectManager,
      search,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0
    } = filters;

    const queryFilters = [];
    
    if (status) queryFilters.push({ column: 'status', operator: 'eq', value: status });
    if (department) queryFilters.push({ column: 'department', operator: 'eq', value: department });
    if (projectManager) queryFilters.push({ column: 'project_manager_id', operator: 'eq', value: projectManager });
    if (dateFrom) queryFilters.push({ column: 'start_date', operator: 'gte', value: dateFrom });
    if (dateTo) queryFilters.push({ column: 'end_date', operator: 'lte', value: dateTo });
    if (search) {
      queryFilters.push({ column: 'name', operator: 'ilike', value: `%${search}%` });
    }

    const options = {
      columns: `
        id, name, description, status, progress, start_date, end_date, 
        budget, spent, department, project_manager_id, created_by, created_at, updated_at,
        project_manager:users!project_manager_id(full_name, username)
      `,
      filters: queryFilters,
      orderBy: { column: 'created_at', ascending: false },
      limit,
      offset
    };
    
    return await db.query('projects', 'select', options);
  }

  // Get user's assigned projects
  async getUserProjects(userId) {
    const options = {
      filters: [{ column: 'user_id', operator: 'eq', value: userId }],
      columns: `
        id, project_id, role_in_project, assigned_date, status,
        project:projects!project_id(name, description, status, progress, start_date, end_date)
      `,
      orderBy: { column: 'assigned_date', ascending: false }
    };
    
    return await db.query('staff_assignments', 'select', options);
  }

  // Update staff assignment status
  async updateStaffAssignmentStatus(assignmentId, status) {
    const options = {
      data: { 
        status,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: assignmentId }]
    };
    
    return await db.query('staff_assignments', 'update', options);
  }

  // Get project logistics with filtering
  async getLogisticsWithFilters(projectId, filters = {}) {
    const {
      status,
      assignedStaff,
      search,
      limit = 50,
      offset = 0
    } = filters;

    const queryFilters = [{ column: 'project_id', operator: 'eq', value: projectId }];
    
    if (status) queryFilters.push({ column: 'status', operator: 'eq', value: status });
    if (assignedStaff) queryFilters.push({ column: 'assigned_staff_id', operator: 'eq', value: assignedStaff });
    if (search) {
      queryFilters.push({ column: 'item_name', operator: 'ilike', value: `%${search}%` });
    }

    const options = {
      columns: `
        id, project_id, item_name, item_description, quantity, status, 
        delivery_date, assigned_staff_id, location, rfid_code, created_at, updated_at,
        assigned_staff:users!assigned_staff_id(full_name, username)
      `,
      filters: queryFilters,
      orderBy: { column: 'created_at', ascending: false },
      limit,
      offset
    };
    
    return await db.query('project_logistics', 'select', options);
  }

  // Update logistics item
  async updateLogisticsItem(logisticsId, updateData) {
    const options = {
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: logisticsId }]
    };
    
    return await db.query('project_logistics', 'update', options);
  }

  // Delete logistics item
  async deleteLogisticsItem(logisticsId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: logisticsId }]
    };
    
    return await db.query('project_logistics', 'delete', options);
  }

  // Get project tasks with filtering
  async getTasksWithFilters(projectId, filters = {}) {
    const {
      status,
      priority,
      assignedTo,
      search,
      limit = 50,
      offset = 0
    } = filters;

    const queryFilters = [{ column: 'project_id', operator: 'eq', value: projectId }];
    
    if (status) queryFilters.push({ column: 'status', operator: 'eq', value: status });
    if (priority) queryFilters.push({ column: 'priority', operator: 'eq', value: priority });
    if (assignedTo) queryFilters.push({ column: 'assigned_to', operator: 'eq', value: assignedTo });
    if (search) {
      queryFilters.push({ column: 'task_name', operator: 'ilike', value: `%${search}%` });
    }

    const options = {
      columns: `
        id, project_id, task_name, description, status, priority, 
        assigned_to, due_date, completed_date, created_at, updated_at,
        assigned_user:users!assigned_to(full_name, username)
      `,
      filters: queryFilters,
      orderBy: { column: 'due_date', ascending: true },
      limit,
      offset
    };
    
    return await db.query('project_tasks', 'select', options);
  }

  // Update task
  async updateTask(taskId, updateData) {
    const options = {
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: taskId }]
    };
    
    return await db.query('project_tasks', 'update', options);
  }

  // Delete task
  async deleteTask(taskId) {
    const options = {
      filters: [{ column: 'id', operator: 'eq', value: taskId }]
    };
    
    return await db.query('project_tasks', 'delete', options);
  }

  // Get user's assigned tasks
  async getUserTasks(userId, projectId = null) {
    const queryFilters = [{ column: 'assigned_to', operator: 'eq', value: userId }];
    
    if (projectId) {
      queryFilters.push({ column: 'project_id', operator: 'eq', value: projectId });
    }

    const options = {
      filters: queryFilters,
      columns: `
        id, project_id, task_name, description, status, priority, 
        assigned_to, due_date, completed_date, created_at, updated_at,
        project:projects!project_id(name, description, status)
      `,
      orderBy: { column: 'due_date', ascending: true }
    };
    
    return await db.query('project_tasks', 'select', options);
  }

  // Project budget tracking
  async getProjectBudget(projectId) {
    const options = {
      filters: [{ column: 'project_id', operator: 'eq', value: projectId }],
      columns: `
        id, project_id, category, amount, description, transaction_type, 
        created_by, created_at,
        creator:users!created_by(full_name, username)
      `,
      orderBy: { column: 'created_at', ascending: false }
    };
    
    return await db.query('project_budget_tracking', 'select', options);
  }

  // Add budget transaction
  async addBudgetTransaction(projectId, transactionData) {
    const options = {
      data: {
        project_id: projectId,
        ...transactionData,
        created_at: new Date().toISOString()
      }
    };
    
    return await db.query('project_budget_tracking', 'insert', options);
  }

  // Update project budget
  async updateProjectBudget(projectId, spentAmount) {
    const options = {
      data: { 
        spent: spentAmount,
        updated_at: new Date().toISOString()
      },
      filters: [{ column: 'id', operator: 'eq', value: projectId }]
    };
    
    return await db.query('projects', 'update', options);
  }

  // Get budget summary
  async getBudgetSummary(projectId) {
    try {
      const [project, budgetTransactions] = await Promise.all([
        this.getProjectById(projectId),
        this.getProjectBudget(projectId)
      ]);

      if (project.error || !project.data) {
        return { data: null, error: 'Project not found' };
      }

      const totalBudget = project.data.budget || 0;
      const totalSpent = project.data.spent || 0;
      const remainingBudget = totalBudget - totalSpent;

      const expenses = budgetTransactions.data?.filter(t => t.transaction_type === 'expense') || [];
      const income = budgetTransactions.data?.filter(t => t.transaction_type === 'income') || [];
      const adjustments = budgetTransactions.data?.filter(t => t.transaction_type === 'adjustment') || [];

      const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalIncome = income.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalAdjustments = adjustments.reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        data: {
          totalBudget,
          totalSpent,
          remainingBudget,
          totalExpenses,
          totalIncome,
          totalAdjustments,
          budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
          transactions: budgetTransactions.data || []
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Get project timeline
  async getProjectTimeline(projectId) {
    const options = {
      filters: [{ column: 'project_id', operator: 'eq', value: projectId }],
      columns: `
        id, task_name, status, due_date, completed_date, priority,
        assigned_user:users!assigned_to(full_name, username)
      `,
      orderBy: { column: 'due_date', ascending: true }
    };
    
    return await db.query('project_tasks', 'select', options);
  }

  // Get project team members
  async getProjectTeam(projectId) {
    const options = {
      filters: [
        { column: 'project_id', operator: 'eq', value: projectId },
        { column: 'status', operator: 'eq', value: 'active' }
      ],
      columns: `
        id, user_id, role_in_project, assigned_date,
        user:users!user_id(full_name, username, role, email)
      `,
      orderBy: { column: 'assigned_date', ascending: false }
    };
    
    return await db.query('staff_assignments', 'select', options);
  }

  // Subscribe to project tasks
  subscribeToProjectTasks(callback) {
    return db.subscribe('project_tasks', callback);
  }

  // Subscribe to budget tracking
  subscribeToBudgetTracking(callback) {
    return db.subscribe('project_budget_tracking', callback);
  }
}

export const projectService = new ProjectService();
export default projectService;
