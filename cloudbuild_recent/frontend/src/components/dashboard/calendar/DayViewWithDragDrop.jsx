import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Calendar, Plus, Brain, ChevronLeft, ChevronRight } from 'lucide-react';
import DraggableEventCard from './DraggableEventCard';

const DayViewWithDragDrop = ({
  selectedDate,
  setSelectedDate,
  events,
  onEventClick,
  onAddEvent,
  onRescheduleEvent
}) => {
  const [activeId, setActiveId] = useState(null);

  // Configure sensors for drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  // Get events for the selected date
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === selectedDate.toDateString();
  }).sort((a, b) => {
    // Sort by time
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });

  // Navigate days
  const navigateDay = (direction) => {
    setSelectedDate(prev => new Date(prev.getTime() + direction * 24 * 60 * 60 * 1000));
  };

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && over) {
      // Find the dragged event and target event
      const activeEvent = dayEvents.find(e => e.id === active.id);
      const overEvent = dayEvents.find(e => e.id === over.id);

      if (activeEvent && overEvent && !activeEvent.isPinned) {
        // Reschedule to the target event's time
        if (onRescheduleEvent) {
          onRescheduleEvent(activeEvent.id, selectedDate, overEvent.time);
        }
      }
    }
    
    setActiveId(null);
  };

  // Handle drag cancel
  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Get the active event being dragged
  const activeEvent = activeId ? dayEvents.find(e => e.id === activeId) : null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long'
              })}
            </h2>
            <p className="text-blue-100 text-lg">
              {selectedDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDay(-1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateDay(1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onAddEvent}
            className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
          <div className="text-white/80 text-sm">
            💡 Drag events to reschedule
          </div>
        </div>
      </div>

      {/* Events List with Drag and Drop */}
      <div className="p-6">
        {dayEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No events scheduled</p>
            <p className="text-gray-400 text-sm mb-6">Start by adding your first event</p>
            <button
              onClick={onAddEvent}
              className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Add Event</span>
            </button>
          </motion.div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={dayEvents.map(e => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <DraggableEventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Drag Overlay - shows a copy of the dragged event */}
            <DragOverlay>
              {activeEvent ? (
                <div className="opacity-90">
                  <DraggableEventCard
                    event={activeEvent}
                    onClick={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Info Banner */}
        {dayEvents.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Smart Rescheduling</h4>
                <p className="text-sm text-blue-700">
                  Drag and drop events to reorder them. Events marked as 📌 Pinned cannot be moved automatically.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayViewWithDragDrop;

