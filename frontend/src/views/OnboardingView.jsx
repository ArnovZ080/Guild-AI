import React, { useState } from 'react';
import OnboardingContainer from '../components/onboarding/OnboardingContainer.jsx';
import onboardingFollowUpService from '../services/onboardingFollowUpService.js';

const OnboardingView = () => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleOnboardingComplete = (data) => {
    // Store onboarding data in localStorage for persistence
    // generate follow-ups and persist enriched data
    const result = onboardingFollowUpService.processOnboardingCompletion(data);
    if (!result?.followUpQuestions?.length) {
      localStorage.setItem('guild_onboarding_data', JSON.stringify(data));
    }
    localStorage.setItem('guild_onboarding_completed', 'true');
    
    // Here you would typically send this data to your backend
    console.log('Onboarding completed with data:', data);
    
    // Send to orchestrator agent for task creation
    if (window.guildOrchestrator) {
      window.guildOrchestrator.initializeUserProfile(data);
    }
    
    setIsCompleted(true);
  };

  if (isCompleted) {
    // Redirect immediately to dashboard/chat after completion
    window.location.href = '/dashboard';
    return null;
  }

  return <OnboardingContainer onComplete={handleOnboardingComplete} />;
};

export default OnboardingView;
