// Workflow Confirmation Modal
// Shows detailed workflow plan after accepting a growth opportunity

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, CheckCircle, Clock, ArrowRight, Play, Eye, AlertCircle,
  Users, Target, Zap, ChevronDown, ChevronUp, Info
} from 'lucide-react';

const WorkflowConfirmationModal = ({ 
  workflow, 
  opportunity,
  onConfirm, 
  onCancel, 
  isLoading 
}) => {
  const [expandedTasks, setExpandedTasks] = useState(new Set([0]));

  if (!workflow || !opportunity) return null;

  const toggleTaskExpansion = (index) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTasks(newExpanded);
  };

  const getAgentColor = (agentName) => {
    const colors = {
      'ContentStrategist': 'bg-purple-100 text-purple-700 border-purple-200',
      'CopywriterAgent': 'bg-blue-100 text-blue-700 border-blue-200',
      'SocialMediaAgent': 'bg-pink-100 text-pink-700 border-pink-200',
      'CRMAgent': 'bg-green-100 text-green-700 border-green-200',
      'CustomerSuccessAgent': 'bg-teal-100 text-teal-700 border-teal-200',
      'AutomationAgent': 'bg-orange-100 text-orange-700 border-orange-200',
      'JudgeAgent': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'AnalyticsAgent': 'bg-cyan-100 text-cyan-700 border-cyan-200'
    };
    return colors[agentName] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const totalEstimatedDuration = workflow.tasks?.reduce((acc, task) => {
    // Simple duration calculation (can be enhanced)
    return acc + 1;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Confirm Workflow Implementation</h2>
                <p className="text-white text-opacity-90">
                  Review the detailed workflow plan for: <span className="font-semibold">{opportunity.title}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {/* Workflow Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-1">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total Agents</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {workflow.tasks?.length || 0}
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Estimated Time</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {opportunity.timeframe}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Expected ROI</span>
              </div>
              <div className="text-xl font-bold text-green-600">
                {opportunity.expected_roi}
              </div>
            </div>
          </div>

          {/* Workflow Description */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-600" />
              Workflow Overview
            </h3>
            <p className="text-gray-700 leading-relaxed">{workflow.workflow_description}</p>
          </div>

          {/* Task Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-600" />
              Implementation Steps
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Click to expand details)
              </span>
            </h3>
            <div className="space-y-3">
              {workflow.tasks?.map((task, index) => {
                const isExpanded = expandedTasks.has(index);
                const isLastTask = index === workflow.tasks.length - 1;
                const isJudgeTask = task.agent_type === 'JudgeAgent';
                
                return (
                  <div 
                    key={task.id || index}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      isJudgeTask ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Task Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleTaskExpansion(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Step Number */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                            isJudgeTask ? 'bg-indigo-600' : 'bg-blue-600'
                          }`}>
                            {index + 1}
                          </div>
                          
                          {/* Task Info */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {task.name}
                            </h4>
                            <div className="flex items-center space-x-3 text-sm">
                              <span className={`px-3 py-1 rounded-full border font-medium ${getAgentColor(task.agent_type)}`}>
                                {task.agent_type}
                              </span>
                              {task.estimated_duration && (
                                <span className="flex items-center space-x-1 text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{task.estimated_duration}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <div className="ml-4">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Task Details (Expanded) */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 bg-gray-50 p-4 space-y-3"
                      >
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Description:</span>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Expected Output:</span>
                          <p className="text-sm text-gray-600 mt-1">{task.expected_output}</p>
                        </div>

                        {task.dependencies && task.dependencies.length > 0 && (
                          <div>
                            <span className="text-sm font-semibold text-gray-700">Dependencies:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {task.dependencies.map((dep, i) => (
                                <span 
                                  key={i}
                                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                                >
                                  {dep}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {task.success_criteria && task.success_criteria.length > 0 && (
                          <div>
                            <span className="text-sm font-semibold text-gray-700">Success Criteria:</span>
                            <ul className="mt-1 space-y-1">
                              {task.success_criteria.map((criteria, i) => (
                                <li key={i} className="flex items-start space-x-2 text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Arrow to next task */}
                    {!isLastTask && (
                      <div className="flex justify-center py-2">
                        <ArrowRight className="w-5 h-5 text-gray-400 transform rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quality Criteria */}
          {workflow.quality_criteria && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-600" />
                Quality Standards & Success Metrics
              </h3>
              {workflow.quality_criteria.success_metrics && (
                <ul className="space-y-2">
                  {workflow.quality_criteria.success_metrics.map((metric, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{metric}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Educational Note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">💡 Learning Opportunity</p>
                <p>
                  This workflow shows you exactly how our AI agents work together to implement business strategies.
                  You'll see each step, who does what, and why - helping you understand these processes for future projects.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Once confirmed, this workflow will be added to your Agent Dashboard for monitoring
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              <span>{isLoading ? 'Initiating...' : 'Confirm & Start Workflow'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkflowConfirmationModal;

