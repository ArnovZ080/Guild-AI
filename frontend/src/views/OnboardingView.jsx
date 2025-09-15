import React, { useState } from 'react';
import OnboardingAgent from '../components/onboarding/OnboardingAgent.jsx';
import GuildCapabilities from '../components/onboarding/GuildCapabilities.jsx';

const OnboardingView = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);

  const handleOnboardingComplete = (data) => {
    setOnboardingData(data);
    setShowCapabilities(true);
    
    // Store onboarding data in localStorage for persistence
    localStorage.setItem('guild_onboarding_data', JSON.stringify(data));
    localStorage.setItem('guild_onboarding_completed', 'true');
    
    // Here you would typically send this data to your backend
    console.log('Onboarding completed with data:', data);
  };

  const handleCapabilitiesComplete = () => {
    setIsCompleted(true);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-green-800 mb-4">
              Welcome to Guild! 🎉
            </h1>
            <p className="text-lg text-green-700 mb-6">
              Your onboarding is complete! You can now access your personalized dashboard.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showCapabilities) {
    return <GuildCapabilities onComplete={handleCapabilitiesComplete} />;
  }

  return <OnboardingAgent onComplete={handleOnboardingComplete} />;
};

export default OnboardingView;
