import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { ChevronLeft, ChevronRight, Clock, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Draggable event component for week view
const DraggableWeekEvent = ({ event, onClick }) => {
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
      reminder: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return styles[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      high: 'border-l-4 border-red-500',
      medium: 'border-l-4 border-yellow-500',
      low: 'border-l-4 border-green-500'
    };
    return styles[priority] || 'border-l-4 border-gray-500';
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
        relative p-2 mb-1 rounded shadow-sm hover:shadow-md transition-all cursor-move text-xs
        ${getEventTypeStyle(event.type)}
        ${getPriorityStyle(event.priority)}
        ${isDragging ? 'z-50 shadow-2xl' : ''}
      `}
    >
      <div className="flex items-start space-x-1">
        <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{event.title}</div>
          <div className="text-xs opacity-75 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{event.time}</span>
          </div>
        </div>
      </div>
      {event.isPinned && (
        <span className="absolute top-1 right-1 text-xs">📌</span>
      )}
    </div>
  );
};

// Droppable time slot component
const DroppableTimeSlot = ({ day, timeSlot, events, onEventClick, children }) => {
  const { setNodeRef } = useSortable({
    id: `slot-${day.toISOString()}-${timeSlot.hour}`,
    data: {
      day: day,
      time: timeSlot.time,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="p-2 border-r relative min-h-[60px] hover:bg-blue-50/30 transition-colors"
    >
      {children}
    </div>
  );
};

const WeekViewWithDragDrop = ({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  events,
  onEventClick,
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
        // Check if dropped on a time slot
        if (over.id.startsWith('slot-')) {
          const slotData = over.data?.current;
          if (slotData && onRescheduleEvent) {
            onRescheduleEvent(activeEvent.id, slotData.day, slotData.time);
          }
        } else {
          // Dropped on another event
          const overEvent = events.find(e => e.id === over.id);
          if (overEvent && onRescheduleEvent) {
            onRescheduleEvent(activeEvent.id, overEvent.date, overEvent.time);
          }
        }
      }
    }
    
    setActiveId(null);
  };

  // Get all event IDs and time slot IDs for sortable context
  const allSortableIds = [
    ...events.map(e => e.id),
    ...weekDays.flatMap(day => 
      timeSlots.map(slot => `slot-${day.toISOString()}-${slot.hour}`)
    )
  ];

  // Get the active event being dragged
  const activeEvent = activeId ? events.find(e => e.id === activeId) : null;

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
        <div className="text-white/80 text-sm mt-2">
          💡 Drag events to reschedule across days and times
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
                
                return (
                  <DroppableTimeSlot
                    key={`${timeIndex}-${dayIndex}`}
                    day={day}
                    timeSlot={timeSlot}
                    events={dayEvents}
                    onEventClick={onEventClick}
                  >
                    {dayEvents.map(event => (
                      <DraggableWeekEvent
                        key={event.id}
                        event={event}
                        onClick={onEventClick}
                      />
                    ))}
                  </DroppableTimeSlot>
                );
              })}
            </div>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeEvent ? (
            <div className="opacity-90 p-2 bg-white rounded shadow-lg border-2 border-blue-500">
              <div className="font-semibold text-sm">{activeEvent.title}</div>
              <div className="text-xs text-gray-600">{activeEvent.time}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default WeekViewWithDragDrop;

