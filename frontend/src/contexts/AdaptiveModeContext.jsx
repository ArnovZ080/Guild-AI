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
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState('');

  // Update time of day display
  useEffect(() => {
    const updateTimeOfDay = () => {
      const now = new Date();
      const hour = now.getHours();
      
      let mode;
      if (hour >= 6 && hour < 12) {
        mode = 'morning';
        setTimeOfDay('Morning');
      } else if (hour >= 12 && hour < 18) {
        mode = 'active';
        setTimeOfDay('Afternoon');
      } else {
        mode = 'evening';
        setTimeOfDay('Evening');
      }

      if (autoModeEnabled && mode !== currentMode) {
        setCurrentMode(mode);
      }
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [autoModeEnabled, currentMode]);

  const setManualMode = (mode) => {
    setCurrentMode(mode);
    setAutoModeEnabled(false);
  };

  const toggleAutoMode = () => {
    setAutoModeEnabled(!autoModeEnabled);
    if (!autoModeEnabled) {
      // Re-enable auto mode and set current time-based mode
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) {
        setCurrentMode('morning');
      } else if (hour >= 12 && hour < 18) {
        setCurrentMode('active');
      } else {
        setCurrentMode('evening');
      }
    }
  };

  const getModeDescription = (mode) => {
    const descriptions = {
      morning: 'Calm, energizing blues for focused planning',
      active: 'Vibrant greens for dynamic productivity',
      evening: 'Warm oranges for reflection and relaxation'
    };
    return descriptions[mode] || descriptions.morning;
  };

  const getModeColors = (mode) => {
    const colorSets = {
      morning: {
        primary: 'from-blue-500 to-indigo-600',
        secondary: 'bg-blue-50 dark:bg-blue-950/50',
        text: 'text-blue-900 dark:text-blue-100',
        border: 'border-blue-200 dark:border-blue-800',
        background: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950'
      },
      active: {
        primary: 'from-emerald-500 to-teal-600',
        secondary: 'bg-emerald-50 dark:bg-emerald-950/50',
        text: 'text-emerald-900 dark:text-emerald-100',
        border: 'border-emerald-200 dark:border-emerald-800',
        background: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950 dark:to-teal-950'
      },
      evening: {
        primary: 'from-amber-500 to-orange-600',
        secondary: 'bg-amber-50 dark:bg-amber-950/50',
        text: 'text-amber-900 dark:text-amber-100',
        border: 'border-amber-200 dark:border-amber-800',
        background: 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-amber-950 dark:to-orange-950'
      }
    };
    return colorSets[mode] || colorSets.morning;
  };

  const value = {
    currentMode,
    timeOfDay,
    autoModeEnabled,
    setManualMode,
    toggleAutoMode,
    getModeDescription,
    getModeColors
  };

  return (
    <AdaptiveModeContext.Provider value={value}>
      {children}
    </AdaptiveModeContext.Provider>
  );
};

export default AdaptiveModeContext;
