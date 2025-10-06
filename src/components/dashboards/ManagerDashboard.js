import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../shared/Notification';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import { 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Eye,
  FileText,
  BarChart3,
  Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ManagerDashboard = () => {
  const { user, logActivity } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [procurementRequests, setProcurementRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock procurement requests data
    setProcurementRequests([
      {
        id: 1,
        item: 'Surgical Masks (Box of 50)',
        quantity: 100,
        requestedBy: 'employee1',
        requestedDate: '2024-01-15',
        status: 'pending',
        priority: 'high',
        estimatedCost: 2500
      },
      {
        id: 2,
        item: 'IV Fluids - Normal Saline',
        quantity: 500,
        requestedBy: 'procurement1',
        requestedDate: '2024-01-14',
        status: 'pending',
        priority: 'medium',
        estimatedCost: 1500
      },
      {
        id: 3,
        item: 'Medical Gloves (Latex-free)',
        quantity: 200,
        requestedBy: 'employee1',
        requestedDate: '2024-01-13',
        status: 'approved',
        priority: 'high',
        estimatedCost: 800
      }
    ]);

    // Mock projects data
    setProjects([
      {
        id: 1,
        name: 'Emergency Ward Renovation',
        status: 'in_progress',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        progress: 65,
        budget: 150000,
        spent: 97500
      },
      {
        id: 2,
        name: 'New ICU Equipment Setup',
        status: 'planning',
        startDate: '2024-02-01',
        endDate: '2024-04-30',
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
  const pendingRequests = procurementRequests.filter(req => req.status === 'pending').length;
  const approvedRequests = procurementRequests.filter(req => req.status === 'approved').length;
  const activeProjects = projects.filter(proj => proj.status === 'in_progress').length;
  const totalBudget = projects.reduce((sum, proj) => sum + proj.budget, 0);

  return (
    <DashboardLayout 
      title="Manager Overview" 
      subtitle="Procurement & Project Management Dashboard"
    >
      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pending Requests"
            value={pendingRequests}
            icon={FileText}
            color="yellow"
            subtitle="Awaiting approval"
          />
          <StatCard
            title="Approved Requests"
            value={approvedRequests}
            icon={CheckCircle}
            color="green"
            subtitle="This month"
          />
          <StatCard
            title="Active Projects"
            value={activeProjects}
            icon={TrendingUp}
            color="blue"
            subtitle="In progress"
          />
          <StatCard
            title="Total Budget"
            value={`$${(totalBudget / 1000).toFixed(0)}K`}
            icon={BarChart3}
            color="purple"
            subtitle="All projects"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Warehouse Stock Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Warehouse Stock Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={warehouseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="stock" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Procurement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Procurement Orders</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={warehouseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Procurement Requests */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Procurement Approval Requests</h2>
            <DataTable
              data={procurementRequests}
              columns={procurementColumns}
              actions={procurementActions}
              searchable={true}
              itemsPerPage={5}
            />
          </div>

          {/* Project Status */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Logistics Status</h2>
            <DataTable
              data={projects}
              columns={projectColumns}
              searchable={true}
              itemsPerPage={5}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <CheckCircle className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Approve Requests</span>
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
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <BarChart3 className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">View Reports</span>
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
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Monitor Progress</span>
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
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <Users className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Department Status</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
