import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Play, Pause, Square, Clock, CheckCircle, AlertCircle, BarChart,
  Plus, Search, Filter, Eye, Settings, Brain, Globe, Database,
  Workflow, GitBranch, Target, Users, DollarSign, TrendingUp,
  Calendar, Bell, Shield, Activity, RefreshCw, Download, Upload,
  Link, Zap as ZapIcon, Zapier, ArrowRight, ArrowDown, Wrench,
  ExternalLink, Copy, Trash2, Edit, Save, X, Info
} from 'lucide-react';
import { useCelebrations, CelebrationType } from "../celebrations/MicroCelebrations.jsx';

const AutomationAgent = () => {
  const [activeTab, setActiveTab] = useState('blueprints'); // blueprints, workflows, deploy
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployConfig, setDeployConfig] = useState({
    n8n_url: '',
    api_key: '',
    blueprint_name: ''
  });
  const { triggerCelebration } = useCelebrations();

  // Mock automation blueprints data
  const automationBlueprints = [
    {
      id: 'lead_enrichment',
      name: 'Lead Enrichment Pipeline',
      description: 'Takes raw leads and enriches them with company data, LinkedIn profiles, and contact information.',
      category: 'sales',
      trigger: 'new_lead',
      inputs: ['email', 'company_name', 'linkedin_url'],
      outputs: ['enriched_contact', 'crm_record'],
      status: 'available',
      complexity: 'medium',
      estimated_time: '2-5 minutes',
      success_rate: 0.94,
      usage_count: 1247
    },
    {
      id: 'abandoned_cart',
      name: 'Abandoned Cart Recovery',
      description: 'Automatically sends follow-up emails and SMS to recover abandoned shopping carts.',
      category: 'ecommerce',
      trigger: 'cart_abandoned',
      inputs: ['customer_email', 'cart_items', 'cart_value'],
      outputs: ['reminder_sent', 'crm_update', 'recovery_attempt'],
      status: 'available',
      complexity: 'low',
      estimated_time: '1-3 minutes',
      success_rate: 0.87,
      usage_count: 892
    },
    {
      id: 'competitor_monitoring',
      name: 'Competitor Monitoring',
      description: 'Tracks competitor websites, social media, and press releases for new product launches.',
      category: 'marketing',
      trigger: 'schedule_daily',
      inputs: ['competitor_urls', 'keywords', 'monitoring_channels'],
      outputs: ['alert_summary', 'stored_report', 'trend_analysis'],
      status: 'available',
      complexity: 'high',
      estimated_time: '10-15 minutes',
      success_rate: 0.91,
      usage_count: 456
    },
    {
      id: 'content_repurpose',
      name: 'Content Repurposing Engine',
      description: 'Takes long-form content and automatically creates social media snippets and email drafts.',
      category: 'marketing',
      trigger: 'new_content',
      inputs: ['content_url', 'content_text', 'target_platforms'],
      outputs: ['social_snippets', 'email_drafts', 'content_calendar'],
      status: 'available',
      complexity: 'medium',
      estimated_time: '3-7 minutes',
      success_rate: 0.89,
      usage_count: 678
    },
    {
      id: 'support_escalation',
      name: 'AI-Powered Support Escalation',
      description: 'Routes support tickets to appropriate agents and escalates urgent issues automatically.',
      category: 'customer',
      trigger: 'new_ticket',
      inputs: ['ticket_id', 'customer_priority', 'issue_type'],
      outputs: ['ticket_routed', 'alert_sent', 'escalation_log'],
      status: 'available',
      complexity: 'medium',
      estimated_time: '1-2 minutes',
      success_rate: 0.96,
      usage_count: 1234
    },
    {
      id: 'cashflow_alerts',
      name: 'Finance & Cash Flow Alerts',
      description: 'Monitors bank accounts and sends alerts when cash flow thresholds are breached.',
      category: 'finance',
      trigger: 'schedule_daily',
      inputs: ['account_id', 'thresholds', 'alert_recipients'],
      outputs: ['alert_sent', 'report_generated', 'trend_analysis'],
      status: 'available',
      complexity: 'high',
      estimated_time: '5-10 minutes',
      success_rate: 0.98,
      usage_count: 234
    }
  ];

  // Mock active workflows
  const activeWorkflows = [
    {
      id: 'wf_001',
      name: 'Lead Enrichment Pipeline',
      status: 'running',
      progress: 75,
      lastRun: new Date(Date.now() - 300000),
      nextRun: new Date(Date.now() + 3600000),
      executions: 1247,
      successRate: 0.94,
      avgExecutionTime: '2.3 minutes'
    },
    {
      id: 'wf_002',
      name: 'Abandoned Cart Recovery',
      status: 'idle',
      progress: 0,
      lastRun: new Date(Date.now() - 1800000),
      nextRun: new Date(Date.now() + 1800000),
      executions: 892,
      successRate: 0.87,
      avgExecutionTime: '1.8 minutes'
    },
    {
      id: 'wf_003',
      name: 'Competitor Monitoring',
      status: 'running',
      progress: 45,
      lastRun: new Date(Date.now() - 600000),
      nextRun: new Date(Date.now() + 86400000),
      executions: 456,
      successRate: 0.91,
      avgExecutionTime: '12.5 minutes'
    }
  ];

  // Filter blueprints
  const filteredBlueprints = automationBlueprints.filter(blueprint => {
    const matchesSearch = blueprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blueprint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || blueprint.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      sales: 'bg-blue-100 text-blue-800',
      marketing: 'bg-green-100 text-green-800',
      customer: 'bg-purple-100 text-purple-800',
      finance: 'bg-yellow-100 text-yellow-800',
      ecommerce: 'bg-orange-100 text-orange-800',
      operations: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Get complexity color
  const getComplexityColor = (complexity) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[complexity] || 'bg-gray-100 text-gray-800';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      running: 'bg-green-100 text-green-800',
      idle: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Deploy blueprint
  const deployBlueprint = () => {
    if (!deployConfig.n8n_url || !deployConfig.api_key || !deployConfig.blueprint_name) {
      alert('Please fill in all required fields');
      return;
    }

    // Mock deployment
    setTimeout(() => {
      setShowDeployModal(false);
      setDeployConfig({ n8n_url: '', api_key: '', blueprint_name: '' });
      triggerCelebration(CelebrationType.TASK_COMPLETE, {
        message: "Automation deployed! 🚀",
        intensity: 'normal'
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automation Agent</h1>
            <p className="text-gray-600 mt-2">Manage N8N, Zapier, and Make.com integrations</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{activeWorkflows.length}</div>
              <div className="text-sm text-gray-600">Active Workflows</div>
            </div>
            <button
              onClick={() => setShowDeployModal(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy Blueprint</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2">
          {[
            { id: 'blueprints', label: 'Blueprints', icon: Database },
            { id: 'workflows', label: 'Active Workflows', icon: Activity },
            { id: 'deploy', label: 'Deploy', icon: Upload }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'blueprints' && (
          <motion.div
            key="blueprints"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Available Blueprints</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search blueprints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="customer">Customer</option>
                    <option value="finance">Finance</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="operations">Operations</option>
                    <option value="social_media">Social Media</option>
                    <option value="communication">Communication</option>
                    <option value="automation">Automation</option>
                  </select>
                </div>
              </div>

              {/* Blueprints Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlueprints.map((blueprint) => (
                  <motion.div
                    key={blueprint.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedBlueprint(blueprint)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Workflow className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{blueprint.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{blueprint.category}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getComplexityColor(blueprint.complexity)}`}>
                        {blueprint.complexity}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blueprint.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Success Rate</span>
                        <span className="font-medium text-green-600">{(blueprint.success_rate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Usage Count</span>
                        <span className="font-medium text-gray-900">{blueprint.usage_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Est. Time</span>
                        <span className="font-medium text-gray-900">{blueprint.estimated_time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(blueprint.category)}`}>
                        {blueprint.category}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'workflows' && (
          <motion.div
            key="workflows"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Active Workflows */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Workflows</h2>
              <div className="space-y-4">
                {activeWorkflows.map((workflow) => (
                  <motion.div
                    key={workflow.id}
                    className="border border-gray-200 rounded-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                          <p className="text-sm text-gray-500">ID: {workflow.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
                          {workflow.status}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{workflow.executions}</div>
                        <div className="text-xs text-gray-600">Executions</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{(workflow.successRate * 100).toFixed(1)}%</div>
                        <div className="text-xs text-gray-600">Success Rate</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{workflow.avgExecutionTime}</div>
                        <div className="text-xs text-gray-600">Avg Time</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{workflow.progress}%</div>
                        <div className="text-xs text-gray-600">Progress</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Last Run: {workflow.lastRun.toLocaleString()}</span>
                      <span>Next Run: {workflow.nextRun.toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'deploy' && (
          <motion.div
            key="deploy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Deploy Instructions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Deploy Automation Blueprint</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">How to Deploy</h3>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Select a blueprint from the available options</li>
                    <li>Enter your N8N instance URL and API key</li>
                    <li>Click "Deploy" to automatically set up the workflow</li>
                    <li>Configure the workflow settings in your N8N instance</li>
                  </ol>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blueprint</label>
                    <select
                      value={deployConfig.blueprint_name}
                      onChange={(e) => setDeployConfig(prev => ({ ...prev, blueprint_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a blueprint...</option>
                      {automationBlueprints.map(blueprint => (
                        <option key={blueprint.id} value={blueprint.name}>{blueprint.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">N8N Instance URL</label>
                    <input
                      type="url"
                      value={deployConfig.n8n_url}
                      onChange={(e) => setDeployConfig(prev => ({ ...prev, n8n_url: e.target.value }))}
                      placeholder="https://your-n8n-instance.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <input
                      type="password"
                      value={deployConfig.api_key}
                      onChange={(e) => setDeployConfig(prev => ({ ...prev, api_key: e.target.value }))}
                      placeholder="Enter your N8N API key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeployConfig({ n8n_url: '', api_key: '', blueprint_name: '' })}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={deployBlueprint}
                    disabled={!deployConfig.n8n_url || !deployConfig.api_key || !deployConfig.blueprint_name}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deploy Blueprint
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blueprint Detail Modal */}
      {selectedBlueprint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedBlueprint.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedBlueprint.description}</p>
                </div>
                <button
                  onClick={() => setSelectedBlueprint(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Blueprint Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedBlueprint.category)}`}>
                          {selectedBlueprint.category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Complexity:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getComplexityColor(selectedBlueprint.complexity)}`}>
                          {selectedBlueprint.complexity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trigger:</span>
                        <span className="font-medium">{selectedBlueprint.trigger}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Est. Time:</span>
                        <span className="font-medium">{selectedBlueprint.estimated_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-medium text-green-600">{(selectedBlueprint.success_rate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Usage Count:</span>
                        <span className="font-medium">{selectedBlueprint.usage_count.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Inputs</h3>
                    <div className="space-y-2">
                      {selectedBlueprint.inputs.map(input => (
                        <div key={input} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{input}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Outputs</h3>
                    <div className="space-y-2">
                      {selectedBlueprint.outputs.map(output => (
                        <div key={output} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{output}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        <Play className="w-4 h-4" />
                        <span>Deploy Blueprint</span>
                      </button>
                      <button className="w-full flex items-center justify-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        <span>View in N8N</span>
                      </button>
                      <button className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                        <Copy className="w-4 h-4" />
                        <span>Copy Configuration</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationAgent;
