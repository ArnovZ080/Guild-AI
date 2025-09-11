import React, { useState } from 'react';
import DashboardLayout from './components/layouts/DashboardLayout';
import { AdaptiveModeProvider } from './components/adaptive/AdaptiveModeContext';
import { CelebrationProvider } from './components/psychological/MicroCelebrations';
import './App.css';

function App() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true); // Start with dashboard

  // Placeholder components for demo
  const CommandCenter = () => (
    <div className="p-6 bg-white/20 rounded-lg backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4">Command Center</h2>
      <p>Your business overview and key metrics would appear here.</p>
    </div>
  );

  const ActionTheater = () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Action Theater</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Agent activities and workflows will be displayed here.
        </p>
      </div>
    </div>
  );

  const OpportunityHorizon = () => (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-2">Opportunity Horizon</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Future opportunities and growth insights.
      </p>
    </div>
  );

  return (
    <AdaptiveModeProvider>
      <CelebrationProvider>
        <DashboardLayout
          commandCenter={<CommandCenter />}
          actionTheater={<ActionTheater />}
          opportunityHorizon={<OpportunityHorizon />}
        />
      </CelebrationProvider>
    </AdaptiveModeProvider>
  );
}

export default App;