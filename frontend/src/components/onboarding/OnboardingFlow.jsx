import React from 'react';
import EnhancedOnboardingContainer from './EnhancedOnboardingContainer';

const OnboardingFlow = ({ onComplete }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950">
      <EnhancedOnboardingContainer onComplete={onComplete} />
    </div>
  );
};

export default OnboardingFlow;
