import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * Mini Celebration Component
 * 
 * A lightweight celebration for smaller achievements or inline celebrations.
 * Perfect for celebrating task completions, milestones, etc.
 */
const MiniCelebration = ({ message, icon: Icon = Sparkles, duration = 3000, onComplete }) => {
  useEffect(() => {
    if (duration && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onComplete]);

  return (
    <motion.div
      className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white rounded-full shadow-lg"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
    >
      <motion.div
        animate={{
          rotate: [0, 15, -15, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 1
        }}
      >
        <Icon className="w-5 h-5" />
      </motion.div>
      <span className="font-semibold">{message}</span>
      <motion.span
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1]
        }}
        transition={{
          duration: 1,
          repeat: Infinity
        }}
      >
        🎉
      </motion.span>
    </motion.div>
  );
};

/**
 * Floating Emoji Celebration
 */
export const FloatingEmojiCelebration = ({ emojis = ['🎉', '🎊', '⭐', '✨'], count = 20 }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute text-4xl"
          style={{ left: `${particle.x}%`, top: '-50px' }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight + 100,
            opacity: 0,
            rotate: 360,
            x: (Math.random() - 0.5) * 200
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeIn'
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Success Pulse
 */
export const SuccessPulse = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <motion.div
        className="absolute inset-0 bg-green-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 0.6, times: [0, 0.3, 1] }}
      />
    </div>
  );
};

/**
 * Fireworks Effect
 */
export const Fireworks = ({ count = 5 }) => {
  const fireworks = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    y: 20 + Math.random() * 60,
    delay: i * 0.3
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {fireworks.map(fw => (
        <div
          key={fw.id}
          className="absolute"
          style={{ left: `${fw.x}%`, top: `${fw.y}%` }}
        >
          {/* Particles radiating from center */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 50;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: x,
                  y: y,
                  opacity: 0,
                  scale: 0
                }}
                transition={{
                  duration: 1,
                  delay: fw.delay,
                  ease: 'easeOut'
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MiniCelebration;

