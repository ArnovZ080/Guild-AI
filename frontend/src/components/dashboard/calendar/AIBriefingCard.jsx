import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Sparkles
} from 'lucide-react';

const AIBriefingCard = ({ date, events, insights, onOptimizeDay, onPrepareReports, onReschedule }) => {
  const todayEvents = events.filter(event => 
    new Date(event.date).toDateString() === date.toDateString()
  );

  const totalMeetingTime = todayEvents.reduce((acc, event) => 
    event.type === 'meeting' ? acc + event.duration : acc, 0
  );

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-xl mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{getGreeting()} 👋</h3>
            <p className="text-blue-100 text-sm">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <Sparkles className="w-6 h-6 text-yellow-300" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-blue-200" />
            <span className="text-xs text-blue-200">Total Time</span>
          </div>
          <p className="text-xl font-bold">{formatTime(totalMeetingTime)}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-4 h-4 text-blue-200" />
            <span className="text-xs text-blue-200">Meetings</span>
          </div>
          <p className="text-xl font-bold">{todayEvents.filter(e => e.type === 'meeting').length}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <CheckCircle className="w-4 h-4 text-blue-200" />
            <span className="text-xs text-blue-200">Tasks</span>
          </div>
          <p className="text-xl font-bold">{todayEvents.filter(e => e.type === 'goal').length}</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-sm mb-2 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Today's Intelligence
        </h4>
        
        {insights?.suggestions && insights.suggestions.length > 0 ? (
          <ul className="space-y-2">
            {insights.suggestions.slice(0, 3).map((suggestion, index) => (
              <li key={index} className="text-sm text-blue-100 flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-blue-100">
            You've got {todayEvents.length} {todayEvents.length === 1 ? 'event' : 'events'} scheduled.
            {totalMeetingTime > 180 && ' Your day is quite packed — consider scheduling breaks.'}
            {totalMeetingTime < 120 && ' Good balance today — use free time for deep work.'}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onOptimizeDay}
          className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium transition-all"
        >
          ✅ Optimize Day
        </button>
        <button 
          onClick={onPrepareReports}
          className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium transition-all"
        >
          📊 Prepare Reports
        </button>
        <button 
          onClick={onReschedule}
          className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium transition-all"
        >
          🔄 Reschedule
        </button>
      </div>

      {/* High Priority Alerts */}
      {todayEvents.some(e => e.priority === 'high') && (
        <motion.div
          className="mt-4 bg-orange-500/20 border border-orange-300/30 backdrop-blur-sm rounded-lg p-3"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-200" />
            <div>
              <p className="text-sm font-semibold">High Priority Today</p>
              <p className="text-xs text-blue-100">
                {todayEvents.filter(e => e.priority === 'high').length} critical {
                  todayEvents.filter(e => e.priority === 'high').length === 1 ? 'event' : 'events'
                } requiring attention
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AIBriefingCard;

