import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Users, ShoppingCart, Heart, MessageCircle, Award, Zap, Target } from 'lucide-react';

const CustomerJourneyConstellation = ({ customers = [] }) => {
  // Process customer data to create constellation points
  const processCustomerData = (customers) => {
    const stages = ['awareness', 'interest', 'research', 'consideration', 'evaluation', 'negotiation', 'purchase', 'retention'];
    const stageData = {};
    
    // Initialize stage data
    stages.forEach(stage => {
      stageData[stage] = {
        customers: [],
        totalValue: 0,
        count: 0
      };
    });
    
    // Process each customer
    customers.forEach(customer => {
      const stage = customer.stage || 'awareness';
      if (stageData[stage]) {
        stageData[stage].customers.push(customer);
        stageData[stage].totalValue += customer.value || 0;
        stageData[stage].count += 1;
      }
    });
    
    return stageData;
  };
  
  const stageData = processCustomerData(customers);
  
  const [journeyPoints, setJourneyPoints] = useState([
    {
      id: 'awareness',
      name: 'Awareness',
      icon: Star,
      position: { x: 20, y: 30 },
      size: 'large',
      color: 'blue',
      customers: stageData.awareness?.count || 0,
      totalValue: stageData.awareness?.totalValue || 0,
      conversion: 0.85,
      description: 'Customers discover your brand',
      connections: ['interest', 'research']
    },
    {
      id: 'interest',
      name: 'Interest',
      icon: Heart,
      position: { x: 40, y: 20 },
      size: 'medium',
      color: 'purple',
      customers: stageData.interest?.count || 0,
      totalValue: stageData.interest?.totalValue || 0,
      conversion: 0.72,
      description: 'Customers show interest in your offerings',
      connections: ['research', 'consideration']
    },
    {
      id: 'research',
      name: 'Research',
      icon: Target,
      position: { x: 15, y: 60 },
      size: 'medium',
      color: 'green',
      customers: stageData.research?.count || 0,
      totalValue: stageData.research?.totalValue || 0,
      conversion: 0.68,
      description: 'Customers research your products/services',
      connections: ['consideration', 'evaluation']
    },
    {
      id: 'consideration',
      name: 'Consideration',
      icon: MessageCircle,
      position: { x: 60, y: 50 },
      size: 'large',
      color: 'orange',
      customers: stageData.consideration?.count || 0,
      totalValue: stageData.consideration?.totalValue || 0,
      conversion: 0.75,
      description: 'Customers consider making a purchase',
      connections: ['evaluation', 'purchase']
    },
    {
      id: 'evaluation',
      name: 'Evaluation',
      icon: Award,
      position: { x: 35, y: 75 },
      size: 'small',
      color: 'yellow',
      customers: stageData.evaluation?.count || 0,
      totalValue: stageData.evaluation?.totalValue || 0,
      conversion: 0.82,
      description: 'Customers evaluate options',
      connections: ['purchase', 'onboarding']
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      icon: ShoppingCart,
      position: { x: 75, y: 70 },
      size: 'large',
      color: 'red',
      customers: stageData.negotiation?.count || 0,
      totalValue: stageData.negotiation?.totalValue || 0,
      conversion: 0.90,
      description: 'Customers negotiate terms',
      connections: ['purchase', 'onboarding']
    },
    {
      id: 'purchase',
      name: 'Purchase',
      icon: ShoppingCart,
      position: { x: 85, y: 40 },
      size: 'medium',
      color: 'indigo',
      customers: stageData.purchase?.count || 0,
      totalValue: stageData.purchase?.totalValue || 0,
      conversion: 0.88,
      description: 'Customers make a purchase',
      connections: ['retention', 'advocacy']
    },
    {
      id: 'retention',
      name: 'Retention',
      icon: Users,
      position: { x: 70, y: 85 },
      size: 'large',
      color: 'teal',
      customers: stageData.retention?.count || 0,
      totalValue: stageData.retention?.totalValue || 0,
      conversion: 0.85,
      description: 'Customers continue using your service',
      connections: ['advocacy', 'expansion']
    },
    {
      id: 'advocacy',
      name: 'Advocacy',
      icon: Star,
      position: { x: 90, y: 75 },
      size: 'medium',
      color: 'pink',
      customers: 95,
      conversion: 0.78,
      description: 'Customers become advocates',
      connections: ['expansion']
    },
    {
      id: 'expansion',
      name: 'Expansion',
      icon: Target,
      position: { x: 95, y: 55 },
      size: 'small',
      color: 'emerald',
      customers: 65,
      conversion: 0.92,
      description: 'Customers expand their usage',
      connections: []
    }
  ]);

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [activeConnections, setActiveConnections] = useState([]);
  const [customerFlow, setCustomerFlow] = useState([]);

  // Simulate customer flow between journey points
  useEffect(() => {
    const interval = setInterval(() => {
      const fromPoint = journeyPoints[Math.floor(Math.random() * journeyPoints.length)];
      const toConnections = fromPoint.connections;
      
      if (toConnections.length > 0) {
        const toPointId = toConnections[Math.floor(Math.random() * toConnections.length)];
        const toPoint = journeyPoints.find(p => p.id === toPointId);
        
        if (toPoint) {
          const flow = {
            id: Date.now().toString(),
            from: fromPoint.position,
            to: toPoint.position,
            customers: Math.floor(Math.random() * 10) + 1,
            timestamp: Date.now()
          };
          
          setCustomerFlow(prev => [...prev.slice(-5), flow]);
          
          // Remove old flows
          setTimeout(() => {
            setCustomerFlow(prev => prev.filter(f => f.id !== flow.id));
          }, 3000);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [journeyPoints]);

  const getPointColor = (color) => {
    const colors = {
      'blue': 'from-blue-400 to-blue-600',
      'purple': 'from-purple-400 to-purple-600',
      'green': 'from-green-400 to-green-600',
      'orange': 'from-orange-400 to-orange-600',
      'yellow': 'from-yellow-400 to-yellow-600',
      'red': 'from-red-400 to-red-600',
      'indigo': 'from-indigo-400 to-indigo-600',
      'teal': 'from-teal-400 to-teal-600',
      'pink': 'from-pink-400 to-pink-600',
      'emerald': 'from-emerald-400 to-emerald-600'
    };
    return colors[color] || 'from-gray-400 to-gray-600';
  };

  const getPointSize = (point) => {
    // Base size on total value
    const maxValue = Math.max(...journeyPoints.map(p => p.totalValue));
    const valueRatio = point.totalValue / maxValue;
    
    if (valueRatio > 0.7) return 'w-16 h-16';
    if (valueRatio > 0.4) return 'w-12 h-12';
    if (valueRatio > 0.1) return 'w-10 h-10';
    return 'w-8 h-8';
  };

  const getConversionColor = (conversion) => {
    if (conversion > 0.8) return 'text-green-600';
    if (conversion > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handlePointClick = (point) => {
    setSelectedPoint(point);
    setActiveConnections(point.connections);
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-lg overflow-hidden">
      {/* Background Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Journey Points */}
      {journeyPoints.map((point) => {
        const Icon = point.icon;
        const isSelected = selectedPoint?.id === point.id;
        const isConnected = activeConnections.includes(point.id);
        
        return (
          <motion.div
            key={point.id}
            className="absolute cursor-pointer"
            style={{
              left: `${point.position.x}%`,
              top: `${point.position.y}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isSelected ? 1.3 : isConnected ? 1.1 : 1,
              opacity: 1
            }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => handlePointClick(point)}
          >
            <div className={`${getPointSize(point)} relative`}>
              {/* Point Glow */}
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${getPointColor(point.color)} opacity-80`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 0.4, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Point Core */}
              <div className={`${getPointSize(point)} rounded-full bg-gradient-to-br ${getPointColor(point.color)} flex items-center justify-center text-white shadow-lg relative z-10`}>
                <Icon className="w-6 h-6" />
              </div>
              
              {/* Customer Count */}
              <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 text-xs font-bold text-gray-800 shadow-md">
                {point.customers}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Connections */}
      {journeyPoints.map((point) => (
        point.connections.map((connectionId) => {
          const connectedPoint = journeyPoints.find(p => p.id === connectionId);
          if (!connectedPoint) return null;
          
          const isActive = activeConnections.includes(connectionId) || selectedPoint?.id === point.id;
          
          return (
            <motion.line
              key={`${point.id}-${connectionId}`}
              x1={`${point.position.x}%`}
              y1={`${point.position.y}%`}
              x2={`${connectedPoint.position.x}%`}
              y2={`${connectedPoint.position.y}%`}
              stroke={isActive ? "#10B981" : "#6B7280"}
              strokeWidth={isActive ? 2 : 1}
              opacity={isActive ? 0.8 : 0.3}
              className="absolute"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          );
        })
      ))}

      {/* Customer Flow Particles */}
      <AnimatePresence>
        {customerFlow.map((flow) => (
          <motion.div
            key={flow.id}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-lg"
            style={{
              left: `${flow.from.x}%`,
              top: `${flow.from.y}%`
            }}
            initial={{ 
              scale: 0,
              x: 0,
              y: 0
            }}
            animate={{
              scale: [0, 1, 0],
              x: `${flow.to.x - flow.from.x}%`,
              y: `${flow.to.y - flow.from.y}%`
            }}
            exit={{ scale: 0 }}
            transition={{
              duration: 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </AnimatePresence>

      {/* Journey Point Details */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-4 w-64 shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{selectedPoint.name}</h4>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{selectedPoint.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customers:</span>
                <span className="text-sm font-medium">{selectedPoint.customers.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Value:</span>
                <span className="text-sm font-medium text-green-600">
                  ${selectedPoint.totalValue.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Value:</span>
                <span className="text-sm font-medium text-blue-600">
                  ${selectedPoint.customers > 0 ? Math.round(selectedPoint.totalValue / selectedPoint.customers).toLocaleString() : '0'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conversion:</span>
                <span className={`text-sm font-medium ${getConversionColor(selectedPoint.conversion)}`}>
                  {Math.round(selectedPoint.conversion * 100)}%
                </span>
              </div>
              
              {selectedPoint.connections.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Next Steps:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPoint.connections.map((connectionId) => {
                      const connectedPoint = journeyPoints.find(p => p.id === connectionId);
                      return (
                        <span
                          key={connectionId}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {connectedPoint?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3">
        <h5 className="text-sm font-semibold text-gray-900 mb-2">Journey Map</h5>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>High Conversion</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Medium Conversion</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Low Conversion</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-gray-900">Customer Journey Constellation</h3>
        <p className="text-sm text-gray-600">Click on stars to explore the journey</p>
      </div>
    </div>
  );
};

export default CustomerJourneyConstellation;
