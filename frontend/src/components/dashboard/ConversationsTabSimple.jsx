import React, { useState, useEffect } from 'react';

const ConversationsTabSimple = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      // Simple mock data without dates
      const mockData = [
        {
          id: '1',
          type: 'email',
          subject: 'Product Demo Request',
          status: 'active',
          priority: 'high',
          participants: [
            { name: 'Sarah Johnson', email: 'sarah@example.com', role: 'customer' }
          ]
        }
      ];
      setConversations(mockData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900">Conversations Dashboard</h3>
        <p className="text-sm text-gray-600">Unified inbox for all customer communications</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading conversations...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map(conversation => (
            <div key={conversation.id} className="bg-white rounded-lg shadow-sm border p-4">
              <h4 className="font-semibold text-gray-900">{conversation.subject}</h4>
              <p className="text-sm text-gray-600">{conversation.type} • {conversation.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationsTabSimple;
