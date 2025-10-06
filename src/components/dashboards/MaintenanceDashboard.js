import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import RFIDScanner from '../shared/RFIDScanner';
import { 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Edit,
  Eye,
  Calendar,
  Settings,
  Package,
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MaintenanceDashboard = () => {
  const { user, logActivity } = useAuth();
  const [assets, setAssets] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [scheduledMaintenance, setScheduledMaintenance] = useState([]);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    assetId: '',
    type: '',
    description: '',
    priority: '',
    estimatedDuration: ''
  });

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock assets data
    setAssets([
      {
        id: 1,
        name: 'Ventilator - Model V200',
        tagId: 'RFID-001-VENT',
        category: 'Medical Equipment',
        condition: 'good',
        location: 'ICU Room 101',
        lastMaintenance: '2024-01-10',
        nextMaintenance: '2024-02-10',
        warrantyExpiry: '2025-06-15',
        purchaseDate: '2023-06-15',
        cost: 45000
      },
      {
        id: 2,
        name: 'X-Ray Machine - Model XR500',
        tagId: 'RFID-002-XRAY',
        category: 'Diagnostic Equipment',
        condition: 'needs_repair',
        location: 'Radiology Department',
        lastMaintenance: '2023-12-15',
        nextMaintenance: '2024-01-25',
        warrantyExpiry: '2024-12-31',
        purchaseDate: '2022-01-15',
        cost: 125000
      },
      {
        id: 3,
        name: 'Patient Monitor - Model PM300',
        tagId: 'RFID-003-MONITOR',
        category: 'Monitoring Equipment',
        condition: 'good',
        location: 'Emergency Ward',
        lastMaintenance: '2024-01-05',
        nextMaintenance: '2024-02-05',
        warrantyExpiry: '2026-03-20',
        purchaseDate: '2023-03-20',
        cost: 8500
      },
      {
        id: 4,
        name: 'Ultrasound Machine - Model US400',
        tagId: 'RFID-004-ULTRASOUND',
        category: 'Diagnostic Equipment',
        condition: 'critical',
        location: 'Maternity Ward',
        lastMaintenance: '2023-11-20',
        nextMaintenance: '2024-01-20',
        warrantyExpiry: '2024-08-10',
        purchaseDate: '2021-08-10',
        cost: 95000
      }
    ]);

    // Mock maintenance logs
    setMaintenanceLogs([
      {
        id: 1,
        assetId: 1,
        assetName: 'Ventilator - Model V200',
        type: 'Preventive',
        description: 'Regular cleaning and calibration',
        performedBy: 'maintenance1',
        date: '2024-01-10',
        duration: 2,
        status: 'completed',
        cost: 150
      },
      {
        id: 2,
        assetId: 2,
        assetName: 'X-Ray Machine - Model XR500',
        type: 'Repair',
        description: 'Fixed image quality issues',
        performedBy: 'maintenance1',
        date: '2024-01-08',
        duration: 4,
        status: 'completed',
        cost: 850
      },
      {
        id: 3,
        assetId: 3,
        assetName: 'Patient Monitor - Model PM300',
        type: 'Preventive',
        description: 'Software update and sensor calibration',
        performedBy: 'maintenance1',
        date: '2024-01-05',
        duration: 1,
        status: 'completed',
        cost: 75
      }
    ]);

    // Mock scheduled maintenance
    setScheduledMaintenance([
      {
        id: 1,
        assetId: 1,
        assetName: 'Ventilator - Model V200',
        type: 'Preventive',
        scheduledDate: '2024-02-10',
        priority: 'medium',
        estimatedDuration: 2,
        assignedTo: 'maintenance1'
      },
      {
        id: 2,
        assetId: 2,
        assetName: 'X-Ray Machine - Model XR500',
        type: 'Repair',
        scheduledDate: '2024-01-25',
        priority: 'high',
        estimatedDuration: 6,
        assignedTo: 'maintenance1'
      },
      {
        id: 3,
        assetId: 4,
        assetName: 'Ultrasound Machine - Model US400',
        type: 'Emergency Repair',
        scheduledDate: '2024-01-20',
        priority: 'critical',
        estimatedDuration: 8,
        assignedTo: 'maintenance1'
      }
    ]);
  };

  const handleRFIDScan = (scanResult) => {
    logActivity(user.username, 'RFID_SCAN', `Scanned asset RFID: ${scanResult.code}`);
    
    // Find asset by RFID tag ID
    const asset = assets.find(asset => asset.tagId === scanResult.code);
    if (asset) {
      alert(`Asset Found: ${asset.name}\nLocation: ${asset.location}\nCondition: ${asset.condition}\nNext Maintenance: ${asset.nextMaintenance}`);
    } else {
      alert(`RFID Code ${scanResult.code} not found in asset database`);
    }
  };

  const handleManualRFID = (scanResult) => {
    logActivity(user.username, 'RFID_MANUAL', `Manual asset RFID entry: ${scanResult.code}`);
    
    // Find asset by RFID tag ID
    const asset = assets.find(asset => asset.tagId === scanResult.code);
    if (asset) {
      alert(`Asset Found: ${asset.name}\nLocation: ${asset.location}\nCondition: ${asset.condition}\nNext Maintenance: ${asset.nextMaintenance}`);
    } else {
      alert(`RFID Code ${scanResult.code} not found in asset database`);
    }
  };

  const handleAddMaintenance = (e) => {
    e.preventDefault();
    const asset = assets.find(a => a.id === parseInt(newMaintenance.assetId));
    const maintenance = {
      id: maintenanceLogs.length + 1,
      assetId: parseInt(newMaintenance.assetId),
      assetName: asset?.name || '',
      type: newMaintenance.type,
      description: newMaintenance.description,
      performedBy: user.username,
      date: new Date().toISOString().split('T')[0],
      duration: parseInt(newMaintenance.estimatedDuration),
      status: 'scheduled',
      cost: 0
    };
    
    setMaintenanceLogs(prev => [maintenance, ...prev]);
    setNewMaintenance({ assetId: '', type: '', description: '', priority: '', estimatedDuration: '' });
    setShowAddMaintenance(false);
    
    logActivity(user.username, 'MAINTENANCE_SCHEDULE', `Scheduled maintenance for ${asset?.name}`);
  };

  const handleUpdateAssetCondition = (assetId, newCondition) => {
    setAssets(prev => 
      prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, condition: newCondition }
          : asset
      )
    );
    
    const asset = assets.find(a => a.id === assetId);
    logActivity(user.username, 'ASSET_CONDITION_UPDATE', `Updated condition for ${asset?.name} to ${newCondition}`);
  };

  const assetColumns = [
    { key: 'name', header: 'Asset Name' },
    { key: 'tagId', header: 'RFID Tag' },
    { key: 'category', header: 'Category' },
    { 
      key: 'condition', 
      header: 'Condition',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'good' ? 'bg-green-100 text-green-800' :
          value === 'needs_repair' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    { key: 'location', header: 'Location' },
    { key: 'nextMaintenance', header: 'Next Maintenance' }
  ];

  const maintenanceColumns = [
    { key: 'assetName', header: 'Asset' },
    { key: 'type', header: 'Type' },
    { key: 'description', header: 'Description' },
    { key: 'date', header: 'Date' },
    { key: 'duration', header: 'Duration (hrs)' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'completed' ? 'bg-green-100 text-green-800' :
          value === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>
      )
    }
  ];

  const scheduledColumns = [
    { key: 'assetName', header: 'Asset' },
    { key: 'type', header: 'Type' },
    { key: 'scheduledDate', header: 'Scheduled Date' },
    { 
      key: 'priority', 
      header: 'Priority',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'critical' ? 'bg-red-100 text-red-800' :
          value === 'high' ? 'bg-orange-100 text-orange-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    { key: 'estimatedDuration', header: 'Duration (hrs)' }
  ];

  const assetActions = (row) => (
    <div className="flex space-x-2">
      <button
        onClick={() => {
          const newCondition = prompt(`Update condition for ${row.name}:\n(good, needs_repair, critical)`, row.condition);
          if (newCondition && ['good', 'needs_repair', 'critical'].includes(newCondition)) {
            handleUpdateAssetCondition(row.id, newCondition);
          }
        }}
        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        title="Update Condition"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        className="p-1 text-green-600 hover:bg-green-50 rounded"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );

  // Calculate statistics
  const totalAssets = assets.length;
  const goodCondition = assets.filter(asset => asset.condition === 'good').length;
  const needsRepair = assets.filter(asset => asset.condition === 'needs_repair').length;
  const criticalAssets = assets.filter(asset => asset.condition === 'critical').length;

  // Chart data
  const conditionData = [
    { name: 'Good', value: goodCondition, color: '#10b981' },
    { name: 'Needs Repair', value: needsRepair, color: '#f59e0b' },
    { name: 'Critical', value: criticalAssets, color: '#ef4444' }
  ];

  const maintenanceData = [
    { month: 'Jan', preventive: 12, repair: 5, emergency: 2 },
    { month: 'Feb', preventive: 15, repair: 3, emergency: 1 },
    { month: 'Mar', preventive: 18, repair: 4, emergency: 3 },
    { month: 'Apr', preventive: 14, repair: 6, emergency: 1 },
    { month: 'May', preventive: 16, repair: 3, emergency: 2 },
    { month: 'Jun', preventive: 20, repair: 2, emergency: 1 }
  ];

  return (
    <DashboardLayout 
      title="Asset Lifecycle & Maintenance System" 
      subtitle="Asset Management & Maintenance Tracking"
    >
      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Assets"
            value={totalAssets}
            icon={Package}
            color="blue"
            subtitle="All tracked assets"
          />
          <StatCard
            title="Good Condition"
            value={goodCondition}
            icon={CheckCircle}
            color="green"
            subtitle="Operational"
          />
          <StatCard
            title="Needs Repair"
            value={needsRepair}
            icon={AlertTriangle}
            color="yellow"
            subtitle="Requires attention"
          />
          <StatCard
            title="Critical Assets"
            value={criticalAssets}
            icon={Settings}
            color="red"
            subtitle="Urgent repair needed"
          />
        </div>

        {/* RFID Scanner and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RFID Scanner */}
          <div className="lg:col-span-1">
            <RFIDScanner
              title="Asset RFID Scanner"
              onScan={handleRFIDScan}
              onManualInput={handleManualRFID}
            />
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asset Condition */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Condition</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={conditionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {conditionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Maintenance Types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Maintenance</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={maintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="preventive" stackId="a" fill="#10b981" />
                  <Bar dataKey="repair" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="emergency" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowAddMaintenance(true)}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Schedule Maintenance</span>
            </button>
            <button 
              onClick={() => {
                const calendarData = scheduledMaintenance.map(sched => ({
                  asset: sched.assetName,
                  type: sched.type,
                  date: sched.scheduledDate,
                  priority: sched.priority
                }));
                alert(`Maintenance Calendar:\n${calendarData.map(c => 
                  `${c.date}: ${c.asset}\n- Type: ${c.type}\n- Priority: ${c.priority}\n`
                ).join('\n')}`);
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Calendar className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Maintenance Calendar</span>
            </button>
            <button 
              onClick={() => {
                const reportData = {
                  totalAssets: assets.length,
                  goodCondition: assets.filter(asset => asset.condition === 'good').length,
                  needsRepair: assets.filter(asset => asset.condition === 'needs_repair').length,
                  criticalAssets: assets.filter(asset => asset.condition === 'critical').length,
                  totalMaintenanceCost: maintenanceLogs.reduce((sum, log) => sum + log.cost, 0)
                };
                alert(`Asset Report:\n\nAssets:\n- Total: ${reportData.totalAssets}\n- Good: ${reportData.goodCondition}\n- Needs Repair: ${reportData.needsRepair}\n- Critical: ${reportData.criticalAssets}\n\nMaintenance Cost: $${reportData.totalMaintenanceCost.toLocaleString()}`);
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Asset Reports</span>
            </button>
            <button 
              onClick={() => {
                const equipmentData = assets.map(asset => ({
                  name: asset.name,
                  tagId: asset.tagId,
                  location: asset.location,
                  condition: asset.condition,
                  nextMaintenance: asset.nextMaintenance
                }));
                alert(`Equipment Tracker:\n${equipmentData.map(e => 
                  `${e.name} (${e.tagId})\n- Location: ${e.location}\n- Condition: ${e.condition}\n- Next Maintenance: ${e.nextMaintenance}\n`
                ).join('\n')}`);
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <Settings className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Equipment Tracker</span>
            </button>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assets */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Overview</h2>
            <DataTable
              data={assets}
              columns={assetColumns}
              actions={assetActions}
              searchable={true}
              itemsPerPage={8}
            />
          </div>

          {/* Maintenance Logs */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Maintenance Logs</h2>
            <DataTable
              data={maintenanceLogs}
              columns={maintenanceColumns}
              searchable={true}
              itemsPerPage={8}
            />
          </div>
        </div>

        {/* Scheduled Maintenance */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Maintenance</h2>
          <DataTable
            data={scheduledMaintenance}
            columns={scheduledColumns}
            searchable={true}
            itemsPerPage={8}
          />
        </div>

        {/* Add Maintenance Modal */}
        {showAddMaintenance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Maintenance</h3>
              <form onSubmit={handleAddMaintenance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
                  <select
                    value={newMaintenance.assetId}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, assetId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Asset</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>{asset.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                  <select
                    value={newMaintenance.type}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Preventive">Preventive</option>
                    <option value="Repair">Repair</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Inspection">Inspection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newMaintenance.priority}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (hours)</label>
                  <input
                    type="number"
                    value={newMaintenance.estimatedDuration}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newMaintenance.description}
                    onChange={(e) => setNewMaintenance(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMaintenance(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Schedule Maintenance
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MaintenanceDashboard;
