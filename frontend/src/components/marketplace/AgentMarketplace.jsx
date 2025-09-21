import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
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
  Sparkles,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations.fixed';
import { allAgents, agentCategories, categoryMetadata, agentLookup, agentStats } from '../../data/all_agents';

const AgentMarketplace = ({ onNavigateToChat, onNavigateToDashboard }) => {
  const { currentMode, getModeColors } = useAdaptiveMode();
  const { triggerCelebration } = useCelebrations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [activeAgents, setActiveAgents] = useState(new Set(['orchestrator', 'marketing', 'content']));

  const adaptiveClasses = getModeColors(currentMode);

  // Agent data is now imported from the data file
  const categories = agentCategories || [];
  const agents = allAgents || [];

  // Add loading state and error handling
  const isLoading = !agents.length && !categories.length;
  const hasError = !agents || !categories;

  const filteredAgents = useMemo(() => {
    let filtered = agents;

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

  // Show loading or error state
  if (hasError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Agents
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load agent data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading agents...</p>
        </div>
      </div>
    );
  }

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
                    {(agent.capabilities || []).slice(0, 3).map((capability, idx) => (
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
