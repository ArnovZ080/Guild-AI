import React, { useState, useEffect } from 'react';
import { ConversationalInterface, QuickActions } from '../components/agents/ConversationalUI.jsx';
import { repoAgentIds } from '../data/repoAgentIds.js';
import { agentMeta } from '../data/agentMeta.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Users, BarChart, Settings, Play, Pause, RotateCcw, 
  Search, Filter, Eye, MessageSquare, Phone, Mail, Calendar, Target,
  DollarSign, TrendingUp, FileText, Image, Video, Mic, Camera,
  Globe, Database, Shield, Lightbulb, Briefcase, Heart, Star,
  ChevronDown, ChevronUp, Activity, Clock, CheckCircle, AlertCircle, Megaphone,
  Workflow, GitBranch, RefreshCw, Upload, Wrench, Network, Link, Share, Headphones
} from 'lucide-react';
import { useAgentStatus } from '../hooks/useApiData.js';
import { useCelebrations, CelebrationType } from '../components/psychological/MicroCelebrations.jsx';
import EnhancedWorkflowBuilder from '../components/workflow/EnhancedWorkflowBuilder.tsx';
import { AgentActivityTheater } from '../components/theater/AgentActivityTheater.tsx';
import AgentActivityFeed from '../components/transparency/AgentActivityFeed.jsx';
import apiService from '../services/api.js';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { getSubscriptionInfo, getPlans } from '../services/subscriptionService.js';

