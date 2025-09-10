import React, { useState } from 'react';
import { MainDashboard } from './components/MainDashboard';
import OnboardingFlow from './components/OnboardingFlow.jsx'; // Import the OnboardingFlow component
import './App.css';

function App() {
  // State to track whether the user has completed the onboarding process.
  // In a real application, this would likely be persisted in localStorage or fetched from a user profile API.
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // This function will be passed to the OnboardingFlow component and called when it's finished.
  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
  };

  return (
    <div className="App">
      {isOnboardingComplete ? (
        <MainDashboard />
      ) : (
        <OnboardingFlow onOnboardingComplete={handleOnboardingComplete} />
      )}
    </div>
  );
}

export default App;
