import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Brain,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../components/psychological/MicroCelebrations.jsx';

// Mock goals data
const mockGoals = [
  {
    id: '1',
    title: 'Increase Monthly Revenue by 25%',
    description: 'Achieve $50,000 monthly recurring revenue by end of Q2',
    type: 'financial',
    priority: 'high',
    timeframe: 'long-term',
    targetDate: new Date(2024, 5, 30),
    progress: 65,
    status: 'in-progress',
    agentAssigned: 'strategy',
    milestones: [
      { id: '1', title: 'Launch new pricing tier', completed: true, dueDate: new Date(2024, 0, 15) },
      { id: '2', title: 'Acquire 50 new customers', completed: true, dueDate: new Date(2024, 1, 15) },
      { id: '3', title: 'Implement upselling strategy', completed: false, dueDate: new Date(2024, 2, 15) },
      { id: '4', title: 'Optimize conversion funnel', completed: false, dueDate: new Date(2024, 3, 15) }
    ],
    metrics: {
      current: 32500,
      target: 50000,
      unit: 'USD'
    },
    createdAt: new Date(2023, 11, 1),
    lastUpdated: new Date(2024, 0, 10)
  },
  {
    id: '2',
    title: 'Expand to 3 New Markets',
    description: 'Launch operations in Europe, Asia, and Latin America',
    type: 'growth',
    priority: 'high',
    timeframe: 'medium-term',
    targetDate: new Date(2024, 8, 30),
    progress: 30,
    status: 'in-progress',
    agentAssigned: 'strategy',
    milestones: [
      { id: '1', title: 'Market research completed', completed: true, dueDate: new Date(2024, 0, 30) },
      { id: '2', title: 'Legal entity setup', completed: false, dueDate: new Date(2024, 1, 30) },
      { id: '3', title: 'Local team hiring', completed: false, dueDate: new Date(2024, 2, 30) },
      { id: '4', title: 'Product localization', completed: false, dueDate: new Date(2024, 3, 30) }
    ],
    metrics: {
      current: 1,
      target: 3,
      unit: 'markets'
    },
    createdAt: new Date(2023, 11, 15),
    lastUpdated: new Date(2024, 0, 8)
  },
  {
    id: '3',
    title: 'Improve Customer Satisfaction Score',
    description: 'Achieve 95% customer satisfaction rating',
    type: 'quality',
    priority: 'medium',
    timeframe: 'short-term',
    targetDate: new Date(2024, 2, 31),
    progress: 80,
    status: 'in-progress',
    agentAssigned: 'support',
    milestones: [
      { id: '1', title: 'Implement feedback system', completed: true, dueDate: new Date(2024, 0, 15) },
      { id: '2', title: 'Train support team', completed: true, dueDate: new Date(2024, 0, 30) },
      { id: '3', title: 'Optimize response times', completed: false, dueDate: new Date(2024, 1, 15) },
      { id: '4', title: 'Launch customer success program', completed: false, dueDate: new Date(2024, 1, 30) }
    ],
    metrics: {
      current: 87,
      target: 95,
      unit: '%'
    },
    createdAt: new Date(2023, 11, 20),
    lastUpdated: new Date(2024, 0, 12)
  },
  {
    id: '4',
    title: 'Launch Mobile App',
    description: 'Release iOS and Android applications',
    type: 'product',
    priority: 'medium',
    timeframe: 'medium-term',
    targetDate: new Date(2024, 6, 30),
    progress: 15,
    status: 'planning',
    agentAssigned: 'development',
    milestones: [
      { id: '1', title: 'UI/UX design completed', completed: false, dueDate: new Date(2024, 1, 15) },
      { id: '2', title: 'Development started', completed: false, dueDate: new Date(2024, 2, 1) },
      { id: '3', title: 'Beta testing', completed: false, dueDate: new Date(2024, 4, 15) },
      { id: '4', title: 'App store submission', completed: false, dueDate: new Date(2024, 5, 30) }
    ],
    metrics: {
      current: 0,
      target: 2,
      unit: 'platforms'
    },
    createdAt: new Date(2024, 0, 1),
    lastUpdated: new Date(2024, 0, 5)
  }
];

