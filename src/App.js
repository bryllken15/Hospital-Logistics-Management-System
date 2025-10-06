import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './components/shared/Notification';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/dashboards/AdminDashboard';
import ManagerDashboard from './components/dashboards/ManagerDashboard';
import EmployeeDashboard from './components/dashboards/EmployeeDashboard';
import ProcurementDashboard from './components/dashboards/ProcurementDashboard';
import ProjectManagerDashboard from './components/dashboards/ProjectManagerDashboard';
import MaintenanceDashboard from './components/dashboards/MaintenanceDashboard';
import DocumentAnalystDashboard from './components/dashboards/DocumentAnalystDashboard';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Main App Router
const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {user?.role === 'Admin' && <AdminDashboard />}
            {user?.role === 'Manager' && <ManagerDashboard />}
            {user?.role === 'Employee' && <EmployeeDashboard />}
            {user?.role === 'Procurement Staff' && <ProcurementDashboard />}
            {user?.role === 'Project Manager' && <ProjectManagerDashboard />}
            {user?.role === 'Maintenance Staff' && <MaintenanceDashboard />}
            {user?.role === 'Document Analyst' && <DocumentAnalystDashboard />}
          </ProtectedRoute>
        } 
      />

      {/* Direct role-based routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/manager" 
        element={
          <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/employee" 
        element={
          <ProtectedRoute allowedRoles={['Employee', 'Admin']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/procurement" 
        element={
          <ProtectedRoute allowedRoles={['Procurement Staff', 'Admin']}>
            <ProcurementDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/project" 
        element={
          <ProtectedRoute allowedRoles={['Project Manager', 'Admin']}>
            <ProjectManagerDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/maintenance" 
        element={
          <ProtectedRoute allowedRoles={['Maintenance Staff', 'Admin']}>
            <MaintenanceDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/document" 
        element={
          <ProtectedRoute allowedRoles={['Document Analyst', 'Admin']}>
            <DocumentAnalystDashboard />
          </ProtectedRoute>
        } 
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route 
        path="/unauthorized" 
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
              <button 
                onClick={() => window.history.back()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <AppRouter />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
