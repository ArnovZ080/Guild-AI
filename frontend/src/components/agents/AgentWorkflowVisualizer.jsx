import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Brain,
  Users,
  Target,
  TrendingUp,
  MessageSquare,
  Trophy,
  Search
} from 'lucide-react';
import { useAgentCommunication } from '../../contexts/AgentCommunicationContext.simple';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';

const AgentWorkflowVisualizer = ({ 
  workflowType = 'goal_setting',
  onWorkflowComplete,
  showRealTimeUpdates = true 
}) => {
  const { agentMessages, pendingResponses } = useAgentCommunication();
  const { currentMode, getModeColors } = useAdaptiveMode();
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const adaptiveClasses = getModeColors(currentMode);

  // Define workflow templates
  const workflowTemplates = {
    goal_setting: [
      {
        id: 'goal_creation',
        name: 'Goal Setting Agent',
        description: 'Creating and validating your goal',
        icon: Target,
        agent_id: 'okr_goal_tracking',
        estimatedDuration: 30
      },
      {
        id: 'strategy_development',
        name: 'Strategy Agent',
        description: 'Developing strategy to achieve goal',
        icon: Brain,
        agent_id: 'strategy_agent',
        estimatedDuration: 120
      },
      {
        id: 'orchestration',
        name: 'Orchestrator Agent',
        description: 'Coordinating execution plan',
        icon: Users,
        agent_id: 'orchestrator',
        estimatedDuration: 60
      },
      {
        id: 'execution',
        name: 'Specialist Agents',
        description: 'Executing specialized tasks',
        icon: Zap,
        agent_id: 'multiple',
        estimatedDuration: 300
      }
    ],
    content_creation: [
      {
        id: 'content_strategy',
        name: 'Content Strategist',
        description: 'Developing content strategy',
        icon: Brain,
        agent_id: 'content_strategist',
        estimatedDuration: 45
      },
      {
        id: 'content_creation',
        name: 'Content Creator',
        description: 'Creating the content',
        icon: MessageSquare,
        agent_id: 'copywriter',
        estimatedDuration: 90
      },
      {
        id: 'optimization',
        name: 'SEO Agent',
        description: 'Optimizing for search engines',
        icon: TrendingUp,
        agent_id: 'seo_agent',
        estimatedDuration: 30
      }
    ],
    marketing_campaign: [
      {
        id: 'campaign_strategy',
        name: 'Marketing Agent',
        description: 'Developing campaign strategy',
        icon: Brain,
        agent_id: 'marketing_agent',
        estimatedDuration: 60
      },
      {
        id: 'content_creation',
        name: 'Content Team',
        description: 'Creating campaign content',
        icon: MessageSquare,
        agent_id: 'content_creation_agent',
        estimatedDuration: 120
      },
      {
        id: 'ad_optimization',
        name: 'Ad Optimizer',
        description: 'Setting up and optimizing ads',
        icon: TrendingUp,
        agent_id: 'ad_performance_optimizer',
        estimatedDuration: 90
      },
      {
        id: 'analytics',
        name: 'Analytics Agent',
        description: 'Monitoring performance',
        icon: TrendingUp,
        agent_id: 'analytics_agent',
        estimatedDuration: 30
      }
    ],
    achievement_analysis: [
      {
        id: 'achievement_analysis',
        name: 'Celebration Narrator Agent',
        description: 'Analyzing achievement impact and significance',
        icon: Trophy,
        agent_id: 'celebration_narrator',
        estimatedDuration: 45
      },
      {
        id: 'impact_analysis',
        name: 'Analytics Agent',
        description: 'Processing achievement metrics and data',
        icon: TrendingUp,
        agent_id: 'analytics_agent',
        estimatedDuration: 60
      },
      {
        id: 'next_steps_planning',
        name: 'Strategy Agent',
        description: 'Planning next steps based on achievement',
        icon: Target,
        agent_id: 'strategy_agent',
        estimatedDuration: 90
      }
    ],
    growth_opportunity: [
      {
        id: 'opportunity_research',
        name: 'Research Agent',
        description: 'Researching market opportunity details',
        icon: Search,
        agent_id: 'research_agent',
        estimatedDuration: 120
      },
      {
        id: 'opportunity_strategy',
        name: 'Strategy Agent',
        description: 'Developing implementation strategy',
        icon: Brain,
        agent_id: 'strategy_agent',
        estimatedDuration: 90
      },
      {
        id: 'market_validation',
        name: 'Market Trends Agent',
        description: 'Validating market conditions',
        icon: TrendingUp,
        agent_id: 'market_trends_agent',
        estimatedDuration: 60
      },
      {
        id: 'opportunity_implementation',
        name: 'Orchestrator Agent',
        description: 'Creating implementation plan',
        icon: Users,
        agent_id: 'orchestrator',
        estimatedDuration: 75
      }
    ],
    personal_assistant: [
      {
        id: 'schedule_request',
        name: 'Personal Assistant Agent',
        description: 'Processing your scheduling request',
        icon: Brain,
        agent_id: 'personal_assistant_agent',
        estimatedDuration: 30
      },
      {
        id: 'conflict_check',
        name: 'Calendar Harmony Agent',
        description: 'Checking for scheduling conflicts',
        icon: Users,
        agent_id: 'calendar_harmony_agent',
        estimatedDuration: 15
      },
      {
        id: 'setup_reminders',
        name: 'Notification Agent',
        description: 'Setting up reminders and notifications',
        icon: MessageSquare,
        agent_id: 'notification_agent',
        estimatedDuration: 20
      }
    ]
  };

  const currentTemplate = workflowTemplates[workflowType] || workflowTemplates.goal_setting || [];

  // Initialize workflow steps
  useEffect(() => {
    if (!currentTemplate || !Array.isArray(currentTemplate)) {
      console.warn('Invalid workflow template:', workflowType);
      return;
    }
    
    setWorkflowSteps(currentTemplate.map((step, index) => ({
      ...step,
      status: index === 0 ? 'processing' : 'pending',
      startTime: index === 0 ? new Date() : null,
      endTime: null,
      progress: 0,
      messages: []
    })));
  }, [workflowType]);

  // Monitor agent messages for real-time updates
  useEffect(() => {
    if (!showRealTimeUpdates) return;

    agentMessages.forEach(message => {
      if (message.type === 'status' || message.type === 'response') {
        updateWorkflowStep(message.agent_id, message);
      }
    });
  }, [agentMessages, showRealTimeUpdates]);

  const updateWorkflowStep = (agentId, message) => {
    setWorkflowSteps(prev => (prev || []).map(step => {
      if (step.agent_id === agentId || (agentId === 'multiple' && step.id === 'execution')) {
        return {
          ...step,
          status: message.type === 'response' ? 'completed' : 'processing',
          progress: message.type === 'response' ? 100 : Math.min(step.progress + 25, 95),
          messages: [...step.messages, message],
          endTime: message.type === 'response' ? new Date() : step.endTime
        };
      }
      return step;
    }));
  };

  const getStepIcon = (step) => {
    const IconComponent = step.icon;
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        step.status === 'completed' ? 'bg-green-100 text-green-600' :
        step.status === 'processing' ? 'bg-blue-100 text-blue-600' :
        'bg-gray-100 text-gray-400'
      }`}>
        <IconComponent className="w-4 h-4" />
      </div>
    );
  };

  const getStepStatus = (step) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (step.status === 'processing') {
      return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    } else {
      return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const calculateProgress = () => {
    const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / workflowSteps.length) * 100;
  };

  const overallProgress = calculateProgress();

  return (
    <div className={`${adaptiveClasses.secondary} rounded-lg p-6 border ${adaptiveClasses.border}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-500" />
          Agent Workflow Progress
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(overallProgress)}% Complete
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-4">
        <AnimatePresence>
          {(workflowSteps || []).map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-300 ${
                step.status === 'completed' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : step.status === 'processing'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Step Icon */}
              {getStepIcon(step)}

              {/* Step Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {step.name}
                  </h4>
                  {getStepStatus(step)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {step.description}
                </p>
                
                {/* Progress Bar for Current Step */}
                {step.status === 'processing' && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-2">
                    <motion.div
                      className="bg-blue-500 h-1 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${step.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}

                {/* Duration and Messages */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {step.status === 'completed' && step.endTime && step.startTime
                      ? `Completed in ${formatDuration(Math.floor((step.endTime - step.startTime) / 1000))}`
                      : `Est. ${step.estimatedDuration}s`
                    }
                  </span>
                  {step.messages.length > 0 && (
                    <span className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {step.messages.length} updates
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow (except for last step) */}
              {index < workflowSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pending Responses Alert */}
      {Object.keys(pendingResponses).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Agents are waiting for your input. Check the chat interface.
            </span>
          </div>
        </motion.div>
      )}

      {/* Workflow Complete */}
      {overallProgress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800 dark:text-green-200">
              Workflow completed successfully!
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AgentWorkflowVisualizer;
