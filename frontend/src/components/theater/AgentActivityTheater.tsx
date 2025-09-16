import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AgentPersonality from '../agents/AgentPersonality';

interface Agent {
  id: string;
  name: string;
  type: 'research' | 'marketing' | 'sales' | 'support' | 'content' | 'content-strategist' | 'analytics' | 'strategy' | 'automation';
  status: 'idle' | 'working' | 'collaborating' | 'completed';
  currentTask: string;
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
      progress: 0.7
    },
    {
      id: 'marketing-1',
      name: 'Marketing Agent',
      type: 'marketing',
      status: 'collaborating',
      currentTask: 'Creating campaign strategy',
      progress: 0.4
    },
    {
      id: 'sales-1',
      name: 'Sales Agent',
      type: 'sales',
      status: 'working',
      currentTask: 'Qualifying leads',
      progress: 0.9
    },
    {
      id: 'content-1',
      name: 'Content Agent',
      type: 'content-strategist',
      status: 'idle',
      currentTask: 'Waiting for brief',
      progress: 0
    },
    {
      id: 'analytics-1',
      name: 'Analytics Agent',
      type: 'analytics',
      status: 'working',
      currentTask: 'Processing performance data',
      progress: 0.65
    },
    {
      id: 'strategy-1',
      name: 'Strategy Agent',
      type: 'strategy',
      status: 'collaborating',
      currentTask: 'Developing growth plan',
      progress: 0.3
    }
  ]);

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

  const handleAgentInteraction = (agentId: string, interaction: any) => {
    console.log(`Interaction with agent ${agentId}:`, interaction);
    // This is a placeholder for future implementation
  };

  return (
    <motion.div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Your AI Workforce</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-forest-growth rounded-full animate-pulse"></div>
          <span>Live collaboration in progress</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <AgentPersonality
            key={agent.id}
            agent={agent}
            onInteraction={(interaction: any) => handleAgentInteraction(agent.id, interaction)}
          />
        ))}
      </div>
    </motion.div>
  );
};
