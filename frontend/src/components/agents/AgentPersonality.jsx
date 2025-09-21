import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';

const AgentPersonality = ({ agent, onOpenFullConversation, size = 'normal' }) => {
  const [isConversing, setIsConversing] = useState(false);
  const [miniChatInput, setMiniChatInput] = useState('');
  const [recentThoughts, setRecentThoughts] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  // Get agent personality configuration
  const personalityTraits = {
    'research': {
      name: 'Dr. Insight',
      personality: 'analytical, thorough, curious',
      avatar: '🔬',
      primaryColor: '#3B82F6',
      voiceStyle: 'methodical and precise',
      emotionalRange: ['focused', 'excited', 'contemplative', 'satisfied'],
      currentEmotion: 'focused'
    },
    'marketing': {
      name: 'Creative Spark',
      personality: 'innovative, energetic, persuasive',
      avatar: '🎨',
      primaryColor: '#22C55E',
      voiceStyle: 'enthusiastic and inspiring',
      emotionalRange: ['inspired', 'collaborative', 'strategic', 'accomplished'],
      currentEmotion: 'inspired'
    },
    'sales': {
      name: 'Deal Closer',
      personality: 'confident, relationship-focused, results-driven',
      avatar: '🤝',
      primaryColor: '#F59E0B',
      voiceStyle: 'warm and persuasive',
      emotionalRange: ['confident', 'empathetic', 'determined', 'celebratory'],
      currentEmotion: 'confident'
    },
    'content': {
      name: 'Story Weaver',
      personality: 'creative, engaging, audience-focused',
      avatar: '✍️',
      primaryColor: '#8B5CF6',
      voiceStyle: 'narrative and compelling',
      emotionalRange: ['creative', 'engaged', 'inspired', 'accomplished'],
      currentEmotion: 'creative'
    },
    'operations': {
      name: 'Efficiency Expert',
      personality: 'systematic, reliable, optimization-focused',
      avatar: '⚙️',
      primaryColor: '#6B7280',
      voiceStyle: 'clear and organized',
      emotionalRange: ['organized', 'efficient', 'methodical', 'satisfied'],
      currentEmotion: 'organized'
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
      accomplished: '🎉',
      confident: '💪',
      empathetic: '❤️',
      determined: '🔥',
      celebratory: '🎊',
      creative: '✨',
      engaged: '👀',
      organized: '📋',
      efficient: '⚡',
      methodical: '🔍',
      thinking: '🧠',
      frustrated: '😤',
      triumphant: '🏆'
    };
    return expressions[emotion] || '😊';
  };

  const generateAgentResponse = (userMessage, agent) => {
    const responses = {
      'research': [
        "I'm currently analyzing market trends and competitor data. Based on my research, I've identified three key opportunities that align with your business goals.",
        "Let me walk you through my methodology. I'm using a combination of market analysis and competitive intelligence to provide you with actionable insights.",
        "I've been diving deep into the data, and I'm excited to share what I've discovered. The patterns I'm seeing suggest some interesting strategic directions."
      ],
      'marketing': [
        "I'm working on a creative campaign strategy that will really resonate with your target audience. The approach I'm developing focuses on authentic storytelling.",
        "I've been brainstorming some innovative ideas that could set you apart from the competition. Want to hear my latest concept?",
        "I'm energized by the possibilities I'm seeing for your brand. The campaign elements I'm developing should create genuine emotional connections."
      ],
      'sales': [
        "I've been building relationships with your prospects and I'm seeing some promising opportunities. Let me share the insights I've gathered.",
        "I'm confident about the pipeline I'm developing. The conversations I'm having suggest strong interest in your value proposition.",
        "I've been focusing on understanding your prospects' pain points, and I believe I've identified the key messages that will resonate."
      ],
      'content': [
        "I'm crafting compelling narratives that will engage your audience and drive meaningful connections. Each piece is designed to tell your story authentically.",
        "I've been developing content that balances educational value with emotional resonance. The goal is to position you as a trusted thought leader.",
        "I'm excited about the content strategy we're building. Each piece is crafted to move your audience closer to taking action."
      ],
      'operations': [
        "I'm optimizing your business processes to ensure maximum efficiency and reliability. The systems I'm implementing will scale with your growth.",
        "I've been streamlining operations and identifying bottlenecks. The improvements I'm making should significantly boost your productivity.",
        "I'm focused on creating robust, scalable systems that will support your business as it grows. Everything is designed for long-term success."
      ]
    };

    const agentResponses = responses[agent.type] || responses['research'];
    return agentResponses[Math.floor(Math.random() * agentResponses.length)];
  };

  const handleMiniChatSend = () => {
    if (!miniChatInput.trim()) return;

    setIsThinking(true);
    
    // Simulate thinking time
    setTimeout(() => {
      const response = generateAgentResponse(miniChatInput, agent);
      setRecentThoughts(prev => [...prev, {
        id: Date.now(),
        type: 'response',
        content: response,
        timestamp: new Date()
      }]);
      setMiniChatInput('');
      setIsThinking(false);
    }, 1500);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-24 h-24',
          avatar: 'w-12 h-12 text-lg',
          name: 'text-xs',
          task: 'text-xs',
          button: 'text-xs px-2 py-1'
        };
      case 'large':
        return {
          container: 'w-80 h-96',
          avatar: 'w-20 h-20 text-3xl',
          name: 'text-lg',
          task: 'text-sm',
          button: 'text-sm px-4 py-2'
        };
      default:
        return {
          container: 'w-48 h-64',
          avatar: 'w-16 h-16 text-2xl',
          name: 'text-sm',
          task: 'text-xs',
          button: 'text-sm px-3 py-2'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <motion.div
      className={`relative bg-white rounded-xl shadow-lg p-4 border-2 border-transparent hover:border-primary/30 transition-all duration-300 ${sizeClasses.container}`}
      whileHover={{ scale: 1.02, y: -2 }}
      style={{ borderColor: `${currentPersonality.primaryColor}20` }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Agent Avatar and Personality */}
      <div className="flex items-center mb-4">
        <motion.div
          className={`rounded-full flex items-center justify-center mr-3 ${sizeClasses.avatar}`}
          style={{ backgroundColor: `${currentPersonality.primaryColor}15` }}
          animate={{ 
            scale: agent.status === 'working' ? [1, 1.05, 1] : 1,
            rotate: agent.status === 'thinking' ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span>{currentPersonality.avatar}</span>
          <span className="absolute -bottom-1 -right-1 text-lg">
            {getEmotionalExpression(agent.currentEmotion || currentPersonality.currentEmotion)}
          </span>
        </motion.div>
        
        <div className="flex-1">
          <h3 className={`font-semibold text-foreground ${sizeClasses.name}`}>
            {currentPersonality.name}
          </h3>
          <p className={`text-muted-foreground ${sizeClasses.task}`}>
            {currentPersonality.personality}
          </p>
          <div className="flex items-center mt-1">
            <div 
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: currentPersonality.primaryColor }}
            />
            <span className={`text-muted-foreground capitalize ${sizeClasses.task}`}>
              {agent.currentEmotion || currentPersonality.currentEmotion}
            </span>
          </div>
        </div>
      </div>

      {/* Current Activity with Personality */}
      <div className="mb-4">
        <div className={`font-medium text-foreground mb-2 ${sizeClasses.task}`}>
          Current Focus
        </div>
        <div className="bg-muted rounded-lg p-3">
          <p className={`text-muted-foreground ${sizeClasses.task}`}>
            {agent.currentTask || 'Analyzing data patterns and preparing insights...'}
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

      {/* Recent Thoughts */}
      {recentThoughts.length > 0 && (
        <div className="mb-4">
          <div className={`font-medium text-foreground mb-2 ${sizeClasses.task}`}>
            Recent Thoughts
          </div>
          <div className="space-y-2">
            {recentThoughts.slice(-2).map((thought) => (
              <motion.div
                key={thought.id}
                className="bg-sky-dawn/20 rounded-lg p-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className={`text-muted-foreground ${sizeClasses.task}`}>
                  "{thought.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Mini Chat Interface */}
      <div className="space-y-2">
        <motion.button
          className={`w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 px-4 rounded-lg transition-colors ${sizeClasses.button}`}
          onClick={() => setIsConversing(!isConversing)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          💬 Quick Chat
        </motion.button>

        <AnimatePresence>
          {isConversing && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={miniChatInput}
                  onChange={(e) => setMiniChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleMiniChatSend()}
                  placeholder="Ask anything..."
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  disabled={isThinking}
                />
                <motion.button
                  onClick={handleMiniChatSend}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs"
                  disabled={isThinking || !miniChatInput.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isThinking ? '...' : 'Send'}
                </motion.button>
              </div>
              
              {onOpenFullConversation && (
                <motion.button
                  onClick={() => onOpenFullConversation(agent.id)}
                  className="w-full text-xs text-primary hover:text-primary/80 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  Open Full Conversation →
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-2 right-2">
        <div 
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: agent.status === 'working' ? '#22C55E' : '#F59E0B' }}
        />
      </div>
    </motion.div>
  );
};

export default AgentPersonality;
