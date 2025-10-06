import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

const AIInsightsCard = ({ insights, isExpanded, onToggle, onShowOptimizations }) => {
  const defaultInsights = {
    weekLoad: 72,
    productivityTrend: 'up',
    suggestions: [
      'Your week is 72% full — optimal.',
      "You've worked 10 consecutive days — schedule downtime.",
      'Wednesdays are most productive; suggest moving strategy sessions here.'
    ]
  };

  const data = insights || defaultInsights;

  const getLoadStatus = (load) => {
    if (load < 50) return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', status: 'Light', message: 'You have plenty of free time' };
    if (load < 75) return { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100', status: 'Optimal', message: 'Well-balanced schedule' };
    return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', status: 'Heavy', message: 'Consider reducing commitments' };
  };

  const loadStatus = getLoadStatus(data.weekLoad);
  const LoadIcon = loadStatus.icon;

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <h3 className="font-bold">AI Insights</h3>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Week Load Status */}
              <div className={`${loadStatus.bg} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <LoadIcon className={`w-5 h-5 ${loadStatus.color}`} />
                    <span className="font-bold text-gray-900">Week Load</span>
                  </div>
                  <span className={`text-2xl font-bold ${loadStatus.color}`}>
                    {data.weekLoad}%
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${loadStatus.color.replace('text-', 'bg-')}`}
                    style={{ width: `${data.weekLoad}%` }}
                  />
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{loadStatus.status}</span> — {loadStatus.message}
                </p>
              </div>

              {/* Productivity Trend */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Productivity Trend</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  data.productivityTrend === 'up' ? 'text-green-600' : 
                  data.productivityTrend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {data.productivityTrend === 'up' && <TrendingUp className="w-4 h-4" />}
                  <span className="text-sm font-bold capitalize">{data.productivityTrend}</span>
                </div>
              </div>

              {/* AI Suggestions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-purple-600" />
                  Smart Recommendations
                </h4>
                <div className="space-y-2">
                  {data.suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-2 p-3 bg-purple-50 border border-purple-200 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-purple-600 font-bold text-sm mt-0.5">💡</span>
                      <p className="text-sm text-gray-700 flex-1">{suggestion}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Full Report functionality will be added here
                    }}
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                  >
                    📊 Full Report
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onShowOptimizations) onShowOptimizations();
                    }}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    🎯 Optimize
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIInsightsCard;

