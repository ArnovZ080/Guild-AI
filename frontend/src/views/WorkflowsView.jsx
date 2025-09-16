import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Play, Pause, Square, Clock, CheckCircle, AlertCircle, BarChart,
  Plus, Search, Filter, Eye, Settings, Brain, Globe, Database,
  Workflow, GitBranch, Target, Users, DollarSign, TrendingUp,
  Calendar, Bell, Shield, Activity, RefreshCw, Download, Upload,
  Link, Zap as ZapIcon, ArrowRight, ArrowDown, Wrench, FileText, Network, Mail, MessageSquare, Share, Headphones
} from 'lucide-react';
import { useWorkflows } from '../hooks/useApiData.js';
import { useCelebrations, CelebrationType } from '../components/psychological/MicroCelebrations.jsx';
import apiService from '../services/api.js';
import NoDataPlaceholder from '../components/placeholders/NoDataPlaceholder.jsx';

// Enhanced autonomous workflow data
const autonomousWorkflows = [
  {
    id: '1',
    name: 'Customer Onboarding Automation',
    type: 'autonomous',
    status: 'running',
    progress: 75,
    currentStep: 'Sending welcome email sequence',
    description: 'Automatically onboard new customers with personalized welcome sequence',
    agents: ['Customer Success Agent', 'Email Marketing Agent', 'Personalization Agent'],
    integrations: ['Zapier', 'Gmail', 'HubSpot'],
    triggers: ['New customer signup', 'Payment confirmation'],
    actions: [
      { step: 'Send welcome email', status: 'completed', agent: 'Email Marketing Agent' },
      { step: 'Create customer profile', status: 'completed', agent: 'Customer Success Agent' },
      { step: 'Schedule onboarding call', status: 'in-progress', agent: 'Calendar Agent' },
      { step: 'Send product tutorial', status: 'pending', agent: 'Content Agent' }
    ],
    metrics: {
      customersProcessed: 234,
      successRate: 94,
      avgTimeToComplete: '2.3 hours',
      costPerCustomer: '$12.50'
    },
    schedule: 'Real-time',
    lastRun: new Date(2024, 0, 12, 14, 30),
    nextRun: 'Continuous',
    createdBy: 'Autonomous System',
    businessGoal: 'Reduce onboarding time by 60%'
  },
  {
    id: '2',
    name: 'Lead Qualification & Nurturing',
    type: 'autonomous',
    status: 'running',
    progress: 68,
    currentStep: 'Analyzing lead behavior patterns',
    description: 'Automatically qualify and nurture leads based on behavior and engagement',
    agents: ['Lead Personalization Agent', 'Sales Agent', 'Analytics Agent'],
    integrations: ['HubSpot', 'LinkedIn', 'Gmail', 'WhatsApp'],
    triggers: ['Website visit', 'Form submission', 'Email engagement'],
    actions: [
      { step: 'Score lead quality', status: 'completed', agent: 'Analytics Agent' },
      { step: 'Personalize outreach', status: 'completed', agent: 'Lead Personalization Agent' },
      { step: 'Schedule follow-up', status: 'in-progress', agent: 'Sales Agent' },
      { step: 'Update CRM', status: 'pending', agent: 'Data Agent' }
    ],
    metrics: {
      leadsProcessed: 1247,
      qualificationRate: 78,
      conversionRate: 23,
      avgResponseTime: '15 minutes'
    },
    schedule: 'Real-time',
    lastRun: new Date(2024, 0, 12, 14, 25),
    nextRun: 'Continuous',
    createdBy: 'Sales Strategy Agent',
    businessGoal: 'Increase lead conversion by 40%'
  },
  {
    id: '3',
    name: 'Content Distribution & Optimization',
    type: 'autonomous',
    status: 'running',
    progress: 82,
    currentStep: 'Optimizing social media posts',
    description: 'Automatically distribute content across platforms and optimize for engagement',
    agents: ['Content Strategist Agent', 'Social Media Agent', 'SEO Agent'],
    integrations: ['Facebook', 'Instagram', 'LinkedIn', 'Gmail', 'WhatsApp'],
    triggers: ['New content published', 'Performance threshold met'],
    actions: [
      { step: 'Schedule social posts', status: 'completed', agent: 'Social Media Agent' },
      { step: 'Optimize for SEO', status: 'completed', agent: 'SEO Agent' },
      { step: 'A/B test variations', status: 'in-progress', agent: 'Content Strategist Agent' },
      { step: 'Analyze performance', status: 'pending', agent: 'Analytics Agent' }
    ],
    metrics: {
      postsScheduled: 156,
      avgEngagement: 8.3,
      reachIncrease: 45,
      timeSaved: '12 hours/week'
    },
    schedule: 'Daily',
    lastRun: new Date(2024, 0, 12, 9, 0),
    nextRun: new Date(2024, 0, 13, 9, 0),
    createdBy: 'Content Strategy Agent',
    businessGoal: 'Increase content reach by 50%'
  },
  {
    id: '4',
    name: 'Financial Reporting & Analysis',
    type: 'autonomous',
    status: 'completed',
    progress: 100,
    currentStep: 'Report generated and distributed',
    description: 'Automatically generate and distribute financial reports to stakeholders',
    agents: ['Accounting Agent', 'Analytics Agent', 'Email Agent'],
    integrations: ['QuickBooks', 'Gmail', 'HubSpot', 'WhatsApp'],
    triggers: ['End of month', 'Quarterly review'],
    actions: [
      { step: 'Extract financial data', status: 'completed', agent: 'Accounting Agent' },
      { step: 'Generate insights', status: 'completed', agent: 'Analytics Agent' },
      { step: 'Create report', status: 'completed', agent: 'Document Agent' },
      { step: 'Distribute to stakeholders', status: 'completed', agent: 'Email Agent' }
    ],
    metrics: {
      reportsGenerated: 12,
      accuracyRate: 99.8,
      timeSaved: '8 hours/month',
      stakeholderSatisfaction: 95
    },
    schedule: 'Monthly',
    lastRun: new Date(2024, 0, 1, 8, 0),
    nextRun: new Date(2024, 1, 1, 8, 0),
    createdBy: 'Financial Agent',
    businessGoal: 'Automate 100% of financial reporting'
  },
  {
    id: '5',
    name: 'Customer Support Automation',
    type: 'autonomous',
    status: 'running',
    progress: 91,
    currentStep: 'Escalating complex queries',
    description: 'Automatically handle customer support queries and escalate when needed',
    agents: ['Support Agent', 'Chat Agent', 'Escalation Agent'],
    integrations: ['WhatsApp', 'Messenger', 'Gmail', 'HubSpot'],
    triggers: ['New support ticket', 'Chat message', 'Email inquiry'],
    actions: [
      { step: 'Classify query type', status: 'completed', agent: 'Support Agent' },
      { step: 'Generate response', status: 'completed', agent: 'Chat Agent' },
      { step: 'Check knowledge base', status: 'completed', agent: 'Knowledge Agent' },
      { step: 'Escalate if needed', status: 'in-progress', agent: 'Escalation Agent' }
    ],
    metrics: {
      ticketsHandled: 892,
      autoResolutionRate: 67,
      avgResponseTime: '2 minutes',
      customerSatisfaction: 4.2
    },
    schedule: '24/7',
    lastRun: new Date(2024, 0, 12, 14, 35),
    nextRun: 'Continuous',
    createdBy: 'Support Strategy Agent',
    businessGoal: 'Resolve 80% of queries automatically'
  }
];

