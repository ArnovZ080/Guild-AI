import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Search, Filter, CheckCircle, AlertCircle, 
  ExternalLink, Key, Shield, Zap, Database, Globe,
  DollarSign, Users, Calendar, FileText, Camera,
  BarChart, Wrench, Plus, X, Eye, EyeOff, Video,
  Play, Pause, Square, Monitor, MousePointer, Save
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../psychological/MicroCelebrations.jsx';

const ConnectorManager = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState({});
  const [showScreenRecording, setShowScreenRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSteps, setRecordingSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [connectionName, setConnectionName] = useState('');
  const [connectionDescription, setConnectionDescription] = useState('');
  const { triggerCelebration } = useCelebrations();

  // Mock data for available connectors
  const availableConnectors = [
    {
      id: 'asana',
      name: 'Asana',
      category: 'project_management',
      status: 'active',
      capabilities: ['tasks', 'projects', 'teams', 'users'],
      description: 'Coordinate tasks, projects, and goals',
      icon: Calendar,
      color: 'bg-purple-500',
      documentation_url: 'https://developers.asana.com/docs'
    },
    {
      id: 'linear',
      name: 'Linear',
      category: 'project_management',
      status: 'active',
      capabilities: ['issues', 'projects', 'teams', 'users'],
      description: 'Manage issues, projects & team workflows',
      icon: Calendar,
      color: 'bg-blue-500',
      documentation_url: 'https://developers.linear.app/docs'
    },
    {
      id: 'monday',
      name: 'Monday.com',
      category: 'project_management',
      status: 'active',
      capabilities: ['boards', 'items', 'columns', 'users'],
      description: 'Manage projects, boards, and workflows',
      icon: Calendar,
      color: 'bg-red-500',
      documentation_url: 'https://developer.monday.com/api-reference'
    },
    {
      id: 'notion',
      name: 'Notion',
      category: 'productivity',
      status: 'active',
      capabilities: ['pages', 'databases', 'blocks', 'users'],
      description: 'Search, update, and power workflows across tools',
      icon: FileText,
      color: 'bg-gray-800',
      documentation_url: 'https://developers.notion.com/docs'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payments',
      status: 'active',
      capabilities: ['payments', 'customers', 'subscriptions', 'invoices'],
      description: 'Payment processing and financial infrastructure',
      icon: DollarSign,
      color: 'bg-indigo-600',
      documentation_url: 'https://stripe.com/docs/api'
    },
    {
      id: 'square',
      name: 'Square',
      category: 'payments',
      status: 'active',
      capabilities: ['payments', 'orders', 'customers', 'inventory'],
      description: 'Search and manage transaction, merchant, and payment data',
      icon: DollarSign,
      color: 'bg-green-600',
      documentation_url: 'https://developer.squareup.com/docs'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      category: 'payments',
      status: 'active',
      capabilities: ['payments', 'orders', 'subscriptions'],
      description: 'Access PayPal payments platform',
      icon: DollarSign,
      color: 'bg-blue-600',
      documentation_url: 'https://developer.paypal.com/docs/api'
    },
    {
      id: 'intercom',
      name: 'Intercom',
      category: 'support',
      status: 'active',
      capabilities: ['conversations', 'contacts', 'companies', 'tags'],
      description: 'Access to Intercom data for better customer insights',
      icon: Users,
      color: 'bg-orange-500',
      documentation_url: 'https://developers.intercom.com/docs'
    },
    {
      id: 'fireflies',
      name: 'Fireflies',
      category: 'communication',
      status: 'active',
      capabilities: ['transcripts', 'meetings', 'insights'],
      description: 'Analyze and generate insights from meeting transcripts',
      icon: Users,
      color: 'bg-red-600',
      documentation_url: 'https://docs.fireflies.ai/api'
    },
    {
      id: 'canva',
      name: 'Canva',
      category: 'design',
      status: 'active',
      capabilities: ['designs', 'templates', 'brands'],
      description: 'Search, create, autofill, and export Canva designs',
      icon: Camera,
      color: 'bg-blue-500',
      documentation_url: 'https://www.canva.com/developers/'
    },
    {
      id: 'cloudinary',
      name: 'Cloudinary',
      category: 'media',
      status: 'active',
      capabilities: ['images', 'videos', 'transformations'],
      description: 'Manage, transform and deliver your images & videos',
      icon: Camera,
      color: 'bg-purple-600',
      documentation_url: 'https://cloudinary.com/documentation'
    },
    {
      id: 'vercel',
      name: 'Vercel',
      category: 'development',
      status: 'active',
      capabilities: ['deployments', 'projects', 'domains'],
      description: 'Analyze, debug, and manage projects and deployments',
      icon: Globe,
      color: 'bg-black',
      documentation_url: 'https://vercel.com/docs/api'
    },
    {
      id: 'netlify',
      name: 'Netlify',
      category: 'development',
      status: 'active',
      capabilities: ['sites', 'deploys', 'forms'],
      description: 'Create, deploy, manage, and secure websites',
      icon: Globe,
      color: 'bg-green-500',
      documentation_url: 'https://docs.netlify.com/api'
    },
    {
      id: 'sentry',
      name: 'Sentry',
      category: 'development',
      status: 'active',
      capabilities: ['issues', 'projects', 'teams'],
      description: 'Search, query, and debug errors intelligently',
      icon: AlertCircle,
      color: 'bg-red-500',
      documentation_url: 'https://docs.sentry.io/api'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      category: 'automation',
      status: 'active',
      capabilities: ['webhooks', 'triggers', 'actions'],
      description: 'Automate workflows across thousands of apps via conversation',
      icon: Zap,
      color: 'bg-orange-500',
      documentation_url: 'https://zapier.com/developer'
    },
    {
      id: 'workato',
      name: 'Workato',
      category: 'automation',
      status: 'active',
      capabilities: ['recipes', 'connections', 'jobs'],
      description: 'Automate workflows and connect your business apps',
      icon: Wrench,
      color: 'bg-blue-600',
      documentation_url: 'https://docs.workato.com/developing-connectors'
    },
    {
      id: 'n8n',
      name: 'N8N',
      category: 'automation',
      status: 'active',
      capabilities: ['workflows', 'nodes', 'webhooks', 'blueprints'],
      description: 'Powerful workflow automation with visual node-based editor',
      icon: Zap,
      color: 'bg-orange-500',
      documentation_url: 'https://docs.n8n.io/integrations/',
      blueprints: [
        'Lead Generation Workflow',
        'Customer Onboarding Automation',
        'Social Media Content Scheduler',
        'Email Marketing Campaign',
        'Data Sync Between Apps',
        'Invoice Processing Automation'
      ]
    }
  ];

  // Mock data for connected services
  const connectedServices = [
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payments',
      connected_at: '2024-01-15T10:30:00Z',
      status: 'active',
      last_sync: '2024-01-15T14:22:00Z',
      capabilities: ['payments', 'customers', 'subscriptions'],
      icon: DollarSign,
      color: 'bg-indigo-600'
    },
    {
      id: 'notion',
      name: 'Notion',
      category: 'productivity',
      connected_at: '2024-01-10T09:15:00Z',
      status: 'active',
      last_sync: '2024-01-15T13:45:00Z',
      capabilities: ['pages', 'databases', 'blocks'],
      icon: FileText,
      color: 'bg-gray-800'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Connectors', icon: Settings },
    { id: 'project_management', name: 'Project Management', icon: Calendar },
    { id: 'payments', name: 'Payments', icon: DollarSign },
    { id: 'productivity', name: 'Productivity', icon: FileText },
    { id: 'support', name: 'Support', icon: Users },
    { id: 'communication', name: 'Communication', icon: Users },
    { id: 'design', name: 'Design', icon: Camera },
    { id: 'media', name: 'Media', icon: Camera },
    { id: 'development', name: 'Development', icon: Globe },
    { id: 'automation', name: 'Automation', icon: Zap }
  ];

  const filteredConnectors = availableConnectors.filter(connector => {
    const matchesSearch = connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || connector.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConnect = (connector) => {
    setSelectedConnector(connector);
    setShowConnectModal(true);
  };

  const handleDisconnect = (serviceId) => {
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Disconnected from ${serviceId}! 🔌`,
      intensity: 'normal'
    });
  };

  // Screen recording functionality
  const startScreenRecording = async () => {
    try {
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: false
      });
      
      setIsRecording(true);
      setRecordingSteps([]);
      setCurrentStep(0);
      
      // Simulate recording steps (in real implementation, this would capture actual screen interactions)
      const mockSteps = [
        { type: 'click', element: 'Login Button', coordinates: { x: 100, y: 200 }, timestamp: Date.now() },
        { type: 'type', element: 'Username Field', text: 'user@example.com', timestamp: Date.now() + 1000 },
        { type: 'type', element: 'Password Field', text: '••••••••', timestamp: Date.now() + 2000 },
        { type: 'click', element: 'Submit Button', coordinates: { x: 150, y: 250 }, timestamp: Date.now() + 3000 },
        { type: 'navigate', element: 'Dashboard', url: '/dashboard', timestamp: Date.now() + 4000 }
      ];
      
      // Simulate step-by-step recording
      mockSteps.forEach((step, index) => {
        setTimeout(() => {
          setRecordingSteps(prev => [...prev, step]);
          setCurrentStep(index + 1);
        }, index * 1000);
      });
      
      // Stop recording after all steps
      setTimeout(() => {
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      }, mockSteps.length * 1000 + 1000);
      
    } catch (error) {
      console.error('Error starting screen recording:', error);
      setIsRecording(false);
    }
  };

  const stopScreenRecording = () => {
    setIsRecording(false);
    setCurrentStep(0);
  };

  const saveCustomConnection = () => {
    if (!connectionName.trim() || recordingSteps.length === 0) return;
    
    const customConnection = {
      id: `custom_${Date.now()}`,
      name: connectionName,
      description: connectionDescription,
      type: 'custom',
      steps: recordingSteps,
      created_at: new Date(),
      status: 'active'
    };
    
    // In real implementation, this would save to backend
    console.log('Saving custom connection:', customConnection);
    
    setShowScreenRecording(false);
    setConnectionName('');
    setConnectionDescription('');
    setRecordingSteps([]);
    setCurrentStep(0);
    
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: "Custom connection created! 🎬",
      intensity: 'normal'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'beta':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'planned':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : Settings;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connector Manager</h1>
        <p className="text-gray-600">
          Connect and manage integrations with external services and APIs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'available', name: 'Available Connectors', count: availableConnectors.length },
          { id: 'connected', name: 'Connected Services', count: connectedServices.length },
          { id: 'create', name: 'Create Your Own', count: 0 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search connectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'available' && (
          <motion.div
            key="available"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredConnectors.map(connector => {
              const Icon = connector.icon;
              return (
                <motion.div
                  key={connector.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${connector.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(connector.status)}
                      <span className="text-xs text-gray-500 capitalize">{connector.status}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{connector.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{connector.description}</p>

                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {React.createElement(getCategoryIcon(connector.category), { className: "w-4 h-4 text-gray-500" })}
                      <span className="text-sm text-gray-500 capitalize">
                        {connector.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {connector.capabilities.slice(0, 3).map(capability => (
                        <span key={capability} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {capability}
                        </span>
                      ))}
                      {connector.capabilities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{connector.capabilities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleConnect(connector)}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Connect
                    </button>
                    <a
                      href={connector.documentation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'connected' && (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {connectedServices.map(service => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${service.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {service.category.replace('_', ' ')} • Connected {new Date(service.connected_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          Last sync: {new Date(service.last_sync).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Active</span>
                      </div>
                      <button
                        onClick={() => handleDisconnect(service.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Create Your Own Connection */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="text-center mb-8">
                <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
                  <Video className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Own Connection</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Record your screen interactions to create custom connections for apps without APIs. 
                  Our visual agent will learn your workflow and reproduce it automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* How it works */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">How it works</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Monitor className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">1. Record Your Actions</h4>
                        <p className="text-sm text-gray-600">Click "Start Recording" and perform your usual workflow</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MousePointer className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">2. AI Learns Patterns</h4>
                        <p className="text-sm text-gray-600">Our visual agent analyzes clicks, forms, and navigation</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Zap className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">3. Automate Repetition</h4>
                        <p className="text-sm text-gray-600">The connection reproduces your workflow automatically</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recording controls */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Start Recording</h3>
                  
                  {!isRecording ? (
                    <div className="space-y-4">
                      <button
                        onClick={startScreenRecording}
                        className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Video className="w-5 h-5" />
                        <span>Start Screen Recording</span>
                      </button>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <h4 className="font-semibold text-yellow-800">Before Recording</h4>
                        </div>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Open the application you want to connect</li>
                          <li>• Have your login credentials ready</li>
                          <li>• Perform the exact workflow you want to automate</li>
                          <li>• Click "Stop Recording" when finished</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <h4 className="font-semibold text-red-800">Recording in Progress</h4>
                        </div>
                        <p className="text-sm text-red-700">
                          Step {currentStep} of {recordingSteps.length + 5} - Recording your interactions...
                        </p>
                      </div>
                      
                      <button
                        onClick={stopScreenRecording}
                        className="w-full flex items-center justify-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <Square className="w-5 h-5" />
                        <span>Stop Recording</span>
                      </button>
                    </div>
                  )}

                  {/* Recording steps preview */}
                  {recordingSteps.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Recorded Steps:</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {recordingSteps.map((step, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm bg-gray-50 p-2 rounded">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700">
                              {step.type === 'click' ? `Clicked ${step.element}` :
                               step.type === 'type' ? `Typed in ${step.element}` :
                               step.type === 'navigate' ? `Navigated to ${step.element}` :
                               step.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Create connection button */}
              {recordingSteps.length > 0 && !isRecording && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowScreenRecording(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    <span>Create Custom Connection</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connect Modal */}
      {showConnectModal && selectedConnector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${selectedConnector.color}`}>
                    <selectedConnector.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Connect {selectedConnector.name}</h2>
                    <p className="text-sm text-gray-600">Enter your API credentials</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key / Token
                  </label>
                  <div className="relative">
                    <input
                      type={showCredentials[selectedConnector.id] ? 'text' : 'password'}
                      placeholder="Enter your API key or token"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                    <button
                      onClick={() => setShowCredentials(prev => ({
                        ...prev,
                        [selectedConnector.id]: !prev[selectedConnector.id]
                      }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCredentials[selectedConnector.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Security Note</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    Your credentials are encrypted and stored securely. We only use them to connect to your {selectedConnector.name} account.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowConnectModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowConnectModal(false);
                      triggerCelebration(CelebrationType.TASK_COMPLETE, {
                        message: `Connected to ${selectedConnector.name}! 🔌`,
                        intensity: 'normal'
                      });
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen Recording Modal */}
      {showScreenRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Custom Connection</h2>
                    <p className="text-gray-600">Save your recorded workflow as a reusable connection</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScreenRecording(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Connection details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connection Name
                  </label>
                  <input
                    type="text"
                    value={connectionName}
                    onChange={(e) => setConnectionName(e.target.value)}
                    placeholder="e.g., Custom CRM Login Workflow"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={connectionDescription}
                    onChange={(e) => setConnectionDescription(e.target.value)}
                    placeholder="Describe what this connection does..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-20 resize-none"
                  />
                </div>

                {/* Recorded steps */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recorded Steps ({recordingSteps.length})</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {recordingSteps.map((step, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded border">
                          <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {step.type === 'click' && <MousePointer className="w-4 h-4 text-blue-500" />}
                              {step.type === 'type' && <FileText className="w-4 h-4 text-green-500" />}
                              {step.type === 'navigate' && <Globe className="w-4 h-4 text-purple-500" />}
                              <span className="font-medium text-gray-900">
                                {step.type === 'click' ? `Click ${step.element}` :
                                 step.type === 'type' ? `Type in ${step.element}` :
                                 step.type === 'navigate' ? `Navigate to ${step.element}` :
                                 step.type}
                              </span>
                            </div>
                            {step.coordinates && (
                              <p className="text-xs text-gray-500 mt-1">
                                Coordinates: ({step.coordinates.x}, {step.coordinates.y})
                              </p>
                            )}
                            {step.text && (
                              <p className="text-xs text-gray-500 mt-1">
                                Text: {step.text}
                              </p>
                            )}
                            {step.url && (
                              <p className="text-xs text-gray-500 mt-1">
                                URL: {step.url}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connection preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Connection Preview</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    This connection will automatically perform {recordingSteps.length} steps to complete your workflow. 
                    It can be triggered by agents or scheduled to run at specific times.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowScreenRecording(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCustomConnection}
                    disabled={!connectionName.trim()}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Connection</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectorManager;
