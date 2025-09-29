import React from 'react';
import { useDrop } from 'react-dnd';
import DraggableContentItem from './DraggableContentItem';

const DroppableCalendarDay = ({ date, content, onContentMove, onContentClick, onContentSelect, selectedItems, isCurrentMonth = true, isToday = false, isInHighlightedRange = false, isRangeStart = false, isRangeEnd = false }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'content',
    drop: (item) => {
      const newDate = new Date(date);
      newDate.setHours(12, 0, 0, 0);
      onContentMove(item.content, newDate);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`relative min-h-[120px] border border-gray-200 rounded-lg p-2 transition-colors ${
        isOver && canDrop ? 'bg-purple-50 border-purple-300' : 
        isToday ? 'bg-blue-50 border-blue-300' :
        isCurrentMonth ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60'
      }`}
    >
      {isInHighlightedRange && (
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isRangeStart && isRangeEnd ? 'rounded-full' :
            isRangeStart ? 'rounded-l-full' :
            isRangeEnd ? 'rounded-r-full' : ''
          } bg-purple-400`}
          title="Highlighted campaign period"
        />
      )}
      <div className="flex items-center justify-between mb-2">
        <div className={`text-sm font-medium ${
          isToday ? 'text-blue-700 bg-blue-100 px-2 py-1 rounded-full' :
          isCurrentMonth ? 'text-gray-900' : 'text-gray-500'
        }`}>
          {date.getDate()}
        </div>
        {content.length > 0 && (
          <div className="text-xs text-purple-600 font-medium">
            {content.length}
          </div>
        )}
      </div>
      <div className="space-y-1">
        {content.slice(0, 3).map((item, idx) => (
          <DraggableContentItem
            key={idx}
            content={item}
            onClick={() => onContentClick(item)}
            onSelect={onContentSelect}
            isSelected={selectedItems.has(item.content_id)}
          />
        ))}
        {content.length > 3 && (
          <div className="text-xs text-gray-500">
            +{content.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};

export default DroppableCalendarDay;
