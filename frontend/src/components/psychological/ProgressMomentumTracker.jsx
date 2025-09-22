import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, CheckCircle } from 'lucide-react';

export const ProgressMomentumTracker = () => {
  const [momentumData, setMomentumData] = useState({
    currentMomentum: 0.75,
    dailyProgress: [
      { day: 'Mon', value: 0.6, tasks: 8 },
      { day: 'Tue', value: 0.8, tasks: 12 },
      { day: 'Wed', value: 0.9, tasks: 15 },
      { day: 'Thu', value: 0.7, tasks: 10 },
      { day: 'Fri', value: 0.85, tasks: 13 },
      { day: 'Sat', value: 0.4, tasks: 5 },
      { day: 'Sun', value: 0.3, tasks: 3 }
    ],
    weeklyGoal: 100,
    completedTasks: 66,
    streak: 5
  });

  const getMomentumColor = (momentum) => {
    if (momentum >= 0.8) return '#10B981'; // Green
    if (momentum >= 0.6) return '#F59E0B'; // Amber  
    if (momentum >= 0.4) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getMomentumMessage = (momentum) => {
    if (momentum >= 0.8) return "🔥 You're on fire! Keep this momentum going!";
    if (momentum >= 0.6) return "⚡ Good momentum! Push a little harder!";
    if (momentum >= 0.4) return "🚀 Building momentum! You've got this!";
    return "💪 Time to restart! Every expert was once a beginner.";
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 rounded-2xl p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
          Progress Momentum
        </h3>
        <p className="text-gray-600">{getMomentumMessage(momentumData.currentMomentum)}</p>
      </div>

      {/* Current Momentum Gauge */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Current Momentum</span>
          <span className="text-2xl font-bold" style={{ color: getMomentumColor(momentumData.currentMomentum) }}>
            {Math.round(momentumData.currentMomentum * 100)}%
          </span>
        </div>
        
        <div className="relative">
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${getMomentumColor(momentumData.currentMomentum)}, ${getMomentumColor(momentumData.currentMomentum)}aa)`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${momentumData.currentMomentum * 100}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Momentum flow animation */}
          <motion.div
            className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
            animate={{ x: [-32, window.innerWidth] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ 
              width: '32px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
            }}
          />
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">This Week's Journey</h4>
        <div className="flex items-end justify-between h-32 bg-gray-50 rounded-xl p-4">
          {momentumData.dailyProgress.map((day, index) => (
            <motion.div
              key={day.day}
              className="flex flex-col items-center flex-1"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className="w-6 rounded-t-lg"
                style={{ 
                  height: `${day.value * 80}px`,
                  background: `linear-gradient(to top, ${getMomentumColor(day.value)}, ${getMomentumColor(day.value)}cc)`
                }}
                initial={{ height: 0 }}
                animate={{ height: `${day.value * 80}px` }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
              />
              <span className="text-xs text-gray-600 mt-2">{day.day}</span>
              <span className="text-xs font-medium text-gray-800">{day.tasks}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div 
          className="text-center p-4 bg-white rounded-xl shadow-sm border"
          whileHover={{ scale: 1.05 }}
        >
          <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-gray-900">{momentumData.completedTasks}</div>
          <div className="text-sm text-gray-600">Tasks Done</div>
        </motion.div>

        <motion.div 
          className="text-center p-4 bg-white rounded-xl shadow-sm border"
          whileHover={{ scale: 1.05 }}
        >
          <Clock className="w-8 h-8 mx-auto mb-2 text-amber-600" />
          <div className="text-2xl font-bold text-gray-900">{momentumData.streak}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </motion.div>

        <motion.div 
          className="text-center p-4 bg-white rounded-xl shadow-sm border"
          whileHover={{ scale: 1.05 }}
        >
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-gray-900">
            {Math.round((momentumData.completedTasks / momentumData.weeklyGoal) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Weekly Goal</div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressMomentumTracker;
