import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopNav from './calendar/TopNav';
import CalendarLeftPanel from './calendar/CalendarLeftPanel';
import CalendarRightPanel from './calendar/CalendarRightPanel';
import FloatingDock from './calendar/FloatingDock';
import AddEventModal from './modals/AddEventModal';
import SmartEventModal from './modals/SmartEventModal';
import OptimizationModal from './modals/OptimizationModal';
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
      }
    } catch (error) {
      console.error('Failed to add event:', error);
    }
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
    // Trigger day optimization (similar to optimize week but for single day)
    setShowOptimization(true);
    triggerCelebration(CelebrationType.MILESTONE, {
      message: "Optimizing your day... 🎯",
      intensity: 'normal'
    });
  };

  const handlePrepareReports = () => {
    // Trigger agents to prepare reports for today's meetings
    alert('📊 Preparing reports from all agents for today\'s events...\n\nThe following agents are compiling data:\n• Business Intelligence Agent\n• Financial Intelligence Agent\n• Customer Intelligence Agent\n• Content Intelligence Agent');
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: "Reports being prepared! 📊",
      intensity: 'normal'
    });
  };

  const handleReschedule = () => {
    // Open smart rescheduling interface
    alert('🔄 Smart Rescheduling\n\nI\'ll analyze your calendar and suggest optimal times to reschedule low-priority events.');
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: "Analyzing schedule... 🔄",
      intensity: 'normal'
    });
  };

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

