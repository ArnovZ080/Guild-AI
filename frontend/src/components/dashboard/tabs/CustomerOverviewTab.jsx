import React from 'react';
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

const CustomerOverviewTab = ({ analysis, segments, metaKPIs, onInsightsView }) => {
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

  return (
    <div className="space-y-6">
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
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{insight}</p>
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
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 font-medium">{action}</p>
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
