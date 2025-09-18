import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MicroCelebration {
  id: string;
  type: 'task_complete' | 'milestone' | 'streak' | 'efficiency' | 'breakthrough';
  message: string;
  icon: string;
  color: string;
  position: { x: number; y: number };
  timestamp: number;
  intensity: 'small' | 'medium' | 'large' | 'epic';
}

interface CelebrationTrigger {
  taskDifficulty: 'easy' | 'medium' | 'hard' | 'epic';
  taskType: 'creative' | 'analytical' | 'social' | 'administrative';
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export const MicroCelebrationSystem: React.FC = () => {
  const [celebrations, setCelebrations] = useState<MicroCelebration[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  const celebrationTypes = {
    task_complete: {
      messages: ['Task completed! ✅', 'Well done! 👏', 'Another one done! 🎯', 'Nice work! 💪'],
      icons: ['✅', '👍', '🎯', '💪', '🔥'],
      colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B']
    },
    milestone: {
      messages: ['Milestone reached! 🎉', 'Great progress! 🚀', 'You\'re crushing it! 💥', 'Amazing work! 🌟'],
      icons: ['🎉', '🚀', '💥', '🏆', '🌟'],
      colors: ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6']
    },
    streak: {
      messages: ['Streak continues! 🔥', 'On a roll! 📈', 'Unstoppable! ⚡', 'Incredible streak! 🌟'],
      icons: ['🔥', '📈', '⚡', '🌟', '💎'],
      colors: ['#F97316', '#DC2626', '#7C3AED', '#06B6D4']
    },
    efficiency: {
      messages: ['Super efficient! ⚡', 'Speed demon! 💨', 'Productivity master! 🎯', 'Lightning fast! ⚡'],
      icons: ['⚡', '💨', '🎯', '🏃', '🚀'],
      colors: ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B']
    },
    breakthrough: {
      messages: ['Breakthrough achieved! 💥', 'Game changer! 🎮', 'Revolutionary! 🌟', 'Mind blown! 🤯'],
      icons: ['💥', '🎮', '🌟', '🤯', '👑'],
      colors: ['#EF4444', '#EC4899', '#8B5CF6', '#F59E0B']
    }
  };

  const determineCelebrationIntensity = (trigger: CelebrationTrigger): 'small' | 'medium' | 'large' | 'epic' => {
    let score = 0;
    
    // Task difficulty scoring
    const difficultyScores = { easy: 1, medium: 2, hard: 3, epic: 4 };
    score += difficultyScores[trigger.taskDifficulty];
    
    // Task type scoring
    const typeScores = { administrative: 1, analytical: 2, social: 3, creative: 4 };
    score += typeScores[trigger.taskType];
    
    // Impact scoring
    const impactScores = { low: 1, medium: 2, high: 3, critical: 4 };
    score += impactScores[trigger.impact];
    
    // Determine intensity based on total score
    if (score >= 10) return 'epic';
    if (score >= 8) return 'large';
    if (score >= 6) return 'medium';
    return 'small';
  };

  const getParticleCount = (intensity: string) => {
    const counts = {
      small: 8,
      medium: 15,
      large: 25,
      epic: 40
    };
    return counts[intensity as keyof typeof counts];
  };

  const getParticleSize = (intensity: string) => {
    const sizes = {
      small: 2,
      medium: 3,
      large: 4,
      epic: 6
    };
    return sizes[intensity as keyof typeof sizes];
  };

  const triggerMicroCelebration = useCallback((
    type: keyof typeof celebrationTypes, 
    trigger: CelebrationTrigger,
    position?: { x: number; y: number }
  ) => {
    const typeData = celebrationTypes[type];
    const intensity = determineCelebrationIntensity(trigger);
    
    const celebration: MicroCelebration = {
      id: Date.now().toString() + Math.random(),
      type,
      message: typeData.messages[Math.floor(Math.random() * typeData.messages.length)],
      icon: typeData.icons[Math.floor(Math.random() * typeData.icons.length)],
      color: typeData.colors[Math.floor(Math.random() * typeData.colors.length)],
      position: position || { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      timestamp: Date.now(),
      intensity
    };

    setCelebrations(prev => [...prev, celebration]);

    // Remove celebration after animation
    setTimeout(() => {
      setCelebrations(prev => prev.filter(c => c.id !== celebration.id));
    }, intensity === 'epic' ? 5000 : 3000);
  }, []);

  const handleTaskComplete = (difficulty: CelebrationTrigger['taskDifficulty'] = 'medium') => {
    setTaskCount(prev => prev + 1);
    setStreakCount(prev => prev + 1);
    
    const trigger: CelebrationTrigger = {
      taskDifficulty: difficulty,
      taskType: 'analytical',
      impact: 'medium'
    };
    
    triggerMicroCelebration('task_complete', trigger);
    
    // Trigger milestone celebration every 5 tasks
    if ((taskCount + 1) % 5 === 0) {
      setTimeout(() => {
        triggerMicroCelebration('milestone', {
          ...trigger,
          impact: 'high'
        });
      }, 500);
    }
    
    // Trigger streak celebration every 3 consecutive tasks
    if (streakCount % 3 === 0) {
      setTimeout(() => {
        triggerMicroCelebration('streak', {
          ...trigger,
          impact: 'medium'
        });
      }, 1000);
    }
    
    // Random efficiency celebration
    if (Math.random() < 0.3) {
      setTimeout(() => {
        triggerMicroCelebration('efficiency', {
          ...trigger,
          impact: 'low'
        });
      }, 1500);
    }
  };

  const handleBreakthrough = () => {
    const trigger: CelebrationTrigger = {
      taskDifficulty: 'epic',
      taskType: 'creative',
      impact: 'critical'
    };
    triggerMicroCelebration('breakthrough', trigger);
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
      {/* Demo Controls */}
      <div className="absolute top-4 left-4 space-x-2 z-10 flex flex-wrap gap-2">
        <button
          onClick={() => handleTaskComplete('easy')}
          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
        >
          Easy Task ({taskCount})
        </button>
        <button
          onClick={() => handleTaskComplete('hard')}
          className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          Hard Task
        </button>
        <button
          onClick={() => handleTaskComplete('epic')}
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
        >
          Epic Task
        </button>
        <button
          onClick={handleBreakthrough}
          className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
        >
          Breakthrough
        </button>
        <button
          onClick={() => triggerMicroCelebration('efficiency', {
            taskDifficulty: 'medium',
            taskType: 'analytical',
            impact: 'medium'
          })}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          Efficiency
        </button>
      </div>

      {/* Celebration Animations */}
      <AnimatePresence>
        {celebrations.map((celebration) => (
          <motion.div
            key={celebration.id}
            className="absolute pointer-events-none"
            style={{
              left: celebration.position.x,
              top: celebration.position.y,
            }}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0, 1.2, 1, 0.8], 
              y: [0, -30, -60, -90] 
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: celebration.intensity === 'epic' ? 5 : 3, 
              ease: 'easeOut' 
            }}
          >
            {/* Celebration Bubble */}
            <motion.div
              className="bg-white rounded-full px-4 py-2 shadow-xl border-2 flex items-center space-x-2 relative"
              style={{ 
                borderColor: celebration.color,
                transform: celebration.intensity === 'epic' ? 'scale(1.2)' : 'scale(1)'
              }}
              animate={{
                rotate: celebration.intensity === 'epic' ? [0, 5, -5, 0] : 0,
              }}
              transition={{
                duration: 0.5,
                repeat: celebration.intensity === 'epic' ? 3 : 0,
              }}
            >
              <span className="text-lg">{celebration.icon}</span>
              <span 
                className="text-sm font-medium"
                style={{ color: celebration.color }}
              >
                {celebration.message}
              </span>
              
              {/* Intensity indicator */}
              {celebration.intensity === 'epic' && (
                <motion.div
                  className="absolute -top-2 -right-2 text-xs bg-yellow-400 text-yellow-800 rounded-full px-1"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                  }}
                >
                  EPIC!
                </motion.div>
              )}
            </motion.div>
            
            {/* Particle Effects */}
            {Array.from({ length: getParticleCount(celebration.intensity) }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${getParticleSize(celebration.intensity)}px`,
                  height: `${getParticleSize(celebration.intensity)}px`,
                  backgroundColor: celebration.color,
                  left: `${Math.random() * 60 - 30}px`,
                  top: `${Math.random() * 60 - 30}px`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * (celebration.intensity === 'epic' ? 120 : 80)],
                  y: [0, (Math.random() - 0.5) * (celebration.intensity === 'epic' ? 120 : 80)],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: celebration.intensity === 'epic' ? 3 : 2,
                  delay: Math.random() * 0.8,
                }}
              />
            ))}
            
            {/* Sparkle Effects for Epic Celebrations */}
            {celebration.intensity === 'epic' && (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={`sparkle-${i}`}
                    className="absolute text-yellow-400"
                    style={{
                      left: `${Math.random() * 100 - 50}px`,
                      top: `${Math.random() * 100 - 50}px`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 1,
                      repeat: 2,
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Background Ambient Particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`ambient-${i}`}
          className="absolute w-1 h-1 rounded-full bg-white opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Streak Counter */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 rounded-lg px-3 py-2 shadow-md">
        <div className="text-sm font-medium text-gray-800">
          🔥 {streakCount} Day Streak
        </div>
        <div className="text-xs text-gray-600">
          {taskCount} tasks completed
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-gray-600 text-sm max-w-xs">
        <p className="font-medium">Try different buttons to see various celebration intensities!</p>
        <p className="text-xs mt-1">Epic tasks and breakthroughs trigger the most spectacular celebrations.</p>
      </div>
    </div>
  );
};

export default MicroCelebrationSystem;
