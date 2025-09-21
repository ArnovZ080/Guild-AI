import React, { createContext, useContext, useReducer, useEffect } from 'react';

const PsychologicalOptimizationContext = createContext();

const initialState = {
  userProfile: {
    businessType: null,
    workingStyle: null,
    motivationFactors: [],
    stressIndicators: [],
    preferredCommunicationStyle: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  },
  adaptiveInterface: {
    currentMode: 'morning',
    autoModeEnabled: true,
    customizations: {},
    lastModeChange: new Date()
  },
  achievementSystem: {
    unlockedAchievements: [],
    currentStreaks: {},
    momentumScore: 75,
    celebrationPreferences: {
      intensity: 'normal',
      soundEnabled: true,
      animationEnabled: true
    },
    bankedMomentum: []
  },
  contextualIntelligence: {
    userIntent: null,
    businessContext: {
      currentTasks: [],
      activeAgents: [],
      recentActivity: []
    },
    learningData: {
      interactionPatterns: {},
      preferredFeatures: {},
      peakProductivityHours: []
    },
    adaptationHistory: []
  },
  agentPersonalities: {
    research: {
      name: 'Dr. Insight',
      personality: 'analytical, thorough, curious',
      avatar: '🔬',
      primaryColor: '#3B82F6',
      voiceStyle: 'methodical and precise',
      emotionalRange: ['focused', 'excited', 'contemplative', 'satisfied'],
      currentEmotion: 'focused'
    },
    marketing: {
      name: 'Creative Spark',
      personality: 'innovative, energetic, persuasive',
      avatar: '🎨',
      primaryColor: '#22C55E',
      voiceStyle: 'enthusiastic and inspiring',
      emotionalRange: ['inspired', 'collaborative', 'strategic', 'accomplished'],
      currentEmotion: 'inspired'
    },
    sales: {
      name: 'Deal Closer',
      personality: 'confident, relationship-focused, results-driven',
      avatar: '🤝',
      primaryColor: '#F59E0B',
      voiceStyle: 'warm and persuasive',
      emotionalRange: ['confident', 'empathetic', 'determined', 'celebratory'],
      currentEmotion: 'confident'
    },
    content: {
      name: 'Story Weaver',
      personality: 'creative, engaging, audience-focused',
      avatar: '✍️',
      primaryColor: '#8B5CF6',
      voiceStyle: 'narrative and compelling',
      emotionalRange: ['creative', 'engaged', 'inspired', 'accomplished'],
      currentEmotion: 'creative'
    },
    operations: {
      name: 'Efficiency Expert',
      personality: 'systematic, reliable, optimization-focused',
      avatar: '⚙️',
      primaryColor: '#6B7280',
      voiceStyle: 'clear and organized',
      emotionalRange: ['organized', 'efficient', 'methodical', 'satisfied'],
      currentEmotion: 'organized'
    }
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
          autoModeEnabled: action.payload.auto ?? state.adaptiveInterface.autoModeEnabled,
          lastModeChange: new Date()
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
    
    case 'UPDATE_MOMENTUM_SCORE':
      return {
        ...state,
        achievementSystem: {
          ...state.achievementSystem,
          momentumScore: action.payload
        }
      };
    
    case 'BANK_MOMENTUM':
      return {
        ...state,
        achievementSystem: {
          ...state.achievementSystem,
          bankedMomentum: [
            ...state.achievementSystem.bankedMomentum,
            {
              id: Date.now(),
              timestamp: new Date(),
              ...action.payload
            }
          ]
        }
      };
    
    case 'UPDATE_AGENT_EMOTION':
      return {
        ...state,
        agentPersonalities: {
          ...state.agentPersonalities,
          [action.payload.agentType]: {
            ...state.agentPersonalities[action.payload.agentType],
            currentEmotion: action.payload.emotion
          }
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
    
    case 'UPDATE_BUSINESS_CONTEXT':
      return {
        ...state,
        contextualIntelligence: {
          ...state.contextualIntelligence,
          businessContext: {
            ...state.contextualIntelligence.businessContext,
            ...action.payload
          }
        }
      };
    
    case 'UPDATE_CELEBRATION_PREFERENCES':
      return {
        ...state,
        achievementSystem: {
          ...state.achievementSystem,
          celebrationPreferences: {
            ...state.achievementSystem.celebrationPreferences,
            ...action.payload
          }
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
    const updateMode = () => {
      if (!state.adaptiveInterface.autoModeEnabled) return;

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
    };

    // Check immediately
    updateMode();

    // Set up interval to check every hour
    const intervalId = setInterval(updateMode, 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [state.adaptiveInterface.autoModeEnabled, state.adaptiveInterface.currentMode]);

  // Simulate momentum score changes based on activity
  useEffect(() => {
    const interval = setInterval(() => {
      const currentScore = state.achievementSystem.momentumScore;
      // Simulate gradual momentum changes
      const change = (Math.random() - 0.5) * 2; // -1 to +1
      const newScore = Math.max(0, Math.min(100, currentScore + change));
      
      if (Math.abs(newScore - currentScore) > 0.5) {
        dispatch({
          type: 'UPDATE_MOMENTUM_SCORE',
          payload: newScore
        });
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [state.achievementSystem.momentumScore]);

  // Simulate agent emotion changes
  useEffect(() => {
    const interval = setInterval(() => {
      const agentTypes = Object.keys(state.agentPersonalities);
      const randomAgent = agentTypes[Math.floor(Math.random() * agentTypes.length)];
      const agent = state.agentPersonalities[randomAgent];
      const randomEmotion = agent.emotionalRange[Math.floor(Math.random() * agent.emotionalRange.length)];
      
      if (randomEmotion !== agent.currentEmotion) {
        dispatch({
          type: 'UPDATE_AGENT_EMOTION',
          payload: {
            agentType: randomAgent,
            emotion: randomEmotion
          }
        });
      }
    }, 15000); // Change emotion every 15 seconds

    return () => clearInterval(interval);
  }, [state.agentPersonalities]);

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
    updateMomentumScore: (score) => dispatch({
      type: 'UPDATE_MOMENTUM_SCORE',
      payload: score
    }),
    bankMomentum: (momentum) => dispatch({
      type: 'BANK_MOMENTUM',
      payload: momentum
    }),
    updateAgentEmotion: (agentType, emotion) => dispatch({
      type: 'UPDATE_AGENT_EMOTION',
      payload: { agentType, emotion }
    }),
    updateContextualIntelligence: (updates) => dispatch({
      type: 'UPDATE_CONTEXTUAL_INTELLIGENCE',
      payload: updates
    }),
    updateBusinessContext: (updates) => dispatch({
      type: 'UPDATE_BUSINESS_CONTEXT',
      payload: updates
    }),
    updateCelebrationPreferences: (updates) => dispatch({
      type: 'UPDATE_CELEBRATION_PREFERENCES',
      payload: updates
    }),
    // Utility functions
    getCurrentMode: () => state.adaptiveInterface.currentMode,
    getAgentPersonality: (agentType) => state.agentPersonalities[agentType],
    getMomentumLevel: () => {
      const score = state.achievementSystem.momentumScore;
      if (score >= 80) return 'high';
      if (score >= 60) return 'moderate';
      if (score >= 40) return 'low';
      return 'recovery';
    },
    shouldTriggerCelebration: (task) => {
      // Simple celebration trigger logic - will be enhanced later
      return Math.random() > 0.7; // 30% chance for demo
    }
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

export default PsychologicalOptimizationContext;
