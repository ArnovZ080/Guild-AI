import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, X } from 'lucide-react';

const PerformanceAnalyticsModal = ({ calendar, onClose }) => {
  const analytics = {
    totalContent: calendar.length,
    publishedContent: calendar.filter(item => item.status === 'published').length,
    scheduledContent: calendar.filter(item => item.status === 'scheduled').length,
    draftContent: calendar.filter(item => item.status === 'draft').length,
    aiGenerated: calendar.filter(item => item.ai_generated).length,
    platformDistribution: calculatePlatformDistribution(calendar),
    themeDistribution: calculateThemeDistribution(calendar),
    weeklyDistribution: calculateWeeklyDistribution(calendar),
    engagementEstimates: calculateEngagementEstimates(calendar)
  };

  function calculatePlatformDistribution(calendar) {
    const distribution = {};
    calendar.forEach(item => {
      distribution[item.platform] = (distribution[item.platform] || 0) + 1;
    });
    return distribution;
  }

  function calculateThemeDistribution(calendar) {
    const distribution = {};
    calendar.forEach(item => {
      if (item.theme) distribution[item.theme] = (distribution[item.theme] || 0) + 1;
    });
    return distribution;
  }

  function calculateWeeklyDistribution(calendar) {
    const distribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    calendar.forEach(item => {
      const dayOfWeek = new Date(item.scheduled_date).getDay();
      distribution[dayOfWeek]++;
    });
    return distribution;
  }

  function calculateEngagementEstimates(calendar) {
    const estimates = calendar.filter(item => item.engagement_estimate).map(item => item.engagement_estimate);
    if (estimates.length === 0) return { average: 0, total: 0, max: 0, min: 0 };
    return {
      average: Math.round(estimates.reduce((sum, est) => sum + est, 0) / estimates.length),
      total: estimates.reduce((sum, est) => sum + est, 0),
      max: Math.max(...estimates),
      min: Math.min(...estimates)
    };
  }

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 text-blue-500 mr-3" />
              Content Performance Analytics
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg"><div className="text-2xl font-bold text-blue-600">{analytics.totalContent}</div><div className="text-sm text-blue-700">Total Content</div></div>
              <div className="bg-green-50 p-4 rounded-lg"><div className="text-2xl font-bold text-green-600">{analytics.publishedContent}</div><div className="text-sm text-green-700">Published</div></div>
              <div className="bg-yellow-50 p-4 rounded-lg"><div className="text-2xl font-bold text-yellow-600">{analytics.scheduledContent}</div><div className="text-sm text-yellow-700">Scheduled</div></div>
              <div className="bg-purple-50 p-4 rounded-lg"><div className="text-2xl font-bold text-purple-600">{analytics.aiGenerated}</div><div className="text-sm text-purple-700">AI Generated</div></div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Platform Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.platformDistribution).map(([platform, count]) => (
                  <div key={platform} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{platform}</div>
                    <div className="text-xs text-gray-500">{Math.round((count / analytics.totalContent) * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Content Theme Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(analytics.themeDistribution).map(([theme, count]) => (
                  <div key={theme} className="text-center">
                    <div className="text-xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{theme.replace('_', ' ')}</div>
                    <div className="text-xs text-gray-500">{Math.round((count / analytics.totalContent) * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Weekly Content Distribution</h3>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-lg font-bold text-gray-900">{analytics.weeklyDistribution[index]}</div>
                    <div className="text-xs text-gray-600">{day.slice(0, 3)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Engagement Estimates</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center"><div className="text-2xl font-bold text-green-600">{analytics.engagementEstimates.average}</div><div className="text-sm text-gray-600">Average</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-blue-600">{analytics.engagementEstimates.total}</div><div className="text-sm text-gray-600">Total</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-purple-600">{analytics.engagementEstimates.max}</div><div className="text-sm text-gray-600">Max</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-orange-600">{analytics.engagementEstimates.min}</div><div className="text-sm text-gray-600">Min</div></div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceAnalyticsModal;
