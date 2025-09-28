import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Brain, 
  Clock, 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  BarChart3,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  ArrowRight,
  Lightbulb,
  Activity
} from 'lucide-react';
import ConfidenceScore from '../shared/ConfidenceScore';

const DynamicSlotsModal = ({ content, onClose, onApplyDynamicSlots, hiredAgents = [] }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedOptimizations, setSelectedOptimizations] = useState([]);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (content) {
      analyzeAudienceBehavior();
    }
  }, [content]);

  const analyzeAudienceBehavior = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis of audience behavior patterns
    await new Promise(resolve => setTimeout(resolve, 4000));

    const mockAnalysisData = {
      analysis_summary: `AI has analyzed 847 posts across ${content.platform} over the past 90 days, identifying optimal engagement patterns for your audience demographic.`,
      
      audience_insights: {
        total_posts_analyzed: 847,
        analysis_period: '90 days',
        audience_growth: '+12.3%',
        engagement_trend: '+8.7%',
        optimal_posting_frequency: '3-4 posts per week',
        audience_activity_peak: 'Tuesday-Thursday, 2-4 PM UTC'
      },

      behavioral_patterns: [
        {
          pattern_type: 'time_based',
          description: 'Peak engagement occurs Tuesday-Thursday between 2-4 PM UTC',
          confidence: 0.94,
          details: 'Average engagement rate: 8.2% vs 4.1% during off-peak hours',
          recommendation: 'Schedule content during these windows for maximum reach',
          impact_score: 0.89
        },
        {
          pattern_type: 'content_type',
          description: `${content.content_type} content performs best on weekdays`,
          confidence: 0.87,
          details: 'Weekend posts show 23% lower engagement for this content type',
          recommendation: 'Avoid weekend scheduling for this content type',
          impact_score: 0.76
        },
        {
          pattern_type: 'frequency',
          description: 'Optimal posting frequency: 3-4 posts per week',
          confidence: 0.91,
          details: 'Current frequency shows 15% audience fatigue indicators',
          recommendation: 'Reduce posting frequency to maintain engagement quality',
          impact_score: 0.82
        },
        {
          pattern_type: 'audience_demographics',
          description: 'Primary audience active during business hours (9 AM - 5 PM UTC)',
          confidence: 0.88,
          details: '72% of your audience is in business-focused time zones',
          recommendation: 'Align posting schedule with business hours',
          impact_score: 0.85
        }
      ],

      optimal_slots: [
        {
          id: 'slot_1',
          day: 'Tuesday',
          time: '2:00 PM UTC',
          engagement_prediction: 'High',
          reach_prediction: 1250,
          engagement_rate_prediction: '8.2%',
          confidence: 0.94,
          reasoning: 'Based on 47 successful posts at this time slot',
          status: 'available'
        },
        {
          id: 'slot_2', 
          day: 'Wednesday',
          time: '3:30 PM UTC',
          engagement_prediction: 'High',
          reach_prediction: 1180,
          engagement_rate_prediction: '7.9%',
          confidence: 0.91,
          reasoning: 'Consistently high engagement for similar content types',
          status: 'available'
        },
        {
          id: 'slot_3',
          day: 'Thursday',
          time: '2:15 PM UTC',
          engagement_prediction: 'Medium-High',
          reach_prediction: 1100,
          engagement_rate_prediction: '7.4%',
          confidence: 0.87,
          reasoning: 'Good alternative slot with slightly lower competition',
          status: 'available'
        }
      ],

      learning_insights: {
        model_accuracy: 0.89,
        data_freshness: 'Last updated 2 hours ago',
        confidence_trend: 'Increasing (+0.03 this week)',
        pattern_stability: 'High - patterns consistent over 30 days',
        next_analysis: 'Scheduled for tomorrow at 6 AM UTC'
      },

      agent_contributions: {
        audience_intelligence_agent: {
          confidence: 0.92,
          insight: 'Identified key demographic patterns affecting engagement timing',
          contribution: 'Provided audience segmentation and behavioral analysis'
        },
        content_intelligence_agent: {
          confidence: 0.88,
          insight: 'Content type performance varies significantly by timing',
          contribution: 'Analyzed content-type specific optimal scheduling'
        },
        analytics_agent: {
          confidence: 0.90,
          insight: 'Historical performance data shows clear engagement patterns',
          contribution: 'Processed 847 posts of engagement data for pattern recognition'
        }
      },

      dynamic_recommendations: [
        {
          id: 'timing_optimization',
          type: 'schedule_adjustment',
          description: 'Move content from current slot to Tuesday 2:00 PM UTC',
          current_slot: `${new Date(content.scheduled_date).toLocaleDateString()} ${new Date(content.scheduled_date).toLocaleTimeString()}`,
          new_slot: 'Tuesday 2:00 PM UTC',
          expected_improvement: {
            reach: '+23%',
            engagement: '+31%',
            clicks: '+18%'
          },
          confidence: 0.94,
          reasoning: 'Optimal slot based on audience activity patterns and content type performance',
          risk_level: 'Low',
          status: 'pending'
        },
        {
          id: 'frequency_adjustment',
          type: 'posting_strategy',
          description: 'Adjust posting frequency to 3 posts per week for this content type',
          expected_improvement: {
            engagement_quality: '+15%',
            audience_retention: '+8%',
            overall_performance: '+12%'
          },
          confidence: 0.91,
          reasoning: 'Reduce audience fatigue while maintaining consistent engagement',
          risk_level: 'Low',
          status: 'pending'
        },
        {
          id: 'content_context',
          type: 'contextual_optimization',
          description: 'Pair with related content for cross-promotion during peak hours',
          expected_improvement: {
            cross_traffic: '+22%',
            content_discovery: '+17%',
            brand_awareness: '+13%'
          },
          confidence: 0.85,
          reasoning: 'Leverage peak audience activity for broader content reach',
          risk_level: 'Medium',
          status: 'pending'
        }
      ],

      overall_confidence: 0.91,
      learning_phase: 'Advanced - Model has high confidence in recommendations',
      next_optimization: 'Continue monitoring for seasonal pattern adjustments'
    };

    setAnalysisData(mockAnalysisData);
    setIsAnalyzing(false);
  };

  const handleToggleOptimization = (optimizationId) => {
    setSelectedOptimizations(prev =>
      prev.includes(optimizationId)
        ? prev.filter(id => id !== optimizationId)
        : [...prev, optimizationId]
    );
  };

  const handleApplyDynamicSlots = async () => {
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const applied = analysisData.dynamic_recommendations.filter(rec => 
      selectedOptimizations.includes(rec.id)
    );

    let updatedContent = { ...content };
    let changes = [];

    applied.forEach(recommendation => {
      if (recommendation.type === 'schedule_adjustment') {
        // Calculate new date based on the optimal slot
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + (2 - newDate.getDay() + 7) % 7); // Next Tuesday
        newDate.setHours(14, 0, 0, 0); // 2 PM UTC
        updatedContent.scheduled_date = newDate.toISOString();
        changes.push(`Rescheduled to optimal slot: ${recommendation.new_slot}`);
      }
      changes.push(recommendation.description);
    });

    const newVersion = {
      id: `dynamic_slots_${Date.now()}`,
      version: `${parseFloat(content?.version || '1.0') + 0.1}`,
      timestamp: new Date().toISOString(),
      author: 'AI Dynamic Slots Learning System',
      changes: [`Applied dynamic slot optimizations: ${changes.join(', ')}`],
      status: 'dynamically_optimized',
      content_snapshot: { ...updatedContent }
    };

    updatedContent = {
      ...updatedContent,
      status: 'scheduled',
      version_history: [...(content.version_history || []), newVersion],
      dynamic_slots_applied: true,
      optimization_confidence: analysisData.overall_confidence,
      applied_optimizations: applied.map(opt => opt.description)
    };

    onApplyDynamicSlots(updatedContent, applied);
    setIsApplying(false);
    onClose();
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementColor = (level) => {
    switch (level) {
      case 'High': return 'text-green-600';
      case 'Medium-High': return 'text-blue-600';
      case 'Medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center justify-between p-6 border-b -mx-6 -mt-6 mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Dynamic Slots Learning</h2>
              <p className="text-sm text-gray-600">
                AI-powered audience behavior analysis for "{content.content_preview?.substring(0, 50)}..."
              </p>
            </div>
          </div>
          {analysisData && (
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <ConfidenceScore score={analysisData.overall_confidence} size="medium" />
            </div>
          )}
        </div>

        {isAnalyzing ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning from Audience Behavior...</h3>
            <p className="text-gray-600 mb-6">
              AI agents are analyzing engagement patterns to discover optimal posting times.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Processing 847 historical posts for pattern recognition</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Analyzing audience activity patterns across time zones</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Identifying optimal slots for {content.content_type} content</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Building predictive models for engagement optimization</span>
              </div>
            </div>
          </div>
        ) : analysisData ? (
          <div className="space-y-6">
            {/* Analysis Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-purple-800 mb-2">{analysisData.analysis_summary}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="bg-white p-2 rounded">
                      <div className="font-medium text-gray-900">{analysisData.audience_insights.total_posts_analyzed}</div>
                      <div className="text-gray-600">Posts Analyzed</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-medium text-green-600">{analysisData.audience_insights.audience_growth}</div>
                      <div className="text-gray-600">Audience Growth</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-medium text-blue-600">{analysisData.audience_insights.engagement_trend}</div>
                      <div className="text-gray-600">Engagement Trend</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-medium text-purple-600">{analysisData.audience_insights.optimal_posting_frequency}</div>
                      <div className="text-gray-600">Optimal Frequency</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Behavioral Patterns */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Discovered Behavioral Patterns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisData.behavioral_patterns.map((pattern, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-gray-900">{pattern.description}</span>
                      </div>
                      <ConfidenceScore score={pattern.confidence} size="small" showDetails={false} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pattern.details}</p>
                    <p className="text-sm text-blue-600 font-medium">{pattern.recommendation}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Impact Score</span>
                      <span className="text-xs font-medium text-green-600">{Math.round(pattern.impact_score * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimal Slots */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                AI-Recommended Optimal Slots
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisData.optimal_slots.map((slot) => (
                  <div key={slot.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900">{slot.day}</span>
                      </div>
                      <ConfidenceScore score={slot.confidence} size="small" showDetails={false} />
                    </div>
                    <div className="text-lg font-bold text-green-700 mb-1">{slot.time}</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reach:</span>
                        <span className="font-medium">{slot.reach_prediction.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engagement:</span>
                        <span className={`font-medium ${getEngagementColor(slot.engagement_prediction)}`}>
                          {slot.engagement_rate_prediction}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{slot.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Recommendations */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-orange-600" />
                Dynamic Slot Recommendations
              </h3>
              <div className="space-y-4">
                {analysisData.dynamic_recommendations.map((recommendation) => (
                  <label key={recommendation.id} className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedOptimizations.includes(recommendation.id) 
                      ? 'bg-blue-50 border-blue-400 shadow-md' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedOptimizations.includes(recommendation.id)}
                      onChange={() => handleToggleOptimization(recommendation.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{recommendation.description}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(recommendation.risk_level)}`}>
                            {recommendation.risk_level} Risk
                          </span>
                          <ConfidenceScore score={recommendation.confidence} size="small" showDetails={false} />
                        </div>
                      </div>
                      {recommendation.current_slot && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Current:</span> {recommendation.current_slot}
                          <ArrowRight className="w-3 h-3 mx-1 inline" />
                          <span className="font-medium">Optimal:</span> {recommendation.new_slot}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-2">{recommendation.reasoning}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {Object.entries(recommendation.expected_improvement).map(([metric, value]) => (
                          <div key={metric} className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3" />
                            <span className="capitalize">{metric.replace('_', ' ')}: {value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Learning Insights */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-indigo-600" />
                AI Learning Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model Accuracy:</span>
                    <span className="font-medium text-green-600">{Math.round(analysisData.learning_insights.model_accuracy * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Freshness:</span>
                    <span className="font-medium">{analysisData.learning_insights.data_freshness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence Trend:</span>
                    <span className="font-medium text-green-600">{analysisData.learning_insights.confidence_trend}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pattern Stability:</span>
                    <span className="font-medium text-blue-600">{analysisData.learning_insights.pattern_stability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Analysis:</span>
                    <span className="font-medium">{analysisData.learning_insights.next_analysis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Learning Phase:</span>
                    <span className="font-medium text-purple-600">{analysisData.learning_phase}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Contributions */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Agent Contributions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analysisData.agent_contributions).map(([agentId, contribution]) => (
                  <div key={agentId} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 capitalize">
                        {agentId.replace(/_/g, ' ')} Agent
                      </span>
                      <ConfidenceScore score={contribution.confidence} size="small" showDetails={false} />
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{contribution.insight}</p>
                    <p className="text-xs text-blue-600">{contribution.contribution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="border-t p-6 -mx-6 -mb-6 mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyDynamicSlots}
            disabled={selectedOptimizations.length === 0 || isApplying}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Applying Optimizations...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Apply {selectedOptimizations.length} Dynamic Slot(s)
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DynamicSlotsModal;
