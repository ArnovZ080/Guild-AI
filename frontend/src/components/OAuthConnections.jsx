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
  Users
} from 'lucide-react';

const OAuthConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);

  useEffect(() => {
    fetchConnections();
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

  const handleConnect = async (provider) => {
    setConnecting(provider.name);
    try {
      // Start OAuth flow
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/oauth/${provider.name}/start`,
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
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error starting OAuth flow:', error);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (provider) => {
    try {
      await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/oauth/credentials/${provider.id}`,
        { method: 'DELETE' }
      );
      fetchConnections(); // Refresh connections
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const getProviderIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'gdrive':
      case 'google drive':
        return '🔵';
      case 'dropbox':
        return '🔷';
      case 'notion':
        return '📝';
      case 'onedrive':
        return '🔷';
      default:
        return '☁️';
    }
  }

  const getProviderDescription = (name) => {
    switch (name.toLowerCase()) {
      case 'gdrive':
      case 'google drive':
        return 'Access your Google Drive files and documents';
      case 'dropbox':
        return 'Connect to your Dropbox storage and files';
      case 'notion':
        return 'Import your Notion pages and databases';
      case 'onedrive':
        return 'Access your Microsoft OneDrive files';
      default:
        return 'Connect to your cloud storage';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading connections...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Data Connections
        </h1>
        <p className="text-gray-600">
          Connect your cloud storage and productivity tools to enable seamless data integration with Guild-AI.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {connections.map((connection) => (
          <motion.div
            key={connection.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <span className="text-3xl mr-3">
                  {getProviderIcon(connection.name)}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {connection.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getProviderDescription(connection.name)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                {connection.connected ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <AlertCircle className="w-5 h-5 mr-1" />
                    <span className="text-sm">Not connected</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Database className="w-4 h-4 mr-1" />
                <span>Status: {connection.status}</span>
              </div>
              {connection.connected && (
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>Ready for document processing</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {connection.connected ? (
                <button
                  onClick={() => handleDisconnect(connection)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(connection)}
                  disabled={connecting === connection.name}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {connecting === connection.name ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

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
  )
}
