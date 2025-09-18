import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProgressiveDisclosure = ({ 
  title, 
  summary, 
  details, 
  analysis, 
  level = 1,
  maxLevel = 3,
  agentType = null,
  metrics = null,
  onLevelChange = null
}) => {
  const [currentLevel, setCurrentLevel] = useState(level);
  const [isExpanded, setIsExpanded] = useState(false);

  const getLevelContent = (level) => {
    switch (level) {
      case 1:
        return { content: summary, label: 'Summary', icon: '📊' };
      case 2:
        return { content: details, label: 'Details', icon: '📈' };
      case 3:
        return { content: analysis, label: 'Analysis', icon: '🔍' };
      default:
        return { content: summary, label: 'Summary', icon: '📊' };
    }
  };

  const currentContent = getLevelContent(currentLevel);

  const getAgentTypeStyles = (agentType) => {
    const styles = {
      research: {
        color: '#3B82F6',
        bgColor: '#3B82F620',
        icon: '🔬'
      },
      marketing: {
        color: '#22C55E',
        bgColor: '#22C55E20',
        icon: '🎨'
      },
      sales: {
        color: '#F59E0B',
        bgColor: '#F59E0B20',
        icon: '🤝'
      },
      content: {
        color: '#8B5CF6',
        bgColor: '#8B5CF620',
        icon: '✍️'
      },
      operations: {
        color: '#6B7280',
        bgColor: '#6B728020',
        icon: '⚙️'
      }
    };
    return styles[agentType] || styles.operations;
  };

  const agentStyles = agentType ? getAgentTypeStyles(agentType) : null;

  const handleLevelChange = (newLevel) => {
    setCurrentLevel(newLevel);
    if (onLevelChange) {
      onLevelChange(newLevel);
    }
  };

  return (
    <motion.div
      className="bg-card rounded-lg border border-border overflow-hidden"
      layout
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {agentType && (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: agentStyles.bgColor }}
              >
                {agentStyles.icon}
              </div>
            )}
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            {/* Level Indicators */}
            <div className="flex space-x-1">
              {Array.from({ length: maxLevel }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handleLevelChange(index + 1)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentLevel >= index + 1
                      ? agentType ? agentStyles.color : 'bg-primary'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground flex items-center">
              {currentContent.icon} {currentContent.label}
            </span>
          </div>
        </div>

        {/* Metrics Display */}
        {metrics && currentLevel >= 2 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="bg-muted rounded p-2 text-center">
                <div className="text-xs text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentLevel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-muted-foreground"
          >
            {currentContent.content}
          </motion.div>
        </AnimatePresence>

        {/* Quick Navigation */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handleLevelChange(Math.max(1, currentLevel - 1))}
            disabled={currentLevel === 1}
            className="text-xs text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
          >
            ← Less Detail
          </button>
          <button
            onClick={() => handleLevelChange(Math.min(maxLevel, currentLevel + 1))}
            disabled={currentLevel === maxLevel}
            className="text-xs text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
          >
            More Detail →
          </button>
        </div>

        {/* Expandable Section for Additional Details */}
        {currentLevel === maxLevel && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-3 text-xs text-primary hover:text-primary/80 transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            {isExpanded ? 'Show Less' : 'Show Advanced Details'} ▼
          </motion.button>
        )}

        <AnimatePresence>
          {isExpanded && currentLevel === maxLevel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 pt-3 border-t border-border"
            >
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  <strong>Data Sources:</strong> Agent logs, performance metrics, user interactions
                </div>
                <div className="text-xs text-muted-foreground">
                  <strong>Last Updated:</strong> {new Date().toLocaleTimeString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  <strong>Confidence Score:</strong> {Math.floor(Math.random() * 20 + 80)}%
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProgressiveDisclosure;
