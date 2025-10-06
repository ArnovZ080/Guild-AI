// Growth Dashboard Component
// Autonomous growth opportunity identification and implementation tracking

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Target, DollarSign, Users, Calendar, 
  CheckCircle, XCircle, Clock, Star, Lightbulb, Brain, Zap,
  ArrowUpRight, ArrowDownRight, AlertCircle, Info, ThumbsUp, ThumbsDown,
  Filter, Search, RefreshCw, Download, Eye, Settings, Activity,
  Loader
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../psychological/MicroCelebrations.jsx';

// Import modals
import GrowthOpportunityModal from './modals/GrowthOpportunityModal.jsx';
import WorkflowConfirmationModal from './modals/WorkflowConfirmationModal.jsx';
import AcceptedOpportunityModal from './modals/AcceptedOpportunityModal.jsx';

const GrowthDashboard = () => {
  // State management
  const [opportunities, setOpportunities] = useState([]);
  const [acceptedOpportunities, setAcceptedOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);
  const [workflowData, setWorkflowData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { triggerCelebration } = useCelebrations();

  // Fetch opportunities on mount
  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const url = forceRefresh 
        ? '/api/growth-opportunities/generate?force_refresh=true'
        : '/api/growth-opportunities/list';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      
      const data = await response.json();
      
      // Separate accepted and pending opportunities
      const pending = data.filter(opp => opp.status === 'pending' || opp.status === 'rejected');
      const accepted = data.filter(opp => 
        opp.status === 'accepted' || 
        opp.status === 'in_progress' || 
        opp.status === 'completed'
      );
      
      setOpportunities(pending);
      setAcceptedOpportunities(accepted);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewOpportunities = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/growth-opportunities/generate?force_refresh=true');
      if (!response.ok) throw new Error('Failed to generate opportunities');
      
      const data = await response.json();
      
      // Separate accepted and pending opportunities
      const pending = data.filter(opp => opp.status === 'pending');
      const accepted = data.filter(opp => 
        opp.status === 'accepted' || 
        opp.status === 'in_progress' || 
        opp.status === 'completed'
      );
      
      setOpportunities(pending);
      setAcceptedOpportunities(accepted);
      
      triggerCelebration(CelebrationType.MILESTONE_REACHED, {
        message: `🚀 Found ${pending.length} new growth opportunities!`,
        intensity: 'high'
      });
    } catch (error) {
      console.error('Error generating opportunities:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleViewOpportunity = (opportunity) => {
    setSelectedOpportunity(opportunity);
    if (opportunity.status === 'pending' || opportunity.status === 'rejected') {
      setShowDetailModal(true);
    } else {
      setShowAcceptedModal(true);
    }
  };

  const handleAcceptOpportunity = async (opportunityId) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/growth-opportunities/${opportunityId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: opportunityId })
      });
      
      if (!response.ok) throw new Error('Failed to accept opportunity');
      
      const data = await response.json();
      
      // Show workflow confirmation modal
      setWorkflowData(data.workflow_definition);
      setShowDetailModal(false);
      setShowWorkflowModal(true);
      
    } catch (error) {
      console.error('Error accepting opportunity:', error);
      alert('Failed to accept opportunity. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmWorkflow = async () => {
    setIsProcessing(true);
    try {
      // Approve the workflow
      const response = await fetch(`/api/workflows/${workflowData.workflow_id}/approve`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to approve workflow');
      
      // Close modal and refresh
      setShowWorkflowModal(false);
      setWorkflowData(null);
      await fetchOpportunities();
      
      triggerCelebration(CelebrationType.TASK_COMPLETE, {
        message: "🎉 Growth opportunity workflow initiated!",
        intensity: 'high'
      });
      
    } catch (error) {
      console.error('Error confirming workflow:', error);
      alert('Failed to start workflow. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectOpportunity = async (opportunityId) => {
    try {
      const response = await fetch(`/api/growth-opportunities/${opportunityId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: 'User declined opportunity' 
        })
      });
      
      if (!response.ok) throw new Error('Failed to reject opportunity');
      
      // Close modal and refresh
      setShowDetailModal(false);
      await fetchOpportunities();
      
      triggerCelebration(CelebrationType.TASK_COMPLETE, {
        message: "Opportunity reviewed ✅",
        intensity: 'normal'
      });
      
    } catch (error) {
      console.error('Error rejecting opportunity:', error);
    }
  };

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesStatus = filterStatus === 'all' || opp.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || opp.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || opp.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      marketing: TrendingUp,
      sales: Target,
      product: Lightbulb,
      operations: Settings,
      financial: DollarSign
    };
    return icons[category] || Brain;
  };

  const getImpactColor = (impact) => {
    const colors = {
      high: 'text-green-600',
      medium: 'text-yellow-600',
      low: 'text-gray-600'
    };
    return colors[impact] || 'text-gray-600';
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Growth Opportunities</h1>
            <p className="text-gray-600">
              AI-powered growth recommendations based on your business intelligence, customer data, and market trends
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => generateNewOpportunities()}
              disabled={generating}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Analysis</span>
                </>
              )}
            </button>
            <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
            <option value="product">Product</option>
            <option value="operations">Operations</option>
            <option value="financial">Financial</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading growth opportunities...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Pending Opportunities Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">New Opportunities</h2>
            {filteredOpportunities.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No new opportunities at the moment</p>
                <p className="text-sm text-gray-500">Click "Refresh Analysis" to generate new opportunities</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredOpportunities.map((opportunity, index) => {
                    const CategoryIcon = getCategoryIcon(opportunity.category);
                    
                    return (
                      <motion.div
                        key={opportunity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                        onClick={() => handleViewOpportunity(opportunity)}
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <CategoryIcon className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                                  {opportunity.title}
                                </h3>
                                <p className="text-xs text-gray-500 capitalize">
                                  {opportunity.category} • {opportunity.timeframe}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                                {opportunity.status}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(opportunity.priority)}`}>
                                {opportunity.priority}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {opportunity.description}
                          </p>

                          {/* Metrics */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Expected ROI:</span>
                              <span className="font-medium text-green-600">{opportunity.expected_roi}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Expected Revenue:</span>
                              <span className="font-medium text-green-600">{opportunity.expected_revenue}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Impact:</span>
                              <span className={`font-medium ${getImpactColor(opportunity.impact)}`}>
                                {opportunity.impact}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Confidence:</span>
                              <span className="font-medium text-blue-600">
                                {(opportunity.confidence_score * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>

                          {/* View Details Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOpportunity(opportunity);
                            }}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Accepted Opportunities Section */}
          {acceptedOpportunities.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-green-600" />
                Active Growth Initiatives
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {acceptedOpportunities.map((opportunity, index) => {
                  const CategoryIcon = getCategoryIcon(opportunity.category);
                  
                  return (
                    <motion.div
                      key={opportunity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-green-200"
                      onClick={() => handleViewOpportunity(opportunity)}
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <CategoryIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                                {opportunity.title}
                              </h3>
                              <p className="text-xs text-gray-500 capitalize">
                                {opportunity.category}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                            {opportunity.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-blue-600">In Progress</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '65%' }} />
                          </div>
                        </div>

                        {/* Expected Outcome */}
                        <div className="p-3 bg-white rounded-lg border border-green-200 mb-4">
                          <p className="text-xs text-gray-600 mb-1">Target Outcome:</p>
                          <p className="text-sm font-semibold text-green-600">{opportunity.expected_roi}</p>
                        </div>

                        {/* View Progress Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOpportunity(opportunity);
                          }}
                          className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Activity className="w-4 h-4" />
                          <span>View Progress & Analytics</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showDetailModal && selectedOpportunity && (
          <GrowthOpportunityModal
            opportunity={selectedOpportunity}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedOpportunity(null);
            }}
            onAccept={handleAcceptOpportunity}
            onReject={handleRejectOpportunity}
            isLoading={isProcessing}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWorkflowModal && workflowData && selectedOpportunity && (
          <WorkflowConfirmationModal
            workflow={workflowData}
            opportunity={selectedOpportunity}
            onConfirm={handleConfirmWorkflow}
            onCancel={() => {
              setShowWorkflowModal(false);
              setWorkflowData(null);
            }}
            isLoading={isProcessing}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAcceptedModal && selectedOpportunity && (
          <AcceptedOpportunityModal
            opportunity={selectedOpportunity}
            onClose={() => {
              setShowAcceptedModal(false);
              setSelectedOpportunity(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GrowthDashboard;

