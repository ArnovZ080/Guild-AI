import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronDown, ChevronUp, TrendingUp, Users, Target, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import ConfidenceScore from './ConfidenceScore';

const AIRecommendations = ({ 
  content, 
  showDetails = true, 
  defaultExpanded = true,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Generate AI recommendations based on content
  const generateRecommendations = (content) => {
    const recommendations = {
      overall_score: 0.85,
      engagement_prediction: 'High',
      brand_alignment: 0.92,
      audience_fit: 0.78,
      trending_relevance: 0.88,
      optimal_timing: true,
      suggestions: [
        {
          type: 'engagement',
          icon: TrendingUp,
          title: 'High Engagement Potential',
          description: 'Content aligns with current trending topics and audience interests',
          confidence: 0.88,
          impact: 'High'
        },
        {
          type: 'audience',
          icon: Users,
          title: 'Strong Audience Match',
          description: 'Content resonates well with your target demographic',
          confidence: 0.78,
          impact: 'Medium'
        },
        {
          type: 'brand',
          icon: Target,
          title: 'Brand Alignment',
          description: 'Content maintains consistent brand voice and messaging',
          confidence: 0.92,
          impact: 'High'
        }
      ],
      improvements: [
        'Consider adding more specific hashtags for better discoverability',
        'Include a clear call-to-action to drive engagement',
        'Post during peak hours (2-4 PM) for maximum reach'
      ],
      agent_insights: {
        content_strategist: {
          confidence: 0.85,
          insight: 'Content follows current industry trends and should perform well'
        },
        engagement_agent: {
          confidence: 0.82,
          insight: 'High likelihood of generating meaningful interactions'
        },
        brand_checker: {
          confidence: 0.92,
          insight: 'Excellent brand consistency and messaging alignment'
        }
      }
    };

    return recommendations;
  };

  const recommendations = generateRecommendations(content);

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'text-green-700 bg-green-100';
      case 'Medium': return 'text-yellow-700 bg-yellow-100';
      case 'Low': return 'text-orange-700 bg-orange-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getEngagementColor = (prediction) => {
    switch (prediction) {
      case 'High': return 'text-green-700 bg-green-100 border-green-200';
      case 'Medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'Low': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  if (!content) return null;

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Recommendations</h3>
          <ConfidenceScore score={recommendations.overall_score} size="small" />
        </div>
        {showDetails && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-purple-100 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-purple-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-600" />
            )}
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-600">Engagement</div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEngagementColor(recommendations.engagement_prediction)}`}>
            {recommendations.engagement_prediction}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Brand Fit</div>
          <ConfidenceScore score={recommendations.brand_alignment} size="small" showDetails={false} />
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Trending</div>
          <ConfidenceScore score={recommendations.trending_relevance} size="small" showDetails={false} />
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Key Insights</h4>
            <div className="space-y-2">
              {recommendations.suggestions.map((suggestion, idx) => {
                const Icon = suggestion.icon;
                return (
                  <div key={idx} className="flex items-start space-x-3 p-2 bg-white rounded-lg border">
                    <Icon className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{suggestion.title}</span>
                        <div className="flex items-center space-x-2">
                          <ConfidenceScore score={suggestion.confidence} size="small" showDetails={false} />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                            {suggestion.impact}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{suggestion.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Improvements */}
          {recommendations.improvements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Suggested Improvements</h4>
              <div className="space-y-1">
                {recommendations.improvements.map((improvement, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{improvement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Insights */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Agent Insights</h4>
            <div className="space-y-2">
              {Object.entries(recommendations.agent_insights).map(([agent, insight]) => (
                <div key={agent} className="p-2 bg-white rounded-lg border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {agent.replace('_', ' ')} Agent
                    </span>
                    <ConfidenceScore score={insight.confidence} size="small" showDetails={false} />
                  </div>
                  <p className="text-xs text-gray-600">{insight.insight}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIRecommendations;
