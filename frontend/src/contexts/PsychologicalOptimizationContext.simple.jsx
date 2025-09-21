import React, { createContext, useContext, useState } from 'react';

const PsychologicalOptimizationContext = createContext();

export const usePsychologicalOptimization = () => {
  const context = useContext(PsychologicalOptimizationContext);
  if (!context) {
    throw new Error('usePsychologicalOptimization must be used within a PsychologicalOptimizationProvider');
  }
  return context;
};

export const PsychologicalOptimizationProvider = ({ children }) => {
  // Simplified state without complex interdependencies
  const [userProfile, setUserProfile] = useState({
    businessType: null,
    workingStyle: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [adaptiveInterface, setAdaptiveInterface] = useState({
    currentMode: 'morning',
    autoModeEnabled: true
  });

  // Simple context value without complex functions
  const contextValue = {
    userProfile,
    setUserProfile,
    adaptiveInterface,
    setAdaptiveInterface,
    // Simple functions without circular dependencies
    updateUserProfile: (updates) => {
      setUserProfile(prev => ({ ...prev, ...updates }));
    },
    updateAdaptiveInterface: (updates) => {
      setAdaptiveInterface(prev => ({ ...prev, ...updates }));
    }
  };

  return (
    <PsychologicalOptimizationContext.Provider value={contextValue}>
      {children}
    </PsychologicalOptimizationContext.Provider>
  );
};
