import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const OpportunityRadar = () => {
  const [opportunities, setOpportunities] = useState([
    { id: '1', name: 'Tech Startup', type: 'high-value', value: 25000, distance: 0.3, angle: 45, urgency: 'high' },
    { id: '2', name: 'E-commerce Store', type: 'medium-value', value: 15000, distance: 0.6, angle: 120, urgency: 'medium' },
    { id: '3', name: 'Consulting Firm', type: 'high-value', value: 30000, distance: 0.4, angle: 200, urgency: 'high' },
    { id: '4', name: 'SaaS Company', type: 'low-value', value: 8000, distance: 0.8, angle: 300, urgency: 'low' },
    { id: '5', name: 'Marketing Agency', type: 'medium-value', value: 12000, distance: 0.5, angle: 270, urgency: 'medium' }
  ]);

  const [scanAngle, setScanAngle] = useState(0);
  const [detectedOpportunity, setDetectedOpportunity] = useState(null);

  // Simulate radar scanning
  useEffect(() => {
    const interval = setInterval(() => {
      setScanAngle(prev => (prev + 2) % 360);
      
      // Check for opportunities in scan path
      const currentAngle = scanAngle;
      const detected = opportunities.find(opp => 
        Math.abs(opp.angle - currentAngle) < 10 && opp.distance < 0.7
      );
      
      if (detected && detected !== detectedOpportunity) {
        setDetectedOpportunity(detected);
        setTimeout(() => setDetectedOpportunity(null), 2000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [scanAngle, opportunities, detectedOpportunity]);

  // Simulate new opportunities appearing
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        const newOpportunity = {
          id: Date.now().toString(),
          name: `New Lead ${Math.floor(Math.random() * 1000)}`,
          type: ['high-value', 'medium-value', 'low-value'][Math.floor(Math.random() * 3)],
          value: Math.floor(Math.random() * 30000) + 5000,
          distance: Math.random() * 0.8 + 0.2,
          angle: Math.random() * 360,
          urgency: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
        };
        
        setOpportunities(prev => [...prev, newOpportunity]);
        
        // Remove old opportunities
        setTimeout(() => {
          setOpportunities(prev => prev.filter(opp => opp.id !== newOpportunity.id));
        }, 30000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getOpportunityColor = (type) => {
    const colors = {
      'high-value': '#10B981', // Green
      'medium-value': '#F59E0B', // Orange
      'low-value': '#6B7280' // Gray
    };
    return colors[type] || '#6B7280';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      'high': '#EF4444', // Red
      'medium': '#F59E0B', // Orange
      'low': '#10B981' // Green
    };
    return colors[urgency] || '#10B981';
  };

  const getOpportunitySize = (value) => {
    return Math.max(4, Math.min(12, (value / 30000) * 8 + 4));
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-lg overflow-hidden">
      <h3 className="text-lg font-semibold m-4 text-white absolute z-10">Opportunity Radar</h3>
      
      {/* Radar Grid */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Concentric Circles */}
        {[0.2, 0.4, 0.6, 0.8].map((radius, index) => (
          <div
            key={index}
            className="absolute border border-green-400 border-opacity-30 rounded-full"
            style={{
              width: `${radius * 200}px`,
              height: `${radius * 200}px`,
            }}
          />
        ))}
        
        {/* Grid Lines - Cardinal Points */}
        {[0, 90, 180, 270].map((angle, index) => (
          <div
            key={index}
            className="absolute w-0.5 bg-green-400 bg-opacity-50 origin-bottom"
            style={{
              height: '100px',
              transform: `rotate(${angle}deg) translateY(-100px)`,
            }}
          />
        ))}
        
        {/* Grid Lines - Diagonal Points */}
        {[45, 135, 225, 315].map((angle, index) => (
          <div
            key={index}
            className="absolute w-0.5 bg-green-400 bg-opacity-30 origin-bottom"
            style={{
              height: '100px',
              transform: `rotate(${angle}deg) translateY(-100px)`,
            }}
          />
        ))}
      </div>

      {/* Scanning Line */}
      <motion.div
        className="absolute w-0.5 bg-green-400 origin-bottom"
        style={{
          height: '100px',
          left: '50%',
          bottom: '50%',
          transformOrigin: 'bottom center',
        }}
        animate={{
          rotate: scanAngle,
        }}
        transition={{
          duration: 0.1,
          ease: 'linear',
        }}
      >
        {/* Scan Line Glow */}
        <div className="absolute inset-0 bg-green-400 opacity-50 blur-sm" />
      </motion.div>

      {/* Center Point */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-green-400 rounded-full">
        <motion.div
          className="absolute inset-0 bg-green-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Opportunities */}
      {opportunities.map((opportunity) => {
        const x = 50 + opportunity.distance * 40 * Math.cos((opportunity.angle - 90) * Math.PI / 180);
        const y = 50 + opportunity.distance * 40 * Math.sin((opportunity.angle - 90) * Math.PI / 180);
        
        return (
          <motion.div
            key={opportunity.id}
            className="absolute cursor-pointer"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => setDetectedOpportunity(opportunity)}
          >
            {/* Opportunity Blip */}
            <motion.div
              className="relative"
              style={{
                width: `${getOpportunitySize(opportunity.value)}px`,
                height: `${getOpportunitySize(opportunity.value)}px`,
              }}
            >
              <div
                className="w-full h-full rounded-full border-2 border-white"
                style={{
                  backgroundColor: getOpportunityColor(opportunity.type),
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              
              {/* Urgency Pulse */}
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: getUrgencyColor(opportunity.urgency),
                }}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Detection Alert */}
      {detectedOpportunity && (
        <motion.div
          className="absolute top-4 right-4 bg-white rounded-lg p-4 shadow-xl max-w-xs z-20"
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 100 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-gray-800">Opportunity Detected!</h4>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setDetectedOpportunity(null)}
            >
              ×
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Company:</span>
              <span className="font-medium">{detectedOpportunity.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Value:</span>
              <span className="font-medium">${detectedOpportunity.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">{detectedOpportunity.type.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Urgency:</span>
              <span 
                className="font-medium capitalize"
                style={{ color: getUrgencyColor(detectedOpportunity.urgency) }}
              >
                {detectedOpportunity.urgency}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
        <div className="text-white text-sm space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>High Value</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <span>Medium Value</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Low Value</span>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
        <div className="text-white text-sm">
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-green-400"
              animate={{
                opacity: [1, 0.3, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />
            <span>Scanning Active</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {opportunities.length} opportunities detected
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityRadar;
