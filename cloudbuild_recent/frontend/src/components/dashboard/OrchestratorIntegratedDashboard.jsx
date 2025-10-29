/**
 * Orchestrator-Integrated Dashboard Example
 * Shows how any dashboard can trigger autonomous multi-agent workflows
 * This pattern should be applied to all dashboards (Customer, Financial, Content, Business)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Zap,
  Eye,
  Activity,
  Bot,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useBusinessDashboardOrchestration } from '../../hooks/useOrchestratorDashboard.js';
import enhancedOrchestratorService from '../../services/EnhancedOrchestratorService.js';
import WorkflowTransparencyModal from './modals/WorkflowTransparencyModal.jsx';
import AgentActivityFeed from '../transparency/AgentActivityFeed.jsx';

/**
 * Example: Business Intelligence Dashboard with Orchestrator Integration
 * Can be adapted for Customer, Financial, Content, or Campaign dashboards
 */
const OrchestratorIntegratedDashboard = ({ userId }) => {
  // Orchestrator integration
  const {
    triggerOrchestration,
    isOrchestrating,
    activeWorkflows,
    lastOrchestration,
    generateInsights,
    identifyOpportunities,
    createCEOSnapshot
  } = useBusinessDashboardOrchestration(userId);

  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showTransparency, setShowTransparency] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [integrationSummary, setIntegrationSummary] = useState(null);

  useEffect(() => {
    loadDashboardData();
    loadIntegrations();
  }, [userId]);

  const loadDashboardData = async () => {
    // Load actual dashboard data from backend
    // This would fetch real business intelligence data
    setDashboardData({
      revenue: { current: 150000, growth: 20.5, trend: 'up' },
      customers: { total: 1250, new: 85, churn: 3.2 },
      engagement: { rate: 4.8, trend: 'up' },
      agentActivity: { total: 45, completed: 42, active: 3 }
    });
  };

  const loadIntegrations = async () => {
    const result = await enhancedOrchestratorService.getUserIntegrations(userId);
    if (result.success) {
      setIntegrationSummary(result.summary);
    }
  };

  /**
   * Autonomous Action: Generate Business Insights
   * Triggers multi-agent workflow to analyze all business data
   */
  const handleGenerateInsights = async () => {
    const result = await generateInsights();
    if (result) {
      // Show transparency modal
      setSelectedWorkflow(result.workflow_id);
      setShowTransparency(true);
    }
  };

  /**
   * Autonomous Action: Identify Growth Opportunities
   * Orchestrates strategy and intelligence agents to find opportunities
   */
  const handleIdentifyOpportunities = async () => {
    const result = await identifyOpportunities();
    if (result) {
      setSelectedWorkflow(result.workflow_id);
      setShowTransparency(true);
    }
  };

  /**
   * Autonomous Action: Create CEO Snapshot
   * Coordinates all intelligence agents to generate comprehensive overview
   */
  const handleCreateCEOSnapshot = async () => {
    const result = await createCEOSnapshot();
    if (result) {
      setSelectedWorkflow(result.workflow_id);
      setShowTransparency(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Dashboard Header with Orchestrator Status */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Business Intelligence Dashboard</h1>
              <p className="text-blue-100">Powered by Autonomous AI Workforce</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm opacity-90">Active Workflows</div>
                <div className="text-2xl font-bold">{activeWorkflows.length}</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Connected Integrations</div>
                <div className="text-2xl font-bold">{integrationSummary?.total_connected || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Autonomous Actions Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Autonomous Operations</h2>
                <p className="text-sm text-gray-600">Click any action to orchestrate multi-agent workflows</p>
              </div>
            </div>
            <button
              onClick={() => setShowActivityFeed(!showActivityFeed)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span>Agent Activity</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Autonomous Action: Generate Insights */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateInsights}
              disabled={isOrchestrating}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left disabled:opacity-50"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Generate Business Insights</h3>
                  <p className="text-xs text-gray-600 mt-1">Autonomous analysis of all business data</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Business Intelligence Agent</div>
                <div>• Financial Intelligence Agent</div>
                <div>• Customer Intelligence Agent</div>
                <div>• Judge Layer quality check</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-purple-600 font-medium">Fully Autonomous</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
            </motion.button>

            {/* Autonomous Action: Identify Opportunities */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleIdentifyOpportunities}
              disabled={isOrchestrating}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all text-left disabled:opacity-50"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Identify Growth Opportunities</h3>
                  <p className="text-xs text-gray-600 mt-1">AI-powered opportunity discovery</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Growth Opportunity Agent</div>
                <div>• Market Trends Agent</div>
                <div>• Competitive Intelligence Agent</div>
                <div>• Strategy Agent</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-purple-600 font-medium">Fully Autonomous</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
            </motion.button>

            {/* Autonomous Action: CEO Snapshot */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateCEOSnapshot}
              disabled={isOrchestrating}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all text-left disabled:opacity-50"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Create CEO Snapshot</h3>
                  <p className="text-xs text-gray-600 mt-1">Comprehensive executive overview</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Business Intelligence Agent</div>
                <div>• All data integration agents</div>
                <div>• Executive reporting agents</div>
                <div>• Real-time data synthesis</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-purple-600 font-medium">Fully Autonomous</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Dashboard KPIs (with autonomous updates) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Revenue</div>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${dashboardData?.revenue.current.toLocaleString()}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +{dashboardData?.revenue.growth}%
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <Bot className="w-3 h-3 inline mr-1" />
              Auto-synced from integrations
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Customers</div>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData?.customers.total.toLocaleString()}
            </div>
            <div className="flex items-center mt-2">
              <CheckCircle className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm text-blue-600 font-medium">
                +{dashboardData?.customers.new} this month
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <Bot className="w-3 h-3 inline mr-1" />
              CRM auto-synced
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Engagement</div>
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData?.engagement.rate}%
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-sm text-purple-600 font-medium">
                Improving
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <Bot className="w-3 h-3 inline mr-1" />
              Analytics auto-tracked
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Agent Activity</div>
              <Activity className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData?.agentActivity.total}
            </div>
            <div className="flex items-center mt-2">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                {dashboardData?.agentActivity.completed} completed
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <Clock className="w-3 h-3 inline mr-1" />
              {dashboardData?.agentActivity.active} active now
            </div>
          </div>
        </div>

        {/* Active Workflows Panel */}
        {activeWorkflows.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Autonomous Workflows</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {activeWorkflows.length} running
              </span>
            </div>
            <div className="space-y-3">
              {activeWorkflows.map((workflow) => (
                <div key={workflow.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{workflow.action.replace('_', ' ')}</h3>
                        <p className="text-xs text-gray-600">
                          Started {new Date(workflow.started).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workflow.status === 'completed' ? 'bg-green-100 text-green-700' :
                        workflow.status === 'running' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {workflow.status}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedWorkflow(workflow.id);
                          setShowTransparency(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  {workflow.progress && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(workflow.progress.completed_steps / workflow.progress.total_steps) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                        <span>{workflow.progress.completed_steps} / {workflow.progress.total_steps} steps</span>
                        {workflow.progress.pending_approvals > 0 && (
                          <span className="text-yellow-600 font-medium">
                            {workflow.progress.pending_approvals} awaiting approval
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Data & Insights */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Intelligence</h2>
              <p className="text-sm text-gray-600 mb-4">
                Real-time data from {integrationSummary?.total_connected || 0} connected platforms
              </p>
              
              {/* Placeholder for actual dashboard content */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Revenue Growth Trend</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="h-32 bg-white rounded border border-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Chart placeholder - real data from integrations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Agent Activity Feed */}
          <div className="lg:col-span-1">
            {showActivityFeed ? (
              <AgentActivityFeed userId={userId} isCompact={false} maxEvents={20} />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">System Health</span>
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900 mt-2">Excellent</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700">Agents Available</span>
                      <Bot className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-900 mt-2">115+</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transparency Modal */}
      {showTransparency && selectedWorkflow && (
        <WorkflowTransparencyModal
          isOpen={showTransparency}
          onClose={() => setShowTransparency(false)}
          workflowId={selectedWorkflow}
          workflowData={{}}  // Would load from API
          onRefreshWorkflow={async (wfId) => {
            const status = await enhancedOrchestratorService.getWorkflowStatus(wfId);
            return status;
          }}
        />
      )}
    </div>
  );
};

export default OrchestratorIntegratedDashboard;

/**
 * INTEGRATION PATTERN FOR ALL DASHBOARDS
 * ========================================
 * 
 * To add orchestrator integration to any dashboard:
 * 
 * 1. Import the hook:
 *    import { useCustomerDashboardOrchestration } from '../hooks/useOrchestratorDashboard.js';
 * 
 * 2. Use in component:
 *    const { triggerOrchestration, activeWorkflows, analyzeSentiment } = useCustomerDashboardOrchestration(userId);
 * 
 * 3. Add autonomous action buttons:
 *    <button onClick={() => analyzeSentiment(customerId)}>
 *      Analyze Customer Sentiment (Autonomous)
 *    </button>
 * 
 * 4. Show transparency:
 *    <WorkflowTransparencyModal workflowId={workflowId} ... />
 * 
 * 5. Add activity feed:
 *    <AgentActivityFeed userId={userId} />
 * 
 * This pattern enables FULL AUTONOMOUS OPERATION from any dashboard!
 */

