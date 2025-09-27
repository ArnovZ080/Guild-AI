import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, MapPin } from 'lucide-react';

const ScheduleContentModal = ({ content, onClose, onSchedule }) => {
  const [formData, setFormData] = useState({
    scheduled_date: content?.scheduled_date ? new Date(content.scheduled_date).toISOString().slice(0, 16) : '',
    scheduled_timezone: content?.scheduled_timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    status: content?.status || 'scheduled'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.scheduled_date) {
      alert('Please select a date and time');
      return;
    }

    const updatedContent = {
      ...content,
      scheduled_date: formData.scheduled_date,
      scheduled_timezone: formData.scheduled_timezone,
      status: formData.status
    };

    onSchedule(updatedContent);
  };

  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Schedule Content</h2>
              <p className="text-sm text-gray-600">Set when this content should be published</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">
              {content.platform === 'instagram' && '📸'}
              {content.platform === 'linkedin' && '💼'}
              {content.platform === 'twitter' && '🐦'}
              {content.platform === 'facebook' && '📘'}
              {content.platform === 'tiktok' && '🎵'}
              {content.platform === 'youtube' && '📺'}
              {content.platform === 'email' && '📧'}
              {content.platform === 'blog' && '📝'}
            </span>
            <span className="font-medium capitalize">{content.platform}</span>
            <span className="text-sm text-gray-500 capitalize">{content.content_type}</span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">
            {content.content_preview}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Timezone
            </label>
            <select
              value={formData.scheduled_timezone}
              onChange={(e) => setFormData({ ...formData, scheduled_timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Berlin">Berlin (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Australia/Sydney">Sydney (AEST)</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Preview */}
          {formData.scheduled_date && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Will be published:</strong> {new Date(formData.scheduled_date).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZone: formData.scheduled_timezone
                })} ({formData.scheduled_timezone})
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ScheduleContentModal;
