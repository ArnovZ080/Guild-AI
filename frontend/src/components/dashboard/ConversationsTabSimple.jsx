import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Archive, Bot } from 'lucide-react';
import { fetchConversations as fetchConversationsApi } from '../../services/conversationsApi.js';
import CustomerDetailModal from './modals/CustomerDetailModal.jsx';
import AgentInsightsModal from './modals/AgentInsightsModal.jsx';

const ConversationsTabSimple = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAgentInsights, setShowAgentInsights] = useState(false);

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

  const handleCustomerClick = (conversation) => {
    // Create a simple customer object from conversation
    const customer = {
      id: conversation.id,
      name: conversation.participants?.[0]?.name || 'Unknown Customer',
      email: conversation.participants?.[0]?.email || 'unknown@example.com',
      conversations: [conversation],
      totalValue: conversation.estimatedValue || 0,
      lastActivity: conversation.lastActivity,
      status: conversation.status,
      priority: conversation.priority,
      tags: conversation.tags || [],
      agents: [conversation.agentType || 'unknown'],
      channels: [conversation.type],
      sentiment: conversation.sentiment || 'neutral',
      messageCount: conversation.messageCount || 0,
      createdAt: conversation.createdAt,
      conversationCount: 1,
      avgSentiment: 0.5
    };
    
    setSelectedCustomer(customer);
    setShowModal(true);
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
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading conversations...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map(conversation => (
            <div key={conversation.id} className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCustomerClick(conversation)}>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{conversation.subject}</h4>
                  <p className="text-sm text-gray-600">{conversation.type} • {conversation.status}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Star className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Archive className="w-4 h-4 text-gray-500" />
                  </button>
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

export default ConversationsTabSimple;
