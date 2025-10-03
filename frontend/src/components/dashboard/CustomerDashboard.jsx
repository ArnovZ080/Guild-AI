import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  BarChart3,
  Target,
  MessageCircle,
  Heart,
  TrendingUp,
  Activity,
  Filter,
  Search,
  RefreshCw,
  Download,
  Settings,
  Bell,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Phone,
  Mail,
  Calendar,
  Tag,
  Building,
  Globe,
  Smartphone,
  Monitor,
  Laptop,
  UserPlus,
  UserMinus,
  DollarSign,
  Star,
  Shield,
  Brain,
  Zap,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  Play,
  Pause,
  Save,
  X
} from 'lucide-react';

// Import tabs
import CustomerOverviewTab from './tabs/CustomerOverviewTab';
import CustomerListTab from './tabs/CustomerListTab';
import CustomerProfilesTab from './tabs/CustomerProfilesTab';
import CustomerFunnelTab from './tabs/CustomerFunnelTab';
import CustomerMessagingTab from './tabs/CustomerMessagingTab';
import CustomerRetentionTab from './tabs/CustomerRetentionTab';
import CustomerOpportunitiesTab from './tabs/CustomerOpportunitiesTab';

// Import modals
import CustomerProfileModal from './modals/CustomerProfileModal';
import CustomerSegmentModal from './modals/CustomerSegmentModal';

