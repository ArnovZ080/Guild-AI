import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PersistentSidebar from '../components/navigation/PersistentSidebar.jsx';
import { useAdaptiveMode } from '../contexts/AdaptiveModeContext.jsx';
import { cn } from '../lib/utils';

const DashboardLayout = ({ commandCenter, actionTheater, opportunityHorizon }) => {
  const { currentMode, timeOfDay } = useAdaptiveMode();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const getLayoutClasses = () => {
    const baseClasses = "min-h-screen bg-gradient-to-br transition-all duration-1000";

    switch (currentMode) {
      case 'morning':
        return `${baseClasses} from-sky-dawn via-sky-morning to-sky-day dark:from-sky-night dark:via-blue-950 dark:to-indigo-950`;
      case 'active':
        return `${baseClasses} from-forest-mist via-forest-spring to-forest-growth dark:from-forest-shadow dark:via-emerald-950 dark:to-teal-950`;
      case 'evening':
        return `${baseClasses} from-amber-200 via-orange-300 to-rose-300 dark:from-slate-900 dark:via-amber-950 dark:to-orange-950`;

      default:
        return `${baseClasses} from-gray-50 via-slate-50 to-zinc-50 dark:from-slate-900 dark:via-slate-950 dark:to-zinc-950`;
    }
  };

  const getZoneSpacing = () => {
    switch (currentMode) {
      case 'morning':
        return 'gap-8';
      case 'active':
        return 'gap-4';
      case 'evening':
        return 'gap-6';
      default:
        return 'gap-6';
    }
  };

  return (
    <div className={getLayoutClasses()}>
      <PersistentSidebar
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
        currentPath={typeof window !== 'undefined' ? window.location.pathname : ''}
      />
      <motion.div
        className={cn(
          "grid grid-rows-[auto_1fr_auto] h-screen transition-all duration-300",
          sidebarExpanded ? "ml-64" : "ml-16",
          getZoneSpacing(),
          "p-4 sm:p-6 lg:p-8"
        )}
        layout
      >
        {/* Zone 1: Command Center (Top Third) */}
        <motion.header
          className="command-center p-6"

          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className={cn(
                "text-3xl font-bold transition-colors duration-500",
                currentMode === 'morning' && "text-sky-night dark:text-sky-dawn",
                currentMode === 'active' && "text-forest-deep dark:text-forest-spring",
                currentMode === 'evening' && "text-orange-900 dark:text-amber-200"

              )}>
                {currentMode === 'morning' && "Good Morning - Your Business Awaits"}
                {currentMode === 'active' && "Active Management - Full Speed Ahead"}
                {currentMode === 'evening' && "Evening Reflection - Today's Achievements"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {timeOfDay} • {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentMode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                {commandCenter}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.header>

        {/* Zone 2: Action Theater (Middle Third) */}
        <motion.main
          className="action-theater flex-1 overflow-auto"

          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="max-w-7xl mx-auto h-full">
            <motion.div
              className="h-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-xl"
              whileHover={{ scale: 1.002 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6 h-full">
                {actionTheater}
              </div>
            </motion.div>
          </div>
        </motion.main>

        {/* Zone 3: Opportunity Horizon (Bottom Third) */}
        <motion.footer
          className="opportunity-horizon"

          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="bg-gradient-to-r from-white/30 to-white/10 dark:from-slate-800/30 dark:to-slate-800/10 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/20 p-4"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              {opportunityHorizon}
            </motion.div>
          </div>
        </motion.footer>
      </motion.div>

  );
};

export default DashboardLayout;
