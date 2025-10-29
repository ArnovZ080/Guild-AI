// src/components/agents/AgentPersonality.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConversationInterface from '../conversation/ConversationInterface';

const AgentPersonality = ({ agent, onInteraction }) => {
  const [isConversing, setIsConversing] = useState(false);
  const [emotionalState, setEmotionalState] = useState('focused');
  const [recentThoughts, setRecentThoughts] = useState([]);

  const personalityTraits = {
    'research': {
      name: 'Dr. Insight',
      personality: 'analytical, thorough, curious',
      avatar: '🔬',
      primaryColor: '#3B82F6',
      voiceStyle: 'methodical and precise',
      emotionalRange: ['focused', 'excited', 'contemplative', 'satisfied']
    },
    'marketing': {
      name: 'Creative Spark',
      personality: 'innovative, energetic, persuasive',
      avatar: '🎨',
      primaryColor: '#22C55E',
      voiceStyle: 'enthusiastic and inspiring',
      emotionalRange: ['inspired', 'collaborative', 'strategic', 'accomplished']
    },
    'sales': {
      name: 'Deal Closer',
      personality: 'confident, relationship-focused, results-driven',
      avatar: '🤝',
      primaryColor: '#F59E0B',
      voiceStyle: 'warm and persuasive',
      emotionalRange: ['confident', 'empathetic', 'determined', 'celebratory']
    }
  };

  const currentPersonality = personalityTraits[agent.type] || personalityTraits['research'];

  const getEmotionalExpression = (emotion) => {
    const expressions = {
      focused: '😌',
      excited: '🤩',
      contemplative: '🤔',
      satisfied: '😊',
      inspired: '💡',
      collaborative: '🤝',
      strategic: '🎯',
      accomplished: '🎉'
    };
    return expressions[emotion] || '😊';
  };

  return (
    <motion.div
      className="relative bg-white rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-primary/30 transition-all duration-300"
      whileHover={{ scale: 1.02, y: -2 }}
      style={{ borderColor: `${currentPersonality.primaryColor}20` }}
    >
      {/* Agent Avatar and Personality */}
      <div className="flex items-center mb-4">
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mr-4"
          style={{ backgroundColor: `${currentPersonality.primaryColor}15` }}
          animate={{
            scale: agent.status === 'working' ? [1, 1.05, 1] : 1,
            rotate: agent.status === 'thinking' ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-3xl">{currentPersonality.avatar}</span>
          <span className="absolute -bottom-1 -right-1 text-lg">
            {getEmotionalExpression(emotionalState)}
          </span>
        </motion.div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {currentPersonality.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentPersonality.personality}
          </p>
          <div className="flex items-center mt-1">
            <div
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: currentPersonality.primaryColor }}
            />
            <span className="text-xs text-muted-foreground capitalize">
              {emotionalState}
            </span>
          </div>
        </div>
      </div>

      {/* Current Activity with Personality */}
      <div className="mb-4">
        <div className="text-sm font-medium text-foreground mb-2">
          Current Focus
        </div>
        <div className="bg-muted rounded-lg p-3">
          <p className="text-sm text-muted-foreground">
            {agent.currentTask}
          </p>
          {agent.progress > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(agent.progress * 100)}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: currentPersonality.primaryColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${agent.progress * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Interface */}
      <motion.button
        className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 px-4 rounded-lg transition-colors"
        onClick={() => setIsConversing(!isConversing)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        💬 Chat with {currentPersonality.name}
      </motion.button>

      <ConversationInterface
        isOpen={isConversing}
        onClose={() => setIsConversing(false)}
        agent={currentPersonality}
        onMessage={(message) => onInteraction(message)}
      />
    </motion.div>
  );
};

export default AgentPersonality;
