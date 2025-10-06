import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, TrendingUp, Brain, X, CheckCircle, Clock } from 'lucide-react';
import { useCelebrations, CelebrationType } from '../../components/psychological/MicroCelebrations.jsx';
import AddGoalModal from './modals/AddGoalModal.jsx';
import GoalDetailModal from './modals/GoalDetailModal.jsx';

const GoalCard = ({ goal, onClick }) => {
  const daysRemaining = goal.target_date ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)) : '-';
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
          {goal.type || 'general'}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${goal.progress || 0}%` }} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>{Number.isFinite(daysRemaining) ? daysRemaining : '-'} days left</span>
        <span className="capitalize">{goal.status}</span>
      </div>
    </motion.div>
  );
};

const GoalsDashboard = () => {
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showGoalDetailModal, setShowGoalDetailModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterTimeframe, setFilterTimeframe] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { triggerCelebration } = useCelebrations();

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/goals/');
      if (!res.ok) throw new Error('Failed to load goals');
      const data = await res.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    setShowGoalDetailModal(true);
  };

  const handleGoalCreated = () => {
    setShowAddGoal(false);
    triggerCelebration(CelebrationType.TASK_COMPLETE, { message: 'Goal created! 🎯', intensity: 'normal' });
    fetchGoals();
  };

  const handleEditGoal = async (goalUpdates) => {
    if (!selectedGoal) return;
    await fetch(`/api/goals/${selectedGoal.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(goalUpdates) });
    triggerCelebration(CelebrationType.TASK_COMPLETE, { message: 'Goal updated ✏️', intensity: 'normal' });
    fetchGoals();
  };

  const handleUpdateProgress = async ({ progress, milestone_id }) => {
    if (!selectedGoal) return;
    await fetch(`/api/goals/${selectedGoal.id}/progress`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ progress, milestone_id }) });
    triggerCelebration(CelebrationType.TASK_COMPLETE, { message: 'Progress updated 📊', intensity: 'normal' });
    fetchGoals();
  };

  const handleAIInsights = async () => {
    if (!selectedGoal) return;
    const res = await fetch(`/api/goals/${selectedGoal.id}/insights`, { method: 'POST' });
    if (res.ok) {
      triggerCelebration(CelebrationType.TASK_COMPLETE, { message: 'AI insights generated 🤖', intensity: 'high' });
    }
  };

  const filteredGoals = goals.filter((goal) => {
    const matchesType = filterType === 'all' || goal.type === filterType;
    const matchesTimeframe = filterTimeframe === 'all' || goal.timeframe === filterTimeframe;
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    return matchesType && matchesTimeframe && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Goals & Objectives</h1>
          <button
            onClick={() => {
              setShowAddGoal(true);
              triggerCelebration(CelebrationType.TASK_COMPLETE, { message: 'Setting new goal! 🎯', intensity: 'normal' });
            }}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </div>
        <p className="text-gray-600">Set and track your business objectives. Your AI agents will work towards achieving these goals automatically.</p>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Types</option>
              <option value="financial">Financial</option>
              <option value="growth">Growth</option>
              <option value="marketing">Marketing</option>
              <option value="operational">Operational</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select value={filterTimeframe} onChange={(e) => setFilterTimeframe(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Timeframes</option>
              <option value="short-term">Short-term</option>
              <option value="medium-term">Medium-term</option>
              <option value="long-term">Long-term</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onClick={handleGoalClick} />
          ))}
        </AnimatePresence>
      </div>

      <AddGoalModal isOpen={showAddGoal} onClose={() => setShowAddGoal(false)} onCreated={handleGoalCreated} />
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

export default GoalsDashboard;


