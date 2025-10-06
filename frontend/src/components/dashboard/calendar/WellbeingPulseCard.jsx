import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronDown, ChevronUp, Activity, Coffee, Moon, Smile } from 'lucide-react';

const WellbeingPulseCard = ({ data, isExpanded, onToggle, onScheduleBreak, onToggleFocusMode }) => {
  const defaultData = {
    moodScore: 7.5,
    workloadBalance: 'good',
    suggestions: ['Schedule a 15-minute walk', 'Consider a no-meeting Friday']
  };

  const wellbeing = data || defaultData;

  const getMoodEmoji = (score) => {
    if (score >= 8) return { emoji: '😊', label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 6) return { emoji: '🙂', label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 4) return { emoji: '😐', label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { emoji: '😔', label: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getWorkloadColor = (balance) => {
    const colors = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500',
      moderate: 'bg-yellow-500',
      heavy: 'bg-orange-500',
      overloaded: 'bg-red-500'
    };
    return colors[balance] || 'bg-gray-500';
  };

  const mood = getMoodEmoji(wellbeing.moodScore);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5" />
          <h3 className="font-bold">Well-being Pulse</h3>
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
              {/* Mood Score */}
              <div className={`${mood.bg} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Smile className={`w-5 h-5 ${mood.color}`} />
                      <span className="font-bold text-gray-900">Current Mood</span>
                    </div>
                    <p className={`text-sm ${mood.color} font-medium`}>{mood.label}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-1">{mood.emoji}</div>
                    <div className={`text-2xl font-bold ${mood.color}`}>
                      {wellbeing.moodScore}/10
                    </div>
                  </div>
                </div>
                
                {/* Mood Trend (simplified visualization) */}
                <div className="flex items-end space-x-1 h-12">
                  {[6.5, 7.0, 6.8, 7.2, 7.5].map((score, index) => (
                    <div
                      key={index}
                      className={`flex-1 ${mood.color.replace('text-', 'bg-')} rounded-t opacity-${index === 4 ? '100' : '70'}`}
                      style={{ height: `${(score / 10) * 100}%` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">7-day trend</p>
              </div>

              {/* Workload Balance */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-gray-700" />
                    <span className="font-semibold text-gray-900">Workload Balance</span>
                  </div>
                  <span className="text-sm font-bold text-gray-700 capitalize">
                    {wellbeing.workloadBalance}
                  </span>
                </div>
                
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {['excellent', 'good', 'moderate', 'heavy', 'overloaded'].map((level, index) => (
                    <div
                      key={level}
                      className={`h-2 rounded ${
                        level === wellbeing.workloadBalance 
                          ? getWorkloadColor(level) 
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Light</span>
                  <span>Heavy</span>
                </div>
              </div>

              {/* Wellness Suggestions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-pink-600" />
                  Wellness Tips
                </h4>
                <div className="space-y-2">
                  {wellbeing.suggestions.map((suggestion, index) => {
                    const icons = [Coffee, Moon, Activity];
                    const Icon = icons[index % icons.length];
                    
                    return (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-pink-50 border border-pink-200 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Icon className="w-4 h-4 text-pink-600 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{suggestion}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onScheduleBreak) onScheduleBreak();
                    }}
                    className="px-3 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium hover:bg-pink-200 transition-colors"
                  >
                    🧘 Schedule Break
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleFocusMode) onToggleFocusMode();
                    }}
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                  >
                    😌 Focus Mode
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

export default WellbeingPulseCard;

