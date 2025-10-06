import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, Zap } from 'lucide-react';

/**
 * Confetti Particle Component
 */
const ConfettiPiece = ({ delay, duration, startX, color }) => {
  const randomRotation = Math.random() * 360;
  const randomEndX = startX + (Math.random() - 0.5) * 200;
  const randomEndY = window.innerHeight + 100;

  return (
    <motion.div
      className="absolute top-0 w-3 h-3 rounded-sm"
      style={{ 
        left: `${startX}%`, 
        backgroundColor: color,
        rotate: randomRotation
      }}
      initial={{ y: -20, opacity: 1, scale: 1 }}
      animate={{ 
        y: randomEndY,
        x: randomEndX - startX,
        opacity: 0,
        scale: 0,
        rotate: randomRotation + 720
      }}
      transition={{ 
        duration: duration,
        delay: delay,
        ease: 'easeIn'
      }}
    />
  );
};

/**
 * Sparkle Effect Component
 */
const Sparkle = ({ delay, x, y }) => {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        rotate: [0, 180]
      }}
      transition={{ 
        duration: 1,
        delay: delay,
        ease: 'easeOut'
      }}
    >
      <Sparkles className="w-6 h-6 text-yellow-400" />
    </motion.div>
  );
};

/**
 * Main Achievement Celebration Component
 */
const AchievementCelebration = ({ achievement, onClose, autoClose = true }) => {
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    // Generate confetti pieces
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const pieces = [];
    
    for (let i = 0; i < 100; i++) {
      pieces.push({
        id: i,
        delay: Math.random() * 0.3,
        duration: 2 + Math.random() * 2,
        startX: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setConfettiPieces(pieces);

    // Generate sparkles
    const sparkleArray = [];
    for (let i = 0; i < 20; i++) {
      sparkleArray.push({
        id: i,
        delay: Math.random() * 2,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60
      });
    }
    setSparkles(sparkleArray);

    // Auto close after 5 seconds if enabled
    if (autoClose) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const getImpactStyle = (impact) => {
    const styles = {
      high: 'from-red-500 via-orange-500 to-yellow-500',
      medium: 'from-blue-500 via-purple-500 to-pink-500',
      low: 'from-green-500 via-teal-500 to-cyan-500'
    };
    return styles[impact] || 'from-blue-500 to-purple-500';
  };

  const getImpactIcon = (impact) => {
    if (impact === 'high') return Trophy;
    if (impact === 'medium') return Star;
    return Zap;
  };

  const Icon = getImpactIcon(achievement.impact);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Confetti */}
      {confettiPieces.map(piece => (
        <ConfettiPiece
          key={piece.id}
          delay={piece.delay}
          duration={piece.duration}
          startX={piece.startX}
          color={piece.color}
        />
      ))}

      {/* Sparkles */}
      {sparkles.map(sparkle => (
        <Sparkle
          key={sparkle.id}
          delay={sparkle.delay}
          x={sparkle.x}
          y={sparkle.y}
        />
      ))}

      {/* Achievement Card */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto">
        <motion.div
          className="relative max-w-md w-full"
          initial={{ scale: 0, rotate: -10, y: 50 }}
          animate={{ scale: 1, rotate: 0, y: 0 }}
          exit={{ scale: 0, rotate: 10, y: -50 }}
          transition={{ 
            type: 'spring',
            stiffness: 200,
            damping: 20
          }}
        >
          {/* Glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getImpactStyle(achievement.impact)} opacity-20 blur-3xl rounded-3xl`} />
          
          {/* Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Gradient header */}
            <div className={`bg-gradient-to-br ${getImpactStyle(achievement.impact)} p-8 text-white text-center relative overflow-hidden`}>
              {/* Animated background pattern */}
              <motion.div
                className="absolute inset-0 opacity-10"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }}
              />

              {/* Icon with pulse animation */}
              <motion.div
                className="relative inline-block mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                <div className="p-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-full">
                  <Icon className="w-16 h-16" />
                </div>
                
                {/* Pulse rings */}
                <motion.div
                  className="absolute inset-0 border-4 border-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 2],
                    opacity: [0.6, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut'
                  }}
                />
                <motion.div
                  className="absolute inset-0 border-4 border-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 2],
                    opacity: [0.6, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.4,
                    repeat: Infinity,
                    ease: 'easeOut'
                  }}
                />
              </motion.div>

              <motion.h2 
                className="text-3xl font-bold mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                🎉 Achievement Unlocked!
              </motion.h2>
              
              <motion.p 
                className="text-xl font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {achievement.title}
              </motion.p>
            </div>

            {/* Content */}
            <motion.div 
              className="p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-700 text-center mb-4">
                {achievement.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {achievement.currentValue?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Achieved</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 capitalize">
                    {achievement.impact}
                  </div>
                  <div className="text-sm text-gray-500">Impact</div>
                </div>
              </div>

              {/* Category badge */}
              <div className="flex justify-center mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${getImpactStyle(achievement.impact)} text-white`}>
                  {achievement.category?.toUpperCase()}
                </span>
              </div>

              {/* Celebration message */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 font-semibold">
                  {achievement.celebration}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Awesome! 🎊
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * Achievement Notification (smaller, non-intrusive version)
 */
export const AchievementNotification = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getImpactStyle = (impact) => {
    const styles = {
      high: 'from-red-500 to-orange-500',
      medium: 'from-blue-500 to-purple-500',
      low: 'from-green-500 to-teal-500'
    };
    return styles[impact] || 'from-blue-500 to-purple-500';
  };

  return (
    <motion.div
      className="fixed top-4 right-4 z-[9999] max-w-sm"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-yellow-300">
        <div className={`bg-gradient-to-r ${getImpactStyle(achievement.impact)} p-4`}>
          <div className="flex items-center space-x-3 text-white">
            <div className="flex-shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Achievement Unlocked!</p>
              <p className="text-xs opacity-90">{achievement.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-3 bg-yellow-50">
          <p className="text-sm text-yellow-800 font-medium">
            {achievement.celebration}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementCelebration;

