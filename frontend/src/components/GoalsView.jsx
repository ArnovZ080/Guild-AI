import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Star,
  AlertCircle
} from 'lucide-react';

// Mock goals data
const mockGoals = [
  {
    id: '1',
    title: 'Increase Monthly Revenue by 25%',
    description: 'Achieve $50,000 monthly recurring revenue by end of Q2',
    type: 'financial',
    priority: 'high',
    progress: 65,
    status: 'in-progress',
    targetDate: new Date(2024, 5, 30),
    metrics: {
      current: 32500,
      target: 50000,
      unit: 'USD'
    }
  },
  {
    id: '2',
    title: 'Launch New Product Line',
    description: 'Introduce AI-powered analytics dashboard for customers',
    type: 'product',
    priority: 'medium',
    progress: 30,
    status: 'in-progress',
    targetDate: new Date(2024, 7, 15),
    metrics: {
      current: 3,
      target: 10,
      unit: 'features'
    }
  },
  {
    id: '3',
    title: 'Build Customer Success Team',
    description: 'Hire and train 5 customer success specialists',
    type: 'team',
    priority: 'high',
    progress: 80,
    status: 'in-progress',
    targetDate: new Date(2024, 4, 30),
    metrics: {
      current: 4,
      target: 5,
      unit: 'people'
    }
  }
];

const GoalsView = () => {
  const [goals, setGoals] = useState(mockGoals);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'business',
    priority: 'medium',
    targetDate: ''
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'financial': return <DollarSign className="w-5 h-5" />;
      case 'product': return <Target className="w-5 h-5" />;
      case 'team': return <Users className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    const goal = {
      id: Date.now().toString(),
      ...newGoal,
      progress: 0,
      status: 'in-progress',
      targetDate: new Date(newGoal.targetDate),
      metrics: { current: 0, target: 100, unit: 'progress' }
    };
    setGoals([...goals, goal]);
    setNewGoal({ title: '', description: '', type: 'business', priority: 'medium', targetDate: '' });
    setShowAddGoal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals & Objectives</h1>
          <p className="text-gray-600">Track your business milestones and achievements</p>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddGoal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Add New Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="business">Business</option>
                    <option value="financial">Financial</option>
                    <option value="product">Product</option>
                    <option value="team">Team</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {getTypeIcon(goal.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(goal.priority)}`}>
                  {goal.priority}
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{goal.progress}%</span>
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
              <div className="text-sm">
                <span className="text-gray-600">Current: </span>
                <span className="font-medium">{goal.metrics.current.toLocaleString()}</span>
                <span className="text-gray-600"> / {goal.metrics.target.toLocaleString()} {goal.metrics.unit}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                {goal.targetDate.toLocaleDateString()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  View Details
                </button>
                <button className="flex items-center text-sm text-green-600 hover:text-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Update Progress
                </button>
              </div>
              <button className="p-1 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 mb-6">Create your first goal to start tracking your business objectives</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Goal
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalsView;
