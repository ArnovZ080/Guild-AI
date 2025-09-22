import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, BarChart, Settings, User, Bot, Sparkles, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { useCelebrations, CelebrationType } from '../psychological/MicroCelebrations';
import { listAvailableAgents, sendTaskToAgent } from '../../services/agentsApi.js';
import { AgentAvatar } from '../agents/AgentAvatars';

const ChatInterface = ({ onNavigateToDashboard }) => {
  const { triggerCelebration } = useCelebrations();
  
  // Check if user has completed onboarding
  const onboardingData = localStorage.getItem('guild_onboarding_data');
  const hasCompletedOnboarding = localStorage.getItem('guild_onboarding_completed') === 'true';
  
  const [messages, setMessages] = useState(() => {
    if (hasCompletedOnboarding && onboardingData) {
      const data = JSON.parse(onboardingData);
      return [
        {
          id: '1',
          type: 'assistant',
          content: `👋 Welcome back! I see you've completed your onboarding. Based on your business profile, I'm ready to help you with ${data.firstTask || 'your business goals'}. What would you like to work on today?`,
          timestamp: new Date(),
          suggestions: [
            "Create content for my social media",
            "Help me with my marketing strategy", 
            "Analyze my business performance",
            "Plan my next 30 days"
          ]
        }
      ];
    } else {
      return [
        {
          id: '1',
          type: 'assistant',
          content: "👋 Hello! I'm your AI business assistant. I'm here to help you grow your business without the technical complexity. What would you like to work on today?",
          timestamp: new Date(),
          suggestions: [
            "Create content for my social media",
            "Help me with my marketing strategy", 
            "Analyze my business performance",
            "Plan my next 30 days"
          ]
        }
      ];
    }
  });
  const [showAgentMentions, setShowAgentMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  
  const [availableAgents, setAvailableAgents] = useState([]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState('strategy');
  const [chatHistory, setChatHistory] = useState([
    { id: '1', title: 'Social Media Strategy', timestamp: '2 hours ago', preview: 'Created 30-day content calendar...' },
    { id: '2', title: 'Marketing Campaign', timestamp: '1 day ago', preview: 'Launched Facebook and Instagram ads...' },
    { id: '3', title: 'Business Analysis', timestamp: '3 days ago', preview: 'Revenue up 15% this quarter...' }
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Load available agents on mount and when mention query changes (debounced locally)
  useEffect(() => {
    let abort = false;
    const load = async () => {
      try {
        const agents = await listAvailableAgents(mentionQuery);
        if (!abort) {
          setAvailableAgents(
            (agents || []).map(a => ({
              id: a.agent_id,
              name: a.name,
              description: a.description,
              icon: a.icon || '🤖',
              category: a.category,
            }))
          );
        }
      } catch (e) {
        if (!abort) console.warn('Failed to load agents', e);
      }
    };
    // simple debounce
    const t = setTimeout(load, 200);
    return () => { abort = true; clearTimeout(t); };
  }, [mentionQuery]);

  // Mock functions - replace with your actual API calls
  const executeAgentAction = async (action, params) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { data: `Mock response for ${action}`, success: true };
  };

  const createWorkflow = async (description) => {
    // Simulate workflow creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { workflow_id: `wf_${Date.now()}`, status: 'created' };
  };

  // Handle input changes for mentions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Check for @ mention
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1);
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionQuery(afterAt);
        setShowAgentMentions(true);
      } else {
        setShowAgentMentions(false);
      }
    } else {
      setShowAgentMentions(false);
    }
  };

  // Handle agent mention selection
  const handleAgentMention = (agent) => {
    const lastAtIndex = inputValue.lastIndexOf('@');
    const beforeAt = inputValue.substring(0, lastAtIndex);
    const afterMention = inputValue.substring(lastAtIndex + mentionQuery.length + 1);
    
    setInputValue(`${beforeAt}@${agent.name}${afterMention}`);
    setShowAgentMentions(false);
    setMentionQuery('');
  };

  // Filter agents based on mention query
  const filteredAgents = availableAgents.filter(agent =>
    !mentionQuery || agent.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    agent.id.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      // Determine mentioned agent (if any)
      const atIdx = messageText.lastIndexOf('@');
      let chosenAgent = null;
      if (atIdx !== -1) {
        const after = messageText.slice(atIdx + 1).split(/\s|\n/)[0];
        // match against available agents by name or id
        const byName = availableAgents.find(a => a.name.toLowerCase() === after.toLowerCase());
        const byId = availableAgents.find(a => a.id.toLowerCase() === after.toLowerCase());
        chosenAgent = byName || byId || null;
      }

      const agentId = chosenAgent?.id || 'orchestrator';
      setActiveAgent(agentId);

      const dispatch = await sendTaskToAgent(agentId, {
        description: messageText,
        context: {},
        priority: 'normal',
        attachments: [],
      });

      // Create assistant response
      let responseContent = "I'm working on that for you! ";
      let actions = [];

      if (dispatch?.task_id) {
        responseContent += `Task accepted (ID: ${dispatch.task_id}). I'll update you here as it progresses. `;
        actions.push('🔔 Notify me on completion');
        triggerCelebration(CelebrationType.TASK_COMPLETE, {
          message: 'Task queued with the agent! 🎯',
          intensity: 'normal',
        });
      }

      if (!actions.length) {
        actions = ['📊 View Dashboard', '🔍 Get More Details'];
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        actions: actions,
        agentId: activeAgent
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `I apologize, but I encountered an issue: ${err.message}\n\nLet me try a different approach. Can you provide a bit more detail about what you'd like to accomplish?`,
        timestamp: new Date(),
        actions: ['🔄 Try Again', '📞 Get Help'],
        agentId: 'support'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleActionClick = (action) => {
    if (action.includes('Dashboard') || action.includes('Analytics')) {
      onNavigateToDashboard?.();
    } else if (action.includes('Workflow')) {
      // Navigate to workflow details
      triggerCelebration(CelebrationType.MILESTONE_REACHED, {
        message: "Taking action! 🚀",
        intensity: 'normal'
      });
    } else {
      // Handle other actions
      const actionMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: `I want to: ${action}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, actionMessage]);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Sidebar - Chat History */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Guild AI</h1>
              <p className="text-sm text-gray-500">Your Business Assistant</p>
            </div>
          </div>
          
          <button 
            onClick={() => setMessages([messages[0]])}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Conversations</h3>
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <motion.div
                  key={chat.id}
                  className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h4 className="text-sm font-medium text-gray-900 truncate">{chat.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 truncate">{chat.preview}</p>
                  <p className="text-xs text-gray-400 mt-1">{chat.timestamp}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="p-4 border-t border-gray-100">
          <div className="space-y-2">
            <button
              onClick={onNavigateToDashboard}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2"
            >
              <BarChart className="w-4 h-4" />
              <span>View Dashboard</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AgentAvatar 
                agentId={activeAgent} 
                status={isLoading ? 'working' : 'idle'} 
                size="medium"
                showTooltip={false}
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">
                    {isLoading ? 'Working...' : 'Online'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Ready to help grow your business</p>
              <p className="text-xs text-gray-400">No technical knowledge required</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex items-start space-x-3 mb-6 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {message.type === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <AgentAvatar 
                        agentId={message.agentId || 'strategy'} 
                        status="working" 
                        size="small"
                        showTooltip={false}
                      />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`max-w-3xl ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto'
                        : 'bg-white border border-gray-200 shadow-sm'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                    
                    {/* Message Actions */}
                    {message.actions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleActionClick(action)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded-lg border border-blue-200 transition-colors flex items-center space-x-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span>{action}</span>
                            <ArrowRight className="w-3 h-3" />
                          </motion.button>
                        ))}
                      </div>
                    )}
                    
                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-xl border border-gray-200 text-left transition-colors"
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                className="flex items-start space-x-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AgentAvatar 
                  agentId={activeAgent} 
                  status="working" 
                  size="small"
                  showTooltip={false}
                />
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Tell me what you'd like to work on... (e.g., '@CampaignManager, increase my budget')"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                  disabled={isLoading}
                />
                
                {/* Agent Mentions Dropdown */}
                {showAgentMentions && filteredAgents.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                    {filteredAgents.map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => handleAgentMention(agent)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                      >
                        <span className="text-lg">{agent.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{agent.name}</div>
                          <div className="text-sm text-gray-500">{agent.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <motion.button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </motion.button>
            </form>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              I'll help you understand everything step by step - no technical knowledge needed!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
