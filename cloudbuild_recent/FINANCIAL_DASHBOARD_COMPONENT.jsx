// Financial Dashboard Component for Financial Intelligence Agent
// This component provides CFO-level financial oversight and insights

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  CreditCard,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

const FinancialDashboardComponent = ({ financialData, onMetricClick, onActionExecute }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [expandedMetrics, setExpandedMetrics] = useState(new Set());

  if (!financialData) {
    return <FinancialDashboardSkeleton />;
  }

  const { financial_analysis, cash_flow_projections, financial_risks } = financialData;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'cashflow', label: 'Cash Flow', icon: Activity },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'forecasts', label: 'Forecasts', icon: Calendar },
    { id: 'risks', label: 'Risks', icon: AlertTriangle }
  ];

  const timeframes = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' }
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

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const toggleMetricExpansion = (metricId) => {
    const newExpanded = new Set(expandedMetrics);
    if (newExpanded.has(metricId)) {
      newExpanded.delete(metricId);
    } else {
      newExpanded.add(metricId);
    }
    setExpandedMetrics(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
              <p className="text-gray-600">CFO-level financial oversight and insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {timeframes.map(timeframe => (
                <option key={timeframe.id} value={timeframe.id}>
                  {timeframe.label}
                </option>
              ))}
            </select>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {financial_analysis?.financial_health_score || 75.5}/100
              </div>
              <p className="text-sm text-gray-600">Financial Health Score</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-800">$45,000</p>
                <p className="text-xs text-green-600">+15.2% from last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Cash Flow</p>
                <p className="text-2xl font-bold text-blue-800">$32,000</p>
                <p className="text-xs text-blue-600">+8.5% from last month</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Cash Runway</p>
                <p className="text-2xl font-bold text-yellow-800">8.5 mo</p>
                <p className="text-xs text-yellow-600">Below 12mo target</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Profit Margin</p>
                <p className="text-2xl font-bold text-purple-800">26.7%</p>
                <p className="text-xs text-purple-600">+2.1% from last month</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
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
                    ? 'bg-white text-green-600 shadow-sm'
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
            <FinancialOverviewTab financialAnalysis={financial_analysis} />
          </motion.div>
        )}

        {activeTab === 'cashflow' && (
          <motion.div
            key="cashflow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CashFlowTab projections={cash_flow_projections} />
          </motion.div>
        )}

        {activeTab === 'revenue' && (
          <motion.div
            key="revenue"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <RevenueTab financialAnalysis={financial_analysis} />
          </motion.div>
        )}

        {activeTab === 'expenses' && (
          <motion.div
            key="expenses"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ExpensesTab financialAnalysis={financial_analysis} />
          </motion.div>
        )}

        {activeTab === 'forecasts' && (
          <motion.div
            key="forecasts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ForecastsTab projections={cash_flow_projections} />
          </motion.div>
        )}

        {activeTab === 'risks' && (
          <motion.div
            key="risks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <RisksTab risks={financial_risks} onActionExecute={onActionExecute} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Financial Overview Tab Component
const FinancialOverviewTab = ({ financialAnalysis }) => {
  const metrics = financialAnalysis?.financial_metrics || {};
  
  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Revenue Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            Revenue Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Recurring Revenue</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">$45,000</span>
                <span className="text-green-600 text-sm ml-2">+15.2%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Annual Recurring Revenue</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">$540,000</span>
                <span className="text-green-600 text-sm ml-2">+12.8%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Growth Rate</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">15.2%</span>
                <span className="text-green-600 text-sm ml-2">Target: 20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profitability Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-blue-500 mr-2" />
            Profitability
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gross Margin</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">68.5%</span>
                <span className="text-green-600 text-sm ml-2">Target: 70%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Net Profit Margin</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">26.7%</span>
                <span className="text-green-600 text-sm ml-2">Target: 30%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">EBITDA</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">$18,000</span>
                <span className="text-green-600 text-sm ml-2">+8.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 text-purple-500 mr-2" />
            Cash Flow
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Operating Cash Flow</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">$32,000</span>
                <span className="text-green-600 text-sm ml-2">+5.2%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cash Runway</span>
              <div className="text-right">
                <span className="font-semibold text-yellow-600">8.5 mo</span>
                <span className="text-red-600 text-sm ml-2">Target: 12mo</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Burn Rate</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">$8,500</span>
                <span className="text-red-600 text-sm ml-2">+12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {financialAnalysis?.key_insights && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            Key Financial Insights
          </h3>
          <div className="space-y-3">
            {financialAnalysis.key_insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immediate Actions */}
      {financialAnalysis?.immediate_actions && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Immediate Actions Required
          </h3>
          <div className="space-y-3">
            {financialAnalysis.immediate_actions.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 font-medium">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Cash Flow Tab Component
const CashFlowTab = ({ projections }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Activity className="w-5 h-5 text-blue-500 mr-2" />
          Cash Flow Projections (30 Days)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['best_case', 'expected', 'worst_case'].map((scenario) => {
            const projection = projections?.find(p => p.scenario_type === scenario);
            if (!projection) return null;

            const getScenarioColor = (scenario) => {
              switch (scenario) {
                case 'best_case': return 'green';
                case 'expected': return 'blue';
                case 'worst_case': return 'red';
                default: return 'gray';
              }
            };

            const color = getScenarioColor(scenario);
            
            return (
              <div key={scenario} className={`p-4 rounded-lg border-l-4 bg-${color}-50 border-${color}-500`}>
                <h4 className="font-semibold text-gray-900 capitalize mb-3">
                  {scenario.replace('_', ' ')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash Inflow:</span>
                    <span className="font-medium">${projection.projected_cash_inflow.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash Outflow:</span>
                    <span className="font-medium">${projection.projected_cash_outflow.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Cash Flow:</span>
                    <span className={`font-medium ${projection.projected_net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${projection.projected_net_cash_flow.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projected Balance:</span>
                    <span className="font-medium">${projection.projected_cash_balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-medium">{Math.round(projection.confidence_level * 100)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Revenue Tab Component
const RevenueTab = ({ financialAnalysis }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
          Revenue Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Trends */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Revenue Trends</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">Monthly Recurring Revenue</span>
                <div className="text-right">
                  <span className="font-semibold text-green-800">$45,000</span>
                  <p className="text-xs text-green-600">+15.2% MoM</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600">Annual Recurring Revenue</span>
                <div className="text-right">
                  <span className="font-semibold text-blue-800">$540,000</span>
                  <p className="text-xs text-blue-600">+12.8% YoY</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Sources */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Revenue Sources</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Subscription Revenue</span>
                <span className="font-semibold">$32,000 (71%)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">One-time Sales</span>
                <span className="font-semibold">$8,500 (19%)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Services Revenue</span>
                <span className="font-semibold">$4,500 (10%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Expenses Tab Component
const ExpensesTab = ({ financialAnalysis }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
          Expense Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expense Breakdown */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Expense Breakdown</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-600">Ad Spend</span>
                <div className="text-right">
                  <span className="font-semibold text-red-800">$8,500</span>
                  <p className="text-xs text-red-600">+18% MoM</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-600">Software & Tools</span>
                <div className="text-right">
                  <span className="font-semibold text-yellow-800">$2,800</span>
                  <p className="text-xs text-yellow-600">+5% MoM</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600">Payroll</span>
                <div className="text-right">
                  <span className="font-semibold text-blue-800">$12,000</span>
                  <p className="text-xs text-blue-600">+3% MoM</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Operations</span>
                <div className="text-right">
                  <span className="font-semibold text-gray-800">$4,700</span>
                  <p className="text-xs text-gray-600">-2% MoM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Optimization Opportunities */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Optimization Opportunities</h4>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Ad Spend Optimization:</strong> Reduce Meta Ads spend by $1,500/month and reallocate to Google Ads for 25% better ROI.
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Software Consolidation:</strong> Consolidate overlapping tools to save $400/month.
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800">
                  <strong>Automation Savings:</strong> Implement expense automation to reduce manual processing costs by $200/month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Forecasts Tab Component
const ForecastsTab = ({ projections }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Calendar className="w-5 h-5 text-purple-500 mr-2" />
          Financial Forecasts & Scenarios
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['30d', '60d', '90d', '6m'].map((period) => (
            <div key={period} className="p-4 border rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">{period.toUpperCase()} Forecast</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Revenue:</span>
                  <span className="font-medium">$48,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Expenses:</span>
                  <span className="font-medium">$29,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Cash Flow:</span>
                  <span className="font-medium text-green-600">$19,300</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cash Runway:</span>
                  <span className="font-medium text-yellow-600">9.2 mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Risks Tab Component
const RisksTab = ({ risks, onActionExecute }) => {
  if (!risks || risks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No Critical Risks</h3>
            <p className="text-gray-600">Your financial health looks good!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {risks.map((risk, index) => (
        <div key={risk.risk_id} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start">
              <AlertTriangle className={`w-6 h-6 mr-3 mt-0.5 ${
                risk.severity === 'critical' ? 'text-red-500' :
                risk.severity === 'high' ? 'text-orange-500' :
                risk.severity === 'medium' ? 'text-yellow-500' :
                'text-blue-500'
              }`} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{risk.risk_type.replace('_', ' ').title()}</h3>
                <p className="text-gray-600 mt-1">{risk.description}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              risk.severity === 'critical' ? 'bg-red-100 text-red-800' :
              risk.severity === 'high' ? 'bg-orange-100 text-orange-800' :
              risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {risk.severity.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Impact Estimate</p>
              <p className="font-semibold text-gray-900">${risk.impact_estimate.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Probability</p>
              <p className="font-semibold text-gray-900">{Math.round(risk.probability * 100)}%</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Detection Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(risk.detection_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Mitigation Actions</h4>
            <div className="space-y-2">
              {risk.mitigation_actions.map((action, actionIndex) => (
                <div key={actionIndex} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{action}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onActionExecute && onActionExecute(risk.risk_id, risk.mitigation_actions)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Execute Mitigation Actions
          </button>
        </div>
      ))}
    </div>
  );
};

// Skeleton loading component
const FinancialDashboardSkeleton = () => (
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

export default FinancialDashboardComponent;
