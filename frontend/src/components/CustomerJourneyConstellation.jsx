import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CustomerJourneyConstellation = () => {
  const [customers] = useState([
    { id: '1', name: 'ACME Corp', stage: 'customer', value: 15000, engagement: 0.9, x: 60, y: 40 },
    { id: '2', name: 'TechStart Inc', stage: 'lead', value: 8000, engagement: 0.7, x: 30, y: 60 },
    { id: '3', name: 'Global Solutions', stage: 'prospect', value: 5000, engagement: 0.4, x: 80, y: 70 },
    { id: '4', name: 'Innovation Labs', stage: 'advocate', value: 25000, engagement: 0.95, x: 45, y: 25 },
    { id: '5', name: 'Future Systems', stage: 'customer', value: 12000, engagement: 0.8, x: 70, y: 50 },
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const getStarSize = (customer) => {
    const baseSize = 8;
    const valueMultiplier = customer.value / 10000;
    return Math.max(baseSize, baseSize + valueMultiplier * 4);
  };

  const getStarColor = (stage) => {
    const colors = {
      prospect: '#94A3B8', // Gray
      lead: '#FCD34D', // Yellow
      customer: '#10B981', // Green
      advocate: '#8B5CF6', // Purple
    };
    return colors[stage] || '#94A3B8';
  };

  const getStarBrightness = (engagement) => {
    return 0.4 + (engagement * 0.6);
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-indigo-900 via-purple-900 to-black rounded-lg overflow-hidden">
      {/* Background stars */}
      {Array.from({ length: 50 }).map((_, index) => (
        <motion.div
          key={`bg-star-${index}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5,
          }}
          animate={{
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Customer stars */}
      {customers.map((customer) => (
        <motion.div
          key={customer.id}
          className="absolute cursor-pointer"
          style={{
            left: `${customer.x}%`,
            top: `${customer.y}%`,
            width: `${getStarSize(customer)}px`,
            height: `${getStarSize(customer)}px`,
          }}
          whileHover={{ scale: 1.5 }}
          onClick={() => setSelectedCustomer(customer)}
        >
          <motion.div
            className="w-full h-full rounded-full relative"
            style={{
              backgroundColor: getStarColor(customer.stage),
              opacity: getStarBrightness(customer.engagement),
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [getStarBrightness(customer.engagement) * 0.7, getStarBrightness(customer.engagement), getStarBrightness(customer.engagement) * 0.7],
            }}
            transition={{
              duration: 2 + customer.engagement,
              repeat: Infinity,
            }}
          >
            {/* Orbital ring for high-value customers */}
            {customer.value > 10000 && (
              <motion.div
                className="absolute inset-0 border border-white rounded-full"
                style={{
                  width: `${getStarSize(customer) * 2}px`,
                  height: `${getStarSize(customer) * 2}px`,
                  left: `${-getStarSize(customer) / 2}px`,
                  top: `${-getStarSize(customer) / 2}px`,
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </motion.div>
        </motion.div>
      ))}

      {/* Customer detail popup */}
      {selectedCustomer && (
        <motion.div
          className="absolute top-4 right-4 bg-white rounded-lg p-4 shadow-xl max-w-xs"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSelectedCustomer(null)}
          >
            ×
          </button>
          <h3 className="font-bold text-lg text-gray-800">{selectedCustomer.name}</h3>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Stage:</span>
              <span className="font-medium capitalize">{selectedCustomer.stage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Value:</span>
              <span className="font-medium">${selectedCustomer.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Engagement:</span>
              <span className="font-medium">{Math.round(selectedCustomer.engagement * 100)}%</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
        <div className="text-white text-sm space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Prospect</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>Lead</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Customer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <span>Advocate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CustomerJourneyConstellation };
