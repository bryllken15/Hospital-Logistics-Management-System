import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../shared/Notification';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import { LoadingSkeleton, DashboardSkeleton } from '../shared/LoadingSkeleton';
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  BarChart3,
  Users,
  RefreshCw,
  Download,
  Filter,
  Search,
  Plus,
  Calendar,
  Target,
  Award,
  Clock,
  DollarSign,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const ManagerDashboard = () => {
  const { user, logActivity } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [procurementRequests, setProcurementRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = async () => {
    setLoading(true);
    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Enhanced mock procurement requests data
      setProcurementRequests([
        {
          id: 1,
          item: 'Surgical Masks (Box of 50)',
          quantity: 100,
          requestedBy: 'Dr. Sarah Johnson',
          department: 'Emergency',
          requestedDate: '2024-01-15',
          status: 'pending',
          priority: 'high',
          estimatedCost: 2500,
          category: 'PPE'
        },
        {
          id: 2,
          item: 'IV Fluids - Normal Saline (1000ml)',
          quantity: 500,
          requestedBy: 'Nurse Mike Chen',
          department: 'ICU',
          requestedDate: '2024-01-14',
          status: 'pending',
          priority: 'medium',
          estimatedCost: 1500,
          category: 'Medications'
        },
        {
          id: 3,
          item: 'Medical Gloves (Latex-free) - M',
          quantity: 200,
          requestedBy: 'Dr. Emily Rodriguez',
          department: 'Surgery',
          requestedDate: '2024-01-13',
          status: 'approved',
          priority: 'high',
          estimatedCost: 800,
          category: 'Supplies'
        },
        {
          id: 4,
          item: 'Digital Thermometers',
          quantity: 50,
          requestedBy: 'Admin Staff',
          department: 'General',
          requestedDate: '2024-01-12',
          status: 'rejected',
          priority: 'low',
          estimatedCost: 750,
          category: 'Equipment'
        },
        {
          id: 5,
          item: 'Surgical Scrubs Set',
          quantity: 75,
          requestedBy: 'OR Coordinator',
          department: 'Surgery',
          requestedDate: '2024-01-11',
          status: 'approved',
          priority: 'medium',
          estimatedCost: 2250,
          category: 'Apparel'
        }
      ]);

      // Enhanced mock projects data
      setProjects([
        {
          id: 1,
          name: 'Emergency Ward Renovation',
          status: 'in_progress',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          progress: 65,
          budget: 150000,
          spent: 97500,
          department: 'Emergency',
          manager: 'John Smith'
        },
        {
          id: 2,
          name: 'New ICU Equipment Setup',
          status: 'planning',
          startDate: '2024-02-01',
          endDate: '2024-04-30',
          progress: 20,
          budget: 200000,
          spent: 40000,
          department: 'ICU',
          manager: 'Lisa Wong'
        },
        {
          id: 3,
          name: 'Pharmacy Storage Expansion',
          status: 'completed',
          startDate: '2023-11-01',
          endDate: '2024-01-15',
          progress: 100,
          budget: 75000,
          spent: 72000,
          department: 'Pharmacy',
          manager: 'David Brown'
        }
      ]);

      // Enhanced warehouse data with more metrics
      setWarehouseData([
        { name: 'Jan', stock: 4500, orders: 1200, deliveries: 1150, returns: 25 },
        { name: 'Feb', stock: 4200, orders: 1350, deliveries: 1280, returns: 18 },
        { name: 'Mar', stock: 4800, orders: 1100, deliveries: 1050, returns: 32 },
        { name: 'Apr', stock: 4600, orders: 1400, deliveries: 1320, returns: 15 },
        { name: 'May', stock: 4900, orders: 1300, deliveries: 1250, returns: 28 },
        { name: 'Jun', stock: 5100, orders: 1250, deliveries: 1200, returns: 22 }
      ]);
    } catch (error) {
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = (requestId, action) => {
    setProcurementRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
          : req
      )
    );
    
    const request = procurementRequests.find(req => req.id === requestId);
    logActivity(user.username, 'PROCUREMENT_APPROVAL', 
      `${action === 'approve' ? 'Approved' : 'Rejected'} procurement request: ${request?.item}`
    );
  };

  const procurementColumns = [
    { key: 'item', header: 'Item' },
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
    { key: 'estimatedCost', header: 'Cost', render: (value) => `$${value.toLocaleString()}` }
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

  // Filter procurement requests
  const filteredRequests = procurementRequests.filter(request => {
    const matchesSearch = request.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const procurementActions = (row) => (
    <div className="flex space-x-2">
      {row.status === 'pending' && (
        <>
          <button
            onClick={() => handleApproveRequest(row.id, 'approve')}
            className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors neumorphic-button"
            title="Approve"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleApproveRequest(row.id, 'reject')}
            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors neumorphic-button"
            title="Reject"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </>
      )}
      <button
        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors neumorphic-button"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );

  // Calculate enhanced statistics
  const pendingRequests = procurementRequests.filter(req => req.status === 'pending').length;
  const approvedRequests = procurementRequests.filter(req => req.status === 'approved').length;
  const rejectedRequests = procurementRequests.filter(req => req.status === 'rejected').length;
  const activeProjects = projects.filter(proj => proj.status === 'in_progress').length;
  const completedProjects = projects.filter(proj => proj.status === 'completed').length;
  const totalBudget = projects.reduce((sum, proj) => sum + proj.budget, 0);
  const totalSpent = projects.reduce((sum, proj) => sum + proj.spent, 0);
  const budgetUtilization = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

  // Calculate trends
  const requestsTrend = { direction: 'up', value: '+15%' };
  const budgetTrend = { direction: 'up', value: '+8%' };
  const projectsTrend = { direction: 'up', value: '+12%' };

  // Prepare chart data
  const categoryData = procurementRequests.reduce((acc, req) => {
    const category = req.category;
    if (!acc[category]) {
      acc[category] = { name: category, value: 0, cost: 0 };
    }
    acc[category].value += req.quantity;
    acc[category].cost += req.estimatedCost;
    return acc;
  }, {});

  const pieChartData = Object.values(categoryData);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <DashboardLayout
        title="Manager Overview"
        subtitle="Procurement & Project Management Dashboard"
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Manager Overview"
      subtitle="Procurement & Project Management Dashboard"
    >
      <div className="space-y-8 animate-fade-scale">
        {/* Welcome Hero Section */}
        <div className="gradient-card-purple neumorphic-card p-8 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="animate-slide-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-gray-600 text-lg">
                Manage your procurement requests and monitor project progress.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse-glow">
                <Target className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Pending Requests"
            value={pendingRequests}
            icon={FileText}
            color="yellow"
            subtitle="Awaiting approval"
            trend={requestsTrend}
            className="animate-slide-up animate-delay-100"
          />
          <StatCard
            title="Approved Requests"
            value={approvedRequests}
            icon={CheckCircle}
            color="green"
            subtitle="This month"
            trend={requestsTrend}
            className="animate-slide-up animate-delay-200"
          />
          <StatCard
            title="Active Projects"
            value={activeProjects}
            icon={TrendingUp}
            color="blue"
            subtitle={`${completedProjects} completed`}
            trend={projectsTrend}
            className="animate-slide-up animate-delay-300"
          />
          <StatCard
            title="Budget Utilization"
            value={`${budgetUtilization}%`}
            icon={BarChart3}
            color="purple"
            subtitle={`$${totalSpent.toLocaleString()} spent`}
            trend={budgetTrend}
            className="animate-slide-up animate-delay-400"
          />
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Warehouse Stock Trend */}
          <div className="neumorphic-card p-6 rounded-xl animate-slide-up animate-delay-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 text-shadow-sm">Warehouse Performance</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Data</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={warehouseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="stock"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Procurement Categories */}
          <div className="neumorphic-card p-6 rounded-xl animate-slide-up animate-delay-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 text-shadow-sm">Procurement Categories</h3>
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Procurement Requests */}
          <div className="xl:col-span-2 neumorphic-card p-6 rounded-xl animate-slide-up animate-delay-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 text-shadow-sm mb-4 sm:mb-0">
                Procurement Requests
              </h2>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <DataTable
              data={filteredRequests}
              columns={procurementColumns}
              actions={procurementActions}
              searchable={false}
              itemsPerPage={6}
            />
          </div>

          {/* Project Status */}
          <div className="neumorphic-card p-6 rounded-xl animate-slide-up animate-delay-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 text-shadow-sm">Project Status</h2>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            <div className="space-y-4">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors animate-slide-left"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{project.progress}% Complete</span>
                    <span>${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="neumorphic-card p-8 rounded-xl animate-slide-up animate-delay-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 text-shadow-sm">Quick Actions</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors neumorphic-button">
                <RefreshCw className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors neumorphic-button">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                const pendingRequests = procurementRequests.filter(req => req.status === 'pending');
                if (pendingRequests.length > 0) {
                  const approved = pendingRequests.slice(0, 2);
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
              className="group flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-200 neumorphic-button"
            >
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-gray-700 font-medium">Approve Requests</span>
            </button>

            <button
              onClick={() => {
                const reportData = {
                  totalRequests: procurementRequests.length,
                  approvedRequests: approvedRequests,
                  pendingRequests: pendingRequests,
                  totalBudget: totalBudget,
                  activeProjects: activeProjects,
                  budgetUtilization: budgetUtilization
                };
                showInfo(`Management Report: ${reportData.totalRequests} total requests, ${reportData.activeProjects} active projects, ${reportData.budgetUtilization}% budget utilized`);
              }}
              className="group flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-200 neumorphic-button"
            >
              <BarChart3 className="h-5 w-5 text-blue-600 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-gray-700 font-medium">View Reports</span>
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
              className="group flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 rounded-xl transition-all duration-200 neumorphic-button"
            >
              <TrendingUp className="h-5 w-5 text-purple-600 mr-3 group-hover:animate-bounce" />
              <span className="text-gray-700 font-medium">Monitor Progress</span>
            </button>

            <button
              onClick={() => {
                const departments = ['Emergency', 'ICU', 'Pharmacy', 'Surgery', 'Radiology'];
                const departmentStatus = departments.map(dept => ({
                  name: dept,
                  activeProjects: projects.filter(p => p.department === dept).length,
                  pendingRequests: procurementRequests.filter(req => req.department === dept).length
                }));
                showInfo(`Department Status: ${departmentStatus.map(d => `${d.name}: ${d.activeProjects} projects, ${d.pendingRequests} requests`).join(', ')}`);
              }}
              className="group flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 rounded-xl transition-all duration-200 neumorphic-button"
            >
              <Users className="h-5 w-5 text-orange-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-gray-700 font-medium">Department Status</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
