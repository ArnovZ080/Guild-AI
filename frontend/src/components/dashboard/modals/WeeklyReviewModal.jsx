import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Calendar, Clock, Target, Heart, Star, Download } from 'lucide-react';

const WeeklyReviewModal = ({ isOpen, onClose, weekData }) => {
  const data = weekData || {
    totalEvents: 42,
    totalHours: 35,
    focusHours: 12,
    meetingHours: 18,
    personalHours: 5,
    efficiencyScore: 0.82,
    topAchievements: [
      'Completed Q4 financial review',
      'Launched new marketing campaign',
      'Onboarded 3 new clients'
    ],
    improvements: [
      'Reduce back-to-back meetings',
      'Schedule more deep work time',
      'Add regular breaks'
    ],
    nextWeekGoals: []
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Weekly Review</h2>
              <p className="text-indigo-100 text-sm">Your week at a glance</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-700">{data.totalEvents}</div>
              <div className="text-xs text-gray-600">Events</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-700">{data.totalHours}h</div>
              <div className="text-xs text-gray-600">Total Time</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-700">{data.focusHours}h</div>
              <div className="text-xs text-gray-600">Focus Time</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
              <Heart className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-orange-700">{(data.efficiencyScore * 100).toFixed(0)}%</div>
              <div className="text-xs text-gray-600">Efficiency</div>
            </div>
          </div>

          {/* Achievements */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-600" />
              Top Achievements
            </h3>
            <div className="space-y-2">
              {data.topAchievements.map((achievement, index) => (
                <div key={index} className="flex items-start space-x-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-sm text-gray-900">{achievement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Areas for Improvement
            </h3>
            <div className="space-y-2">
              {data.improvements.map((improvement, index) => (
                <div key={index} className="flex items-start space-x-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-blue-600">→</span>
                  <span className="text-sm text-gray-900">{improvement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <button onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium">
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  ) : null;
};

export default WeeklyReviewModal;

