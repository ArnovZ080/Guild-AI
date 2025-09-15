import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Users, BarChart3, Settings, Play, Pause, RotateCcw, 
  Search, Filter, Eye, MessageSquare, Phone, Mail, Calendar, Target,
  DollarSign, TrendingUp, FileText, Image, Video, Mic, Camera,
  Globe, Database, Shield, Lightbulb, Briefcase, Heart, Star,
  ChevronDown, ChevronUp, Activity, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAgentStatus } from '../hooks/useApiData.js';
import { useCelebrations, CelebrationType } from '../components/psychological/MicroCelebrations.jsx';

// Comprehensive 52 agents data
const allAgents = [
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

const AgentsView = () => {
  const { agents, loading } = useAgentStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, detailed
  const { triggerCelebration } = useCelebrations();

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

  // Get category styling
  const getCategoryStyle = (category) => {
    const styles = {
      executive: 'bg-purple-100 text-purple-800 border-purple-200',
      content: 'bg-blue-100 text-blue-800 border-blue-200',
      research: 'bg-green-100 text-green-800 border-green-200',
      financial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
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
      analysis: BarChart3,
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

  // Agent card component
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

        <div className="flex space-x-2 mt-4">
          <button 
            className="flex-1 px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
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
            className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Pause className="w-4 h-4 inline mr-1" />
            Pause
          </button>
          <button 
            className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <RotateCcw className="w-4 h-4" />
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
                  <button className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    <Play className="w-4 h-4" />
                    <span>Activate Agent</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Configure</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
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
      {/* Header */}
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

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </AnimatePresence>
      </div>

      {/* Agent Detail Modal */}
      <AgentDetailModal />
    </div>
  );
};

export default AgentsView;
