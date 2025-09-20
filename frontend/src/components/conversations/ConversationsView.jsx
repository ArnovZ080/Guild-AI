import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations.fixed';

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

const ConversationsView = () => {
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
  const { triggerCelebration } = useCelebrations();

  // Conversation modal handlers
  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setShowConversationModal(true);
  };

  const handleReply = (conversation) => {
    console.log('Replying to conversation:', conversation.id);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Replying to: ${conversation.subject} 💬`,
      intensity: 'normal'
    });
    // In real implementation, this would open a reply form
  };

  const handleStar = (conversation) => {
    console.log('Starring conversation:', conversation.id);
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, starred: !conv.starred }
        : conv
    ));
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: conversation.starred ? 'Unstarred conversation' : 'Starred conversation ⭐',
      intensity: 'normal'
    });
  };

  const handleArchive = (conversation) => {
    console.log('Archiving conversation:', conversation.id);
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, status: 'archived' }
        : conv
    ));
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Archived: ${conversation.subject} 📁`,
      intensity: 'normal'
    });
    setShowConversationModal(false);
  };


  // Filter and sort conversations
  const filteredConversations = conversations
    .filter(conversation => {
      const matchesSearch = conversation.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           conversation.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || conversation.type === filterType;
      const matchesStatus = filterStatus === 'all' || conversation.status === filterStatus;
      const matchesAgent = filterAgent === 'all' || conversation.agentType === filterAgent;
      const matchesPriority = filterPriority === 'all' || conversation.priority === filterPriority;
      
      // Value range filter
      const matchesValue = (() => {
        if (filterValueRange === 'all') return true;
        const value = conversation.estimatedValue || conversation.actualValue || 0;
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
        const conversationDate = new Date(conversation.lastActivity);
        const daysDiff = Math.floor((now - conversationDate) / (1000 * 60 * 60 * 24));
        
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
          const aValue = a.estimatedValue || a.actualValue || 0;
          const bValue = b.estimatedValue || b.actualValue || 0;
          return bValue - aValue;
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

  // Conversation list item
  const ConversationItem = ({ conversation }) => {
    const TypeIcon = getTypeIcon(conversation.type);
    
    return (
      <motion.div
        className={`bg-white rounded-lg shadow-sm border ${getPriorityStyle(conversation.priority)} cursor-pointer hover:shadow-md transition-shadow`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getTypeStyle(conversation.type)}`}>
                <TypeIcon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{conversation.subject}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600">
                    {conversation.participants.find(p => p.role === 'customer')?.name}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {conversation.participants.find(p => p.role === 'agent')?.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(conversation.status)}`}>
                {conversation.status}
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeStyle(conversation.type)}`}>
                {conversation.type}
              </span>
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{conversation.lastMessage}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{conversation.lastActivity.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{conversation.messageCount} messages</span>
              </div>
              {(conversation.estimatedValue || conversation.actualValue) && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium text-green-600">
                    ${(conversation.estimatedValue || conversation.actualValue || 0).toLocaleString()}
                  </span>
                </div>
              )}
              {conversation.duration && (
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>{conversation.duration}min</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {conversation.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
              {conversation.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{conversation.tags.length - 2}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Conversation detail modal
  const ConversationDetailModal = () => {
    if (!selectedConversation) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getTypeStyle(selectedConversation.type)}`}>
                  {React.createElement(getTypeIcon(selectedConversation.type), { className: "w-6 h-6" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedConversation.subject}</h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(selectedConversation.status)}`}>
                      {selectedConversation.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeStyle(selectedConversation.type)}`}>
                      {selectedConversation.type}
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedConversation.messageCount} messages
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Conversation Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Conversation Summary</h3>
                  <p className="text-gray-700 mb-4">{selectedConversation.summary}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Sentiment:</span>
                      <span className={`text-sm font-medium ${getSentimentStyle(selectedConversation.sentiment)}`}>
                        {selectedConversation.sentiment}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Agent:</span>
                      <span className="text-sm font-medium">{selectedConversation.agentType}</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Messages</h3>
                  <div className="space-y-4">
                    {/* Mock messages */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                        {selectedConversation.participants.find(p => p.role === 'customer')?.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-gray-900">Hello, I'm interested in learning more about your product.</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedConversation.createdAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="flex-1 text-right">
                        <div className="bg-blue-500 text-white rounded-lg p-3 inline-block">
                          <p>Thank you for your interest! I'd be happy to help you learn more about our product.</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedConversation.lastActivity.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voice Recording (if applicable) */}
                {selectedConversation.type === 'voice' && selectedConversation.recordingUrl && (
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Call Recording</h3>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        <Play className="w-4 h-4" />
                        <span>Play Recording</span>
                      </button>
                      <button className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <span className="text-sm text-gray-600">
                        Duration: {selectedConversation.duration} minutes
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Participants */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Participants</h3>
                  <div className="space-y-3">
                    {selectedConversation.participants.map((participant, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                          participant.role === 'customer' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {participant.role === 'agent' ? <Bot className="w-4 h-4" /> : participant.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{participant.name}</div>
                          <div className="text-sm text-gray-600">{participant.email}</div>
                          <div className="text-xs text-gray-500 capitalize">{participant.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Actions */}
                {selectedConversation.nextAction && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Next Action</h3>
                    <p className="text-gray-700 mb-2">{selectedConversation.nextAction}</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Due: {selectedConversation.nextActionDate.toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => {
                        // In real implementation, this would trigger the agent to complete the action
                        console.log('Initiating action for conversation:', selectedConversation.id);
                        triggerCelebration(CelebrationType.TASK_COMPLETE, {
                          message: "Action initiated! 🚀",
                          intensity: 'normal'
                        });
                      }}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Initiate Action</span>
                    </button>
                  </div>
                )}

                {/* Tags */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedConversation.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button 
                    onClick={() => handleReply(selectedConversation)}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                  <button 
                    onClick={() => handleStar(selectedConversation)}
                    className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    <span>Star</span>
                  </button>
                  <button 
                    onClick={() => handleArchive(selectedConversation)}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Archive</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
          <div className="text-sm text-gray-600">
            {filteredConversations.length} of {conversations.length} conversations
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="voice">Voice</option>
              <option value="chat">Chat</option>
              <option value="social">Social</option>
              <option value="sms">SMS</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={filterValueRange}
              onChange={(e) => setFilterValueRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Values</option>
              <option value="high">High Value ($50K+)</option>
              <option value="medium">Medium Value ($10K-$50K)</option>
              <option value="low">Low Value ($1K-$10K)</option>
              <option value="none">No Value</option>
            </select>

            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="older">Older</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lastActivity">Last Activity</option>
              <option value="created">Created Date</option>
              <option value="priority">Priority</option>
              <option value="value">Monetary Value</option>
              <option value="urgency">Urgency (Priority + Date)</option>
              <option value="messageCount">Message Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredConversations.map(conversation => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))}
        </AnimatePresence>
      </div>

      {/* Conversation Detail Modal */}
      <ConversationDetailModal />
    </div>
  );
};

export default ConversationsView;
