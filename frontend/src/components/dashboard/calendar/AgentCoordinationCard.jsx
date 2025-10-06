import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, ChevronUp, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const AgentCoordinationCard = ({ agents, isExpanded, onToggle }) => {
  const defaultAgents = [
    { 
      name: 'Financial Agent', 
      task: 'Preparing report for 3PM meeting',
      status: 'in_progress',
      event_id: '1',
      progress: 75
    },
    { 
      name: 'Content Agent', 
      task: 'Finalizing social posts',
      status: 'pending',
      event_id: null,
      progress: 30
    },
    { 
      name: 'Customer Intelligence Agent', 
      task: 'Client research for tomorrow',
      status: 'completed',
      event_id: '2',
      progress: 100
    }
  ];

  const agentList = agents && agents.length > 0 ? agents : defaultAgents;

  const getStatusIcon = (status) => {
    const icons = {
      completed: { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      in_progress: { Icon: Loader, color: 'text-blue-600', bg: 'bg-blue-100' },
      pending: { Icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      error: { Icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' }
    };
    return icons[status] || icons.pending;
  };

  const getAgentEmoji = (name) => {
    const emojis = {
      'Financial Agent': '💰',
      'Content Agent': '✍️',
      'Customer Intelligence Agent': '👥',
      'Business Intelligence Agent': '📊',
      'Marketing Agent': '📢',
      'Analytics Agent': '📈',
      'PA Agent': '🤖'
    };
    return emojis[name] || '🤖';
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <h3 className="font-bold">Agent Coordination</h3>
          <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
            {agentList.filter(a => a.status === 'in_progress').length} active
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {agentList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No agents currently active</p>
                </div>
              ) : (
                agentList.map((agent, index) => {
                  const statusInfo = getStatusIcon(agent.status);
                  const StatusIcon = statusInfo.Icon;
                  
                  return (
                    <motion.div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-2xl">{getAgentEmoji(agent.name)}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{agent.name}</h4>
                            <p className="text-sm text-gray-600 truncate">{agent.task}</p>
                          </div>
                        </div>
                        <div className={`p-1.5 rounded-lg ${statusInfo.bg}`}>
                          <StatusIcon className={`w-4 h-4 ${statusInfo.color} ${
                            agent.status === 'in_progress' ? 'animate-spin' : ''
                          }`} />
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {agent.progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Progress</span>
                            <span className="text-xs font-bold text-gray-900">{agent.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <motion.div
                              className={`h-1.5 rounded-full ${statusInfo.color.replace('text-', 'bg-')}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${agent.progress}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Event Link */}
                      {agent.event_id && (
                        <div className="mt-2">
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            🔗 Linked to Event
                          </button>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-0.5 ${statusInfo.bg} ${statusInfo.color} text-xs rounded-full font-medium capitalize`}>
                          {agent.status.replace('_', ' ')}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}

              {/* Summary */}
              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">
                      {agentList.filter(a => a.status === 'completed').length}
                    </p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">
                      {agentList.filter(a => a.status === 'in_progress').length}
                    </p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <p className="text-lg font-bold text-yellow-600">
                      {agentList.filter(a => a.status === 'pending').length}
                    </p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AgentCoordinationCard;

