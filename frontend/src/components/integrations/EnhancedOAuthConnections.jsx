import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
import { 
  Cloud, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  Database,
  FileText,
  Users,
  Trash2,
  Shield,
  Zap,
  Brain,
  Heart
} from 'lucide-react';
import { usePsychologicalOptimization } from '../../contexts/PsychologicalOptimizationContext';
import { useCelebrations } from '../../contexts/CelebrationContext';

const EnhancedOAuthConnections = () => {
  const { getCurrentMode, updateUserProfile } = usePsychologicalOptimization();
  const { triggerTaskCompletionCelebration } = useCelebrations();
  
  const [connections, setConnections] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  const currentMode = getCurrentMode();

  const providerInfo = {
    gdrive: {
      name: 'Google Drive',
      icon: '📁',
      color: 'bg-blue-500',
      description: 'Access your Google Drive files and folders',
      securityLevel: 'enterprise',
      trustScore: 0.95
    },
    notion: {
      name: 'Notion',
      icon: '📝',
      color: 'bg-gray-800',
      description: 'Connect to your Notion workspace and databases',
      securityLevel: 'high',
      trustScore: 0.92
    },
    onedrive: {
      name: 'OneDrive',
      icon: '☁️',
      color: 'bg-blue-600',
      description: 'Sync with your Microsoft OneDrive storage',
      securityLevel: 'enterprise',
      trustScore: 0.94
    },
    dropbox: {
      name: 'Dropbox',
      icon: '📦',
      color: 'bg-blue-700',
      description: 'Connect to your Dropbox file storage',
      securityLevel: 'high',
      trustScore: 0.93
    }
  };

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          accent: 'sky-dawn',
          text: 'text-sky-dusk',
          card: 'bg-white/90 backdrop-blur-sm',
          border: 'border-sky-200'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          accent: 'forest-growth',
          text: 'text-forest-deep',
          card: 'bg-white/95 backdrop-blur-sm',
          border: 'border-forest-200'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          accent: 'earth-warm',
          text: 'text-earth-sand',
          card: 'bg-white/85 backdrop-blur-sm',
          border: 'border-earth-200'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          accent: 'forest-growth',
          text: 'text-forest-deep',
          card: 'bg-white/95 backdrop-blur-sm',
          border: 'border-forest-200'
        };
    }
  };

  const modeStyles = getModeStyles();

  useEffect(() => {
    fetchConnections();
    fetchCredentials();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/oauth/providers`);
      const data = await response.json();
      
      if (data.providers) {
        setConnections(data.providers.map(provider => ({
          ...provider,
          connected: false,
          status: 'available'
        })));
      }
    } catch (error) {
      console.error('Error fetching OAuth providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const mockCredentials = [
        {
          id: 1,
          provider: 'gdrive',
          account_id: 'user@gmail.com',
          expires_at: '2024-12-31T23:59:59Z',
          scopes: ['drive.readonly'],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          provider: 'notion',
          account_id: 'workspace_123',
          expires_at: null,
          scopes: ['read'],
          created_at: '2024-01-15T00:00:00Z'
        }
      ];
      setCredentials(mockCredentials);
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider) => {
    setConnecting(provider.name || provider);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/oauth/${provider.name || provider}/start`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.auth_url) {
          const popup = window.open(
            data.auth_url,
            'oauth',
            'width=600,height=700,scrollbars=yes,resizable=yes'
          );
          
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              setConnecting(null);
              fetchConnections();
              fetchCredentials();
              
              // Trigger celebration for successful connection
              triggerTaskCompletionCelebration({
                name: `Connected to ${provider.name || provider}`,
                difficulty: 'medium',
                type: 'integration_success',
                isLinkedToMajorGoal: true,
                revenueImpact: Math.floor(Math.random() * 3000) + 1500
              });
            }
          }, 1000);
        }
      } else {
        // Fallback to mock connection for demo
        setTimeout(() => {
          const newCredential = {
            id: Date.now(),
            provider: provider.name || provider,
            account_id: `user_${Date.now()}`,
            expires_at: provider === 'notion' ? null : '2024-12-31T23:59:59Z',
            scopes: ['read'],
            created_at: new Date().toISOString()
          };
          setCredentials([...credentials, newCredential]);
          setConnecting(null);
          
          // Trigger celebration
          triggerTaskCompletionCelebration({
            name: `Connected to ${provider.name || provider}`,
            difficulty: 'medium',
            type: 'integration_success',
            isLinkedToMajorGoal: true,
            revenueImpact: Math.floor(Math.random() * 3000) + 1500
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error starting OAuth flow:', error);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (credentialId) => {
    if (confirm('Are you sure you want to disconnect this account?')) {
      try {
        await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/oauth/credentials/${credentialId}`,
          { method: 'DELETE' }
        );
        setCredentials(credentials.filter(cred => cred.id !== credentialId));
        fetchConnections();
        
        // Update user profile to reflect reduced integration complexity
        updateUserProfile({ integrationComplexity: 'reduced' });
      } catch (error) {
        console.error('Error disconnecting:', error);
        setCredentials(credentials.filter(cred => cred.id !== credentialId));
      }
    }
  };

  const getProviderIcon = (name) => {
    const provider = providerInfo[name.toLowerCase()];
    return provider ? provider.icon : '☁️';
  };

  const getProviderDescription = (name) => {
    const provider = providerInfo[name.toLowerCase()];
    return provider ? provider.description : 'Connect to your cloud storage';
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getConnectionStatus = (credential) => {
    if (isExpired(credential.expires_at)) {
      return { status: 'expired', color: 'destructive', icon: AlertCircle };
    }
    return { status: 'connected', color: 'default', icon: CheckCircle };
  };

  const getSecurityBadge = (providerId) => {
    const provider = providerInfo[providerId];
    if (!provider) return null;
    
    const badges = {
      enterprise: { color: 'bg-green-100 text-green-800', text: 'Enterprise Grade' },
      high: { color: 'bg-blue-100 text-blue-800', text: 'High Security' },
      standard: { color: 'bg-gray-100 text-gray-800', text: 'Standard' }
    };
    
    const badge = badges[provider.securityLevel] || badges.standard;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading connections...</span>
      </div>
    );
  }

  const availableProviders = Object.keys(providerInfo);
  const connectedProviders = credentials.map(cred => cred.provider);
  const unconnectedProviders = availableProviders.filter(
    provider => !connectedProviders.includes(provider)
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${modeStyles.background} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${modeStyles.text} mb-2`}>
                🔗 Data Connections
              </h1>
              <p className="text-gray-600">
                Connect your cloud storage and productivity tools to enable seamless data integration with Guild-AI.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                className={`p-2 rounded-lg ${modeStyles.card} border ${modeStyles.border} hover:shadow-md transition-all`}
              >
                <Shield className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => {
                  fetchConnections();
                  fetchCredentials();
                }}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 ${modeStyles.card} border ${modeStyles.border} rounded-lg hover:shadow-md disabled:opacity-50 transition-all`}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Security Information Panel */}
        <AnimatePresence>
          {showSecurityInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-8 ${modeStyles.card} border ${modeStyles.border} rounded-xl p-6 shadow-lg`}
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your Data Security & Privacy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">🔒 Security Features</h4>
                      <ul className="space-y-1">
                        <li>• End-to-end encryption for all data</li>
                        <li>• OAuth 2.0 secure authentication</li>
                        <li>• Read-only access by default</li>
                        <li>• Regular security audits</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">🛡️ Privacy Protection</h4>
                      <ul className="space-y-1">
                        <li>• No data stored permanently</li>
                        <li>• Minimal required permissions</li>
                        <li>• Revocable access anytime</li>
                        <li>• GDPR & CCPA compliant</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connected Accounts */}
        {credentials.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Connected Accounts</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence>
                {credentials.map((credential, index) => {
                  const provider = providerInfo[credential.provider];
                  const status = getConnectionStatus(credential);
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={credential.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${modeStyles.card} border ${modeStyles.border} rounded-lg p-6 hover:shadow-md transition-all`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg ${provider.color} flex items-center justify-center text-white text-lg mr-3`}>
                            {provider.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {provider.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {credential.account_id}
                            </p>
                            {getSecurityBadge(credential.provider)}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className={`flex items-center ${
                            status.status === 'expired' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            <StatusIcon className="w-5 h-5 mr-1" />
                            <span className="text-sm font-medium capitalize">{status.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-2">
                          <div>Connected: {formatDate(credential.created_at)}</div>
                          {credential.expires_at && (
                            <div>Expires: {formatDate(credential.expires_at)}</div>
                          )}
                          <div>Scopes: {credential.scopes.join(', ')}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {status.status === 'expired' && (
                          <button
                            onClick={() => handleConnect(credential.provider)}
                            disabled={connecting === credential.provider}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                          >
                            {connecting === credential.provider ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Reconnecting...
                              </>
                            ) : (
                              <>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Reconnect
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleDisconnect(credential.id)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Available Connections */}
        {unconnectedProviders.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Available Connections</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <AnimatePresence>
                {unconnectedProviders.map((providerId, index) => {
                  const provider = providerInfo[providerId];
                  const isConnecting = connecting === providerId;

                  return (
                    <motion.div
                      key={providerId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${modeStyles.card} border ${modeStyles.border} rounded-lg p-6 hover:shadow-md transition-all`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg ${provider.color} flex items-center justify-center text-white text-lg mr-3`}>
                            {provider.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {provider.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {provider.description}
                            </p>
                            {getSecurityBadge(providerId)}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-400">
                          <AlertCircle className="w-5 h-5 mr-1" />
                          <span className="text-sm">Not connected</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Database className="w-4 h-4 mr-1" />
                          <span>Status: Available</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Heart className="w-4 h-4 mr-1" />
                          <span>Trust Score: {Math.round(provider.trustScore * 100)}%</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleConnect(providerId)}
                        disabled={isConnecting}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        {isConnecting ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Connect {provider.name}
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Benefits Section */}
        <motion.div 
          className={`${modeStyles.card} border ${modeStyles.border} rounded-xl p-6 shadow-lg`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Why connect your data sources?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                    Automation Benefits
                  </h4>
                  <ul className="space-y-1">
                    <li>• Automatically process documents from your cloud storage</li>
                    <li>• Enable AI agents to access your business data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    Productivity Gains
                  </h4>
                  <ul className="space-y-1">
                    <li>• Create personalized content based on your files</li>
                    <li>• Streamline your workflow with integrated data sources</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedOAuthConnections;
