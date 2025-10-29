import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WeekView = ({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  events,
  onEventClick
}) => {
  // Get the start of the week (Sunday)
  const getWeekStart = (date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return start;
  };

  // Generate week days
  const weekStart = getWeekStart(selectedDate);
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    weekDays.push(day);
  }

  // Generate time slots (6 AM to 10 PM)
  const timeSlots = [];
  for (let hour = 6; hour <= 22; hour++) {
    timeSlots.push({
      hour: hour,
      time: `${hour.toString().padStart(2, '0')}:00`,
      display: hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`
    });
  }

  // Get events for a specific day and time range
  const getEventsForDayAndTime = (date, startHour, endHour) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const eventHour = parseInt(event.time.split(':')[0]);
      return eventDate.toDateString() === date.toDateString() && 
             eventHour >= startHour && eventHour < endHour;
    });
  };

  // Navigate week
  const navigateWeek = (direction) => {
    setSelectedDate(prev => new Date(prev.getTime() + direction * 7 * 24 * 60 * 60 * 1000));
  };

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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Week Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {
              weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            }
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-8 border-b bg-gray-50">
        {/* Time column header */}
        <div className="p-3 text-center font-semibold text-gray-600 border-r sticky left-0 bg-gray-50 z-10">
          Time
        </div>
        {/* Day headers */}
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toDateString() === selectedDate.toDateString();
          
          return (
            <div
              key={index}
              className={`p-3 text-center font-semibold border-r cursor-pointer transition-colors ${
                isToday ? 'bg-blue-100 text-blue-800' : 
                isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-sm font-medium">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-bold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time slots and events */}
      <div className="max-h-[600px] overflow-y-auto">
        {timeSlots.map((timeSlot, timeIndex) => (
          <div key={timeIndex} className="grid grid-cols-8 border-b min-h-[60px] hover:bg-gray-50 transition-colors">
            {/* Time label */}
            <div className="p-2 text-sm text-gray-500 bg-gray-50 border-r flex items-center justify-center font-medium sticky left-0 z-10">
              {timeSlot.display}
            </div>
            
            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDayAndTime(day, timeSlot.hour, timeSlot.hour + 1);
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = day.toDateString() === selectedDate.toDateString();
              
              return (
                <div
                  key={dayIndex}
                  className={`border-r p-1 min-h-[60px] cursor-pointer transition-colors ${
                    isToday ? 'bg-blue-25' : 
                    isSelected ? 'bg-blue-25' : 'bg-white'
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  {dayEvents.map(event => (
                    <motion.div
                      key={event.id}
                      className={`text-xs p-1.5 rounded border mb-1 cursor-pointer ${getEventTypeStyle(event.type)} ${getPriorityStyle(event.priority)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="truncate font-medium">{event.title}</div>
                      <div className="text-xs opacity-75 flex items-center">
                        <span>{event.time}</span>
                        {event.agentCreated && (
                          <span className="ml-1 text-[10px]">🤖</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;

