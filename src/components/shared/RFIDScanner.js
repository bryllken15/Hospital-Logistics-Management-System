import React, { useState, useEffect } from 'react';
import { Radio, CheckCircle, AlertCircle, Zap, Clock, Wifi, WifiOff } from 'lucide-react';

const RFIDScanner = ({ 
  onScan, 
  onManualInput, 
  title = "RFID Scanner", 
  className = '',
  showStats = true,
  autoScan = false
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [lastScanResult, setLastScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    // Simulate connection status changes
    const interval = setInterval(() => {
      setConnectionStatus(Math.random() > 0.1 ? 'connected' : 'disconnected');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const simulateScan = () => {
    setIsScanning(true);
    setScanCount(prev => prev + 1);
    
    // Simulate scanning delay with realistic timing
    setTimeout(() => {
      const rfidCode = `RFID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const result = {
        code: rfidCode,
        timestamp: new Date().toISOString(),
        status: 'success',
        signalStrength: Math.floor(Math.random() * 100) + 1
      };
      
      setLastScanResult(result);
      setScanHistory(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 scans
      setIsScanning(false);
      
      if (onScan) {
        onScan(result);
      }
    }, 1500);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      const result = {
        code: manualCode.trim(),
        timestamp: new Date().toISOString(),
        status: 'manual',
        isManual: true,
        signalStrength: 100
      };
      
      setLastScanResult(result);
      setScanHistory(prev => [result, ...prev.slice(0, 4)]);
      if (onManualInput) {
        onManualInput(result);
      }
      setManualCode('');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Radio className="h-5 w-5 text-blue-500" />;
    }
  };

  const getConnectionIcon = () => {
    return connectionStatus === 'connected' ? 
      <Wifi className="h-4 w-4 text-green-500" /> : 
      <WifiOff className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className={`card-modern p-6 ${className}`}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Radio className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {getConnectionIcon()}
              <span className="capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>
        
        {showStats && (
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{scanCount}</div>
            <div className="text-xs text-gray-500">Total Scans</div>
          </div>
        )}
      </div>

      {/* Enhanced Scan Button */}
      <div className="mb-6">
        <button
          onClick={simulateScan}
          disabled={isScanning || connectionStatus === 'disconnected'}
          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
            isScanning
              ? 'bg-gray-400 text-white cursor-not-allowed scale-95'
              : connectionStatus === 'disconnected'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 focus:ring-4 focus:ring-blue-500/50 shadow-lg hover:shadow-xl'
          }`}
        >
          {isScanning ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Scanning RFID Tag...</span>
            </div>
          ) : connectionStatus === 'disconnected' ? (
            <div className="flex items-center justify-center space-x-2">
              <WifiOff className="h-5 w-5" />
              <span>Scanner Offline</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Scan RFID Tag</span>
            </div>
          )}
        </button>
      </div>

      {/* Enhanced Manual Input */}
      <form onSubmit={handleManualSubmit} className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Manual Entry
        </label>
        <div className="flex space-x-3">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter RFID code manually..."
            className="input-modern flex-1"
            disabled={connectionStatus === 'disconnected'}
          />
          <button
            type="submit"
            disabled={!manualCode.trim() || connectionStatus === 'disconnected'}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </form>

      {/* Enhanced Last Scan Result */}
      {lastScanResult && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Last Scan Result</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(lastScanResult.status)}
              {lastScanResult.signalStrength && (
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{lastScanResult.signalStrength}%</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-mono text-blue-600 bg-white/50 px-3 py-2 rounded-lg text-sm">
              {lastScanResult.code}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(lastScanResult.timestamp).toLocaleString()}</span>
              </div>
              {lastScanResult.isManual && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Manual Entry
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Scan History */}
      {scanHistory.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Scans</h4>
          <div className="space-y-2">
            {scanHistory.slice(0, 3).map((scan, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="font-mono text-sm text-gray-700">{scan.code}</div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(scan.status)}
                  <span className="text-xs text-gray-500">
                    {new Date(scan.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Scan Animation */}
      {isScanning && (
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-600">Scanning in Progress</p>
              <p className="text-xs text-blue-500 mt-1">Please hold the RFID tag near the scanner</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFIDScanner;
