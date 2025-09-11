import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Calendar, 
  Users, 
  DollarSign,
  Zap,
  Heart,
  Award,
  Crown,
  Sparkles
} from 'lucide-react';
import { cn } from '@/utils';

// Achievement Types and Categories
export const AchievementTypes = {
  MILESTONE: 'milestone',
  STREAK: 'streak',
  GROWTH: 'growth',
  EFFICIENCY: 'efficiency',
  COLLABORATION: 'collaboration',
  INNOVATION: 'innovation'
};

export const AchievementCategories = {
  BUSINESS: 'business',
  PERSONAL: 'personal',
  TEAM: 'team',
  FINANCIAL: 'financial'
};

// Achievement Templates
const achievementTemplates = {
  [AchievementTypes.MILESTONE]: {
    icon: Trophy,
    colors: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    narratives: [
      "🎯 Milestone Conquered! You've reached {milestone} - a testament to your dedication and strategic vision.",
      "🏆 Achievement Unlocked: {milestone}! Your persistence has paid off in spectacular fashion.",
      "⭐ Remarkable Progress: You've successfully achieved {milestone}. This is what focused execution looks like!"
    ]
  },
  [AchievementTypes.STREAK]: {
    icon: Zap,
    colors: 'from-blue-400 to-purple-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    narratives: [
      "🔥 Streak Master! {days} consecutive days of progress. You're building unstoppable momentum!",
      "⚡ Consistency Champion: {days} days in a row! Your discipline is creating compound results.",
      "🌟 Momentum Builder: {days} straight days of execution. This is how empires are built!"
    ]
  },
  [AchievementTypes.GROWTH]: {
    icon: TrendingUp,
    colors: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    narratives: [
      "📈 Growth Explosion! {metric} increased by {percentage}% - your strategy is working brilliantly!",
      "🚀 Scaling Success: {metric} growth of {percentage}% shows your business is thriving!",
      "💹 Exponential Progress: {percentage}% growth in {metric}. You're not just growing, you're accelerating!"
    ]
  },
  [AchievementTypes.EFFICIENCY]: {
    icon: Target,
    colors: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    narratives: [
      "⚡ Efficiency Expert! You've optimized {process} and saved {time} hours this week.",
      "🎯 Process Master: {process} is now {percentage}% more efficient thanks to your improvements!",
      "🔧 Optimization Wizard: Your refinements to {process} are paying dividends in productivity!"
    ]
  },
  [AchievementTypes.COLLABORATION]: {
    icon: Users,
    colors: 'from-cyan-400 to-blue-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    narratives: [
      "🤝 Team Synergy: Your AI agents completed {tasks} collaborative tasks seamlessly!",
      "👥 Collaboration Champion: {agents} agents worked together perfectly on your latest project.",
      "🌐 Orchestration Master: You've created beautiful harmony between {agents} different AI specialists!"
    ]
  },
  [AchievementTypes.INNOVATION]: {
    icon: Sparkles,
    colors: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/20',
    borderColor: 'border-pink-200 dark:border-pink-800',
    narratives: [
      "💡 Innovation Breakthrough! Your creative approach to {challenge} is revolutionary.",
      "🌟 Visionary Move: Your innovative solution for {problem} sets you apart from the competition.",
      "🚀 Creative Genius: The way you tackled {challenge} shows true entrepreneurial innovation!"
    ]
  }
};

