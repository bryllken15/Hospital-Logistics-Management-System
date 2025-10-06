import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../shared/Notification';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import { LoadingSkeleton, DashboardSkeleton } from '../shared/LoadingSkeleton';
import {
  Users,
  UserCheck,
  UserX,
  Activity,
  Settings,
  Shield,
  ToggleLeft,
  ToggleRight,
  Eye,
  Megaphone,
  MessageSquare,
  Edit,
  X,
  RefreshCw,
  Download,
  Filter,
  Search,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, getAllUsers, getSystemActivities, updateUserStatus, logActivity } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      const allUsers = getAllUsers();
      const systemActivities = getSystemActivities();
      setUsers(allUsers);
      setActivities(systemActivities);
    } catch (error) {
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [getAllUsers, getSystemActivities, showError]);

  useEffect(() => {
    loadData();
    loadAnnouncement();
  }, [loadData]);

  const loadAnnouncement = () => {
    const savedAnnouncement = localStorage.getItem('hospitalAnnouncement');
    if (savedAnnouncement) {
      setCurrentAnnouncement(savedAnnouncement);
    }
  };

  const handleToggleUser = (username, currentStatus) => {
    const newStatus = !currentStatus;
    updateUserStatus(username, newStatus);
    if (username !== 'admin' || newStatus) { // Only log if not trying to deactivate admin
      logActivity(user.username, 'USER_STATUS_CHANGE', 
        `${newStatus ? 'Activated' : 'Deactivated'} user: ${username}`
      );
    }
    loadData();
  };

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    if (currentAnnouncement.trim()) {
      localStorage.setItem('hospitalAnnouncement', currentAnnouncement);
      setShowAnnouncement(false);
      logActivity(user.username, 'ANNOUNCEMENT_UPDATE', `Updated announcement: ${currentAnnouncement.substring(0, 50)}...`);
      showSuccess('Announcement updated successfully!');
    }
  };

  const handleEditAnnouncement = () => {
    setShowAnnouncement(true);
  };

  const handleClearAnnouncement = () => {
    localStorage.removeItem('hospitalAnnouncement');
    setCurrentAnnouncement('');
    logActivity(user.username, 'ANNOUNCEMENT_CLEAR', 'Cleared announcement');
    showInfo('Announcement cleared');
  };

  const handleViewUser = (userData) => {
    setSelectedUser(userData);
  };

  const userColumns = [
    { key: 'username', header: 'Username' },
    { key: 'name', header: 'Full Name' },
    { key: 'role', header: 'Role' },
    { key: 'email', header: 'Email' },
    { 
      key: 'isActive', 
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      key: 'lastLogin', 
      header: 'Last Login',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Never'
    }
  ];

  const activityColumns = [
    { 
      key: 'timestamp', 
      header: 'Time',
      render: (value) => new Date(value).toLocaleString()
    },
    { key: 'username', header: 'User' },
    { key: 'action', header: 'Action' },
    { key: 'description', header: 'Description' }
  ];

  const userActions = (row) => (
    <div className="flex space-x-2">
      {row.username !== 'admin' ? (
        <button
          onClick={() => handleToggleUser(row.username, row.isActive)}
          className={`p-1 rounded ${
            row.isActive 
              ? 'text-red-600 hover:bg-red-50' 
              : 'text-green-600 hover:bg-green-50'
          }`}
          title={row.isActive ? 'Deactivate User' : 'Activate User'}
        >
          {row.isActive ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
        </button>
      ) : (
        <button
          disabled
          className="p-1 text-gray-400 cursor-not-allowed rounded"
          title="Admin account cannot be deactivated"
        >
          <ToggleRight className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => handleViewUser(row)}
        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.isActive.toString() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const recentActivities = activities.filter(a =>
    new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  // Calculate trends
  const activeUsersTrend = { direction: 'up', value: '+12%' };
  const inactiveUsersTrend = { direction: 'down', value: '-3%' };
  const recentActivitiesTrend = { direction: 'up', value: '+8%' };

  if (loading) {
    return (
      <DashboardLayout
        title="Admin Control Center"
        subtitle="System Administration & User Management"
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Control Center"
      subtitle="System Administration & User Management"
    >
      <div className="space-y-8 animate-fade-scale">
        {/* Welcome Hero Section */}
        <div className="gradient-card-blue neumorphic-card p-8 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="animate-slide-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-gray-600 text-lg">
                Here's what's happening with your system today.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse-glow">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Announcement */}
        {currentAnnouncement && (
          <div className="gradient-card-blue neumorphic-card p-6 rounded-xl animate-slide-up">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-xl animate-float">
                  <Megaphone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 text-shadow-sm">
                    System Announcement
                  </h3>
                  <p className="text-blue-800 mt-1 leading-relaxed">{currentAnnouncement}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEditAnnouncement}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 neumorphic-button"
                  title="Edit announcement"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleClearAnnouncement}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 neumorphic-button"
                  title="Clear announcement"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            color="blue"
            subtitle="All registered users"
            trend={activeUsersTrend}
            className="animate-slide-up animate-delay-100"
          />
          <StatCard
            title="Active Users"
            value={activeUsers}
            icon={UserCheck}
            color="green"
            subtitle="Currently active"
            trend={activeUsersTrend}
            className="animate-slide-up animate-delay-200"
          />
          <StatCard
            title="Inactive Users"
            value={inactiveUsers}
            icon={UserX}
            color="red"
            subtitle="Deactivated accounts"
            trend={inactiveUsersTrend}
            className="animate-slide-up animate-delay-300"
          />
          <StatCard
            title="Recent Activities"
            value={recentActivities}
            icon={Activity}
            color="purple"
            subtitle="Last 24 hours"
            trend={recentActivitiesTrend}
            className="animate-slide-up animate-delay-400"
          />
        </div>

        {/* Enhanced Quick Actions */}
        <div className="neumorphic-card p-8 rounded-xl animate-slide-up animate-delay-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 text-shadow-sm">Quick Actions</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors neumorphic-button">
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
                loadData();
                showSuccess('Data refreshed successfully!');
              }}
              className="group flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-200 neumorphic-button"
            >
              <RefreshCw className="h-5 w-5 text-blue-600 mr-3 group-hover:rotate-180 transition-transform duration-300" />
              <span className="text-gray-700 font-medium">Refresh Data</span>
            </button>

            <button
              onClick={() => {
                const settings = {
                  systemName: 'Logistics 1 Hospital System',
                  version: '1.0.0',
                  maintenanceMode: false,
                  maxUsers: 100,
                  sessionTimeout: 30
                };
                showInfo(`System Settings: ${Object.entries(settings).map(([key, value]) => `${key}: ${value}`).join(', ')}`);
              }}
              className="group flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-200 neumorphic-button"
            >
              <Settings className="h-5 w-5 text-green-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-gray-700 font-medium">System Settings</span>
            </button>

            <button
              onClick={() => {
                const securityLogs = getSystemActivities().filter(activity =>
                  activity.action.includes('LOGIN') ||
                  activity.action.includes('LOGOUT') ||
                  activity.action.includes('STATUS_CHANGE')
                );
                if (securityLogs.length > 0) {
                  showInfo(`Recent Security Events (${securityLogs.length}): ${securityLogs.slice(0, 3).map(log =>
                    `${log.action} by ${log.username}`
                  ).join(', ')}`);
                } else {
                  showInfo('No recent security events found.');
                }
              }}
              className="group flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 rounded-xl transition-all duration-200 neumorphic-button"
            >
              <Shield className="h-5 w-5 text-purple-600 mr-3 group-hover:animate-pulse" />
              <span className="text-gray-700 font-medium">Security Logs</span>
            </button>

            <button
              onClick={() => setShowAnnouncement(true)}
              className="group flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 rounded-xl transition-all duration-200 neumorphic-button"
            >
              <MessageSquare className="h-5 w-5 text-indigo-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-gray-700 font-medium">Announcement</span>
            </button>
          </div>
        </div>

        {/* Enhanced User Management Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* User Management Table */}
          <div className="xl:col-span-2 neumorphic-card p-6 rounded-xl animate-slide-up animate-delay-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 text-shadow-sm mb-4 sm:mb-0">
                User Management
              </h2>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Users</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <DataTable
              data={filteredUsers}
              columns={userColumns}
              actions={userActions}
              searchable={false}
              itemsPerPage={6}
            />
          </div>

          {/* System Activities */}
          <div className="neumorphic-card p-6 rounded-xl animate-slide-up animate-delay-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 text-shadow-sm">
                Recent Activities
              </h2>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activities.slice(0, 8).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors animate-slide-left"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.username}
                    </p>
                    <p className="text-xs text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Modals */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-scale">
            <div className="neumorphic-card p-8 max-w-md w-full mx-4 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 text-shadow-sm">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Username', value: selectedUser.username },
                  { label: 'Full Name', value: selectedUser.name },
                  { label: 'Role', value: selectedUser.role },
                  { label: 'Email', value: selectedUser.email },
                  {
                    label: 'Status',
                    value: selectedUser.isActive ? 'Active' : 'Inactive',
                    color: selectedUser.isActive ? 'text-green-600' : 'text-red-600'
                  },
                  {
                    label: 'Last Login',
                    value: selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'
                  }
                ].map((field, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium text-gray-600">{field.label}</span>
                    <span className={`text-sm font-semibold ${field.color || 'text-gray-900'}`}>
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors neumorphic-button"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleToggleUser(selectedUser.username, selectedUser.isActive);
                    setSelectedUser(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedUser.isActive
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200/50'
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200/50'
                  }`}
                >
                  {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Announcement Modal */}
        {showAnnouncement && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-scale">
            <div className="neumorphic-card p-8 max-w-lg w-full mx-4 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 text-shadow-sm">System Announcement</h3>
                <button
                  onClick={() => setShowAnnouncement(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAnnouncementSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Announcement Message
                  </label>
                  <textarea
                    value={currentAnnouncement}
                    onChange={(e) => setCurrentAnnouncement(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Enter your announcement message here..."
                    required
                  />
                </div>

                <div className="gradient-card-blue p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Megaphone className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800 font-medium">Preview:</span>
                  </div>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    <strong>System says:</strong> {currentAnnouncement || 'Your announcement will appear here...'}
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncement(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors neumorphic-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-medium transition-all duration-200 shadow-lg shadow-blue-200/50"
                  >
                    Update Announcement
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

export default AdminDashboard;
