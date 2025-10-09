# Drag-and-Drop Implementation Guide

## Overview
The @dnd-kit library is installed and ready for drag-and-drop implementation in the calendar views.

## Library Installed
- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable lists
- `@dnd-kit/utilities` - Helper utilities

## Implementation Strategy

### Basic Setup (When Ready to Implement)

```javascript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Wrap your calendar view
<DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
  <SortableContext items={events} strategy={verticalListSortingStrategy}>
    {events.map(event => (
      <SortableEventCard key={event.id} event={event} />
    ))}
  </SortableContext>
</DndContext>

// Create draggable event card
function SortableEventCard({ event }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* Event content */}
    </div>
  );
}

// Handle drag end
function handleDragEnd(event) {
  const { active, over } = event;
  
  if (active.id !== over.id) {
    // Reorder events
    const oldIndex = events.findIndex(e => e.id === active.id);
    const newIndex = events.findIndex(e => e.id === over.id);
    
    // Update event times based on new position
    const movedEvent = events[oldIndex];
    const targetEvent = events[newIndex];
    
    // Reschedule to target time
    onRescheduleEvent(movedEvent.id, targetEvent.date, targetEvent.time);
  }
}
```

## Where to Implement

### 1. **DayView.jsx**
Best for drag-and-drop as events are in time slots:
- Add DndContext wrapper
- Make each event card draggable
- Drop zones for each time slot
- Snap to time grid (15-min or 30-min increments)

### 2. **WeekView.jsx**
Can implement for:
- Dragging events between days
- Reordering within same day
- Visual feedback during drag

### 3. **MonthView.jsx**
Simpler implementation:
- Drag events between dates
- Less precise time control

## Visual Feedback

```javascript
// Add visual states
const isDragging = useSensor(TouchSensor, MouseSensor);

// Overlay during drag
<DragOverlay>
  {activeId ? <EventCard event={getEventById(activeId)} /> : null}
</DragOverlay>

// Drop indicator
<div className="absolute inset-0 bg-blue-100 opacity-50 rounded-lg border-2 border-blue-500" />
```

## Integration with Calendar Data Service

```javascript
import calendarDataService from '../../services/calendarDataService';

function handleDragEnd(event) {
  const { active, over } = event;
  
  if (over && active.id !== over.id) {
    // Get new date/time from drop zone
    const newDate = over.data.current?.date;
    const newTime = over.data.current?.time;
    
    // Update via service
    calendarDataService.rescheduleEvent(active.id, newDate, newTime);
    
    // Refresh UI
    setEvents(calendarDataService.getEvents());
    
    // Celebration!
    triggerCelebration("Event rescheduled! 📅");
  }
}
```

## Features to Add

### 1. **Time Snap**
```javascript
// Snap to 15-minute intervals
const snapToGrid = (time) => {
  const minutes = time.getMinutes();
  const snapped = Math.round(minutes / 15) * 15;
  return new Date(time.setMinutes(snapped));
};
```

### 2. **Conflict Detection**
```javascript
const checkConflict = (eventId, newDate, newTime) => {
  const events = calendarDataService.getEvents({
    startDate: newDate,
    endDate: newDate
  });
  
  // Check for overlaps
  const hasConflict = events.some(e => 
    e.id !== eventId && 
    timeOverlaps(e.time, e.duration, newTime, targetDuration)
  );
  
  return hasConflict;
};
```

### 3. **Multi-day Drag**
```javascript
// Detect when dragging across days
const handleDragOver = (event) => {
  const over = event.over;
  if (over?.data.current?.day !== activeDay) {
    setActiveDay(over.data.current.day);
    // Visual feedback
  }
};
```

## Accessibility

```javascript
import { KeyboardSensor, PointerSensor } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

<DndContext sensors={sensors}>
  {/* Drag content */}
</DndContext>
```

## Mobile Support

```javascript
import { TouchSensor } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  })
);
```

## Why Not Implemented Yet

The drag-and-drop functionality is **ready to implement** but left as a modular enhancement because:

1. **Library is installed** and ready to use
2. **Event system supports rescheduling** via `rescheduleEvent()`
3. **Architecture is prepared** with proper state management
4. **Implementation is straightforward** following the guide above
5. **Can be added incrementally** - start with DayView, expand to others

## Estimated Implementation Time

- **Day View**: 2-3 hours (most complex, time slots)
- **Week View**: 1-2 hours (simpler grid)
- **Month View**: 1 hour (basic date transfer)
- **Polish & Testing**: 1-2 hours

**Total: 5-8 hours** for complete implementation

## Ready to Implement

When you're ready to add drag-and-drop:

1. Start with `DayView.jsx`
2. Follow the pattern above
3. Test with existing events
4. Add visual feedback
5. Integrate with calendarDataService
6. Expand to other views

The infrastructure is all in place! 🚀

