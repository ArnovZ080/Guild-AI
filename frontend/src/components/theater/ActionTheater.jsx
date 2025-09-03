import React from 'react';
import AgentChatInterface from './AgentChatInterface';

const ActionTheater = () => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Action Theater</h2>
      <div className="flex-grow bg-gray-600 rounded-lg p-4">
        <AgentChatInterface />
      </div>
    </div>
  );
};

export default ActionTheater;
