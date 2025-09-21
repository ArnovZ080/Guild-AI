import React, { createContext, useContext, useReducer, useState } from 'react';
import { motion, AnimatePresence } from '../components/common/AnimationWrapper';

const CelebrationContext = createContext();

const initialState = {
  activeCelebrations: [],
  celebrationHistory: [],
  preferences: {
    intensity: 'normal', // 'subtle', 'normal', 'intense'
    soundEnabled: true,
    animationEnabled: true,
    autoDismiss: true
  }
};

const celebrationReducer = (state, action) => {
  switch (action.type) {
    case 'TRIGGER_CELEBRATION':
      const newCelebration = {
        id: Date.now(),
        timestamp: new Date(),
        ...action.payload
      };
      return {
        ...state,
        activeCelebrations: [...state.activeCelebrations, newCelebration],
        celebrationHistory: [...state.celebrationHistory, newCelebration]
      };
    
    case 'DISMISS_CELEBRATION':
      return {
        ...state,
        activeCelebrations: state.activeCelebrations.filter(c => c.id !== action.payload.id)
      };
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      };
    
    default:
      return state;
  }
};

// Celebration intensity determination algorithm
const determineCelebrationIntensity = (task) => {
  let score = 0;

  // 1. Task Difficulty (weighted highest)
  switch (task.difficulty) {
    case 'easy': score += 1; break;
    case 'medium': score += 3; break;
    case 'hard': score += 5; break;
    default: score += 2; // Default for agent-estimated or inferred
  }

  // 2. Task Type (additional weight for significant types)
  if (['sales_close', 'campaign_launch', 'client_acquisition'].includes(task.type)) {
    score += 4;
  } else if (['content_publish', 'lead_generation'].includes(task.type)) {
    score += 2;
  }

  // 3. Impact/Significance (e.g., linked to a major goal)
  if (task.isLinkedToMajorGoal) {
    score += 3;
  }
  if (task.revenueImpact > 1000) { // Example threshold
    score += 2;
  }

  // Map score to intensity
  if (score >= 9) return 'elaborate';
  if (score >= 5) return 'moderate';
  return 'subtle';
};

