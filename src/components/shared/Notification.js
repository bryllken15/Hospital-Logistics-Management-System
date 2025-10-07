import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X, Bell, Workflow, FileText, Package } from 'lucide-react';

const Notification = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'workflow':
        return <Workflow className="h-5 w-5 text-blue-500" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-purple-500" />;
      case 'project':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'inventory':
        return <Package className="h-5 w-5 text-orange-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'workflow':
        return 'bg-blue-50 border-blue-200';
      case 'announcement':
        return 'bg-purple-50 border-purple-200';
      case 'project':
        return 'bg-indigo-50 border-indigo-200';
      case 'inventory':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'workflow':
        return 'text-blue-800';
      case 'announcement':
        return 'text-purple-800';
      case 'project':
        return 'text-indigo-800';
      case 'inventory':
        return 'text-orange-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-full mx-4 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`rounded-lg border p-4 shadow-lg ${getBackgroundColor()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className={`text-sm font-medium ${getTextColor()}`}>
              {message}
            </div>
          </div>
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={handleClose}
              className={`rounded-md p-1 hover:bg-white hover:bg-opacity-50 transition-colors ${getTextColor()}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Context
const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info', duration = 5000, title = null) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration, title }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message, duration = 5000, title = 'Success') => {
    showNotification(message, 'success', duration, title);
  };

  const showError = (message, duration = 5000, title = 'Error') => {
    showNotification(message, 'error', duration, title);
  };

  const showWarning = (message, duration = 5000, title = 'Warning') => {
    showNotification(message, 'warning', duration, title);
  };

  const showInfo = (message, duration = 5000, title = 'Information') => {
    showNotification(message, 'info', duration, title);
  };

  const showWorkflow = (message, duration = 5000, title = 'Workflow Update') => {
    showNotification(message, 'workflow', duration, title);
  };

  const showAnnouncement = (message, duration = 5000, title = 'Announcement') => {
    showNotification(message, 'announcement', duration, title);
  };

  const showProject = (message, duration = 5000, title = 'Project Update') => {
    showNotification(message, 'project', duration, title);
  };

  const showInventory = (message, duration = 5000, title = 'Inventory Update') => {
    showNotification(message, 'inventory', duration, title);
  };

  return (
    <NotificationContext.Provider value={{ 
      showSuccess, 
      showError, 
      showWarning, 
      showInfo, 
      showWorkflow, 
      showAnnouncement, 
      showProject, 
      showInventory 
    }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default Notification;
