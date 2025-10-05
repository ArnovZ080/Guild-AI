import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Archive, Bot } from 'lucide-react';
import { fetchConversations as fetchConversationsApi } from '../../services/conversationsApi.js';
import CustomerDetailModal from './modals/CustomerDetailModal.jsx';
import AgentInsightsModal from './modals/AgentInsightsModal.jsx';

const ConversationsTab = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAgentInsights, setShowAgentInsights] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter customers based on search
  const getFilteredCustomers = () => {
    const customers = getCustomerData();
    if (!searchTerm) return customers;
    
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

            {/* Search */}
        <div className="mt-4">
              <input
                type="text"
            placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
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
          onReply={() => console.log('Reply clicked')}
          onStar={() => console.log('Star clicked')}
          onArchive={() => console.log('Archive clicked')}
          onPlayRecording={() => console.log('Play recording')}
          onDownloadRecording={() => console.log('Download recording')}
          onInitiateAction={() => console.log('Initiate action')}
          onOrchestrateAction={() => console.log('Orchestrate action')}
        />
      )}

      {/* Agent Insights Modal */}
      {showAgentInsights && (
        <AgentInsightsModal
          onClose={() => setShowAgentInsights(false)}
          onOrchestrateAction={() => console.log('Orchestrate action')}
          conversations={conversations}
        />
      )}
    </div>
  );
};

export default ConversationsTab;
