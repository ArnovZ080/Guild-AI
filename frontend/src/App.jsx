import React, { useState } from 'react';
import OnboardingFlow from './components/OnboardingFlow';
import MainLayout from './layouts/MainLayout';

import './App.css';

function App() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // For development and review, we'll bypass the onboarding flow for now.
  // This allows direct access to the new UI layout.
  const showOnboarding = false;

  if (showOnboarding && !isOnboardingComplete) {
    return <OnboardingFlow onOnboardingComplete={() => setIsOnboardingComplete(true)} />;
  }

  // Render the main application layout
  return (
    <MainLayout />
  );
}

export default App;
