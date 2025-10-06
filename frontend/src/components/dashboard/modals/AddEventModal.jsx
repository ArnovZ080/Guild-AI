import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Users, MapPin, Bell, Brain, Sparkles } from 'lucide-react';

const AddEventModal = ({ isOpen, onClose, onAdd, selectedDate }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    location: '',
    attendees: '',
    description: '',
    priority: 'medium',
    reminders: [15, 60]
  });

  const [useNaturalLanguage, setUseNaturalLanguage] = useState(false);
  const [naturalInput, setNaturalInput] = useState('');
  const [parsedSuggestion, setParsedSuggestion] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      date: new Date(formData.date),
      attendees: formData.attendees ? formData.attendees.split(',').map(a => a.trim()) : []
    };
    
    onAdd(eventData);
  };

  const handleNaturalLanguageParse = () => {
    // Simulate AI parsing of natural language
    const input = naturalInput.toLowerCase();
    
    let parsed = {
      title: '',
      type: 'meeting',
      time: '09:00',
      duration: 60,
      location: '',
      description: naturalInput
    };

    // Extract time
    const timeMatch = input.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] || '00';
      const meridiem = timeMatch[3];
      
      if (meridiem && meridiem.toLowerCase() === 'pm' && hour !== 12) {
        hour += 12;
      } else if (meridiem && meridiem.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }
      
      parsed.time = `${hour.toString().padStart(2, '0')}:${minute}`;
    }

    // Extract duration
    const durationMatch = input.match(/(\d+)\s*(hour|hr|minute|min)/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      parsed.duration = unit.includes('hour') || unit.includes('hr') ? value * 60 : value;
    }

    // Extract type
    if (input.includes('meeting') || input.includes('call')) parsed.type = 'meeting';
    else if (input.includes('financial') || input.includes('money') || input.includes('budget')) parsed.type = 'financial';
    else if (input.includes('goal') || input.includes('task')) parsed.type = 'goal';
    else if (input.includes('personal')) parsed.type = 'personal';
    else if (input.includes('remind')) parsed.type = 'reminder';

    // Extract title (first few words or fallback)
    const words = naturalInput.split(' ');
    parsed.title = words.slice(0, Math.min(5, words.length)).join(' ');

    setParsedSuggestion(parsed);
    
    // Apply parsed data to form
    setFormData(prev => ({
      ...prev,
      ...parsed
    }));
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Add New Event</h2>
              <p className="text-blue-100 text-sm mt-1">Schedule using form or natural language</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Toggle Natural Language */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Use Natural Language Input</span>
            <button
              onClick={() => setUseNaturalLanguage(!useNaturalLanguage)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useNaturalLanguage ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useNaturalLanguage ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Natural Language Input */}
        {useNaturalLanguage && (
          <div className="p-6 bg-purple-50 border-b">
            <div className="flex items-start space-x-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-600 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your event naturally
                </label>
                <textarea
                  value={naturalInput}
                  onChange={(e) => setNaturalInput(e.target.value)}
                  placeholder="E.g., 'Meeting with Sarah tomorrow at 2pm for 1 hour to discuss Q4 strategy'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows="3"
                />
                <button
                  onClick={handleNaturalLanguageParse}
                  disabled={!naturalInput.trim()}
                  className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Brain className="w-4 h-4 inline mr-2" />
                  Parse with AI
                </button>
              </div>
            </div>
            
            {parsedSuggestion && (
              <div className="mt-3 p-3 bg-white border border-purple-200 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-2">✨ AI Parsed:</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Title:</strong> {parsedSuggestion.title}</p>
                  <p><strong>Type:</strong> {parsedSuggestion.type}</p>
                  <p><strong>Time:</strong> {parsedSuggestion.time}</p>
                  <p><strong>Duration:</strong> {parsedSuggestion.duration} min</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Team standup meeting"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="meeting">👥 Meeting</option>
              <option value="financial">💰 Financial</option>
              <option value="goal">🎯 Goal/Task</option>
              <option value="personal">✨ Personal</option>
              <option value="reminder">⏰ Reminder</option>
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Duration and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="15"
                step="15"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
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

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Conference Room A, Zoom, etc."
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Attendees (comma separated)
            </label>
            <input
              type="text"
              value={formData.attendees}
              onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., John Smith, Sarah Johnson"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              placeholder="Additional details about the event..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Add Event
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddEventModal;

