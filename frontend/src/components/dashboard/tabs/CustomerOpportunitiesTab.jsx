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
  X,
  User,
  Info
} from 'lucide-react';

const CustomerOpportunitiesTab = ({ profiles, onCustomerAction }) => {
  const [selectedOpportunity, setSelectedOpportunity] = useState('all');
  const [selectedRevenue, setSelectedRevenue] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  
  // Campaign management state
  const [campaigns, setCampaigns] = useState([]);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    targetSegment: '',
    campaignType: '',
    expectedRevenue: '',
    conversionRate: '',
    duration: ''
  });
  
  // Approval and execution state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  // Proposal state
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalData, setProposalData] = useState(null);
  
  // Campaign status tracking
  const [campaignStatuses, setCampaignStatuses] = useState({});

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

  // Existing micro campaigns (will be merged with user-created ones)
  const existingMicroCampaigns = [
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
  
  // Combine existing and user-created campaigns
  const allCampaigns = [...existingMicroCampaigns, ...campaigns];

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

  // Campaign management functions
  const handleExecuteCampaign = (campaign) => {
    const executionPlan = generateExecutionPlan(campaign);
    
    setApprovalData({
      action: 'execute_campaign',
      campaign: campaign,
      executionPlan: executionPlan
    });
    
    setShowApprovalModal(true);
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      description: campaign.description,
      targetSegment: campaign.targetSegment,
      campaignType: campaign.campaignType || 'upsell',
      expectedRevenue: campaign.expectedRevenue.toString(),
      conversionRate: campaign.conversionRate.toString(),
      duration: campaign.duration || '14 days'
    });
    setShowCampaignModal(true);
  };

  const handlePlayPauseToggle = (campaign) => {
    const currentStatus = campaignStatuses[campaign.id] || campaign.status;
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    setCampaignStatuses(prev => ({
      ...prev,
      [campaign.id]: newStatus
    }));
  };

  const generateExecutionPlan = (campaign) => {
    return {
      strategy: `Execute ${campaign.name} campaign targeting ${campaign.targetSegment}`,
      approach: 'Multi-channel revenue growth campaign with AI-powered personalization',
      priority: 'High',
      channels: ['Email', 'Phone', 'Social Media', 'In-App'],
      timeline: '7-14 days',
      tactics: [
        'AI-powered personalized email sequences',
        'Automated follow-up calls for high-value prospects',
        'Social media engagement and retargeting',
        'In-app notifications and upgrade prompts',
        'Performance tracking and optimization'
      ],
      expectedOutcome: `Generate $${campaign.expectedRevenue.toLocaleString()} in revenue with ${campaign.conversionRate}% conversion rate`,
      agents: [
        'Enhanced Campaign Agent: Campaign execution and optimization',
        'Customer Intelligence Agent: Personalization and targeting',
        'Orchestrator Agent: Workflow coordination',
        'Judge Agent: Quality assurance and performance monitoring'
      ]
    };
  };

  const generateAICampaign = (segment) => {
    const aiCampaignTemplates = {
      'VIP Customers': {
        name: 'AI-Generated Premium Upsell Campaign',
        description: 'Intelligent upselling strategy for high-value customers using personalized product recommendations and exclusive offers.',
        campaignType: 'upsell',
        expectedRevenue: 35000,
        conversionRate: 32,
        duration: '14 days'
      },
      'Recent Buyers': {
        name: 'AI-Generated Cross-Sell Automation',
        description: 'Automated cross-selling campaign leveraging purchase history and behavioral data for maximum relevance.',
        campaignType: 'cross-sell',
        expectedRevenue: 22000,
        conversionRate: 28,
        duration: '10 days'
      },
      'Subscription Users': {
        name: 'AI-Generated Renewal Acceleration',
        description: 'Intelligent renewal campaign with early incentives and value demonstration for subscription retention.',
        campaignType: 'renewal',
        expectedRevenue: 45000,
        conversionRate: 38,
        duration: '21 days'
      },
      'High-Value Prospects': {
        name: 'AI-Generated Enterprise Outreach',
        description: 'Strategic enterprise sales campaign targeting high-value prospects with personalized value propositions.',
        campaignType: 'expansion',
        expectedRevenue: 75000,
        conversionRate: 25,
        duration: '30 days'
      },
      'At-Risk Customers': {
        name: 'AI-Generated Retention Campaign',
        description: 'Intelligent retention campaign combining value demonstration with personalized offers to prevent churn.',
        campaignType: 'retention',
        expectedRevenue: 28000,
        conversionRate: 35,
        duration: '12 days'
      }
    };

    return aiCampaignTemplates[segment] || aiCampaignTemplates['VIP Customers'];
  };

  const handleAICreateCampaign = () => {
    if (!campaignForm.targetSegment) {
      alert('Please select a target segment first');
      return;
    }

    const aiCampaign = generateAICampaign(campaignForm.targetSegment);
    
    setCampaignForm(prev => ({
      ...prev,
      name: aiCampaign.name,
      description: aiCampaign.description,
      campaignType: aiCampaign.campaignType,
      expectedRevenue: aiCampaign.expectedRevenue.toString(),
      conversionRate: aiCampaign.conversionRate.toString(),
      duration: aiCampaign.duration
    }));
  };

  const handleCampaignSubmit = () => {
    const newCampaign = {
      id: `campaign_${Date.now()}`,
      name: campaignForm.name,
      description: campaignForm.description,
      targetSegment: campaignForm.targetSegment,
      campaignType: campaignForm.campaignType,
      expectedRevenue: parseInt(campaignForm.expectedRevenue),
      conversionRate: parseInt(campaignForm.conversionRate),
      status: 'active',
      participants: Math.floor(Math.random() * 100) + 20,
      actions: [
        'AI-powered personalized outreach',
        'Multi-channel campaign execution',
        'Performance tracking and optimization',
        'Automated follow-up sequences'
      ],
      duration: campaignForm.duration
    };

    if (editingCampaign) {
      setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? { ...newCampaign, id: editingCampaign.id } : c));
    } else {
      setCampaigns(prev => [...prev, newCampaign]);
    }

    setCampaignForm({
      name: '',
      description: '',
      targetSegment: '',
      campaignType: '',
      expectedRevenue: '',
      conversionRate: '',
      duration: ''
    });
    setEditingCampaign(null);
    setShowCampaignModal(false);
  };

  const handleApproval = () => {
    if (approvalData.action === 'execute_campaign') {
      // Execute the campaign
      const campaign = approvalData.campaign;
      
      setSuccessData({
        title: 'Campaign Launched Successfully!',
        message: `${campaign.name} has been launched and is now running autonomously.`,
        details: {
          campaign: campaign.name,
          target: campaign.targetSegment,
          expectedRevenue: `$${campaign.expectedRevenue.toLocaleString()}`,
          duration: campaign.duration || '14 days',
          agents: ['Enhanced Campaign Agent', 'Customer Intelligence Agent', 'Orchestrator Agent']
        }
      });
      
      setShowSuccessModal(true);
    } else if (approvalData.action === 'send_proposal') {
      // Execute the proposal
      const proposal = approvalData.proposal;
      
      setSuccessData({
        title: 'Proposal Sent Successfully!',
        message: `AI-optimized proposal has been sent to ${proposal.customer.name}.`,
        details: {
          customer: proposal.customer.name,
          opportunity: proposal.opportunity,
          expectedValue: `$${proposal.expectedValue.toLocaleString()}`,
          confidence: `${proposal.confidence}%`,
          agents: ['Customer Intelligence Agent', 'Copywriter Agent', 'Orchestrator Agent']
        }
      });
      
      setShowSuccessModal(true);
    }
    
    setShowApprovalModal(false);
    setApprovalData(null);
  };

  const generateSmartProposal = (customer) => {
    const proposals = {
      upsell: {
        opportunity: 'Premium Feature Upgrade',
        expectedValue: customer.lifetime_value * 0.3,
        confidence: 85,
        reasoning: 'High-value customer with strong engagement metrics, ideal for premium feature upsell',
        strategy: 'Personalized demonstration with exclusive upgrade offer',
        tactics: [
          'Schedule personalized demo call',
          'Provide exclusive upgrade pricing',
          'Share success stories from similar customers',
          'Offer implementation support and training'
        ]
      },
      'cross-sell': {
        opportunity: 'Additional Product Integration',
        expectedValue: customer.lifetime_value * 0.4,
        confidence: 78,
        reasoning: 'Customer usage patterns suggest strong fit for complementary products',
        strategy: 'Bundle offering with integration support',
        tactics: [
          'Analyze usage patterns for product fit',
          'Create customized bundle proposal',
          'Provide integration roadmap',
          'Offer implementation assistance'
        ]
      },
      expansion: {
        opportunity: 'Enterprise Plan Upgrade',
        expectedValue: customer.lifetime_value * 0.6,
        confidence: 72,
        reasoning: 'Growing usage indicates need for enterprise-level features',
        strategy: 'Enterprise value proposition with ROI demonstration',
        tactics: [
          'Conduct needs assessment call',
          'Prepare ROI analysis and business case',
          'Arrange executive presentation',
          'Provide migration support plan'
        ]
      }
    };

    // Determine best opportunity type based on customer data
    let opportunityType = 'upsell';
    if (customer.lifetime_value > 15000) opportunityType = 'expansion';
    else if (customer.engagement_score > 70) opportunityType = 'cross-sell';

    return {
      ...proposals[opportunityType],
      opportunityType,
      customer: customer
    };
  };

  const handleSendProposal = (customer) => {
    const proposal = generateSmartProposal(customer);
    
    setProposalData(proposal);
    setShowProposalModal(true);
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
          {allCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-900">{campaign.name}</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  (campaignStatuses[campaign.id] || campaign.status) === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                }`}>
                  {campaignStatuses[campaign.id] || campaign.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4 flex-grow">
                <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
                
                <div className="space-y-2">
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
              </div>
              
              <div className="flex items-center space-x-2 mt-auto">
                <button
                  onClick={() => handleExecuteCampaign(campaign)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Execute
                </button>
                <button
                  onClick={() => handleEditCampaign(campaign)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePlayPauseToggle(campaign)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {(campaignStatuses[campaign.id] || campaign.status) === 'active' ? 
                    <Pause className="w-4 h-4" /> : 
                    <Play className="w-4 h-4" />
                  }
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Revenue Opportunities List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Revenue Opportunities</h4>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
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
                        onClick={() => handleSendProposal(opportunity)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Segment *</label>
                  <select 
                    value={campaignForm.targetSegment}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, targetSegment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select target segment</option>
                    <option value="VIP Customers">VIP Customers</option>
                    <option value="Recent Buyers">Recent Buyers</option>
                    <option value="Subscription Users">Subscription Users</option>
                    <option value="High-Value Prospects">High-Value Prospects</option>
                    <option value="At-Risk Customers">At-Risk Customers</option>
                  </select>
                </div>

                {/* AI Create Campaign Button */}
                {campaignForm.targetSegment && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Brain className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">AI-Powered Campaign Generation</h4>
                          <p className="text-sm text-gray-600">Let the Customer Intelligence Agent create an optimized campaign for this segment</p>
                        </div>
                      </div>
                      <button
                        onClick={handleAICreateCampaign}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Let AI Create Campaign
                      </button>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Premium Feature Upsell"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the campaign's purpose and goals"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        campaignForm.campaignType === 'upsell' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-500'
                      }`}
                      onClick={() => setCampaignForm(prev => ({ ...prev, campaignType: 'upsell' }))}
                    >
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Upsell</span>
                        {campaignForm.campaignType === 'upsell' && <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />}
                      </div>
                      <p className="text-sm text-gray-600">Upgrade existing customers</p>
                    </div>
                    <div 
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        campaignForm.campaignType === 'cross-sell' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-500'
                      }`}
                      onClick={() => setCampaignForm(prev => ({ ...prev, campaignType: 'cross-sell' }))}
                    >
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Cross-sell</span>
                        {campaignForm.campaignType === 'cross-sell' && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
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
                  onClick={handleCampaignSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
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

      {/* Approval Modal */}
      {showApprovalModal && approvalData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowApprovalModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Please Review Before Proceeding</h3>
                    <p className="text-sm text-gray-600">Review the execution plan and approve the action</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {approvalData.action === 'execute_campaign' && (
                  <>
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Play className="w-5 h-5 mr-2 text-green-600" />
                        Campaign Execution Plan
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Campaign:</span>
                          <span className="ml-2 text-sm text-gray-900">{approvalData.campaign.name}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Target Segment:</span>
                          <span className="ml-2 text-sm text-gray-900">{approvalData.campaign.targetSegment}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Expected Revenue:</span>
                          <span className="ml-2 text-sm text-green-600 font-medium">${approvalData.campaign.expectedRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-blue-600" />
                        Execution Strategy
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Strategy:</span>
                          <p className="text-sm text-gray-900 mt-1">{approvalData.executionPlan.strategy}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Approach:</span>
                          <p className="text-sm text-gray-900 mt-1">{approvalData.executionPlan.approach}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Timeline:</span>
                          <span className="ml-2 text-sm text-gray-900">{approvalData.executionPlan.timeline}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-600" />
                        Agent Workflow
                      </h4>
                      <div className="space-y-2">
                        {approvalData.executionPlan.agents.map((agent, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                            <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <p className="text-sm text-gray-700">{agent}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {approvalData.action === 'send_proposal' && (
                  <>
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Send className="w-5 h-5 mr-2 text-green-600" />
                        Proposal Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Customer:</span>
                          <span className="ml-2 text-sm text-gray-900">{approvalData.proposal.customer.name}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Opportunity:</span>
                          <span className="ml-2 text-sm text-gray-900">{approvalData.proposal.opportunity}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Expected Value:</span>
                          <span className="ml-2 text-sm text-green-600 font-medium">${approvalData.proposal.expectedValue.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Confidence:</span>
                          <span className="ml-2 text-sm text-blue-600 font-medium">{approvalData.proposal.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-600" />
                        AI Reasoning
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700">{approvalData.proposal.reasoning}</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">What happens next?</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Once approved, the agents will autonomously execute this action with full transparency. 
                        You can monitor progress in the Content Dashboard under the Campaigns tab.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproval}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve and Continue
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{successData.title}</h3>
                    <p className="text-sm text-gray-600">{successData.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-3">Execution Details</h4>
                  <div className="space-y-2">
                    {Object.entries(successData.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-sm text-gray-900">{Array.isArray(value) ? value.join(', ') : value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Next Steps</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        The action has been queued for execution. You can monitor progress and results in the Content Dashboard under the Campaigns tab.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Proposal Modal */}
      {showProposalModal && proposalData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowProposalModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Send className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">AI-Optimized Proposal</h3>
                    <p className="text-sm text-gray-600">Review the personalized proposal before sending</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-green-600" />
                    Customer Profile
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Name:</span>
                      <span className="ml-2 text-sm text-gray-900">{proposalData.customer.name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-sm text-gray-900">{proposalData.customer.email}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Lifetime Value:</span>
                      <span className="ml-2 text-sm text-green-600 font-medium">${proposalData.customer.lifetime_value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-600" />
                    AI-Generated Recommendation
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Opportunity:</span>
                      <p className="text-sm text-gray-900 mt-1">{proposalData.opportunity}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Expected Value:</span>
                      <span className="ml-2 text-sm text-green-600 font-medium">${proposalData.expectedValue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Confidence Score:</span>
                      <span className="ml-2 text-sm text-blue-600 font-medium">{proposalData.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Reasoning:</span>
                      <p className="text-sm text-gray-700 mt-1">{proposalData.reasoning}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-600" />
                    Execution Plan
                  </h4>
                  <div className="space-y-2">
                    {proposalData.tactics.map((tactic, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700">{tactic}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">What happens next?</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Once approved, the Customer Intelligence Agent and Copywriter Agent will create and send 
                        a personalized proposal email to this customer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setApprovalData({
                      action: 'send_proposal',
                      proposal: proposalData
                    });
                    setShowProposalModal(false);
                    setShowApprovalModal(true);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Proposal
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
