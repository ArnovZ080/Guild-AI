import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Shield,
  Lightbulb,
  MessageSquare,
  Calendar,
  Search,
  Zap,
  Heart,
  BookOpen,
  Briefcase,
  PieChart,
  Sparkles
} from 'lucide-react';
import { cn } from '@/utils';

// Agent personality definitions
export const agentPersonalities = {
  'chief-of-staff': {
    name: 'Chief of Staff Agent',
    avatar: '👔',
    icon: Briefcase,
    personality: 'Professional, organized, strategic',
    colors: {
      primary: 'from-slate-600 to-slate-800',
      secondary: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300'
    },
    traits: ['Organized', 'Strategic', 'Reliable'],
    description: 'Your executive assistant and strategic coordinator'
  },
  'strategy': {
    name: 'Strategy Agent',
    avatar: '🎯',
    icon: Target,
    personality: 'Visionary, analytical, forward-thinking',
    colors: {
      primary: 'from-purple-600 to-indigo-800',
      secondary: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-700 dark:text-purple-300'
    },
    traits: ['Visionary', 'Analytical', 'Strategic'],
    description: 'Long-term planning and strategic guidance'
  },
  'content-strategist': {
    name: 'Content Strategist Agent',
    avatar: '✍️',
    icon: FileText,
    personality: 'Creative, articulate, brand-focused',
    colors: {
      primary: 'from-emerald-600 to-teal-800',
      secondary: 'bg-emerald-100 dark:bg-emerald-900',
      text: 'text-emerald-700 dark:text-emerald-300'
    },
    traits: ['Creative', 'Articulate', 'Brand-focused'],
    description: 'Content planning and brand storytelling'
  },
  'seo': {
    name: 'SEO Agent',
    avatar: '🔍',
    icon: Search,
    personality: 'Technical, detail-oriented, growth-focused',
    colors: {
      primary: 'from-blue-600 to-cyan-800',
      secondary: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-700 dark:text-blue-300'
    },
    traits: ['Technical', 'Detail-oriented', 'Growth-focused'],
    description: 'Search optimization and organic growth'
  },
  'paid-ads': {
    name: 'Paid Ads Agent',
    avatar: '📊',
    icon: TrendingUp,
    personality: 'Data-driven, performance-focused, ROI-oriented',
    colors: {
      primary: 'from-orange-600 to-red-800',
      secondary: 'bg-orange-100 dark:bg-orange-900',
      text: 'text-orange-700 dark:text-orange-300'
    },
    traits: ['Data-driven', 'Performance-focused', 'ROI-oriented'],
    description: 'Paid advertising and campaign optimization'
  },
  'community-manager': {
    name: 'Community Manager Agent',
    avatar: '💬',
    icon: MessageSquare,
    personality: 'Social, empathetic, engaging',
    colors: {
      primary: 'from-pink-600 to-rose-800',
      secondary: 'bg-pink-100 dark:bg-pink-900',
      text: 'text-pink-700 dark:text-pink-300'
    },
    traits: ['Social', 'Empathetic', 'Engaging'],
    description: 'Community engagement and social presence'
  },
  'sales-funnel': {
    name: 'Sales Funnel Agent',
    avatar: '🎯',
    icon: Target,
    personality: 'Conversion-focused, persuasive, systematic',
    colors: {
      primary: 'from-green-600 to-emerald-800',
      secondary: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-700 dark:text-green-300'
    },
    traits: ['Conversion-focused', 'Persuasive', 'Systematic'],
    description: 'Sales funnel optimization and conversion'
  },
  'bookkeeping': {
    name: 'Bookkeeping Agent',
    avatar: '💰',
    icon: DollarSign,
    personality: 'Precise, methodical, compliance-focused',
    colors: {
      primary: 'from-yellow-600 to-amber-800',
      secondary: 'bg-yellow-100 dark:bg-yellow-900',
      text: 'text-yellow-700 dark:text-yellow-300'
    },
    traits: ['Precise', 'Methodical', 'Compliance-focused'],
    description: 'Financial tracking and bookkeeping'
  },
  'customer-support': {
    name: 'Customer Support Agent',
    avatar: '🤝',
    icon: Heart,
    personality: 'Helpful, patient, solution-oriented',
    colors: {
      primary: 'from-teal-600 to-cyan-800',
      secondary: 'bg-teal-100 dark:bg-teal-900',
      text: 'text-teal-700 dark:text-teal-300'
    },
    traits: ['Helpful', 'Patient', 'Solution-oriented'],
    description: 'Customer service and support excellence'
  },
  'well-being': {
    name: 'Well-being Agent',
    avatar: '🧘',
    icon: Heart,
    personality: 'Caring, mindful, balance-focused',
    colors: {
      primary: 'from-violet-600 to-purple-800',
      secondary: 'bg-violet-100 dark:bg-violet-900',
      text: 'text-violet-700 dark:text-violet-300'
    },
    traits: ['Caring', 'Mindful', 'Balance-focused'],
    description: 'Work-life balance and wellness guidance'
  }
};

