import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, MapPin, Users, GripVertical } from 'lucide-react';

const DraggableEventCard = ({ event, onClick }) => {
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

  const priorityColors = {
    high: 'border-l-red-500 bg-red-50',
    medium: 'border-l-yellow-500 bg-yellow-50',
    low: 'border-l-green-500 bg-green-50'
  };

  const typeColors = {
    meeting: 'bg-blue-500',
    personal: 'bg-purple-500',
    financial: 'bg-green-500',
    content: 'bg-orange-500',
    wellness: 'bg-pink-500',
    agent_task: 'bg-indigo-500',
    goal: 'bg-cyan-500',
    break: 'bg-gray-500'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative border-l-4 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-all cursor-move
        ${priorityColors[event.priority] || 'border-l-gray-500 bg-white'}
        ${isDragging ? 'shadow-2xl scale-105 z-50' : ''}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Event Content */}
      <div 
        className="pl-6"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(event);
        }}
      >
        {/* Type Badge */}
        <div className="flex items-center justify-between mb-1">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium text-white ${typeColors[event.type]}`}>
            {event.type}
          </span>
          {event.isPinned && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
              📌 Pinned
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>

        {/* Time & Duration */}
        <div className="flex items-center space-x-3 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{event.time}</span>
          </div>
          {event.duration && (
            <span className="text-gray-500">({event.duration}min)</span>
          )}
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
            <MapPin className="w-3 h-3" />
            <span>{event.location}</span>
          </div>
        )}

        {/* Attendees */}
        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
            <Users className="w-3 h-3" />
            <span>{event.attendees.length} attendees</span>
          </div>
        )}

        {/* Tasks Progress */}
        {event.tasks && event.tasks.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                {event.tasks.filter(t => t.completed).length}/{event.tasks.length} tasks
              </span>
              <div className="flex-1 ml-2 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${(event.tasks.filter(t => t.completed).length / event.tasks.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dragging Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg border-2 border-blue-500 border-dashed" />
      )}
    </div>
  );
};

export default DraggableEventCard;

