import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CommandCenter from '../components/dashboard/CommandCenter.jsx';
import ActionTheater from '../components/theater/ActionTheater.jsx';
import AchievementCelebration from '../components/psychology/AchievementCelebration.jsx';
import StressReductionInterface from '../components/psychology/StressReductionInterface.jsx';


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
            <header className="h-1/3 bg-gray-800 p-4 shadow-lg z-10 overflow-y-auto">
              <CommandCenter />
            </header>
            <section className="h-1/3 bg-gray-700 p-4">
              <ActionTheater />
            </section>
            <footer className="h-1/3 bg-gray-800 p-4 border-t border-gray-700">
              <h2 className="text-lg font-semibold">Zone 3: Opportunity Horizon</h2>
            </footer>
          </motion.div>
        );
      default:
        return <div className="p-6"><h1 className="text-2xl font-bold">{selectedZone.charAt(0).toUpperCase() + selectedZone.slice(1)} Zone</h1></div>;

    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="bg-gray-900 shadow-sm border-b border-gray-700 px-6 py-4 flex items-center justify-between z-20">
        <div>
          <h1 className="text-xl font-bold text-white">Guild AI</h1>
        </div>

        <div className="flex bg-gray-800 rounded-lg p-1">
          {['overview', 'detail', 'action'].map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-all capitalize relative \${selectedZone === zone ? 'text-white' : 'text-gray-400 hover:text-white'}`}
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

      <AchievementCelebration />
      <div className="absolute top-20 right-4 z-40">
        <StressReductionInterface />
      </div>

    </div>
  );
};

export default MainLayout;
