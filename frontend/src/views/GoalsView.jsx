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
  PlayCircle,
  X
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
    title: 'Build Brand Authority',
    description: 'Establish thought leadership in the AI automation space',
    type: 'marketing',
    priority: 'medium',
    timeframe: 'medium-term',
    targetDate: new Date(2024, 8, 30),
    progress: 40,
    status: 'in-progress',
    agentAssigned: 'content',
    milestones: [
      { id: '1', title: 'Publish 20 high-quality blog posts', completed: false, dueDate: new Date(2024, 2, 30) },
      { id: '2', title: 'Speak at 3 industry conferences', completed: false, dueDate: new Date(2024, 6, 30) },
      { id: '3', title: 'Launch podcast series', completed: false, dueDate: new Date(2024, 4, 30) }
    ],
    metrics: {
      current: 8,
      target: 20,
      unit: 'posts'
    },
    createdAt: new Date(2023, 11, 15),
    lastUpdated: new Date(2024, 0, 8)
  },
  {
    id: '3',
    title: 'Optimize Customer Experience',
    description: 'Improve customer satisfaction scores and reduce churn',
    type: 'operational',
    priority: 'high',
    timeframe: 'short-term',
    targetDate: new Date(2024, 3, 31),
    progress: 30,
    status: 'in-progress',
    agentAssigned: 'customer-service',
    milestones: [
      { id: '1', title: 'Implement customer feedback system', completed: true, dueDate: new Date(2024, 0, 31) },
      { id: '2', title: 'Train support team on new processes', completed: false, dueDate: new Date(2024, 1, 28) },
      { id: '3', title: 'Launch customer success program', completed: false, dueDate: new Date(2024, 2, 31) }
    ],
    metrics: {
      current: 7.2,
      target: 9.0,
      unit: 'rating'
    },
    createdAt: new Date(2023, 11, 20),
    lastUpdated: new Date(2024, 0, 12)
  }
];

// Goal Card Component
const GoalCard = ({ goal, onClick }) => {
  const daysRemaining = Math.ceil((goal.targetDate - new Date()) / (1000 * 60 * 60 * 24));
  
  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => onClick(goal)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          goal.type === 'financial' ? 'bg-green-100 text-green-800' :
          goal.type === 'marketing' ? 'bg-pink-100 text-pink-800' :
          goal.type === 'operational' ? 'bg-gray-100 text-gray-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {goal.type}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>{daysRemaining} days left</span>
        <span className="capitalize">{goal.status}</span>
      </div>
    </motion.div>
  );
};

// Goal Detail Modal Component
const GoalDetailModal = ({ goal, isOpen, onClose, onEdit, onUpdateProgress, onAIInsights }) => {
  if (!isOpen || !goal) return null;
  
  const daysRemaining = Math.ceil((goal.targetDate - new Date()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{goal.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{goal.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Type</h4>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  goal.type === 'financial' ? 'bg-green-100 text-green-800' :
                  goal.type === 'marketing' ? 'bg-pink-100 text-pink-800' :
                  goal.type === 'operational' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {goal.type}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                  goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {goal.priority}
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Progress</h4>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{goal.progress}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{goal.metrics.current}</div>
                <div className="text-sm text-gray-500">Current</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{goal.metrics.target}</div>
                <div className="text-sm text-gray-500">Target</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{daysRemaining}</div>
                <div className="text-sm text-gray-500">Days Left</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Milestones</h4>
              <div className="space-y-2">
                {goal.milestones.map(milestone => (
                  <div key={milestone.id} className="flex items-center space-x-3">
                    {milestone.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm ${milestone.completed ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                      {milestone.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {milestone.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex space-x-3">
            <button
              onClick={() => onEdit(goal)}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Goal</span>
            </button>
            <button
              onClick={() => onUpdateProgress(goal)}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Update Progress</span>
            </button>
            <button
              onClick={() => onAIInsights(goal)}
              className="flex-1 flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Brain className="w-4 h-4" />
              <span>AI Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalsView = () => {
  const [goals, setGoals] = useState(mockGoals);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showGoalDetailModal, setShowGoalDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterTimeframe, setFilterTimeframe] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { triggerCelebration } = useCelebrations();

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    setShowGoalDetailModal(true);
  };

  const handleEditGoal = (goal) => {
    console.log('Editing goal:', goal.title);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Editing goal: ${goal.title} ✏️`,
      intensity: 'normal'
    });
    // In real implementation, this would open an edit form
  };

  const handleUpdateProgress = (goal) => {
    console.log('Updating progress for goal:', goal.title);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `Updating progress for: ${goal.title} 📊`,
      intensity: 'normal'
    });
    // In real implementation, this would open a progress update form
  };

  const handleAIInsights = (goal) => {
    console.log('Getting AI insights for goal:', goal.title);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: `AI insights generated for: ${goal.title} 🤖`,
      intensity: 'high'
    });
    // In real implementation, this would trigger AI analysis
  };

  // Filter goals
  const filteredGoals = goals.filter(goal => {
    const matchesType = filterType === 'all' || goal.type === filterType;
    const matchesTimeframe = filterTimeframe === 'all' || goal.timeframe === filterTimeframe;
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    
    return matchesType && matchesTimeframe && matchesStatus;
  });

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
        
        <p className="text-gray-600">
          Set and track your business objectives. Your AI agents will work towards achieving these goals automatically.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="financial">Financial</option>
              <option value="growth">Growth</option>
              <option value="marketing">Marketing</option>
              <option value="operational">Operational</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select
              value={filterTimeframe}
              onChange={(e) => setFilterTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Timeframes</option>
              <option value="short-term">Short-term</option>
              <option value="medium-term">Medium-term</option>
              <option value="long-term">Long-term</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onClick={handleGoalClick} />
          ))}
        </AnimatePresence>
      </div>

      {/* Goal Detail Modal */}
      <GoalDetailModal 
        goal={selectedGoal}
        isOpen={showGoalDetailModal}
        onClose={() => setShowGoalDetailModal(false)}
        onEdit={handleEditGoal}
        onUpdateProgress={handleUpdateProgress}
        onAIInsights={handleAIInsights}
      />
    </div>
  );
};

export default GoalsView;