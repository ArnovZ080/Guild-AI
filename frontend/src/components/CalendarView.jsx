import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Clock, Users, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const events = [
    {
      id: '1',
      title: 'Team Standup',
      time: '09:00',
      duration: 30,
      type: 'meeting',
      attendees: ['John', 'Sarah', 'Mike']
    },
    {
      id: '2',
      title: 'Client Demo',
      time: '14:00',
      duration: 60,
      type: 'presentation',
      attendees: ['Sarah', 'Client Team']
    },
    {
      id: '3',
      title: 'Product Planning',
      time: '16:00',
      duration: 90,
      type: 'workshop',
      attendees: ['John', 'Mike', 'Emily']
    }
  ];

  const getEventColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'presentation': return 'bg-green-100 text-green-800 border-green-200';
      case 'workshop': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your schedule and meetings</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {getMonthDays().map((day, index) => (
              <div
                key={index}
                className={`p-2 h-24 border border-gray-200 ${
                  day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                }`}
              >
                {day && (
                  <div className="text-sm font-medium text-gray-900">{day}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Today's Events</h3>
            <div className="space-y-3">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center text-sm mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {event.time} ({event.duration}min)
                      </div>
                      <div className="flex items-center text-sm mt-1">
                        <Users className="w-3 h-3 mr-1" />
                        {event.attendees.join(', ')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                <Calendar className="w-5 h-5 text-blue-600 mb-2" />
                <div className="font-medium">Schedule Meeting</div>
                <div className="text-sm text-gray-600">Book time with your team</div>
              </button>
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                <MapPin className="w-5 h-5 text-green-600 mb-2" />
                <div className="font-medium">Add Location</div>
                <div className="text-sm text-gray-600">Set meeting location</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
