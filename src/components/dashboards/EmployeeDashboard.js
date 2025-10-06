import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../shared/Notification';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import RFIDScanner from '../shared/RFIDScanner';
import { LoadingSkeleton, DashboardSkeleton } from '../shared/LoadingSkeleton';
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
  Search,
  Filter,
  Scan,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  Zap,
  Target
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const EmployeeDashboard = () => {
  const { user, logActivity } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [inventory, setInventory] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
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

  const loadMockData = async () => {
    setLoading(true);
    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Enhanced mock inventory data
      setInventory([
        {
          id: 1,
          name: 'Surgical Masks (Box of 50)',
          category: 'PPE',
          quantity: 45,
          location: 'A-1-2',
          rfidCode: 'RFID-001-MASK',
          status: 'in_stock',
          lastUpdated: '2024-01-15',
          expiryDate: '2025-06-15',
          supplier: 'MediSupply Co.'
        },
        {
          id: 2,
          name: 'IV Fluids - Normal Saline (1000ml)',
          category: 'Medical Supplies',
          quantity: 12,
          location: 'B-2-1',
          rfidCode: 'RFID-002-SALINE',
          status: 'low_stock',
          lastUpdated: '2024-01-14',
          expiryDate: '2025-03-14',
          supplier: 'PharmaCorp'
        },
        {
          id: 3,
          name: 'Medical Gloves (Latex-free) - M',
          category: 'PPE',
          quantity: 78,
          location: 'A-1-3',
          rfidCode: 'RFID-003-GLOVES',
          status: 'in_stock',
          lastUpdated: '2024-01-13',
          expiryDate: '2025-08-13',
          supplier: 'SafeHands Ltd.'
        },
        {
          id: 4,
          name: 'Bandages - Sterile (4"x4")',
          category: 'Medical Supplies',
          quantity: 5,
          location: 'C-3-1',
          rfidCode: 'RFID-004-BANDAGES',
          status: 'critical_low',
          lastUpdated: '2024-01-12',
          expiryDate: '2025-01-12',
          supplier: 'MediSupply Co.'
        },
        {
          id: 5,
          name: 'Digital Thermometers',
          category: 'Equipment',
          quantity: 23,
          location: 'D-1-1',
          rfidCode: 'RFID-005-THERM',
          status: 'in_stock',
          lastUpdated: '2024-01-11',
          expiryDate: '2026-01-11',
          supplier: 'TechMed Solutions'
        },
        {
          id: 6,
          name: 'Syringes - 5ml (Box of 100)',
          category: 'Medical Supplies',
          quantity: 8,
          location: 'B-1-2',
          rfidCode: 'RFID-006-SYRINGE',
          status: 'low_stock',
          lastUpdated: '2024-01-10',
          expiryDate: '2025-04-10',
          supplier: 'PharmaCorp'
        }
      ]);

      // Enhanced mock deliveries data
      setDeliveries([
        {
          id: 1,
          item: 'Surgical Masks (Box of 50)',
          quantity: 50,
          destination: 'Emergency Ward',
          status: 'delivered',
          date: '2024-01-15',
          rfidCode: 'RFID-001-MASK',
          deliveredBy: 'employee1',
          estimatedTime: '2 hours',
          actualTime: '1.5 hours'
        },
        {
          id: 2,
          item: 'IV Fluids - Normal Saline (1000ml)',
          quantity: 25,
          destination: 'ICU',
          status: 'in_transit',
          date: '2024-01-14',
          rfidCode: 'RFID-002-SALINE',
          deliveredBy: 'employee1',
          estimatedTime: '1 hour',
          actualTime: null
        },
        {
          id: 3,
          item: 'Medical Gloves (Latex-free) - M',
          quantity: 30,
          destination: 'Operating Room',
          status: 'scheduled',
          date: '2024-01-16',
          rfidCode: 'RFID-003-GLOVES',
          deliveredBy: 'employee1',
          estimatedTime: '45 minutes',
          actualTime: null
        },
        {
          id: 4,
          item: 'Bandages - Sterile (4"x4")',
          quantity: 20,
          destination: 'General Ward',
          status: 'delivered',
          date: '2024-01-13',
          rfidCode: 'RFID-004-BANDAGES',
          deliveredBy: 'employee1',
          estimatedTime: '1.5 hours',
          actualTime: '1.2 hours'
        }
      ]);
    } catch (error) {
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.rfidCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate enhanced statistics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === 'low_stock').length;
  const criticalItems = inventory.filter(item => item.status === 'critical_low').length;
  const totalDeliveries = deliveries.length;
  const deliveredToday = deliveries.filter(delivery =>
    delivery.status === 'delivered' &&
    new Date(delivery.date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  // Calculate trends
  const inventoryTrend = { direction: 'up', value: '+5%' };
  const deliveriesTrend = { direction: 'up', value: '+12%' };

  // Prepare chart data
  const categoryData = inventory.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = { name: category, quantity: 0, items: 0 };
    }
    acc[category].quantity += item.quantity;
    acc[category].items += 1;
    return acc;
  }, {});

  const categoryChartData = Object.values(categoryData);

  // Stock level data for trend chart
  const stockTrendData = [
    { name: 'Mon', inStock: 85, lowStock: 12, critical: 3 },
    { name: 'Tue', inStock: 82, lowStock: 15, critical: 3 },
    { name: 'Wed', inStock: 78, lowStock: 18, critical: 4 },
    { name: 'Thu', inStock: 75, lowStock: 20, critical: 5 },
    { name: 'Fri', inStock: 72, lowStock: 23, critical: 5 },
    { name: 'Sat', inStock: 68, lowStock: 26, critical: 6 },
    { name: 'Sun', inStock: 65, lowStock: 28, critical: 7 }
  ];

  if (loading) {
    return (
      <DashboardLayout
        title="Smart Warehousing System"
        subtitle="Inventory Management & RFID Tracking"
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Smart Warehousing System"
      subtitle="Inventory Management & RFID Tracking"
    >
      <div className="space-y-8 animate-fade-scale">
        {/* Welcome Hero Section */}
        <div className="gradient-card-green neumorphic-card p-8 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="animate-slide-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-gray-600 text-lg">
                Manage your inventory and track deliveries with RFID technology.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse-glow">
                <Package className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Announcement */}
        {currentAnnouncement && (
          <div className="gradient-card-green neumorphic-card p-6 rounded-xl animate-slide-up">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-xl animate-float">
                  <Megaphone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 text-shadow-sm">
                    System Announcement
                  </h3>
                  <p className="text-green-800 mt-1 leading-relaxed">{currentAnnouncement}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEditAnnouncement}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200 neumorphic-button"
                  title="Edit announcement"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleClearAnnouncement}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 neumorphic-button"
                  title="Clear announcement"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Items"
            value={totalItems}
            icon={Package}
            color="blue"
            subtitle="In inventory"
            trend={inventoryTrend}
            className="animate-slide-up animate-delay-100"
          />
          <StatCard
            title="Low Stock Items"
            value={lowStockItems}
            icon={AlertTriangle}
            color="yellow"
            subtitle="Need restocking"
            trend={{ direction: 'up', value: '+3' }}
            className="animate-slide-up animate-delay-200"
          />
          <StatCard
            title="Critical Items"
            value={criticalItems}
            icon={PackageOpen}
            color="red"
            subtitle="Urgent attention"
            trend={{ direction: 'down', value: '-2' }}
            className="animate-slide-up animate-delay-300"
          />
          <StatCard
            title="Deliveries Today"
            value={deliveredToday}
            icon={Truck}
            color="green"
            subtitle={`${totalDeliveries} total this week`}
            trend={deliveriesTrend}
            className="animate-slide-up animate-delay-400"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stock Trend Chart */}
          <div className="neumorphic-card p-6 rounded-xl animate-slide-up animate-delay-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 text-shadow-sm">Stock Levels Trend</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">7-day trend</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="inStock"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="In Stock"
                />
                <Line
                  type="monotone"
                  dataKey="lowStock"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name="Low Stock"
                />
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  name="Critical"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="neumorphic-card p-6 rounded-xl animate-slide-up animate-delay-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 text-shadow-sm">Category Distribution</h3>
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="quantity" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced RFID Scanner and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RFID Scanner */}
          <div className="lg:col-span-1 animate-slide-up animate-delay-100">
            <div className="neumorphic-card p-6 rounded-xl h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 text-shadow-sm">RFID Scanner</h3>
                <Scan className="h-5 w-5 text-blue-600 animate-pulse" />
              </div>
              <RFIDScanner
                title="Scan Inventory Items"
                onScan={handleRFIDScan}
                onManualInput={handleManualRFID}
              />
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="lg:col-span-2 neumorphic-card p-8 rounded-xl animate-slide-up animate-delay-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 text-shadow-sm">Quick Actions</h3>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors neumorphic-button">
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors neumorphic-button">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setShowAddItem(true)}
                className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-200 neumorphic-button"
              >
                <Plus className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm text-gray-700 font-medium">Add Item</span>
              </button>

              <button
                onClick={() => {
                  const newDelivery = {
                    id: deliveries.length + 1,
                    item: 'New Medical Supply',
                    quantity: 25,
                    destination: 'Emergency Ward',
                    status: 'delivered',
                    date: new Date().toISOString().split('T')[0],
                    rfidCode: `RFID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    deliveredBy: user.username,
                    estimatedTime: '1 hour',
                    actualTime: '0.8 hours'
                  };
                  setDeliveries(prev => [newDelivery, ...prev]);
                  logActivity(user.username, 'DELIVERY_RECORD', `Recorded delivery: ${newDelivery.item}`);
                  showSuccess(`Delivery recorded: ${newDelivery.item} to ${newDelivery.destination}`);
                }}
                className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-200 neumorphic-button"
              >
                <Truck className="h-6 w-6 text-green-600 mb-2 group-hover:animate-bounce" />
                <span className="text-sm text-gray-700 font-medium">Record Delivery</span>
              </button>

              <button
                onClick={() => {
                  const reportData = {
                    totalItems: inventory.length,
                    lowStock: lowStockItems,
                    criticalItems: criticalItems,
                    totalDeliveries: totalDeliveries,
                    deliveredToday: deliveredToday
                  };
                  showInfo(`Inventory Report: ${reportData.totalItems} total items, ${reportData.lowStock} low stock, ${reportData.deliveredToday} deliveries today`);
                }}
                className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 rounded-xl transition-all duration-200 neumorphic-button"
              >
                <Download className="h-6 w-6 text-purple-600 mb-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-sm text-gray-700 font-medium">Export Report</span>
              </button>

              <button
                onClick={() => setShowAnnouncement(true)}
                className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 rounded-xl transition-all duration-200 neumorphic-button"
              >
                <MessageSquare className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm text-gray-700 font-medium">Announcements</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Inventory Management */}
          <div className="xl:col-span-2 neumorphic-card p-6 rounded-xl animate-slide-up animate-delay-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 text-shadow-sm mb-4 sm:mb-0">
                Inventory Management
              </h2>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                >
                  <option value="all">All Categories</option>
                  <option value="PPE">PPE</option>
                  <option value="Medical Supplies">Medical Supplies</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Medications">Medications</option>
                </select>
              </div>
            </div>

            <DataTable
              data={filteredInventory}
              columns={inventoryColumns}
              actions={inventoryActions}
              searchable={false}
              itemsPerPage={6}
            />
          </div>

          {/* Delivery Tracking */}
          <div className="neumorphic-card p-6 rounded-xl animate-slide-up animate-delay-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 text-shadow-sm">Recent Deliveries</h2>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {deliveries.slice(0, 6).map((delivery, index) => (
                <div
                  key={delivery.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors animate-slide-left"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    delivery.status === 'delivered' ? 'bg-green-500' :
                    delivery.status === 'in_transit' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {delivery.item}
                    </p>
                    <p className="text-xs text-gray-600">{delivery.destination}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {delivery.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(delivery.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Modals */}
        {showAddItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-scale">
            <div className="neumorphic-card p-8 max-w-md w-full mx-4 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 text-shadow-sm">Add Inventory Item</h3>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-6">
                {[
                  { label: 'Item Name', key: 'name', type: 'text', placeholder: 'e.g., Surgical Masks' },
                  { label: 'Category', key: 'category', type: 'select', options: [
                    { value: 'PPE', label: 'PPE' },
                    { value: 'Medical Supplies', label: 'Medical Supplies' },
                    { value: 'Equipment', label: 'Equipment' },
                    { value: 'Medications', label: 'Medications' }
                  ]},
                  { label: 'Quantity', key: 'quantity', type: 'number', placeholder: 'e.g., 50' },
                  { label: 'Location', key: 'location', type: 'text', placeholder: 'e.g., A-1-2' },
                  { label: 'RFID Code', key: 'rfidCode', type: 'text', placeholder: 'e.g., RFID-001-MASK' }
                ].map((field, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={newItem[field.key]}
                        onChange={(e) => setNewItem(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                        required
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={newItem[field.key]}
                        onChange={(e) => setNewItem(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                        placeholder={field.placeholder}
                        required
                      />
                    )}
                  </div>
                ))}

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddItem(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors neumorphic-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium transition-all duration-200 shadow-lg shadow-green-200/50"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Announcement Modal */}
        {showAnnouncement && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-scale">
            <div className="neumorphic-card p-8 max-w-lg w-full mx-4 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 text-shadow-sm">System Announcement</h3>
                <button
                  onClick={() => setShowAnnouncement(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAnnouncementSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Announcement Message
                  </label>
                  <textarea
                    value={currentAnnouncement}
                    onChange={(e) => setCurrentAnnouncement(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Enter your announcement message here..."
                    required
                  />
                </div>

                <div className="gradient-card-green p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Megaphone className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">Preview:</span>
                  </div>
                  <p className="text-sm text-green-700 leading-relaxed">
                    <strong>System says:</strong> {currentAnnouncement || 'Your announcement will appear here...'}
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncement(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors neumorphic-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium transition-all duration-200 shadow-lg shadow-green-200/50"
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
