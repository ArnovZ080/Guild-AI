import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Clock, TrendingUp, Target, Users, BarChart3, CheckCircle, AlertTriangle, Zap, Calendar, Eye, MessageCircle, Heart } from 'lucide-react';
import ConfidenceScore from '../shared/ConfidenceScore';

const AdaptiveReschedulingModal = ({ content, onClose, onApplyRescheduling }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [reschedulingSuggestions, setReschedulingSuggestions] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    if (content) {
      analyzePerformanceAndGenerateSuggestions();
    }
  }, [content]);

  const analyzePerformanceAndGenerateSuggestions = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis of performance patterns
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const analysis = {
        performance_analysis: {
          overall_insight: "Based on analysis of your last 30 posts, your audience shows strong engagement patterns during specific time windows.",
          peak_engagement_times: [
            { time: '9:00 AM', day: 'Tuesday', engagement_rate: 4.8, confidence: 0.89 },
            { time: '2:30 PM', day: 'Wednesday', engagement_rate: 5.2, confidence: 0.91 },
            { time: '6:00 PM', day: 'Thursday', engagement_rate: 4.6, confidence: 0.85 },
            { time: '11:00 AM', day: 'Friday', engagement_rate: 4.3, confidence: 0.82 }
          ],
          audience_behavior_patterns: {
            most_active_hours: '2:00 PM - 4:00 PM',
            most_active_days: 'Tuesday, Wednesday, Thursday',
            least_active_periods: 'Weekends and Monday mornings',
            content_preference_shift: 'Educational content performs 23% better in morning slots'
          },
          performance_trends: {
            engagement_growth: '+18% over last 30 days',
            optimal_posting_frequency: '3-4 posts per week',
            best_content_types: ['Educational', 'Behind-the-scenes', 'Industry insights'],
            worst_performing_times: ['8:00 AM', '10:00 PM', 'Sunday']
          }
        },
        current_content_analysis: {
          scheduled_time: content.scheduled_date,
          predicted_performance: {
            current_time_score: 3.2,
            optimal_time_score: 5.2,
            improvement_potential: '+62%'
          },
          rescheduling_confidence: 0.87,
          reasoning: "Your content is scheduled during a low-engagement period. Moving to optimal time slot could significantly improve performance."
        },
        ai_learning_insights: {
          pattern_recognition: "AI has identified that your audience engages 40% more with educational content posted between 2:00-3:00 PM on weekdays.",
          adaptive_strategy: "Recommendation based on analysis of 47 similar posts and audience engagement patterns.",
          confidence_growth: "Pattern confidence increased by 12% after analyzing last week's performance data."
        }
      };

      setAnalysisData(analysis);

      // Generate specific rescheduling suggestions
      const suggestions = [
        {
          id: 'suggestion_1',
          type: 'time_optimization',
          current_schedule: content.scheduled_date,
          suggested_schedule: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(), // 2 days later at 2 PM
          improvement_potential: '+62%',
          confidence: 0.89,
          reasoning: "Move to Tuesday 2:00 PM - your highest performing time slot based on audience behavior analysis",
          impact: 'High',
          affected_metrics: ['engagement_rate', 'reach', 'comments'],
          agent_insight: "Audience Agent: Tuesday afternoons show peak engagement for educational content",
          risk_assessment: 'Low risk - pattern is well-established'
        },
        {
          id: 'suggestion_2',
          type: 'frequency_optimization',
          current_schedule: content.scheduled_date,
          suggested_schedule: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 15 * 30 * 60 * 1000).toISOString(), // 1 day later at 3:30 PM
          improvement_potential: '+34%',
          confidence: 0.76,
          reasoning: "Avoid posting too close to your last post (yesterday) - spacing improves individual post performance",
          impact: 'Medium',
          affected_metrics: ['engagement_rate', 'impressions'],
          agent_insight: "Content Strategy Agent: Optimal spacing between educational content is 48-72 hours",
          risk_assessment: 'Medium risk - shorter timeframe but higher engagement period'
        },
        {
          id: 'suggestion_3',
          type: 'content_context_optimization',
          current_schedule: content.scheduled_date,
          suggested_schedule: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(), // 3 days later at 10 AM
          improvement_potential: '+28%',
          confidence: 0.71,
          reasoning: "Morning slot works better for educational content - audience is more receptive to learning content early in day",
          impact: 'Medium',
          affected_metrics: ['engagement_rate', 'saves', 'shares'],
          agent_insight: "Timing Agent: Educational content shows 25% higher engagement in morning hours",
          risk_assessment: 'Low risk - established pattern for educational content'
        }
      ];

      setReschedulingSuggestions(suggestions);
      
    } catch (error) {
      console.error('Adaptive rescheduling analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestionToggle = (suggestionId) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId) 
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const handleApplyRescheduling = async () => {
    if (selectedSuggestions.length === 0) return;
    
    setIsApplying(true);
    
    try {
      // Simulate applying rescheduling
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const appliedSuggestions = reschedulingSuggestions.filter(s => 
        selectedSuggestions.includes(s.id)
      );
      
      // Create optimized content with new scheduling
      const optimizedContent = {
        ...content,
        content_id: `${content.content_id}_rescheduled_${Date.now()}`,
        scheduled_date: appliedSuggestions[0].suggested_schedule, // Use first selected suggestion
        adaptive_rescheduling_applied: true,
        rescheduling_confidence: appliedSuggestions[0].confidence,
        improvement_potential: appliedSuggestions[0].improvement_potential,
        version_history: [...(content.version_history || []), {
          id: `rescheduling_${Date.now()}`,
          version: `${parseFloat(content?.version || '1.0') + 0.1}`,
          timestamp: new Date().toISOString(),
          author: 'AI Adaptive Rescheduling Agent',
          changes: [
            `Rescheduled from ${new Date(content.scheduled_date).toLocaleString()} to ${new Date(appliedSuggestions[0].suggested_schedule).toLocaleString()}`,
            `Applied ${appliedSuggestions[0].type.replace('_', ' ')} optimization`,
            `Expected improvement: ${appliedSuggestions[0].improvement_potential}`,
            `Confidence: ${Math.round(appliedSuggestions[0].confidence * 100)}%`
          ],
          status: 'rescheduled',
          content_snapshot: {
            ...content,
            scheduled_date: appliedSuggestions[0].suggested_schedule,
            adaptive_rescheduling_applied: true
          }
        }]
      };
      
      if (onApplyRescheduling) {
        onApplyRescheduling(optimizedContent, appliedSuggestions);
      }
      
    } catch (error) {
      console.error('Rescheduling application failed:', error);
    } finally {
      setIsApplying(false);
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
            <Brain className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Adaptive Rescheduling</h2>
              <p className="text-sm text-gray-600">
                AI-powered schedule optimization for "{content.content_preview?.substring(0, 50)}..."
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {analysisData && (
              <ConfidenceScore score={analysisData.current_content_analysis.rescheduling_confidence} size="medium" />
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Performance Patterns</h3>
              <p className="text-gray-600">AI is learning from your content performance to optimize scheduling...</p>
              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analyzing engagement patterns</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Identifying optimal timing</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>Learning from audience behavior</span>
                </div>
              </div>
            </div>
          ) : analysisData ? (
            <div className="space-y-6">
              {/* Performance Analysis Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Analysis</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisData.current_content_analysis.predicted_performance.improvement_potential}
                    </div>
                    <div className="text-sm text-gray-600">Improvement Potential</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{analysisData.performance_analysis.overall_insight}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {analysisData.performance_analysis.peak_engagement_times.length}
                    </div>
                    <div className="text-xs text-gray-600">Peak Times</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {analysisData.performance_analysis.performance_trends.engagement_growth}
                    </div>
                    <div className="text-xs text-gray-600">Engagement Growth</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {analysisData.performance_analysis.performance_trends.optimal_posting_frequency}
                    </div>
                    <div className="text-xs text-gray-600">Optimal Frequency</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round(analysisData.current_content_analysis.rescheduling_confidence * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Confidence</div>
                  </div>
                </div>
              </div>

              {/* Peak Engagement Times */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Engagement Times</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisData.performance_analysis.peak_engagement_times.map((time, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {time.day} at {time.time}
                        </div>
                        <ConfidenceScore score={time.confidence} size="small" showDetails={false} />
                      </div>
                      <div className="text-lg font-bold text-green-600 mb-1">
                        {time.engagement_rate}% engagement
                      </div>
                      <div className="text-sm text-gray-600">
                        Your best performing time slot
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Learning Insights */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Learning Insights</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Pattern Recognition</span>
                    </div>
                    <p className="text-sm text-gray-700">{analysisData.ai_learning_insights.pattern_recognition}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Adaptive Strategy</span>
                    </div>
                    <p className="text-sm text-gray-700">{analysisData.ai_learning_insights.adaptive_strategy}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Confidence Growth</span>
                    </div>
                    <p className="text-sm text-gray-700">{analysisData.ai_learning_insights.confidence_growth}</p>
                  </div>
                </div>
              </div>

              {/* Rescheduling Suggestions */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Rescheduling Suggestions</h3>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                <div className="space-y-4">
                  {reschedulingSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedSuggestions.includes(suggestion.id)}
                          onChange={() => handleSuggestionToggle(suggestion.id)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-purple-600" />
                              <span className="font-medium text-gray-900 capitalize">
                                {suggestion.type.replace('_', ' ')} Optimization
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                                {suggestion.impact} Impact
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(suggestion.risk_assessment.split(' ')[0])}`}>
                                {suggestion.risk_assessment}
                              </span>
                              <ConfidenceScore score={suggestion.confidence} size="small" showDetails={false} />
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="text-sm text-gray-600 mb-1">
                              <strong>Current:</strong> {new Date(suggestion.current_schedule).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              <strong>Suggested:</strong> {new Date(suggestion.suggested_schedule).toLocaleString()}
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              <strong>Improvement:</strong> {suggestion.improvement_potential}
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mb-3">{suggestion.reasoning}</p>
                          
                          {showDetails && (
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600">
                                <strong>Agent Insight:</strong> {suggestion.agent_insight}
                              </div>
                              <div className="text-sm text-gray-600">
                                <strong>Affected Metrics:</strong> {suggestion.affected_metrics.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply Rescheduling */}
              {selectedSuggestions.length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply Rescheduling</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {selectedSuggestions.length} suggestion(s) selected for application
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        AI will create optimized versions of your content with new scheduling
                      </p>
                    </div>
                    <button
                      onClick={handleApplyRescheduling}
                      disabled={isApplying}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApplying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Applying...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Apply Rescheduling
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};

export default AdaptiveReschedulingModal;
