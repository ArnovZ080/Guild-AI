import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Coffee, Calendar, Clock, Bell, Volume2 } from 'lucide-react';

const ScheduleBreakModal = ({ isOpen, onClose, onScheduleBreak, selectedDate }) => {
  const [breakData, setBreakData] = useState({
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: 15,
    type: 'short',
    notification: true,
    sound: true
  });

  const breakTypes = [
    { id: 'short', name: 'Short Break', duration: 15, icon: '☕', description: '15 minutes - Quick refresh' },
    { id: 'medium', name: 'Coffee Break', duration: 30, icon: '🍵', description: '30 minutes - Recharge' },
    { id: 'lunch', name: 'Lunch Break', duration: 60, icon: '🍱', description: '60 minutes - Meal time' },
    { id: 'walk', name: 'Walking Break', duration: 20, icon: '🚶', description: '20 minutes - Get moving' }
  ];

  const handleSubmit = () => {
    const breakEvent = {
      title: `${breakTypes.find(t => t.id === breakData.type)?.name || 'Break'}`,
      type: 'personal',
      date: new Date(breakData.date),
      time: breakData.time,
      duration: breakData.duration,
      description: 'Scheduled break for rest and recovery',
      priority: 'medium',
      notification: breakData.notification,
      sound: breakData.sound,
      isBreak: true
    };

    onScheduleBreak(breakEvent);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Coffee className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Schedule a Break</h2>
                <p className="text-pink-100 text-sm">Take time to recharge and refocus</p>
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
          {/* Break Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Break Type</label>
            <div className="grid grid-cols-2 gap-3">
              {breakTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setBreakData({ ...breakData, type: type.id, duration: type.duration })}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    breakData.type === type.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="font-semibold text-gray-900 mb-1">{type.name}</div>
                  <div className="text-xs text-gray-600">{type.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={breakData.date}
                onChange={(e) => setBreakData({ ...breakData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time
              </label>
              <input
                type="time"
                value={breakData.time}
                onChange={(e) => setBreakData({ ...breakData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={breakData.duration}
              onChange={(e) => setBreakData({ ...breakData, duration: parseInt(e.target.value) })}
              min="5"
              max="120"
              step="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Notification Options */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Push Notification</span>
              </div>
              <button
                onClick={() => setBreakData({ ...breakData, notification: !breakData.notification })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  breakData.notification ? 'bg-pink-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    breakData.notification ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Sound Alert</span>
              </div>
              <button
                onClick={() => setBreakData({ ...breakData, sound: !breakData.sound })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  breakData.sound ? 'bg-pink-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    breakData.sound ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> Regular breaks improve focus and prevent burnout. 
              {breakData.notification && ' You\'ll receive a notification when it\'s time to take your break.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium shadow-md"
            >
              Schedule Break
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScheduleBreakModal;

