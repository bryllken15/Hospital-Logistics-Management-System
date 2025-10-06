import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  Bell,
  Menu,
  X,
  Home,
  Users,
  FileText,
  Settings,
  BarChart3,
  Activity,
  Shield,
  Wrench,
  FolderOpen,
  ChevronDown,
  Search,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';

const DashboardLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const getRoleColor = (role) => {
    const colors = {
      'Admin': 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      'Manager': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      'Employee': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
      'Procurement Staff': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      'Project Manager': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
      'Maintenance Staff': 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      'Document Analyst': 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
    };
    return colors[role] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  const getNavigationItems = (role) => {
    const navItems = {
      'Admin': [
        { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/admin' },
        { id: 'users', label: 'User Management', icon: Users, href: '/admin/users' },
        { id: 'system', label: 'System Settings', icon: Settings, href: '/admin/system' },
        { id: 'security', label: 'Security Logs', icon: Shield, href: '/admin/security' },
        { id: 'reports', label: 'Reports', icon: BarChart3, href: '/admin/reports' }
      ],
      'Manager': [
        { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/manager' },
        { id: 'procurement', label: 'Procurement', icon: FileText, href: '/manager/procurement' },
        { id: 'projects', label: 'Projects', icon: FolderOpen, href: '/manager/projects' },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/manager/analytics' },
        { id: 'team', label: 'Team', icon: Users, href: '/manager/team' }
      ],
      'Employee': [
        { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/employee' },
        { id: 'requests', label: 'My Requests', icon: FileText, href: '/employee/requests' },
        { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/employee/calendar' },
        { id: 'profile', label: 'Profile', icon: User, href: '/employee/profile' }
      ],
      'Procurement Staff': [
        { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/procurement' },
        { id: 'requests', label: 'Purchase Requests', icon: FileText, href: '/procurement/requests' },
        { id: 'suppliers', label: 'Suppliers', icon: Users, href: '/procurement/suppliers' },
        { id: 'inventory', label: 'Inventory', icon: BarChart3, href: '/procurement/inventory' }
      ],
      'Project Manager': [
        { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/project-manager' },
        { id: 'projects', label: 'My Projects', icon: FolderOpen, href: '/project-manager/projects' },
        { id: 'team', label: 'Team', icon: Users, href: '/project-manager/team' },
        { id: 'timeline', label: 'Timeline', icon: Calendar, href: '/project-manager/timeline' }
      ],
      'Maintenance Staff': [
        { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/maintenance' },
        { id: 'workorders', label: 'Work Orders', icon: Wrench, href: '/maintenance/workorders' },
        { id: 'equipment', label: 'Equipment', icon: Settings, href: '/maintenance/equipment' },
        { id: 'schedule', label: 'Schedule', icon: Calendar, href: '/maintenance/schedule' }
      ],
      'Document Analyst': [
        { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/document-analyst' },
        { id: 'documents', label: 'Documents', icon: FileText, href: '/document-analyst/documents' },
        { id: 'analysis', label: 'Analysis', icon: BarChart3, href: '/document-analyst/analysis' },
        { id: 'reports', label: 'Reports', icon: TrendingUp, href: '/document-analyst/reports' }
      ]
    };
    return navItems[role] || [];
  };

  const navigationItems = getNavigationItems(user?.role);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse-glow">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 dashboard-sidebar transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">L1</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Logistics 1</h2>
                <p className="text-white/70 text-sm">Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full sidebar-item flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 ${
                    isActive ? 'active' : 'text-white/80 hover:text-white'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user?.name}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role)}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors neumorphic-button"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="ml-4 lg:ml-0 animate-slide-left">
                <h1 className="text-xl font-bold text-gray-900 text-gradient">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative neumorphic-button">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={logout}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors neumorphic-button"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-slide-up">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Logistics 1</p>
                <p className="text-xs text-gray-600">Smart Supply Chain & Procurement Management</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">
                © 2024 Logistics 1. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
