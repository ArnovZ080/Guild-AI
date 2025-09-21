import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
import { 
  Send, 
  MessageSquare, 
  BarChart, 
  Settings, 
  User, 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2,
  Download,
  FileText,
  Image,
  Calendar,
  Brain,
  Zap,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  FileCheck,
  Plus,
  X
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations.fixed';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';

const EnhancedChatInterface = ({ onNavigateToDashboard }) => {
  const { triggerCelebration } = useCelebrations();
  const { currentMode, timeOfDay } = useAdaptiveMode();
  
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
          ],
          agentId: 'orchestrator'
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
          ],
          agentId: 'orchestrator'
        }
      ];
    }
  });
  
  const [showAgentMentions, setShowAgentMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState('orchestrator');
  const [showDashboardButton, setShowDashboardButton] = useState(false);
  
  // Available agents for mentions
  const availableAgents = [
    { id: 'orchestrator', name: 'Orchestrator', description: 'Main business coordinator', icon: '🎯', color: 'blue' },
    { id: 'campaignmanager', name: 'Campaign Manager', description: 'Marketing campaigns and ad management', icon: '📊', color: 'green' },
    { id: 'contentcreator', name: 'Content Creator', description: 'Social media and blog content', icon: '✍️', color: 'purple' },
    { id: 'financialanalyst', name: 'Financial Analyst', description: 'Financial reports and analysis', icon: '💰', color: 'yellow' },
    { id: 'leadgenerator', name: 'Lead Generator', description: 'Prospect identification and outreach', icon: '🎯', color: 'orange' },
    { id: 'customerrelations', name: 'Customer Relations', description: 'Customer support and communication', icon: '🤝', color: 'pink' },
    { id: 'scheduler', name: 'Personal Assistant', description: 'Calendar and task scheduling', icon: '📅', color: 'indigo' },
    { id: 'researcher', name: 'Researcher', description: 'Market research and analysis', icon: '🔍', color: 'teal' },
    { id: 'designer', name: 'Designer', description: 'Visual content and branding', icon: '🎨', color: 'rose' },
    { id: 'writer', name: 'Writer', description: 'Copywriting and content writing', icon: '📝', color: 'cyan' },
    { id: 'analytics', name: 'Analytics', description: 'Data analysis and insights', icon: '📈', color: 'emerald' }
  ];
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Adaptive theming based on current mode
  const getAdaptiveClasses = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950',
          primary: 'from-blue-500 to-indigo-600',
          secondary: 'bg-blue-50 dark:bg-blue-950/50',
          text: 'text-blue-900 dark:text-blue-100',
          border: 'border-blue-200 dark:border-blue-800'
        };
      case 'active':
        return {
          background: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950 dark:to-teal-950',
          primary: 'from-emerald-500 to-teal-600',
          secondary: 'bg-emerald-50 dark:bg-emerald-950/50',
          text: 'text-emerald-900 dark:text-emerald-100',
          border: 'border-emerald-200 dark:border-emerald-800'
        };
      case 'evening':
        return {
          background: 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-amber-950 dark:to-orange-950',
          primary: 'from-amber-500 to-orange-600',
          secondary: 'bg-amber-50 dark:bg-amber-950/50',
          text: 'text-amber-900 dark:text-amber-100',
          border: 'border-amber-200 dark:border-amber-800'
        };
      default:
        return {
          background: 'bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-slate-900 dark:via-slate-950 dark:to-zinc-950',
          primary: 'from-gray-500 to-slate-600',
          secondary: 'bg-gray-50 dark:bg-gray-950/50',
          text: 'text-gray-900 dark:text-gray-100',
          border: 'border-gray-200 dark:border-gray-800'
        };
    }
  };

  const adaptiveClasses = getAdaptiveClasses();

  // Mock functions - replace with your actual API calls
  const executeAgentAction = async (action, params) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { data: `Mock response for ${action}`, success: true };
  };

  const createWorkflow = async (description) => {
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
    agent.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
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
      let agentResponse;
      let result;
      const lowerMessage = messageText.toLowerCase();
      
      // Determine which agent to use based on message content
      if (lowerMessage.includes('content') || lowerMessage.includes('social media')) {
        setActiveAgent('contentcreator');
        agentResponse = await executeAgentAction('create_content', {
          content_request: {
            topic: 'Social Media Content',
            format: 'social_posts',
            audience: 'business_customers',
            tone: 'professional',
            user_input: messageText
          }
        });
      } else if (lowerMessage.includes('marketing') || lowerMessage.includes('strategy')) {
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
      } else if (lowerMessage.includes('plan') || lowerMessage.includes('30 days')) {
        setActiveAgent('orchestrator');
        result = await createWorkflow(messageText);
      } else if (lowerMessage.includes('analyze') || lowerMessage.includes('performance') || lowerMessage.includes('report')) {
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
      let responseContent = "I'm working on that for you! ";
      let actions = [];
      let files = [];

      if (result?.workflow_id) {
        responseContent += `I've created a workflow (ID: ${result.workflow_id}) to handle this request. `;
        actions.push('📋 View Workflow Details', '✅ Approve Plan');
        setShowDashboardButton(true);
        
        // Trigger celebration for workflow creation
        triggerCelebration(CelebrationType.TASK_COMPLETE, {
          message: "Workflow created successfully! 🎯",
          intensity: 'normal'
        });
      }

      if (agentResponse?.data) {
        responseContent += "\n\nHere's what I found:\n" + JSON.stringify(agentResponse.data, null, 2);
        actions.push('📊 View Dashboard', '🔍 Get More Details');
        setShowDashboardButton(true);
        
        // Add file delivery for reports
        if (lowerMessage.includes('report') || lowerMessage.includes('analysis')) {
          files.push({
            name: 'Business Analysis Report.pdf',
            type: 'pdf',
            size: '2.3 MB',
            url: '#'
          });
        }
        
        // Trigger celebration for successful analysis
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: "Analysis complete! 📈",
          intensity: 'subtle'
        });
      }

      if (!actions.length) {
        actions = ['📊 View Dashboard', '🔍 Get More Details'];
        setShowDashboardButton(true);
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        actions: actions,
        files: files,
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
      triggerCelebration(CelebrationType.MILESTONE, {
        message: "Navigating to dashboard! 🚀",
        intensity: 'normal'
      });
    } else if (action.includes('Workflow')) {
      triggerCelebration(CelebrationType.COLLABORATION, {
        message: "Taking action! 🎯",
        intensity: 'normal'
      });
    } else {
      const actionMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: `I want to: ${action}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, actionMessage]);
    }
  };

  const handleFileDownload = (file) => {
    // Mock file download
    console.log(`Downloading ${file.name}`);
    triggerCelebration(CelebrationType.EFFICIENCY, {
      message: `Downloaded ${file.name}! 📄`,
      intensity: 'subtle'
    });
  };

  const getAgentInfo = (agentId) => {
    return availableAgents.find(agent => agent.id === agentId) || availableAgents[0];
  };

  return (
    <div className={`flex h-screen ${adaptiveClasses.background}`}>
      {/* Sidebar - Chat History */}
      <div className={`w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-r ${adaptiveClasses.border} flex flex-col`}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-10 h-10 bg-gradient-to-r ${adaptiveClasses.primary} rounded-lg flex items-center justify-center`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${adaptiveClasses.text}`}>Guild AI</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your Business Assistant</p>
            </div>
          </div>
          
          <button 
            onClick={() => setMessages([messages[0]])}
            className={`w-full bg-gradient-to-r ${adaptiveClasses.primary} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Conversations</h3>
            <div className="space-y-2">
              {[
                { id: '1', title: 'Social Media Strategy', timestamp: '2 hours ago', preview: 'Created 30-day content calendar...' },
                { id: '2', title: 'Marketing Campaign', timestamp: '1 day ago', preview: 'Launched Facebook and Instagram ads...' },
                { id: '3', title: 'Business Analysis', timestamp: '3 days ago', preview: 'Revenue up 15% this quarter...' }
              ].map((chat) => (
                <motion.div
                  key={chat.id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{chat.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{chat.preview}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{chat.timestamp}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-2">
            <button
              onClick={onNavigateToDashboard}
              className={`w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-2`}
            >
              <BarChart className="w-4 h-4" />
              <span>View Dashboard</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b ${adaptiveClasses.border} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${adaptiveClasses.primary} flex items-center justify-center`}>
                <span className="text-lg">{getAgentInfo(activeAgent).icon}</span>
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${adaptiveClasses.text}`}>{getAgentInfo(activeAgent).name}</h2>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {isLoading ? 'Working...' : 'Online'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ready to help grow your business</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">No technical knowledge required</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50">
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
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${adaptiveClasses.primary} flex items-center justify-center`}>
                        <span className="text-sm">{getAgentInfo(message.agentId).icon}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`max-w-3xl ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? `bg-gradient-to-r ${adaptiveClasses.primary} text-white ml-auto`
                        : 'bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                    
                    {/* File Attachments */}
                    {message.files && message.files.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.files.map((file, idx) => (
                          <motion.div
                            key={idx}
                            className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-slate-700/60 rounded-lg border border-gray-200 dark:border-gray-600 backdrop-blur-sm"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            {file.type === 'pdf' ? (
                              <FileText className="w-5 h-5 text-red-500" />
                            ) : (
                              <Image className="w-5 h-5 text-blue-500" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {file.size}
                              </p>
                            </div>
                            <button
                              onClick={() => handleFileDownload(file)}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {/* Message Actions */}
                    {message.actions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleActionClick(action)}
                            className={`px-3 py-1.5 ${adaptiveClasses.secondary} hover:opacity-80 ${adaptiveClasses.text} text-xs rounded-lg border ${adaptiveClasses.border} transition-colors flex items-center space-x-1`}
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
                            className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-xl border border-gray-200 dark:border-gray-600 text-left transition-colors"
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
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
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${adaptiveClasses.primary} flex items-center justify-center`}>
                  <span className="text-sm">{getAgentInfo(activeAgent).icon}</span>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm backdrop-blur-sm">
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
        <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t ${adaptiveClasses.border} px-6 py-4`}>
          <div className="max-w-4xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Tell me what you'd like to work on... (e.g., '@Personal Assistant, schedule a meeting')"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 transition-colors"
                  disabled={isLoading}
                />
                
                {/* Agent Mentions Dropdown */}
                {showAgentMentions && filteredAgents.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                    {filteredAgents.map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => handleAgentMention(agent)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 flex items-center space-x-3"
                      >
                        <span className="text-lg">{agent.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{agent.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{agent.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <motion.button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`px-6 py-3 bg-gradient-to-r ${adaptiveClasses.primary} text-white rounded-2xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </motion.button>
            </form>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              I'll help you understand everything step by step - no technical knowledge needed!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
