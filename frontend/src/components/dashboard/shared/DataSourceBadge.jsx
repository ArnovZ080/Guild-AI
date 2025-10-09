/**
 * DataSourceBadge Component
 * Displays whether data is real-time from integration or demo data
 * Promotes transparency and encourages integration connections
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const DataSourceBadge = ({ 
  isRealData, 
  source, 
  integration, 
  recommendedIntegration,
  className = ""
}) => {
  if (isRealData) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={`bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors ${className}`}
              variant="outline"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              <span className="text-xs font-medium">Real-time from {integration || source}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="bg-green-50 border-green-200 text-green-900">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Live Data</p>
                <p className="text-sm mt-1">
                  This data is synced in real-time from your {integration || source} account.
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 transition-colors ${className}`}
            variant="outline"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            <span className="text-xs font-medium">Demo data</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="bg-yellow-50 border-yellow-200 text-yellow-900 max-w-xs">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Demo Data</p>
              <p className="text-sm mt-1">
                This is sample data for demonstration purposes.
              </p>
              <p className="text-sm mt-2 font-medium">
                📊 Connect {recommendedIntegration || 'your integration'} for real insights
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DataSourceBadge;

