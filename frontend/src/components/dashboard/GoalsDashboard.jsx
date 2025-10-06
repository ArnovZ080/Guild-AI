import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, TrendingUp, Brain, X, CheckCircle, Clock } from 'lucide-react';
import { useCelebrations, CelebrationType } from '../../components/psychological/MicroCelebrations.jsx';
import AddGoalModal from './modals/AddGoalModal.jsx';
import GoalDetailModal from './modals/GoalDetailModal.jsx';

const ProgressModal = ({ goal, isOpen, onClose, onSave }) => {
  const [selectedMilestone, setSelectedMilestone] = React.useState('');
  const [progress, setProgress] = React.useState(goal?.progress || 0);
  if (!isOpen || !goal) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-lg font-semibold mb-3">Update Progress</div>
        <div className="space-y-3">
          {Array.isArray(goal.milestones) && goal.milestones.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mark milestone complete</label>
              <select value={selectedMilestone} onChange={(e) => setSelectedMilestone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">None</option>
                {goal.milestones.filter((m) => !m.completed).map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
            <input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(parseInt(e.target.value || '0', 10))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
        <div className="mt-4 flex space-x-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={() => onSave({ progress, milestone_id: selectedMilestone || undefined })} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Save</button>
        </div>
      </div>
    </div>
  );
};

const InsightsModal = ({ goal, insights, isOpen, onClose }) => {
  if (!isOpen || !goal) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">AI Insights</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(insights, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

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
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [insights, setInsights] = useState(null);

  const { triggerCelebration } = useCelebrations();

  const mock = [
    { id: 'mock-1', title: 'Increase Monthly Revenue by 25%', description: 'Achieve $50,000 MRR by end of Q2', type: 'financial', priority: 'high', timeframe: 'long-term', target_date: new Date().toISOString(), status: 'in-progress', progress: 65, metrics: { current: 32500, target: 50000, unit: 'USD' }, milestones: [ { id: 'm1', title: 'Launch new pricing tier', completed: true }, { id: 'm2', title: 'Acquire 50 new customers', completed: true }, { id: 'm3', title: 'Implement upselling strategy', completed: false } ] },
    { id: 'mock-2', title: 'Build Brand Authority', description: 'Establish thought leadership in AI automation', type: 'marketing', priority: 'medium', timeframe: 'medium-term', target_date: new Date().toISOString(), status: 'in-progress', progress: 40, metrics: { current: 8, target: 20, unit: 'posts' }, milestones: [ { id: 'm1', title: 'Publish 20 high-quality blog posts', completed: false } ] },
  ];

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/goals/');
      if (!res.ok) {
        setGoals(mock);
        return;
      }
      const data = await res.json();
      setGoals(Array.isArray(data) && data.length ? data : mock);
    } catch (e) {
      setError(e.message);
      setGoals(mock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleGoalClick = async (goal) => {
    try {
      const res = await fetch(`/api/goals/${goal.id}`);
      if (res.ok) {
        const detail = await res.json();
        setSelectedGoal({ ...detail.goal, milestones: detail.milestones, actions: detail.actions });
      } else {
        setSelectedGoal(goal);
      }
    } catch {
      setSelectedGoal(goal);
    }
    setShowGoalDetailModal(true);
  };

  const handleGoalCreated = () => {
    setShowAddGoal(false);
    triggerCelebration(CelebrationType.TASK_COMPLETE, { message: 'Goal created! 🎯', intensity: 'normal' });
    fetchGoals();
  };

  const handleEditGoal = async (goal) => {
    // Open AddGoalModal prefilled
    setShowGoalDetailModal(false);
    // Use URL state via local storage for simplicity
    localStorage.setItem('guild_goal_edit_prefill', JSON.stringify(goal));
    setShowAddGoal(true);
    triggerCelebration(CelebrationType.TASK_COMPLETE, { message: 'Goal updated ✏️', intensity: 'normal' });
    // actual save will occur via AddGoalModal submit/approve flow
  };

  const handleUpdateProgress = async () => {
    setShowProgressModal(true);
  };

  const saveProgress = async ({ progress, milestone_id }) => {
    if (!selectedGoal) return;
    await fetch(`/api/goals/${selectedGoal.id}/progress`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ progress, milestone_id }) });
    setShowProgressModal(false);
    triggerCelebration(CelebrationType.TASK_COMPLETE, { message: 'Progress updated 📊', intensity: 'normal' });
    fetchGoals();
  };

  const handleAIInsights = async () => {
    if (!selectedGoal) return;
    const res = await fetch(`/api/goals/${selectedGoal.id}/insights`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setInsights(data?.insights || null);
      setShowInsightsModal(true);
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
        {/* Hide raw fetch error banner from UI to avoid HTML/JSON noise; keep console logs for dev */}
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
      <ProgressModal goal={selectedGoal} isOpen={showProgressModal} onClose={() => setShowProgressModal(false)} onSave={saveProgress} />
      <InsightsModal goal={selectedGoal} insights={insights} isOpen={showInsightsModal} onClose={() => setShowInsightsModal(false)} />
    </div>
  );
};

export default GoalsDashboard;


