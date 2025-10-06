import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../shared/DashboardLayout';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock,
  Archive,
  Eye,
  Download,
  Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DocumentAnalystDashboard = () => {
  const { user, logActivity } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [deliveryReceipts, setDeliveryReceipts] = useState([]);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock documents data
    setDocuments([
      {
        id: 1,
        name: 'Purchase Order - MedSupply Co. #PO-2024-001',
        type: 'Purchase Order',
        category: 'Procurement',
        status: 'verified',
        uploadedDate: '2024-01-15',
        uploadedBy: 'procurement1',
        verifiedBy: 'document1',
        verifiedDate: '2024-01-15',
        fileSize: '2.3 MB',
        tags: ['medical supplies', 'ventilators', 'emergency']
      },
      {
        id: 2,
        name: 'Delivery Receipt - SafetyFirst Inc. #DR-2024-002',
        type: 'Delivery Receipt',
        category: 'Logistics',
        status: 'pending_verification',
        uploadedDate: '2024-01-14',
        uploadedBy: 'employee1',
        verifiedBy: null,
        verifiedDate: null,
        fileSize: '1.8 MB',
        tags: ['ppe', 'gloves', 'delivery']
      },
      {
        id: 3,
        name: 'Maintenance Report - Ventilator V200 #MR-2024-003',
        type: 'Maintenance Report',
        category: 'Maintenance',
        status: 'verified',
        uploadedDate: '2024-01-13',
        uploadedBy: 'maintenance1',
        verifiedBy: 'document1',
        verifiedDate: '2024-01-13',
        fileSize: '3.1 MB',
        tags: ['maintenance', 'ventilator', 'repair']
      },
      {
        id: 4,
        name: 'Invoice - HealthTech Solutions #INV-2024-004',
        type: 'Invoice',
        category: 'Financial',
        status: 'archived',
        uploadedDate: '2024-01-10',
        uploadedBy: 'procurement1',
        verifiedBy: 'document1',
        verifiedDate: '2024-01-11',
        fileSize: '1.5 MB',
        tags: ['invoice', 'payment', 'iv-fluids']
      }
    ]);

    // Mock delivery receipts
    setDeliveryReceipts([
      {
        id: 1,
        supplier: 'MedSupply Co.',
        item: 'Surgical Masks (Box of 50)',
        quantity: 100,
        deliveryDate: '2024-01-15',
        receiptNumber: 'DR-2024-001',
        status: 'verified',
        receivedBy: 'employee1',
        verifiedBy: 'document1',
        filePath: '/documents/receipts/dr-2024-001.pdf'
      },
      {
        id: 2,
        supplier: 'SafetyFirst Inc.',
        item: 'Medical Gloves (Latex-free)',
        quantity: 200,
        deliveryDate: '2024-01-14',
        receiptNumber: 'DR-2024-002',
        status: 'pending_verification',
        receivedBy: 'employee1',
        verifiedBy: null,
        filePath: '/documents/receipts/dr-2024-002.pdf'
      },
      {
        id: 3,
        supplier: 'HealthTech Solutions',
        item: 'IV Fluids - Normal Saline',
        quantity: 500,
        deliveryDate: '2024-01-13',
        receiptNumber: 'DR-2024-003',
        status: 'verified',
        receivedBy: 'employee1',
        verifiedBy: 'document1',
        filePath: '/documents/receipts/dr-2024-003.pdf'
      }
    ]);

    // Mock verification queue
    setVerificationQueue([
      {
        id: 1,
        documentName: 'Delivery Receipt - SafetyFirst Inc. #DR-2024-002',
        type: 'Delivery Receipt',
        uploadedDate: '2024-01-14',
        uploadedBy: 'employee1',
        priority: 'high'
      },
      {
        id: 2,
        documentName: 'Purchase Order - New Equipment #PO-2024-005',
        type: 'Purchase Order',
        uploadedDate: '2024-01-16',
        uploadedBy: 'procurement1',
        priority: 'medium'
      }
    ]);
  };

  const handleUploadDocument = (e) => {
    e.preventDefault();
    const document = {
      id: documents.length + 1,
      ...newDocument,
      status: 'pending_verification',
      uploadedDate: new Date().toISOString().split('T')[0],
      uploadedBy: user.username,
      verifiedBy: null,
      verifiedDate: null,
      fileSize: '1.2 MB',
      tags: []
    };
    
    setDocuments(prev => [document, ...prev]);
    setNewDocument({ name: '', type: '', category: '', description: '' });
    setShowUploadModal(false);
    
    logActivity(user.username, 'DOCUMENT_UPLOAD', `Uploaded document: ${document.name}`);
  };

  const handleVerifyDocument = (documentId, action) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status: action === 'approve' ? 'verified' : 'rejected',
              verifiedBy: user.username,
              verifiedDate: new Date().toISOString().split('T')[0]
            }
          : doc
      )
    );
    
    const document = documents.find(doc => doc.id === documentId);
    logActivity(user.username, 'DOCUMENT_VERIFY', 
      `${action === 'approve' ? 'Verified' : 'Rejected'} document: ${document?.name}`
    );
  };

  const handleArchiveDocument = (documentId) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: 'archived' }
          : doc
      )
    );
    
    const document = documents.find(doc => doc.id === documentId);
    logActivity(user.username, 'DOCUMENT_ARCHIVE', `Archived document: ${document?.name}`);
  };

  const documentColumns = [
    { key: 'name', header: 'Document Name' },
    { key: 'type', header: 'Type' },
    { key: 'category', header: 'Category' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'verified' ? 'bg-green-100 text-green-800' :
          value === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' :
          value === 'archived' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    { key: 'uploadedDate', header: 'Uploaded Date' },
    { key: 'fileSize', header: 'Size' }
  ];

  const receiptColumns = [
    { key: 'supplier', header: 'Supplier' },
    { key: 'item', header: 'Item' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'deliveryDate', header: 'Delivery Date' },
    { key: 'receiptNumber', header: 'Receipt #' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'verified' ? 'bg-green-100 text-green-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>
      )
    }
  ];

  const queueColumns = [
    { key: 'documentName', header: 'Document Name' },
    { key: 'type', header: 'Type' },
    { key: 'uploadedDate', header: 'Uploaded Date' },
    { key: 'uploadedBy', header: 'Uploaded By' },
    { 
      key: 'priority', 
      header: 'Priority',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'high' ? 'bg-red-100 text-red-800' :
          value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    }
  ];

  const documentActions = (row) => (
    <div className="flex space-x-2">
      <button
        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        title="View Document"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        className="p-1 text-green-600 hover:bg-green-50 rounded"
        title="Download"
      >
        <Download className="h-4 w-4" />
      </button>
      {row.status === 'pending_verification' && (
        <>
          <button
            onClick={() => handleVerifyDocument(row.id, 'approve')}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Approve"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        </>
      )}
      {row.status === 'verified' && (
        <button
          onClick={() => handleArchiveDocument(row.id)}
          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
          title="Archive"
        >
          <Archive className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const queueActions = (row) => (
    <div className="flex space-x-2">
      <button
        onClick={() => {
          const doc = documents.find(d => d.name === row.documentName);
          if (doc) handleVerifyDocument(doc.id, 'approve');
        }}
        className="p-1 text-green-600 hover:bg-green-50 rounded"
        title="Verify"
      >
        <CheckCircle className="h-4 w-4" />
      </button>
      <button
        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        title="View"
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );

  // Calculate statistics
  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter(doc => doc.status === 'verified').length;
  const pendingVerification = documents.filter(doc => doc.status === 'pending_verification').length;
  const archivedDocuments = documents.filter(doc => doc.status === 'archived').length;

  // Chart data
  const statusData = [
    { name: 'Verified', value: verifiedDocuments, color: '#10b981' },
    { name: 'Pending', value: pendingVerification, color: '#f59e0b' },
    { name: 'Archived', value: archivedDocuments, color: '#6b7280' }
  ];

  const categoryData = [
    { name: 'Jan', procurement: 15, logistics: 12, maintenance: 8, financial: 5 },
    { name: 'Feb', procurement: 18, logistics: 14, maintenance: 10, financial: 7 },
    { name: 'Mar', procurement: 12, logistics: 16, maintenance: 6, financial: 4 },
    { name: 'Apr', procurement: 20, logistics: 18, maintenance: 12, financial: 8 },
    { name: 'May', procurement: 16, logistics: 15, maintenance: 9, financial: 6 },
    { name: 'Jun', procurement: 22, logistics: 20, maintenance: 14, financial: 9 }
  ];

  return (
    <DashboardLayout 
      title="Document Tracking & Records System" 
      subtitle="Document Management & Verification"
    >
      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Documents"
            value={totalDocuments}
            icon={FileText}
            color="blue"
            subtitle="All documents"
          />
          <StatCard
            title="Verified"
            value={verifiedDocuments}
            icon={CheckCircle}
            color="green"
            subtitle="Approved documents"
          />
          <StatCard
            title="Pending Verification"
            value={pendingVerification}
            icon={Clock}
            color="yellow"
            subtitle="Awaiting review"
          />
          <StatCard
            title="Archived"
            value={archivedDocuments}
            icon={Archive}
            color="gray"
            subtitle="Completed records"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
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

          {/* Monthly Document Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Document Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="procurement" stackId="a" fill="#3b82f6" />
                <Bar dataKey="logistics" stackId="a" fill="#10b981" />
                <Bar dataKey="maintenance" stackId="a" fill="#f59e0b" />
                <Bar dataKey="financial" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Upload className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Upload Document</span>
            </button>
            <button 
              onClick={() => {
                const pendingDocs = documents.filter(doc => doc.status === 'pending_verification');
                if (pendingDocs.length > 0) {
                  // Auto-verify first 2 pending documents
                  const toVerify = pendingDocs.slice(0, 2);
                  setDocuments(prev => 
                    prev.map(doc => 
                      toVerify.find(tv => tv.id === doc.id) 
                        ? { ...doc, status: 'verified', verifiedBy: user.username, verifiedDate: new Date().toISOString().split('T')[0] }
                        : doc
                    )
                  );
                  logActivity(user.username, 'BULK_VERIFY', `Verified ${toVerify.length} documents`);
                  alert(`Verified ${toVerify.length} pending documents!`);
                } else {
                  alert('No pending documents to verify.');
                }
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <CheckCircle className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Verify Documents</span>
            </button>
            <button 
              onClick={() => {
                const searchTerm = prompt('Enter search term:');
                if (searchTerm) {
                  const searchResults = documents.filter(doc => 
                    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  if (searchResults.length > 0) {
                    alert(`Search Results for "${searchTerm}":\n${searchResults.map(result => 
                      `${result.name} (${result.type}) - ${result.status}`
                    ).join('\n')}`);
                  } else {
                    alert(`No documents found matching "${searchTerm}"`);
                  }
                }
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <Search className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Search Records</span>
            </button>
            <button 
              onClick={() => {
                const verifiedDocs = documents.filter(doc => doc.status === 'verified');
                if (verifiedDocs.length > 0) {
                  // Archive first 2 verified documents
                  const toArchive = verifiedDocs.slice(0, 2);
                  setDocuments(prev => 
                    prev.map(doc => 
                      toArchive.find(ta => ta.id === doc.id) 
                        ? { ...doc, status: 'archived' }
                        : doc
                    )
                  );
                  logActivity(user.username, 'BULK_ARCHIVE', `Archived ${toArchive.length} documents`);
                  alert(`Archived ${toArchive.length} verified documents!`);
                } else {
                  alert('No verified documents to archive.');
                }
              }}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <Archive className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Archive Records</span>
            </button>
          </div>
        </div>

        {/* Verification Queue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Queue</h2>
          <DataTable
            data={verificationQueue}
            columns={queueColumns}
            actions={queueActions}
            searchable={true}
            pagination={false}
          />
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Documents */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Document History</h2>
            <DataTable
              data={documents}
              columns={documentColumns}
              actions={documentActions}
              searchable={true}
              itemsPerPage={8}
            />
          </div>

          {/* Delivery Receipts */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Receipts</h2>
            <DataTable
              data={deliveryReceipts}
              columns={receiptColumns}
              searchable={true}
              itemsPerPage={8}
            />
          </div>
        </div>

        {/* Upload Document Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>
              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                  <input
                    type="text"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <select
                    value={newDocument.type}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Purchase Order">Purchase Order</option>
                    <option value="Delivery Receipt">Delivery Receipt</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Maintenance Report">Maintenance Report</option>
                    <option value="Contract">Contract</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newDocument.category}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Financial">Financial</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newDocument.description}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                  <input
                    type="file"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Upload Document
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

export default DocumentAnalystDashboard;
