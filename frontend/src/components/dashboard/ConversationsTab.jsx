import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Archive, Bot, Search, Filter } from 'lucide-react';
import { fetchConversations as fetchConversationsApi } from '../../services/conversationsApi.js';
import CustomerDetailModal from './modals/CustomerDetailModal.jsx';
import AgentInsightsModal from './modals/AgentInsightsModal.jsx';
import ComposeEmailModal from './modals/ComposeEmailModal.jsx';
import MessageComposeModal from './modals/MessageComposeModal.jsx';
import CustomerProfileModal from './modals/CustomerProfileModal.jsx';

const ConversationsTab = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [starredCustomers, setStarredCustomers] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showAgentInsights, setShowAgentInsights] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterValueRange, setFilterValueRange] = useState('all');
  const [filterStarred, setFilterStarred] = useState('all');

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
      customerData.messageCount += (conversation.messageCount || 0);
      
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
      totalValue: Number(customer.totalValue) || 0, // Ensure totalValue is always a number
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
    const customerId = customer.email || customer.id;
    setStarredCustomers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
        console.log('Unstarred customer:', customer.name);
      } else {
        newSet.add(customerId);
        console.log('Starred customer:', customer.name);
      }
      return newSet;
    });
  };

  const handleArchiveCustomer = (customer) => {
    console.log('Archiving customer:', customer.name);
    // In real implementation, this would remove from current list and archive
    setConversations(prev => prev.filter(conv => 
      !conv.participants.some(p => p.email === customer.email)
    ));
    setShowModal(false);
  };

  const handleViewProfile = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerProfile(true);
    // Close the current customer detail modal
    setShowModal(false);
  };

  const handleReply = (conversation) => {
    setSelectedConversation(conversation);
    if (conversation.type === 'email') {
      setShowEmailModal(true);
    } else {
      setShowMessageModal(true);
    }
  };

  const handleOrchestrateAction = (actionData) => {
    console.log('AI insight action:', actionData);
    // No apply button needed - just insights
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
      
      // Starred filter
      const customerId = customer.email || customer.id;
      const matchesStarred = filterStarred === 'all' || 
                           (filterStarred === 'starred' && starredCustomers.has(customerId)) ||
                           (filterStarred === 'unstarred' && !starredCustomers.has(customerId));
      
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
      
      return matchesSearch && matchesType && matchesStatus && matchesAgent && matchesPriority && matchesStarred && matchesValue;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Messaging</h1>
            <p className="text-gray-600">Unified communications across all channels.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Compose
          </button>
          <button
            onClick={() => setShowAgentInsights(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Bot className="w-4 h-4 mr-2" />
            Analyze Messages
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* AI-Powered Message Analysis Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-purple-600" />
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-purple-900">AI-Powered Message Analysis</h3>
            <p className="text-sm text-purple-700">Priority and sentiment indicators are analyzed by the Customer Intelligence Agent. Hover over indicators to see detailed reasoning and confidence scores.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">Agent Status: Active</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Channels (7)</option>
            <option value="email">Email</option>
            <option value="voice">Voice</option>
            <option value="chat">Chat</option>
            <option value="social">Social</option>
            <option value="sms">SMS</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status (7)</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="pending">Pending</option>
            <option value="automated">Automated</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">3</div>
          <div className="text-red-600 font-medium">Unread</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">3</div>
          <div className="text-blue-600 font-medium">Read</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">1</div>
          <div className="text-green-600 font-medium">Replied</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">3</div>
          <div className="text-purple-600 font-medium">High Priority</div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading conversations...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {getFilteredCustomers().map(customer => (
            <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCustomerClick(customer)}>
              <div className="flex items-start space-x-3">
                {/* Channel Icon */}
                <div className="flex-shrink-0">
                  {customer.channels.includes('email') && (
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {customer.channels.includes('voice') && (
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  )}
                  {customer.channels.includes('chat') && (
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  )}
                  {customer.channels.includes('social') && (
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14l-2-16M9 8v8M15 8v8" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.channels.includes('email') ? 'bg-blue-100 text-blue-800' :
                      customer.channels.includes('voice') ? 'bg-green-100 text-green-800' :
                      customer.channels.includes('chat') ? 'bg-purple-100 text-purple-800' :
                      'bg-pink-100 text-pink-800'
                    }`}>
                      {customer.channels[0]}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      customer.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                  
                  <h5 className="font-medium text-gray-900 mb-1">Product inquiry</h5>
                  <p className="text-sm text-gray-600 mb-2">Thank you for your interest in our product. I would like to know more about the pricing.</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{customer.email}</span>
                      <span>2h ago</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        high
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        positive
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">inquiry</span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">pricing</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
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
          isStarred={starredCustomers.has(selectedCustomer.email || selectedCustomer.id)}
          onClose={() => {
            setShowModal(false);
            setSelectedCustomer(null);
          }}
          onReply={handleReply}
          onStar={handleStarCustomer}
          onArchive={handleArchiveCustomer}
          onViewProfile={handleViewProfile}
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

      {/* Compose Email Modal */}
      {showEmailModal && selectedConversation && (
        <ComposeEmailModal
          open={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedConversation(null);
          }}
          defaultTo={selectedConversation.participants?.find(p => p.role === 'customer')?.email}
          onSent={() => {
            setShowEmailModal(false);
            setSelectedConversation(null);
          }}
        />
      )}

      {/* Message Compose Modal */}
      {showMessageModal && selectedConversation && (
        <MessageComposeModal
          open={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedConversation(null);
          }}
          customer={selectedConversation.participants?.find(p => p.role === 'customer')}
          replyTo={{
            channel: selectedConversation.type,
            platform: selectedConversation.type === 'social' ? 'linkedin' : undefined,
            customer: selectedConversation.participants?.find(p => p.role === 'customer')
          }}
        />
      )}

      {/* Customer Profile Modal */}
      {showCustomerProfile && selectedCustomer && (
        <CustomerProfileModal
          isOpen={showCustomerProfile}
          customer={selectedCustomer}
          onClose={() => {
            setShowCustomerProfile(false);
            setSelectedCustomer(null);
          }}
          onSave={(updatedCustomer) => {
            console.log('Customer updated:', updatedCustomer);
            setSelectedCustomer(updatedCustomer);
          }}
          onAction={(action, data) => {
            console.log('Customer action:', action, data);
          }}
        />
      )}
    </div>
  );
};

export default ConversationsTab;
