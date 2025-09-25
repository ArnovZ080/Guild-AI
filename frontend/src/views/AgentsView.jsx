import React, { useState, useEffect } from 'react';
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
import apiService from '../services/api.js';

// Helper to build display names from ids
const toTitle = (id) => id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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
  const API = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';
  const [apiAgents, setApiAgents] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireCandidate, setHireCandidate] = useState(null);
  const [hireTerm, setHireTerm] = useState('day');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, detailed
  const [activeTab, setActiveTab] = useState('theater'); // theater | workforce | builder
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
  const buildDisplayWorkflow = (wf, index) => {
    const demo = demoWorkflows[index % demoWorkflows.length];
    const id = wf.workflow_id || wf.id || demo.id;
    const name = wf.name || wf.results?.campaign?.name || demo.name;
    const description = wf.description || demo.description;
    const status = wf.status || demo.status;
    const type = wf.type || demo.type || 'autonomous';
    const progress = typeof wf.progress === 'number' ? wf.progress : (typeof wf.results?.progress === 'number' ? wf.results.progress : demo.progress);
    const current_step = wf.current_step || wf.currentStep || wf.results?.current_step || demo.current_step;
    const agents = (wf.agents || wf.agents_involved || wf.results?.agents) || demo.agents;
    const integrations = wf.integrations || wf.results?.integrations || demo.integrations;
    const metrics = wf.metrics || wf.results?.metrics || demo.metrics;
    const triggers = wf.triggers || wf.results?.triggers || demo.triggers;
    const actions = wf.actions || wf.results?.actions || demo.actions;
    const businessGoal = wf.businessGoal || wf.results?.businessGoal || demo.businessGoal;
    return { id, name, description, status, type, progress, current_step, agents, integrations, metrics, triggers, actions, businessGoal };
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

  const WorkflowCard = ({ workflow }) => (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6 border hover:shadow-xl transition-shadow cursor-pointer"
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
                  <span className="text-[10px] text-gray-400 ml-2">Workflow Details v2</span>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {Array.isArray(outputs) && outputs.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Outputs</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                      {outputs.map((o, i)=> (
                        <li key={i}>{typeof o === 'string' ? o : (o.title || o.name || JSON.stringify(o))}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(comms) && comms.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Communications</h3>
                    <div className="space-y-3">
                      {comms.map((c, i)=> (
                        <div key={i} className="border rounded p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800">{c.channel || 'Message'}</span>
                            <span className="text-xs text-gray-500">{c.timestamp || ''}</span>
                          </div>
                          <div className="text-gray-700 whitespace-pre-wrap">{c.summary || c.content || ''}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(wf.actions) && wf.actions.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Execution Timeline</h3>
                    <div className="space-y-2">
                      {wf.actions.map((a, i)=> (
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
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Agents Involved</h3>
                  <div className="flex flex-wrap gap-1">
                    {(wf.agents || []).map((a,i)=>(
                      <span key={`${a}-${i}`} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{a}</span>
                    ))}
                  </div>
                </div>

                {(wf.metrics || cost) && (
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Metrics & Cost</h3>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      {wf.metrics?.customersProcessed !== undefined && (
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-lg font-bold">{wf.metrics.customersProcessed}</div>
                          <div className="text-xs text-gray-500">Processed</div>
                        </div>
                      )}
                      {wf.metrics?.successRate !== undefined && (
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-lg font-bold">{wf.metrics.successRate}%</div>
                          <div className="text-xs text-gray-500">Success Rate</div>
                        </div>
                      )}
                      {cost !== undefined && (
                        <div className="p-2 bg-gray-50 rounded col-span-2">
                          <div className="text-sm font-semibold">Estimated Cost</div>
                          <div className="text-xs text-gray-600">{typeof cost === 'string' ? cost : `$${Number(cost).toFixed(2)}`}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(evaluator?.score || evaluator?.rubric) && (
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Evaluator Results</h3>
                    {evaluator?.score !== undefined && (
                      <div className="text-sm mb-2">Score: <span className="font-semibold">{evaluator.score}</span></div>
                    )}
                    {evaluator?.rubric && (
                      <div className="text-xs text-gray-700 whitespace-pre-wrap">{evaluator.rubric}</div>
                    )}
                  </div>
                )}

                {upcoming.length > 0 && (
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Up Next</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {upcoming.map((a,i)=> (<li key={i}>{a.step}</li>))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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

  // Filter agents based on search and filters
  const filteredAgents = allAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || agent.category === filterCategory;
    const matchesType = filterType === 'all' || agent.type === filterType;
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });
  const workforceList = (filteredAgents.length ? filteredAgents : allAgents);
  const includedAgents = Array.isArray(apiAgents)
    ? apiAgents.filter(a => a.included_in_subscription || (a.hired_until && new Date(a.hired_until) > new Date()))
    : [];
  const hireableAgents = Array.isArray(apiAgents)
    ? apiAgents.filter(a => !(a.included_in_subscription || (a.hired_until && new Date(a.hired_until) > new Date())))
    : [];

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

  // Agent card component (Workforce)
  const AgentCard = ({ agent }) => {
    const TypeIcon = getTypeIcon(agent.type);
    
    return (
      <motion.div
        className={`bg-white rounded-lg p-6 shadow-lg border-l-4 ${getCategoryStyle(agent.category)} cursor-pointer hover:shadow-xl transition-shadow`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setSelectedAgent(agent)}
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

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{agent.description}</p>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Capabilities:</h4>
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.slice(0, 3).map(capability => (
              <span key={capability} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {capability}
              </span>
            ))}
            {agent.capabilities.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{agent.capabilities.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button 
            className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              triggerCelebration(CelebrationType.TASK_COMPLETE, {
                message: `${agent.name} activated! 🤖`,
                intensity: 'normal'
              });
            }}
          >
            <Play className="w-4 h-4 inline mr-1" />
            Start
          </button>
          <button 
            className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Pause className="w-4 h-4 inline mr-1" />
            Pause
          </button>
          <div className="grid grid-cols-3 gap-2 col-span-2">
            <button 
              className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); }}
              title="Details"
            >
              Details
            </button>
            <button 
              className="px-3 py-2 bg-indigo-100 text-indigo-800 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors"
              onClick={(e) => { e.stopPropagation(); setShowAssignModal(agent); }}
              title="Assign Task"
            >
              Assign
            </button>
            <button 
              className="px-3 py-2 bg-purple-100 text-purple-800 rounded-md text-sm font-medium hover:bg-purple-200 transition-colors"
              onClick={(e) => { e.stopPropagation(); window?.toast?.info?.('Chat coming soon') || alert('Chat coming soon'); }}
              title="Chat"
            >
              Chat
            </button>
          </div>
        </div>
      </motion.div>
    );
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
                  <p className="text-gray-700">{selectedAgent.description}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Capabilities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedAgent.capabilities.map(capability => (
                      <div key={capability} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
                  <button 
                    onClick={() => handleActivateAgent(selectedAgent)}
                    className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Activate Agent</span>
                  </button>
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

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <div className="flex gap-2">
          <button onClick={()=>setActiveTab('theater')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='theater'?'bg-gray-900 text-white':'bg-gray-100 hover:bg-gray-200'}`}>Agent Theater</button>
          <button onClick={()=>setActiveTab('workforce')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='workforce'?'bg-gray-900 text-white':'bg-gray-100 hover:bg-gray-200'}`}>Agent Workforce</button>
          <button onClick={()=>setActiveTab('builder')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='builder'?'bg-gray-900 text-white':'bg-gray-100 hover:bg-gray-200'}`}>Workflow Builder</button>
        </div>
      </div>
      {/* Header + Controls (Workforce tab only) */}
      {activeTab === 'workforce' && (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Workforce</h1>
            <p className="text-gray-600 mt-2">Manage and monitor your 52 AI agents</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{filteredAgents.filter(a => a.status === 'active').length}</div>
              <div className="text-sm text-gray-500">Active Agents</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-600">{allAgents.length}</div>
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
            {filteredAgents.length} of {allAgents.length} agents
          </div>
        </div>
      </div>
      )}

      {/* Agent Grid - Workforce */}
      {activeTab === 'workforce' && (
        Array.isArray(apiAgents) && (includedAgents.length + hireableAgents.length > 0) ? (
          <div className="space-y-8">
            {/* Included section */}
            <div>
               <h3 className="text-lg font-semibold text-gray-900 mb-3">Included in your subscription <span className="text-sm font-semibold text-black">({includedAgents.length})</span></h3>
              {includedAgents.length === 0 ? (
                <div className="text-sm text-gray-500">No included agents yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {includedAgents.map(a => (
                    <AgentCard key={a.agent_id || a.id} agent={{
                      id: a.agent_id || a.id,
                      name: a.name,
                      category: a.category || 'automation',
                      type: a.type || 'management',
                      status: a.status || 'active',
                      capabilities: a.capabilities || ['Core capability'],
                      description: a.description || a.name
                    }} />
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-gray-200" />

            {/* Hireable section */}
            <div>
               <h3 className="text-lg font-semibold text-gray-900 mb-3">Available to hire <span className="text-sm font-semibold text-black">({hireableAgents.length})</span></h3>
              {hireableAgents.length === 0 ? (
                <div className="text-sm text-gray-500">All agents are included or hired.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {hireableAgents.map(a => (
                    <div key={a.agent_id || a.id} className="relative">
                      <AgentCard agent={{
                        id: a.agent_id || a.id,
                        name: a.name,
                        category: a.category || 'automation',
                        type: a.type || 'management',
                        status: a.status || 'inactive',
                        capabilities: a.capabilities || ['Core capability'],
                        description: a.description || a.name
                      }} />
                      <div className="absolute top-3 right-3">
                        <button
                          className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          onClick={(e) => { e.stopPropagation(); setHireCandidate(a); setHireTerm('day'); setShowHireModal(true); }}
                        >
                          Hire me
                        </button>
                      </div>
                    </div>
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
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )
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

      {/* Agent Theater Tab (distinct visual) */}
      {activeTab === 'theater' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-4">Live visualization of agents collaborating across stage zones.</div>
            <AgentActivityTheater selectedWorkflowName={selectedWorkflow?.name} selectedWorkflow={selectedWorkflow || null} />
          </div>

          <div className="">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-semibold text-gray-900">Autonomous Workflows (v2)</h2>
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
                    <WorkflowCard key={wf.workflow_id || wf.id} workflow={wf} />
                  ))}
                </AnimatePresence>
              </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Agent Detail Modal disabled per requirements */}
      {/* <AgentDetailModal /> */}
      <WorkflowDetailsModal />

      {/* Configure Agent Modal */}
      {showConfigureModal && selectedAgent && (
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

      {/* Hire Agent Modal */}
      {showHireModal && hireCandidate && (
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
                  <button
                    className={`p-3 border rounded ${hireTerm==='day'?'border-emerald-600 bg-emerald-50':'border-gray-300'}`}
                    onClick={() => setHireTerm('day')}
                  >
                    <div className="text-sm font-semibold">Per Day</div>
                    <div className="text-xs text-gray-600">${hireCandidate.daily_rate_usd ?? 29}/day</div>
                  </button>
                  <button
                    className={`p-3 border rounded ${hireTerm==='month'?'border-emerald-600 bg-emerald-50':'border-gray-300'}`}
                    onClick={() => setHireTerm('month')}
                  >
                    <div className="text-sm font-semibold">30 Days</div>
                    <div className="text-xs text-gray-600">${hireCandidate.monthly_rate_usd ?? 199}/30d</div>
                  </button>
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

      {/* Assign Task Modal */}
      {assignAgent && (
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

      {/* View Activity Modal */}
      {showActivityModal && selectedAgent && (
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