// Individual Achievement Component
export const AchievementCard = ({ 
  achievement, 
  isNew = false, 
  showDetails = true,
  size = 'md' 
}) => {
  const template = achievementTemplates[achievement.type] || achievementTemplates[AchievementTypes.MILESTONE];
  const Icon = template.icon;

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-xl border shadow-lg overflow-hidden",
        template.bgColor,
        template.borderColor,
        sizeClasses[size]
      )}
      initial={isNew ? { scale: 0, rotate: -10 } : { scale: 1 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        duration: 0.6 
      }}
    >
      {/* Gradient Background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-10",
        template.colors
      )} />

      {/* New Badge */}
      {isNew && (
        <motion.div
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
        >
          NEW!
        </motion.div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <motion.div
            className={cn(
              "rounded-lg bg-gradient-to-br p-2 text-white shadow-lg",
              template.colors
            )}
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className={iconSizes[size]} />
          </motion.div>
          
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">
              {achievement.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(achievement.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Narrative */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {achievement.narrative}
            </p>

            {/* Metrics */}
            {achievement.metrics && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(achievement.metrics).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2 py-1 bg-white/50 dark:bg-slate-800/50 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    {key}: {value}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Achievement Notification
export const AchievementNotification = ({ 
  achievement, 
  isVisible, 
  onClose,
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const template = achievementTemplates[achievement?.type] || achievementTemplates[AchievementTypes.MILESTONE];
  const Icon = template.icon;

  return (
    <AnimatePresence>
      {isVisible && achievement && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-sm"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className={cn(
            "rounded-xl border shadow-2xl p-4 backdrop-blur-sm",
            "bg-white/95 dark:bg-slate-900/95",
            template.borderColor
          )}>
            <div className="flex items-start gap-3">
              <motion.div
                className={cn(
                  "rounded-lg bg-gradient-to-br p-2 text-white shadow-lg",
                  template.colors
                )}
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  times: [0, 0.3, 0.7, 1]
                }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>
              
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                  🎉 Achievement Unlocked!
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {achievement.title}
                </p>
              </div>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Progress Bar */}
            <motion.div
              className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            >
              <div className={cn("h-full bg-gradient-to-r", template.colors)} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Achievement Gallery
export const AchievementGallery = ({ achievements = [], filter = 'all' }) => {
  const [selectedCategory, setSelectedCategory] = useState(filter);
  const [sortBy, setSortBy] = useState('date');

  const filteredAchievements = achievements
    .filter(achievement => 
      selectedCategory === 'all' || achievement.category === selectedCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const categories = [
    { id: 'all', label: 'All Achievements', icon: Star },
    { id: AchievementCategories.BUSINESS, label: 'Business', icon: TrendingUp },
    { id: AchievementCategories.FINANCIAL, label: 'Financial', icon: DollarSign },
    { id: AchievementCategories.PERSONAL, label: 'Personal', icon: Heart },
    { id: AchievementCategories.TEAM, label: 'Team', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Your Achievement Story
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="date">Sort by Date</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                selectedCategory === category.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </motion.button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        layout
      >
        <AnimatePresence>
          {filteredAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <AchievementCard achievement={achievement} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No achievements yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Keep working hard - your first achievement is just around the corner!
          </p>
        </motion.div>
      )}
    </div>
  );
};

// Achievement Progress Tracker
export const AchievementProgress = ({ currentGoals = [] }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Progress Towards Next Achievements
      </h3>
      
      {currentGoals.map((goal) => (
        <motion.div
          key={goal.id}
          className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {goal.title}
            </h4>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {goal.current}/{goal.target}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(goal.current / goal.target) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {goal.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

// Hook for managing achievements
export const useAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);

  const addAchievement = (achievementData) => {
    const newAchievement = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...achievementData
    };

    setAchievements(prev => [newAchievement, ...prev]);
    setCurrentNotification(newAchievement);
  };

  const generateNarrative = (type, data) => {
    const template = achievementTemplates[type];
    if (!template) return "Great job on your achievement!";

    const narratives = template.narratives;
    const selectedNarrative = narratives[Math.floor(Math.random() * narratives.length)];
    
    // Replace placeholders with actual data
    return selectedNarrative.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  };

  const clearNotification = () => {
    setCurrentNotification(null);
  };

  return {
    achievements,
    currentNotification,
    addAchievement,
    generateNarrative,
    clearNotification
  };
};