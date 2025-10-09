# Business Intelligence Agent - Frontend Integration Requirements

## Overview

The Business Intelligence Agent (BIA) serves as the central coordinator of insights across the entire Guild ecosystem. It transforms raw data from multiple agents and integrations into digestible, actionable intelligence for the main dashboard. This document outlines the comprehensive frontend integration requirements for seamless BIA integration.

## 🎯 Core Integration Points

### 1. Main Dashboard Integration

#### Primary Dashboard Sections
The BIA will enhance the existing `DashboardView.jsx` with the following sections:

```javascript
// Enhanced Dashboard Structure
const DashboardView = () => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'intelligence', label: 'Business Intelligence', icon: Brain }, // NEW
    { id: 'content', label: 'Content Garden', icon: Sprout },
    { id: 'visualizations', label: 'Visualizations', icon: Radar },
    { id: 'insights', label: 'Agent Theater', icon: Sparkles }
  ];
};
```

#### Business Intelligence Tab Components
- **Executive Summary Widget**: High-level business health overview
- **Critical Alerts Panel**: Urgent items requiring immediate attention
- **Goal Progress Tracker**: Progress toward user-defined objectives
- **Recommendation Engine**: AI-powered actionable suggestions
- **Cross-Agent Insights**: Synthesized intelligence from all agents

### 2. API Integration Requirements

#### New API Endpoints Needed

```javascript
// Business Intelligence Agent API endpoints
const BIA_API_ENDPOINTS = {
  // Get comprehensive business intelligence
  getBusinessIntelligence: '/bi/dashboard-state',
  
  // Get prioritized insights
  getPrioritizedInsights: '/bi/insights',
  
  // Get actionable recommendations
  getRecommendations: '/bi/recommendations',
  
  // Get active alerts
  getActiveAlerts: '/bi/alerts',
  
  // Get goal progress
  getGoalProgress: '/bi/goal-progress',
  
  // Execute recommendation action
  executeRecommendation: '/bi/execute-recommendation',
  
  // Update user goals
  updateUserGoals: '/bi/update-goals'
};
```

#### Enhanced API Service Methods

```javascript
// Add to frontend/src/services/api.js
class ApiService {
  // Business Intelligence methods
  async getBusinessIntelligence() {
    const result = await this.request('/bi/dashboard-state');
    return result || this.getMockBusinessIntelligence();
  }

  async getPrioritizedInsights() {
    const result = await this.request('/bi/insights');
    return result || this.getMockPrioritizedInsights();
  }

  async getRecommendations() {
    const result = await this.request('/bi/recommendations');
    return result || this.getMockRecommendations();
  }

  async executeRecommendation(recommendationId, action) {
    return this.request('/bi/execute-recommendation', {
      method: 'POST',
      body: JSON.stringify({ recommendation_id: recommendationId, action })
    });
  }

  // Mock data methods for fallback
  getMockBusinessIntelligence() {
    return {
      success: true,
      data: {
        dashboard_state: {
          last_updated: new Date().toISOString(),
          active_insights: 8,
          pending_alerts: 2,
          key_metrics: {
            financial_health: "Good",
            customer_satisfaction: "High",
            content_performance: "Improving",
            operational_status: "Stable"
          },
          goal_progress: {
            revenue_growth: "On track",
            customer_acquisition: "Ahead of target",
            operational_efficiency: "Meeting goals"
          }
        }
      }
    };
  }
}
```

### 3. React Hooks for BIA Integration

#### New Custom Hooks

