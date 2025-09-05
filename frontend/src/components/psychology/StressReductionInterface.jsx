import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const StressReductionInterface = () => {
  const [isActive, setIsActive] = useState(false);
  const [ambientMode, setAmbientMode] = useState('ocean');
  const stressLevel = useRef(0.3);

  const ambientThemes = {
    ocean: { colors: ['#0ea5e9', '#0284c7', '#0369a1'], particles: '🌊' },
    forest: { colors: ['#22c55e', '#16a34a', '#15803d'], particles: '🌿' },
    sunset: { colors: ['#f97316', '#ea580c', '#dc2626'], particles: '🌅' },
    space: { colors: ['#8b5cf6', '#7c3aed', '#6d28d9'], particles: '⭐' }
  };

  const currentTheme = ambientThemes[ambientMode];

  const getStressColor = (level) => {
    if (level < 0.3) return '#22c55e';
    if (level < 0.6) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Stress Monitor</h3>
        <div className="w-full bg-gray-700 rounded-full h-2 my-2">
          <motion.div
            className="h-2 rounded-full"
            style={{ backgroundColor: getStressColor(stressLevel.current) }}
            animate={{ width: `${stressLevel.current * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
      <div
        className="relative h-48 transition-all duration-1000"
        style={{ background: isActive ? `linear-gradient(135deg, ${currentTheme.colors.join(', ')})` : '#4B5563' }}
      >
        {isActive && Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -15, 0], opacity: [0.3, 0.7, 0.3], rotate: [0, 360] }}
            transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          >
            {currentTheme.particles}
          </motion.div>
        ))}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-20 h-20 rounded-full border-2 border-white border-opacity-50 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-white text-xs font-medium">Breathe</span>
            </motion.div>
          </div>
        )}
      </div>
       <div className="p-2">
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {Object.keys(ambientThemes).map((key) => (
                <button
                  key={key}
                  onClick={() => setAmbientMode(key)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all flex items-center justify-center ${ ambientMode === key ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'}`}
                  style={{backgroundColor: ambientThemes[key].colors[1]}}
                >
                  {ambientThemes[key].particles}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-gray-800' : 'bg-gray-700 text-white'}`}
            >
              {isActive ? 'Pause' : 'Activate'}
            </button>
          </div>
        </div>
    </div>
  );
};

export default StressReductionInterface;
