import React, { useState } from 'react';
import SalesFunnelVisualizer from '../../visualizations/SalesFunnelVisualizer.jsx';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Heart,
  Target,
  BarChart3,
  UserCheck,
  Star,
  AlertTriangle,
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  UserPlus,
  UserMinus,
  Activity,
  Eye,
  Brain,
  Sparkles,
  ArrowRight,
  Shield,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

const CustomerOverviewTab = ({ analysis, segments, metaKPIs, onInsightsView, onExecuteAction }) => {
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  if (!analysis) {
    return <CustomerOverviewSkeleton />;
  }

  const { customer_metrics, customer_segments, key_insights, immediate_actions } = analysis;

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
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  // Delta color for current vs target
  const getDeltaColor = (current, target, lowerIsBetter = false) => {
    if (current == null || target == null) return 'text-gray-600';
    const isGood = lowerIsBetter ? current <= target : current >= target;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const formatDeltaPct = (current, target) => {
    if (current == null || target == null || target === 0) return '—';
    const delta = ((current - target) / Math.abs(target)) * 100;
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Funnel Snapshot */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 text-blue-500 mr-2" />
          Funnel Snapshot
        </h3>
        <SalesFunnelVisualizer data={{
          stages: [
            { name: 'Awareness', value: 1200 },
            { name: 'Interest', value: 650 },
            { name: 'Decision', value: 280 },
            { name: 'Retention', value: 180 }
          ]
        }} />
      </div>
      {/* Key Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Acquisition Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserPlus className="w-5 h-5 text-blue-500 mr-2" />
            Acquisition
          </h3>
          <div className="space-y-4">
            {customer_metrics?.acquisition_metrics && Object.entries(customer_metrics.acquisition_metrics).map(([key, metric]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">
                    {typeof metric.current === 'number' ? metric.current.toFixed(1) : metric.current}
                    {key.includes('rate') || key.includes('cost') ? (key.includes('cost') ? '$' : '%') : ''}
                  </span>
                  <div className="flex items-center">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm ml-1 ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Retention Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="w-5 h-5 text-green-500 mr-2" />
            Retention
          </h3>
          <div className="space-y-4">
            {customer_metrics?.retention_metrics && Object.entries(customer_metrics.retention_metrics).map(([key, metric]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">
                    {typeof metric.current === 'number' ? metric.current.toFixed(1) : metric.current}
                    {key.includes('rate') || key.includes('value') ? (key.includes('value') ? '$' : '%') : ''}
                  </span>
                  <div className="flex items-center">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm ml-1 ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Satisfaction Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            Satisfaction
          </h3>
          <div className="space-y-4">
            {customer_metrics?.satisfaction_metrics && Object.entries(customer_metrics.satisfaction_metrics).map(([key, metric]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">
                    {typeof metric.current === 'number' ? metric.current.toFixed(1) : metric.current}
                    {key.includes('score') ? '' : key.includes('time') ? 'h' : '%'}
                  </span>
                  <div className="flex items-center">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm ml-1 ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Customer Segments Overview */}
      {customer_segments && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserCheck className="w-5 h-5 text-purple-500 mr-2" />
            Customer Segments Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(customer_segments).map(([segment, data]) => (
              <div key={segment} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 capitalize">
                  {segment.replace(/_/g, ' ')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customers:</span>
                    <span className="font-medium">{data.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg LTV:</span>
                    <span className="font-medium">${data.average_lifetime_value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retention:</span>
                    <span className="font-medium">{data.retention_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential:</span>
                    <span className="font-medium capitalize">{data.growth_potential}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Key Insights */}
      {key_insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            Key Customer Insights
          </h3>
          <div className="space-y-3">
            {key_insights.map((insight, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{insight}</p>
                </div>
                <button
                  onClick={() => { setSelectedInsight(insight); setShowInsightModal(true); }}
                  className="ml-3 px-3 py-1 text-xs font-medium text-green-600 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                >
                  Details
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Immediate Actions */}
      {immediate_actions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Immediate Actions Required
          </h3>
          <div className="space-y-3">
            {immediate_actions.map((action, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{action}</p>
                </div>
                <button
                  onClick={() => { setSelectedAction(action); setShowActionModal(true); }}
                  className="ml-3 px-3 py-1 text-xs font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                >
                  Details
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Cross-Agent Meta KPIs */}
      {metaKPIs && metaKPIs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="w-5 h-5 text-purple-500 mr-2" />
              Guild Performance Meta KPIs
            </h3>
            <button
              onClick={onInsightsView}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Insights
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            These unique KPIs measure how well Guild itself is performing, making it different from a normal dashboard app.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metaKPIs.slice(0, 6).map((kpi) => (
              <div key={kpi.meta_kpi_id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{kpi.name}</h4>
                  <div className="flex items-center">
                    {kpi.trend_direction === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${
                      kpi.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.trend_percentage > 0 ? '+' : ''}{kpi.trend_percentage}%
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {kpi.current_value}{kpi.unit === 'percent' ? '%' : kpi.unit === 'ratio' ? 'x' : ''}
                  </div>
                  <div className="text-sm text-gray-600">
                    Target: {kpi.target_value}{kpi.unit === 'percent' ? '%' : kpi.unit === 'ratio' ? 'x' : ''}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full ${
                      (kpi.current_value / kpi.target_value) >= 1 ? 'bg-green-500' :
                      (kpi.current_value / kpi.target_value) >= 0.8 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((kpi.current_value / kpi.target_value) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <p className="text-xs text-gray-600">{kpi.calculation_method}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Customer Health Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
          Customer Health Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">45</div>
            <div className="text-sm text-green-600">Excellent Health</div>
            <div className="text-xs text-gray-500">22.5% of customers</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">78</div>
            <div className="text-sm text-blue-600">Good Health</div>
            <div className="text-xs text-gray-500">39.0% of customers</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">52</div>
            <div className="text-sm text-yellow-600">Warning</div>
            <div className="text-xs text-gray-500">26.0% of customers</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">25</div>
            <div className="text-sm text-red-600">Critical</div>
            <div className="text-xs text-gray-500">12.5% of customers</div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 text-gray-500 mr-2" />
          Recent Customer Activity
        </h3>
        <div className="space-y-3">
          {[
            { action: 'New customer signed up', customer: 'John Smith', time: '2 minutes ago', type: 'acquisition' },
            { action: 'High-value customer made purchase', customer: 'Sarah Johnson', time: '15 minutes ago', type: 'purchase' },
            { action: 'Customer support ticket resolved', customer: 'Mike Davis', time: '1 hour ago', type: 'support' },
            { action: 'Customer churned', customer: 'Lisa Wilson', time: '3 hours ago', type: 'churn' },
            { action: 'Customer upgraded plan', customer: 'David Brown', time: '5 hours ago', type: 'upgrade' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'acquisition' ? 'bg-green-500' :
                  activity.type === 'purchase' ? 'bg-blue-500' :
                  activity.type === 'support' ? 'bg-yellow-500' :
                  activity.type === 'churn' ? 'bg-red-500' :
                  'bg-purple-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.customer}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Insight Details Modal */}
      {showInsightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" onClick={() => setShowInsightModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Insight Details</h3>
                    <p className="text-sm text-gray-600">Why we surfaced this insight and where it comes from</p>
                  </div>
                </div>
                <button onClick={() => setShowInsightModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Insight Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-900 mb-2">Insight Summary</h4>
                <p className="text-gray-800">{selectedInsight}</p>
                <p className="text-xs text-gray-600 mt-2">This insight was generated by correlating recent alerts, retention and satisfaction trends, and engagement signals.</p>
              </div>

              {/* KPIs involved with targets and deltas */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Performance Indicators</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Retention Rate */}
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Retention Rate</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {customer_metrics?.retention_metrics?.retention_rate?.current ?? '—'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-gray-600">Target: 85%</span>
                      <span className={`${getDeltaColor(customer_metrics?.retention_metrics?.retention_rate?.current, 85)} font-medium`}>
                        {formatDeltaPct(customer_metrics?.retention_metrics?.retention_rate?.current, 85)}
                      </span>
                    </div>
                  </div>

                  {/* Churn Rate (lower is better) */}
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Churn Rate</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {customer_metrics?.retention_metrics?.churn_rate?.current ?? '—'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-gray-600">Target: 10%</span>
                      <span className={`${getDeltaColor(customer_metrics?.retention_metrics?.churn_rate?.current, 10, true)} font-medium`}>
                        {formatDeltaPct(10, customer_metrics?.retention_metrics?.churn_rate?.current)}
                      </span>
                    </div>
                  </div>

                  {/* Funnel Conversion */}
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Funnel Conversion</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {customer_metrics?.acquisition_metrics?.funnel_conversion_rate?.current ?? '—'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-gray-600">Target: 25%</span>
                      <span className={`${getDeltaColor(customer_metrics?.acquisition_metrics?.funnel_conversion_rate?.current, 25)} font-medium`}>
                        {formatDeltaPct(customer_metrics?.acquisition_metrics?.funnel_conversion_rate?.current, 25)}
                      </span>
                    </div>
                  </div>

                  {/* NPS Score */}
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">NPS Score</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {customer_metrics?.satisfaction_metrics?.nps_score?.current ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-gray-600">Target: 60</span>
                      <span className={`${getDeltaColor(customer_metrics?.satisfaction_metrics?.nps_score?.current, 60)} font-medium`}>
                        {formatDeltaPct(customer_metrics?.satisfaction_metrics?.nps_score?.current, 60)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agents Involved & Roles */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Agents Involved & Their Roles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { agent: 'Customer Intelligence Agent', role: 'Analyzed customer metrics and surfaced patterns', status: 'active', color: 'bg-green-500' },
                    { agent: 'Judge Agent', role: 'Validated insight quality and urgency thresholds', status: 'reviewed', color: 'bg-blue-500' },
                    { agent: 'CRM Automation Agent', role: 'Prepared actionable segments and outreach options', status: 'ready', color: 'bg-yellow-500' },
                    { agent: 'Orchestrator Agent', role: 'Coordinated data retrieval and scoring', status: 'coordinated', color: 'bg-purple-500' }
                  ].map((row, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded border flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-1 mr-3 ${row.color}`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{row.agent}</p>
                        <p className="text-xs text-gray-600">{row.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">How Agents Worked Together</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>Customer Intelligence fetched latest KPIs and alerts</li>
                  <li>Judge Agent scored the signal and approved the insight</li>
                  <li>CRM Automation generated eligible segments for action</li>
                  <li>Orchestrator prepared a recommended playbook</li>
                </ol>
              </div>

              {/* Useful Tips */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Useful Tips</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Double down on cohorts with improving retention trends</li>
                  <li>Automate follow-ups for segments with rising churn signals</li>
                  <li>Use A/B tests on outreach content to lift conversion</li>
                </ul>
              </div>

              {/* Attribution Chips */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Attribution</h4>
                <div className="flex flex-wrap gap-2">
                  {['CRM', 'Support Tickets', 'Product Analytics', 'Email Engagement'].map((src) => (
                    <span key={src} className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex items-center justify-end space-x-2">
              <button onClick={() => setShowInsightModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Close</button>
              <button
                onClick={() => {
                  if (onExecuteAction) onExecuteAction({ type: 'repeat_strategy', insight: selectedInsight });
                  setShowInsightModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Repeat Strategy
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Action Details Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" onClick={() => setShowActionModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Action Details</h3>
                    <p className="text-sm text-gray-600">Why this action is recommended and what agents will do</p>
                  </div>
                </div>
                <button onClick={() => setShowActionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Action Required */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-900 mb-2">Action Required</h4>
                <p className="text-gray-800">{selectedAction}</p>
              </div>

              {/* Why This Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-800">Why This Action Is Required</p>
                  <p className="text-xs text-gray-600">Addresses KPI deviations and mitigates churn/engagement risks identified by agents.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-800">Agents Involved in Workflow</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {[
                      { name: 'Customer Intelligence', color: 'bg-green-500' },
                      { name: 'Judge', color: 'bg-blue-500' },
                      { name: 'CRM Automation', color: 'bg-yellow-500' },
                      { name: 'Orchestrator', color: 'bg-purple-500' }
                    ].map((agent) => (
                      <span key={agent.name} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${agent.color}`}></span>
                        {agent.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target Metrics & Gaps */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Target Metrics & Gaps</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Retention Rate */}
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-sm font-medium text-gray-800">Retention Rate</p>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-600">Current: {customer_metrics?.retention_metrics?.retention_rate?.current ?? '—'}%</span>
                      <span className="text-gray-600">Target: 85%</span>
                    </div>
                    <div className={`text-xs mt-1 ${getDeltaColor(customer_metrics?.retention_metrics?.retention_rate?.current, 85)} font-medium`}>
                      {formatDeltaPct(customer_metrics?.retention_metrics?.retention_rate?.current, 85)} vs target
                    </div>
                  </div>

                  {/* Churn Rate (lower is better) */}
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-sm font-medium text-gray-800">Churn Rate</p>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-600">Current: {customer_metrics?.retention_metrics?.churn_rate?.current ?? '—'}%</span>
                      <span className="text-gray-600">Target: 10%</span>
                    </div>
                    <div className={`text-xs mt-1 ${getDeltaColor(customer_metrics?.retention_metrics?.churn_rate?.current, 10, true)} font-medium`}>
                      {formatDeltaPct(10, customer_metrics?.retention_metrics?.churn_rate?.current)} vs target
                    </div>
                  </div>

                  {/* Funnel Conversion */}
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-sm font-medium text-gray-800">Funnel Conversion</p>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-600">Current: {customer_metrics?.acquisition_metrics?.funnel_conversion_rate?.current ?? '—'}%</span>
                      <span className="text-gray-600">Target: 25%</span>
                    </div>
                    <div className={`text-xs mt-1 ${getDeltaColor(customer_metrics?.acquisition_metrics?.funnel_conversion_rate?.current, 25)} font-medium`}>
                      {formatDeltaPct(customer_metrics?.acquisition_metrics?.funnel_conversion_rate?.current, 25)} vs target
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis & Issues */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Analysis & Issues</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Drop-offs detected between Prospect → Trial stages</li>
                  <li>Support sentiment dips correlated with churn spikes</li>
                  <li>Onboarding friction for new cohorts</li>
                </ul>
              </div>

              {/* Planned Workflow Steps */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Planned Workflow Steps</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>CRM Automation: Build at-risk segment and trigger win-back sequence</li>
                  <li>Customer Intelligence: Personalize outreach based on engagement</li>
                  <li>Judge Agent: Validate copy for brand/tone compliance</li>
                  <li>Orchestrator: Schedule follow-ups and monitor uplift</li>
                </ol>
              </div>

              {/* Attribution Chips */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Attribution</h4>
                <div className="flex flex-wrap gap-2">
                  {['CRM', 'Support Tickets', 'Product Analytics', 'Email Engagement'].map((src) => (
                    <span key={src} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex items-center justify-end space-x-2">
              <button onClick={() => setShowActionModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Cancel</button>
              <button
                onClick={() => {
                  if (onExecuteAction) onExecuteAction({ type: 'improve_metrics', action: selectedAction });
                  setShowActionModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Execute Action
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Skeleton loading component
const CustomerOverviewSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(j => (
                <div key={j} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CustomerOverviewTab;
