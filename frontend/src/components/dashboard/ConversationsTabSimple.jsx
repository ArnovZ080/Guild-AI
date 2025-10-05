import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Archive } from 'lucide-react';
import { fetchConversations as fetchConversationsApi } from '../../services/conversationsApi.js';

const ConversationsTabSimple = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
    </div>
  );
};

export default ConversationsTabSimple;
