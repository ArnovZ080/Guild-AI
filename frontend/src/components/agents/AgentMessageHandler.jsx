import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Bot, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  X, 
  Brain,
  Zap,
  User,
  Loader2
} from 'lucide-react';
import { useAgentCommunication } from '../../contexts/AgentCommunicationContext';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';

const AgentMessageHandler = ({ onMessageReceived, className = "" }) => {
  const { 
    agentMessages, 
    pendingResponses, 
    sendResponseToAgent, 
    hasPendingResponses,
    getPendingResponse 
  } = useAgentCommunication();
  
  const { currentMode, getModeColors } = useAdaptiveMode();
  const adaptiveClasses = getModeColors(currentMode);
  
  const [responseInput, setResponseInput] = useState({});
  const [isResponding, setIsResponding] = useState({});

  // Get agent icon based on agent ID
  const getAgentIcon = (agentId) => {
    const iconMap = {
      'content_creation_agent': '✍️',
      'marketing_agent': '📢',
      'sales_agent': '💰',
      'analytics_agent': '📊',
      'social_media_agent': '📱',
      'email_agent': '📧',
      'orchestrator': '🎯',
      'default': '🤖'
    };
    return iconMap[agentId] || iconMap.default;
  };

  // Get agent name
  const getAgentName = (agentId) => {
    const nameMap = {
      'content_creation_agent': 'Content Creation Agent',
      'marketing_agent': 'Marketing Agent',
      'sales_agent': 'Sales Agent',
      'analytics_agent': 'Analytics Agent',
      'social_media_agent': 'Social Media Agent',
      'email_agent': 'Email Agent',
      'orchestrator': 'Orchestrator Agent',
      'default': 'AI Agent'
    };
    return nameMap[agentId] || agentId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleSendResponse = async (messageId, response) => {
    if (!response.trim()) return;
    
    setIsResponding(prev => ({ ...prev, [messageId]: true }));
    
    try {
      await sendResponseToAgent(messageId, response);
      setResponseInput(prev => ({ ...prev, [messageId]: '' }));
      
      // Notify parent component
      if (onMessageReceived) {
        onMessageReceived({
          type: 'user_response',
          messageId,
          response,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error sending response:', error);
    } finally {
      setIsResponding(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const getMessageIcon = (messageType) => {
    switch (messageType) {
      case 'clarification_request':
        return <MessageSquare className="w-4 h-4" />;
      case 'status':
        return <Clock className="w-4 h-4" />;
      case 'response':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getMessageColor = (messageType) => {
    switch (messageType) {
      case 'clarification_request':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'status':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'response':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Pending Clarification Requests */}
      <AnimatePresence>
        {hasPendingResponses && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Agent Clarifications
            </h3>
            
            {Object.entries(pendingResponses).map(([messageId, request]) => (
              <motion.div
                key={messageId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-xl border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg">
                      {getAgentIcon(request.agentId)}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                        {getAgentName(request.agentId)}
                      </h4>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {request.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-blue-800 dark:text-blue-200 mb-3">
                      {request.question}
                    </p>
                    
                    {/* Response Input */}
                    <div className="space-y-2">
                      <textarea
                        value={responseInput[messageId] || ''}
                        onChange={(e) => setResponseInput(prev => ({ 
                          ...prev, 
                          [messageId]: e.target.value 
                        }))}
                        placeholder="Type your response here..."
                        className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                        rows={3}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleSendResponse(messageId, responseInput[messageId] || '')}
                          disabled={!responseInput[messageId]?.trim() || isResponding[messageId]}
                          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
                        >
                          {isResponding[messageId] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span>Send Response</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Messages History */}
      {agentMessages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Bot className="w-5 h-5 mr-2 text-gray-600" />
            Agent Messages
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {agentMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border ${getMessageColor(message.type)}`}
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    {getMessageIcon(message.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {getAgentName(message.agentId)}
                      </span>
                      <span className="text-xs opacity-75">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm break-words">
                      {message.content}
                    </p>
                    
                    {message.metadata && (
                      <div className="mt-2 text-xs opacity-75">
                        {message.metadata.status && (
                          <span className="inline-block bg-white/50 px-2 py-1 rounded mr-2">
                            Status: {message.metadata.status}
                          </span>
                        )}
                        {message.metadata.progress !== undefined && (
                          <span className="inline-block bg-white/50 px-2 py-1 rounded">
                            Progress: {message.metadata.progress}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Messages State */}
      {!hasPendingResponses && agentMessages.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No agent messages yet. Start a task to see agent communications!</p>
        </div>
      )}
    </div>
  );
};

export default AgentMessageHandler;
