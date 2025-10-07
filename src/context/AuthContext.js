import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { userService } from '../services/database/users';
import { activityService } from '../services/database/activities';
import { realtimeService } from '../services/database/realtime';

// Predefined users for the system (fallback for development)
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
  const [useDatabase, setUseDatabase] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    // Initialize authentication
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // First, try to check Supabase connection
      const { connected, error } = await checkSupabaseConnection();
      
      if (connected) {
        setUseDatabase(true);
        setConnectionStatus('connected');
        
        // Set up Supabase auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              await handleSupabaseSignIn(session);
            } else if (event === 'SIGNED_OUT') {
              handleSignOut();
            }
          }
        );

        // Check if user is already signed in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await handleSupabaseSignIn(session);
        } else {
          // Check for saved user in localStorage as fallback
          checkLocalStorageUser();
        }

        // Cleanup subscription on unmount
        return () => subscription.unsubscribe();
      } else {
        // Supabase not available, use local storage
        setUseDatabase(false);
        setConnectionStatus('local');
        checkLocalStorageUser();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUseDatabase(false);
      setConnectionStatus('local');
      checkLocalStorageUser();
    } finally {
      setLoading(false);
    }
  };

  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      return { connected: true, error: null };
    } catch (error) {
      console.error('Supabase connection failed:', error);
      return { connected: false, error: error.message };
    }
  };

  const checkLocalStorageUser = () => {
    const savedUser = localStorage.getItem('logistics_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
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
  };

  const handleSupabaseSignIn = async (session) => {
    try {
      // Get user profile from database
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (error) throw error;

      if (profile && profile.is_active) {
        const userData = {
          id: profile.id,
          username: profile.username,
          role: profile.role,
          name: profile.full_name,
          email: profile.email,
          permissions: profile.permissions || [],
          useDatabase: true,
          supabaseUser: session.user
        };

        setUser(userData);
        localStorage.setItem('logistics_user', JSON.stringify(userData));

        // Update last login
        await userService.updateLastLogin(profile.id);
        
        // Log the login activity
        await logActivity(profile.id, profile.username, 'LOGIN', 'User logged in via Supabase Auth');
      }
    } catch (error) {
      console.error('Error handling Supabase sign in:', error);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('logistics_user');
  };

  // Verify user in database
  const verifyUserInDatabase = async (userData) => {
    try {
      const result = await userService.getUserByUsername(userData.username);
      if (result.data && result.data.is_active) {
        setUser({
          ...userData,
          id: result.data.id,
          last_login: result.data.last_login
        });
        // Update last login
        await userService.updateLastLogin(result.data.id);
      } else {
        localStorage.removeItem('logistics_user');
      }
    } catch (error) {
      console.error('Error verifying user in database:', error);
      // Fallback to local storage
      const currentUser = USERS[userData.username];
      if (currentUser && currentUser.isActive) {
        setUser(userData);
      } else {
        localStorage.removeItem('logistics_user');
      }
    }
  };

  const login = async (username, password) => {
    try {
      if (useDatabase && connectionStatus === 'connected') {
        // Try Supabase Auth first
        try {
          // Get user email from database
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('email')
            .eq('username', username)
            .single();

          if (profileError) throw profileError;

          // Sign in with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: userProfile.email,
            password: password
          });

          if (authError) throw authError;

          // The onAuthStateChange listener will handle the rest
          return { success: true, user: null }; // User will be set by the listener
        } catch (supabaseError) {
          console.error('Supabase Auth failed:', supabaseError);
          // Fall back to local authentication
          return await fallbackLocalLogin(username, password);
        }
      } else {
        // Use local authentication
        return await fallbackLocalLogin(username, password);
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const fallbackLocalLogin = async (username, password) => {
    try {
      // Try database authentication with predefined passwords
      if (useDatabase) {
        const dbResult = await userService.getUserByUsername(username);
        if (dbResult.data && dbResult.data.is_active) {
          const predefinedUser = USERS[username];
          if (predefinedUser && predefinedUser.password === password) {
            const userData = {
              id: dbResult.data.id,
              username: dbResult.data.username,
              role: dbResult.data.role,
              name: dbResult.data.full_name,
              email: dbResult.data.email,
              permissions: dbResult.data.permissions || predefinedUser.permissions,
              useDatabase: true
            };
            
            setUser(userData);
            localStorage.setItem('logistics_user', JSON.stringify(userData));
            
            // Update last login in database
            await userService.updateLastLogin(dbResult.data.id);
            
            // Log the login activity
            await logActivity(dbResult.data.id, username, 'LOGIN', 'User logged in successfully');
            
            return { success: true, user: userData };
          }
        }
      }
      
      // Fallback to local storage authentication
      const user = USERS[username];
      if (user && user.password === password && user.isActive) {
        const userData = {
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          permissions: user.permissions,
          useDatabase: false
        };
        
        setUser(userData);
        localStorage.setItem('logistics_user', JSON.stringify(userData));
        
        // Log the login activity
        logActivity(user.username, 'LOGIN', 'User logged in successfully');
        
        return { success: true, user: userData };
      }
      
      return { success: false, error: 'Invalid credentials or inactive account' };
    } catch (error) {
      console.error('Fallback login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    if (user) {
      try {
        if (user.useDatabase && user.id) {
          await logActivity(user.id, user.username, 'LOGOUT', 'User logged out');
        } else {
          logActivity(user.username, 'LOGOUT', 'User logged out');
        }
      } catch (error) {
        console.error('Error logging logout activity:', error);
      }
    }

    // Sign out from Supabase Auth if using database
    if (useDatabase && connectionStatus === 'connected') {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Supabase sign out error:', error);
      }
    }

    setUser(null);
    localStorage.removeItem('logistics_user');
  };

  const updateUserStatus = async (username, isActive) => {
    try {
      if (useDatabase) {
        // Update in database
        const userResult = await userService.getUserByUsername(username);
        if (userResult.data) {
          // Prevent admin from being deactivated
          if (userResult.data.role === 'Admin' && !isActive) {
            alert('Admin account cannot be deactivated for security reasons.');
            return;
          }
          
          await userService.updateUserStatus(userResult.data.id, isActive);
          
          // If deactivating current user, log them out
          if (user && user.username === username && !isActive) {
            await logout();
          }
        }
      } else {
        // Update in local storage
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
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getAllUsers = async () => {
    try {
      if (useDatabase) {
        const result = await userService.getAllUsers();
        if (result.data) {
          return result.data.map(user => ({
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.full_name,
            email: user.email,
            isActive: user.is_active,
            lastLogin: user.last_login
          }));
        }
        return [];
      } else {
        // Fallback to local storage
        return Object.values(USERS).map(user => ({
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          lastLogin: getLastLogin(user.username)
        }));
      }
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  };

  const logActivity = async (userId, username, action, description, metadata = {}) => {
    try {
      if (useDatabase && userId) {
        // Log to database
        await activityService.logUserActivity(
          userId,
          username,
          action,
          description,
          metadata
        );
      } else {
        // Fallback to local storage
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
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const getLastLogin = (username) => {
    const activities = JSON.parse(localStorage.getItem('system_activities') || '[]');
    const loginActivity = activities.find(activity => 
      activity.username === username && activity.action === 'LOGIN'
    );
    return loginActivity ? loginActivity.timestamp : null;
  };

  const getSystemActivities = async () => {
    try {
      if (useDatabase) {
        const result = await activityService.getRecentActivities(100);
        return result.data || [];
      } else {
        // Fallback to local storage
        return JSON.parse(localStorage.getItem('system_activities') || '[]');
      }
    } catch (error) {
      console.error('Error getting system activities:', error);
      return [];
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    updateUserStatus,
    getAllUsers,
    logActivity,
    getSystemActivities,
    useDatabase,
    setUseDatabase,
    connectionStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
