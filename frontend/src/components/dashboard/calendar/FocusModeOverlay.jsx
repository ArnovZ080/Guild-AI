import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Pause, Play, SkipForward, X, Coffee } from 'lucide-react';

const FocusModeOverlay = ({ onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(true);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    if (!isBreak) {
      // Completed a focus session
      setSessionsCompleted(prev => prev + 1);
      
      // Start break (5 min for short break, 15 min after 4 sessions)
      const breakTime = sessionsCompleted % 4 === 3 ? 15 * 60 : 5 * 60;
      setTimeLeft(breakTime);
      setIsBreak(true);
    } else {
      // Completed a break
      setTimeLeft(25 * 60);
      setIsBreak(false);
    }
    
    setIsRunning(true);
    
    // Play notification sound (if available)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(isBreak ? 'Break Over!' : 'Focus Session Complete!', {
        body: isBreak ? 'Time to focus again' : 'Take a short break',
        icon: '/favicon.ico'
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = isBreak 
      ? (sessionsCompleted % 4 === 3 ? 15 * 60 : 5 * 60)
      : 25 * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const handleSkip = () => {
    setTimeLeft(0);
    handleTimerComplete();
  };

  return (
    <motion.div
      className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl z-50 w-80 overflow-hidden"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      {/* Header */}
      <div className={`p-4 text-white ${
        isBreak 
          ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
          : 'bg-gradient-to-r from-orange-500 to-red-600'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {isBreak ? <Coffee className="w-5 h-5" /> : <Target className="w-5 h-5" />}
            <h3 className="font-bold">
              {isBreak ? 'Break Time' : 'Focus Mode'}
            </h3>
          </div>
          <button
            onClick={onEnd}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm opacity-90">
          Session {sessionsCompleted + 1} {isBreak ? '(Break)' : '(Work)'}
        </p>
      </div>

      {/* Timer */}
      <div className="p-6">
        {/* Circular Progress */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke={isBreak ? '#10b981' : '#f97316'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - getProgress() / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">
                {isBreak ? 'Rest up' : 'Stay focused'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            {isRunning ? (
              <Pause className="w-5 h-5 text-gray-700" />
            ) : (
              <Play className="w-5 h-5 text-gray-700" />
            )}
          </button>
          
          <button
            onClick={handleSkip}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <SkipForward className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Session Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2, 3].map((session) => (
            <div
              key={session}
              className={`w-2 h-2 rounded-full ${
                session < sessionsCompleted 
                  ? isBreak ? 'bg-green-500' : 'bg-orange-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="px-6 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-900">
            <strong>💡 Tip:</strong> {
              isBreak 
                ? 'Stretch, walk around, or grab some water. You earned it!'
                : 'Minimize distractions. Close unnecessary tabs and silence notifications.'
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default FocusModeOverlay;

