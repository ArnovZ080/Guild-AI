import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronDown, ChevronUp, AlertTriangle, Clock, Target, Zap } from 'lucide-react';

const PredictivePlannerCard = ({ events, currentDate, isExpanded, onToggle }) => {
  // Analyze upcoming week for predictions
  const analyzeWeek = () => {
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const weekEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= weekLater;
    });

    // Calculate total time commitment
    const totalMinutes = weekEvents.reduce((acc, event) => acc + event.duration, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    
    // Check for overbooked days
    const dayMap = {};
    weekEvents.forEach(event => {
      const dayKey = new Date(event.date).toDateString();
      if (!dayMap[dayKey]) dayMap[dayKey] = 0;
      dayMap[dayKey] += event.duration;
    });
    
    const overbookedDays = Object.entries(dayMap).filter(([_, minutes]) => minutes > 480).length;
    
    // Find potential conflicts
    const conflicts = weekEvents.filter((event, index) => {
      const eventTime = new Date(event.date);
      const eventHour = parseInt(event.time.split(':')[0]);
      eventTime.setHours(eventHour);
      
      return weekEvents.some((other, otherIndex) => {
        if (index === otherIndex) return false;
        const otherTime = new Date(other.date);
        const otherHour = parseInt(other.time.split(':')[0]);
        otherTime.setHours(otherHour);
        
        return eventTime.toDateString() === otherTime.toDateString() &&
               Math.abs(eventHour - otherHour) < 1;
      });
    });

    return {
      totalHours,
      overbookedDays,
      conflicts: conflicts.length,
      weekEvents: weekEvents.length,
      predictions: generatePredictions(totalHours, overbookedDays, conflicts.length)
    };
  };

  const generatePredictions = (hours, overbooked, conflicts) => {
    const predictions = [];
    
    if (hours > 40) {
      predictions.push({
        type: 'warning',
        icon: AlertTriangle,
        message: `${hours}h scheduled — risk of burnout`,
        action: 'Reschedule low-priority items',
        severity: 'high'
      });
    }
    
    if (overbooked > 0) {
      predictions.push({
        type: 'warning',
        icon: Clock,
        message: `${overbooked} ${overbooked === 1 ? 'day' : 'days'} overbooked`,
        action: 'Rebalance workload',
        severity: 'medium'
      });
    }
    
    if (conflicts > 0) {
      predictions.push({
        type: 'error',
        icon: AlertTriangle,
        message: `${conflicts} potential scheduling conflicts`,
        action: 'Review and resolve',
        severity: 'high'
      });
    }
    
    if (predictions.length === 0) {
      predictions.push({
        type: 'success',
        icon: Target,
        message: 'Week is well-balanced',
        action: 'Maintain current pace',
        severity: 'low'
      });
    }
    
    return predictions;
  };

  const analysis = analyzeWeek();

  const getSeverityColor = (severity) => {
    const colors = {
      high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' },
      medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-600' },
      low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' }
    };
    return colors[severity] || colors.low;
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
        className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <h3 className="font-bold">Predictive Planner</h3>
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
              {/* Week Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-700 font-medium">Total Time</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{analysis.totalHours}h</p>
                  <p className="text-xs text-blue-600">this week</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-purple-700 font-medium">Events</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{analysis.weekEvents}</p>
                  <p className="text-xs text-purple-600">scheduled</p>
                </div>
              </div>

              {/* Predictions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-orange-600" />
                  AI Predictions
                </h4>
                <div className="space-y-2">
                  {analysis.predictions.map((prediction, index) => {
                    const Icon = prediction.icon;
                    const colors = getSeverityColor(prediction.severity);
                    
                    return (
                      <motion.div
                        key={index}
                        className={`p-3 border rounded-lg ${colors.bg} ${colors.border}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${colors.text} mb-1`}>
                              {prediction.message}
                            </p>
                            <p className="text-xs text-gray-600">
                              💡 {prediction.action}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Risk Indicators */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Risk Assessment</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Workload</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-4 h-2 rounded ${
                            level <= Math.ceil(analysis.totalHours / 10)
                              ? analysis.totalHours > 40 ? 'bg-red-500' : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Balance</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-4 h-2 rounded ${
                            level <= (5 - analysis.overbookedDays)
                              ? 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all">
                  🎯 Auto-Optimize Schedule
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PredictivePlannerCard;

