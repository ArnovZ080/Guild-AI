// src/components/achievements/AchievementNarrative.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementNarrative = ({ achievement, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [narrativeStage, setNarrativeStage] = useState(0);

  const generateNarrative = (achievement) => {
    const narratives = {
      'content_consistency': {
        title: 'Content Momentum Building',
        stages: [
          "You've maintained consistent content creation for a full week!",
          "This consistency is building your brand authority and audience trust.",
          "Your audience is beginning to recognize your expertise and reliability.",
          "This foundation will support sustainable business growth."
        ],
        celebration: '🚀',
        color: 'from-forest-mist to-success-gentle',
        impact: 'Brand Authority +15%'
      },
      'lead_conversion': {
        title: 'Sales Excellence Achievement',
        stages: [
          "Congratulations! You've achieved a 25% increase in lead conversion.",
          "This improvement demonstrates the effectiveness of your refined sales process.",
          "Your enhanced approach is creating stronger connections with prospects.",
          "This momentum will accelerate your revenue growth trajectory."
        ],
        celebration: '💰',
        color: 'from-earth-sand to-warning-warm',
        impact: 'Revenue Potential +25%'
      }
    };

    return narratives[achievement.type] || narratives['content_consistency'];
  };

  const narrative = generateNarrative(achievement);

  useEffect(() => {
    const timer = setInterval(() => {
      setNarrativeStage(prev => {
        if (prev < narrative.stages.length - 1) {
          return prev + 1;
        } else {
          setTimeout(() => setIsVisible(false), 2000);
          return prev;
        }
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [narrative.stages.length]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 max-w-sm z-50"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <div className={`bg-gradient-to-r ${narrative.color} p-6 rounded-xl shadow-2xl border border-white/20`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <span className="text-3xl mr-3">{narrative.celebration}</span>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{narrative.title}</h3>
                  <p className="text-sm text-muted-foreground">{narrative.impact}</p>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            <motion.div
              key={narrativeStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-sm text-foreground leading-relaxed"
            >
              {narrative.stages[narrativeStage]}
            </motion.div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-1">
                {narrative.stages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= narrativeStage ? 'bg-foreground' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {narrativeStage + 1} of {narrative.stages.length}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementNarrative;
