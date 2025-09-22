// Customer Dashboard Component for Customer Intelligence Agent
// This component provides Customer Success + CRM Manager oversight and insights

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Heart,
  Target,
  BarChart3,
  UserCheck,
  MessageCircle,
  Star,
  AlertTriangle,
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  UserPlus,
  UserMinus,
  Activity,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const CustomerDashboardComponent = ({ customerData, onCustomerAction, onSegmentAction }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');

  if (!customerData) {
    return <CustomerDashboardSkeleton />;
  }

  const { customer_analysis, customer_segments, customer_profiles, cross_agent_meta_kpis } = customerData;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'funnel', label: 'Funnel', icon: Target },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'segments', label: 'Segments', icon: UserCheck },
    { id: 'retention', label: 'Retention', icon: Heart },
    { id: 'meta', label: 'Guild Performance', icon: Zap }
  ];

  const timeframes = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getChurnRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Health Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-gray-600">Customer Success + CRM Manager oversight and insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {timeframes.map(timeframe => (
                <option key={timeframe.id} value={timeframe.id}>
                  {timeframe.label}
                </option>
              ))}
            </select>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {customer_analysis?.customer_health_score || 78.5}/100
              </div>
              <p className="text-sm text-gray-600">Customer Health Score</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Customer Growth</p>
                <p className="text-2xl font-bold text-blue-800">+15.2%</p>
                <p className="text-xs text-blue-600">+8.5% from last month</p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Retention Rate</p>
                <p className="text-2xl font-bold text-green-800">82.5%</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
              <Heart className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Churn Rate</p>
                <p className="text-2xl font-bold text-red-800">12.8%</p>
                <p className="text-xs text-green-600">-17.4% from last month</p>
              </div>
              <UserMinus className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Customer LTV</p>
                <p className="text-2xl font-bold text-purple-800">$2,850</p>
                <p className="text-xs text-purple-600">+7.5% from last month</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CustomerOverviewTab customerAnalysis={customer_analysis} />
          </motion.div>
        )}

        {activeTab === 'funnel' && (
          <motion.div
            key="funnel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CustomerFunnelTab customerAnalysis={customer_analysis} />
          </motion.div>
        )}

        {activeTab === 'customers' && (
          <motion.div
            key="customers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CustomerDirectoryTab 
              profiles={customer_profiles} 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedSegment={selectedSegment}
              setSelectedSegment={setSelectedSegment}
              onCustomerAction={onCustomerAction}
            />
          </motion.div>
        )}

        {activeTab === 'segments' && (
          <motion.div
            key="segments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CustomerSegmentsTab segments={customer_segments} onSegmentAction={onSegmentAction} />
          </motion.div>
        )}

        {activeTab === 'retention' && (
          <motion.div
            key="retention"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <RetentionTab customerAnalysis={customer_analysis} />
          </motion.div>
        )}

        {activeTab === 'meta' && (
          <motion.div
            key="meta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CrossAgentMetaKPIsTab metaKPIs={cross_agent_meta_kpis} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Customer Overview Tab Component
const CustomerOverviewTab = ({ customerAnalysis }) => {
  const metrics = customerAnalysis?.customer_metrics || {};
  
  return (
    <div className="space-y-6">
      {/* Key Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Acquisition Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserPlus className="w-5 h-5 text-blue-500 mr-2" />
            Acquisition
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Growth Rate</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">15.2%</span>
                <span className="text-green-600 text-sm ml-2">+8.5%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Acquisition Cost</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">$85.50</span>
                <span className="text-green-600 text-sm ml-2">-12.3%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Funnel Conversion Rate</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">18.0%</span>
                <span className="text-green-600 text-sm ml-2">+15.7%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Retention Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="w-5 h-5 text-green-500 mr-2" />
            Retention
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Retention Rate</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">82.5%</span>
                <span className="text-green-600 text-sm ml-2">+12.0%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Churn Rate</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">12.8%</span>
                <span className="text-green-600 text-sm ml-2">-17.4%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer LTV</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">$2,850</span>
                <span className="text-green-600 text-sm ml-2">+7.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Satisfaction Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            Satisfaction
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Net Promoter Score</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">68.5</span>
                <span className="text-green-600 text-sm ml-2">+9.2%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">87.2%</span>
                <span className="text-green-600 text-sm ml-2">+5.8%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Support Response Time</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">1.8h</span>
                <span className="text-green-600 text-sm ml-2">-25.0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments Overview */}
      {customerAnalysis?.customer_segments && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserCheck className="w-5 h-5 text-purple-500 mr-2" />
            Customer Segments Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(customerAnalysis.customer_segments).map(([segment, data]) => (
              <div key={segment} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 capitalize">
                  {segment.replace('_', ' ')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customers:</span>
                    <span className="font-medium">{data.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg LTV:</span>
                    <span className="font-medium">${data.average_lifetime_value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retention:</span>
                    <span className="font-medium">{data.retention_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential:</span>
                    <span className="font-medium capitalize">{data.growth_potential}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights */}
      {customerAnalysis?.key_insights && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            Key Customer Insights
          </h3>
          <div className="space-y-3">
            {customerAnalysis.key_insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immediate Actions */}
      {customerAnalysis?.immediate_actions && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Immediate Actions Required
          </h3>
          <div className="space-y-3">
            {customerAnalysis.immediate_actions.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 font-medium">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Customer Funnel Tab Component
const CustomerFunnelTab = ({ customerAnalysis }) => {
  const funnelData = {
    "Lead": { count: 1000, conversion: 100 },
    "Prospect": { count: 600, conversion: 60 },
    "Trial": { count: 300, conversion: 50 },
    "Customer": { count: 180, conversion: 60 },
    "Evangelist": { count: 54, conversion: 30 }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Target className="w-5 h-5 text-blue-500 mr-2" />
          Customer Journey Funnel
        </h3>
        
        <div className="space-y-4">
          {Object.entries(funnelData).map(([stage, data], index) => {
            const width = (data.count / 1000) * 100;
            return (
              <div key={stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{stage}</h4>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{data.count}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({data.conversion}% conversion)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div 
                    className="bg-blue-600 h-6 rounded-full flex items-center justify-center"
                    style={{ width: `${width}%` }}
                  >
                    <span className="text-white text-sm font-medium">
                      {data.count}
                    </span>
                  </div>
                </div>
                {index < Object.keys(funnelData).length - 1 && (
                  <div className="flex justify-center mt-2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Customer Directory Tab Component
const CustomerDirectoryTab = ({ profiles, searchTerm, setSearchTerm, selectedSegment, setSelectedSegment, onCustomerAction }) => {
  const filteredProfiles = profiles?.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = selectedSegment === 'all' || profile.customer_segment === selectedSegment;
    return matchesSearch && matchesSegment;
  }) || [];

  const segments = ['all', 'high_value', 'at_risk', 'new_customers', 'inactive'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 text-blue-500 mr-2" />
            Customer Directory
          </h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {segments.map(segment => (
                <option key={segment} value={segment}>
                  {segment === 'all' ? 'All Segments' : segment.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.slice(0, 12).map((profile) => (
            <div key={profile.customer_id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{profile.name}</h4>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(profile.churn_risk)}`}>
                  {profile.churn_risk}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Segment:</span>
                  <span className="font-medium capitalize">{profile.customer_segment.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">LTV:</span>
                  <span className="font-medium">${profile.lifetime_value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Health Score:</span>
                  <span className="font-medium">{profile.health_score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders:</span>
                  <span className="font-medium">{profile.total_orders}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Last Activity:</span>
                  <span>{new Date(profile.last_activity).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProfiles.length > 12 && (
          <div className="mt-6 text-center">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View All {filteredProfiles.length} Customers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Customer Segments Tab Component
const CustomerSegmentsTab = ({ segments, onSegmentAction }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <UserCheck className="w-5 h-5 text-purple-500 mr-2" />
          Customer Segments
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {segments?.map((segment) => (
            <div key={segment.segment_id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  segment.engagement_level === 'high' ? 'bg-green-100 text-green-800' :
                  segment.engagement_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {segment.engagement_level}
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customers:</span>
                  <span className="font-medium">{segment.customer_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg LTV:</span>
                  <span className="font-medium">${segment.average_lifetime_value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Churn Rate:</span>
                  <span className="font-medium">{segment.churn_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Growth Potential:</span>
                  <span className="font-medium capitalize">{segment.growth_potential}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Recommended Actions</h5>
                <div className="space-y-1">
                  {segment.recommended_actions.slice(0, 2).map((action, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {action}
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => onSegmentAction && onSegmentAction(segment.segment_id, segment.recommended_actions)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Execute Actions
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Retention Tab Component
const RetentionTab = ({ customerAnalysis }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Heart className="w-5 h-5 text-green-500 mr-2" />
          Customer Retention & Churn Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Retention Metrics */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Retention Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">Retention Rate</span>
                <div className="text-right">
                  <span className="font-semibold text-green-800">82.5%</span>
                  <p className="text-xs text-green-600">+12% MoM</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-600">Churn Rate</span>
                <div className="text-right">
                  <span className="font-semibold text-red-800">12.8%</span>
                  <p className="text-xs text-green-600">-17.4% MoM</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600">Customer LTV</span>
                <div className="text-right">
                  <span className="font-semibold text-blue-800">$2,850</span>
                  <p className="text-xs text-blue-600">+7.5% MoM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Churn Risk Analysis */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Churn Risk Analysis</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-600">Critical Risk</span>
                <span className="font-semibold text-red-800">8 customers</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600">High Risk</span>
                <span className="font-semibold text-orange-800">12 customers</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-600">Medium Risk</span>
                <span className="font-semibold text-yellow-800">25 customers</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">Low Risk</span>
                <span className="font-semibold text-green-800">155 customers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cross-Agent Meta KPIs Tab Component
const CrossAgentMetaKPIsTab = ({ metaKPIs }) => {
  const metaKPIList = [
    {
      id: "agent_accuracy",
      name: "Agent Accuracy",
      value: 92.5,
      target: 95.0,
      unit: "%",
      description: "Percentage of tasks judged as high quality by Judge Agent",
      trend: "up",
      change: 3.2
    },
    {
      id: "agent_coverage",
      name: "Agent Coverage",
      value: 87.3,
      target: 90.0,
      unit: "%",
      description: "Percentage of business areas handled autonomously by agents",
      trend: "up",
      change: 8.7
    },
    {
      id: "human_overrides",
      name: "Human-in-the-Loop Overrides",
      value: 15.8,
      target: 10.0,
      unit: "%",
      description: "How often users step in to override agent decisions",
      trend: "down",
      change: -12.5
    },
    {
      id: "workflow_efficiency",
      name: "Workflow Efficiency",
      value: 78.5,
      target: 85.0,
      unit: "%",
      description: "Average task completion time vs manual baseline",
      trend: "up",
      change: 15.2
    },
    {
      id: "recommendation_adoption",
      name: "Recommendation Adoption Rate",
      value: 72.3,
      target: 80.0,
      unit: "%",
      description: "How often users follow agent suggestions",
      trend: "up",
      change: 18.7
    },
    {
      id: "agent_roi_contribution",
      name: "Agent ROI Contribution",
      value: 4.2,
      target: 5.0,
      unit: "x",
      description: "Revenue/efficiency attributed to each agent category",
      trend: "up",
      change: 22.8
    },
    {
      id: "error_detection_correction",
      name: "Error Detection & Correction Rate",
      value: 89.7,
      target: 95.0,
      unit: "%",
      description: "Judge Agent + Orchestrator catching and correcting issues",
      trend: "up",
      change: 6.3
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Zap className="w-5 h-5 text-purple-500 mr-2" />
          Guild Performance Meta KPIs
        </h3>
        <p className="text-gray-600 mb-6">
          These unique KPIs measure how well Guild itself is performing, making it different from a normal dashboard app.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metaKPIList.map((kpi) => (
            <div key={kpi.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{kpi.name}</h4>
                <div className="flex items-center">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-2xl font-bold text-gray-900">
                  {kpi.value}{kpi.unit}
                </div>
                <div className="text-sm text-gray-600">
                  Target: {kpi.target}{kpi.unit}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full ${
                    (kpi.value / kpi.target) >= 1 ? 'bg-green-500' :
                    (kpi.value / kpi.target) >= 0.8 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-gray-600">{kpi.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function for churn risk colors
const getChurnRiskColor = (risk) => {
  switch (risk) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'critical': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

// Skeleton loading component
const CustomerDashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          <div className="h-12 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default CustomerDashboardComponent;
