import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  ExternalLink
} from 'lucide-react';

const ConversationDetailModal = ({ 
  conversation,
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  onClose, 
  onReply, 
  onStar, 
  onArchive,
  onPlayRecording,
  onDownloadRecording,
  onInitiateAction,
  messages = []
  ,
  isStarred = false
}) => {
  const [expandedSections, setExpandedSections] = useState({
    messages: true,
    participants: true,
    timeline: true,
    insights: true
  });

  const [localSelectedId, setLocalSelectedId] = useState(selectedConversationId || conversation?.id);

  const activeConversationId = (selectedConversationId || localSelectedId || conversation?.id);
  const activeConversation = (conversations.find(c => c.id === activeConversationId)) || conversation;

  const handleSelectConversation = (id) => {
    setLocalSelectedId(id);
    if (typeof onSelectConversation === 'function') {
      onSelectConversation(id);
    }
  };

  if (!conversation) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  const TypeIcon = getTypeIcon(activeConversation.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${getTypeStyle(activeConversation.type)}`}>
                <TypeIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{activeConversation.subject}</h2>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(activeConversation.status)}`}>
                    {activeConversation.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeStyle(activeConversation.type)}`}>
                    {activeConversation.type}
                  </span>
                  <span className="text-sm text-gray-600">
                    {activeConversation.messageCount} messages
                  </span>
                  {activeConversation.duration && (
                    <span className="text-sm text-gray-600">
                      {activeConversation.duration}min duration
                    </span>
                  )}
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
              {/* Conversation Selector */}
              {Array.isArray(conversations) && conversations.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-semibold text-gray-900">Select Conversation</h3>
                  </div>
                  <select
                    value={activeConversationId}
                    onChange={(e) => handleSelectConversation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {conversations.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.type?.toUpperCase()} • {c.subject} • {new Date(typeof c.lastActivity === 'function' ? c.lastActivity() : c.lastActivity).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Conversation Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Conversation Summary</h3>
                  <button
                    onClick={() => toggleSection('insights')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSections.insights ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                {expandedSections.insights && (
                  <div className="space-y-3">
                    <p className="text-gray-700">{activeConversation.summary}</p>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Sentiment:</span>
                        <span className={`text-sm font-medium ${getSentimentStyle(activeConversation.sentiment)}`}>
                          {activeConversation.sentiment}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Agent:</span>
                        <span className="text-sm font-medium">{activeConversation.agentType}</span>
                      </div>
                      {activeConversation.estimatedValue && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            ${(activeConversation.estimatedValue || 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Messages Timeline */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Message Timeline</h3>
                  <button
                    onClick={() => toggleSection('messages')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSections.messages ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                {expandedSections.messages && (
                  <div className="space-y-4">
                    {Array.isArray(messages) && messages.filter(m => m.conversationId === activeConversationId).length > 0 ? (
                      messages.filter(m => m.conversationId === activeConversationId).map((m) => {
                        const isOut = m.direction === 'out';
                        const ts = new Date(typeof m.timestamp === 'function' ? m.timestamp() : m.timestamp).toLocaleString();
                        const ChannelIcon = m.channel === 'email' ? Mail : (m.channel === 'phone' ? Phone : MessageSquare);
                        return (
                          <div key={m.id} className={`flex items-start space-x-3 ${isOut ? 'justify-end' : ''}`}>
                            {!isOut && (
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                                <ChannelIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div className={isOut ? 'flex-1 text-right' : 'flex-1'}>
                              <div className={`${isOut ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3 inline-block max-w-[85%] text-left`}>
                                <div className="text-xs opacity-75 mb-1 capitalize">{m.channel} • {isOut ? 'Sent' : 'Received'}</div>
                                <p className={`${isOut ? 'text-white' : 'text-gray-900'}`}>{m.preview || m.subject || ''}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{ts}</p>
                            </div>
                            {isOut && (
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                                <Bot className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500">No messages available for this conversation.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Voice Recording (if applicable) */}
              {activeConversation.type === 'voice' && activeConversation.recordingUrl && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Mic className="w-5 h-5 mr-2" />
                    Call Recording
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => onPlayRecording && onPlayRecording(activeConversation.recordingUrl)}
                      className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Play Recording</span>
                    </button>
                    <button 
                      onClick={() => onDownloadRecording && onDownloadRecording(activeConversation.recordingUrl)}
                      className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <span className="text-sm text-gray-600">
                      Duration: {activeConversation.duration} minutes
                    </span>
                  </div>
                </div>
              )}

              {/* Agent Transparency Section */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  Agent Transparency
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Why this conversation was initiated:</h4>
                    <p className="text-sm text-gray-700">
                      The {activeConversation.agentType} agent initiated this conversation because 
                      {activeConversation.type === 'email' && ' the customer showed high engagement with our product demo.'}
                      {activeConversation.type === 'voice' && ' the customer had a support issue that required immediate attention.'}
                      {activeConversation.type === 'chat' && ' the customer was browsing pricing pages indicating purchase intent.'}
                      {activeConversation.type === 'social' && ' the customer engaged with our social media content.'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Agent's reasoning for approach:</h4>
                    <p className="text-sm text-gray-700">
                      Based on customer data analysis, the agent determined that a {activeConversation.type} approach 
                      would be most effective for this customer's communication preferences and current engagement level.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Next steps planned:</h4>
                    <p className="text-sm text-gray-700">
                      {activeConversation.nextAction || 'The agent is monitoring customer response to determine the next appropriate action.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participants */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Participants</h3>
                  <button
                    onClick={() => toggleSection('participants')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSections.participants ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                {expandedSections.participants && (
                  <div className="space-y-3">
                    {conversation.participants.map((participant, index) => (
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
                )}
              </div>

              {/* Next Actions */}
              {activeConversation.nextAction && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Next Action</h3>
                  <p className="text-gray-700 mb-2">{activeConversation.nextAction}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Due: {activeConversation.nextActionDate?.toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => { if (typeof onInitiateAction === 'function') onInitiateAction(activeConversation); }}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Initiate Action</span>
                  </button>
                </div>
              )}

              {/* Tags */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {conversation.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button 
                  onClick={() => onReply && onReply(activeConversation)}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
                <button 
                  onClick={() => onStar && onStar(activeConversation)}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isStarred ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                  <span>{isStarred ? 'Unstar Customer' : 'Star'}</span>
                </button>
                <button 
                  onClick={() => onArchive && onArchive(activeConversation)}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConversationDetailModal;
