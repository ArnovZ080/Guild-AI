import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Zap, 
  Users, 
  DollarSign, 
  BarChart, 
  Brain, 
  Settings,
  Play,
  Pause,
  Info,
  Download,
  Heart,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations';

const AgentMarketplace = ({ onNavigateToChat, onNavigateToDashboard }) => {
  const { currentMode, getModeColors } = useAdaptiveMode();
  const { triggerCelebration } = useCelebrations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [activeAgents, setActiveAgents] = useState(new Set(['orchestrator', 'campaignmanager', 'contentcreator']));

  const adaptiveClasses = getModeColors(currentMode);

  // Complete agent catalog from AGENTS.md
  const allAgents = [
    // Executive Layer
    { id: 'chiefofstaff', name: 'Chief of Staff', category: 'executive', status: 'available', description: 'Strategic coordination and task prioritization', icon: '👑', price: 'premium', popularity: 95, capabilities: ['Strategic Planning', 'Task Prioritization', 'Executive Support'] },
    { id: 'strategy', name: 'Strategy Agent', category: 'executive', status: 'available', description: 'Long-term planning and market analysis', icon: '🎯', price: 'premium', popularity: 88, capabilities: ['Market Analysis', 'Strategic Planning', 'Competitive Intelligence'] },
    { id: 'businessstrategist', name: 'Business Strategist', category: 'executive', status: 'available', description: 'High-level strategic thinking and recommendations', icon: '🧠', price: 'premium', popularity: 92, capabilities: ['Business Strategy', 'Growth Planning', 'Strategic Recommendations'] },

    // Content Creation
    { id: 'briefgenerator', name: 'Brief Generator', category: 'content', status: 'available', description: 'Comprehensive project brief creation', icon: '📋', price: 'standard', popularity: 76, capabilities: ['Project Briefs', 'Requirements Gathering', 'Scope Definition'] },
    { id: 'adcopy', name: 'Ad Copy Agent', category: 'content', status: 'available', description: 'High-converting advertising copy', icon: '📢', price: 'standard', popularity: 89, capabilities: ['Ad Copy', 'Conversion Optimization', 'A/B Testing'] },
    { id: 'contentstrategist', name: 'Content Strategist', category: 'content', status: 'available', description: 'Holistic content strategy and calendar development', icon: '📅', price: 'premium', popularity: 84, capabilities: ['Content Strategy', 'Calendar Planning', 'Content Optimization'] },
    { id: 'socialmedia', name: 'Social Media Agent', category: 'content', status: 'available', description: 'Platform-specific social media content', icon: '📱', price: 'standard', popularity: 91, capabilities: ['Social Media', 'Platform Optimization', 'Engagement'] },
    { id: 'writer', name: 'Writer Agent', category: 'content', status: 'available', description: 'Long-form content and documentation', icon: '✍️', price: 'standard', popularity: 87, capabilities: ['Long-form Writing', 'Documentation', 'Content Creation'] },

    // Research & Data
    { id: 'research', name: 'Research Agent', category: 'research', status: 'available', description: 'Web research and information gathering', icon: '🔍', price: 'standard', popularity: 82, capabilities: ['Web Research', 'Data Gathering', 'Information Analysis'] },
    { id: 'advancedscraper', name: 'Advanced Scraper', category: 'research', status: 'available', description: 'Sophisticated web scraping with Scrapy', icon: '🕷️', price: 'premium', popularity: 78, capabilities: ['Web Scraping', 'Data Extraction', 'Automation'] },
    { id: 'leadpersonalization', name: 'Lead Personalization', category: 'research', status: 'available', description: 'Sales psychology-based outreach', icon: '🎯', price: 'premium', popularity: 85, capabilities: ['Lead Research', 'Personalization', 'Sales Psychology'] },
    { id: 'dataenrichment', name: 'Data Enrichment', category: 'research', status: 'available', description: 'Lead validation and enhancement', icon: '🔬', price: 'standard', popularity: 73, capabilities: ['Data Validation', 'Lead Enhancement', 'Data Quality'] },

    // Financial & Business
    { id: 'accounting', name: 'Accounting Agent', category: 'financial', status: 'available', description: 'Financial reporting and analysis', icon: '💰', price: 'premium', popularity: 88, capabilities: ['Financial Reports', 'Accounting', 'Financial Analysis'] },
    { id: 'analytics', name: 'Analytics Agent', category: 'financial', status: 'active', description: 'Performance tracking and business intelligence', icon: '📊', price: 'standard', popularity: 94, capabilities: ['Performance Tracking', 'Business Intelligence', 'Data Analysis'] },
    { id: 'bookkeeping', name: 'Bookkeeping Agent', category: 'financial', status: 'available', description: 'Transaction processing and reconciliation', icon: '📚', price: 'standard', popularity: 81, capabilities: ['Transaction Processing', 'Reconciliation', 'Financial Records'] },
    { id: 'investorrelations', name: 'Investor Relations', category: 'financial', status: 'available', description: 'Funding strategies and investor communications', icon: '🤝', price: 'premium', popularity: 69, capabilities: ['Investor Relations', 'Funding Strategies', 'Financial Communications'] },
    { id: 'pricing', name: 'Pricing Agent', category: 'financial', status: 'available', description: 'Pricing strategy and optimization', icon: '💵', price: 'premium', popularity: 77, capabilities: ['Pricing Strategy', 'Price Optimization', 'Market Pricing'] },

    // Creative & Media
    { id: 'imagegeneration', name: 'Image Generation', category: 'creative', status: 'available', description: 'AI-powered image creation', icon: '🎨', price: 'standard', popularity: 86, capabilities: ['Image Generation', 'Visual Content', 'AI Art'] },
    { id: 'voice', name: 'Voice Agent', category: 'creative', status: 'available', description: 'Text-to-speech and speech-to-text processing', icon: '🎤', price: 'standard', popularity: 74, capabilities: ['Voice Processing', 'TTS/STT', 'Audio Content'] },
    { id: 'videoeditor', name: 'Video Editor', category: 'creative', status: 'available', description: 'Video creation and editing', icon: '🎬', price: 'premium', popularity: 79, capabilities: ['Video Editing', 'Video Creation', 'Media Production'] },
    { id: 'documentprocessing', name: 'Document Processing', category: 'creative', status: 'available', description: 'Multi-format document handling', icon: '📄', price: 'standard', popularity: 71, capabilities: ['Document Processing', 'File Conversion', 'Document Analysis'] },

    // Automation
    { id: 'unifiedautomation', name: 'Unified Automation', category: 'automation', status: 'available', description: 'Visual and web automation', icon: '🤖', price: 'premium', popularity: 83, capabilities: ['UI Automation', 'Web Automation', 'Process Automation'] },
    { id: 'visualautomation', name: 'Visual Automation', category: 'automation', status: 'available', description: 'PyAutoGUI and computer vision integration', icon: '👁️', price: 'premium', popularity: 75, capabilities: ['Computer Vision', 'UI Interaction', 'Visual Recognition'] },
    { id: 'crmautomation', name: 'CRM Automation', category: 'automation', status: 'available', description: 'Customer relationship management automation', icon: '📞', price: 'standard', popularity: 87, capabilities: ['CRM Integration', 'Customer Automation', 'Sales Automation'] },

    // Evaluator League
    { id: 'judge', name: 'Judge Agent', category: 'evaluation', status: 'available', description: 'Quality rubrics and evaluation', icon: '⚖️', price: 'standard', popularity: 72, capabilities: ['Quality Assessment', 'Evaluation', 'Rubric Generation'] },
    { id: 'factchecker', name: 'Fact Checker', category: 'evaluation', status: 'available', description: 'Information accuracy validation', icon: '✅', price: 'standard', popularity: 68, capabilities: ['Fact Checking', 'Accuracy Validation', 'Information Verification'] },
    { id: 'brandchecker', name: 'Brand Checker', category: 'evaluation', status: 'available', description: 'Brand compliance and consistency', icon: '🎭', price: 'standard', popularity: 70, capabilities: ['Brand Compliance', 'Consistency Check', 'Brand Guidelines'] },
    { id: 'seoevaluator', name: 'SEO Evaluator', category: 'evaluation', status: 'available', description: 'Search engine optimization', icon: '🔍', price: 'standard', popularity: 80, capabilities: ['SEO Analysis', 'Search Optimization', 'Content Optimization'] },

    // Orchestration & Management
    { id: 'workflowmanager', name: 'Workflow Manager', category: 'orchestration', status: 'active', description: 'Multi-agent coordination', icon: '🔄', price: 'premium', popularity: 96, capabilities: ['Workflow Coordination', 'Multi-agent Management', 'Process Orchestration'] },
    { id: 'preflightplanner', name: 'Pre-flight Planner', category: 'orchestration', status: 'available', description: 'Workflow planning and approval', icon: '✈️', price: 'premium', popularity: 67, capabilities: ['Workflow Planning', 'Pre-flight Checks', 'Approval Workflows'] },
    { id: 'contractcompiler', name: 'Contract Compiler', category: 'orchestration', status: 'available', description: 'Outcome contract processing', icon: '📜', price: 'premium', popularity: 64, capabilities: ['Contract Processing', 'Outcome Compilation', 'Legal Documentation'] },
    { id: 'qualitycontroller', name: 'Quality Controller', category: 'orchestration', status: 'available', description: 'Iterative improvement management', icon: '🎯', price: 'standard', popularity: 71, capabilities: ['Quality Control', 'Improvement Management', 'Iterative Refinement'] },

    // Business Operations
    { id: 'projectmanager', name: 'Project Manager', category: 'operations', status: 'available', description: 'Project planning and execution', icon: '📋', price: 'premium', popularity: 89, capabilities: ['Project Planning', 'Task Management', 'Project Execution'] },
    { id: 'hr', name: 'HR Agent', category: 'operations', status: 'available', description: 'Human resources management', icon: '👥', price: 'premium', popularity: 65, capabilities: ['HR Management', 'Employee Relations', 'Workforce Planning'] },
    { id: 'training', name: 'Training Agent', category: 'operations', status: 'available', description: 'Training material and SOP creation', icon: '🎓', price: 'standard', popularity: 58, capabilities: ['Training Materials', 'SOP Creation', 'Knowledge Transfer'] },
    { id: 'crm', name: 'CRM Agent', category: 'operations', status: 'active', description: 'Customer relationship management', icon: '🤝', price: 'standard', popularity: 92, capabilities: ['Customer Management', 'Relationship Building', 'Customer Analytics'] },
    { id: 'outboundsales', name: 'Outbound Sales', category: 'operations', status: 'available', description: 'Sales outreach and lead generation', icon: '📞', price: 'standard', popularity: 85, capabilities: ['Sales Outreach', 'Lead Generation', 'Sales Automation'] },

    // Human & Psychological
    { id: 'wellness', name: 'Wellness Agent', category: 'psychological', status: 'available', description: 'Employee wellness and mental health support', icon: '💚', price: 'premium', popularity: 63, capabilities: ['Wellness Support', 'Mental Health', 'Work-life Balance'] },
    { id: 'learning', name: 'Learning Agent', category: 'psychological', status: 'available', description: 'Continuous learning and skill development', icon: '🧠', price: 'standard', popularity: 59, capabilities: ['Skill Development', 'Learning Paths', 'Continuous Improvement'] },
    { id: 'communityconnector', name: 'Community Connector', category: 'psychological', status: 'available', description: 'Building and nurturing communities', icon: '🌐', price: 'standard', popularity: 61, capabilities: ['Community Building', 'Network Development', 'Relationship Nurturing'] },
    { id: 'celebrationnarrator', name: 'Celebration Narrator', category: 'psychological', status: 'active', description: 'Recognizing achievements and milestones', icon: '🎉', price: 'standard', popularity: 66, capabilities: ['Achievement Recognition', 'Milestone Tracking', 'Motivation'] },

    // Meta-Agents
    { id: 'agentevaluator', name: 'Agent Evaluator', category: 'meta', status: 'available', description: 'Performance monitoring and optimization', icon: '📊', price: 'premium', popularity: 55, capabilities: ['Performance Monitoring', 'Agent Optimization', 'System Health'] },
    { id: 'knowledgeupdater', name: 'Knowledge Updater', category: 'meta', status: 'available', description: 'Continuous learning and knowledge management', icon: '📚', price: 'premium', popularity: 52, capabilities: ['Knowledge Management', 'Learning Integration', 'Information Updates'] },
    { id: 'security', name: 'Security Agent', category: 'meta', status: 'available', description: 'System security and threat monitoring', icon: '🔒', price: 'premium', popularity: 57, capabilities: ['Security Monitoring', 'Threat Detection', 'System Protection'] },
    { id: 'scalability', name: 'Scalability Agent', category: 'meta', status: 'available', description: 'System performance and scaling optimization', icon: '📈', price: 'premium', popularity: 49, capabilities: ['Performance Optimization', 'Scaling Management', 'Resource Optimization'] },
    { id: 'orchestrationtuner', name: 'Orchestration Tuner', category: 'meta', status: 'available', description: 'Workflow optimization and efficiency', icon: '⚙️', price: 'premium', popularity: 48, capabilities: ['Workflow Optimization', 'Efficiency Tuning', 'Process Improvement'] },

    // Enhanced Campaign & Marketing
    { id: 'enhancedcampaign', name: 'Enhanced Campaign', category: 'marketing', status: 'available', description: 'Advanced campaign management with direct API access', icon: '🚀', price: 'premium', popularity: 90, capabilities: ['Campaign Management', 'API Integration', 'Advanced Marketing'] },
    { id: 'pricingintelligence', name: 'Pricing Intelligence', category: 'marketing', status: 'available', description: 'Dynamic pricing strategy and optimization', icon: '💡', price: 'premium', popularity: 76, capabilities: ['Pricing Strategy', 'Dynamic Pricing', 'Market Intelligence'] }
  ];

  const categories = [
    { id: 'all', name: 'All Agents', count: allAgents.length },
    { id: 'executive', name: 'Executive Layer', count: allAgents.filter(a => a.category === 'executive').length },
    { id: 'content', name: 'Content Creation', count: allAgents.filter(a => a.category === 'content').length },
    { id: 'research', name: 'Research & Data', count: allAgents.filter(a => a.category === 'research').length },
    { id: 'financial', name: 'Financial & Business', count: allAgents.filter(a => a.category === 'financial').length },
    { id: 'creative', name: 'Creative & Media', count: allAgents.filter(a => a.category === 'creative').length },
    { id: 'automation', name: 'Automation', count: allAgents.filter(a => a.category === 'automation').length },
    { id: 'evaluation', name: 'Evaluator League', count: allAgents.filter(a => a.category === 'evaluation').length },
    { id: 'orchestration', name: 'Orchestration', count: allAgents.filter(a => a.category === 'orchestration').length },
    { id: 'operations', name: 'Business Operations', count: allAgents.filter(a => a.category === 'operations').length },
    { id: 'psychological', name: 'Human & Psychological', count: allAgents.filter(a => a.category === 'psychological').length },
    { id: 'meta', name: 'Meta-Agents', count: allAgents.filter(a => a.category === 'meta').length },
    { id: 'marketing', name: 'Enhanced Marketing', count: allAgents.filter(a => a.category === 'marketing').length }
  ];

  const filteredAgents = useMemo(() => {
    let filtered = allAgents;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(agent => agent.category === selectedCategory);
    }

    // Sort agents
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price':
        const priceOrder = { 'standard': 1, 'premium': 2 };
        filtered.sort((a, b) => priceOrder[a.price] - priceOrder[b.price]);
        break;
      case 'status':
        const statusOrder = { 'active': 0, 'available': 1 };
        filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, allAgents]);

  const handleAgentToggle = (agentId) => {
    setActiveAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: "Agent deactivated",
          intensity: 'subtle'
        });
      } else {
        newSet.add(agentId);
        triggerCelebration(CelebrationType.COLLABORATION, {
          message: "Agent activated! 🚀",
          intensity: 'normal'
        });
      }
      return newSet;
    });
  };

  const getPriceColor = (price) => {
    switch (price) {
      case 'standard': return 'text-green-600 bg-green-50';
      case 'premium': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'available': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`min-h-screen ${adaptiveClasses.background} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-4xl font-bold ${adaptiveClasses.text} mb-2`}>
                Agent Marketplace
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Discover and activate your AI workforce. {allAgents.length} specialized agents ready to grow your business.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onNavigateToChat}
                className={`px-6 py-3 bg-gradient-to-r ${adaptiveClasses.primary} text-white rounded-xl hover:opacity-90 transition-all duration-200 flex items-center space-x-2`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Open Chat</span>
              </button>
              <button
                onClick={onNavigateToDashboard}
                className={`px-6 py-3 ${adaptiveClasses.secondary} ${adaptiveClasses.text} rounded-xl hover:opacity-80 transition-all duration-200 flex items-center space-x-2 border ${adaptiveClasses.border}`}
              >
                <BarChart className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`${adaptiveClasses.secondary} p-4 rounded-xl border ${adaptiveClasses.border}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${adaptiveClasses.primary} rounded-lg flex items-center justify-center`}>
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{allAgents.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Agents</p>
                </div>
              </div>
            </div>
            <div className={`${adaptiveClasses.secondary} p-4 rounded-xl border ${adaptiveClasses.border}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeAgents.size}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Agents</p>
                </div>
              </div>
            </div>
            <div className={`${adaptiveClasses.secondary} p-4 rounded-xl border ${adaptiveClasses.border}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {allAgents.filter(a => a.popularity > 85).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Popular Agents</p>
                </div>
              </div>
            </div>
            <div className={`${adaptiveClasses.secondary} p-4 rounded-xl border ${adaptiveClasses.border}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(allAgents.reduce((acc, agent) => acc + agent.popularity, 0) / allAgents.length)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search agents by name, description, or capabilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border ${adaptiveClasses.border} p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => handleAgentToggle(agent.id)}
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{agent.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                        {agent.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceColor(agent.price)}`}>
                          {agent.price}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAgentToggle(agent.id);
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      activeAgents.has(agent.id)
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                    }`}
                  >
                    {activeAgents.has(agent.id) ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {agent.description}
                </p>

                {/* Capabilities */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Capabilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((capability, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md"
                      >
                        {capability}
                      </span>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                        +{agent.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Popularity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {agent.popularity}%
                    </span>
                  </div>
                  
                  {agent.status === 'active' && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Active</span>
                    </div>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show agent details
                      }}
                      className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <Info className="w-3 h-3 inline mr-1" />
                      Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to favorites
                        triggerCelebration(CelebrationType.MILESTONE, {
                          message: "Added to favorites! ⭐",
                          intensity: 'subtle'
                        });
                      }}
                      className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Heart className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No agents found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters to find the perfect agent for your needs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMarketplace;
