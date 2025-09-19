import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Send, 
  Settings, 
  ChevronDown,
  FileText,
  Image,
  Paperclip,
  MoreHorizontal,
  User,
  Bot,
  Sparkles,
  BarChart3,
  Calendar,
  Zap,
  Brain,
  MessageSquare,
  Home,
  Folder,
  Grid3X3,
  Target,
  Trophy,
  TrendingUp,
  Users
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';
import { useAgentCommunication } from '../../contexts/AgentCommunicationContext';
import AgentMessageHandler from '../agents/AgentMessageHandler';
import TaskDelegationPanel from '../agents/TaskDelegationPanel';

const ClaudeStyleChat = ({ onNavigateToDashboard, onNavigateToMarketplace, onNavigateToCalendar, onNavigateToGoals, onNavigateToAchievements, onNavigateToGrowth, onNavigateToCustomers, onNavigateToConversations, onNavigateToConnectors }) => {
  const { triggerCelebration } = useCelebrations();
  const { currentMode, timeOfDay } = useAdaptiveMode();
  const { 
    sendTaskToAgent, 
    activeSessions, 
    pendingResponses, 
    hasPendingResponses,
    agentMessages 
  } = useAgentCommunication();
  
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
          content: `Good ${timeOfDay.toLowerCase()}, Arno! I see you've completed your onboarding. Based on your business profile, I'm ready to help you with ${data.firstTask || 'your business goals'}. What would you like to work on today?`,
          timestamp: new Date(),
          agentId: 'orchestrator'
        }
      ];
    } else {
      return [
        {
          id: '1',
          type: 'assistant',
          content: `Good ${timeOfDay.toLowerCase()}, Arno! I'm your AI business assistant. I'm here to help you grow your business without the technical complexity. How can I help you today?`,
          timestamp: new Date(),
          agentId: 'orchestrator'
        }
      ];
    }
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState('orchestrator');
  const [showAgentMentions, setShowAgentMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('Guild AI Pro');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: '1', title: 'New Chat', timestamp: new Date(), preview: 'Good morning! How can I help you today?' },
    { id: '2', title: 'Business Strategy Discussion', timestamp: new Date(Date.now() - 86400000), preview: 'Let\'s discuss your growth strategy...' },
    { id: '3', title: 'Content Creation Planning', timestamp: new Date(Date.now() - 172800000), preview: 'I can help you create compelling content...' }
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Available models
  const availableModels = [
    { id: 'guild-pro', name: 'Guild AI Pro', description: 'Most capable for complex tasks' },
    { id: 'guild-standard', name: 'Guild AI Standard', description: 'Balanced performance and speed' },
    { id: 'guild-fast', name: 'Guild AI Fast', description: 'Quick responses for simple tasks' }
  ];

  // Quick action modes
  const quickActions = [
    { id: 'write', label: 'Write', icon: '✍️', description: 'Content creation and writing' },
    { id: 'learn', label: 'Learn', icon: '🎓', description: 'Business education and insights' },
    { id: 'code', label: 'Code', icon: '</>', description: 'Technical development' },
    { id: 'business', label: 'Business', icon: '💼', description: 'Business strategy and operations' },
    { id: 'creative', label: 'Creative', icon: '🎨', description: 'Creative and design tasks' }
  ];

  // Mock functions - replace with your actual API calls
  const executeAgentAction = async (action, params) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { data: `Mock response for ${action}`, success: true };
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
      let agentResponse;
      const lowerMessage = messageText.toLowerCase();
      
      // Determine which agent to use based on message content
      if (lowerMessage.includes('content') || lowerMessage.includes('write') || lowerMessage.includes('blog')) {
        setActiveAgent('contentcreator');
        agentResponse = await executeAgentAction('create_content', {
          content_request: {
            topic: 'Content Creation',
            format: 'blog_post',
            audience: 'business_customers',
            tone: 'professional',
            user_input: messageText
          }
        });
      } else if (lowerMessage.includes('marketing') || lowerMessage.includes('strategy') || lowerMessage.includes('business')) {
        setActiveAgent('campaignmanager');
        agentResponse = await executeAgentAction('launch_campaign', {
          name: 'Marketing Strategy Discussion',
          user_request: messageText,
          status: 'planning'
        });
      } else if (lowerMessage.includes('schedule') || lowerMessage.includes('calendar') || lowerMessage.includes('meeting')) {
        setActiveAgent('scheduler');
        agentResponse = await executeAgentAction('schedule_meeting', {
          user_request: messageText,
          context: 'calendar_management'
        });
      } else if (lowerMessage.includes('analyze') || lowerMessage.includes('report') || lowerMessage.includes('data')) {
        setActiveAgent('analytics');
        agentResponse = await executeAgentAction('analyze_performance', {
          user_query: messageText,
          context: 'business_analysis'
        });
      } else {
        setActiveAgent('orchestrator');
        agentResponse = await executeAgentAction('general_assistance', {
          user_query: messageText,
          context: 'business_chat'
        });
      }

      // Create assistant response
      let responseContent = "I'll help you with that! ";
      
      if (agentResponse?.data) {
        responseContent += "\n\nHere's what I found:\n" + JSON.stringify(agentResponse.data, null, 2);
        
        // Trigger celebration for successful response
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: "Response generated! ✨",
          intensity: 'subtle'
        });
      } else {
        responseContent += "I'm processing your request and will provide a comprehensive response shortly.";
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        agentId: activeAgent
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `I apologize, but I encountered an issue: ${err.message}\n\nLet me try a different approach. Can you provide a bit more detail about what you'd like to accomplish?`,
        timestamp: new Date(),
        agentId: 'support'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    const actionPrompts = {
      write: "Help me create compelling content for my business",
      learn: "Teach me something new about business strategy",
      code: "Help me with a technical development task",
      business: "Assist me with business strategy and operations",
      creative: "Help me with creative and design tasks"
    };
    
    handleSendMessage(actionPrompts[action.id]);
  };

  const getAgentInfo = (agentId) => {
    const agents = {
      orchestrator: { name: 'Orchestrator', icon: '🎯' },
      contentcreator: { name: 'Content Creator', icon: '✍️' },
      campaignmanager: { name: 'Campaign Manager', icon: '📊' },
      scheduler: { name: 'Personal Assistant', icon: '📅' },
      analytics: { name: 'Analytics Agent', icon: '📈' },
      support: { name: 'Support Agent', icon: '🤝' }
    };
    return agents[agentId] || agents.orchestrator;
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Left Sidebar - Expandable */}
      <div className={`${sidebarExpanded ? 'w-64' : 'w-16'} bg-gray-50 dark:bg-gray-800 flex flex-col transition-all duration-300 border-r border-gray-200 dark:border-gray-700`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarExpanded && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Guild AI</h2>
            )}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={() => setMessages([messages[0]])}
            className={`${sidebarExpanded ? 'w-full px-4' : 'w-10'} h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-all duration-300`}
          >
            <Plus className="w-5 h-5" />
            {sidebarExpanded && <span className="ml-2 font-medium">New Chat</span>}
          </button>
        </div>

        {/* Chat History */}
        {sidebarExpanded && (
          <div className="flex-1 overflow-y-auto px-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Recent Chats</h3>
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {chat.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {chat.preview}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {chat.timestamp.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Icons */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`${sidebarExpanded ? 'space-y-2' : 'flex flex-col space-y-4'}`}>
            <button className={`${sidebarExpanded ? 'w-full px-3 py-2 flex items-center' : 'w-10 h-10 flex items-center justify-center'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}>
              <Home className="w-5 h-5" />
              {sidebarExpanded && <span className="ml-3 text-sm">Dashboard</span>}
            </button>
            <button 
              onClick={onNavigateToMarketplace}
              className={`${sidebarExpanded ? 'w-full px-3 py-2 flex items-center' : 'w-10 h-10 flex items-center justify-center'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <Zap className="w-5 h-5" />
              {sidebarExpanded && <span className="ml-3 text-sm">Agents</span>}
            </button>
            <button 
              onClick={onNavigateToCalendar}
              className={`${sidebarExpanded ? 'w-full px-3 py-2 flex items-center' : 'w-10 h-10 flex items-center justify-center'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <Calendar className="w-5 h-5" />
              {sidebarExpanded && <span className="ml-3 text-sm">Calendar</span>}
            </button>
            <button 
              onClick={onNavigateToGoals}
              className={`${sidebarExpanded ? 'w-full px-3 py-2 flex items-center' : 'w-10 h-10 flex items-center justify-center'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <Target className="w-5 h-5" />
              {sidebarExpanded && <span className="ml-3 text-sm">Goals</span>}
            </button>
            <button 
              onClick={onNavigateToAchievements}
              className={`${sidebarExpanded ? 'w-full px-3 py-2 flex items-center' : 'w-10 h-10 flex items-center justify-center'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <Trophy className="w-5 h-5" />
              {sidebarExpanded && <span className="ml-3 text-sm">Achievements</span>}
            </button>
            <button 
              onClick={onNavigateToGrowth}
              className={`${sidebarExpanded ? 'w-full px-3 py-2 flex items-center' : 'w-10 h-10 flex items-center justify-center'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <TrendingUp className="w-5 h-5" />
              {sidebarExpanded && <span className="ml-3 text-sm">Growth</span>}
            </button>
            <button 
              onClick={onNavigateToCustomers}
              className={`${sidebarExpanded ? 'w-full px-3 py-2 flex items-center' : 'w-10 h-10 flex items-center justify-center'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <Users className="w-5 h-5" />
              {sidebarExpanded && <span className="ml-3 text-sm">Customers</span>}
            </button>
            <button 
              onClick={onNavigateToConversations}
              className={`${sidebarExpanded ? 'w-full px-3 py-2 flex items-center' : 'w-10 h-10 flex items-center justify-center'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <MessageSquare className="w-5 h-5" />
              {sidebarExpanded && <span className="ml-3 text-sm">Conversations</span>}
            </button>
            <button 
              onClick={onNavigateToConnectors}
              className={`${sidebarExpanded ? 'w-full px-3 py-2 flex items-center' : 'w-10 h-10 flex items-center justify-center'} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <Settings className="w-5 h-5" />
              {sidebarExpanded && <span className="ml-3 text-sm">Connectors</span>}
            </button>
          </div>
        </div>

        {/* Bottom User Avatar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`${sidebarExpanded ? 'flex items-center' : 'flex justify-center'}`}>
            <div className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-medium">
              AV
            </div>
            {sidebarExpanded && (
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Arno van Zyl</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Free Plan</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Guild AI</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Free plan</span>
              <span>•</span>
              <button className="underline hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Upgrade
              </button>
            </div>
            
            <button className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex items-start space-x-4 mb-8 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {message.type === 'user' ? (
                      <div className="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                        <span className="text-sm">{getAgentInfo(message.agentId).icon}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-4xl ${
                      message.type === 'user'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 rounded-2xl'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                className="flex items-start space-x-4 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                  <span className="text-sm">{getAgentInfo(activeAgent).icon}</span>
                </div>
                <div className="flex-1">
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
            
            {/* Agent Communication Components */}
            <div className="mt-8 space-y-6">
              <AgentMessageHandler 
                onMessageReceived={(message) => {
                  // Handle agent message responses
                  console.log('Agent message received:', message);
                }}
              />
              
              {hasPendingResponses && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">
                      You have {Object.keys(pendingResponses).length} pending clarification request(s) from agents
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickActions.map((action) => (
                    <motion.button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full border border-gray-200 dark:border-gray-600 transition-colors flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="How can I help you today?"
                  className="w-full px-4 py-3 pr-20 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
                
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {/* Attach Button */}
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  
                  {/* Model Selector */}
                  <div className="relative">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="appearance-none bg-transparent border-none text-sm text-gray-600 dark:text-gray-400 focus:outline-none cursor-pointer pr-6"
                    >
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.name}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  
                  {/* Send Button */}
                  <motion.button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Guild AI can make mistakes. Consider checking important information.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaudeStyleChat;
