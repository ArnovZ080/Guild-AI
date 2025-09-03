import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ProgressMomentumTracker = () => {
  const [momentum, setMomentum] = useState({
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

  const getMomentumColor = (value) => {
    if (value >= 0.8) return '#10B981'; // Green
    if (value >= 0.6) return '#F59E0B'; // Amber
    if (value >= 0.4) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getMomentumMessage = (value, trend) => {
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
    <div className="w-full bg-gray-800 text-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6" data-testid="momentum-tracker-header">Momentum Tracker</h3>
      <div className="text-center mb-8">
        <motion.div
          className="relative w-32 h-32 mx-auto mb-4"
          animate={{ scale: momentum.current > 0.8 ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 2, repeat: momentum.current > 0.8 ? Infinity : 0 }}
        >
          <svg className="w-full h-full -rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="#4B5563" strokeWidth="8" />
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: getMomentumColor(momentum.current) }}>
                {Math.round(momentum.current * 100)}%
              </div>
              <div className="text-xs text-gray-400">Momentum</div>
            </div>
          </div>
        </motion.div>
        <motion.p
          className="text-lg font-medium"
          style={{ color: getMomentumColor(momentum.current) }}
          key={momentum.current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {getMomentumMessage(momentum.current, momentum.trend)}
        </motion.p>
      </div>
    </div>
  );
};

export default ProgressMomentumTracker;
