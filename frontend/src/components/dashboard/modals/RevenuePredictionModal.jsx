import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, TrendingUp, DollarSign, Target, AlertCircle, 
  CheckCircle, Info, Sparkles, BarChart3, Calendar,
  Users, Zap, ArrowRight
} from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const RevenuePredictionModal = ({ isOpen, onClose, campaignData }) => {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const apiService = new ContentIntelligenceAPIService();

  useEffect(() => {
    if (isOpen && campaignData) {
      fetchPrediction();
    }
  }, [isOpen, campaignData]);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const result = await apiService.predictRevenue(campaignData);
      setPrediction(result.data);
    } catch (error) {
      console.error('Failed to fetch revenue prediction:', error);
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
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Sticky Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Predictive Revenue Forecasting</h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Powered by Financial Intelligence Agent
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing historical data and market trends...</p>
              </div>
            </div>
          ) : prediction ? (
            <>
              {/* Main Prediction Card */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Predicted Revenue</p>
                    <p className="text-4xl font-bold mt-1">${prediction.predicted_revenue.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm">Confidence Level</p>
                    <p className="text-2xl font-bold">{Math.round(prediction.confidence_level * 100)}%</p>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-3 mt-4">
                  <p className="text-sm text-green-50 mb-2">Confidence Interval</p>
                  <div className="flex items-center justify-between text-white font-semibold">
                    <span>${prediction.confidence_interval.low.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                    <span>${prediction.confidence_interval.high.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Impact Factors */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Key Impact Factors
                </h3>
                <div className="space-y-3">
                  {prediction.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-lg ${factor.impact.startsWith('+') ? 'bg-green-100' : 'bg-red-100'}`}>
                        {factor.impact.startsWith('+') ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900">{factor.factor}</p>
                          <span className={`text-sm font-bold ${factor.impact.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {factor.impact}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-start gap-1">
                          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{factor.why}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Segment Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Revenue by Segment
                </h3>
                <div className="space-y-3">
                  {prediction.breakdown_by_segment.map((seg, idx) => (
                    <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{seg.segment}</span>
                        <span className="text-lg font-bold text-purple-600">${seg.expected_revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-purple-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${seg.probability * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{Math.round(seg.probability * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimization Suggestions */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Optimization Opportunities
                </h3>
                <div className="space-y-2">
                  {prediction.optimization_suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Attribution */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">How This Prediction Was Generated</p>
                    <p className="text-sm text-blue-700">{prediction.agent_notes}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Failed to load prediction</p>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Target className="w-4 h-4" />
            Predictions update as campaign data changes
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RevenuePredictionModal;

