import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Zap, 
  Calendar, 
  Target, 
  Trophy, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Grid3X3
} from 'lucide-react';

const PersistentSidebar = ({ 
  currentView, 
  onNavigate, 
  expanded, 
  onExpandedChange 
}) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
    { id: 'marketplace', label: 'Agents', icon: Zap, color: 'text-purple-600' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-green-600' },
    { id: 'goals', label: 'Goals', icon: Target, color: 'text-orange-600' },
    { id: 'achievements', label: 'Achievements', icon: Trophy, color: 'text-yellow-600' },
    { id: 'growth', label: 'Growth', icon: TrendingUp, color: 'text-emerald-600' },
    { id: 'customers', label: 'Customers', icon: Users, color: 'text-cyan-600' },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare, color: 'text-indigo-600' },
    { id: 'connectors', label: 'Connectors', icon: Settings, color: 'text-gray-600' }
  ];

  return (
    <motion.div
      className={`${expanded ? 'w-64' : 'w-16'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 shadow-lg`}
      initial={{ width: expanded ? 256 : 64 }}
      animate={{ width: expanded ? 256 : 64 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {expanded && (
              <motion.h2 
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                Guild AI
              </motion.h2>
            )}
          </AnimatePresence>
          <button
            onClick={() => onExpandedChange(!expanded)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {expanded ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`w-5 h-5 ${isActive ? item.color : ''}`} />
                <AnimatePresence>
                  {expanded && (
                    <motion.span 
                      className="ml-3 text-sm font-medium"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quick Chat Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <motion.button
          onClick={() => onNavigate('chat')}
          className={`w-full ${expanded ? 'px-3 py-2' : 'p-2'} bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-all duration-200`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <MessageSquare className="w-5 h-5" />
          <AnimatePresence>
            {expanded && (
              <motion.span 
                className="ml-3 text-sm font-medium"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                Chat
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`${expanded ? 'flex items-center' : 'flex justify-center'}`}>
          <div className="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-medium">
            AV
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div 
                className="ml-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Arno van Zyl</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Free Plan</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default PersistentSidebar;
