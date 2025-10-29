import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, X } from 'lucide-react';

const EditContentModal = ({ content, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    platform: content?.platform || '',
    content_type: content?.content_type || '',
    theme: content?.theme || '',
    content_preview: content?.content_preview || '',
    scheduled_date: content?.scheduled_date ? new Date(content.scheduled_date).toISOString().slice(0, 16) : '',
    scheduled_timezone: content?.scheduled_timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    priority: content?.priority || 'medium',
    approval_status: content?.approval_status || 'needs_review',
    reviewer_notes: content?.reviewer_notes || ''
  });

  const platforms = ['instagram', 'linkedin', 'twitter', 'facebook', 'tiktok', 'youtube', 'email'];
  const contentTypes = ['post', 'story', 'reel', 'article', 'tweet', 'video', 'email'];
  const themes = ['educational', 'promotional', 'behind_scenes', 'user_generated', 'entertainment'];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create version history entry
    const versionEntry = {
      id: `version_${Date.now()}`,
      version: `${parseFloat(content?.version || '1.0') + 0.1}`,
      timestamp: new Date().toISOString(),
      author: 'You',
      changes: getChangesFromFormData(),
      status: 'modified',
      content_snapshot: {
        content_preview: content?.content_preview || '',
        platform: content?.platform || '',
        content_type: content?.content_type || '',
        theme: content?.theme || '',
        caption: content?.caption || '',
        scheduled_date: content?.scheduled_date || '',
        priority: content?.priority || ''
      }
    };

    const updatedFormData = {
      ...formData,
      version_history: [...(content?.version_history || []), versionEntry]
    };

    onSave(updatedFormData);
  };

  const getChangesFromFormData = () => {
    const changes = [];
    if (formData.content_preview !== content?.content_preview) changes.push('Updated content preview');
    if (formData.platform !== content?.platform) changes.push(`Changed platform to ${formData.platform}`);
    if (formData.content_type !== content?.content_type) changes.push(`Changed type to ${formData.content_type}`);
    if (formData.theme !== content?.theme) changes.push(`Changed theme to ${formData.theme}`);
    if (formData.priority !== content?.priority) changes.push(`Changed priority to ${formData.priority}`);
    if (formData.scheduled_date !== content?.scheduled_date) changes.push('Updated scheduled date');
    if (formData.scheduled_timezone !== content?.scheduled_timezone) changes.push(`Changed timezone to ${formData.scheduled_timezone}`);
    return changes.length > 0 ? changes : ['Minor updates'];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w.full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 text-blue-500 mr-3" />
              Edit Content
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform *</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Platform</option>
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type *</label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Type</option>
                  {contentTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Theme</option>
                  {themes.map(theme => (
                    <option key={theme} value={theme}>{theme.replace('_', ' ').charAt(0).toUpperCase() + theme.replace('_', ' ').slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Preview *</label>
              <textarea
                value={formData.content_preview}
                onChange={(e) => setFormData({ ...formData, content_preview: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Describe your content..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Approval Status</label>
                <select
                  value={formData.approval_status}
                  onChange={(e) => setFormData({ ...formData, approval_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="needs_review">Needs Review</option>
                  <option value="approved">Approved</option>
                  <option value="changes_requested">Changes Requested</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={formData.scheduled_timezone}
                  onChange={(e) => setFormData({ ...formData, scheduled_timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                >
                  {['UTC','Africa/Johannesburg','America/New_York','America/Los_Angeles','Europe/London','Europe/Berlin','Asia/Dubai','Asia/Singapore','Asia/Tokyo','Australia/Sydney'].map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Notes</label>
              <textarea
                value={formData.reviewer_notes}
                onChange={(e) => setFormData({ ...formData, reviewer_notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Add notes for the creator..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors">Update Content</button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EditContentModal;
