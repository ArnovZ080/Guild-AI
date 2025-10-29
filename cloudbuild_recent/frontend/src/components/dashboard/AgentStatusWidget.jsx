import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AgentStatusWidget = () => {
  const [agents, setAgents] = useState([
    { 
      id: '1', 
      name: 'Research Agent', 
      status: 'working', 
      efficiency: 0.92,
      currentTask: 'Analyzing market trends',
      personality: '🔍',
      lastSeen: Date.now() - 120000
    },
    { 
      id: '2', 
      name: 'Content Agent', 
      status: 'online', 
      efficiency: 0.88,
      currentTask: 'Creating blog post',
      personality: '✍️',
      lastSeen: Date.now() - 60000
    },
    { 
      id: '3', 
      name: 'Sales Agent', 
      status: 'busy', 
      efficiency: 0.85,
      currentTask: 'Following up leads',
      personality: '💼',
      lastSeen: Date.now() - 30000
    },
  ]);

  const getStatusColor = (status) => ({
    online: '#10B981',
    working: '#3B82F6',
    busy: '#F59E0B',
    offline: '#6B7280'
  })[status];

  const getStatusAnimation = (status) => {
    if (status === 'working') return { scale: [1, 1.1, 1], transition: { duration: 2, repeat: Infinity } };
    if (status === 'busy') return { opacity: [0.7, 1, 0.7], transition: { duration: 1, repeat: Infinity } };
    return {};
  };

  return (
    <div className="p-6 rounded-2xl" style={{
      background: 'linear-gradient(to bottom right, #111827, #1f2937)',
      color: 'white'
    }}>
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <span className="mr-2">🤖</span>
        Agent Workforce
      </h3>
      
      <div className="space-y-4">
        {agents.map((agent) => (
          <motion.div 
            key={agent.id} 
            className="p-4 rounded-xl transition-colors cursor-pointer"
            style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)' }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative">
                  <div className="text-2xl">{agent.personality}</div>
                  <motion.div 
                    className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2"
                    style={{ 
                      borderColor: '#1f2937',
                      backgroundColor: getStatusColor(agent.status)
                    }}
                    {...getStatusAnimation(agent.status)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{agent.name}</h4>
                  <p className="text-xs text-gray-400 truncate">{agent.currentTask}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500 capitalize">{agent.status}</span>
                    <span className="mx-1 text-gray-600">•</span>
                    <span className="text-xs text-green-400">{Math.round(agent.efficiency * 100)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Efficiency indicator */}
              <div className="w-12 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#374151' }}>
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                  style={{ width: `${agent.efficiency * 100}%` }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AgentStatusWidget;