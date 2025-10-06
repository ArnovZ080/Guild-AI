import React, { useState, useEffect, useMemo } from 'react';

const AddGoalModal = ({ isOpen, onClose, onCreated, prefill }) => {
  const initial = useMemo(() => prefill || {}, [prefill]);
  const [title, setTitle] = useState(initial.title || '');
  const [objective, setObjective] = useState(initial.description || initial.objective || '');
  const [description, setDescription] = useState(initial.description || '');
  const [type, setType] = useState(initial.type || 'financial');
  const [priority, setPriority] = useState(initial.priority || 'medium');
  const [timeframe, setTimeframe] = useState(initial.timeframe || 'medium-term');
  const [targetDate, setTargetDate] = useState(initial.target_date ? initial.target_date.substring(0,10) : '');
  const [metrics, setMetrics] = useState(initial.metrics || {});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [workflowPlan, setWorkflowPlan] = useState(null);
  const [showApproval, setShowApproval] = useState(false);
  const [goalId, setGoalId] = useState(null);

  useEffect(() => {
    if (isOpen && prefill) {
      setTitle(prefill.title || '');
      setObjective(prefill.description || prefill.objective || '');
      setDescription(prefill.description || '');
      setType(prefill.type || 'financial');
      setPriority(prefill.priority || 'medium');
      setTimeframe(prefill.timeframe || 'medium-term');
      setTargetDate(prefill.target_date ? prefill.target_date.substring(0,10) : '');
      setMetrics(prefill.metrics || {});
    }
  }, [isOpen, prefill]);

  if (!isOpen) return null;

  const loadRecommendations = async () => {
    try {
      const res = await fetch('/api/goals/recommendations');
      if (!res.ok) return;
      const data = await res.json();
      setRecommendations(data?.suggestions || []);
    } catch {}
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title,
        objective: objective || title,
        description,
        type,
        priority,
        timeframe,
        target_date: targetDate,
        metrics,
      };
      const res = await fetch('/api/goals/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to create goal');
      const data = await res.json();
      setWorkflowPlan(data?.workflow_plan || null);
      setGoalId(data?.id || null);
      setShowApproval(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const approve = async () => {
    try {
      if (goalId) {
        await fetch(`/api/goals/${goalId}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workflow_plan: workflowPlan }) });
      }
      // even if approve endpoint ignores id mismatch, continue UX
    } catch {}
    onCreated && onCreated();
  };

  const closeReset = () => {
    setTitle(''); setObjective(''); setDescription(''); setType('financial'); setPriority('medium'); setTimeframe('medium-term'); setTargetDate(''); setMetrics({}); setSubmitting(false); setError(null); setRecommendations([]); setWorkflowPlan(null); setShowApproval(false); setGoalId(null);
    onClose && onClose();
  };

  React.useEffect(() => {
    if (isOpen) loadRecommendations();
  }, [isOpen]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Create Goal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {recommendations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AI Recommended Goals</label>
              <div className="grid grid-cols-1 gap-2">
                {recommendations.map((r, idx) => (
                  <button key={idx} type="button" onClick={() => { setTitle(r.title); setType(r.type || 'general'); setPriority(r.priority || 'medium'); setTimeframe(r.timeframe || 'medium-term'); }} className="text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="font-medium text-gray-900">{r.title}</div>
                    <div className="text-xs text-gray-500 capitalize">{r.type} · {r.priority} · {r.timeframe}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
            <textarea value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="financial">Financial</option>
                <option value="growth">Growth</option>
                <option value="marketing">Marketing</option>
                <option value="operational">Operational</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
              <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="short-term">Short-term</option>
                <option value="medium-term">Medium-term</option>
                <option value="long-term">Long-term</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        {!showApproval ? (
          <div className="mt-6 flex space-x-3">
          <button onClick={closeReset} className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200">Cancel</button>
            <button disabled={submitting} onClick={submit} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">{submitting ? 'Creating…' : 'Create Goal'}</button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <div className="p-3 rounded-lg border border-gray-200">
              <div className="font-semibold text-gray-900 mb-1">Planned Agent Actions</div>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {(workflowPlan?.tasks || []).map((t) => (
                  <li key={t.id}><span className="font-medium">{t.agent_type}</span>: {t.name}</li>
                ))}
              </ul>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowApproval(false)} className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200">Back</button>
              <button onClick={approve} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Approve & Start</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddGoalModal;


