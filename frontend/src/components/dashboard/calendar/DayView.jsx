import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, MapPin, Plus, Brain, ChevronLeft, ChevronRight } from 'lucide-react';

const DayView = ({
  selectedDate,
  setSelectedDate,
  events,
  onEventClick,
  onAddEvent
}) => {
  // Get events for the selected date
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === selectedDate.toDateString();
  }).sort((a, b) => {
    // Sort by time
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });

  // Event type styling
  const getEventTypeStyle = (type) => {
    const styles = {
      meeting: 'bg-blue-100 text-blue-800 border-blue-200',
      financial: 'bg-green-100 text-green-800 border-green-200',
      goal: 'bg-purple-100 text-purple-800 border-purple-200',
      personal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reminder: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return styles[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Priority styling
  const getPriorityStyle = (priority) => {
    const styles = {
      high: 'border-l-4 border-red-500',
      medium: 'border-l-4 border-yellow-500',
      low: 'border-l-4 border-green-500'
    };
    return styles[priority] || 'border-l-4 border-gray-500';
  };

  // Navigate days
  const navigateDay = (direction) => {
    setSelectedDate(prev => new Date(prev.getTime() + direction * 24 * 60 * 60 * 1000));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long'
              })}
            </h2>
            <p className="text-blue-100 text-lg">
              {selectedDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDay(-1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateDay(1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onAddEvent}
            className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
          <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
            <Brain className="w-4 h-4" />
            <span>Schedule with PA</span>
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="p-6">
        {dayEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No events scheduled</h3>
            <p className="text-gray-500 mb-6">This day is free for you to plan</p>
            <button
              onClick={onAddEvent}
              className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Event</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {dayEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className={`p-5 rounded-lg border-2 cursor-pointer transition-all hover:shadow-xl ${getEventTypeStyle(event.type)} ${getPriorityStyle(event.priority)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => onEventClick(event)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-bold">{event.title}</h3>
                      {event.agentCreated && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          🤖 AI Created
                        </span>
                      )}
                      {event.priority === 'high' && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                          High Priority
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center space-x-1.5 text-gray-700">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{event.time}</span>
                        <span className="text-gray-500">({event.duration} min)</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center space-x-1.5 text-gray-700">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center space-x-1.5 text-gray-700">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                    {event.description}
                  </p>
                )}

                {event.aiSummary && (
                  <div className="mt-3 p-3 bg-white/50 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-2">
                      <Brain className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{event.aiSummary}</p>
                    </div>
                  </div>
                )}

                {event.relatedAgents && event.relatedAgents.length > 0 && (
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Related Agents:</span>
                    {event.relatedAgents.map((agent, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {agent.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;

