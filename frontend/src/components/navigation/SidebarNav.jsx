import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BarChart3,
  Users,
  Settings,
  Zap,
  Target,
  TrendingUp,
  Brain,
  MessageSquare,
  Calendar,
  FileText,
  Sparkles
} from 'lucide-react';
import { cn } from '@/utils';
import { useAdaptiveMode } from '../adaptive/AdaptiveModeContext';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    category: 'primary',
    description: 'Your business overview'
  },
  {
    id: 'agents',
    label: 'AI Workforce',
    icon: Brain,
    category: 'primary',
    description: 'Manage your AI agents'
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: Zap,
    category: 'primary',
    description: 'Active campaigns & projects'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    category: 'primary',
    description: 'Performance insights'
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    category: 'secondary',
    description: 'Customer management'
  },
  {
    id: 'goals',
    label: 'Goals',
    icon: Target,
    category: 'secondary',
    description: 'Track objectives'
  },
  {
    id: 'growth',
    label: 'Growth',
    icon: TrendingUp,
    category: 'secondary',
    description: 'Expansion opportunities'
  },
  {
    id: 'conversations',
    label: 'Conversations',
    icon: MessageSquare,
    category: 'secondary',
    description: 'Agent interactions'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    category: 'utility',
    description: 'Schedule & deadlines'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    category: 'utility',
    description: 'Files & resources'
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Sparkles,
    category: 'utility',
    description: 'Your progress story'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    category: 'utility',
    description: 'Preferences & configuration'
  }
];

export const SidebarNav = ({ expanded, onExpandedChange, activeItem, onItemSelect }) => {
  const { currentMode } = useAdaptiveMode();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userPatterns, setUserPatterns] = useState({});

  // Simulate learning user patterns
  useEffect(() => {
    const patterns = {
      morning: ['dashboard', 'goals', 'calendar'],
      active: ['workflows', 'agents', 'analytics'],
      evening: ['achievements', 'analytics', 'growth']
    };
    setUserPatterns(patterns);
  }, []);

  const getSuggestedItems = () => {
    return userPatterns[currentMode] || [];
  };

  const getItemPriority = (itemId) => {
    const suggested = getSuggestedItems();
    if (suggested.includes(itemId)) return 'high';
    return 'normal';
  };

  const handleItemClick = (item) => {
    onItemSelect?.(item);
    // Track usage for pattern learning
    console.log(`Navigation: ${item.id} selected in ${currentMode} mode`);
  };

  const sidebarVariants = {
    collapsed: {
      width: 64,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    expanded: {
      width: 256,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const itemVariants = {
    collapsed: {
      justifyContent: "center",
      padding: "12px",
    },
    expanded: {
      justifyContent: "flex-start",
      padding: "12px 16px",
    }
  };

  const getItemClasses = (item) => {
    const isActive = activeItem === item.id;
    const isHovered = hoveredItem === item.id;
    const priority = getItemPriority(item.id);

    return cn(
      "relative flex items-center w-full rounded-lg transition-all duration-200 group cursor-pointer",
      "hover:bg-white/10 dark:hover:bg-slate-700/50",
      isActive && "bg-white/20 dark:bg-slate-700/70 shadow-lg",
      priority === 'high' && "ring-1 ring-blue-400/30 bg-blue-50/10",
      isHovered && "scale-105"
    );
  };

  const getIconClasses = (item) => {
    const isActive = activeItem === item.id;
    const priority = getItemPriority(item.id);

    return cn(
      "w-5 h-5 transition-all duration-200",
      isActive ? "text-blue-400" : "text-slate-600 dark:text-slate-300",
      priority === 'high' && "text-blue-500",
      "group-hover:text-blue-400 group-hover:scale-110"
    );
  };

  return (
    <motion.div
      className="fixed left-0 top-0 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/20 z-50 shadow-2xl"
      variants={sidebarVariants}
      animate={expanded ? "expanded" : "collapsed"}
      onHoverStart={() => !expanded && onExpandedChange(true)}
      onHoverEnd={() => expanded && onExpandedChange(false)}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand Area */}
        <motion.div
          className="p-4 border-b border-white/10 dark:border-slate-700/20"
          layout
        >
          <motion.div
            className="flex items-center gap-3"
            layout
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                    Guild AI
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your AI Workforce
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {/* Primary Navigation */}
            <div className="mb-6">
              {expanded && (
                <motion.p
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Primary
                </motion.p>
              )}
              {navigationItems
                .filter(item => item.category === 'primary')
                .map((item, index) => (
                  <motion.div
                    key={item.id}
                    className={getItemClasses(item)}
                    variants={itemVariants}
                    animate={expanded ? "expanded" : "collapsed"}
                    onHoverStart={() => setHoveredItem(item.id)}
                    onHoverEnd={() => setHoveredItem(null)}
                    onClick={() => handleItemClick(item)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className={getIconClasses(item)} />
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          className="ml-3 flex-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                        >
                          <div className="font-medium text-slate-700 dark:text-slate-200">
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Priority Indicator */}
                    {getItemPriority(item.id) === 'high' && (
                      <motion.div
                        className="absolute -right-1 -top-1 w-3 h-3 bg-blue-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                ))}
            </div>

            {/* Secondary Navigation */}
            <div className="mb-6">
              {expanded && (
                <motion.p
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Workspace
                </motion.p>
              )}
              {navigationItems
                .filter(item => item.category === 'secondary')
                .map((item, index) => (
                  <motion.div
                    key={item.id}
                    className={getItemClasses(item)}
                    variants={itemVariants}
                    animate={expanded ? "expanded" : "collapsed"}
                    onHoverStart={() => setHoveredItem(item.id)}
                    onHoverEnd={() => setHoveredItem(null)}
                    onClick={() => handleItemClick(item)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className={getIconClasses(item)} />
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          className="ml-3 flex-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                        >
                          <div className="font-medium text-slate-700 dark:text-slate-200">
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </div>

            {/* Utility Navigation */}
            <div>
              {expanded && (
                <motion.p
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Tools
                </motion.p>
              )}
              {navigationItems
                .filter(item => item.category === 'utility')
                .map((item, index) => (
                  <motion.div
                    key={item.id}
                    className={getItemClasses(item)}
                    variants={itemVariants}
                    animate={expanded ? "expanded" : "collapsed"}
                    onHoverStart={() => setHoveredItem(item.id)}
                    onHoverEnd={() => setHoveredItem(null)}
                    onClick={() => handleItemClick(item)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className={getIconClasses(item)} />
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          className="ml-3 flex-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                        >
                          <div className="font-medium text-slate-700 dark:text-slate-200">
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        {/* Mode Indicator */}
        <motion.div
          className="p-4 border-t border-white/10 dark:border-slate-700/20"
          layout
        >
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-center"
              >
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Current Mode
                </div>
                <div className={cn(
                  "text-sm font-medium capitalize",
                  currentMode === 'morning' && "text-blue-600 dark:text-blue-400",
                  currentMode === 'active' && "text-emerald-600 dark:text-emerald-400",
                  currentMode === 'evening' && "text-amber-600 dark:text-amber-400"
                )}>
                  {currentMode}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};
