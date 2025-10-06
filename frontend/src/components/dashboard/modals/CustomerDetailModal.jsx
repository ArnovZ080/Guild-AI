import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Bot,
  User,
  Play,
  Pause,
  Download,
  Reply,
  Star,
  Archive,
  Clock,
  DollarSign,
  Zap,
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
  Mic,
  Video,
  FileText,
  ExternalLink,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  Headphones,
  Mail as MailIcon,
  Smartphone,
  Brain,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const CustomerDetailModal = ({ 
  customer, 
  onClose, 
  onReply, 
  onStar, 
  onArchive,
  onViewProfile,
  onPlayRecording,
  onDownloadRecording,
  onInitiateAction,
  onOrchestrateAction
}) => {
  const [expandedSections, setExpandedSections] = useState({
    conversations: true,
    analytics: true,
    agents: true,
    timeline: true,
    insights: true
  });

  if (!customer) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleConversationMessages = (conversationIndex) => {
    const sectionKey = `conversation_${conversationIndex}`;
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Generate mock conversation messages (in production, this would come from the API)
  const getConversationMessages = (conversation) => {
    const messages = [];
    const messageCount = conversation.messageCount || 5;
    
    // Generate a conversation thread
    for (let i = 0; i < messageCount; i++) {
      const isCustomer = i % 2 === 0;
      const timestamp = new Date(conversation.createdAt);
      timestamp.setMinutes(timestamp.getMinutes() + (i * 30));
      
      messages.push({
        id: `${conversation.id}_msg_${i}`,
        sender: isCustomer ? 'customer' : 'agent',
        content: isCustomer 
          ? generateCustomerMessage(i, conversation)
          : generateAgentMessage(i, conversation),
        timestamp: timestamp,
        type: conversation.type
      });
    }
    
    return messages;
  };

  const generateCustomerMessage = (index, conversation) => {
    const customerMessages = [
      `Hi, I'm interested in learning more about your services.`,
      `That sounds great! Can you tell me more about the pricing?`,
      `When would be a good time for a demo?`,
      `Thank you for the information. I'll review it and get back to you.`,
      `I have a few more questions about the implementation process.`
    ];
    return customerMessages[index % customerMessages.length];
  };

  const generateAgentMessage = (index, conversation) => {
    const agentMessages = [
      `Hello! I'd be happy to help you learn more about our services. Let me send you some information.`,
      `I've attached our pricing sheet and feature comparison. Would you like to schedule a call to discuss?`,
      `I can set up a demo for next Tuesday at 2 PM. Does that work for you?`,
      `Perfect! I'll send you the calendar invite and demo materials.`,
      `Absolutely! I'm here to help with any questions you have about our implementation process.`
    ];
    return agentMessages[index % agentMessages.length];
  };

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

  // Get sentiment styling
  const getSentimentStyle = (sentiment) => {
    const styles = {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-600'
    };
    return styles[sentiment] || 'text-gray-600';
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

  // Calculate customer analytics
  const getCustomerAnalytics = () => {
    const totalConversations = customer.conversations.length;
    const totalMessages = customer.messageCount;
    const avgMessagesPerConversation = totalMessages / totalConversations;
    
    const channelBreakdown = customer.channels.reduce((acc, channel) => {
      acc[channel] = (acc[channel] || 0) + 1;
      return acc;
    }, {});

    const agentBreakdown = customer.agents.reduce((acc, agent) => {
      acc[agent] = (acc[agent] || 0) + 1;
      return acc;
    }, {});

    const sentimentBreakdown = customer.conversations.reduce((acc, conv) => {
      acc[conv.sentiment] = (acc[conv.sentiment] || 0) + 1;
      return acc;
    }, {});

    // Calculate actual conversation duration (not time span between first and last message)
    const avgConversationDuration = customer.conversations.reduce((sum, conv) => {
      // Use the duration field if available, otherwise estimate based on message count
      const duration = conv.duration || Math.min(conv.messageCount * 2, 30); // 2 minutes per message, max 30 minutes
      return sum + duration;
    }, 0) / customer.conversations.length;

    return {
      totalConversations,
      totalMessages,
      avgMessagesPerConversation,
      channelBreakdown,
      agentBreakdown,
      sentimentBreakdown,
      avgConversationDuration,
      totalValue: customer.totalValue,
      avgSentiment: customer.avgSentiment
    };
  };

  const analytics = getCustomerAnalytics();

  // Generate AI insights
  const getAIInsights = () => {
    const insights = [];
    
    // Sentiment insights
    if (analytics.sentimentBreakdown.negative > analytics.sentimentBreakdown.positive) {
      insights.push({
        type: 'warning',
        title: 'Negative Sentiment Trend',
        description: 'This customer has shown more negative sentiment than positive. Consider proactive outreach.',
        action: 'Initiate sentiment improvement workflow',
        icon: AlertTriangle,
        color: 'text-red-600'
      });
    }

    // Channel performance insights
    const mostUsedChannel = Object.keys(analytics.channelBreakdown).reduce((a, b) => 
      analytics.channelBreakdown[a] > analytics.channelBreakdown[b] ? a : b
    );
    insights.push({
      type: 'info',
      title: 'Preferred Communication Channel',
      description: `${mostUsedChannel} is this customer's most used communication channel.`,
      action: 'Continue using this channel for future outreach',
      icon: MessageCircle,
      color: 'text-blue-600'
    });

    // Agent performance insights
    const bestAgent = Object.keys(analytics.agentBreakdown).reduce((a, b) => 
      analytics.agentBreakdown[a] > analytics.agentBreakdown[b] ? a : b
    );
    insights.push({
      type: 'success',
      title: 'Best Performing Agent',
      description: `${bestAgent} agent has the most interactions with this customer.`,
      action: 'Assign future conversations to this agent',
      icon: CheckCircle,
      color: 'text-green-600'
    });

    // Value insights
    if (customer.totalValue > 50000) {
      insights.push({
        type: 'success',
        title: 'High-Value Customer',
        description: 'This customer represents significant business value.',
        action: 'Prioritize relationship management',
        icon: TrendingUp,
        color: 'text-green-600'
      });
    }

    return insights;
  };

  const aiInsights = getAIInsights();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {customer.name[0]}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{customer.name}</h2>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-600">{customer.email}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{customer.conversationCount} conversations</span>
                  <span className="text-gray-400">•</span>
                  <span className={`text-sm font-medium ${getSentimentStyle(customer.sentiment)}`}>
                    {customer.sentiment} sentiment
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
              {/* AI Insights */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Brain className="w-5 h-5 text-purple-500 mr-2" />
                    AI Insights & Recommendations
                  </h3>
                  <button
                    onClick={() => toggleSection('insights')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSections.insights ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                {expandedSections.insights && (
                  <div className="space-y-3">
                    {aiInsights.map((insight, index) => {
                      const Icon = insight.icon;
                      return (
                        <div key={index} className="bg-white rounded-lg p-3 border-l-4 border-l-purple-400">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <Icon className={`w-5 h-5 mt-0.5 ${insight.color}`} />
                              <div>
                                <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => onOrchestrateAction && onOrchestrateAction({
                                action: insight.action,
                                customer: customer,
                                insight: insight
                              })}
                              className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Customer Analytics */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Customer Analytics
                  </h3>
                  <button
                    onClick={() => toggleSection('analytics')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSections.analytics ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                {expandedSections.analytics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analytics.totalConversations}</div>
                      <div className="text-sm text-gray-600">Total Conversations</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analytics.totalMessages}</div>
                      <div className="text-sm text-gray-600">Total Messages</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{Math.round(analytics.avgMessagesPerConversation)}</div>
                      <div className="text-sm text-gray-600">Avg Messages/Conv</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{Math.round(analytics.avgConversationDuration)}m</div>
                      <div className="text-sm text-gray-600">Avg Duration</div>
                    </div>
                  </div>
                )}
              </div>

              {/* All Conversations */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">All Conversations</h3>
                  <button
                    onClick={() => toggleSection('conversations')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSections.conversations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                {expandedSections.conversations && (
                  <div className="space-y-4">
                    {customer.conversations.map((conversation, index) => {
                      const TypeIcon = getTypeIcon(conversation.type);
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getTypeStyle(conversation.type)}`}>
                                <TypeIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{conversation.subject}</h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <span>{conversation.type}</span>
                                  <span>•</span>
                                  <span>{conversation.agentType} agent</span>
                                  <span>•</span>
                                  <span>{conversation.messageCount} messages</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(conversation.status)}`}>
                                {conversation.status}
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSentimentStyle(conversation.sentiment)}`}>
                                {conversation.sentiment}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 text-sm mb-3">{conversation.lastMessage}</p>
                          
                          {/* Conversation Messages */}
                          <div className="mt-3">
                            <button
                              onClick={() => toggleConversationMessages(index)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {expandedSections[`conversation_${index}`] ? 'Hide Messages' : `Show All ${conversation.messageCount} Messages`}
                            </button>
                            {expandedSections[`conversation_${index}`] && (
                              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                                {getConversationMessages(conversation).map((message, msgIndex) => (
                                  <div key={msgIndex} className={`p-3 rounded-lg ${
                                    message.sender === 'customer' 
                                      ? 'bg-gray-50 ml-4' 
                                      : 'bg-blue-50 mr-4'
                                  }`}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-gray-700">
                                        {message.sender === 'customer' ? customer.name : `${conversation.agentType} Agent`}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(message.timestamp).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-800">{message.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{new Date(conversation.lastActivity).toLocaleString()}</span>
                              {(conversation.estimatedValue || conversation.actualValue) && (
                                <span className="font-medium text-green-600">
                                  ${(conversation.estimatedValue || conversation.actualValue || 0).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => onReply && onReply(conversation)}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                              >
                                Reply
                              </button>
                              {conversation.type === 'voice' && conversation.recordingUrl && (
                                <button
                                  onClick={() => onPlayRecording && onPlayRecording(conversation.recordingUrl)}
                                  className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                >
                                  Play
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Agent Performance */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Agents Involved</h3>
                  <button
                    onClick={() => toggleSection('agents')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSections.agents ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                {expandedSections.agents && (
                  <div className="space-y-3">
                    {Object.entries(analytics.agentBreakdown).map(([agent, count]) => (
                      <div key={agent} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">{agent}</span>
                        </div>
                        <span className="text-sm text-gray-600">{count} conversations</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Channel Breakdown */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Channel Usage</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.channelBreakdown).map(([channel, count]) => {
                    const TypeIcon = getTypeIcon(channel);
                    return (
                      <div key={channel} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium capitalize">{channel}</span>
                        </div>
                        <span className="text-sm text-gray-600">{count} conversations</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.sentimentBreakdown).map(([sentiment, count]) => (
                    <div key={sentiment} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className={`text-sm font-medium ${getSentimentStyle(sentiment)} capitalize`}>
                        {sentiment}
                      </span>
                      <span className="text-sm text-gray-600">{count} conversations</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button 
                  onClick={() => onStar && onStar(customer)}
                  className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  <span>Star Customer</span>
                </button>
                <button 
                  onClick={() => onViewProfile && onViewProfile(customer)}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>View Full Profile</span>
                </button>
                <button 
                  onClick={() => onArchive && onArchive(customer)}
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

export default CustomerDetailModal;
