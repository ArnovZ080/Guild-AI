import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Check, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

const ScheduleOptimizationRecommendationsModal = ({ isOpen, onClose, currentSchedule, onImplement }) => {
  const [rememberChoices, setRememberChoices] = useState(true);
  const [selectedOptimizations, setSelectedOptimizations] = useState(new Set([0, 1, 2])); // Select all by default

  const recommendations = [
    {
      id: 0,
      title: 'Batch Similar Meetings',
      description: 'Group all client meetings on Tuesday and Thursday afternoons',
      impact: 'Saves 45min in context switching per week',
      confidence: 0.92,
      type: 'efficiency'
    },
    {
      id: 1,
      title: 'Move Deep Work to Mornings',
      description: 'Schedule focused work between 8-11am when productivity is highest',
      impact: 'Increases productivity by 23%',
      confidence: 0.88,
      type: 'productivity'
    },
    {
      id: 2,
      title: 'Add Buffer Time',
      description: 'Insert 15-minute buffers between back-to-back meetings',
      impact: 'Reduces stress and prevents overruns',
      confidence: 0.95,
      type: 'wellbeing'
    },
    {
      id: 3,
      title: 'Protect Friday Afternoons',
      description: 'Block Friday 2-5pm for strategic planning and wrap-up',
      impact: 'Better week closure and planning',
      confidence: 0.85,
      type: 'strategic'
    },
    {
      id: 4,
      title: 'Limit Daily Meetings',
      description: 'Cap meetings at 4 per day, reschedule overflow',
      impact: 'Maintains energy and focus throughout the day',
      confidence: 0.90,
      type: 'balance'
    }
  ];

  const toggleOptimization = (id) => {
    const newSelected = new Set(selectedOptimizations);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedOptimizations(newSelected);
  };

  const handleImplement = () => {
    const selected = recommendations.filter(r => selectedOptimizations.has(r.id));
    onImplement(selected, rememberChoices);
    onClose();
  };

  const getTypeColor = (type) => {
    const colors = {
      efficiency: 'bg-blue-100 text-blue-700 border-blue-300',
      productivity: 'bg-purple-100 text-purple-700 border-purple-300',
      wellbeing: 'bg-green-100 text-green-700 border-green-300',
      strategic: 'bg-orange-100 text-orange-700 border-orange-300',
      balance: 'bg-pink-100 text-pink-700 border-pink-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
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
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Optimization Recommendations</h2>
                <p className="text-indigo-100 text-sm">AI-powered suggestions to improve your schedule</p>
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
          {/* Info Banner */}
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-bold text-purple-900 mb-1">Smart Schedule Analysis</h4>
                <p className="text-sm text-purple-700">
                  Our AI analyzed your calendar patterns, productivity data, and work preferences to generate 
                  these personalized recommendations. Select which ones to apply.
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-6 space-y-4">
            {recommendations.map((rec) => {
              const isSelected = selectedOptimizations.has(rec.id);
              
              return (
                <div
                  key={rec.id}
                  onClick={() => toggleOptimization(rec.id)}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <div className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg mb-1">{rec.title}</h4>
                          <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                        </div>
                        <span className={`ml-4 px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(rec.type)} capitalize`}>
                          {rec.type}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-700">{rec.impact}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <span className="text-gray-600">Confidence:</span>
                          <span className="font-bold text-purple-700">{(rec.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Remember Preferences */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Remember My Optimization Preferences</h4>
                <p className="text-sm text-blue-700">
                  Apply these optimization patterns automatically to future schedules
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRememberChoices(!rememberChoices);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  rememberChoices ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    rememberChoices ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedOptimizations.size} of {recommendations.length} optimizations selected
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImplement}
                disabled={selectedOptimizations.size === 0}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Implement Selected</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScheduleOptimizationRecommendationsModal;

