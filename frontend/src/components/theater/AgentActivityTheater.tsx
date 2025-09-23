import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Agent {
  id: string;
  name: string;
  type: 'research' | 'marketing' | 'sales' | 'support' | 'content';
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
      type: 'content',
      status: 'idle',
      currentTask: 'Waiting for brief',
      position: { x: 40, y: 70 },
      progress: 0
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
    const baseColors: Record<string, string> = {
      research: '#3B82F6',
      marketing: '#10B981',
      sales: '#F59E0B',
      support: '#8B5CF6',
      content: '#EF4444',
    };
    const statusModifier: Record<string, number> = {
      idle: 0.4,
      working: 0.8,
      collaborating: 1.0,
      completed: 0.6
    };
    return {
      color: baseColors[type] || '#6B7280',
      opacity: statusModifier[status] ?? 0.8
    };
  };

  const getAgentIcon = (type: string) => {
    const icons: Record<string, string> = {
      research: '🔍',
      marketing: '📈',
      sales: '💼',
      support: '🎧',
      content: '✍️'
    };
    return icons[type] || '🤖';
  };

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

  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-200 opacity-50" />

      <div className="absolute inset-4">
        <div className="absolute left-0 top-0 w-1/3 h-1/2 bg-blue-50 rounded-lg border-2 border-blue-200 border-dashed opacity-30">
          <div className="p-2 text-xs font-medium text-blue-600">Research</div>
        </div>
        <div className="absolute left-1/3 top-0 w-1/3 h-1/2 bg-green-50 rounded-lg border-2 border-green-200 border-dashed opacity-30">
          <div className="p-2 text-xs font-medium text-green-600">Marketing</div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-amber-50 rounded-lg border-2 border-amber-200 border-dashed opacity-30">
          <div className="p-2 text-xs font-medium text-amber-600">Sales</div>
        </div>
        <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-purple-50 rounded-lg border-2 border-purple-200 border-dashed opacity-30">
          <div className="p-2 text-xs font-medium text-purple-600">Operations</div>
        </div>
        <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-red-50 rounded-lg border-2 border-red-200 border-dashed opacity-30">
          <div className="p-2 text-xs font-medium text-red-600">Content</div>
        </div>
      </div>

      {agents.map((agent) => {
        const { color, opacity } = getAgentColor(agent.type, agent.status);
        return (
          <motion.div
            key={agent.id}
            className="absolute cursor-pointer"
            style={{ left: `${agent.position.x}%`, top: `${agent.position.y}%` }}
            animate={{ scale: agent.status === 'working' ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 2, repeat: agent.status === 'working' ? Infinity : 0 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => setSelected(agent.id)}
          >
            <motion.div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg relative"
              style={{ backgroundColor: color, opacity }}
            >
              <span className="text-lg">{getAgentIcon(agent.type)}</span>
              {agent.status === 'working' && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              )}
              {agent.progress > 0 && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="20"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray={`${agent.progress * 125.6} 125.6`}
                    className="transition-all duration-500"
                  />
                </svg>
              )}
            </motion.div>
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 min-w-max z-10"
              style={{ top: '3.5rem' }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-xs font-medium text-gray-800">{agent.name}</div>
              <div className="text-xs text-gray-600">{agent.currentTask}</div>
              <div className="text-xs text-gray-500">{Math.round(agent.progress * 100)}% complete</div>
            </motion.div>
          </motion.div>
        );
      })}

      {activeTasks.map((task) => {
        const fromAgent = agents.find(a => a.id === task.from);
        const toAgent = agents.find(a => a.id === task.to);
        if (!fromAgent || !toAgent) return null;
        return (
          <motion.div
            key={task.id}
            className="absolute w-2 h-2 rounded-full bg-yellow-400 shadow-lg"
            initial={{ left: `${fromAgent.position.x}%`, top: `${fromAgent.position.y}%` }}
            animate={{ left: `${toAgent.position.x}%`, top: `${toAgent.position.y}%` }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}

      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button className="px-3 py-1 bg-white rounded-lg shadow text-xs font-medium hover:bg-gray-50">Pause</button>
        <button className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow text-xs font-medium hover:bg-blue-600">Details</button>
      </div>

      {selected && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setSelected(null)}>×</button>
            {(() => {
              const a = agents.find(x => x.id === selected);
              if (!a) return null;
              return (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{a.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{a.type} • {a.status}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-1"><span className="text-gray-600">Current Task</span><span className="font-medium">{Math.round(a.progress*100)}%</span></div>
                    <div className="text-gray-800">{a.currentTask}</div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{width: `${a.progress*100}%`}}/></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-800 mb-1">Completed Tasks</div>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Finished prior milestone</li>
                        <li>Synced with teammate</li>
                        <li>Queued deliverable</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-800 mb-1">Upcoming Todos</div>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Prepare handoff</li>
                        <li>Validate output</li>
                        <li>Notify owner</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button className="px-3 py-1.5 text-sm rounded-md border">Assign Task</button>
                    <button className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white">Open Chat</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentActivityTheater;
