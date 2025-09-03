import React from 'react';

const TasksWidget = () => {
  return (
    <div className="bg-gray-700 p-4 rounded-lg h-full">
      <h3 className="font-semibold mb-2">Suggested Tasks</h3>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span>Review new ad copy</span>
        </li>
        <li className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span>Approve marketing budget</span>
        </li>
        {/* Placeholder for real tasks */}
      </ul>
    </div>
  );
};

export default TasksWidget;
