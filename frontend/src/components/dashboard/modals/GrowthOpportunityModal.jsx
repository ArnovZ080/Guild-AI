// Growth Opportunity Detail Modal
// Displays comprehensive information about a growth opportunity with transparent reasoning

import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, TrendingUp, AlertCircle, CheckCircle, Target, Clock, 
  DollarSign, ArrowUpRight, ArrowDownRight, Brain, Info,
  ThumbsUp, ThumbsDown, Zap, Users
} from 'lucide-react';

const GrowthOpportunityModal = ({ opportunity, onClose, onAccept, onReject, isLoading }) => {
  if (!opportunity) return null;

  const getCategoryIcon = (category) => {
    const icons = {
      marketing: TrendingUp,
      sales: Target,
      product: Zap,
      operations: Users,
      financial: DollarSign
    };
    return icons[category] || Brain;
  };

  const getImpactColor = (impact) => {
    const colors = {
      high: 'text-green-600 bg-green-50 border-green-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[impact] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const CategoryIcon = getCategoryIcon(opportunity.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <CategoryIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{opportunity.title}</h2>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="capitalize">{opportunity.category}</span>
                  <span>•</span>
                  <span>{opportunity.timeframe}</span>
                  <span>•</span>
                  <span>Confidence: {(opportunity.confidence_score * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Key Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Key Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Priority</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(opportunity.priority)}`}>
                      {opportunity.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Impact</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getImpactColor(opportunity.impact)}`}>
                      {opportunity.impact}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Effort Required</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getImpactColor(opportunity.effort)}`}>
                      {opportunity.effort}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-gray-600">Expected ROI</span>
                    <span className="font-semibold text-green-600">{opportunity.expected_roi}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-gray-600">Expected Revenue</span>
                    <span className="font-semibold text-green-600">{opportunity.expected_revenue}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Opportunity Description
                </h3>
                <p className="text-gray-700 leading-relaxed">{opportunity.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {opportunity.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                  Potential Risks
                </h3>
                <ul className="space-y-2">
                  {opportunity.risks.map((risk, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Supporting Data */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Supporting Data
                </h3>
                <div className="space-y-3">
                  {opportunity.supporting_data.map((point, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{point.metric}</div>
                        <div className="flex items-center space-x-1">
                          {point.trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : point.trend === 'down' ? (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          )}
                          <span className="text-sm font-semibold text-gray-900">{point.value}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{point.insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Reasoning - Educational Component */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  Why This Opportunity? (AI Analysis)
                </h3>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {opportunity.reasoning}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                  💡 This transparent reasoning helps you understand how our AI identifies growth opportunities,
                  teaching you to spot similar patterns in your own business data.
                </p>
              </div>

              {/* Recommended Agents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Agents Involved
                </h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.recommended_agents.map((agent, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  These agents will work together to implement this opportunity
                </p>
              </div>

              {/* Data Sources */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.data_sources.map((source, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {source.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {opportunity.status === 'pending' && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Ready to implement this opportunity?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => onReject(opportunity.id)}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ThumbsDown className="w-5 h-5" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => onAccept(opportunity.id)}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ThumbsUp className="w-5 h-5" />
                <span>{isLoading ? 'Processing...' : 'Accept & Implement'}</span>
              </button>
            </div>
          </div>
        )}

        {opportunity.status === 'accepted' && (
          <div className="bg-green-50 px-6 py-4 border-t border-green-200 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Opportunity Accepted - Workflow will be initiated</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GrowthOpportunityModal;

