import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ProgressMomentumTracker = () => {
  const [momentum, setMomentum] = useState(0.75);
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', value: 0.6, energy: 'steady' },
    { day: 'Tue', value: 0.8, energy: 'high' },
    { day: 'Wed', value: 0.4, energy: 'low' },
    { day: 'Thu', value: 0.9, energy: 'peak' },
    { day: 'Fri', value: 0.7, energy: 'good' },
    { day: 'Sat', value: 0.3, energy: 'rest' },
    { day: 'Sun', value: 0.5, energy: 'building' }
  ]);

  const getMomentumColor = (value) => {
    if (value < 0.3) return '#EF4444';
    if (value < 0.6) return '#F59E0B';
    if (value < 0.8) return '#10B981';
    return '#8B5CF6';
  };

  const getMomentumMessage = (value) => {
    if (value < 0.3) return { emoji: '😴', message: 'Recharge time - consider a break' };
    if (value < 0.6) return { emoji: '😐', message: 'Steady progress - keep building' };
    if (value < 0.8) return { emoji: '😊', message: 'Great flow - you\'re in the zone!' };
    return { emoji: '🚀', message: 'Incredible momentum - unstoppable!' };
  };

  const currentMessage = getMomentumMessage(momentum);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl text-white">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <span className="mr-2">🌊</span>
        Momentum Flow
      </h3>

      {/* Current momentum display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-300">Current Flow</span>
          <span className="text-2xl">{currentMessage.emoji}</span>
        </div>
        
        <div className="relative h-16 bg-gray-800/50 rounded-xl overflow-hidden">
          {/* Wave background */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: `linear-gradient(90deg, ${getMomentumColor(momentum)} 0%, transparent 100%)`
            }}
          />
          
          {/* Flowing wave animation */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: `url("data:image/svg+xml,%3Csvg width='100' height='64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,32 Q25,16 50,32 T100,32 Q125,48 150,32 T200,32 V64 H0 Z' fill='white'/%3E%3C/svg%3E") repeat-x`,
              backgroundSize: '200px 64px'
            }}
            animate={{
              x: ['-200px', '0px'],
            }}
            transition={{
              duration: 4 / momentum,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">
              {Math.round(momentum * 100)}%
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-400 mt-2">{currentMessage.message}</p>
      </div>

      {/* Weekly rhythm */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Weekly Rhythm</h4>
        <div className="flex justify-between items-end h-20 bg-gray-800/30 rounded-lg p-2">
          {weeklyData.map((day, index) => (
            <div key={day.day} className="flex flex-col items-center space-y-1">
              <motion.div
                className="w-6 rounded-t-lg relative overflow-hidden"
                style={{
                  height: `${day.value * 60}px`,
                  backgroundColor: getMomentumColor(day.value),
                }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.1,
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{
                    y: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2 + day.value,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                />
              </motion.div>
              <span className="text-xs text-gray-400">{day.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressMomentumTracker;