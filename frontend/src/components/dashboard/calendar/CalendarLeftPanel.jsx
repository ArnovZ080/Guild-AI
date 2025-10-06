import React from 'react';
import { motion } from 'framer-motion';
import AIBriefingCard from './AIBriefingCard';
import MonthView from './MonthView';
import MonthViewWithDragDrop from './MonthViewWithDragDrop';
import WeekView from './WeekView';
import WeekViewWithDragDrop from './WeekViewWithDragDrop';
import DayView from './DayView';
import DayViewWithDragDrop from './DayViewWithDragDrop';

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
          <MonthViewWithDragDrop
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
            onRescheduleEvent={onRescheduleEvent}
          />
        )}
        
        {viewMode === 'week' && (
          <WeekViewWithDragDrop
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={events}
            onEventClick={onEventClick}
            onRescheduleEvent={onRescheduleEvent}
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

