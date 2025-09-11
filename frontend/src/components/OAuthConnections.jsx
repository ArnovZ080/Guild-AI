import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  Database,
  FileText,
  Users,
  Trash2
} from 'lucide-react';

const OAuthConnections = () => {
  const [connections, setConnections] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);

  const providerInfo = {
    gdrive: {
      name: 'Google Drive',
      icon: '📁',
      color: 'bg-blue-500',
      description: 'Access your Google Drive files and folders'
    },
    notion: {
      name: 'Notion',
      icon: '📝',
      color: 'bg-gray-800',
      description: 'Connect to your Notion workspace and databases'
    },
    onedrive: {
      name: 'OneDrive',
      icon: '☁️',
      color: 'bg-blue-600',
      description: 'Sync with your Microsoft OneDrive storage'
    },
    dropbox: {
      name: 'Dropbox',
      icon: '📦',
      color: 'bg-blue-700',
      description: 'Connect to your Dropbox file storage'
    }
  };

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
          connected: false, // This would come from your backend
          status: 'available'
        })));
      }
    } catch (error) {
      console.error('Error fetching OAuth providers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock API calls - replace with actual API integration
  const fetchCredentials = async () => {
    setLoading(true);
    try {
      // Simulate API call
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
      // Start OAuth flow
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/oauth/${provider.name || provider}/start`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.auth_url) {
          // Open OAuth flow in new window
          const popup = window.open(
            data.auth_url,
            'oauth',
            'width=600,height=700,scrollbars=yes,resizable=yes'
          );
          
          // Listen for OAuth completion
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              setConnecting(null);
              fetchConnections(); // Refresh connections
              fetchCredentials(); // Refresh credentials
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
        fetchConnections(); // Refresh connections
      } catch (error) {
        console.error('Error disconnecting:', error);
        // Fallback to local state update
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Data Connections
            </h1>
            <p className="text-gray-600">
              Connect your cloud storage and productivity tools to enable seamless data integration with Guild-AI.
            </p>
          </div>
          <button
            onClick={() => {
              fetchConnections();
              fetchCredentials();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Connected Accounts */}
      {credentials.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Connected Accounts</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {credentials.map((credential) => {
              const provider = providerInfo[credential.provider];
              const status = getConnectionStatus(credential);
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={credential.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
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
          </div>
        </div>
      )}

      {/* Available Connections */}
      {unconnectedProviders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Available Connections</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {unconnectedProviders.map((providerId) => {
              const provider = providerInfo[providerId];
              const isConnecting = connecting === providerId;

              return (
                <motion.div
                  key={providerId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
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
          </div>
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900">
              Why connect your data sources?
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Automatically process documents from your cloud storage</li>
                <li>Enable AI agents to access your business data</li>
                <li>Create personalized content based on your files</li>
                <li>Streamline your workflow with integrated data sources</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthConnections;