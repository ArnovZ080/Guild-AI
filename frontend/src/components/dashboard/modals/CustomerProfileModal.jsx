import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  Heart,
  Star,
  Activity,
  MessageCircle,
  Tag,
  Edit,
  Save,
  Trash2,
  Send,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MessageCircle as MessageIcon,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap,
  Sparkles,
  Shield,
  Target,
  BarChart3,
  Users,
  Building,
  Globe,
  Smartphone,
  Monitor,
  Laptop,
  Bell,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UserPlus,
  UserMinus,
  Plus,
  Minus,
  Play,
  Pause,
  Settings,
  ShoppingCart,
  CreditCard,
  Gift,
  Award,
  AlertCircle,
  XCircle
} from 'lucide-react';

import ComposeEmailModal from './ComposeEmailModal.jsx';
import MessageComposeModal from './MessageComposeModal.jsx';
import ScheduleCallModal from './ScheduleCallModal.jsx';
import ForwardMessageModal from './ForwardMessageModal.jsx';

const CustomerProfileModal = ({ customer, isOpen, onClose, onSave, onAction }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(customer);
  const [messages, setMessages] = useState([
    ...(
      Array.isArray(customer?.messages)
        ? customer.messages
        : []
    ),
  ]);
  const [replyEmailOpen, setReplyEmailOpen] = useState(false);
  const [replyChatOpen, setReplyChatOpen] = useState(false);
  const [scheduleCallOpen, setScheduleCallOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);

  if (!isOpen || !customer) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'value', label: 'Value Metrics', icon: DollarSign },
    { id: 'messages', label: 'Messaging History', icon: MessageCircle },
    { id: 'sentiment', label: 'Sentiment', icon: Heart },
    { id: 'ai', label: 'AI Insights', icon: Brain }
  ];

  // Mock interaction timeline data
  const timelineData = [
    {
      id: 'timeline_001',
      type: 'purchase',
      title: 'Premium Plan Purchase',
      description: 'Upgraded to Premium plan with annual billing',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      value: 299.99,
      status: 'completed',
      icon: ShoppingBag
    },
    {
      id: 'timeline_002',
      type: 'support',
      title: 'Support Ticket Resolved',
      description: 'Issue with login credentials resolved successfully',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      value: null,
      status: 'resolved',
      icon: MessageCircle
    },
    {
      id: 'timeline_003',
      type: 'email',
      title: 'Newsletter Engagement',
      description: 'Opened and clicked on product update email',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      value: null,
      status: 'engaged',
      icon: Mail
    },
    {
      id: 'timeline_004',
      type: 'login',
      title: 'Platform Login',
      description: 'Logged into platform and accessed dashboard',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      value: null,
      status: 'active',
      icon: Activity
    }
  ];

  // Mock AI insights
  const aiInsights = {
    nextBestAction: {
      action: 'Send personalized upsell offer',
      confidence: 87,
      reasoning: 'High engagement customer with premium plan, likely to upgrade to enterprise',
      expectedValue: 2500
    },
    riskFactors: [
      'No activity in last 7 days',
      'Support ticket escalation',
      'Price sensitivity detected'
    ],
    opportunities: [
      'Enterprise plan upgrade potential',
      'Additional user licenses needed',
      'Integration with third-party tools'
    ],
    recommendations: [
      'Schedule quarterly business review',
      'Share success case studies',
      'Offer exclusive beta access'
    ]
  };

  // Local fallbacks if no messages on customer
  if (messages.length === 0) {
    messages.push(
      { id: 'msg_001', channel: 'email', direction: 'in', subject: 'Question about pricing', timestamp: new Date(Date.now() - 86400000).toISOString(), preview: 'Could you clarify the discount tiers...' },
      { id: 'msg_002', channel: 'chat', direction: 'out', subject: 'Support follow-up', timestamp: new Date(Date.now() - 7200000).toISOString(), preview: 'Just checking if the login issue...' },
      { id: 'msg_003', channel: 'phone', direction: 'out', subject: 'Scheduled call summary', timestamp: new Date(Date.now() - 3600000).toISOString(), preview: 'Thanks for your time today. We discussed...' }
    );
  }

  const handleReply = (m) => {
    setActiveMessage(m);
    if (m.channel === 'email') setReplyEmailOpen(true);
    else if (m.channel === 'chat') setReplyChatOpen(true);
    else if (m.channel === 'phone') setScheduleCallOpen(true);
  };

  const handleForward = (m) => {
    setActiveMessage(m);
    setForwardOpen(true);
  };

  const handleArchive = (m) => {
    setMessages(prev => prev.filter(x => x.id !== m.id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'resolved': return 'text-blue-600 bg-blue-100';
      case 'engaged': return 'text-purple-600 bg-purple-100';
      case 'active': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'purchase': return 'text-green-600 bg-green-100';
      case 'support': return 'text-blue-600 bg-blue-100';
      case 'email': return 'text-purple-600 bg-purple-100';
      case 'login': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const handleSave = () => {
    onSave(editedCustomer);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedCustomer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedCustomer.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1"
                    />
                  ) : (
                    customer.name
                  )}
                </h2>
                <p className="text-gray-600">
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedCustomer.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1"
                    />
                  ) : (
                    customer.email
                  )}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.churn_risk === 'low' ? 'text-green-600 bg-green-100' :
                    customer.churn_risk === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                    customer.churn_risk === 'high' ? 'text-orange-600 bg-orange-100' :
                    'text-red-600 bg-red-100'
                  }`}>
                    {customer.churn_risk} risk
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.health_score >= 80 ? 'text-green-600 bg-green-100' :
                    customer.health_score >= 60 ? 'text-blue-600 bg-blue-100' :
                    customer.health_score >= 40 ? 'text-yellow-600 bg-yellow-100' :
                    'text-red-600 bg-red-100'
                  }`}>
                    Health: {customer.health_score}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-600 bg-purple-100">
                    {customer.customer_segment}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedCustomer(customer);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${customer.lifetime_value.toLocaleString()}</div>
                  <div className="text-green-600 font-medium">Lifetime Value</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{customer.total_orders}</div>
                  <div className="text-blue-600 font-medium">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{customer.support_tickets}</div>
                  <div className="text-purple-600 font-medium">Support Tickets</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{customer.engagement_score}%</div>
                  <div className="text-orange-600 font-medium">Engagement Score</div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{customer.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">San Francisco, CA</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interaction Timeline</h3>
              {timelineData.map((event, index) => {
                const Icon = event.icon;
                return (
                  <div key={event.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-md font-semibold text-gray-900">{event.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{event.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{formatTimestamp(event.timestamp)}</span>
                        {event.value && (
                          <span className="text-sm font-medium text-green-600">${event.value}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'value' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Value Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Revenue Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lifetime Value:</span>
                      <span className="font-medium text-green-600">${customer.lifetime_value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="font-medium text-green-600">${customer.total_spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Order Value:</span>
                      <span className="font-medium text-blue-600">${(customer.total_spent / customer.total_orders).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Frequency:</span>
                      <span className="font-medium text-purple-600">{customer.total_orders} orders</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Engagement Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engagement Score:</span>
                      <span className="font-medium text-blue-600">{customer.engagement_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Health Score:</span>
                      <span className="font-medium text-green-600">{customer.health_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sentiment Score:</span>
                      <span className="font-medium text-purple-600">{customer.sentiment_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Activity:</span>
                      <span className="font-medium text-gray-600">{formatTimestamp(customer.last_activity)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Messaging History</h3>
              <div className="space-y-3">
                {messages.map((m) => {
                  const Icon = m.channel === 'email' ? Mail : m.channel === 'phone' ? Phone : MessageCircle;
                  return (
                    <div key={m.id} className="p-3 border border-gray-200 rounded-lg flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-900 font-medium capitalize">{m.channel} • {m.direction === 'in' ? 'Received' : 'Sent'}</div>
                          <div className="text-sm text-gray-700">{m.subject}</div>
                          <div className="text-xs text-gray-500">{new Date(m.timestamp).toLocaleString()}</div>
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">{m.preview}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={()=>handleReply(m)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Reply</button>
                        <button onClick={()=>handleForward(m)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs">Forward</button>
                        <button onClick={()=>handleArchive(m)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs">Archive</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'sentiment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{customer.sentiment_score}</div>
                  <div className="text-green-600 font-medium">Overall Sentiment</div>
                  <div className="text-sm text-gray-600">Positive</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{customer.engagement_score}%</div>
                  <div className="text-blue-600 font-medium">Engagement Level</div>
                  <div className="text-sm text-gray-600">High</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{customer.health_score}</div>
                  <div className="text-purple-600 font-medium">Health Score</div>
                  <div className="text-sm text-gray-600">Excellent</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Recent Sentiment Indicators</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Support interactions:</span>
                    <span className="text-green-600 font-medium">Positive</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email engagement:</span>
                    <span className="text-blue-600 font-medium">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Product usage:</span>
                    <span className="text-purple-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Feedback sentiment:</span>
                    <span className="text-green-600 font-medium">Positive</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights & Recommendations</h3>
              
              {/* Next Best Action */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Next Best Action</h4>
                </div>
                <p className="text-blue-800 mb-2">{aiInsights.nextBestAction.action}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600">Confidence: {aiInsights.nextBestAction.confidence}%</span>
                  <span className="text-sm text-green-600">Expected Value: ${aiInsights.nextBestAction.expectedValue.toLocaleString()}</span>
                </div>
                <p className="text-sm text-blue-700 mt-2">{aiInsights.nextBestAction.reasoning}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Factors */}
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-900">Risk Factors</h4>
                  </div>
                  <ul className="space-y-2">
                    {aiInsights.riskFactors.map((factor, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-center">
                        <XCircle className="w-4 h-4 mr-2" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Growth Opportunities</h4>
                  </div>
                  <ul className="space-y-2">
                    {aiInsights.opportunities.map((opportunity, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">AI Recommendations</h4>
                </div>
                <ul className="space-y-2">
                  {aiInsights.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-purple-700 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAction('message', customer)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <MessageIcon className="w-4 h-4 mr-2" />
                Send Message
              </button>
              <button
                onClick={() => onAction('schedule_call', customer)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <PhoneIcon className="w-4 h-4 mr-2" />
                Schedule Call
              </button>
              <button
                onClick={() => onAction('send_email', customer)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <MailIcon className="w-4 h-4 mr-2" />
                Send Email
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              Last updated: {formatTimestamp(customer.last_activity)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reply Modals */}
      {replyEmailOpen && activeMessage && (
        <ComposeEmailModal
          open={replyEmailOpen}
          onClose={() => setReplyEmailOpen(false)}
          defaultTo={customer.email}
          defaultSegmentId={'all'}
          onSent={() => setReplyEmailOpen(false)}
          replyTo={activeMessage}
        />
      )}
      {replyChatOpen && activeMessage && (
        <MessageComposeModal
          open={replyChatOpen}
          onClose={() => setReplyChatOpen(false)}
          customer={customer}
          replyTo={activeMessage}
        />
      )}
      {scheduleCallOpen && activeMessage && (
        <ScheduleCallModal
          open={scheduleCallOpen}
          onClose={() => setScheduleCallOpen(false)}
          customer={customer}
          defaultNotes={`Reply to: ${activeMessage.subject || ''}`}
          onConfirm={()=> setScheduleCallOpen(false)}
        />
      )}

      {/* Forward Modal */}
      {forwardOpen && activeMessage && (
        <ForwardMessageModal
          open={forwardOpen}
          onClose={() => setForwardOpen(false)}
          message={activeMessage}
          onSend={()=> setForwardOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default CustomerProfileModal;
