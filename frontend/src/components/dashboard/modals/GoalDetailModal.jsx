import React, { useMemo } from 'react';
import { Edit, TrendingUp, Brain, X, CheckCircle, Clock } from 'lucide-react';

const GoalDetailModal = ({ goal, isOpen, onClose, onEdit, onUpdateProgress, onAIInsights }) => {
  const daysRemaining = useMemo(() => {
    try {
      return goal && goal.target_date ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)) : '-';
    } catch {
      return '-';
    }
  }, [goal]);

  const metrics = goal.metrics || {};

  if (!isOpen || !goal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{goal.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{goal.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{metrics.current ?? '-'}</div>
                <div className="text-sm text-gray-500">Current</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{metrics.target ?? '-'}</div>
                <div className="text-sm text-gray-500">Target</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{Number.isFinite(daysRemaining) ? daysRemaining : '-'}</div>
                <div className="text-sm text-gray-500">Days Left</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Progress</h4>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: `${goal.progress || 0}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-900">{goal.progress || 0}%</span>
              </div>
            </div>

            {Array.isArray(goal.milestones) && goal.milestones.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Milestones</h4>
                <div className="space-y-2">
                  {goal.milestones.map((m) => (
                    <div key={m.id} className="flex items-center space-x-3">
                      {m.completed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-gray-400" />}
                      <span className={`text-sm ${m.completed ? 'text-green-700 line-through' : 'text-gray-700'}`}>{m.title}</span>
                      <span className="text-xs text-gray-500">{m.due_date ? new Date(m.due_date).toLocaleDateString() : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex space-x-3">
            <button onClick={() => onEdit(goal)} className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              <Edit className="w-4 h-4" />
              <span>Edit Goal</span>
            </button>
            <button onClick={() => onUpdateProgress()} className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              <TrendingUp className="w-4 h-4" />
              <span>Update Progress</span>
            </button>
            <button onClick={() => onAIInsights()} className="flex-1 flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
              <Brain className="w-4 h-4" />
              <span>AI Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalDetailModal;


