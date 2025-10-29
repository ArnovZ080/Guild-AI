import React from 'react';
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
  ChevronRight
} from 'lucide-react';
import { loadConversations } from '../../services/conversationsStore.js';

export const PersistentSidebar = ({ 
  currentPath,
  onNavigate,
  expanded,
  onExpandedChange,
  recentConversationsLabel
}) => {
  const dashboards = [
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare, path: '/chat' },
    { id: 'business', label: 'Business Dashboard', icon: Home, path: '/dashboard' },
    { id: 'agents', label: 'Agent Dashboard', icon: Zap, path: '/agents' },
  ];

  const utilities = [
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
    { id: 'growth', label: 'Growth', icon: TrendingUp, path: '/growth' },
    { id: 'achievements', label: 'Achievements', icon: Trophy, path: '/achievements' },
    { id: 'goals', label: 'Goals', icon: Target, path: '/goals' },
    { id: 'documents', label: 'Documents', icon: MessageSquare, path: '/documents' },
    { id: 'connectors', label: 'Connectors', icon: Settings, path: '/connectors' },
  ];

  const isActive = (path) => (currentPath || '').startsWith(path);
  const navigate = (path) => onNavigate ? onNavigate(path) : (window.location.href = path);
  const recent = loadConversations().slice(0, 6);

  return (
    <motion.aside
      className={`${expanded ? 'w-64' : 'w-16'} fixed left-0 top-0 bottom-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 z-40`}
      initial={{ width: expanded ? 256 : 64 }}
      animate={{ width: expanded ? 256 : 64 }}
      onMouseEnter={() => onExpandedChange?.(true)}
      onMouseLeave={() => onExpandedChange?.(false)}
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
            onClick={() => onExpandedChange?.(!expanded)}
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

      {/* Recent Conversations Section */}
      <div className="px-2 py-3 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/chat')}
          className={`w-full ${expanded ? 'px-3 py-2' : 'p-2'} bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-all duration-200 mb-2`}
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
        </button>
        <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Recent Conversations</div>
        <div className="space-y-1">
          {recent.map(c => (
            <button
              key={c.id}
              onClick={() => navigate('/chat')}
              className={`w-full text-left ${expanded ? 'px-2 py-1.5' : 'p-1.5'} rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
              title={c.title}
            >
              <div className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{c.title}</div>
              {expanded && (
                <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{c.preview}</div>
              )}
            </button>
          ))}
          {recent.length === 0 && (
            <div className="text-[11px] text-gray-500 dark:text-gray-400">No conversations yet</div>
          )}
        </div>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-3 mb-2 text-[11px] uppercase tracking-wide text-gray-400">Dashboards</div>
        <div className="space-y-1 px-2">
          {dashboards.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center rounded-lg transition-all duration-200 ${expanded ? 'px-3 py-2' : 'py-2 justify-center'} ${
                  active 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`${expanded ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0 ${expanded ? '' : 'mx-auto'}`} />
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

        <div className="px-3 mt-4 mb-2 text-[11px] uppercase tracking-wide text-gray-400">Workspace</div>
        <div className="space-y-1 px-2">
          {utilities.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center rounded-lg transition-all duration-200 ${expanded ? 'px-3 py-2' : 'py-2 justify-center'} ${
                  active 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`${expanded ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0 ${expanded ? '' : 'mx-auto'}`} />
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

        {/* Divider and Settings */}
        <div className="px-2">
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-3" />
          {(() => {
            const item = { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' };
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center rounded-lg transition-all duration-200 ${expanded ? 'px-3 py-2' : 'py-2 justify-center'} ${
                  active 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`${expanded ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0 ${expanded ? '' : 'mx-auto'}`} />
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
          })()}
        </div>
      </div>

      {/* Footer spacing */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700" />
    </motion.aside>
  );
};

export default PersistentSidebar;


