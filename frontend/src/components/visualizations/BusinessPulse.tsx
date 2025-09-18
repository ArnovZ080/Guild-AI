import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BusinessMetrics {
  intensity: number;
  revenue: number;
  customerSatisfaction: number;
  activeAgents: number;
  momentumScore: number;
  trend: 'up' | 'stable' | 'down';
}

export const BusinessPulse: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics>({
      intensity: 0.75,
    revenue: 85000,
    customerSatisfaction: 92,
    activeAgents: 6,
    momentumScore: 78,
    trend: 'up'
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        intensity: Math.max(0.3, Math.min(1, prev.intensity + (Math.random() - 0.5) * 0.1)),
        revenue: prev.revenue + Math.floor((Math.random() - 0.5) * 1000),
        customerSatisfaction: Math.max(70, Math.min(100, prev.customerSatisfaction + (Math.random() - 0.5) * 2)),
        activeAgents: Math.max(3, Math.min(8, prev.activeAgents + Math.floor((Math.random() - 0.5) * 2))),
        momentumScore: Math.max(30, Math.min(100, prev.momentumScore + (Math.random() - 0.5) * 3))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const calculatePulseIntensity = (metrics: BusinessMetrics) => {
    const revenueScore = metrics.trend === 'up' ? 5 : metrics.trend === 'stable' ? 3 : 1;
    const engagementScore = metrics.customerSatisfaction > 90 ? 4 : metrics.customerSatisfaction > 70 ? 2 : 1;
    const activityScore = metrics.activeAgents > 5 ? 3 : metrics.activeAgents > 2 ? 2 : 1;

    const totalScore = revenueScore * 0.5 + engagementScore * 0.3 + activityScore * 0.2;

    if (totalScore >= 4) return { amplitude: 'high', frequency: 'fast', color: 'vibrant' };
    if (totalScore >= 2.5) return { amplitude: 'medium', frequency: 'moderate', color: 'balanced' };
    return { amplitude: 'low', frequency: 'slow', color: 'muted' };
  };

  const pulseConfig = calculatePulseIntensity(metrics);

  const getPulseColor = (config: any) => {
    const colors = {
      vibrant: '#10B981', // Green
      balanced: '#F59E0B', // Amber  
      muted: '#6B7280' // Gray
    };
    return colors[config.color as keyof typeof colors] || colors.balanced;
  };

  const getPulseAmplitude = (config: any) => {
    const amplitudes = {
      high: 1.2,
      medium: 1.0,
      low: 0.8
    };
    return amplitudes[config.amplitude as keyof typeof amplitudes] || 1.0;
  };

  const getPulseFrequency = (config: any) => {
    const frequencies = {
      fast: 1.5,
      moderate: 2.0,
      slow: 3.0
    };
    return frequencies[config.frequency as keyof typeof frequencies] || 2.0;
  };

  const pulseColor = getPulseColor(pulseConfig);
  const pulseAmplitude = getPulseAmplitude(pulseConfig);
  const pulseFrequency = getPulseFrequency(pulseConfig);

  return (
    <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 relative overflow-hidden">
      {/* Main Pulse Visualization */}
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          {/* Pulse Wave */}
          <motion.div
            className="w-32 h-32 rounded-full border-4 relative overflow-hidden"
            style={{ borderColor: pulseColor }}
            animate={{
              scale: [1, pulseAmplitude, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: pulseFrequency,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {/* Inner Pulse */}
            <motion.div
              className="absolute inset-4 rounded-full"
              style={{ backgroundColor: pulseColor }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: pulseFrequency * 0.8,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            {/* Center Info */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-lg font-bold" style={{ color: pulseColor }}>
                  {Math.round(metrics.intensity * 100)}%
                </div>
                <div className="text-xs opacity-80">Business Health</div>
              </div>
            </div>
          </motion.div>

          {/* Pulse Ripples */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute inset-0 rounded-full border-2 opacity-30"
              style={{ 
                borderColor: pulseColor,
                scale: 1 + (ring * 0.3)
              }}
              animate={{
                scale: [1 + (ring * 0.3), 1.5 + (ring * 0.3), 1 + (ring * 0.3)],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{
                duration: pulseFrequency + (ring * 0.5),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: ring * 0.2
              }}
            />
          ))}
        </div>
      </div>

      {/* Metrics Display */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white bg-opacity-80 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Revenue</div>
            <div className="text-sm font-bold text-gray-800">
              ${metrics.revenue.toLocaleString()}
            </div>
            <div className={`text-xs ${metrics.trend === 'up' ? 'text-green-600' : metrics.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
              {metrics.trend === 'up' ? '↗' : metrics.trend === 'down' ? '↘' : '→'}
            </div>
          </div>
          
          <div className="bg-white bg-opacity-80 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Satisfaction</div>
            <div className="text-sm font-bold text-gray-800">
              {metrics.customerSatisfaction}%
            </div>
            <div className="text-xs text-green-600">😊</div>
          </div>
          
          <div className="bg-white bg-opacity-80 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Active Agents</div>
            <div className="text-sm font-bold text-gray-800">
              {metrics.activeAgents}
            </div>
            <div className="text-xs text-blue-600">⚡</div>
          </div>
          
          <div className="bg-white bg-opacity-80 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Momentum</div>
            <div className="text-sm font-bold text-gray-800">
              {Math.round(metrics.momentumScore)}%
            </div>
            <div className="text-xs text-purple-600">🚀</div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        <div className="bg-white bg-opacity-80 rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: pulseColor }}
            />
            <span className="text-xs font-medium text-gray-700">
              {pulseConfig.color === 'vibrant' ? 'Excellent' : 
               pulseConfig.color === 'balanced' ? 'Good' : 'Needs Attention'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPulse;
