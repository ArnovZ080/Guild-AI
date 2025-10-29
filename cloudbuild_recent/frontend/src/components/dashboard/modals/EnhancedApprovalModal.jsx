import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  Bot, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Eye,
  BarChart3,
  Target,
  Users,
  MessageSquare,
  Settings,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Database,
  Mail,
  Phone,
  Calendar,
  FileText,
  Link,
  Download,
  ExternalLink,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

const EnhancedApprovalModal = ({ 
  isOpen, 
  onClose, 
  approvalData, 
  onApprove, 
  onReject,
  onRequestMoreInfo 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !approvalData) return null;

  const getAgentIcon = (agentType) => {
    switch (agentType) {
      case 'customer_intelligence_agent': return <Users className="w-5 h-5 text-blue-500" />;
      case 'content_intelligence_agent': return <FileText className="w-5 h-5 text-green-500" />;
      case 'marketing_agent': return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case 'support_agent': return <MessageSquare className="w-5 h-5 text-orange-500" />;
      case 'scraper_agent': return <Database className="w-5 h-5 text-indigo-500" />;
      case 'strategy_agent': return <Target className="w-5 h-5 text-red-500" />;
      case 'orchestrator_agent': return <Settings className="w-5 h-5 text-gray-500" />;
      case 'judge_agent': return <Shield className="w-5 h-5 text-yellow-500" />;
      default: return <Bot className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRiskLevelIcon = (level) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (expandedSections.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove?.(approvalData);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject?.(approvalData);
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'agents', label: 'Agent Actions', icon: Bot },
    { id: 'workflow', label: 'Workflow Details', icon: Target },
    { id: 'impact', label: 'Business Impact', icon: TrendingUp },
    { id: 'transparency', label: 'Transparency', icon: Eye }
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
          className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Action Approval Required
                </h2>
                <p className="text-sm text-gray-600">
                  {approvalData?.action_type || 'Agent Action'} • {approvalData?.risk_level || 'Medium'} Risk
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(approvalData?.risk_level)}`}>
                <div className="flex items-center space-x-1">
                  {getRiskLevelIcon(approvalData?.risk_level)}
                  <span>{approvalData?.risk_level || 'Medium'} Risk</span>
                </div>
              </span>
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
                  {/* Action Summary */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Brain className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                          {approvalData?.action_title || 'Agent Action'}
                        </h3>
                        <p className="text-blue-800 mb-4">
                          {approvalData?.action_description || 'The agent is requesting approval to execute an action.'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-blue-600">Initiating Agent</p>
                            <p className="font-medium text-blue-900">
                              {approvalData?.initiating_agent || 'Unknown Agent'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-600">Estimated Duration</p>
                            <p className="font-medium text-blue-900">
                              {formatDuration(approvalData?.estimated_duration)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-600">Requested At</p>
                            <p className="font-medium text-blue-900">
                              {formatTimestamp(approvalData?.requested_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
                        <ul className="space-y-2">
                          {approvalData?.risk_factors?.map((factor, index) => (
                            <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span>{factor}</span>
                            </li>
                          )) || (
                            <li className="text-sm text-gray-500">No specific risk factors identified</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Mitigation Strategies</h4>
                        <ul className="space-y-2">
                          {approvalData?.mitigation_strategies?.map((strategy, index) => (
                            <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                              <Shield className="w-4 h-4 text-green-500" />
                              <span>{strategy}</span>
                            </li>
                          )) || (
                            <li className="text-sm text-gray-500">Standard safety measures in place</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Expected Outcomes */}
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Expected Outcomes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-green-800 mb-2">Positive Impacts</h4>
                        <ul className="space-y-2">
                          {approvalData?.positive_impacts?.map((impact, index) => (
                            <li key={index} className="flex items-center space-x-2 text-sm text-green-700">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span>{impact}</span>
                            </li>
                          )) || (
                            <li className="text-sm text-green-600">Improved customer experience</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800 mb-2">Success Metrics</h4>
                        <ul className="space-y-2">
                          {approvalData?.success_metrics?.map((metric, index) => (
                            <li key={index} className="flex items-center space-x-2 text-sm text-green-700">
                              <BarChart3 className="w-4 h-4 text-green-500" />
                              <span>{metric}</span>
                            </li>
                          )) || (
                            <li className="text-sm text-green-600">Customer satisfaction improvement</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'agents' && (
                <motion.div
                  key="agents"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Involved Agents</h3>
                  
                  <div className="space-y-4">
                    {approvalData?.involved_agents?.map((agent, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getAgentIcon(agent.type)}
                            <div>
                              <h4 className="font-medium text-gray-900">{agent.name}</h4>
                              <p className="text-sm text-gray-600">{agent.role}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            agent.status === 'ready' ? 'bg-green-100 text-green-800' :
                            agent.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {agent.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Actions to Execute</p>
                            <p className="font-medium">{agent.actions?.length || 0} actions</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Estimated Time</p>
                            <p className="font-medium">{formatDuration(agent.estimated_duration)}</p>
                          </div>
                        </div>

                        {agent.actions && (
                          <div className="mt-3">
                            <button
                              onClick={() => toggleSection(`agent-${index}-actions`)}
                              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <span>View Actions</span>
                              {expandedSections.has(`agent-${index}-actions`) ? 
                                <X className="w-4 h-4" /> : 
                                <Eye className="w-4 h-4" />
                              }
                            </button>
                            
                            {expandedSections.has(`agent-${index}-actions`) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 space-y-2"
                              >
                                {agent.actions.map((action, actionIndex) => (
                                  <div key={actionIndex} className="bg-gray-50 p-3 rounded border">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium text-gray-900">{action.name}</p>
                                        <p className="text-sm text-gray-600">{action.description}</p>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {formatDuration(action.estimated_duration)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'workflow' && (
                <motion.div
                  key="workflow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Workflow Details</h3>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Workflow Information</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Workflow ID</p>
                            <p className="font-mono text-sm text-gray-900">
                              {approvalData?.workflow_id || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Workflow Type</p>
                            <p className="text-sm text-gray-900">
                              {approvalData?.workflow_type || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Steps</p>
                            <p className="text-sm text-gray-900">
                              {approvalData?.total_steps || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Execution Plan</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Execution Mode</p>
                            <p className="text-sm text-gray-900">
                              {approvalData?.execution_mode || 'Sequential'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Parallel Steps</p>
                            <p className="text-sm text-gray-900">
                              {approvalData?.parallel_steps || 'None'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Rollback Plan</p>
                            <p className="text-sm text-gray-900">
                              {approvalData?.rollback_plan || 'Automatic'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Steps */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Workflow Steps</h4>
                    {approvalData?.workflow_steps?.map((step, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{step.name}</h5>
                              <p className="text-sm text-gray-600">
                                {step.agent} • {formatDuration(step.estimated_duration)}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            step.approval_required ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {step.approval_required ? 'Requires Approval' : 'Automatic'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'impact' && (
                <motion.div
                  key="impact"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Business Impact Analysis</h3>
                  
                  {/* Customer Impact */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-4 flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Customer Impact</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-600 mb-2">Affected Customers</p>
                        <p className="text-lg font-semibold text-blue-900">
                          {approvalData?.customer_impact?.affected_count || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 mb-2">Impact Type</p>
                        <p className="text-lg font-semibold text-blue-900">
                          {approvalData?.customer_impact?.impact_type || 'Positive'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Impact */}
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-4 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Revenue Impact</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-green-600 mb-2">Expected Revenue Impact</p>
                        <p className="text-lg font-semibold text-green-900">
                          {approvalData?.revenue_impact?.expected_impact || 'Positive'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-green-600 mb-2">Time to Impact</p>
                        <p className="text-lg font-semibold text-green-900">
                          {approvalData?.revenue_impact?.time_to_impact || 'Immediate'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-green-600 mb-2">Confidence Level</p>
                        <p className="text-lg font-semibold text-green-900">
                          {approvalData?.revenue_impact?.confidence_level || 'High'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Operational Impact */}
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-4 flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Operational Impact</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-orange-600 mb-2">System Resources</p>
                        <p className="text-sm text-orange-900">
                          {approvalData?.operational_impact?.system_resources || 'Minimal impact expected'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-orange-600 mb-2">Downtime Risk</p>
                        <p className="text-sm text-orange-900">
                          {approvalData?.operational_impact?.downtime_risk || 'No downtime expected'}
                        </p>
                      </div>
                    </div>
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
                  <h3 className="text-lg font-semibold text-gray-900">Transparency Information</h3>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">Decision Rationale</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Why This Action?</p>
                        <p className="text-sm text-gray-900">
                          {approvalData?.decision_rationale?.why_action || 
                           'This action is recommended based on current customer data and business objectives.'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Alternative Options</p>
                        <p className="text-sm text-gray-900">
                          {approvalData?.decision_rationale?.alternatives || 
                           'No alternative options were identified as more effective.'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Data Sources</p>
                        <p className="text-sm text-gray-900">
                          {approvalData?.decision_rationale?.data_sources || 
                           'Customer interaction data, sentiment analysis, and behavioral patterns.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-4">Audit Trail</h4>
                    <div className="space-y-3">
                      {approvalData?.audit_trail?.map((event, index) => (
                        <div key={index} className="flex items-center space-x-3 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-blue-900">{event.action}</p>
                            <p className="text-blue-700">{formatTimestamp(event.timestamp)} • {event.agent}</p>
                          </div>
                        </div>
                      )) || (
                        <div className="text-sm text-blue-700">
                          <p>• Action initiated by {approvalData?.initiating_agent || 'system'}</p>
                          <p>• Requested at {formatTimestamp(approvalData?.requested_at)}</p>
                          <p>• Risk assessment completed</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onRequestMoreInfo?.(approvalData)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Info className="w-4 h-4" />
                  <span>Request More Info</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <span>Reject</span>
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Approve</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedApprovalModal;
