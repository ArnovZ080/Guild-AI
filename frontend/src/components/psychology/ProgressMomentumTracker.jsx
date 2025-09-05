import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ProgressMomentumTracker = () => {
  const [momentumData, setMomentumData] = useState({
    currentMomentum: 0.75,
    dailyProgress: [
      { day: 'Mon', value: 0.6, tasks: 8 },
      { day: 'Tue', value: 0.8, tasks: 12 },
      { day: 'Wed', value: 0.4, tasks: 5 },
      { day: 'Thu', value: 0.9, tasks: 15 },
      { day: 'Fri', value: 0.7, tasks: 10 },
      { day: 'Sat', value: 0.3, tasks: 3 },
      { day: 'Sun', value: 0.5, tasks: 6 }
    ],
    weeklyGoal: 100,
    completedTasks: 59
  });

  // Simulate momentum changes
  useEffect(() => {
    const interval = setInterval(() => {
      setMomentumData(prev => ({
        ...prev,
        currentMomentum: Math.max(0.1, Math.min(1.0, prev.currentMomentum + (Math.random() - 0.5) * 0.1)),
        completedTasks: prev.completedTasks + Math.floor(Math.random() * 2)
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getMomentumColor = (momentum) => {
    if (momentum < 0.3) return '#EF4444'; // Red
    if (momentum < 0.6) return '#F59E0B'; // Orange
    if (momentum < 0.8) return '#10B981'; // Green
    return '#8B5CF6'; // Purple
  };

  const getMomentumEmoji = (momentum) => {
    if (momentum < 0.3) return '😴';
    if (momentum < 0.6) return '😐';
    if (momentum < 0.8) return '😊';
    return '🚀';
  };

  return (
    <div className="w-full bg-gray-800 text-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6" data-testid="momentum-tracker-header">Momentum Tracker</h3>
      
      {/* Current Momentum Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Current Momentum</span>
          <span className="text-2xl">{getMomentumEmoji(momentumData.currentMomentum)}</span>
        </div>
        
        {/* Wave-like momentum visualization */}
        <div className="relative h-16 bg-gray-700 rounded-lg overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, ${getMomentumColor(momentumData.currentMomentum)} 0%, ${getMomentumColor(momentumData.currentMomentum)}80 100%)`
            }}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          
          {/* Wave animation */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,10 Q25,0 50,10 T100,10 V20 H0 Z' fill='white' opacity='0.1'/%3E%3C/svg%3E") repeat-x`,
            }}
            animate={{
              x: ['-100px', '0px'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">
              {Math.round(momentumData.currentMomentum * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Progress Waves */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Weekly Rhythm</h4>
        <div className="flex items-end justify-between h-20">
          {momentumData.dailyProgress.map((day, index) => (
            <div key={day.day} className="flex flex-col items-center flex-1">
              <motion.div
                className="w-full rounded-t-sm relative overflow-hidden"
                style={{
                  height: `${day.value * 60}px`,
                  backgroundColor: getMomentumColor(day.value),
                }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.1,
                }}
              >
                {/* Wave effect */}
                <motion.div
                  className="absolute inset-0 bg-white opacity-20"
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
              <div className="text-xs text-gray-400 mt-1">{day.day}</div>
              <div className="text-xs text-gray-500">{day.tasks}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Goal Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Weekly Goal</span>
          <span className="text-sm font-medium">
            {momentumData.completedTasks} / {momentumData.weeklyGoal}
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full rounded-full relative"
            style={{
              width: `${(momentumData.completedTasks / momentumData.weeklyGoal) * 100}%`,
              background: `linear-gradient(90deg, ${getMomentumColor(momentumData.currentMomentum)} 0%, ${getMomentumColor(momentumData.currentMomentum)}80 100%)`
            }}
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            {/* Flowing animation */}
            <motion.div
              className="absolute inset-0 bg-white opacity-30"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Momentum Insights */}
      <div className="text-xs text-gray-400">
        {momentumData.currentMomentum > 0.8 && "🚀 You're on fire! Keep the momentum going!"}
        {momentumData.currentMomentum > 0.6 && momentumData.currentMomentum <= 0.8 && "😊 Great progress! You're in the flow."}
        {momentumData.currentMomentum > 0.3 && momentumData.currentMomentum <= 0.6 && "😐 Steady progress. Consider taking a break to recharge."}
        {momentumData.currentMomentum <= 0.3 && "😴 Low energy detected. Try a quick walk or meditation."}
      </div>
    </div>
  );
};

export default ProgressMomentumTracker;
