import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import AgentPersonality from '../agents/AgentPersonality';
import { usePsychologicalOptimization } from '../../contexts/PsychologicalOptimizationContext';
import { useCelebrations } from '../../contexts/CelebrationContext';
import { Bot, Play, Pause, Settings, Eye, EyeOff } from 'lucide-react';

// Define stage areas and their approximate ReactFlow coordinates
const stageAreas = {
  research: { x: 100, y: 50, width: 200, height: 150, label: 'Research Hub' },
  marketing: { x: 400, y: 50, width: 200, height: 150, label: 'Marketing Studio' },
  sales: { x: 700, y: 50, width: 200, height: 150, label: 'Sales Floor' },
  operations: { x: 100, y: 250, width: 200, height: 150, label: 'Operations Center' },
  content: { x: 400, y: 250, width: 200, height: 150, label: 'Content Workshop' },
};

// Custom Node for ReactFlow to represent tasks/workflow steps
const CustomTaskNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-sm">
    <div className="text-sm font-semibold">{data.label}</div>
    {data.agent && <div className="text-xs text-gray-500">Assigned: {data.agent}</div>}
  </div>
);

const nodeTypes = { taskNode: CustomTaskNode };

interface AgentActivityTheaterProps {
  onOpenFullConversation?: (agentId: string) => void;
}

