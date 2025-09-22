import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusinessMetrics, useAgentStatus, useWorkflows } from '../hooks/useApiData.js';
import { FinancialFlowVisualization } from '../components/visualizations/FinancialFlowVisualization.tsx';
import OpportunityRadar from '../components/visualizations/OpportunityRadar.jsx';
import ContentPerformanceGarden from '../components/visualizations/ContentPerformanceGarden.jsx';
import MarketingCampaignCreator from '../components/MarketingCampaignCreator.jsx';
import CustomerJourneyConstellation from '../components/visualizations/CustomerJourneyConstellation.jsx';
import { useCelebrations, CelebrationType } from '../components/psychological/MicroCelebrations.jsx';
import ActionTheater from '../components/theater/ActionTheater.jsx';
import { AgentActivityTheater } from '../components/theater/AgentActivityTheater.tsx';
import AgentCollaborationFlow from '../components/theater/AgentCollaborationFlow.jsx';
import { BarChart, Radar, Sparkles, Sprout, Megaphone, TrendingUp, Calendar, Target, Users, DollarSign, FileText, Brain } from 'lucide-react';
import HighLevelOverview from '../components/dashboard/HighLevelOverview.jsx';
import CEOSnapshot from '../components/dashboard/CEOSnapshot.jsx';

// Mock customer data for constellation
const mockCustomers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'TechCorp Solutions',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    stage: 'negotiation',
    value: 25000,
    lastContact: new Date(2024, 0, 10),
    nextFollowUp: new Date(2024, 0, 15),
    source: 'LinkedIn',
    industry: 'Technology',
    location: 'San Francisco, CA',
    notes: 'Interested in enterprise package. Budget approved. Decision maker.',
    tags: ['enterprise', 'hot-lead', 'decision-maker'],
    journey: {
      awareness: new Date(2023, 11, 15),
      consideration: new Date(2023, 11, 22),
      evaluation: new Date(2024, 0, 5),
      negotiation: new Date(2024, 0, 10)
    }
  },
  {
    id: '2',
    name: 'Michael Chen',
    company: 'Growth Marketing Co',
    email: 'michael@growthmarketing.com',
    phone: '+1 (555) 987-6543',
    status: 'prospect',
    stage: 'evaluation',
    value: 15000,
    lastContact: new Date(2024, 0, 8),
    nextFollowUp: new Date(2024, 0, 12),
    source: 'Website',
    industry: 'Marketing',
    location: 'New York, NY',
    notes: 'Looking for marketing automation tools. Comparing with competitors.',
    tags: ['marketing', 'automation', 'comparison'],
    journey: {
      awareness: new Date(2023, 11, 20),
      consideration: new Date(2024, 0, 2),
      evaluation: new Date(2024, 0, 8)
    }
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    company: 'StartupXYZ',
    email: 'emily@startupxyz.com',
    phone: '+1 (555) 456-7890',
    status: 'lead',
    stage: 'consideration',
    value: 8000,
    lastContact: new Date(2024, 0, 5),
    nextFollowUp: new Date(2024, 0, 18),
    source: 'Referral',
    industry: 'Startup',
    location: 'Austin, TX',
    notes: 'Early stage startup. Price sensitive but high growth potential.',
    tags: ['startup', 'price-sensitive', 'high-potential'],
    journey: {
      awareness: new Date(2023, 11, 28),
      consideration: new Date(2024, 0, 5)
    }
  },
  {
    id: '4',
    name: 'David Kim',
    company: 'Enterprise Solutions Inc',
    email: 'david.kim@enterprise.com',
    phone: '+1 (555) 321-0987',
    status: 'customer',
    stage: 'retention',
    value: 45000,
    lastContact: new Date(2024, 0, 12),
    nextFollowUp: new Date(2024, 0, 25),
    source: 'Trade Show',
    industry: 'Enterprise',
    location: 'Chicago, IL',
    notes: 'Long-term customer. Happy with service. Potential for expansion.',
    tags: ['enterprise', 'long-term', 'expansion'],
    journey: {
      awareness: new Date(2023, 8, 15),
      consideration: new Date(2023, 9, 1),
      evaluation: new Date(2023, 9, 15),
      purchase: new Date(2023, 10, 1),
      onboarding: new Date(2023, 10, 5),
      adoption: new Date(2023, 11, 1),
      retention: new Date(2024, 0, 1)
    }
  }
];