// Helper to build display names from ids
const toTitle = (id) => id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// Move AgentCard component outside main component to avoid hook order issues
const AgentCard = ({ agent, entitled=false, source='local', rawAgent=null, onSelect, onAssign, onChat, onHire, triggerCelebration }) => {
  const TypeIcon = getTypeIcon(agent.type);
  const isActive = agent.status === 'active';

  const canStartPause = entitled;
  const showFullActions = entitled;
  const showHireOnly = !entitled;

  const handleToggle = (e) => {
    e.stopPropagation();
    // Toggle agent status (would need to call API to persist)
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `${agent.name} ${isActive ? 'paused' : 'started'}!`,
      intensity: 'normal'
    });
  };
  
  return (
    <motion.div
      className={`bg-white rounded-lg p-6 shadow-lg border-l-4 ${getCategoryStyle(agent.category)} cursor-pointer hover:shadow-xl transition-shadow h-full flex flex-col`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(agent)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getCategoryStyle(agent.category).replace('100', '200')}`}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{agent.category} • {agent.type}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(agent.status)}`}>
          {agent.status}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{(getOverrideForAgent(agent.name)?.purpose) || agent.description}</p>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Capabilities:</h4>
        <div className="flex flex-wrap gap-1">
          {(getOverrideForAgent(agent.name)?.capabilities || agent.capabilities).slice(0, 3).map(capability => (
            <span key={capability} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {capability}
            </span>
          ))}
          {(getOverrideForAgent(agent.name)?.capabilities || agent.capabilities).length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{(getOverrideForAgent(agent.name)?.capabilities || agent.capabilities).length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 mt-auto">
        {canStartPause && (
        <button 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
            onClick={handleToggle}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 inline mr-1" />
                Pause
              </>
            ) : (
              <>
          <Play className="w-4 h-4 inline mr-1" />
          Start
              </>
            )}
        </button>
        )}
        {showFullActions && (
          <>
          <button 
            className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
              onClick={(e) => { e.stopPropagation(); onSelect({ ...agent, _entitled: true, _hasHistory: true, _raw: rawAgent }); }}
            title="Details"
          >
            Details
          </button>
            <div className="grid grid-cols-2 gap-2 col-span-2">
          <button 
            className="px-3 py-2 bg-indigo-100 text-indigo-800 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors"
            onClick={(e) => { e.stopPropagation(); onAssign(agent); }}
            title="Assign Task"
          >
              Assign Task
          </button>
          <button 
            className="px-3 py-2 bg-purple-100 text-purple-800 rounded-md text-sm font-medium hover:bg-purple-200 transition-colors"
                onClick={(e) => { e.stopPropagation(); onChat(agent); }}
            title="Chat"
          >
            Chat
          </button>
            </div>
          </>
        )}
        {showHireOnly && (
          <button 
            className="px-3 py-2 bg-orange-100 text-orange-800 rounded-md text-sm font-medium hover:bg-orange-200 transition-colors col-span-2"
            onClick={(e) => { e.stopPropagation(); onHire(agent); }}
            title="Hire Agent"
          >
            <DollarSign className="w-4 h-4 inline mr-1" />
            Hire Agent
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Fallback minimal metadata (category/type) for known ids can be expanded later
const defaultAgentMeta = (id) => (agentMeta[id] || {
  category: 'automation',
  type: 'management',
  description: toTitle(id),
  capabilities: ['Core capability']
});

// Build list from repo agent ids. If a curated list exists below, it will be used instead.
let allAgents = repoAgentIds.map((id, idx) => {
  const title = toTitle(id);
  const name = title.toLowerCase().endsWith('agent') ? title : `${title} Agent`;
  const meta = defaultAgentMeta(id);
  return {
    id: `${idx + 1}`,
    name,
    category: meta.category,
    type: meta.type,
    status: 'active',
    capabilities: meta.capabilities,
    description: meta.description
  };
});

// Comprehensive 52 agents data (kept for reference; comment out if not needed)
/* const curatedAgents = [
  // Executive Layer
  { id: '1', name: 'Chief of Staff Agent', category: 'executive', type: 'strategy', status: 'active', capabilities: ['Strategic coordination', 'Task prioritization', 'Executive support'], description: 'Strategic coordination and task prioritization for executive operations' },
  { id: '2', name: 'Strategy Agent', category: 'executive', type: 'strategy', status: 'active', capabilities: ['Long-term planning', 'Market analysis', 'Strategic recommendations'], description: 'Long-term planning and market analysis for strategic decisions' },
  { id: '3', name: 'Business Strategist Agent', category: 'executive', type: 'strategy', status: 'active', capabilities: ['High-level strategic thinking', 'Business recommendations', 'Market positioning'], description: 'High-level strategic thinking and business recommendations' },

  // Content Creation Agents
  { id: '4', name: 'Brief Generator Agent', category: 'content', type: 'creation', status: 'active', capabilities: ['Project brief creation', 'Requirements analysis', 'Scope definition'], description: 'Comprehensive project brief creation and requirements analysis' },
  { id: '5', name: 'Ad Copy Agent', category: 'content', type: 'creation', status: 'active', capabilities: ['High-converting ad copy', 'A/B testing', 'Campaign optimization'], description: 'High-converting advertising copy and campaign optimization' },
  { id: '6', name: 'Content Strategist Agent', category: 'content', type: 'strategy', status: 'active', capabilities: ['Content strategy', 'Calendar development', 'Multi-platform planning'], description: 'Holistic content strategy and calendar development' },
  { id: '7', name: 'Social Media Agent', category: 'content', type: 'creation', status: 'active', capabilities: ['Platform-specific content', 'Social media management', 'Engagement optimization'], description: 'Platform-specific social media content and management' },
  { id: '8', name: 'Writer Agent', category: 'content', type: 'creation', status: 'active', capabilities: ['Long-form content', 'Documentation', 'Technical writing'], description: 'Long-form content and documentation creation' },

  // Research & Data Agents
  { id: '9', name: 'Research Agent', category: 'research', type: 'analysis', status: 'active', capabilities: ['Web research', 'Information gathering', 'Data analysis'], description: 'Web research and information gathering' },
  { id: '10', name: 'Advanced Scraper Agent', category: 'research', type: 'automation', status: 'active', capabilities: ['Web scraping', 'Data extraction', 'Ethical data collection'], description: 'Sophisticated web scraping with Scrapy framework' },
  { id: '11', name: 'Lead Personalization Agent', category: 'research', type: 'personalization', status: 'active', capabilities: ['Sales psychology', 'Personalized outreach', 'Lead analysis'], description: 'Sales psychology-based outreach and lead analysis' },
  { id: '12', name: 'Data Enrichment Agent', category: 'research', type: 'analysis', status: 'active', capabilities: ['Lead validation', 'Data enhancement', 'Quality scoring'], description: 'Lead validation and data enhancement' },

  // Financial & Business Agents
  { id: '13', name: 'Accounting Agent', category: 'financial', type: 'analysis', status: 'active', capabilities: ['Financial reporting', 'Analysis', 'Spreadsheet creation'], description: 'Financial reporting and analysis with spreadsheet generation' },
  { id: '14', name: 'Analytics Agent', category: 'financial', type: 'analysis', status: 'active', capabilities: ['Performance tracking', 'Business intelligence', 'KPI monitoring'], description: 'Performance tracking and business intelligence' },

  // Creative & Media Agents
  { id: '15', name: 'Image Generation Agent', category: 'creative', type: 'generation', status: 'active', capabilities: ['AI image creation', 'Visual content', 'Brand consistency'], description: 'AI-powered image creation and visual content' },
  { id: '16', name: 'Voice Agent', category: 'creative', type: 'processing', status: 'active', capabilities: ['Text-to-speech', 'Speech-to-text', 'Audio processing'], description: 'Text-to-speech and speech-to-text processing' },
  { id: '17', name: 'Video Editor Agent', category: 'creative', type: 'editing', status: 'active', capabilities: ['Video creation', 'Editing', 'Post-production'], description: 'Video creation and editing capabilities' },
  { id: '18', name: 'Document Processing Agent', category: 'creative', type: 'processing', status: 'active', capabilities: ['Multi-format handling', 'Document conversion', 'Content extraction'], description: 'Multi-format document handling and processing' },

  // Automation Agents
  { id: '19', name: 'Unified Automation Agent', category: 'automation', type: 'automation', status: 'active', capabilities: ['Visual automation', 'Web automation', 'Workflow automation'], description: 'Visual and web automation capabilities' },
  { id: '20', name: 'Visual Automation Tool', category: 'automation', type: 'automation', status: 'active', capabilities: ['PyAutoGUI', 'Computer vision', 'Desktop automation'], description: 'PyAutoGUI and computer vision integration' },

  // Evaluator League
  { id: '21', name: 'Judge Agent', category: 'evaluation', type: 'quality', status: 'active', capabilities: ['Quality rubrics', 'Evaluation', 'Standards compliance'], description: 'Quality rubrics and evaluation standards' },
  { id: '22', name: 'Fact Checker Agent', category: 'evaluation', type: 'verification', status: 'active', capabilities: ['Information accuracy', 'Source verification', 'Fact validation'], description: 'Information accuracy validation and fact checking' },
  { id: '23', name: 'Brand Checker Agent', category: 'evaluation', type: 'compliance', status: 'active', capabilities: ['Brand compliance', 'Consistency checking', 'Guideline enforcement'], description: 'Brand compliance and consistency checking' },
  { id: '24', name: 'SEO Evaluator Agent', category: 'evaluation', type: 'optimization', status: 'active', capabilities: ['SEO analysis', 'Search optimization', 'Performance metrics'], description: 'Search engine optimization evaluation' },

  // Orchestration & Management
  { id: '25', name: 'Workflow Manager Agent', category: 'orchestration', type: 'management', status: 'active', capabilities: ['Multi-agent coordination', 'Workflow orchestration', 'Task management'], description: 'Multi-agent coordination and workflow management' },
  { id: '26', name: 'Pre-flight Planner Agent', category: 'orchestration', type: 'planning', status: 'active', capabilities: ['Workflow planning', 'Approval processes', 'Risk assessment'], description: 'Workflow planning and approval processes' },
  { id: '27', name: 'Contract Compiler Agent', category: 'orchestration', type: 'processing', status: 'active', capabilities: ['Outcome contract processing', 'Agreement management', 'Compliance tracking'], description: 'Outcome contract processing and management' },
  { id: '28', name: 'Quality Controller Agent', category: 'orchestration', type: 'quality', status: 'active', capabilities: ['Iterative improvement', 'Quality management', 'Process optimization'], description: 'Iterative improvement and quality management' },

  // Specialized Agents
  { id: '29', name: 'Customer Success Agent', category: 'customer', type: 'support', status: 'active', capabilities: ['Customer onboarding', 'Success tracking', 'Retention optimization'], description: 'Customer success and retention optimization' },
  { id: '30', name: 'Sales Agent', category: 'sales', type: 'conversion', status: 'active', capabilities: ['Lead qualification', 'Sales processes', 'Revenue optimization'], description: 'Sales processes and revenue optimization' },
  { id: '31', name: 'Support Agent', category: 'support', type: 'assistance', status: 'active', capabilities: ['Customer support', 'Issue resolution', 'Knowledge management'], description: 'Customer support and issue resolution' },
  { id: '32', name: 'Partnership Agent', category: 'business', type: 'development', status: 'active', capabilities: ['Partnership development', 'Relationship management', 'Collaboration facilitation'], description: 'Partnership development and relationship management' },

  // Technical Agents
  { id: '33', name: 'Development Agent', category: 'technical', type: 'development', status: 'active', capabilities: ['Code generation', 'Technical implementation', 'System integration'], description: 'Technical development and system integration' },
  { id: '34', name: 'Security Agent', category: 'technical', type: 'security', status: 'active', capabilities: ['Security monitoring', 'Threat detection', 'Compliance management'], description: 'Security monitoring and threat detection' },
  { id: '35', name: 'Infrastructure Agent', category: 'technical', type: 'infrastructure', status: 'active', capabilities: ['System monitoring', 'Performance optimization', 'Resource management'], description: 'Infrastructure monitoring and optimization' },

  // Marketing Specialists
  { id: '36', name: 'Email Marketing Agent', category: 'marketing', type: 'email', status: 'active', capabilities: ['Email campaigns', 'Automation', 'Performance tracking'], description: 'Email marketing campaigns and automation' },
  { id: '37', name: 'SEO Agent', category: 'marketing', type: 'seo', status: 'active', capabilities: ['Search optimization', 'Keyword research', 'Content optimization'], description: 'Search engine optimization and content optimization' },
  { id: '38', name: 'PPC Agent', category: 'marketing', type: 'advertising', status: 'active', capabilities: ['Paid advertising', 'Campaign management', 'ROI optimization'], description: 'Paid advertising and campaign management' },
  { id: '39', name: 'Social Media Manager Agent', category: 'marketing', type: 'social', status: 'active', capabilities: ['Social media management', 'Content scheduling', 'Community engagement'], description: 'Social media management and community engagement' },

  // Data & Analytics
  { id: '40', name: 'Data Analyst Agent', category: 'analytics', type: 'analysis', status: 'active', capabilities: ['Data analysis', 'Insights generation', 'Reporting'], description: 'Data analysis and insights generation' },
  { id: '41', name: 'Predictive Analytics Agent', category: 'analytics', type: 'prediction', status: 'active', capabilities: ['Trend prediction', 'Forecasting', 'Risk assessment'], description: 'Predictive analytics and trend forecasting' },
  { id: '42', name: 'Business Intelligence Agent', category: 'analytics', type: 'intelligence', status: 'active', capabilities: ['BI reporting', 'Dashboard creation', 'KPI monitoring'], description: 'Business intelligence and KPI monitoring' },

  // Communication & Outreach
  { id: '43', name: 'Chat Agent', category: 'communication', type: 'chat', status: 'active', capabilities: ['Live chat support', 'Conversation management', 'Response automation'], description: 'Live chat support and conversation management' },
  { id: '44', name: 'Phone Agent', category: 'communication', type: 'voice', status: 'active', capabilities: ['Voice interactions', 'Call management', 'Voice processing'], description: 'Voice interactions and call management' },
  { id: '45', name: 'Translation Agent', category: 'communication', type: 'translation', status: 'active', capabilities: ['Multi-language support', 'Translation services', 'Localization'], description: 'Multi-language support and translation services' },

  // Specialized Business Functions
  { id: '46', name: 'HR Agent', category: 'hr', type: 'management', status: 'active', capabilities: ['HR processes', 'Employee management', 'Compliance tracking'], description: 'Human resources processes and employee management' },
  { id: '47', name: 'Legal Agent', category: 'legal', type: 'compliance', status: 'active', capabilities: ['Legal compliance', 'Contract review', 'Risk assessment'], description: 'Legal compliance and contract review' },
  { id: '48', name: 'Procurement Agent', category: 'procurement', type: 'management', status: 'active', capabilities: ['Vendor management', 'Purchase optimization', 'Cost analysis'], description: 'Procurement and vendor management' },

  // Innovation & Development
  { id: '49', name: 'Innovation Agent', category: 'innovation', type: 'research', status: 'active', capabilities: ['Innovation research', 'Trend analysis', 'Opportunity identification'], description: 'Innovation research and opportunity identification' },
  { id: '50', name: 'Product Development Agent', category: 'product', type: 'development', status: 'active', capabilities: ['Product strategy', 'Feature planning', 'Market research'], description: 'Product development and feature planning' },
  { id: '51', name: 'Competitive Intelligence Agent', category: 'intelligence', type: 'analysis', status: 'active', capabilities: ['Competitor analysis', 'Market intelligence', 'Strategic insights'], description: 'Competitive intelligence and market analysis' },
  { id: '52', name: 'Sustainability Agent', category: 'sustainability', type: 'management', status: 'active', capabilities: ['Sustainability tracking', 'ESG reporting', 'Environmental impact'], description: 'Sustainability tracking and ESG reporting' }
];
// If you prefer curated display over repo-derived, uncomment next line:
// allAgents = curatedAgents; */

// Generate agent-specific activity data
const getAgentActivityData = (agent) => {
  const baseActivities = {
    'Research Agent': [
      { id: 1, action: 'Scraped competitor websites', timestamp: '2024-01-15 14:30', status: 'completed', details: 'Analyzed pricing and features from 12 competitor websites', websites: ['competitor1.com', 'competitor2.com', 'competitor3.com'] },
      { id: 2, action: 'Generated market analysis report', timestamp: '2024-01-15 13:45', status: 'completed', details: 'Created comprehensive market analysis with 25 data points', reportType: 'market-analysis', pages: 15 },
      { id: 3, action: 'Updated lead database', timestamp: '2024-01-15 12:20', status: 'completed', details: 'Enriched 150 customer profiles with additional data', recordsUpdated: 150 },
      { id: 4, action: 'Analyzed social media trends', timestamp: '2024-01-15 11:15', status: 'completed', details: 'Monitored 8 platforms for trending topics', platforms: ['Twitter', 'LinkedIn', 'Facebook', 'Instagram'] },
      { id: 5, action: 'Researching new opportunities', timestamp: '2024-01-15 10:30', status: 'in_progress', details: 'Currently analyzing emerging market trends...', progress: 65 }
    ],
    'Marketing Agent': [
      { id: 1, action: 'Created ad campaign variations', timestamp: '2024-01-15 14:30', status: 'completed', details: 'Generated 5 ad variations for Q1 campaign', variations: 5, platforms: ['Google Ads', 'Facebook', 'LinkedIn'] },
      { id: 2, action: 'Optimized landing pages', timestamp: '2024-01-15 13:45', status: 'completed', details: 'A/B tested 3 landing page variations', pagesOptimized: 3, conversionImprovement: '12%' },
      { id: 3, action: 'Scheduled social media content', timestamp: '2024-01-15 12:20', status: 'completed', details: 'Scheduled 8 posts across 3 platforms', postsScheduled: 8, platforms: ['Twitter', 'LinkedIn', 'Instagram'] },
      { id: 4, action: 'Analyzed campaign performance', timestamp: '2024-01-15 11:15', status: 'completed', details: 'Generated performance report for last week', campaignsAnalyzed: 3, avgROI: '340%' },
      { id: 5, action: 'Creating email sequence', timestamp: '2024-01-15 10:30', status: 'in_progress', details: 'Building automated email sequence for new leads...', emailsCreated: 3, totalEmails: 7 }
    ],
    'Sales Agent': [
      { id: 1, action: 'Qualified 15 new leads', timestamp: '2024-01-15 14:30', status: 'completed', details: 'Contacted and qualified 15 leads from marketing campaign', leadsQualified: 15, conversionRate: '23%' },
      { id: 2, action: 'Scheduled 8 demo calls', timestamp: '2024-01-15 13:45', status: 'completed', details: 'Booked demo calls with qualified prospects', demosScheduled: 8, avgValue: '$2,500' },
      { id: 3, action: 'Followed up with prospects', timestamp: '2024-01-15 12:20', status: 'completed', details: 'Sent personalized follow-up emails to 25 prospects', emailsSent: 25, responseRate: '18%' },
      { id: 4, action: 'Updated CRM records', timestamp: '2024-01-15 11:15', status: 'completed', details: 'Updated 40 customer records with latest interactions', recordsUpdated: 40 },
      { id: 5, action: 'Preparing proposal', timestamp: '2024-01-15 10:30', status: 'in_progress', details: 'Creating custom proposal for Enterprise Solutions Inc...', proposalValue: '$45,000', completion: 80 }
    ],
    'Content Agent': [
      { id: 1, action: 'Published blog post', timestamp: '2024-01-15 14:30', status: 'completed', details: 'Published "AI Trends 2024" blog post', wordCount: 1200, views: 2340, shares: 89 },
      { id: 2, action: 'Created social media graphics', timestamp: '2024-01-15 13:45', status: 'completed', details: 'Designed 6 social media graphics for campaign', graphicsCreated: 6, platforms: ['Instagram', 'LinkedIn', 'Twitter'] },
      { id: 3, action: 'Wrote email newsletter', timestamp: '2024-01-15 12:20', status: 'completed', details: 'Created weekly newsletter for 2,500 subscribers', subscribers: 2500, openRate: '24%' },
      { id: 4, action: 'Updated website content', timestamp: '2024-01-15 11:15', status: 'completed', details: 'Updated product descriptions and pricing pages', pagesUpdated: 5 },
      { id: 5, action: 'Writing case study', timestamp: '2024-01-15 10:30', status: 'in_progress', details: 'Creating case study for TechCorp Solutions...', wordCount: 800, targetWords: 1500 }
    ]
  };

  return baseActivities[agent.name] || [
    { id: 1, action: 'Processing data', timestamp: '2024-01-15 14:30', status: 'completed', details: 'Completed data processing task' },
    { id: 2, action: 'Generating report', timestamp: '2024-01-15 13:45', status: 'completed', details: 'Generated automated report' },
    { id: 3, action: 'Updating systems', timestamp: '2024-01-15 12:20', status: 'completed', details: 'Updated system configurations' },
    { id: 4, action: 'Monitoring performance', timestamp: '2024-01-15 11:15', status: 'completed', details: 'Monitored system performance metrics' },
    { id: 5, action: 'Running analysis', timestamp: '2024-01-15 10:30', status: 'in_progress', details: 'Currently running data analysis...' }
  ];
};

const AgentsView = () => {
  const { agents, loading } = useAgentStatus();
  const { settings } = useSettings();
  const userId = settings?.profile?.id || 'user_' + Math.random().toString(36).substr(2, 9);
  
  // Subscription state
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const API = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';
  const [apiAgents, setApiAgents] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireCandidate, setHireCandidate] = useState(null);
  const [hireTerm, setHireTerm] = useState('day');
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatAgent, setChatAgent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, detailed
  const [activeTab, setActiveTab] = useState('theater'); // theater | workforce | builder | activity
  const [workflows, setWorkflows] = useState([]);
  const [wfLoading, setWfLoading] = useState(false);
  const [wfError, setWfError] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showWorkflowDetails, setShowWorkflowDetails] = useState(false);
  const [deployingId, setDeployingId] = useState(null);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [assignAgent, setShowAssignModal] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [agentConfiguration, setAgentConfiguration] = useState({
    customInstructions: '',
    duration: 'indefinite',
    priority: 'normal',
    notifications: true
  });
  const [showFirstRunPicker, setShowFirstRunPicker] = useState(false);
  const [pickedIds, setPickedIds] = useState(new Set());

  // Canonical capability/description overrides for known agents (shared by cards and modal)
  const capabilityOverrides = {
    'Accountability Coach Agent': {
      purpose: 'Keeps the founder on track with habit design and follow-through; best for daily check-ins and momentum.',
      capabilities: [
        'Daily/weekly check-ins',
        'Nudge scheduling',
        'Habit loop micro-tasks'
      ]
    },
    'Accounting Agent': {
      purpose: 'Produces formal financial reports and reconciliations for bookkeeping and CFO workflows.',
      capabilities: [
        'P&L and balance sheet',
        'Reconcile & flag anomalies',
        'Export XLS/PDF reports'
      ]
    },
    'Ad Performance Optimizer Agent': {
      purpose: 'Automates paid-ad performance tuning across platforms for better ROAS.',
      capabilities: [
        'ROAS analysis',
        'A/B test variants',
        'Reallocate budgets'
      ]
    },
    'Affiliate Partnerships Agent': {
      purpose: 'Builds and runs affiliate/partner programs to scale distribution.',
      capabilities: [
        'Prospect onboarding',
        'Offer packaging',
        'Commission tracking'
      ]
    },
    'Agent Evaluator': {
      purpose: 'Scores outputs across agents and enforces quality thresholds (Judge/QA layer).',
      capabilities: [
        'Apply rubrics',
        'Revision requests',
        'Aggregate metrics'
      ]
    },
    'Judge Agent': {
      purpose: 'Generates rubrics and enforces quality thresholds across outputs.',
      capabilities: [
        'Task rubrics',
        'Score & revise',
        'Log evaluator trends'
      ]
    },
    'Automation Agent': {
      purpose: 'Orchestrates API-based automations and routine task flows.',
      capabilities: [
        'API triggers/actions',
        'Data sync mapping',
        'Retry scheduling'
      ]
    },
    'Automation Bridge Agent': {
      purpose: 'Connects disparate automation islands, ensuring cross-system reliability.',
      capabilities: [
        'Dependency graphs',
        'Cross-tool handoffs',
        'Health monitoring'
      ]
    },
    'Board Advisor Agent': {
      purpose: 'Provides board-level briefings, risk assessments and strategic recommendations.',
      capabilities: [
        'Executive summaries',
        'Scenario analysis',
        'Board briefings'
      ]
    },
    'Bookkeeping Agent': {
      purpose: 'Handles transaction ingestion, categorization and month-end closes.',
      capabilities: [
        'Bank feed ingest',
        'Receipt matching',
        'Month-end close'
      ]
    },
    'Brand Strategist Agent': {
      purpose: 'Designs brand narrative, tone and identity guidelines.',
      capabilities: [
        'Voice & messaging',
        'Brand audits',
        'Creative guidelines'
      ]
    },
    'Business Intelligence Agent': {
      purpose: 'Central KPI hub and anomaly detection across business systems.',
      capabilities: [
        'KPI dashboards',
        'Anomaly alerts',
        'Plain-language insights'
      ]
    },
    'Business Strategist Agent': {
      purpose: 'Develops long-term plans, OKRs and strategic prioritization.',
      capabilities: [
        'Roadmaps & OKRs',
        'Trade-off analysis',
        'Milestone planning'
      ]
    },
    'Business Strategist': {
      purpose: 'Strategy assistant variant (quick strategic guidance).',
      capabilities: [
        'Rapid frameworks',
        'Quick SWOT/Porter',
        'Next-step options'
      ]
    },
    'Calendar Harmony Agent': {
      purpose: 'Optimizes user calendar for focus, balance and throughput.',
      capabilities: [
        'Timeboxing blocks',
        'Auto-schedule tasks',
        'Rebalance overload'
      ]
    },
    'Celebration Narrator Agent': {
      purpose: 'Produces the micro-celebration narratives and communications.',
      capabilities: [
        'Milestone narratives',
        'Celebratory assets',
        'Recognition scheduling'
      ]
    },
    'Chief Of Staff Agent': {
      purpose: 'Cross-agent coordinator for priorities, resource allocation and status alignment.',
      capabilities: [
        'Weekly plans',
        'Delegation matrix',
        'Dependency tracking'
      ]
    },
    'Churn Predictor Agent': {
      purpose: 'Predicts churn risk and triggers retention plays.',
      capabilities: [
        'Risk scoring',
        'Retention playbooks',
        'Effectiveness monitoring'
      ]
    },
    'Community Connector Agent': {
      purpose: 'Builds and grows user communities and external engagement.',
      capabilities: [
        'Programs & loops',
        'Events & advocacy',
        'Community health'
      ]
    },
    'Community Manager Agent': {
      purpose: 'Operates community channels day-to-day (posting, replies, moderation).',
      capabilities: [
        'Schedule posts',
        'Triage & respond',
        'Engagement reports'
      ]
    },
    'Competitive Intelligence Agent': {
      purpose: 'Monitors competitors and provides actionable briefs.',
      capabilities: [
        'Competitive tracking',
        'Landscape briefs',
        'Countermeasure recs'
      ]
    },
    'Compliance Agent': {
      purpose: 'Ensures outputs and processes comply with policies/regulations.',
      capabilities: [
        'Compliance checks',
        'Remediation plans',
        'Audit checklists'
      ]
    },
    'Connector Agent': {
      purpose: 'Manages OAuth/API connectors and health-checks for external services.',
      capabilities: [
        'API auth & tokens',
        'Connectivity tests',
        'Unified status/errors'
      ]
    },
    'Content Intelligence Agent': {
      purpose: 'Measures content performance and prescribes improvements.',
      capabilities: [
        'Content KPIs',
        'Opportunity surfacing',
        'Cadence recommendations'
      ]
    },
    'Content Repurposer Agent': {
      purpose: 'Converts existing content into alternate formats tailored for platforms.',
      capabilities: [
        'Summarize/adapt',
        'Platform reformat',
        'Variant generation'
      ]
    },
    'Content Strategist': {
      purpose: 'Plans editorial calendars and content themes aligned to goals.',
      capabilities: [
        'Calendars & briefs',
        'Funnel mapping',
        'Production allocation'
      ]
    },
    'Contract Analyzer Agent': {
      purpose: 'Parses contracts and extracts risk/obligations.',
      capabilities: [
        'Clause extraction',
        'Risk flagging',
        'Redline suggestions'
      ]
    },
    'Copywriter Agent': {
      purpose: 'High-impact short-form copywriter for ads and CTAs.',
      capabilities: [
        'Ad headlines',
        'Email CTAs',
        'Platform copy'
      ]
    },
    'Copywriter': {
      purpose: 'General writing assistant for broader copy needs.',
      capabilities: [
        'Draft/edit content',
        'Brand tone adjust',
        'A/B variants'
      ]
    },
    'CRM Agent': {
      purpose: 'Manages CRM hygiene, segments and pipelines.',
      capabilities: [
        'Enrich & dedupe',
        'Pipeline health',
        'Segmentation sync'
      ]
    },
    'CRM Automation Agent': {
      purpose: 'Automates CRM workflows and routing logic.',
      capabilities: [
        'Triggers & routing',
        'Auto-assign leads',
        'Cross-tool sync'
      ]
    },
    'Customer Intelligence Agent': {
      purpose: '360° view of customers; journey mapping and health scoring.',
      capabilities: [
        'Unified profiles',
        'Journey mapping',
        'Retention plays'
      ]
    }
  };

  const getOverrideForAgent = (name) => capabilityOverrides[name] || null;
  const { triggerCelebration } = useCelebrations();

  // Rich demo workflows used as a visual fallback in the Agent Theater
  const demoWorkflows = [
    {
      id: 'demo_wf_1',
      name: 'Customer Onboarding Automation',
      description: 'Automatically onboard new customers with Autonomous personalized welcome sequence',
      status: 'running',
      type: 'autonomous',
      progress: 75,
      current_step: 'Sending welcome email sequence',
      agents: ['Customer Success Agent', 'Email Marketing Agent', 'Personalization Agent'],
      integrations: ['Zapier', 'Gmail', 'HubSpot'],
      metrics: { customersProcessed: 234, successRate: 94 },
      triggers: ['New customer signup', 'Payment confirmation'],
      actions: [
        { step: 'Send welcome email', status: 'completed' },
        { step: 'Create customer profile', status: 'completed' },
        { step: 'Schedule onboarding call', status: 'in-progress' },
        { step: 'Send product tutorial', status: 'pending' }
      ],
      businessGoal: 'Reduce onboarding time by 60%'
    },
    {
      id: 'demo_wf_2',
      name: 'Lead Qualification & Nurturing',
      description: 'Automatically qualify and nurture leads based on behavior and engagement',
      status: 'running',
      type: 'autonomous',
      progress: 68,
      current_step: 'Analyzing lead behavior patterns',
      agents: ['Lead Personalization Agent', 'Sales Agent', 'Analytics Agent'],
      integrations: ['HubSpot', 'LinkedIn', 'Gmail', 'WhatsApp'],
      metrics: { leadsProcessed: 1247, successRate: 78 },
      triggers: ['Website visit', 'Form submission', 'Email engagement'],
      actions: [
        { step: 'Score lead quality', status: 'completed' },
        { step: 'Personalize outreach', status: 'completed' },
        { step: 'Schedule follow-up', status: 'in-progress' },
        { step: 'Update CRM', status: 'pending' }
      ],
      businessGoal: 'Increase lead conversion by 40%'
    },
    {
      id: 'demo_wf_3',
      name: 'Content Distribution & Optimization',
      description: 'Automatically distribute content across platforms and optimize for engagement',
      status: 'running',
      type: 'autonomous',
      progress: 82,
      current_step: 'Optimizing social media posts',
      agents: ['Content Strategist Agent', 'Social Media Agent', 'SEO Agent'],
      integrations: ['Facebook', 'Instagram', 'LinkedIn', 'Gmail', 'WhatsApp'],
      metrics: { postsScheduled: 156, successRate: 8.3 },
      triggers: ['New content published', 'Performance threshold met'],
      actions: [
        { step: 'Schedule social posts', status: 'completed' },
        { step: 'Optimize for SEO', status: 'completed' },
        { step: 'A/B test variations', status: 'in-progress' },
        { step: 'Analyze performance', status: 'pending' }
      ],
      businessGoal: 'Increase content reach by 50%'
    }
  ];

  useEffect(() => {
    async function fetchAvailableAgents() {
      if (!API) { setApiAgents(null); return; }
      try {
        setApiLoading(true);
        const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt');
        const res = await fetch(`${API}/agents/available`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) { setApiAgents(null); return; }
        const list = await res.json();
        if (Array.isArray(list)) setApiAgents(list);
      } catch (e) {
        setApiAgents(null);
      } finally {
        setApiLoading(false);
      }
    }
    fetchAvailableAgents();
  }, [API]);

  // Load subscription info for tier and features
  useEffect(() => {
    async function fetchSubscriptionInfo() {
      try {
        const info = await getSubscriptionInfo();
        setSubscriptionInfo(info);
      } catch (e) {
        console.error('Failed to load subscription info:', e);
        setSubscriptionInfo(null);
      } finally {
        setSubscriptionLoading(false);
      }
    }
    fetchSubscriptionInfo();
  }, []);

  // Default-select first workflow when entering theater tab or when workflows load
  useEffect(() => {
    if (activeTab !== 'theater') return;
    const list = Array.isArray(workflows) && workflows.length > 0 ? workflows : demoWorkflows;
    if (!selectedWorkflow && list.length > 0) {
      const first = list[0];
      setSelectedWorkflow(first);
    }
  }, [activeTab, workflows]);

  // Load workflows with polling fallback
  useEffect(() => {
    let timer;
    async function loadWorkflows() {
      try {
        setWfLoading(true);
        const list = await apiService.getAllWorkflows();
        if (Array.isArray(list)) setWorkflows(list);
      } catch (e) {
        setWfError('Failed to load workflows');
      } finally {
        setWfLoading(false);
      }
    }
    loadWorkflows();
    timer = setInterval(loadWorkflows, 10000);
    return () => clearInterval(timer);
  }, []);

  // WebSocket stream for workflows with reconnect and schema unification
  useEffect(() => {
    const apiUrl = (import.meta && import.meta.env && (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL)) || '';
    if (!apiUrl) return;
    const makeWsUrl = (base) => {
      try {
        const u = new URL(base);
        const proto = u.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${proto}//${u.host}/agents/workflows/stream`;
      } catch {
        return '';
      }
    };
    const wsUrl = makeWsUrl(apiUrl);
    if (!wsUrl) return;

    let ws;
    let shouldReconnect = true;
    let retryMs = 2000;

    const unify = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.workflows)) return payload.workflows;
      return [];
    };

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => { retryMs = 2000; };
        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            const list = unify(data);
            if (Array.isArray(list) && list.length >= 0) {
              setWorkflows(list);
              setWfError(null);
            }
          } catch {
            // ignore malformed frames
          }
        };
        ws.onerror = () => {};
        ws.onclose = () => {
          if (shouldReconnect) {
            setTimeout(connect, retryMs);
            retryMs = Math.min(retryMs * 2, 30000);
          }
        };
      } catch {
        // ignore
      }
    };
    connect();

    return () => {
      shouldReconnect = false;
      try { ws && ws.close(); } catch {}
    };
  }, []);

  // Workflow helpers (match previous rich cards)
  const getWfStatusStyle = (status) => {
    const styles = {
      running: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getIntegrationIcon = (integration) => {
    const icons = {
      'Zapier': Wrench,
      'Make.com': Workflow,
      'N8N': Network,
      'HubSpot': Database,
      'Gmail': Mail,
      'WhatsApp': MessageSquare,
      'Messenger': MessageSquare,
      'Facebook': Globe,
      'Instagram': Camera,
      'LinkedIn': Users,
      'QuickBooks': DollarSign,
      'Excel': FileText,
      'CRM': Database,
      'Google Analytics': BarChart,
      'Slack': MessageSquare,
      'Zendesk': Headphones,
      'Intercom': MessageSquare,
      'Buffer': Share,
      'Hootsuite': Share,
      'Twitter': Globe
    };
    return icons[integration] || Link;
  };

  // Build a rich display workflow by merging sparse API data with demo defaults
  // Normalize to expected schema and record provenance for missing fields
  const buildDisplayWorkflow = (wf, index) => {
    const demo = demoWorkflows[index % demoWorkflows.length];
    const provenance = {};
    const pick = (value, fallback, key) => {
      const chosen = value !== undefined && value !== null && (typeof value !== 'object' || Object.keys(value).length>0) ? value : fallback;
      provenance[key] = (chosen === value) ? 'live' : 'fallback';
      return chosen;
    };
    const id = pick(wf.workflow_id || wf.id, demo.id, 'id');
    const name = pick(wf.name || wf.results?.campaign?.name, demo.name, 'name');
    const description = pick(wf.description, demo.description, 'description');
    const status = pick(wf.status, demo.status, 'status');
    const type = pick(wf.type, demo.type || 'autonomous', 'type');
    const progress = pick(typeof wf.progress === 'number' ? wf.progress : wf.results?.progress, demo.progress, 'progress');
    const current_step = pick(wf.current_step || wf.currentStep || wf.results?.current_step, demo.current_step, 'current_step');
    const agents = pick(wf.agents || wf.agents_involved || wf.results?.agents, demo.agents, 'agents');
    const integrations = pick(wf.integrations || wf.results?.integrations, demo.integrations, 'integrations');
    const metrics = pick(wf.metrics || wf.results?.metrics, demo.metrics, 'metrics');
    const triggers = pick(wf.triggers || wf.results?.triggers, demo.triggers, 'triggers');
    const actions = pick(wf.actions || wf.results?.actions, demo.actions, 'actions');
    const businessGoal = pick(wf.businessGoal || wf.results?.businessGoal, demo.businessGoal, 'businessGoal');
    const metadata = pick(wf.metadata, {}, 'metadata');
    const cost = pick(wf.cost, undefined, 'cost');
    const estimatedCost = pick(wf.estimatedCost, undefined, 'estimatedCost');
    const evaluator = pick(wf.evaluator || wf.judge, undefined, 'evaluator');
    return { id, name, description, status, type, progress, current_step, agents, integrations, metrics, triggers, actions, businessGoal, metadata, cost, estimatedCost, evaluator, _provenance: provenance };
  };

  const handleDeploy = async (workflow) => {
    const wfId = workflow.workflow_id || workflow.id;
    if (!wfId) return;
    setDeployingId(wfId);
    try {
      await apiService.deployWorkflow(wfId, 'n8n');
      triggerCelebration(CelebrationType.TASK_COMPLETE, { message: 'Workflow deployed! 🚀', intensity: 'normal' });
    } finally {
      setDeployingId(null);
    }
  };

  const WorkflowCard = ({ workflow, isSelected }) => (
    <motion.div
      className={`bg-white rounded-lg p-6 transition-shadow cursor-pointer ${isSelected ? 'border-4 border-blue-600 ring-4 ring-blue-200 ring-offset-2 shadow-2xl' : 'border hover:shadow-xl'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      // Card clicks no longer open details; use explicit buttons below
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Workflow className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{workflow.name || workflow.results?.campaign?.name || (workflow.workflow_id || workflow.id)}</h3>
            <p className="text-sm text-gray-500">{workflow.description}</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2 items-end">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getWfStatusStyle(workflow.status)}`}>
            {workflow.status}
          </span>
          <span className="text-xs text-gray-500 capitalize">{workflow.type || 'autonomous'}</span>
          {(workflow.workflow_id || workflow.id) && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDeploy(workflow); }}
              disabled={deployingId === (workflow.workflow_id || workflow.id)}
              className="mt-2 inline-flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {deployingId === (workflow.workflow_id || workflow.id) ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Deploying…</span>
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3" />
                  <span>Deploy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {typeof workflow.progress === 'number' && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{workflow.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div className="bg-blue-600 h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${workflow.progress}%` }} transition={{ duration: 1, delay: 0.2 }} />
          </div>
        </div>
      )}

      {/* Current Step */}
      {workflow.current_step && (
        <div className="mb-4">
          <p className="text-sm text-gray-600"><span className="font-medium">Current Step:</span> {workflow.current_step}</p>
        </div>
      )}

      {/* Agents */}
      {(workflow.agents || workflow.agents_involved)?.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Agents Involved:</h4>
          <div className="flex flex-wrap gap-1">
            {(workflow.agents || workflow.agents_involved).slice(0, 4).map((agent, idx) => (
              <span key={`${agent}-${idx}`} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{agent}</span>
            ))}
          </div>
        </div>
      )}

      {/* Triggers */}
      {Array.isArray(workflow.triggers) && workflow.triggers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Triggers:</h4>
          <div className="flex flex-wrap gap-1">
            {workflow.triggers.map((t, i) => (
              <span key={`${t}-${i}`} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {Array.isArray(workflow.actions) && workflow.actions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Actions:</h4>
          <div className="space-y-1">
            {workflow.actions.map((a, i) => (
              <div key={`${a.step}-${i}`} className="flex items-center justify-between text-sm">
                <div className="text-gray-700 truncate pr-2">{a.step} <span className="text-xs text-gray-500">{a.agent ? `• ${a.agent}` : ''}</span></div>
                <span className={`px-2 py-0.5 text-xs rounded-full ${a.status==='completed'?'bg-green-100 text-green-700':a.status==='in-progress'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-700'}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integrations */}
      {Array.isArray(workflow.integrations) && workflow.integrations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Integrations:</h4>
          <div className="flex flex-wrap gap-2">
            {workflow.integrations.slice(0, 6).map(integration => {
              const IntegrationIcon = getIntegrationIcon(integration);
              return (
                <div key={integration} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full">
                  <IntegrationIcon className="w-3 h-3 text-gray-600" />
                  <span className="text-xs text-gray-600">{integration}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metrics */}
      {workflow.metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {workflow.metrics.customersProcessed !== undefined && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{workflow.metrics.customersProcessed}</div>
              <div className="text-xs text-gray-500">Customers Processed</div>
            </div>
          )}
          {workflow.metrics.leadsProcessed !== undefined && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{workflow.metrics.leadsProcessed}</div>
              <div className="text-xs text-gray-500">Leads Processed</div>
            </div>
          )}
          {workflow.metrics.postsScheduled !== undefined && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{workflow.metrics.postsScheduled}</div>
              <div className="text-xs text-gray-500">Posts Scheduled</div>
            </div>
          )}
          {workflow.metrics.reportsGenerated !== undefined && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{workflow.metrics.reportsGenerated}</div>
              <div className="text-xs text-gray-500">Reports Generated</div>
            </div>
          )}
          {workflow.metrics.ticketsHandled !== undefined && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{workflow.metrics.ticketsHandled}</div>
              <div className="text-xs text-gray-500">Tickets Handled</div>
            </div>
          )}
          {workflow.metrics.successRate !== undefined && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{workflow.metrics.successRate}%</div>
              <div className="text-xs text-gray-500">Success Rate</div>
            </div>
          )}
          {workflow.metrics.qualificationRate !== undefined && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{workflow.metrics.qualificationRate}%</div>
              <div className="text-xs text-gray-500">Qualification Rate</div>
            </div>
          )}
          {workflow.metrics.avgEngagement !== undefined && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{workflow.metrics.avgEngagement}%</div>
              <div className="text-xs text-gray-500">Avg Engagement</div>
            </div>
          )}
          {workflow.metrics.accuracyRate !== undefined && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{workflow.metrics.accuracyRate}%</div>
              <div className="text-xs text-gray-500">Accuracy Rate</div>
            </div>
          )}
          {workflow.metrics.autoResolutionRate !== undefined && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{workflow.metrics.autoResolutionRate}%</div>
              <div className="text-xs text-gray-500">Auto-Resolution</div>
            </div>
          )}
          {workflow.metrics.avgTimeToComplete && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-sm font-semibold text-gray-900">{workflow.metrics.avgTimeToComplete}</div>
              <div className="text-xs text-gray-500">Avg Time to Complete</div>
            </div>
          )}
          {workflow.metrics.costPerCustomer && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-sm font-semibold text-gray-900">{workflow.metrics.costPerCustomer}</div>
              <div className="text-xs text-gray-500">Cost per Customer</div>
            </div>
          )}
        </div>
      )}

      {/* Business Goal */}
      {workflow.businessGoal && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-900">Business Goal</span>
          </div>
          <p className="text-sm text-blue-800">{workflow.businessGoal}</p>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button
          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          onClick={(e) => { e.stopPropagation(); setSelectedAgent(null); setSelectedWorkflow(workflow); setShowWorkflowDetails(true); }}
        >
          Details
        </button>
        <button
          className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
          onClick={(e) => { e.stopPropagation(); setSelectedWorkflow(workflow); }}
        >
          View in Theater
        </button>
      </div>
    </motion.div>
  );

  // Workflow Details Modal (full transparency)
  const WorkflowDetailsModal = () => {
    if (!showWorkflowDetails || !selectedWorkflow) return null;
    const wf = selectedWorkflow;
    const upcoming = Array.isArray(wf.actions) ? wf.actions.filter(a => a.status !== 'completed') : [];
    const completed = Array.isArray(wf.actions) ? wf.actions.filter(a => a.status === 'completed') : [];
    const comms = Array.isArray(wf.communications) ? wf.communications : [];
    const outputs = Array.isArray(wf.outputs) ? wf.outputs : [];
    const evaluator = wf.evaluator || wf.judge || {};
    const cost = wf.cost || wf.estimatedCost || (wf.metrics && wf.metrics.cost);
    const meta = wf.metadata || {};
    // Removed useState hooks to fix React error #310
    const tab = 'metadata';
    const showArtifactModal = false;
    const previewArtifact = null;

    // Note: Data loading is handled by the main component's useEffect hooks

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowWorkflowDetails(false)}>
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{wf.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getWfStatusStyle(wf.status)}`}>{wf.status}</span>
                  <span className="text-xs text-gray-500 capitalize">{wf.type}</span>
                  
                </div>
              </div>
              <button onClick={()=>setShowWorkflowDetails(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            {typeof wf.progress === 'number' && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{wf.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${wf.progress}%` }} />
                </div>
              </div>
            )}

            {wf.current_step && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-900">Current Step</span>
                </div>
                <p className="text-sm text-blue-800">{wf.current_step}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white border rounded-lg p-2">
              <div className="flex flex-wrap gap-2">
                {['metadata','flow','tasks','content','costs','evaluator','audit'].map(k => (
                  <button key={k} onClick={()=>setTab(k)} className={`px-3 py-1.5 text-sm rounded ${tab===k?'bg-gray-900 text-white':'bg-gray-100 hover:bg-gray-200'}`}>{k.charAt(0).toUpperCase()+k.slice(1)}</button>
                ))}
              </div>
              {selectedWorkflow?._provenance && (
                <div className="mt-2 text-xs text-gray-500">
                  <span className="mr-2">Legend:</span>
                  <span className="inline-block px-1.5 py-0.5 mr-1 rounded bg-emerald-50 text-emerald-700">live</span>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">fallback</span>
                </div>
              )}
            </div>

            {tab==='metadata' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Workflow Metadata {selectedWorkflow?._provenance && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${selectedWorkflow._provenance.metadata==='live'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{selectedWorkflow._provenance.metadata}</span>}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-600">Workflow ID:</span> <span className="font-medium">{wf.id}</span></div>
                      <div><span className="text-gray-600">Type:</span> <span className="font-medium capitalize">{wf.type}</span></div>
                      <div><span className="text-gray-600">Date Created:</span> <span className="font-medium">{meta.created_at || '-'}</span></div>
                      <div><span className="text-gray-600">Last Run:</span> <span className="font-medium">{meta.last_run || '-'}</span></div>
                      <div><span className="text-gray-600">Next Run:</span> <span className="font-medium">{meta.next_run || '-'}</span></div>
                      <div><span className="text-gray-600">Trigger:</span> <span className="font-medium capitalize">{wf.trigger || meta.trigger || '-'}</span></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Agents Involved {selectedWorkflow?._provenance && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${selectedWorkflow._provenance.agents==='live'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{selectedWorkflow._provenance.agents}</span>}</h3>
                    <div className="flex flex-wrap gap-1">{(wf.agents||[]).map((a,i)=>(<span key={`${a}-${i}`} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{a}</span>))}</div>
                  </div>
                </div>
              </div>
            )}

            {tab==='flow' && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Process Flow</h3>
                <div className="text-sm text-gray-600 mb-3">Parallel vs sequential steps, color-coded by status.</div>
                <div className="border rounded-lg p-6 text-center text-sm text-gray-500">Flow graph visualization placeholder</div>
              </div>
            )}

            {tab==='tasks' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Execution Timeline {selectedWorkflow?._provenance && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${selectedWorkflow._provenance.actions==='live'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{selectedWorkflow._provenance.actions}</span>}</h3>
                    <div className="space-y-2">
                      {(wf.actions||[]).map((a, i)=> (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="truncate pr-2">
                            <span className="font-medium text-gray-800">{a.step}</span>
                            {a.agent && <span className="text-xs text-gray-500"> • {a.agent}</span>}
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${a.status==='completed'?'bg-green-100 text-green-700':a.status==='in-progress'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-700'}`}>{a.status || 'pending'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Agents Involved</h3>
                    <div className="flex flex-wrap gap-1">{(wf.agents||[]).map((a,i)=>(<span key={`${a}-${i}`} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{a}</span>))}</div>
                  </div>
                </div>
              </div>
            )}

            {tab==='content' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Content Artifacts {selectedWorkflow?._provenance && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${selectedWorkflow._provenance.outputs==='live'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{selectedWorkflow._provenance.outputs}</span>}</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {(outputs || []).map((o, i) => (
                      <li key={i}>{typeof o === 'string' ? o : (o.title || o.name || JSON.stringify(o))}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Communications Log {selectedWorkflow?._provenance && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${selectedWorkflow._provenance.communications==='live'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{selectedWorkflow._provenance.communications}</span>}</h3>
                  <div className="space-y-3">
                    {(comms || []).map((c, i) => (
                      <div key={i} className="border rounded p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800">{c.channel || 'Message'}</span>
                          <span className="text-xs text-gray-500">{c.timestamp || ''}</span>
                        </div>
                        <div className="text-gray-700">
                          {c.recipient && (
                            <div className="text-xs text-gray-500">To: {c.recipient}</div>
                          )}
                          <div className="text-sm whitespace-pre-wrap">{c.summary || c.content || ''}</div>
                          <div className="text-xs text-gray-500 mt-1">Status: {c.status || 'sent'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab==='costs' && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Cost Tracking {selectedWorkflow?._provenance && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${selectedWorkflow._provenance.metrics==='live'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{selectedWorkflow._provenance.metrics}</span>}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded"><div className="text-xs text-gray-500">Estimated Cost</div><div className="font-semibold">{wf.estimatedCost ? `$${Number(wf.estimatedCost).toFixed(2)}` : '-'}</div></div>
                  <div className="p-3 bg-gray-50 rounded"><div className="text-xs text-gray-500">Actual Cost</div><div className="font-semibold">{cost ? (typeof cost==='string'?cost:`$${Number(cost).toFixed(2)}`): '-'}</div></div>
                  <div className="p-3 bg-gray-50 rounded"><div className="text-xs text-gray-500">Cost-to-Value</div><div className="font-semibold">{wf.costToValue || '-'}</div></div>
                </div>
                {Array.isArray(wf.actions)&&wf.actions.length>0 && (
                  <div className="mt-4"><div className="text-sm font-medium mb-2">Breakdown by Step</div><div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">{wf.actions.map((a,i)=>(<div key={i} className="border rounded p-2 flex items-center justify-between"><span className="truncate pr-2">{a.step}</span><span className="font-semibold">{a.cost ? `$${Number(a.cost).toFixed(2)}` : '-'}</span></div>))}</div></div>
                )}
              </div>
            )}

            {tab==='evaluator' && (
              <div className="bg-white border rounded-lg p-4"><h3 className="text-lg font-semibold mb-3">Evaluator Feedback</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm"><div className="p-3 bg-gray-50 rounded"><div className="text-xs text-gray-500">Score</div><div className="font-semibold">{evaluator.score !== undefined ? evaluator.score : '-'}</div></div><div className="p-3 bg-gray-50 rounded"><div className="text-xs text-gray-500">Confidence</div><div className="font-semibold">{evaluator.confidence || '-'}</div></div><div className="p-3 bg-gray-50 rounded"><div className="text-xs text-gray-500">Compared to Baseline</div><div className="font-semibold">{evaluator.baseline || '-'}</div></div></div>{evaluator.notes && (<div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{evaluator.notes}</div>)}</div>
            )}

            {tab==='audit' && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Audit & Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Version:</span> <span className="font-medium">{meta.version || '-'}</span></div>
                  <div><span className="text-gray-500">Approvals:</span> <span className="font-medium">{meta.approvals || '-'}</span></div>
                  <div className="md:col-span-2"><span className="text-gray-500">Data Sources:</span> <span className="font-medium">{Array.isArray(meta.data_sources)?meta.data_sources.join(', '):'-'}</span></div>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-medium mb-2">Workflow Log</div>
                  <div className="space-y-2 text-xs">
                    {(meta.log||[]).map((e,i)=> (
                      <div key={i} className="border rounded p-2 flex items-center justify-between">
                        <span className="truncate pr-2">{e.message || JSON.stringify(e)}</span>
                        <span className="text-gray-500">{e.timestamp || ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      {showArtifactModal && previewArtifact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" onClick={() => { setShowArtifactModal(false); setPreviewArtifact(null); }}>
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{previewArtifact.name}</h3>
              <div className="flex items-center gap-2">
                {previewArtifact.url && (
                  <a
                    href={previewArtifact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download
                  </a>
                )}
                <button className="text-gray-500 hover:text-gray-700" onClick={() => { setShowArtifactModal(false); setPreviewArtifact(null); }}>×</button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 h-[70vh] overflow-auto">
              {previewArtifact.url ? (
                <iframe src={previewArtifact.url} title={previewArtifact.name} className="w-full h-full rounded border" />
              ) : (
                <div className="text-sm text-gray-600">No preview available. {previewArtifact.content ? 'Showing inline content below.' : 'Please download to view.'}
                  {previewArtifact.content && (
                    <pre className="mt-3 p-3 bg-white border rounded overflow-auto whitespace-pre-wrap text-xs text-gray-800">{previewArtifact.content}</pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    );
  };

  // Handler functions
  const handleActivateAgent = (agent) => {
    console.log('Activating agent:', agent.name);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `${agent.name} activated! 🚀`,
      intensity: 'high'
    });
    // In real implementation, this would trigger the agent activation
  };

  const handleConfigureAgent = (agent) => {
    setSelectedAgent(agent);
    setShowConfigureModal(true);
  };

  const handleViewActivity = (agent) => {
    setSelectedAgent(agent);
    setShowActivityModal(true);
  };

  const handleSaveConfiguration = () => {
    console.log('Saving configuration for:', selectedAgent.name, agentConfiguration);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Configuration saved for ${selectedAgent.name}! ⚙️`,
      intensity: 'normal'
    });
    setShowConfigureModal(false);
  };

  // Determine Base Pack agents to auto-include for non-Enterprise tiers
  const basePackAgentNames = [
    // Judge Layer
    'Judge Agent', 'Agent Evaluator',
    // Orchestration Layer
    'Orchestrator Agent', 'Automation Agent', 'Connector Agent',
    // Business Intelligence Layer
    'Business Intelligence Agent', 'Financial Intelligence Agent', 'Customer Intelligence Agent',
    // Execution Layer
    'Content Intelligence Agent', 'Automation Bridge Agent',
    // Operations Layer
    'Onboarding Agent', 'Calendar Harmony Agent',
  ];

  const tier = subscriptionInfo?.tier || null;
  const isEnterprise = (tier || '').toLowerCase() === 'enterprise';

  // Tier-based hiring rates
  const getTierRates = (t) => {
    const key = (t || '').toLowerCase();
    if (key === 'starter') return { monthly: 12, daily: 1.5 };
    if (key === 'growth') return { monthly: 11, daily: 1.25 };
    if (key === 'professional') return { monthly: 10, daily: 1.0 };
    if (key === 'enterprise') return { monthly: 8, daily: 0.5 };
    return { monthly: 12, daily: 1.5 };
  };

  const isApiAgentEntitled = (a) => {
    const hired = Boolean(a?.hired_until && new Date(a.hired_until) > new Date());
    return Boolean(a?.included_in_subscription) || hired;
  };

  // Merge API agents with Base Pack inclusion
  const mergedApiAgents = Array.isArray(apiAgents) ? (() => {
    const byName = new Map(apiAgents.map(a => [a.name, a]));
    basePackAgentNames.forEach(name => {
      if (!byName.has(name)) {
        byName.set(name, {
          id: `base-${name}`,
          agent_id: `base-${name}`,
          name,
          category: 'automation',
          type: 'management',
          description: name,
          capabilities: ['Core capability'],
          included_in_subscription: true,
          hired_until: null,
          daily_rate_usd: 0,
          monthly_rate_usd: 0
        });
      } else {
        const existing = byName.get(name);
        byName.set(name, { ...existing, included_in_subscription: true });
      }
    });
    return Array.from(byName.values());
  })() : (() => {
    const rates = getTierRates(tier);
    const baseIncluded = basePackAgentNames.map(name => ({
      id: `base-${name}`,
      agent_id: `base-${name}`,
      name,
      category: 'automation',
      type: 'management',
      description: name,
      capabilities: ['Core capability'],
      included_in_subscription: true,
      hired_until: null,
      daily_rate_usd: 0,
      monthly_rate_usd: 0,
      can_hire_daily: false,
      can_hire_monthly: false
    }));
    const otherLocal = allAgents
      .filter(a => !basePackAgentNames.includes(a.name))
      .map(a => ({
        id: a.id,
        agent_id: a.id,
        name: a.name,
        category: a.category,
        type: a.type,
        description: a.description,
        capabilities: a.capabilities,
        included_in_subscription: false,
        hired_until: null,
        daily_rate_usd: rates.daily,
        monthly_rate_usd: rates.monthly,
        can_hire_daily: true,
        can_hire_monthly: true
      }));
    return [...baseIncluded, ...otherLocal];
  })();

  const includedAgents = Array.isArray(mergedApiAgents)
    ? mergedApiAgents.filter(a => isApiAgentEntitled(a))
    : [];
  const hireableAgents = Array.isArray(mergedApiAgents)
    ? mergedApiAgents.filter(a => !isApiAgentEntitled(a))
    : [];

  // Sort included: Base Pack first, then by name; hireable by name
  const basePackOrder = new Map(basePackAgentNames.map((n, i) => [n, i]));
  const includedAgentsSorted = includedAgents.slice().sort((a, b) => {
    const ai = basePackOrder.has(a.name) ? basePackOrder.get(a.name) : Number.MAX_SAFE_INTEGER;
    const bi = basePackOrder.has(b.name) ? basePackOrder.get(b.name) : Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return (a.name || '').localeCompare(b.name || '');
  });
  const hireableAgentsSorted = hireableAgents.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Get category styling
  const getCategoryStyle = (category) => {
    const styles = {
      executive: 'bg-purple-100 text-purple-800 border-purple-200',
      content: 'bg-blue-100 text-blue-800 border-blue-200',
      research: 'bg-green-100 text-green-800 border-green-200',
      financial: 'bg-white text-gray-800 border-gray-200',
      creative: 'bg-pink-100 text-pink-800 border-pink-200',
      automation: 'bg-orange-100 text-orange-800 border-orange-200',
      evaluation: 'bg-red-100 text-red-800 border-red-200',
      orchestration: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      customer: 'bg-teal-100 text-teal-800 border-teal-200',
      sales: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      support: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      business: 'bg-violet-100 text-violet-800 border-violet-200',
      technical: 'bg-gray-100 text-gray-800 border-gray-200',
      marketing: 'bg-rose-100 text-rose-800 border-rose-200',
      analytics: 'bg-sky-100 text-sky-800 border-sky-200',
      communication: 'bg-lime-100 text-lime-800 border-lime-200',
      hr: 'bg-amber-100 text-amber-800 border-amber-200',
      legal: 'bg-stone-100 text-stone-800 border-stone-200',
      procurement: 'bg-zinc-100 text-zinc-800 border-zinc-200',
      innovation: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      product: 'bg-slate-100 text-slate-800 border-slate-200',
      intelligence: 'bg-neutral-100 text-neutral-800 border-neutral-200',
      sustainability: 'bg-green-100 text-green-800 border-green-200'
    };
    return styles[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get type icon
  const getTypeIcon = (type) => {
    const icons = {
      strategy: Brain,
      creation: FileText,
      analysis: BarChart,
      automation: Zap,
      quality: Shield,
      management: Settings,
      support: Users,
      conversion: Target,
      assistance: Heart,
      development: Briefcase,
      security: Shield,
      infrastructure: Globe,
      email: Mail,
      seo: TrendingUp,
      advertising: Megaphone,
      social: Users,
      prediction: TrendingUp,
      intelligence: Brain,
      chat: MessageSquare,
      voice: Phone,
      translation: Globe,
      compliance: Shield,
      research: Lightbulb,
      processing: Database
    };
    return icons[type] || Brain;
  };

  // Get status styling
  const getStatusStyle = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // Agent Theater card (distinct visual with quick actions)
  const TheaterAgentCard = ({ agent }) => {
    const TypeIcon = getTypeIcon(agent.type);
    const energy = Math.max(20, Math.min(95, 50 + (agent.id.charCodeAt(0) % 41))); // pseudo energy level
    return (
      <motion.div
        className="bg-white rounded-xl p-5 shadow-lg border hover:shadow-xl transition-shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${getCategoryStyle(agent.category).replace('100', '200')}`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 leading-tight">{agent.name}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusStyle(agent.status)}`}>
                  {agent.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 capitalize">{agent.category} • {agent.type}</p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{agent.description}</p>

        {/* Energy/progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Energy</span>
            <span>{energy}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${energy}%` }} />
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200"
            onClick={() => setSelectedAgent(agent)}
          >
            Details
          </button>
          <button
            className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-800 rounded-md text-sm font-medium hover:bg-indigo-200"
            onClick={() => handleConfigureAgent(agent)}
          >
            Assign Task
          </button>
          <button
            className="px-3 py-2 bg-purple-100 text-purple-800 rounded-md text-sm font-medium hover:bg-purple-200"
            onClick={() => alert('Chat coming soon')}
          >
            Chat
          </button>
        </div>
      </motion.div>
    );
  };

  // Agent detail modal
  const AgentDetailModal = () => {
    if (!selectedAgent) return null;

    const TypeIcon = getTypeIcon(selectedAgent.type);
    // Start/Pause control removed from Details modal per requirements
    // Removed useState hooks to fix React error #310
    const showArtifactModal = false;
    const previewArtifact = null;
    // Suggested integrations by category (display purpose only)
    const suggestedIntegrationsByCategory = {
      marketing: ['Buffer', 'Hootsuite', 'Gmail', 'LinkedIn'],
      content: ['Google Analytics', 'Gmail', 'Slack'],
      research: ['Google Analytics', 'CRM'],
      financial: ['QuickBooks', 'Excel'],
      orchestration: ['N8N', 'Zapier', 'Make.com'],
      automation: ['Zapier', 'Make.com', 'N8N'],
      customer: ['HubSpot', 'CRM', 'Slack'],
      analytics: ['Google Analytics', 'Excel'],
      communication: ['Gmail', 'Slack', 'WhatsApp'],
      technical: ['GitHub', 'Slack'],
      executive: ['Google Analytics', 'CRM'],
      evaluation: ['Google Analytics'],
      operations: ['Calendar', 'Gmail']
    };
    const suggested = suggestedIntegrationsByCategory[selectedAgent.category] || ['Gmail', 'Slack'];

    // Overrides for purpose and core capabilities keyed by canonical agent id/name
    const capabilityOverrides = {
      'Accountability Coach Agent': {
        purpose: 'Keeps the founder on track with habit design and follow-through; best for daily check-ins and momentum.',
        capabilities: [
          'Daily/weekly check-ins and progress summaries',
          'Nudge scheduling and reminder sequences',
          'Break large goals into micro-tasks and habit loops'
        ]
      },
      'Accounting Agent': {
        purpose: 'Produces formal financial reports and reconciliations for bookkeeping and CFO workflows.',
        capabilities: [
          'Generate P&L, balance sheet, cashflow statements',
          'Reconcile transactions and flag anomalies',
          'Export professionally formatted spreadsheets/PDFs'
        ]
      },
      'Ad Performance Optimizer Agent': {
        purpose: 'Automates paid-ad performance tuning across platforms for better ROAS.',
        capabilities: [
          'Analyze ROAS and recommend budget/bid changes',
          'Create and evaluate A/B test variants',
          'Reallocate spend to top-performing creatives/channels'
        ]
      },
      'Affiliate Partnerships Agent': {
        purpose: 'Builds and runs affiliate/partner programs to scale distribution.',
        capabilities: [
          'Prospect and onboard affiliates',
          'Package offers, track commissions and performance',
          'Monitor channel KPIs and optimize partner incentives'
        ]
      },
      'Agent Evaluator': {
        purpose: 'Scores outputs across agents and enforces quality thresholds (Judge/QA layer).',
        capabilities: [
          'Apply rubrics and produce pass/fail scores',
          'Provide revision requests and improvement suggestions',
          'Aggregate evaluation metrics over time'
        ]
      },
      'Judge Agent': {
        purpose: 'Generates rubrics and enforces quality thresholds across outputs.',
        capabilities: [
          'Create task-specific rubrics and grading rules',
          'Score deliverables and trigger revisions',
          'Log evaluator outputs and trends'
        ]
      },
      'Automation Agent': {
        purpose: 'Orchestrates API-based automations and routine task flows.',
        capabilities: [
          'Build triggers/actions for API orchestration',
          'Map data flows and syncs between services',
          'Schedule and retry failed automations'
        ]
      },
      'Automation Bridge Agent': {
        purpose: 'Connects disparate automation islands, ensuring cross-system reliability.',
        capabilities: [
          'Manage dependency graphs and retries',
          'Orchestrate cross-tool data handoffs',
          'Monitor health and provide remediation steps'
        ]
      },
      'Board Advisor Agent': {
        purpose: 'Provides board-level briefings, risk assessments and strategic recommendations.',
        capabilities: [
          'Summarize performance for executive reviews',
          'Scenario analysis and risk framing',
          'Produce board-ready briefings and action items'
        ]
      },
      'Bookkeeping Agent': {
        purpose: 'Handles transaction ingestion, categorization and month-end closes.',
        capabilities: [
          'Bank feed ingestion and categorization',
          'Receipt matching and reconciliation',
          'Close month workflows and generate ledger exports'
        ]
      },
      'Brand Strategist Agent': {
        purpose: 'Designs brand narrative, tone and identity guidelines.',
        capabilities: [
          'Create voice & messaging frameworks',
          'Audit existing content for brand fit',
          'Generate actionable creative guidelines for assets'
        ]
      },
      'Business Intelligence Agent': {
        purpose: 'Central KPI hub and anomaly detection across business systems.',
        capabilities: [
          'Aggregate KPIs, cohorts and dashboards',
          'Detect anomalies and send alerts',
          'Provide plain-language insights and recommended actions'
        ]
      },
      'Business Strategist Agent': {
        purpose: 'Develops long-term plans, OKRs and strategic prioritization.',
        capabilities: [
          'Build roadmap and strategic options',
          'Perform trade-off and impact analysis',
          'Output prioritized initiatives and milestone plans'
        ]
      },
      'Business Strategist': {
        purpose: 'Strategy assistant variant (quick strategic guidance).',
        capabilities: [
          'Rapid strategy notes and frameworks',
          'Generate quick SWOT/Porter-like analyses',
          'Provide options and next-step recommendations'
        ]
      },
      'Calendar Harmony Agent': {
        purpose: 'Optimizes user calendar for focus, balance and throughput.',
        capabilities: [
          'Suggest timeboxing and focus blocks',
          'Auto-schedule agent tasks and meetings',
          'Detect overload and rebalance calendar'
        ]
      },
      'Celebration Narrator Agent': {
        purpose: 'Produces the micro-celebration narratives and communications.',
        capabilities: [
          'Generate milestone narratives and announcements',
          'Create celebratory assets/messages',
          'Schedule recognition items in UI/community channels'
        ]
      },
      'Chief Of Staff Agent': {
        purpose: 'Cross-agent coordinator for priorities, resource allocation and status alignment.',
        capabilities: [
          'Create weekly plans and delegation matrices',
          'Reconcile competing priorities across agents',
          'Track cross-agent dependencies and progress'
        ]
      },
      'Churn Predictor Agent': {
        purpose: 'Predicts churn risk and triggers retention plays.',
        capabilities: [
          'Compute churn risk scores and segments',
          'Recommend retention playbooks and outreach sequences',
          'Monitor effectiveness of interventions'
        ]
      },
      'Community Connector Agent': {
        purpose: 'Builds and grows user communities and external engagement.',
        capabilities: [
          'Design community programs and engagement loops',
          'Run event & advocacy campaigns',
          'Moderate & measure community health'
        ]
      },
      'Community Manager Agent': {
        purpose: 'Operates community channels day-to-day (posting, replies, moderation).',
        capabilities: [
          'Schedule and post community content',
          'Triage and respond to member questions',
          'Generate engagement reports and sentiment summaries'
        ]
      },
      'Competitive Intelligence Agent': {
        purpose: 'Monitors competitors and provides actionable briefs.',
        capabilities: [
          'Track competitor product/marketing moves',
          'Produce competitive landscape and alerts',
          'Recommend countermeasures or differentiation plays'
        ]
      },
      'Compliance Agent': {
        purpose: 'Ensures outputs and processes comply with policies/regulations.',
        capabilities: [
          'Run compliance checks and produce audit trails',
          'Suggest remediation plans for non-compliance',
          'Maintain regulatory mappings and checklists'
        ]
      },
      'Connector Agent': {
        purpose: 'Manages OAuth/API connectors and health-checks for external services.',
        capabilities: [
          'Authenticate/connect to services and renew tokens',
          'Test connectivity and log failures',
          'Provide unified API status & error translations'
        ]
      },
      'Content Intelligence Agent': {
        purpose: 'Measures content performance and prescribes improvements.',
        capabilities: [
          'Track content KPIs (CTR, engagement, conversions)',
          'Surface topic/format opportunities',
          'Recommend cadence and repurposing strategies'
        ]
      },
      'Content Repurposer Agent': {
        purpose: 'Converts existing content into alternate formats tailored for platforms.',
        capabilities: [
          'Summarize and convert long-form to posts/scripts',
          'Reformat for platform constraints',
          'Generate multiple format-ready variants'
        ]
      },
      'Content Strategist': {
        purpose: 'Plans editorial calendars and content themes aligned to goals.',
        capabilities: [
          'Create multi-channel calendars and briefs',
          'Map content to funnels and KPIs',
          'Allocate agent tasks for content production'
        ]
      },
      'Contract Analyzer Agent': {
        purpose: 'Parses contracts and extracts risk/obligations.',
        capabilities: [
          'Clause extraction and summarization',
          'Flag risky terms and obligations',
          'Produce redline suggestions and plain-language summaries'
        ]
      },
      'Copywriter Agent': {
        purpose: 'High-impact short-form copywriter for ads and CTAs.',
        capabilities: [
          'Produce ad headlines and variants',
          'Generate email subject lines and CTAs',
          'Create platform-optimized copy versions'
        ]
      },
      'Copywriter': {
        purpose: 'General writing assistant for broader copy needs.',
        capabilities: [
          'Draft long-form and short-form content',
          'Edit to brand voice and tone',
          'Produce multiple variants for A/B testing'
        ]
      },
      'CRM Agent': {
        purpose: 'Manages CRM hygiene, segments and pipelines.',
        capabilities: [
          'Enrich records and dedupe entries',
          'Manage deal stages and pipeline health',
          'Run segmentation and sync with other systems'
        ]
      },
      'CRM Automation Agent': {
        purpose: 'Automates CRM workflows and routing logic.',
        capabilities: [
          'Build triggers and routing rules',
          'Auto-assign leads and create follow-up tasks',
          'Sync CRM events across tools'
        ]
      },
      'Customer Intelligence Agent': {
        purpose: '360° view of customers; journey mapping and health scoring.',
        capabilities: [
          'Build unified customer profiles and LTV calculations',
          'Map journeys and identify friction points',
          'Suggest retention/expansion plays'
        ]
      }
      // Additional overrides can be appended as needed
    };

    const override = capabilityOverrides[selectedAgent.name];
    const activity = getAgentActivityData(selectedAgent).slice(0, 4);
    // Lightweight artifacts mock based on category
    const artifactsByCategory = {
      content: ['Blog Post Draft.md', 'Social Graphics.zip', 'Newsletter.eml'],
      research: ['Market Analysis.pdf', 'Lead Enrichment.csv'],
      financial: ['P&L.xlsx', 'Cashflow.pdf'],
      marketing: ['Ad Variations.docx', 'Landing A/B Report.pdf'],
      analytics: ['KPI Dashboard.png', 'Weekly Metrics.csv'],
      customer: ['Segment Report.csv', 'Churn Signals.pdf'],
      automation: ['Workflow.json', 'Integration Map.png'],
      orchestration: ['Runbook.md', 'Workflow Plan.md']
    };
    // Prefer real artifacts from API if present on the raw agent; fallback to mocks
    const rawArtifacts = Array.isArray(selectedAgent._raw?.artifacts) ? selectedAgent._raw.artifacts : null;
    // Normalize to objects: { name, url?, mime? }
    const normalizedArtifacts = rawArtifacts
      ? rawArtifacts.map(a => (typeof a === 'string' ? { name: a } : a))
      : (artifactsByCategory[selectedAgent.category] || ['Summary Report.pdf']).map(n => ({ name: n }));

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getCategoryStyle(selectedAgent.category).replace('100', '200')}`}>
                  <TypeIcon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedAgent.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryStyle(selectedAgent.category)}`}>
                      {selectedAgent.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(selectedAgent.status)}`}>
                      {selectedAgent.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-700">{override?.purpose || selectedAgent.description}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Capabilities</h3>
                  <div className="space-y-2">
                    {(override?.capabilities || selectedAgent.capabilities).map(capability => (
                      <div key={capability} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
                        <span className="text-gray-700 leading-tight">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Connections</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggested.map((integration) => {
                      const Icon = getIntegrationIcon(integration);
                      return (
                        <div key={integration} className="flex items-center space-x-1 px-2 py-1 bg-white border rounded-full">
                          <Icon className="w-3 h-3 text-gray-600" />
                          <span className="text-xs text-gray-700">{integration}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Suggested integrations based on this agent's category.</p>
                </div>

                {(selectedAgent._entitled || selectedAgent._hasHistory) ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                      <div className="space-y-3">
                        {activity.map(item => (
                          <div key={item.id} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">{item.action}</span>
                              <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                                item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                              }`}>{item.status}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-1">{item.timestamp}</div>
                            <div className="text-sm text-gray-700">{item.details}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3">Artifacts</h3>
                      <div className="flex flex-wrap gap-2">
                        {normalizedArtifacts.map(a => (
                          <button
                            key={a.name}
                            className="px-2 py-1 bg-white border rounded text-xs text-gray-700 hover:bg-gray-100"
                            onClick={() => { setPreviewArtifact({ ...a, url: a.url || a.preview_url || (a.content ? undefined : undefined) }); setShowArtifactModal(true); }}
                            title={'Preview artifact'}
                          >
                            {a.name}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Click an artifact to preview or download.</p>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">History & Artifacts</h3>
                    <p className="text-sm text-gray-700">No history yet. Hire this agent to generate work history and artifacts.</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Agent Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Type</span>
                      <span className="font-semibold capitalize">{selectedAgent.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category</span>
                      <span className="font-semibold capitalize">{selectedAgent.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(selectedAgent.status)}`}>
                        {selectedAgent.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Capabilities</span>
                      <span className="font-semibold">{selectedAgent.capabilities.length}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Start/Pause intentionally omitted in modal */}
                  <button 
                    onClick={() => handleConfigureAgent(selectedAgent)}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configure</span>
                  </button>
                  <button 
                    onClick={() => handleViewActivity(selectedAgent)}
                    className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    <span>View Activity</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // First-run multi-select for included agents
  const getTierLimit = (t) => {
    const key = (t || '').toLowerCase();
    if (key === 'starter') return 5;
    if (key === 'growth') return 10;
    if (key === 'professional') return 25;
    if (key === 'enterprise') return 999;
    return 3;
  };
  const planLimit = getTierLimit(subscriptionInfo?.tier || 'free');

  useEffect(() => {
    try {
      const key = `guild.workforce.initialized.${(subscriptionInfo?.tier || 'free').toLowerCase()}`;
      const already = localStorage.getItem(key) === '1';
      if (!already && includedAgentsSorted.length > 0 && planLimit >= 15) {
        // preselect up to limit
        const pre = new Set();
        includedAgentsSorted.slice(0, Math.min(planLimit, includedAgentsSorted.length)).forEach(a => pre.add(a.agent_id || a.id));
        setPickedIds(pre);
        setShowFirstRunPicker(true);
      }
    } catch {}
  }, [subscriptionInfo?.tier, includedAgentsSorted.length, planLimit]);

  const togglePick = (id) => {
    setPickedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); return next; }
      if (next.size >= planLimit) return next; // enforce cap
      next.add(id);
      return next;
    });
  };

  const confirmFirstRunPicks = () => {
    try {
      const key = `guild.workforce.initialized.${(subscriptionInfo?.tier || 'free').toLowerCase()}`;
      localStorage.setItem(key, '1');
    } catch {}
    setShowFirstRunPicker(false);
  };

  // Early return for loading state - must be after all hooks
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <div className="flex gap-2">
          <button onClick={()=>setActiveTab('theater')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='theater'?'bg-gray-900 text-white':'bg-gray-100 hover:bg-gray-200'}`}>Agent Theater</button>
          <button onClick={()=>setActiveTab('workforce')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='workforce'?'bg-gray-900 text-white':'bg-gray-100 hover:bg-gray-200'}`}>Agent Workforce</button>
          <button onClick={()=>setActiveTab('builder')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='builder'?'bg-gray-900 text-white':'bg-gray-100 hover:bg-gray-200'}`}>Workflow Builder</button>
          <button onClick={()=>setActiveTab('activity')} className={`px-3 py-2 text-sm rounded-md flex items-center space-x-2 ${activeTab==='activity'?'bg-gray-900 text-white':'bg-gray-100 hover:bg-gray-200'}`}>
            <Activity className="w-4 h-4" />
            <span>Agent Activity & Transparency</span>
          </button>
        </div>
      </div>
      {/* Header + Controls (Workforce tab only) */}
      {activeTab === 'workforce' && (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Workforce</h1>
            <p className="text-gray-600 mt-2">Manage and monitor your {Array.isArray(mergedApiAgents) ? mergedApiAgents.length : allAgents.length} AI agents</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{Array.isArray(mergedApiAgents) ? includedAgents.length : filteredAgents.filter(a => a.status === 'active').length}</div>
              <div className="text-sm text-gray-500">Active Agents</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-600">{Array.isArray(mergedApiAgents) ? mergedApiAgents.length : allAgents.length}</div>
              <div className="text-sm text-gray-500">Total Agents</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="executive">Executive</option>
              <option value="content">Content</option>
              <option value="research">Research</option>
              <option value="financial">Financial</option>
              <option value="creative">Creative</option>
              <option value="automation">Automation</option>
              <option value="evaluation">Evaluation</option>
              <option value="orchestration">Orchestration</option>
              <option value="marketing">Marketing</option>
              <option value="technical">Technical</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="strategy">Strategy</option>
              <option value="creation">Creation</option>
              <option value="analysis">Analysis</option>
              <option value="automation">Automation</option>
              <option value="management">Management</option>
              <option value="support">Support</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {Array.isArray(mergedApiAgents) ? `${mergedApiAgents.length} of ${mergedApiAgents.length} agents` : `${filteredAgents.length} of ${allAgents.length} agents`}
          </div>
        </div>
      </div>
      )}

      {/* Agent Grid - Workforce */}
      {activeTab === 'workforce' && (
        Array.isArray(mergedApiAgents) && (includedAgents.length + hireableAgents.length > 0) ? (
          <div className="space-y-8">
            {/* Included section */}
            <div>
               <h3 className="text-lg font-semibold text-gray-900 mb-3">Included in your subscription <span className="text-sm font-semibold text-black">({includedAgentsSorted.length})</span></h3>
              {includedAgentsSorted.length === 0 ? (
                <div className="text-sm text-gray-500">No included agents yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {includedAgentsSorted.map(a => (
                    <AgentCard
                      key={a.agent_id || a.id}
                      agent={{
                        id: a.agent_id || a.id,
                        name: a.name,
                        category: a.category || 'automation',
                        type: a.type || 'management',
                        status: (showFirstRunPicker ? (pickedIds.has(a.agent_id || a.id) ? 'active' : 'inactive') : 'active'),
                        capabilities: a.capabilities || ['Core capability'],
                        description: a.description || a.name
                      }}
                      entitled={true}
                      source="api"
                      rawAgent={a}
                      onSelect={setSelectedAgent}
                      onAssign={setShowAssignModal}
                      onChat={(agent) => { setChatAgent(agent); setShowChatModal(true); }}
                      onHire={(agent) => { setHireCandidate(agent); setShowHireModal(true); }}
                      triggerCelebration={triggerCelebration}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-gray-200" />

            {/* Hireable section */}
            <div>
               <h3 className="text-lg font-semibold text-gray-900 mb-3">Available to hire <span className="text-sm font-semibold text-black">({hireableAgentsSorted.length})</span></h3>
              {hireableAgentsSorted.length === 0 ? (
                <div className="text-sm text-gray-500">All agents are included or hired.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {hireableAgentsSorted.map(a => (
                    <AgentCard
                      key={a.agent_id || a.id}
                      agent={{
                        id: a.agent_id || a.id,
                        name: a.name,
                        category: a.category || 'automation',
                        type: a.type || 'management',
                        status: 'inactive',
                        capabilities: a.capabilities || ['Core capability'],
                        description: a.description || a.name
                      }}
                      entitled={false}
                      source="api"
                      rawAgent={a}
                      onSelect={setSelectedAgent}
                      onAssign={setShowAssignModal}
                      onChat={(agent) => { setChatAgent(agent); setShowChatModal(true); }}
                      onHire={(agent) => { setHireCandidate(agent); setShowHireModal(true); }}
                      triggerCelebration={triggerCelebration}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
        <div className="space-y-8">
          {Array.from(new Set(workforceList.map(a => a.category))).map(category => (
            <div key={category}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold capitalize text-gray-900">{category.replace('-', ' ')}</h2>
                <span className="text-sm font-semibold text-black">{workforceList.filter(a => a.category === category).length} agents</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {workforceList.filter(a => a.category === category).map(agent => (
                    <AgentCard 
                      key={agent.id} 
                      agent={agent} 
                      entitled={true}
                      source="local"
                      onSelect={setSelectedAgent}
                      onAssign={setShowAssignModal}
                      onChat={(agent) => { setChatAgent(agent); setShowChatModal(true); }}
                      onHire={(agent) => { setHireCandidate(agent); setShowHireModal(true); }}
                      triggerCelebration={triggerCelebration}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
          </div>
        )
      )}

      {/* First-run picker modal */}
      {activeTab === 'workforce' && showFirstRunPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4" onClick={() => setShowFirstRunPicker(false)}>
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Choose your initial active agents</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowFirstRunPicker(false)}>×</button>
            </div>
            <div className="px-4 py-3 text-sm text-gray-600">
              Select up to <span className="font-semibold">{planLimit}</span> included agents to activate now.
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: '60vh' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {includedAgentsSorted.map(a => {
                  const id = a.agent_id || a.id;
                  const checked = pickedIds.has(id);
                  const disabled = !checked && pickedIds.size >= planLimit;
                  return (
                    <label key={id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${checked ? 'bg-emerald-50 border-emerald-300' : 'bg-white hover:bg-gray-50'}`}>
                      <input type="checkbox" className="mt-1" checked={checked} disabled={disabled} onChange={() => togglePick(id)} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{a.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{a.category || 'automation'} • {a.type || 'management'}</div>
                      </div>
                      <div className="text-[10px] text-gray-500">Included</div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-700">Selected: <span className="font-semibold">{pickedIds.size}</span> / {planLimit}</div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 border rounded text-sm" onClick={() => setShowFirstRunPicker(false)}>Cancel</button>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded text-sm disabled:opacity-60" disabled={pickedIds.size === 0} onClick={confirmFirstRunPicks}>Activate selected</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Builder Tab */}
      {activeTab === 'builder' && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="text-xs text-gray-500 mb-2">Design multi-agent workflows with a visual canvas.</div>
          <div className="rounded-lg overflow-hidden border">
            <EnhancedWorkflowBuilder />
          </div>
        </div>
      )}

      {/* Agent Activity & Transparency Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Agent Activity & Transparency</h2>
            <p className="text-purple-100">
              Real-time monitoring of all autonomous agent operations with full transparency logging
            </p>
          </div>
          
          <AgentActivityFeed userId={userId} isCompact={false} maxEvents={100} />
        </div>
      )}

      {/* Agent Theater Tab (distinct visual) */}
      {activeTab === 'theater' && (
        <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-4">Live visualization of agents collaborating across stage zones.</div>
            <AgentActivityTheater selectedWorkflowName={selectedWorkflow?.name} selectedWorkflow={selectedWorkflow || null} />
          </div>

          <div className="">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-semibold text-gray-900">Autonomous Workflows</h2>
              {wfLoading && <span className="text-sm text-gray-500">Refreshing…</span>}
            </div>
            {wfError && <div className="text-sm text-red-600 mb-3 px-1">{wfError}</div>}
            {(() => {
              // Show exactly what the API returns (1..n). Only use demo when none.
              const baseList = (Array.isArray(workflows) && workflows.length > 0) ? workflows : demoWorkflows;
              const listToShow = baseList.map((wf, idx) => buildDisplayWorkflow(wf, idx));
              return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {listToShow.map(wf => (
                    <WorkflowCard
                      key={wf.workflow_id || wf.id}
                      workflow={wf}
                      isSelected={Boolean(selectedWorkflow && (selectedWorkflow.workflow_id || selectedWorkflow.id) === (wf.workflow_id || wf.id))}
                    />
                  ))}
                </AnimatePresence>
              </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Agent Detail Modal (Workforce tab only) */}
      {activeTab === 'workforce' && !showWorkflowDetails && <AgentDetailModal />}
      {/* Chat Modal */}
      {activeTab === 'workforce' && showChatModal && chatAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4" onClick={() => { setShowChatModal(false); setChatAgent(null); }}>
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <div className="text-sm text-gray-500">Chatting with</div>
                <div className="text-lg font-semibold text-gray-900">{chatAgent.name}</div>
              </div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => { setShowChatModal(false); setChatAgent(null); }}>×</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ConversationalInterface 
                messages={[]}
                onSendMessage={(m) => console.log('Send to agent', chatAgent.id, m)}
                activeAgentId={chatAgent.id}
              />
            </div>
            <QuickActions 
              actions={(getOverrideForAgent(chatAgent.name)?.capabilities || chatAgent.capabilities || []).slice(0, 6).map((cap, i) => ({ label: `Ask about: ${cap}` }))}
              onActionSelect={(a) => console.log('Suggested ask →', a.label)}
            />
          </div>
        </div>
      )}
      <WorkflowDetailsModal />

      {/* Configure Agent Modal (disabled while workflow details open) */}
      {!showWorkflowDetails && showConfigureModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Configure {selectedAgent.name}</h2>
                <button
                  onClick={() => setShowConfigureModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Instructions
                  </label>
                  <textarea
                    value={agentConfiguration.customInstructions}
                    onChange={(e) => setAgentConfiguration(prev => ({ ...prev, customInstructions: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Add specific instructions for this agent..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      value={agentConfiguration.duration}
                      onChange={(e) => setAgentConfiguration(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="indefinite">Run until manually stopped</option>
                      <option value="1hour">1 Hour</option>
                      <option value="4hours">4 Hours</option>
                      <option value="8hours">8 Hours</option>
                      <option value="24hours">24 Hours</option>
                      <option value="1week">1 Week</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={agentConfiguration.priority}
                      onChange={(e) => setAgentConfiguration(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={agentConfiguration.notifications}
                    onChange={(e) => setAgentConfiguration(prev => ({ ...prev, notifications: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
                    Enable notifications for this agent's activities
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowConfigureModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveConfiguration}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hire Agent Modal (disabled while workflow details open) */}
      {!showWorkflowDetails && showHireModal && hireCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Hire {hireCandidate.name}</h2>
                <button onClick={() => setShowHireModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              <div className="space-y-4">
                <div className="text-sm text-gray-700">Choose a term:</div>
                <div className="grid grid-cols-2 gap-3">
                  {(() => { const rates = getTierRates(tier); return (
                  <>
                    <button
                      className={`p-3 border rounded ${hireTerm==='day'?'border-emerald-600 bg-emerald-50':'border-gray-300'}`}
                      onClick={() => setHireTerm('day')}
                    >
                      <div className="text-sm font-semibold">Per Day</div>
                      <div className="text-xs text-gray-600">${rates.daily}/day</div>
                    </button>
                    <button
                      className={`p-3 border rounded ${hireTerm==='month'?'border-emerald-600 bg-emerald-50':'border-gray-300'}`}
                      onClick={() => setHireTerm('month')}
                    >
                      <div className="text-sm font-semibold">30 Days</div>
                      <div className="text-xs text-gray-600">${rates.monthly}/30d</div>
                    </button>
                  </>
                  ); })()}
                </div>
                <div className="text-xs text-gray-500">You can use this agent in workflows, tasks, and @mentions while hired.</div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowHireModal(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                <button
                  onClick={async () => {
                    try {
                      if (!API) { alert('API not configured'); return; }
                      const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt');
                      const res = await fetch(`${API}/agents/hire`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({ agent_id: hireCandidate.agent_id || hireCandidate.id, term: hireTerm })
                      });
                      if (!res.ok) { alert('Failed to start checkout'); return; }
                      const data = await res.json();
                      if (data && data.checkout_url) {
                        window.location.href = data.checkout_url;
                      } else {
                        alert('Checkout URL missing');
                      }
                    } catch (e) {
                      alert('Error starting checkout');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Continue to payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal (disabled while workflow details open) */}
      {!showWorkflowDetails && assignAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Assign Task to {assignAgent.name}</h2>
                <button onClick={() => setShowAssignModal(null)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                  <input className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Generate Q4 campaign brief" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                  <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={4} placeholder="Provide clear instructions for the agent..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Normal</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due</label>
                    <input type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowAssignModal(null)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                <button onClick={() => { setShowAssignModal(null); alert('Task assigned'); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Assign Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Activity Modal (disabled while workflow details open) */}
      {!showWorkflowDetails && showActivityModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedAgent.name} Activity Log</h2>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Agent-specific activity data */}
                {getAgentActivityData(selectedAgent).map(activity => (
                  <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{activity.action}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{activity.details}</p>
                    
                    {/* Additional Activity Details */}
                    {activity.websites && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Websites analyzed:</p>
                        <div className="flex flex-wrap gap-1">
                          {activity.websites.map((site, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {site}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {activity.platforms && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Platforms:</p>
                        <div className="flex flex-wrap gap-1">
                          {activity.platforms.map((platform, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(activity.leadsQualified || activity.demosScheduled || activity.recordsUpdated) && (
                      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                        {activity.leadsQualified && (
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="font-medium text-blue-800">Leads Qualified:</span>
                            <span className="text-blue-600 ml-1">{activity.leadsQualified}</span>
                          </div>
                        )}
                        {activity.demosScheduled && (
                          <div className="bg-green-50 p-2 rounded">
                            <span className="font-medium text-green-800">Demos Scheduled:</span>
                            <span className="text-green-600 ml-1">{activity.demosScheduled}</span>
                          </div>
                        )}
                        {activity.recordsUpdated && (
                          <div className="bg-purple-50 p-2 rounded">
                            <span className="font-medium text-purple-800">Records Updated:</span>
                            <span className="text-purple-600 ml-1">{activity.recordsUpdated}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activity.progress && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{activity.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${activity.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          console.log('Re-doing action:', activity.action);
                          alert(`Re-doing Action: This will re-execute the exact same action "${activity.action}" with the same parameters.`);
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        title="Re-execute this exact action with same parameters"
                      >
                        Re-do Action
                      </button>
                      <button 
                        onClick={() => {
                          console.log('Repeating action:', activity.action);
                          alert(`Repeat Action: This will execute a similar action "${activity.action}" but with updated parameters or context.`);
                        }}
                        className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                        title="Execute similar action with updated parameters"
                      >
                        Repeat Action
                      </button>
                      <button 
                        onClick={() => {
                          console.log('Blocking action:', activity.action);
                          alert(`Blocking Action: This will prevent the agent from executing similar actions in the future.`);
                        }}
                        className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                        title="Prevent similar actions in the future"
                      >
                        Block Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsView;
