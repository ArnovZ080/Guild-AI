import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MomentumData {
  current: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  streakDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface MomentumAction {
  id: string;
  action: string;
  impact: number; // -1 to 1, negative decreases momentum, positive increases
  timestamp: Date;
  category: 'content' | 'sales' | 'marketing' | 'operations' | 'customer';
  description: string;
}

export const ProgressMomentumTracker: React.FC = () => {
  const [momentum, setMomentum] = useState<MomentumData>({
    current: 0.75,
    trend: 'increasing',
    streakDays: 7,
    weeklyGoal: 100,
    weeklyProgress: 68
  });

  const [dailyProgress] = useState([
    { day: 'Mon', value: 85 },
    { day: 'Tue', value: 92 },
    { day: 'Wed', value: 78 },
    { day: 'Thu', value: 95 },
    { day: 'Fri', value: 88 },
    { day: 'Sat', value: 75 },
    { day: 'Sun', value: 82 }
  ]);

  const [momentumActions] = useState<MomentumAction[]>([
    {
      id: '1',
      action: 'Published viral blog post',
      impact: 0.15,
      timestamp: new Date(2024, 0, 15, 14, 30),
      category: 'content',
      description: 'AI Trends 2024 blog post generated 2.3K shares and 15K views'
    },
    {
      id: '2',
      action: 'Closed major client deal',
      impact: 0.25,
      timestamp: new Date(2024, 0, 15, 11, 15),
      category: 'sales',
      description: 'Secured $50K annual contract with enterprise client'
    },
    {
      id: '3',
      action: 'Launched social media campaign',
      impact: 0.12,
      timestamp: new Date(2024, 0, 14, 16, 45),
      category: 'marketing',
      description: 'Instagram campaign increased followers by 1.2K in 24 hours'
    },
    {
      id: '4',
      action: 'Customer complaint resolved',
      impact: -0.08,
      timestamp: new Date(2024, 0, 14, 9, 20),
      category: 'customer',
      description: 'Technical issue with premium feature caused temporary momentum dip'
    },
    {
      id: '5',
      action: 'Team productivity boost',
      impact: 0.18,
      timestamp: new Date(2024, 0, 13, 15, 30),
      category: 'operations',
      description: 'New automation workflow increased team efficiency by 40%'
    },
    {
      id: '6',
      action: 'Product feature launch',
      impact: 0.22,
      timestamp: new Date(2024, 0, 12, 10, 0),
      category: 'operations',
      description: 'AI-powered analytics dashboard received 95% user satisfaction'
    }
  ]);

  const getMomentumColor = (value: number) => {
    if (value >= 0.8) return '#10B981'; // Green
    if (value >= 0.6) return '#F59E0B'; // Amber
    if (value >= 0.4) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getMomentumMessage = (value: number, trend: string) => {
    if (value >= 0.8) {
      return trend === 'increasing' ? "You're on fire! 🔥" : "Great momentum! 💪";
    }
    if (value >= 0.6) {
      return trend === 'increasing' ? "Building steam! 📈" : "Steady progress 👍";
    }
    if (value >= 0.4) {
      return "Let's pick up the pace! ⚡";
    }
    return "Time to recharge 🔋";
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      content: '📝',
      sales: '💰',
      marketing: '📢',
      operations: '⚙️',
      customer: '👥'
    };
    return icons[category as keyof typeof icons] || '📊';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      content: 'bg-blue-100 text-blue-800',
      sales: 'bg-green-100 text-green-800',
      marketing: 'bg-purple-100 text-purple-800',
      operations: 'bg-orange-100 text-orange-800',
      customer: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600';
    if (impact < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getImpactIcon = (impact: number) => {
    if (impact > 0) return '📈';
    if (impact < 0) return '📉';
    return '➡️';
  };

  // Simulate momentum changes
  useEffect(() => {
    const interval = setInterval(() => {
      setMomentum(prev => ({
        ...prev,
        current: Math.max(0, Math.min(1, prev.current + (Math.random() - 0.5) * 0.1)),
        weeklyProgress: Math.min(prev.weeklyGoal, prev.weeklyProgress + Math.random() * 2)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">Momentum Tracker</h3>

      {/* Main Momentum Display */}
      <div className="text-center mb-8">
        <motion.div
          className="relative w-32 h-32 mx-auto mb-4"
          animate={{
            scale: momentum.current > 0.8 ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: momentum.current > 0.8 ? Infinity : 0,
          }}
        >
          {/* Momentum Circle */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="8"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke={getMomentumColor(momentum.current)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${momentum.current * 351.86} 351.86`}
              initial={{ strokeDasharray: "0 351.86" }}
              animate={{ strokeDasharray: `${momentum.current * 351.86} 351.86` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: getMomentumColor(momentum.current) }}>
                {Math.round(momentum.current * 100)}%
              </div>
              <div className="text-xs text-gray-600">Momentum</div>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="text-lg font-medium"
          style={{ color: getMomentumColor(momentum.current) }}
          key={momentum.current} // Re-animate when momentum changes
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {getMomentumMessage(momentum.current, momentum.trend)}
        </motion.p>
      </div>

      {/* Streak Counter */}
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg px-4 py-2">
          <div className="text-center">
            <div className="text-2xl font-bold">{momentum.streakDays}</div>
            <div className="text-sm">Day Streak 🔥</div>
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
          <span className="text-sm text-gray-600">
            {Math.round(momentum.weeklyProgress)} / {momentum.weeklyGoal}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full relative overflow-hidden"
            initial={{ width: '0%' }}
            animate={{ width: `${(momentum.weeklyProgress / momentum.weeklyGoal) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Daily Progress Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">This Week's Progress</h4>
        <div className="flex justify-between items-end space-x-2">
          {dailyProgress.map((day, index) => (
            <div key={day.day} className="flex-1 text-center">
              <motion.div
                className="bg-gradient-to-t from-blue-400 to-purple-500 rounded-t-lg mb-2 relative overflow-hidden"
                style={{ height: `${(day.value / 100) * 60}px` }}
                initial={{ height: 0 }}
                animate={{ height: `${(day.value / 100) * 60}px` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                {/* Sparkle effect for high values */}
                {day.value > 90 && (
                  <motion.div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 text-yellow-300"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  >
                    ✨
                  </motion.div>
                )}
              </motion.div>
              <div className="text-xs text-gray-600">{day.day}</div>
              <div className="text-xs font-medium text-gray-800">{day.value}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Momentum Actions Timeline */}
      <div className="mt-8">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Recent Actions & Impact</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {momentumActions
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 5)
            .map((action, index) => (
              <motion.div
                key={action.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  console.log('Viewing momentum action details:', action.action);
                  alert(`Action Details:\n\nAction: ${action.action}\nImpact: ${Math.abs(action.impact * 100).toFixed(0)}%\nCategory: ${action.category}\nDescription: ${action.description}\n\nAgent Involvement: This would show which agents were involved, what was executed, and the specific results that led to this momentum change.`);
                }}
              >
                <div className="flex-shrink-0">
                  <span className="text-lg">{getCategoryIcon(action.category)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-sm font-medium text-gray-900 truncate">{action.action}</h5>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getImpactColor(action.impact)}`}>
                        {getImpactIcon(action.impact)} {Math.abs(action.impact * 100).toFixed(0)}%
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(action.category)}`}>
                        {action.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{action.description}</p>
                  <p className="text-xs text-gray-500">
                    {action.timestamp.toLocaleDateString()} at {action.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2">
          <button 
            onClick={() => {
              console.log('Viewing extended momentum timeline');
              alert('Extended Timeline: This would show a detailed view of all momentum changes over time with agent involvement and results.');
            }}
            className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            📊 View Extended Timeline
          </button>
          <button 
            onClick={() => {
              console.log('Repeating high-impact actions');
              alert('Repeat High-Impact Actions: This would identify and re-deploy the most successful actions that increased momentum.');
            }}
            className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
          >
            🔄 Repeat High-Impact Actions
          </button>
        </div>
      </div>
    </div>
  );
};
