import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AgentActivityTheaterView = () => {
  const [agents, setAgents] = useState([
    { id: 'research-1', name: 'Research', type: 'research', status: 'working', position: { x: 20, y: 30 }, progress: 0.7 },
    { id: 'marketing-1', name: 'Marketing', type: 'marketing', status: 'collaborating', position: { x: 60, y: 20 }, progress: 0.4 },
    { id: 'sales-1', name: 'Sales', type: 'sales', status: 'working', position: { x: 80, y: 60 }, progress: 0.9 },
    { id: 'content-1', name: 'Content', type: 'content', status: 'idle', position: { x: 40, y: 70 }, progress: 0 }
  ]);

  const getAgentColor = (type) => ({
      research: '#3B82F6', marketing: '#10B981', sales: '#F59E0B', content: '#EF4444'
  })[type];

  const getAgentIcon = (type) => ({
      research: '🔍', marketing: '📈', sales: '💼', content: '✍️'
  })[type];

  return (
    <div className="relative w-full h-full bg-gray-700 rounded-lg border overflow-hidden">
      {agents.map((agent) => {
        const color = getAgentColor(agent.type);
        return (
          <motion.div
            key={agent.id}
            className="absolute cursor-pointer"
            style={{ left: `${agent.position.x}%`, top: `${agent.position.y}%` }}
            animate={{ scale: agent.status === 'working' ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 2, repeat: agent.status === 'working' ? Infinity : 0 }}
            whileHover={{ scale: 1.2 }}
          >
            <motion.div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg relative"
              style={{ backgroundColor: color, opacity: agent.status === 'idle' ? 0.4 : 1 }}
            >
              <span className="text-lg">{getAgentIcon(agent.type)}</span>
              {agent.status === 'working' && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AgentActivityTheaterView;
