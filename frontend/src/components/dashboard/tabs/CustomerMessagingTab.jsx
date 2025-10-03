import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle,
  Mail,
  Phone,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Heart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Filter,
  Search,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Trash2,
  Reply,
  Forward,
  Archive,
  Flag,
  Tag,
  Bell,
  Zap,
  Brain,
  Sparkles,
  Shield,
  Target,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UserPlus,
  UserMinus,
  DollarSign,
  Calendar,
  MapPin,
  Building,
  Globe,
  Smartphone,
  Monitor,
  Laptop,
  X
} from 'lucide-react';

const CustomerMessagingTab = ({ profiles, onCustomerAction }) => {
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    message: '',
    channel: 'email'
  });

  // Mock conversation data
  const conversations = [
    {
      id: 'conv_001',
      customer: profiles[0],
      channel: 'email',
      subject: 'Product inquiry',
      lastMessage: 'Thank you for your interest in our product. I would like to know more about the pricing.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'unread',
      priority: 'high',
      sentiment: 'positive',
      tags: ['inquiry', 'pricing']
    },
    {
      id: 'conv_002',
      customer: profiles[1],
      channel: 'phone',
      subject: 'Support request',
      lastMessage: 'I am having trouble with the login process. Can you help me?',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'read',
      priority: 'medium',
      sentiment: 'neutral',
      tags: ['support', 'login']
    },
    {
      id: 'conv_003',
      customer: profiles[2],
      channel: 'chat',
      subject: 'Feature request',
      lastMessage: 'Would it be possible to add a dark mode to the application?',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'replied',
      priority: 'low',
      sentiment: 'positive',
      tags: ['feature', 'request']
    },
    {
      id: 'conv_004',
      customer: profiles[3],
      channel: 'email',
      subject: 'Billing question',
      lastMessage: 'I noticed a charge on my account that I don\'t recognize. Can you explain this?',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'unread',
      priority: 'high',
      sentiment: 'negative',
      tags: ['billing', 'dispute']
    },
    {
      id: 'conv_005',
      customer: profiles[4],
      channel: 'social',
      subject: 'Social media mention',
      lastMessage: 'Just tried your new feature and it\'s amazing! Great work team!',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      status: 'read',
      priority: 'low',
      sentiment: 'positive',
      tags: ['praise', 'social']
    }
  ];

  const channels = [
    { id: 'all', label: 'All Channels', icon: MessageCircle, count: conversations.length },
    { id: 'email', label: 'Email', icon: Mail, count: conversations.filter(c => c.channel === 'email').length },
    { id: 'phone', label: 'Phone', icon: Phone, count: conversations.filter(c => c.channel === 'phone').length },
    { id: 'chat', label: 'Chat', icon: MessageCircle, count: conversations.filter(c => c.channel === 'chat').length },
    { id: 'social', label: 'Social', icon: Globe, count: conversations.filter(c => c.channel === 'social').length }
  ];

  const statuses = [
    { id: 'all', label: 'All Status', count: conversations.length },
    { id: 'unread', label: 'Unread', count: conversations.filter(c => c.status === 'unread').length },
    { id: 'read', label: 'Read', count: conversations.filter(c => c.status === 'read').length },
    { id: 'replied', label: 'Replied', count: conversations.filter(c => c.status === 'replied').length }
  ];

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesChannel = selectedChannel === 'all' || conv.channel === selectedChannel;
    const matchesStatus = selectedStatus === 'all' || conv.status === selectedStatus;
    const matchesSearch = conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesChannel && matchesStatus && matchesSearch;
  });

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'chat': return MessageCircle;
      case 'social': return Globe;
      default: return MessageCircle;
    }
  };

  const getChannelColor = (channel) => {
    switch (channel) {
      case 'email': return 'text-blue-600 bg-blue-100';
      case 'phone': return 'text-green-600 bg-green-100';
      case 'chat': return 'text-purple-600 bg-purple-100';
      case 'social': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'text-red-600 bg-red-100';
      case 'read': return 'text-blue-600 bg-blue-100';
      case 'replied': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Customer Messaging</h3>
              <p className="text-sm text-gray-600">Unified communications across all channels</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCompose(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Compose
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Channel and Status Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>
                  {channel.label} ({channel.count})
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.label} ({status.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {conversations.filter(c => c.status === 'unread').length}
            </div>
            <div className="text-red-600">Unread</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {conversations.filter(c => c.status === 'read').length}
            </div>
            <div className="text-blue-600">Read</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {conversations.filter(c => c.status === 'replied').length}
            </div>
            <div className="text-green-600">Replied</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {conversations.filter(c => c.priority === 'high').length}
            </div>
            <div className="text-purple-600">High Priority</div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {filteredConversations.map((conversation, index) => {
          const ChannelIcon = getChannelIcon(conversation.channel);
          
          return (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ChannelIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-semibold text-gray-900">{conversation.customer.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelColor(conversation.channel)}`}>
                        {conversation.channel}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                        {conversation.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(conversation.priority)}`}>
                        {conversation.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(conversation.sentiment)}`}>
                        {conversation.sentiment}
                      </span>
                    </div>
                  </div>
                  
                  <h5 className="text-md font-medium text-gray-800 mb-2">{conversation.subject}</h5>
                  <p className="text-gray-600 mb-3 line-clamp-2">{conversation.lastMessage}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{conversation.customer.email}</span>
                      <span>•</span>
                      <span>{formatTimestamp(conversation.timestamp)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {conversation.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCustomerAction('reply', conversation);
                    }}
                    className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                    title="Reply"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCustomerAction('forward', conversation);
                    }}
                    className="p-2 text-green-400 hover:text-green-600 transition-colors"
                    title="Forward"
                  >
                    <Forward className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCustomerAction('archive', conversation);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredConversations.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedChannel('all');
                setSelectedStatus('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCompose(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Compose Message</h3>
                <button
                  onClick={() => setShowCompose(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="email"
                    value={composeData.to}
                    onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="customer@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <select
                    value={composeData.channel}
                    onChange={(e) => setComposeData(prev => ({ ...prev, channel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="chat">Chat</option>
                    <option value="social">Social Media</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Message subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={composeData.message}
                    onChange={(e) => setComposeData(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message here..."
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Sending message:', composeData);
                    setShowCompose(false);
                    setComposeData({ to: '', subject: '', message: '', channel: 'email' });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Conversation Details Modal */}
      {selectedConversation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedConversation(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {React.createElement(getChannelIcon(selectedConversation.channel), { className: "w-6 h-6 text-blue-600" })}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedConversation.customer.name}</h3>
                    <p className="text-gray-600">{selectedConversation.customer.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelColor(selectedConversation.channel)}`}>
                        {selectedConversation.channel}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedConversation.status)}`}>
                        {selectedConversation.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedConversation.priority)}`}>
                        {selectedConversation.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedConversation.subject}</h4>
                  <p className="text-gray-700">{selectedConversation.lastMessage}</p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onCustomerAction('reply', selectedConversation)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </button>
                    <button
                      onClick={() => onCustomerAction('forward', selectedConversation)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Forward className="w-4 h-4 mr-2" />
                      Forward
                    </button>
                    <button
                      onClick={() => onCustomerAction('archive', selectedConversation)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {formatTimestamp(selectedConversation.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CustomerMessagingTab;
