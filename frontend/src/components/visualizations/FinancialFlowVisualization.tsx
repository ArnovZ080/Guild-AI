import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinancialData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export const FinancialFlowVisualization: React.FC = () => {
  const [data, setData] = useState<FinancialData[]>([
    { month: 'Jan', income: 4000, expenses: 2400, profit: 1600 },
    { month: 'Feb', income: 3000, expenses: 1398, profit: 1602 },
    { month: 'Mar', income: 2000, expenses: 980, profit: 1020 },
    { month: 'Apr', income: 2780, expenses: 3908, profit: -1128 },
    { month: 'May', income: 1890, expenses: 4800, profit: -2910 },
    { month: 'Jun', income: 2390, expenses: 3800, profit: -1410 },
    { month: 'Jul', income: 3490, expenses: 4300, profit: -810 },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const lastData = prev[prev.length - 1];
        const newMonthDate = new Date(lastData.month + ' 1, 2023'); // Dummy year for date parsing
        newMonthDate.setMonth(newMonthDate.getMonth() + 1);
        const newMonth = newMonthDate.toLocaleString('default', { month: 'short' });

        const newIncome = lastData.income + (Math.random() - 0.5) * 1000;
        const newExpenses = lastData.expenses + (Math.random() - 0.5) * 800;
        const newProfit = newIncome - newExpenses;

        return [
          ...prev.slice(1),
          {
            month: newMonth,
            income: parseFloat(newIncome.toFixed(0)),
            expenses: parseFloat(newExpenses.toFixed(0)),
            profit: parseFloat(newProfit.toFixed(0)),
          }
        ];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Financial Flow</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              labelStyle={{ color: '#1F2937' }}
              itemStyle={{ color: '#4B5563' }}
              formatter={(value: number) => `$${value.toFixed(0)}`}
            />
            <Legend />
            <Bar dataKey="income" stackId="a" fill="#10B981" name="Income" />
            <Bar dataKey="expenses" stackId="a" fill="#EF4444" name="Expenses" />
            <Bar dataKey="profit" fill="#3B82F6" name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
