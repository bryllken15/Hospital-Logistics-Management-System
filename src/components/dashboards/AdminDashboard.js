import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../shared/Notification';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import { LoadingSkeleton, DashboardSkeleton } from '../shared/LoadingSkeleton';
import DatabaseConnectionTest from '../shared/DatabaseConnectionTest';
import DatabaseDiagnosticModal from '../shared/DatabaseDiagnosticModal';
import { userService } from '../../services/database/users';
import { activityService } from '../../services/database/activities';
import { realtimeService } from '../../services/database/realtime';
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
  CheckCircle2,
  Database,
  Server,
  BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, getAllUsers, getSystemActivities, updateUserStatus, logActivity, useDatabase } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState('');
  const [showDatabaseDiagnostics, setShowDatabaseDiagnostics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [realTimeStats, setRealTimeStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    recentActivities: 0,
    systemHealth: 'good'
  });

  // Initialize services
  const userServiceRef = useRef(userService);
  const activityServiceRef = useRef(activityService);
  const realtimeServiceRef = useRef(realtimeService);
  const subscriptions = useRef([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (useDatabase) {
        // Use database services
        const [usersResult, activitiesResult] = await Promise.all([
          userServiceRef.current.getAllUsers(),
          activityServiceRef.current.getRecentActivities(100)
        ]);
        
        if (usersResult.error) {
          console.error('Error loading users:', usersResult.error);
          showError('Failed to load users data');
        } else {
          setUsers(usersResult.data || []);
        }
        
        if (activitiesResult.error) {
          console.error('Error loading activities:', activitiesResult.error);
          showError('Failed to load activities data');
        } else {
          setActivities(activitiesResult.data || []);
        }
      } else {
        // Fallback to AuthContext methods
        const allUsers = await getAllUsers();
        const systemActivities = await getSystemActivities();
        setUsers(allUsers);
        setActivities(systemActivities);
      }
      
      // Update real-time stats
      updateRealTimeStats();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [getAllUsers, getSystemActivities, showError, useDatabase]);

  // Update real-time statistics
  const updateRealTimeStats = useCallback(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive || u.is_active).length;
    const recentActivities = activities.filter(a => {
      const activityTime = new Date(a.created_at || a.timestamp);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return activityTime > oneHourAgo;
    }).length;
    
    setRealTimeStats({
      totalUsers,
      activeUsers,
      recentActivities,
      systemHealth: recentActivities > 50 ? 'warning' : 'good'
    });
  }, [users, activities]);

  // Set up real-time subscriptions
  const setupRealTimeSubscriptions = useCallback(() => {
    if (!useDatabase) return;

    // Clean up existing subscriptions
    subscriptions.current.forEach(sub => {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    });
    subscriptions.current = [];

    // Subscribe to users table changes
    const usersSub = realtimeServiceRef.current.subscribe('users', (payload) => {
      console.log('Users table updated:', payload);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        loadData(); // Reload data when users change
        showInfo('Users data updated in real-time');
      }
    });

    // Subscribe to system activities
    const activitiesSub = realtimeServiceRef.current.subscribe('system_activities', (payload) => {
      console.log('System activities updated:', payload);
      if (payload.eventType === 'INSERT') {
        // Add new activity to the list
        setActivities(prev => [payload.new, ...prev.slice(0, 99)]);
        showInfo('New system activity detected');
      }
    });

    // Subscribe to notifications for admin
    const notificationsSub = realtimeServiceRef.current.subscribe('notifications', (payload) => {
      console.log('Notifications updated:', payload);
      if (payload.eventType === 'INSERT') {
        showInfo('New notification received');
      }
    });

    if (usersSub) subscriptions.current.push(usersSub);
    if (activitiesSub) subscriptions.current.push(activitiesSub);
    if (notificationsSub) subscriptions.current.push(notificationsSub);
  }, [useDatabase, loadData, showInfo]);

  useEffect(() => {
    loadData();
    loadAnnouncement();
    setupRealTimeSubscriptions();
    
    // Cleanup subscriptions on unmount
    return () => {
      subscriptions.current.forEach(sub => {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      });
    };
  }, [loadData, setupRealTimeSubscriptions]);

  const loadAnnouncement = () => {
    const savedAnnouncement = localStorage.getItem('hospitalAnnouncement');
    if (savedAnnouncement) {
      setCurrentAnnouncement(savedAnnouncement);
    }
  };

  const handleToggleUser = async (username, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      
      if (useDatabase) {
        // Use database service
        const result = await userServiceRef.current.updateUserStatusByUsername(username, newStatus);
        if (result.error) {
          throw new Error(result.error.message);
        }
      } else {
        // Use AuthContext method
        updateUserStatus(username, newStatus);
      }
      
      if (username !== 'admin' || newStatus) { // Only log if not trying to deactivate admin
        await logActivity(user.username, 'USER_STATUS_CHANGE', 
          `${newStatus ? 'Activated' : 'Deactivated'} user: ${username}`
        );
      }
      
      // Update local state immediately for better UX
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.username === username 
            ? { ...user, isActive: newStatus, is_active: newStatus }
            : user
        )
      );
      
      showSuccess(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      showError('Failed to update user status');
    }
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
  const totalUsers = realTimeStats.totalUsers || users.length;
  const activeUsers = realTimeStats.activeUsers || users.filter(u => u.isActive || u.is_active).length;
  const inactiveUsers = totalUsers - activeUsers;
  const recentActivities = realTimeStats.recentActivities || activities.filter(a => {
    const activityTime = new Date(a.created_at || a.timestamp);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return activityTime > oneDayAgo;
  }).length;

  // Calculate trends
  const activeUsersTrend = { direction: 'up', value: '+12%' };
  const inactiveUsersTrend = { direction: 'down', value: '-3%' };
  const recentActivitiesTrend = { direction: 'up', value: '+8%' };

  return (
    <DashboardLayout 
      title="Admin Control Center" 
      subtitle="System Administration & User Management"
    >
      <div className="space-y-8 animate-page-transition">
        {/* Hospital Announcement */}
        {currentAnnouncement && (
          <div className="neumorphic-card p-8 animate-slide-in-down hover-lift">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Megaphone className="h-8 w-8 text-blue-600 animate-float-slow" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gradient mb-2">localhost:3000 says</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{currentAnnouncement}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleEditAnnouncement}
                  className="neumorphic-button p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-300 hover:scale-110"
                  title="Edit announcement"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={handleClearAnnouncement}
                  className="neumorphic-button p-3 text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-300 hover:scale-110"
                  title="Clear announcement"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Statistics Cards Grid */}
        <div className="grid grid-stats gap-6">
          <div className="animate-slide-in-left animate-delay-100">
            <StatCard
              title="Total Users"
              value={totalUsers}
              icon={Users}
              color="blue"
              subtitle="All registered users"
              delay={100}
              trend={{ direction: 'up', value: '+12%' }}
            />
          </div>
          <div className="animate-slide-in-left animate-delay-200">
            <StatCard
              title="Active Users"
              value={activeUsers}
              icon={UserCheck}
              color="green"
              subtitle="Currently active"
              delay={200}
              trend={{ direction: 'up', value: '+8%' }}
            />
          </div>
          <div className="animate-slide-in-left animate-delay-300">
            <StatCard
              title="Inactive Users"
              value={inactiveUsers}
              icon={UserX}
              color="red"
              subtitle="Deactivated accounts"
              delay={300}
              trend={{ direction: 'down', value: '-3%' }}
            />
          </div>
          <div className="animate-slide-in-left animate-delay-400">
            <StatCard
              title="Recent Activities"
              value={recentActivities}
              icon={Activity}
              color="purple"
              subtitle="Last 24 hours"
              delay={400}
              trend={{ direction: 'up', value: '+25%' }}
            />
          </div>
        </div>

        {/* Real-time Status Indicator */}
        {useDatabase && (
          <div className="neumorphic-card p-6 animate-slide-in-up hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  realTimeStats.systemHealth === 'good' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {realTimeStats.systemHealth === 'good' ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <AlertCircle className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Real-time Database Connection
                  </h3>
                  <p className="text-sm text-gray-600">
                    System Health: {realTimeStats.systemHealth === 'good' ? 'Optimal' : 'Warning'}
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

        {/* Enhanced Quick Actions */}
        <div className="neumorphic-card p-8 animate-slide-in-up hover-lift">
          <h2 className="text-3xl font-bold text-gradient mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-actions gap-6">
            <button 
              onClick={() => {
                loadData();
                showSuccess('Data refreshed successfully!');
              }}
              className="neumorphic-button p-8 text-center hover:scale-105 transition-all duration-300 group hover-lift"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                  <Activity className="h-10 w-10 text-blue-600" />
                </div>
                <span className="text-gray-800 font-bold text-lg">Refresh Data</span>
                <p className="text-sm text-gray-600">Update all information</p>
              </div>
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
              className="neumorphic-button p-8 text-center hover:scale-105 transition-all duration-300 group hover-lift"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                  <Settings className="h-10 w-10 text-green-600" />
                </div>
                <span className="text-gray-800 font-bold text-lg">System Settings</span>
                <p className="text-sm text-gray-600">Configure system</p>
              </div>
            </button>
            <button 
              onClick={() => {
                const securityLogs = activities.filter(activity => 
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
              className="neumorphic-button p-8 text-center hover:scale-105 transition-all duration-300 group hover-lift"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                  <Shield className="h-10 w-10 text-purple-600" />
                </div>
                <span className="text-gray-800 font-bold text-lg">Security Logs</span>
                <p className="text-sm text-gray-600">View security events</p>
              </div>
            </button>
            <button 
              onClick={() => setShowAnnouncement(true)}
              className="neumorphic-button p-8 text-center hover:scale-105 transition-all duration-300 group hover-lift"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-6 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                  <MessageSquare className="h-10 w-10 text-indigo-600" />
                </div>
                <span className="text-gray-800 font-bold text-lg">Announcement</span>
                <p className="text-sm text-gray-600">Create announcement</p>
              </div>
            </button>
            <button 
              onClick={() => setShowDatabaseDiagnostics(true)}
              className="neumorphic-button p-8 text-center hover:scale-105 transition-all duration-300 group hover-lift"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-6 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl group-hover:from-cyan-200 group-hover:to-cyan-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                  <Database className="h-10 w-10 text-cyan-600" />
                </div>
                <span className="text-gray-800 font-bold text-lg">Database Diagnostics</span>
                <p className="text-sm text-gray-600">Test connection & health</p>
              </div>
            </button>
          </div>
        </div>

        {/* Database Connection Status */}
        <div className="animate-slide-in-up hover-lift">
          <DatabaseConnectionTest 
            showDetails={true}
            className="neumorphic-card"
          />
        </div>

        {/* Enhanced User Management Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-slide-in-left hover-lift">
            <div className="neumorphic-card p-6">
              <h3 className="text-2xl font-bold text-gradient mb-6 text-center">User Management</h3>
              <DataTable
                data={users}
                columns={userColumns}
                actions={userActions}
                searchable={true}
                itemsPerPage={5}
                showExport={true}
                className="table-enhanced"
              />
            </div>
          </div>

          <div className="animate-slide-in-right hover-lift">
            <div className="neumorphic-card p-6">
              <h3 className="text-2xl font-bold text-gradient mb-6 text-center">Recent System Activities</h3>
              <DataTable
                data={activities.slice(0, 10)}
                columns={activityColumns}
                searchable={true}
                pagination={false}
                showExport={true}
                className="table-enhanced"
              />
            </div>
          </div>
        </div>

        {/* Enhanced User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="neumorphic-card p-8 max-w-lg w-full mx-4 animate-modal-enter">
              <h3 className="text-2xl font-bold text-gradient mb-6 text-center">User Details</h3>
              <div className="space-y-4">
                <div className="form-enhanced">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Username</label>
                  <p className="text-lg text-gray-900 font-medium">{selectedUser.username}</p>
                </div>
                <div className="form-enhanced">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Full Name</label>
                  <p className="text-lg text-gray-900 font-medium">{selectedUser.name}</p>
                </div>
                <div className="form-enhanced">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Role</label>
                  <p className="text-lg text-gray-900 font-medium">{selectedUser.role}</p>
                </div>
                <div className="form-enhanced">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Email</label>
                  <p className="text-lg text-gray-900 font-medium">{selectedUser.email}</p>
                </div>
                <div className="form-enhanced">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</label>
                  <span className={`status-indicator ${
                    selectedUser.isActive ? 'success' : 'error'
                  }`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="form-enhanced">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Last Login</label>
                  <p className="text-lg text-gray-900 font-medium">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-8">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="neumorphic-button px-6 py-3 text-gray-600 hover:text-gray-800 transition-all duration-300 hover:scale-105"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleToggleUser(selectedUser.username, selectedUser.isActive);
                    setSelectedUser(null);
                  }}
                  className={`neumorphic-button px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 ${
                    selectedUser.isActive
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="neumorphic-card p-8 max-w-2xl w-full mx-4 animate-modal-enter">
              <h3 className="text-3xl font-bold text-gradient mb-8 text-center">Hospital Announcement</h3>
              <form onSubmit={handleAnnouncementSubmit} className="space-y-6">
                <div className="form-enhanced">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Announcement Message</label>
                  <textarea
                    value={currentAnnouncement}
                    onChange={(e) => setCurrentAnnouncement(e.target.value)}
                    className="input-modern w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    rows="6"
                    placeholder="Enter your announcement message here..."
                    required
                  />
                </div>
                <div className="neumorphic-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Megaphone className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-lg font-bold text-blue-800">Preview:</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <p className="text-lg text-blue-700">
                      <strong className="text-blue-900">localhost:3000 says:</strong> {currentAnnouncement || 'Your announcement will appear here...'}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncement(false)}
                    className="neumorphic-button px-8 py-3 text-gray-600 hover:text-gray-800 transition-all duration-300 hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="neumorphic-button px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Update Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Database Diagnostic Modal */}
        <DatabaseDiagnosticModal 
          isOpen={showDatabaseDiagnostics}
          onClose={() => setShowDatabaseDiagnostics(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
