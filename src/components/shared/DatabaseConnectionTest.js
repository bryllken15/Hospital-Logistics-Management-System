import React, { useState, useEffect } from 'react';
import { supabase, checkConnection } from '../../config/supabase';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Wifi, 
  WifiOff,
  Settings,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';

const DatabaseConnectionTest = ({ 
  showDetails = false, 
  compact = false, 
  onStatusChange = null,
  className = "" 
}) => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [responseTime, setResponseTime] = useState(null);

  useEffect(() => {
    performConnectionTest();
  }, []);

  const performConnectionTest = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      // Test basic connection
      const { connected, error } = await checkConnection();
      const endTime = Date.now();
      const responseTimeMs = endTime - startTime;
      
      setResponseTime(responseTimeMs);
      setLastChecked(new Date());
      
      if (connected) {
        setConnectionStatus('connected');
        
        // Get additional connection details
        const details = await getConnectionDetails();
        setConnectionDetails(details);
        
        // Run test queries
        const tests = await runTestQueries();
        setTestResults(tests);
        
        if (onStatusChange) onStatusChange('connected', details);
      } else {
        setConnectionStatus('error');
        setConnectionDetails({ error: error || 'Connection failed' });
        if (onStatusChange) onStatusChange('error', { error });
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionDetails({ error: error.message });
      if (onStatusChange) onStatusChange('error', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionDetails = async () => {
    try {
      const url = process.env.REACT_APP_SUPABASE_URL;
      const hasKey = !!process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      // Test real-time connection
      const realtimeTest = await testRealtimeConnection();
      
      return {
        url: url || 'Not configured',
        hasCredentials: hasKey,
        realtimeConnected: realtimeTest.connected,
        realtimeError: realtimeTest.error,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { error: error.message };
    }
  };

  const testRealtimeConnection = async () => {
    try {
      const channel = supabase.channel('connection_test');
      const subscription = channel.subscribe();
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ connected: false, error: 'Realtime connection timeout' });
        }, 5000);
        
        subscription.subscribe((status) => {
          clearTimeout(timeout);
          if (status === 'SUBSCRIBED') {
            resolve({ connected: true });
          } else {
            resolve({ connected: false, error: `Realtime status: ${status}` });
          }
        });
      });
    } catch (error) {
      return { connected: false, error: error.message };
    }
  };

  const runTestQueries = async () => {
    const tests = [];
    
    try {
      // Test users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      tests.push({
        name: 'Users Table',
        status: usersError ? 'error' : 'success',
        message: usersError ? usersError.message : 'Table accessible',
        responseTime: Date.now()
      });
    } catch (error) {
      tests.push({
        name: 'Users Table',
        status: 'error',
        message: error.message,
        responseTime: Date.now()
      });
    }

    try {
      // Test projects table
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('count')
        .limit(1);
      
      tests.push({
        name: 'Projects Table',
        status: projectsError ? 'error' : 'success',
        message: projectsError ? projectsError.message : 'Table accessible',
        responseTime: Date.now()
      });
    } catch (error) {
      tests.push({
        name: 'Projects Table',
        status: 'error',
        message: error.message,
        responseTime: Date.now()
      });
    }

    try {
      // Test system_activities table
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('system_activities')
        .select('count')
        .limit(1);
      
      tests.push({
        name: 'System Activities',
        status: activitiesError ? 'error' : 'success',
        message: activitiesError ? activitiesError.message : 'Table accessible',
        responseTime: Date.now()
      });
    } catch (error) {
      tests.push({
        name: 'System Activities',
        status: 'error',
        message: error.message,
        responseTime: Date.now()
      });
    }

    return tests;
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Database Connected';
      case 'error':
        return 'Connection Failed';
      case 'checking':
        return 'Checking Connection...';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'checking':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {responseTime && (
          <span className="text-xs text-gray-500">
            ({responseTime}ms)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Database className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Database Connection</h3>
        </div>
        <button
          onClick={performConnectionTest}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Test</span>
        </button>
      </div>

      {/* Status Display */}
      <div className="flex items-center space-x-3 mb-4">
        {getStatusIcon()}
        <span className={`text-lg font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {responseTime && (
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{responseTime}ms</span>
          </div>
        )}
      </div>

      {/* Connection Details */}
      {connectionDetails && (
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">URL:</span>
              <span className="text-sm font-mono text-gray-900 truncate">
                {connectionDetails.url}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Wifi className={`h-4 w-4 ${connectionDetails.hasCredentials ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm text-gray-600">Credentials:</span>
              <span className={`text-sm ${connectionDetails.hasCredentials ? 'text-green-600' : 'text-red-600'}`}>
                {connectionDetails.hasCredentials ? 'Configured' : 'Missing'}
              </span>
            </div>
          </div>

          {connectionDetails.realtimeConnected !== undefined && (
            <div className="flex items-center space-x-2">
              {connectionDetails.realtimeConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600">Real-time:</span>
              <span className={`text-sm ${connectionDetails.realtimeConnected ? 'text-green-600' : 'text-red-600'}`}>
                {connectionDetails.realtimeConnected ? 'Connected' : 'Disconnected'}
              </span>
              {connectionDetails.realtimeError && (
                <span className="text-xs text-red-500 ml-2">
                  ({connectionDetails.realtimeError})
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Test Results */}
      {testResults && showDetails && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart3 className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Table Tests</span>
          </div>
          {testResults.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                {test.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium">{test.name}</span>
              </div>
              <span className={`text-xs ${test.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {test.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Error Details */}
      {connectionDetails?.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-800">Error Details</span>
          </div>
          <p className="text-sm text-red-700">{connectionDetails.error}</p>
        </div>
      )}

      {/* Last Checked */}
      {lastChecked && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default DatabaseConnectionTest;
