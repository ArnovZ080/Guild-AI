import React from 'react';
import { motion } from 'framer-motion';
import { X, Bot, CheckCircle, Clock, AlertCircle, TrendingUp, FileText } from 'lucide-react';

const AgentDetailModal = ({ isOpen, onClose, agent }) => {
  if (!agent) return null;

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

  // Mock detailed activity data
  const todayActivity = [
    { time: '09:00', action: 'Started financial report compilation', status: 'completed' },
    { time: '09:15', action: 'Analyzed Q4 revenue trends', status: 'completed' },
    { time: '09:30', action: 'Generated cash flow projections', status: 'completed' },
    { time: '10:00', action: 'Preparing investor presentation', status: 'in_progress' },
    { time: '10:30', action: 'Scheduled: Final report review', status: 'pending' }
  ];

  const metrics = {
    tasksCompleted: 12,
    tasksInProgress: 3,
    tasksPending: 5,
    efficiency: 94,
    uptime: '99.8%'
  };

  const recentTasks = [
    { task: 'Financial Report - Q4 Analysis', completed: true, time: '30 min ago' },
    { task: 'Revenue Projection Model Update', completed: true, time: '1 hour ago' },
    { task: 'Expense Categorization', completed: true, time: '2 hours ago' },
    { task: 'Budget Variance Analysis', completed: false, time: 'In progress' }
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{getAgentEmoji(agent.name)}</span>
              <div>
                <h2 className="text-2xl font-bold">{agent.name}</h2>
                <p className="text-cyan-100 text-sm">Detailed Activity Summary</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Current Task */}
          <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
              <h3 className="font-bold text-blue-900">Currently Working On</h3>
            </div>
            <p className="text-gray-900 font-medium">{agent.task}</p>
            {agent.progress !== undefined && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-bold text-blue-700">{agent.progress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Metrics Overview */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-700">{metrics.tasksCompleted}</div>
                <div className="text-xs text-gray-600 mt-1">Completed Today</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">{metrics.tasksInProgress}</div>
                <div className="text-xs text-gray-600 mt-1">In Progress</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-700">{metrics.tasksPending}</div>
                <div className="text-xs text-gray-600 mt-1">Pending</div>
              </div>
            </div>
          </div>

          {/* Today's Activity Timeline */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-700" />
              Today's Activity Timeline
            </h3>
            <div className="space-y-3">
              {todayActivity.map((activity, index) => {
                const statusIcons = {
                  completed: <CheckCircle className="w-5 h-5 text-green-600" />,
                  in_progress: <Clock className="w-5 h-5 text-blue-600 animate-pulse" />,
                  pending: <AlertCircle className="w-5 h-5 text-yellow-600" />
                };

                const statusColors = {
                  completed: 'bg-green-50 border-green-200',
                  in_progress: 'bg-blue-50 border-blue-200',
                  pending: 'bg-yellow-50 border-yellow-200'
                };

                return (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 p-3 border rounded-lg ${statusColors[activity.status]}`}
                  >
                    {statusIcons[activity.status]}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{activity.action}</span>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-700" />
              Recent Tasks
            </h3>
            <div className="space-y-2">
              {recentTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {task.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                    )}
                    <span className={`text-sm ${task.completed ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
                      {task.task}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{task.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-bold text-green-900">Excellent Performance</h4>
                  <p className="text-sm text-green-700">Operating at {metrics.efficiency}% efficiency with {metrics.uptime} uptime</p>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AgentDetailModal;

