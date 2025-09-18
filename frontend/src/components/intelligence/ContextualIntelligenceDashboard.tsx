import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextualIntelligence } from '../../contexts/ContextualIntelligenceContext';
import { usePsychologicalOptimization } from '../../contexts/PsychologicalOptimizationContext';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Settings,
  Eye,
  EyeOff,
  Filter,
  BarChart3,
  Zap,
  Clock,
  Users,
  DollarSign
} from 'lucide-react';

export const ContextualIntelligenceDashboard: React.FC = () => {
  const { 
    state, 
    updateUserIntent, 
    updateBusinessContext,
    getRecommendations,
    updateDataFilters,
    analyzeUserBehavior
  } = useContextualIntelligence();
  
  const { getCurrentMode } = usePsychologicalOptimization();
  const [selectedView, setSelectedView] = useState<'overview' | 'recommendations' | 'analytics' | 'settings'>('overview');
  const [showFilters, setShowFilters] = useState(false);

  const currentMode = getCurrentMode();

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          text: 'text-sky-dusk',
          accent: 'sky-dawn',
          card: 'bg-white/90'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          text: 'text-forest-deep',
          accent: 'forest-growth',
          card: 'bg-white/95'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          text: 'text-earth-sand',
          accent: 'earth-warm',
          card: 'bg-white/85'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          text: 'text-forest-deep',
          accent: 'forest-growth',
          card: 'bg-white/95'
        };
    }
  };

  const modeStyles = getModeStyles();

  const getIntentColor = (intent: string) => {
    const colors = {
      planning: 'text-blue-600',
      executing: 'text-green-600',
      reviewing: 'text-purple-600',
      stressed: 'text-red-600',
      exploring: 'text-gray-600'
    };
    return colors[intent as keyof typeof colors] || 'text-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'minimal': return <EyeOff className="w-4 h-4" />;
      case 'standard': return <Eye className="w-4 h-4" />;
      case 'detailed': return <BarChart3 className="w-4 h-4" />;
      case 'expert': return <Brain className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'action': return <Zap className="w-5 h-5" />;
      case 'insight': return <Lightbulb className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'celebration': return <CheckCircle className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  // Simulate behavior analysis
  useEffect(() => {
    const interval = setInterval(() => {
      analyzeUserBehavior();
    }, 30000); // Analyze every 30 seconds

    return () => clearInterval(interval);
  }, [analyzeUserBehavior]);

  const recommendations = getRecommendations();

  return (
    <div className={`w-full max-w-6xl mx-auto bg-gradient-to-br ${modeStyles.background} rounded-xl p-6 shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-3xl font-bold ${modeStyles.text} mb-2`}>
            🧠 Contextual Intelligence Dashboard
          </h2>
          <p className="text-gray-600">AI-driven adaptive interface and recommendations</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Current State Overview */}
      <div className={`${modeStyles.card} rounded-xl p-6 mb-6 shadow-lg`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getIntentColor(state.userIntent.primary)} mb-1`}>
              {state.userIntent.primary}
            </div>
            <div className="text-sm text-gray-600">User Intent</div>
            <div className="text-xs text-gray-500">
              {(state.userIntent.confidence * 100).toFixed(0)}% confidence
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {state.businessContext.stage}
            </div>
            <div className="text-sm text-gray-600">Business Stage</div>
            <div className="text-xs text-gray-500">
              {state.businessContext.currentGoals.length} active goals
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {(state.psychologicalState.stressLevel * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Stress Level</div>
            <div className="text-xs text-gray-500">
              {state.psychologicalState.focusMode ? 'Focused' : 'Normal'}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-2xl font-bold text-purple-600 mb-1">
              {getComplexityIcon(state.interfaceComplexity)}
              <span className="ml-2">{state.interfaceComplexity}</span>
            </div>
            <div className="text-sm text-gray-600">Interface Mode</div>
            <div className="text-xs text-gray-500">Auto-adapted</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: Brain },
          { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                selectedView === tab.id
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Business Context */}
            <div className={`${modeStyles.card} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Context</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Current Goals</div>
                  {state.businessContext.currentGoals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-800">{goal.title}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${goal.progress * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{(goal.progress * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Key Metrics</div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        ${state.businessContext.metrics.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Revenue</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {(state.businessContext.metrics.growth * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Growth</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        {state.businessContext.metrics.customerCount}
                      </div>
                      <div className="text-xs text-gray-600">Customers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Psychological State */}
            <div className={`${modeStyles.card} rounded-lg p-6 shadow-lg`}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Psychological State</h3>
              <div className="space-y-4">
                {[
                  { label: 'Stress Level', value: state.psychologicalState.stressLevel, color: 'red' },
                  { label: 'Motivation', value: state.psychologicalState.motivationLevel, color: 'green' },
                  { label: 'Cognitive Load', value: state.psychologicalState.cognitiveLoad, color: 'blue' },
                  { label: 'Energy Level', value: state.psychologicalState.energyLevel, color: 'yellow' }
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{metric.label}</span>
                      <span>{(metric.value * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-${metric.color}-500 h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${metric.value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {selectedView === 'recommendations' && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${modeStyles.card} rounded-lg p-6 shadow-lg`}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Adaptive Recommendations</h3>
            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No recommendations at this time</p>
                  <p className="text-sm">The system is analyzing your current context...</p>
                </div>
              ) : (
                recommendations.map((rec) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border-2 ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getRecommendationIcon(rec.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{rec.title}</h4>
                        <p className="text-sm mb-3">{rec.description}</p>
                        {rec.action && (
                          <button
                            onClick={rec.action.handler}
                            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                          >
                            {rec.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {selectedView === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${modeStyles.card} rounded-lg p-6 shadow-lg`}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Analytics</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">User Patterns</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Most Common Intent</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {state.userIntent.primary}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Interface Adaptations</div>
                    <div className="text-lg font-semibold text-green-600">
                      {state.learning.adaptationHistory.length}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Adaptation History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {state.learning.adaptationHistory.slice(-5).reverse().map((adaptation, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{adaptation.change}</div>
                        <div className="text-xs text-gray-600">
                          {adaptation.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        adaptation.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {adaptation.success ? 'Success' : 'Failed'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedView === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${modeStyles.card} rounded-lg p-6 shadow-lg`}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Intelligence Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interface Complexity
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value="minimal">Minimal</option>
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Filter Time Range
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value="hour">Last Hour</option>
                  <option value="day">Last Day</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">Auto-adaptation</div>
                  <div className="text-xs text-gray-600">Automatically adjust interface based on context</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <h4 className="font-medium text-gray-800 mb-3">Data Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Time Range</label>
              <select 
                value={state.dataFilters.timeRange}
                onChange={(e) => updateDataFilters({ timeRange: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="hour">Last Hour</option>
                <option value="day">Last Day</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Priority</label>
              <select 
                value={state.dataFilters.priority}
                onChange={(e) => updateDataFilters({ priority: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Categories</label>
              <input 
                type="text" 
                placeholder="Enter categories..."
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ContextualIntelligenceDashboard;
