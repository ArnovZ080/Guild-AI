import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Brain,
  Zap,
  Target,
  TrendingUp,
  MessageSquare,
  Bell,
  Settings,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Star,
  Heart,
  Coffee,
  Dumbbell,
  Home,
  Briefcase,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations';

const EnhancedCalendar = ({ onNavigateToChat, onNavigateToDashboard }) => {
  const { currentMode, getModeColors, timeOfDay } = useAdaptiveMode();
  const { triggerCelebration } = useCelebrations();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [paSuggestions, setPASuggestions] = useState([]);
  const [paChat, setPAChat] = useState([]);
  const [paInput, setPAInput] = useState('');
  const [paIsTyping, setPAIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const adaptiveClasses = getModeColors(currentMode);

  // Mock events data
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Sales Analytics Review',
      start: new Date(2024, 11, 15, 9, 0),
      end: new Date(2024, 11, 15, 10, 0),
      type: 'meeting',
      agent: 'analytics',
      description: 'Weekly sales performance review with Analytics Agent',
      attendees: ['Analytics Agent', 'Sales Team'],
      location: 'Virtual',
      priority: 'high',
      recurring: true,
      frequency: 'weekly'
    },
    {
      id: '2',
      title: 'Content Strategy Planning',
      start: new Date(2024, 11, 16, 14, 0),
      end: new Date(2024, 11, 16, 15, 30),
      type: 'planning',
      agent: 'contentstrategist',
      description: 'Monthly content calendar planning session',
      attendees: ['Content Strategist', 'Social Media Agent'],
      location: 'Virtual',
      priority: 'medium',
      recurring: false
    },
    {
      id: '3',
      title: 'Client Birthday - Sarah Johnson',
      start: new Date(2024, 11, 18, 0, 0),
      end: new Date(2024, 11, 18, 23, 59),
      type: 'personal',
      agent: 'customerrelations',
      description: 'Send birthday wishes to important client',
      attendees: ['Customer Relations Agent'],
      location: 'Email/Social Media',
      priority: 'medium',
      recurring: true,
      frequency: 'yearly'
    },
    {
      id: '4',
      title: 'Focus Time - Deep Work',
      start: new Date(2024, 11, 17, 10, 0),
      end: new Date(2024, 11, 17, 12, 0),
      type: 'focus',
      agent: 'pa',
      description: 'Protected focus time for deep work',
      attendees: ['Personal Assistant'],
      location: 'Home Office',
      priority: 'high',
      recurring: true,
      frequency: 'daily'
    }
  ]);

  // Generate calendar days for month view
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Generate week days for week view
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    startOfWeek.setDate(diff);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Get events for a specific hour (day view)
  const getEventsForHour = (date, hour) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      const eventHour = eventDate.getHours();
      return eventDate.toDateString() === date.toDateString() && eventHour === hour;
    });
  };

  // PA Agent suggestions based on patterns
  useEffect(() => {
    const suggestions = [
      {
        id: '1',
        type: 'optimization',
        title: 'Optimize Schedule',
        description: 'Back-to-back meetings detected. Suggest better spacing?',
        action: 'optimize_schedule',
        priority: 'medium'
      },
      {
        id: '2',
        type: 'wellness',
        title: 'Add Focus Time',
        description: 'Morning focus blocks recommended for productivity.',
        action: 'add_focus_time',
        priority: 'high'
      },
      {
        id: '3',
        type: 'learning',
        title: 'Weekly Planning',
        description: 'Schedule weekly planning session.',
        action: 'schedule_planning',
        priority: 'medium'
      }
    ];
    setPASuggestions(suggestions);
  }, []);

  // Handle PA Agent chat
  const handlePASendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setPAChat(prev => [...prev, userMessage]);
    setPAInput('');
    setPAIsTyping(true);

    // Simulate PA Agent response
    setTimeout(() => {
      let response = '';
      
      if (message.toLowerCase().includes('schedule')) {
        response = "I'd be happy to help you schedule that! Let me check your calendar for the best available slots. What type of meeting would you like to schedule?";
      } else if (message.toLowerCase().includes('focus')) {
        response = "I'll protect that time for you and ensure no meetings are scheduled during your focus blocks. Would you like me to set up recurring focus time?";
      } else if (message.toLowerCase().includes('optimize')) {
        response = "I've analyzed your schedule and found several optimization opportunities. Would you like me to implement these changes automatically?";
      } else {
        response = "I understand you need help with scheduling. I can assist with meeting coordination, conflict resolution, focus time protection, and schedule optimization. What specific task would you like me to help with?";
      }

      const paResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        agent: 'pa',
        actions: ['Schedule Meeting', 'Optimize Calendar', 'Add Focus Time', 'View Analytics']
      };

      setPAChat(prev => [...prev, paResponse]);
      setPAIsTyping(false);
      
      triggerCelebration(CelebrationType.COLLABORATION, {
        message: "PA Agent responded! 📅",
        intensity: 'subtle'
      });
    }, 1500);
  };

  // Handle PA suggestion actions
  const handlePASuggestion = (suggestion) => {
    switch (suggestion.action) {
      case 'optimize_schedule':
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: "Schedule optimized! ⚡",
          intensity: 'normal'
        });
        break;
      case 'add_focus_time':
        const newEvent = {
          id: Date.now().toString(),
          title: 'Focus Time - Deep Work',
          start: new Date(selectedDate),
          end: new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours
          type: 'focus',
          agent: 'pa',
          description: 'Protected focus time for deep work',
          attendees: ['Personal Assistant'],
          location: 'Home Office',
          priority: 'high',
          recurring: true,
          frequency: 'daily'
        };
        setEvents(prev => [...prev, newEvent]);
        triggerCelebration(CelebrationType.WELLNESS, {
          message: "Focus time added! 🧘",
          intensity: 'normal'
        });
        break;
      case 'schedule_planning':
        triggerCelebration(CelebrationType.MILESTONE, {
          message: "Planning session scheduled! 📋",
          intensity: 'normal'
        });
        break;
    }
    
    // Remove suggestion after action
    setPASuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'planning': return <Target className="w-4 h-4" />;
      case 'personal': return <Heart className="w-4 h-4" />;
      case 'focus': return <Brain className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'personal': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'focus': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  // Render month view
  const renderMonthView = () => (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {getCalendarDays().map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isSelected = selectedDate.toDateString() === day.toDateString();

          return (
            <motion.div
              key={index}
              className={`min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200 ${
                isCurrentMonth ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-900'
              } ${isToday ? `ring-2 ring-blue-500` : ''} ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedDate(day)}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'
              } ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <motion.div
                    key={event.id}
                    className={`p-1 rounded text-xs border-l-4 ${getPriorityColor(event.priority)} ${getEventTypeColor(event.type)}`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-center space-x-1">
                      {getEventTypeIcon(event.type)}
                      <span className="truncate">{event.title}</span>
                    </div>
                  </motion.div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  // Render week view
  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="space-y-4">
        {/* Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = selectedDate.toDateString() === day.toDateString();
            
            return (
              <div key={index} className="text-center">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  isToday ? 'bg-blue-500 text-white' : 
                  isSelected ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' : 
                  'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`} onClick={() => setSelectedDate(day)}>
                  {day.getDate()}
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Week Schedule */}
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            
            return (
              <div key={index} className="space-y-2">
                {dayEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className={`p-2 rounded-lg border-l-4 ${getPriorityColor(event.priority)} ${getEventTypeColor(event.type)}`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-xs font-medium">{event.title}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="space-y-2">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(selectedDate, hour);
          const isCurrentHour = new Date().getHours() === hour;
          
          return (
            <div key={hour} className={`grid grid-cols-12 gap-4 p-2 rounded-lg ${
              isCurrentHour ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}>
              <div className="col-span-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              <div className="col-span-10 space-y-1">
                {hourEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className={`p-2 rounded-lg border-l-4 ${getPriorityColor(event.priority)} ${getEventTypeColor(event.type)}`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-sm font-medium">{event.title}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Intelligent Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your Personal Assistant Agent manages your schedule with AI-powered optimization.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {['month', 'week', 'day'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? `bg-gradient-to-r ${adaptiveClasses.primary} text-white`
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
            <button
              onClick={() => setShowEventModal(true)}
              className={`ml-4 px-4 py-2 bg-gradient-to-r ${adaptiveClasses.primary} text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center space-x-2`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {viewMode === 'week' && `Week of ${getWeekDays()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              {viewMode === 'day' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  if (viewMode === 'month') {
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
                  } else if (viewMode === 'week') {
                    setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
                  } else {
                    setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000));
                  }
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  if (viewMode === 'month') {
                    setCurrentDate(today);
                  } else if (viewMode === 'week') {
                    setCurrentDate(today);
                  } else {
                    setSelectedDate(today);
                  }
                }}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                Today
              </button>
              <button
                onClick={() => {
                  if (viewMode === 'month') {
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
                  } else if (viewMode === 'week') {
                    setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
                  } else {
                    setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
                  }
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar View */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border ${adaptiveClasses.border} p-6`}>
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
          </div>

          {/* Selected Date Events */}
          {getEventsForDate(selectedDate).length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Events for {selectedDate.toLocaleDateString()}
              </h3>
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event) => (
                  <motion.div
                    key={event.id}
                    className={`${adaptiveClasses.secondary} p-4 rounded-xl border ${adaptiveClasses.border} hover:shadow-lg transition-all duration-200`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEventTypeColor(event.type)}`}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {event.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{event.attendees.join(', ')}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.priority === 'high' ? 'bg-red-100 text-red-800' :
                          event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {event.priority}
                        </span>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PA Agent Sidebar */}
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          {/* PA Agent Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Personal Assistant</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Scheduling Assistant</p>
              </div>
            </div>
          </div>

          {/* PA Chat */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {paChat.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">What can I help you with?</p>
                </div>
              )}
              
              {paChat.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? `bg-gradient-to-r ${adaptiveClasses.primary} text-white`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.actions && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.actions.map((action, idx) => (
                          <button
                            key={idx}
                            className="px-2 py-1 bg-white/20 text-xs rounded hover:bg-white/30 transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {paIsTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PA Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={paInput}
                onChange={(e) => setPAInput(e.target.value)}
                placeholder="Ask your PA Agent..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handlePASendMessage(paInput)}
              />
              <button
                onClick={() => handlePASendMessage(paInput)}
                disabled={!paInput.trim()}
                className={`px-4 py-2 bg-gradient-to-r ${adaptiveClasses.primary} text-white rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Send
              </button>
            </div>
          </div>

          {/* PA Suggestions */}
          {paSuggestions.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Suggestions</h4>
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showSuggestions ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {paSuggestions.map((suggestion) => (
                        <motion.div
                          key={suggestion.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handlePASuggestion(suggestion)}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              {suggestion.title}
                            </h5>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                              suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {suggestion.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {suggestion.description}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCalendar;