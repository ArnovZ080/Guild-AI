import React, { useState } from 'react';
import { X, Sparkles, Calendar, Users, Mail } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const AICreateEmailCampaignModal = ({ isOpen, onClose, onCreateCampaign }) => {
  const [goal, setGoal] = useState('Launch new product');
  const [audience, setAudience] = useState('All subscribers');
  const [schedule, setSchedule] = useState('2025-10-01T09:00');
  const [sequenceLen, setSequenceLen] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const api = new ContentIntelligenceAPIService();

  if (!isOpen) return null;

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await api.request('/content/ai-plan-email-campaign', {
        method: 'POST',
        body: JSON.stringify({ goal, audience, sequenceLen })
      });
      const draft = res?.data || {
        name: `${goal} – Email Campaign`,
        summary: 'We will send a sequence to target subscribers with personalized content and smart send times.',
        steps: Array.from({ length: sequenceLen }).map((_,i)=>({ id: `step_${i+1}`, subject: `Email ${i+1}: ${goal}`, delay_days: i===0?0:2 }))
      };
      setPlan(draft);
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    setLoading(true);
    try {
      const payload = { goal, audience, schedule, sequence: plan?.steps || [] };
      await api.createEmailCampaign(payload);
      onCreateCampaign && onCreateCampaign(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold flex items-center"><Sparkles className="w-4 h-4 mr-2 text-purple-600"/>AI Create Email Campaign</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-4 space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-700 mb-1">Goal</label>
              <input value={goal} onChange={e=>setGoal(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="e.g., Launch feature" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Audience</label>
              <input value={audience} onChange={e=>setAudience(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="segment or description" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Schedule</label>
              <input type="datetime-local" value={schedule} onChange={e=>setSchedule(e.target.value)} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Emails in sequence</label>
              <input type="number" min={1} max={10} value={sequenceLen} onChange={e=>setSequenceLen(parseInt(e.target.value||'1',10))} className="w-full border rounded px-2 py-1" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={generatePlan} disabled={loading} className="px-3 py-2 border rounded flex items-center"><Sparkles className="w-4 h-4 mr-1"/>Generate Plan</button>
            {plan && <button onClick={create} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded">Create Campaign</button>}
          </div>

          {loading && <div className="text-xs text-gray-500">Thinking...</div>}

          {plan && (
            <div className="border rounded p-3">
              <div className="font-medium mb-1">{plan.name}</div>
              <div className="text-xs text-gray-700 mb-2">{plan.summary}</div>
              <div className="space-y-2">
                {(plan.steps||[]).map(s => (
                  <div key={s.id} className="border rounded p-2 flex items-center justify-between">
                    <div className="text-sm"><Mail className="w-3 h-3 inline mr-1"/>{s.subject}</div>
                    <div className="text-xs text-gray-600 flex items-center"><Calendar className="w-3 h-3 mr-1"/>Delay {s.delay_days} days</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AICreateEmailCampaignModal;


