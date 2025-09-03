import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AgentStatusWidget = () => {
  const [agents, setAgents] = useState([
    {
      id: '1',
      name: 'Research Agent',
      status: 'busy',
      currentTask: 'Analyzing competitor data',
      tasksCompleted: 23,
      efficiency: 0.92,
      lastActive: new Date()
    },
    {
      id: '2',
      name: 'Content Agent',
      status: 'online',
      tasksCompleted: 18,
      efficiency: 0.88,
      lastActive: new Date(Date.now() - 300000)
    },
    {
      id: '3',
      name: 'Sales Agent',
      status: 'offline',
      tasksCompleted: 31,
      efficiency: 0.95,
      lastActive: new Date(Date.now() - 1800000)
    }
  ]);

  const getStatusColor = (status) => {
    const colors = {
      online: '#10B981',
      busy: '#F59E0B',
      offline: '#6B7280'
    };
    return colors[status];
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: agent.id === '2' && Math.random() > 0.5 ? 'busy' : agent.status,
        currentTask: agent.id === '2' && agent.status === 'busy' ? 'Drafting new ad copy' : agent.currentTask,
        lastActive: agent.status !== 'offline' ? new Date() : agent.lastActive
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg h-full text-white">
      <h3 className="font-semibold mb-4">Agent Status</h3>
      <div className="space-y-4">
        {agents.map((agent) => (
          <motion.div
            key={agent.id}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            layout
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getStatusColor(agent.status) }}
                  animate={agent.status === 'busy' ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1.5, repeat: agent.status === 'busy' ? Infinity : 0 }}
                />
                <div>
                  <h4 className="font-medium text-sm">{agent.name}</h4>
                  <p className="text-xs text-gray-400 capitalize">{agent.status === 'busy' ? agent.currentTask : agent.status}</p>
                </div>
              </div>
              <div className="text-xs font-mono bg-gray-900 px-2 py-1 rounded">
                {Math.round(agent.efficiency * 100)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AgentStatusWidget;
