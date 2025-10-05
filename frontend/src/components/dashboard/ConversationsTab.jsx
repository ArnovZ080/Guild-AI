import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Search, 
  Filter, 
  Eye, 
  Reply, 
  Archive,
  Star,
  Clock,
  User,
  Bot,
  Mic,
  Video,
  FileText,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Download,
  DollarSign,
  Zap,
  Bell,
  BarChart3,
  Activity,
  TrendingUp,
  Users,
  MessageCircle,
  Headphones,
  Mail as MailIcon,
  Smartphone
} from 'lucide-react';
import CustomerDetailModal from './modals/CustomerDetailModal.jsx';
import AgentInsightsModal from './modals/AgentInsightsModal.jsx';
import { fetchConversations as fetchConversationsApi, getConversationAnalytics, getAgentInsights } from '../../services/conversationsApi.js';

// Mock conversation data
const mockConversations = [
  {
    id: '1',
    type: 'email',
    subject: 'Product Demo Request - TechCorp Solutions',
    participants: [
      { name: 'Sarah Johnson', email: 'sarah.johnson@techcorp.com', role: 'customer' },
      { name: 'Sales Agent', email: 'sales@guild-ai.com', role: 'agent' }
    ],
    status: 'active',
    priority: 'high',
    lastMessage: 'Looking forward to the demo next week. Please send calendar invite.',
    lastActivity: new Date(2024, 0, 12, 14, 30),
    createdAt: new Date(2024, 0, 8, 10, 15),
    messageCount: 8,
    tags: ['demo', 'enterprise', 'hot-lead'],
    agentType: 'sales',
    customerId: '1',
    summary: 'Customer interested in enterprise package. Demo scheduled for next week.',
    sentiment: 'positive',
    nextAction: 'Send calendar invite and demo materials',
    nextActionDate: new Date(2024, 0, 15),
    estimatedValue: 50000,
    actualValue: 0
  },
  {
    id: '2',
    type: 'voice',
    subject: 'Support Call - Account Issues',
    participants: [
      { name: 'Michael Chen', email: 'michael@growthmarketing.com', role: 'customer' },
      { name: 'Support Agent', email: 'support@guild-ai.com', role: 'agent' }
    ],
    status: 'resolved',
    priority: 'medium',
    lastMessage: 'Issue resolved. Customer satisfied with solution.',
    lastActivity: new Date(2024, 0, 11, 16, 45),
    createdAt: new Date(2024, 0, 11, 15, 20),
    messageCount: 1,
    tags: ['support', 'resolved', 'billing'],
    agentType: 'support',
    customerId: '2',
    summary: 'Customer had billing issues. Resolved by updating payment method.',
    sentiment: 'neutral',
    duration: 15, // minutes
    recordingUrl: '/recordings/call_20240111_1520.mp3',
    estimatedValue: 0,
    actualValue: 0
  },
  {
    id: '3',
    type: 'chat',
    subject: 'Website Chat - Pricing Inquiry',
    participants: [
      { name: 'Emily Rodriguez', email: 'emily@startupxyz.com', role: 'customer' },
      { name: 'Chat Agent', email: 'chat@guild-ai.com', role: 'agent' }
    ],
    status: 'active',
    priority: 'medium',
    lastMessage: 'Can you send me more information about the startup package?',
    lastActivity: new Date(2024, 0, 12, 11, 20),
    createdAt: new Date(2024, 0, 12, 11, 15),
    messageCount: 12,
    tags: ['pricing', 'startup', 'inquiry'],
    agentType: 'chat',
    customerId: '3',
    summary: 'Startup founder inquiring about pricing. Interested in basic package.',
    sentiment: 'positive',
    nextAction: 'Send pricing information and schedule follow-up call',
    nextActionDate: new Date(2024, 0, 13),
    estimatedValue: 5000,
    actualValue: 0
  },
  {
    id: '4',
    type: 'social',
    subject: 'LinkedIn DM - Partnership Opportunity',
    participants: [
      { name: 'David Kim', email: 'david.kim@enterprise.com', role: 'customer' },
      { name: 'Partnership Agent', email: 'partnerships@guild-ai.com', role: 'agent' }
    ],
    status: 'active',
    priority: 'high',
    lastMessage: 'Would love to discuss a potential partnership. When can we meet?',
    lastActivity: new Date(2024, 0, 10, 9, 30),
    createdAt: new Date(2024, 0, 10, 9, 25),
    messageCount: 6,
    tags: ['partnership', 'linkedin', 'enterprise'],
    agentType: 'partnerships',
    customerId: '4',
    summary: 'Enterprise client interested in partnership opportunities.',
    sentiment: 'positive',
    nextAction: 'Schedule partnership meeting',
    nextActionDate: new Date(2024, 0, 16),
    estimatedValue: 100000,
    actualValue: 0
  },
  {
    id: '5',
    type: 'email',
    subject: 'Newsletter Subscription - Welcome Series',
    participants: [
      { name: 'Newsletter Subscriber', email: 'subscriber@example.com', role: 'customer' },
      { name: 'Email Agent', email: 'email@guild-ai.com', role: 'agent' }
    ],
    status: 'automated',
    priority: 'low',
    lastMessage: 'Welcome to our newsletter! Here are some tips to get started...',
    lastActivity: new Date(2024, 0, 12, 8, 0),
    createdAt: new Date(2024, 0, 12, 8, 0),
    messageCount: 1,
    tags: ['newsletter', 'automated', 'welcome'],
    agentType: 'email',
    customerId: null,
    summary: 'Automated welcome email sent to new newsletter subscriber.',
    sentiment: 'positive',
    campaign: 'Welcome Series'
  }
];

