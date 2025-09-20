import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar,
  TrendingUp,
  DollarSign,
  Star,
  MapPin,
  Building,
  UserCheck,
  Clock,
  Download
} from 'lucide-react';
import CustomerJourneyConstellation from '../visualizations/CustomerJourneyConstellation';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations.tsx';

// Mock customer data
const mockCustomers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'TechCorp Solutions',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    stage: 'negotiation',
    value: 25000,
    lastContact: new Date(2024, 0, 10),
    nextFollowUp: new Date(2024, 0, 15),
    source: 'LinkedIn',
    industry: 'Technology',
    location: 'San Francisco, CA',
    notes: 'Interested in enterprise package. Budget approved. Decision maker.',
    tags: ['enterprise', 'hot-lead', 'decision-maker'],
    journey: {
      awareness: new Date(2023, 11, 15),
      consideration: new Date(2023, 11, 22),
      evaluation: new Date(2024, 0, 5),
      negotiation: new Date(2024, 0, 10)
    }
  },
  {
    id: '2',
    name: 'Michael Chen',
    company: 'Growth Marketing Co',
    email: 'michael@growthmarketing.com',
    phone: '+1 (555) 987-6543',
    status: 'prospect',
    stage: 'evaluation',
    value: 15000,
    lastContact: new Date(2024, 0, 8),
    nextFollowUp: new Date(2024, 0, 12),
    source: 'Website',
    industry: 'Marketing',
    location: 'New York, NY',
    notes: 'Looking for marketing automation tools. Comparing with competitors.',
    tags: ['marketing', 'automation', 'comparison'],
    journey: {
      awareness: new Date(2023, 11, 20),
      consideration: new Date(2024, 0, 2),
      evaluation: new Date(2024, 0, 8)
    }
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    company: 'StartupXYZ',
    email: 'emily@startupxyz.com',
    phone: '+1 (555) 456-7890',
    status: 'lead',
    stage: 'consideration',
    value: 8000,
    lastContact: new Date(2024, 0, 5),
    nextFollowUp: new Date(2024, 0, 18),
    source: 'Referral',
    industry: 'Startup',
    location: 'Austin, TX',
    notes: 'Early stage startup. Price sensitive but high growth potential.',
    tags: ['startup', 'price-sensitive', 'high-potential'],
    journey: {
      awareness: new Date(2023, 11, 28),
      consideration: new Date(2024, 0, 5)
    }
  },
  {
    id: '4',
    name: 'David Kim',
    company: 'Enterprise Solutions Inc',
    email: 'david.kim@enterprise.com',
    phone: '+1 (555) 321-0987',
    status: 'customer',
    stage: 'retention',
    value: 45000,
    lastContact: new Date(2024, 0, 12),
    nextFollowUp: new Date(2024, 0, 25),
    source: 'Trade Show',
    industry: 'Enterprise',
    location: 'Chicago, IL',
    notes: 'Long-term customer. Happy with service. Potential for expansion.',
    tags: ['enterprise', 'long-term', 'expansion'],
    journey: {
      awareness: new Date(2023, 8, 15),
      consideration: new Date(2023, 9, 1),
      evaluation: new Date(2023, 9, 15),
      purchase: new Date(2023, 10, 1),
      retention: new Date(2024, 0, 12)
    }
  }
];

