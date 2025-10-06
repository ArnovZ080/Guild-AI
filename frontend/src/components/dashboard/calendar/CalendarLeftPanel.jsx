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
  setViewMode,
  events,
  onEventClick,
  onAddEvent,
  aiInsights,
  onOptimizeDay,
  onPrepareReports,
  onReschedule,
  onRescheduleEvent
}) => {
  return (
    <div className="space-y-6">
      {/* AI Briefing Card - Always visible at top */}
      <AIBriefingCard
        date={selectedDate}
        events={events}
        insights={aiInsights}
        onOptimizeDay={onOptimizeDay}
        onPrepareReports={onPrepareReports}
        onReschedule={onReschedule}
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
            onDayClick={(day) => {
              setSelectedDate(day);
              setViewMode('day');
            }}
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
                <DayViewWithDragDrop
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  events={events}
                  onEventClick={onEventClick}
                  onAddEvent={onAddEvent}
                  onRescheduleEvent={onRescheduleEvent}
                />
              )}
      </motion.div>
    </div>
  );
};

export default CalendarLeftPanel;

