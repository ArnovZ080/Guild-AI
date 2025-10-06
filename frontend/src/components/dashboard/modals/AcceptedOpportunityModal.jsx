// Accepted Opportunity Modal
// Shows detailed progress tracking and analytics for implemented growth opportunities

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, TrendingUp, CheckCircle, Clock, Users, Target, Zap,
  Activity, ArrowUpRight, ArrowDownRight, AlertCircle, Eye,
  Calendar, Play, Pause, RefreshCw, ExternalLink, Info
} from 'lucide-react';

const AcceptedOpportunityModal = ({ 
  opportunity, 
  onClose 
}) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (opportunity?.id) {
      fetchProgressData();
    }
  }, [opportunity?.id]);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/growth-opportunities/${opportunity.id}/progress`);
      if (!response.ok) throw new Error('Failed to fetch progress data');
      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!opportunity) return null;

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'accepted': 'bg-blue-100 text-blue-800 border-blue-200',
      'in_progress': 'bg-purple-100 text-purple-800 border-purple-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'failed': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getMetricTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{opportunity.title}</h2>
                <div className="flex items-center space-x-3 text-sm">
                  <span className={`px-3 py-1 rounded-full border bg-white bg-opacity-20 capitalize`}>
                    {opportunity.category}
                  </span>
                  <span>•</span>
                  <span className={`px-3 py-1 rounded-full border bg-white bg-opacity-20`}>
                    {opportunity.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchProgressData}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {progressData?.progress?.percentage?.toFixed(0) || 0}%
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressData?.progress?.percentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Steps Completed</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {progressData?.progress?.completed_steps || 0}
                    <span className="text-lg font-normal text-gray-600">
                      /{progressData?.progress?.total_steps || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Agent tasks completed</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Expected ROI</span>
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {progressData?.expected_outcome || opportunity.expected_roi}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Target outcome</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Est. Completion</span>
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {progressData?.estimated_completion 
                      ? new Date(progressData.estimated_completion).toLocaleDateString()
                      : opportunity.timeframe
                    }
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Timeline remaining</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Milestones & Agent Activities */}
                <div className="space-y-6">
                  {/* Milestones */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                      Milestones
                    </h3>
                    <div className="space-y-3">
                      {progressData?.milestones?.map((milestone, index) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            milestone.status === 'completed' 
                              ? 'bg-green-50 border-green-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {milestone.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-gray-400" />
                              )}
                              <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                            </div>
                            {milestone.date && (
                              <span className="text-xs text-gray-600">
                                {new Date(milestone.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 ml-7">{milestone.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Agent Activities */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-purple-600" />
                      Agent Activities
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        (Recent first)
                      </span>
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {progressData?.agent_activities?.length > 0 ? (
                        progressData.agent_activities.map((activity, index) => (
                          <div 
                            key={index}
                            className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  activity.status === 'completed' ? 'bg-green-500' :
                                  activity.status === 'in_progress' ? 'bg-blue-500' :
                                  activity.status === 'failed' ? 'bg-red-500' :
                                  'bg-gray-400'
                                }`} />
                                <span className="font-semibold text-gray-900">{activity.agent_name}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(activity.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Task: {activity.node_id}
                            </p>
                            {activity.output_summary && (
                              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                {activity.output_summary}
                              </p>
                            )}
                            <div className="mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No agent activities yet</p>
                          <p className="text-sm">Workflow will begin once approved</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Performance Metrics & Details */}
                <div className="space-y-6">
                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Performance Metrics
                    </h3>
                    <div className="space-y-3">
                      {progressData?.performance_metrics && Object.entries(progressData.performance_metrics).map(([key, metric]) => (
                        <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{metric.label}</span>
                            <div className="flex items-center space-x-1">
                              {getMetricTrendIcon(metric.trend)}
                              <span className="font-bold text-gray-900">{metric.value}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{metric.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunity Details */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-600" />
                      Opportunity Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium capitalize">{opportunity.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <span className="font-medium capitalize">{opportunity.priority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Impact:</span>
                        <span className="font-medium capitalize">{opportunity.impact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Effort:</span>
                        <span className="font-medium capitalize">{opportunity.effort}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence Score:</span>
                        <span className="font-medium">{(opportunity.confidence_score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Revenue:</span>
                        <span className="font-medium text-green-600">{opportunity.expected_revenue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Link */}
                  {progressData?.workflow_id && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-purple-600" />
                        Active Workflow
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Workflow Status:</p>
                          <span className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(progressData.workflow_status)}`}>
                            {progressData.workflow_status}
                          </span>
                        </div>
                        <a 
                          href={`/agent-theater?tab=workflows&workflow=${progressData.workflow_id}`}
                          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
                        >
                          <span>View in Agent Theater</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Educational Note */}
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-1">📊 Learning Point</p>
                        <p>
                          Track these metrics to understand what drives growth in your business. 
                          The agent activities show you exactly what actions are being taken and why, 
                          teaching you effective business growth strategies.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AcceptedOpportunityModal;