```javascript
// Add to frontend/src/hooks/useApiData.js

// Hook for Business Intelligence data
export const useBusinessIntelligence = () => {
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIntelligence = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getBusinessIntelligence();
      setIntelligence(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch business intelligence:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntelligence();
    // Refresh every 5 minutes for real-time updates
    const interval = setInterval(fetchIntelligence, 300000);
    return () => clearInterval(interval);
  }, [fetchIntelligence]);

  return { intelligence, loading, error, refetch: fetchIntelligence };
};

// Hook for prioritized insights
export const usePrioritizedInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPrioritizedInsights();
      setInsights(data.insights || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch insights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
    // Refresh every 2 minutes for timely insights
    const interval = setInterval(fetchInsights, 120000);
    return () => clearInterval(interval);
  }, [fetchInsights]);

  return { insights, loading, error, refetch: fetchInsights };
};

// Hook for recommendations
export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeRecommendation = useCallback(async (recommendationId, action) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.executeRecommendation(recommendationId, action);
      // Refresh recommendations after execution
      const updatedRecommendations = await apiService.getRecommendations();
      setRecommendations(updatedRecommendations.recommendations || []);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { recommendations, executeRecommendation, loading, error };
};
```

### 4. New React Components Required

#### BusinessIntelligenceDashboard.jsx
```javascript
// frontend/src/components/dashboard/BusinessIntelligenceDashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useBusinessIntelligence, usePrioritizedInsights, useRecommendations } from '../../hooks/useApiData.js';
import ExecutiveSummaryWidget from './ExecutiveSummaryWidget.jsx';
import CriticalAlertsPanel from './CriticalAlertsPanel.jsx';
import GoalProgressTracker from './GoalProgressTracker.jsx';
import RecommendationEngine from './RecommendationEngine.jsx';
import CrossAgentInsights from './CrossAgentInsights.jsx';

const BusinessIntelligenceDashboard = () => {
  const { intelligence, loading: intelLoading } = useBusinessIntelligence();
  const { insights, loading: insightsLoading } = usePrioritizedInsights();
  const { recommendations } = useRecommendations();

  if (intelLoading || insightsLoading) {
    return <BusinessIntelligenceSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <ExecutiveSummaryWidget data={intelligence?.data?.dashboard_state} />
      
      {/* Critical Alerts */}
      <CriticalAlertsPanel alerts={insights.filter(i => i.urgency === 'critical')} />
      
      {/* Goal Progress */}
      <GoalProgressTracker progress={intelligence?.data?.dashboard_state?.goal_progress} />
      
      {/* Recommendations */}
      <RecommendationEngine recommendations={recommendations} />
      
      {/* Cross-Agent Insights */}
      <CrossAgentInsights insights={insights} />
    </div>
  );
};

export default BusinessIntelligenceDashboard;
```

#### ExecutiveSummaryWidget.jsx
```javascript
// frontend/src/components/dashboard/ExecutiveSummaryWidget.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

const ExecutiveSummaryWidget = ({ data }) => {
  const metrics = [
    {
      label: 'Financial Health',
      value: data?.key_metrics?.financial_health,
      icon: TrendingUp,
      color: 'green',
      trend: '+5.2%'
    },
    {
      label: 'Customer Satisfaction',
      value: data?.key_metrics?.customer_satisfaction,
      icon: CheckCircle,
      color: 'blue',
      trend: '+12%'
    },
    {
      label: 'Content Performance',
      value: data?.key_metrics?.content_performance,
      icon: TrendingUp,
      color: 'purple',
      trend: '+8.3%'
    },
    {
      label: 'Operational Status',
      value: data?.key_metrics?.operational_status,
      icon: CheckCircle,
      color: 'green',
      trend: 'Stable'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Health Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${
                metric.color === 'green' ? 'border-green-500 bg-green-50' :
                metric.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                metric.color === 'purple' ? 'border-purple-500 bg-purple-50' :
                'border-gray-500 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                  <p className={`text-sm ${
                    metric.color === 'green' ? 'text-green-600' :
                    metric.color === 'blue' ? 'text-blue-600' :
                    metric.color === 'purple' ? 'text-purple-600' :
                    'text-gray-600'
                  }`}>
                    {metric.trend}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${
                  metric.color === 'green' ? 'text-green-500' :
                  metric.color === 'blue' ? 'text-blue-500' :
                  metric.color === 'purple' ? 'text-purple-500' :
                  'text-gray-500'
                }`} />
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Last Updated:</strong> {new Date(data?.last_updated).toLocaleString()}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          {data?.active_insights} active insights • {data?.pending_alerts} pending alerts
        </p>
      </div>
    </motion.div>
  );
};

export default ExecutiveSummaryWidget;
```

#### CriticalAlertsPanel.jsx
```javascript
// frontend/src/components/dashboard/CriticalAlertsPanel.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

const CriticalAlertsPanel = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">All Clear!</h3>
            <p className="text-gray-600">No critical alerts at this time.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Critical Alerts</h2>
        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
          {alerts.length}
        </span>
      </div>
      
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.insight_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">{alert.title}</h3>
                <p className="text-red-700 mt-1">{alert.description}</p>
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="ml-4">
                <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">
                  {alert.urgency}
                </span>
              </div>
            </div>
            {alert.recommendation && (
              <div className="mt-3 p-3 bg-white rounded border">
                <p className="text-sm text-gray-700">
                  <strong>Recommended Action:</strong> {alert.recommendation}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CriticalAlertsPanel;
```

#### GoalProgressTracker.jsx
```javascript
// frontend/src/components/dashboard/GoalProgressTracker.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar } from 'lucide-react';

const GoalProgressTracker = ({ progress }) => {
  const goals = [
    {
      name: 'Revenue Growth',
      status: progress?.revenue_growth || 'On track',
      progress: 75,
      target: '50% growth in 6 months',
      timeline: '4 months remaining'
    },
    {
      name: 'Customer Acquisition',
      status: progress?.customer_acquisition || 'Ahead of target',
      progress: 85,
      target: '200 new customers',
      timeline: '3 months remaining'
    },
    {
      name: 'Operational Efficiency',
      status: progress?.operational_efficiency || 'Meeting goals',
      progress: 60,
      target: '90% automation rate',
      timeline: '5 months remaining'
    }
  ];

  const getStatusColor = (status) => {
    if (status === 'Ahead of target') return 'text-green-600 bg-green-100';
    if (status === 'On track') return 'text-blue-600 bg-blue-100';
    if (status === 'Behind target') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center mb-6">
        <Target className="w-6 h-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Goal Progress</h2>
      </div>
      
      <div className="space-y-6">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{goal.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(goal.status)}`}>
                {goal.status}
              </span>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className="bg-blue-600 h-2 rounded-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-600">{goal.target}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-gray-600">{goal.timeline}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default GoalProgressTracker;
```

#### RecommendationEngine.jsx
```javascript
// frontend/src/components/dashboard/RecommendationEngine.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Play, Clock, CheckCircle } from 'lucide-react';
import { useRecommendations } from '../../hooks/useApiData.js';

const RecommendationEngine = ({ recommendations }) => {
  const { executeRecommendation, loading } = useRecommendations();
  const [executingId, setExecutingId] = useState(null);

  const handleExecuteRecommendation = async (recommendationId) => {
    setExecutingId(recommendationId);
    try {
      await executeRecommendation(recommendationId, 'execute');
      // Show success feedback
    } catch (error) {
      console.error('Failed to execute recommendation:', error);
    } finally {
      setExecutingId(null);
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-center py-8">
          <Lightbulb className="w-12 h-12 text-yellow-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No Recommendations</h3>
            <p className="text-gray-600">All systems are optimized. Great job!</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center mb-6">
        <Lightbulb className="w-6 h-6 text-yellow-500 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">AI Recommendations</h2>
        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
          {recommendations.length}
        </span>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.recommendation_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                <p className="text-gray-700 mt-1">{rec.description}</p>
                
                <div className="flex items-center mt-3 space-x-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.priority} priority
                  </span>
                  <span className="text-gray-600">
                    Impact: {rec.estimated_impact}
                  </span>
                  <span className="text-gray-600">
                    Success: {Math.round(rec.success_probability * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="ml-4">
                <button
                  onClick={() => handleExecuteRecommendation(rec.recommendation_id)}
                  disabled={loading || executingId === rec.recommendation_id}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    loading || executingId === rec.recommendation_id
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {executingId === rec.recommendation_id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Executing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Play className="w-4 h-4 mr-1" />
                      Execute
                    </div>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecommendationEngine;
```

### 5. Real-time Updates and WebSocket Integration

#### WebSocket Hook for Real-time Updates
```javascript
// frontend/src/hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setConnectionStatus('connected');
      setSocket(ws);
      reconnectAttemptsRef.current = 0;
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastMessage(data);
    };
    
    ws.onclose = () => {
      setConnectionStatus('disconnected');
      setSocket(null);
      
      // Attempt to reconnect
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = setTimeout(() => {
          setConnectionStatus('reconnecting');
        }, 2000 * reconnectAttemptsRef.current);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      ws.close();
    };
  }, [url, reconnectAttemptsRef.current]);
  
  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };
  
  return { socket, lastMessage, connectionStatus, sendMessage };
};

// Hook specifically for Business Intelligence updates
export const useBusinessIntelligenceWebSocket = () => {
  const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:5001'}/bi/updates`;
  return useWebSocket(wsUrl);
};
```

### 6. State Management Integration

#### Context for Business Intelligence
```javascript
// frontend/src/contexts/BusinessIntelligenceContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useBusinessIntelligence, usePrioritizedInsights } from '../hooks/useApiData.js';
import { useBusinessIntelligenceWebSocket } from '../hooks/useWebSocket.js';

const BusinessIntelligenceContext = createContext();

const initialState = {
  dashboardState: null,
  insights: [],
  recommendations: [],
  alerts: [],
  goalProgress: null,
  loading: true,
  error: null,
  lastUpdated: null
};

const biReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_DASHBOARD_STATE':
      return { 
        ...state, 
        dashboardState: action.payload, 
        lastUpdated: new Date().toISOString(),
        loading: false 
      };
    case 'SET_INSIGHTS':
      return { ...state, insights: action.payload };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'SET_GOAL_PROGRESS':
      return { ...state, goalProgress: action.payload };
    case 'UPDATE_FROM_WEBSOCKET':
      return {
        ...state,
        ...action.payload,
        lastUpdated: new Date().toISOString()
      };
    default:
      return state;
  }
};

export const BusinessIntelligenceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(biReducer, initialState);
  const { intelligence, loading: intelLoading } = useBusinessIntelligence();
  const { insights, loading: insightsLoading } = usePrioritizedInsights();
  const { lastMessage } = useBusinessIntelligenceWebSocket();

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage) {
      dispatch({ type: 'UPDATE_FROM_WEBSOCKET', payload: lastMessage });
    }
  }, [lastMessage]);

  // Handle API data updates
  useEffect(() => {
    if (intelligence) {
      dispatch({ type: 'SET_DASHBOARD_STATE', payload: intelligence.data.dashboard_state });
    }
  }, [intelligence]);

  useEffect(() => {
    if (insights) {
      dispatch({ type: 'SET_INSIGHTS', payload: insights });
    }
  }, [insights]);

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: intelLoading || insightsLoading });
  }, [intelLoading, insightsLoading]);

  const value = {
    ...state,
    dispatch
  };

  return (
    <BusinessIntelligenceContext.Provider value={value}>
      {children}
    </BusinessIntelligenceContext.Provider>
  );
};

export const useBusinessIntelligenceContext = () => {
  const context = useContext(BusinessIntelligenceContext);
  if (!context) {
    throw new Error('useBusinessIntelligenceContext must be used within BusinessIntelligenceProvider');
  }
  return context;
};
```

### 7. Integration with Existing Components

#### Enhanced DashboardView.jsx Integration
```javascript
// Add to existing DashboardView.jsx
import BusinessIntelligenceDashboard from '../components/dashboard/BusinessIntelligenceDashboard.jsx';
import { BusinessIntelligenceProvider } from '../contexts/BusinessIntelligenceContext.jsx';

const DashboardView = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'intelligence', label: 'Business Intelligence', icon: Brain }, // NEW
    { id: 'content', label: 'Content Garden', icon: Sprout },
    { id: 'visualizations', label: 'Visualizations', icon: Radar },
    { id: 'insights', label: 'Agent Theater', icon: Sparkles }
  ];

  return (
    <BusinessIntelligenceProvider>
      <div className="space-y-6">
        {/* Existing tab navigation */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
          {activeTab === 'intelligence' && (
            <motion.div
              key="intelligence"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BusinessIntelligenceDashboard />
            </motion.div>
          )}
          {/* Existing tab content */}
        </AnimatePresence>
      </div>
    </BusinessIntelligenceProvider>
  );
};
```

### 8. Mobile Responsiveness Requirements

#### Responsive Design Considerations
- **Mobile-first approach**: All BIA components must be mobile-responsive
- **Touch-friendly interactions**: Recommendation buttons and alerts must be easily tappable
- **Collapsible sections**: Complex insights should be collapsible on mobile
- **Progressive disclosure**: Show summary on mobile, details on desktop
- **Swipe gestures**: Allow swiping between different insight categories

#### Mobile-Specific Components
```javascript
// Mobile-optimized version of BusinessIntelligenceDashboard
const MobileBusinessIntelligenceDashboard = () => {
  const [activeSection, setActiveSection] = useState('summary');
  
  return (
    <div className="space-y-4 px-4">
      {/* Mobile tab navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['summary', 'alerts', 'goals', 'recommendations'].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              activeSection === section
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Mobile-optimized content */}
      {activeSection === 'summary' && <MobileExecutiveSummary />}
      {activeSection === 'alerts' && <MobileAlertsPanel />}
      {activeSection === 'goals' && <MobileGoalProgress />}
      {activeSection === 'recommendations' && <MobileRecommendations />}
    </div>
  );
};
```

### 9. Performance Optimization Requirements

#### Lazy Loading and Code Splitting
```javascript
// Lazy load Business Intelligence components
const BusinessIntelligenceDashboard = lazy(() => import('./dashboard/BusinessIntelligenceDashboard.jsx'));
const ExecutiveSummaryWidget = lazy(() => import('./dashboard/ExecutiveSummaryWidget.jsx'));

// Use Suspense for loading states
<Suspense fallback={<BusinessIntelligenceSkeleton />}>
  <BusinessIntelligenceDashboard />
</Suspense>
```

#### Data Caching and Memoization
```javascript
// Memoize expensive calculations
const memoizedInsights = useMemo(() => {
  return insights.map(insight => ({
    ...insight,
    processedData: processInsightData(insight)
  }));
}, [insights]);

// Cache API responses
const cachedRecommendations = useMemo(() => {
  return recommendations.filter(rec => rec.priority === 'high');
}, [recommendations]);
```

### 10. Testing Requirements

#### Unit Tests Required
- BusinessIntelligenceDashboard component tests
- API hook tests (useBusinessIntelligence, usePrioritizedInsights, useRecommendations)
- Context provider tests
- WebSocket integration tests
- Mobile responsive behavior tests

#### Integration Tests Required
- End-to-end dashboard flow tests
- Real-time update functionality tests
- Recommendation execution workflow tests
- Cross-browser compatibility tests

#### Test Structure
```javascript
// Example test structure
describe('BusinessIntelligenceDashboard', () => {
  test('renders executive summary widget', () => {
    // Test implementation
  });
  
  test('displays critical alerts when available', () => {
    // Test implementation
  });
  
  test('handles loading states correctly', () => {
    // Test implementation
  });
  
  test('executes recommendations successfully', () => {
    // Test implementation
  });
});
```

### 11. Accessibility Requirements

#### WCAG 2.1 AA Compliance
- **Keyboard navigation**: All interactive elements must be keyboard accessible
- **Screen reader support**: Proper ARIA labels and descriptions
- **Color contrast**: Minimum 4.5:1 contrast ratio for text
- **Focus management**: Clear focus indicators and logical tab order
- **Alternative text**: Descriptive alt text for all icons and images

#### Accessibility Features
```javascript
// Example accessibility implementation
<button
  onClick={handleExecuteRecommendation}
  aria-label={`Execute recommendation: ${rec.title}`}
  aria-describedby={`rec-description-${rec.recommendation_id}`}
  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  <Play className="w-4 h-4 mr-1" aria-hidden="true" />
  Execute
</button>
<p id={`rec-description-${rec.recommendation_id}`} className="sr-only">
  {rec.description}
</p>
```

### 12. Security Considerations

#### Data Protection
- **API authentication**: Secure API endpoints with proper authentication
- **Data encryption**: Encrypt sensitive business data in transit and at rest
- **Input validation**: Validate all user inputs and API responses
- **XSS prevention**: Sanitize all dynamic content
- **CSRF protection**: Implement CSRF tokens for state-changing operations

#### Privacy Compliance
- **GDPR compliance**: Handle personal data according to GDPR requirements
- **Data minimization**: Only collect and display necessary data
- **User consent**: Obtain consent for data processing where required
- **Data retention**: Implement appropriate data retention policies

## 🚀 Implementation Timeline

### Phase 1: Core Integration (Week 1-2)
- [ ] Create API endpoints for Business Intelligence Agent
- [ ] Implement basic React hooks for data fetching
- [ ] Create ExecutiveSummaryWidget component
- [ ] Integrate with existing DashboardView

### Phase 2: Advanced Features (Week 3-4)
- [ ] Implement CriticalAlertsPanel component
- [ ] Create GoalProgressTracker component
- [ ] Build RecommendationEngine component
- [ ] Add WebSocket integration for real-time updates

### Phase 3: Polish & Optimization (Week 5-6)
- [ ] Implement mobile responsiveness
- [ ] Add comprehensive error handling
- [ ] Implement accessibility features
- [ ] Add unit and integration tests

### Phase 4: Advanced Intelligence (Week 7-8)
- [ ] Create CrossAgentInsights component
- [ ] Implement advanced data visualization
- [ ] Add predictive analytics features
- [ ] Optimize performance and caching

## 📋 Frontend Developer Checklist

### Pre-Development Setup
- [ ] Review existing dashboard architecture
- [ ] Understand current API service structure
- [ ] Set up development environment
- [ ] Configure WebSocket connection testing

### Development Tasks
- [ ] Create new API service methods for BIA
- [ ] Implement React hooks for data management
- [ ] Build responsive dashboard components
- [ ] Integrate with existing context providers
- [ ] Add real-time update functionality

### Testing & Quality Assurance
- [ ] Write comprehensive unit tests
- [ ] Test mobile responsiveness
- [ ] Verify accessibility compliance
- [ ] Perform cross-browser testing
- [ ] Test WebSocket reliability

### Deployment Preparation
- [ ] Optimize bundle size and performance
- [ ] Configure production API endpoints
- [ ] Set up monitoring and error tracking
- [ ] Document component APIs and usage
- [ ] Create user documentation

## 🔧 Technical Dependencies

### Required Packages
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.263.0",
    "recharts": "^2.5.0"
  },
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.16.0",
    "cypress": "^12.0.0"
  }
}
```

### Environment Variables
```env
VITE_API_URL=http://localhost:5001
VITE_WS_URL=ws://localhost:5001
VITE_BI_REFRESH_INTERVAL=300000
VITE_INSIGHTS_REFRESH_INTERVAL=120000
```

This comprehensive integration plan ensures the Business Intelligence Agent will seamlessly integrate with the existing frontend architecture while providing powerful new capabilities for business intelligence and decision-making.
