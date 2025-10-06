import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Brain, TrendingUp, AlertTriangle, Target, 
  CheckCircle, Clock, Zap, Info, Calendar, 
  Users, ArrowUpRight, Activity
} from 'lucide-react';

const GoalInsightsModal = ({ isOpen, onClose, goal, insights }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !goal) return null;

  const daysRemaining = goal.target_date 
    ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)) 
    : null;

  const progressPercentage = goal.progress || 0;
  const isOnTrack = progressPercentage >= 50; // Simple heuristic
  const hasError = insights?.error;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Insights</h2>
              <p className="text-sm text-gray-600">{goal.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing goal progress...</p>
              </div>
            </div>
          ) : hasError ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{insights.error}</p>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{goal.status}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Days Left</span>
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{daysRemaining !== null ? daysRemaining : '-'}</p>
                </div>
              </div>

              {/* Progress Tracking */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Progress Tracking
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Overall Completion</span>
                      <span className={`text-sm font-bold ${
                        isOnTrack ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          isOnTrack ? 'bg-green-600' : 'bg-yellow-600'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-3 mt-4">
                      {goal.milestones.slice(0, 4).map((milestone, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${
                          milestone.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-start gap-2">
                            {milestone.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${
                                milestone.completed ? 'text-green-900 line-through' : 'text-gray-900'
                              }`}>
                                {milestone.title}
                              </p>
                              {milestone.due_date && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(milestone.due_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* What's Been Done */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  What's Been Done & Impact
                </h3>
                <div className="space-y-3">
                  {insights?.detailed_feedback?.strengths && insights.detailed_feedback.strengths.length > 0 ? (
                    insights.detailed_feedback.strengths.map((strength, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-gray-700 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {strength}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-gray-600">
                        Progress tracking is active. Achievements will be logged as agents work toward the goal milestones.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* What's Left */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  What's Left & Why
                </h3>
                <div className="space-y-3">
                  {insights?.detailed_feedback?.areas_for_improvement && insights.detailed_feedback.areas_for_improvement.length > 0 ? (
                    insights.detailed_feedback.areas_for_improvement.map((area, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-gray-700 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          {area}
                        </p>
                      </div>
                    ))
                  ) : insights?.analysis ? (
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-gray-700">{insights.analysis}</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-gray-600">
                        Remaining milestones will be analyzed as agents execute the workflow and report outcomes.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Estimated Time to Goal */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Estimated Time to Goal
                </h3>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 mb-2">
                        {insights?.overall_evaluation?.estimated_time_to_goal || 
                         `Based on current progress rate, expected completion: ${daysRemaining} days`}
                      </p>
                      <div className="flex items-center gap-2 text-green-700 text-xs bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 w-fit">
                        <ArrowUpRight className="w-3 h-3" />
                        {isOnTrack ? 'On track to meet deadline' : 'Requires acceleration'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Actions Log */}
              {goal.actions && goal.actions.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Recent Agent Actions
                  </h3>
                  <div className="space-y-2">
                    {goal.actions.slice(0, 5).map((action, idx) => (
                      <div key={idx} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 flex items-start gap-3">
                        <div className="p-1.5 bg-indigo-600 rounded">
                          <Brain className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{action.agent_type}</p>
                          <p className="text-xs text-gray-600 mt-1">{action.action}</p>
                          {action.rationale && (
                            <p className="text-xs text-indigo-600 mt-1 italic">{action.rationale}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {action.created_at ? new Date(action.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transparency Footer */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-purple-900 mb-1">Intelligence Source</p>
                    <p className="text-sm text-purple-700">
                      These insights are generated by the Judge layer using current goal metrics and progress data. 
                      Rationales and scoring are included when available to ensure full transparency in the analysis process.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GoalInsightsModal;

