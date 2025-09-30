import React, { useEffect, useState } from 'react';
import { X, Plus, Zap } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const FollowupsBuilderModal = ({ open, onClose, campaignId, onSaved }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const api = new ContentIntelligenceAPIService();

  useEffect(() => {
    const load = async () => {
      if (!open || !campaignId) return;
      setLoading(true);
      try {
        const res = await api.getFollowupsPlan(campaignId);
        setRules(res?.data?.rules || []);
      } finally { setLoading(false); }
    };
    load();
  }, [open, campaignId]);

  if (!open) return null;

  const addRule = () => {
    setRules([...rules, { id: `r_${Date.now()}`, when: 'unopened_48h', action: 'resend_subject_variant', details: 'Use Variant B', reason: '' }]);
  };

  const save = async () => {
    setLoading(true);
    try {
      await api.saveFollowupsPlan(campaignId, { rules });
      onSaved && onSaved({ campaignId, rules });
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold flex items-center"><Zap className="w-4 h-4 mr-2 text-yellow-600"/>Autonomous Follow-ups</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-4 space-y-3 text-sm">
          {rules.map((r, idx) => (
            <div key={r.id} className="border rounded p-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div>
                <label className="block text-gray-700 mb-1">When</label>
                <select value={r.when} onChange={e=>setRules(prev=>prev.map((pr,i)=>i===idx?{...pr, when:e.target.value}:pr))} className="w-full border rounded px-2 py-1">
                  <option value="unopened_48h">Unopened in 48h</option>
                  <option value="clicked_no_convert_72h">Clicked but no conversion in 72h</option>
                  <option value="opened_no_click_24h">Opened but no click in 24h</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Action</label>
                <select value={r.action} onChange={e=>setRules(prev=>prev.map((pr,i)=>i===idx?{...pr, action:e.target.value}:pr))} className="w-full border rounded px-2 py-1">
                  <option value="resend_subject_variant">Resend with different subject</option>
                  <option value="send_resource">Send helpful resource</option>
                  <option value="assign_sales_followup">Assign to sales for follow-up</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Details</label>
                <input value={r.details||''} onChange={e=>setRules(prev=>prev.map((pr,i)=>i===idx?{...pr, details:e.target.value}:pr))} className="w-full border rounded px-2 py-1" placeholder="Variant B / Case study link" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Reason (transparency)</label>
                <input value={r.reason||''} onChange={e=>setRules(prev=>prev.map((pr,i)=>i===idx?{...pr, reason:e.target.value}:pr))} className="w-full border rounded px-2 py-1" placeholder="Why this action is chosen" />
              </div>
            </div>
          ))}
          <button onClick={addRule} className="px-3 py-2 border rounded text-sm flex items-center"><Plus className="w-4 h-4 mr-1"/>Add Rule</button>
        </div>
        <div className="p-4 border-t flex justify-end">
          <button onClick={save} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded">Save Plan</button>
        </div>
      </div>
    </div>
  );
};

export default FollowupsBuilderModal;


