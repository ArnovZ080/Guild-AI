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
      { category: 'Marketing', amount: 3000, color: '#EF4444' },
      { category: 'Tools', amount: 1500, color: '#F59E0B' },
      { category: 'Operations', amount: 2000, color: '#EC4899' }
    ],
    netFlow: 21500
  };

  const totalRevenue = flowData.revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = flowData.expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="w-full h-96 bg-gray-800 rounded-lg p-6 relative overflow-hidden text-white">
        <h3 className="text-lg font-semibold mb-4 text-white">Financial Flow</h3>
        <div className="relative w-full h-full">
            {/* Main River (center) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-16 transform -translate-x-1/2">
                <motion.div
                className="w-full h-full bg-gradient-to-b from-blue-500 to-green-500 rounded-full relative overflow-hidden"
                >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-20"
                    animate={{ y: ['-100%', '100%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />
                </motion.div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="bg-gray-900 rounded-lg px-3 py-2 shadow-lg">
                    <div className="text-lg font-bold text-green-400">${flowData.netFlow.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Net Flow</div>
                </div>
                </div>
            </div>

            {/* Revenue Streams (flowing in from left) */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1/2">
                {flowData.revenue.map((stream, index) => (
                <motion.div
                    key={stream.source}
                    className="mb-4 flex items-center justify-end"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                >
                    <div className="text-sm font-medium text-gray-300 mr-4 text-right">{stream.source}</div>
                    <motion.div
                        className="h-6 rounded-full"
                        style={{ width: `${(stream.amount / totalRevenue) * 100}%`, backgroundColor: stream.color }}
                    />
                </motion.div>
                ))}
            </div>

            {/* Expense Streams (flowing out to right) */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2">
                {flowData.expenses.map((expense, index) => (
                <motion.div
                    key={expense.category}
                    className="mb-4 flex items-center"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                >
                    <motion.div
                        className="h-6 rounded-full"
                        style={{ width: `${(expense.amount / totalExpenses) * 100}%`, backgroundColor: expense.color }}
                    />
                    <div className="text-sm font-medium text-gray-300 ml-4">{expense.category}</div>
                </motion.div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default FinancialFlowVisualization;
