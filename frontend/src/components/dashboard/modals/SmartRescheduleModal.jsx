import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, ArrowRight, Check, AlertTriangle, Brain } from 'lucide-react';

const SmartRescheduleModal = ({ isOpen, onClose, events, onReschedule }) => {
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const [suggestions, setSuggestions] = useState({});

  // Get upcoming events that can be rescheduled (exclude high priority by default)
  const reschedulableEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const isPast = eventDate < new Date();
    return !isPast && event.priority !== 'high';
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const toggleEvent = (eventId) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
      // Generate AI suggestion for this event
      generateSuggestion(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const generateSuggestion = (eventId) => {
    const event = reschedulableEvents.find(e => e.id === eventId);
    if (!event) return;

    // Simulate AI suggestion
    const currentDate = new Date(event.date);
    const suggestedDate = new Date(currentDate);
    suggestedDate.setDate(currentDate.getDate() + 1); // Next day for demo
    
    setSuggestions(prev => ({
      ...prev,
      [eventId]: {
        newDate: suggestedDate,
        newTime: event.time,
        reason: 'Rebalance workload - day currently overbooked',
        confidence: 0.87
      }
    }));
  };

  const handleReschedule = () => {
    const eventsToReschedule = Array.from(selectedEvents).map(eventId => {
      const event = reschedulableEvents.find(e => e.id === eventId);
      const suggestion = suggestions[eventId];
      return {
        ...event,
        newDate: suggestion.newDate,
        newTime: suggestion.newTime,
        reason: suggestion.reason
      };
    });

    onReschedule(eventsToReschedule);
    onClose();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
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
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Smart Reschedule</h2>
                <p className="text-orange-100 text-sm">Select events to reschedule with AI recommendations</p>
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
          {/* Info Banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">AI-Powered Rescheduling</h4>
                <p className="text-sm text-blue-700">
                  Select events below and our AI will suggest optimal new times based on your calendar,
                  priorities, and work patterns. High-priority events are excluded by default.
                </p>
              </div>
            </div>
          </div>

          {/* Event List */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Select Events to Reschedule ({selectedEvents.size} selected)
            </h3>

            {reschedulableEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No events available for rescheduling</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reschedulableEvents.map((event) => {
                  const isSelected = selectedEvents.has(event.id);
                  const suggestion = suggestions[event.id];

                  return (
                    <div
                      key={event.id}
                      onClick={() => toggleEvent(event.id)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <div className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-orange-500 border-orange-500'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>

                        {/* Event Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                            <span className="text-xs text-gray-500 capitalize">({event.priority})</span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                            {event.duration && (
                              <span className="text-xs">({event.duration} min)</span>
                            )}
                          </div>

                          {/* AI Suggestion */}
                          {isSelected && suggestion && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="bg-white border border-orange-200 rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-orange-900">AI Recommendation</span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  {(suggestion.confidence * 100).toFixed(0)}% confidence
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-3 text-sm mb-2">
                                <div className="flex items-center space-x-2 text-gray-700">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                  <span className="text-gray-500">at</span>
                                  <Clock className="w-3 h-3" />
                                  <span>{event.time}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-orange-500" />
                                <div className="flex items-center space-x-2 text-orange-700 font-medium">
                                  <Calendar className="w-3 h-3" />
                                  <span>{suggestion.newDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                  <span className="text-gray-500">at</span>
                                  <Clock className="w-3 h-3" />
                                  <span>{suggestion.newTime}</span>
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-600">
                                <strong>Reason:</strong> {suggestion.reason}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedEvents.size > 0 && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-orange-900">Summary</h4>
              </div>
              <p className="text-sm text-orange-700">
                {selectedEvents.size} event{selectedEvents.size !== 1 ? 's' : ''} will be rescheduled.
                You'll receive calendar updates and notifications will be sent to all attendees.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReschedule}
              disabled={selectedEvents.size === 0}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reschedule {selectedEvents.size} Event{selectedEvents.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SmartRescheduleModal;

