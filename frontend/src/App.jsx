import React from 'react';
import DashboardLayout from './components/layouts/DashboardLayout';
import { AdaptiveModeProvider } from './components/adaptive/AdaptiveModeContext';
import { CelebrationProvider } from './components/psychological/MicroCelebrations';

// Import the real components from their new, organized locations
import { MainDashboard } from './components/dashboard/MainDashboard';
import { AgentActivityTheater } from './components/theater/AgentActivityTheater';
import { BusinessPulseMonitor } from './components/dashboard/BusinessPulseMonitor';

import './App.css';

function App() {
  // The guide suggests a structure that passes the real components
  // directly to the DashboardLayout.
  // The 'activeView' state from the guide is not used in the final App.jsx example,
  // implying that the layout itself handles the display.
  // I will follow that final, simpler structure.

  return (
    <AdaptiveModeProvider>
      <CelebrationProvider>
        <DashboardLayout
          commandCenter={<MainDashboard />}
          actionTheater={<AgentActivityTheater />}
          opportunityHorizon={<BusinessPulseMonitor />}
        />
      </CelebrationProvider>
    </AdaptiveModeProvider>
  );
}

export default App;