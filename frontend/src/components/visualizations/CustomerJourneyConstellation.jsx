import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerJourneyConstellation = () => {
  const [customers, setCustomers] = useState([
    { 
      id: '1', 
      name: 'ACME Corp', 
      stage: 'customer', 
      value: 15000, 
      engagement: 0.9, 
      x: 60, 
      y: 40,
      journey: ['prospect', 'lead', 'customer'],
      connections: ['2', '4'],
      cluster: 'enterprise',
      lastActivity: Date.now() - 3600000
    },
    { 
      id: '2', 
      name: 'TechStart Inc', 
      stage: 'lead', 
      value: 8000, 
      engagement: 0.7, 
      x: 30, 
      y: 60,
      journey: ['prospect', 'lead'],
      connections: ['1', '3'],
      cluster: 'startup',
      lastActivity: Date.now() - 7200000
    },
    { 
      id: '3', 
      name: 'Global Solutions', 
      stage: 'prospect', 
      value: 5000, 
      engagement: 0.4, 
      x: 80, 
      y: 70,
      journey: ['prospect'],
      connections: ['2', '5'],
      cluster: 'enterprise',
      lastActivity: Date.now() - 10800000
    },
    { 
      id: '4', 
      name: 'Innovation Labs', 
      stage: 'advocate', 
      value: 25000, 
      engagement: 0.95, 
      x: 45, 
      y: 25,
      journey: ['prospect', 'lead', 'customer', 'advocate'],
      connections: ['1', '5'],
      cluster: 'enterprise',
      lastActivity: Date.now() - 1800000
    },
    { 
      id: '5', 
      name: 'Future Systems', 
      stage: 'customer', 
      value: 12000, 
      engagement: 0.8, 
      x: 70, 
      y: 50,
      journey: ['prospect', 'lead', 'customer'],
      connections: ['3', '4'],
      cluster: 'startup',
      lastActivity: Date.now() - 5400000
    },
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [hoveredCustomer, setHoveredCustomer] = useState(null);
  const [showConnections, setShowConnections] = useState(true);
  const [showJourneyPaths, setShowJourneyPaths] = useState(false);

  // Simulate customer journey progression
  useEffect(() => {
    const interval = setInterval(() => {
      setCustomers(prev => prev.map(customer => {
        // Randomly progress customers through stages
        if (Math.random() < 0.1) {
          const stages = ['prospect', 'lead', 'customer', 'advocate'];
          const currentIndex = stages.indexOf(customer.stage);
          if (currentIndex < stages.length - 1) {
            return {
              ...customer,
              stage: stages[currentIndex + 1],
              engagement: Math.min(1, customer.engagement + 0.1)
            };
          }
        }
        return customer;
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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
    return colors[stage] || '#FFFFFF';
  };

  const getStarBrightness = (engagement) => {
    return 0.4 + (engagement * 0.6);
  };

  const getClusterColor = (cluster) => {
    const colors = {
      enterprise: '#3B82F6', // Blue
      startup: '#10B981', // Green
      smb: '#F59E0B', // Orange
      individual: '#8B5CF6' // Purple
    };
    return colors[cluster] || '#6B7280';
  };

  const getConnectionStrength = (customer1, customer2) => {
    // Calculate connection strength based on shared journey stages and engagement
    const sharedStages = customer1.journey.filter(stage => customer2.journey.includes(stage));
    const avgEngagement = (customer1.engagement + customer2.engagement) / 2;
    return (sharedStages.length / 4) * avgEngagement;
  };

  const getJourneyStagePosition = (stage, progress) => {
    const stagePositions = {
      prospect: { x: 20, y: 80 },
      lead: { x: 50, y: 60 },
      customer: { x: 80, y: 40 },
      advocate: { x: 50, y: 20 }
    };
    return stagePositions[stage] || { x: 50, y: 50 };
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-indigo-900 via-purple-900 to-black rounded-lg overflow-hidden">
      <h3 className="text-lg font-semibold m-4 text-white absolute z-10">Customer Journey</h3>
      
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

      {/* Connection Lines */}
      {showConnections && customers.map((customer) => 
        customer.connections.map((connectionId) => {
          const connectedCustomer = customers.find(c => c.id === connectionId);
          if (!connectedCustomer) return null;
          
          const strength = getConnectionStrength(customer, connectedCustomer);
          const isHighlighted = hoveredCustomer === customer.id || hoveredCustomer === connectionId;
          
          return (
            <motion.line
              key={`${customer.id}-${connectionId}`}
              x1={`${customer.x}%`}
              y1={`${customer.y}%`}
              x2={`${connectedCustomer.x}%`}
              y2={`${connectedCustomer.y}%`}
              stroke={isHighlighted ? '#FFD700' : '#4B5563'}
              strokeWidth={isHighlighted ? 3 : strength * 2 + 1}
              opacity={isHighlighted ? 0.8 : strength * 0.4 + 0.2}
              className="absolute pointer-events-none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          );
        })
      )}

      {/* Journey Paths */}
      {showJourneyPaths && customers.map((customer) => 
        customer.journey.slice(0, -1).map((stage, index) => {
          const currentStage = stage;
          const nextStage = customer.journey[index + 1];
          const currentPos = getJourneyStagePosition(currentStage, index / customer.journey.length);
          const nextPos = getJourneyStagePosition(nextStage, (index + 1) / customer.journey.length);
          
          return (
            <motion.line
              key={`${customer.id}-${stage}-${nextStage}`}
              x1={`${currentPos.x}%`}
              y1={`${currentPos.y}%`}
              x2={`${nextPos.x}%`}
              y2={`${nextPos.y}%`}
              stroke={getStarColor(customer.stage)}
              strokeWidth="2"
              opacity="0.3"
              strokeDasharray="5,5"
              className="absolute pointer-events-none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: index * 0.5 }}
            />
          );
        })
      )}

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
          onMouseEnter={() => setHoveredCustomer(customer.id)}
          onMouseLeave={() => setHoveredCustomer(null)}
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
            {/* Cluster indicator */}
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white"
              style={{
                backgroundColor: getClusterColor(customer.cluster),
              }}
            />
            
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
            
            {/* Activity pulse */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: getStarColor(customer.stage),
                opacity: 0.3,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: (Date.now() - customer.lastActivity) / 1000000,
              }}
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Control Panel */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-lg p-3 z-20">
        <div className="text-white text-sm space-y-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowConnections(!showConnections)}
              className={`px-2 py-1 rounded text-xs ${showConnections ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              Connections
            </button>
            <button
              onClick={() => setShowJourneyPaths(!showJourneyPaths)}
              className={`px-2 py-1 rounded text-xs ${showJourneyPaths ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              Journey Paths
            </button>
          </div>
        </div>
      </div>

      {/* Customer detail popup */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            className="absolute top-4 left-4 bg-white rounded-lg p-4 shadow-xl max-w-xs z-20"
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
            <div className="mt-2 space-y-2">
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
              <div className="flex justify-between">
                <span className="text-gray-600">Cluster:</span>
                <span className="font-medium capitalize">{selectedCustomer.cluster}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Connections:</span>
                <span className="font-medium">{selectedCustomer.connections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Activity:</span>
                <span className="font-medium">
                  {Math.round((Date.now() - selectedCustomer.lastActivity) / 3600000)}h ago
                </span>
              </div>
            </div>
            
            {/* Journey Timeline */}
            <div className="mt-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Journey Timeline</div>
              <div className="flex space-x-1">
                {selectedCustomer.journey.map((stage, index) => (
                  <div
                    key={stage}
                    className={`w-3 h-3 rounded-full ${
                      index <= selectedCustomer.journey.indexOf(selectedCustomer.stage)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                    title={stage}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {selectedCustomer.journey.join(' → ')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
        <div className="text-white text-sm space-y-2">
          <div className="font-medium mb-1">Journey Stages</div>
          <div className="space-y-1">
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
          
          <div className="font-medium mb-1 mt-3">Clusters</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Enterprise</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Startup</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>SMB</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Individual</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerJourneyConstellation;
