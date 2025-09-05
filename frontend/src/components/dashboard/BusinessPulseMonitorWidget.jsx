import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BusinessPulseMonitorWidget = () => {
  const [pulseData, setPulseData] = useState({
    intensity: 0.75,
    rhythm: 1.2,
    activities: [
      { type: 'sales', count: 3, color: '#FFD700' },
      { type: 'content', count: 5, color: '#87CEEB' },
      { type: 'support', count: 2, color: '#98FB98' },
      { type: 'leads', count: 8, color: '#DDA0DD' }
    ]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseData(prev => ({
        ...prev,
        intensity: Math.max(0.3, Math.min(1.0, prev.intensity + (Math.random() - 0.5) * 0.1)),
        activities: prev.activities.map(activity => ({
          ...activity,
          count: Math.max(1, activity.count + Math.floor((Math.random() - 0.5) * 2))
        }))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 rounded-2xl relative overflow-hidden" style={{
      background: 'linear-gradient(to bottom right, #111827, #1f2937, #111827)',
      color: 'white'
    }}>
      {/* Ambient background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <span className="mr-2">💓</span>
          Business Pulse
        </h3>
        
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            {/* Main pulse circle */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-blue-400"
              animate={{
                scale: [1, 1.1, 1],
                borderColor: ['#60A5FA', '#34D399', '#60A5FA'],
              }}
              transition={{
                duration: 2 / pulseData.intensity,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Inner glow */}
            <motion.div
              className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500/20 to-green-500/20"
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2 / pulseData.intensity,
                repeat: Infinity,
              }}
            />
            
            {/* Center display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(pulseData.intensity * 100)}%
                </div>
                <div className="text-xs opacity-80">Health</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity indicators */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {pulseData.activities.map((activity, index) => (
            <motion.div
              key={activity.type}
              className="flex items-center p-2 rounded-lg"
            style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)' }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: activity.color }}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />
              <span className="capitalize flex-1">{activity.type}</span>
              <span className="font-medium">{activity.count}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessPulseMonitorWidget;