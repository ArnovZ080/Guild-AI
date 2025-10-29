// Enhanced CEO Snapshot Component for Business Intelligence Dashboard
// This component displays the comprehensive KPI overview as a "CEO snapshot"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Users, 
  Target, 
  Clock,
  Brain,
  Zap,
  BarChart3,
  Activity
} from 'lucide-react';

const CEOSnapshotComponent = ({ snapshotData, onKpiClick }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedKpis, setExpandedKpis] = useState(new Set());

  if (!snapshotData) {
    return <CEOSnapshotSkeleton />;
  }

  const { overall_business_health, core_kpis, executive_summary, actionable_insights, top_priorities } = snapshotData;

  const kpiCategories = {
    financial: {
      name: 'Financial Health',
      icon: DollarSign,
      color: 'green',
      kpis: ['revenue_growth_rate', 'net_profit_margin', 'cash_runway', 'campaign_roi']
    },
    customer: {
      name: 'Customer Health',
      icon: Users,
      color: 'blue',
      kpis: ['customer_acquisition_cost', 'customer_lifetime_value', 'churn_rate', 'net_promoter_score', 'funnel_conversion_rates']
    },
    operational: {
      name: 'Operational Health',
      icon: Zap,
      color: 'purple',
      kpis: ['operational_efficiency', 'time_saved_agents']
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trendDirection, trendPercentage) => {
    if (trendDirection === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trendDirection === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    } else {
      return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const toggleKpiExpansion = (kpiId) => {
    const newExpanded = new Set(expandedKpis);
    if (newExpanded.has(kpiId)) {
      newExpanded.delete(kpiId);
    } else {
      newExpanded.add(kpiId);
    }
    setExpandedKpis(newExpanded);
  };

  const filteredKpis = selectedCategory === 'all' 
    ? Object.entries(core_kpis)
    : Object.entries(core_kpis).filter(([key, kpi]) => 
        kpiCategories[selectedCategory]?.kpis.includes(key)
      );

  return (
    <div className="space-y-6">
      {/* Overall Business Health Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Brain className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CEO Snapshot</h1>
              <p className="text-gray-600">Comprehensive business health overview</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
              overall_business_health.color === 'green' ? 'bg-green-100 text-green-800' :
              overall_business_health.color === 'blue' ? 'bg-blue-100 text-blue-800' :
              overall_business_health.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {overall_business_health.score}/100
            </div>
            <p className="text-sm text-gray-600 mt-1">{overall_business_health.status}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
          <p className="text-gray-700">{executive_summary}</p>
        </div>

        {/* Critical Alerts */}
        {top_priorities.critical_issues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <h3 className="font-semibold text-red-900">Critical Issues</h3>
            </div>
            <ul className="space-y-1">
              {top_priorities.critical_issues.map((issue, index) => (
                <li key={index} className="text-red-700 text-sm">• {issue}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* KPI Categories Filter */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All KPIs
          </button>
          {Object.entries(kpiCategories).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                  selectedCategory === key
                    ? `bg-${category.color}-600 text-white`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 mr-1" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredKpis.map(([key, kpi], index) => (
            <motion.div
              key={kpi.kpi_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => onKpiClick && onKpiClick(kpi)}
            >
              {/* KPI Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">{kpi.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
                  {kpi.status}
                </span>
              </div>

              {/* Current Value */}
              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {kpi.current_value.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">{kpi.unit}</span>
                </div>
                <div className="flex items-center mt-1">
                  {getTrendIcon(kpi.trend_direction, kpi.trend_percentage)}
                  <span className={`text-sm ml-1 ${
                    kpi.trend_direction === 'up' ? 'text-green-600' :
                    kpi.trend_direction === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {kpi.trend_percentage > 0 ? '+' : ''}{kpi.trend_percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Target: {kpi.target_value.toLocaleString()}</span>
                  <span>{Math.round((kpi.current_value / kpi.target_value) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      kpi.status === 'excellent' ? 'bg-green-500' :
                      kpi.status === 'good' ? 'bg-blue-500' :
                      kpi.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((kpi.current_value / kpi.target_value) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Expandable Details */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleKpiExpansion(kpi.kpi_id);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                {expandedKpis.has(kpi.kpi_id) ? 'Hide Details' : 'Show Details'}
                <motion.div
                  animate={{ rotate: expandedKpis.has(kpi.kpi_id) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TrendingDown className="w-3 h-3 ml-1" />
                </motion.div>
              </button>

              <AnimatePresence>
                {expandedKpis.has(kpi.kpi_id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Previous:</span>
                        <span>{kpi.previous_value.toLocaleString()} {kpi.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target:</span>
                        <span>{kpi.target_value.toLocaleString()} {kpi.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Impact:</span>
                        <span className={`font-medium ${
                          kpi.business_impact === 'high' ? 'text-red-600' :
                          kpi.business_impact === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {kpi.business_impact}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="font-medium">Calculation:</span>
                        <p className="text-xs mt-1 bg-gray-50 p-2 rounded">
                          {kpi.calculation_method}
                        </p>
                      </div>
                      <div className="mt-2">
                        <span className="font-medium">Data Sources:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {kpi.data_sources.map((source, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {source.replace('_agent', '')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Actionable Insights */}
      {actionable_insights && actionable_insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Actionable Insights</h2>
          </div>
          <div className="space-y-3">
            {actionable_insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Immediate Actions */}
      {top_priorities.immediate_actions && top_priorities.immediate_actions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Immediate Actions</h2>
          </div>
          <div className="space-y-3">
            {top_priorities.immediate_actions.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 font-medium">{action}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Skeleton loading component
const CEOSnapshotSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
          <div className="h-12 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="bg-gray-200 rounded-lg h-20 mb-4"></div>
        <div className="bg-gray-200 rounded-lg h-16"></div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
            <div className="w-full bg-gray-200 rounded-full h-2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CEOSnapshotComponent;
