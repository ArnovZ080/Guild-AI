import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, ChevronRight, GripVertical, Clock } from 'lucide-react';

// Draggable event component for month view
const DraggableMonthEvent = ({ event, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getEventTypeStyle = (type) => {
    const styles = {
      meeting: 'bg-blue-100 text-blue-800 border-blue-200',
      financial: 'bg-green-100 text-green-800 border-green-200',
      goal: 'bg-purple-100 text-purple-800 border-purple-200',
      personal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reminder: 'bg-orange-100 text-orange-800 border-orange-200',
      content: 'bg-orange-100 text-orange-800 border-orange-200',
      wellness: 'bg-pink-100 text-pink-800 border-pink-200',
      agent_task: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      break: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityIndicator = (priority) => {
    const indicators = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    };
    return indicators[priority] || '';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(event);
      }}
      className={`
        relative p-1 mb-1 rounded text-xs cursor-move hover:shadow-md transition-all
        ${getEventTypeStyle(event.type)}
        ${isDragging ? 'z-50 shadow-2xl' : 'shadow-sm'}
      `}
    >
      <div className="flex items-center space-x-1">
        <GripVertical className="w-2 h-2 text-gray-400 flex-shrink-0" />
        <span className="flex-shrink-0">{getPriorityIndicator(event.priority)}</span>
        <span className="truncate font-medium flex-1">{event.title}</span>
        {event.isPinned && <span className="flex-shrink-0">📌</span>}
      </div>
      <div className="text-xs opacity-75 ml-3 flex items-center space-x-1">
        <Clock className="w-2 h-2" />
        <span>{event.time}</span>
      </div>
    </div>
  );
};

// Droppable day cell component
const DroppableDay = ({ day, events, onEventClick, isCurrentMonth, isToday, isSelected, onClick, children }) => {
  const { setNodeRef } = useSortable({
    id: `day-${day.toISOString()}`,
    data: {
      day: day,
    },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`
        min-h-[120px] border border-gray-200 p-2 cursor-pointer transition-all
        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
        ${isToday ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}
        ${isSelected ? 'bg-blue-50' : ''}
        hover:bg-blue-50/30
      `}
    >
      <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : ''}`}>
        {day.getDate()}
        {isToday && <span className="ml-1 text-xs bg-blue-500 text-white px-1 rounded">Today</span>}
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

const MonthViewWithDragDrop = ({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  events,
  onEventClick,
  onDayClick,
  onRescheduleEvent
}) => {
  const [activeId, setActiveId] = useState(null);

  // Configure sensors for drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Navigation
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

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    }).sort((a, b) => {
      // Sort by time
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
  };

  const days = generateCalendarDays();

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeEvent = events.find(e => e.id === active.id);
      
      if (activeEvent && !activeEvent.isPinned) {
        // Check if dropped on a day
        if (over.id.startsWith('day-')) {
          const dayData = over.data?.current;
          if (dayData && onRescheduleEvent) {
            // Keep the same time, just change the day
            onRescheduleEvent(activeEvent.id, dayData.day, activeEvent.time);
          }
        } else {
          // Dropped on another event
          const overEvent = events.find(e => e.id === over.id);
          if (overEvent && onRescheduleEvent) {
            // Take both the day and time of the target event
            onRescheduleEvent(activeEvent.id, overEvent.date, overEvent.time);
          }
        }
      }
    }
    
    setActiveId(null);
  };

  // Get all sortable IDs (events + day cells)
  const allSortableIds = [
    ...events.map(e => e.id),
    ...days.map(day => `day-${day.toISOString()}`)
  ];

  // Get the active event being dragged
  const activeEvent = activeId ? events.find(e => e.id === activeId) : null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
        <div className="text-white/80 text-sm mt-2">
          💡 Drag events between days to reschedule
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Day Names */}
        <div className="grid grid-cols-7 bg-gray-100 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center font-semibold text-gray-700 text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const dayEvents = getEventsForDate(day);
            const displayedEvents = dayEvents.slice(0, 3); // Show max 3 events
            const hasMore = dayEvents.length > 3;

            return (
              <DroppableDay
                key={index}
                day={day}
                events={dayEvents}
                onEventClick={onEventClick}
                isCurrentMonth={isCurrentMonth}
                isToday={isToday}
                isSelected={isSelected}
                onClick={() => {
                  setSelectedDate(day);
                  if (onDayClick) onDayClick(day);
                }}
              >
                {displayedEvents.map(event => (
                  <DraggableMonthEvent
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                  />
                ))}
                {hasMore && (
                  <div className="text-xs text-gray-500 italic pl-3">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </DroppableDay>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeEvent ? (
            <div className="opacity-90 p-2 bg-white rounded shadow-lg border-2 border-blue-500 min-w-[150px]">
              <div className="font-semibold text-sm">{activeEvent.title}</div>
              <div className="text-xs text-gray-600">{activeEvent.time}</div>
              <div className="text-xs text-gray-500">{activeEvent.type}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default MonthViewWithDragDrop;

