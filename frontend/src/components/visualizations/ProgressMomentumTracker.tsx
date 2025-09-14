import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MomentumData {
  current: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  streakDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export const ProgressMomentumTracker: React.FC = () => {
  const [momentum, setMomentum] = useState<MomentumData>({
    current: 0.75,
    trend: 'increasing',
    streakDays: 7,
    weeklyGoal: 100,
    weeklyProgress: 68
  });

  const [dailyProgress] = useState([
    { day: 'Mon', value: 85 },
    { day: 'Tue', value: 92 },
    { day: 'Wed', value: 78 },
    { day: 'Thu', value: 95 },
    { day: 'Fri', value: 88 },
    { day: 'Sat', value: 75 },
    { day: 'Sun', value: 82 }
  ]);

  const getMomentumColor = (value: number) => {
    if (value >= 0.8) return '#10B981'; // Green
    if (value >= 0.6) return '#F59E0B'; // Amber
    if (value >= 0.4) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getMomentumMessage = (value: number, trend: string) => {
    if (value >= 0.8) {
      return trend === 'increasing' ? "You're on fire! 🔥" : "Great momentum! 💪";
    }
    if (value >= 0.6) {
      return trend === 'increasing' ? "Building steam! 📈" : "Steady progress 👍";
    }
    if (value >= 0.4) {
      return "Let's pick up the pace! ⚡";
    }
    return "Time to recharge 🔋";
  };

  // Simulate momentum changes
  useEffect(() => {
    const interval = setInterval(() => {
      setMomentum(prev => ({
        ...prev,
        current: Math.max(0, Math.min(1, prev.current + (Math.random() - 0.5) * 0.1)),
        weeklyProgress: Math.min(prev.weeklyGoal, prev.weeklyProgress + Math.random() * 2)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">Momentum Tracker</h3>

      {/* Main Momentum Display */}
      <div className="text-center mb-8">
        <motion.div
          className="relative w-32 h-32 mx-auto mb-4"
          animate={{
            scale: momentum.current > 0.8 ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: momentum.current > 0.8 ? Infinity : 0,
          }}
        >
          {/* Momentum Circle */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="8"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke={getMomentumColor(momentum.current)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${momentum.current * 351.86} 351.86`}
              initial={{ strokeDasharray: "0 351.86" }}
              animate={{ strokeDasharray: `${momentum.current * 351.86} 351.86` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: getMomentumColor(momentum.current) }}>
                {Math.round(momentum.current * 100)}%
              </div>
              <div className="text-xs text-gray-600">Momentum</div>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="text-lg font-medium"
          style={{ color: getMomentumColor(momentum.current) }}
          key={momentum.current} // Re-animate when momentum changes
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {getMomentumMessage(momentum.current, momentum.trend)}
        </motion.p>
      </div>

      {/* Streak Counter */}
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg px-4 py-2">
          <div className="text-center">
            <div className="text-2xl font-bold">{momentum.streakDays}</div>
            <div className="text-sm">Day Streak 🔥</div>
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
          <span className="text-sm text-gray-600">
            {Math.round(momentum.weeklyProgress)} / {momentum.weeklyGoal}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full relative overflow-hidden"
            initial={{ width: '0%' }}
            animate={{ width: `${(momentum.weeklyProgress / momentum.weeklyGoal) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
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

      {/* Daily Progress Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">This Week's Progress</h4>
        <div className="flex justify-between items-end space-x-2">
          {dailyProgress.map((day, index) => (
            <div key={day.day} className="flex-1 text-center">
              <motion.div
                className="bg-gradient-to-t from-blue-400 to-purple-500 rounded-t-lg mb-2 relative overflow-hidden"
                style={{ height: `${(day.value / 100) * 60}px` }}
                initial={{ height: 0 }}
                animate={{ height: `${(day.value / 100) * 60}px` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                {/* Sparkle effect for high values */}
                {day.value > 90 && (
                  <motion.div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 text-yellow-300"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  >
                    ✨
                  </motion.div>
                )}
              </motion.div>
              <div className="text-xs text-gray-600">{day.day}</div>
              <div className="text-xs font-medium text-gray-800">{day.value}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
