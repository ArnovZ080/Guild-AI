import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Brain, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  MessageSquare,
  FileText,
  Calendar,
  Star,
  RefreshCw
} from 'lucide-react';
import { businessDataService, DashboardOverview } from '../../services/businessDataService';

// Import existing components
import { BusinessPulse } from '../visualizations/BusinessPulse';
import { AgentActivityTheater } from '../visualizations/AgentActivityTheater';
import { FinancialFlowVisualization } from '../visualizations/FinancialFlowVisualization';
import { CustomerJourneyConstellation } from '../visualizations/CustomerJourneyConstellation';
import { ContentPerformanceGarden } from '../visualizations/ContentPerformanceGarden';
import { ProgressMomentumTracker } from '../visualizations/ProgressMomentumTracker';
import { OpportunityRadar } from '../visualizations/OpportunityRadar';
import { SalesFunnelVisualizer } from '../visualizations/SalesFunnelVisualizer';
import CustomersView from '../customers/CustomersView';

// Remove the old interface - we'll use the types from the service

const EpicBusinessDashboard: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'financial' | 'agents' | 'customers' | 'content'>('overview');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchBusinessData = async (useCache = true) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await businessDataService.getDashboardOverview();
      setOverview(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch business data:', err);
      setError('Failed to load business data. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    businessDataService.clearCache();
    await fetchBusinessData(false);
  };

  useEffect(() => {
    fetchBusinessData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBusinessData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="w-4 h-4" />;
      case 'customer': return <Users className="w-4 h-4" />;
      case 'agent': return <Brain className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading && !overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your business overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">No business data found. Please check your agent configurations.</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Epic Business Dashboard</h1>
              <p className="text-sm text-gray-500">
                Real-time business intelligence • Last updated: {lastRefresh.toLocaleTimeString()}
                {isLoading && <span className="ml-2 text-blue-500">🔄 Updating...</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          
          {/* View Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: <Target className="w-4 h-4" /> },
              { id: 'financial', label: 'Financial', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'agents', label: 'Agents', icon: <Brain className="w-4 h-4" /> },
              { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
              { id: 'content', label: 'Content', icon: <FileText className="w-4 h-4" /> }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                  selectedView === view.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {view.icon}
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  className="bg-white rounded-lg p-6 shadow-lg border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.financial_health.revenue)}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +{overview.financial_health.growth_rate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white rounded-lg p-6 shadow-lg border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Agents</p>
                      <p className="text-2xl font-bold text-gray-900">{overview.agent_activity.active_agents}</p>
                      <p className="text-sm text-blue-600">{overview.agent_activity.total_tasks} tasks running</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white rounded-lg p-6 shadow-lg border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900">{overview.customer_insights.total_customers}</p>
                      <p className="text-sm text-purple-600">{overview.customer_insights.new_customers_this_month} new this month</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white rounded-lg p-6 shadow-lg border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Content Performance</p>
                      <p className="text-2xl font-bold text-gray-900">{overview.content_performance.average_engagement.toFixed(1)}%</p>
                      <p className="text-sm text-orange-600">{overview.content_performance.total_content_pieces} total pieces</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Urgent Actions */}
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Urgent Actions</h3>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-gray-500">{overview.urgent_actions.total_count} items need attention</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {overview.urgent_actions.urgent_actions.map((action, index) => (
                    <motion.div
                      key={action.id}
                      className={`p-4 rounded-lg border-l-4 ${getPriorityColor(action.priority)}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(action.type)}
                          <div>
                            <p className="font-medium text-gray-900">{action.title}</p>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Due: {new Date(action.dueDate).toLocaleDateString()}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.priority)}`}>
                            {action.priority} priority
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Business Pulse */}
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Pulse</h3>
                <BusinessPulse />
              </div>
            </motion.div>
          )}

          {selectedView === 'financial' && (
            <motion.div
              key="financial"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Flow Analysis</h3>
                <FinancialFlowVisualization />
              </div>
            </motion.div>
          )}

          {selectedView === 'agents' && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Activity Theater</h3>
                <AgentActivityTheater />
              </div>
            </motion.div>
          )}

          {selectedView === 'customers' && (
            <motion.div
              key="customers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Journey Constellation</h3>
                <CustomerJourneyConstellation />
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Management</h3>
                <CustomersView />
              </div>
            </motion.div>
          )}

          {selectedView === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Performance Garden</h3>
                <ContentPerformanceGarden />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default EpicBusinessDashboard;
