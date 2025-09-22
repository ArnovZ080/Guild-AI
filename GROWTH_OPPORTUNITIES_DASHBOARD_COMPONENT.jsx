// Growth Opportunities Dashboard Component for Growth Opportunity Agent
// This component provides proactive growth scouting and opportunity management

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  TrendingUp, 
  TrendingDown, 
  Target,
  BarChart3,
  Lightbulb,
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  AlertTriangle,
  X,
  Plus,
  Filter,
  Search,
  Calendar,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Star,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';

const GrowthOpportunitiesDashboardComponent = ({ growthData, onOpportunityAction, onOpportunityAccept, onOpportunityDecline }) => {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('impact');

  if (!growthData) {
    return <GrowthOpportunitiesSkeleton />;
  }

  const { growth_analysis, opportunities_pipeline, top_opportunities, opportunity_kpis } = growthData;

  const tabs = [
    { id: 'pipeline', label: 'Pipeline', icon: BarChart3 },
    { id: 'opportunities', label: 'Opportunities', icon: Lightbulb },
    { id: 'impact', label: 'Impact Matrix', icon: Target },
    { id: 'tracking', label: 'Tracking', icon: Activity },
    { id: 'insights', label: 'Insights', icon: TrendingUp }
  ];

  const filters = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'quick_win', label: 'Quick Wins' },
    { id: 'strategic', label: 'Strategic' },
    { id: 'long_term', label: 'Long Term' },
    { id: 'revenue_growth', label: 'Revenue Growth' },
    { id: 'cost_reduction', label: 'Cost Reduction' },
    { id: 'efficiency', label: 'Efficiency' },
    { id: 'market_expansion', label: 'Market Expansion' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getOpportunityTypeColor = (type) => {
    switch (type) {
      case 'quick_win': return 'text-green-600 bg-green-100';
      case 'strategic': return 'text-blue-600 bg-blue-100';
      case 'long_term': return 'text-purple-600 bg-purple-100';
      case 'fill_in': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'revenue_growth': return <DollarSign className="w-4 h-4" />;
      case 'cost_reduction': return <TrendingDown className="w-4 h-4" />;
      case 'efficiency': return <Zap className="w-4 h-4" />;
      case 'market_expansion': return <Users className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Growth Pipeline Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Rocket className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Growth Opportunities</h1>
              <p className="text-gray-600">Proactive growth scouting and opportunity management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Opportunity
            </button>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {growth_analysis?.opportunity_pipeline_health || 82.5}/100
              </div>
              <p className="text-sm text-gray-600">Pipeline Health Score</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Opportunities</p>
                <p className="text-2xl font-bold text-purple-800">5</p>
                <p className="text-xs text-purple-600">+66.7% this month</p>
              </div>
              <Lightbulb className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg ROI</p>
                <p className="text-2xl font-bold text-green-800">4.9x</p>
                <p className="text-xs text-green-600">+28.9% improvement</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Potential Revenue</p>
                <p className="text-2xl font-bold text-blue-800">$675K</p>
                <p className="text-xs text-blue-600">Combined potential</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Validation Rate</p>
                <p className="text-2xl font-bold text-yellow-800">85%</p>
                <p className="text-xs text-yellow-600">+13.3% improvement</p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-sm'
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
        {activeTab === 'pipeline' && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <OpportunityPipelineTab pipeline={opportunities_pipeline} />
          </motion.div>
        )}

        {activeTab === 'opportunities' && (
          <motion.div
            key="opportunities"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <OpportunitiesTab 
              opportunities={top_opportunities}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onOpportunityAccept={onOpportunityAccept}
              onOpportunityDecline={onOpportunityDecline}
            />
          </motion.div>
        )}

        {activeTab === 'impact' && (
          <motion.div
            key="impact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ImpactMatrixTab opportunities={top_opportunities} />
          </motion.div>
        )}

        {activeTab === 'tracking' && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <TrackingTab growthAnalysis={growth_analysis} />
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
            <InsightsTab growthAnalysis={growth_analysis} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Opportunity Pipeline Tab Component
const OpportunityPipelineTab = ({ pipeline }) => {
  const pipelineData = pipeline || {
    total_opportunities: 5,
    opportunities_by_type: { quick_win: 2, strategic: 2, long_term: 1 },
    opportunities_by_status: { prioritized: 5, presented: 0, accepted: 0 },
    acceptance_rate: 0.0,
    average_roi: 4.9,
    total_potential_revenue: 675000,
    total_implementation_cost: 137000
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Opportunities by Type */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
            By Type
          </h3>
          <div className="space-y-3">
            {Object.entries(pipelineData.opportunities_by_type).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(count / pipelineData.total_opportunities) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities by Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 text-blue-500 mr-2" />
            By Status
          </h3>
          <div className="space-y-3">
            {Object.entries(pipelineData.opportunities_by_status).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / pipelineData.total_opportunities) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-green-500 mr-2" />
            Pipeline Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Acceptance Rate</span>
              <span className="font-semibold text-gray-900">{pipelineData.acceptance_rate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average ROI</span>
              <span className="font-semibold text-green-600">{pipelineData.average_roi}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Potential</span>
              <span className="font-semibold text-blue-600">${(pipelineData.total_potential_revenue / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Cost</span>
              <span className="font-semibold text-red-600">${(pipelineData.total_implementation_cost / 1000).toFixed(0)}K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Flow Visualization */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Activity className="w-5 h-5 text-purple-500 mr-2" />
          Opportunity Pipeline Flow
        </h3>
        
        <div className="flex items-center justify-between">
          {[
            { stage: 'Discovered', count: 0, color: 'bg-gray-200' },
            { stage: 'Evaluated', count: 0, color: 'bg-blue-200' },
            { stage: 'Prioritized', count: 5, color: 'bg-purple-200' },
            { stage: 'Presented', count: 0, color: 'bg-yellow-200' },
            { stage: 'Accepted', count: 0, color: 'bg-green-200' },
            { stage: 'Implemented', count: 0, color: 'bg-green-400' }
          ].map((stage, index) => (
            <div key={stage.stage} className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full ${stage.color} flex items-center justify-center mb-2`}>
                <span className="font-bold text-gray-700">{stage.count}</span>
              </div>
              <span className="text-sm text-gray-600 text-center">{stage.stage}</span>
              {index < 5 && (
                <div className="absolute mt-8 ml-16 w-8 h-0.5 bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Opportunities Tab Component
const OpportunitiesTab = ({ 
  opportunities, 
  searchTerm, 
  setSearchTerm, 
  selectedFilter, 
  setSelectedFilter, 
  sortBy, 
  setSortBy,
  onOpportunityAccept,
  onOpportunityDecline 
}) => {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'quick_win', label: 'Quick Wins' },
    { id: 'strategic', label: 'Strategic' },
    { id: 'long_term', label: 'Long Term' }
  ];

  const sortOptions = [
    { id: 'impact', label: 'Impact Score' },
    { id: 'roi', label: 'ROI' },
    { id: 'revenue', label: 'Potential Revenue' },
    { id: 'confidence', label: 'Confidence Score' }
  ];

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>
          
          <div className="flex gap-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedFilter === filter.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>
                Sort by {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            id: 'opp_001',
            title: 'Launch Premium Tier',
            description: 'Introduce premium subscription tier with advanced features based on customer demand analysis',
            category: 'revenue_growth',
            opportunity_type: 'strategic',
            impact_score: 9.0,
            effort_score: 6.5,
            confidence_score: 8.0,
            timeframe: '3-6_months',
            potential_revenue: 180000,
            implementation_cost: 25000,
            roi_estimate: 7.2,
            status: 'prioritized'
          },
          {
            id: 'opp_002',
            title: 'Automate Customer Onboarding',
            description: 'Implement automated onboarding flow to reduce manual setup time by 70% and improve conversion rates',
            category: 'efficiency',
            opportunity_type: 'quick_win',
            impact_score: 7.0,
            effort_score: 4.5,
            confidence_score: 8.5,
            timeframe: '1-3_months',
            potential_revenue: 45000,
            implementation_cost: 12000,
            roi_estimate: 3.8,
            status: 'prioritized'
          },
          {
            id: 'opp_003',
            title: 'Expand to German Market',
            description: 'Launch localized version of product for German-speaking markets with estimated 2.5M potential customers',
            category: 'market_expansion',
            opportunity_type: 'strategic',
            impact_score: 8.5,
            effort_score: 7.0,
            confidence_score: 7.5,
            timeframe: '6-12_months',
            potential_revenue: 125000,
            implementation_cost: 35000,
            roi_estimate: 3.6,
            status: 'prioritized'
          },
          {
            id: 'opp_004',
            title: 'Optimize Ad Spend Allocation',
            description: 'Reallocate advertising budget from low-performing channels to high-ROI platforms',
            category: 'cost_reduction',
            opportunity_type: 'quick_win',
            impact_score: 6.5,
            effort_score: 3.0,
            confidence_score: 9.0,
            timeframe: 'immediate',
            potential_revenue: 25000,
            implementation_cost: 5000,
            roi_estimate: 5.0,
            status: 'prioritized'
          },
          {
            id: 'opp_005',
            title: 'Partner with Enterprise Integrators',
            description: 'Form strategic partnerships with enterprise system integrators for B2B market expansion',
            category: 'market_expansion',
            opportunity_type: 'long_term',
            impact_score: 8.0,
            effort_score: 8.5,
            confidence_score: 6.5,
            timeframe: '12+_months',
            potential_revenue: 300000,
            implementation_cost: 60000,
            roi_estimate: 5.0,
            status: 'prioritized'
          }
        ].map((opportunity) => (
          <div key={opportunity.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
              </div>
              <div className="flex space-x-1">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Opportunity Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-purple-600">{opportunity.impact_score}/10</div>
                <div className="text-xs text-gray-600">Impact</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-blue-600">{opportunity.effort_score}/10</div>
                <div className="text-xs text-gray-600">Effort</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-green-600">{opportunity.roi_estimate}x</div>
                <div className="text-xs text-gray-600">ROI</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-yellow-600">{opportunity.confidence_score}/10</div>
                <div className="text-xs text-gray-600">Confidence</div>
              </div>
            </div>
            
            {/* Opportunity Details */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOpportunityTypeColor(opportunity.opportunity_type)}`}>
                  {opportunity.opportunity_type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="flex items-center">
                  {getCategoryIcon(opportunity.category)}
                  <span className="ml-1 capitalize">{opportunity.category.replace('_', ' ')}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timeframe:</span>
                <span className="capitalize">{opportunity.timeframe.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Potential Revenue:</span>
                <span className="font-medium">${opportunity.potential_revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Implementation Cost:</span>
                <span className="font-medium">${opportunity.implementation_cost.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => onOpportunityAccept && onOpportunityAccept(opportunity.id)}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Accept
              </button>
              <button
                onClick={() => onOpportunityDecline && onOpportunityDecline(opportunity.id)}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center"
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                Decline
              </button>
              <button className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Impact Matrix Tab Component
const ImpactMatrixTab = ({ opportunities }) => {
  const matrixData = [
    { x: 1, y: 1, label: 'Fill-ins', count: 0, color: 'bg-gray-200' },
    { x: 1, y: 5, label: 'Quick Wins', count: 2, color: 'bg-green-200' },
    { x: 1, y: 9, label: 'Major Projects', count: 0, color: 'bg-blue-200' },
    { x: 5, y: 1, label: 'Thankless Tasks', count: 0, color: 'bg-red-200' },
    { x: 5, y: 5, label: 'Supporting Projects', count: 0, color: 'bg-yellow-200' },
    { x: 5, y: 9, label: 'Strategic Initiatives', count: 2, color: 'bg-purple-200' },
    { x: 9, y: 1, label: 'Questionable', count: 0, color: 'bg-orange-200' },
    { x: 9, y: 5, label: 'Overtime', count: 0, color: 'bg-pink-200' },
    { x: 9, y: 9, label: 'Long-term Bets', count: 1, color: 'bg-indigo-200' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Target className="w-5 h-5 text-purple-500 mr-2" />
          Impact vs Effort Matrix
        </h3>
        
        <div className="relative">
          {/* Matrix Grid */}
          <div className="grid grid-cols-9 gap-1 aspect-square max-w-2xl mx-auto">
            {matrixData.map((cell) => (
              <div
                key={`${cell.x}-${cell.y}`}
                className={`${cell.color} border border-gray-300 flex items-center justify-center relative`}
              >
                {cell.count > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-gray-700">{cell.count}</span>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 text-xs text-center text-gray-600 p-1 bg-white bg-opacity-75">
                  {cell.label}
                </div>
              </div>
            ))}
          </div>
          
          {/* Axes Labels */}
          <div className="flex justify-between mt-4">
            <span className="text-sm text-gray-600">Low Impact</span>
            <span className="text-sm text-gray-600">High Impact</span>
          </div>
          
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm text-gray-600">
            High Effort
          </div>
          <div className="absolute -left-8 bottom-0 -rotate-90 text-sm text-gray-600">
            Low Effort
          </div>
        </div>
      </div>
    </div>
  );
};

// Tracking Tab Component
const TrackingTab = ({ growthAnalysis }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Activity className="w-5 h-5 text-blue-500 mr-2" />
          Growth Tracking & Attribution
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Growth Attribution */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Growth Attribution</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-600">Revenue Opportunities</span>
                <span className="font-semibold text-purple-800">3</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">Cost Saving Opportunities</span>
                <span className="font-semibold text-green-800">1</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600">Efficiency Opportunities</span>
                <span className="font-semibold text-blue-800">1</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-600">Market Expansion</span>
                <span className="font-semibold text-yellow-800">2</span>
              </div>
            </div>
          </div>

          {/* Strategic Alignment */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Strategic Alignment</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenue Growth Alignment</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <span className="font-semibold text-gray-900">80%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Market Expansion Alignment</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <span className="font-semibold text-gray-900">90%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Efficiency Improvement</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <span className="font-semibold text-gray-900">70%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cost Reduction</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="font-semibold text-gray-900">60%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Insights Tab Component
const InsightsTab = ({ growthAnalysis }) => {
  return (
    <div className="space-y-6">
      {/* Key Insights */}
      {growthAnalysis?.key_insights && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
            Key Growth Insights
          </h3>
          <div className="space-y-3">
            {growthAnalysis.key_insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immediate Actions */}
      {growthAnalysis?.immediate_actions && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Immediate Actions
          </h3>
          <div className="space-y-3">
            {growthAnalysis.immediate_actions.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 font-medium">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Opportunities */}
      {growthAnalysis?.top_opportunities && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 text-green-500 mr-2" />
            Top Growth Opportunities
          </h3>
          <div className="space-y-4">
            {growthAnalysis.top_opportunities.map((opportunity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                  <p className="text-sm text-gray-600">
                    Impact/Effort: {opportunity.impact_effort_ratio.toFixed(2)} • 
                    ROI: {opportunity.roi_estimate}x • 
                    Timeframe: {opportunity.timeframe.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ${(opportunity.potential_revenue / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600">Potential Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getOpportunityTypeColor = (type) => {
  switch (type) {
    case 'quick_win': return 'text-green-600 bg-green-100';
    case 'strategic': return 'text-blue-600 bg-blue-100';
    case 'long_term': return 'text-purple-600 bg-purple-100';
    case 'fill_in': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getCategoryIcon = (category) => {
  switch (category) {
    case 'revenue_growth': return <DollarSign className="w-4 h-4" />;
    case 'cost_reduction': return <TrendingDown className="w-4 h-4" />;
    case 'efficiency': return <Zap className="w-4 h-4" />;
    case 'market_expansion': return <Users className="w-4 h-4" />;
    default: return <Lightbulb className="w-4 h-4" />;
  }
};

// Skeleton loading component
const GrowthOpportunitiesSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          <div className="h-12 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default GrowthOpportunitiesDashboardComponent;
