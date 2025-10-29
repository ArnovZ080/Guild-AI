import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import AchievementCelebration, { AchievementNotification } from './AchievementCelebration';
import achievementTracker from '../../services/achievementTracker';

/**
 * Celebration Provider
 * 
 * Wraps the app and listens for achievement events to trigger celebrations.
 * Can show either full-screen celebrations or smaller notifications.
 */
const CelebrationProvider = ({ children, celebrationMode = 'full' }) => {
  const [currentCelebration, setCurrentCelebration] = useState(null);
  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const [notificationQueue, setNotificationQueue] = useState([]);

  // Listen for achievement events
  useEffect(() => {
    const handleAchievementUnlocked = (event) => {
      const achievement = event.detail;
      
      if (celebrationMode === 'full') {
        // Add to celebration queue
        setCelebrationQueue(prev => [...prev, achievement]);
      } else {
        // Add to notification queue
        setNotificationQueue(prev => [...prev, achievement]);
      }
    };

    window.addEventListener('achievement-unlocked', handleAchievementUnlocked);
    
    return () => {
      window.removeEventListener('achievement-unlocked', handleAchievementUnlocked);
    };
  }, [celebrationMode]);

  // Process celebration queue
  useEffect(() => {
    if (!currentCelebration && celebrationQueue.length > 0) {
      setCurrentCelebration(celebrationQueue[0]);
      setCelebrationQueue(prev => prev.slice(1));
    }
  }, [currentCelebration, celebrationQueue]);

  const handleCloseCelebration = useCallback(() => {
    setCurrentCelebration(null);
  }, []);

  const handleCloseNotification = useCallback((achievementId) => {
    setNotificationQueue(prev => prev.filter(a => a.id !== achievementId));
  }, []);

  return (
    <>
      {children}
      
      {/* Full-screen celebrations */}
      <AnimatePresence>
        {currentCelebration && (
          <AchievementCelebration
            achievement={currentCelebration}
            onClose={handleCloseCelebration}
            autoClose={true}
          />
        )}
      </AnimatePresence>

      {/* Notification toasts */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        <AnimatePresence>
          {notificationQueue.map(achievement => (
            <AchievementNotification
              key={achievement.id}
              achievement={achievement}
              onClose={() => handleCloseNotification(achievement.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

/**
 * Hook to manually trigger celebrations
 */
export const useCelebration = () => {
  const triggerCelebration = useCallback((achievement) => {
    const event = new CustomEvent('achievement-unlocked', {
      detail: achievement
    });
    window.dispatchEvent(event);
  }, []);

  return { triggerCelebration };
};

/**
 * Hook to register for achievement notifications
 */
export const useAchievementListener = (callback) => {
  useEffect(() => {
    return achievementTracker.onAchievementUnlocked(callback);
  }, [callback]);
};

export default CelebrationProvider;

