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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Autonomous Follow-ups</h2>
              <p className="text-sm text-gray-600">Build conditional email sequences</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {rules.map((r, idx) => (
            <div key={r.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">When (Trigger Condition)</label>
                  <select value={r.when} onChange={e=>setRules(prev=>prev.map((pr,i)=>i===idx?{...pr, when:e.target.value}:pr))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="unopened_48h">Unopened in 48h</option>
                    <option value="clicked_no_convert_72h">Clicked but no conversion in 72h</option>
                    <option value="opened_no_click_24h">Opened but no click in 24h</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action (What to Do)</label>
                  <select value={r.action} onChange={e=>setRules(prev=>prev.map((pr,i)=>i===idx?{...pr, action:e.target.value}:pr))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="resend_subject_variant">Resend with different subject</option>
                    <option value="send_resource">Send helpful resource</option>
                    <option value="assign_sales_followup">Assign to sales for follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                  <input value={r.details||''} onChange={e=>setRules(prev=>prev.map((pr,i)=>i===idx?{...pr, details:e.target.value}:pr))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Variant B / Case study link" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Transparency)</label>
                  <input value={r.reason||''} onChange={e=>setRules(prev=>prev.map((pr,i)=>i===idx?{...pr, reason:e.target.value}:pr))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Why this action is chosen" />
                </div>
              </div>
            </div>
          ))}
          {rules.length === 0 && <div className="text-sm text-gray-600 text-center py-8">No rules yet. Click "Add Rule" to start building your follow-up sequence.</div>}
          <button onClick={addRule} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2"/>Add Rule
          </button>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button onClick={save} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
            {loading?'Saving...':'Save Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowupsBuilderModal;
