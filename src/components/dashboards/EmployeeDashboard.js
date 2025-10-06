import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../shared/Notification';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import RFIDScanner from '../shared/RFIDScanner';
import { 
  Package, 
  PackageOpen, 
  Truck, 
  AlertTriangle,
  Plus,
  Edit,
  Download,
  Eye,
  Megaphone,
  MessageSquare,
  X
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, logActivity } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [inventory, setInventory] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    location: '',
    rfidCode: ''
  });

  useEffect(() => {
    loadMockData();
    loadAnnouncement();
  }, []);

  const loadAnnouncement = () => {
    const savedAnnouncement = localStorage.getItem('hospitalAnnouncement');
    if (savedAnnouncement) {
      setCurrentAnnouncement(savedAnnouncement);
    }
  };

  const loadMockData = () => {
    // Mock inventory data
    setInventory([
      {
        id: 1,
        name: 'Surgical Masks (Box of 50)',
        category: 'PPE',
        quantity: 45,
        location: 'A-1-2',
        rfidCode: 'RFID-001-MASK',
        status: 'in_stock',
        lastUpdated: '2024-01-15'
      },
      {
        id: 2,
        name: 'IV Fluids - Normal Saline',
        category: 'Medical Supplies',
        quantity: 12,
        location: 'B-2-1',
        rfidCode: 'RFID-002-SALINE',
        status: 'low_stock',
        lastUpdated: '2024-01-14'
      },
      {
        id: 3,
        name: 'Medical Gloves (Latex-free)',
        category: 'PPE',
        quantity: 78,
        location: 'A-1-3',
        rfidCode: 'RFID-003-GLOVES',
        status: 'in_stock',
        lastUpdated: '2024-01-13'
      },
      {
        id: 4,
        name: 'Bandages - Sterile',
        category: 'Medical Supplies',
        quantity: 5,
        location: 'C-3-1',
        rfidCode: 'RFID-004-BANDAGES',
        status: 'critical_low',
        lastUpdated: '2024-01-12'
      }
    ]);

    // Mock deliveries data
    setDeliveries([
      {
        id: 1,
        item: 'Surgical Masks (Box of 50)',
        quantity: 50,
        destination: 'Emergency Ward',
        status: 'delivered',
        date: '2024-01-15',
        rfidCode: 'RFID-001-MASK',
        deliveredBy: 'employee1'
      },
      {
        id: 2,
        item: 'IV Fluids - Normal Saline',
        quantity: 25,
        destination: 'ICU',
        status: 'in_transit',
        date: '2024-01-14',
        rfidCode: 'RFID-002-SALINE',
        deliveredBy: 'employee1'
      },
      {
        id: 3,
        item: 'Medical Gloves (Latex-free)',
        quantity: 30,
        destination: 'Operating Room',
        status: 'scheduled',
        date: '2024-01-16',
        rfidCode: 'RFID-003-GLOVES',
        deliveredBy: 'employee1'
      }
    ]);
  };

  const handleRFIDScan = (scanResult) => {
    logActivity(user.username, 'RFID_SCAN', `Scanned RFID: ${scanResult.code}`);
    
    // Find item by RFID code
    const item = inventory.find(item => item.rfidCode === scanResult.code);
    if (item) {
      showInfo(`Item Found: ${item.name} at ${item.location} (Qty: ${item.quantity})`);
    } else {
      showWarning(`RFID Code ${scanResult.code} not found in inventory`);
    }
  };

  const handleManualRFID = (scanResult) => {
    logActivity(user.username, 'RFID_MANUAL', `Manual RFID entry: ${scanResult.code}`);
    
    // Find item by RFID code
    const item = inventory.find(item => item.rfidCode === scanResult.code);
    if (item) {
      showInfo(`Item Found: ${item.name} at ${item.location} (Qty: ${item.quantity})`);
    } else {
      showWarning(`RFID Code ${scanResult.code} not found in inventory`);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const item = {
      id: inventory.length + 1,
      ...newItem,
      quantity: parseInt(newItem.quantity),
      status: newItem.quantity > 20 ? 'in_stock' : newItem.quantity > 10 ? 'low_stock' : 'critical_low',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setInventory(prev => [item, ...prev]);
    setNewItem({ name: '', category: '', quantity: '', location: '', rfidCode: '' });
    setShowAddItem(false);
    
    logActivity(user.username, 'INVENTORY_ADD', `Added item: ${item.name}`);
  };

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    if (currentAnnouncement.trim()) {
      localStorage.setItem('hospitalAnnouncement', currentAnnouncement);
      setShowAnnouncement(false);
      logActivity(user.username, 'ANNOUNCEMENT_UPDATE', `Updated announcement: ${currentAnnouncement.substring(0, 50)}...`);
      showSuccess('Announcement updated successfully!');
    }
  };

  const handleEditAnnouncement = () => {
    setShowAnnouncement(true);
  };

  const handleClearAnnouncement = () => {
    localStorage.removeItem('hospitalAnnouncement');
    setCurrentAnnouncement('');
    logActivity(user.username, 'ANNOUNCEMENT_CLEAR', 'Cleared announcement');
    showInfo('Announcement cleared');
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: newQuantity,
              status: newQuantity > 20 ? 'in_stock' : newQuantity > 10 ? 'low_stock' : 'critical_low',
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : item
      )
    );
    
    const item = inventory.find(item => item.id === itemId);
    logActivity(user.username, 'INVENTORY_UPDATE', `Updated quantity for ${item?.name}: ${newQuantity}`);
  };

  const inventoryColumns = [
    { key: 'name', header: 'Item Name' },
    { key: 'category', header: 'Category' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'location', header: 'Location' },
    { key: 'rfidCode', header: 'RFID Code' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'in_stock' ? 'bg-green-100 text-green-800' :
          value === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>
      )
    }
  ];

  const deliveryColumns = [
    { key: 'item', header: 'Item' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'destination', header: 'Destination' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'delivered' ? 'bg-green-100 text-green-800' :
          value === 'in_transit' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    { key: 'date', header: 'Date' }
  ];

  const inventoryActions = (row) => (
    <div className="flex space-x-2">
      <button
        onClick={() => {
          const newQty = prompt(`Update quantity for ${row.name}:`, row.quantity);
          if (newQty && !isNaN(newQty)) {
            handleUpdateQuantity(row.id, parseInt(newQty));
          }
        }}
        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        title="Update Quantity"
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
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === 'low_stock').length;
  const criticalItems = inventory.filter(item => item.status === 'critical_low').length;
  const totalDeliveries = deliveries.length;

  return (
    <DashboardLayout 
      title="Smart Warehousing System" 
      subtitle="Inventory Management & RFID Tracking"
    >
      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Items"
            value={totalItems}
            icon={Package}
            color="blue"
            subtitle="In inventory"
            delay={100}
            trend={{ direction: 'up', value: '+7%' }}
          />
          <StatCard
            title="Low Stock"
            value={lowStockItems}
            icon={AlertTriangle}
            color="yellow"
            subtitle="Need restocking"
            delay={200}
            trend={{ direction: 'down', value: '-2%' }}
          />
          <StatCard
            title="Critical Low"
            value={criticalItems}
            icon={PackageOpen}
            color="red"
            subtitle="Urgent restock"
            delay={300}
            trend={{ direction: 'down', value: '-1%' }}
          />
          <StatCard
            title="Deliveries"
            value={totalDeliveries}
            icon={Truck}
            color="green"
            subtitle="This week"
            delay={400}
            trend={{ direction: 'up', value: '+12%' }}
          />
        </div>

        {/* Hospital Announcement */}
        {currentAnnouncement && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Megaphone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">localhost:3000 says</h3>
                  <p className="text-blue-800 mt-1">{currentAnnouncement}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEditAnnouncement}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Edit announcement"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleClearAnnouncement}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Clear announcement"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RFID Scanner and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RFID Scanner */}
          <div className="lg:col-span-1">
            <RFIDScanner
              title="Inventory RFID Scanner"
              onScan={handleRFIDScan}
              onManualInput={handleManualRFID}
            />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowAddItem(true)}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Plus className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Add Inventory</span>
              </button>
              <button 
                onClick={() => {
                  const newDelivery = {
                    id: deliveries.length + 1,
                    item: prompt('Item name:') || 'New Item',
                    quantity: parseInt(prompt('Quantity:') || '10'),
                    destination: prompt('Destination:') || 'Emergency Ward',
                    status: 'delivered',
                    date: new Date().toISOString().split('T')[0],
                    rfidCode: `RFID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    deliveredBy: user.username
                  };
                  setDeliveries(prev => [newDelivery, ...prev]);
                  logActivity(user.username, 'DELIVERY_RECORD', `Recorded delivery: ${newDelivery.item}`);
                  showSuccess(`Delivery recorded: ${newDelivery.item} to ${newDelivery.destination}`);
                }}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Package className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Record Delivery</span>
              </button>
              <button 
                onClick={() => {
                  const reportData = {
                    totalItems: inventory.length,
                    lowStock: inventory.filter(item => item.status === 'low_stock').length,
                    criticalItems: inventory.filter(item => item.status === 'critical_low').length,
                    totalDeliveries: deliveries.length,
                    recentDeliveries: deliveries.filter(d => new Date(d.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
                  };
                  showInfo(`Inventory Report: ${reportData.totalItems} items, ${reportData.lowStock} low stock, ${reportData.totalDeliveries} deliveries`);
                }}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <Download className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Export Report</span>
              </button>
              <button 
                onClick={() => {
                  const recentLogs = [
                    `RFID scan: ${new Date().toLocaleString()}`,
                    `Inventory update: ${new Date(Date.now() - 1000 * 60 * 30).toLocaleString()}`,
                    `Delivery recorded: ${new Date(Date.now() - 1000 * 60 * 60 * 2).toLocaleString()}`,
                    `Item added: ${new Date(Date.now() - 1000 * 60 * 60 * 4).toLocaleString()}`
                  ];
                  showInfo(`Recent Activity: ${recentLogs.length} activities logged`);
                }}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
              >
                <Eye className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">View Logs</span>
              </button>
              <button 
                onClick={() => setShowAnnouncement(true)}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <MessageSquare className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Announcement</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inventory Table */}
          <div className="animate-slide-in-left">
            <DataTable
              data={inventory}
              columns={inventoryColumns}
              actions={inventoryActions}
              searchable={true}
              itemsPerPage={8}
              title="Inventory Overview"
              showExport={true}
            />
          </div>

          {/* Delivery Logs */}
          <div className="animate-slide-in-right">
            <DataTable
              data={deliveries}
              columns={deliveryColumns}
              searchable={true}
              itemsPerPage={8}
              title="Delivery Logs"
              showExport={true}
            />
          </div>
        </div>

        {/* Add Item Modal */}
        {showAddItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Inventory Item</h3>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="PPE">PPE</option>
                    <option value="Medical Supplies">Medical Supplies</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Medications">Medications</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newItem.location}
                    onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., A-1-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RFID Code</label>
                  <input
                    type="text"
                    value={newItem.rfidCode}
                    onChange={(e) => setNewItem(prev => ({ ...prev, rfidCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., RFID-001-MASK"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddItem(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Announcement Modal */}
        {showAnnouncement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Announcement</h3>
              <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Message</label>
                  <textarea
                    value={currentAnnouncement}
                    onChange={(e) => setCurrentAnnouncement(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    placeholder="Enter your announcement message here..."
                    required
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Megaphone className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800 font-medium">Preview:</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>localhost:3000 says:</strong> {currentAnnouncement || 'Your announcement will appear here...'}
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncement(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Update Announcement
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

export default EmployeeDashboard;
