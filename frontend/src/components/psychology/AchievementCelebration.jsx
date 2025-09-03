import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementCelebration = () => {
  const [achievements, setAchievements] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  // Simulate achievement triggers
  const triggerAchievement = (achievement) => {
    setCurrentAchievement(achievement);
    setShowCelebration(true);
    setAchievements(prev => [achievement, ...prev]);

    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  };

  const sampleAchievements = [
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
    }
  ];

  const getCelebrationIntensity = (type) => {
    const intensities = {
      daily: 'small',
      streak: 'medium',
      milestone: 'large',
      breakthrough: 'epic'
    };
    return intensities[type] || 'medium';
  };

  const getParticleCount = (intensity) => {
    const counts = {
      small: 20,
      medium: 40,
      large: 60,
      epic: 100
    };
    return counts[intensity] || 40;
  };

  return (
    <div className="absolute bottom-4 right-4 z-50">
      <div className="flex space-x-2">
        {sampleAchievements.map((achievement) => (
          <button
            key={achievement.id}
            onClick={() => triggerAchievement(achievement)}
            className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600"
          >
            Trigger: {achievement.title}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showCelebration && currentAchievement && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center relative overflow-hidden"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              {Array.from({ length: getParticleCount(getCelebrationIntensity(currentAchievement.type)) }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{ y: [0, -100, -200], opacity: [1, 1, 0], scale: [0, 1, 0] }}
                  transition={{ duration: 3, delay: Math.random() * 2, repeat: Infinity }}
                />
              ))}
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                {currentAchievement.icon}
              </motion.div>
              <motion.h2
                className="text-2xl font-bold text-gray-800 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {currentAchievement.title}
              </motion.h2>
              <motion.p
                className="text-gray-600 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {currentAchievement.description}
              </motion.p>
              <motion.button
                onClick={() => setShowCelebration(false)}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Awesome! 🚀
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementCelebration;
