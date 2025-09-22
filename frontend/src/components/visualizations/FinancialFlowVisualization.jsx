import React from 'react';
import { motion } from 'framer-motion';

const FlowBar = ({ labelLeft, labelRight, amountLabel, widthPx, color, align = 'left', delay = 0 }) => {
  return (
    <motion.div
      className={`mb-3 flex items-center ${align === 'right' ? 'justify-end' : ''}`}
      initial={{ x: align === 'right' ? 80 : -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      {align === 'right' ? (
        <>
          <div className="mr-2 text-sm font-semibold text-gray-800">{amountLabel}</div>
          <div className="h-5 rounded-full relative overflow-hidden" style={{ width: Math.max(12, widthPx), backgroundColor: color }}>
            <motion.div className="absolute inset-0 bg-white/30" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }} />
          </div>
          <div className="w-32 text-sm font-medium text-gray-700 ml-3 truncate text-right">{labelRight}</div>
        </>
      ) : (
        <>
          <div className="w-32 text-sm font-medium text-gray-700 mr-3 truncate">{labelLeft}</div>
          <div className="h-5 rounded-full relative overflow-hidden" style={{ width: Math.max(12, widthPx), backgroundColor: color }}>
            <motion.div className="absolute inset-0 bg-white/30" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }} />
          </div>
          <div className="ml-2 text-sm font-semibold text-gray-800">{amountLabel}</div>
        </>
      )}
    </motion.div>
  );
};

const FinancialFlowVisualization = ({ revenueBreakdown = [], expenseBreakdown = [], netFlow = 0 }) => {
  const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + (item.amount || 0), 0) || 1;
  const totalExpenses = expenseBreakdown.reduce((sum, item) => sum + (item.amount || 0), 0) || 1;

  const maxWidth = 220;

  return (
    <div className="w-full relative rounded-lg p-6 overflow-hidden bg-gradient-to-b from-blue-50 to-emerald-50 border border-gray-200">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Financial Flow</h3>
        <p className="text-xs text-gray-600">Revenue streams flowing in • Expenses flowing out</p>
      </div>

      {/* Revenue (left) */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        {revenueBreakdown.map((r, idx) => (
          <FlowBar
            key={`${r.source || r.name || 'rev'}-${idx}`}
            labelLeft={r.source || r.name || 'Revenue'}
            amountLabel={`$${(r.amount || 0).toLocaleString?.()}`}
            widthPx={(Math.max(0, r.amount || 0) / totalRevenue) * maxWidth}
            color={r.color || '#10B981'}
            align="left"
            delay={idx * 0.08}
          />
        ))}
      </div>

      {/* River center */}
      <div className="absolute left-1/2 top-10 bottom-10 -translate-x-1/2 w-14">
        <motion.div className="w-full h-full rounded-full bg-gradient-to-b from-blue-400 to-emerald-400 relative overflow-hidden shadow" animate={{ opacity: [0.9, 1, 0.9] }} transition={{ duration: 2.2, repeat: Infinity }}>
          <motion.div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-25" animate={{ y: ['-100%', '100%'] }} transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }} />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div className="bg-white rounded-md px-3 py-2 shadow" whileHover={{ scale: 1.04 }}>
            <div className="text-base font-bold text-emerald-600">${(netFlow || 0).toLocaleString?.()}</div>
            <div className="text-[10px] text-gray-600 text-center">Net Flow</div>
          </motion.div>
        </div>
      </div>

      {/* Expenses (right) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        {expenseBreakdown.map((e, idx) => (
          <FlowBar
            key={`${e.category || e.name || 'exp'}-${idx}`}
            labelRight={e.category || e.name || 'Expense'}
            amountLabel={`$${(e.amount || 0).toLocaleString?.()}`}
            widthPx={(Math.max(0, e.amount || 0) / totalExpenses) * maxWidth}
            color={e.color || '#EF4444'}
            align="right"
            delay={idx * 0.08 + 0.2}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-0 right-0 px-6 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />Revenue</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />Expenses</div>
        </div>
        <div>Net: ${((netFlow || 0)).toLocaleString?.()}</div>
      </div>
    </div>
  );
};

export default FinancialFlowVisualization;


