import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../shared/Notification';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import RFIDScanner from '../shared/RFIDScanner';
import { inventoryService } from '../../services/database/inventory';
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
  X,
  RefreshCw,
  Scan
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, logActivity, useDatabase } = useAuth();
  const { showSuccess, showInfo, showWarning, showError } = useNotification();
  const [inventory, setInventory] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalDeliveries: 0,
    pendingDeliveries: 0
  });
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    location: '',
    rfidCode: ''
  });

  const subscriptions = useRef([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (useDatabase) {
        // Load inventory items
        const inventoryResult = await inventoryService.getAllItems();
        if (inventoryResult.error) {
          console.error('Error loading inventory:', inventoryResult.error);
          showError('Failed to load inventory data');
        } else {
          setInventory(inventoryResult.data || []);
        }

        // Load deliveries
        const deliveriesResult = await inventoryService.getAllDeliveries();
        if (deliveriesResult.error) {
          console.error('Error loading deliveries:', deliveriesResult.error);
          showError('Failed to load delivery data');
        } else {
          setDeliveries(deliveriesResult.data || []);
        }

        // Load inventory statistics
        const statsResult = await inventoryService.getInventoryStats();
        if (statsResult.error) {
          console.error('Error loading inventory stats:', statsResult.error);
        } else {
          setStats(statsResult.data || {
            totalItems: 0,
            lowStockItems: 0,
            totalDeliveries: 0,
            pendingDeliveries: 0
          });
        }
      } else {
        // Fallback to mock data when database is not available
        loadMockData();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Failed to load dashboard data');
      // Fallback to mock data
      loadMockData();
    } finally {
      setLoading(false);
    }
  }, [useDatabase, showError]);

  useEffect(() => {
    loadData();
    loadAnnouncement();
    setupRealTimeSubscriptions();
    
    // Cleanup subscriptions on unmount
    return () => {
      subscriptions.current.forEach(sub => {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      });
    };
  }, [loadData]);

  const setupRealTimeSubscriptions = useCallback(() => {
    if (!useDatabase) return;

    // Clean up existing subscriptions
    subscriptions.current.forEach(sub => {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    });
    subscriptions.current = [];

    // Subscribe to inventory items
    const inventorySub = inventoryService.subscribeToItems((payload) => {
      console.log('Inventory updated:', payload);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        loadData(); // Reload data when inventory changes
        showInfo('Inventory updated in real-time');
      }
    });

    // Subscribe to deliveries
    const deliveriesSub = inventoryService.subscribeToDeliveries((payload) => {
      console.log('Deliveries updated:', payload);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        loadData(); // Reload data when deliveries change
        showInfo('Deliveries updated in real-time');
      }
    });

    if (inventorySub) subscriptions.current.push(inventorySub);
    if (deliveriesSub) subscriptions.current.push(deliveriesSub);
  }, [useDatabase, loadData, showInfo]);

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

  const handleRFIDScan = async (scanResult) => {
    try {
      if (useDatabase) {
        // Use database service to scan RFID
        const scanResult_db = await inventoryService.scanRFID(
          scanResult.code,
          user.id,
          'warehouse',
          'scan',
          'RFID scan by employee'
        );
        
        if (scanResult_db.error) {
          showWarning(`RFID Code ${scanResult.code} not found in inventory`);
        } else {
          const item = scanResult_db.data.item;
          showInfo(`Item Found: ${item.name} at ${item.location} (Qty: ${item.quantity})`);
        }
      } else {
        // Fallback to local search for mock data
        const item = inventory.find(item => item.rfidCode === scanResult.code);
        if (item) {
          showInfo(`Item Found: ${item.name} at ${item.location} (Qty: ${item.quantity})`);
        } else {
          showWarning(`RFID Code ${scanResult.code} not found in inventory`);
        }
      }
      
      await logActivity(user.username, 'RFID_SCAN', `Scanned RFID: ${scanResult.code}`);
    } catch (error) {
      console.error('Error scanning RFID:', error);
      showError('Failed to scan RFID');
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

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      if (useDatabase) {
        // Use database service to create item
        const itemData = {
          name: newItem.name,
          description: `${newItem.name} - ${newItem.category}`,
          category: newItem.category,
          quantity: parseInt(newItem.quantity),
          location: newItem.location,
          rfid_code: newItem.rfidCode,
          min_quantity: 10,
          max_quantity: 100,
          status: 'active'
        };

        const result = await inventoryService.createItem(itemData);
        if (result.error) {
          throw new Error(result.error.message);
        }
        
        showSuccess('Item added successfully!');
        await logActivity(user.username, 'INVENTORY_ADD', `Added item: ${newItem.name}`);
      } else {
        // Fallback to local state for mock data
        const item = {
          id: inventory.length + 1,
          ...newItem,
          quantity: parseInt(newItem.quantity),
          status: newItem.quantity > 20 ? 'in_stock' : newItem.quantity > 10 ? 'low_stock' : 'critical_low',
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        
        setInventory(prev => [item, ...prev]);
        logActivity(user.username, 'INVENTORY_ADD', `Added item: ${item.name}`);
      }
      
      setNewItem({ name: '', category: '', quantity: '', location: '', rfidCode: '' });
      setShowAddItem(false);
    } catch (error) {
      console.error('Error adding item:', error);
      showError('Failed to add item');
    }
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
  const totalItems = stats.totalItems || inventory.length;
  const lowStockItems = stats.lowStockItems || inventory.filter(item => item.status === 'low_stock').length;
  const criticalItems = inventory.filter(item => item.status === 'critical_low').length;
  const totalDeliveries = stats.totalDeliveries || deliveries.length;

  return (
    <DashboardLayout 
      title="Smart Warehousing System" 
      subtitle="Inventory Management & RFID Tracking"
    >
      <div className="space-y-8 animate-page-transition">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              loadData();
              showSuccess('Data refreshed successfully!');
            }}
            disabled={loading}
            className="neumorphic-button p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="neumorphic-card p-8 text-center">
            <div className="flex items-center justify-center space-x-4">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg font-semibold text-gray-700">Loading inventory data...</span>
            </div>
          </div>
        )}

        {/* Enhanced Statistics Cards Grid */}
        <div className="grid grid-stats gap-6">
          <div className="animate-slide-in-left animate-delay-100">
            <StatCard
              title="Total Items"
              value={totalItems}
              icon={Package}
              color="blue"
              subtitle="In inventory"
              delay={100}
              trend={{ direction: 'up', value: '+7%' }}
            />
          </div>
          <div className="animate-slide-in-left animate-delay-200">
            <StatCard
              title="Low Stock"
              value={lowStockItems}
              icon={AlertTriangle}
              color="yellow"
              subtitle="Need restocking"
              delay={200}
              trend={{ direction: 'down', value: '-2%' }}
            />
          </div>
          <div className="animate-slide-in-left animate-delay-300">
            <StatCard
              title="Critical Low"
              value={criticalItems}
              icon={PackageOpen}
              color="red"
              subtitle="Urgent restock"
              delay={300}
              trend={{ direction: 'down', value: '-1%' }}
            />
          </div>
          <div className="animate-slide-in-left animate-delay-400">
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
        </div>

        {/* Enhanced Hospital Announcement */}
        {currentAnnouncement && (
          <div className="neumorphic-card p-8 animate-slide-in-down hover-lift">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Megaphone className="h-8 w-8 text-blue-600 animate-float-slow" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gradient mb-2">localhost:3000 says</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{currentAnnouncement}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleEditAnnouncement}
                  className="neumorphic-button p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-300 hover:scale-110"
                  title="Edit announcement"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={handleClearAnnouncement}
                  className="neumorphic-button p-3 text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-300 hover:scale-110"
                  title="Clear announcement"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced RFID Scanner and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RFID Scanner */}
          <div className="lg:col-span-1 animate-slide-in-left">
            <RFIDScanner
              title="Inventory RFID Scanner"
              onScan={handleRFIDScan}
              onManualInput={handleManualRFID}
            />
          </div>

          {/* Enhanced Quick Actions */}
          <div className="lg:col-span-2 neumorphic-card p-8 animate-slide-in-right hover-lift">
            <h3 className="text-2xl font-bold text-gradient mb-8 text-center">Quick Actions</h3>
            <div className="grid grid-actions gap-6">
              <button 
                onClick={() => setShowAddItem(true)}
                className="neumorphic-button p-6 text-center hover:scale-105 transition-all duration-300 group hover-lift"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <span className="text-gray-800 font-bold text-lg">Add Inventory</span>
                  <p className="text-sm text-gray-600">Add new items</p>
                </div>
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
                className="neumorphic-button p-6 text-center hover:scale-105 transition-all duration-300 group hover-lift"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                  <span className="text-gray-800 font-bold text-lg">Record Delivery</span>
                  <p className="text-sm text-gray-600">Log delivery</p>
                </div>
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
                className="neumorphic-button p-6 text-center hover:scale-105 transition-all duration-300 group hover-lift"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                    <Download className="h-8 w-8 text-purple-600" />
                  </div>
                  <span className="text-gray-800 font-bold text-lg">Export Report</span>
                  <p className="text-sm text-gray-600">Generate report</p>
                </div>
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
                className="neumorphic-button p-6 text-center hover:scale-105 transition-all duration-300 group hover-lift"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                    <Eye className="h-8 w-8 text-orange-600" />
                  </div>
                  <span className="text-gray-800 font-bold text-lg">View Logs</span>
                  <p className="text-sm text-gray-600">Activity logs</p>
                </div>
              </button>
              <button 
                onClick={() => setShowAnnouncement(true)}
                className="neumorphic-button p-6 text-center hover:scale-105 transition-all duration-300 group hover-lift"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-300 hover:scale-110 animate-float-slow">
                    <MessageSquare className="h-8 w-8 text-indigo-600" />
                  </div>
                  <span className="text-gray-800 font-bold text-lg">Announcement</span>
                  <p className="text-sm text-gray-600">Create message</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inventory Table */}
          <div className="animate-slide-in-left hover-lift">
            <div className="neumorphic-card p-6">
              <h3 className="text-2xl font-bold text-gradient mb-6 text-center">Inventory Overview</h3>
              <DataTable
                data={inventory}
                columns={inventoryColumns}
                actions={inventoryActions}
                searchable={true}
                itemsPerPage={8}
                showExport={true}
                className="table-enhanced"
              />
            </div>
          </div>

          {/* Delivery Logs */}
          <div className="animate-slide-in-right hover-lift">
            <div className="neumorphic-card p-6">
              <h3 className="text-2xl font-bold text-gradient mb-6 text-center">Delivery Logs</h3>
              <DataTable
                data={deliveries}
                columns={deliveryColumns}
                searchable={true}
                itemsPerPage={8}
                showExport={true}
                className="table-enhanced"
              />
            </div>
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
