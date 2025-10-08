/**
 * Orchestrator Chat Interface
 * Primary control point for autonomous AI workforce
 * Enables full business management through conversational interface
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Zap,
  CheckCircle,
  Clock,
  Eye,
  TrendingUp,
  Settings,
  Sparkles,
  Workflow,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import enhancedOrchestratorService from '../../services/EnhancedOrchestratorService.js';
import WorkflowTransparencyModal from '../dashboard/modals/WorkflowTransparencyModal.jsx';

const OrchestratorChatInterface = ({ userId, onWorkflowCreated }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [showTransparency, setShowTransparency] = useState(null);
  const [systemCapabilities, setSystemCapabilities] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load system capabilities on mount
    loadSystemCapabilities();
    
    // Add welcome message
    setMessages([{
      id: 'welcome',
      type: 'system',
      content: `👋 Welcome to your autonomous AI workforce! I can help you manage every aspect of your business.

I have access to 115+ specialized agents and can connect to 40+ platforms. Just tell me what you want to accomplish, and I'll coordinate the entire operation autonomously.

**Examples:**
• "Increase my revenue by 50% in 3 months"
• "Create and launch a marketing campaign for our new product"
• "Analyze customer sentiment and improve retention"
• "Generate comprehensive financial reports from my accounting data"
• "Find and engage with 100 qualified leads"

What would you like to accomplish?`,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSystemCapabilities = async () => {
    const result = await enhancedOrchestratorService.getSystemCapabilities();
    if (result.success) {
      setSystemCapabilities(result);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Process through enhanced orchestrator
      const result = await enhancedOrchestratorService.processChatOrchestration(
        inputValue,
        userId
      );

      if (result.success) {
        // Add orchestrator response
        const orchestratorMessage = {
          id: `msg_${Date.now()}_response`,
          type: 'orchestrator',
          content: result.message,
          workflow: result.workflow_details,
          workflowId: result.workflow_id,
          transparency: result.transparency,
          nextActions: result.next_actions,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, orchestratorMessage]);
        
        // Track active workflow
        if (result.workflow_id) {
          setActiveWorkflows(prev => [...prev, {
            id: result.workflow_id,
            name: result.workflow_details?.name || 'Autonomous Workflow',
            created: new Date().toISOString(),
            status: 'running'
          }]);
          
          // Notify parent
          onWorkflowCreated?.(result.workflow_id);
        }
      } else {
        // Error message
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_error`,
          type: 'error',
          content: `⚠️ I encountered an issue: ${result.error}. Let me try a different approach.`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_error`,
        type: 'error',
        content: `⚠️ Something went wrong. Please try again or contact support.`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    const isOrchestrator = message.type === 'orchestrator';
    const isError = message.type === 'error';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 ${
            isUser ? 'bg-blue-100' : 
            isOrchestrator ? 'bg-purple-100' :
            isError ? 'bg-red-100' :
            'bg-gray-100'
          } p-2 rounded-full`}>
            {isUser ? (
              <User className="w-5 h-5 text-blue-600" />
            ) : isOrchestrator ? (
              <Zap className="w-5 h-5 text-purple-600" />
            ) : isError ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Bot className="w-5 h-5 text-gray-600" />
            )}
          </div>

          {/* Message Content */}
          <div className={`flex-1 ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-lg p-4 ${
              isUser ? 'bg-blue-600 text-white' :
              isOrchestrator ? 'bg-purple-50 border border-purple-200' :
              isError ? 'bg-red-50 border border-red-200' :
              'bg-gray-50 border border-gray-200'
            }`}>
              <p className={`text-sm whitespace-pre-wrap ${
                isUser ? 'text-white' : 
                isOrchestrator ? 'text-gray-900' :
                'text-gray-800'
              }`}>
                {message.content}
              </p>

              {/* Workflow Details (for orchestrator responses) */}
              {isOrchestrator && message.workflow && (
                <div className="mt-4 space-y-3">
                  <div className="border-t border-purple-200 pt-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      📋 Autonomous Workflow Created
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-2 rounded">
                        <div className="text-gray-600">Agents</div>
                        <div className="font-semibold text-purple-600">{message.workflow.total_agents}</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="text-gray-600">Integrations</div>
                        <div className="font-semibold text-purple-600">{message.workflow.integrations_used}</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowTransparency(message.workflowId)}
                      className="flex items-center space-x-1 px-3 py-1 bg-white border border-purple-300 rounded-md text-xs text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Transparency</span>
                    </button>
                    <button
                      onClick={() => window.location.href = '/workflows/active'}
                      className="flex items-center space-x-1 px-3 py-1 bg-white border border-purple-300 rounded-md text-xs text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <Activity className="w-3 h-3" />
                      <span>Monitor Progress</span>
                    </button>
                  </div>

                  {/* Data Sources Used */}
                  {message.workflow.data_sources && message.workflow.data_sources.length > 0 && (
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Data Sources:</div>
                      <div className="flex flex-wrap gap-1">
                        {message.workflow.data_sources.map((source, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 mt-1 px-2">
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              {isOrchestrator && message.workflow && (
                <span className="text-xs text-purple-600 font-medium">
                  Autonomous Level: Full
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const QuickActionButtons = () => (
    <div className="mb-4 flex flex-wrap gap-2">
      {[
        { label: '📈 Increase Revenue', prompt: 'Increase my revenue by 50% in the next 3 months' },
        { label: '🎯 Generate Leads', prompt: 'Find and engage 100 qualified leads for my business' },
        { label: '📱 Social Campaign', prompt: 'Create and launch a social media campaign' },
        { label: '💰 Financial Report', prompt: 'Generate comprehensive financial reports from my accounting data' },
        { label: '😊 Customer Analysis', prompt: 'Analyze customer sentiment and improve retention' },
        { label: '📊 Business Intelligence', prompt: 'Give me a complete business intelligence overview' }
      ].map((action, idx) => (
        <button
          key={idx}
          onClick={() => setInputValue(action.prompt)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          {action.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* System Capabilities Banner */}
      {systemCapabilities && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5" />
              <div>
                <h3 className="font-semibold text-sm">Autonomous AI Workforce Active</h3>
                <p className="text-xs opacity-90">
                  {systemCapabilities.total_agents} agents • {systemCapabilities.integration_ecosystem?.total_platforms} integrations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3" />
                <span>{activeWorkflows.length} active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Quick Actions (show when empty) */}
          {messages.length <= 1 && <QuickActionButtons />}

          {/* Message List */}
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {/* Processing Indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start space-x-3 mb-4"
            >
              <div className="bg-purple-100 p-2 rounded-full">
                <Bot className="w-5 h-5 text-purple-600 animate-pulse" />
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex-1">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-purple-700">
                    Analyzing your request and orchestrating agents...
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Active Workflows Strip */}
      {activeWorkflows.length > 0 && (
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center space-x-3 overflow-x-auto">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Active Workflows:</span>
            {activeWorkflows.map((workflow) => (
              <button
                key={workflow.id}
                onClick={() => setShowTransparency(workflow.id)}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 hover:bg-blue-100 transition-colors whitespace-nowrap"
              >
                <Activity className="w-3 h-3" />
                <span>{workflow.name}</span>
                <Eye className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Tell me what you want to accomplish... (e.g., 'Increase revenue by 50%', 'Find 100 qualified leads', 'Launch marketing campaign')"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="2"
                disabled={isProcessing}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>

          {/* Capabilities Hint */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>✨ 115+ specialized agents ready</span>
              <span>•</span>
              <span>🔌 40+ platform integrations</span>
              <span>•</span>
              <span>🤖 Fully autonomous operation</span>
            </div>
          </div>
        </form>
      </div>

      {/* Transparency Modal */}
      {showTransparency && (
        <WorkflowTransparencyModal
          isOpen={!!showTransparency}
          onClose={() => setShowTransparency(null)}
          workflowId={showTransparency}
          workflowData={{}}  // Would be loaded from API
          onRefreshWorkflow={async (wfId) => {
            const status = await enhancedOrchestratorService.getWorkflowStatus(wfId);
            return status;
          }}
        />
      )}
    </div>
  );
};

export default OrchestratorChatInterface;