const WorkflowsView = () => {
  const { workflows, loading } = useWorkflows();
  const [activeTab, setActiveTab] = useState('autonomous'); // autonomous, manual, templates
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [realWorkflows, setRealWorkflows] = useState([]);
  const [connectorStatus, setConnectorStatus] = useState({});
  const [workflowsLoading, setWorkflowsLoading] = useState(true);
  const { triggerCelebration } = useCelebrations();
  const [optimizing, setOptimizing] = useState(false);
  const [optResult, setOptResult] = useState(null);
  const [deployingId, setDeployingId] = useState(null);

  // Load real workflow data
  useEffect(() => {
    const loadRealData = async () => {
      try {
        setWorkflowsLoading(true);
        
        // Load agent workflows
        const agentWorkflows = await apiService.getAllWorkflows();
        if (agentWorkflows && agentWorkflows.workflows) {
          setRealWorkflows(agentWorkflows.workflows);
        }
        
        // Load connector status
        const connectorData = await apiService.getConnectorStatus();
        if (connectorData && connectorData.connectors) {
          setConnectorStatus(connectorData.connectors);
        }
      } catch (error) {
        console.error('Failed to load real workflow data:', error);
      } finally {
        setWorkflowsLoading(false);
      }
    };
    
    loadRealData();
  }, []);

  // Filter workflows - use real data if available, fallback to mock
  const workflowsToShow = realWorkflows.length > 0 ? realWorkflows : autonomousWorkflows;
  const filteredWorkflows = workflowsToShow.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesType = filterType === 'all' || workflow.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOptimize = async () => {
    setOptimizing(true);
    setOptResult(null);
    try {
      const objective = 'Improve workflow performance and engagement';
      const analytics = { filterStatus, filterType, searchTerm };
      const res = await apiService.optimize(objective, analytics);
      setOptResult(res);
      triggerCelebration(CelebrationType.TASK_COMPLETE, {
        message: 'Optimization recommendations generated! ✨',
        intensity: 'normal'
      });
    } catch (e) {
      setOptResult({ success: false, recommendations: [] });
    } finally {
      setOptimizing(false);
    }
  };

  const handleDeploy = async (workflow) => {
    const wfId = workflow.workflow_id || workflow.id;
    if (!wfId) return;
    setDeployingId(wfId);
    try {
      const res = await apiService.deployWorkflow(wfId, 'n8n');
      triggerCelebration(CelebrationType.TASK_COMPLETE, {
        message: 'Workflow deployed! 🚀',
        intensity: 'normal'
      });
    } catch (e) {
      // no-op; UI remains unchanged
    } finally {
      setDeployingId(null);
    }
  };

  // Get status styling
  const getStatusStyle = (status) => {
    const styles = {
      running: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get integration icon
  const getIntegrationIcon = (integration) => {
    const icons = {
      'Zapier': Wrench,
      'Make.com': Workflow,
      'N8N': Network,
      'HubSpot': Database,
      'Gmail': Mail,
      'WhatsApp': MessageSquare,
      'Messenger': MessageSquare,
      'Facebook': Globe,
      'Instagram': Camera,
      'LinkedIn': Users,
      'QuickBooks': DollarSign,
      'Excel': FileText,
      'CRM': Database,
      'Google Analytics': BarChart,
      'Slack': MessageSquare,
      'Zendesk': Headphones,
      'Intercom': MessageSquare,
      'Buffer': Share,
      'Hootsuite': Share,
      'Twitter': Globe
    };
    return icons[integration] || Link;
  };

  // Workflow card component
  const WorkflowCard = ({ workflow }) => (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6 border hover:shadow-xl transition-shadow cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => setSelectedWorkflow(workflow)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Workflow className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
            <p className="text-sm text-gray-500">{workflow.description}</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2 items-end">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(workflow.status)}`}>
            {workflow.status}
          </span>
          <span className="text-xs text-gray-500 capitalize">{workflow.type}</span>
          {(workflow.workflow_id || workflow.id) && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDeploy(workflow); }}
              disabled={deployingId === (workflow.workflow_id || workflow.id)}
              className="mt-2 inline-flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {deployingId === (workflow.workflow_id || workflow.id) ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Deploying…</span>
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3" />
                  <span>Deploy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{workflow.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${workflow.progress}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Current Step:</span> {workflow.currentStep}
        </p>
      </div>

      {/* Agents */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Agents Involved:</h4>
        <div className="flex flex-wrap gap-1">
          {(workflow.agents || workflow.agents_involved || []).slice(0, 3).map((agent, idx) => (
            <span key={`${agent}-${idx}`} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {agent}
            </span>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Integrations:</h4>
        <div className="flex flex-wrap gap-2">
          {(workflow.integrations || []).slice(0, 4).map(integration => {
            const IntegrationIcon = getIntegrationIcon(integration);
            return (
              <div key={integration} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full">
                <IntegrationIcon className="w-3 h-3 text-gray-600" />
                <span className="text-xs text-gray-600">{integration}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics */}
      {workflow.metrics && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {workflow.metrics.customersProcessed || workflow.metrics.leadsProcessed || workflow.metrics.postsScheduled || workflow.metrics.reportsGenerated || workflow.metrics.ticketsHandled}
            </div>
            <div className="text-xs text-gray-500">Processed</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {(workflow.metrics.successRate || workflow.metrics.qualificationRate || workflow.metrics.avgEngagement || workflow.metrics.accuracyRate || workflow.metrics.autoResolutionRate) && `${workflow.metrics.successRate || workflow.metrics.qualificationRate || workflow.metrics.avgEngagement || workflow.metrics.accuracyRate || workflow.metrics.autoResolutionRate}%`}
            </div>
            <div className="text-xs text-gray-500">Success Rate</div>
          </div>
        </div>
      )}

      {/* Business Goal */}
      {workflow.businessGoal && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-900">Business Goal</span>
          </div>
          <p className="text-sm text-blue-800">{workflow.businessGoal}</p>
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Autonomous Workflows</h1>
            <p className="text-gray-600 mt-2">AI-powered business automation with N8N, Zapier, and Make.com integrations</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowCreateModal(true);
                triggerCelebration(CelebrationType.TASK_COMPLETE, {
                  message: "Creating new workflow! ⚡",
                  intensity: 'normal'
                });
              }}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workflow</span>
            </button>
            <button
              onClick={handleOptimize}
              disabled={optimizing}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {optimizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Optimizing…</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Optimize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-4">
          {['autonomous', 'manual', 'templates'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="autonomous">Autonomous</option>
              <option value="manual">Manual</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {filteredWorkflows.length} of {autonomousWorkflows.length} workflows
          </div>
        </div>

        {optResult && (
          <div className="mt-4 p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="font-semibold text-green-800 mb-1">Optimization Recommendations</div>
            {Array.isArray(optResult.recommendations) && optResult.recommendations.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-green-700">
                {optResult.recommendations.map((rec, idx) => (
                  <li key={idx}>{typeof rec === 'string' ? rec : `${rec.action}: ${JSON.stringify(rec.details)}`}</li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-green-700">No recommendations available.</div>
            )}
          </div>
        )}
      </div>

      {/* Autonomous Workflows Grid */}
      {activeTab === 'autonomous' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {workflowsLoading ? (
              // Loading state
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-lg p-6 border animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))
            ) : filteredWorkflows.length > 0 ? (
              // Real workflow data
              filteredWorkflows.map(workflow => (
                <WorkflowCard key={workflow.workflow_id || workflow.id} workflow={workflow} />
              ))
            ) : (
              // No data placeholder
              <div className="col-span-full">
                <NoDataPlaceholder
                  title="No Workflows Found"
                  description="You don't have any active workflows yet. Create your first workflow to start automating your business processes."
                  actionType="activate"
                  actionText="Create Workflow"
                  onAction={() => setShowCreateModal(true)}
                  icon={Workflow}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Integration Status */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(connectorStatus).length > 0 ? (
            // Show real connector status
            Object.entries(connectorStatus).slice(0, 6).map(([platform, status]) => {
              const isConnected = status.status === 'connected';
              const bgColor = isConnected ? 'bg-green-50' : 'bg-gray-50';
              const iconColor = isConnected ? 'text-green-600' : 'text-gray-500';
              const textColor = isConnected ? 'text-green-600' : 'text-gray-500';
              const Icon = getIntegrationIcon(platform);
              
              return (
                <div key={platform} className={`flex items-center space-x-3 p-4 ${bgColor} rounded-lg`}>
                  <div className={`p-2 ${isConnected ? 'bg-green-100' : 'bg-gray-100'} rounded-lg`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 capitalize">{platform}</div>
                    <div className={`text-sm ${textColor}`}>
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Show placeholder for no connector data
            <>
              <div className="col-span-full">
                <NoDataPlaceholder
                  title="No Platform Connections"
                  description="Connect your social media, email, and automation platforms to enable powerful workflows and data synchronization."
                  actionType="connect"
                  actionText="Connect Platforms"
                  onAction={() => {/* Navigate to connectors page */}}
                  icon={Link}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Autonomous Capabilities */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Autonomous Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg text-white">
            <Brain className="w-8 h-8 mx-auto mb-2" />
            <div className="text-lg font-bold">AI Learning</div>
            <div className="text-sm opacity-90">Continuous optimization</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-green-400 to-green-600 rounded-lg text-white">
            <Globe className="w-8 h-8 mx-auto mb-2" />
            <div className="text-lg font-bold">App Integration</div>
            <div className="text-sm opacity-90">500+ connected apps</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg text-white">
            <Calendar className="w-8 h-8 mx-auto mb-2" />
            <div className="text-lg font-bold">Auto Scheduling</div>
            <div className="text-sm opacity-90">Smart task timing</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg text-white">
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <div className="text-lg font-bold">Cloud Employees</div>
            <div className="text-sm opacity-90">24/7 operation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowsView;
