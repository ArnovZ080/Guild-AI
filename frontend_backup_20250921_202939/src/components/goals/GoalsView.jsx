import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
import { 
  Target,
  Plus,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  MessageSquare,
  Brain,
  Zap,
  AlertCircle,
  Star,
  Trophy,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations.fixed';
import { useAgentCommunication } from '../../contexts/AgentCommunicationContext.simple';

const GoalsView = ({ onNavigateToChat, onNavigateToDashboard }) => {
  const { currentMode, getModeColors } = useAdaptiveMode();
  const { triggerCelebration } = useCelebrations();
  const { sendTaskToAgent, agentMessages, pendingResponses } = useAgentCommunication();
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalChat, setGoalChat] = useState([]);
  const [goalInput, setGoalInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [agentWorkflow, setAgentWorkflow] = useState([]);

  const adaptiveClasses = getModeColors(currentMode);

  // Real agent integration for goal setting
  const handleGoalSubmission = async (goalData) => {
    try {
      // Step 1: Send to Goal Setting Agent
      await sendTaskToAgent('okr_goal_tracking', {
        type: 'goal_creation',
        goal: goalData,
        user_id: 'current_user'
      });

      // Add to workflow tracking
      setAgentWorkflow(prev => [...prev, {
        id: Date.now(),
        step: 'goal_creation',
        agent: 'Goal Setting Agent',
        status: 'processing',
        timestamp: new Date(),
        data: goalData
      }]);

      // Step 2: Strategy Agent will be triggered automatically
      await sendTaskToAgent('strategy_agent', {
        type: 'goal_strategy',
        goal: goalData,
        previous_agent: 'okr_goal_tracking',
        user_id: 'current_user'
      });

      setAgentWorkflow(prev => [...prev, {
        id: Date.now() + 1,
        step: 'strategy_development',
        agent: 'Strategy Agent',
        status: 'processing',
        timestamp: new Date(),
        depends_on: 'goal_creation'
      }]);

      // Step 3: Orchestrator will coordinate execution
      await sendTaskToAgent('orchestrator', {
        type: 'execute_strategy',
        goal: goalData,
        previous_agents: ['okr_goal_tracking', 'strategy_agent'],
        user_id: 'current_user'
      });

      setAgentWorkflow(prev => [...prev, {
        id: Date.now() + 2,
        step: 'strategy_execution',
        agent: 'Orchestrator Agent',
        status: 'processing',
        timestamp: new Date(),
        depends_on: 'strategy_development'
      }]);

    } catch (error) {
      console.error('Error in goal workflow:', error);
    }
  };

  // Mock goals data
  useEffect(() => {
    const mockGoals = [
      {
        id: '1',
        title: 'Increase Monthly Revenue by 50%',
        description: 'Scale business operations to achieve significant revenue growth through strategic marketing and sales optimization.',
        category: 'revenue',
        priority: 'high',
        status: 'active',
        progress: 65,
        targetValue: 50000,
        currentValue: 32500,
        targetDate: new Date(2025, 2, 31),
        startDate: new Date(2024, 11, 1),
        agents: ['enhanced_campaign_agent', 'sales_agent', 'analytics_agent'],
        milestones: [
          { id: '1', title: 'Launch new marketing campaign', completed: true, date: new Date(2024, 11, 15) },
          { id: '2', title: 'Optimize sales funnel', completed: true, date: new Date(2024, 11, 20) },
          { id: '3', title: 'Implement customer retention strategy', completed: false, date: new Date(2024, 11, 30) },
          { id: '4', title: 'Scale operations', completed: false, date: new Date(2025, 0, 15) }
        ],
        recentActivity: [
          { id: '1', action: 'Marketing campaign launched', agent: 'enhanced_campaign_agent', date: new Date(2024, 11, 15), status: 'completed' },
          { id: '2', action: 'Sales funnel optimized', agent: 'sales_agent', date: new Date(2024, 11, 20), status: 'completed' },
          { id: '3', action: 'Customer analysis completed', agent: 'analytics_agent', date: new Date(2024, 11, 22), status: 'completed' }
        ]
      },
      {
        id: '2',
        title: 'Build Brand Authority in Tech Space',
        description: 'Establish thought leadership through content marketing, speaking engagements, and strategic partnerships.',
        category: 'brand',
        priority: 'medium',
        status: 'active',
        progress: 40,
        targetValue: 100,
        currentValue: 40,
        targetDate: new Date(2025, 5, 30),
        startDate: new Date(2024, 10, 1),
        agents: ['content_strategist', 'social_media_agent', 'pr_agent'],
        milestones: [
          { id: '1', title: 'Publish 20 high-quality articles', completed: true, date: new Date(2024, 11, 1) },
          { id: '2', title: 'Secure 5 speaking opportunities', completed: false, date: new Date(2024, 11, 31) },
          { id: '3', title: 'Build 10 strategic partnerships', completed: false, date: new Date(2025, 2, 31) },
          { id: '4', title: 'Reach 10K LinkedIn followers', completed: false, date: new Date(2025, 5, 30) }
        ],
        recentActivity: [
          { id: '1', action: 'Content calendar created', agent: 'content_strategist', date: new Date(2024, 10, 15), status: 'completed' },
          { id: '2', action: 'First article published', agent: 'content_strategist', date: new Date(2024, 10, 20), status: 'completed' },
          { id: '3', action: 'Social media strategy implemented', agent: 'social_media_agent', date: new Date(2024, 11, 1), status: 'completed' }
        ]
      },
      {
        id: '3',
        title: 'Automate 80% of Routine Tasks',
        description: 'Implement AI agents to handle repetitive business processes, freeing up time for strategic work.',
        category: 'automation',
        priority: 'high',
        status: 'planning',
        progress: 15,
        targetValue: 80,
        currentValue: 12,
        targetDate: new Date(2025, 3, 31),
        startDate: new Date(2024, 11, 1),
        agents: ['workflow_manager', 'automation_agent', 'integration_specialist'],
        milestones: [
          { id: '1', title: 'Audit current processes', completed: true, date: new Date(2024, 11, 10) },
          { id: '2', title: 'Design automation workflows', completed: false, date: new Date(2024, 11, 25) },
          { id: '3', title: 'Implement first wave of automations', completed: false, date: new Date(2025, 0, 31) },
          { id: '4', title: 'Scale automation across all departments', completed: false, date: new Date(2025, 3, 31) }
        ],
        recentActivity: [
          { id: '1', action: 'Process audit completed', agent: 'workflow_manager', date: new Date(2024, 11, 10), status: 'completed' },
          { id: '2', action: 'Automation opportunities identified', agent: 'automation_agent', date: new Date(2024, 11, 15), status: 'completed' }
        ]
      }
    ];
    setGoals(mockGoals);
  }, []);

  // Mock suggestions
  const [suggestions, setSuggestions] = useState([
    {
      id: '1',
      type: 'goal_creation',
      title: 'Create New Goal',
      description: 'Set a new business objective to track progress.',
      action: 'create_goal',
      priority: 'medium'
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Optimize Active Goals',
      description: 'Review and optimize your current goal strategies.',
      action: 'optimize_goals',
      priority: 'high'
    },
    {
      id: '3',
      type: 'milestone',
      title: 'Check Milestones',
      description: 'Review upcoming milestone deadlines.',
      action: 'check_milestones',
      priority: 'medium'
    }
  ]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setGoalChat(prev => [...prev, userMessage]);
    setGoalInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      if (message.toLowerCase().includes('goal') || message.toLowerCase().includes('objective')) {
        response = "I can help you create and manage your business goals! What type of goal would you like to set? Revenue growth, brand building, automation, or something else?";
      } else if (message.toLowerCase().includes('progress') || message.toLowerCase().includes('status')) {
        response = "Let me analyze your current goal progress. You're doing great with revenue growth at 65% completion! Would you like me to suggest optimizations for any specific goals?";
      } else if (message.toLowerCase().includes('agent') || message.toLowerCase().includes('automation')) {
        response = "I can assign specific agents to help achieve your goals. Each agent specializes in different areas like marketing, sales, content, and automation. Which goal would you like to focus on?";
      } else {
        response = "I'm here to help you achieve your business goals! I can assist with goal creation, progress tracking, agent assignment, and strategic planning. What would you like to work on?";
      }

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        agent: 'goals_agent',
        actions: ['Create Goal', 'View Progress', 'Assign Agents', 'Optimize Strategy']
      };

      setGoalChat(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      triggerCelebration(CelebrationType.COLLABORATION, {
        message: "Goals Agent responded! 🎯",
        intensity: 'subtle'
      });
    }, 1500);
  };

  const handleSuggestion = (suggestion) => {
    switch (suggestion.action) {
      case 'create_goal':
        setShowAddGoal(true);
        triggerCelebration(CelebrationType.MILESTONE, {
          message: "New goal creation started! 🎯",
          intensity: 'normal'
        });
        break;
      case 'optimize_goals':
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: "Goals optimization activated! ⚡",
          intensity: 'normal'
        });
        break;
      case 'check_milestones':
        triggerCelebration(CelebrationType.PROGRESS, {
          message: "Milestone review completed! 📋",
          intensity: 'normal'
        });
        break;
    }
    
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'revenue': return 'bg-green-100 text-green-800 border-green-200';
      case 'brand': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'automation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'growth': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Goals & Objectives
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set, track, and achieve your business goals with AI agent assistance.
            </p>
          </div>
          <button
            onClick={() => setShowAddGoal(true)}
            className={`px-6 py-3 bg-gradient-to-r ${adaptiveClasses.primary} text-white rounded-xl hover:opacity-90 transition-all duration-200 flex items-center space-x-2`}
          >
            <Plus className="w-5 h-5" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Goals List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer ${getPriorityColor(goal.priority)}`}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedGoal(goal)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {goal.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {goal.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Progress
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {goal.currentValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Current Value
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {goal.targetValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Target Value
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {goal.targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Target Date
                        </div>
                      </div>
                    </div>

                    {/* Milestones */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Milestones
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {goal.milestones.slice(0, 3).map((milestone) => (
                          <div
                            key={milestone.id}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                              milestone.completed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {milestone.completed ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>{milestone.title}</span>
                          </div>
                        ))}
                        {goal.milestones.length > 3 && (
                          <div className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            +{goal.milestones.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assigned Agents */}
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {goal.agents.length} agent{goal.agents.length !== 1 ? 's' : ''} assigned
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Goals Agent Sidebar */}
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Agent Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Goals Agent</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Goal Management Assistant</p>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {goalChat.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">What goal would you like to work on?</p>
                </div>
              )}
              
              {goalChat.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? `bg-gradient-to-r ${adaptiveClasses.primary} text-white`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.actions && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.actions.map((action, idx) => (
                          <button
                            key={idx}
                            className="px-2 py-1 bg-white/20 text-xs rounded hover:bg-white/30 transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
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
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Ask about your goals..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(goalInput)}
              />
              <button
                onClick={() => handleSendMessage(goalInput)}
                disabled={!goalInput.trim()}
                className={`px-4 py-2 bg-gradient-to-r ${adaptiveClasses.primary} text-white rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Send
              </button>
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Suggestions</h4>
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showSuggestions ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {suggestions.map((suggestion) => (
                        <motion.div
                          key={suggestion.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleSuggestion(suggestion)}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              {suggestion.title}
                            </h5>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                              suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {suggestion.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {suggestion.description}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalsView;

