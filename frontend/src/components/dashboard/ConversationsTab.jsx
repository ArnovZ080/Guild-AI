import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Archive, Bot, Search, Filter } from 'lucide-react';
import { fetchConversations as fetchConversationsApi } from '../../services/conversationsApi.js';
import CustomerDetailModal from './modals/CustomerDetailModal.jsx';
import AgentInsightsModal from './modals/AgentInsightsModal.jsx';
import ActionConfirmationModal from './modals/ActionConfirmationModal.jsx';
import StarCustomerModal from './modals/StarCustomerModal.jsx';
import ReplyModal from './modals/ReplyModal.jsx';

const ConversationsTab = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAgentInsights, setShowAgentInsights] = useState(false);
  const [showActionConfirmation, setShowActionConfirmation] = useState(false);
  const [showStarModal, setShowStarModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterValueRange, setFilterValueRange] = useState('all');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchConversationsApi({});
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
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

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleStarCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowStarModal(true);
  };

  const handleArchiveCustomer = (customer) => {
    console.log('Archiving customer:', customer.name);
    // In real implementation, this would remove from current list and archive
    setConversations(prev => prev.filter(conv => 
      !conv.participants.some(p => p.email === customer.email)
    ));
    setShowModal(false);
  };

  const handleReply = (conversation) => {
    setSelectedConversation(conversation);
    setShowReplyModal(true);
  };

  const handleOrchestrateAction = (actionData) => {
    setSelectedInsight(actionData);
    setShowActionConfirmation(true);
  };

  const handleAcceptAction = (actionData) => {
    console.log('Accepting AI action:', actionData);
    // In real implementation, this would call orchestrator_agent.py
    setShowActionConfirmation(false);
    setShowAgentInsights(false);
  };

  const handleRejectAction = () => {
    console.log('Rejecting AI action');
    setShowActionConfirmation(false);
  };

  const handleConfirmStar = (starData) => {
    console.log('Starring customer:', starData);
    // In real implementation, this would call API to star customer and add tags
    setShowStarModal(false);
    setShowModal(false);
  };

  const handleSendReply = (replyData) => {
    console.log('Sending reply:', replyData);
    // In real implementation, this would send the reply through appropriate channel
    setShowReplyModal(false);
  };

  // Filter customers based on search and filters
  const getFilteredCustomers = () => {
    const customers = getCustomerData();
    
    return customers.filter(customer => {
      // Search filter
      const matchesSearch = !searchTerm || 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter (channels)
      const matchesType = filterType === 'all' || customer.channels.includes(filterType);
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
      
      // Agent filter
      const matchesAgent = filterAgent === 'all' || customer.agents.includes(filterAgent);
      
      // Priority filter
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
      
      return matchesSearch && matchesType && matchesStatus && matchesAgent && matchesPriority && matchesValue;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Conversations Dashboard</h3>
            <p className="text-sm text-gray-600">Unified inbox for all customer communications</p>
          </div>
          <button
            onClick={() => setShowAgentInsights(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center"
          >
            <Bot className="w-4 h-4 mr-2" />
            Agent Insights
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 space-y-4">
            {/* Search */}
          <div>
              <input
                type="text"
              placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="voice">Voice</option>
              <option value="chat">Chat</option>
              <option value="social">Social</option>
              <option value="sms">SMS</option>
            </select>

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
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading conversations...</p>
        </div>
      ) : (
      <div className="space-y-4">
          {getFilteredCustomers().map(customer => (
            <div key={customer.id} className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCustomerClick(customer)}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {customer.name[0]}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                  <p className="text-sm text-gray-600">{customer.email} • {customer.conversationCount} conversations</p>
                  <p className="text-sm text-gray-500">Channels: {customer.channels.join(', ')} • Agents: {customer.agents.join(', ')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {customer.status}
                  </span>
                  {customer.totalValue > 0 && (
                    <span className="text-sm font-medium text-green-600">
                      ${customer.totalValue.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
      )}

      {/* Customer Detail Modal */}
      {showModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => {
            setShowModal(false);
            setSelectedCustomer(null);
          }}
          onReply={handleReply}
          onStar={handleStarCustomer}
          onArchive={handleArchiveCustomer}
          onPlayRecording={() => console.log('Play recording')}
          onDownloadRecording={() => console.log('Download recording')}
          onInitiateAction={() => console.log('Initiate action')}
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

      {/* Action Confirmation Modal */}
      {showActionConfirmation && selectedInsight && (
        <ActionConfirmationModal
          insight={selectedInsight.insight}
          onClose={() => {
            setShowActionConfirmation(false);
            setSelectedInsight(null);
          }}
          onAccept={handleAcceptAction}
          onReject={handleRejectAction}
          onEdit={(editedData) => {
            console.log('Edited actions:', editedData);
            setSelectedInsight({ ...selectedInsight, actions: editedData.actions });
          }}
        />
      )}

      {/* Star Customer Modal */}
      {showStarModal && selectedCustomer && (
        <StarCustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setShowStarModal(false);
            setSelectedCustomer(null);
          }}
          onConfirm={handleConfirmStar}
        />
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedConversation && (
        <ReplyModal
          conversation={selectedConversation}
          onClose={() => {
            setShowReplyModal(false);
            setSelectedConversation(null);
          }}
          onSend={handleSendReply}
        />
      )}
    </div>
  );
};

export default ConversationsTab;
