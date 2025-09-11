import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarNav } from '../navigation/SidebarNav';
import { AdaptiveModeProvider, useAdaptiveMode } from '../adaptive/AdaptiveModeContext';
import { cn } from '@/utils';

const DashboardLayout = ({ children, commandCenter, actionTheater, opportunityHorizon }) => {
  const { currentMode, timeOfDay } = useAdaptiveMode();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Dynamic layout adjustments based on adaptive mode
  const getLayoutClasses = () => {
    const baseClasses = "min-h-screen bg-gradient-to-br transition-all duration-1000";

    switch (currentMode) {
      case 'morning':
        return `${baseClasses} from-sky-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950`;
      case 'active':
        return `${baseClasses} from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950 dark:to-teal-950`;
      case 'evening':
        return `${baseClasses} from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-amber-950 dark:to-orange-950`;
      default:
        return `${baseClasses} from-gray-50 via-slate-50 to-zinc-50 dark:from-slate-900 dark:via-slate-950 dark:to-zinc-950`;
    }
  };

  const getZoneSpacing = () => {
    switch (currentMode) {
      case 'morning':
        return 'gap-8'; // More breathing room for calm focus
      case 'active':
        return 'gap-4'; // Tighter spacing for efficiency
      case 'evening':
        return 'gap-6'; // Moderate spacing for reflection
      default:
        return 'gap-6';
    }
  };

  return (
    <AdaptiveModeProvider>
      <div className={getLayoutClasses()}>
        {/* Invisible Navigation Sidebar */}
        <SidebarNav
          expanded={sidebarExpanded}
          onExpandedChange={setSidebarExpanded}
        />

        {/* Main Content Grid */}
        <motion.div
          className={cn(
            "grid grid-rows-[auto_1fr_auto] h-screen transition-all duration-300",
            sidebarExpanded ? "ml-64" : "ml-16",
            getZoneSpacing()
          )}
          layout
        >
          {/* Zone 1: Command Center (Top Third) */}
          <motion.section
            className="command-center p-6 overflow-hidden"
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
                  currentMode === 'morning' && "text-blue-900 dark:text-blue-100",
                  currentMode === 'active' && "text-emerald-900 dark:text-emerald-100",
                  currentMode === 'evening' && "text-amber-900 dark:text-amber-100"
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
          </motion.section>

          {/* Zone 2: Action Theater (Middle Third) */}
          <motion.section
            className="action-theater flex-1 p-6 overflow-auto"
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
          </motion.section>

          {/* Zone 3: Opportunity Horizon (Bottom Third) */}
          <motion.section
            className="opportunity-horizon p-6"
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
          </motion.section>
        </motion.div>

        {/* Ambient Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-200/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-emerald-200/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>
      </div>
    </AdaptiveModeProvider>
  );
};

export default DashboardLayout;
