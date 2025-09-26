import React from 'react';
import { useDrop } from 'react-dnd';
import DraggableContentItem from './DraggableContentItem';

const DroppableCalendarDay = ({ date, content, onContentMove, onContentClick, onContentSelect, selectedItems }) => {
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
      className={`min-h-[120px] border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors ${
        isOver && canDrop ? 'bg-purple-50 border-purple-300' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-900">
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
