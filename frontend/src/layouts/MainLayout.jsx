import React, { useState } from 'react';

// Placeholders for components to be created later
const CommandCenter = () => <div className="p-4"><h2 className="text-xl font-bold">Command Center</h2></div>;
const ActionTheater = () => <div className="p-4"><h2 className="text-xl font-bold">Action Theater</h2></div>;
const AchievementCelebration = () => <div className="absolute bottom-4 right-4">Achievement Placeholder</div>;
const StressReductionInterface = () => <div className="absolute top-20 right-4">Stress Placeholder</div>;


const MainLayout = () => {
  const [selectedZone, setSelectedZone] = useState('overview');

  const renderContent = () => {
    switch (selectedZone) {
      case 'overview':
        return (
          <div
            key="overview"
            style={{ opacity: 1, transform: 'none' }}
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
          </div>
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
                <div
                  className="absolute inset-0 bg-gray-700 rounded-md"

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
