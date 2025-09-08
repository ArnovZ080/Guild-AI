import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const OAuthConnections = () => {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const availableServices = [
    {
      id: 'google_drive',
      name: 'Google Drive',
      description: 'Access and sync your Google Drive files',
      icon: '📁',
      color: 'bg-blue-100 text-blue-800',
      connected: false
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Connect your Notion workspace and databases',
      icon: '📝',
      color: 'bg-gray-100 text-gray-800',
      connected: false
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      description: 'Sync files from your Microsoft OneDrive',
      icon: '☁️',
      color: 'bg-blue-100 text-blue-800',
      connected: false
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Access your Dropbox files and folders',
      icon: '📦',
      color: 'bg-blue-100 text-blue-800',
      connected: false
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect your Slack workspace for notifications',
      icon: '💬',
      color: 'bg-purple-100 text-purple-800',
      connected: false
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Access your GitHub repositories and issues',
      icon: '🐙',
      color: 'bg-gray-100 text-gray-800',
      connected: false
    }
  ];

  useEffect(() => {
    // Simulate loading connections
    setTimeout(() => {
      // Mock some connected services
      const mockConnections = availableServices.map(service => ({
        ...service,
        connected: Math.random() > 0.5,
        lastSync: service.connected ? new Date(Date.now() - Math.random() * 86400000).toISOString() : null,
        status: service.connected ? (Math.random() > 0.8 ? 'error' : 'active') : 'disconnected'
      }));
      setConnections(mockConnections);
      setIsLoading(false);
    }, 1000);
  }, [availableServices]);

  const handleConnect = (serviceId) => {
    setConnections(prev => prev.map(conn => 
      conn.id === serviceId 
        ? { ...conn, connected: true, status: 'active', lastSync: new Date().toISOString() }
        : conn
    ));
  };

  const handleDisconnect = (serviceId) => {
    setConnections(prev => prev.map(conn => 
      conn.id === serviceId 
        ? { ...conn, connected: false, status: 'disconnected', lastSync: null }
        : conn
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastSync = (lastSync) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">OAuth Connections</h2>
        <p className="text-gray-600">Manage your connected services and integrations</p>
      </div>

      {/* Connection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-green-600">
                  {connections.filter(c => c.connected).length}
                </p>
              </div>
              <div className="text-2xl">🔗</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-blue-600">
                  {connections.length}
                </p>
              </div>
              <div className="text-2xl">⚙️</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {connections.filter(c => c.status === 'error').length}
                </p>
              </div>
              <div className="text-2xl">⚠️</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{service.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {service.connected && (
                  <div className="text-sm text-gray-600">
                    <p>Last sync: {formatLastSync(service.lastSync)}</p>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  {service.connected ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDisconnect(service.id)}
                      >
                        Disconnect
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => console.log('Sync', service.id)}
                      >
                        Sync Now
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleConnect(service.id)}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Help Section */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help with Integrations?
            </h3>
            <p className="text-gray-600 mb-4">
              Our support team can help you set up and troubleshoot any integration issues.
            </p>
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthConnections;