import React from 'react';
import { motion } from 'framer-motion';
import AIBriefingCard from './AIBriefingCard';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';

const CalendarLeftPanel = ({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  viewMode,
  events,
  onEventClick,
  onAddEvent,
  aiInsights
}) => {
  return (
    <div className="space-y-6">
      {/* AI Briefing Card - Always visible at top */}
      <AIBriefingCard
        date={selectedDate}
        events={events}
        insights={aiInsights}
      />

      {/* Calendar View based on mode */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === 'month' && (
          <MonthView
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={events}
            onEventClick={onEventClick}
          />
        )}
        
        {viewMode === 'week' && (
          <WeekView
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={events}
            onEventClick={onEventClick}
          />
        )}
        
        {viewMode === 'day' && (
          <DayView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={events}
            onEventClick={onEventClick}
            onAddEvent={onAddEvent}
          />
        )}
      </motion.div>
    </div>
  );
};

export default CalendarLeftPanel;

