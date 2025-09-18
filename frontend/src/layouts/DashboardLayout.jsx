import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { SidebarNav } from '../navigation/SidebarNav.jsx';
// import { useAdaptiveMode } from '../contexts/AdaptiveModeContext.jsx';
import { cn } from '../lib/utils';

// Mock hook for now
const useAdaptiveMode = () => ({
  currentMode: 'active',
  timeOfDay: 'Afternoon',
});

const DashboardLayout = ({ commandCenter, actionTheater, opportunityHorizon }) => {
  const { currentMode, timeOfDay } = useAdaptiveMode();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const getLayoutClasses = () => {
    const baseClasses = "min-h-screen bg-gradient-to-br transition-all duration-1000";

    switch (currentMode) {
      case 'morning':
        return `${baseClasses} from-sky-100 via-white to-sky-100`;
      case 'active':
        return `${baseClasses} from-gray-50 via-slate-50 to-zinc-100`;
      case 'evening':
        return `${baseClasses} from-amber-50 via-orange-100 to-rose-100`;
      default:
        return `${baseClasses} from-gray-50 via-slate-50 to-zinc-100`;
    }
  };

  const getZoneSpacing = () => {
    switch (currentMode) {
      case 'morning': return 'gap-8';
      case 'active': return 'gap-4';
      case 'evening': return 'gap-6';
      default: return 'gap-6';
    }
  };

  return (
    <div className={getLayoutClasses()}>
      {/* <SidebarNav
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
      /> */}
      <motion.div
        className={cn(
          "grid grid-rows-[auto_1fr_auto] h-screen transition-all duration-300",
          sidebarExpanded ? "ml-64" : "ml-16", // Adjust based on sidebar
          getZoneSpacing(),
          "p-4 sm:p-6 lg:p-8"
        )}
        layout
      >
        {/* Zone 1: Command Center */}
        <motion.header
          className="command-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto">
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

        {/* Zone 2: Action Theater */}
        <motion.main
          className="action-theater flex-1 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="max-w-7xl mx-auto h-full">
            <motion.div
              className="h-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border shadow-xl"
              whileHover={{ scale: 1.002 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6 h-full">
                {actionTheater}
              </div>
            </motion.div>
          </div>
        </motion.main>

        {/* Zone 3: Opportunity Horizon */}
        <motion.footer
          className="opportunity-horizon"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="max-w-7xl mx-auto">
             {opportunityHorizon}
          </div>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
