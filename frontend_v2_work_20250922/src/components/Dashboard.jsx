import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Target,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Active Projects', value: '12', change: '+2 this week', icon: BarChart3, color: 'bg-blue-500' },
    { title: 'Revenue Growth', value: '+24%', change: 'vs last month', icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Team Members', value: '8', change: '+1 new hire', icon: Users, color: 'bg-purple-500' },
    { title: 'Meetings Today', value: '4', change: '2 completed', icon: Calendar, color: 'bg-orange-500' },
  ];

  const recentActivities = [
    { id: 1, action: 'Completed onboarding flow', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'New customer inquiry received', time: '4 hours ago', type: 'info' },
    { id: 3, action: 'Project deadline approaching', time: '1 day ago', type: 'warning' },
    { id: 4, action: 'Team meeting scheduled', time: '2 days ago', type: 'info' },
  ];

  const upcomingTasks = [
    { id: 1, task: 'Review Q4 marketing strategy', due: 'Today', priority: 'high' },
    { id: 2, task: 'Update customer database', due: 'Tomorrow', priority: 'medium' },
    { id: 3, task: 'Prepare board presentation', due: 'Friday', priority: 'high' },
    { id: 4, task: 'Schedule team 1:1s', due: 'Next week', priority: 'low' },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{task.task}</p>
                  <p className="text-xs text-gray-500">Due: {task.due}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Target className="w-8 h-8 text-blue-500 mb-2" />
            <h4 className="font-medium text-gray-900">Set New Goal</h4>
            <p className="text-sm text-gray-500">Define your next milestone</p>
          </button>
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-8 h-8 text-green-500 mb-2" />
            <h4 className="font-medium text-gray-900">Schedule Meeting</h4>
            <p className="text-sm text-gray-500">Book time with your team</p>
          </button>
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-8 h-8 text-purple-500 mb-2" />
            <h4 className="font-medium text-gray-900">View Analytics</h4>
            <p className="text-sm text-gray-500">Check your progress</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
