import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Metric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface PulseData {
  date: string;
  revenue: number;
  leads: number;
  conversion: number;
}

export const BusinessPulseMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([
    { name: 'Revenue', value: 12500, unit: '$', trend: 'up', change: 12.5 },
    { name: 'New Leads', value: 320, unit: '', trend: 'up', change: 8.2 },
    { name: 'Conversion Rate', value: 4.8, unit: '%', trend: 'stable', change: 0.1 },
    { name: 'Customer Satisfaction', value: 92, unit: '%', trend: 'up', change: 1.5 },
  ]);

  const [pulseData, setPulseData] = useState<PulseData[]>([
    { date: 'Jan', revenue: 4000, leads: 240, conversion: 3.5 },
    { date: 'Feb', revenue: 3000, leads: 139, conversion: 4.0 },
    { date: 'Mar', revenue: 2000, leads: 980, conversion: 2.0 },
    { date: 'Apr', revenue: 2780, leads: 390, conversion: 2.8 },
    { date: 'May', revenue: 1890, leads: 480, conversion: 1.9 },
    { date: 'Jun', revenue: 2390, leads: 380, conversion: 2.5 },
    { date: 'Jul', revenue: 3490, leads: 430, conversion: 3.2 },
  ]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '⬆️';
    if (trend === 'down') return '⬇️';
    return '➡️';
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 100,
        change: parseFloat(((Math.random() - 0.5) * 5).toFixed(1)),
        trend: Math.random() > 0.6 ? 'up' : Math.random() < 0.4 ? 'down' : 'stable'
      })));

      setPulseData(prev => {
        const lastData = prev[prev.length - 1];
        const newDate = new Date(lastData.date);
        newDate.setMonth(newDate.getMonth() + 1);
        const newMonth = newDate.toLocaleString('default', { month: 'short' });

        return [
          ...prev.slice(1),
          {
            date: newMonth,
            revenue: lastData.revenue + (Math.random() - 0.5) * 500,
            leads: lastData.leads + (Math.random() - 0.5) * 50,
            conversion: lastData.conversion + (Math.random() - 0.5) * 0.5,
          }
        ];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Business Pulse</h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((metric) => (
          <motion.div
            key={metric.name}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm text-gray-600">{metric.name}</div>
            <div className="flex items-end justify-between mt-1">
              <div className="text-2xl font-bold text-gray-900">
                {metric.unit}{metric.value.toFixed(metric.unit === '%' ? 1 : 0)}
              </div>
              <div className={`flex items-center text-sm font-medium ${getTrendColor(metric.trend)}`}>
                {getTrendIcon(metric.trend)} {Math.abs(metric.change).toFixed(1)}{metric.unit}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pulseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              labelStyle={{ color: '#1F2937' }}
              itemStyle={{ color: '#4B5563' }}
            />
            <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} name="Revenue" unit="$" />
            <Line type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={2} name="Leads" />
            <Line type="monotone" dataKey="conversion" stroke="#F59E0B" strokeWidth={2} name="Conversion" unit="%" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
