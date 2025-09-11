import React, { createContext, useContext, useState, useEffect } from 'react';

const AdaptiveModeContext = createContext();

export const useAdaptiveMode = () => {
  const context = useContext(AdaptiveModeContext);
  if (!context) {
    throw new Error('useAdaptiveMode must be used within an AdaptiveModeProvider');
  }
  return context;
};

export const AdaptiveModeProvider = ({ children }) => {
  const [currentMode, setCurrentMode] = useState('morning');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [userPreferences, setUserPreferences] = useState({
    autoMode: true,
    manualMode: null,
    workingHours: { start: 9, end: 17 },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Determine mode based on time of day
  const determineMode = () => {
    const now = new Date();
    const hour = now.getHours();

    // Update time of day string
    if (hour < 12) {
      setTimeOfDay('Morning');
    } else if (hour < 17) {
      setTimeOfDay('Afternoon');
    } else {
      setTimeOfDay('Evening');
    }

    // Don't auto-switch if user has manually set a mode
    if (!userPreferences.autoMode && userPreferences.manualMode) {
      setCurrentMode(userPreferences.manualMode);
      return;
    }

    // Auto-determine mode based on time
    if (hour >= 6 && hour < 12) {
      setCurrentMode('morning');
    } else if (hour >= 12 && hour < 18) {
      setCurrentMode('active');
    } else {
      setCurrentMode('evening');
    }
  };

  // Update mode every minute
  useEffect(() => {
    determineMode();
    const interval = setInterval(determineMode, 60000);
    return () => clearInterval(interval);
  }, [userPreferences]);

  const setManualMode = (mode) => {
    setUserPreferences(prev => ({
      ...prev,
      autoMode: false,
      manualMode: mode
    }));
    setCurrentMode(mode);
  };

  const enableAutoMode = () => {
    setUserPreferences(prev => ({
      ...prev,
      autoMode: true,
      manualMode: null
    }));
    determineMode();
  };

  const getModeConfig = (mode) => {
    const configs = {
      morning: {
        name: 'Morning Briefing',
        description: 'Start your day with clarity and purpose',
        colors: {
          primary: 'blue',
          background: 'from-sky-50 via-blue-50 to-indigo-50',
          text: 'text-blue-900',
          accent: 'text-blue-600'
        },
        spacing: 'relaxed',
        emphasis: ['priorities', 'opportunities', 'planning'],
        hiddenElements: ['detailed-analytics', 'complex-workflows'],
        prominentElements: ['goals', 'calendar', 'inspiration']
      },
      active: {
        name: 'Active Management',
        description: 'Real-time operational intelligence',
        colors: {
          primary: 'emerald',
          background: 'from-emerald-50 via-teal-50 to-cyan-50',
          text: 'text-emerald-900',
          accent: 'text-emerald-600'
        },
        spacing: 'compact',
        emphasis: ['current-tasks', 'agent-status', 'immediate-actions'],
        hiddenElements: ['reflection', 'long-term-planning'],
        prominentElements: ['workflows', 'real-time-data', 'quick-actions']
      },
      evening: {
        name: 'Evening Reflection',
        description: 'Celebrate progress and plan ahead',
        colors: {
          primary: 'amber',
          background: 'from-amber-50 via-orange-50 to-rose-50',
          text: 'text-amber-900',
          accent: 'text-amber-600'
        },
        spacing: 'comfortable',
        emphasis: ['achievements', 'insights', 'tomorrow-prep'],
        hiddenElements: ['urgent-tasks', 'real-time-alerts'],
        prominentElements: ['analytics', 'achievements', 'planning']
      }
    };
    return configs[mode] || configs.morning;
  };

  const value = {
    currentMode,
    timeOfDay,
    userPreferences,
    setManualMode,
    enableAutoMode,
    getModeConfig,
    isAutoMode: userPreferences.autoMode
  };

  return (
    <AdaptiveModeContext.Provider value={value}>
      {children}
    </AdaptiveModeContext.Provider>
  );
};
