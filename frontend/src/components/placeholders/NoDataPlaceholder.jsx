import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Settings, Link, Zap } from 'lucide-react';

const NoDataPlaceholder = ({ 
  title, 
  description, 
  actionType = 'connect', 
  actionText, 
  onAction,
  icon: Icon = AlertCircle,
  showConnectButton = true 
}) => {
  const getActionButton = () => {
    if (!showConnectButton) return null;
    
    const buttonConfig = {
      connect: {
        text: actionText || 'Connect Service',
        icon: Link,
        variant: 'default'
      },
      configure: {
        text: actionText || 'Configure',
        icon: Settings,
        variant: 'outline'
      },
      activate: {
        text: actionText || 'Activate',
        icon: Zap,
        variant: 'default'
      }
    };
    
    const config = buttonConfig[actionType] || buttonConfig.connect;
    const ActionIcon = config.icon;
    
    return (
      <Button 
        onClick={onAction}
        variant={config.variant}
        className="mt-4"
      >
        <ActionIcon className="w-4 h-4 mr-2" />
        {config.text}
      </Button>
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Icon className="w-8 h-8 text-gray-500" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-md">
          {description}
        </p>
        
        {getActionButton()}
      </CardContent>
    </Card>
  );
};

export default NoDataPlaceholder;