const GoalsView = () => {
  const [goals, setGoals] = useState(mockGoals);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterTimeframe, setFilterTimeframe] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { triggerCelebration } = useCelebrations();

  // Filter goals
  const filteredGoals = goals.filter(goal => {
    const matchesType = filterType === 'all' || goal.type === filterType;
    const matchesTimeframe = filterTimeframe === 'all' || goal.timeframe === filterTimeframe;
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    
    return matchesType && matchesTimeframe && matchesStatus;
  });

  // Get goal type styling
  const getGoalTypeStyle = (type) => {
    const styles = {
      financial: 'bg-green-100 text-green-800 border-green-200',
      growth: 'bg-blue-100 text-blue-800 border-blue-200',
      quality: 'bg-purple-100 text-purple-800 border-purple-200',
      product: 'bg-orange-100 text-orange-800 border-orange-200',
      marketing: 'bg-pink-100 text-pink-800 border-pink-200',
      operational: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get priority styling
  const getPriorityStyle = (priority) => {
    const styles = {
      high: 'border-l-4 border-red-500',
      medium: 'border-l-4 border-yellow-500',
      low: 'border-l-4 border-green-500'
    };
    return styles[priority] || 'border-l-4 border-gray-500';
  };

  // Get status styling
  const getStatusStyle = (status) => {
    const styles = {
      'planning': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'planning': Clock,
      'in-progress': PlayCircle,
      'completed': CheckCircle2,
      'paused': AlertCircle,
      'cancelled': XCircle
    };
    return icons[status] || Clock;
  };

  // Calculate days remaining
  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Goal card component
  const GoalCard = ({ goal }) => {
    const StatusIcon = getStatusIcon(goal.status);
    const daysRemaining = getDaysRemaining(goal.targetDate);
    
    return (
      <motion.div
        className={`bg-white rounded-lg shadow-lg p-6 border ${getPriorityStyle(goal.priority)} cursor-pointer hover:shadow-xl transition-shadow`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => setSelectedGoal(goal)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getGoalTypeStyle(goal.type)}`}>
                {goal.type}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <StatusIcon className="w-5 h-5 text-gray-400" />
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(goal.status)}`}>
              {goal.status}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-900">{goal.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{goal.metrics.current}</div>
            <div className="text-xs text-gray-500">Current</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{goal.metrics.target}</div>
            <div className="text-xs text-gray-500">Target</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{daysRemaining}</div>
            <div className="text-xs text-gray-500">Days Left</div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Milestones</h4>
          {goal.milestones.slice(0, 3).map(milestone => (
            <div key={milestone.id} className="flex items-center space-x-2">
              {milestone.completed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Clock className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-sm ${milestone.completed ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                {milestone.title}
              </span>
            </div>
          ))}
          {goal.milestones.length > 3 && (
            <div className="text-xs text-gray-500">
              +{goal.milestones.length - 3} more milestones
            </div>
          )}
        </div>

        {/* Agent Assignment */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Assigned to {goal.agentAssigned} agent</span>
            </div>
            <div className="text-xs text-gray-500">
              Updated {goal.lastUpdated.toLocaleDateString()}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Goal detail modal
  const GoalDetailModal = () => {
    if (!selectedGoal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedGoal.title}</h2>
                <p className="text-gray-600">{selectedGoal.description}</p>
              </div>
              <button
                onClick={() => setSelectedGoal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progress Overview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Progress Overview</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{selectedGoal.progress}%</div>
                      <div className="text-sm text-gray-600">Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{selectedGoal.metrics.current}</div>
                      <div className="text-sm text-gray-600">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{selectedGoal.metrics.target}</div>
                      <div className="text-sm text-gray-600">Target</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedGoal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Milestones</h3>
                  <div className="space-y-3">
                    {selectedGoal.milestones.map(milestone => (
                      <div key={milestone.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        {milestone.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <div className="flex-1">
                          <h4 className={`font-medium ${milestone.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                            {milestone.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Due: {milestone.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                        {!milestone.completed && (
                          <button className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg hover:bg-blue-200 transition-colors">
                            Mark Complete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Goal Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Goal Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Type</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getGoalTypeStyle(selectedGoal.type)}`}>
                        {selectedGoal.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Priority</span>
                      <span className="font-semibold capitalize">{selectedGoal.priority}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Timeframe</span>
                      <span className="font-semibold capitalize">{selectedGoal.timeframe}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Target Date</span>
                      <span className="font-semibold">{selectedGoal.targetDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Days Remaining</span>
                      <span className="font-semibold">{getDaysRemaining(selectedGoal.targetDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Agent Assignment */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Agent Assignment</h3>
                  <div className="flex items-center space-x-3">
                    <Brain className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="font-medium">{selectedGoal.agentAssigned} Agent</div>
                      <div className="text-sm text-gray-600">Strategy & Planning</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    <Edit className="w-4 h-4" />
                    <span>Edit Goal</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    <TrendingUp className="w-4 h-4" />
                    <span>Update Progress</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                    <Brain className="w-4 h-4" />
                    <span>AI Insights</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Goals & Objectives</h1>
          <button
            onClick={() => {
              setShowAddGoal(true);
              triggerCelebration(CelebrationType.TASK_COMPLETE, {
                message: "Setting new goal! 🎯",
                intensity: 'normal'
              });
            }}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="financial">Financial</option>
              <option value="growth">Growth</option>
              <option value="quality">Quality</option>
              <option value="product">Product</option>
              <option value="marketing">Marketing</option>
              <option value="operational">Operational</option>
            </select>

            <select
              value={filterTimeframe}
              onChange={(e) => setFilterTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Timeframes</option>
              <option value="short-term">Short-term</option>
              <option value="medium-term">Medium-term</option>
              <option value="long-term">Long-term</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {filteredGoals.length} of {goals.length} goals
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </AnimatePresence>
      </div>

      {/* Goal Detail Modal */}
      <GoalDetailModal />
    </div>
  );
};

export default GoalsView;
