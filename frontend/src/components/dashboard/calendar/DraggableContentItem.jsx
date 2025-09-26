import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableContentItem = ({ content, onClick, onSelect, isSelected }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'content',
    item: { content },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onSelect(content.content_id, e.target.checked);
  };

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`text-xs p-1 rounded cursor-move hover:opacity-80 transition-opacity ${
        isDragging ? 'opacity-50' : ''
      } ${
        content.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
        content.platform === 'linkedin' ? 'bg-blue-100 text-blue-800' :
        content.platform === 'twitter' ? 'bg-blue-100 text-blue-800' :
        content.platform === 'facebook' ? 'bg-blue-100 text-blue-800' :
        content.platform === 'tiktok' ? 'bg-black text-white' :
        content.platform === 'youtube' ? 'bg-red-100 text-red-800' :
        content.platform === 'email' ? 'bg-green-100 text-green-800' :
        'bg-gray-100 text-gray-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium capitalize">{content.platform}</div>
          <div className="text-xs opacity-75">{content.content_type}</div>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
      </div>
    </div>
  );
};

export default DraggableContentItem;
