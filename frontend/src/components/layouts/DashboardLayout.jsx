import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarNav } from '../navigation/SidebarNav.jsx';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext.jsx';
import { cn } from '../../lib/utils';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { currentMode, getTimeBasedGreeting } = useAdaptiveMode();
  const { settings } = useSettings();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get active item from current route
  const activeItem = location.pathname.substring(1) || 'dashboard';

  // Dynamic layout adjustments based on adaptive mode
  const getLayoutClasses = () => {
    const baseClasses = "min-h-screen transition-all duration-1000";
    
    switch (currentMode) {
      case 'morning':
        return `${baseClasses} bg-gradient-dawn`;
      case 'active':
        return `${baseClasses} bg-gradient-growth`;
      case 'evening':
        return `${baseClasses} bg-gradient-to-br from-earth-sand via-warning-warm to-warning-glow dark:from-amber-900 dark:via-orange-950 dark:to-rose-950`;
      default:
        return `${baseClasses} bg-gradient-calm`;
    }
  };

  const isChat = location.pathname === '/chat';
  return (
    <div className={isChat ? 'min-h-screen' : getLayoutClasses()}>
      {/* Navigation Sidebar */}
      <SidebarNav 
        expanded={sidebarExpanded} 
        onExpandedChange={setSidebarExpanded}
        activeItem={activeItem}
        onItemSelect={(item) => {
          navigate(`/${item.id}`);
          console.log(`Selected: ${item.label}`);
        }}
      />

      {/* Main Content Area */}
      <motion.div 
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarExpanded ? "ml-64" : "ml-16"
        )}
        layout
      >
        {/* Header */}
        {!isChat && (
        <motion.section 
          className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div>
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
                  {getTimeBasedGreeting()} {settings?.profile?.firstName ? `, ${settings.profile.firstName}` : ''} • {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              {/* Right header area: avatar + sidebar toggle */}
              <div className="flex items-center gap-3">
                {settings?.profile?.profilePictureUrl && (
                  <img src={settings.profile.profilePictureUrl} alt="Me" className="w-8 h-8 rounded-full object-cover border" />
                )}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="p-2 rounded-lg bg-white/80 hover:bg-white transition-colors shadow-sm"
                  title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.section>
        )}

        {/* Main Content */}
        <motion.main 
          className={isChat ? "p-0" : "p-6"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <div className={isChat ? "" : "max-w-7xl mx-auto"}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;