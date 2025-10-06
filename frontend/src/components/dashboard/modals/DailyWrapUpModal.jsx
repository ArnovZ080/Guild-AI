import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Moon, Star, TrendingUp, Calendar } from 'lucide-react';

const DailyWrapUpModal = ({ isOpen, onClose, dailyData, onSaveReflection }) => {
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState(null);

  const data = dailyData || {
    date: new Date().toLocaleDateString(),
    completedEvents: 8,
    totalEvents: 10,
    focusTime: '3h 45m',
    topWins: [
      'Finished Q4 presentation',
      'Client call went great',
      'Cleared inbox'
    ],
    tomorrow: [
      'Team standup at 9am',
      'Budget review at 2pm',
      'Prepare for Friday presentation'
    ]
  };

  const moods = [
    { emoji: '😊', label: 'Great', value: 5 },
    { emoji: '🙂', label: 'Good', value: 4 },
    { emoji: '😐', label: 'Okay', value: 3 },
    { emoji: '😔', label: 'Tough', value: 2 },
    { emoji: '😫', label: 'Difficult', value: 1 }
  ];

  const handleSave = () => {
    if (onSaveReflection) {
      onSaveReflection({ reflection, mood, date: new Date() });
    }
    onClose();
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Moon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Daily Wrap-Up</h2>
                <p className="text-purple-100 text-sm">{data.date}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Progress */}
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Today's Progress</span>
              <span className="text-green-700 font-bold">{data.completedEvents}/{data.totalEvents} Events</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${(data.completedEvents / data.totalEvents) * 100}%` }}
              />
            </div>
          </div>

          {/* Wins */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-600" />
              Today's Wins
            </h3>
            <div className="space-y-2">
              {data.topWins.map((win, index) => (
                <div key={index} className="flex items-start space-x-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900">{win}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tomorrow Preview */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Tomorrow's Preview
            </h3>
            <div className="space-y-2">
              {data.tomorrow.map((item, index) => (
                <div key={index} className="flex items-start space-x-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-blue-600">→</span>
                  <span className="text-sm text-gray-900">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mood Check */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">How was your day?</h3>
            <div className="flex items-center justify-around bg-gray-50 border border-gray-200 rounded-xl p-4">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all ${
                    mood === m.value
                      ? 'bg-white shadow-lg scale-110'
                      : 'hover:bg-white/50'
                  }`}
                >
                  <span className="text-4xl">{m.emoji}</span>
                  <span className="text-xs text-gray-600">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reflection */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Daily Reflection (Optional)</h3>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="What did you learn today? What could be better tomorrow?"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button onClick={onClose} className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium">
              Skip
            </button>
            <button onClick={handleSave} className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium shadow-md">
              Save & Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  ) : null;
};

export default DailyWrapUpModal;

