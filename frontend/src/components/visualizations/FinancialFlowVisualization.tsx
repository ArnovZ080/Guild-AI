import React from 'react';
import { motion } from 'framer-motion';
import { usePsychologicalOptimization } from '../../contexts/PsychologicalOptimizationContext';

interface FlowData {
  revenue: Array<{
    source: string;
    amount: number;
    color: string;
  }>;
  expenses: Array<{
    category: string;
    amount: number;
    color: string;
  }>;
  netFlow: number;
}

const FinancialFlowVisualization: React.FC = () => {
  const { getCurrentMode } = usePsychologicalOptimization();
  const currentMode = getCurrentMode();

  const flowData: FlowData = {
    revenue: [
      { source: 'Product Sales', amount: 15000, color: '#10B981' },
      { source: 'Consulting', amount: 8000, color: '#3B82F6' },
      { source: 'Subscriptions', amount: 5000, color: '#8B5CF6' }
    ],
    expenses: [
      { source: 'Marketing', amount: 3000, color: '#EF4444' },
      { source: 'Tools & Software', amount: 1500, color: '#F59E0B' },
      { source: 'Operations', amount: 2000, color: '#EC4899' }
    ],
    netFlow: 21500
  };

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          text: 'text-sky-dusk',
          accent: 'sky-dawn'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          text: 'text-forest-deep',
          accent: 'forest-growth'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          text: 'text-earth-sand',
          accent: 'earth-warm'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          text: 'text-forest-deep',
          accent: 'forest-growth'
        };
    }
  };

  const modeStyles = getModeStyles();
  const totalRevenue = flowData.revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = flowData.expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className={`w-full h-96 bg-gradient-to-b ${modeStyles.background} rounded-lg p-6 relative overflow-hidden shadow-lg border border-gray-200`}>
      {/* Revenue Streams (flowing in from left) */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
        {flowData.revenue.map((stream, index) => (
          <motion.div
            key={stream.source}
            className="mb-4 flex items-center"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="w-32 text-sm font-medium text-gray-700 mr-4">
              {stream.source}
            </div>
            <motion.div
              className="h-6 rounded-full relative overflow-hidden"
              style={{
                width: `${(stream.amount / totalRevenue) * 200}px`,
                backgroundColor: stream.color,
              }}
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              {/* Flowing animation */}
              <motion.div
                className="absolute inset-0 bg-white opacity-30"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </motion.div>
            <div className="ml-2 text-sm font-bold text-gray-800">
              ${stream.amount.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main River (center) */}
      <div className="absolute left-1/2 top-0 bottom-0 w-16 transform -translate-x-1/2">
        <motion.div
          className="w-full h-full bg-gradient-to-b from-blue-400 to-green-400 rounded-full relative overflow-hidden"
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {/* Flow animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-20"
            animate={{
              y: ['-100%', '100%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
        
        {/* Net flow indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <motion.div 
            className="bg-white rounded-lg px-3 py-2 shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-lg font-bold text-green-600">
              ${flowData.netFlow.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Net Flow</div>
          </motion.div>
        </div>
      </div>

      {/* Expense Streams (flowing out to right) */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
        {flowData.expenses.map((expense, index) => (
          <motion.div
            key={expense.category}
            className="mb-4 flex items-center justify-end"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.2 + 0.5 }}
          >
            <div className="mr-2 text-sm font-bold text-gray-800">
              ${expense.amount.toLocaleString()}
            </div>
            <motion.div
              className="h-6 rounded-full relative overflow-hidden"
              style={{
                width: `${(expense.amount / totalExpenses) * 150}px`,
                backgroundColor: expense.color,
              }}
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              {/* Flowing animation */}
              <motion.div
                className="absolute inset-0 bg-white opacity-30"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </motion.div>
            <div className="w-32 text-sm font-medium text-gray-700 ml-4">
              {expense.category}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Background ambient particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <h3 className={`text-lg font-semibold ${modeStyles.text}`}>
          💰 Financial Flow
        </h3>
        <p className="text-sm text-gray-600 text-center">
          Revenue streams flowing into your business
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-xs text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span className="text-xs text-gray-600">Expenses</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Net: ${flowData.netFlow.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export { FinancialFlowVisualization };
export default FinancialFlowVisualization;