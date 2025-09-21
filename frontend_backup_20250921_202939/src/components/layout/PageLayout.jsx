import React, { useState } from 'react';
// import { motion } from '../common/AnimationWrapper'; // Removed to fix circular reference
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
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;

