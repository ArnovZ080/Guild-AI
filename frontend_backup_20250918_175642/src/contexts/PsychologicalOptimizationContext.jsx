// src/contexts/PsychologicalOptimizationContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const PsychologicalOptimizationContext = createContext();

const initialState = {
  userProfile: {
    businessType: null,
    workingStyle: null,
    motivationFactors: [],
    stressIndicators: [],
    preferredCommunicationStyle: null
  },
  adaptiveInterface: {
    currentMode: 'morning',
    autoModeEnabled: true,
    customizations: {}
  },
  achievementSystem: {
    unlockedAchievements: [],
    currentStreaks: {},
    momentumScore: 0,
    celebrationPreferences: {}
  },
  contextualIntelligence: {
    userIntent: null,
    businessContext: {},
    learningData: {},
    adaptationHistory: []
  }
};

const psychOptimizationReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        userProfile: { ...state.userProfile, ...action.payload }
      };

    case 'SET_ADAPTIVE_MODE':
      return {
        ...state,
        adaptiveInterface: {
          ...state.adaptiveInterface,
          currentMode: action.payload.mode,
          autoModeEnabled: action.payload.auto ?? state.adaptiveInterface.autoModeEnabled
        }
      };

    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievementSystem: {
          ...state.achievementSystem,
          unlockedAchievements: [
            ...state.achievementSystem.unlockedAchievements,
            action.payload
          ]
        }
      };

    case 'UPDATE_CONTEXTUAL_INTELLIGENCE':
      return {
        ...state,
        contextualIntelligence: {
          ...state.contextualIntelligence,
          ...action.payload
        }
      };

    default:
      return state;
  }
};

export const PsychologicalOptimizationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(psychOptimizationReducer, initialState);

  // Auto-detect time-based mode changes
  useEffect(() => {
    if (state.adaptiveInterface.autoModeEnabled) {
      const hour = new Date().getHours();
      let newMode = 'morning';

      if (hour >= 6 && hour < 12) newMode = 'morning';
      else if (hour >= 12 && hour < 18) newMode = 'active';
      else newMode = 'evening';

      if (newMode !== state.adaptiveInterface.currentMode) {
        dispatch({
          type: 'SET_ADAPTIVE_MODE',
          payload: { mode: newMode }
        });
      }
    }
  }, [state.adaptiveInterface.autoModeEnabled, state.adaptiveInterface.currentMode]);

  const value = {
    state,
    dispatch,
    // Helper functions
    updateUserProfile: (updates) => dispatch({
      type: 'UPDATE_USER_PROFILE',
      payload: updates
    }),
    setAdaptiveMode: (mode, auto = null) => dispatch({
      type: 'SET_ADAPTIVE_MODE',
      payload: { mode, auto }
    }),
    unlockAchievement: (achievement) => dispatch({
      type: 'UNLOCK_ACHIEVEMENT',
      payload: achievement
    }),
    updateContextualIntelligence: (updates) => dispatch({
      type: 'UPDATE_CONTEXTUAL_INTELLIGENCE',
      payload: updates
    })
  };

  return (
    <PsychologicalOptimizationContext.Provider value={value}>
      {children}
    </PsychologicalOptimizationContext.Provider>
  );
};

export const usePsychologicalOptimization = () => {
  const context = useContext(PsychologicalOptimizationContext);
  if (!context) {
    throw new Error('usePsychologicalOptimization must be used within a PsychologicalOptimizationProvider');
  }
  return context;
};
