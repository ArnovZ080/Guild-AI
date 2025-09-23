import React, { useState, useEffect } from 'react';
import { Clock, Zap, Coffee, CheckCircle } from 'lucide-react';

const AgentActivityStage = () => {
  const [agents, setAgents] = useState([
    {
      id: 'research-1',
      name: 'Dr. Insight',
      avatar: '🔬',
      status: 'active',
      position: { x: 20, y: 30 },
      targetPosition: { x: 20, y: 30 },
      activity: 'Analyzing market data',
      workstation: 'research-hub',
      energy: 0.8,
      collaboration: null
    },
    {
      id: 'marketing-1',
      name: 'Creative Spark',
      avatar: '🎨',
      status: 'collaborating',
      position: { x: 50, y: 45 },
      targetPosition: { x: 50, y: 45 },
      activity: 'Brainstorming campaign ideas',
      workstation: 'creative-studio',
      energy: 0.9,
      collaboration: 'sales-1'
    },
    {
      id: 'sales-1',
      name: 'Deal Closer',
      avatar: '🤝',
      status: 'collaborating',
      position: { x: 55, y: 50 },
      targetPosition: { x: 55, y: 50 },
      activity: 'Reviewing campaign strategy',
      workstation: 'sales-floor',
      energy: 0.7,
      collaboration: 'marketing-1'
    },
    {
      id: 'content-1',
      name: 'Word Weaver',
      avatar: '✍️',
      status: 'focused',
      position: { x: 80, y: 25 },
      targetPosition: { x: 80, y: 25 },
      activity: 'Writing blog post',
      workstation: 'content-corner',
      energy: 0.6,
      collaboration: null
    }
  ]);

  const workstations = {
    'research-hub': { x: 15, y: 25, width: 25, height: 20, color: 'from-blue-400/20 to-blue-600/20', label: 'Research Hub' },
    'creative-studio': { x: 40, y: 40, width: 30, height: 25, color: 'from-purple-400/20 to-purple-600/20', label: 'Creative Studio' },
    'sales-floor': { x: 45, y: 65, width: 25, height: 20, color: 'from-green-400/20 to-green-600/20', label: 'Sales Floor' },
    'content-corner': { x: 70, y: 20, width: 25, height: 20, color: 'from-yellow-400/20 to-yellow-600/20', label: 'Content Corner' }
  };

  // Simulate organic movement and state changes
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        const microMovement = {
          x: agent.targetPosition.x + (Math.random() - 0.5) * 3,
          y: agent.targetPosition.y + (Math.random() - 0.5) * 3
        };

        const energyChange = (Math.random() - 0.5) * 0.1;
        const newEnergy = Math.max(0.3, Math.min(1, agent.energy + energyChange));

        let newStatus = agent.status;
        if (Math.random() < 0.05) {
          const statuses = ['active', 'focused', 'thinking', 'collaborating'];
          newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        }

        return {
          ...agent,
          position: microMovement,
          energy: newEnergy,
          status: newStatus
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Zap size={12} className="text-green-500" />;
      case 'focused': return <Clock size={12} className="text-blue-500" />;
      case 'thinking': return <Coffee size={12} className="text-yellow-500" />;
      case 'collaborating': return <CheckCircle size={12} className="text-purple-500" />;
      default: return null;
    }
  };

  const getEnergyColor = (energy) => {
    if (energy > 0.7) return 'from-green-400 to-green-600';
    if (energy > 0.4) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Agent Activity Stage</h3>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{agents.filter(a => a.status === 'active').length} active</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span>{agents.filter(a => a.status === 'collaborating').length} collaborating</span>
          </div>
        </div>
      </div>

      <div className="relative bg-card rounded-xl border border-border p-8 overflow-hidden" style={{ height: '400px' }}>
        {/* Workstation Areas */}
        {Object.entries(workstations).map(([key, station]) => (
          <div
            key={key}
            className={`absolute rounded-lg border-2 border-dashed border-border/30 bg-gradient-to-br ${station.color} transition-all duration-1000`}
            style={{
              left: `${station.x}%`,
              top: `${station.y}%`,
              width: `${station.width}%`,
              height: `${station.height}%`
            }}
          >
            <div className="absolute top-2 left-2 text-xs font-medium text-muted-foreground">
              {station.label}
            </div>
          </div>
        ))}

        {/* Collaboration Lines */}
        {agents
          .filter(agent => agent.collaboration)
          .map(agent => {
            const collaborator = agents.find(a => a.id === agent.collaboration);
            if (!collaborator) return null;

            return (
              <svg
                key={`${agent.id}-${collaborator.id}`}
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              >
                <line
                  x1={`${agent.position.x}%`}
                  y1={`${agent.position.y}%`}
                  x2={`${collaborator.position.x}%`}
                  y2={`${collaborator.position.y}%`}
                  stroke="rgba(147, 51, 234, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              </svg>
            );
          })}

        {/* Agent Avatars */}
        {agents.map(agent => (
          <div
            key={agent.id}
            className="absolute transition-all duration-2000 ease-in-out"
            style={{
              left: `${agent.position.x}%`,
              top: `${agent.position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Agent Container */}
            <div className="relative group cursor-pointer">
              {/* Energy Aura */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${getEnergyColor(agent.energy)} opacity-30 animate-pulse`}
                style={{
                  width: '60px',
                  height: '60px',
                  transform: `scale(${0.8 + agent.energy * 0.4})`,
                  filter: `blur(${(1 - agent.energy) * 8}px)`
                }}
              />

              {/* Agent Avatar */}
              <div className="relative w-12 h-12 bg-background rounded-full border-2 border-border flex items-center justify-center text-xl shadow-lg">
                {agent.avatar}
                
                {/* Status Indicator */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-background rounded-full border-2 border-border flex items-center justify-center">
                  {getStatusIcon(agent.status)}
                </div>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-lg border border-border whitespace-nowrap">
                  <div className="font-semibold">{agent.name}</div>
                  <div className="text-muted-foreground">{agent.activity}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="text-muted-foreground">Energy:</div>
                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getEnergyColor(agent.energy)} rounded-full`}
                        style={{ width: `${agent.energy * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Ambient Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default AgentActivityStage;


