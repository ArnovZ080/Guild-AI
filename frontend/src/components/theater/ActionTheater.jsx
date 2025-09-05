import React, { useState } from 'react';
import AgentActivityTheaterView from '@/components/theater/AgentActivityTheaterView';
import AgentCollaborationFlow from '@/components/theater/AgentCollaborationFlow';
import AgentChatInterface from '@/components/theater/AgentChatInterface';
const ActionTheater = () => {
  const [view, setView] = useState('chat');
  const renderContent = () => {
    switch(view) {
      case 'theater': return <AgentActivityTheaterView />;
      case 'flow': return <AgentCollaborationFlow />;
      default: return <AgentChatInterface />;
    }
  }

  return (
    <div className="h-full flex flex-col text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Action Theater</h2>
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button onClick={() => setView('chat')} className={`px-3 py-1 text-sm rounded-md ${view === 'chat' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>Chat</button>
          <button onClick={() => setView('theater')} className={`px-3 py-1 text-sm rounded-md ${view === 'theater' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>Spatial</button>
          <button onClick={() => setView('flow')} className={`px-3 py-1 text-sm rounded-md ${view === 'flow' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>Flow</button>
        </div>
      </div>
      <div className="flex-grow bg-gray-600 rounded-lg">{renderContent()}</div>
    </div>
  );
};

export default ActionTheater;
