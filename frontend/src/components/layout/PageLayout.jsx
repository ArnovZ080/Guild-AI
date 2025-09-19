import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PersistentSidebar from '../navigation/PersistentSidebar';

const PageLayout = ({ children, currentView, onNavigate }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Persistent Sidebar */}
      <PersistentSidebar
        currentView={currentView}
        onNavigate={onNavigate}
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          className="h-full overflow-y-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default PageLayout;

