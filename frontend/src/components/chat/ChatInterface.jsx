import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, BarChart, Settings, User, Bot, Sparkles, ArrowRight, Clock, CheckCircle2, Zap, Activity, Eye } from 'lucide-react';
// Removed celebrations to avoid circular deps and runtime init issues
import { listAvailableAgents, sendTaskToAgent } from '../../services/agentsApi.js';
import { loadConversations, saveConversations, archiveThread, loadThread, saveCurrentConversation, loadCurrentConversation, clearCurrentConversation } from '../../services/conversationsStore.js';
import { AgentAvatar } from '../agents/AgentAvatars';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import UnifiedOrchestratorService from '../../services/UnifiedOrchestratorService.js';
import WorkflowTransparencyModal from '../dashboard/modals/WorkflowTransparencyModal.jsx';

const ChatInterface = ({ onNavigateToDashboard }) => {
  const { settings } = useSettings();
  // Check if user has completed onboarding
  const onboardingData = localStorage.getItem('guild_onboarding_data');
  const hasCompletedOnboarding = localStorage.getItem('guild_onboarding_completed') === 'true';
  const userId = settings?.profile?.id || 'user_' + Math.random().toString(36).substr(2, 9);
  
  // Orchestrator integration state
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [showTransparency, setShowTransparency] = useState(null);
  const [systemCapabilities, setSystemCapabilities] = useState(null);
  
  // Initialize Unified Orchestrator Service
  const [orchestratorService] = useState(() => new UnifiedOrchestratorService());
  
  const [messages, setMessages] = useState(() => {
    // First, try to load current conversation from localStorage
    const currentMessages = loadCurrentConversation();
    if (currentMessages && currentMessages.length > 0) {
      return currentMessages;
    }
    
    // If no current conversation, initialize with onboarding-based welcome message
    if (hasCompletedOnboarding && onboardingData) {
      const data = JSON.parse(onboardingData);
      const buildSuggestions = () => {
        try {
          const notSurePhrases = [
            'not sure', "i don't know", 'unsure', 'not sure yet', "i'm not sure",
            "don't know", 'uncertain', 'maybe later', "i haven't really thought",
            "i'm not sure what", "i don't think", "i haven't", "i don't have",
            "don't track", 'not sure what that is'
          ];
          const isUnknown = (val) => {
            if (!val) return true;
            if (typeof val !== 'string') return false;
            const s = val.toLowerCase();
            return notSurePhrases.some(p => s.includes(p));
          };
          const onboarding = JSON.parse(localStorage.getItem('guild_onboarding_data') || '{}');
          const pending = JSON.parse(localStorage.getItem('guild_pending_followups') || '[]');
          const filtered = pending.filter(f => {
            const key = (f.id || '').replace(/^followup_/, '');
            const val = onboarding[key];
            return isUnknown(val);
          });
          const top = filtered.slice(0, 6).map(p => p.followUpQuestion);
          const defaults = [
            'Create content for my social media',
            'Help me with my marketing strategy',
            'Analyze my business performance',
            'Plan my next 30 days',
          ];
          const merged = [...top, ...defaults].filter(Boolean);
          return merged.length ? merged : defaults;
        } catch {
          return [
            'Create content for my social media',
            'Help me with my marketing strategy',
            'Analyze my business performance',
            'Plan my next 30 days',
          ];
        }
      };
      return [
        {
          id: '1',
          type: 'assistant',
          content: `👋 Welcome back${settings?.profile?.firstName ? `, ${settings.profile.firstName}` : ''}! I see you've completed your onboarding. Based on your business profile, I'm ready to help you with ${data.firstTask || 'your business goals'}. What would you like to work on today?`,
          timestamp: new Date(),
          suggestions: buildSuggestions()
        }
      ];
    } else {
      return [
        {
          id: '1',
          type: 'assistant',
          content: `👋 Hello${settings?.profile?.firstName ? `, ${settings.profile.firstName}` : ''}! I'm your AI business assistant. I'm here to help you grow your business without the technical complexity. What would you like to work on today?`,
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
  const [chatHistory, setChatHistory] = useState(() => loadConversations());
  // persist history when it changes (moved below declaration to avoid TDZ)
  useEffect(() => { saveConversations(chatHistory); }, [chatHistory]);
  
  // Persist current messages to localStorage whenever they change
  useEffect(() => {
    if (messages && messages.length > 0) {
      saveCurrentConversation(messages);
    }
  }, [messages]);

  // Listen to onboarding updates (follow-up completion) and refresh first assistant message suggestions
  useEffect(() => {
    const handler = (e) => {
      try {
        const notSurePhrases = [
          'not sure', "i don't know", 'unsure', 'not sure yet', "i'm not sure",
          "don't know", 'uncertain', 'maybe later', "i haven't really thought",
          "i'm not sure what", "i don't think", "i haven't", "i don't have",
          "don't track", 'not sure what that is'
        ];
        const isUnknown = (val) => {
          if (!val) return true;
          if (typeof val !== 'string') return false;
          const s = val.toLowerCase();
          return notSurePhrases.some(p => s.includes(p));
        };
        const onboarding = JSON.parse(localStorage.getItem('guild_onboarding_data') || '{}');
        const pending = JSON.parse(localStorage.getItem('guild_pending_followups') || '[]');
        const filtered = pending.filter(f => {
          const key = (f.id || '').replace(/^followup_/, '');
          const val = onboarding[key];
          return isUnknown(val);
        });
        const defaults = [
          'Create content for my social media',
          'Help me with my marketing strategy',
          'Analyze my business performance',
          'Plan my next 30 days',
        ];
        const merged = [...filtered.slice(0, 6).map(p => p.followUpQuestion), ...defaults].filter(Boolean);
        setMessages(prev => {
          if (!prev.length) return prev;
          const first = prev[0];
          if (first.type !== 'assistant') return prev;
          const updatedFirst = { ...first, suggestions: merged.length ? merged : defaults };
          return [updatedFirst, ...prev.slice(1)];
        });
      } catch {}
    };
    window.addEventListener('guild:onboardingUpdated', handler);
    const newConvHandler = () => {
      if (messages.length > 1) {
        const archived = archiveThread(messages);
        if (archived) setChatHistory(prev => [archived, ...prev]);
      }
      // Start with just the welcome message and clear current conversation
      const welcomeMessage = messages.find(m => m.type === 'assistant') || {
        id: '1',
        type: 'assistant',
        content: `👋 Hello! I'm your AI business assistant. What would you like to work on today?`,
        timestamp: new Date(),
        suggestions: [
          "Create content for my social media",
          "Help me with my marketing strategy", 
          "Analyze my business performance",
          "Plan my next 30 days"
        ]
      };
      setMessages([welcomeMessage]);
      clearCurrentConversation();
    };
    const loadConvHandler = (ev) => {
      const id = ev?.detail?.id;
      if (!id) return;
      const thread = loadThread(id);
      if (thread && thread.length) setMessages(thread);
    };
    window.addEventListener('guild:newConversation', newConvHandler);
    window.addEventListener('guild:loadConversation', loadConvHandler);
    return () => {
      window.removeEventListener('guild:onboardingUpdated', handler);
      window.removeEventListener('guild:newConversation', newConvHandler);
      window.removeEventListener('guild:loadConversation', loadConvHandler);
    };
  }, []);
  
  // Auto-archive conversation when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      // Only archive if there are meaningful messages (more than just the welcome message)
      if (messages && messages.length > 1) {
        const hasUserMessages = messages.some(m => m.type === 'user');
        const hasAssistantMessages = messages.some(m => m.type === 'assistant');
        // Only archive if we have both user and assistant messages (complete conversation)
        if (hasUserMessages && hasAssistantMessages) {
          archiveThread(messages);
        }
      }
    };
  }, []); // Empty dependency array - only run on unmount
  
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
        if (!abort) {
          console.warn('Failed to load agents', e);
          // Fallback list so @mentions still work without API
          setAvailableAgents([
            { id: 'orchestrator', name: 'Orchestrator', description: 'Main coordinator', icon: '🎯', category: 'Core' },
            { id: 'judge', name: 'Judge', description: 'Evaluator League - rubrics/scoring', icon: '⚖️', category: 'Evaluator' },
            { id: 'research', name: 'Research', description: 'Research & analysis', icon: '🔍', category: 'Core' },
            { id: 'contentcreator', name: 'Content Creator', description: 'Content generation', icon: '✍️', category: 'Core' },
            { id: 'analytics', name: 'Analytics', description: 'Data insights', icon: '📈', category: 'Core' },
          ]);
        }
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
      // Always use Enhanced Orchestrator for user messages
      let responseContent = "";
      let actions = [];
      let workflowData = null;

      const orchestrationResult = await orchestratorService.processRequest({
        objective: messageText,
        user_id: userId,
        task_type: 'chat',
        complexity: 'medium',
        context: {
          user_id: userId,
          priority: 'medium'
        }
      });

      if (orchestrationResult?.success) {
        responseContent = orchestrationResult.message || orchestrationResult.response || "✅ I've processed your request.";
        
        // Handle different conversation types
        if (orchestrationResult.conversation_type === 'clarification_needed') {
          // Show clarifying questions - no workflow actions needed
          actions = [];
          workflowData = null;
        } else if (orchestrationResult.conversation_type === 'agent_hiring_suggestion') {
          // Show agent hiring suggestions
          actions = ['✅ Proceed with Available Agents', '💰 Hire Suggested Agents'];
          workflowData = orchestrationResult;
        } else if (orchestrationResult.conversation_type === 'workflow_plan') {
          // Show workflow plan with approval option
          actions = ['✅ Approve & Execute', '❌ Cancel'];
          workflowData = orchestrationResult;
        } else if (orchestrationResult.conversation_type === 'workflow_execution') {
          // Workflow is executing - show monitoring options
          actions = ['👁️ View Transparency', '📊 Monitor Progress', '⚡ View Dashboard'];
          workflowData = orchestrationResult;
          
          // Track active workflow
          setActiveWorkflows(prev => [...prev, {
            id: orchestrationResult.workflow_id,
            name: orchestrationResult.workflow_details?.name || 'Autonomous Workflow',
            created: new Date().toISOString(),
            status: 'running'
          }]);
        } else if (orchestrationResult.workflow_details && orchestrationResult.workflow_id) {
          // Legacy workflow creation
          const workflow = orchestrationResult.workflow_details;
          responseContent += `\n\n📋 **Autonomous Workflow Created:**\n`;
          if (workflow.total_agents != null) responseContent += `• ${workflow.total_agents} specialized agents orchestrated\n`;
          if (workflow.integrations_used != null) responseContent += `• ${workflow.integrations_used} integrations used\n`;
          if (workflow.autonomous_level) responseContent += `• Autonomous Level: ${workflow.autonomous_level}\n`;
          if (workflow.data_sources && workflow.data_sources.length > 0) {
            responseContent += `• Data Sources: ${workflow.data_sources.slice(0, 3).join(', ')}`;
          }
          
          actions = ['👁️ View Transparency', '📊 Monitor Progress', '⚡ View Dashboard'];
          workflowData = orchestrationResult;

          // Track active workflow
          setActiveWorkflows(prev => [...prev, {
            id: orchestrationResult.workflow_id,
            name: orchestrationResult.workflow_details?.name || 'Autonomous Workflow',
            created: new Date().toISOString(),
            status: 'running'
          }]);
        } else {
          // Regular conversation - no workflow actions
          actions = [];
          workflowData = null;
        }
      } else {
        responseContent = "I couldn't process your request right now. Please try again shortly.";
        actions = ['🔄 Try Again'];
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        actions: actions,
        agentId: activeAgent,
        workflowData: workflowData  // Store workflow data for transparency access
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Orchestrator error:', err);
      
      // Provide intelligent fallback responses based on the request
      let fallbackContent = "";
      const lowerMessage = messageText.toLowerCase();
      
      if (lowerMessage.includes('hello') || 
          lowerMessage.includes('hey') || 
          lowerMessage.includes('hi') ||
          lowerMessage.includes('how are you')) {
        fallbackContent = "Hello! I'm doing great, thank you for asking! I'm your AI business orchestrator, ready to help you with any business tasks. I can coordinate our specialized agents to handle content creation, business growth strategies, financial analysis, and much more. What would you like to work on today?";
      } else if (lowerMessage.includes('customer') && lowerMessage.includes('avatar')) {
        fallbackContent = "I'd love to help you work on your customer avatar! While I'm having some technical difficulties with the full orchestrator, I can still assist you with customer avatar development. A customer avatar is a detailed profile of your ideal customer that includes demographics, psychographics, pain points, goals, and behaviors. Would you like me to guide you through creating one, or do you have specific questions about customer avatars?";
      } else if (lowerMessage.includes('guide me') || lowerMessage.includes('guide you')) {
        fallbackContent = `I'd be happy to guide you through creating a customer avatar! Here's a step-by-step approach:

**Step 1: Demographics**
- Age range, gender, location
- Income level, education, occupation
- Family status, lifestyle

**Step 2: Psychographics** 
- Values, interests, hobbies
- Personality traits, lifestyle choices
- Media consumption habits

**Step 3: Pain Points**
- What problems do they face?
- What keeps them up at night?
- What frustrates them most?

**Step 4: Goals & Motivations**
- What are they trying to achieve?
- What motivates their decisions?
- What success looks like to them

**Step 5: Behavior Patterns**
- How do they research solutions?
- Where do they spend time online?
- What influences their purchasing decisions?

Would you like me to help you work through any of these specific areas?`;
      } else if (lowerMessage.includes('marketing') || lowerMessage.includes('strategy')) {
        fallbackContent = "I can definitely help with marketing and strategy! While I'm experiencing some connectivity issues, I can provide guidance on marketing strategies, content creation, and business growth. What specific aspect of marketing would you like to focus on?";
      } else if (lowerMessage.includes('content') || lowerMessage.includes('create')) {
        fallbackContent = "Content creation is one of my specialties! I can help you with blog posts, social media content, email campaigns, and more. What type of content are you looking to create?";
      } else if (lowerMessage.includes('business plan') || lowerMessage.includes('business strategy')) {
        fallbackContent = "I'd love to help you with your business plan and strategy! While I'm experiencing some connectivity issues, I can guide you through key areas like market analysis, competitive positioning, financial projections, and growth strategies. What specific aspect of business planning would you like to focus on?";
      } else if (lowerMessage.includes('marketing plan') || lowerMessage.includes('marketing strategy')) {
        fallbackContent = "Marketing strategy is crucial for business success! I can help you develop a comprehensive marketing plan covering target audience identification, channel selection, budget allocation, and campaign execution. What's your current marketing challenge or goal?";
      } else if (lowerMessage.includes('sales') || lowerMessage.includes('selling')) {
        fallbackContent = "Sales strategy is essential for business growth! I can help you with sales processes, lead generation, conversion optimization, and customer relationship management. What specific sales challenge are you facing?";
      } else if (lowerMessage.includes('financial') || lowerMessage.includes('budget') || lowerMessage.includes('revenue')) {
        fallbackContent = "Financial planning is critical for business success! I can help you with budgeting, revenue projections, cost analysis, and financial forecasting. What financial aspect would you like to focus on?";
      } else if (lowerMessage.includes('social media') || lowerMessage.includes('instagram') || lowerMessage.includes('facebook')) {
        fallbackContent = "Social media marketing is a powerful tool for business growth! I can help you develop a social media strategy, create engaging content, and optimize your presence across platforms. Which social media platforms are you focusing on?";
      } else if (lowerMessage.includes('email') || lowerMessage.includes('newsletter')) {
        fallbackContent = "Email marketing is one of the most effective marketing channels! I can help you with email strategy, list building, segmentation, and creating compelling email campaigns. What's your email marketing goal?";
      } else {
        fallbackContent = `I'm experiencing some technical difficulties with our orchestrator: ${err.message}\n\nHowever, I can still help you! Could you provide more details about what you'd like to accomplish? I can assist with business strategy, content creation, marketing, and more.`;
      }
      
      // Add appropriate quick actions based on the response
      let quickActions = ['🔄 Try Again', '📞 Get Help'];
      
      if (lowerMessage.includes('customer') && lowerMessage.includes('avatar')) {
        quickActions = ['📝 Start Creating Avatar', '📊 Demographics Help', '🎯 Pain Points Guide', '🔄 Try Again'];
      } else if (lowerMessage.includes('guide me') || lowerMessage.includes('guide you')) {
        quickActions = ['👤 Demographics', '🧠 Psychographics', '😰 Pain Points', '🎯 Goals & Motivations'];
      } else if (lowerMessage.includes('marketing') || lowerMessage.includes('strategy')) {
        quickActions = ['📈 Marketing Plan', '🎯 Target Audience', '💰 Budget Planning', '🔄 Try Again'];
      } else if (lowerMessage.includes('business plan')) {
        quickActions = ['📋 Business Plan Template', '📊 Market Analysis', '💰 Financial Projections', '🔄 Try Again'];
      } else if (lowerMessage.includes('social media')) {
        quickActions = ['📱 Platform Strategy', '📝 Content Calendar', '📊 Analytics Guide', '🔄 Try Again'];
      }
      
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: fallbackContent,
        timestamp: new Date(),
        actions: quickActions,
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

  const handleActionClick = async (action, message) => {
    if (action.includes('Transparency')) {
      // Open transparency modal for workflow
      if (message.workflowData?.workflow_id) {
        setShowTransparency(message.workflowData.workflow_id);
      }
    } else if (action.includes('Monitor Progress')) {
      // Navigate to workflows page
      window.location.href = '/workflows';
    } else if (action.includes('Dashboard') || action.includes('Analytics')) {
      onNavigateToDashboard?.();
    } else if (action.includes('Proceed with Available Agents')) {
      // Proceed with basic workflow using available agents
      const proceedMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: 'Yes, please proceed with the available agents for now.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, proceedMessage]);
      
      // Send the request again to create a basic workflow
      setTimeout(() => {
        handleSendMessage(message.content);
      }, 500);
      
    } else if (action.includes('Hire Suggested Agents')) {
      // Navigate to agents page to hire agents
      window.location.href = '/agents';
      
    } else if (action.includes('Approve & Execute')) {
      // Approve and execute workflow
      if (message.workflowData?.workflow_id) {
        try {
          const response = await orchestratorService.approveWorkflow(message.workflowData.workflow_id);
          if (response.success) {
            // Add success message
            const successMessage = {
              id: Date.now().toString(),
              type: 'assistant',
              content: response.message,
              timestamp: new Date(),
              agentId: 'orchestrator'
            };
            setMessages(prev => [...prev, successMessage]);
            
            // Update workflow tracking
            setActiveWorkflows(prev => [...prev, {
              id: message.workflowData.workflow_id,
              name: message.workflowData.workflow_details?.name || 'Autonomous Workflow',
              created: new Date().toISOString(),
              status: 'running'
            }]);
          }
        } catch (error) {
          console.error('Error approving workflow:', error);
        }
      }
    } else if (action.includes('Cancel')) {
      // Cancel workflow - just acknowledge
      const cancelMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "No problem! I've cancelled that workflow. What would you like to work on instead?",
        timestamp: new Date(),
        agentId: 'orchestrator'
      };
      setMessages(prev => [...prev, cancelMessage]);
    } else if (action.includes('Workflow')) {
      // Navigate to workflow details
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

  // Load system capabilities on mount
  useEffect(() => {
    const loadCapabilities = async () => {
      const result = await orchestratorService.getStatus();
      if (result.success) {
        setSystemCapabilities(result);
      }
    };
    loadCapabilities();
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Main Chat Area (sidebar is global now) */}
      <div className="flex-1 flex flex-col ml-0">
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
                      settings?.profile?.profilePictureUrl ? (
                        <img src={settings.profile.profilePictureUrl} alt="Me" className="w-8 h-8 rounded-full object-cover border" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )
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
                      
                      {/* Agent Hiring Suggestions */}
                      {message.workflowData?.conversation_type === 'agent_hiring_suggestion' && message.workflowData?.agent_suggestions && (
                        <div className="mt-4 space-y-3">
                          <div className="text-sm font-medium text-gray-700">Recommended Agents:</div>
                          {message.workflowData.agent_suggestions.map((suggestion, index) => (
                            <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {suggestion.agent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Agent
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {suggestion.reason}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-sm font-medium text-green-600">
                                    ${suggestion.daily_rate}/day
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ${suggestion.monthly_rate}/month
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {message.workflowData.alternative_workflow && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="text-sm text-yellow-800">
                                {message.workflowData.alternative_workflow}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Message Actions */}
                    {message.actions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleActionClick(action, message)}
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

        {/* Active Workflows Strip */}
        {activeWorkflows.length > 0 && (
          <div className="absolute bottom-24 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2">
            <div className="flex items-center space-x-3 overflow-x-auto">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                Active:
              </span>
              {activeWorkflows.map((workflow) => (
                <button
                  key={workflow.id}
                  onClick={() => setShowTransparency(workflow.id)}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                  <Zap className="w-3 h-3" />
                  <span>{workflow.name}</span>
                  <Eye className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Transparency Modal */}
        {showTransparency && (
          <WorkflowTransparencyModal
            isOpen={!!showTransparency}
            onClose={() => setShowTransparency(null)}
            workflowId={showTransparency}
            workflowData={{}}  // Would be loaded from API
            onRefreshWorkflow={async (wfId) => {
              const status = await orchestratorService.getWorkflowStatus(wfId);
              return status;
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
