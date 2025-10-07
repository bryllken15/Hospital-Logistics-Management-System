import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../shared/Notification';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import NotificationCenter from '../shared/NotificationCenter';
import { LoadingSkeleton, DashboardSkeleton } from '../shared/LoadingSkeleton';
import { ProjectService } from '../../services/database/projects';
import { WorkflowService } from '../../services/database/workflows';
import { RealtimeService } from '../../services/database/realtime';
import { WorkflowEngine } from '../../services/workflow/WorkflowEngine';
import { NotificationService } from '../../services/notifications/NotificationService';
import { 
  FolderOpen, 
  Calendar, 
  Users, 
  CheckCircle,
  Plus,
  Edit,
  Eye,
  Truck,
  Package,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  FileText,
  DollarSign,
  X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ProjectManagerDashboard = () => {
  const { user, logActivity, useDatabase } = useAuth();
  const { showSuccess, showError, showInfo, showWorkflow } = useNotification();
  
  // State for data
  const [projects, setProjects] = useState([]);
  const [logistics, setLogistics] = useState([]);
  const [staff, setStaff] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for UI
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalComments, setApprovalComments] = useState('');
  
  // State for new project form
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    department: ''
  });

  // Real-time stats
  const [realTimeStats, setRealTimeStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    pendingApprovals: 0
  });

  // Initialize services
  const projectService = useRef(new ProjectService());
  const workflowService = useRef(new WorkflowService());
  const workflowEngine = useRef(new WorkflowEngine());
  const realtimeService = useRef(new RealtimeService());
  const notificationService = useRef(new NotificationService());
  const subscriptions = useRef([]);

  useEffect(() => {
    loadData();
    setupRealTimeSubscriptions();
    
    return () => {
      subscriptions.current.forEach(sub => {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      });
    };
  }, [useDatabase]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (useDatabase) {
        // Load projects from database
        const projectsResult = await projectService.current.getAllProjects();
        if (projectsResult.error) {
          console.error('Error loading projects:', projectsResult.error);
          showError('Failed to load projects data');
        } else {
          setProjects(projectsResult.data || []);
        }

        // Load pending approvals
        const approvalsResult = await workflowEngine.current.getUserPendingApprovals(user.id, user.role);
        if (approvalsResult.error) {
          console.error('Error loading pending approvals:', approvalsResult.error);
        } else {
          setPendingApprovals(approvalsResult.data || []);
        }

        // Load staff data (mock for now - would need staff service)
        setStaff([
          { id: 1, name: 'John Smith', role: 'Employee', department: 'Emergency', availability: 'available' },
          { id: 2, name: 'Sarah Johnson', role: 'Maintenance', department: 'ICU', availability: 'busy' },
          { id: 3, name: 'Mike Wilson', role: 'Employee', department: 'Pharmacy', availability: 'available' }
        ]);

        // Load logistics data (mock for now - would need logistics service)
        setLogistics([
          { id: 1, projectId: 1, projectName: 'Emergency Ward Renovation', item: 'Medical Equipment - Ventilators', quantity: 5, status: 'delivered', deliveryDate: '2024-01-15', assignedStaff: 'John Smith', location: 'Emergency Ward - Room 101' },
          { id: 2, projectId: 1, projectName: 'Emergency Ward Renovation', item: 'Construction Materials - Flooring', quantity: 10, status: 'in_transit', deliveryDate: '2024-01-20', assignedStaff: 'Sarah Johnson', location: 'Emergency Ward - Room 102' }
        ]);
      } else {
        // Fallback to mock data
        loadMockData();
      }
      
      updateRealTimeStats();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, useDatabase, showError]);

  const loadMockData = () => {
    // Mock projects data
    setProjects([
      {
        id: 1,
        name: 'Emergency Ward Renovation',
        description: 'Complete renovation of emergency ward with new equipment',
        status: 'in_progress',
        progress: 65,
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        budget: 150000,
        spent: 97500,
        department: 'Emergency',
        assignedStaff: ['employee1', 'maintenance1']
      },
      {
        id: 2,
        name: 'New ICU Equipment Setup',
        description: 'Installation and setup of new ICU monitoring equipment',
        status: 'planning',
        progress: 20,
        startDate: '2024-02-01',
        endDate: '2024-04-30',
        budget: 200000,
        spent: 40000,
        department: 'ICU',
        assignedStaff: ['employee1', 'procurement1']
      },
      {
        id: 3,
        name: 'Pharmacy Automation System',
        description: 'Implementation of automated pharmacy management system',
        status: 'completed',
        progress: 100,
        startDate: '2023-10-01',
        endDate: '2023-12-31',
        budget: 80000,
        spent: 78000,
        department: 'Pharmacy',
        assignedStaff: ['document1']
      }
    ]);

    // Mock logistics data
    setLogistics([
      {
        id: 1,
        projectId: 1,
        projectName: 'Emergency Ward Renovation',
        item: 'Medical Equipment - Ventilators',
        quantity: 5,
        status: 'delivered',
        deliveryDate: '2024-01-15',
        assignedStaff: 'employee1',
        location: 'Emergency Ward - Room 101'
      },
      {
        id: 2,
        projectId: 1,
        projectName: 'Emergency Ward Renovation',
        item: 'Construction Materials - Flooring',
        quantity: 200,
        status: 'in_transit',
        deliveryDate: '2024-01-20',
        assignedStaff: 'employee1',
        location: 'Emergency Ward - Main Hall'
      },
      {
        id: 3,
        projectId: 2,
        projectName: 'New ICU Equipment Setup',
        item: 'ICU Monitoring Systems',
        quantity: 10,
        status: 'scheduled',
        deliveryDate: '2024-02-05',
        assignedStaff: 'employee1',
        location: 'ICU - All Rooms'
      }
    ]);

    // Mock staff data
    setStaff([
      {
        id: 1,
        name: 'Sarah Warehouse',
        role: 'Employee',
        department: 'Warehouse',
        availability: 'available',
        currentProject: 'Emergency Ward Renovation',
        skills: ['Inventory Management', 'RFID Tracking', 'Delivery Coordination']
      },
      {
        id: 2,
        name: 'Mike Procurement',
        role: 'Procurement Staff',
        department: 'Procurement',
        availability: 'busy',
        currentProject: 'New ICU Equipment Setup',
        skills: ['Supplier Management', 'Purchase Orders', 'Cost Analysis']
      },
      {
        id: 3,
        name: 'David Maintenance',
        role: 'Maintenance Staff',
        department: 'Maintenance',
        availability: 'available',
        currentProject: 'Emergency Ward Renovation',
        skills: ['Equipment Installation', 'Technical Support', 'Asset Management']
      }
    ]);
  };

  const updateRealTimeStats = useCallback(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const pendingApprovalsCount = pendingApprovals.length;
    
    setRealTimeStats({
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      pendingApprovals: pendingApprovalsCount
    });
  }, [projects, pendingApprovals]);

  const setupRealTimeSubscriptions = useCallback(() => {
    if (!useDatabase) return;

    subscriptions.current.forEach(sub => {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    });
    subscriptions.current = [];

    // Subscribe to projects changes
    const projectsSub = realtimeService.current.subscribe('projects', (payload) => {
      console.log('Projects table updated:', payload);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        loadData();
        showInfo('Projects data updated in real-time');
      }
    });

    // Subscribe to workflow instances for pending approvals
    const workflowSub = realtimeService.current.subscribe('workflow_instances', (payload) => {
      console.log('Workflow instances updated:', payload);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        loadData();
        showWorkflow('New workflow approval request received');
      }
    });

    // Subscribe to notifications
    const notificationsSub = realtimeService.current.subscribe('notifications', (payload) => {
      console.log('Notifications updated:', payload);
      if (payload.eventType === 'INSERT') {
        showInfo('New notification received');
      }
    });

    if (projectsSub) subscriptions.current.push(projectsSub);
    if (workflowSub) subscriptions.current.push(workflowSub);
    if (notificationsSub) subscriptions.current.push(notificationsSub);
  }, [useDatabase, loadData, showInfo, showWorkflow]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      if (useDatabase) {
        const projectData = {
          name: newProject.name,
          description: newProject.description,
          start_date: newProject.startDate,
          end_date: newProject.endDate,
          budget: parseFloat(newProject.budget),
          spent: 0,
          progress: 0,
          status: 'planning',
          department: newProject.department,
          project_manager_id: user.id,
          created_by: user.id
        };

        const result = await projectService.current.createProject(projectData);
        if (result.error) {
          throw new Error(result.error.message);
        }

        showSuccess('Project created successfully');
      } else {
        // Fallback to local state
        const project = {
          id: projects.length + 1,
          ...newProject,
          budget: parseFloat(newProject.budget),
          spent: 0,
          progress: 0,
          status: 'planning',
          assignedStaff: []
        };
        
        setProjects(prev => [project, ...prev]);
        showSuccess('Project created successfully');
      }
      
      setNewProject({ name: '', description: '', startDate: '', endDate: '', budget: '', department: '' });
      setShowCreateProject(false);
      
      await logActivity(user.username, 'PROJECT_CREATE', `Created project: ${newProject.name}`);
    } catch (error) {
      console.error('Error creating project:', error);
      showError('Failed to create project');
    }
  };

  // Approval workflow functions
  const handleApproveRequest = async (workflowInstanceId) => {
    try {
      const result = await workflowEngine.current.approveStep(
        workflowInstanceId, 
        user.id, 
        approvalComments
      );
      
      if (result.error) {
        throw new Error(result.error);
      }

      showSuccess('Request approved successfully');
      setShowApprovalModal(false);
      setSelectedApproval(null);
      setApprovalComments('');
      
      // Reload data to get updated approvals
      await loadData();
    } catch (error) {
      console.error('Error approving request:', error);
      showError('Failed to approve request');
    }
  };

  const handleRejectRequest = async (workflowInstanceId, reason) => {
    try {
      const result = await workflowEngine.current.rejectWorkflow(
        workflowInstanceId, 
        user.id, 
        reason
      );
      
      if (result.error) {
        throw new Error(result.error);
      }

      showSuccess('Request rejected successfully');
      setShowApprovalModal(false);
      setSelectedApproval(null);
      setApprovalComments('');
      
      // Reload data to get updated approvals
      await loadData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      showError('Failed to reject request');
    }
  };

  const openApprovalModal = (approval) => {
    setSelectedApproval(approval);
    setShowApprovalModal(true);
  };

  const projectColumns = [
    { key: 'name', header: 'Project Name' },
    { key: 'department', header: 'Department' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'completed' ? 'bg-green-100 text-green-800' :
          value === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    { 
      key: 'progress', 
      header: 'Progress',
      render: (value) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{value}%</span>
        </div>
      )
    },
    { key: 'budget', header: 'Budget', render: (value) => `$${value.toLocaleString()}` },
    { key: 'endDate', header: 'End Date' }
  ];

  const logisticsColumns = [
    { key: 'projectName', header: 'Project' },
    { key: 'item', header: 'Item' },
    { key: 'quantity', header: 'Quantity' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'delivered' ? 'bg-green-100 text-green-800' :
          value === 'in_transit' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    { key: 'deliveryDate', header: 'Delivery Date' },
    { key: 'location', header: 'Location' }
  ];

  const staffColumns = [
    { key: 'name', header: 'Staff Name' },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'Department' },
    { 
      key: 'availability', 
      header: 'Availability',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'available' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    { key: 'currentProject', header: 'Current Project' }
  ];

  const projectActions = (row) => (
    <div className="flex space-x-2">
      <button
        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        className="p-1 text-green-600 hover:bg-green-50 rounded"
        title="Edit Project"
      >
        <Edit className="h-4 w-4" />
      </button>
    </div>
  );

  // Calculate statistics (use real-time stats if available)
  const totalProjects = realTimeStats.totalProjects || projects.length;
  const activeProjects = realTimeStats.activeProjects || projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = realTimeStats.completedProjects || projects.filter(p => p.status === 'completed').length;
  const totalBudget = realTimeStats.totalBudget || projects.reduce((sum, project) => sum + project.budget, 0);

  // Chart data
  const progressData = projects.map(project => ({
    name: project.name.substring(0, 10) + '...',
    progress: project.progress
  }));

  const budgetData = [
    { month: 'Jan', budget: 50000, spent: 32000 },
    { month: 'Feb', budget: 75000, spent: 48000 },
    { month: 'Mar', budget: 60000, spent: 42000 },
    { month: 'Apr', budget: 80000, spent: 55000 },
    { month: 'May', budget: 70000, spent: 38000 },
    { month: 'Jun', budget: 90000, spent: 62000 }
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardLayout 
      title="Project Logistics Tracker" 
      subtitle="Project Management & Resource Coordination"
      rightContent={<NotificationCenter />}
    >
      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Projects"
            value={totalProjects}
            icon={FolderOpen}
            color="blue"
            subtitle="All projects"
          />
          <StatCard
            title="Active Projects"
            value={activeProjects}
            icon={TrendingUp}
            color="green"
            subtitle="In progress"
          />
          <StatCard
            title="Completed"
            value={completedProjects}
            icon={CheckCircle}
            color="purple"
            subtitle="This year"
          />
          <StatCard
            title="Total Budget"
            value={`$${(totalBudget / 1000).toFixed(0)}K`}
            icon={Package}
            color="orange"
            subtitle="All projects"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                <Bar dataKey="progress" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Budget vs Spending */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Spending</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Line type="monotone" dataKey="budget" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="spent" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowCreateProject(true)}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Create Project</span>
            </button>
            <button 
              onClick={() => {
                const availableStaff = staff.filter(s => s.availability === 'available');
                const staffInfo = availableStaff.map(s => ({
                  name: s.name,
                  role: s.role,
                  skills: s.skills.join(', ')
                }));
                alert(`Available Staff for Assignment:\n${staffInfo.map(s => 
                  `${s.name} (${s.role})\nSkills: ${s.skills}\n`
                ).join('\n')}`);
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Users className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Assign Staff</span>
            </button>
            <button 
              onClick={() => {
                const logisticsStatus = logistics.map(log => ({
                  project: log.projectName,
                  item: log.item,
                  status: log.status,
                  deliveryDate: log.deliveryDate
                }));
                alert(`Project Logistics Status:\n${logisticsStatus.map(l => 
                  `${l.project}\n- ${l.item}: ${l.status} (${l.deliveryDate})\n`
                ).join('\n')}`);
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <Truck className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Track Deliveries</span>
            </button>
            <button 
              onClick={() => {
                const upcomingTasks = projects.map(proj => ({
                  name: proj.name,
                  endDate: proj.endDate,
                  progress: proj.progress,
                  status: proj.status
                }));
                alert(`Project Schedule:\n${upcomingTasks.map(p => 
                  `${p.name}\n- End Date: ${p.endDate}\n- Progress: ${p.progress}%\n- Status: ${p.status}\n`
                ).join('\n')}`);
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <Calendar className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Schedule Tasks</span>
            </button>
          </div>
        </div>

        {/* Pending Approvals Section */}
        {useDatabase && pendingApprovals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
              <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {pendingApprovals.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {pendingApprovals.slice(0, 5).map((approval) => (
                <div key={approval.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {approval.request_type.replace('_', ' ').toUpperCase()} Request
                      </p>
                      <p className="text-xs text-gray-600">
                        Step {approval.current_step} of {approval.total_steps} • 
                        Initiated by {approval.initiator?.full_name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openApprovalModal(approval)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
              {pendingApprovals.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  And {pendingApprovals.length - 5} more pending approvals...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Real-time Status Indicator */}
        {useDatabase && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Real-time Database Connection
                  </h3>
                  <p className="text-sm text-gray-600">
                    Live updates enabled • {realTimeStats.pendingApprovals} pending approvals
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>
          </div>
        )}

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h2>
            <DataTable
              data={projects}
              columns={projectColumns}
              actions={projectActions}
              searchable={true}
              itemsPerPage={5}
            />
          </div>

          {/* Staff */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Staff</h2>
            <DataTable
              data={staff}
              columns={staffColumns}
              searchable={true}
              itemsPerPage={5}
            />
          </div>
        </div>

        {/* Logistics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Logistics Status</h2>
          <DataTable
            data={logistics}
            columns={logisticsColumns}
            searchable={true}
            itemsPerPage={8}
          />
        </div>

        {/* Create Project Modal */}
        {showCreateProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={newProject.department}
                    onChange={(e) => setNewProject(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Emergency">Emergency</option>
                    <option value="ICU">ICU</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Radiology">Radiology</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateProject(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedApproval && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Review Approval Request
                </h3>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Request Type:</strong> {selectedApproval.request_type.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Step:</strong> {selectedApproval.current_step} of {selectedApproval.total_steps}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Initiated by:</strong> {selectedApproval.initiator?.full_name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Initiated at:</strong> {new Date(selectedApproval.initiated_at).toLocaleString()}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add any comments about this approval..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleRejectRequest(selectedApproval.id, approvalComments || 'No reason provided')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-4 w-4 inline mr-1" />
                  Reject
                </button>
                <button
                  onClick={() => handleApproveRequest(selectedApproval.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4 inline mr-1" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectManagerDashboard;
