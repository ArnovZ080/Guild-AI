import React, { createContext, useContext, useState } from 'react';

const CelebrationContext = createContext();

export const useCelebrations = () => {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebrations must be used within a CelebrationProvider');
  }
  return context;
};

export const CelebrationType = {
  TASK_COMPLETE: 'task_complete',
  MILESTONE: 'milestone',
  STREAK: 'streak',
  EFFICIENCY: 'efficiency',
  COLLABORATION: 'collaboration',
  BREAKTHROUGH: 'breakthrough'
};

export const CelebrationProvider = ({ children }) => {
  const [activeCelebrations, setActiveCelebrations] = useState([]);

  const triggerCelebration = (type, options = {}) => {
    const id = Date.now().toString();
    const celebration = {
      id,
      type,
      ...options,
      timestamp: new Date()
    };

    setActiveCelebrations(prev => [...prev, celebration]);

    // Auto-remove after duration
    const duration = options.duration || 2000;
    setTimeout(() => {
      setActiveCelebrations(prev => prev.filter(c => c.id !== id));
    }, duration);

    return id;
  };

  const removeCelebration = (id) => {
    setActiveCelebrations(prev => prev.filter(c => c.id !== id));
  };

  const clearAllCelebrations = () => {
    setActiveCelebrations([]);
  };

  const value = {
    activeCelebrations,
    triggerCelebration,
    removeCelebration,
    clearAllCelebrations
  };

  return (
    <CelebrationContext.Provider value={value}>
      {children}
    </CelebrationContext.Provider>
  );
};
