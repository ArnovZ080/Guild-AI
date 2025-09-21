import React, { useState, useEffect } from 'react';
// Removed motion imports to fix circular reference

// Celebration Types
export const CelebrationType = {
  TASK_COMPLETE: 'task_complete',
  MILESTONE: 'milestone',
  STREAK: 'streak',
  EFFICIENCY: 'efficiency',
  COLLABORATION: 'collaboration',
  BREAKTHROUGH: 'breakthrough'
};

// Simple celebration hook without motion dependencies
export const useCelebrations = () => {
  const [activeCelebrations, setActiveCelebrations] = useState([]);

  const triggerCelebration = (config) => {
    console.log('🎉 Celebration triggered:', config);
    
    // Simple celebration without motion
    const celebration = {
      id: Date.now(),
      message: config.message || 'Great job!',
      emoji: config.emoji || '🎉',
      timestamp: new Date()
    };

    setActiveCelebrations(prev => [...prev, celebration]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setActiveCelebrations(prev => prev.filter(c => c.id !== celebration.id));
    }, 3000);
  };

  return {
    triggerCelebration,
    activeCelebrations
  };
};

// Simple celebration provider
export const CelebrationProvider = ({ children }) => {
  const celebrationData = useCelebrations();
  
  return (
    <div>
      {children}
      {/* Simple celebration display without motion */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {celebrationData.activeCelebrations.map(celebration => (
          <div
            key={celebration.id}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
          >
            <span>{celebration.emoji}</span>
            <span>{celebration.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
