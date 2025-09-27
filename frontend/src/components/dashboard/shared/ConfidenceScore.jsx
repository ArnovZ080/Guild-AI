import React from 'react';
import { TrendingUp, Users, Target, Zap, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const ConfidenceScore = ({ 
  score, 
  showDetails = true, 
  size = 'medium',
  showIcon = true,
  className = '' 
}) => {
  const getScoreColor = (score) => {
    if (score >= 0.9) return 'text-green-700 bg-green-100 border-green-200';
    if (score >= 0.8) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    if (score >= 0.6) return 'text-orange-700 bg-orange-100 border-orange-200';
    return 'text-red-700 bg-red-100 border-red-200';
  };

  const getScoreIcon = (score) => {
    if (score >= 0.9) return <CheckCircle className="w-4 h-4" />;
    if (score >= 0.8) return <TrendingUp className="w-4 h-4" />;
    if (score >= 0.6) return <AlertTriangle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const getScoreLabel = (score) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Good';
    if (score >= 0.6) return 'Fair';
    return 'Poor';
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'small':
        return 'px-2 py-1 text-xs';
      case 'large':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const percentage = Math.round(score * 100);

  return (
    <div className={`inline-flex items-center space-x-2 border rounded-full ${getScoreColor(score)} ${getSizeClasses(size)} ${className}`}>
      {showIcon && (
        <div className="flex-shrink-0">
          {getScoreIcon(score)}
        </div>
      )}
      <div className="flex items-center space-x-1">
        <span className="font-medium">{percentage}%</span>
        {showDetails && (
          <>
            <span className="text-gray-500">•</span>
            <span className="font-medium">{getScoreLabel(score)}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfidenceScore;
