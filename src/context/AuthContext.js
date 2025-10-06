import React, { createContext, useContext, useState, useEffect } from 'react';

// Predefined users for the system
const USERS = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'Admin',
    name: 'System Administrator',
    email: 'admin@logistics1.com',
    isActive: true, // Always active - cannot be deactivated
    permissions: ['all']
  },
  manager1: {
    username: 'manager1',
    password: 'manager123',
    role: 'Manager',
    name: 'John Manager',
    email: 'manager@logistics1.com',
    isActive: true,
    permissions: ['view_all', 'approve_requests', 'analytics']
  },
  employee1: {
    username: 'employee1',
    password: 'employee123',
    role: 'Employee',
    name: 'Sarah Warehouse',
    email: 'employee@logistics1.com',
    isActive: true,
    permissions: ['sws_module', 'rfid_scan', 'inventory_manage']
  },
  procurement1: {
    username: 'procurement1',
    password: 'procurement123',
    role: 'Procurement Staff',
    name: 'Mike Procurement',
    email: 'procurement@logistics1.com',
    isActive: true,
    permissions: ['psm_module', 'supplier_manage', 'purchase_orders']
  },
  project1: {
    username: 'project1',
    password: 'project123',
    role: 'Project Manager',
    name: 'Lisa Project',
    email: 'project@logistics1.com',
    isActive: true,
    permissions: ['plt_module', 'project_tracking', 'resource_assign']
  },
  maintenance1: {
    username: 'maintenance1',
    password: 'maintenance123',
    role: 'Maintenance Staff',
    name: 'David Maintenance',
    email: 'maintenance@logistics1.com',
    isActive: true,
    permissions: ['alms_module', 'asset_tracking', 'maintenance_logs']
  },
  document1: {
    username: 'document1',
    password: 'document123',
    role: 'Document Analyst',
    name: 'Emma Document',
    email: 'document@logistics1.com',
    isActive: true,
    permissions: ['dtrs_module', 'document_upload', 'record_verify']
  }
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('logistics_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Verify user is still active
        const currentUser = USERS[userData.username];
        if (currentUser && currentUser.isActive) {
          setUser(userData);
        } else {
          localStorage.removeItem('logistics_user');
        }
      } catch (error) {
        localStorage.removeItem('logistics_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const user = USERS[username];
    
    if (user && user.password === password && user.isActive) {
      const userData = {
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        permissions: user.permissions
      };
      
      setUser(userData);
      localStorage.setItem('logistics_user', JSON.stringify(userData));
      
      // Log the login activity
      logActivity(user.username, 'LOGIN', 'User logged in successfully');
      
      return { success: true, user: userData };
    }
    
    return { success: false, error: 'Invalid credentials or inactive account' };
  };

  const logout = () => {
    if (user) {
      logActivity(user.username, 'LOGOUT', 'User logged out');
    }
    setUser(null);
    localStorage.removeItem('logistics_user');
  };

  const updateUserStatus = (username, isActive) => {
    if (USERS[username]) {
      // Prevent admin from being deactivated
      if (username === 'admin' && !isActive) {
        alert('Admin account cannot be deactivated for security reasons.');
        return;
      }
      USERS[username].isActive = isActive;
      // If deactivating current user, log them out
      if (user && user.username === username && !isActive) {
        logout();
      }
    }
  };

  const getAllUsers = () => {
    return Object.values(USERS).map(user => ({
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      lastLogin: getLastLogin(user.username)
    }));
  };

  const logActivity = (username, action, description) => {
    const activity = {
      id: Date.now(),
      username,
      action,
      description,
      timestamp: new Date().toISOString()
    };
    
    const activities = JSON.parse(localStorage.getItem('system_activities') || '[]');
    activities.unshift(activity);
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(100);
    }
    localStorage.setItem('system_activities', JSON.stringify(activities));
  };

  const getLastLogin = (username) => {
    const activities = JSON.parse(localStorage.getItem('system_activities') || '[]');
    const loginActivity = activities.find(activity => 
      activity.username === username && activity.action === 'LOGIN'
    );
    return loginActivity ? loginActivity.timestamp : null;
  };

  const getSystemActivities = () => {
    return JSON.parse(localStorage.getItem('system_activities') || '[]');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    updateUserStatus,
    getAllUsers,
    logActivity,
    getSystemActivities
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