const ConversationsTab = ({ hiredAgents = [] }) => {
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterValueRange, setFilterValueRange] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [isLoading, setIsLoading] = useState(false);
  const [showAgentInsights, setShowAgentInsights] = useState(false);

  // Fetch conversations from agents
  useEffect(() => {
    fetchConversations();
  }, []);

  // Refetch conversations when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchConversations();
    }, 300); // Debounce filter changes

    return () => clearTimeout(timeoutId);
  }, [filterType, filterStatus, filterAgent, filterPriority, filterValueRange, filterDateRange, searchTerm]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      // Fetch conversations from all connected agents
      const filters = {
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        agent: filterAgent !== 'all' ? filterAgent : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
        search: searchTerm || undefined
      };

      const conversationsData = await fetchConversationsApi(filters);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Fallback to mock data
      setConversations(mockConversations);
    } finally {
      setIsLoading(false);
    }
  };

  // Customer modal handlers
  const handleCustomerClick = (customer) => {
    setSelectedConversation(customer); // Reusing the same state for customer
    setShowConversationModal(true);
  };

  const handleReply = (conversation) => {
    console.log('Replying to conversation:', conversation.id);
    // In real implementation, this would open a reply form
  };

  const handleStar = (conversation) => {
    console.log('Starring conversation:', conversation.id);
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, starred: !conv.starred }
        : conv
    ));
  };

  const handleArchive = (conversation) => {
    console.log('Archiving conversation:', conversation.id);
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, status: 'archived' }
        : conv
    ));
    setShowConversationModal(false);
  };

  // Orchestrate action handler
  const handleOrchestrateAction = async (actionData) => {
    console.log('Orchestrating action:', actionData);

    try {
      // In real implementation, this would call the orchestrator_agent.py
      const response = await fetch('/api/orchestrator/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: actionData.action,
          type: actionData.type || 'customer_action',
          data: actionData
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Orchestration result:', result);
        // Refresh conversations after action
        fetchConversations();
      } else {
        console.error('Failed to orchestrate action');
      }
    } catch (error) {
      console.error('Error orchestrating action:', error);
    }
  };

  // Initiate action handler for customers
  const handleInitiateAction = async (customer) => {
    console.log('Initiating action for customer:', customer.name);
    
    const actionData = {
      type: 'customer_action',
      action: `Initiate comprehensive customer engagement for ${customer.name}`,
      customer: customer,
      priority: customer.priority,
      value: customer.totalValue,
      sentiment: customer.sentiment
    };

    await handleOrchestrateAction(actionData);
  };


  // Get customer data and filter
  const customerData = getCustomerData();
  const filteredCustomers = customerData
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || customer.channels.includes(filterType);
      const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
      const matchesAgent = filterAgent === 'all' || customer.agents.includes(filterAgent);
      const matchesPriority = filterPriority === 'all' || customer.priority === filterPriority;
      
      // Value range filter
      const matchesValue = (() => {
        if (filterValueRange === 'all') return true;
        const value = customer.totalValue || 0;
        switch (filterValueRange) {
          case 'high': return value >= 50000;
          case 'medium': return value >= 10000 && value < 50000;
          case 'low': return value > 0 && value < 10000;
          case 'none': return value === 0;
          default: return true;
        }
      })();
      
      // Date range filter
      const matchesDate = (() => {
        if (filterDateRange === 'all') return true;
        const now = new Date();
        const lastActivity = new Date(customer.lastActivity);
        const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
        
        switch (filterDateRange) {
          case 'today': return daysDiff === 0;
          case 'week': return daysDiff <= 7;
          case 'month': return daysDiff <= 30;
          case 'older': return daysDiff > 30;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesType && matchesStatus && matchesAgent && matchesPriority && matchesValue && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'lastActivity':
          return new Date(b.lastActivity) - new Date(a.lastActivity);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'messageCount':
          return b.messageCount - a.messageCount;
        case 'value':
          return b.totalValue - a.totalValue;
        case 'urgency':
          // Sort by priority first, then by date
          const priorityOrder2 = { high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder2[b.priority] - priorityOrder2[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(b.lastActivity) - new Date(a.lastActivity);
        default:
          return 0;
      }
    });

  // Get conversation type styling
  const getTypeStyle = (type) => {
    const styles = {
      email: 'bg-blue-100 text-blue-800 border-blue-200',
      voice: 'bg-green-100 text-green-800 border-green-200',
      chat: 'bg-purple-100 text-purple-800 border-purple-200',
      social: 'bg-pink-100 text-pink-800 border-pink-200',
      sms: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return styles[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get status styling
  const getStatusStyle = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      resolved: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      automated: 'bg-gray-100 text-gray-800',
      archived: 'bg-gray-100 text-gray-600'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // Get priority styling
  const getPriorityStyle = (priority) => {
    const styles = {
      high: 'border-l-4 border-red-500',
      medium: 'border-l-4 border-yellow-500',
      low: 'border-l-4 border-green-500'
    };
    return styles[priority] || 'border-l-4 border-gray-500';
  };

  // Get type icon
  const getTypeIcon = (type) => {
    const icons = {
      email: Mail,
      voice: Phone,
      chat: MessageSquare,
      social: MessageSquare,
      sms: MessageSquare
    };
    return icons[type] || MessageSquare;
  };

  // Get sentiment styling
  const getSentimentStyle = (sentiment) => {
    const styles = {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-600'
    };
    return styles[sentiment] || 'text-gray-600';
  };

  // Customer card component
  const CustomerCard = ({ customer }) => {
    const getSentimentStyle = (sentiment) => {
      const styles = {
        positive: 'text-green-600',
        negative: 'text-red-600',
        neutral: 'text-gray-600'
      };
      return styles[sentiment] || 'text-gray-600';
    };

    const getChannelIcons = (channels) => {
      const icons = {
        email: MailIcon,
        voice: Phone,
        chat: MessageSquare,
        social: MessageCircle,
        sms: Smartphone
      };
      return channels.slice(0, 3).map(channel => {
        const Icon = icons[channel] || MessageSquare;
        return (
          <div key={channel} className={`p-1 rounded ${getTypeStyle(channel)}`}>
            <Icon className="w-3 h-3" />
          </div>
        );
      });
    };
    
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border ${getPriorityStyle(customer.priority)} cursor-pointer hover:shadow-md transition-shadow`}
        onClick={() => handleCustomerClick(customer)}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {customer.name[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600">{customer.email}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{customer.conversationCount} conversations</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(customer.status)}`}>
                {customer.status}
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSentimentStyle(customer.sentiment)}`}>
                {customer.sentiment}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <span>Channels: {customer.channels.join(', ')}</span>
              <span>Agents: {customer.agents.join(', ')}</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              {getChannelIcons(customer.channels)}
              {customer.channels.length > 3 && (
                <span className="text-xs text-gray-500">+{customer.channels.length - 3} more</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(customer.lastActivity).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{customer.messageCount} messages</span>
              </div>
              {customer.totalValue > 0 && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium text-green-600">
                    ${customer.totalValue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {customer.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
              {customer.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{customer.tags.length - 2}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };


  // Group conversations by customer
  const getCustomerData = () => {
    if (!conversations || !Array.isArray(conversations)) {
      return [];
    }

    const customerMap = new Map();

    conversations.forEach(conversation => {
      const customer = conversation.participants.find(p => p.role === 'customer');
      if (!customer || !customer.email) return;

      const customerKey = customer.email;
      
      if (!customerMap.has(customerKey)) {
        customerMap.set(customerKey, {
          id: customerKey,
          name: customer.name,
          email: customer.email,
          conversations: [],
          totalValue: 0,
          lastActivity: conversation.lastActivity,
          status: conversation.status,
          priority: conversation.priority,
          tags: new Set(),
          agents: new Set(),
          channels: new Set(),
          sentiment: conversation.sentiment,
          messageCount: 0,
          createdAt: conversation.createdAt
        });
      }

      const customerData = customerMap.get(customerKey);
      customerData.conversations.push(conversation);
      customerData.totalValue += (conversation.estimatedValue || conversation.actualValue || 0);
      customerData.messageCount += conversation.messageCount;
      
      // Update last activity
      if (new Date(conversation.lastActivity) > new Date(customerData.lastActivity)) {
        customerData.lastActivity = conversation.lastActivity;
        customerData.status = conversation.status;
        customerData.priority = conversation.priority;
        customerData.sentiment = conversation.sentiment;
      }

      // Collect tags, agents, and channels
      conversation.tags.forEach(tag => customerData.tags.add(tag));
      customerData.agents.add(conversation.agentType);
      customerData.channels.add(conversation.type);
    });

    // Convert to array and format data
    return Array.from(customerMap.values()).map(customer => ({
      ...customer,
      tags: Array.from(customer.tags),
      agents: Array.from(customer.agents),
      channels: Array.from(customer.channels),
      conversationCount: customer.conversations.length,
      avgSentiment: customer.conversations.reduce((sum, conv) => {
        const sentimentScores = { positive: 1, neutral: 0.5, negative: 0 };
        return sum + (sentimentScores[conv.sentiment] || 0.5);
      }, 0) / customer.conversations.length
    }));
  };

  // Get conversation analytics
  const getConversationAnalytics = () => {
    if (!conversations || !Array.isArray(conversations)) {
      return { total: 0, active: 0, resolved: 0, automated: 0, highValue: 0, recent: 0 };
    }
    
    const total = conversations.length;
    const active = conversations.filter(c => c.status === 'active').length;
    const resolved = conversations.filter(c => c.status === 'resolved').length;
    const automated = conversations.filter(c => c.status === 'automated').length;
    const highValue = conversations.filter(c => (c.estimatedValue || c.actualValue || 0) >= 50000).length;
    const recent = conversations.filter(c => {
      const daysDiff = Math.floor((new Date() - new Date(c.lastActivity)) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    }).length;

    return { total, active, resolved, automated, highValue, recent };
  };

  const analytics = getConversationAnalytics();

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 text-purple-500 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Conversations Dashboard</h3>
              <p className="text-sm text-gray-600">Unified inbox for all customer communications across channels</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Top Row: Agent Insights, Refresh */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Agent Insights Button */}
              <button 
                onClick={() => setShowAgentInsights(!showAgentInsights)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center"
              >
                <Bot className="w-4 h-4 mr-2" />
                Agent Insights
              </button>

              {/* Refresh Data Button */}
              <button 
                onClick={fetchConversations}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Activity className="w-4 h-4 mr-2" />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Summary - Always Visible */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
              Conversation Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.total}
                </div>
                <div className="text-sm text-gray-600">Total Conversations</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.active}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.resolved}
                </div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {analytics.automated}
                </div>
                <div className="text-sm text-gray-600">Automated</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  {analytics.highValue}
                </div>
                <div className="text-sm text-gray-600">High Value</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.recent}
                </div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
            </div>
          </div>

        {/* Agent Insights Section */}
        {showAgentInsights && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bot className="w-5 h-5 text-green-500 mr-2" />
              Agent Transparency & Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Bot className="w-4 h-4 mr-2 text-blue-500" />
                  Customer Intelligence Agent
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  Monitoring customer sentiment and engagement across all channels. 
                  Identified {analytics.active} active conversations requiring attention.
                </p>
                <div className="text-xs text-gray-500">
                  Status: Active • Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Bot className="w-4 h-4 mr-2 text-green-500" />
                  Business Intelligence Agent
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  Analyzing conversation patterns and customer journey touchpoints. 
                  {analytics.highValue > 0 ? `Found ${analytics.highValue} high-value opportunities.` : 'No high-value opportunities detected.'}
                </p>
                <div className="text-xs text-gray-500">
                  Status: Active • Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Bot className="w-4 h-4 mr-2 text-purple-500" />
                  Content Intelligence Agent
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  Managing automated campaigns and content distribution. 
                  {analytics.automated} automated conversations processed this week.
                </p>
                <div className="text-xs text-gray-500">
                  Status: Active • Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Types</option>
            <option value="email">Email</option>
            <option value="voice">Voice</option>
            <option value="chat">Chat</option>
            <option value="social">Social</option>
            <option value="sms">SMS</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="pending">Pending</option>
            <option value="automated">Automated</option>
            <option value="archived">Archived</option>
          </select>

          {/* Agent Filter */}
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Agents</option>
            <option value="sales">Sales</option>
            <option value="support">Support</option>
            <option value="chat">Chat</option>
            <option value="partnerships">Partnerships</option>
            <option value="email">Email</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Value Range Filter */}
          <select
            value={filterValueRange}
            onChange={(e) => setFilterValueRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Values</option>
            <option value="high">High Value ($50K+)</option>
            <option value="medium">Medium Value ($10K-$50K)</option>
            <option value="low">Low Value ($1K-$10K)</option>
            <option value="none">No Value</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="older">Older</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="lastActivity">Last Activity</option>
            <option value="created">Created Date</option>
            <option value="priority">Priority</option>
            <option value="value">Monetary Value</option>
            <option value="urgency">Urgency (Priority + Date)</option>
            <option value="messageCount">Message Count</option>
          </select>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredCustomers.length} of {customerData.length} customers
          {isLoading && <span className="ml-2 text-blue-600">(Loading...)</span>}
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {filteredCustomers.map(customer => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>

      {/* Customer Detail Modal */}
      {showConversationModal && selectedConversation && (
        <CustomerDetailModal
          customer={selectedConversation}
          onClose={() => {
            setShowConversationModal(false);
            setSelectedConversation(null);
          }}
          onReply={handleReply}
          onStar={handleStar}
          onArchive={handleArchive}
          onPlayRecording={(recordingUrl) => {
            console.log('Playing recording:', recordingUrl);
          }}
          onDownloadRecording={(recordingUrl) => {
            console.log('Downloading recording:', recordingUrl);
          }}
          onInitiateAction={handleInitiateAction}
          onOrchestrateAction={handleOrchestrateAction}
        />
      )}

      {/* Agent Insights Modal */}
      {showAgentInsights && (
        <AgentInsightsModal
          onClose={() => setShowAgentInsights(false)}
          onOrchestrateAction={handleOrchestrateAction}
          conversations={conversations}
        />
      )}
    </div>
  );
};

export default ConversationsTab;
