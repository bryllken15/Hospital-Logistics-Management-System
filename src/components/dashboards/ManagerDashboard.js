import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../shared/Notification';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import { procurementService } from '../../services/database/procurement';
import { projectService } from '../../services/database/projects';
import { inventoryService } from '../../services/database/inventory';
import { 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Eye,
  FileText,
  BarChart3,
  Users,
  RefreshCw,
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ManagerDashboard = () => {
  const { user, logActivity, useDatabase } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [procurementRequests, setProcurementRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    totalProjects: 0,
    activeProjects: 0
  });

  const subscriptions = useRef([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (useDatabase) {
        // Load procurement requests
        const requestsResult = await procurementService.getAllRequests();
        if (requestsResult.error) {
          console.error('Error loading procurement requests:', requestsResult.error);
          showError('Failed to load procurement requests');
        } else {
          setProcurementRequests(requestsResult.data || []);
        }

        // Load projects
        const projectsResult = await projectService.getAllProjects();
        if (projectsResult.error) {
          console.error('Error loading projects:', projectsResult.error);
          showError('Failed to load projects');
        } else {
          setProjects(projectsResult.data || []);
        }

        // Load inventory data for warehouse analytics
        const inventoryResult = await inventoryService.getInventoryStats();
        if (inventoryResult.error) {
          console.error('Error loading inventory stats:', inventoryResult.error);
        } else {
          // Generate warehouse data from inventory stats
          const warehouseStats = inventoryResult.data || {};
          setWarehouseData([
            { name: 'Jan', stock: warehouseStats.totalItems || 4500, orders: 1200 },
            { name: 'Feb', stock: warehouseStats.totalItems || 4200, orders: 1350 },
            { name: 'Mar', stock: warehouseStats.totalItems || 4800, orders: 1100 },
            { name: 'Apr', stock: warehouseStats.totalItems || 4600, orders: 1400 },
            { name: 'May', stock: warehouseStats.totalItems || 4900, orders: 1300 },
            { name: 'Jun', stock: warehouseStats.totalItems || 5100, orders: 1250 }
          ]);
        }

        // Update statistics
        const pendingRequests = (requestsResult.data || []).filter(req => req.status === 'pending').length;
        const approvedRequests = (requestsResult.data || []).filter(req => req.status === 'approved').length;
        const totalProjects = (projectsResult.data || []).length;
        const activeProjects = (projectsResult.data || []).filter(proj => proj.status === 'in_progress').length;

        setStats({
          pendingRequests,
          approvedRequests,
          totalProjects,
          activeProjects
        });
      } else {
        // Fallback to mock data when database is not available
        loadMockData();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Failed to load dashboard data');
      // Fallback to mock data
      loadMockData();
    } finally {
      setLoading(false);
    }
  }, [useDatabase, showError]);

  const loadMockData = () => {
    // Mock procurement requests data
    setProcurementRequests([
      {
        id: 1,
        item_name: 'Surgical Masks (Box of 50)',
        quantity: 100,
        requested_by: 'employee1',
        requested_date: '2024-01-15',
        status: 'pending',
        priority: 'high',
        total_amount: 2500
      },
      {
        id: 2,
        item_name: 'IV Fluids - Normal Saline',
        quantity: 500,
        requested_by: 'procurement1',
        requested_date: '2024-01-14',
        status: 'pending',
        priority: 'medium',
        total_amount: 1500
      },
      {
        id: 3,
        item_name: 'Medical Gloves (Latex-free)',
        quantity: 200,
        requested_by: 'employee1',
        requested_date: '2024-01-13',
        status: 'approved',
        priority: 'high',
        total_amount: 800
      }
    ]);

    // Mock projects data
    setProjects([
      {
        id: 1,
        name: 'Emergency Ward Renovation',
        status: 'in_progress',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
        progress: 65,
        budget: 150000,
        spent: 97500
      },
      {
        id: 2,
        name: 'New ICU Equipment Setup',
        status: 'planning',
        start_date: '2024-02-01',
        end_date: '2024-04-30',
        progress: 20,
        budget: 200000,
        spent: 40000
      }
    ]);

    // Mock warehouse data
    setWarehouseData([
      { name: 'Jan', stock: 4500, orders: 1200 },
      { name: 'Feb', stock: 4200, orders: 1350 },
      { name: 'Mar', stock: 4800, orders: 1100 },
      { name: 'Apr', stock: 4600, orders: 1400 },
      { name: 'May', stock: 4900, orders: 1300 },
      { name: 'Jun', stock: 5100, orders: 1250 }
    ]);

    setStats({
      pendingRequests: 2,
      approvedRequests: 1,
      totalProjects: 2,
      activeProjects: 1
    });
  };

  useEffect(() => {
    loadData();
    setupRealTimeSubscriptions();
    
    // Cleanup subscriptions on unmount
    return () => {
      subscriptions.current.forEach(sub => {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      });
    };
  }, [loadData]);

  const setupRealTimeSubscriptions = useCallback(() => {
    if (!useDatabase) return;

    // Clean up existing subscriptions
    subscriptions.current.forEach(sub => {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    });
    subscriptions.current = [];

    // Subscribe to procurement requests
    const requestsSub = procurementService.subscribeToRequests((payload) => {
      console.log('Procurement requests updated:', payload);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        loadData(); // Reload data when requests change
        showInfo('Procurement requests updated in real-time');
      }
    });

    // Subscribe to projects
    const projectsSub = projectService.subscribeToProjects((payload) => {
      console.log('Projects updated:', payload);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        loadData(); // Reload data when projects change
        showInfo('Projects updated in real-time');
      }
    });

    if (requestsSub) subscriptions.current.push(requestsSub);
    if (projectsSub) subscriptions.current.push(projectsSub);
  }, [useDatabase, loadData, showInfo]);

  const handleApproveRequest = async (requestId, action) => {
    try {
      if (useDatabase) {
        // Use database service to update request status
        const result = await procurementService.updateRequestStatus(
          requestId, 
          action === 'approve' ? 'approved' : 'rejected',
          user.id,
          action === 'reject' ? 'Rejected by manager' : null
        );
        
        if (result.error) {
          throw new Error(result.error.message);
        }
      } else {
        // Update local state for mock data
        setProcurementRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
              : req
          )
        );
      }
      
      const request = procurementRequests.find(req => req.id === requestId);
      const actionText = action === 'approve' ? 'approved' : 'rejected';
      
      showSuccess(`Request ${actionText} successfully!`);
      await logActivity(user.username, 'PROCUREMENT_APPROVAL', 
        `${actionText} procurement request: ${request?.item_name || request?.item}`
      );
    } catch (error) {
      console.error('Error updating request status:', error);
      showError('Failed to update request status');
    }
  };

  const procurementColumns = [
    { key: 'item_name', header: 'Item' },
    { key: 'quantity', header: 'Quantity' },
    { 
      key: 'priority', 
      header: 'Priority',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'high' ? 'bg-red-100 text-red-800' :
          value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'approved' ? 'bg-green-100 text-green-800' :
          value === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    { key: 'total_amount', header: 'Cost', render: (value) => `$${value?.toLocaleString() || '0'}` }
  ];

  const projectColumns = [
    { key: 'name', header: 'Project Name' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          value === 'completed' ? 'bg-green-100 text-green-800' :
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
    { key: 'budget', header: 'Budget', render: (value) => `$${value.toLocaleString()}` }
  ];

  const procurementActions = (row) => (
    <div className="flex space-x-2">
      {row.status === 'pending' && (
        <>
          <button
            onClick={() => handleApproveRequest(row.id, 'approve')}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Approve"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleApproveRequest(row.id, 'reject')}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Reject"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </>
      )}
      <button
        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );

  // Calculate statistics
  const pendingRequests = stats.pendingRequests || procurementRequests.filter(req => req.status === 'pending').length;
  const approvedRequests = stats.approvedRequests || procurementRequests.filter(req => req.status === 'approved').length;
  const activeProjects = stats.activeProjects || projects.filter(proj => proj.status === 'in_progress').length;
  const totalBudget = projects.reduce((sum, proj) => sum + (proj.budget || 0), 0);

  return (
    <DashboardLayout 
      title="Manager Overview" 
      subtitle="Procurement & Project Management Dashboard"
    >
      <div className="space-y-8 animate-page-transition">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              loadData();
              showSuccess('Data refreshed successfully!');
            }}
            disabled={loading}
            className="neumorphic-button p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="neumorphic-card p-8 text-center">
            <div className="flex items-center justify-center space-x-4">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg font-semibold text-gray-700">Loading dashboard data...</span>
            </div>
          </div>
        )}

        {/* Enhanced Statistics Cards Grid */}
        <div className="grid grid-stats gap-6">
          <div className="animate-slide-in-left animate-delay-100">
            <StatCard
              title="Pending Requests"
              value={pendingRequests}
              icon={FileText}
              color="yellow"
              subtitle="Awaiting approval"
              delay={100}
              trend={{ direction: 'up', value: '+5%' }}
            />
          </div>
          <div className="animate-slide-in-left animate-delay-200">
            <StatCard
              title="Approved Requests"
              value={approvedRequests}
              icon={CheckCircle}
              color="green"
              subtitle="This month"
              delay={200}
              trend={{ direction: 'up', value: '+15%' }}
            />
          </div>
          <div className="animate-slide-in-left animate-delay-300">
            <StatCard
              title="Active Projects"
              value={activeProjects}
              icon={TrendingUp}
              color="blue"
              subtitle="In progress"
              delay={300}
              trend={{ direction: 'up', value: '+3%' }}
            />
          </div>
          <div className="animate-slide-in-left animate-delay-400">
            <StatCard
              title="Total Budget"
              value={`$${(totalBudget / 1000).toFixed(0)}K`}
              icon={BarChart3}
              color="purple"
              subtitle="All projects"
              delay={400}
              trend={{ direction: 'up', value: '+8%' }}
            />
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Warehouse Stock Trend */}
          <div className="neumorphic-card p-8 animate-slide-in-up hover-lift">
            <h3 className="text-2xl font-bold text-gradient mb-8 text-center">Warehouse Stock Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={warehouseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stock" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Procurement */}
          <div className="neumorphic-card p-8 animate-slide-in-up hover-lift">
            <h3 className="text-2xl font-bold text-gradient mb-8 text-center">Monthly Procurement Orders</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warehouseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="url(#colorGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Enhanced Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Procurement Requests */}
          <div className="animate-slide-in-left hover-lift">
            <div className="neumorphic-card p-6">
              <h3 className="text-2xl font-bold text-gradient mb-6 text-center">Procurement Approval Requests</h3>
              <DataTable
                data={procurementRequests}
                columns={procurementColumns}
                actions={procurementActions}
                searchable={true}
                itemsPerPage={5}
                showExport={true}
                className="table-enhanced"
              />
            </div>
          </div>

          {/* Project Status */}
          <div className="animate-slide-in-right hover-lift">
            <div className="neumorphic-card p-6">
              <h3 className="text-2xl font-bold text-gradient mb-6 text-center">Project Logistics Status</h3>
              <DataTable
                data={projects}
                columns={projectColumns}
                searchable={true}
                itemsPerPage={5}
                showExport={true}
                className="table-enhanced"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="neumorphic-card p-8 animate-slide-in-up hover-lift">
          <h2 className="text-3xl font-bold text-gradient mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-actions gap-6">
            <button 
              onClick={() => {
                const pendingRequests = procurementRequests.filter(req => req.status === 'pending');
                if (pendingRequests.length > 0) {
                  const approved = pendingRequests.slice(0, 2); // Approve first 2
                  setProcurementRequests(prev => 
                    prev.map(req => 
                      approved.find(ar => ar.id === req.id) 
                        ? { ...req, status: 'approved' }
                        : req
                    )
                  );
                  logActivity(user.username, 'BULK_APPROVE', `Approved ${approved.length} procurement requests`);
                  showSuccess(`Approved ${approved.length} pending requests!`);
                } else {
                  showInfo('No pending requests to approve.');
                }
              }}
              className="neumorphic-button p-6 text-center hover:scale-105 transition-all duration-300 group hover-lift"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <span className="text-gray-800 font-bold text-lg">Approve Requests</span>
                <p className="text-sm text-gray-600">Bulk approval</p>
              </div>
            </button>
            <button 
              onClick={() => {
                const reportData = {
                  totalRequests: procurementRequests.length,
                  approvedRequests: procurementRequests.filter(req => req.status === 'approved').length,
                  pendingRequests: procurementRequests.filter(req => req.status === 'pending').length,
                  totalBudget: projects.reduce((sum, proj) => sum + proj.budget, 0),
                  activeProjects: projects.filter(proj => proj.status === 'in_progress').length
                };
                showInfo(`Management Report: ${reportData.totalRequests} requests, ${reportData.activeProjects} projects, $${reportData.totalBudget.toLocaleString()} budget`);
              }}
              className="neumorphic-button p-6 text-center hover:scale-105 transition-all duration-300 group hover-lift"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <span className="text-gray-800 font-bold text-lg">View Reports</span>
                <p className="text-sm text-gray-600">Analytics</p>
              </div>
            </button>
            <button 
              onClick={() => {
                const progressData = projects.map(proj => ({
                  name: proj.name,
                  progress: proj.progress,
                  status: proj.status
                }));
                showInfo(`Project Progress: ${progressData.map(p => `${p.name}: ${p.progress}%`).join(', ')}`);
              }}
              className="neumorphic-button p-6 text-center hover:scale-105 transition-all duration-300 group hover-lift"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <span className="text-gray-800 font-bold text-lg">Monitor Progress</span>
                <p className="text-sm text-gray-600">Track projects</p>
              </div>
            </button>
            <button 
              onClick={() => {
                const departments = ['Emergency', 'ICU', 'Pharmacy', 'Surgery', 'Radiology'];
                const departmentStatus = departments.map(dept => ({
                  name: dept,
                  activeProjects: projects.filter(p => p.department === dept).length,
                  pendingRequests: procurementRequests.filter(req => req.department === dept || Math.random() > 0.7).length
                }));
                showInfo(`Department Status: ${departmentStatus.map(d => `${d.name}: ${d.activeProjects} projects`).join(', ')}`);
              }}
              className="neumorphic-button p-6 text-center hover:scale-105 transition-all duration-300 group hover-lift"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <span className="text-gray-800 font-bold text-lg">Department Status</span>
                <p className="text-sm text-gray-600">Team overview</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
