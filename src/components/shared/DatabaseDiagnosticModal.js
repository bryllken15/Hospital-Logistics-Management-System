import React, { useState, useEffect } from 'react';
import { supabase, checkConnection } from '../../config/supabase';
import { 
  X, 
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
  Zap,
  Table,
  TrendingUp,
  FileText,
  Server
} from 'lucide-react';

const DatabaseDiagnosticModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('connection');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [connectionLogs, setConnectionLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      runAllDiagnostics();
    }
  }, [isOpen]);

  const runAllDiagnostics = async () => {
    setIsLoading(true);
    setConnectionStatus('checking');
    
    try {
      // Test basic connection
      const startTime = Date.now();
      const { connected, error } = await checkConnection();
      const responseTime = Date.now() - startTime;
      
      if (connected) {
        setConnectionStatus('connected');
        
        // Run all diagnostic tests in parallel
        const [
          details,
          tests,
          realtime,
          performance
        ] = await Promise.all([
          getConnectionDetails(),
          runTableTests(),
          testRealtimeConnection(),
          runPerformanceTests()
        ]);
        
        setConnectionDetails(details);
        setTestResults(tests);
        setRealtimeStatus(realtime);
        setPerformanceMetrics(performance);
        
        // Add to logs
        addToLogs('success', 'All diagnostics completed successfully');
      } else {
        setConnectionStatus('error');
        setConnectionDetails({ error: error || 'Connection failed' });
        addToLogs('error', `Connection failed: ${error}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionDetails({ error: error.message });
      addToLogs('error', `Diagnostic error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionDetails = async () => {
    try {
      const url = process.env.REACT_APP_SUPABASE_URL;
      const hasKey = !!process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      return {
        url: url || 'Not configured',
        hasCredentials: hasKey,
        environment: process.env.REACT_APP_ENVIRONMENT || 'development',
        debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { error: error.message };
    }
  };

  const runTableTests = async () => {
    const tables = [
      'users',
      'projects', 
      'procurement_requests',
      'purchase_orders',
      'inventory_items',
      'deliveries',
      'assets',
      'maintenance_logs',
      'documents',
      'workflow_instances',
      'notifications',
      'system_activities'
    ];

    const results = [];
    
    for (const table of tables) {
      try {
        const startTime = Date.now();
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        const responseTime = Date.now() - startTime;
        
        results.push({
          name: table,
          status: error ? 'error' : 'success',
          message: error ? error.message : 'Table accessible',
          responseTime,
          rowCount: data ? data.length : 0
        });
      } catch (error) {
        results.push({
          name: table,
          status: 'error',
          message: error.message,
          responseTime: 0,
          rowCount: 0
        });
      }
    }
    
    return results;
  };

  const testRealtimeConnection = async () => {
    try {
      const channel = supabase.channel('diagnostic_test');
      const subscription = channel.subscribe();
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ 
            connected: false, 
            error: 'Realtime connection timeout',
            status: 'TIMEOUT'
          });
        }, 5000);
        
        subscription.subscribe((status) => {
          clearTimeout(timeout);
          resolve({ 
            connected: status === 'SUBSCRIBED',
            status,
            error: status !== 'SUBSCRIBED' ? `Status: ${status}` : null
          });
        });
      });
    } catch (error) {
      return { 
        connected: false, 
        error: error.message,
        status: 'ERROR'
      };
    }
  };

  const runPerformanceTests = async () => {
    const tests = [];
    
    // Test simple query performance
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(10);
      const responseTime = Date.now() - startTime;
      
      tests.push({
        name: 'Simple Query (10 rows)',
        responseTime,
        status: error ? 'error' : 'success',
        error: error?.message
      });
    } catch (error) {
      tests.push({
        name: 'Simple Query (10 rows)',
        responseTime: 0,
        status: 'error',
        error: error.message
      });
    }

    // Test count query performance
    try {
      const startTime = Date.now();
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      const responseTime = Date.now() - startTime;
      
      tests.push({
        name: 'Count Query',
        responseTime,
        status: error ? 'error' : 'success',
        error: error?.message,
        result: count
      });
    } catch (error) {
      tests.push({
        name: 'Count Query',
        responseTime: 0,
        status: 'error',
        error: error.message
      });
    }

    return tests;
  };

  const addToLogs = (type, message) => {
    const log = {
      timestamp: new Date().toISOString(),
      type,
      message
    };
    setConnectionLogs(prev => [log, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'connection', label: 'Connection', icon: Database },
    { id: 'tables', label: 'Tables', icon: Table },
    { id: 'realtime', label: 'Real-time', icon: Zap },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'logs', label: 'Logs', icon: FileText }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Server className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Database Diagnostics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Connection Tab */}
          {activeTab === 'connection' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
                <button
                  onClick={runAllDiagnostics}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                {getStatusIcon(connectionStatus)}
                <span className={`text-lg font-medium ${
                  connectionStatus === 'connected' ? 'text-green-600' :
                  connectionStatus === 'error' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {connectionStatus === 'connected' ? 'Database Connected' :
                   connectionStatus === 'error' ? 'Connection Failed' :
                   'Checking Connection...'}
                </span>
              </div>

              {connectionDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">URL</span>
                    </div>
                    <p className="text-sm text-gray-600 font-mono break-all">
                      {connectionDetails.url}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Wifi className={`h-4 w-4 ${connectionDetails.hasCredentials ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="text-sm font-medium text-gray-700">Credentials</span>
                    </div>
                    <p className={`text-sm ${connectionDetails.hasCredentials ? 'text-green-600' : 'text-red-600'}`}>
                      {connectionDetails.hasCredentials ? 'Configured' : 'Missing'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Environment</span>
                    </div>
                    <p className="text-sm text-gray-600">{connectionDetails.environment}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Debug Mode</span>
                    </div>
                    <p className="text-sm text-gray-600">{connectionDetails.debugMode ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              )}

              {connectionDetails?.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800">Error Details</span>
                  </div>
                  <p className="text-sm text-red-700">{connectionDetails.error}</p>
                </div>
              )}
            </div>
          )}

          {/* Tables Tab */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Table Tests</h3>
              {testResults ? (
                <div className="space-y-2">
                  {testResults.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {test.responseTime}ms
                        </span>
                        <span className={`text-sm ${test.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {test.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Table className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Run diagnostics to test table connections</p>
                </div>
              )}
            </div>
          )}

          {/* Real-time Tab */}
          {activeTab === 'realtime' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Real-time Connection</h3>
              {realtimeStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(realtimeStatus.connected ? 'success' : 'error')}
                    <span className={`text-lg font-medium ${
                      realtimeStatus.connected ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {realtimeStatus.connected ? 'Real-time Connected' : 'Real-time Disconnected'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Status</span>
                      </div>
                      <p className="text-sm text-gray-600">{realtimeStatus.status}</p>
                    </div>
                    
                    {realtimeStatus.error && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-gray-700">Error</span>
                        </div>
                        <p className="text-sm text-red-600">{realtimeStatus.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Run diagnostics to test real-time connection</p>
                </div>
              )}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              {performanceMetrics ? (
                <div className="space-y-4">
                  {performanceMetrics.map((test, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{test.name}</span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(test.status)}
                          <span className="text-sm text-gray-600">{test.responseTime}ms</span>
                        </div>
                      </div>
                      {test.error && (
                        <p className="text-sm text-red-600">{test.error}</p>
                      )}
                      {test.result !== undefined && (
                        <p className="text-sm text-gray-600">Result: {test.result}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Run diagnostics to test performance</p>
                </div>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Connection Logs</h3>
              {connectionLogs.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {connectionLogs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(log.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{log.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No logs available yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={runAllDiagnostics}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Running...' : 'Run Diagnostics'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseDiagnosticModal;
