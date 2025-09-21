import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
import { 
  Plug, 
  Search, 
  Filter, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  Zap,
  Database,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  FileText,
  BarChart3,
  Users,
  ShoppingCart,
  CreditCard,
  Shield,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  StarOff
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations.fixed';

// Mock connector data
const mockConnectors = [
  // Social Media Platforms
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'social',
    status: 'connected',
    description: 'Professional networking and B2B lead generation',
    icon: Users,
    color: 'blue',
    lastSync: new Date(2024, 0, 12, 10, 30),
    syncFrequency: 'hourly',
    usage: {
      connections: 1247,
      messages: 89,
      posts: 12
    },
    setupTime: '5 minutes',
    features: ['Lead Generation', 'Content Publishing', 'Message Automation', 'Analytics'],
    pricing: 'Free tier available',
    popularity: 95,
    isFavorite: true
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    category: 'social',
    status: 'connected',
    description: 'Real-time social media engagement and monitoring',
    icon: MessageSquare,
    color: 'blue',
    lastSync: new Date(2024, 0, 12, 9, 15),
    syncFrequency: 'real-time',
    usage: {
      tweets: 234,
      followers: 1234,
      mentions: 45
    },
    setupTime: '3 minutes',
    features: ['Tweet Automation', 'Engagement Tracking', 'Trend Monitoring', 'Direct Messages'],
    pricing: 'Free tier available',
    popularity: 88,
    isFavorite: false
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    status: 'disconnected',
    description: 'Visual content and story automation',
    icon: MessageSquare,
    color: 'pink',
    lastSync: null,
    syncFrequency: 'daily',
    usage: null,
    setupTime: '7 minutes',
    features: ['Story Automation', 'Post Scheduling', 'Hashtag Optimization', 'Engagement Analytics'],
    pricing: 'Free tier available',
    popularity: 92,
    isFavorite: false
  },
  // Email Marketing
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'email',
    status: 'connected',
    description: 'Email marketing automation and campaigns',
    icon: Mail,
    color: 'yellow',
    lastSync: new Date(2024, 0, 12, 8, 45),
    syncFrequency: 'daily',
    usage: {
      subscribers: 5432,
      campaigns: 23,
      openRate: 24.5
    },
    setupTime: '10 minutes',
    features: ['Campaign Automation', 'Subscriber Management', 'A/B Testing', 'Analytics'],
    pricing: 'Free tier: 2,000 contacts',
    popularity: 85,
    isFavorite: true
  },
  {
    id: 'convertkit',
    name: 'ConvertKit',
    category: 'email',
    status: 'error',
    description: 'Creator-focused email marketing platform',
    icon: Mail,
    color: 'purple',
    lastSync: new Date(2024, 0, 10, 14, 20),
    syncFrequency: 'daily',
    usage: null,
    setupTime: '8 minutes',
    features: ['Visual Automation', 'Subscriber Tagging', 'Form Builder', 'Revenue Tracking'],
    pricing: 'Free tier: 1,000 subscribers',
    popularity: 78,
    isFavorite: false
  },
  // Analytics & Data
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    category: 'analytics',
    status: 'connected',
    description: 'Website traffic and user behavior analytics',
    icon: BarChart3,
    color: 'green',
    lastSync: new Date(2024, 0, 12, 11, 0),
    syncFrequency: 'real-time',
    usage: {
      pageViews: 45678,
      sessions: 12345,
      bounceRate: 42.3
    },
    setupTime: '5 minutes',
    features: ['Real-time Analytics', 'Custom Reports', 'Goal Tracking', 'Audience Insights'],
    pricing: 'Free tier available',
    popularity: 98,
    isFavorite: true
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    category: 'analytics',
    status: 'connected',
    description: 'Product analytics and user behavior tracking',
    icon: BarChart3,
    color: 'purple',
    lastSync: new Date(2024, 0, 12, 10, 15),
    syncFrequency: 'real-time',
    usage: {
      events: 98765,
      users: 4321,
      retention: 67.8
    },
    setupTime: '15 minutes',
    features: ['Event Tracking', 'Funnel Analysis', 'Cohort Analysis', 'A/B Testing'],
    pricing: 'Free tier: 20M events/month',
    popularity: 82,
    isFavorite: false
  },
  // Communication
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    status: 'connected',
    description: 'Team communication and workflow automation',
    icon: MessageSquare,
    color: 'purple',
    lastSync: new Date(2024, 0, 12, 12, 30),
    syncFrequency: 'real-time',
    usage: {
      channels: 12,
      messages: 456,
      members: 24
    },
    setupTime: '3 minutes',
    features: ['Message Automation', 'Channel Management', 'File Sharing', 'Bot Integration'],
    pricing: 'Free tier: 10K messages',
    popularity: 90,
    isFavorite: true
  },
  // CRM & Sales
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    status: 'disconnected',
    description: 'All-in-one CRM and marketing automation',
    icon: Users,
    color: 'orange',
    lastSync: null,
    syncFrequency: 'hourly',
    usage: null,
    setupTime: '20 minutes',
    features: ['Contact Management', 'Deal Tracking', 'Email Sequences', 'Reporting'],
    pricing: 'Free tier: 1M contacts',
    popularity: 87,
    isFavorite: false
  },
  // E-commerce
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'ecommerce',
    status: 'connected',
    description: 'E-commerce platform integration',
    icon: ShoppingCart,
    color: 'green',
    lastSync: new Date(2024, 0, 12, 9, 45),
    syncFrequency: 'hourly',
    usage: {
      orders: 234,
      revenue: 45678,
      products: 89
    },
    setupTime: '12 minutes',
    features: ['Order Management', 'Inventory Sync', 'Customer Data', 'Revenue Tracking'],
    pricing: 'Per transaction fees',
    popularity: 84,
    isFavorite: false
  }
];

