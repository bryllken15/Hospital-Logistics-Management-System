import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Bell, Menu, X, Home, Users, Settings, BarChart3, Package, Truck, Wrench, FileText, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

const DashboardLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getRoleColor = (role) => {
    const colors = {
      'Admin': 'bg-red-100 text-red-800 border-red-200',
      'Manager': 'bg-blue-100 text-blue-800 border-blue-200',
      'Employee': 'bg-green-100 text-green-800 border-green-200',
      'Procurement Staff': 'bg-purple-100 text-purple-800 border-purple-200',
      'Project Manager': 'bg-orange-100 text-orange-800 border-orange-200',
      'Maintenance Staff': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Document Analyst': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleIcon = (role) => {
    const icons = {
      'Admin': Shield,
      'Manager': BarChart3,
      'Employee': Package,
      'Procurement Staff': Truck,
      'Project Manager': Users,
      'Maintenance Staff': Wrench,
      'Document Analyst': FileText
    };
    return icons[role] || Home;
  };

  const RoleIcon = getRoleIcon(user?.role);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="neumorphic-card p-8 max-w-md mx-auto">
            <div className="loading-spinner mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden neumorphic-button p-3 text-gray-600 hover:text-gray-900 transition-all duration-200"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <div className="ml-4 lg:ml-0 animate-slide-in-left">
                <h1 className="text-2xl font-bold text-gradient">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 font-medium">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4 animate-slide-in-right">
              {/* Notifications */}
              <button className="neumorphic-button p-3 text-gray-600 hover:text-gray-900 transition-all duration-200 relative group">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Notifications
                </div>
              </button>

              {/* User info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getRoleColor(user?.role)}`}>
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {user?.role}
                  </span>
                </div>
                
                {/* Enhanced User avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="neumorphic-button p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Logout
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Main content with animations */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-scale">
          {children}
        </div>
      </main>

      {/* Enhanced Sidebar for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-xl">
            <div className="h-0 flex-1 overflow-y-auto py-6">
              <div className="px-4">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">L1</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Logistics 1</h2>
                    <p className="text-sm text-gray-600">Hospital System</p>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  <a href="#" className="sidebar-item active flex items-center px-3 py-2 text-sm font-medium rounded-lg">
                    <Home className="h-5 w-5 mr-3" />
                    Dashboard
                  </a>
                  <a href="#" className="sidebar-item flex items-center px-3 py-2 text-sm font-medium rounded-lg">
                    <BarChart3 className="h-5 w-5 mr-3" />
                    Analytics
                  </a>
                  <a href="#" className="sidebar-item flex items-center px-3 py-2 text-sm font-medium rounded-lg">
                    <Users className="h-5 w-5 mr-3" />
                    Users
                  </a>
                  <a href="#" className="sidebar-item flex items-center px-3 py-2 text-sm font-medium rounded-lg">
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
