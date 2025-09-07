import React from 'react';
import { motion } from 'framer-motion';

const FinancialFlowVisualization = () => {
  const flowData = {
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

  const totalRevenue = flowData.revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = flowData.expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="w-full h-96 bg-gradient-to-b from-blue-50 to-green-50 rounded-lg p-6 relative overflow-hidden">
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
          <div className="bg-white rounded-lg px-3 py-2 shadow-lg">
            <div className="text-lg font-bold text-green-600">
              ${flowData.netFlow.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Net Flow</div>
          </div>
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
              {expense.source}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export { FinancialFlowVisualization };
