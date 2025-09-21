import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Filter, Clock, User, Bot, Send } from 'lucide-react';

const ConversationsView = () => {
  const [conversations] = useState([
    {
      id: '1',
      customer: 'Sarah Johnson',
      company: 'TechStartup Inc.',
      lastMessage: 'Thanks for the demo, I\'m interested in the enterprise plan.',
      timestamp: new Date(2024, 0, 15, 14, 30),
      status: 'active',
      agent: 'sales'
    },
    {
      id: '2',
      customer: 'Mike Chen',
      company: 'Innovate Co.',
      lastMessage: 'Can you send me more information about pricing?',
      timestamp: new Date(2024, 0, 15, 12, 15),
      status: 'pending',
      agent: 'support'
    },
    {
      id: '3',
      customer: 'Emily Rodriguez',
      company: 'Growth Labs',
      lastMessage: 'The integration was successful, thank you!',
      timestamp: new Date(2024, 0, 14, 16, 45),
      status: 'resolved',
      agent: 'technical'
    }
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
          <p className="text-gray-600">Manage customer conversations and support tickets</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {conversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{conversation.customer}</h3>
                      <p className="text-sm text-gray-600">{conversation.company}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{conversation.lastMessage}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {conversation.timestamp.toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      conversation.status === 'active' ? 'bg-green-100 text-green-800' :
                      conversation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {conversation.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Bot className="w-4 h-4 mr-1" />
                    {conversation.agent}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
              <MessageSquare className="w-5 h-5 text-blue-600 mb-2" />
              <div className="font-medium">Start New Conversation</div>
              <div className="text-sm text-gray-600">Begin a new customer interaction</div>
            </button>
            <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
              <Send className="w-5 h-5 text-green-600 mb-2" />
              <div className="font-medium">Send Follow-up</div>
              <div className="text-sm text-gray-600">Reach out to pending customers</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationsView;
