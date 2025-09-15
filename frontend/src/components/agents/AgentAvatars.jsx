import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, PenTool, TrendingUp, MessageCircle, BarChart, Zap } from 'lucide-react';

const agentPersonalities = {
  'research': {
    name: 'Research Agent',
    personality: 'Analytical Detective',
    avatar: '🔍',
    icon: Search,
    colors: {
      primary: '#3B82F6',
      secondary: '#93C5FD',
      accent: '#1E40AF'
    },
    traits: ['Methodical', 'Thorough', 'Data-driven'],
    voice: 'I dig deep to find the insights that matter.',
    statusMessages: {
      idle: 'Ready to investigate',
      working: 'Analyzing data patterns',
      completed: 'Insights discovered'
    }
  },
  'content-strategist': {
    name: 'Content Strategist',
    personality: 'Creative Storyteller',
    avatar: '✍️',
    icon: PenTool,
    colors: {
      primary: '#10B981',
      secondary: '#6EE7B7',
      accent: '#047857'
    },
    traits: ['Creative', 'Engaging', 'Brand-focused'],
    voice: 'I craft stories that connect and convert.',
    statusMessages: {
      idle: 'Inspired and ready',
      working: 'Crafting compelling content',
      completed: 'Story delivered'
    }
  },
  'marketing': {
    name: 'Marketing Agent',
    personality: 'Growth Catalyst',
    avatar: '📈',
    icon: TrendingUp,
    colors: {
      primary: '#8B5CF6',
      secondary: '#C4B5FD',
      accent: '#6D28D9'
    },
    traits: ['Strategic', 'Results-driven', 'Innovative'],
    voice: 'I turn insights into growth opportunities.',
    statusMessages: {
      idle: 'Strategizing next moves',
      working: 'Optimizing campaigns',
      completed: 'Growth achieved'
    }
  },
  'support': {
    name: 'Customer Success Agent',
    personality: 'Empathetic Helper',
    avatar: '🎧',
    icon: MessageCircle,
    colors: {
      primary: '#F59E0B',
      secondary: '#FCD34D',
      accent: '#D97706'
    },
    traits: ['Empathetic', 'Solution-focused', 'Patient'],
    voice: 'I ensure every customer feels valued and heard.',
    statusMessages: {
      idle: 'Ready to assist',
      working: 'Helping customers',
      completed: 'Issue resolved'
    }
  },
  'analytics': {
    name: 'Analytics Agent',
    personality: 'Numbers Wizard',
    avatar: '📊',
    icon: BarChart,
    colors: {
      primary: '#EF4444',
      secondary: '#FCA5A5',
      accent: '#DC2626'
    },
    traits: ['Precise', 'Insightful', 'Pattern-focused'],
    voice: 'I turn data into actionable intelligence.',
    statusMessages: {
      idle: 'Crunching numbers',
      working: 'Analyzing metrics',
      completed: 'Insights ready'
    }
  },
  'strategy': {
    name: 'Strategy Agent',
    personality: 'Visionary Planner',
    avatar: '🎯',
    icon: Brain,
    colors: {
      primary: '#6366F1',
      secondary: '#A5B4FC',
      accent: '#4338CA'
    },
    traits: ['Visionary', 'Strategic', 'Big-picture'],
    voice: 'I see the path to your biggest goals.',
    statusMessages: {
      idle: 'Planning ahead',
      working: 'Developing strategy',
      completed: 'Strategy complete'
    }
  },
  'automation': {
    name: 'Automation Agent',
    personality: 'Efficiency Expert',
    avatar: '⚡',
    icon: Zap,
    colors: {
      primary: '#EC4899',
      secondary: '#F9A8D4',
      accent: '#BE185D'
    },
    traits: ['Efficient', 'Systematic', 'Optimization-focused'],
    voice: 'I streamline processes for maximum efficiency.',
    statusMessages: {
      idle: 'Optimizing workflows',
      working: 'Automating processes',
      completed: 'Efficiency improved'
    }
  }
};

export const AgentAvatar = ({ 
  agentId, 
  status = 'idle', 
  size = 'medium',
  showTooltip = true,
  animated = true,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const agent = agentPersonalities[agentId];
  
  if (!agent) return null;

  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-lg',
    large: 'w-16 h-16 text-xl'
  };

  const statusAnimations = {
    idle: animated ? { scale: [1, 1.05, 1] } : {},
    working: animated ? { 
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0]
    } : {},
    completed: animated ? {
      scale: [1, 1.2, 1],
      rotate: [0, 360]
    } : {}
  };

  const statusColors = {
    idle: agent.colors.secondary,
    working: agent.colors.primary,
    completed: agent.colors.accent
  };

  return (
    <div className="relative inline-block">
      <motion.div
        className={`
          ${sizeClasses[size]} 
          rounded-full flex items-center justify-center cursor-pointer
          shadow-lg border-2 border-white
          font-bold text-white
        `}
        style={{ 
          backgroundColor: statusColors[status],
          color: 'white'
        }}
        animate={statusAnimations[status]}
        transition={{ 
          duration: 2, 
          repeat: status === 'working' ? Infinity : 0,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        <span>{agent.avatar}</span>
      </motion.div>

      {/* Status indicator */}
      <motion.div
        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
        style={{ backgroundColor: statusColors[status] }}
        animate={status === 'working' ? {
          scale: [1, 1.3, 1],
          opacity: [0.8, 1, 0.8]
        } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && isHovered && (
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl max-w-xs">
              <div className="font-semibold">{agent.name}</div>
              <div className="text-gray-300 text-xs">{agent.statusMessages[status]}</div>
              <div className="text-gray-400 text-xs italic mt-1">"{agent.voice}"</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AgentTeam = ({ activeAgents = [], onAgentSelect, layout = 'horizontal' }) => {
  const layoutClasses = {
    horizontal: 'flex space-x-4',
    vertical: 'flex flex-col space-y-4',
    grid: 'grid grid-cols-3 gap-4'
  };

  return (
    <div className={layoutClasses[layout]}>
      {activeAgents.map((agentId, index) => (
        <motion.div
          key={agentId}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <AgentAvatar
            agentId={agentId}
            status="working"
            size="medium"
            onClick={() => onAgentSelect?.(agentId)}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Agent Personality Panel
export const AgentPersonalityPanel = ({ agentId, isOpen, onClose }) => {
  const agent = agentPersonalities[agentId];
  
  if (!agent) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-white font-bold"
                style={{ backgroundColor: agent.colors.primary }}
              >
                {agent.avatar}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{agent.name}</h2>
              <p className="text-lg text-gray-600">{agent.personality}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personality Traits</h3>
                <div className="flex flex-wrap gap-2">
                  {agent.traits.map(trait => (
                    <span 
                      key={trait}
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: agent.colors.secondary, color: agent.colors.accent }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Agent Voice</h3>
                <p className="text-gray-700 italic">"{agent.voice}"</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 py-3 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: agent.colors.primary }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};