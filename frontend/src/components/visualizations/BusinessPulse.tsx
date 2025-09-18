import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePsychologicalOptimization } from '../../contexts/PsychologicalOptimizationContext';

// Enhanced mock hook with psychological elements
const useBusinessMetrics = () => ({
  metrics: {
    data: {
      intensity: 0.75,
      activities: [
        { type: 'sales', count: 3 },
        { type: 'content', count: 5 },
        { type: 'support', count: 2 },
        { type: 'leads', count: 8 }
      ],
      activity_level: 70,
      business_health: 'healthy',
      primary_metric: 'Strong',
      historical_data: [30, 40, 20, 50, 45, 60, 70],
      momentum_score: 75,
      revenue_momentum: 'up',
      customer_engagement: 85,
      agent_efficiency: 78
    }
  },
  loading: false
});

const BusinessPulse: React.FC = () => {
  const { metrics, loading } = useBusinessMetrics();
  const { state: psychState, getCurrentMode } = usePsychologicalOptimization();
  const [pulseSpeed, setPulseSpeed] = useState(1.5);
  const [pulseColor, setPulseColor] = useState('#10B981');
  const [momentumLevel, setMomentumLevel] = useState('moderate');

  const currentMode = getCurrentMode();

  useEffect(() => {
    if (metrics?.data?.activity_level) {
      const newSpeed = 2.5 - (metrics.data.activity_level / 100) * 2;
      setPulseSpeed(newSpeed);
    }

    if (metrics?.data?.business_health) {
      const healthColors = {
        healthy: '#22C55E', // Forest growth
        warning: '#F59E0B', // Warning warm
        critical: '#EF4444', // Red
      };
      setPulseColor(healthColors[metrics.data.business_health as keyof typeof healthColors] || '#22C55E');
    }

    // Update momentum level based on multiple factors
    const momentumScore = metrics?.data?.momentum_score || psychState.achievementSystem.momentumScore;
    if (momentumScore >= 80) setMomentumLevel('high');
    else if (momentumScore >= 60) setMomentumLevel('moderate');
    else if (momentumScore >= 40) setMomentumLevel('low');
    else setMomentumLevel('recovery');
  }, [metrics, psychState.achievementSystem.momentumScore]);

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          border: 'border-sky-morning/30',
          text: 'text-sky-dusk'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          border: 'border-forest-spring/30',
          text: 'text-forest-deep'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          border: 'border-earth-warm/30',
          text: 'text-earth-sand'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          border: 'border-forest-spring/30',
          text: 'text-forest-deep'
        };
    }
  };

  const modeStyles = getModeStyles();

  const getActivityColor = (type: string) => {
    const colors = {
      sales: '#FFD700', // Gold
      content: '#87CEEB', // Sky blue
      support: '#98FB98', // Pale green
      leads: '#DDA0DD' // Plum
    };
    return colors[type as keyof typeof colors] || '#FFFFFF';
  };

  const getMomentumAnimation = () => {
    switch (momentumLevel) {
      case 'high':
        return {
          scale: [1, 1.1, 1],
          rotate: [0, 2, -2, 0],
          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        };
      case 'moderate':
        return {
          scale: [1, 1.05, 1],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
      case 'low':
        return {
          opacity: [0.8, 1, 0.8],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        };
      case 'recovery':
        return {
          scale: [0.98, 1, 0.98],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      default:
        return {
          scale: [1, 1.02, 1],
          transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        };
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 2 / (metrics?.data?.intensity || 0.7),
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const linePath = useMemo(() => {
    if (!metrics?.data?.historical_data) return "M0,50 Q25,20 50,50 T100,50";

    const data = metrics.data.historical_data;
    const width = 100;
    const height = 100;
    const points = data.map((d: number, i: number) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d / 100) * height;
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  }, [metrics]);

  return (
    <motion.div 
      className={`relative w-full h-48 flex items-center justify-center bg-gradient-to-br ${modeStyles.background} rounded-xl border-2 ${modeStyles.border} shadow-lg overflow-hidden`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <AnimatePresence>
        {loading ? (
          <div className="animate-pulse h-full w-full bg-white/20 rounded-lg"></div>
        ) : (
          <>
            {/* Main Pulse Circle - Original Creator's Vision */}
            <motion.div
              className="absolute inset-0 rounded-full"
              variants={pulseVariants}
              animate="animate"
              style={{
                background: `radial-gradient(circle, rgba(59, 130, 246, ${metrics?.data?.intensity || 0.7}) 0%, rgba(16, 185, 129, ${(metrics?.data?.intensity || 0.7) * 0.5}) 100%)`
              }}
            />
            
            {/* Activity Particles - Original Creator's Vision */}
            {metrics?.data?.activities?.map((activity: any, index: number) => (
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

            {/* Historical Data Visualization */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute">
              <motion.path
                d={linePath}
                fill="none"
                stroke={pulseColor}
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
            
            {/* Center Info */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <motion.div 
                  className="text-2xl font-bold"
                  animate={getMomentumAnimation()}
                >
                  {Math.round((metrics?.data?.intensity || 0.7) * 100)}%
                </motion.div>
                <div className="text-sm opacity-80">Business Health</div>
                <div className="text-xs opacity-60 mt-1">
                  Momentum: {momentumLevel.charAt(0).toUpperCase() + momentumLevel.slice(1)}
                </div>
              </div>
            </div>

            {/* Activity Indicators */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-1">
              {metrics?.data?.activities?.map((activity: any) => (
                <div key={activity.type} className="flex items-center space-x-1">
                  <div 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: getActivityColor(activity.type) }}
                  />
                  <span className="text-xs text-white/70">{activity.count}</span>
                </div>
              ))}
            </div>

            {/* Momentum Indicators */}
            <div className="absolute top-2 left-2 space-y-1">
              <div className="flex items-center space-x-1">
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: metrics?.data?.revenue_momentum === 'up' ? '#22C55E' : '#F59E0B' }}
                />
                <span className="text-xs text-white/70">
                  {metrics?.data?.revenue_momentum === 'up' ? '↗' : '→'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                <span className="text-xs text-white/70">
                  {metrics?.data?.customer_engagement}%
                </span>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BusinessPulse;
