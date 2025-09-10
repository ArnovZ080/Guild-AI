import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'streak' | 'breakthrough' | 'daily';
  value: number;
  icon: string;
  timestamp: Date;
}

export const AchievementCelebration: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  // Simulate achievement triggers
  const triggerAchievement = (achievement: Achievement) => {
    setCurrentAchievement(achievement);
    setShowCelebration(true);
    setAchievements(prev => [achievement, ...prev]);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  };

  // Example achievements
  const sampleAchievements: Achievement[] = [
    {
      id: '1',
      title: 'First Sale!',
      description: 'You made your first sale of the month',
      type: 'breakthrough',
      value: 500,
      icon: '🎉',
      timestamp: new Date()
    },
    {
      id: '2',
      title: 'Content Creator',
      description: 'Published 5 blog posts this week',
      type: 'streak',
      value: 5,
      icon: '✍️',
      timestamp: new Date()
    },
    {
      id: '3',
      title: 'Lead Magnet',
      description: 'Generated 50 new leads today',
      type: 'daily',
      value: 50,
      icon: '🧲',
      timestamp: new Date()
    }
  ];

  const getCelebrationIntensity = (type: string) => {
    const intensities = {
      daily: 'small',
      streak: 'medium',
      milestone: 'large',
      breakthrough: 'epic'
    };
    return intensities[type as keyof typeof intensities];
  };

  const getParticleCount = (intensity: string) => {
    const counts = {
      small: 20,
      medium: 40,
      large: 60,
      epic: 100
    };
    return counts[intensity as keyof typeof counts];
  };

  return (
    <div className="relative">
      {/* Achievement Trigger Buttons (for demo) */}
      <div className="mb-6 space-x-2">
        {sampleAchievements.map((achievement) => (
          <button
            key={achievement.id}
            onClick={() => triggerAchievement(achievement)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Trigger: {achievement.title}
          </button>
        ))}
      </div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && currentAchievement && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Celebration Card */}
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center relative overflow-hidden"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              {/* Background Particles */}
              {Array.from({ length: getParticleCount(getCelebrationIntensity(currentAchievement.type)) }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -100, -200],
                    opacity: [1, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                  }}
                />
              ))}

              {/* Achievement Icon */}
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 3,
                }}
              >
                {currentAchievement.icon}
              </motion.div>

              {/* Achievement Title */}
              <motion.h2
                className="text-2xl font-bold text-gray-800 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {currentAchievement.title}
              </motion.h2>

              {/* Achievement Description */}
              <motion.p
                className="text-gray-600 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {currentAchievement.description}
              </motion.p>

              {/* Achievement Value */}
              <motion.div
                className="text-3xl font-bold text-green-500 mb-6"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
              >
                +{currentAchievement.value}
              </motion.div>

              {/* Close Button */}
              <motion.button
                onClick={() => setShowCelebration(false)}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Awesome! 🚀
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement History */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Achievements</h3>
        <div className="space-y-3">
          {achievements.slice(0, 5).map((achievement) => (
            <motion.div
              key={achievement.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              layout
            >
              <span className="text-2xl">{achievement.icon}</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{achievement.title}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-500">+{achievement.value}</div>
                <div className="text-xs text-gray-500">
                  {achievement.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
