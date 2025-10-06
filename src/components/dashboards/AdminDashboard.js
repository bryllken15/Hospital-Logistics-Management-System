import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../shared/Notification';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
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
  X
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, getAllUsers, getSystemActivities, updateUserStatus, logActivity } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState('');

  const loadData = useCallback(() => {
    const allUsers = getAllUsers();
    const systemActivities = getSystemActivities();
    setUsers(allUsers);
    setActivities(systemActivities);
  }, [getAllUsers, getSystemActivities]);

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

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const recentActivities = activities.filter(a => 
    new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  return (
    <DashboardLayout 
      title="Admin Control Center" 
      subtitle="System Administration & User Management"
    >
      <div className="space-y-8">
        {/* Hospital Announcement */}
        {currentAnnouncement && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Megaphone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">localhost:3000 says</h3>
                  <p className="text-blue-800 mt-1">{currentAnnouncement}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEditAnnouncement}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Edit announcement"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleClearAnnouncement}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Clear announcement"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            color="blue"
            subtitle="All registered users"
          />
          <StatCard
            title="Active Users"
            value={activeUsers}
            icon={UserCheck}
            color="green"
            subtitle="Currently active"
          />
          <StatCard
            title="Inactive Users"
            value={inactiveUsers}
            icon={UserX}
            color="red"
            subtitle="Deactivated accounts"
          />
          <StatCard
            title="Recent Activities"
            value={recentActivities}
            icon={Activity}
            color="purple"
            subtitle="Last 24 hours"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => {
                loadData();
                showSuccess('Data refreshed successfully!');
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Activity className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Refresh Data</span>
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
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Settings className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">System Settings</span>
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
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <Shield className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Security Logs</span>
            </button>
            <button 
              onClick={() => setShowAnnouncement(true)}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <MessageSquare className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Announcement</span>
            </button>
          </div>
        </div>

        {/* User Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
            <DataTable
              data={users}
              columns={userColumns}
              actions={userActions}
              searchable={true}
              itemsPerPage={5}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activities</h2>
            <DataTable
              data={activities.slice(0, 10)}
              columns={activityColumns}
              searchable={true}
              pagination={false}
              className="h-96"
            />
          </div>
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Username</label>
                  <p className="text-gray-900">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-gray-900">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Role</label>
                  <p className="text-gray-900">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Login</label>
                  <p className="text-gray-900">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleToggleUser(selectedUser.username, selectedUser.isActive);
                    setSelectedUser(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedUser.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Announcement Modal */}
        {showAnnouncement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Announcement</h3>
              <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Message</label>
                  <textarea
                    value={currentAnnouncement}
                    onChange={(e) => setCurrentAnnouncement(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    placeholder="Enter your announcement message here..."
                    required
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Megaphone className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800 font-medium">Preview:</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>localhost:3000 says:</strong> {currentAnnouncement || 'Your announcement will appear here...'}
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncement(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
