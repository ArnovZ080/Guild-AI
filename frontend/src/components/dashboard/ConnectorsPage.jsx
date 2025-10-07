import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, CheckCircle, AlertCircle, ExternalLink,
  Video, Play, Square, Save, MousePointer, Globe, X, Plus,
  Database, Settings, Activity, Zap, Info, TrendingUp,
  Clock, Shield, ArrowRight
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../psychological/MicroCelebrations.jsx';
import ConnectModal from '../connectors/ConnectModal.jsx';
import { 
  connectorConfigurations, 
  connectorCategories,
  getConnectorsByCategory,
  getCategoryInfo 
} from '../connectors/connectorConfigurations.js';

/**
 * ConnectorsPage Component
 * 
 * Purpose: Central hub for managing all integrations and connectors in Guild-AI
 * 
 * Features:
 * - Browse available connectors by category
 * - View connected services with status
 * - Create custom connections via screen recording (Tango-style)
 * - Detailed setup instructions for each integration
 * - Full transparency about data access and usage
 * 
 * Tabs:
 * 1. Available Connectors - All possible integrations organized by category
 * 2. Connected Services - Currently active connections with management
 * 3. Create Your Own - Screen recording for unsupported services
 */
const ConnectorsPage = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('available'); // available | connected | create
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Screen Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSteps, setRecordingSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [connectionName, setConnectionName] = useState('');
  const [connectionDescription, setConnectionDescription] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const { triggerCelebration } = useCelebrations();

  // Mock connected services (in production, this would come from API)
  const [connectedServices, setConnectedServices] = useState([
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payments',
      connected_at: '2024-01-15T10:30:00Z',
      status: 'active',
      last_sync: '2024-01-15T14:22:00Z',
      sync_frequency: '5 minutes',
      data_synced: 1247,
      health: 'excellent'
    },
    {
      id: 'notion',
      name: 'Notion',
      category: 'productivity',
      connected_at: '2024-01-10T09:15:00Z',
      status: 'active',
      last_sync: '2024-01-15T13:45:00Z',
      sync_frequency: '10 minutes',
      data_synced: 892,
      health: 'good'
    },
    {
      id: 'slack',
      name: 'Slack',
      connected_at: '2024-01-12T14:20:00Z',
      status: 'active',
      last_sync: '2024-01-15T14:20:00Z',
      sync_frequency: 'Real-time',
      data_synced: 3421,
      health: 'excellent'
    }
  ]);

  // Get all available connectors
  const availableConnectors = Object.values(connectorConfigurations);

  // Filter connectors based on search and category
  const filteredConnectors = availableConnectors.filter(connector => {
    const matchesSearch = connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connector.category.includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || connector.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group connectors by category for organized display
  const groupedConnectors = connectorCategories.reduce((acc, category) => {
    if (category.id === 'all') return acc;
    
    const categoryConnectors = filteredConnectors.filter(
      connector => connector.category === category.id
    );
    
    if (categoryConnectors.length > 0) {
      acc[category.id] = {
        ...category,
        connectors: categoryConnectors
      };
    }
    
    return acc;
  }, {});

  // Handle connector selection
  const handleConnectClick = (connector) => {
    setSelectedConnector(connector);
    setShowConnectModal(true);
  };

  // Handle connection
  const handleConnect = async (connectionData) => {
    setIsConnecting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Add to connected services
      const newService = {
        id: selectedConnector.id,
        name: selectedConnector.name,
        category: selectedConnector.category,
        connected_at: new Date().toISOString(),
        status: 'active',
        last_sync: new Date().toISOString(),
        sync_frequency: '5 minutes',
        data_synced: 0,
        health: 'excellent'
      };
      
      setConnectedServices(prev => [...prev, newService]);
      setIsConnecting(false);
      setShowConnectModal(false);
      setSelectedConnector(null);
      
      triggerCelebration(CelebrationType.TASK_COMPLETE, {
        message: `Connected to ${selectedConnector.name}! 🎉`,
        intensity: 'high'
      });
    }, 2000);
  };

  // Handle disconnect
  const handleDisconnect = (serviceId) => {
    setConnectedServices(prev => prev.filter(s => s.id !== serviceId));
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Disconnected successfully! 🔌`,
      intensity: 'normal'
    });
  };

  // Screen Recording Functions
  const startScreenRecording = async () => {
    try {
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
      status: 'active',
      category: 'custom',
      connected_at: new Date().toISOString(),
      last_sync: new Date().toISOString(),
      sync_frequency: 'On-demand',
      data_synced: 0,
      health: 'excellent'
    };
    
    setConnectedServices(prev => [...prev, customConnection]);
    setShowSaveModal(false);
    setConnectionName('');
    setConnectionDescription('');
    setRecordingSteps([]);
    setCurrentStep(0);
    
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: "Custom connection created! 🎬",
      intensity: 'high'
    });
  };

  // Get health status styling
  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations & Connectors</h1>
          <p className="text-gray-600 max-w-3xl">
            Connect Guild-AI to your favorite tools and services. Each integration provides your agents with the data and capabilities they need to work autonomously.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Available</p>
                <p className="text-2xl font-bold text-gray-900">{availableConnectors.length}</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-green-600">{connectedServices.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Data Points Synced</p>
                <p className="text-2xl font-bold text-purple-600">
                  {connectedServices.reduce((sum, s) => sum + (s.data_synced || 0), 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-orange-600">{connectorCategories.length - 1}</p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow-lg w-fit">
          {[
            { id: 'available', name: 'Available Connectors', count: availableConnectors.length, icon: Database },
            { id: 'connected', name: 'Connected Services', count: connectedServices.length, icon: CheckCircle },
            { id: 'create', name: 'Create Your Own', count: 0, icon: Video }
          ].map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Available Connectors Tab */}
          {activeTab === 'available' && (
            <motion.div
              key="available"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search and Filter */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search connectors by name, category, or capability..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm min-w-[200px]"
                    >
                      {connectorCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Pills */}
                {selectedCategory !== 'all' && (
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Active Filter:</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-1">
                      <span>{getCategoryInfo(selectedCategory)?.name}</span>
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                )}
              </div>

              {/* Connectors by Category */}
              {Object.values(groupedConnectors).map((categoryGroup) => {
                const CategoryIcon = categoryGroup.icon;
                return (
                  <div key={categoryGroup.id} className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center space-x-3 px-2">
                      <CategoryIcon className="w-6 h-6 text-gray-600" />
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{categoryGroup.name}</h2>
                        <p className="text-sm text-gray-600">{categoryGroup.description}</p>
                      </div>
                    </div>

                    {/* Connector Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryGroup.connectors.map(connector => {
                        const ConnectorIcon = connector.icon;
                        const isConnected = connectedServices.some(s => s.id === connector.id);
                        
                        return (
                          <motion.div
                            key={connector.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`bg-white rounded-lg shadow-lg p-6 border-2 transition-all ${
                              isConnected ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className={`p-3 rounded-lg ${connector.color}`}>
                                <ConnectorIcon className="w-6 h-6 text-white" />
                              </div>
                              {isConnected && (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">Connected</span>
                                </div>
                              )}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{connector.name}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{connector.description}</p>

                            {/* Capabilities Preview */}
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-1">
                                {connector.capabilities?.slice(0, 3).map(capability => (
                                  <span key={capability} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                    {capability}
                                  </span>
                                ))}
                                {connector.capabilities && connector.capabilities.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                    +{connector.capabilities.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Setup Info */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                              <span>⏱️ {connector.estimated_setup_time}</span>
                              <span className="capitalize">📊 {connector.setup_complexity}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleConnectClick(connector)}
                                disabled={isConnected}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isConnected
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                              >
                                {isConnected ? 'Already Connected' : 'Connect'}
                              </button>
                              <a
                                href={connector.documentation_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                                title="View Documentation"
                              >
                                <ExternalLink className="w-4 h-4 text-gray-600" />
                              </a>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* No Results */}
              {filteredConnectors.length === 0 && (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No connectors found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filter</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Connected Services Tab */}
          {activeTab === 'connected' && (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {connectedServices.map(service => {
                const config = connectorConfigurations[service.id];
                const ServiceIcon = config?.icon || Database;
                const serviceColor = config?.color || 'bg-gray-500';
                
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-3 rounded-lg ${serviceColor}`}>
                          <ServiceIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getHealthColor(service.health)}`}>
                              {service.health}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {service.category?.replace('_', ' ').toUpperCase()} • Connected {new Date(service.connected_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDisconnect(service.id)}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors font-medium"
                      >
                        Disconnect
                      </button>
                    </div>

                    {/* Service Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Activity className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-gray-900">{service.data_synced.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Data Points</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                        <div className="text-sm font-bold text-gray-900">{service.sync_frequency}</div>
                        <div className="text-xs text-gray-600">Sync Frequency</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <div className="text-sm font-bold text-gray-900">{new Date(service.last_sync).toLocaleTimeString()}</div>
                        <div className="text-xs text-gray-600">Last Sync</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {connectedServices.length === 0 && (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Connected Services</h3>
                  <p className="text-gray-600 mb-4">Connect your first integration to get started</p>
                  <button
                    onClick={() => setActiveTab('available')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Browse Available Connectors</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Create Your Own Tab */}
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg shadow-lg p-8">
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
                      {[
                        { icon: Video, color: 'blue', title: '1. Record Your Actions', desc: 'Click "Start Recording" and perform your usual workflow' },
                        { icon: MousePointer, color: 'green', title: '2. AI Learns Patterns', desc: 'Our visual agent analyzes clicks, forms, and navigation' },
                        { icon: Zap, color: 'purple', title: '3. Automate Repetition', desc: 'The connection reproduces your workflow automatically' }
                      ].map((step, index) => {
                        const StepIcon = step.icon;
                        return (
                          <div key={index} className="flex items-start space-x-3">
                            <div className={`p-2 bg-${step.color}-100 rounded-lg flex-shrink-0`}>
                              <StepIcon className={`w-4 h-4 text-${step.color}-600`} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{step.title}</h4>
                              <p className="text-sm text-gray-600">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
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
                            Step {currentStep} - Recording your interactions...
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
                        <h4 className="font-medium text-gray-900">Recorded Steps: {recordingSteps.length}</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {recordingSteps.map((step, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm bg-gray-50 p-2 rounded">
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
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
                      onClick={() => setShowSaveModal(true)}
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
          <ConnectModal
            connector={selectedConnector}
            onClose={() => {
              setShowConnectModal(false);
              setSelectedConnector(null);
            }}
            onConnect={handleConnect}
            isConnecting={isConnecting}
          />
        )}

        {/* Save Custom Connection Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Save Custom Connection</h2>
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
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

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowSaveModal(false)}
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
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectorsPage;