// Enhanced Command Center with real data
const EnhancedCommandCenter = () => {
  const { metrics, loading } = useBusinessMetrics();

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const data = metrics?.data || {};
  const trends = data.trends || {};
  const recommendations = data.recommendations || [];

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Business Pulse Monitor</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Traffic Growth</h3>
          <p className="text-2xl font-bold text-blue-800">{trends.traffic || '+15%'}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Conversions</h3>
          <p className="text-2xl font-bold text-green-800">{trends.conversions || '+8%'}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600">Revenue</h3>
          <p className="text-2xl font-bold text-purple-800">{trends.revenue || '+22%'}</p>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Recommendations</h3>
          <ul className="space-y-2">
            {recommendations.slice(0, 3).map((rec, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-gray-600">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Enhanced Action Theater with real agent data
const EnhancedActionTheater = () => {
  const { agents, loading } = useAgentStatus();

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const agentList = agents?.agents || {};
  const activeAgents = Object.entries(agentList).filter(([_, agent]) => agent.status === 'active');

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Agent Activity Theater</h2>
      
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">System Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            agents?.system_status === 'healthy' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {agents?.system_status || 'healthy'}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600">Active Agents:</span>
          <span className="text-sm font-medium text-gray-800">
            {agents?.active_agents || 0} / {agents?.total_agents || 0}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeAgents.slice(0, 4).map(([name, agent]) => (
          <div key={name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800">{name.replace('Agent', '')}</h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Active</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Last activity: {new Date(agent.last_activity).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Opportunity Radar with real workflow data
const EnhancedOpportunityRadar = () => {
  const { workflows, loading } = useWorkflows();

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  const recentWorkflows = workflows.slice(0, 3);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Opportunity Radar</h2>
      
      <div className="space-y-4">
        {recentWorkflows.map((workflow) => (
          <div key={workflow.workflow_id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800">
                {workflow.results?.campaign?.name || 'Workflow'}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                workflow.status === 'completed' 
                  ? 'bg-green-100 text-green-800'
                  : workflow.status === 'running'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {workflow.status}
              </span>
            </div>
            
            {workflow.status === 'running' && (
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{workflow.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${workflow.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600">
              {workflow.current_step}
            </p>
            
            {workflow.results?.estimated_reach && (
              <p className="text-sm text-green-600 mt-2">
                Expected reach: {workflow.results.estimated_reach.toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardView = () => {
  // Simplified Main Dashboard: CEO Snapshot + three friendly cards
  return (
    <div className="space-y-6">
      <CEOSnapshot />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Health */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Financial Health
            </h3>
            <span className="text-sm text-green-600 font-medium">Healthy</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Revenue</span>
              <span className="font-semibold text-green-600">$125,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Expenses</span>
              <span className="font-semibold text-red-600">$85,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Net Profit</span>
              <span className="font-semibold text-blue-600">$40,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
            <p className="text-xs text-gray-500">68% profit margin</p>
          </div>
        </div>

        {/* Content Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              Content Performance
            </h3>
            <span className="text-sm text-blue-600 font-medium">Growing</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Views</span>
              <span className="font-semibold text-blue-600">45.2K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Engagement Rate</span>
              <span className="font-semibold text-green-600">12.4%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Content Pieces</span>
              <span className="font-semibold text-purple-600">156</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-500">75% of monthly goal</p>
          </div>
        </div>

        {/* Agent Activities */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-500" />
              Agent Activities
            </h3>
            <span className="text-sm text-purple-600 font-medium">Active</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Agents</span>
              <span className="font-semibold text-purple-600">12/52</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasks Completed</span>
              <span className="font-semibold text-green-600">47</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="font-semibold text-blue-600">8</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-gray-500">85% efficiency rate</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Legacy content below is intentionally unreachable and will be removed after review
  const [activeTab, setActiveTab] = useState('overview');
  const [contentSubTab, setContentSubTab] = useState('performance');
  const { triggerCelebration } = useCelebrations();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'content', label: 'Content Garden', icon: Sprout },
    { id: 'visualizations', label: 'Visualizations', icon: Radar },
    { id: 'insights', label: 'Agent Theater', icon: Sparkles }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (triggerCelebration) {
      triggerCelebration(CelebrationType.TASK_COMPLETE, {
        message: `Switched to ${tabId} view! 🎯`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CEOSnapshot />
            
            {/* Main Business Drivers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Financial Overview */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                    Financial Health
                  </h3>
                  <span className="text-sm text-green-600 font-medium">Healthy</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Revenue</span>
                    <span className="font-semibold text-green-600">$125,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Expenses</span>
                    <span className="font-semibold text-red-600">$85,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Net Profit</span>
                    <span className="font-semibold text-blue-600">$40,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">68% profit margin</p>
                </div>
              </div>

              {/* Content Performance */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-500" />
                    Content Performance
                  </h3>
                  <span className="text-sm text-blue-600 font-medium">Growing</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Views</span>
                    <span className="font-semibold text-blue-600">45.2K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Engagement Rate</span>
                    <span className="font-semibold text-green-600">12.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Content Pieces</span>
                    <span className="font-semibold text-purple-600">156</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">75% of monthly goal</p>
                </div>
              </div>

              {/* Agent Activities */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-500" />
                    Agent Activities
                  </h3>
                  <span className="text-sm text-purple-600 font-medium">Active</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Agents</span>
                    <span className="font-semibold text-purple-600">12/52</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tasks Completed</span>
                    <span className="font-semibold text-green-600">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="font-semibold text-blue-600">8</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">85% efficiency rate</p>
                </div>
              </div>
            </div>

            <EnhancedActionTheater />
          </motion.div>
        )}

        {activeTab === 'content' && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Content Garden */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Sprout className="w-5 h-5 mr-2 text-green-500" />
                  Content Garden
                </h3>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setContentSubTab('performance')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      contentSubTab === 'performance'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Performance
                  </button>
                  <button
                    onClick={() => setContentSubTab('campaigns')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      contentSubTab === 'campaigns'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Campaign Creator
                  </button>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {contentSubTab === 'performance' && (
                  <motion.div
                    key="performance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ContentPerformanceGarden />
                  </motion.div>
                )}
                
                {contentSubTab === 'campaigns' && (
                  <motion.div
                    key="campaigns"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MarketingCampaignCreator />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Marketing Campaign Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Campaigns */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Megaphone className="w-5 h-5 mr-2 text-blue-500" />
                  Active Campaigns
                </h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Q1 Product Launch</h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Reach</div>
                        <div className="font-semibold">45.2K</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Engagement</div>
                        <div className="font-semibold">8.3%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Conversions</div>
                        <div className="font-semibold">234</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>67%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Brand Awareness</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Running</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Impressions</div>
                        <div className="font-semibold">128.7K</div>
                      </div>
                      <div>
                        <div className="text-gray-600">CTR</div>
                        <div className="font-semibold">2.1%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">CPM</div>
                        <div className="font-semibold">$3.45</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>34%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '34%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Calendar */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                  Content Calendar
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Product Demo Video</div>
                      <div className="text-sm text-gray-600">Tomorrow, 2:00 PM</div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Video</span>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Blog Post: "AI Trends 2024"</div>
                      <div className="text-sm text-gray-600">Friday, 10:00 AM</div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Blog</span>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Social Media Series</div>
                      <div className="text-sm text-gray-600">Next Week</div>
                    </div>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Social</span>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Email Newsletter</div>
                      <div className="text-sm text-gray-600">Monday, 9:00 AM</div>
                    </div>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Email</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Content</p>
                    <p className="text-2xl font-bold text-gray-900">247</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+12% from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                    <p className="text-2xl font-bold text-gray-900">8.3%</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+2.1% from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Content ROI</p>
                    <p className="text-2xl font-bold text-gray-900">340%</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+45% from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lead Generation</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+18% from last month</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'visualizations' && (
          <motion.div
            key="visualizations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-blue-500" />
                  Financial Flow
                </h3>
                <FinancialFlowVisualization />
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Radar className="w-5 h-5 mr-2 text-green-500" />
                  Opportunity Radar
                </h3>
                <OpportunityRadar />
              </div>
            </div>
            
            {/* Customer Journey Constellation */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                Customer Journey Constellation
              </h3>
              <CustomerJourneyConstellation customers={mockCustomers} />
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Agent Activity Theater */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-500" />
                Agent Activity Theater
              </h3>
              <AgentActivityTheater />
            </div>
            
            {/* Action Theater */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-500" />
                Action Theater
              </h3>
              <ActionTheater />
            </div>
            
            {/* Agent Collaboration Flow */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-500" />
                Agent Collaboration Flow
              </h3>
              <AgentCollaborationFlow />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardView;
