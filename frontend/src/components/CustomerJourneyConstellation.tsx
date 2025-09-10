import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CustomerNode {
  id: string;
  name: string;
  stage: 'awareness' | 'consideration' | 'conversion' | 'retention' | 'advocacy';
  value: number;
  position: { x: number; y: number };
}

interface Connection {
  from: string;
  to: string;
  type: 'interaction' | 'purchase' | 'referral';
}

export const CustomerJourneyConstellation: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerNode[]>([
    { id: 'c1', name: 'Alice', stage: 'awareness', value: 100, position: { x: 10, y: 50 } },
    { id: 'c2', name: 'Bob', stage: 'consideration', value: 250, position: { x: 30, y: 20 } },
    { id: 'c3', name: 'Charlie', stage: 'conversion', value: 500, position: { x: 50, y: 70 } },
    { id: 'c4', name: 'David', stage: 'retention', value: 1200, position: { x: 70, y: 30 } },
    { id: 'c5', name: 'Eve', stage: 'advocacy', value: 2000, position: { x: 90, y: 60 } },
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { from: 'c1', to: 'c2', type: 'interaction' },
    { from: 'c2', to: 'c3', type: 'purchase' },
    { from: 'c3', to: 'c4', type: 'interaction' },
    { from: 'c4', to: 'c5', type: 'referral' },
  ]);

  const getStageColor = (stage: string) => {
    const colors = {
      awareness: '#3B82F6', // Blue
      consideration: '#F59E0B', // Amber
      conversion: '#10B981', // Green
      retention: '#8B5CF6', // Purple
      advocacy: '#EF4444', // Red
    };
    return colors[stage as keyof typeof colors];
  };

  const getStageLabel = (stage: string) => {
    const labels = {
      awareness: 'Awareness',
      consideration: 'Consideration',
      conversion: 'Conversion',
      retention: 'Retention',
      advocacy: 'Advocacy',
    };
    return labels[stage as keyof typeof labels];
  };

  // Simulate customer movement and new connections
  useEffect(() => {
    const interval = setInterval(() => {
      setCustomers(prev => prev.map(customer => ({
        ...customer,
        position: {
          x: Math.max(5, Math.min(95, customer.position.x + (Math.random() - 0.5) * 5)),
          y: Math.max(5, Math.min(95, customer.position.y + (Math.random() - 0.5) * 5)),
        }
      })));

      // Add new random connection occasionally
      if (Math.random() < 0.1 && customers.length > 1) {
        const fromCustomer = customers[Math.floor(Math.random() * customers.length)];
        const toCustomer = customers[Math.floor(Math.random() * customers.length)];
        if (fromCustomer.id !== toCustomer.id) {
          setConnections(prev => [...prev, {
            from: fromCustomer.id,
            to: toCustomer.id,
            type: Math.random() > 0.5 ? 'interaction' : 'purchase',
          }]);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [customers.length]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border overflow-hidden">
      {/* Stage Backgrounds */}
      <div className="absolute inset-0 flex">
        {['awareness', 'consideration', 'conversion', 'retention', 'advocacy'].map((stage, index) => (
          <div
            key={stage}
            className="flex-1 flex items-center justify-center text-xs font-medium text-gray-400 border-r border-gray-200 last:border-r-0"
            style={{ backgroundColor: `${getStageColor(stage)}1A` }} // Light transparent color
          >
            {getStageLabel(stage)}
          </div>
        ))}
      </div>

      {/* Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((conn, index) => {
          const fromNode = customers.find(c => c.id === conn.from);
          const toNode = customers.find(c => c.id === conn.to);

          if (!fromNode || !toNode) return null;

          const x1 = fromNode.position.x;
          const y1 = fromNode.position.y;
          const x2 = toNode.position.x;
          const y2 = toNode.position.y;

          const strokeColor = conn.type === 'purchase' ? '#10B981' : conn.type === 'referral' ? '#EF4444' : '#6B7280';

          return (
            <motion.line
              key={index}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke={strokeColor}
              strokeWidth="1"
              strokeDasharray={conn.type === 'interaction' ? '4 2' : '0'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          );
        })}
      </svg>

      {/* Customer Nodes */}
      {customers.map((customer) => (
        <motion.div
          key={customer.id}
          className="absolute cursor-pointer"
          style={{
            left: `${customer.position.x}%`,
            top: `${customer.position.y}%`,
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          whileHover={{ scale: 1.1 }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md relative"
            style={{ backgroundColor: getStageColor(customer.stage) }}
          >
            {customer.name.charAt(0)}
            {/* Value Indicator */}
            <div className="absolute -top-2 -right-2 bg-white text-gray-800 text-xs font-semibold rounded-full px-2 py-0.5 shadow-sm">
              ${customer.value}
            </div>
          </div>
          {/* Customer Info Tooltip */}
          <motion.div
            className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 min-w-max z-10"
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
          >
            <div className="text-xs font-medium text-gray-800">{customer.name}</div>
            <div className="text-xs text-gray-600">Stage: {getStageLabel(customer.stage)}</div>
          </motion.div>
        </motion.div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 text-xs">
        <div className="font-semibold mb-2">Journey Stages:</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(getStageColor('awareness')).map(([stage, color]) => (
            <div key={stage} className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
              {getStageLabel(stage)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
