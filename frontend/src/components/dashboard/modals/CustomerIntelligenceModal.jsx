import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Brain, TrendingUp, AlertTriangle, DollarSign, 
  Heart, MessageSquare, Users, Zap, Target, Info,
  Calendar, Star, ArrowUpRight
} from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const CustomerIntelligenceModal = ({ isOpen, onClose, segmentId, onLaunchCampaign }) => {
  const [loading, setLoading] = useState(true);
  const [intelligence, setIntelligence] = useState(null);
  const apiService = new ContentIntelligenceAPIService();

  useEffect(() => {
    if (isOpen && segmentId) {
      fetchIntelligence();
    }
  }, [isOpen, segmentId]);

  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      const result = await apiService.getCustomerIntelligence(segmentId);
      setIntelligence(result.data);
    } catch (error) {
      console.error('Failed to fetch customer intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Customer Intelligence Insights</h2>
              <p className="text-sm text-gray-600">Segment: {segmentId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing customer behavior patterns...</p>
              </div>
            </div>
          ) : intelligence ? (
            <>
              {/* Behavior Patterns */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Behavior Patterns Detected
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {intelligence.insights.behavior_patterns.map((pattern, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-semibold text-gray-900 mb-1">{pattern.pattern}</p>
                      <p className="text-sm text-blue-600 mb-2">{pattern.frequency || `${pattern.percentage}%`}</p>
                      <p className="text-xs text-gray-600 flex items-start gap-1">
                        <Zap className="w-3 h-3 mt-0.5 text-yellow-500" />
                        {pattern.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Churn Risk Alert */}
              {intelligence.insights.churn_risk && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-900 mb-2">Churn Risk Detected</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="bg-white rounded-lg px-4 py-2 border border-red-300">
                            <p className="text-2xl font-bold text-red-600">{intelligence.insights.churn_risk.at_risk_contacts}</p>
                            <p className="text-xs text-gray-600">Contacts at Risk</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1">Risk Factors:</p>
                            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                              {intelligence.insights.churn_risk.risk_factors.map((factor, idx) => (
                                <li key={idx}>{factor}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                          <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                            <Target className="w-4 h-4 text-red-600" />
                            Recommended Action
                          </p>
                          <p className="text-sm text-gray-700 mb-2">{intelligence.insights.churn_risk.recommended_action}</p>
                          <div className="flex items-center gap-2 text-green-700 text-xs bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 w-fit">
                            <ArrowUpRight className="w-3 h-3" />
                            {intelligence.insights.churn_risk.estimated_impact}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upsell Opportunities */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Upsell Opportunities
                </h3>
                <div className="space-y-3">
                  {intelligence.insights.upsell_opportunities.map((opp, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-green-200 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{opp.opportunity}</p>
                        <p className="text-sm text-gray-600 mt-1">{opp.contacts} contacts identified</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${opp.estimated_value.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {Math.round(opp.confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className={`w-5 h-5 ${
                    intelligence.insights.sentiment_analysis.overall_sentiment === 'positive' ? 'text-green-600' :
                    intelligence.insights.sentiment_analysis.overall_sentiment === 'negative' ? 'text-red-600' :
                    'text-yellow-600'
                  }`} />
                  Sentiment Analysis
                </h3>
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Overall Sentiment</span>
                      <span className={`text-sm font-bold ${
                        intelligence.insights.sentiment_analysis.overall_sentiment === 'positive' ? 'text-green-600' :
                        intelligence.insights.sentiment_analysis.overall_sentiment === 'negative' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {intelligence.insights.sentiment_analysis.score}/1.0
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          intelligence.insights.sentiment_analysis.overall_sentiment === 'positive' ? 'bg-green-600' :
                          intelligence.insights.sentiment_analysis.overall_sentiment === 'negative' ? 'bg-red-600' :
                          'bg-yellow-600'
                        }`}
                        style={{ width: `${intelligence.insights.sentiment_analysis.score * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${
                    intelligence.insights.sentiment_analysis.trending === 'up' ? 'bg-green-100 text-green-700' :
                    intelligence.insights.sentiment_analysis.trending === 'down' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    <TrendingUp className={`w-5 h-5 ${intelligence.insights.sentiment_analysis.trending === 'down' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Top Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {intelligence.insights.sentiment_analysis.keywords.map((keyword, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Campaigns */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Recommended Campaign Actions
                </h3>
                <div className="space-y-3">
                  {intelligence.recommended_campaigns.map((campaign, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            campaign.priority === 'high' ? 'bg-red-100 text-red-700' :
                            campaign.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {campaign.priority.toUpperCase()} PRIORITY
                          </span>
                          <span className="text-sm font-semibold text-gray-900">{campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)} Campaign</span>
                        </div>
                        <p className="text-sm text-gray-600">{campaign.description}</p>
                      </div>
                      <button
                        onClick={() => onLaunchCampaign && onLaunchCampaign(campaign)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Launch
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Attribution */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-purple-900 mb-1">Intelligence Source</p>
                    <p className="text-sm text-purple-700">{intelligence.agent_notes}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Failed to load intelligence data</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerIntelligenceModal;