// Import API service
import { useCustomerAnalysis, useCustomerProfiles, useCustomerSegments } from '../../services/customerIntelligenceAPI';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSegmentData, setSelectedSegmentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // API hooks
  const { data: customerAnalysis, loading: analysisLoading, error: analysisError } = useCustomerAnalysis();
  const { data: customerProfiles, loading: profilesLoading, error: profilesError } = useCustomerProfiles(selectedSegment);
  const { data: customerSegments, loading: segmentsLoading, error: segmentsError } = useCustomerSegments();

  // Mock data fallback
  const mockCustomerAnalysis = {
    total_customers: 1247,
    new_customers_30d: 89,
    churned_customers_30d: 23,
    retention_rate: 85.2,
    avg_lifetime_value: 12500,
    customer_health_distribution: {
      excellent: 45,
      good: 35,
      warning: 15,
      critical: 5
    },
    top_customers: [
      { id: 'cust_001', name: 'John Smith', ltv: 25000, health_score: 95, segment: 'VIP' },
      { id: 'cust_002', name: 'Sarah Johnson', ltv: 22000, health_score: 92, segment: 'VIP' },
      { id: 'cust_003', name: 'Mike Davis', ltv: 18000, health_score: 88, segment: 'Enterprise' },
      { id: 'cust_004', name: 'Lisa Wilson', ltv: 15000, health_score: 85, segment: 'Enterprise' },
      { id: 'cust_005', name: 'David Brown', ltv: 12000, health_score: 82, segment: 'Premium' }
    ],
    alerts: [
      { id: 'alert_001', type: 'churn_risk', message: '5 customers at high churn risk', priority: 'high', timestamp: new Date().toISOString() },
      { id: 'alert_002', type: 'sentiment', message: 'Negative sentiment detected in support tickets', priority: 'medium', timestamp: new Date().toISOString() },
      { id: 'alert_003', type: 'opportunity', message: '3 VIP customers ready for upsell', priority: 'low', timestamp: new Date().toISOString() }
    ]
  };

  const mockCustomerProfiles = [
    {
      customer_id: 'cust_001',
      name: 'John Smith',
      email: 'john@company.com',
      customer_segment: 'VIP',
      lifecycle_stage: 'retention',
      lifetime_value: 25000,
      health_score: 95,
      churn_risk: 'low',
      engagement_score: 92,
      last_activity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      total_orders: 15,
      total_spent: 25000,
      support_tickets: 2,
      sentiment_score: 0.85,
      tags: ['VIP', 'Enterprise', 'High Value'],
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      customer_id: 'cust_002',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      customer_segment: 'VIP',
      lifecycle_stage: 'growth',
      lifetime_value: 22000,
      health_score: 92,
      churn_risk: 'low',
      engagement_score: 88,
      last_activity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      total_orders: 12,
      total_spent: 22000,
      support_tickets: 1,
      sentiment_score: 0.78,
      tags: ['VIP', 'Enterprise', 'Advocate'],
      created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      customer_id: 'cust_003',
      name: 'Mike Davis',
      email: 'mike@company.com',
      customer_segment: 'Enterprise',
      lifecycle_stage: 'retention',
      lifetime_value: 18000,
      health_score: 88,
      churn_risk: 'medium',
      engagement_score: 75,
      last_activity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      total_orders: 8,
      total_spent: 18000,
      support_tickets: 3,
      sentiment_score: 0.65,
      tags: ['Enterprise', 'High Value', 'At Risk'],
      created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      customer_id: 'cust_004',
      name: 'Lisa Wilson',
      email: 'lisa@company.com',
      customer_segment: 'Enterprise',
      lifecycle_stage: 'growth',
      lifetime_value: 15000,
      health_score: 85,
      churn_risk: 'low',
      engagement_score: 82,
      last_activity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      total_orders: 10,
      total_spent: 15000,
      support_tickets: 1,
      sentiment_score: 0.72,
      tags: ['Enterprise', 'High Value', 'Engaged'],
      created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      customer_id: 'cust_005',
      name: 'David Brown',
      email: 'david@company.com',
      customer_segment: 'Premium',
      lifecycle_stage: 'retention',
      lifetime_value: 12000,
      health_score: 82,
      churn_risk: 'medium',
      engagement_score: 68,
      last_activity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      total_orders: 6,
      total_spent: 12000,
      support_tickets: 4,
      sentiment_score: 0.58,
      tags: ['Premium', 'Medium Value', 'Support Heavy'],
      created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const mockCustomerSegments = [
    {
      id: 'segment_001',
      name: 'VIP Customers',
      description: 'High-value customers with premium support',
      criteria: [
        { field: 'lifetime_value', operator: '>=', value: 20000, label: 'Lifetime Value >= $20,000' },
        { field: 'health_score', operator: '>=', value: 90, label: 'Health Score >= 90' }
      ],
      customer_count: 45,
      avg_lifetime_value: 35000,
      avg_engagement_score: 92,
      churn_rate: 5.2,
      growth_rate: 28.5,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'segment_002',
      name: 'Enterprise Customers',
      description: 'Business customers with enterprise features',
      criteria: [
        { field: 'customer_segment', operator: '=', value: 'enterprise', label: 'Segment = Enterprise' },
        { field: 'lifetime_value', operator: '>=', value: 10000, label: 'Lifetime Value >= $10,000' }
      ],
      customer_count: 156,
      avg_lifetime_value: 18500,
      avg_engagement_score: 78,
      churn_rate: 12.5,
      growth_rate: 23.8,
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'segment_003',
      name: 'At-Risk Customers',
      description: 'Customers showing signs of potential churn',
      criteria: [
        { field: 'churn_risk', operator: '=', value: 'high', label: 'Churn Risk = High' },
        { field: 'last_activity', operator: '<=', value: '30', label: 'Last Activity <= 30 days' }
      ],
      customer_count: 23,
      avg_lifetime_value: 8500,
      avg_engagement_score: 45,
      churn_rate: 35.2,
      growth_rate: -15.8,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Use real data if available, otherwise fallback to mock data
  const customerData = customerAnalysis || mockCustomerAnalysis;
  const profiles = customerProfiles || mockCustomerProfiles;
  const segments = customerSegments || mockCustomerSegments;

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'customers', label: 'Customer List', icon: Users },
    { id: 'profiles', label: 'Profiles', icon: Target },
    { id: 'funnel', label: 'Funnel Analytics', icon: Activity },
    { id: 'messaging', label: 'Messaging', icon: MessageCircle },
    { id: 'retention', label: 'Retention', icon: Heart },
    { id: 'opportunities', label: 'Opportunities', icon: TrendingUp }
  ];

  const handleCustomerAction = (action, customer) => {
    console.log('Customer action:', action, customer);
    
    switch (action) {
      case 'view_profile':
        setSelectedCustomer(customer);
        setShowProfileModal(true);
        break;
      case 'message':
        // Handle messaging
        break;
      case 'call':
        // Handle calling
        break;
      case 'email':
        // Handle email
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleSegmentAction = (action, segment) => {
    console.log('Segment action:', action, segment);
    
    switch (action) {
      case 'view_segment':
        setSelectedSegmentData(segment);
        setShowSegmentModal(true);
        break;
      case 'execute_campaign':
        // Handle campaign execution
        break;
      case 'export':
        // Handle export
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleSaveCustomer = (updatedCustomer) => {
    console.log('Saving customer:', updatedCustomer);
    // Handle customer update
    setShowProfileModal(false);
  };

  const handleSaveSegment = (updatedSegment) => {
    console.log('Saving segment:', updatedSegment);
    // Handle segment update
    setShowSegmentModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-gray-600">Comprehensive customer intelligence and management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{customerData.total_customers.toLocaleString()}</div>
            <div className="text-blue-600 font-medium">Total Customers</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">+{customerData.new_customers_30d}</div>
            <div className="text-green-600 font-medium">New (30d)</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">-{customerData.churned_customers_30d}</div>
            <div className="text-red-600 font-medium">Churned (30d)</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{customerData.retention_rate}%</div>
            <div className="text-purple-600 font-medium">Retention Rate</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <CustomerOverviewTab 
              customerData={customerData}
              onCustomerAction={handleCustomerAction}
              onSegmentAction={handleSegmentAction}
            />
          )}
          
          {activeTab === 'customers' && (
            <CustomerListTab 
              profiles={profiles}
              onCustomerAction={handleCustomerAction}
            />
          )}
          
          {activeTab === 'profiles' && (
            <CustomerProfilesTab 
              profiles={profiles}
              onCustomerAction={handleCustomerAction}
            />
          )}
          
          {activeTab === 'funnel' && (
            <CustomerFunnelTab 
              profiles={profiles}
              onCustomerAction={handleCustomerAction}
            />
          )}
          
          {activeTab === 'messaging' && (
            <CustomerMessagingTab 
              profiles={profiles}
              onCustomerAction={handleCustomerAction}
            />
          )}
          
          {activeTab === 'retention' && (
            <CustomerRetentionTab 
              profiles={profiles}
              onCustomerAction={handleCustomerAction}
            />
          )}
          
          {activeTab === 'opportunities' && (
            <CustomerOpportunitiesTab 
              profiles={profiles}
              onCustomerAction={handleCustomerAction}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showProfileModal && (
        <CustomerProfileModal
          customer={selectedCustomer}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveCustomer}
          onAction={handleCustomerAction}
        />
      )}

      {showSegmentModal && (
        <CustomerSegmentModal
          segment={selectedSegmentData}
          isOpen={showSegmentModal}
          onClose={() => setShowSegmentModal(false)}
          onSave={handleSaveSegment}
          onAction={handleSegmentAction}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;