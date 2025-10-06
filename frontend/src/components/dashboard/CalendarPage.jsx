import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopNav from './calendar/TopNav';
import CalendarLeftPanel from './calendar/CalendarLeftPanel';
import CalendarRightPanel from './calendar/CalendarRightPanel';
import FloatingDock from './calendar/FloatingDock';
import AddEventModal from './modals/AddEventModal';
import SmartEventModal from './modals/SmartEventModal';
import OptimizationModal from './modals/OptimizationModal';
import PrepareReportsModal from './modals/PrepareReportsModal';
import SmartRescheduleModal from './modals/SmartRescheduleModal';
import TimeUseReportModal from './modals/TimeUseReportModal';
import ScheduleOptimizationRecommendationsModal from './modals/ScheduleOptimizationRecommendationsModal';
import ScheduleBreakModal from './modals/ScheduleBreakModal';
import AgentDetailModal from './modals/AgentDetailModal';
import VoiceCommandModal from './modals/VoiceCommandModal';
import DailyWrapUpModal from './modals/DailyWrapUpModal';
import WeeklyReviewModal from './modals/WeeklyReviewModal';
import MeetingCompanionOverlay from './calendar/MeetingCompanionOverlay';
import FocusModeOverlay from './calendar/FocusModeOverlay';
import { useCelebrations, CelebrationType } from '../psychological/MicroCelebrations.jsx';

// Mock data for initial events - will be replaced with API calls
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
    reminders: [15, 60],
    relatedAgents: ['business_intelligence_agent'],
    aiSummary: 'Strategic planning session to evaluate Q1 performance metrics and establish Q2 objectives.',
    recommendations: ['Prepare financial reports', 'Review KPI dashboard', 'Draft Q2 roadmap']
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
    reminders: [30, 120],
    relatedAgents: ['customer_intelligence_agent', 'content_agent'],
    aiSummary: 'High-value client presentation. TechCorp has shown strong interest in enterprise features.',
    recommendations: ['Prepare demo environment', 'Review client needs', 'Have pricing deck ready']
  }
];

const CalendarPage = () => {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [events, setEvents] = useState(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [focusMode, setFocusMode] = useState(false);
  const [showMeetingCompanion, setShowMeetingCompanion] = useState(false);
  
  // Modal states
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showOptimization, setShowOptimization] = useState(false);
  const [showPAChat, setShowPAChat] = useState(false);
  const [showPrepareReports, setShowPrepareReports] = useState(false);
  const [showSmartReschedule, setShowSmartReschedule] = useState(false);
  const [showTimeUseReport, setShowTimeUseReport] = useState(false);
  const [showOptimizationRecommendations, setShowOptimizationRecommendations] = useState(false);
  const [showScheduleBreak, setShowScheduleBreak] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showVoiceCommands, setShowVoiceCommands] = useState(false);
  const [showDailyWrapUp, setShowDailyWrapUp] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  
  // PA and agent states
  const [paMessages, setPaMessages] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [wellbeingData, setWellbeingData] = useState(null);
  const [timeUseData, setTimeUseData] = useState(null);
  const [agentCoordination, setAgentCoordination] = useState([]);
  
  const { triggerCelebration } = useCelebrations();

  // Load initial data
  useEffect(() => {
    loadCalendarData();
    loadAIInsights();
    loadWellbeingData();
    loadTimeUseAnalytics();
    loadAgentCoordination();
  }, [currentDate]);

  // API call functions
  const loadCalendarData = async () => {
    try {
      const response = await fetch('/api/calendar/events');
      if (response.ok) {
        const data = await response.json();
        if (data.events) {
          setEvents(data.events);
        }
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    }
  };

  const loadAIInsights = async () => {
    try {
      const response = await fetch('/api/calendar/insights');
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data);
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error);
      // Set mock data for now
      setAiInsights({
        weekLoad: 72,
        productivityTrend: 'up',
        suggestions: [
          'Your week is 72% full — optimal.',
          "You've worked 10 consecutive days — schedule downtime.",
          'Wednesdays are most productive; suggest moving strategy sessions here.'
        ]
      });
    }
  };

  const loadWellbeingData = async () => {
    try {
      const response = await fetch('/api/calendar/wellbeing');
      if (response.ok) {
        const data = await response.json();
        setWellbeingData(data);
      }
    } catch (error) {
      console.error('Failed to load wellbeing data:', error);
      // Set mock data
      setWellbeingData({
        moodScore: 7.5,
        workloadBalance: 'good',
        suggestions: ['Schedule a 15-minute walk', 'Consider a no-meeting Friday']
      });
    }
  };

  const loadTimeUseAnalytics = async () => {
    try {
      const response = await fetch('/api/calendar/time-use');
      if (response.ok) {
        const data = await response.json();
        setTimeUseData(data);
      }
    } catch (error) {
      console.error('Failed to load time use data:', error);
      // Set mock data
      setTimeUseData({
        deepWork: 35,
        meetings: 30,
        admin: 20,
        personal: 10,
        breaks: 5
      });
    }
  };

  const loadAgentCoordination = async () => {
    try {
      const response = await fetch('/api/calendar/agent-coordination');
      if (response.ok) {
        const data = await response.json();
        setAgentCoordination(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to load agent coordination:', error);
      // Set mock data
      setAgentCoordination([
        { 
          name: 'Financial Agent', 
          task: 'Preparing report for 3PM meeting',
          status: 'in_progress',
          event_id: '1'
        },
        { 
          name: 'Content Agent', 
          task: 'Finalizing social posts',
          status: 'pending',
          event_id: null
        }
      ]);
    }
  };

  // Event handlers
  const handleAddEvent = async (eventData) => {
    try {
      const response = await fetch('/api/calendar/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      
      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => [...prev, newEvent]);
        setShowAddEvent(false);
        
        triggerCelebration(CelebrationType.TASK_COMPLETE, {
          message: "Event added to your calendar! 📅",
          intensity: 'normal'
        });
        
        // Reload data
        loadCalendarData();
        return;
      }
    } catch (error) {
      console.error('API not available, using mock data:', error);
    }
    
    // Fallback to mock data if API fails or is not available
    const newEvent = {
      id: `event-${Date.now()}`,
      title: eventData.title,
      type: eventData.type,
      date: eventData.date,
      time: eventData.time,
      duration: eventData.duration,
      location: eventData.location || '',
      attendees: Array.isArray(eventData.attendees) ? eventData.attendees : [],
      description: eventData.description || '',
      priority: eventData.priority,
      status: 'scheduled',
      isPinned: false,
      tasks: [],
      recurring: null
    };
    
    setEvents(prev => [...prev, newEvent]);
    setShowAddEvent(false);
    
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: "Event added to your calendar! 📅",
      intensity: 'high'
    });
  };

  const handleOptimizeWeek = async () => {
    setShowOptimization(true);
    
    try {
      const response = await fetch('/api/calendar/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date_range: [currentDate, new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)],
          preferences: {
            max_meetings_per_day: 4,
            min_break_time: 15,
            no_meetings_after: '18:00'
          }
        })
      });
      
      if (response.ok) {
        const optimizationData = await response.json();
        // Handle optimization results in modal
      }
    } catch (error) {
      console.error('Failed to optimize week:', error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleToggleFocusMode = () => {
    setFocusMode(!focusMode);
    
    if (!focusMode) {
      triggerCelebration(CelebrationType.MILESTONE, {
        message: "Focus mode activated! 🎯",
        intensity: 'high'
      });
    }
  };

  const handleOptimizeDay = () => {
    setShowOptimization(true);
    triggerCelebration(CelebrationType.MILESTONE, {
      message: "Optimizing your day... 🎯",
      intensity: 'normal'
    });
  };

  const handlePrepareReports = () => {
    setShowPrepareReports(true);
  };

  const handleReschedule = () => {
    setShowSmartReschedule(true);
  };

  const handleGenerateReports = (reportTypes) => {
    console.log('Generating reports:', reportTypes);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Generating ${reportTypes.length} report(s)! 📊`,
      intensity: 'normal'
    });
  };

  const handleScheduleRecurringReports = (scheduleData) => {
    console.log('Scheduling recurring reports:', scheduleData);
    // Add to calendar
    const reportEvent = {
      id: Date.now().toString(),
      title: `📊 ${scheduleData.reportNames.join(', ')}`,
      type: 'goal',
      date: new Date(), // Would calculate based on schedule
      time: scheduleData.time,
      duration: 30,
      description: `Recurring ${scheduleData.frequency} report`,
      priority: 'medium',
      agentCreated: true,
      isRecurring: true,
      recurringSchedule: scheduleData
    };
    setEvents(prev => [...prev, reportEvent]);
    triggerCelebration(CelebrationType.MILESTONE, {
      message: "Recurring reports scheduled! 🎯",
      intensity: 'high'
    });
  };

  const handleRescheduleEvents = (eventsToReschedule) => {
    console.log('Rescheduling events:', eventsToReschedule);
    // Update events with new dates
    const updatedEvents = events.map(event => {
      const reschedule = eventsToReschedule.find(r => r.id === event.id);
      if (reschedule) {
        return { ...event, date: reschedule.newDate, time: reschedule.newTime };
      }
      return event;
    });
    setEvents(updatedEvents);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `${eventsToReschedule.length} event(s) rescheduled! 🔄`,
      intensity: 'normal'
    });
  };

  const handleRescheduleEvent = (eventId, newDate, newTime) => {
    console.log('Drag-and-drop reschedule:', eventId, newDate, newTime);
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return { ...event, date: newDate, time: newTime };
      }
      return event;
    });
    setEvents(updatedEvents);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: 'Event rescheduled! 🔄',
      intensity: 'normal'
    });
  };

  const handleImplementOptimizations = (optimizations, remember) => {
    console.log('Implementing optimizations:', optimizations, 'Remember:', remember);
    triggerCelebration(CelebrationType.MILESTONE, {
      message: "Schedule optimized! 🎯",
      intensity: 'high'
    });
  };

  const handleScheduleBreak = (breakEvent) => {
    setEvents(prev => [...prev, { ...breakEvent, id: Date.now().toString(), agentCreated: true }]);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: "Break scheduled! ☕",
      intensity: 'normal'
    });
  };

  const handleVoiceCommand = (transcript) => {
    console.log('Voice command:', transcript);
    // Process voice command (can integrate with calendarDataService)
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: "Command received! 🎤",
      intensity: 'normal'
    });
  };

  // Auto-trigger daily wrap-up at 6pm
  useEffect(() => {
    const checkDailyWrapUp = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // Trigger at 6:00 PM
      if (hour === 18 && minute === 0) {
        const lastShown = localStorage.getItem('last_daily_wrapup');
        const today = new Date().toDateString();
        
        if (lastShown !== today) {
          setShowDailyWrapUp(true);
          localStorage.setItem('last_daily_wrapup', today);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkDailyWrapUp, 60000);
    checkDailyWrapUp(); // Check immediately

    return () => clearInterval(interval);
  }, []);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <TopNav
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        focusMode={focusMode}
        onToggleFocusMode={handleToggleFocusMode}
        onOptimizeWeek={handleOptimizeWeek}
        onAddEvent={() => setShowAddEvent(true)}
        onOpenPAChat={() => setShowPAChat(true)}
        onOpenVoiceCommands={() => setShowVoiceCommands(true)}
      />

      {/* Main Grid */}
      <div className="max-w-[1920px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Calendar (2/3 width) */}
          <div className="lg:col-span-2">
            <CalendarLeftPanel
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              viewMode={viewMode}
              setViewMode={setViewMode}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onAddEvent={() => setShowAddEvent(true)}
              aiInsights={aiInsights}
              onOptimizeDay={handleOptimizeDay}
              onPrepareReports={handlePrepareReports}
              onReschedule={handleReschedule}
              onRescheduleEvent={handleRescheduleEvent}
            />
          </div>

          {/* Right Panel - Intelligence Dashboard (1/3 width) */}
          <div className="lg:col-span-1">
            <CalendarRightPanel
              events={filteredEvents}
              aiInsights={aiInsights}
              wellbeingData={wellbeingData}
              timeUseData={timeUseData}
              agentCoordination={agentCoordination}
              currentDate={currentDate}
              onShowTimeUseReport={() => setShowTimeUseReport(true)}
              onShowOptimizationRecommendations={() => setShowOptimizationRecommendations(true)}
              onScheduleBreak={() => setShowScheduleBreak(true)}
              onToggleFocusMode={handleToggleFocusMode}
              onSelectAgent={setSelectedAgent}
              onAutoOptimize={() => setShowOptimization(true)}
            />
          </div>
        </div>
      </div>

      {/* Floating Dock - PA Agent */}
      <FloatingDock
        messages={paMessages}
        setMessages={setPaMessages}
        onSchedule={handleAddEvent}
        events={events}
        isOpen={showPAChat}
        setIsOpen={setShowPAChat}
      />

      {/* Modals */}
      <AnimatePresence>
        {showAddEvent && (
          <AddEventModal
            isOpen={showAddEvent}
            onClose={() => setShowAddEvent(false)}
            onAdd={handleAddEvent}
            selectedDate={selectedDate}
          />
        )}

        {selectedEvent && (
          <SmartEventModal
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
            event={selectedEvent}
            onUpdate={(updated) => {
              setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
              setSelectedEvent(null);
            }}
          />
        )}

        {showOptimization && (
          <OptimizationModal
            isOpen={showOptimization}
            onClose={() => setShowOptimization(false)}
            currentEvents={events}
            onApprove={(optimizedEvents) => {
              setEvents(optimizedEvents);
              setShowOptimization(false);
              triggerCelebration(CelebrationType.MILESTONE, {
                message: "Week optimized! 🎯",
                intensity: 'high'
              });
            }}
          />
        )}

        {showPrepareReports && (
          <PrepareReportsModal
            isOpen={showPrepareReports}
            onClose={() => setShowPrepareReports(false)}
            onGenerateReports={handleGenerateReports}
            onScheduleRecurring={handleScheduleRecurringReports}
          />
        )}

        {showSmartReschedule && (
          <SmartRescheduleModal
            isOpen={showSmartReschedule}
            onClose={() => setShowSmartReschedule(false)}
            events={filteredEvents}
            onReschedule={handleRescheduleEvents}
          />
        )}

        {showTimeUseReport && (
          <TimeUseReportModal
            isOpen={showTimeUseReport}
            onClose={() => setShowTimeUseReport(false)}
            timeUseData={timeUseData}
          />
        )}

        {showOptimizationRecommendations && (
          <ScheduleOptimizationRecommendationsModal
            isOpen={showOptimizationRecommendations}
            onClose={() => setShowOptimizationRecommendations(false)}
            currentSchedule={events}
            onImplement={handleImplementOptimizations}
          />
        )}

        {showScheduleBreak && (
          <ScheduleBreakModal
            isOpen={showScheduleBreak}
            onClose={() => setShowScheduleBreak(false)}
            onScheduleBreak={handleScheduleBreak}
            selectedDate={selectedDate}
          />
        )}

        {selectedAgent && (
          <AgentDetailModal
            isOpen={!!selectedAgent}
            onClose={() => setSelectedAgent(null)}
            agent={selectedAgent}
          />
        )}

        {showVoiceCommands && (
          <VoiceCommandModal
            isOpen={showVoiceCommands}
            onClose={() => setShowVoiceCommands(false)}
            onCommand={handleVoiceCommand}
          />
        )}

        {showDailyWrapUp && (
          <DailyWrapUpModal
            isOpen={showDailyWrapUp}
            onClose={() => setShowDailyWrapUp(false)}
            dailyData={{
              date: new Date().toLocaleDateString(),
              completedEvents: events.filter(e => e.date <= new Date()).length,
              totalEvents: events.length,
              focusTime: '3h 45m',
              topWins: ['Finished Q4 presentation', 'Client call went great', 'Cleared inbox'],
              tomorrow: events.filter(e => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return e.date.toDateString() === tomorrow.toDateString();
              }).map(e => `${e.title} at ${e.time}`)
            }}
            onSaveReflection={(data) => {
              console.log('Daily reflection saved:', data);
            }}
          />
        )}

        {showWeeklyReview && (
          <WeeklyReviewModal
            isOpen={showWeeklyReview}
            onClose={() => setShowWeeklyReview(false)}
            weekData={{
              totalEvents: events.length,
              totalHours: 35,
              focusHours: 12,
              meetingHours: 18,
              personalHours: 5,
              efficiencyScore: 0.82,
              topAchievements: ['Completed Q4 financial review', 'Launched new marketing campaign'],
              improvements: ['Reduce back-to-back meetings', 'Schedule more deep work time']
            }}
          />
        )}
      </AnimatePresence>

      {/* Overlays */}
      {focusMode && (
        <FocusModeOverlay
          onEnd={() => setFocusMode(false)}
        />
      )}

      {showMeetingCompanion && (
        <MeetingCompanionOverlay
          event={events.find(e => {
            // Find current meeting
            const now = new Date();
            const eventDate = new Date(e.date);
            const eventTime = e.time.split(':');
            eventDate.setHours(parseInt(eventTime[0]), parseInt(eventTime[1]));
            return eventDate <= now && eventDate.getTime() + (e.duration * 60000) >= now.getTime();
          })}
          onClose={() => setShowMeetingCompanion(false)}
        />
      )}
    </div>
  );
};

export default CalendarPage;