// Celebration components for different intensities
const CelebrationOverlay = ({ celebration, onDismiss }) => {
  const { intensity, message, task } = celebration;

  const celebrationConfigs = {
    subtle: {
      animation: {
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8],
        transition: { duration: 0.6, ease: "easeInOut" }
      },
      visual: {
        color: '#10B981',
        size: 'w-16 h-16',
        icon: '✨'
      }
    },
    moderate: {
      animation: {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
        transition: { duration: 0.8, ease: "easeInOut" }
      },
      visual: {
        color: '#F59E0B',
        size: 'w-20 h-20',
        icon: '🎉'
      }
    },
    elaborate: {
      animation: {
        scale: [1, 1.15, 1],
        y: [0, -10, 0],
        transition: { duration: 1, ease: "easeInOut" }
      },
      visual: {
        color: '#8B5CF6',
        size: 'w-24 h-24',
        icon: '🚀'
      }
    }
  };

  const config = celebrationConfigs[intensity];

  return (
    <motion.div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className={`${config.visual.size} rounded-full flex items-center justify-center text-4xl mx-auto mb-4`}
          style={{ backgroundColor: `${config.visual.color}20` }}
          animate={config.animation}
        >
          {config.visual.icon}
        </motion.div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {intensity === 'elaborate' ? 'Fantastic Work!' : 
           intensity === 'moderate' ? 'Great Job!' : 'Nice!'}
        </h3>
        
        <p className="text-gray-600 mb-4">{message}</p>
        
        {task && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Task:</strong> {task.name || 'Completed Task'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Difficulty: {task.difficulty} • Impact: {task.impact || 'Medium'}
            </p>
          </div>
        )}
        
        <motion.button
          onClick={onDismiss}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const MicroCelebration = ({ celebration, onDismiss }) => {
  const { intensity, message } = celebration;

  const getPosition = (index) => {
    const positions = [
      { top: '20%', right: '5%' },
      { top: '30%', right: '15%' },
      { top: '40%', right: '8%' },
      { top: '50%', right: '12%' }
    ];
    return positions[index % positions.length];
  };

  const celebrationStyles = {
    subtle: {
      background: 'bg-success-gentle/90',
      border: 'border-success-clear',
      icon: '✨'
    },
    moderate: {
      background: 'bg-warning-warm/90',
      border: 'border-warning-glow',
      icon: '🎉'
    },
    elaborate: {
      background: 'bg-gradient-to-r from-forest-growth to-sky-day',
      border: 'border-forest-deep',
      icon: '🚀'
    }
  };

  const style = celebrationStyles[intensity];

  return (
    <motion.div
      className={`fixed z-40 max-w-xs ${style.background} rounded-xl shadow-lg border-2 ${style.border} p-4`}
      style={getPosition(celebration.id % 4)}
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <div className="flex items-center space-x-3">
        <motion.span
          className="text-2xl"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 0.6, repeat: 2 }}
        >
          {style.icon}
        </motion.span>
        <div className="flex-1">
          <p className="text-white font-medium text-sm">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-white/80 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

export const CelebrationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(celebrationReducer, initialState);

  const triggerCelebration = (intensity, task = null, customMessage = null) => {
    const messages = {
      subtle: [
        "Nice work! ✨",
        "Task completed! 👏",
        "Good progress! 💫",
        "Well done! 🌟"
      ],
      moderate: [
        "Great job! 🎉",
        "Excellent work! 🌟",
        "Outstanding! ⭐",
        "Fantastic! 🎊"
      ],
      elaborate: [
        "Amazing achievement! 🚀",
        "Incredible work! 🏆",
        "Outstanding success! 🎯",
        "Brilliant accomplishment! ✨"
      ]
    };

    const message = customMessage || messages[intensity][Math.floor(Math.random() * messages[intensity].length)];

    dispatch({
      type: 'TRIGGER_CELEBRATION',
      payload: {
        intensity,
        message,
        task
      }
    });

    // Auto-dismiss based on intensity
    const dismissTime = {
      subtle: 3000,
      moderate: 5000,
      elaborate: 8000
    };

    setTimeout(() => {
      dismissCelebration({ id: Date.now() }); // This will dismiss the most recent
    }, dismissTime[intensity]);
  };

  const dismissCelebration = (celebration) => {
    dispatch({
      type: 'DISMISS_CELEBRATION',
      payload: celebration
    });
  };

  const updatePreferences = (preferences) => {
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: preferences
    });
  };

  // Function to trigger celebration from task completion
  const triggerTaskCompletionCelebration = (task) => {
    const intensity = determineCelebrationIntensity(task);
    triggerCelebration(intensity, task);
  };

  // Function for manual testing
  const simulateCelebration = (intensity = 'moderate') => {
    const testTask = {
      name: 'Test Task',
      difficulty: intensity === 'elaborate' ? 'hard' : intensity === 'moderate' ? 'medium' : 'easy',
      type: intensity === 'elaborate' ? 'campaign_launch' : 'content_publish',
      isLinkedToMajorGoal: intensity === 'elaborate',
      revenueImpact: intensity === 'elaborate' ? 5000 : 1000
    };
    triggerCelebration(intensity, testTask);
  };

  const value = {
    state,
    triggerCelebration,
    triggerTaskCompletionCelebration,
    dismissCelebration,
    updatePreferences,
    simulateCelebration,
    determineCelebrationIntensity
  };

  return (
    <CelebrationContext.Provider value={value}>
      {children}
      
      {/* Celebration Overlays */}
      <AnimatePresence>
        {state.activeCelebrations.map((celebration) => {
          if (celebration.intensity === 'elaborate') {
            return (
              <CelebrationOverlay
                key={celebration.id}
                celebration={celebration}
                onDismiss={() => dismissCelebration(celebration)}
              />
            );
          } else {
            return (
              <MicroCelebration
                key={celebration.id}
                celebration={celebration}
                onDismiss={() => dismissCelebration(celebration)}
              />
            );
          }
        })}
      </AnimatePresence>
    </CelebrationContext.Provider>
  );
};

export const useCelebrations = () => {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebrations must be used within a CelebrationProvider');
  }
  return context;
};

export default CelebrationContext;
