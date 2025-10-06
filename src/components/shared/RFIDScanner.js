import React, { useState } from 'react';
import { Radio, CheckCircle, AlertCircle } from 'lucide-react';

const RFIDScanner = ({ onScan, onManualInput, title = "RFID Scanner" }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [lastScanResult, setLastScanResult] = useState(null);

  const simulateScan = () => {
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      const rfidCode = `RFID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const result = {
        code: rfidCode,
        timestamp: new Date().toISOString(),
        status: 'success'
      };
      
      setLastScanResult(result);
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
        isManual: true
      };
      
      setLastScanResult(result);
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Radio className="h-5 w-5 mr-2 text-blue-600" />
          {title}
        </h3>
      </div>

      {/* Scan Button */}
      <div className="mb-6">
        <button
          onClick={simulateScan}
          disabled={isScanning}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            isScanning
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {isScanning ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Scanning...
            </div>
          ) : (
            'Scan RFID Tag'
          )}
        </button>
      </div>

      {/* Manual Input */}
      <form onSubmit={handleManualSubmit} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or Enter RFID Code Manually:
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter RFID code..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!manualCode.trim()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </form>

      {/* Last Scan Result */}
      {lastScanResult && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Last Scan Result:</span>
            {getStatusIcon(lastScanResult.status)}
          </div>
          <div className="text-sm text-gray-600">
            <div className="font-mono text-blue-600">{lastScanResult.code}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(lastScanResult.timestamp).toLocaleString()}
              {lastScanResult.isManual && ' (Manual Entry)'}
            </div>
          </div>
        </div>
      )}

      {/* Scan Animation Demo */}
      {isScanning && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-center text-sm text-blue-600 mt-2">
            Simulating RFID scan...
          </p>
        </div>
      )}
    </div>
  );
};

export default RFIDScanner;
