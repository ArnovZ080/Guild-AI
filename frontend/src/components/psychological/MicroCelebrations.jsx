import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Star, Sparkles, Heart, Zap, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';

// Celebration Types
export const CelebrationType = {
  TASK_COMPLETE: 'task_complete',
  MILESTONE: 'milestone',
  STREAK: 'streak',
  EFFICIENCY: 'efficiency',
  COLLABORATION: 'collaboration',
  BREAKTHROUGH: 'breakthrough'
};

// Celebration Configurations
const celebrationConfigs = {
  [CelebrationType.TASK_COMPLETE]: {
    icon: CheckCircle,
    colors: ['#10B981', '#059669', '#047857'],
    particles: 8,
    duration: 2000,
    sound: 'soft-chime',
    messages: [
      "Task completed! 🎉",
      "Another one done! ✨",
      "Progress made! 🚀",
      "Well done! 👏"
    ]
  },
  [CelebrationType.MILESTONE]: {
    icon: Trophy,
    colors: ['#F59E0B', '#D97706', '#B45309'],
    particles: 15,
    duration: 3000,
    sound: 'celebration',
    messages: [
      "Milestone achieved! 🏆",
      "Outstanding progress! 🌟",
      "You're crushing it! 💪",
      "Incredible work! 🎯"
    ]
  },
  [CelebrationType.STREAK]: {
    icon: Zap,
    colors: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    particles: 12,
    duration: 2500,
    sound: 'energy-boost',
    messages: [
      "Streak maintained! ⚡",
      "Consistency pays off! 🔥",
      "Momentum building! 📈",
      "Unstoppable! 💫"
    ]
  },
  [CelebrationType.EFFICIENCY]: {
    icon: Star,
    colors: ['#06B6D4', '#0891B2', '#0E7490'],
    particles: 10,
    duration: 2000,
    sound: 'efficiency',
    messages: [
      "Efficiency boost! ⭐",
      "Time saved! ⏰",
      "Optimized! 🎯",
      "Streamlined! 🚀"
    ]
  },
  [CelebrationType.COLLABORATION]: {
    icon: Heart,
    colors: ['#EC4899', '#DB2777', '#BE185D'],
    particles: 12,
    duration: 2500,
    sound: 'harmony',
    messages: [
      "Great teamwork! 🤝",
      "Collaboration success! 💕",
      "Synergy achieved! 🌟",
      "Perfect harmony! 🎵"
    ]
  },
  [CelebrationType.BREAKTHROUGH]: {
    icon: Sparkles,
    colors: ['#F97316', '#EA580C', '#C2410C'],
    particles: 20,
    duration: 4000,
    sound: 'breakthrough',
    messages: [
      "Breakthrough moment! ✨",
      "Innovation unlocked! 💡",
      "Game changer! 🚀",
      "Revolutionary! 🌟"
    ]
  }
};

// Particle Component
const Particle = ({ color, delay = 0, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <motion.div
      className={cn("absolute rounded-full", sizeClasses[size])}
      style={{ backgroundColor: color }}
      initial={{
        scale: 0,
        x: 0,
        y: 0,
        opacity: 1
      }}
      animate={{
        scale: [0, 1, 0],
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        opacity: [0, 1, 0]
      }}
      transition={{
        duration: 2,
        delay,
        ease: "easeOut"
      }}
    />
  );
};

