import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Link, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import NoDataPlaceholder from './NoDataPlaceholder';

const ConnectorStatusPlaceholder = ({ 
  platform, 
  status = 'not_configured', 
  onConnect, 
  onConfigure,
  capabilities = [],
  description = ''
}) => {
  const getStatusConfig = (status) => {
    const configs = {
      connected: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        badge: 'Connected',
        badgeVariant: 'default'
      },
      not_configured: {
        icon: XCircle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        badge: 'Not Connected',
        badgeVariant: 'secondary'
      },
      error: {
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        badge: 'Error',
        badgeVariant: 'destructive'
      },
      pending: {
        icon: AlertCircle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        badge: 'Pending',
        badgeVariant: 'outline'
      }
    };
    
    return configs[status] || configs.not_configured;
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  if (status === 'not_configured') {
    return (
      <NoDataPlaceholder
        title={`${platform} Not Connected`}
        description={description || `Connect your ${platform} account to enable automation and data access.`}
        actionType="connect"
        actionText={`Connect ${platform}`}
        onAction={onConnect}
        icon={Link}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg capitalize">{platform}</CardTitle>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <Badge variant={statusConfig.badgeVariant}>
            {statusConfig.badge}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {capabilities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Capabilities:</h4>
            <div className="flex flex-wrap gap-1">
              {capabilities.slice(0, 4).map((capability, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {capability}
                </Badge>
              ))}
              {capabilities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{capabilities.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          {status === 'connected' && (
            <Button variant="outline" size="sm" onClick={onConfigure}>
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          )}
          {status !== 'connected' && (
            <Button size="sm" onClick={onConnect}>
              <Link className="w-4 h-4 mr-2" />
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectorStatusPlaceholder;
