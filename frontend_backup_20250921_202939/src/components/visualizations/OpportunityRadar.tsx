import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  distance: 'immediate' | 'medium' | 'long-term';
  priority: number;
  category: string;
  estimatedValue: number;
  timeToAct: number; // days
  x: number;
  y: number;
}

export const OpportunityRadar: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: '1',
      title: 'Q4 Product Launch',
      description: 'Market research shows 40% demand increase for your product category',
      distance: 'immediate',
      priority: 9,
      category: 'Product',
      estimatedValue: 50000,
      timeToAct: 7,
      x: 75,
      y: 30
    },
    {
      id: '2',
      title: 'LinkedIn Campaign',
      description: 'Your competitor reduced ad spend - opportunity to capture market share',
      distance: 'medium',
      priority: 7,
      category: 'Marketing',
      estimatedValue: 25000,
      timeToAct: 14,
      x: 60,
      y: 55
    },
    {
      id: '3',
      title: 'Partnership Opportunity',
      description: 'Tech startup seeking integration partners in your industry',
      distance: 'long-term',
      priority: 6,
      category: 'Partnership',
      estimatedValue: 75000,
      timeToAct: 30,
      x: 25,
      y: 70
    },
    {
      id: '4',
      title: 'Content Series',
      description: 'Industry trend shows high engagement for educational content',
      distance: 'immediate',
      priority: 8,
      category: 'Content',
      estimatedValue: 15000,
      timeToAct: 3,
      x: 80,
      y: 25
    }
  ]);

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [rotation, setRotation] = useState(0);

  // Continuous radar rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getDistanceColor = (distance: string) => {
    const colors = {
      immediate: '#EF4444', // Red - urgent
      medium: '#F59E0B', // Amber - moderate
      long-term: '#10B981' // Green - strategic
    };
    return colors[distance as keyof typeof colors];
  };

  const getDistanceRadius = (distance: string) => {
    const radii = {
      immediate: 25, // Close to center
      medium: 45, // Middle ring
      long-term: 65 // Outer ring
    };
    return radii[distance as keyof typeof radii];
  };

  const getPrioritySize = (priority: number) => {
    return Math.max(8, priority * 2); // 8-20px based on priority
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      Product: '🚀',
      Marketing: '📈',
      Partnership: '🤝',
      Content: '✍️',
      Sales: '💼',
      Technology: '⚙️'
    };
    return icons[category as keyof typeof icons] || '💡';
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-lg overflow-hidden">
      {/* Radar Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Radar Circles */}
        <div className="relative">
          {[25, 45, 65].map((radius, index) => (
            <div
              key={index}
              className="absolute border border-white border-opacity-20 rounded-full"
              style={{
                width: `${radius * 2}%`,
                height: `${radius * 2}%`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
          
          {/* Radar Sweep */}
          <motion.div
            className="absolute w-1 h-full bg-gradient-to-t from-transparent via-green-400 to-transparent opacity-60"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: 'bottom center',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{ rotate: rotation }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Opportunity Blips */}
      {opportunities.map((opportunity) => {
        const radius = getDistanceRadius(opportunity.distance);
        const angle = Math.random() * 360; // In real implementation, this would be calculated based on category or other factors
        const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
        const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

        return (
          <motion.div
            key={opportunity.id}
            className="absolute cursor-pointer"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            whileHover={{ scale: 1.3 }}
            onClick={() => setSelectedOpportunity(opportunity)}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2 + opportunity.priority * 0.2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <div
              className="relative"
              style={{
                width: `${getPrioritySize(opportunity.priority)}px`,
                height: `${getPrioritySize(opportunity.priority)}px`
              }}
            >
              {/* Opportunity Blip */}
              <motion.div
                className="w-full h-full rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs"
                style={{
                  backgroundColor: getDistanceColor(opportunity.distance),
                  opacity: 0.9
                }}
                whileHover={{
                  boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
                }}
              >
                {getCategoryIcon(opportunity.category)}
              </motion.div>

              {/* Priority Ring */}
              {opportunity.priority >= 8 && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-yellow-400"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}
                />
              )}

              {/* Urgency Indicator */}
              {opportunity.distance === 'immediate' && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity
                  }}
                />
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Opportunity Detail Modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-md mx-4 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedOpportunity(null)}
              >
                ×
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">{getCategoryIcon(selectedOpportunity.category)}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedOpportunity.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getDistanceColor(selectedOpportunity.distance) }}
                    >
                      {selectedOpportunity.distance}
                    </span>
                    <span className="text-xs text-gray-600">
                      Priority: {selectedOpportunity.priority}/10
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{selectedOpportunity.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-green-600 font-medium">Estimated Value</div>
                  <div className="text-lg font-bold text-green-700">
                    ${selectedOpportunity.estimatedValue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-xs text-orange-600 font-medium">Time to Act</div>
                  <div className="text-lg font-bold text-orange-700">
                    {selectedOpportunity.timeToAct} days
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                  Take Action
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Learn More
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
        <div className="text-white text-xs space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Immediate (0-7 days)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Medium (1-4 weeks)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Long-term (1+ months)</span>
          </div>
        </div>
      </div>

      {/* Center Info */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <div className="text-sm font-medium opacity-80">Opportunity Radar</div>
          <div className="text-xs opacity-60">Scanning for growth...</div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityRadar;