const ConnectorManager = () => {
  const [connectors, setConnectors] = useState(mockConnectors);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const { triggerCelebration } = useCelebrations();

  // Categories
  const categories = [
    { id: 'all', name: 'All Categories', icon: Plug },
    { id: 'social', name: 'Social Media', icon: MessageSquare },
    { id: 'email', name: 'Email Marketing', icon: Mail },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'communication', name: 'Communication', icon: Phone },
    { id: 'crm', name: 'CRM & Sales', icon: Users },
    { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
    { id: 'productivity', name: 'Productivity', icon: FileText }
  ];

  // Handler functions
  const handleConnect = (connector) => {
    setSelectedConnector(connector);
    setShowSetupModal(true);
  };

  const handleDisconnect = (connectorId) => {
    setConnectors(prev => prev.map(connector => 
      connector.id === connectorId 
        ? { ...connector, status: 'disconnected', lastSync: null, usage: null }
        : connector
    ));
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: 'Connector disconnected successfully 🔌',
      intensity: 'normal'
    });
  };

  const handleToggleFavorite = (connectorId) => {
    setConnectors(prev => prev.map(connector => 
      connector.id === connectorId 
        ? { ...connector, isFavorite: !connector.isFavorite }
        : connector
    ));
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: 'Favorite status updated ⭐',
      intensity: 'normal'
    });
  };

  const handleSync = (connectorId) => {
    setConnectors(prev => prev.map(connector => 
      connector.id === connectorId 
        ? { ...connector, lastSync: new Date() }
        : connector
    ));
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: 'Sync completed successfully 🔄',
      intensity: 'normal'
    });
  };

  // Filter and sort connectors
  const filteredConnectors = connectors
    .filter(connector => {
      const matchesSearch = connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           connector.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || connector.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || connector.status === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastSync':
          if (!a.lastSync && !b.lastSync) return 0;
          if (!a.lastSync) return 1;
          if (!b.lastSync) return -1;
          return new Date(b.lastSync) - new Date(a.lastSync);
        case 'status':
          const statusOrder = { connected: 3, error: 2, disconnected: 1 };
          return statusOrder[b.status] - statusOrder[a.status];
        default:
          return 0;
      }
    });

  // Get status styling
  const getStatusStyle = (status) => {
    const styles = {
      connected: 'bg-green-100 text-green-800 border-green-200',
      disconnected: 'bg-gray-100 text-gray-800 border-gray-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      connected: CheckCircle,
      disconnected: XCircle,
      error: AlertCircle
    };
    return icons[status] || XCircle;
  };

  // Get category styling
  const getCategoryStyle = (category) => {
    const styles = {
      social: 'bg-blue-100 text-blue-800',
      email: 'bg-yellow-100 text-yellow-800',
      analytics: 'bg-green-100 text-green-800',
      communication: 'bg-purple-100 text-purple-800',
      crm: 'bg-orange-100 text-orange-800',
      ecommerce: 'bg-green-100 text-green-800',
      productivity: 'bg-gray-100 text-gray-800'
    };
    return styles[category] || 'bg-gray-100 text-gray-800';
  };

  // Connector card component
  const ConnectorCard = ({ connector }) => {
    const StatusIcon = getStatusIcon(connector.status);
    const ConnectorIcon = connector.icon;
    
    return (
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg bg-${connector.color}-100`}>
              <ConnectorIcon className={`w-6 h-6 text-${connector.color}-600`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{connector.name}</h3>
              <p className="text-sm text-gray-600">{connector.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleToggleFavorite(connector.id)}
              className="text-gray-400 hover:text-yellow-500 transition-colors"
            >
              {connector.isFavorite ? (
                <Star className="w-5 h-5 fill-current text-yellow-500" />
              ) : (
                <StarOff className="w-5 h-5" />
              )}
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <StatusIcon className={`w-5 h-5 ${
              connector.status === 'connected' ? 'text-green-500' :
              connector.status === 'error' ? 'text-red-500' :
              'text-gray-500'
            }`} />
            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusStyle(connector.status)}`}>
              {connector.status}
            </span>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryStyle(connector.category)}`}>
            {connector.category}
          </span>
        </div>

        {connector.status === 'connected' && connector.usage && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Usage Stats</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(connector.usage).slice(0, 3).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="font-semibold text-gray-900">{value}</div>
                  <div className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>Setup: {connector.setupTime}</span>
          <span>Popularity: {connector.popularity}%</span>
        </div>

        <div className="flex items-center justify-between">
          {connector.status === 'connected' ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSync(connector.id)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sync</span>
              </button>
              <button
                onClick={() => handleDisconnect(connector.id)}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleConnect(connector)}
              className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Connect</span>
            </button>
          )}
        </div>

        {connector.lastSync && (
          <div className="mt-2 text-xs text-gray-500">
            Last sync: {connector.lastSync.toLocaleString()}
          </div>
        )}
      </motion.div>
    );
  };

  // Setup modal
  const SetupModal = () => {
    if (!selectedConnector) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-${selectedConnector.color}-100`}>
                  <selectedConnector.icon className={`w-8 h-8 text-${selectedConnector.color}-600`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Connect {selectedConnector.name}</h2>
                  <p className="text-gray-600">{selectedConnector.description}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedConnector.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Pricing</h3>
                <p className="text-gray-700">{selectedConnector.pricing}</p>
              </div>

              {/* Setup Time */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Setup Time</h3>
                <p className="text-gray-700">Estimated setup time: {selectedConnector.setupTime}</p>
              </div>

              {/* OAuth Connection */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Authorization</h3>
                <p className="text-gray-700 mb-4">
                  Click the button below to authorize Guild-AI to access your {selectedConnector.name} account.
                </p>
                <button
                  onClick={() => {
                    // Mock OAuth flow
                    console.log(`Connecting to ${selectedConnector.name}...`);
                    setConnectors(prev => prev.map(connector => 
                      connector.id === selectedConnector.id 
                        ? { 
                            ...connector, 
                            status: 'connected', 
                            lastSync: new Date(),
                            usage: {
                              connections: Math.floor(Math.random() * 1000),
                              messages: Math.floor(Math.random() * 100),
                              posts: Math.floor(Math.random() * 50)
                            }
                          }
                        : connector
                    ));
                    setShowSetupModal(false);
                    triggerCelebration(CelebrationType.TASK_COMPLETE, {
                      message: `${selectedConnector.name} connected successfully! 🎉`,
                      intensity: 'high'
                    });
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Zap className="w-5 h-5" />
                  <span>Connect with {selectedConnector.name}</span>
                </button>
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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Connectors</h1>
          <div className="text-sm text-gray-600">
            {filteredConnectors.filter(c => c.status === 'connected').length} of {filteredConnectors.length} connected
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
                placeholder="Search connectors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="connected">Connected</option>
              <option value="disconnected">Disconnected</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="popularity">Popularity</option>
              <option value="name">Name</option>
              <option value="lastSync">Last Sync</option>
              <option value="status">Status</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              {['grid', 'list'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Connectors Grid */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        <AnimatePresence>
          {filteredConnectors.map(connector => (
            <ConnectorCard key={connector.id} connector={connector} />
          ))}
        </AnimatePresence>
      </div>

      {/* Setup Modal */}
      <SetupModal />
    </div>
  );
};

export default ConnectorManager;
