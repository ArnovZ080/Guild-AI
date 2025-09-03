import React, { useState } from 'react';
import AgentActivityTheaterView from './AgentActivityTheaterView';
import AgentCollaborationFlow from './AgentCollaborationFlow';

const ActionTheater = () => {
  const [view, setView] = useState('theater'); // 'theater' or 'flow'

  return (
    <div className="h-full flex flex-col text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Action Theater</h2>
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setView('theater')}
            className={`px-3 py-1 text-sm rounded-md ${view === 'theater' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
          >
            Spatial View
          </button>
          <button
            onClick={() => setView('flow')}
            className={`px-3 py-1 text-sm rounded-md ${view === 'flow' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
          >
            Flow View
          </button>
        </div>
      </div>
      <div className="flex-grow bg-gray-600 rounded-lg">
        {view === 'theater' ? <AgentActivityTheaterView /> : <AgentCollaborationFlow />}

      </div>
    </div>
  );
};

export default ActionTheater;
