import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
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
  Workflow,
  // Added icons from backup builder
  Target,
  Database,
  Globe,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Workflow Modes
type WorkflowMode = 'ai' | 'hybrid' | 'prebuilt';

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

// Add primitive node ids set for quick checks
const PRIMITIVE_NODE_IDS = new Set(['trigger', 'action', 'condition', 'split', 'agent', 'merge']);

// Backup builder categories and nodes integrated
const NODE_CATEGORIES = [
  { id: 'triggers', name: 'Triggers', icon: Zap },
  { id: 'agents', name: 'AI Agents', icon: Brain },
  { id: 'actions', name: 'Actions', icon: Play },
  { id: 'logic', name: 'Logic', icon: Target },
  { id: 'data', name: 'Data', icon: Database },
  { id: 'communication', name: 'Communication', icon: MessageSquare },
  { id: 'integrations', name: 'Integrations', icon: Globe },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'timing', name: 'Timing', icon: Clock },
  { id: 'files', name: 'Files', icon: FileText },
];

const BACKUP_NODES: Array<{
  id: string;
  name: string;
  icon: any;
  description: string;
  category: string; // category id from NODE_CATEGORIES
  baseCredits: number;
}> = [
  { id: 'trigger', name: 'Trigger', icon: Zap, description: 'Start your workflow with a trigger event', category: 'triggers', baseCredits: 0 },
  { id: 'condition', name: 'Condition', icon: Target, description: 'Add conditional logic to your workflow', category: 'logic', baseCredits: 0 },
  { id: 'action', name: 'Action', icon: Play, description: 'Execute an action or task', category: 'actions', baseCredits: 1 },
  { id: 'agent', name: 'AI Agent', icon: Brain, description: 'Delegate task to an AI agent', category: 'agents', baseCredits: 2 },
  { id: 'delay', name: 'Delay', icon: Clock, description: 'Add a delay or wait period', category: 'timing', baseCredits: 0 },
  { id: 'notification', name: 'Notification', icon: MessageSquare, description: 'Send notifications or alerts', category: 'communication', baseCredits: 1 },
  { id: 'data', name: 'Data Processing', icon: Database, description: 'Process and transform data', category: 'data', baseCredits: 1 },
  { id: 'integration', name: 'Integration', icon: Globe, description: 'Connect with external services', category: 'integrations', baseCredits: 1 },
  { id: 'email', name: 'Email', icon: Mail, description: 'Send or process emails', category: 'communication', baseCredits: 1 },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Analyze data and generate insights', category: 'analytics', baseCredits: 1 },
  { id: 'schedule', name: 'Schedule', icon: Calendar, description: 'Schedule tasks or events', category: 'timing', baseCredits: 0 },
  { id: 'file', name: 'File Operation', icon: FileText, description: 'Create, read, or modify files', category: 'files', baseCredits: 1 },
  // Keep existing split/merge primitives
  { id: 'split', name: 'Split', icon: GitBranch, description: 'Fan-out to multiple paths', category: 'logic', baseCredits: 0 },
  { id: 'merge', name: 'Merge', icon: GitBranch, description: 'Join multiple paths', category: 'logic', baseCredits: 0 },
];

// Include all backup node ids in primitive recognition
for (const n of BACKUP_NODES) {
  PRIMITIVE_NODE_IDS.add(n.id);
}

// Workflow primitive catalog for sidebar (kept for quick access)
const WORKFLOW_PRIMITIVES: Array<{ id: string; name: string; icon: any; description: string; baseCredits: number }> = [
  { id: 'trigger', name: 'Trigger', icon: Zap, description: 'Starts a workflow when an event occurs', baseCredits: 0 },
  { id: 'action', name: 'Action', icon: Play, description: 'Performs a task or transformation', baseCredits: 1 },
  { id: 'condition', name: 'Condition', icon: ToggleLeft, description: 'Branch logic based on a condition', baseCredits: 0 },
  { id: 'split', name: 'Split', icon: GitBranch, description: 'Fan-out to multiple paths', baseCredits: 0 },
  { id: 'agent', name: 'Agent', icon: Bot, description: 'Delegate work to an AI agent', baseCredits: 2 },
  { id: 'merge', name: 'Merge', icon: GitBranch, description: 'Join multiple paths', baseCredits: 0 },
];