const CustomersView = () => {
  const [customers, setCustomers] = useState(mockCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // list, journey, grid
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'prospect',
    stage: 'awareness',
    value: 0,
    source: '',
    industry: '',
    location: '',
    notes: '',
    tags: []
  });
  const { triggerCelebration } = useCelebrations();

  // Handler functions
  const handleAddCustomer = () => {
    setShowAddCustomerModal(true);
  };

  const handleImportCustomers = () => {
    setShowImportModal(true);
  };

  const handleSaveCustomer = () => {
    const customer = {
      ...newCustomer,
      id: Date.now().toString(),
      lastContact: new Date(),
      nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      journey: {
        awareness: new Date()
      }
    };
    
    setCustomers(prev => [...prev, customer]);
    setNewCustomer({
      name: '',
      company: '',
      email: '',
      phone: '',
      status: 'prospect',
      stage: 'awareness',
      value: 0,
      source: '',
      industry: '',
      location: '',
      notes: '',
      tags: []
    });
    setShowAddCustomerModal(false);
    
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Customer ${customer.name} added successfully! 👥`,
      intensity: 'normal'
    });
  };

  const handleImportFromCRM = (source) => {
    // Mock CRM import functionality
    console.log(`Importing customers from ${source}`);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Importing customers from ${source}... 📊`,
      intensity: 'normal'
    });
    setShowImportModal(false);
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    const matchesStage = filterStage === 'all' || customer.stage === filterStage;
    
    return matchesSearch && matchesStatus && matchesStage;
  });

  // Get status styling
  const getStatusStyle = (status) => {
    const styles = {
      lead: 'bg-blue-100 text-blue-800',
      prospect: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      customer: 'bg-purple-100 text-purple-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // Get stage styling
  const getStageStyle = (stage) => {
    const styles = {
      awareness: 'bg-gray-100 text-gray-800',
      consideration: 'bg-blue-100 text-blue-800',
      evaluation: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-orange-100 text-orange-800',
      purchase: 'bg-green-100 text-green-800',
      retention: 'bg-purple-100 text-purple-800'
    };
    return styles[stage] || 'bg-gray-100 text-gray-800';
  };

  // Customer list view
  const CustomerListView = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <motion.tr
                key={customer.id}
                className="hover:bg-gray-50 cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedCustomer(customer)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.company}</div>
                  <div className="text-sm text-gray-500">{customer.industry}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(customer.status)}`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageStyle(customer.stage)}`}>
                    {customer.stage}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${customer.value.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.lastContact.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="text-purple-600 hover:text-purple-900">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Customer detail modal
  const CustomerDetailModal = () => {
    if (!selectedCustomer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                  <p className="text-gray-600">{selectedCustomer.company}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{selectedCustomer.location}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{selectedCustomer.industry}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Journey Timeline</h3>
                  <div className="space-y-3">
                    {Object.entries(selectedCustomer.journey).map(([stage, date]) => (
                      <div key={stage} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStageStyle(stage).replace('text-', 'bg-').replace('-800', '-500')}`} />
                        <span className="capitalize text-gray-900">{stage}</span>
                        <span className="text-gray-500">{date.toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Notes</h3>
                  <p className="text-gray-700">{selectedCustomer.notes}</p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Deal Value</span>
                      <span className="font-semibold text-green-600">
                        ${selectedCustomer.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Source</span>
                      <span className="font-semibold">{selectedCustomer.source}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last Contact</span>
                      <span className="font-semibold">
                        {selectedCustomer.lastContact.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Next Follow-up</span>
                      <span className="font-semibold">
                        {selectedCustomer.nextFollowUp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>Schedule Call</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span>Add to Calendar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddCustomer}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
            <button
              onClick={handleImportCustomers}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Import from CRM</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              {['list', 'journey', 'grid'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="lead">Leads</option>
              <option value="prospect">Prospects</option>
              <option value="active">Active</option>
              <option value="customer">Customers</option>
            </select>

            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              <option value="awareness">Awareness</option>
              <option value="consideration">Consideration</option>
              <option value="evaluation">Evaluation</option>
              <option value="negotiation">Negotiation</option>
              <option value="purchase">Purchase</option>
              <option value="retention">Retention</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' && <CustomerListView />}
      {viewMode === 'journey' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Journey Constellation</h2>
          <CustomerJourneyConstellation customers={filteredCustomers} />
        </div>
      )}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Grid View</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map(customer => (
              <div key={customer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => setSelectedCustomer(customer)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-600">{customer.company}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    customer.status === 'active' ? 'bg-green-100 text-green-800' :
                    customer.status === 'prospect' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Value:</span>
                    <span className="font-semibold text-green-600">${customer.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stage:</span>
                    <span className="font-medium capitalize">{customer.stage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Industry:</span>
                    <span className="font-medium">{customer.industry}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {customer.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      <CustomerDetailModal />

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Customer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={newCustomer.company}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="customer@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newCustomer.status}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="prospect">Prospect</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select
                  value={newCustomer.stage}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, stage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="awareness">Awareness</option>
                  <option value="interest">Interest</option>
                  <option value="research">Research</option>
                  <option value="consideration">Consideration</option>
                  <option value="evaluation">Evaluation</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="purchase">Purchase</option>
                  <option value="retention">Retention</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                <input
                  type="number"
                  value={newCustomer.value}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <input
                  type="text"
                  value={newCustomer.source}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="LinkedIn, Website, Referral, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={newCustomer.industry}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Technology, Healthcare, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newCustomer.location}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, State"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes about the customer..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomer}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import from CRM Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Import Customers from CRM</h2>
            <p className="text-gray-600 mb-6">Select your CRM platform to import customer data:</p>
            <div className="space-y-3">
              {['HubSpot', 'Salesforce', 'Pipedrive', 'Zoho CRM', 'Google Sheets', 'CSV File'].map((source) => (
                <button
                  key={source}
                  onClick={() => handleImportFromCRM(source)}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">{source}</span>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersView;
