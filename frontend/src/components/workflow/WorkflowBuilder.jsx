import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Plus,
  Play,
  Pause,
  Save,
  Download,
  Upload,
  Settings,
  Zap,
  Target,
  Brain,
  MessageSquare,
  BarChart3,
  Calendar,
  FileText,
  Image,
  Video,
  Music,
  Database,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Edit,
  Trash2,
  Copy,
  Move,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Share,
  Heart,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  PieChart,
  Activity,
  Layers,
  Workflow,
  GitBranch,
  GitCommit,
  GitMerge,
  Terminal,
  Code,
  Palette,
  Wand2,
  Sparkles
} from 'lucide-react';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations';

const WorkflowBuilder = ({ onNavigateToChat, onNavigateToDashboard }) => {
  const { currentMode, getModeColors } = useAdaptiveMode();
  const { triggerCelebration } = useCelebrations();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState('draft'); // draft, running, completed, paused
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const adaptiveClasses = getModeColors(currentMode);

  // Node types available in the palette
  const nodeTypes = [
    {
      id: 'trigger',
      name: 'Trigger',
      icon: Zap,
      color: 'bg-green-500',
      description: 'Start your workflow with a trigger event',
      category: 'triggers',
      inputs: 0,
      outputs: 1
    },
    {
      id: 'condition',
      name: 'Condition',
      icon: Target,
      color: 'bg-blue-500',
      description: 'Add conditional logic to your workflow',
      category: 'logic',
      inputs: 1,
      outputs: 2
    },
    {
      id: 'action',
      name: 'Action',
      icon: Play,
      color: 'bg-purple-500',
      description: 'Execute an action or task',
      category: 'actions',
      inputs: 1,
      outputs: 1
    },
    {
      id: 'agent',
      name: 'AI Agent',
      icon: Brain,
      color: 'bg-orange-500',
      description: 'Delegate task to an AI agent',
      category: 'agents',
      inputs: 1,
      outputs: 1
    },
    {
      id: 'delay',
      name: 'Delay',
      icon: Clock,
      color: 'bg-yellow-500',
      description: 'Add a delay or wait period',
      category: 'timing',
      inputs: 1,
      outputs: 1
    },
    {
      id: 'notification',
      name: 'Notification',
      icon: MessageSquare,
      color: 'bg-pink-500',
      description: 'Send notifications or alerts',
      category: 'communication',
      inputs: 1,
      outputs: 1
    },
    {
      id: 'data',
      name: 'Data Processing',
      icon: Database,
      color: 'bg-indigo-500',
      description: 'Process and transform data',
      category: 'data',
      inputs: 1,
      outputs: 1
    },
    {
      id: 'integration',
      name: 'Integration',
      icon: Globe,
      color: 'bg-teal-500',
      description: 'Connect with external services',
      category: 'integrations',
      inputs: 1,
      outputs: 1
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'bg-red-500',
      description: 'Send or process emails',
      category: 'communication',
      inputs: 1,
      outputs: 1
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      color: 'bg-emerald-500',
      description: 'Analyze data and generate insights',
      category: 'analytics',
      inputs: 1,
      outputs: 1
    },
    {
      id: 'schedule',
      name: 'Schedule',
      icon: Calendar,
      color: 'bg-cyan-500',
      description: 'Schedule tasks or events',
      category: 'timing',
      inputs: 1,
      outputs: 1
    },
    {
      id: 'file',
      name: 'File Operation',
      icon: FileText,
      color: 'bg-gray-500',
      description: 'Create, read, or modify files',
      category: 'files',
      inputs: 1,
      outputs: 1
    }
  ];

  const nodeCategories = [
    { id: 'triggers', name: 'Triggers', icon: Zap },
    { id: 'agents', name: 'AI Agents', icon: Brain },
    { id: 'actions', name: 'Actions', icon: Play },
    { id: 'logic', name: 'Logic', icon: Target },
    { id: 'data', name: 'Data', icon: Database },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'integrations', name: 'Integrations', icon: Globe },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'timing', name: 'Timing', icon: Clock },
    { id: 'files', name: 'Files', icon: FileText }
  ];

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#6366f1',
            },
            style: {
              strokeWidth: 2,
              stroke: '#6366f1',
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          nodeType: type,
          status: 'idle',
          ...getNodeDefaults(type)
        },
      };

      setNodes((nds) => nds.concat(newNode));
      triggerCelebration(CelebrationType.COLLABORATION, {
        message: "Node added to workflow! 🔧",
        intensity: 'subtle'
      });
    },
    [reactFlowInstance, setNodes, triggerCelebration]
  );

  const getNodeDefaults = (nodeType) => {
    const typeInfo = nodeTypes.find(t => t.id === nodeType);
    return {
      icon: typeInfo?.icon,
      color: typeInfo?.color,
      inputs: typeInfo?.inputs || 0,
      outputs: typeInfo?.outputs || 1
    };
  };

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleRunWorkflow = () => {
    setIsRunning(true);
    setWorkflowStatus('running');
    triggerCelebration(CelebrationType.MILESTONE, {
      message: "Workflow started! 🚀",
      intensity: 'normal'
    });
    
    // Simulate workflow execution
    setTimeout(() => {
      setIsRunning(false);
      setWorkflowStatus('completed');
      triggerCelebration(CelebrationType.TASK_COMPLETE, {
        message: "Workflow completed! ✅",
        intensity: 'normal'
      });
    }, 5000);
  };

  const handleSaveWorkflow = () => {
    const workflow = {
      name: workflowName,
      description: workflowDescription,
      nodes,
      edges,
      status: workflowStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to localStorage for now
    const savedWorkflows = JSON.parse(localStorage.getItem('saved_workflows') || '[]');
    savedWorkflows.push(workflow);
    localStorage.setItem('saved_workflows', JSON.stringify(savedWorkflows));
    
    triggerCelebration(CelebrationType.EFFICIENCY, {
      message: "Workflow saved! 💾",
      intensity: 'normal'
    });
  };

  const handleShareWorkflow = () => {
    setShowShareModal(true);
    triggerCelebration(CelebrationType.COLLABORATION, {
      message: "Workflow shared! 🤝",
      intensity: 'normal'
    });
  };

  const CustomNode = ({ data, selected }) => {
    const Icon = data.icon;
    return (
      <motion.div
        className={`px-4 py-2 shadow-md rounded-lg border-2 bg-white ${selected ? 'border-blue-500' : 'border-gray-200'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-6 h-6 ${data.color} rounded-full flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-sm">{data.label}</div>
            <div className="text-xs text-gray-500">{data.nodeType}</div>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
      </motion.div>
    );
  };

  const customNodeTypes = {
    custom: CustomNode,
  };

  return (
    <div className={`min-h-screen ${adaptiveClasses.background}`}>
      {/* Header */}
      <div className={`${adaptiveClasses.secondary} border-b ${adaptiveClasses.border} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className={`text-2xl font-bold ${adaptiveClasses.text}`}>
              Workflow Builder
            </h1>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className={`px-3 py-1 ${adaptiveClasses.secondary} ${adaptiveClasses.text} border ${adaptiveClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Workflow name"
              />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                workflowStatus === 'draft' ? 'bg-gray-100 text-gray-800' :
                workflowStatus === 'running' ? 'bg-blue-100 text-blue-800' :
                workflowStatus === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {workflowStatus}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowNodePalette(!showNodePalette)}
              className={`px-4 py-2 ${adaptiveClasses.secondary} ${adaptiveClasses.text} rounded-lg hover:opacity-80 transition-all duration-200 flex items-center space-x-2 border ${adaptiveClasses.border}`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Node</span>
            </button>
            
            <button
              onClick={handleRunWorkflow}
              disabled={isRunning || nodes.length === 0}
              className={`px-4 py-2 bg-gradient-to-r ${adaptiveClasses.primary} text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Running...' : 'Run Workflow'}</span>
            </button>
            
            <button
              onClick={handleSaveWorkflow}
              className={`px-4 py-2 ${adaptiveClasses.secondary} ${adaptiveClasses.text} rounded-lg hover:opacity-80 transition-all duration-200 flex items-center space-x-2 border ${adaptiveClasses.border}`}
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            
            <button
              onClick={handleShareWorkflow}
              className={`px-4 py-2 ${adaptiveClasses.secondary} ${adaptiveClasses.text} rounded-lg hover:opacity-80 transition-all duration-200 flex items-center space-x-2 border ${adaptiveClasses.border}`}
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-4 py-2 ${adaptiveClasses.secondary} ${adaptiveClasses.text} rounded-lg hover:opacity-80 transition-all duration-200 flex items-center space-x-2 border ${adaptiveClasses.border}`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Node Palette */}
        <AnimatePresence>
          {showNodePalette && (
            <motion.div
              className="w-80 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Node Palette
                </h3>
                
                {nodeCategories.map((category) => {
                  const categoryNodes = nodeTypes.filter(node => node.category === category.id);
                  if (categoryNodes.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <category.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {category.name}
                        </h4>
                      </div>
                      
                      <div className="space-y-2">
                        {categoryNodes.map((nodeType) => (
                          <motion.div
                            key={nodeType.id}
                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            draggable
                            onDragStart={(event) => onDragStart(event, nodeType.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 ${nodeType.color} rounded-lg flex items-center justify-center`}>
                                <nodeType.icon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                  {nodeType.name}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {nodeType.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={customNodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            className="bg-gray-50 dark:bg-gray-900"
          >
            <Controls />
            <MiniMap 
              nodeStrokeColor={(n) => {
                if (n.style?.background) return n.style.background;
                if (n.type === 'input') return '#0041d0';
                if (n.type === 'output') return '#ff0072';
                return '#eee';
              }}
              nodeColor={(n) => {
                if (n.style?.background) return n.style.background;
                return '#fff';
              }}
              nodeBorderRadius={2}
            />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
          
          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Workflow className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Start Building Your Workflow
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Drag nodes from the palette to create your automation workflow
                </p>
                <button
                  onClick={() => setShowNodePalette(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors pointer-events-auto"
                >
                  Open Node Palette
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <motion.div
            className="w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-gray-700 p-4"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Node Properties
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    setNodes(nds => nds.map(n => 
                      n.id === selectedNode.id ? { ...n, data: { ...n.data, label: e.target.value } } : n
                    ));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedNode.data.description || ''}
                  onChange={(e) => {
                    setNodes(nds => nds.map(n => 
                      n.id === selectedNode.id ? { ...n, data: { ...n.data, description: e.target.value } } : n
                    ));
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={selectedNode.data.status}
                  onChange={(e) => {
                    setNodes(nds => nds.map(n => 
                      n.id === selectedNode.id ? { ...n, data: { ...n.data, status: e.target.value } } : n
                    ));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="idle">Idle</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WorkflowBuilder;
