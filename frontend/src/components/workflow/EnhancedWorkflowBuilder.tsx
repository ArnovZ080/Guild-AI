import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
import { 
  Plus, 
  Save, 
  Share2, 
  Play, 
  Settings, 
  Trash2, 
  Bot, 
  MessageSquare, 
  GitBranch, 
  Clock, 
  DollarSign,
  Wand2,
  Lightbulb,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Brain,
  Zap,
  Mail,
  Phone,
  Calendar,
  FileText,
  Users,
  Building,
  ToggleLeft,
  ToggleRight,
  Layers,
  Workflow
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Workflow Modes
type WorkflowMode = 'ai-generated' | 'manual-construction' | 'hybrid';

// AI-Powered Node Types with Enhanced Features
const ENHANCED_NODE_TYPES = {
  // Core Agent Types
  marketing: {
    icon: '📢',
    color: 'blue',
    description: 'AI-powered marketing automation',
    examples: [
      "Create a social media campaign for my new product launch",
      "Send personalized emails to my customer list",
      "Generate ad copy for Facebook and Instagram",
      "Schedule posts across all social media platforms"
    ],
    baseCredits: 5
  },
  sales: {
    icon: '💰',
    color: 'green', 
    description: 'Intelligent sales automation',
    examples: [
      "Follow up with leads who downloaded my ebook",
      "Qualify prospects based on their website behavior",
      "Schedule demos for interested customers",
      "Send personalized sales sequences"
    ],
    baseCredits: 4
  },
  content: {
    icon: '📝',
    color: 'purple',
    description: 'Automated content creation',
    examples: [
      "Write blog posts about AI productivity tools",
      "Create social media content for the week",
      "Generate product descriptions for my e-commerce store",
      "Create email newsletter content"
    ],
    baseCredits: 6
  },
  operations: {
    icon: '⚙️',
    color: 'orange',
    description: 'Business process automation',
    examples: [
      "Process customer support tickets automatically",
      "Update inventory when products are sold",
      "Generate weekly business reports",
      "Automate data entry tasks"
    ],
    baseCredits: 3
  },
  research: {
    icon: '🔍',
    color: 'indigo',
    description: 'Intelligent research automation',
    examples: [
      "Research competitors and their pricing strategies",
      "Find potential customers in my industry",
      "Analyze market trends for my product category",
      "Monitor brand mentions across the web"
    ],
    baseCredits: 5
  },
  finance: {
    icon: '📊',
    color: 'red',
    description: 'Financial process automation',
    examples: [
      "Track expenses and categorize them automatically",
      "Generate monthly financial reports",
      "Monitor cash flow and send alerts",
      "Process invoices and payments"
    ],
    baseCredits: 4
  },
  // Industry-Specific Nodes
  property: {
    icon: '🏠',
    color: 'teal',
    description: 'Real estate automation',
    examples: [
      "Respond to property inquiries with matching listings",
      "Qualify buyers based on budget and timeline",
      "Schedule property viewings automatically",
      "Generate purchase agreements and contracts"
    ],
    baseCredits: 5
  },
  ecommerce: {
    icon: '🛒',
    color: 'pink',
    description: 'E-commerce automation',
    examples: [
      "Process orders and update inventory",
      "Send personalized product recommendations",
      "Handle abandoned cart recovery",
      "Generate customer support responses"
    ],
    baseCredits: 4
  },
  healthcare: {
    icon: '🏥',
    color: 'emerald',
    description: 'Healthcare workflow automation',
    examples: [
      "Schedule patient appointments automatically",
      "Send appointment reminders and confirmations",
      "Process insurance verifications",
      "Generate patient care reports"
    ],
    baseCredits: 6
  },
  // Content Creation & Media
  contentcreator: {
    icon: '🎬',
    color: 'yellow',
    description: 'Content creator automation',
    examples: [
      "Schedule social media posts across all platforms",
      "Generate video ideas and scripts automatically",
      "Respond to comments and DMs with engagement",
      "Create content calendars and posting schedules"
    ],
    baseCredits: 5
  },
  copywriter: {
    icon: '✍️',
    color: 'indigo',
    description: 'Copywriting and content automation',
    examples: [
      "Generate sales copy for different audiences",
      "Create email sequences for client campaigns",
      "Write product descriptions and landing pages",
      "Develop content strategies and calendars"
    ],
    baseCredits: 6
  },
  affiliate: {
    icon: '💰',
    color: 'green',
    description: 'Affiliate marketing automation',
    examples: [
      "Track affiliate links and commissions",
      "Generate product review content",
      "Automate follow-up sequences for leads",
      "Create comparison charts and recommendations"
    ],
    baseCredits: 4
  },
  // Personal Services
  beauty: {
    icon: '💄',
    color: 'rose',
    description: 'Beauty and wellness services',
    examples: [
      "Schedule appointments and send reminders",
      "Send after-care instructions and tips",
      "Process payments and manage customer records",
      "Generate marketing content for services"
    ],
    baseCredits: 4
  },
  barber: {
    icon: '✂️',
    color: 'blue',
    description: 'Barber shop and salon automation',
    examples: [
      "Book appointments and manage schedules",
      "Send appointment confirmations and reminders",
      "Process payments and track customer preferences",
      "Generate promotional content for services"
    ],
    baseCredits: 4
  },
  // Food & Beverage
  foodservice: {
    icon: '🍰',
    color: 'orange',
    description: 'Food service and catering',
    examples: [
      "Take orders and manage inventory",
      "Send order confirmations and delivery updates",
      "Process payments and track customer preferences",
      "Generate menu updates and promotional content"
    ],
    baseCredits: 4
  },
  baker: {
    icon: '🥖',
    color: 'amber',
    description: 'Bakery and confectionery',
    examples: [
      "Take custom cake orders with specifications",
      "Send order confirmations and pickup reminders",
      "Manage ingredient inventory and ordering",
      "Generate seasonal menu promotions"
    ],
    baseCredits: 4
  },
  // Professional Services
  consultant: {
    icon: '💼',
    color: 'slate',
    description: 'Consulting and advisory services',
    examples: [
      "Schedule discovery calls and consultations",
      "Generate proposals and contracts",
      "Track project progress and deliverables",
      "Create follow-up sequences for clients"
    ],
    baseCredits: 5
  },
  coach: {
    icon: '🎯',
    color: 'emerald',
    description: 'Coaching and training services',
    examples: [
      "Schedule sessions and send reminders",
      "Track client progress and goals",
      "Generate personalized content and exercises",
      "Send motivational messages and check-ins"
    ],
    baseCredits: 5
  },
  // Creative Services
  designer: {
    icon: '🎨',
    color: 'purple',
    description: 'Design and creative services',
    examples: [
      "Manage project timelines and milestones",
      "Generate design briefs from client requirements",
      "Process feedback and revision requests",
      "Create portfolio showcases and case studies"
    ],
    baseCredits: 5
  },
  photographer: {
    icon: '📸',
    color: 'sky',
    description: 'Photography and videography',
    examples: [
      "Schedule photo shoots and send reminders",
      "Process bookings and manage equipment needs",
      "Send galleries and handle client feedback",
      "Generate marketing content and portfolios"
    ],
    baseCredits: 4
  },
  // Home Services
  cleaning: {
    icon: '🧽',
    color: 'cyan',
    description: 'Cleaning and maintenance services',
    examples: [
      "Schedule cleaning appointments",
      "Send service reminders and confirmations",
      "Track supplies and inventory management",
      "Generate quotes and process payments"
    ],
    baseCredits: 3
  },
  landscaping: {
    icon: '🌱',
    color: 'lime',
    description: 'Landscaping and outdoor services',
    examples: [
      "Schedule seasonal maintenance visits",
      "Send weather-based service updates",
      "Manage equipment and supply inventory",
      "Generate project proposals and quotes"
    ],
    baseCredits: 4
  },
  // Custom Industry
  custom: {
    icon: '🔧',
    color: 'gray',
    description: 'Custom business automation',
    examples: [
      "Build workflows specific to your industry",
      "Create custom automation for unique processes",
      "Develop specialized customer interactions",
      "Automate your specific business workflows"
    ],
    baseCredits: 5
  }
};

// Enhanced Node Component
const EnhancedNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const nodeType = ENHANCED_NODE_TYPES[data.category as keyof typeof ENHANCED_NODE_TYPES];
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'executing': return <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'configured': return 'border-green-400 bg-green-50';
      case 'executing': return 'border-yellow-400 bg-yellow-50';
      case 'completed': return 'border-green-500 bg-green-100';
      case 'error': return 'border-red-400 bg-red-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-xl border-2 transition-all duration-200 ${
        selected ? 'border-blue-500 shadow-xl' : 'hover:border-gray-300'
      } ${getStatusColor(data.status)}`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-2xl">{nodeType?.icon || '🤖'}</div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{data.label}</h3>
            <p className="text-xs text-gray-500 capitalize">{data.category}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {getStatusIcon(data.status)}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Natural Language Description */}
      {data.naturalLanguageDescription ? (
        <div className="mb-2">
          <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded italic">
            "{data.naturalLanguageDescription}"
          </p>
          {data.confidence && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs text-gray-500">AI Confidence:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${data.confidence}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{data.confidence}%</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-purple-700">Ready to Configure</span>
          </div>
          <button
            onClick={() => setIsConfiguring(true)}
            className="w-full text-xs p-2 border border-purple-300 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
          >
            Click to configure with natural language
          </button>
        </div>
      )}

      {/* Cost Information */}
      {data.estimatedCredits && (
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>{data.estimatedCredits} credits</span>
          <span>${data.estimatedCost?.toFixed(2) || '0.00'}</span>
        </div>
      )}

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-t pt-2 mt-2">
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Type:</strong> {data.category}</div>
            {data.industry && <div><strong>Industry:</strong> {data.industry}</div>}
            <div><strong>Status:</strong> {data.status}</div>
            {data.config && Object.keys(data.config).length > 0 && (
              <div><strong>Config:</strong> {Object.keys(data.config).length} settings</div>
            )}
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {isConfiguring && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Configure Node</h3>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              rows={3}
              placeholder="Describe what this node should do in natural language..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsConfiguring(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Update node configuration
                  data.naturalLanguageDescription = "Configured with natural language";
                  data.status = 'configured';
                  setIsConfiguring(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  enhancedNode: EnhancedNode,
};

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'enhancedNode',
    position: { x: 250, y: 50 },
    data: {
      label: 'Start Workflow',
      category: 'operations',
      description: 'Begin your automated workflow',
      status: 'ready'
    }
  },
];

const initialEdges: Edge[] = [];

const EnhancedWorkflowBuilder: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [workflowName, setWorkflowName] = useState('My Enhanced Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>('hybrid');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiWorkflowSuggestion, setAiWorkflowSuggestion] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('general');
  const [showCustomIndustryConfig, setShowCustomIndustryConfig] = useState(false);
  const [customIndustryName, setCustomIndustryName] = useState('');
  const [customIndustryDescription, setCustomIndustryDescription] = useState('');

  const onConnect = useCallback((params: Connection | Edge) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');

      if (nodeType && reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode: Node = {
          id: `${nodeType}-${Date.now()}`,
          type: 'enhancedNode',
          position,
          data: {
            label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Agent`,
            category: nodeType,
            description: `AI-powered ${nodeType} automation`,
            status: 'pending',
            industry: selectedIndustry
          },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, setNodes, selectedIndustry],
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry);
    if (industry === 'custom') {
      setShowCustomIndustryConfig(true);
    }
  };

  const handleCustomIndustrySave = () => {
    if (customIndustryName.trim() && customIndustryDescription.trim()) {
      // Add custom industry to the node types
      ENHANCED_NODE_TYPES[customIndustryName.toLowerCase().replace(/\s+/g, '')] = {
        icon: '🔧',
        color: 'gray',
        description: customIndustryDescription,
        examples: [
          "Build workflows specific to your industry",
          "Create custom automation for unique processes",
          "Develop specialized customer interactions",
          "Automate your specific business workflows"
        ],
        baseCredits: 5
      };
      
      setSelectedIndustry(customIndustryName.toLowerCase().replace(/\s+/g, ''));
      setShowCustomIndustryConfig(false);
      setCustomIndustryName('');
      setCustomIndustryDescription('');
      
      toast.success(`Custom industry "${customIndustryName}" added successfully!`);
    }
  };

  const handleAIWorkflowGeneration = async () => {
    if (!aiWorkflowSuggestion.trim()) return;

    try {
      // Simulate AI workflow generation
      const mockNodes = [
        { name: 'Lead Capture', category: 'marketing', description: 'Capture leads from website' },
        { name: 'Email Follow-up', category: 'sales', description: 'Send personalized follow-up emails' },
        { name: 'CRM Update', category: 'operations', description: 'Update customer database' }
      ];

      const newNodes = mockNodes.map((node, index) => ({
        id: `ai-generated-${index}`,
        type: 'enhancedNode',
        position: { x: 100 + (index * 300), y: 100 + (index % 2) * 200 },
        data: {
          label: node.name,
          category: node.category,
          description: node.description,
          naturalLanguageDescription: `AI-generated: ${node.description}`,
          estimatedCredits: 10,
          estimatedCost: 0.10,
          status: 'configured',
          confidence: 85,
          industry: selectedIndustry
        }
      }));

      setNodes((nds) => [...nds, ...newNodes]);
      toast.success('AI workflow generated successfully!');
      setShowAIAssistant(false);
      setAiWorkflowSuggestion('');

    } catch (error) {
      toast.error('Failed to generate AI workflow. Please try again.');
    }
  };

  const calculateTotalCost = () => {
    return nodes.reduce((total, node) => {
      return total + (node.data.estimatedCost || 0);
    }, 0);
  };

  const calculateTotalCredits = () => {
    return nodes.reduce((total, node) => {
      return total + (node.data.estimatedCredits || 0);
    }, 0);
  };

  const getModeIcon = (mode: WorkflowMode) => {
    switch (mode) {
      case 'ai-generated': return <Sparkles className="w-5 h-5" />;
      case 'manual-construction': return <Building className="w-5 h-5" />;
      case 'hybrid': return <Layers className="w-5 h-5" />;
    }
  };

  const getModeDescription = (mode: WorkflowMode) => {
    switch (mode) {
      case 'ai-generated': return 'AI creates complete workflows from descriptions';
      case 'manual-construction': return 'Build workflows step-by-step with precision';
      case 'hybrid': return 'Combine AI generation with manual control';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Enhanced Top Bar */}
      <div className="flex items-center justify-between p-4 bg-white shadow-md z-10">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Workflow className="w-8 h-8 text-blue-600" />
            Enhanced Workflow Builder
          </h1>
          <input
            type="text"
            className="p-2 border rounded-md text-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Workflow Name"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Workflow Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mode:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['ai-generated', 'manual-construction', 'hybrid'] as WorkflowMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setWorkflowMode(mode)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                    workflowMode === mode 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {getModeIcon(mode)}
                  {mode.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Industry Selection */}
          <select
            value={selectedIndustry}
            onChange={(e) => handleIndustryChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="general">General</option>
            
            {/* Content & Media */}
            <optgroup label="Content & Media">
              <option value="contentcreator">🎬 Content Creator</option>
              <option value="copywriter">✍️ Copywriter</option>
              <option value="affiliate">💰 Affiliate Marketer</option>
            </optgroup>
            
            {/* Personal Services */}
            <optgroup label="Personal Services">
              <option value="beauty">💄 Beauty & Wellness</option>
              <option value="barber">✂️ Barber & Salon</option>
              <option value="coach">🎯 Coach & Trainer</option>
              <option value="consultant">💼 Consultant</option>
            </optgroup>
            
            {/* Food & Beverage */}
            <optgroup label="Food & Beverage">
              <option value="foodservice">🍰 Food Service</option>
              <option value="baker">🥖 Baker & Confectionery</option>
            </optgroup>
            
            {/* Creative Services */}
            <optgroup label="Creative Services">
              <option value="designer">🎨 Designer</option>
              <option value="photographer">📸 Photographer</option>
            </optgroup>
            
            {/* Home Services */}
            <optgroup label="Home Services">
              <option value="cleaning">🧽 Cleaning Services</option>
              <option value="landscaping">🌱 Landscaping</option>
            </optgroup>
            
            {/* Traditional Industries */}
            <optgroup label="Traditional Industries">
              <option value="property">🏠 Real Estate</option>
              <option value="ecommerce">🛒 E-commerce</option>
              <option value="healthcare">🏥 Healthcare</option>
            </optgroup>
            
            {/* Custom */}
            <optgroup label="Other">
              <option value="custom">🔧 Custom Industry</option>
            </optgroup>
          </select>
          
          {/* Cost Display */}
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <span className="text-gray-600">Credits: </span>
              <span className="font-semibold text-blue-600">{calculateTotalCredits()}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Cost: </span>
              <span className="font-semibold text-green-600">${calculateTotalCost().toFixed(2)}</span>
            </div>
          </div>
          
          {/* AI Assistant Button */}
          {(workflowMode === 'ai-generated' || workflowMode === 'hybrid') && (
            <button
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              onClick={() => setShowAIAssistant(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Assistant
            </button>
          )}
          
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            <Save className="w-4 h-4 mr-2" />
            Save Workflow
          </button>
          
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            <Share2 className="w-4 h-4 mr-2" />
            Publish
          </button>
        </div>
      </div>

      {/* Mode Description */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <p className="text-sm text-blue-800 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          <strong>{workflowMode.replace('-', ' ').toUpperCase()} Mode:</strong> {getModeDescription(workflowMode)}
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Node Library */}
        <div className="w-80 bg-white p-4 shadow-md overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            AI Agent Library
          </h2>
          
          <div className="space-y-3">
            {Object.entries(ENHANCED_NODE_TYPES).map(([type, config]) => (
              <div
                key={type}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-grab transition-all"
                onDragStart={(event) => onDragStart(event, type)}
                draggable
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{config.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 capitalize">{type}</h3>
                    <p className="text-xs text-gray-600">{config.description}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Examples:</p>
                  {config.examples.slice(0, 2).map((example, index) => (
                    <p key={index} className="text-xs text-gray-600 italic">
                      "{example}"
                    </p>
                  ))}
                </div>
                
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">{config.baseCredits} credits</span>
                  <span className="text-xs text-green-600">${(config.baseCredits * 0.10).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Workflow Description */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Workflow Description</h3>
            <textarea
              className="w-full p-2 border rounded-md text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] text-sm"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Describe what this workflow should accomplish..."
            />
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-50"
            >
              <MiniMap />
              <Controls />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              AI Workflow Assistant
            </h2>
            
            <p className="text-gray-600 mb-4">
              Describe what you want to automate, and I'll create a complete workflow for you!
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you want to automate?
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  value={aiWorkflowSuggestion}
                  onChange={(e) => setAiWorkflowSuggestion(e.target.value)}
                  placeholder="Example: I want to automatically create social media content for my new product launch, send personalized emails to my customer list, and follow up with leads who engage with the content..."
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">💡 Example descriptions:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• "Automate my customer onboarding process"</li>
                  <li>• "Create and distribute weekly marketing content"</li>
                  <li>• "Handle customer support tickets automatically"</li>
                  <li>• "Generate and send monthly business reports"</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setShowAIAssistant(false)}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                onClick={handleAIWorkflowGeneration}
                disabled={!aiWorkflowSuggestion.trim()}
              >
                <Sparkles className="w-4 h-4" />
                Generate Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Industry Configuration Modal */}
      {showCustomIndustryConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🔧 Create Custom Industry
            </h2>
            
            <p className="text-gray-600 mb-6">
              Don't see your industry? Create a custom one with specialized workflows and automation!
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={customIndustryName}
                  onChange={(e) => setCustomIndustryName(e.target.value)}
                  placeholder="e.g., Pet Grooming, Wedding Planning, Tutoring"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Description *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  value={customIndustryDescription}
                  onChange={(e) => setCustomIndustryDescription(e.target.value)}
                  placeholder="Describe your industry and what kind of automation would be helpful..."
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">💡 Example Custom Industries:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Pet Grooming:</strong> "Schedule appointments, send reminders, track pet preferences"</li>
                  <li>• <strong>Wedding Planning:</strong> "Manage vendor communications, track timelines, send updates"</li>
                  <li>• <strong>Tutoring:</strong> "Schedule sessions, track student progress, send homework reminders"</li>
                  <li>• <strong>Event Planning:</strong> "Manage guest lists, coordinate vendors, send invitations"</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setShowCustomIndustryConfig(false);
                  setCustomIndustryName('');
                  setCustomIndustryDescription('');
                  setSelectedIndustry('general');
                }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={handleCustomIndustrySave}
                disabled={!customIndustryName.trim() || !customIndustryDescription.trim()}
              >
                Create Industry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedWorkflowBuilder;



