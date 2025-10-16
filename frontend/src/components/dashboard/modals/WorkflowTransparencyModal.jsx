import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Bot, 
  Eye, 
  Activity,
  TrendingUp,
  TrendingDown,
  Info,
  Shield,
  Zap,
  Target,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  Download,
  Filter,
  Search
} from 'lucide-react';

const WorkflowTransparencyModal = ({ 
  isOpen, 
  onClose, 
  workflowId, 
  workflowData, 
  onApproveStep, 
  onRejectStep,
  onRefreshWorkflow 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  useEffect(() => {
    let interval;
    if (realTimeUpdates && workflowId) {
      // Polling disabled to prevent page resets
      // interval = setInterval(() => {
      //   onRefreshWorkflow?.(workflowId);
      // }, 2000);
    }
    return () => clearInterval(interval);
  }, [realTimeUpdates, workflowId, onRefreshWorkflow]);

  if (!isOpen) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'waiting_for_approval': return <Shield className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'waiting_for_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApprovalLevelColor = (level) => {
    switch (level) {
      case 'automatic': return 'text-green-600 bg-green-100';
      case 'low_risk': return 'text-blue-600 bg-blue-100';
      case 'medium_risk': return 'text-yellow-600 bg-yellow-100';
      case 'high_risk': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const filteredSteps = workflowData?.steps?.filter(step => {
    const matchesStatus = filterStatus === 'all' || step.status === filterStatus;
    const matchesSearch = step.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         step.agent_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'steps', label: 'Steps', icon: Target },
    { id: 'transparency', label: 'Transparency Log', icon: Eye },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'approvals', label: 'Approvals', icon: Shield }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Workflow Transparency
                </h2>
                <p className="text-sm text-gray-600">
                  {workflowData?.workflow_name || 'Workflow Details'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  realTimeUpdates 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {realTimeUpdates ? 'Live Updates On' : 'Live Updates Off'}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-1 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Workflow Status */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Status</p>
                          <p className="text-lg font-semibold text-blue-800 capitalize">
                            {workflowData?.status?.replace('_', ' ')}
                          </p>
                        </div>
                        {getStatusIcon(workflowData?.status)}
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Progress</p>
                          <p className="text-lg font-semibold text-green-800">
                            {workflowData?.progress?.completed_steps || 0} / {workflowData?.progress?.total_steps || 0}
                          </p>
                        </div>
                        <Target className="w-6 h-6 text-green-500" />
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Duration</p>
                          <p className="text-lg font-semibold text-purple-800">
                            {formatDuration(workflowData?.total_duration)}
                          </p>
                        </div>
                        <Clock className="w-6 h-6 text-purple-500" />
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-600">Judge Score</p>
                          <p className="text-lg font-semibold text-yellow-800">
                            {workflowData?.judge_score ? `${(workflowData.judge_score * 100).toFixed(1)}%` : 'N/A'}
                          </p>
                        </div>
                        <Shield className="w-6 h-6 text-yellow-500" />
                      </div>
                    </div>
                  </div>

                  {/* Workflow Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Workflow ID</p>
                        <p className="font-mono text-sm text-gray-900">{workflowData?.workflow_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Initiated By</p>
                        <p className="text-sm text-gray-900">{workflowData?.initiated_by || 'System'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Created At</p>
                        <p className="text-sm text-gray-900">{formatTimestamp(workflowData?.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Started At</p>
                        <p className="text-sm text-gray-900">{formatTimestamp(workflowData?.started_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        {workflowData?.transparency_log?.slice(-5).map((event, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Activity className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {event.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatTimestamp(event.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'steps' && (
                <motion.div
                  key="steps"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Filters */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="running">Running</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                        <option value="waiting_for_approval">Waiting for Approval</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search steps..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  {/* Steps List */}
                  <div className="space-y-3">
                    {filteredSteps.map((step, index) => (
                      <div key={step.step_id} className="border border-gray-200 rounded-lg">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(step.status)}
                              <div>
                                <h4 className="font-medium text-gray-900">{step.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {step.agent_name} • {step.action}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                                {step.status.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalLevelColor(step.approval_level)}`}>
                                {step.approval_level.replace('_', ' ')}
                              </span>
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(expandedSteps);
                                  if (expandedSteps.has(step.step_id)) {
                                    newExpanded.delete(step.step_id);
                                  } else {
                                    newExpanded.add(step.step_id);
                                  }
                                  setExpandedSteps(newExpanded);
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Eye className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Duration</p>
                              <p className="font-medium">
                                {formatDuration(step.execution_time || step.estimated_duration)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Judge Score</p>
                              <p className="font-medium">
                                {step.judge_score ? `${(step.judge_score * 100).toFixed(1)}%` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Started</p>
                              <p className="font-medium">
                                {formatTimestamp(step.started_at)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Completed</p>
                              <p className="font-medium">
                                {formatTimestamp(step.completed_at)}
                              </p>
                            </div>
                          </div>

                          {step.status === 'waiting_for_approval' && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Shield className="w-4 h-4 text-yellow-600" />
                                  <span className="text-sm font-medium text-yellow-800">
                                    This step requires your approval
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => onApproveStep?.(workflowId, step.step_id, true)}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => onRejectStep?.(workflowId, step.step_id, false)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {step.error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">Error</span>
                              </div>
                              <p className="text-sm text-red-700 mt-1">{step.error}</p>
                            </div>
                          )}
                        </div>

                        {expandedSteps.has(step.step_id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-gray-200 p-4 bg-gray-50"
                          >
                            <div className="space-y-4">
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Parameters</h5>
                                <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                                  {JSON.stringify(step.parameters, null, 2)}
                                </pre>
                              </div>
                              
                              {step.result && (
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Result</h5>
                                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                                    {JSON.stringify(step.result, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {step.judge_feedback && (
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Judge Feedback</h5>
                                  <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                                    {step.judge_feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'transparency' && (
                <motion.div
                  key="transparency"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Transparency Log</h3>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      <Download className="w-4 h-4" />
                      <span>Export Log</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {workflowData?.transparency_log?.map((event, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {event.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                        <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'performance' && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Execution Time</p>
                          <p className="text-2xl font-bold text-blue-800">
                            {formatDuration(workflowData?.total_duration)}
                          </p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Success Rate</p>
                          <p className="text-2xl font-bold text-green-800">
                            {workflowData?.progress ? 
                              `${((workflowData.progress.completed_steps / workflowData.progress.total_steps) * 100).toFixed(1)}%` 
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500" />
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Judge Score</p>
                          <p className="text-2xl font-bold text-purple-800">
                            {workflowData?.judge_score ? 
                              `${(workflowData.judge_score * 100).toFixed(1)}%` 
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <Shield className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>
                  </div>

                  {/* Performance Chart Placeholder */}
                  <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Performance chart visualization would go here</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'approvals' && (
                <motion.div
                  key="approvals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Approval History</h3>
                  
                  <div className="space-y-3">
                    {workflowData?.steps?.filter(step => step.approval_level !== 'automatic').map((step, index) => (
                      <div key={step.step_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{step.name}</h4>
                            <p className="text-sm text-gray-600">
                              {step.agent_name} • {step.approval_level.replace('_', ' ')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                              {step.status.replace('_', ' ')}
                            </span>
                            {step.status === 'waiting_for_approval' && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => onApproveStep?.(workflowId, step.step_id, true)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => onRejectStep?.(workflowId, step.step_id, false)}
                                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkflowTransparencyModal;
