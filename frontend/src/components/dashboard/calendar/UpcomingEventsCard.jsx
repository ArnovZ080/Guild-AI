import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, Clock, MapPin } from 'lucide-react';

const UpcomingEventsCard = ({ events, isExpanded, onToggle }) => {
  // Get upcoming events (next 5)
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      meeting: '👥',
      financial: '💰',
      goal: '🎯',
      personal: '✨',
      reminder: '⏰'
    };
    return icons[type] || '📅';
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <h3 className="font-bold">Upcoming Events</h3>
          <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
            {upcomingEvents.length}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              ) : (
                upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-xl">{getEventTypeIcon(event.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(event.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })} at {event.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)} flex-shrink-0`} />
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    
                    {event.agentCreated && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          🤖 AI Scheduled
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UpcomingEventsCard;

