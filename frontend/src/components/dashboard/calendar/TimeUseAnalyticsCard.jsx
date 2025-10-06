import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, ChevronDown, ChevronUp, TrendingUp, Info } from 'lucide-react';

const TimeUseAnalyticsCard = ({ data, isExpanded, onToggle }) => {
  const categories = data || {
    deepWork: 35,
    meetings: 30,
    admin: 20,
    personal: 10,
    breaks: 5
  };

  const categoryColors = {
    deepWork: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-100' },
    meetings: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-100' },
    admin: { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100' },
    personal: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100' },
    breaks: { bg: 'bg-pink-500', text: 'text-pink-600', light: 'bg-pink-100' }
  };

  const categoryLabels = {
    deepWork: '🎯 Deep Work',
    meetings: '👥 Meetings',
    admin: '📋 Admin',
    personal: '✨ Personal',
    breaks: '☕ Breaks'
  };

  const categoryAdvice = {
    deepWork: 'Excellent! Deep work time is optimal for productivity.',
    meetings: 'Good balance. Try to batch meetings when possible.',
    admin: 'Consider delegating or automating more admin tasks.',
    personal: 'Make sure to maintain work-life balance.',
    breaks: 'Regular breaks improve focus and well-being.'
  };

  // Get advice for the dominant category
  const getDominantAdvice = () => {
    const maxCategory = Object.keys(categories).reduce((a, b) => 
      categories[a] > categories[b] ? a : b
    );
    
    if (categories.meetings > 40) {
      return "⚠️ Try limiting admin time to 15% for better productivity.";
    }
    if (categories.deepWork < 25) {
      return "💡 Consider blocking more time for focused deep work.";
    }
    if (categories.breaks < 5) {
      return "🌟 Don't forget to schedule regular breaks for optimal performance.";
    }
    
    return categoryAdvice[maxCategory];
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <PieChart className="w-5 h-5" />
          <h3 className="font-bold">Time Use Analytics</h3>
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
            <div className="p-4">
              {/* Visual Donut Chart */}
              <div className="mb-4">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-40 h-40" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="20"
                    />
                    {(() => {
                      let offset = 0;
                      return Object.entries(categories).map(([key, value]) => {
                        const percentage = value;
                        const circumference = 2 * Math.PI * 40;
                        const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -offset;
                        offset += (percentage / 100) * circumference;
                        
                        const color = {
                          deepWork: '#3b82f6',
                          meetings: '#a855f7',
                          admin: '#eab308',
                          personal: '#22c55e',
                          breaks: '#ec4899'
                        }[key];
                        
                        return (
                          <circle
                            key={key}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={color}
                            strokeWidth="20"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 50 50)"
                          />
                        );
                      });
                    })()}
                    <text
                      x="50"
                      y="50"
                      textAnchor="middle"
                      dy=".3em"
                      className="text-xl font-bold fill-gray-700"
                    >
                      This Week
                    </text>
                  </svg>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-2 mb-4">
                {Object.entries(categories).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      <div className={`w-3 h-3 rounded-full ${categoryColors[key].bg}`} />
                      <span className="text-sm font-medium text-gray-700">
                        {categoryLabels[key]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${categoryColors[key].bg}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-10 text-right">
                        {value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Advice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">AI Insight</p>
                    <p className="text-xs text-blue-700">{getDominantAdvice()}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimeUseAnalyticsCard;