export const AgentActivityTheater: React.FC<AgentActivityTheaterProps> = ({ 
  onOpenFullConversation 
}) => {
  const { state: psychState, getCurrentMode } = usePsychologicalOptimization();
  const { triggerTaskCompletionCelebration } = useCelebrations();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  
  const [agents, setAgents] = useState([
    { 
      id: 'research-1', 
      type: 'research', 
      status: 'working', 
      currentTask: 'Analyzing competitor pricing strategies', 
      stageArea: 'research', 
      progress: 0.7,
      currentEmotion: 'focused',
      efficiency: 0.92,
      tasksCompleted: 23,
      lastActive: new Date()
    },
    { 
      id: 'marketing-1', 
      type: 'marketing', 
      status: 'collaborating', 
      currentTask: 'Creating campaign strategy for Q4 launch', 
      stageArea: 'marketing', 
      progress: 0.4,
      currentEmotion: 'inspired',
      efficiency: 0.88,
      tasksCompleted: 18,
      lastActive: new Date()
    },
    { 
      id: 'sales-1', 
      type: 'sales', 
      status: 'working', 
      currentTask: 'Following up with high-value prospects', 
      stageArea: 'sales', 
      progress: 0.6,
      currentEmotion: 'confident',
      efficiency: 0.95,
      tasksCompleted: 31,
      lastActive: new Date()
    },
    { 
      id: 'content-1', 
      type: 'content', 
      status: 'working', 
      currentTask: 'Drafting thought leadership articles', 
      stageArea: 'content', 
      progress: 0.8,
      currentEmotion: 'creative',
      efficiency: 0.89,
      tasksCompleted: 25,
      lastActive: new Date()
    },
    { 
      id: 'operations-1', 
      type: 'operations', 
      status: 'idle', 
      currentTask: 'Optimizing workflow processes', 
      stageArea: 'operations', 
      progress: 0.3,
      currentEmotion: 'organized',
      efficiency: 0.85,
      tasksCompleted: 15,
      lastActive: new Date(Date.now() - 1800000)
    }
  ]);

  // Generate ReactFlow nodes and edges based on workflow state
  useEffect(() => {
    const initialNodes: Node[] = [
      { 
        id: '1', 
        type: 'taskNode', 
        position: { x: stageAreas.research.x + 50, y: stageAreas.research.y + 50 }, 
        data: { label: 'Market Research', agent: 'Dr. Insight' } 
      },
      { 
        id: '2', 
        type: 'taskNode', 
        position: { x: stageAreas.marketing.x + 50, y: stageAreas.marketing.y + 50 }, 
        data: { label: 'Campaign Planning', agent: 'Creative Spark' } 
      },
      { 
        id: '3', 
        type: 'taskNode', 
        position: { x: stageAreas.sales.x + 50, y: stageAreas.sales.y + 50 }, 
        data: { label: 'Lead Nurturing', agent: 'Deal Closer' } 
      },
      { 
        id: '4', 
        type: 'taskNode', 
        position: { x: stageAreas.content.x + 50, y: stageAreas.content.y + 50 }, 
        data: { label: 'Content Creation', agent: 'Story Weaver' } 
      },
      { 
        id: '5', 
        type: 'taskNode', 
        position: { x: stageAreas.operations.x + 50, y: stageAreas.operations.y + 50 }, 
        data: { label: 'Process Optimization', agent: 'Efficiency Expert' } 
      }
    ];

    const initialEdges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, label: 'Research → Strategy' },
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true, label: 'Strategy → Sales' },
      { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', animated: true, label: 'Strategy → Content' },
      { id: 'e5-1', source: '5', target: '1', type: 'smoothstep', animated: true, label: 'Ops → Research' }
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  // Simulate agent movement and task completion
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAgents(prevAgents => prevAgents.map(agent => {
        // Simulate progress updates
        const newProgress = Math.min(1, agent.progress + (Math.random() * 0.1));
        
        // Simulate task completion and movement
        if (newProgress >= 1 && agent.status === 'working') {
          // Trigger celebration for completed task
          triggerTaskCompletionCelebration({
            name: agent.currentTask,
            difficulty: Math.random() > 0.7 ? 'hard' : 'medium',
            type: 'content_publish',
            isLinkedToMajorGoal: Math.random() > 0.5,
            revenueImpact: Math.floor(Math.random() * 5000) + 1000
          });

          // Move to next stage or reset
          const stages = Object.keys(stageAreas);
          const currentStageIndex = stages.indexOf(agent.stageArea);
          const nextStage = stages[(currentStageIndex + 1) % stages.length];
          
          return { 
            ...agent, 
            status: 'idle', 
            stageArea: nextStage, 
            currentTask: 'Awaiting new assignment',
            progress: 0,
            currentEmotion: 'satisfied',
            tasksCompleted: agent.tasksCompleted + 1,
            lastActive: new Date()
          };
        }
        
        // Update progress
        return { ...agent, progress: newProgress };
      }));

      // Simulate task flow animations
      setActiveTasks(prev => [
        ...prev.slice(-5), // Keep only last 5 tasks
        {
          id: `task-${Date.now()}`,
          from: agents[Math.floor(Math.random() * agents.length)].id,
          to: agents[Math.floor(Math.random() * agents.length)].id,
          type: 'data',
          progress: 0.6
        }
      ]);
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, [triggerTaskCompletionCelebration, isPlaying, agents]);

  // Function to get agent's current position based on stageArea
  const getAgentPosition = (agent: any) => {
    const area = stageAreas[agent.stageArea as keyof typeof stageAreas];
    if (area) {
      // Add some randomness to position within the area
      const randomOffset = {
        x: (Math.random() - 0.5) * (area.width - 80), // Leave space for avatar
        y: (Math.random() - 0.5) * (area.height - 80)
      };
      return { 
        x: area.x + area.width / 2 + randomOffset.x, 
        y: area.y + area.height / 2 + randomOffset.y 
      };
    }
    return { x: 0, y: 0 };
  };

  const currentMode = getCurrentMode();

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          border: 'border-sky-morning/30',
          text: 'text-sky-dusk'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          border: 'border-forest-spring/30',
          text: 'text-forest-deep'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          border: 'border-earth-warm/30',
          text: 'text-earth-sand'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          border: 'border-forest-spring/30',
          text: 'text-forest-deep'
        };
    }
  };

  const modeStyles = getModeStyles();

  return (
    <motion.div
      className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Header with Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className={`text-2xl font-semibold ${modeStyles.text}`}>
            🎭 Agent Activity Theater
          </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
            <motion.div 
              className="w-2 h-2 bg-forest-growth rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>{isPlaying ? 'Live Collaboration in Progress' : 'Theater Paused'}</span>
          </div>
        </div>

        {/* Theater Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg transition-all ${
              isPlaying 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`p-2 rounded-lg transition-all ${
              showDetails 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showDetails ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <motion.div 
        className={`relative w-full h-[calc(100%-40px)] bg-gradient-to-br ${modeStyles.background} rounded-xl border-2 ${modeStyles.border} overflow-hidden shadow-lg`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Theater Stage Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-200 opacity-50" />
        
        {/* Stage Areas with Enhanced Styling */}
        <div className="absolute inset-4">
          {/* Research Area */}
          <div className="absolute left-0 top-0 w-1/3 h-1/2 bg-blue-50 rounded-lg border-2 border-blue-200 border-dashed opacity-30">
            <div className="p-2 text-xs font-medium text-blue-600">Research Hub</div>
          </div>
          
          {/* Marketing Area */}
          <div className="absolute left-1/3 top-0 w-1/3 h-1/2 bg-green-50 rounded-lg border-2 border-green-200 border-dashed opacity-30">
            <div className="p-2 text-xs font-medium text-green-600">Marketing Studio</div>
          </div>
          
          {/* Sales Area */}
          <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-amber-50 rounded-lg border-2 border-amber-200 border-dashed opacity-30">
            <div className="p-2 text-xs font-medium text-amber-600">Sales Floor</div>
          </div>
          
          {/* Operations Area */}
          <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-purple-50 rounded-lg border-2 border-purple-200 border-dashed opacity-30">
            <div className="p-2 text-xs font-medium text-purple-600">Operations Center</div>
          </div>
          
          {/* Content Area */}
          <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-red-50 rounded-lg border-2 border-red-200 border-dashed opacity-30">
            <div className="p-2 text-xs font-medium text-red-600">Content Workshop</div>
          </div>
        </div>

        {/* ReactFlow Background Layer */}
        {showDetails && (
          <div className="absolute inset-0 z-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <MiniMap 
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                nodeColor={(node) => '#3B82F6'}
                nodeStrokeWidth={3}
              />
              <Controls 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}
              />
              <Background 
                variant="dots" 
                gap={20} 
                size={1} 
                color="rgba(255, 255, 255, 0.3)"
              />
            </ReactFlow>
          </div>
        )}

        {/* Agent Avatars Layer with Enhanced Features */}
        <AnimatePresence>
          {agents.map(agent => {
            const { x, y } = getAgentPosition(agent);
            return (
              <motion.div
                key={agent.id}
                className="absolute z-10 cursor-pointer"
                style={{ 
                  transform: 'translate(-50%, -50%)',
                  left: `${x}px`,
                  top: `${y}px`
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: agent.status === 'working' ? 1.05 : 1,
                  x: 0, 
                  y: 0 
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  duration: 1.5, 
                  type: 'spring', 
                  stiffness: 100, 
                  damping: 20 
                }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
              >
                <AgentPersonality 
                  agent={agent} 
                  size="small"
                  onOpenFullConversation={onOpenFullConversation}
                />
                
                {/* Agent Info Tooltip */}
                {showDetails && (
                  <motion.div
                    className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-max z-20"
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                  >
                    <div className="text-xs font-medium text-gray-800">{agent.id.replace('-', ' ')}</div>
                    <div className="text-xs text-gray-600">{agent.currentTask}</div>
                    <div className="text-xs text-gray-500">
                      Efficiency: {Math.round(agent.efficiency * 100)}% | 
                      Tasks: {agent.tasksCompleted}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Task Flow Animations */}
        {showDetails && activeTasks.map((task) => {
          const fromAgent = agents.find(a => a.id === task.from);
          const toAgent = agents.find(a => a.id === task.to);
          
          if (!fromAgent || !toAgent) return null;
          
          return (
            <motion.div
              key={task.id}
              className="absolute w-3 h-3 rounded-full bg-yellow-400 shadow-lg z-5"
              initial={{
                left: `${getAgentPosition(fromAgent).x}px`,
                top: `${getAgentPosition(fromAgent).y}px`,
              }}
              animate={{
                left: `${getAgentPosition(toAgent).x}px`,
                top: `${getAgentPosition(toAgent).y}px`,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          );
        })}

        {/* Agent Detail Panel */}
        {selectedAgent && showDetails && (
          <motion.div
            className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-xs z-30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedAgent(null)}
            >
              ×
            </button>
            {(() => {
              const agent = agents.find(a => a.id === selectedAgent);
              if (!agent) return null;
              
              return (
                <>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{agent.id.replace('-', ' ')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium capitalize">{agent.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Efficiency:</span>
                      <span className="font-medium">{Math.round(agent.efficiency * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasks Completed:</span>
                      <span className="font-medium">{agent.tasksCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Active:</span>
                      <span className="font-medium">{agent.lastActive.toLocaleTimeString()}</span>
                    </div>
                    <div className="mt-3">
                      <div className="text-gray-600 mb-1">Current Task Progress:</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${agent.progress * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}

        {/* Theater Stats */}
        {showDetails && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg p-3 text-white text-xs">
            <div className="space-y-1">
              <div>Active Agents: {agents.filter(a => a.status === 'working').length}</div>
              <div>Total Tasks: {agents.reduce((sum, a) => sum + a.tasksCompleted, 0)}</div>
              <div>Avg Efficiency: {Math.round(agents.reduce((sum, a) => sum + a.efficiency, 0) / agents.length * 100)}%</div>
            </div>
      </div>
        )}
      </motion.div>
    </motion.div>
  );
};
