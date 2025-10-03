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
import ApprovalModal from './modals/ApprovalModal';
import { useCustomerActions } from '../../services/customerIntelligenceAPI';

// Import utilities
import { handleCustomerAction as processCustomerAction, formatModalData } from './utils/customerActions';

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
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const { executeAction, executing } = useCustomerActions();

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

  // Overview: execute action via approval flow
  const handleExecuteOverviewAction = (actionPayload) => {
    setApprovalData({
      title: 'Execute Action',
      message: typeof actionPayload === 'string' ? actionPayload : (actionPayload?.context?.insight_text || actionPayload?.context?.action_text || 'Run workflow'),
      action: 'run_workflow',
      data: { source: 'customer_overview', payload: actionPayload }
    });
    setShowApprovalModal(true);
  };

  // Build Overview analysis shape for CustomerOverviewTab
  const overviewAnalysis = (() => {
    const cd = customerData;
    const segmentsObj = (segments || []).reduce((acc, seg) => {
      const key = (seg.name || 'segment').toLowerCase().replace(/\s+/g, '_');
      acc[key] = {
        count: seg.customer_count || 0,
        average_lifetime_value: seg.avg_lifetime_value || 0,
        retention_rate: seg.churn_rate != null ? (100 - seg.churn_rate) : 0,
        growth_potential: (seg.growth_rate || 0) > 0 ? 'high' : (seg.growth_rate || 0) === 0 ? 'medium' : 'low'
      };
      return acc;
    }, {});

    // Split alerts into positive insights vs action-required items
    const alerts = cd.alerts || [];
    const isPositiveAlert = (a) => {
      const positiveTypes = ['opportunity', 'growth', 'win', 'upgrade'];
      const text = (a.message || '').toLowerCase();
      return (
        (a.type && positiveTypes.includes(String(a.type).toLowerCase())) ||
        /(ready|improv|increase|growing|up\b|upsell|upgrade|advocate|high engagement|positive)/.test(text)
      );
    };
    const positiveInsights = alerts.filter(isPositiveAlert).map((a) => a.message);
    const needsAttention = alerts
      .filter((a) => !isPositiveAlert(a) || String(a.priority).toLowerCase() === 'high')
      .map((a) => a.message);

    return {
      customer_metrics: {
        acquisition_metrics: {
          customer_growth_rate: { current: cd.new_customers_30d || 0, trend: 'up', change: 0 },
          acquisition_cost: { current: 0, trend: 'stable', change: 0 },
          funnel_conversion_rate: { current: 0, trend: 'stable', change: 0 }
        },
        retention_metrics: {
          retention_rate: { current: cd.retention_rate || 0, trend: 'up', change: 0 },
          churn_rate: { current: cd.churned_customers_30d || 0, trend: 'down', change: 0 },
          repeat_purchase_rate: { current: 0, trend: 'stable', change: 0 }
        },
        satisfaction_metrics: {
          nps_score: { current: 0, trend: 'stable', change: 0 },
          response_time: { current: 0, trend: 'stable', change: 0 },
          resolution_rate: { current: 0, trend: 'stable', change: 0 }
        }
      },
      customer_segments: segmentsObj,
      key_insights: positiveInsights,
      immediate_actions: needsAttention
    };
  })();

  // Build Funnel analysis shape for CustomerFunnelTab
  const funnelAnalysis = {
    funnel_analysis: {
      total_leads: (profiles || []).length || 0,
      funnel_stages: {
        lead: { count: Math.max(0, Math.round((profiles || []).length * 0.9)), conversion_rate: 60, drop_off_rate: 10, average_time_in_stage: '3d', optimization_opportunities: ['Improve top-of-funnel content'] },
        prospect: { count: Math.max(0, Math.round((profiles || []).length * 0.6)), conversion_rate: 45, drop_off_rate: 15, average_time_in_stage: '5d', optimization_opportunities: ['Tighten qualification'] },
        trial: { count: Math.max(0, Math.round((profiles || []).length * 0.35)), conversion_rate: 35, drop_off_rate: 20, average_time_in_stage: '7d', optimization_opportunities: ['Improve onboarding'] },
        customer: { count: Math.max(0, Math.round((profiles || []).length * 0.2)), conversion_rate: 25, drop_off_rate: 10, average_time_in_stage: '14d', optimization_opportunities: ['Enhance conversion offers'] }
      }
    }
  };

  const handleCustomerAction = (action, data) => {
    const result = processCustomerAction(action, data);
    
    switch (result.type) {
      case 'open_modal':
        if (result.modal === 'customer_profile') {
          setSelectedCustomer(data);
          setShowProfileModal(true);
        } else if (result.modal === 'customer_segment') {
          setSelectedSegmentData(data);
          setShowSegmentModal(true);
        }
        if (result.modal === 'export_customers') {
          setExportData(result.data || []);
          setShowExportModal(true);
        }
        if (result.modal === 'import_customers') {
          setShowImportModal(true);
        }
        break;
      case 'confirm_action':
        setApprovalData({
          title: 'Confirm Action',
          message: result.message,
          action: result.action,
          data: result.data
        });
        setShowApprovalModal(true);
        break;
      case 'download':
        console.log('Downloading:', result.format, result.data);
        break;
      
      case 'error':
        console.error(result.message);
        break;
      default:
        console.log('Action result:', result);
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
              analysis={overviewAnalysis}
              segments={segments}
              metaKPIs={[]}
              onInsightsView={() => {}}
              onExecuteAction={handleExecuteOverviewAction}
            />
          )}
          
          {activeTab === 'customers' && (
            <CustomerListTab 
              profiles={profiles}
              segments={segments}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedSegment={selectedSegment}
              setSelectedSegment={setSelectedSegment}
              onCustomerAction={handleCustomerAction}
              onProfileView={(p) => handleCustomerAction('view_profile', p)}
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
              funnel={funnelAnalysis}
              onJourneyView={() => {}}
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

      {showApprovalModal && approvalData && (
        <ApprovalModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          onApprove={async (action, data) => {
            try {
              await executeAction(action, data);
            } catch (e) {
              console.error('Agent execution failed:', e);
            } finally {
              setShowApprovalModal(false);
            }
          }}
          title={approvalData.title}
          message={approvalData.message}
          action={approvalData.action}
          data={approvalData.data}
        />
      )}

      {/* Export/Import Modals - Coming soon placeholders */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" onClick={() => setShowExportModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full" onClick={(e)=>e.stopPropagation()}>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Export Customers</h3>
              <p className="text-sm text-gray-600">Choose a format to export {exportData.length} customers.</p>
            </div>
            <div className="p-6 space-y-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={()=>console.log('Export CSV')}>Export CSV</button>
              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={()=>console.log('Export Excel')}>Export Excel</button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={()=>console.log('Export Google Sheet')}>Export to Google Sheets</button>
            </div>
            <div className="p-6 border-t bg-gray-50 text-right">
              <button className="px-4 py-2 bg-gray-100 rounded" onClick={()=>setShowExportModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" onClick={() => setShowImportModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full" onClick={(e)=>e.stopPropagation()}>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Import Customers</h3>
              <p className="text-sm text-gray-600">Import from CSV or connect a source (CRM, Google Drive, OneDrive, Dropbox).</p>
            </div>
            <div className="p-6 space-y-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={()=>console.log('Import CSV')}>Import CSV</button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={()=>console.log('Connect CRM')}>Connect CRM</button>
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-gray-100 rounded">Google Drive</button>
                <button className="px-3 py-2 bg-gray-100 rounded">OneDrive</button>
                <button className="px-3 py-2 bg-gray-100 rounded">Dropbox</button>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 text-right">
              <button className="px-4 py-2 bg-gray-100 rounded" onClick={()=>setShowImportModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;