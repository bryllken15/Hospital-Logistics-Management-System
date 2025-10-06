import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
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
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ProjectManagerDashboard = () => {
  const { user, logActivity } = useAuth();
  const [projects, setProjects] = useState([]);
  const [logistics, setLogistics] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    department: ''
  });

  useEffect(() => {
    loadMockData();
  }, []);

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

  const handleCreateProject = (e) => {
    e.preventDefault();
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
    setNewProject({ name: '', description: '', startDate: '', endDate: '', budget: '', department: '' });
    setShowCreateProject(false);
    
    logActivity(user.username, 'PROJECT_CREATE', `Created project: ${project.name}`);
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

  // Calculate statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);

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

  return (
    <DashboardLayout 
      title="Project Logistics Tracker" 
      subtitle="Project Management & Resource Coordination"
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
      </div>
    </DashboardLayout>
  );
};

export default ProjectManagerDashboard;
