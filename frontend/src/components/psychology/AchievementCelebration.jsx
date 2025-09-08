import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementCelebration = () => {
  const [show, setShow] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  const sampleAchievements = [
    {
      id: '1',
      title: 'First Sale!',
      description: 'You made your first sale of the month',
      type: 'breakthrough',
      value: 500,
      icon: '🎉',
      color: '#8B5CF6'
    },
    {
      id: '2',
      title: 'Content Creator',
      description: 'Published 5 blog posts this week',
      type: 'streak',
      value: 5,
      icon: '✍️',
      color: '#10B981'
    },
    {
      id: '3',
      title: 'Lead Magnet',
      description: 'Generated 50 new leads today',
      type: 'daily',
      value: 50,
      icon: '🧲',
      color: '#3B82F6'
    },
    {
      id: '4',
      title: 'Revenue Milestone',
      description: 'Reached $10K monthly revenue',
      type: 'milestone',
      value: 1000,
      icon: '💰',
      color: '#F59E0B'
    }
  ];

  const triggerAchievement = (achievement) => {
    setCurrentAchievement(achievement);
    setShow(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShow(false);
    }, 5000);
  };

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

      {/* Celebration Overlay */}
      <AnimatePresence>
        {show && currentAchievement && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none"
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
                className="text-3xl font-bold mb-6"
                style={{ color: currentAchievement.color }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
              >
                +{currentAchievement.value}
              </motion.div>

              {/* Close Button */}
              <motion.button
                onClick={() => setShow(false)}
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
    </div>
  );
};

export default AchievementCelebration;
