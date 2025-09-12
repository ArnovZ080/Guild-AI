import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StressLevel {
  current: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  factors: string[];
}

export const StressReductionInterface: React.FC = () => {
  const [stressLevel, setStressLevel] = useState<StressLevel>({
    current: 0.6,
    trend: 'stable',
    factors: ['High task load', 'Tight deadlines']
  });

  const [ambientMode, setAmbientMode] = useState<'ocean' | 'forest' | 'rain' | 'space'>('ocean');
  const [isActive, setIsActive] = useState(false);

  const ambientThemes = {
    ocean: {
      colors: ['#0EA5E9', '#0284C7', '#0369A1'],
      particles: '🌊',
      sound: 'Ocean waves',
      description: 'Calming ocean waves'
    },
    forest: {
      colors: ['#10B981', '#059669', '#047857'],
      particles: '🍃',
      sound: 'Forest sounds',
      description: 'Peaceful forest breeze'
    },
    rain: {
      colors: ['#6B7280', '#4B5563', '#374151'],
      particles: '💧',
      sound: 'Gentle rain',
      description: 'Soothing rainfall'
    },
    space: {
      colors: ['#8B5CF6', '#7C3AED', '#6D28D9'],
      particles: '✨',
      sound: 'Cosmic ambience',
      description: 'Tranquil space'
    }
  };

  const getStressColor = (level: number) => {
    if (level < 0.3) return '#10B981'; // Green - low stress
    if (level < 0.6) return '#F59E0B'; // Amber - medium stress
    return '#EF4444'; // Red - high stress
  };

  const getStressMessage = (level: number) => {
    if (level < 0.3) return 'You\'re in a great headspace! 😌';
    if (level < 0.6) return 'Feeling a bit tense? Let\'s relax 🧘‍♀️';
    return 'High stress detected. Time for a break 🛑';
  };

  // Simulate stress level changes
  useEffect(() => {
    const interval = setInterval(() => {
      setStressLevel(prev => ({
        ...prev,
        current: Math.max(0, Math.min(1, prev.current + (Math.random() - 0.5) * 0.1))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-activate ambient mode when stress is high
  useEffect(() => {
    if (stressLevel.current > 0.7 && !isActive) {
      setIsActive(true);
    }
  }, [stressLevel.current, isActive]);

  const currentTheme = ambientThemes[ambientMode];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Stress Level Monitor */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Stress Monitor</h3>
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getStressColor(stressLevel.current) }}
            />
            <span className="text-sm font-medium" style={{ color: getStressColor(stressLevel.current) }}>
              {Math.round(stressLevel.current * 100)}%
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <motion.div
            className="h-2 rounded-full transition-all duration-1000"
            style={{
              backgroundColor: getStressColor(stressLevel.current),
              width: `${stressLevel.current * 100}%`
            }}
          />
        </div>

        <p className="text-sm text-gray-600 mb-2">
          {getStressMessage(stressLevel.current)}
        </p>

        {stressLevel.factors.length > 0 && (
          <div className="text-xs text-gray-500">
            Stress factors: {stressLevel.factors.join(', ')}
          </div>
        )}
      </div>

      {/* Ambient Interface */}
      <div
        className={`relative h-64 transition-all duration-1000 ${isActive ? 'opacity-100' : 'opacity-50'}`}
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${currentTheme.colors.join(', ')})`
            : '#F3F4F6'
        }}
      >
        {/* Ambient Particles */}
        {isActive && Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
              rotate: [0, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {currentTheme.particles}
          </motion.div>
        ))}

        {/* Breathing Guide */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-24 h-24 rounded-full border-4 border-white border-opacity-50 flex items-center justify-center"
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <motion.div
                className="text-white text-sm font-medium text-center"
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              >
                Breathe
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {Object.entries(ambientThemes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setAmbientMode(key as keyof typeof ambientThemes)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    ambientMode === key
                      ? 'bg-white text-gray-800 shadow-lg'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  {theme.particles} {theme.description}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-gray-800 shadow-lg'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              {isActive ? 'Pause' : 'Activate'}
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {stressLevel.current > 0.6 && (
        <motion.div
          className="p-4 bg-blue-50 border-t border-blue-200"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="text-sm font-medium text-blue-800 mb-2">Stress Relief Suggestions</h4>
          <div className="space-y-1 text-xs text-blue-700">
            <div>• Take a 5-minute break and use the breathing guide above</div>
            <div>• Consider delegating some tasks to your AI agents</div>
            <div>• Review your schedule and prioritize essential tasks</div>
            <div>• Step away from the screen for a few minutes</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
