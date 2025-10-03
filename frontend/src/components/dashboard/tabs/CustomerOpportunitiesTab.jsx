import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  DollarSign,
  Target,
  Users,
  BarChart3,
  Activity,
  Star,
  Heart,
  Brain,
  Zap,
  Sparkles,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Trash2,
  Send,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Tag,
  Building,
  Globe,
  Smartphone,
  Monitor,
  Laptop,
  Bell,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UserPlus,
  UserMinus,
  Plus,
  Minus,
  Play,
  Pause,
  Settings,
  ShoppingBag,
  CreditCard,
  Gift,
  Award,
  TrendingDown,
  AlertTriangle,
  Clock,
  MapPin,
  X
} from 'lucide-react';

const CustomerOpportunitiesTab = ({ profiles, onCustomerAction }) => {
  const [selectedOpportunity, setSelectedOpportunity] = useState('all');
  const [selectedRevenue, setSelectedRevenue] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);

  // Mock opportunities data
  const opportunitiesData = {
    totalRevenue: 125000,
    projectedGrowth: 23.5,
    activeOpportunities: 47,
    conversionRate: 34.2,
    avgDealSize: 2650,
    opportunities: profiles.filter((_, index) => index < 10).map((profile, index) => ({
      ...profile,
      opportunityType: ['upsell', 'cross-sell', 'renewal', 'expansion'][index % 4],
      revenue: 1500 + (index * 500),
      probability: 65 + (index * 5),
      stage: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won'][index % 5],
      nextAction: [
        'Schedule discovery call',
        'Send product demo',
        'Prepare proposal',
        'Follow up on pricing',
        'Close the deal'
      ][index % 5],
      expectedClose: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      aiRecommendation: [
        'High-value customer, prioritize personal outreach',
        'Price-sensitive segment, offer early-bird discount',
        'Technical buyer, focus on ROI demonstration',
        'Decision maker identified, schedule executive meeting',
        'Competitive situation, emphasize unique value prop'
      ][index % 5],
      confidence: 75 + (index * 3)
    }))
  };

  const microCampaigns = [
    {
      id: 'campaign_001',
      name: 'Premium Feature Upsell',
      description: 'Target high-value customers for premium feature upgrades',
      targetSegment: 'VIP Customers',
      expectedRevenue: 25000,
      conversionRate: 28,
      status: 'active',
      participants: 45,
      actions: [
        'Personalized email sequence',
        'Feature demonstration calls',
        'Exclusive upgrade offers',
        'Success story sharing'
      ]
    },
    {
      id: 'campaign_002',
      name: 'Cross-Sell Automation',
      description: 'Automated cross-sell recommendations based on purchase history',
      targetSegment: 'Recent Buyers',
      expectedRevenue: 18000,
      conversionRate: 22,
      status: 'active',
      participants: 78,
      actions: [
        'AI-powered product recommendations',
        'Behavioral trigger emails',
        'Personalized landing pages',
        'Follow-up sequences'
      ]
    },
    {
      id: 'campaign_003',
      name: 'Renewal Acceleration',
      description: 'Early renewal campaigns for subscription customers',
      targetSegment: 'Subscription Users',
      expectedRevenue: 32000,
      conversionRate: 35,
      status: 'active',
      participants: 92,
      actions: [
        'Renewal reminder sequences',
        'Loyalty reward programs',
        'Early renewal incentives',
        'Success metrics sharing'
      ]
    }
  ];

  const opportunityTypes = [
    { id: 'all', label: 'All Opportunities', count: opportunitiesData.opportunities.length },
    { id: 'upsell', label: 'Upsell', count: opportunitiesData.opportunities.filter(o => o.opportunityType === 'upsell').length },
    { id: 'cross-sell', label: 'Cross-sell', count: opportunitiesData.opportunities.filter(o => o.opportunityType === 'cross-sell').length },
    { id: 'renewal', label: 'Renewal', count: opportunitiesData.opportunities.filter(o => o.opportunityType === 'renewal').length },
    { id: 'expansion', label: 'Expansion', count: opportunitiesData.opportunities.filter(o => o.opportunityType === 'expansion').length }
  ];

  const revenueRanges = [
    { id: 'all', label: 'All Revenue', count: opportunitiesData.opportunities.length },
    { id: 'high', label: 'High ($5K+)', count: opportunitiesData.opportunities.filter(o => o.revenue >= 5000).length },
    { id: 'medium', label: 'Medium ($2K-$5K)', count: opportunitiesData.opportunities.filter(o => o.revenue >= 2000 && o.revenue < 5000).length },
    { id: 'low', label: 'Low (<$2K)', count: opportunitiesData.opportunities.filter(o => o.revenue < 2000).length }
  ];

  // Filter opportunities
  const filteredOpportunities = opportunitiesData.opportunities.filter(opportunity => {
    const matchesType = selectedOpportunity === 'all' || opportunity.opportunityType === selectedOpportunity;
    const matchesRevenue = selectedRevenue === 'all' || 
      (selectedRevenue === 'high' && opportunity.revenue >= 5000) ||
      (selectedRevenue === 'medium' && opportunity.revenue >= 2000 && opportunity.revenue < 5000) ||
      (selectedRevenue === 'low' && opportunity.revenue < 2000);
    const matchesSearch = opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.nextAction.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesRevenue && matchesSearch;
  });

  const getOpportunityTypeColor = (type) => {
    switch (type) {
      case 'upsell': return 'text-blue-600 bg-blue-100';
      case 'cross-sell': return 'text-green-600 bg-green-100';
      case 'renewal': return 'text-purple-600 bg-purple-100';
      case 'expansion': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'prospecting': return 'text-gray-600 bg-gray-100';
      case 'qualification': return 'text-yellow-600 bg-yellow-100';
      case 'proposal': return 'text-blue-600 bg-blue-100';
      case 'negotiation': return 'text-orange-600 bg-orange-100';
      case 'closed-won': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'text-green-600 bg-green-100';
    if (probability >= 60) return 'text-blue-600 bg-blue-100';
    if (probability >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Growth Opportunities</h3>
              <p className="text-sm text-gray-600">Identify and execute revenue expansion strategies</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCampaignModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">${opportunitiesData.totalRevenue.toLocaleString()}</div>
            <div className="text-green-600 font-medium">Total Pipeline</div>
            <div className="text-sm text-gray-600">Active opportunities</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{opportunitiesData.projectedGrowth}%</div>
            <div className="text-blue-600 font-medium">Projected Growth</div>
            <div className="text-sm text-gray-600">Next quarter</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{opportunitiesData.activeOpportunities}</div>
            <div className="text-purple-600 font-medium">Active Opportunities</div>
            <div className="text-sm text-gray-600">In pipeline</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{opportunitiesData.conversionRate}%</div>
            <div className="text-orange-600 font-medium">Conversion Rate</div>
            <div className="text-sm text-gray-600">Last 30 days</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">${opportunitiesData.avgDealSize.toLocaleString()}</div>
            <div className="text-red-600 font-medium">Avg Deal Size</div>
            <div className="text-sm text-gray-600">Per opportunity</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedOpportunity}
              onChange={(e) => setSelectedOpportunity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {opportunityTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label} ({type.count})
                </option>
              ))}
            </select>

            <select
              value={selectedRevenue}
              onChange={(e) => setSelectedRevenue(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {revenueRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.label} ({range.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Micro Campaigns */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Micro Campaigns</h4>
          <button
            onClick={() => setShowCampaignModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {microCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-900">{campaign.name}</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                }`}>
                  {campaign.status}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-medium text-blue-600">{campaign.targetSegment}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Expected Revenue:</span>
                  <span className="font-medium text-green-600">${campaign.expectedRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Conversion Rate:</span>
                  <span className="font-medium text-purple-600">{campaign.conversionRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-medium text-orange-600">{campaign.participants}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onCustomerAction('execute_campaign', campaign)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Execute
                </button>
                <button
                  onClick={() => onCustomerAction('edit_campaign', campaign)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onCustomerAction('pause_campaign', campaign)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Opportunities List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Revenue Opportunities</h4>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center">
              <Send className="w-4 h-4 mr-2" />
              Bulk Actions
            </button>
            <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.customer_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h5 className="text-lg font-semibold text-gray-900">{opportunity.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOpportunityTypeColor(opportunity.opportunityType)}`}>
                        {opportunity.opportunityType}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                        {opportunity.stage}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(opportunity.probability)}`}>
                        {opportunity.probability}% probability
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        ${opportunity.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-600">Next Action</div>
                      <div className="text-sm font-medium text-gray-900">{opportunity.nextAction}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Expected Close</div>
                      <div className="text-sm font-medium text-blue-600">{formatDate(opportunity.expectedClose)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">AI Recommendation</div>
                      <div className="text-sm font-medium text-purple-600">{opportunity.aiRecommendation}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Confidence: {opportunity.confidence}%</span>
                      <span>•</span>
                      <span>LTV: ${opportunity.lifetime_value.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onCustomerAction('schedule_call', opportunity)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Schedule Call
                      </button>
                      <button
                        onClick={() => onCustomerAction('send_proposal', opportunity)}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Send Proposal
                      </button>
                      <button
                        onClick={() => onCustomerAction('view_profile', opportunity)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredOpportunities.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedOpportunity('all');
                  setSelectedRevenue('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCampaignModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Create Micro Campaign</h3>
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Premium Feature Upsell"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the campaign's purpose and goals"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Segment</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>VIP Customers</option>
                    <option>Recent Buyers</option>
                    <option>Subscription Users</option>
                    <option>High-Value Prospects</option>
                    <option>At-Risk Customers</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-500">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Upsell</span>
                      </div>
                      <p className="text-sm text-gray-600">Upgrade existing customers</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-500">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Cross-sell</span>
                      </div>
                      <p className="text-sm text-gray-600">Sell additional products</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Impact</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">$25K+</div>
                      <div className="text-blue-600 text-sm">Revenue Impact</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">25-30%</div>
                      <div className="text-green-600 text-sm">Conversion Rate</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">7-14 days</div>
                      <div className="text-purple-600 text-sm">Campaign Duration</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Creating micro campaign...');
                    setShowCampaignModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Opportunity Modal */}
      {showOpportunityModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowOpportunityModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Create Opportunity</h3>
                <button
                  onClick={() => setShowOpportunityModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {profiles.map(profile => (
                      <option key={profile.customer_id} value={profile.customer_id}>
                        {profile.name} ({profile.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="upsell">Upsell</option>
                    <option value="cross-sell">Cross-sell</option>
                    <option value="renewal">Renewal</option>
                    <option value="expansion">Expansion</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Potential</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter expected revenue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="prospecting">Prospecting</option>
                    <option value="qualification">Qualification</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed-won">Closed Won</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Action</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Schedule discovery call"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowOpportunityModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Creating opportunity...');
                    setShowOpportunityModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Opportunity
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CustomerOpportunitiesTab;
