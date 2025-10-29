import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Calendar, Clock, Check, Plus, Trash2, Brain } from 'lucide-react';

const PrepareReportsModal = ({ isOpen, onClose, onGenerateReports, onScheduleRecurring }) => {
  const [selectedReports, setSelectedReports] = useState({
    business: false,
    financial: false,
    customer: false,
    content: false,
    analytics: false
  });

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringSchedule, setRecurringSchedule] = useState({
    frequency: 'weekly',
    day: 'monday',
    time: '09:00',
    reports: []
  });

  const reportOptions = [
    {
      id: 'business',
      name: 'Business Intelligence Report',
      icon: '📊',
      description: 'Strategic insights, KPIs, and business performance metrics',
      agent: 'Business Intelligence Agent'
    },
    {
      id: 'financial',
      name: 'Financial Report',
      icon: '💰',
      description: 'Revenue, expenses, cash flow, and financial projections',
      agent: 'Financial Intelligence Agent'
    },
    {
      id: 'customer',
      name: 'Customer Intelligence Report',
      icon: '👥',
      description: 'Customer behavior, engagement, churn risk, and opportunities',
      agent: 'Customer Intelligence Agent'
    },
    {
      id: 'content',
      name: 'Content Performance Report',
      icon: '✍️',
      description: 'Content analytics, engagement rates, and content strategy insights',
      agent: 'Content Intelligence Agent'
    },
    {
      id: 'analytics',
      name: 'Analytics Overview',
      icon: '📈',
      description: 'Comprehensive analytics across all business areas',
      agent: 'Analytics Agent'
    }
  ];

  const toggleReport = (reportId) => {
    setSelectedReports(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  const handleGenerateNow = () => {
    const selected = Object.keys(selectedReports).filter(key => selectedReports[key]);
    if (selected.length === 0) {
      alert('Please select at least one report type');
      return;
    }
    onGenerateReports(selected);
    onClose();
  };

  const handleScheduleRecurring = () => {
    const selected = Object.keys(selectedReports).filter(key => selectedReports[key]);
    if (selected.length === 0) {
      alert('Please select at least one report type');
      return;
    }

    const scheduleData = {
      ...recurringSchedule,
      reports: selected,
      reportNames: selected.map(id => reportOptions.find(r => r.id === id)?.name)
    };

    onScheduleRecurring(scheduleData);
    onClose();
  };

  const selectedCount = Object.values(selectedReports).filter(Boolean).length;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Prepare Reports</h2>
                <p className="text-blue-100 text-sm">Select reports to generate or schedule</p>
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
          {/* Report Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Select Reports ({selectedCount} selected)
            </h3>
            <div className="space-y-3">
              {reportOptions.map((report) => (
                <div
                  key={report.id}
                  onClick={() => toggleReport(report.id)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedReports[report.id]
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedReports[report.id]
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedReports[report.id] && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-2xl">{report.icon}</span>
                        <h4 className="font-semibold text-gray-900">{report.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                      <div className="flex items-center space-x-2">
                        <Brain className="w-3 h-3 text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">{report.agent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recurring Schedule Toggle */}
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900">Schedule Recurring Reports</span>
              </div>
              <button
                onClick={() => setIsRecurring(!isRecurring)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isRecurring ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isRecurring ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {isRecurring && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <select
                      value={recurringSchedule.frequency}
                      onChange={(e) => setRecurringSchedule({ ...recurringSchedule, frequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {recurringSchedule.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                      <select
                        value={recurringSchedule.day}
                        onChange={(e) => setRecurringSchedule({ ...recurringSchedule, day: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={recurringSchedule.time}
                      onChange={(e) => setRecurringSchedule({ ...recurringSchedule, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
                  <p className="text-sm text-purple-900">
                    <strong>📅 Schedule:</strong> Reports will be generated {recurringSchedule.frequency}
                    {recurringSchedule.frequency === 'weekly' && ` on ${recurringSchedule.day}s`} at {recurringSchedule.time}
                    {' '}and appear in your calendar.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            {isRecurring ? (
              <button
                onClick={handleScheduleRecurring}
                disabled={selectedCount === 0}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Recurring</span>
              </button>
            ) : (
              <button
                onClick={handleGenerateNow}
                disabled={selectedCount === 0}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Now</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PrepareReportsModal;

