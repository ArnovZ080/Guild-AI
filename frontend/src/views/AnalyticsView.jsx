import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, TrendingUp, TrendingDown, Users, DollarSign, Target, Eye, MousePointer,
  Filter, Calendar, Download, RefreshCw, Brain, Zap, Activity, PieChart,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertCircle, Star,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon
} from 'lucide-react';
import { useBusinessMetrics } from '../hooks/useApiData.js';
import { useCelebrations, CelebrationType } from '../components/psychological/MicroCelebrations.jsx';
import ContentPerformanceGarden from '../components/visualizations/ContentPerformanceGarden.jsx';
import { ProgressMomentumTracker } from '../components/visualizations/ProgressMomentumTracker.tsx';

// Financial Flow Visualization Component
const FinancialFlow = () => {
  const [financialData, setFinancialData] = useState({
    revenue: 125000,
    expenses: 85000,
    profit: 40000,
    cashFlow: [
      { month: 'Jan', revenue: 95000, expenses: 70000, profit: 25000 },
      { month: 'Feb', revenue: 110000, expenses: 75000, profit: 35000 },
      { month: 'Mar', revenue: 125000, expenses: 80000, profit: 45000 },
      { month: 'Apr', revenue: 130000, expenses: 85000, profit: 45000 },
      { month: 'May', revenue: 140000, expenses: 90000, profit: 50000 },
      { month: 'Jun', revenue: 125000, expenses: 85000, profit: 40000 }
    ],
    categories: [
      { name: 'Sales Revenue', amount: 125000, percentage: 100, color: 'green' },
      { name: 'Marketing', amount: 25000, percentage: 20, color: 'blue' },
      { name: 'Operations', amount: 35000, percentage: 28, color: 'orange' },
      { name: 'Personnel', amount: 25000, percentage: 20, color: 'purple' },
      { name: 'Net Profit', amount: 40000, percentage: 32, color: 'emerald' }
    ]
  });

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-500 text-white',
      blue: 'bg-blue-500 text-white',
      orange: 'bg-orange-500 text-white',
      purple: 'bg-purple-500 text-white',
      emerald: 'bg-emerald-500 text-white',
      red: 'bg-red-500 text-white'
    };
    return colors[color] || 'bg-gray-500 text-white';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Financial Flow</h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            ${financialData.revenue.toLocaleString()}
          </div>
          <div className="text-sm text-green-600">Total Revenue</div>
          <div className="flex items-center justify-center mt-1">
            <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-xs text-green-600">+12%</span>
          </div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            ${financialData.expenses.toLocaleString()}
          </div>
          <div className="text-sm text-red-600">Total Expenses</div>
          <div className="flex items-center justify-center mt-1">
            <TrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-xs text-red-600">+8%</span>
          </div>
        </div>
        <div className="text-center p-4 bg-emerald-50 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">
            ${financialData.profit.toLocaleString()}
          </div>
          <div className="text-sm text-emerald-600">Net Profit</div>
          <div className="flex items-center justify-center mt-1">
            <TrendingUpIcon className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-xs text-emerald-600">+18%</span>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Monthly Cash Flow</h4>
        <div className="space-y-3">
          {financialData.cashFlow.map((month, index) => (
            <div key={month.month} className="flex items-center space-x-4">
              <div className="w-12 text-sm font-medium text-gray-600">{month.month}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-green-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(month.revenue / 150000) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${month.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <motion.div
                      className="bg-red-500 h-1 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(month.expenses / 150000) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    ${month.expenses.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-600">
                  ${month.profit.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Profit</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Categories */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Expense Breakdown</h4>
        <div className="space-y-3">
          {financialData.categories.map((category, index) => (
            <motion.div
              key={category.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getColorClasses(category.color)}`}></div>
                <span className="text-sm font-medium text-gray-900">{category.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${getColorClasses(category.color)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900">
                  ${category.amount.toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AnalyticsView = () => {
  const { metrics, loading } = useBusinessMetrics();
  const [activeTab, setActiveTab] = useState('overview'); // overview, financial, content, progress
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const { triggerCelebration } = useCelebrations();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const data = metrics?.data || {};
  const trends = data.trends || {};
  const recommendations = data.recommendations || [];

  const analyticsData = [
    {
      title: 'Website Traffic',
      value: '12,543',
      change: trends.traffic || '+15%',
      changeType: 'positive',
      icon: Eye,
      color: 'blue'
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: trends.conversions || '+8%',
      changeType: 'positive',
      icon: Target,
      color: 'green'
    },
    {
      title: 'Revenue',
      value: '$45,230',
      change: trends.revenue || '+22%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'purple'
    },
    {
      title: 'Active Users',
      value: '2,847',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'orange'
    }
  ];

  const getColorClasses = (color, changeType) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        icon: 'text-blue-500'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        icon: 'text-green-500'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        icon: 'text-purple-500'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        icon: 'text-orange-500'
      }
    };

    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive business intelligence and performance insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={() => {
                triggerCelebration(CelebrationType.TASK_COMPLETE, {
                  message: "Refreshing analytics! 📊",
                  intensity: 'normal'
                });
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart },
            { id: 'financial', label: 'Financial', icon: DollarSign },
            { id: 'content', label: 'Content', icon: Target },
            { id: 'progress', label: 'Progress', icon: TrendingUp }
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

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.map((metric, index) => {
          const Icon = metric.icon;
          const colors = getColorClasses(metric.color, metric.changeType);
          
          return (
            <motion.div
              key={metric.title}
              className={`bg-white rounded-lg p-6 shadow-lg border-l-4 ${colors.border}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colors.bg}`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {metric.changeType === 'positive' ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </motion.div>
          );
        })}
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
            {/* Performance Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Performance Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">$125K</div>
                  <div className="text-sm text-gray-600">Monthly Revenue</div>
                  <div className="text-xs text-green-500">+12% vs last month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1,247</div>
                  <div className="text-sm text-gray-600">Active Customers</div>
                  <div className="text-xs text-blue-500">+8% vs last month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">89%</div>
                  <div className="text-sm text-gray-600">Customer Satisfaction</div>
                  <div className="text-xs text-purple-500">+3% vs last month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">156</div>
                  <div className="text-sm text-gray-600">Content Pieces</div>
                  <div className="text-xs text-orange-500">+24% vs last month</div>
                </div>
              </div>
            </div>

            {/* At-a-Glance Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Finance at a Glance */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                    Finance at a Glance
                  </h3>
                  <button 
                    onClick={() => setActiveTab('financial')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View Details →
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className="font-semibold text-green-600">$125,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expenses</span>
                    <span className="font-semibold text-red-600">$85,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profit</span>
                    <span className="font-semibold text-blue-600">$40,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">68% profit margin</p>
                </div>
              </div>

              {/* Content Performance at a Glance */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-500" />
                    Content Performance
                  </h3>
                  <button 
                    onClick={() => setActiveTab('content')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View Details →
                  </button>
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
                    <span className="text-sm text-gray-600">Top Content</span>
                    <span className="font-semibold text-purple-600">Blog Post</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">75% of monthly goal</p>
                </div>
              </div>

              {/* Business Momentum at a Glance */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                    Business Momentum
                  </h3>
                  <button 
                    onClick={() => setActiveTab('progress')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View Details →
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Growth Rate</span>
                    <span className="font-semibold text-green-600">+15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Leads</span>
                    <span className="font-semibold text-blue-600">234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conversion</span>
                    <span className="font-semibold text-purple-600">8.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">82% of growth target</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'financial' && (
          <motion.div
            key="financial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FinancialFlow />
          </motion.div>
        )}

        {activeTab === 'content' && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ContentPerformanceGarden />
          </motion.div>
        )}

        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProgressMomentumTracker />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">A+</div>
            <div className="text-sm text-green-600">Overall Performance</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">95%</div>
            <div className="text-sm text-blue-600">Goal Achievement</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">4.8/5</div>
            <div className="text-sm text-purple-600">User Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
