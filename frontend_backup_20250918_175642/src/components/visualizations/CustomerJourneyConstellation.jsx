import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Heart, Target, MessageCircle, CheckCircle, ShoppingCart, 
  UserPlus, Zap, Shield, TrendingUp, Users, X 
} from 'lucide-react';

const CustomerJourneyConstellation = ({ customers = [] }) => {
  // Process customer data to get counts and values by stage
  const processCustomerData = (customers) => {
    const stageData = {};
    
    customers.forEach(customer => {
      const stage = customer.stage || 'awareness';
      if (!stageData[stage]) {
        stageData[stage] = { count: 0, totalValue: 0 };
      }
      stageData[stage].count += 1;
      stageData[stage].totalValue += customer.value || 0;
    });
    
    return stageData;
  };

  const stageData = processCustomerData(customers);
  
  // Generate journey points dynamically based on customer data
  const generateJourneyPoints = (stageData) => {
    const stages = [
      { id: 'awareness', name: 'Awareness', icon: Star, position: { x: 20, y: 30 }, color: 'blue', connections: ['interest', 'research'] },
      { id: 'interest', name: 'Interest', icon: Heart, position: { x: 40, y: 20 }, color: 'purple', connections: ['research', 'consideration'] },
      { id: 'research', name: 'Research', icon: Target, position: { x: 60, y: 30 }, color: 'green', connections: ['consideration', 'evaluation'] },
      { id: 'consideration', name: 'Consideration', icon: MessageCircle, position: { x: 80, y: 20 }, color: 'yellow', connections: ['evaluation', 'purchase'] },
      { id: 'evaluation', name: 'Evaluation', icon: CheckCircle, position: { x: 60, y: 50 }, color: 'orange', connections: ['purchase', 'onboarding'] },
      { id: 'purchase', name: 'Purchase', icon: ShoppingCart, position: { x: 40, y: 60 }, color: 'red', connections: ['onboarding', 'adoption'] },
      { id: 'onboarding', name: 'Onboarding', icon: UserPlus, position: { x: 20, y: 50 }, color: 'indigo', connections: ['adoption', 'retention'] },
      { id: 'adoption', name: 'Adoption', icon: Zap, position: { x: 20, y: 70 }, color: 'pink', connections: ['retention', 'expansion'] },
      { id: 'retention', name: 'Retention', icon: Shield, position: { x: 40, y: 80 }, color: 'teal', connections: ['expansion', 'advocacy'] },
      { id: 'expansion', name: 'Expansion', icon: TrendingUp, position: { x: 60, y: 70 }, color: 'emerald', connections: ['advocacy'] },
      { id: 'advocacy', name: 'Advocacy', icon: Users, position: { x: 80, y: 60 }, color: 'emerald', connections: [] }
    ];

    return stages.map(stage => ({
      ...stage,
      customers: stageData[stage.id]?.count || 0,
      totalValue: stageData[stage.id]?.totalValue || 0,
      conversion: stageData[stage.id]?.count > 0 ? Math.min(0.95, (stageData[stage.id]?.totalValue || 0) / 10000) : 0,
      description: `${stage.name} stage with ${stageData[stage.id]?.count || 0} customers`
    }));
  };

  const [journeyPoints, setJourneyPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [activeConnections, setActiveConnections] = useState([]);
  const [customerFlow, setCustomerFlow] = useState([]);

  // Update journey points when customer data changes
  useEffect(() => {
    setJourneyPoints(generateJourneyPoints(stageData));
  }, [customers]);

  // Simulate customer flow between journey points
  useEffect(() => {
    const interval = setInterval(() => {
      if (journeyPoints.length === 0) return;
      
      const fromPoint = journeyPoints[Math.floor(Math.random() * journeyPoints.length)];
      const toConnections = fromPoint.connections;
      
      if (toConnections.length > 0) {
        const toPointId = toConnections[Math.floor(Math.random() * toConnections.length)];
        const toPoint = journeyPoints.find(p => p.id === toPointId);
        
        if (toPoint) {
          const flowId = `${fromPoint.id}-${toPoint.id}-${Date.now()}`;
          setCustomerFlow(prev => [...prev, {
            id: flowId,
            from: fromPoint.position,
            to: toPoint.position,
            timestamp: Date.now()
          }]);
          
          // Remove flow after animation
          setTimeout(() => {
            setCustomerFlow(prev => prev.filter(f => f.id !== flowId));
          }, 2000);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [journeyPoints]);

  // Get point size based on total value and customer count
  const getPointSize = (point) => {
    if (journeyPoints.length === 0) return 'w-8 h-8';
    
    const maxValue = Math.max(...journeyPoints.map(p => p.totalValue));
    const maxCustomers = Math.max(...journeyPoints.map(p => p.customers));
    
    // Combine value and customer count for sizing
    const valueRatio = maxValue > 0 ? point.totalValue / maxValue : 0;
    const customerRatio = maxCustomers > 0 ? point.customers / maxCustomers : 0;
    const combinedRatio = (valueRatio + customerRatio) / 2;
    
    if (combinedRatio > 0.7) return 'w-16 h-16';
    if (combinedRatio > 0.4) return 'w-12 h-12';
    if (combinedRatio > 0.1) return 'w-10 h-10';
    return 'w-8 h-8';
  };

  const getPointOpacity = (point) => {
    return point.customers > 0 ? 'opacity-100' : 'opacity-40';
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-500 border-blue-300 shadow-blue-500/20',
      purple: 'bg-purple-500 border-purple-300 shadow-purple-500/20',
      green: 'bg-green-500 border-green-300 shadow-green-500/20',
      yellow: 'bg-yellow-500 border-yellow-300 shadow-yellow-500/20',
      orange: 'bg-orange-500 border-orange-300 shadow-orange-500/20',
      red: 'bg-red-500 border-red-300 shadow-red-500/20',
      indigo: 'bg-indigo-500 border-indigo-300 shadow-indigo-500/20',
      pink: 'bg-pink-500 border-pink-300 shadow-pink-500/20',
      teal: 'bg-teal-500 border-teal-300 shadow-teal-500/20',
      emerald: 'bg-emerald-500 border-emerald-300 shadow-emerald-500/20'
    };
    return colorMap[color] || 'bg-gray-500 border-gray-300 shadow-gray-500/20';
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-lg overflow-hidden">
      {/* Background Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {journeyPoints.map(point => 
          point.connections.map(connectionId => {
            const connectedPoint = journeyPoints.find(p => p.id === connectionId);
            if (!connectedPoint) return null;

            return (
              <motion.line
                key={`${point.id}-${connectionId}`}
                x1={`${point.position.x}%`}
                y1={`${point.position.y}%`}
                x2={`${connectedPoint.position.x}%`}
                y2={`${connectedPoint.position.y}%`}
                stroke="rgba(100, 116, 139, 0.3)"
                strokeWidth="1"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: Math.random() * 2 }}
              />
            );
          })
        )}
      </svg>

      {/* Customer Flow Animation */}
      <AnimatePresence>
        {customerFlow.map(flow => (
          <motion.div
            key={flow.id}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{
              left: `${flow.from.x}%`,
              top: `${flow.from.y}%`,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              x: `${(flow.to.x - flow.from.x) * 4}px`,
              y: `${(flow.to.y - flow.from.y) * 4}px`,
              scale: [0, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Journey Points */}
      {journeyPoints.map((point, index) => {
        const Icon = point.icon;
        const sizeClass = getPointSize(point);
        const opacityClass = getPointOpacity(point);
        const colorClasses = getColorClasses(point.color);

        return (
          <motion.div
            key={point.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${sizeClass} ${colorClasses} ${opacityClass} rounded-full border-2 shadow-lg cursor-pointer flex items-center justify-center`}
            style={{
              left: `${point.position.x}%`,
              top: `${point.position.y}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setSelectedPoint(point)}
          >
            <Icon className="w-1/2 h-1/2 text-white" />
            
            {/* Customer Count Badge */}
            {point.customers > 0 && (
              <motion.div
                className="absolute -top-2 -right-2 bg-white text-gray-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                {point.customers}
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Point Detail Modal */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPoint(null)}
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${getColorClasses(selectedPoint.color)} rounded-lg flex items-center justify-center`}>
                    <selectedPoint.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedPoint.name}</h3>
                    <p className="text-sm text-gray-600">{selectedPoint.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customers:</span>
                  <span className="text-sm font-medium">{selectedPoint.customers}</span>
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
                  <span className="text-sm text-gray-600">Conversion Rate:</span>
                  <span className="text-sm font-medium text-purple-600">
                    {(selectedPoint.conversion * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {selectedPoint.connections.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Connected Stages:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPoint.connections.map(connectionId => {
                      const connectedPoint = journeyPoints.find(p => p.id === connectionId);
                      return connectedPoint ? (
                        <span
                          key={connectionId}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {connectedPoint.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerJourneyConstellation;