import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import RFIDScanner from '../shared/RFIDScanner';
import { 
  ShoppingCart, 
  Truck, 
  DollarSign,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  Users,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ProcurementDashboard = () => {
  const { user, logActivity } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    supplier: '',
    item: '',
    quantity: '',
    unitPrice: '',
    description: '',
    rfidCode: ''
  });

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock purchase orders data
    setPurchaseOrders([
      {
        id: 1,
        supplier: 'MedSupply Co.',
        item: 'Surgical Masks (Box of 50)',
        quantity: 100,
        unitPrice: 25,
        totalAmount: 2500,
        status: 'pending',
        orderDate: '2024-01-15',
        expectedDelivery: '2024-01-25',
        rfidCode: 'RFID-001-MASK'
      },
      {
        id: 2,
        supplier: 'HealthTech Solutions',
        item: 'IV Fluids - Normal Saline',
        quantity: 500,
        unitPrice: 3,
        totalAmount: 1500,
        status: 'approved',
        orderDate: '2024-01-14',
        expectedDelivery: '2024-01-22',
        rfidCode: 'RFID-002-SALINE'
      },
      {
        id: 3,
        supplier: 'SafetyFirst Inc.',
        item: 'Medical Gloves (Latex-free)',
        quantity: 200,
        unitPrice: 4,
        totalAmount: 800,
        status: 'delivered',
        orderDate: '2024-01-10',
        expectedDelivery: '2024-01-20',
        rfidCode: 'RFID-003-GLOVES'
      }
    ]);

    // Mock suppliers data
    setSuppliers([
      {
        id: 1,
        name: 'MedSupply Co.',
        contact: 'John Smith',
        email: 'john@medsupply.com',
        phone: '+1-555-0123',
        rating: 4.8,
        totalOrders: 45,
        lastOrder: '2024-01-15'
      },
      {
        id: 2,
        name: 'HealthTech Solutions',
        contact: 'Sarah Johnson',
        email: 'sarah@healthtech.com',
        phone: '+1-555-0456',
        rating: 4.6,
        totalOrders: 32,
        lastOrder: '2024-01-14'
      },
      {
        id: 3,
        name: 'SafetyFirst Inc.',
        contact: 'Mike Wilson',
        email: 'mike@safetyfirst.com',
        phone: '+1-555-0789',
        rating: 4.9,
        totalOrders: 28,
        lastOrder: '2024-01-10'
      }
    ]);

    // Mock deliveries data
    setDeliveries([
      {
        id: 1,
        item: 'Medical Gloves (Latex-free)',
        quantity: 200,
        supplier: 'SafetyFirst Inc.',
        status: 'delivered',
        deliveryDate: '2024-01-20',
        rfidCode: 'RFID-003-GLOVES',
        trackingNumber: 'TRK-001-2024'
      },
      {
        id: 2,
        item: 'IV Fluids - Normal Saline',
        quantity: 500,
        supplier: 'HealthTech Solutions',
        status: 'in_transit',
        deliveryDate: '2024-01-22',
        rfidCode: 'RFID-002-SALINE',
        trackingNumber: 'TRK-002-2024'
      }
    ]);
  };

  const handleRFIDScan = (scanResult) => {
    logActivity(user.username, 'RFID_SCAN', `Scanned RFID for procurement: ${scanResult.code}`);
    
    // Find order by RFID code
    const order = purchaseOrders.find(order => order.rfidCode === scanResult.code);
    if (order) {
      alert(`Order Found: ${order.item}\nSupplier: ${order.supplier}\nStatus: ${order.status}\nAmount: $${order.totalAmount}`);
    } else {
      alert(`RFID Code ${scanResult.code} not found in purchase orders`);
    }
  };

  const handleManualRFID = (scanResult) => {
    logActivity(user.username, 'RFID_MANUAL', `Manual RFID entry for procurement: ${scanResult.code}`);
    
    // Find order by RFID code
    const order = purchaseOrders.find(order => order.rfidCode === scanResult.code);
    if (order) {
      alert(`Order Found: ${order.item}\nSupplier: ${order.supplier}\nStatus: ${order.status}\nAmount: $${order.totalAmount}`);
    } else {
      alert(`RFID Code ${scanResult.code} not found in purchase orders`);
    }
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const order = {
      id: purchaseOrders.length + 1,
      ...newOrder,
      quantity: parseInt(newOrder.quantity),
      unitPrice: parseFloat(newOrder.unitPrice),
      totalAmount: parseInt(newOrder.quantity) * parseFloat(newOrder.unitPrice),
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    setPurchaseOrders(prev => [order, ...prev]);
    setNewOrder({ supplier: '', item: '', quantity: '', unitPrice: '', description: '', rfidCode: '' });
    setShowCreateOrder(false);
    
    logActivity(user.username, 'PURCHASE_ORDER_CREATE', `Created purchase order: ${order.item}`);
  };

  const orderColumns = [
    { key: 'supplier', header: 'Supplier' },
    { key: 'item', header: 'Item' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unitPrice', header: 'Unit Price', render: (value) => `$${value}` },
    { key: 'totalAmount', header: 'Total Amount', render: (value) => `$${value.toLocaleString()}` },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'delivered' ? 'bg-green-100 text-green-800' :
          value === 'approved' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    { key: 'orderDate', header: 'Order Date' }
  ];

  const supplierColumns = [
    { key: 'name', header: 'Supplier Name' },
    { key: 'contact', header: 'Contact Person' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { 
      key: 'rating', 
      header: 'Rating',
      render: (value) => (
        <div className="flex items-center">
          <span className="text-yellow-400">★</span>
          <span className="ml-1 text-sm">{value}</span>
        </div>
      )
    },
    { key: 'totalOrders', header: 'Total Orders' }
  ];

  const deliveryColumns = [
    { key: 'item', header: 'Item' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'supplier', header: 'Supplier' },
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
    { key: 'deliveryDate', header: 'Delivery Date' }
  ];

  const orderActions = (row) => (
    <div className="flex space-x-2">
      <button
        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
      {row.status === 'pending' && (
        <button
          className="p-1 text-green-600 hover:bg-green-50 rounded"
          title="Edit Order"
        >
          <Edit className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  // Calculate statistics
  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter(order => order.status === 'pending').length;
  const deliveredOrders = purchaseOrders.filter(order => order.status === 'delivered').length;
  const totalSpending = purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Chart data
  const spendingData = [
    { month: 'Jan', amount: 15000 },
    { month: 'Feb', amount: 18000 },
    { month: 'Mar', amount: 12000 },
    { month: 'Apr', amount: 22000 },
    { month: 'May', amount: 19000 },
    { month: 'Jun', amount: 25000 }
  ];

  const statusData = [
    { name: 'Delivered', value: deliveredOrders, color: '#10b981' },
    { name: 'Pending', value: pendingOrders, color: '#f59e0b' },
    { name: 'Approved', value: purchaseOrders.filter(o => o.status === 'approved').length, color: '#3b82f6' }
  ];

  return (
    <DashboardLayout 
      title="Procurement & Sourcing Management" 
      subtitle="Purchase Orders & Supplier Management"
    >
      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon={ShoppingCart}
            color="blue"
            subtitle="All time"
          />
          <StatCard
            title="Pending Orders"
            value={pendingOrders}
            icon={Clock}
            color="yellow"
            subtitle="Awaiting approval"
          />
          <StatCard
            title="Delivered"
            value={deliveredOrders}
            icon={CheckCircle}
            color="green"
            subtitle="This month"
          />
          <StatCard
            title="Total Spending"
            value={`$${(totalSpending / 1000).toFixed(0)}K`}
            icon={DollarSign}
            color="purple"
            subtitle="This year"
          />
        </div>

        {/* RFID Scanner and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RFID Scanner */}
          <div className="lg:col-span-1">
            <RFIDScanner
              title="Procurement RFID Scanner"
              onScan={handleRFIDScan}
              onManualInput={handleManualRFID}
            />
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Spending */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowCreateOrder(true)}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Create Order</span>
            </button>
            <button 
              onClick={() => {
                const supplierInfo = suppliers.map(supplier => ({
                  name: supplier.name,
                  contact: supplier.contact,
                  rating: supplier.rating,
                  totalOrders: supplier.totalOrders
                }));
                alert(`Supplier Management:\n${supplierInfo.map(s => 
                  `${s.name}\n- Contact: ${s.contact}\n- Rating: ${s.rating}/5\n- Orders: ${s.totalOrders}\n`
                ).join('\n')}`);
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Users className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Manage Suppliers</span>
            </button>
            <button 
              onClick={() => {
                const deliveryStatus = deliveries.map(delivery => ({
                  item: delivery.item,
                  supplier: delivery.supplier,
                  status: delivery.status,
                  trackingNumber: delivery.trackingNumber
                }));
                alert(`Delivery Tracking:\n${deliveryStatus.map(d => 
                  `${d.item} (${d.supplier})\n- Status: ${d.status}\n- Tracking: ${d.trackingNumber}\n`
                ).join('\n')}`);
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <Truck className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Track Deliveries</span>
            </button>
            <button 
              onClick={() => {
                const reportData = {
                  totalOrders: purchaseOrders.length,
                  totalSpending: purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0),
                  avgOrderValue: purchaseOrders.length > 0 ? purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0) / purchaseOrders.length : 0,
                  topSupplier: suppliers.reduce((top, supplier) => supplier.totalOrders > (top?.totalOrders || 0) ? supplier : top, null)?.name || 'N/A'
                };
                alert(`Procurement Report:\n\nOrders:\n- Total Orders: ${reportData.totalOrders}\n- Total Spending: $${reportData.totalSpending.toLocaleString()}\n- Avg Order Value: $${reportData.avgOrderValue.toFixed(2)}\n\nTop Supplier: ${reportData.topSupplier}`);
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <FileText className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Generate Reports</span>
            </button>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Purchase Orders */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Purchase Orders</h2>
            <DataTable
              data={purchaseOrders}
              columns={orderColumns}
              actions={orderActions}
              searchable={true}
              itemsPerPage={5}
            />
          </div>

          {/* Suppliers */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Supplier Database</h2>
            <DataTable
              data={suppliers}
              columns={supplierColumns}
              searchable={true}
              itemsPerPage={5}
            />
          </div>
        </div>

        {/* Deliveries */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Deliveries</h2>
          <DataTable
            data={deliveries}
            columns={deliveryColumns}
            searchable={true}
            itemsPerPage={5}
          />
        </div>

        {/* Create Order Modal */}
        {showCreateOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Purchase Order</h3>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select
                    value={newOrder.supplier}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newOrder.item}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, item: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={newOrder.quantity}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newOrder.unitPrice}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, unitPrice: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RFID Code</label>
                  <input
                    type="text"
                    value={newOrder.rfidCode}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, rfidCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., RFID-001-MASK"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newOrder.description}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateOrder(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Order
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

export default ProcurementDashboard;
