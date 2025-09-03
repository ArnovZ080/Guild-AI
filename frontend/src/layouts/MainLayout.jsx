import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CommandCenter from '../components/dashboard/CommandCenter';
import ActionTheater from '../components/theater/ActionTheater';

const MainLayout = () => {
  const [selectedZone, setSelectedZone] = useState('overview');

  const renderContent = () => {
    switch (selectedZone) {
      case 'overview':
        return (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col h-full"
          >
            {/* Zone 1: Command Center */}
            <header className="h-1/3 bg-gray-800 p-4 shadow-lg z-10 overflow-y-auto">
              <CommandCenter />
            </header>
            {/* Zone 2: Action Theater */}
            <section className="h-1/3 bg-gray-700 p-4">
              <ActionTheater />
            </section>
            {/* Zone 3: Opportunity Horizon */}
            <footer className="h-1/3 bg-gray-800 p-4 border-t border-gray-700">
              <h2 className="text-lg font-semibold">Zone 3: Opportunity Horizon</h2>
              {/* Suggestion cards will go here */}
            </footer>
          </motion.div>
        );
      case 'detail':
        return (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6"
          >
            <h1 className="text-2xl font-bold">Detail Zone</h1>
            <p>Detailed analytics and views will go here.</p>
          </motion.div>
        );
      case 'action':
        return (
          <motion.div
            key="action"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6"
          >
            <h1 className="text-2xl font-bold">Action Zone</h1>
            <p>Quick actions and direct agent triggers will go here.</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="bg-gray-900 shadow-sm border-b border-gray-700 px-6 py-4 flex items-center justify-between z-20">
        <div>
          <h1 className="text-xl font-bold text-white">Guild AI</h1>
        </div>

        {/* Zone Selector */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          {['overview', 'detail', 'action'].map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-all capitalize relative ${
                selectedZone === zone ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {selectedZone === zone && (
                <motion.div
                  className="absolute inset-0 bg-gray-700 rounded-md"
                  layoutId="activeZone"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{zone}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="flex-grow overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default MainLayout;
