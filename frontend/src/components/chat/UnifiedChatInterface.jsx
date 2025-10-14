/**
 * Unified Chat Interface - Fortune 500 Level Business Intelligence Chat
 * Consolidates all chat interfaces into a single, comprehensive system.
 * Integrates with Unified Orchestrator, Business Intelligence Agents, and all dashboards.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Zap, 
  Brain, 
  TrendingUp, 
  Target,
  BarChart3,
  Users,
  DollarSign,
  FileText,
  Calendar,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Workflow,
  Activity,
  Star
} from 'lucide-react';

// Import services
import { unifiedOrchestratorService } from '../../services/UnifiedOrchestratorService';
import { enhancedOrchestratorService } from '../../services/EnhancedOrchestratorService';

const UnifiedChatInterface = ({ 
  className = "",
  onDashboardUpdate = () => {},
  onWorkflowCreate = () => {},
  onAgentCoordination = () => {},
  initialContext = null,
  showAgentStatus = true,
  showQualityMetrics = true,
  showCostTracking = true,
  enableVoiceCommands = true,
  autoSuggestActions = true
}) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [orchestratorStatus, setOrchestratorStatus] = useState('initializing');
  const [agentCapabilities, setAgentCapabilities] = useState({});
  const [qualityMetrics, setQualityMetrics] = useState({});
  const [costTracking, setCostTracking] = useState({});
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [agentCoordination, setAgentCoordination] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const voiceRecognitionRef = useRef(null);

  // Initialize orchestrator and load capabilities
  useEffect(() => {
    initializeOrchestrator();
    loadAgentCapabilities();
    setupVoiceRecognition();
    loadInitialContext();

    return () => {
      cleanupVoiceRecognition();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize orchestrator status
  const initializeOrchestrator = async () => {
    try {
      setOrchestratorStatus('initializing');
      const status = await unifiedOrchestratorService.getStatus();
      
      if (status.status === 'healthy') {
        setOrchestratorStatus('operational');
        setAgentCapabilities({
          orchestrator: status.orchestrator_available,
          business_agents: status.business_agents_available,
          vertex_ai: status.vertex_ai_enabled,
          agents_loaded: status.agents_loaded || [],
          orchestrators_loaded: status.orchestrators_loaded || []
        });
      } else {
        setOrchestratorStatus('degraded');
        setError('Orchestrator is running in degraded mode');
      }
    } catch (error) {
      console.error('Failed to initialize orchestrator:', error);
      setOrchestratorStatus('error');
      setError('Failed to initialize orchestrator');
    }
  };

  // Load agent capabilities
  const loadAgentCapabilities = async () => {
    try {
      const capabilities = await unifiedOrchestratorService.getCapabilities();
      setAgentCapabilities(prev => ({ ...prev, ...capabilities }));
    } catch (error) {
      console.error('Failed to load agent capabilities:', error);
    }
  };

  // Load initial context if provided
  const loadInitialContext = () => {
    if (initialContext) {
      addMessage({
        id: 'initial-context',
        type: 'system',
        content: `Initial context loaded: ${initialContext.type || 'general'}`,
        timestamp: new Date(),
        metadata: { context: initialContext }
      });
    }
  };

  // Setup voice recognition
  const setupVoiceRecognition = () => {
    if (!enableVoiceCommands || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceRecognitionRef.current = new SpeechRecognition();
    voiceRecognitionRef.current.continuous = false;
    voiceRecognitionRef.current.interimResults = false;
    voiceRecognitionRef.current.lang = 'en-US';

    voiceRecognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      handleSendMessage(transcript);
    };

    voiceRecognitionRef.current.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
    };
  };

  // Cleanup voice recognition
  const cleanupVoiceRecognition = () => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop();
    }
  };

  // Start voice recognition
  const startVoiceRecognition = () => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.start();
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add message to chat
  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, { ...message, id: message.id || Date.now().toString() }]);
  }, []);

  // Handle orchestrator request
  const handleOrchestratorRequest = async (userInput, context = {}) => {
    try {
      setIsLoading(true);
      setIsTyping(true);
      setError(null);

      // Determine task type and complexity based on input
      const { taskType, complexity, priority } = analyzeUserInput(userInput);
      
      // Build orchestrator request
      const request = {
        user_input: userInput,
        task_type: taskType,
        complexity: complexity,
        priority: priority,
        context: context,
        dashboard_integration: context.dashboard || null,
        agent_coordination: context.agents || null,
        quality_requirements: {
          accuracy: 0.9,
          completeness: 0.85,
          relevance: 0.9,
          actionability: 0.8
        }
      };

      // Send request to unified orchestrator
      const response = await unifiedOrchestratorService.processRequest(request);

      // Handle response
      if (response.success) {
        // Add orchestrator response
        addMessage({
          type: 'assistant',
          content: response.response,
          timestamp: new Date(),
          metadata: {
            task_type: response.task_type,
            complexity: response.complexity,
            agents_involved: response.agents_involved,
            execution_time: response.execution_time,
            quality_score: response.quality_score,
            confidence_score: response.confidence_score,
            cost_estimate: response.cost_estimate,
            vertex_ai_model: response.vertex_ai_model,
            dashboard_updates: response.dashboard_updates,
            next_actions: response.next_actions
          }
        });

        // Update quality metrics
        if (response.quality_score) {
          setQualityMetrics(prev => ({
            ...prev,
            last_quality_score: response.quality_score,
            average_quality: calculateAverageQuality(prev.average_quality, response.quality_score),
            total_requests: (prev.total_requests || 0) + 1
          }));
        }

        // Update cost tracking
        if (response.cost_estimate) {
          setCostTracking(prev => ({
            ...prev,
            last_cost: response.cost_estimate,
            total_cost: (prev.total_cost || 0) + response.cost_estimate,
            model_used: response.vertex_ai_model
          }));
        }

        // Handle dashboard updates
        if (response.dashboard_updates) {
          onDashboardUpdate(response.dashboard_updates);
        }

        // Generate suggested actions
        if (response.next_actions && autoSuggestActions) {
          setSuggestedActions(response.next_actions);
        }

        // Handle agent coordination
        if (response.agents_involved && response.agents_involved.length > 1) {
          const coordination = {
            agents: response.agents_involved,
            timestamp: new Date(),
            quality_score: response.quality_score
          };
          setAgentCoordination(prev => ({ ...prev, [Date.now()]: coordination }));
          onAgentCoordination(coordination);
        }

        setSuccess('Request processed successfully');
      } else {
        setError(`Orchestration failed: ${response.response}`);
        addMessage({
          type: 'error',
          content: `Failed to process request: ${response.response}`,
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Orchestrator request failed:', error);
      setError(`Request failed: ${error.message}`);
      addMessage({
        type: 'error',
        content: `Request failed: ${error.message}`,
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Analyze user input to determine task characteristics
  const analyzeUserInput = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Determine task type
    let taskType = 'chat';
    if (lowerInput.includes('customer') || lowerInput.includes('client')) {
      taskType = 'customer';
    } else if (lowerInput.includes('financial') || lowerInput.includes('revenue') || lowerInput.includes('profit')) {
      taskType = 'financial';
    } else if (lowerInput.includes('content') || lowerInput.includes('marketing') || lowerInput.includes('campaign')) {
      taskType = 'content';
    } else if (lowerInput.includes('strategy') || lowerInput.includes('plan') || lowerInput.includes('business')) {
      taskType = 'strategy';
    } else if (lowerInput.includes('workflow') || lowerInput.includes('automate')) {
      taskType = 'workflow';
    }

    // Determine complexity
    let complexity = 'medium';
    const complexKeywords = ['analyze', 'comprehensive', 'detailed', 'complete', 'thorough'];
    const simpleKeywords = ['quick', 'simple', 'basic', 'summary'];
    
    if (complexKeywords.some(keyword => lowerInput.includes(keyword))) {
      complexity = 'high';
    } else if (simpleKeywords.some(keyword => lowerInput.includes(keyword))) {
      complexity = 'low';
    }

    // Determine priority
    let priority = 'medium';
    if (lowerInput.includes('urgent') || lowerInput.includes('asap') || lowerInput.includes('critical')) {
      priority = 'urgent';
    } else if (lowerInput.includes('low') || lowerInput.includes('when possible')) {
      priority = 'low';
    }

    return { taskType, complexity, priority };
  };

  // Calculate average quality score
  const calculateAverageQuality = (currentAverage, newScore) => {
    if (!currentAverage) return newScore;
    return (currentAverage + newScore) / 2;
  };

  // Handle send message
  const handleSendMessage = async (message = null) => {
    const messageToSend = message || inputValue.trim();
    if (!messageToSend) return;

    // Add user message
    addMessage({
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    });

    // Clear input
    setInputValue('');

    // Process with orchestrator
    await handleOrchestratorRequest(messageToSend);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle suggested action click
  const handleSuggestedAction = (action) => {
    setInputValue(action);
    handleSendMessage(action);
  };

  // Clear messages
  const clearMessages = () => {
    setMessages([]);
    setSuggestedActions([]);
    setError(null);
    setSuccess(null);
  };

  // Get status indicator
  const getStatusIndicator = () => {
    switch (orchestratorStatus) {
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  // Get task type icon
  const getTaskTypeIcon = (taskType) => {
    switch (taskType) {
      case 'customer':
        return <Users className="w-4 h-4" />;
      case 'financial':
        return <DollarSign className="w-4 h-4" />;
      case 'content':
        return <FileText className="w-4 h-4" />;
      case 'strategy':
        return <Target className="w-4 h-4" />;
      case 'workflow':
        return <Workflow className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  // Render message
  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    const isError = message.type === 'error';

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-3xl px-4 py-3 rounded-lg ${
            isUser
              ? 'bg-blue-600 text-white'
              : isError
              ? 'bg-red-100 text-red-800 border border-red-200'
              : isSystem
              ? 'bg-gray-100 text-gray-800 border border-gray-200'
              : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
          }`}
        >
          {/* Message header */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
              {isSystem ? (
                <Info className="w-3 h-3" />
              ) : isError ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <Bot className="w-3 h-3" />
              )}
              <span>
                {new Date(message.timestamp).toLocaleTimeString()}
                {message.metadata?.task_type && (
                  <span className="ml-2 flex items-center gap-1">
                    {getTaskTypeIcon(message.metadata.task_type)}
                    {message.metadata.task_type}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Message content */}
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Message metadata */}
          {message.metadata && !isUser && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                {message.metadata.quality_score && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Quality: {(message.metadata.quality_score * 100).toFixed(1)}%
                  </div>
                )}
                {message.metadata.confidence_score && (
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Confidence: {(message.metadata.confidence_score * 100).toFixed(1)}%
                  </div>
                )}
                {message.metadata.execution_time && (
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {message.metadata.execution_time.toFixed(2)}s
                  </div>
                )}
                {message.metadata.cost_estimate && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${message.metadata.cost_estimate.toFixed(4)}
                  </div>
                )}
                {message.metadata.vertex_ai_model && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {message.metadata.vertex_ai_model}
                  </div>
                )}
              </div>

              {/* Agents involved */}
              {message.metadata.agents_involved && message.metadata.agents_involved.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Agents involved:</div>
                  <div className="flex flex-wrap gap-1">
                    {message.metadata.agents_involved.map((agent, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Unified Orchestrator</h2>
          </div>
          {showAgentStatus && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {getStatusIndicator()}
              <span className="capitalize">{orchestratorStatus}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quality metrics */}
          {showQualityMetrics && qualityMetrics.last_quality_score && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{(qualityMetrics.last_quality_score * 100).toFixed(1)}%</span>
            </div>
          )}

          {/* Cost tracking */}
          {showCostTracking && costTracking.total_cost && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span>${costTracking.total_cost.toFixed(4)}</span>
            </div>
          )}

          {/* Clear messages */}
          <button
            onClick={clearMessages}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear messages"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-100 border border-red-200 text-red-800 rounded-lg text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="mx-4 mt-2 p-3 bg-green-100 border border-green-200 text-green-800 rounded-lg text-sm">
          {success}
          <button
            onClick={() => setSuccess(null)}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Brain className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Welcome to Unified Orchestrator</h3>
            <p className="text-center max-w-md">
              I'm your Fortune 500-level business intelligence orchestrator. 
              I can coordinate all your business agents, analyze data, create workflows, 
              and provide strategic insights. What would you like to accomplish today?
            </p>
            
            {/* Quick start suggestions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
              <button
                onClick={() => handleSuggestedAction("Analyze my business performance")}
                className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="w-5 h-5 mb-2 text-blue-600" />
                <div className="font-medium text-sm">Business Analysis</div>
                <div className="text-xs text-gray-500">Get comprehensive insights</div>
              </button>
              
              <button
                onClick={() => handleSuggestedAction("Create a marketing campaign")}
                className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Target className="w-5 h-5 mb-2 text-green-600" />
                <div className="font-medium text-sm">Marketing Campaign</div>
                <div className="text-xs text-gray-500">Launch targeted campaigns</div>
              </button>
              
              <button
                onClick={() => handleSuggestedAction("Optimize customer retention")}
                className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-5 h-5 mb-2 text-purple-600" />
                <div className="font-medium text-sm">Customer Success</div>
                <div className="text-xs text-gray-500">Improve retention rates</div>
              </button>
              
              <button
                onClick={() => handleSuggestedAction("Generate financial forecast")}
                className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <TrendingUp className="w-5 h-5 mb-2 text-orange-600" />
                <div className="font-medium text-sm">Financial Planning</div>
                <div className="text-xs text-gray-500">Plan for the future</div>
              </button>
            </div>
          </div>
        ) : (
          messages.map(renderMessage)
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Bot className="w-4 h-4" />
                <span className="text-sm">Orchestrator is thinking...</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested actions */}
      {suggestedActions.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
          <div className="text-sm text-blue-800 mb-2 font-medium">Suggested next actions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedAction(action)}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end gap-3">
          {/* Voice input */}
          {enableVoiceCommands && (
            <button
              onClick={startVoiceRecognition}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Voice input"
            >
              <Zap className="w-5 h-5" />
            </button>
          )}

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your business, create workflows, analyze data, or coordinate agents..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isLoading}
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Input hints */}
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line. Use voice commands for hands-free operation.
        </div>
      </div>
    </div>
  );
};

export default UnifiedChatInterface;
