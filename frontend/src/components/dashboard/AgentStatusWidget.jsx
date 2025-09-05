import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
const AgentStatusWidget = () => {
  // eslint-disable-next-line no-unused-vars
  const [agents, setAgents] = useState([

    { id: '1', name: 'Research Agent', status: 'busy', efficiency: 0.92 },
    { id: '2', name: 'Content Agent', status: 'online', efficiency: 0.88 },
  ]);
  const getStatusColor = (status) => ({ online: '#10B981', busy: '#F59E0B', offline: '#6B7280' })[status];

  return (
    <div className="bg-gray-800 p-4 rounded-lg h-full text-white">
      <h3 className="font-semibold mb-4">Agent Status</h3>
      <div className="space-y-4">
        {agents.map((agent) => (
          <motion.div key={agent.id} layout className="p-2 hover:bg-gray-700 rounded-md transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(agent.status) }} />
                <div><h4 className="font-medium text-sm">{agent.name}</h4></div>
              </div>
            </div>
          </motion.div>

        ))}
      </div>
    </div>
  );
};

export default AgentStatusWidget;