// Confetti Component
const Confetti = ({ colors, particleCount = 10, isActive }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: particleCount }).map((_, i) => (
            <Particle
              key={i}
              color={colors[i % colors.length]}
              delay={i * 0.1}
              size={Math.random() > 0.5 ? 'md' : 'sm'}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

// Ripple Effect Component
const RippleEffect = ({ isActive, color }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 pointer-events-none"
          style={{ borderColor: color }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
};

// Glow Effect Component
const GlowEffect = ({ isActive, color }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.5, 1],
            opacity: [0, 0.8, 0]
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
};

// Main Micro Celebration Component
export const MicroCelebration = ({ 
  type = CelebrationType.TASK_COMPLETE,
  isActive = false,
  onComplete,
  customMessage,
  intensity = 'normal',
  position = 'center'
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const config = celebrationConfigs[type];
  
  useEffect(() => {
    if (isActive) {
      setShowMessage(true);
      
      // Play sound effect (if available)
      if (config.sound && typeof window !== 'undefined' && window.Audio) {
        try {
          const audio = new Audio(`/sounds/${config.sound}.mp3`);
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Silently fail if audio can't play
          });
        } catch (error) {
          // Silently fail if audio not available
        }
      }

      const timer = setTimeout(() => {
        setShowMessage(false);
        onComplete?.();
      }, config.duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, config, onComplete]);

  const Icon = config.icon;
  const message = customMessage || config.messages[Math.floor(Math.random() * config.messages.length)];
  
  const intensityMultiplier = {
    subtle: 0.5,
    normal: 1,
    intense: 1.5
  }[intensity];

  const particleCount = Math.floor(config.particles * intensityMultiplier);

  const positionClasses = {
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={cn(
            "fixed z-50 pointer-events-none",
            positionClasses[position]
          )}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="relative">
            {/* Main Icon */}
            <motion.div
              className="relative z-10 p-4 rounded-full bg-white dark:bg-slate-800 shadow-2xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 0.6,
                times: [0, 0.3, 0.7, 1]
              }}
            >
              <Icon 
                className="w-8 h-8" 
                style={{ color: config.colors[0] }}
              />
              
              {/* Glow Effect */}
              <GlowEffect isActive={isActive} color={config.colors[0]} />
              
              {/* Ripple Effect */}
              <RippleEffect isActive={isActive} color={config.colors[0]} />
            </motion.div>

            {/* Confetti */}
            <Confetti 
              colors={config.colors} 
              particleCount={particleCount}
              isActive={isActive}
            />

            {/* Message */}
            <AnimatePresence>
              {showMessage && (
                <motion.div
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 whitespace-nowrap"
                  initial={{ opacity: 0, y: -10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {message}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Celebration Trigger Button
export const CelebrationTrigger = ({ 
  children, 
  type = CelebrationType.TASK_COMPLETE,
  onClick,
  disabled = false,
  className 
}) => {
  const [isTriggered, setIsTriggered] = useState(false);

  const handleClick = () => {
    if (!disabled) {
      setIsTriggered(true);
      onClick?.();
    }
  };

  return (
    <>
      <motion.button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95",
          className
        )}
        whileTap={{ scale: 0.95 }}
      >
        {children}
      </motion.button>

      <MicroCelebration
        type={type}
        isActive={isTriggered}
        onComplete={() => setIsTriggered(false)}
        position="center"
      />
    </>
  );
};

// Progress Celebration
export const ProgressCelebration = ({ 
  progress, 
  milestones = [25, 50, 75, 100],
  onMilestone 
}) => {
  const [lastCelebrated, setLastCelebrated] = useState(0);
  const [currentCelebration, setCurrentCelebration] = useState(null);

  useEffect(() => {
    const nextMilestone = milestones.find(m => m > lastCelebrated && progress >= m);
    
    if (nextMilestone) {
      setLastCelebrated(nextMilestone);
      setCurrentCelebration({
        type: nextMilestone === 100 ? CelebrationType.MILESTONE : CelebrationType.STREAK,
        message: `${nextMilestone}% Complete! 🎉`
      });
      onMilestone?.(nextMilestone);
    }
  }, [progress, milestones, lastCelebrated, onMilestone]);

  return (
    <MicroCelebration
      type={currentCelebration?.type}
      isActive={!!currentCelebration}
      customMessage={currentCelebration?.message}
      onComplete={() => setCurrentCelebration(null)}
      position="top-right"
    />
  );
};

// Streak Celebration
export const StreakCelebration = ({ 
  streakCount, 
  onStreakMilestone,
  milestones = [3, 7, 14, 30, 100] 
}) => {
  const [lastMilestone, setLastMilestone] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const nextMilestone = milestones.find(m => m > lastMilestone && streakCount >= m);
    
    if (nextMilestone) {
      setLastMilestone(nextMilestone);
      setShowCelebration(true);
      onStreakMilestone?.(nextMilestone);
    }
  }, [streakCount, milestones, lastMilestone, onStreakMilestone]);

  return (
    <MicroCelebration
      type={CelebrationType.STREAK}
      isActive={showCelebration}
      customMessage={`${streakCount} day streak! 🔥`}
      onComplete={() => setShowCelebration(false)}
      intensity="intense"
      position="center"
    />
  );
};

// Celebration Manager Hook
export const useCelebrations = () => {
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
    const config = celebrationConfigs[type];
    setTimeout(() => {
      setActiveCelebrations(prev => prev.filter(c => c.id !== id));
    }, config.duration);

    return id;
  };

  const removeCelebration = (id) => {
    setActiveCelebrations(prev => prev.filter(c => c.id !== id));
  };

  const clearAllCelebrations = () => {
    setActiveCelebrations([]);
  };

  return {
    activeCelebrations,
    triggerCelebration,
    removeCelebration,
    clearAllCelebrations
  };
};

// Celebration Provider Component
export const CelebrationProvider = ({ children }) => {
  const celebrations = useCelebrations();

  return (
    <div className="relative">
      {children}
      
      {/* Render active celebrations */}
      {celebrations.activeCelebrations.map((celebration) => (
        <MicroCelebration
          key={celebration.id}
          type={celebration.type}
          isActive={true}
          customMessage={celebration.message}
          intensity={celebration.intensity}
          position={celebration.position}
          onComplete={() => celebrations.removeCelebration(celebration.id)}
        />
      ))}
    </div>
  );
};