import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Pin, PinOff, Calendar, Clock, Repeat, CheckCircle, Plus, Trash2, Edit2 } from 'lucide-react';

const EnhancedEventModal = ({ isOpen, onClose, event, onSave, onDelete }) => {
  const [formData, setFormData] = useState(event || {
    title: '',
    description: '',
    type: 'meeting',
    priority: 'medium',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    isPinned: false,
    isRecurring: false,
    tasks: []
  });

  const [newTask, setNewTask] = useState('');
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const addTask = () => {
    if (newTask.trim()) {
      setFormData({
        ...formData,
        tasks: [...(formData.tasks || []), {
          id: `task_${Date.now()}`,
          text: newTask,
          completed: false
        }]
      });
      setNewTask('');
    }
  };

  const toggleTask = (taskId) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    });
  };

  const deleteTask = (taskId) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter(t => t.id !== taskId)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{event ? 'Edit Event' : 'Create Event'}</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                className={`p-2 rounded-lg transition-colors ${
                  formData.isPinned ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 hover:bg-white/30'
                }`}
                title={formData.isPinned ? 'Unpin (Allow Rescheduling)' : 'Pin (Non-negotiable)'}
              >
                {formData.isPinned ? <Pin className="w-5 h-5" /> : <PinOff className="w-5 h-5" />}
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Pin Indicator */}
          {formData.isPinned && (
            <div className="mb-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
              <p className="text-sm text-yellow-900">
                <strong>📌 Pinned Event:</strong> This event won't be moved during automatic optimization
              </p>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Team Meeting"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="meeting">Meeting</option>
                <option value="personal">Personal</option>
                <option value="financial">Financial</option>
                <option value="content">Content</option>
                <option value="wellness">Wellness</option>
                <option value="agent_task">Agent Task</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Event details..."
            />
          </div>

          {/* Recurring Options */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => {
                    setFormData({ ...formData, isRecurring: e.target.checked });
                    setShowRecurringOptions(e.target.checked);
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <Repeat className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-700">Recurring Event</span>
              </label>
            </div>

            {showRecurringOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                      value={formData.recurrenceRule?.frequency || 'weekly'}
                      onChange={(e) => setFormData({
                        ...formData,
                        recurrenceRule: { ...formData.recurrenceRule, frequency: e.target.value }
                      })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Repeat Count</label>
                    <input
                      type="number"
                      min="2"
                      max="52"
                      value={formData.recurrenceRule?.count || 12}
                      onChange={(e) => setFormData({
                        ...formData,
                        recurrenceRule: { ...formData.recurrenceRule, count: parseInt(e.target.value) }
                      })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Tasks/Checklist */}
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Tasks & Checklist
            </h3>

            {/* Task List */}
            {formData.tasks && formData.tasks.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.tasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Task */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a task..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={addTask}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            {event && onDelete && (
              <button
                onClick={() => {
                  if (confirm('Delete this event?')) {
                    onDelete(event.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Delete Event
              </button>
            )}
            <div className="flex space-x-3 ml-auto">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md"
              >
                {event ? 'Update' : 'Create'} Event
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedEventModal;

