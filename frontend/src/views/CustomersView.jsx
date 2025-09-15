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
  Clock
} from 'lucide-react';
import CustomerJourneyConstellation from '../components/visualizations/CustomerJourneyConstellation.jsx';
import { useCelebrations, CelebrationType } from '../components/psychological/MicroCelebrations.jsx';

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
  const { triggerCelebration } = useCelebrations();

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
          <button
            onClick={() => {
              triggerCelebration(CelebrationType.TASK_COMPLETE, {
                message: "Adding new customer! 👥",
                intensity: 'normal'
              });
            }}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
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

      {/* Customer Detail Modal */}
      <CustomerDetailModal />
    </div>
  );
};

export default CustomersView;
