import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const BusinessPulseMonitorWidget = () => {
  const [pulseData, setPulseData] = useState({
    intensity: 0.7,
    activities: [
      { type: 'sales', count: 3 },
      { type: 'content', count: 5 },
      { type: 'support', count: 2 },
      { type: 'leads', count: 8 }
    ]
  });

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 2 / pulseData.intensity,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const getActivityColor = (type) => {
    const colors = {
      sales: '#FFD700', // Gold
      content: '#87CEEB', // Sky blue
      support: '#98FB98', // Pale green
      leads: '#DDA0DD' // Plum
    };
    return colors[type] || '#FFFFFF';
  };

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Main Pulse Circle */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-green-400"
        variants={pulseVariants}
        animate="animate"
        style={{
          background: `radial-gradient(circle, rgba(59, 130, 246, ${pulseData.intensity}) 0%, rgba(16, 185, 129, ${pulseData.intensity * 0.5}) 100%)`
        }}
      />

      {/* Activity Particles */}
      {pulseData.activities.map((activity, index) => (
        <div key={activity.type}>
          {Array.from({ length: activity.count }).map((_, particleIndex) => (
            <motion.div
              key={`${activity.type}-${particleIndex}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: getActivityColor(activity.type),
                left: `${50 + 30 * Math.cos((index * 90 + particleIndex * 20) * Math.PI / 180)}%`,
                top: `${50 + 30 * Math.sin((index * 90 + particleIndex * 20) * Math.PI / 180)}%`,
              }}
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: particleIndex * 0.2,
              }}
            />
          ))}
        </div>
      ))}

      {/* Center Info */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-2xl font-bold">
            {Math.round(pulseData.intensity * 100)}%
          </div>
          <div className="text-sm opacity-80">Health</div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPulseMonitorWidget;
