import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Clock, 
  Users, 
  DollarSign, 
  Target, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Search,
  Sync,
  ExternalLink,
  Brain,
  X
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../components/psychological/MicroCelebrations.jsx';

// Mock data for calendar events
const mockEvents = [
  {
    id: '1',
    title: 'Q1 Strategy Review',
    type: 'meeting',
    date: new Date(2024, 0, 15),
    time: '10:00',
    duration: 120,
    attendees: ['John Smith', 'Sarah Johnson'],
    location: 'Conference Room A',
    description: 'Review Q1 performance and plan Q2 initiatives',
    priority: 'high',
    agentCreated: false,
    reminders: [15, 60] // minutes before
  },
  {
    id: '2',
    title: 'Client Demo - TechCorp',
    type: 'meeting',
    date: new Date(2024, 0, 16),
    time: '14:00',
    duration: 90,
    attendees: ['TechCorp Team'],
    location: 'Virtual',
    description: 'Product demonstration for potential enterprise client',
    priority: 'high',
    agentCreated: true,
    reminders: [30, 120]
  },
  {
    id: '3',
    title: 'Monthly Financial Review',
    type: 'financial',
    date: new Date(2024, 0, 20),
    time: '09:00',
    duration: 60,
    attendees: ['Finance Team'],
    location: 'Office',
    description: 'Review monthly financial performance and budget',
    priority: 'medium',
    agentCreated: true,
    reminders: [60]
  },
  {
    id: '4',
    title: 'Content Strategy Planning',
    type: 'goal',
    date: new Date(2024, 0, 18),
    time: '11:00',
    duration: 90,
    attendees: ['Marketing Team'],
    location: 'Office',
    description: 'Plan Q2 content strategy and campaign themes',
    priority: 'medium',
    agentCreated: false,
    reminders: [15]
  },
  {
    id: '5',
    title: 'Sarah\'s Birthday',
    type: 'personal',
    date: new Date(2024, 0, 22),
    time: '00:00',
    duration: 0,
    attendees: [],
    location: '',
    description: 'Team member birthday - send wishes',
    priority: 'low',
    agentCreated: true,
    reminders: [1440] // 24 hours before
  }
];

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState(mockEvents);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSchedulingAgent, setShowSchedulingAgent] = useState(false);
  const [schedulingInput, setSchedulingInput] = useState('');
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const { triggerCelebration } = useCelebrations();

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  // Get events for current month
  const getEventsForMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return events.filter(event => 
      event.date.getFullYear() === year && 
      event.date.getMonth() === month
    );
  };

  // Handle scheduling agent input
  const handleSchedulingInput = () => {
    if (!schedulingInput.trim()) return;

    // Parse the scheduling request
    const newTask = {
      id: Date.now(),
      request: schedulingInput,
      created: new Date(),
      status: 'scheduled',
      type: 'agent_task'
    };

    setScheduledTasks(prev => [...prev, newTask]);
    setSchedulingInput('');
    
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: "Task scheduled! 📅",
      intensity: 'normal'
    });
  };

  // Parse scheduling request to extract timing
  const parseSchedulingRequest = (request) => {
    const lowerRequest = request.toLowerCase();
    
    // Extract frequency patterns
    const frequencyPatterns = {
      'every day': 'daily',
      'daily': 'daily',
      'every week': 'weekly',
      'weekly': 'weekly',
      'every month': 'monthly',
      'monthly': 'monthly',
      'every monday': 'weekly',
      'every tuesday': 'weekly',
      'every wednesday': 'weekly',
      'every thursday': 'weekly',
      'every friday': 'weekly',
      'every saturday': 'weekly',
      'every sunday': 'weekly'
    };

    // Extract time patterns
    const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm)?/i;
    const timeMatch = lowerRequest.match(timePattern);
    
    // Extract day patterns
    const dayPattern = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i;
    const dayMatch = lowerRequest.match(dayPattern);

    return {
      frequency: Object.keys(frequencyPatterns).find(pattern => 
        lowerRequest.includes(pattern)
      ) || 'once',
      time: timeMatch ? timeMatch[0] : null,
      day: dayMatch ? dayMatch[0] : null,
      request: request
    };
  };

  // Filter events based on type and search
  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calendar navigation
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Get event type styling
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

  // Get priority styling
  const getPriorityStyle = (priority) => {
    const styles = {
      high: 'border-l-4 border-red-500',
      medium: 'border-l-4 border-yellow-500',
      low: 'border-l-4 border-green-500'
    };
    return styles[priority] || 'border-l-4 border-gray-500';
  };

  // Add new event
  const handleAddEvent = (eventData) => {
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      agentCreated: false
    };
    setEvents(prev => [...prev, newEvent]);
    setShowAddEvent(false);
    
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: "Event added to your diary! 📅",
      intensity: 'normal'
    });
  };

  // Month view component
  const MonthView = () => {
    const days = generateCalendarDays();
    const monthEvents = getEventsForMonth();
    
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === selectedDate.toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b p-2 cursor-pointer transition-colors ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'bg-blue-100' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-blue-600' : ''}`}>
                  {day.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded border ${getEventTypeStyle(event.type)} ${getPriorityStyle(event.priority)}`}
                    >
                      <div className="truncate">{event.title}</div>
                      <div className="text-xs opacity-75">{event.time}</div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Day view component
  const DayView = () => {
    const dayEvents = getEventsForDate(selectedDate);
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <button
            onClick={() => setShowSchedulingAgent(true)}
            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors mr-2"
          >
            <Brain className="w-4 h-4" />
            <span>Schedule Agent Task</span>
          </button>
          <button
            onClick={() => setShowAddEvent(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>

        {dayEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No events scheduled for this day</p>
            <p className="text-sm">Click "Add Event" to schedule something</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayEvents.map(event => (
              <motion.div
                key={event.id}
                className={`p-4 rounded-lg border ${getEventTypeStyle(event.type)} ${getPriorityStyle(event.priority)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      {event.agentCreated && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          AI Created
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{event.time} ({event.duration}min)</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <span>📍</span>
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.attendees.length > 0 && (
                      <div className="flex items-center space-x-1 mt-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees.join(', ')}</span>
                      </div>
                    )}
                    {event.description && (
                      <p className="mt-2 text-sm text-gray-700">{event.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {event.reminders.length > 0 && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Bell className="w-4 h-4" />
                        <span>{event.reminders.join(', ')}min</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">CEO's Diary</h1>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <Sync className="w-4 h-4" />
              <span>Sync Calendars</span>
            </button>
            <button className="flex items-center space-x-2 text-green-600 hover:text-green-700">
              <ExternalLink className="w-4 h-4" />
              <span>Google Calendar</span>
            </button>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {['month', 'week', 'day'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="meeting">Meetings</option>
              <option value="financial">Financial</option>
              <option value="goal">Goals</option>
              <option value="personal">Personal</option>
              <option value="reminder">Reminders</option>
            </select>

            <button
              onClick={() => setShowAddEvent(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-2">
          {viewMode === 'month' && <MonthView />}
          {viewMode === 'day' && <DayView />}
        </div>

        {/* Sidebar - Upcoming Events & Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {filteredEvents
                .filter(event => event.date >= new Date())
                .sort((a, b) => a.date - b.date)
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {event.date.toLocaleDateString()} at {event.time}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        event.priority === 'high' ? 'bg-red-500' :
                        event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Events</span>
                <span className="font-semibold">{getEventsForMonth().length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Meetings</span>
                <span className="font-semibold">
                  {getEventsForMonth().filter(e => e.type === 'meeting').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">AI Created</span>
                <span className="font-semibold">
                  {getEventsForMonth().filter(e => e.agentCreated).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Event</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddEvent({
                title: formData.get('title'),
                type: formData.get('type'),
                date: new Date(formData.get('date')),
                time: formData.get('time'),
                duration: parseInt(formData.get('duration')),
                description: formData.get('description'),
                priority: formData.get('priority')
              });
            }}>
              <div className="space-y-4">
                <input
                  name="title"
                  type="text"
                  placeholder="Event Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <select
                  name="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="meeting">Meeting</option>
                  <option value="financial">Financial</option>
                  <option value="goal">Goal</option>
                  <option value="personal">Personal</option>
                  <option value="reminder">Reminder</option>
                </select>
                <input
                  name="date"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  name="time"
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  name="duration"
                  type="number"
                  placeholder="Duration (minutes)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <select
                  name="priority"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <textarea
                  name="description"
                  placeholder="Description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scheduling Agent Modal */}
      {showSchedulingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Scheduling Agent</h2>
                    <p className="text-gray-600">Tell me what you want scheduled and when</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSchedulingAgent(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Examples */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Examples:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• "I want a full financial analysis report at the end of every month"</li>
                    <li>• "I would like to have a full marketing campaign results breakdown every Wednesday at 9am"</li>
                    <li>• "Every day at 3pm I need a reminder to call my wife"</li>
                    <li>• "Schedule a weekly team meeting every Monday at 10am"</li>
                    <li>• "Send me a daily sales report every morning at 8am"</li>
                  </ul>
                </div>

                {/* Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would you like to schedule?
                  </label>
                  <textarea
                    value={schedulingInput}
                    onChange={(e) => setSchedulingInput(e.target.value)}
                    placeholder="Describe what you want scheduled and when..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
                  />
                </div>

                {/* Parsed Schedule Preview */}
                {schedulingInput && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Schedule Preview:</h4>
                    {(() => {
                      const parsed = parseSchedulingRequest(schedulingInput);
                      return (
                        <div className="text-sm text-gray-700 space-y-1">
                          <p><strong>Frequency:</strong> {parsed.frequency}</p>
                          {parsed.time && <p><strong>Time:</strong> {parsed.time}</p>}
                          {parsed.day && <p><strong>Day:</strong> {parsed.day}</p>}
                          <p><strong>Task:</strong> {parsed.request}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Scheduled Tasks */}
                {scheduledTasks.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Scheduled Tasks ({scheduledTasks.length})</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {scheduledTasks.map(task => (
                        <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{task.request}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Created: {task.created.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {task.status}
                              </span>
                              <button
                                onClick={() => setScheduledTasks(prev => prev.filter(t => t.id !== task.id))}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSchedulingAgent(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSchedulingInput}
                    disabled={!schedulingInput.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Task</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
