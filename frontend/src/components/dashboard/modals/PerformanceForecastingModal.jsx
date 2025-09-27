import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, Users, Eye, MousePointer, Heart, MessageCircle, Share, Target, BarChart3, Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import ConfidenceScore from '../shared/ConfidenceScore';

const PerformanceForecastingModal = ({ content, onClose, onOptimize }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [optimizedContent, setOptimizedContent] = useState(null);

  useEffect(() => {
    if (content) {
      generateForecast();
    }
  }, [content]);

  // Detect if content is AI-generated
  const isAIGenerated = content?.ai_generated || content?.created_by?.includes('AI') || content?.assignee === 'AI Agent';

  const generateForecast = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const forecast = {
        content_type: isAIGenerated ? 'ai_validation' : 'user_forecast',
        overall_confidence: isAIGenerated ? 0.92 : 0.87,
        ai_optimization_status: isAIGenerated ? 'pre_optimized' : 'needs_optimization',
        predictions: {
          reach: {
            value: 12500,
            confidence: 0.89,
            range: { min: 8500, max: 18500 },
            trend: '+15%',
            explanation: 'Based on your audience growth and similar content performance'
          },
          impressions: {
            value: 18750,
            confidence: 0.85,
            range: { min: 12000, max: 28000 },
            trend: '+22%',
            explanation: 'Algorithm favorability and posting time optimization'
          },
          engagement_rate: {
            value: 4.2,
            confidence: 0.82,
            range: { min: 2.8, max: 6.1 },
            trend: '+8%',
            explanation: 'Content resonates well with target audience interests'
          },
          likes: {
            value: 525,
            confidence: 0.91,
            range: { min: 340, max: 780 },
            trend: '+12%',
            explanation: 'Visual appeal and trending topic alignment'
          },
          comments: {
            value: 42,
            confidence: 0.76,
            range: { min: 25, max: 68 },
            trend: '+5%',
            explanation: 'Engaging hook and call-to-action effectiveness'
          },
          shares: {
            value: 18,
            confidence: 0.83,
            range: { min: 10, max: 32 },
            trend: '+18%',
            explanation: 'Shareable content format and valuable insights'
          },
          clicks: {
            value: 89,
            confidence: 0.79,
            range: { min: 55, max: 145 },
            trend: '+14%',
            explanation: 'Clear value proposition and compelling CTA'
          },
          saves: {
            value: 67,
            confidence: 0.88,
            range: { min: 42, max: 98 },
            trend: '+25%',
            explanation: 'Educational value and evergreen content appeal'
          }
        },
        timing_analysis: {
          optimal_time: '2:30 PM',
          optimal_day: 'Wednesday',
          timezone: content.scheduled_timezone || 'UTC',
          confidence: 0.84,
          reasoning: 'Peak engagement hours based on your audience activity patterns'
        },
        audience_insights: {
          primary_demographic: '25-34 years',
          engagement_pattern: 'High during lunch hours',
          content_preference: 'Educational and behind-the-scenes content',
          growth_potential: 'Strong for professional networking'
        },
        competitive_analysis: {
          industry_average: {
            reach: 8500,
            engagement_rate: 3.1,
            comments: 28
          },
          performance_vs_industry: {
            reach: '+47%',
            engagement: '+35%',
            comments: '+50%'
          }
        },
        optimization_suggestions: isAIGenerated ? [
          {
            type: 'validation',
            suggestion: 'AI already optimized posting time for maximum engagement',
            impact: 'Applied',
            confidence: 0.95,
            status: 'implemented'
          },
          {
            type: 'validation',
            suggestion: 'AI selected trending hashtags during content creation',
            impact: 'Applied',
            confidence: 0.88,
            status: 'implemented'
          },
          {
            type: 'validation',
            suggestion: 'AI included engagement hooks in caption structure',
            impact: 'Applied',
            confidence: 0.91,
            status: 'implemented'
          },
          {
            type: 'validation',
            suggestion: 'AI chose optimal content format for platform algorithm',
            impact: 'Applied',
            confidence: 0.87,
            status: 'implemented'
          }
        ] : [
          {
            type: 'timing',
            suggestion: 'Post 30 minutes earlier for maximum reach',
            impact: 'High',
            confidence: 0.91,
            status: 'pending'
          },
          {
            type: 'hashtags',
            suggestion: 'Add 2-3 trending industry hashtags',
            impact: 'Medium',
            confidence: 0.78,
            status: 'pending'
          },
          {
            type: 'content',
            suggestion: 'Include a question in the caption to boost comments',
            impact: 'Medium',
            confidence: 0.82,
            status: 'pending'
          },
          {
            type: 'format',
            suggestion: 'Consider carousel format for better engagement',
            impact: 'Low',
            confidence: 0.65,
            status: 'pending'
          }
        ],
        agent_insights: {
          engagement_agent: {
            confidence: 0.85,
            insight: 'Content aligns well with current trending topics in your industry'
          },
          audience_agent: {
            confidence: 0.88,
            insight: 'Target demographic shows high engagement with educational content'
          },
          timing_agent: {
            confidence: 0.84,
            insight: 'Wednesday afternoon shows peak engagement for your audience'
          },
          competitive_agent: {
            confidence: 0.79,
            insight: 'Performance expected to exceed industry benchmarks significantly'
          }
        },
        risk_factors: [
          {
            factor: 'Content saturation',
            risk_level: 'Low',
            description: 'Similar content posted recently may reduce reach'
          },
          {
            factor: 'Algorithm changes',
            risk_level: 'Medium',
            description: 'Recent platform updates may affect visibility'
          }
        ]
      };

      setForecastData(forecast);
    } catch (error) {
      console.error('Forecast generation failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImplementImprovements = async () => {
    if (!forecastData || isAIGenerated) return;
    
    setIsOptimizing(true);
    
    try {
      // Simulate AI optimization process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create optimized version of the content
      const optimized = {
        ...content,
        content_id: `${content.content_id}_optimized_${Date.now()}`,
        caption: content.caption + '\n\n❓ What do you think about this? Let me know in the comments!',
        hashtags: [...(content.hashtags || []), '#trending', '#industry', '#insights'],
        scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        ai_optimized: true,
        optimization_applied: true,
        version_history: [...(content.version_history || []), {
          id: `optimization_${Date.now()}`,
          version: `${parseFloat(content?.version || '1.0') + 0.1}`,
          timestamp: new Date().toISOString(),
          author: 'AI Optimization Agent',
          changes: [
            'Added engagement question to caption',
            'Included trending hashtags',
            'Optimized posting time',
            'Enhanced content for better performance'
          ],
          status: 'optimized',
          content_snapshot: {
            ...content,
            caption: content.caption + '\n\n❓ What do you think about this? Let me know in the comments!',
            hashtags: [...(content.hashtags || []), '#trending', '#industry', '#insights'],
            scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            ai_optimized: true
          }
        }]
      };
      
      setOptimizedContent(optimized);
      
      // Update optimization status in forecast data
      setForecastData(prev => ({
        ...prev,
        optimization_suggestions: prev.optimization_suggestions.map(suggestion => ({
          ...suggestion,
          status: 'implemented'
        }))
      }));
      
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSaveOptimizedContent = () => {
    if (optimizedContent && onOptimize) {
      onOptimize(optimizedContent);
      onClose();
    }
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'reach': return <Users className="w-4 h-4" />;
      case 'impressions': return <Eye className="w-4 h-4" />;
      case 'engagement_rate': return <Heart className="w-4 h-4" />;
      case 'likes': return <Heart className="w-4 h-4" />;
      case 'comments': return <MessageCircle className="w-4 h-4" />;
      case 'shares': return <Share className="w-4 h-4" />;
      case 'clicks': return <MousePointer className="w-4 h-4" />;
      case 'saves': return <Target className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isAIGenerated ? 'AI Validation Report' : 'Performance Forecast'}
              </h2>
              <p className="text-sm text-gray-600">
                {isAIGenerated 
                  ? `AI optimization validation for "${content.content_preview?.substring(0, 50)}..."`
                  : `AI-powered predictions for "${content.content_preview?.substring(0, 50)}..."`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {forecastData && (
              <ConfidenceScore score={forecastData.overall_confidence} size="medium" />
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isAnalyzing ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isAIGenerated ? 'Validating AI Optimization' : 'Analyzing Content Performance'}
              </h3>
              <p className="text-gray-600">
                {isAIGenerated 
                  ? 'AI agents are validating optimization decisions and performance predictions...'
                  : 'AI agents are analyzing your content and predicting performance...'
                }
              </p>
              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Analyzing audience behavior patterns</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Evaluating optimal timing</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Comparing with historical data</span>
                </div>
              </div>
            </div>
          ) : forecastData ? (
            <div className="space-y-6">
              {/* Overall Performance Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {forecastData.predictions.engagement_rate.value}%
                    </div>
                    <div className="text-sm text-gray-600">Expected Engagement</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {forecastData.predictions.reach.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Reach</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {forecastData.predictions.likes.value}
                    </div>
                    <div className="text-xs text-gray-600">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">
                      {forecastData.predictions.comments.value}
                    </div>
                    <div className="text-xs text-gray-600">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">
                      {forecastData.predictions.shares.value}
                    </div>
                    <div className="text-xs text-gray-600">Shares</div>
                  </div>
                </div>
              </div>

              {/* Detailed Predictions */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Predictions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(forecastData.predictions).map(([metric, data]) => (
                    <div key={metric} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getMetricIcon(metric)}
                          <span className="font-medium capitalize">{metric.replace('_', ' ')}</span>
                        </div>
                        <ConfidenceScore score={data.confidence} size="small" showDetails={false} />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {metric === 'engagement_rate' ? `${data.value}%` : data.value.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Range: {metric === 'engagement_rate' ? `${data.range.min}% - ${data.range.max}%` : `${data.range.min.toLocaleString()} - ${data.range.max.toLocaleString()}`}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600 font-medium">{data.trend} vs average</span>
                        <span className="text-xs text-gray-500">{data.explanation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timing Analysis */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimal Timing Analysis</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      {forecastData.timing_analysis.optimal_day} at {forecastData.timing_analysis.optimal_time}
                    </div>
                    <div className="text-sm text-gray-600">
                      {forecastData.timing_analysis.timezone}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {forecastData.timing_analysis.reasoning}
                    </div>
                  </div>
                  <ConfidenceScore score={forecastData.timing_analysis.confidence} size="medium" showDetails={false} />
                </div>
              </div>

              {/* Optimization Suggestions */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isAIGenerated ? 'AI Optimization Validation' : 'Optimization Suggestions'}
                  </h3>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                <div className="space-y-3">
                  {forecastData.optimization_suggestions.map((suggestion, idx) => (
                    <div key={idx} className={`flex items-start space-x-3 p-3 rounded-lg ${
                      suggestion.status === 'implemented' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}>
                      {suggestion.status === 'implemented' ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{suggestion.suggestion}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              suggestion.status === 'implemented' 
                                ? 'bg-green-100 text-green-800' 
                                : getImpactColor(suggestion.impact)
                            }`}>
                              {suggestion.status === 'implemented' ? 'Applied' : `${suggestion.impact} Impact`}
                            </span>
                            <ConfidenceScore score={suggestion.confidence} size="small" showDetails={false} />
                          </div>
                        </div>
                        {showDetails && (
                          <div className="text-sm text-gray-600 capitalize">
                            Type: {suggestion.type} • Confidence: {Math.round(suggestion.confidence * 100)}%
                            {suggestion.status === 'implemented' && ' • ✅ Already Applied'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Implement Improvements Button (only for user-generated content) */}
                {!isAIGenerated && (
                  <div className="mt-4 pt-4 border-t">
                    {optimizedContent ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-800">Optimizations Applied Successfully!</span>
                          </div>
                          <p className="text-sm text-green-700 mb-3">
                            AI has optimized your content for better performance. Review the changes below:
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span>Added engagement question to caption</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span>Included trending hashtags</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span>Optimized posting time</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleSaveOptimizedContent}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save Optimized Content
                          </button>
                          <button
                            onClick={() => setOptimizedContent(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleImplementImprovements}
                        disabled={isOptimizing}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isOptimizing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Implementing Improvements...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Implement Improvements
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Agent Insights */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(forecastData.agent_insights).map(([agent, insight]) => (
                    <div key={agent} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 capitalize">
                          {agent.replace('_', ' ')} Agent
                        </span>
                        <ConfidenceScore score={insight.confidence} size="small" showDetails={false} />
                      </div>
                      <p className="text-sm text-gray-700">{insight.insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              {forecastData.risk_factors.length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                  <div className="space-y-3">
                    {forecastData.risk_factors.map((risk, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{risk.factor}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.risk_level)}`}>
                              {risk.risk_level} Risk
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{risk.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitive Analysis */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {forecastData.performance_vs_industry.reach}
                    </div>
                    <div className="text-sm text-gray-600">vs Industry Reach</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {forecastData.performance_vs_industry.engagement}
                    </div>
                    <div className="text-sm text-gray-600">vs Industry Engagement</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {forecastData.performance_vs_industry.comments}
                    </div>
                    <div className="text-sm text-gray-600">vs Industry Comments</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceForecastingModal;
