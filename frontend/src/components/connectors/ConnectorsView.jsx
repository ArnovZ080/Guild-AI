import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings,
  Zap,
  Search,
  Filter,
  Plus,
  Eye,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  X,
  AlertCircle,
  Clock,
  Globe,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  BarChart3,
  ShoppingCart,
  CreditCard,
  FileText,
  Video,
  Mic,
  Monitor,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Edit,
  Save
} from 'lucide-react';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations.fixed';

const ConnectorsView = ({ onNavigateToChat, onNavigateToDashboard }) => {
  const { currentMode, getModeColors } = useAdaptiveMode();
  const { triggerCelebration } = useCelebrations();
  const [connectors, setConnectors] = useState([]);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [connectorChat, setConnectorChat] = useState([]);
  const [connectorInput, setConnectorInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [recordingWorkflow, setRecordingWorkflow] = useState(null);

  const adaptiveClasses = getModeColors(currentMode);

  // Mock connectors data with 40+ platforms
  useEffect(() => {
    const mockConnectors = [
      // Social Media Platforms
      {
        id: 'linkedin',
        name: 'LinkedIn',
        category: 'social_media',
        status: 'connected',
        description: 'Professional networking and lead generation',
        icon: 'linkedin',
        color: 'bg-blue-600',
        lastSync: new Date(2024, 11, 22, 10, 30),
        usage: { calls: 1250, data: '2.5MB' },
        features: ['Lead Generation', 'Content Publishing', 'Analytics'],
        setupTime: '2 minutes',
        apiStatus: 'active',
        config: { connected: true, scope: ['read', 'write'] }
      },
      {
        id: 'twitter',
        name: 'Twitter/X',
        category: 'social_media',
        status: 'connected',
        description: 'Real-time social media engagement',
        icon: 'twitter',
        color: 'bg-black',
        lastSync: new Date(2024, 11, 22, 9, 15),
        usage: { calls: 890, data: '1.8MB' },
        features: ['Tweet Publishing', 'Engagement Tracking', 'Trend Monitoring'],
        setupTime: '2 minutes',
        apiStatus: 'active',
        config: { connected: true, scope: ['read', 'write'] }
      },
      {
        id: 'instagram',
        name: 'Instagram',
        category: 'social_media',
        status: 'available',
        description: 'Visual content and story management',
        icon: 'instagram',
        color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        lastSync: null,
        usage: { calls: 0, data: '0MB' },
        features: ['Post Management', 'Story Publishing', 'Analytics'],
        setupTime: '3 minutes',
        apiStatus: 'available',
        config: { connected: false }
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        category: 'social_media',
        status: 'error',
        description: 'Short-form video content platform',
        icon: 'tiktok',
        color: 'bg-black',
        lastSync: new Date(2024, 11, 20, 14, 45),
        usage: { calls: 0, data: '0MB' },
        features: ['Video Publishing', 'Trend Analysis', 'Engagement Metrics'],
        setupTime: '4 minutes',
        apiStatus: 'error',
        error: 'API key expired',
        config: { connected: false }
      },

      // Advertising Platforms
      {
        id: 'google_ads',
        name: 'Google Ads',
        category: 'advertising',
        status: 'connected',
        description: 'Search and display advertising management',
        icon: 'google',
        color: 'bg-blue-500',
        lastSync: new Date(2024, 11, 22, 11, 20),
        usage: { calls: 2100, data: '5.2MB' },
        features: ['Campaign Management', 'Performance Analytics', 'Budget Control'],
        setupTime: '5 minutes',
        apiStatus: 'active',
        config: { connected: true, scope: ['read', 'write'] }
      },
      {
        id: 'meta_ads',
        name: 'Meta Business Suite',
        category: 'advertising',
        status: 'connected',
        description: 'Facebook and Instagram advertising',
        icon: 'facebook',
        color: 'bg-blue-600',
        lastSync: new Date(2024, 11, 22, 10, 45),
        usage: { calls: 1800, data: '4.1MB' },
        features: ['Ad Campaigns', 'Audience Targeting', 'Performance Tracking'],
        setupTime: '4 minutes',
        apiStatus: 'active',
        config: { connected: true, scope: ['read', 'write'] }
      },

      // Email Marketing
      {
        id: 'mailchimp',
        name: 'Mailchimp',
        category: 'email_marketing',
        status: 'connected',
        description: 'Email marketing and automation',
        icon: 'mailchimp',
        color: 'bg-yellow-500',
        lastSync: new Date(2024, 11, 22, 12, 15),
        usage: { calls: 950, data: '3.2MB' },
        features: ['Campaign Management', 'Automation', 'Analytics'],
        setupTime: '3 minutes',
        apiStatus: 'active',
        config: { connected: true, scope: ['read', 'write'] }
      },
      {
        id: 'convertkit',
        name: 'ConvertKit',
        category: 'email_marketing',
        status: 'available',
        description: 'Creator-focused email marketing',
        icon: 'convertkit',
        color: 'bg-orange-500',
        lastSync: null,
        usage: { calls: 0, data: '0MB' },
        features: ['Subscriber Management', 'Automation', 'Forms'],
        setupTime: '3 minutes',
        apiStatus: 'available',
        config: { connected: false }
      },

      // Analytics Platforms
      {
        id: 'google_analytics',
        name: 'Google Analytics',
        category: 'analytics',
        status: 'connected',
        description: 'Website and app analytics',
        icon: 'google',
        color: 'bg-orange-500',
        lastSync: new Date(2024, 11, 22, 13, 30),
        usage: { calls: 3200, data: '8.5MB' },
        features: ['Traffic Analysis', 'Conversion Tracking', 'Custom Reports'],
        setupTime: '3 minutes',
        apiStatus: 'active',
        config: { connected: true, scope: ['read'] }
      },
      {
        id: 'mixpanel',
        name: 'Mixpanel',
        category: 'analytics',
        status: 'available',
        description: 'Product analytics and user behavior',
        icon: 'mixpanel',
        color: 'bg-purple-500',
        lastSync: null,
        usage: { calls: 0, data: '0MB' },
        features: ['Event Tracking', 'Funnel Analysis', 'Cohort Analysis'],
        setupTime: '4 minutes',
        apiStatus: 'available',
        config: { connected: false }
      },

      // Productivity Tools
      {
        id: 'notion',
        name: 'Notion',
        category: 'productivity',
        status: 'connected',
        description: 'All-in-one workspace',
        icon: 'notion',
        color: 'bg-gray-800',
        lastSync: new Date(2024, 11, 22, 14, 20),
        usage: { calls: 750, data: '2.1MB' },
        features: ['Document Management', 'Database Integration', 'Collaboration'],
        setupTime: '3 minutes',
        apiStatus: 'active',
        config: { connected: true, scope: ['read', 'write'] }
      },
      {
        id: 'google_drive',
        name: 'Google Drive',
        category: 'productivity',
        status: 'connected',
        description: 'Cloud storage and collaboration',
        icon: 'google',
        color: 'bg-green-500',
        lastSync: new Date(2024, 11, 22, 15, 10),
        usage: { calls: 1200, data: '4.8MB' },
        features: ['File Management', 'Document Sharing', 'Collaboration'],
        setupTime: '2 minutes',
        apiStatus: 'active',
        config: { connected: true, scope: ['read', 'write'] }
      },

      // Communication Platforms
      {
        id: 'slack',
        name: 'Slack',
        category: 'communication',
        status: 'connected',
        description: 'Team communication platform',
        icon: 'slack',
        color: 'bg-purple-600',
        lastSync: new Date(2024, 11, 22, 16, 45),
        usage: { calls: 1800, data: '3.9MB' },
        features: ['Message Automation', 'Channel Management', 'Bot Integration'],
        setupTime: '3 minutes',
        apiStatus: 'active',
        config: { connected: true, scope: ['read', 'write'] }
      },
      {
        id: 'discord',
        name: 'Discord',
        category: 'communication',
        status: 'available',
        description: 'Community and gaming communication',
        icon: 'discord',
        color: 'bg-indigo-600',
        lastSync: null,
        usage: { calls: 0, data: '0MB' },
        features: ['Server Management', 'Message Automation', 'Voice Integration'],
        setupTime: '4 minutes',
        apiStatus: 'available',
        config: { connected: false }
      },

      // E-commerce Platforms
      {
        id: 'shopify',
        name: 'Shopify',
        category: 'ecommerce',
        status: 'available',
        description: 'E-commerce platform integration',
        icon: 'shopify',
        color: 'bg-green-600',
        lastSync: null,
        usage: { calls: 0, data: '0MB' },
        features: ['Product Management', 'Order Processing', 'Analytics'],
        setupTime: '5 minutes',
        apiStatus: 'available',
        config: { connected: false }
      },
      {
        id: 'woocommerce',
        name: 'WooCommerce',
        category: 'ecommerce',
        status: 'available',
        description: 'WordPress e-commerce integration',
        icon: 'woocommerce',
        color: 'bg-purple-500',
        lastSync: null,
        usage: { calls: 0, data: '0MB' },
        features: ['Product Sync', 'Order Management', 'Customer Data'],
        setupTime: '6 minutes',
        apiStatus: 'available',
        config: { connected: false }
      },

      // Meeting Platforms
      {
        id: 'zoom',
        name: 'Zoom',
        category: 'meetings',
        status: 'connected',
        description: 'Video conferencing and meetings',
        icon: 'zoom',
        color: 'bg-blue-600',
        lastSync: new Date(2024, 11, 22, 17, 30),
        usage: { calls: 450, data: '1.2MB' },
        features: ['Meeting Scheduling', 'Recording Management', 'Analytics'],
        setupTime: '3 minutes',
        apiStatus: 'active',
        config: { connected: true, scope: ['read', 'write'] }
      },
      {
        id: 'calendly',
        name: 'Calendly',
        category: 'meetings',
        status: 'available',
        description: 'Scheduling and appointment booking',
        icon: 'calendly',
        color: 'bg-blue-500',
        lastSync: null,
        usage: { calls: 0, data: '0MB' },
        features: ['Scheduling Automation', 'Calendar Sync', 'Booking Management'],
        setupTime: '2 minutes',
        apiStatus: 'available',
        config: { connected: false }
      }
    ];
    setConnectors(mockConnectors);
  }, []);

  // Mock suggestions
  const [suggestions, setSuggestions] = useState([
    {
      id: '1',
      type: 'setup',
      title: 'Quick Setup',
      description: 'Connect popular platforms in under 5 minutes.',
      action: 'quick_setup',
      priority: 'high'
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Optimize Connections',
      description: 'Review and optimize your active integrations.',
      action: 'optimize_connections',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'workflow',
      title: 'Record Workflow',
      description: 'Record screen workflows for non-API connections.',
      action: 'record_workflow',
      priority: 'medium'
    }
  ]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setConnectorChat(prev => [...prev, userMessage]);
    setConnectorInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      if (message.toLowerCase().includes('connect') || message.toLowerCase().includes('setup')) {
        response = "I can help you connect to any of our 40+ supported platforms! The setup process is typically 2-5 minutes per integration. Which platform would you like to connect first?";
      } else if (message.toLowerCase().includes('error') || message.toLowerCase().includes('issue')) {
        response = "I can help troubleshoot connection issues. I see you have an error with TikTok - the API key has expired. Would you like me to guide you through reconnecting it?";
      } else if (message.toLowerCase().includes('workflow') || message.toLowerCase().includes('record')) {
        response = "I can help you record screen workflows for platforms that don't have API access. This allows our agents to automate tasks through visual automation. Which workflow would you like to record?";
      } else if (message.toLowerCase().includes('optimize') || message.toLowerCase().includes('performance')) {
        response = "I can analyze your integration performance and suggest optimizations. Your Google Analytics integration is making 3200 API calls - I can help optimize this for better performance.";
      } else {
        response = "I'm here to help with all your integration needs! I can assist with connecting platforms, troubleshooting issues, recording workflows, and optimizing performance. What would you like to work on?";
      }

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        agent: 'connectors_agent',
        actions: ['Connect Platform', 'Troubleshoot Issue', 'Record Workflow', 'Optimize Performance']
      };

      setConnectorChat(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      triggerCelebration(CelebrationType.COLLABORATION, {
        message: "Connectors Agent responded! ⚡",
        intensity: 'subtle'
      });
    }, 1500);
  };

  const handleSuggestion = (suggestion) => {
    switch (suggestion.action) {
      case 'quick_setup':
        setShowSetupWizard(true);
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: "Setup wizard launched! 🚀",
          intensity: 'normal'
        });
        break;
      case 'optimize_connections':
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: "Connection optimization started! ⚡",
          intensity: 'normal'
        });
        break;
      case 'record_workflow':
        setRecordingWorkflow({ active: true, platform: 'Generic' });
        triggerCelebration(CelebrationType.COLLABORATION, {
          message: "Workflow recording started! 📹",
          intensity: 'normal'
        });
        break;
    }
    
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const handleConnectorAction = (connector, action) => {
    switch (action) {
      case 'connect':
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: `Connecting to ${connector.name}... ⚡`,
          intensity: 'normal'
        });
        break;
      case 'disconnect':
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: `Disconnected from ${connector.name}`,
          intensity: 'subtle'
        });
        break;
      case 'reconnect':
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: `Reconnecting to ${connector.name}... 🔄`,
          intensity: 'normal'
        });
        break;
      case 'configure':
        setSelectedConnector(connector);
        triggerCelebration(CelebrationType.COLLABORATION, {
          message: `Configuring ${connector.name}... ⚙️`,
          intensity: 'normal'
        });
        break;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'social_media': return <MessageSquare className="w-5 h-5" />;
      case 'advertising': return <BarChart3 className="w-5 h-5" />;
      case 'email_marketing': return <Mail className="w-5 h-5" />;
      case 'analytics': return <BarChart3 className="w-5 h-5" />;
      case 'productivity': return <FileText className="w-5 h-5" />;
      case 'communication': return <Users className="w-5 h-5" />;
      case 'ecommerce': return <ShoppingCart className="w-5 h-5" />;
      case 'meetings': return <Calendar className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'social_media': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advertising': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'email_marketing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'analytics': return 'bg-green-100 text-green-800 border-green-200';
      case 'productivity': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'communication': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ecommerce': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'meetings': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'available': return <Plus className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'connecting': return <Clock className="w-4 h-4" />;
      default: return <X className="w-4 h-4" />;
    }
  };

  const filteredConnectors = (connectors || []).filter(connector => {
    if (filter === 'all') return true;
    if (filter === 'connected') return connector.status === 'connected';
    if (filter === 'available') return connector.status === 'available';
    if (filter === 'error') return connector.status === 'error';
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Connectors & Integrations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect to 40+ platforms and automate workflows with AI agents.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Connectors</option>
              <option value="connected">Connected</option>
              <option value="available">Available</option>
              <option value="error">Errors</option>
            </select>
            <button
              onClick={() => setShowSetupWizard(true)}
              className={`px-6 py-3 bg-gradient-to-r ${adaptiveClasses.primary} text-white rounded-xl hover:opacity-90 transition-all duration-200 flex items-center space-x-2`}
            >
              <Plus className="w-5 h-5" />
              <span>Quick Setup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Connectors Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnectors.map((connector, index) => (
              <motion.div
                key={connector.id}
                className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedConnector(connector)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${connector.color}`}>
                      {getCategoryIcon(connector.category)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {connector.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(connector.category)}`}>
                        {connector.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connector.status)}`}>
                    {getStatusIcon(connector.status)}
                    <span>{connector.status}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {connector.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {(connector.features || []).slice(0, 2).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                    {connector.features.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                        +{connector.features.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Usage Stats */}
                {connector.status === 'connected' && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {connector.usage.calls.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        API Calls
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {connector.usage.data}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Data Transfer
                      </div>
                    </div>
                  </div>
                )}

                {/* Last Sync */}
                {connector.lastSync && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>Last sync: {connector.lastSync.toLocaleString()}</span>
                  </div>
                )}

                {/* Error Message */}
                {connector.error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-800 dark:text-red-200">
                        {connector.error}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {connector.status === 'connected' ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectorAction(connector, 'configure');
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-1"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configure</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectorAction(connector, 'disconnect');
                        }}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : connector.status === 'error' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnectorAction(connector, 'reconnect');
                      }}
                      className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center justify-center space-x-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reconnect</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnectorAction(connector, 'connect');
                      }}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Connect ({connector.setupTime})</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Connectors Agent Sidebar */}
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Agent Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Connectors Agent</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Integration Assistant</p>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {connectorChat.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">What integration do you need help with?</p>
                </div>
              )}
              
              {(connectorChat || []).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? `bg-gradient-to-r ${adaptiveClasses.primary} text-white`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.actions && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(message.actions || []).map((action, idx) => (
                          <button
                            key={idx}
                            className="px-2 py-1 bg-white/20 text-xs rounded hover:bg-white/30 transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={connectorInput}
                onChange={(e) => setConnectorInput(e.target.value)}
                placeholder="Ask about integrations..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(connectorInput)}
              />
              <button
                onClick={() => handleSendMessage(connectorInput)}
                disabled={!connectorInput.trim()}
                className={`px-4 py-2 bg-gradient-to-r ${adaptiveClasses.primary} text-white rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Send
              </button>
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Suggestions</h4>
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showSuggestions ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {(suggestions || []).map((suggestion) => (
                        <motion.div
                          key={suggestion.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleSuggestion(suggestion)}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              {suggestion.title}
                            </h5>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                              suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {suggestion.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {suggestion.description}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectorsView;
