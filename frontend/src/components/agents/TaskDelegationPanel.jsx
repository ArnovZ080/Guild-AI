import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Plus,
  Settings,
  Target,
  Calendar,
  Users,
  Zap
} from 'lucide-react';
import { useAgentCommunication } from '../../contexts/AgentCommunicationContext.simple';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';
import { useCelebrations, CelebrationType } from '../psychological/SimpleCelebrationProvider';

const TaskDelegationPanel = ({ className = "" }) => {
  const { 
    sendTaskToAgent, 
    getAvailableAgents, 
    getAgentCapabilities,
    activeSessions,
    isConnected 
  } = useAgentCommunication();
  
  const { currentMode, getModeColors } = useAdaptiveMode();
  const { triggerCelebration } = useCelebrations();
  const adaptiveClasses = getModeColors(currentMode);
  
  const [availableAgents, setAvailableAgents] = useState([]);
  const [agentCapabilities, setAgentCapabilities] = useState({});
  const [selectedAgent, setSelectedAgent] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskContext, setTaskContext] = useState('');
  const [taskPriority, setTaskPriority] = useState('normal');
  const [isSending, setIsSending] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load available agents on mount
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const [agents, capabilities] = await Promise.all([
          getAvailableAgents(),
          getAgentCapabilities()
        ]);
        setAvailableAgents(agents);
        setAgentCapabilities(capabilities);
      } catch (error) {
        console.error('Error loading agents:', error);
      }
    };
    
    loadAgents();
  }, [getAvailableAgents, getAgentCapabilities]);

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

  const getAgentName = (agentId) => {
    const agent = availableAgents.find(a => a.agent_id === agentId);
    return agent ? agent.name : agentId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAgentDescription = (agentId) => {
    const agent = availableAgents.find(a => a.agent_id === agentId);
    return agent ? agent.description : 'AI Agent';
  };

  const handleSendTask = async () => {
    if (!taskDescription.trim()) return;
    
    setIsSending(true);
    
    try {
      const task = {
        description: taskDescription,
        context: taskContext || undefined,
        priority: taskPriority,
        metadata: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      };

      const result = await sendTaskToAgent(task, selectedAgent || null);
      
      // Clear form
      setTaskDescription('');
      setTaskContext('');
      setSelectedAgent('');
      
      triggerCelebration(CelebrationType.EFFICIENCY, {
        message: `Task sent to ${getAgentName(result.agent_id)}! 🚀`,
        intensity: 'normal'
      });
      
    } catch (error) {
      console.error('Error sending task:', error);
      triggerCelebration(CelebrationType.FAILURE, {
        message: "Failed to send task to agent ⚠️",
        intensity: 'normal'
      });
    } finally {
      setIsSending(false);
    }
  };

  const getSessionStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSessionStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <div className={`p-3 rounded-lg flex items-center space-x-2 ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isConnected ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {isConnected ? 'Connected to AI Agents' : 'Disconnected from AI Agents'}
        </span>
      </div>

      {/* Task Delegation Form */}
      <div className={`p-6 rounded-xl border ${adaptiveClasses.border} ${adaptiveClasses.secondary}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Send className="w-5 h-5 mr-2" />
          Delegate Task to AI Agent
        </h3>

        <div className="space-y-4">
          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Description *
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe what you want the AI agent to do..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
              rows={3}
            />
          </div>

          {/* Agent Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Agent (Optional)
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">Auto-select best agent</option>
              {availableAgents.map((agent) => (
                <option key={agent.agent_id} value={agent.agent_id}>
                  {getAgentIcon(agent.agent_id)} {agent.name}
                </option>
              ))}
            </select>
            {selectedAgent && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {getAgentDescription(selectedAgent)}
              </p>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <Settings className="w-4 h-4" />
              <span>Advanced Options</span>
            </button>
            
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  {/* Task Context */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Context
                    </label>
                    <textarea
                      value={taskContext}
                      onChange={(e) => setTaskContext(e.target.value)}
                      placeholder="Provide any additional context or requirements..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Task Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendTask}
            disabled={!taskDescription.trim() || isSending || !isConnected}
            className={`w-full px-6 py-3 bg-gradient-to-r ${adaptiveClasses.primary} text-white rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>{isSending ? 'Sending Task...' : 'Send Task to Agent'}</span>
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      {Object.keys(activeSessions).length > 0 && (
        <div className={`p-6 rounded-xl border ${adaptiveClasses.border} ${adaptiveClasses.secondary}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Active Tasks
          </h3>
          
          <div className="space-y-3">
            {Object.entries(activeSessions).map(([sessionId, session]) => (
              <motion.div
                key={sessionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${adaptiveClasses.border} ${adaptiveClasses.secondary}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                      {getAgentIcon(session.agentId)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {getAgentName(session.agentId)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                        {session.task.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                    {getSessionStatusIcon(session.status)}
                  </div>
                </div>
                
                {session.estimatedDuration && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Estimated duration: {session.estimatedDuration} minutes
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Agents Info */}
      <div className={`p-6 rounded-xl border ${adaptiveClasses.border} ${adaptiveClasses.secondary}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          Available Agents
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableAgents.map((agent) => (
            <div key={agent.agent_id} className={`p-3 rounded-lg border ${adaptiveClasses.border} ${adaptiveClasses.secondary}`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getAgentIcon(agent.agent_id)}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {agent.name}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {agent.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskDelegationPanel;
