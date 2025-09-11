import React, { useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { AdaptiveModeProvider } from '@/components/adaptive/AdaptiveModeContext';
import { CelebrationProvider } from '@/components/psychological/MicroCelebrations';
import { MainDashboard } from '@/components/MainDashboard';
import { AgentActivityTheater } from '@/components/AgentActivityTheater';
import { BusinessPulseMonitor } from '@/components/BusinessPulseMonitor';
import OnboardingFlow from '@/components/OnboardingFlow.jsx';
import './App.css';

function App() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
  };

  return (
    <div className="App">
      {isOnboardingComplete ? (
        <AdaptiveModeProvider>
          <CelebrationProvider>
            <DashboardLayout
              commandCenter={<BusinessPulseMonitor />}
              actionTheater={<AgentActivityTheater />}
              opportunityHorizon={<div>Opportunity Horizon</div>}
            >
              <MainDashboard />
            </DashboardLayout>
          </CelebrationProvider>
        </AdaptiveModeProvider>
      ) : (
        <OnboardingFlow onOnboardingComplete={handleOnboardingComplete} />
      )}
    </div>
  );
}

export default App;