// Enhanced Node Component
const EnhancedNode = ({ id, data, selected }: { id: string; data: any; selected: boolean }) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [nlInput, setNlInput] = useState('');
  const [conditionBranches, setConditionBranches] = useState<{ label: string; nl: string }[]>(
    data.category === 'condition' || data.category === 'split'
      ? data.branches || [
          { label: 'yes', nl: '' },
          { label: 'no', nl: '' },
        ]
      : []
  );

  const nodeType = ENHANCED_NODE_TYPES[data.category as keyof typeof ENHANCED_NODE_TYPES];
  const rf = useReactFlow();
  
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

  const saveNaturalLanguageConfig = () => {
    // Minimal NL -> structured config scaffold per category
    const updated: any = { ...data };
    if (data.category === 'trigger') {
      updated.config = {
        triggerType: 'natural_language',
        description: nlInput,
      };
      updated.naturalLanguageDescription = nlInput;
      updated.status = 'configured';
      updated.estimatedCredits = 0;
      updated.estimatedCost = 0;
    } else if (data.category === 'action') {
      updated.config = {
        actionType: 'natural_language',
        instruction: nlInput,
      };
      updated.naturalLanguageDescription = nlInput;
      updated.status = 'configured';
      updated.estimatedCredits = 1;
      updated.estimatedCost = 0.1;
    } else if (data.category === 'condition') {
      updated.config = {
        conditionType: 'natural_language',
        rule: nlInput,
      };
      updated.branches = conditionBranches;
      updated.naturalLanguageDescription = nlInput;
      updated.status = 'configured';
      updated.estimatedCredits = 0;
      updated.estimatedCost = 0;
    } else if (data.category === 'split') {
      updated.config = {
        splitType: 'natural_language',
        rule: nlInput,
      };
      updated.branches = conditionBranches;
      updated.naturalLanguageDescription = nlInput;
      updated.status = 'configured';
      updated.estimatedCredits = 0;
      updated.estimatedCost = 0;
    } else if (data.category === 'agent') {
      updated.config = {
        agentInstruction: nlInput,
      };
      updated.naturalLanguageDescription = nlInput;
      updated.status = 'configured';
      updated.estimatedCredits = 2;
      updated.estimatedCost = 0.2;
    } else {
      updated.config = { note: nlInput };
      updated.naturalLanguageDescription = nlInput;
      updated.status = 'configured';
    }
    Object.assign(data, updated);
    setIsConfiguring(false);
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-xl border-2 transition-all duration-200 ${
        selected ? 'border-blue-500 shadow-xl' : 'hover:border-gray-300'
      } ${getStatusColor(data.status)} relative`}
    >
      {/* Remove Node (top-left X) */}
      <button
        className="absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs shadow hover:bg-red-600"
        onClick={() => rf.deleteElements({ nodes: [{ id }] })}
        aria-label="Remove node"
        title="Remove node"
      >
        ✕
      </button>
      {/* Node Handles */}
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-blue-500" />
      {/* Source handles: single for most, multiple labeled for condition/split */}
      {!(data.category === 'condition' || data.category === 'split') && (
        <Handle type="source" position={Position.Right} className="w-2 h-2 bg-green-500" />
      )}
      {(data.category === 'condition' || data.category === 'split') && (
        <>
          {((data.branches && Array.isArray(data.branches) && data.branches.length > 0)
            ? data.branches
            : [{ label: 'yes', nl: '' }, { label: 'no', nl: '' }]
          ).map((b: any, idx: number) => (
            <div key={`branch-handle-${idx}`} className="absolute right-0 flex items-center" style={{ top: 34 + idx * 22 }}>
              <span className="mr-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                {b.label || `branch_${idx+1}`}
              </span>
              <Handle
                id={`branch-${idx}`}
                type="source"
                position={Position.Right}
                className="w-2 h-2 bg-green-500"
              />
            </div>
          ))}
        </>
      )}
      {/* Node Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-2xl">{nodeType?.icon || (PRIMITIVE_NODE_IDS.has(data.category) ? '🧩' : '🤖')}</div>
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

      {/* Natural Language Description or Configure CTA */}
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
            Configure with natural language
          </button>
          {/* Agent assignment dropdown visible on node (Hybrid and other modes) */}
          {data.category === 'agent' && (
            <div className="mt-2">
              <div className="text-xs font-medium text-gray-700 mb-1">Assign Agent</div>
              <select
                className="w-full border rounded px-2 py-1 text-xs"
                value={data.assignedAgentId || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  rf.setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, assignedAgentId: value } } : n));
                }}
              >
                <option value="">Select an agent...</option>
                {(data.availableAgents || [
                  { id: 'research_agent', name: 'Research Agent' },
                  { id: 'marketing_agent', name: 'Marketing Agent' },
                  { id: 'sales_agent', name: 'Sales Agent' },
                  { id: 'operations_agent', name: 'Operations Agent' },
                ]).map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Cost Information */}
      {data.estimatedCredits && (
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>{data.estimatedCredits} credits</span>
          <span>${data.estimatedCost?.toFixed(2) || '0.00'}</span>
        </div>
      )}

      {/* Detailed Info Modal (Gear) */}
      {showDetails && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl mx-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{data.label} — Detailed configuration</h3>
                <p className="text-xs text-gray-500 capitalize">Type: {data.category}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Left: Overview & Cost */}
              <div className="col-span-1 space-y-3">
                <div className="p-3 border rounded-md bg-gray-50">
                  <div className="text-sm font-medium text-gray-700 mb-2">Overview</div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div><strong>Status:</strong> {data.status || 'pending'}</div>
                    {data.industry && <div><strong>Industry:</strong> {data.industry}</div>}
                    {data.naturalLanguageDescription && (
                      <div>
                        <div className="font-medium">Instruction:</div>
                        <div className="italic text-gray-600">"{data.naturalLanguageDescription}"</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 border rounded-md bg-gray-50">
                  <div className="text-sm font-medium text-gray-700 mb-2">Cost breakdown</div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div><strong>Estimated credits:</strong> {data.estimatedCredits ?? 0}</div>
                    <div><strong>Estimated cost:</strong> ${ (data.estimatedCost ?? 0).toFixed(2) }</div>
                  </div>
                </div>

                {data.category === 'agent' && (
                  <div className="p-3 border rounded-md bg-gray-50">
                    <div className="text-sm font-medium text-gray-700 mb-2">Assigned agent</div>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={data.assignedAgentId || ''}
                      onChange={(e) => { data.assignedAgentId = e.target.value; }}
                    >
                      <option value="">Select an agent...</option>
                      {(data.availableAgents || [
                        { id: 'research_agent', name: 'Research Agent' },
                        { id: 'marketing_agent', name: 'Marketing Agent' },
                        { id: 'sales_agent', name: 'Sales Agent' },
                        { id: 'operations_agent', name: 'Operations Agent' },
                      ]).map((a: any) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Middle: Configuration JSON */}
              <div className="col-span-1">
                <div className="p-3 border rounded-md bg-white">
                  <div className="text-sm font-medium text-gray-700 mb-2">Configuration</div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto" style={{ maxHeight: '300px' }}>
{JSON.stringify(data.config || {}, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Right: Node specifics */}
              <div className="col-span-1 space-y-3">
                {(data.category === 'condition' || data.category === 'split') && (
                  <div className="p-3 border rounded-md bg-white">
                    <div className="text-sm font-medium text-gray-700 mb-2">Branches</div>
                    <ul className="text-xs text-gray-700 list-disc pl-4 space-y-1">
                      {((data.branches && Array.isArray(data.branches)) ? data.branches : []).map((b: any, idx: number) => (
                        <li key={idx}><strong>{b.label || `branch_${idx+1}`}:</strong> {b.nl || '—'}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3 border rounded-md bg-white">
                  <div className="text-sm font-medium text-gray-700 mb-2">Learn more</div>
                  <div className="text-xs text-gray-600">
                    This view exposes all parameters the AI configures for this node so you can learn how it works under the hood.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>, document.body)
      }

      {/* Configuration Modal - two-column layout (portal to body) */}
      {isConfiguring && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl mx-4">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold">Configure {data.label}</h3>
              <button
                onClick={() => setIsConfiguring(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Left: Branches (if any) + Primary NL input */}
              <div className="col-span-1">
                {(data.category === 'condition' || data.category === 'split') && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Branches</div>
                    {conditionBranches.map((b, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <input
                          className="w-24 px-2 py-1 border rounded"
                          value={b.label}
                          onChange={(e) => {
                            const copy = [...conditionBranches];
                            copy[idx] = { ...copy[idx], label: e.target.value };
                            setConditionBranches(copy);
                          }}
                        />
                        <input
                          className="flex-1 px-2 py-1 border rounded"
                          placeholder={`NL rule for ${b.label}`}
                          value={b.nl}
                          onChange={(e) => {
                            const copy = [...conditionBranches];
                            copy[idx] = { ...copy[idx], nl: e.target.value };
                            setConditionBranches(copy);
                          }}
                        />
                      </div>
                    ))}
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => setConditionBranches([...conditionBranches, { label: 'branch', nl: '' }])}
                    >
                      + Add branch
                    </button>
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-700 mb-2">Describe this step</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md mb-4"
                  style={{ minHeight: '240px' }}
                  value={nlInput}
                  onChange={(e) => setNlInput(e.target.value)}
                  placeholder={
                    data.category === 'trigger' ? 'e.g., When I receive an email with subject contains "pricing"' :
                    data.category === 'action' ? 'e.g., Filter emails between spam and useful' :
                    (data.category === 'condition' || data.category === 'split') ? 'e.g., If spam then trash, else send to agent' :
                    data.category === 'agent' ? 'e.g., Read and reply with a professional tone' :
                    'Describe the behavior...'
                  }
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsConfiguring(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Close
                  </button>
                  <button
                    onClick={saveNaturalLanguageConfig}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={!nlInput.trim() && !(data.category === 'condition' || data.category === 'split')}
                  >
                    Save
                  </button>
                </div>
              </div>
              {/* Right: Tips / Recommendations */}
              <div className="col-span-1">
                <div className="p-3 border rounded-md bg-gray-50">
                  <div className="text-sm font-medium text-gray-700 mb-2">Suggestions</div>
                  {data.category === 'trigger' && (
                    <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                      <li>Incoming email with subject or sender filter</li>
                      <li>Form submission or website event</li>
                      <li>Scheduled time (every day at 9am)</li>
                      <li>Webhook received with JSON payload</li>
                    </ul>
                  )}
                  {data.category === 'action' && (
                    <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                      <li>Transform data or enrich a record</li>
                      <li>Send an email/DM/notification</li>
                      <li>Call an integration (CRM, Sheets, Slack)</li>
                      <li>Create/update a database row</li>
                    </ul>
                  )}
                  {(data.category === 'condition' || data.category === 'split') && (
                    <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                      <li>Define clear branch labels (e.g., spam / not_spam)</li>
                      <li>Use simple NL rules per branch</li>
                      <li>Prefer mutually exclusive conditions</li>
                      <li>Keep branches under 5 for readability</li>
                    </ul>
                  )}
                  {data.category === 'agent' && (
                    <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                      <li>Choose the most relevant agent to the task</li>
                      <li>Be explicit about tone and constraints</li>
                      <li>Specify handoff criteria to other agents</li>
                      <li>Redact PII if sending externally</li>
                    </ul>
                  )}
                  {!(data.category === 'trigger' || data.category === 'action' || data.category === 'condition' || data.category === 'split' || data.category === 'agent') && (
                    <div className="text-xs text-gray-600">Describe what this step should do in one or two sentences.</div>
                  )}

                  {/* Quick Presets (context-aware) */}
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-700 mb-1">Quick presets</div>
                    <div className="flex flex-wrap gap-2">
                      {computeContextualSuggestions(data.category, nodes as any, workflowName, workflowDescription).map((preset, idx) => (
                        <button
                          key={idx}
                          className="px-2 py-1 text-xs border rounded-full hover:bg-gray-100"
                          onClick={() => setNlInput(preset)}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>, document.body)
      }
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
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>('ai');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiWorkflowSuggestion, setAiWorkflowSuggestion] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('general');
  const [showCustomIndustryConfig, setShowCustomIndustryConfig] = useState(false);
  const [customIndustryName, setCustomIndustryName] = useState('');
  const [customIndustryDescription, setCustomIndustryDescription] = useState('');
  const [availableAgents, setAvailableAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const API = (import.meta as any).env?.VITE_API_BASE_URL || '';
  const [showMyWorkflows, setShowMyWorkflows] = useState(false);
  const [ownedWorkflows, setOwnedWorkflows] = useState<any[]>([]);
  const [purchasedWorkflows, setPurchasedWorkflows] = useState<any[]>([]);
  const [wfTab, setWfTab] = useState<'owned' | 'purchased'>('owned');

  async function refreshWorkflows() {
    try {
      const resOwned = await fetch(`${API}/marketplace/templates?mine=true`);
      const owned = resOwned.ok ? await resOwned.json() : [];
      setOwnedWorkflows(Array.isArray(owned) ? owned : []);
    } catch { setOwnedWorkflows([]); }
    try {
      // Placeholder: browsing public as purchased until real endpoint is exposed
      const resPurchased = await fetch(`${API}/marketplace/browse`);
      const purchased = resPurchased.ok ? await resPurchased.json() : [];
      setPurchasedWorkflows(Array.isArray(purchased) ? purchased : []);
    } catch { setPurchasedWorkflows([]); }
  }

  function hydrateFromTemplate(t: any) {
    try {
      setTemplateId(t.id);
      setWorkflowName(t.name);
      setWorkflowDescription(t.description);
      const dag = t.dag_definition;
      const hydratedNodes: Node[] = dag.nodes.map((n: any, i: number) => ({
        id: n.id,
        type: 'enhancedNode',
        position: { x: 100 + i * 200, y: 120 + (i % 2) * 120 },
        data: { label: n.label || n.category, category: n.category, config: n.config || {}, naturalLanguageDescription: n.nl || '', status: 'configured', estimatedCredits: 1, estimatedCost: 0.1 }
      }));
      const hydratedEdges: Edge[] = dag.edges.map((e: any) => ({ id: e.id, source: e.source, target: e.target }));
      setNodes(hydratedNodes);
      setEdges(hydratedEdges);
      toast.success('Workflow loaded');
      setShowMyWorkflows(false);
    } catch { toast.error('Failed to load workflow'); }
  }

  useEffect(() => {
    async function fetchActivatedAgents() {
      // Strictly Activated agents only; robust fallbacks
      const fallbackEmpty: Array<{ id: string; name: string }> = [];
      try {
        if (!API) { setAvailableAgents(fallbackEmpty); return; }
        const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt');

        // Try dedicated activated endpoints (first successful wins)
        const endpoints = [
          `${API}/agents/activated`,
          `${API}/workforce/activated`,
          `${API}/agents/active`,
        ];
        let activated: any[] | null = null;
        for (const url of endpoints) {
          try {
            const res = await fetch(url, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
            if (res.ok) { activated = await res.json(); break; }
          } catch {}
        }

        // Fall back: intersect available with localStorage activated ids
        if (!activated) {
          let available: any[] = [];
          try {
            const resAvail = await fetch(`${API}/agents/available`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
            if (resAvail.ok) available = await resAvail.json();
          } catch {}
          const activatedIds = (() => {
            try { return JSON.parse(localStorage.getItem('activated_agents') || '[]'); } catch { return []; }
          })();
          const setIds = new Set(Array.isArray(activatedIds) ? activatedIds : []);
          const filtered = Array.isArray(available) ? available.filter((a: any) => setIds.has(a.agent_id || a.id) || (a.activated === true) || (["online","working","busy"].includes(a.status))) : [];
          activated = filtered;
        }

        const mapped = Array.isArray(activated) ? activated.map((a: any) => ({ id: a.agent_id || a.id, name: a.name })) : [];
        setAvailableAgents(mapped);
      } catch {
        setAvailableAgents(fallbackEmpty);
      }
    }
    fetchActivatedAgents();
  }, [API]);

  // Compute contextual suggestions for Hybrid mode NL configuration
  const computeContextualSuggestions = useCallback((category: string, nodesCtx: Node[], wfName: string, wfDesc: string) => {
    const titles: string[] = [wfName, wfDesc].filter(Boolean);
    const hasEmail = nodesCtx.some(n => n.data?.category === 'email' || /email/i.test(n.data?.label || ''));
    const hasAgent = nodesCtx.some(n => n.data?.category === 'agent');
    const hasTrigger = nodesCtx.some(n => n.data?.category === 'trigger');
    const hasAnalytics = nodesCtx.some(n => n.data?.category === 'analytics');

    const base: string[] = [];
    if (category === 'agent') {
      base.push('Take ownership of this step and report outcome');
      if (hasEmail) base.push('Summarize email and propose reply in our brand tone');
      if (hasAnalytics) base.push('Produce a brief analytics summary for stakeholders');
    } else if (category === 'action') {
      base.push('Transform and enrich data for the next step');
      if (hasAgent) base.push('Prepare structured input for the assigned agent');
      if (hasEmail) base.push('Compose an email draft with extracted entities');
    } else if (category === 'trigger') {
      base.push('Start when new lead is captured');
      base.push('Run every weekday at 09:00');
    } else if (category === 'condition' || category === 'split') {
      base.push('If score > 0.8 then proceed else review');
      base.push('If customer is VIP then fast-track else normal');
    } else if (category === 'email') {
      base.push('Send an email enriched with customer information');
      base.push('Draft a follow-up email if no response in 3 days');
    }
    if (titles.length) base.unshift(`Achieve: ${titles[0]}`);
    if (hasTrigger && category === 'action') base.push('Only run when trigger payload matches criteria');
    return Array.from(new Set(base)).slice(0, 8);
  }, []);

  const onConnect = useCallback((params: Connection | Edge) => {
    setEdges((eds) => {
      let label: string | undefined = undefined;
      try {
        const sourceNode = nodes.find((n) => n.id === (params as any).source);
        const isCond = sourceNode && (sourceNode.data?.category === 'condition' || sourceNode.data?.category === 'split');
        const handleId = (params as any).sourceHandle as string | undefined;
        if (isCond && handleId && handleId.startsWith('branch-')) {
          const idx = parseInt(handleId.split('-')[1] || '0', 10);
          const branches = Array.isArray(sourceNode.data?.branches) ? sourceNode.data.branches : [];
          const b = branches[idx];
          if (b && b.label) label = String(b.label);
        }
      } catch {}
      const edgeWithLabel = label ? { ...(params as any), label } : params;
      return addEdge(edgeWithLabel as any, eds);
    });
  }, [setEdges, nodes]);

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

        const isPrimitive = PRIMITIVE_NODE_IDS.has(nodeType);
        const isPresetType = !isPrimitive && (nodeType in ENHANCED_NODE_TYPES);
        const baseCredits = (WORKFLOW_PRIMITIVES.find(p => p.id === nodeType)?.baseCredits
          ?? BACKUP_NODES.find(n => n.id === nodeType)?.baseCredits
          ?? 0);

        // In prebuilt mode, dropping a preset generates a small primitive graph
        if (workflowMode === 'prebuilt' && isPresetType) {
          const t = Date.now();
          const id1 = `trigger-${t}`;
          const id2 = `action-${t+1}`;
          const id3 = `agent-${t+2}`;
          const id4 = `action-${t+3}`;
          const newNodes: Node[] = [
            { id: id1, type: 'enhancedNode', position: { x: position.x, y: position.y }, data: { label: 'Trigger', category: 'trigger', description: 'Start', status: 'pending', estimatedCredits: 0, estimatedCost: 0 } },
            { id: id2, type: 'enhancedNode', position: { x: position.x + 220, y: position.y }, data: { label: 'Action', category: 'action', description: `Init ${nodeType}`, status: 'pending', estimatedCredits: 1, estimatedCost: 0.1 } },
            { id: id3, type: 'enhancedNode', position: { x: position.x + 440, y: position.y }, data: { label: 'Agent', category: 'agent', description: `${nodeType} agent`, status: 'pending', estimatedCredits: 2, estimatedCost: 0.2, availableAgents } },
            { id: id4, type: 'enhancedNode', position: { x: position.x + 660, y: position.y }, data: { label: 'Action', category: 'action', description: 'Finalize', status: 'pending', estimatedCredits: 1, estimatedCost: 0.1 } },
          ];
          const newEdges: Edge[] = [
            { id: `${id1}->${id2}`, source: id1, target: id2 },
            { id: `${id2}->${id3}`, source: id2, target: id3 },
            { id: `${id3}->${id4}`, source: id3, target: id4 },
          ];
          setNodes((nds) => nds.concat(newNodes));
          setEdges((eds) => eds.concat(newEdges));
          return;
        }

        const newNode: Node = {
          id: `${nodeType}-${Date.now()}`,
          type: 'enhancedNode',
          position,
          data: {
            label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`,
            category: nodeType,
            description: isPrimitive ? `Workflow ${nodeType}` : `Preset ${nodeType}`,
            status: 'pending',
            estimatedCredits: baseCredits,
            estimatedCost: baseCredits * 0.1,
            ...(nodeType === 'agent' ? { availableAgents } : {}),
          },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, setNodes, selectedIndustry, availableAgents, workflowMode],
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
      // Primitive-based workflow example derived from NL prompt
      const baseX = 100;
      const baseY = 120;
      const gapX = 280;

      const triggerId = `trigger-${Date.now()}`;
      const actionFilterId = `action-${Date.now() + 1}`;
      const conditionId = `condition-${Date.now() + 2}`;
      const agentId = `agent-${Date.now() + 3}`;
      const actionReplyId = `action-${Date.now() + 4}`;

      const primitiveNodes: Node[] = [
        {
          id: triggerId,
          type: 'enhancedNode',
          position: { x: baseX, y: baseY },
          data: {
            label: 'Trigger',
            category: 'trigger',
            description: 'Workflow trigger',
            status: 'configured',
            estimatedCredits: 0,
            estimatedCost: 0,
            naturalLanguageDescription: aiWorkflowSuggestion,
            config: { triggerType: 'natural_language', description: aiWorkflowSuggestion },
          },
        },
        {
          id: actionFilterId,
          type: 'enhancedNode',
          position: { x: baseX + gapX, y: baseY },
          data: {
            label: 'Action: Filter Emails',
            category: 'action',
            description: 'Filter spam vs useful',
            status: 'configured',
            estimatedCredits: 1,
            estimatedCost: 0.1,
            naturalLanguageDescription: 'Filter emails between spam and useful',
            config: { actionType: 'natural_language', instruction: 'Filter emails between spam and useful' },
          },
        },
        {
          id: conditionId,
          type: 'enhancedNode',
          position: { x: baseX + gapX * 2, y: baseY },
          data: {
            label: 'Condition',
            category: 'condition',
            description: 'Spam? Then trash, else to agent',
            status: 'configured',
            estimatedCredits: 0,
            estimatedCost: 0,
            naturalLanguageDescription: 'If spam then trash, else send to agent',
            config: { conditionType: 'natural_language', rule: 'spam vs not spam' },
            branches: [
              { label: 'spam', nl: 'Send to trash' },
              { label: 'not_spam', nl: 'Send to agent' },
            ],
          },
        },
        {
          id: agentId,
          type: 'enhancedNode',
          position: { x: baseX + gapX * 3, y: baseY - 80 },
          data: {
            label: 'Agent',
            category: 'agent',
            description: 'Handle replies or delegate',
            status: 'configured',
            estimatedCredits: 2,
            estimatedCost: 0.2,
            naturalLanguageDescription: 'Read and reply professionally or delegate appropriately',
            availableAgents,
            config: { agentInstruction: 'Read and reply professionally or delegate appropriately' },
          },
        },
        {
          id: actionReplyId,
          type: 'enhancedNode',
          position: { x: baseX + gapX * 4, y: baseY - 80 },
          data: {
            label: 'Action: Send Reply',
            category: 'action',
            description: 'Send reply / forward',
            status: 'configured',
            estimatedCredits: 1,
            estimatedCost: 0.1,
            naturalLanguageDescription: 'Send the crafted reply or forward to relevant agent',
            config: { actionType: 'natural_language', instruction: 'Send reply or forward' },
          },
        },
      ];

      const primitiveEdges: Edge[] = [
        { id: `${triggerId}->${actionFilterId}`, source: triggerId, target: actionFilterId },
        { id: `${actionFilterId}->${conditionId}`, source: actionFilterId, target: conditionId },
        { id: `${conditionId}->${agentId}`, source: conditionId, target: agentId },
        { id: `${agentId}->${actionReplyId}`, source: agentId, target: actionReplyId },
      ];

      setNodes((nds) => [...nds, ...primitiveNodes]);
      setEdges((eds) => [...eds, ...primitiveEdges]);
      toast.success('AI workflow generated with primitives!');
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
      case 'ai': return <Sparkles className="w-5 h-5" />;
      case 'hybrid': return <Layers className="w-5 h-5" />;
      case 'prebuilt': return <Building className="w-5 h-5" />;
    }
  };

  const getModeDescription = (mode: WorkflowMode) => {
    switch (mode) {
      case 'ai': return 'AI creates complete workflows from descriptions';
      case 'hybrid': return 'Drag nodes and configure them with natural language';
      case 'prebuilt': return 'Use industry-specific pre-built workflows';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Title Card */}
      <div className="p-4">
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Workflow className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Workflow builder</h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Name</label>
            <input
              type="text"
              className="p-2 border rounded-md text-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow Name"
            />
          </div>
        </div>
      </div>

      {/* Builder Card */}
      <div className="px-4 pb-4">
        <div className="bg-white shadow-md rounded-lg">
          {/* Builder Top Bar */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm text-gray-600">Mode:</span>
              <div className="flex bg-gray-100 rounded-lg p-1 gap-2">
                {(['ai', 'hybrid', 'prebuilt'] as WorkflowMode[]).map((mode) => (
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
                    {mode === 'ai' ? 'AI Generated' : mode === 'hybrid' ? 'Hybrid' : 'Pre-Built'}
                  </button>
                ))}
                {/* AI mode moves assistant into sidebar; no separate button here */}
              </div>
            </div>
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
              <button
                onClick={async () => { await refreshWorkflows(); setShowMyWorkflows(true); }}
                className="ml-2 px-3 py-1 text-sm border rounded hover:bg-gray-100"
              >
                My Workflows
              </button>
            </div>
          </div>

          {/* Mode Description */}
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <strong>{(workflowMode === 'ai' ? 'AI GENERATED' : workflowMode === 'hybrid' ? 'HYBRID' : 'PRE-BUILT')} Mode:</strong> {getModeDescription(workflowMode)}
            </p>
          </div>

          <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
            {/* Sidebar */}
            <div className="w-80 bg-white p-4 overflow-y-auto border-r">
              {workflowMode === 'ai' && (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Workflow Assistant
                  </h2>
                  <p className="text-xs text-gray-600 mb-3">
                    What would you like to achieve with this workflow? What should the end result be?
                  </p>
                  <textarea
                    className="w-full p-2 border rounded-md text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] text-sm"
                    value={aiWorkflowSuggestion}
                    onChange={(e) => setAiWorkflowSuggestion(e.target.value)}
                    placeholder="Describe your desired outcome and steps..."
                  />
                  <button
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    onClick={handleAIWorkflowGeneration}
                    disabled={!aiWorkflowSuggestion.trim()}
                  >
                    <Sparkles className="w-4 h-4" />
                    Build Workflow
                  </button>
                </>
              )}
              {workflowMode === 'hybrid' && (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-600" />
                    Nodes by Category
                  </h2>
                  <div className="space-y-4">
                    {NODE_CATEGORIES.map((cat) => (
                      <div key={cat.id}>
                        <div className="flex items-center gap-2 mb-2 text-gray-700">
                          <cat.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <div className="space-y-2">
                          {BACKUP_NODES.filter(n => n.category === cat.id).map((n) => (
                            <div
                              key={n.id}
                              className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-grab transition-all flex items-start gap-3"
                              onDragStart={(event) => onDragStart(event, n.id)}
                              draggable
                            >
                              <n.icon className="w-5 h-5 text-gray-700 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-gray-800 text-sm">{n.name}</h3>
                                  <span className="text-xs text-gray-500">{n.baseCredits} cr</span>
                                </div>
                                <p className="text-xs text-gray-600">{n.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {workflowMode === 'prebuilt' && (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-600" />
                    Pre-built Workflows by Industry
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
                            <p key={index} className="text-xs text-gray-600 italic">"{example}"</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
        </div>
      </div>

      {/* AI Assistant now lives in the sidebar when mode is AI */}

      {/* My Workflows Drawer */}
      {showMyWorkflows && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setShowMyWorkflows(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">My Workflows</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowMyWorkflows(false)}>✕</button>
            </div>
            <div className="flex border-b mb-3">
              <button className={`px-3 py-2 text-sm ${wfTab==='owned' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`} onClick={() => setWfTab('owned')}>Owned</button>
              <button className={`px-3 py-2 text-sm ${wfTab==='purchased' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`} onClick={() => setWfTab('purchased')}>Purchased</button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
              {(wfTab === 'owned' ? ownedWorkflows : purchasedWorkflows).map((t: any) => (
                <div key={t.id} className="p-3 border rounded mb-2 hover:bg-gray-50 cursor-pointer" onClick={() => hydrateFromTemplate(t)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.category || 'general'} • {t.is_public ? 'Public' : 'Draft'}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {t.execution_cost_credits ?? t.estimated_credits} cr
                    </div>
                  </div>
                </div>
              ))}
              {((wfTab === 'owned' ? ownedWorkflows : purchasedWorkflows).length === 0) && (
                <div className="text-sm text-gray-500">No workflows to show.</div>
              )}
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



