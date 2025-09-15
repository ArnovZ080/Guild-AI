import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentAvatar } from '../agents/AgentAvatars';

interface Agent {
  id: string;
  name: string;
  type: 'research' | 'marketing' | 'sales' | 'support' | 'content' | 'content-strategist' | 'analytics' | 'strategy' | 'automation';
  status: 'idle' | 'working' | 'collaborating' | 'completed';
  currentTask: string;
  position: { x: number; y: number };
  progress: number;
}

interface Task {
  id: string;
  from: string;
  to: string;
  type: 'data' | 'request' | 'result';
  progress: number;
}

export const AgentActivityTheater: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'research-1',
      name: 'Research Agent',
      type: 'research',
      status: 'working',
      currentTask: 'Analyzing competitor pricing',
      position: { x: 20, y: 30 },
      progress: 0.7
    },
    {
      id: 'marketing-1',
      name: 'Marketing Agent',
      type: 'marketing',
      status: 'collaborating',
      currentTask: 'Creating campaign strategy',
      position: { x: 60, y: 20 },
      progress: 0.4
    },
    {
      id: 'sales-1',
      name: 'Sales Agent',
      type: 'sales',
      status: 'working',
      currentTask: 'Qualifying leads',
      position: { x: 80, y: 60 },
      progress: 0.9
    },
    {
      id: 'content-1',
      name: 'Content Agent',
      type: 'content-strategist',
      status: 'idle',
      currentTask: 'Waiting for brief',
      position: { x: 40, y: 70 },
      progress: 0
    },
    {
      id: 'analytics-1',
      name: 'Analytics Agent',
      type: 'analytics',
      status: 'working',
      currentTask: 'Processing performance data',
      position: { x: 25, y: 85 },
      progress: 0.65
    },
    {
      id: 'strategy-1',
      name: 'Strategy Agent',
      type: 'strategy',
      status: 'collaborating',
      currentTask: 'Developing growth plan',
      position: { x: 75, y: 40 },
      progress: 0.3
    }
  ]);

  const [activeTasks, setActiveTasks] = useState<Task[]>([
    {
      id: 'task-1',
      from: 'research-1',
      to: 'marketing-1',
      type: 'data',
      progress: 0.6
    }
  ]);

  const getAgentColor = (type: string, status: string) => {
    const baseColors = {
      research: '#3B82F6', // Blue
      marketing: '#10B981', // Green
      sales: '#F59E0B', // Amber
      support: '#8B5CF6', // Purple
      content: '#EF4444', // Red
    };

    const statusModifier = {
      idle: 0.4,
      working: 0.8,
      collaborating: 1.0,
      completed: 0.6
    };

    return {
      color: baseColors[type as keyof typeof baseColors],
      opacity: statusModifier[status as keyof typeof statusModifier]
    };
  };

  const getAgentIcon = (type: string) => {
    const icons = {
      research: '🔍',
      marketing: '📈',
      sales: '💼',
      support: '🎧',
      content: '✍️'
    };
    return icons[type as keyof typeof icons];
  };

  // Simulate agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        progress: agent.status === 'working'
          ? Math.min(agent.progress + Math.random() * 0.1, 1)
          : agent.progress
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border overflow-hidden">
      {/* Theater Stage Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-200 opacity-50" />

      {/* Stage Areas */}
      <div className="absolute inset-4">
        {/* Research Area */}
        <div className="absolute left-0 top-0 w-1/3 h-1/2 bg-blue-50 rounded-lg border-2 border-blue-200 border-dashed opacity-30">
          <div className="p-2 text-xs font-medium text-blue-600">Research</div>
        </div>

        {/* Marketing Area */}
        <div className="absolute left-1/3 top-0 w-1/3 h-1/2 bg-green-50 rounded-lg border-2 border-green-200 border-dashed opacity-30">
          <div className="p-2 text-xs font-medium text-green-600">Marketing</div>
        </div>

        {/* Sales Area */}
        <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-amber-50 rounded-lg border-2 border-amber-200 border-dashed opacity-30">
          <div className="p-2 text-xs font-medium text-amber-600">Sales</div>
        </div>

        {/* Operations Area */}
        <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-purple-50 rounded-lg border-2 border-purple-200 border-dashed opacity-30">
          <div className="p-2 text-xs font-medium text-purple-600">Operations</div>
        </div>

        {/* Content Area */}
        <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-red-50 rounded-lg border-2 border-red-200 border-dashed opacity-30">
          <div className="p-2 text-xs font-medium text-red-600">Content</div>
        </div>
      </div>

      {/* Agents */}
      {agents.map((agent) => {
        const { color, opacity } = getAgentColor(agent.type, agent.status);

        return (
          <motion.div
            key={agent.id}
            className="absolute cursor-pointer"
            style={{
              left: `${agent.position.x}%`,
              top: `${agent.position.y}%`,
            }}
            animate={{
              scale: agent.status === 'working' ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: agent.status === 'working' ? Infinity : 0,
            }}
            whileHover={{ scale: 1.2 }}
          >
            {/* Agent Avatar with Personality */}
            <div className="relative">
              <AgentAvatar 
                agentId={agent.type} 
                status={agent.status} 
                size="medium"
                showTooltip={false}
                animated={true}
              />
              
              {/* Progress Ring */}
              {agent.progress > 0 && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="24"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="24"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray={`${agent.progress * 150} 150`}
                    className="transition-all duration-500"
                  />
                </svg>
              )}
            </div>

            {/* Agent Info Tooltip */}
            <motion.div
              className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 min-w-max z-10"
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
            >
              <div className="text-xs font-medium text-gray-800">{agent.name}</div>
              <div className="text-xs text-gray-600">{agent.currentTask}</div>
              <div className="text-xs text-gray-500">
                {Math.round(agent.progress * 100)}% complete
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Task Flow Animations */}
      {activeTasks.map((task) => {
        const fromAgent = agents.find(a => a.id === task.from);
        const toAgent = agents.find(a => a.id === task.to);

        if (!fromAgent || !toAgent) return null;

        return (
          <motion.div
            key={task.id}
            className="absolute w-2 h-2 rounded-full bg-yellow-400 shadow-lg"
            initial={{
              left: `${fromAgent.position.x}%`,
              top: `${fromAgent.position.y}%`,
            }}
            animate={{
              left: `${toAgent.position.x}%`,
              top: `${toAgent.position.y}%`,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      {/* Theater Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button className="px-3 py-1 bg-white rounded-lg shadow text-xs font-medium hover:bg-gray-50">
          Pause
        </button>
        <button className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow text-xs font-medium hover:bg-blue-600">
          Details
        </button>
      </div>
    </div>
  );
};
