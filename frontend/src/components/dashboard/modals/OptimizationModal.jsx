import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Brain,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const OptimizationModal = ({ isOpen, onClose, currentEvents, onApprove }) => {
  const [optimizations, setOptimizations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedChanges, setSelectedChanges] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      analyzeAndOptimize();
    }
  }, [isOpen]);

  const analyzeAndOptimize = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const suggestions = generateOptimizations(currentEvents);
      setOptimizations(suggestions);
      // Select all by default
      setSelectedChanges(new Set(suggestions.map((_, index) => index)));
      setIsAnalyzing(false);
    }, 2000);
  };

  const generateOptimizations = (events) => {
    const suggestions = [];
    
    // Find overloaded days
    const dayMap = {};
    events.forEach(event => {
      const dayKey = new Date(event.date).toDateString();
      if (!dayMap[dayKey]) dayMap[dayKey] = [];
      dayMap[dayKey].push(event);
    });

    Object.entries(dayMap).forEach(([day, dayEvents]) => {
      const totalMinutes = dayEvents.reduce((acc, e) => acc + e.duration, 0);
      
      if (totalMinutes > 480) { // More than 8 hours
        // Suggest moving lowest priority event
        const lowestPriority = dayEvents.find(e => e.priority === 'low') || dayEvents[dayEvents.length - 1];
        
        suggestions.push({
          type: 'reschedule',
          event: lowestPriority,
          reason: 'Day overloaded (8h+ scheduled)',
          originalDate: new Date(lowestPriority.date),
          suggestedDate: new Date(new Date(lowestPriority.date).getTime() + 24 * 60 * 60 * 1000),
          impact: 'Reduces daily workload by ' + (lowestPriority.duration / 60).toFixed(1) + 'h',
          confidence: 0.85
        });
      }
    });

    // Suggest adding breaks
    if (suggestions.length < 3) {
      suggestions.push({
        type: 'add_break',
        reason: 'No breaks scheduled for high-intensity days',
        suggestedTime: '14:00',
        duration: 15,
        impact: 'Improves focus and reduces burnout risk',
        confidence: 0.92
      });
    }

    // Suggest batching similar meetings
    const meetings = events.filter(e => e.type === 'meeting');
    if (meetings.length >= 3) {
      suggestions.push({
        type: 'batch_meetings',
        events: meetings.slice(0, 2),
        reason: 'Similar meetings can be batched for efficiency',
        impact: 'Saves 30min in context switching',
        confidence: 0.78
      });
    }

    // Suggest moving early/late meetings
    const earlyOrLateMeetings = events.filter(e => {
      const hour = parseInt(e.time.split(':')[0]);
      return hour < 8 || hour > 18;
    });

    if (earlyOrLateMeetings.length > 0) {
      earlyOrLateMeetings.forEach(event => {
        const hour = parseInt(event.time.split(':')[0]);
        suggestions.push({
          type: 'adjust_timing',
          event: event,
          reason: hour < 8 ? 'Too early - outside optimal work hours' : 'Too late - outside optimal work hours',
          originalTime: event.time,
          suggestedTime: hour < 8 ? '09:00' : '16:00',
          impact: 'Improves work-life balance',
          confidence: 0.88
        });
      });
    }

    return suggestions;
  };

  const toggleSelection = (index) => {
    const newSelected = new Set(selectedChanges);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedChanges(newSelected);
  };

  const handleApprove = () => {
    // Apply selected optimizations
    const selectedOptimizations = optimizations.filter((_, index) => selectedChanges.has(index));
    
    // Here you would apply the actual changes to events
    console.log('Applying optimizations:', selectedOptimizations);
    
    onApprove(currentEvents); // For now, just pass back current events
  };

  const getTypeIcon = (type) => {
    const icons = {
      reschedule: Clock,
      add_break: CheckCircle,
      batch_meetings: TrendingUp,
      adjust_timing: AlertTriangle
    };
    return icons[type] || Brain;
  };

  const getTypeColor = (type) => {
    const colors = {
      reschedule: 'bg-blue-50 border-blue-200 text-blue-700',
      add_break: 'bg-green-50 border-green-200 text-green-700',
      batch_meetings: 'bg-purple-50 border-purple-200 text-purple-700',
      adjust_timing: 'bg-yellow-50 border-yellow-200 text-yellow-700'
    };
    return colors[type] || 'bg-gray-50 border-gray-200 text-gray-700';
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">AI Week Optimization</h2>
                <p className="text-purple-100 text-sm">Smart suggestions to improve your schedule</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isAnalyzing ? (
            /* Analyzing State */
            <div className="text-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <Brain className="w-16 h-16 text-purple-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Schedule...</h3>
              <p className="text-gray-600">
                Our AI is reviewing your events, workload, and well-being indicators
              </p>
              <div className="mt-6 flex justify-center space-x-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-purple-600 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Results State */
            <>
              {/* Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Analysis Complete</h3>
                    <p className="text-sm text-gray-700">
                      Found {optimizations.length} optimization{optimizations.length !== 1 ? 's' : ''} to improve your week.
                      Average confidence: {(optimizations.reduce((acc, o) => acc + o.confidence, 0) / optimizations.length * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Optimizations List */}
              <div className="space-y-4 mb-6">
                {optimizations.map((optimization, index) => {
                  const Icon = getTypeIcon(optimization.type);
                  const isSelected = selectedChanges.has(index);
                  
                  return (
                    <motion.div
                      key={index}
                      className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      }`}
                      onClick={() => toggleSelection(index)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-purple-500 border-purple-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>

                        {/* Icon */}
                        <div className={`p-2 rounded-lg ${getTypeColor(optimization.type)}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {optimization.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </h4>
                              <p className="text-sm text-gray-600">{optimization.reason}</p>
                            </div>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                              {(optimization.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>

                          {/* Change Details */}
                          {optimization.event && (
                            <div className="flex items-center space-x-2 text-sm mb-2">
                              <span className="font-medium text-gray-700">{optimization.event.title}</span>
                              {optimization.suggestedDate && (
                                <>
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">
                                    {optimization.suggestedDate.toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                </>
                              )}
                              {optimization.suggestedTime && (
                                <>
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{optimization.suggestedTime}</span>
                                </>
                              )}
                            </div>
                          )}

                          {/* Impact */}
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded">
                              💡 {optimization.impact}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {selectedChanges.size} of {optimizations.length} optimizations selected
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={selectedChanges.size === 0}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply {selectedChanges.size} Change{selectedChanges.size !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OptimizationModal;

