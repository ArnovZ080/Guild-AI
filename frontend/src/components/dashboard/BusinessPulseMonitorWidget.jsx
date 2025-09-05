import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRealtimeData } from '../../hooks/useDataService.js';

const BusinessPulseMonitorWidget = () => {
  const { data: pulseData, isLoading, error } = useRealtimeData('businessPulse', {
    intensity: 0.7,
    activities: [
      { type: 'sales', count: 3 },
      { type: 'content', count: 5 },
      { type: 'support', count: 2 },
      { type: 'leads', count: 8 }
    ]
  });

  // Fallback to simulated data if real data is not available
  useEffect(() => {
    if (!pulseData && !isLoading) {
      console.log('Using simulated data for Business Pulse Monitor');
    }
  }, [pulseData, isLoading]);

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

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg h-full text-white flex flex-col items-center justify-center">
        <h3 className="font-semibold mb-4">Business Pulse</h3>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg h-full text-white flex flex-col items-center justify-center">
        <h3 className="font-semibold mb-4">Business Pulse</h3>
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ Connection Error</div>
          <div className="text-sm text-gray-400">Using simulated data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg h-full text-white flex flex-col items-center justify-center">
      <h3 className="font-semibold mb-4">Business Pulse</h3>
      <div className="relative w-64 h-64">
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
            <div className="text-sm opacity-80">Business Health</div>
          </div>
        </div>
      </div>
      
      {/* Activity Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {pulseData.activities.map((activity) => (
          <div key={activity.type} className="flex items-center">
            <div 
              className="w-2 h-2 rounded-full mr-2" 
              style={{ backgroundColor: getActivityColor(activity.type) }}
            />
            <span className="capitalize">{activity.type}: {activity.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessPulseMonitorWidget;