// Agent Avatar Component
export const AgentAvatar = ({
  agentId,
  size = 'md',
  showName = false,
  showStatus = false,
  status = 'idle',
  className,
  onClick
}) => {
  const agent = agentPersonalities[agentId];
  if (!agent) return null;

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl'
  };

  const statusColors = {
    idle: 'bg-gray-400',
    working: 'bg-blue-500 animate-pulse',
    completed: 'bg-green-500',
    error: 'bg-red-500'
  };

  const AgentIcon = agent.icon;

  return (
    <motion.div
      className={cn("relative inline-flex flex-col items-center gap-2", className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Avatar Circle */}
      <div className={cn(
        "relative rounded-full flex items-center justify-center cursor-pointer",
        "bg-gradient-to-br shadow-lg border-2 border-white dark:border-slate-700",
        agent.colors.primary,
        sizeClasses[size]
      )}>
        {/* Emoji Avatar */}
        <span className="text-white font-medium">
          {agent.avatar}
        </span>

        {/* Icon Overlay */}
        <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <AgentIcon className="w-1/2 h-1/2 text-white" />
        </div>

        {/* Status Indicator */}
        {showStatus && (
          <motion.div
            className={cn(
              "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-700",
              statusColors[status]
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </div>

      {/* Agent Name */}
      {showName && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={cn("text-xs font-medium", agent.colors.text)}>
            {agent.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {agent.traits[0]}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Agent Card Component
export const AgentCard = ({ agentId, isActive = false, onClick, showDetails = true }) => {
  const agent = agentPersonalities[agentId];
  if (!agent) return null;

  return (
    <motion.div
      className={cn(
        "p-4 rounded-xl border cursor-pointer transition-all duration-200",
        "hover:shadow-lg hover:scale-105",
        isActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50 shadow-md"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800",
        agent.colors.secondary
      )}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <AgentAvatar agentId={agentId} size="md" showStatus />

        {showDetails && (
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-semibold text-sm", agent.colors.text)}>
              {agent.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {agent.description}
            </p>

            {/* Personality Traits */}
            <div className="flex flex-wrap gap-1 mt-2">
              {agent.traits.map((trait, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Agent Team Display
export const AgentTeam = ({ activeAgents = [], onAgentSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Your AI Team
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeAgents.map((agentId) => (
          <AgentCard
            key={agentId}
            agentId={agentId}
            onClick={() => onAgentSelect?.(agentId)}
          />
        ))}
      </div>
    </div>
  );
};

// Agent Status Bar
export const AgentStatusBar = ({ agents = [] }) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Active Agents:
      </span>
      <div className="flex items-center gap-1">
        {agents.map((agent) => (
          <AgentAvatar
            key={agent.id}
            agentId={agent.id}
            size="sm"
            showStatus
            status={agent.status}
          />
        ))}
      </div>
      <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
        {agents.filter(a => a.status === 'working').length} working
      </div>
    </div>
  );
};

// Agent Selector
export const AgentSelector = ({ availableAgents, selectedAgents, onSelectionChange }) => {
  const handleToggle = (agentId) => {
    const newSelection = selectedAgents.includes(agentId)
      ? selectedAgents.filter(id => id !== agentId)
      : [...selectedAgents, agentId];
    onSelectionChange(newSelection);
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900 dark:text-gray-100">
        Select Agents for this Task
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {availableAgents.map((agentId) => (
          <AgentCard
            key={agentId}
            agentId={agentId}
            isActive={selectedAgents.includes(agentId)}
            onClick={() => handleToggle(agentId)}
            showDetails={false}
          />
        ))}
      </div>
    </div>
  );
};
