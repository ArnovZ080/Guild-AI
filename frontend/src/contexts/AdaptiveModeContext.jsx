import React, { createContext, useContext, useState, useEffect } from 'react';

const AdaptiveModeContext = createContext();

export const useAdaptiveMode = () => {
  const context = useContext(AdaptiveModeContext);
  if (!context) {
    throw new Error('useAdaptiveMode must be used within an AdaptiveModeProvider');
  }
  return context;
};

const modeConfigs = {
  morning: {
    name: 'Morning Focus',
    description: 'Start your day with clarity and purpose. Let\'s plan your priorities and set the tone for success.',
    colors: {
      background: 'from-blue-50 via-indigo-50 to-purple-50',
      text: 'text-indigo-900',
      accent: 'from-blue-500 to-indigo-600'
    },
    focus: 'planning',
    widgets: ['momentum', 'opportunities', 'financial', 'pulse'],
    greeting: 'Good morning! Ready to make today amazing? 🌅',
    suggestions: [
      'Review yesterday\'s progress',
      'Set today\'s top 3 priorities',
      'Check new opportunities',
      'Plan your content strategy'
    ]
  },
  active: {
    name: 'Active Work',
    description: 'You\'re in the zone! Let\'s maximize your productivity and tackle those important tasks.',
    colors: {
      background: 'from-emerald-50 via-teal-50 to-cyan-50',
      text: 'text-emerald-900',
      accent: 'from-emerald-500 to-teal-600'
    },
    focus: 'execution',
    widgets: ['agents', 'financial', 'customers', 'pulse'],
    greeting: 'You\'re crushing it! Let\'s keep this momentum going! ⚡',
    suggestions: [
      'Check agent progress',
      'Review customer feedback',
      'Monitor campaign performance',
      'Optimize workflows'
    ]
  },
  evening: {
    name: 'Evening Reflection',
    description: 'Time to reflect on your achievements and plan for tomorrow. Celebrate your wins!',
    colors: {
      background: 'from-amber-50 via-orange-50 to-red-50',
      text: 'text-amber-900',
      accent: 'from-amber-500 to-orange-600'
    },
    focus: 'reflection',
    widgets: ['momentum', 'content', 'customers', 'opportunities'],
    greeting: 'Great work today! Let\'s celebrate your wins and plan tomorrow! 🌅',
    suggestions: [
      'Review today\'s accomplishments',
      'Plan tomorrow\'s priorities',
      'Check content performance',
      'Celebrate your progress'
    ]
  }
};

export const AdaptiveModeProvider = ({ children }) => {
  const [currentMode, setCurrentMode] = useState('morning');
  const [lastModeChange, setLastModeChange] = useState(Date.now());

  // Auto-detect mode based on time of day
  useEffect(() => {
    const detectMode = () => {
      const hour = new Date().getHours();
      let newMode;
      
      if (hour >= 6 && hour < 12) {
        newMode = 'morning';
      } else if (hour >= 12 && hour < 18) {
        newMode = 'active';
      } else {
        newMode = 'evening';
      }
      
      if (newMode !== currentMode) {
        setCurrentMode(newMode);
        setLastModeChange(Date.now());
      }
    };

    // Check immediately
    detectMode();
    
    // Check every hour
    const interval = setInterval(detectMode, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currentMode]);

  const getModeConfig = (mode = currentMode) => {
    return modeConfigs[mode] || modeConfigs.morning;
  };

  const switchMode = (mode) => {
    if (modeConfigs[mode]) {
      setCurrentMode(mode);
      setLastModeChange(Date.now());
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const config = getModeConfig();
    
    if (hour >= 6 && hour < 12) {
      return config.greeting;
    } else if (hour >= 12 && hour < 18) {
      return config.greeting;
    } else {
      return config.greeting;
    }
  };

  const getRecommendedActions = () => {
    return getModeConfig().suggestions;
  };

  const getWidgetPriority = (widgetId) => {
    const config = getModeConfig();
    const index = config.widgets.indexOf(widgetId);
    return index >= 0 ? index + 1 : 999;
  };

  const value = {
    currentMode,
    setCurrentMode: switchMode,
    getModeConfig,
    getTimeBasedGreeting,
    getRecommendedActions,
    getWidgetPriority,
    lastModeChange,
    availableModes: Object.keys(modeConfigs)
  };

  return (
    <AdaptiveModeContext.Provider value={value}>
      {children}
    </AdaptiveModeContext.Provider>
  );
};
