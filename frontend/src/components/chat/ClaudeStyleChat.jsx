import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Send, 
  Settings, 
  User,
  Zap,
  Home,
  Grid3X3,
  Target,
  Trophy,
  TrendingUp,
  Users,
  ArrowRight
} from 'lucide-react';
import { useCelebrations } from '../psychological/EnhancedMicroCelebrations.tsx';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';
import { useAgentCommunication } from '../../contexts/AgentCommunicationContext';
import onboardingFollowUpService from '../../services/onboardingFollowUpService';

const ClaudeStyleChat = ({ onNavigateToDashboard, onNavigateToMarketplace, onNavigateToCalendar, onNavigateToGoals, onNavigateToAchievements, onNavigateToGrowth, onNavigateToCustomers, onNavigateToConversations, onNavigateToConnectors }) => {
  const { triggerCelebration } = useCelebrations();
  const { timeOfDay } = useAdaptiveMode();
  const { sendTaskToAgent, hasPendingResponses } = useAgentCommunication();
  
  // --- STATE MANAGEMENT & INITIALIZATION ---
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState('orchestrator');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: '1', title: 'Business Strategy Discussion', timestamp: new Date(Date.now() - 86400000), preview: 'Let\'s discuss your growth strategy...' },
    { id: '2', title: 'Content Creation Planning', timestamp: new Date(Date.now() - 172800000), preview: 'I can help you create compelling content...' }
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // User and Onboarding data
  const userName = "Arno van Zyl"; 
  const onboardingData = JSON.parse(localStorage.getItem('guild_onboarding_data') || '{}');
  const hasCompletedOnboarding = localStorage.getItem('guild_onboarding_completed') === 'true';

  // Follow-up questions from onboarding
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [currentFollowUp, setCurrentFollowUp] = useState(null);

  const getSuggestedActions = () => {
    if (!hasCompletedOnboarding) return [];

    // Get pending follow-up questions from the service
    const nextFollowUp = onboardingFollowUpService.getNextFollowUpQuestion();
    
    if (nextFollowUp) {
      return [{
        id: nextFollowUp.id,
        label: nextFollowUp.followUpQuestion,
        action: nextFollowUp.action,
        icon: '🧠',
        priority: nextFollowUp.priority
      }];
    }

    return [];
  };

  const suggestedActions = getSuggestedActions();

  useEffect(() => {
    if (messages.length === 0) {
      const firstTask = onboardingData.firstTask ? `I'm ready to help you with ${onboardingData.firstTask}.` : `How can I help you today?`;
      const initialMessageContent = `Good ${timeOfDay.toLowerCase()}, ${userName}! I see you've completed your onboarding. Based on your business profile, ${firstTask}`;
      
      setMessages([{
        id: '1',
        type: 'assistant',
        content: initialMessageContent,
        timestamp: new Date(),
        agentId: 'orchestrator'
      }]);
    }
    
    scrollToBottom();
  }, []);

  useEffect(scrollToBottom, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (messageText = inputValue, actionName) => {
    if (!messageText.trim() && !actionName) return;

    setIsLoading(true);
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Handle follow-up actions from onboarding
    if (actionName && actionName.type === 'orchestrator_initiate') {
      try {
        // Complete the follow-up question
        const followUpId = suggestedActions.find(a => a.action === actionName)?.id;
        if (followUpId) {
          onboardingFollowUpService.completeFollowUpQuestion(followUpId, messageText);
        }

        // Initiate orchestrator action
        const result = await onboardingFollowUpService.initiateOrchestratorAction(actionName, 'chat_session');
        
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `Perfect! I'm initiating the ${actionName.description}. This will involve ${actionName.agents.join(', ')} to help you with this. You'll receive updates as we work on this together.`,
          timestamp: new Date(),
          agentId: 'orchestrator',
          actionInitiated: true
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Trigger celebration for taking action
        triggerCelebration({
          type: 'action_initiated',
          message: 'Great! We\'re working on this for you.',
          emoji: '🚀'
        });
        
      } catch (error) {
        console.error('Error initiating orchestrator action:', error);
        
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: "I encountered an issue initiating that action. Let me try a different approach to help you.",
          timestamp: new Date(),
          agentId: 'orchestrator'
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } else if (actionName) {
      // Handle other action types
      console.log(`Sending specific action to backend: ${actionName}`);
      // sendTaskToAgent(actionName, userMessage);
    }

    // Default response for regular messages
    if (!actionName || actionName.type !== 'orchestrator_initiate') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm processing your request and will provide a comprehensive response shortly.",
        timestamp: new Date(),
        agentId: 'orchestrator'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }
    
    setIsLoading(false);
  };

  const handleNewChat = () => {
    if (messages.length > 1) {
      const firstUserMessage = messages.find(m => m.type === 'user');
      const chatTitle = firstUserMessage ? firstUserMessage.content.substring(0, 30) + '...' : 'New Chat';
      const newChat = {
        id: Date.now().toString(),
        title: chatTitle,
        timestamp: new Date(),
        preview: firstUserMessage ? firstUserMessage.content : 'Empty Chat'
      };
      setChatHistory(prev => [newChat, ...prev]);
    }

    const initialMessageContent = `Good ${timeOfDay.toLowerCase()}, ${userName}! I'm your AI business assistant. How can I help you today?`;
    setMessages([{
      id: '1',
      type: 'assistant',
      content: initialMessageContent,
      timestamp: new Date(),
      agentId: 'orchestrator'
    }]);
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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Left Sidebar */}
      <div 
        className={`${sidebarExpanded ? 'w-64' : 'w-16'} flex-shrink-0 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out group`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="p-4 border-b border-border flex items-center justify-between h-14">
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.h2 
                className="text-lg font-semibold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                Guild AI
              </motion.h2>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <button 
            onClick={handleNewChat}
            className={`${sidebarExpanded ? 'w-full px-4' : 'w-10'} h-10 bg-primary hover:bg-primary-foreground hover:text-primary text-white rounded-lg flex items-center justify-center transition-all duration-300 group`}
          >
            <Plus className={`${sidebarExpanded ? '' : 'w-5 h-5'}`} />
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.span 
                  className="ml-2 font-medium"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  New Chat
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {sidebarExpanded && (
          <div className="flex-1 overflow-y-auto px-4 mt-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Chats</h3>
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                >
                  <div className="font-medium text-sm text-foreground truncate">
                    {chat.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-1">
                    {chat.preview}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-border">
          <div className={`${sidebarExpanded ? 'space-y-2' : 'flex flex-col space-y-4'}`}>
            <button 
              onClick={onNavigateToDashboard}
              className={`${sidebarExpanded ? 'w-full px-3 py-2 flex items-center' : 'w-10 h-10 flex items-center justify-center'} text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors`}
            >
              <Home className="w-5 h-5" />
              <AnimatePresence>
                {sidebarExpanded && (
                  <motion.span 
                    className="ml-3 text-sm"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Dashboard
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            {/* ... Other navigation buttons ... */}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className={`${sidebarExpanded ? 'flex items-center' : 'flex justify-center'}`}>
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              AV
            </div>
            {sidebarExpanded && (
              <div className="ml-3">
                <div className="text-sm font-medium text-foreground">{userName}</div>
                <div className="text-xs text-muted-foreground">Free Plan</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        <div className="flex items-center justify-end px-6 py-4 border-b border-border h-14">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Free plan</span>
              <span>•</span>
              <button className="underline hover:text-foreground transition-colors">
                Upgrade
              </button>
            </div>
            
            <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex items-start space-x-4 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground">
                    {message.type === 'user' ? (
                      <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm">{getAgentInfo(message.agentId).icon}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-2xl text-base ${
                      message.type === 'user'
                        ? 'bg-secondary text-foreground px-4 py-3 rounded-2xl'
                        : 'text-foreground'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                className="flex items-start space-x-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  <span className="text-sm">{getAgentInfo(activeAgent).icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-muted-foreground rounded-full"
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

        <div className="px-6 py-4 border-t border-border bg-card">
          <div className="max-w-3xl mx-auto">
            {messages.length <= 1 && suggestedActions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Would you like to work on the following next, or would you like to work on something else first?
                </h3>
                <div className="flex flex-wrap gap-2 justify-start">
                  {suggestedActions.map((action) => (
                    <motion.button
                      key={action.id || action.action}
                      onClick={() => handleSendMessage(action.label, action.action)}
                      className="px-4 py-2 bg-secondary hover:bg-muted text-muted-foreground text-sm rounded-full border border-border transition-colors flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                      <ArrowRight className="w-4 h-4 ml-1 text-primary"/>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="How can I help you today?"
                  className="w-full px-4 py-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground bg-input placeholder-muted-foreground"
                  disabled={isLoading}
                />
                
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                  <motion.button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="w-8 h-8 bg-primary hover:bg-primary-foreground text-white rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Use '@' to call and speak to a specific Agent.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaudeStyleChat;