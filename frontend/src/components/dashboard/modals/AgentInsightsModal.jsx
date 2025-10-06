import React, { useState, useEffect } from 'react';
import { 
  Bot,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Phone,
  Mail,
  Users,
  BarChart3,
  Zap,
  Clock,
  DollarSign,
  Target,
  Activity,
  Star,
  X
} from 'lucide-react';

const AgentInsightsModal = ({ 
  onClose,
  onOrchestrateAction,
  conversations = []
}) => {
  const [insights, setInsights] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateInsights();
  }, [conversations]);

  const generateInsights = async () => {
    setIsGenerating(true);
    
    // Simulate AI analysis - in real implementation, this would call the business intelligence agent
    setTimeout(() => {
      const generatedInsights = [
        {
          id: 'sentiment_trend',
          type: 'warning',
          priority: 'high',
          title: 'Declining Customer Sentiment',
          description: 'Overall customer sentiment has decreased by 15% over the past week. Negative sentiment is primarily coming from support interactions.',
          metrics: {
            current: 0.72,
            previous: 0.85,
            change: -0.13
          },
          recommendation: 'Implement proactive sentiment monitoring and faster response times for support tickets',
          action: 'Deploy sentiment improvement workflow across all support channels',
          affectedAgents: ['support', 'customer_success'],
          icon: TrendingDown,
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        },
        {
          id: 'channel_performance',
          type: 'success',
          priority: 'medium',
          title: 'Email Channel Excellence',
          description: 'Email conversations show 94% positive sentiment and 23% higher engagement rates compared to other channels.',
          metrics: {
            current: 0.94,
            benchmark: 0.71,
            change: 0.23
          },
          recommendation: 'Scale email marketing efforts and use email templates as benchmarks for other channels',
          action: 'Replicate email success patterns across chat and social channels',
          affectedAgents: ['email', 'marketing'],
          icon: TrendingUp,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        {
          id: 'agent_performance',
          type: 'info',
          priority: 'medium',
          title: 'Sales Agent High Performance',
          description: 'Sales agents achieve 89% conversion rate on high-value prospects, with average deal size of $47,000.',
          metrics: {
            current: 0.89,
            benchmark: 0.65,
            change: 0.24
          },
          recommendation: 'Use sales agent strategies as training material for other agents',
          action: 'Create knowledge sharing sessions and best practice documentation',
          affectedAgents: ['sales', 'training'],
          icon: Star,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          id: 'response_time_issue',
          type: 'warning',
          priority: 'high',
          title: 'Chat Response Time Degradation',
          description: 'Average chat response time has increased from 2.3 minutes to 4.7 minutes, affecting customer satisfaction.',
          metrics: {
            current: 4.7,
            target: 2.0,
            change: 2.4
          },
          recommendation: 'Optimize chat agent routing and implement auto-responses for common queries',
          action: 'Deploy automated chat optimization and agent load balancing',
          affectedAgents: ['chat', 'automation'],
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        },
        {
          id: 'customer_lifetime_value',
          type: 'success',
          priority: 'low',
          title: 'High-Value Customer Retention',
          description: 'Customers with 3+ conversation touchpoints show 78% higher lifetime value and 45% better retention rates.',
          metrics: {
            current: 0.78,
            benchmark: 0.45,
            change: 0.33
          },
          recommendation: 'Implement multi-touchpoint nurturing campaigns for all new customers',
          action: 'Create automated multi-channel engagement sequences',
          affectedAgents: ['customer_success', 'marketing', 'automation'],
          icon: Target,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        }
      ];
      
      setInsights(generatedInsights);
      setIsGenerating(false);
    }, 2000);
  };


  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-red-500 bg-red-50',
      medium: 'border-yellow-500 bg-yellow-50',
      low: 'border-green-500 bg-green-50'
    };
    return colors[priority] || 'border-gray-500 bg-gray-50';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      high: AlertTriangle,
      medium: Clock,
      low: CheckCircle
    };
    return icons[priority] || CheckCircle;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Agent Insights</h2>
                <p className="text-sm text-gray-600">Actionable intelligence across all conversations and channels</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Loading State */}
          {isGenerating && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing conversation data and generating insights...</p>
            </div>
          )}

          {/* Insights Grid */}
          {!isGenerating && insights.length > 0 && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insight Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {insights.filter(i => i.type === 'warning').length}
                    </div>
                    <div className="text-sm text-gray-600">Issues to Address</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {insights.filter(i => i.type === 'success').length}
                    </div>
                    <div className="text-sm text-gray-600">Success Patterns</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {insights.filter(i => i.type === 'info').length}
                    </div>
                    <div className="text-sm text-gray-600">Optimization Opportunities</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {insights.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Insights</div>
                  </div>
                </div>
              </div>

              {/* Individual Insights */}
              <div className="space-y-4">
                {insights.map((insight) => {
                  const InsightIcon = insight.icon;
                  const PriorityIcon = getPriorityIcon(insight.priority);
                  
                  return (
                    <div key={insight.id} className={`border-l-4 rounded-lg p-6 ${getPriorityColor(insight.priority)}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                            <InsightIcon className={`w-5 h-5 ${insight.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                              <div className="flex items-center space-x-1">
                                <PriorityIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-xs text-gray-500 capitalize">{insight.priority} priority</span>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{insight.description}</p>
                            
                            {/* Metrics */}
                            <div className="flex items-center space-x-6 mb-3">
                              {insight.metrics && (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Current:</span>
                                    <span className="font-semibold text-gray-900">{insight.metrics.current}</span>
                                  </div>
                                  {insight.metrics.change && (
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-gray-600">Change:</span>
                                      <span className={`font-semibold ${
                                        insight.metrics.change > 0 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {insight.metrics.change > 0 ? '+' : ''}{insight.metrics.change}
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Recommendation</h4>
                        <p className="text-gray-700 text-sm">{insight.recommendation}</p>
                      </div>

                      {/* Affected Agents */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Affected Agents:</span>
                          <div className="flex items-center space-x-1">
                            {insight.affectedAgents.map((agent, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                                {agent}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isGenerating && insights.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
              <p className="text-gray-600">Generate insights by analyzing your conversation data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentInsightsModal;
