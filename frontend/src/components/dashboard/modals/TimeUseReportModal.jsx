import React from 'react';
import { motion } from 'framer-motion';
import { X, PieChart, TrendingUp, Clock, Download, Share2 } from 'lucide-react';

const TimeUseReportModal = ({ isOpen, onClose, timeUseData }) => {
  const data = timeUseData || {
    deepWork: 35,
    meetings: 30,
    admin: 20,
    personal: 10,
    breaks: 5
  };

  const categoryDetails = {
    deepWork: { label: 'Deep Work', color: '#3b82f6', icon: '🎯', total: data.deepWork },
    meetings: { label: 'Meetings', color: '#a855f7', icon: '👥', total: data.meetings },
    admin: { label: 'Admin Tasks', color: '#eab308', icon: '📋', total: data.admin },
    personal: { label: 'Personal Time', color: '#22c55e', icon: '✨', total: data.personal },
    breaks: { label: 'Breaks', color: '#ec4899', icon: '☕', total: data.breaks }
  };

  const insights = [
    {
      type: 'positive',
      title: 'Excellent Deep Work Time',
      description: `You're spending ${data.deepWork}% of your time in focused deep work, which is optimal for productivity.`,
      recommendation: 'Keep this up! Try to protect these time blocks.'
    },
    {
      type: 'warning',
      title: 'Meeting Load',
      description: `Meetings take up ${data.meetings}% of your week.`,
      recommendation: data.meetings > 35 ? 'Consider declining or delegating some meetings.' : 'Good balance of collaborative time.'
    },
    {
      type: 'neutral',
      title: 'Break Time',
      description: `You're taking ${data.breaks}% break time.`,
      recommendation: data.breaks < 10 ? 'Try scheduling more breaks to prevent burnout.' : 'Great job maintaining work-life balance!'
    }
  ];

  const handleDownload = () => {
    const report = `
TIME USE REPORT
Generated: ${new Date().toLocaleString()}

=== SUMMARY ===
Deep Work: ${data.deepWork}%
Meetings: ${data.meetings}%
Admin Tasks: ${data.admin}%
Personal Time: ${data.personal}%
Breaks: ${data.breaks}%

=== INSIGHTS ===
${insights.map(i => `
${i.title}
${i.description}
Recommendation: ${i.recommendation}
`).join('\n')}

=== RECOMMENDATIONS ===
1. Maintain current deep work allocation
2. ${data.meetings > 35 ? 'Reduce meeting time by 5-10%' : 'Meeting time is well balanced'}
3. ${data.breaks < 10 ? 'Schedule more regular breaks' : 'Continue taking regular breaks'}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-use-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PieChart className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Time Use Report</h2>
                <p className="text-purple-100 text-sm">Detailed analysis of your time allocation</p>
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
          {/* Overview */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {Object.entries(categoryDetails).map(([key, details]) => (
              <div key={key} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{details.icon}</div>
                <div className="text-2xl font-bold" style={{ color: details.color }}>
                  {details.total}%
                </div>
                <div className="text-xs text-gray-600 mt-1">{details.label}</div>
              </div>
            ))}
          </div>

          {/* Detailed Breakdown */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Time Allocation Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(categoryDetails).map(([key, details]) => (
                <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{details.icon}</span>
                      <span className="font-semibold text-gray-900">{details.label}</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: details.color }}>
                      {details.total}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${details.total}%`,
                        backgroundColor: details.color
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {key === 'deepWork' && 'Focused, uninterrupted work time'}
                    {key === 'meetings' && 'Team collaboration and client meetings'}
                    {key === 'admin' && 'Email, planning, and administrative tasks'}
                    {key === 'personal' && 'Personal activities and commitments'}
                    {key === 'breaks' && 'Rest periods and recovery time'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              AI-Generated Insights
            </h3>
            <div className="space-y-3">
              {insights.map((insight, index) => {
                const bgColors = {
                  positive: 'bg-green-50 border-green-200',
                  warning: 'bg-yellow-50 border-yellow-200',
                  neutral: 'bg-blue-50 border-blue-200'
                };
                const textColors = {
                  positive: 'text-green-900',
                  warning: 'text-yellow-900',
                  neutral: 'text-blue-900'
                };

                return (
                  <div key={index} className={`border rounded-lg p-4 ${bgColors[insight.type]}`}>
                    <h4 className={`font-semibold mb-2 ${textColors[insight.type]}`}>
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                    <p className="text-sm font-medium text-gray-900">
                      💡 {insight.recommendation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-3">
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TimeUseReportModal;

