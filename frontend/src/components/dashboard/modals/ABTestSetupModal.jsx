import React, { useEffect, useState } from 'react';
import { X, Plus, Trophy, Sparkles } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const ABTestSetupModal = ({ open, onClose, campaignId, onSaved }) => {
  const [variants, setVariants] = useState([
    { id: 'A', subject: '', body: '' },
    { id: 'B', subject: '', body: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [allocation, setAllocation] = useState({ A: 50, B: 50 });
  const [suggested, setSuggested] = useState([]);
  const api = new ContentIntelligenceAPIService();

  useEffect(() => {
    const load = async () => {
      if (!open || !campaignId) return;
      setLoading(true);
      try {
        const res = await api.getEmailABTests(campaignId);
        if (res?.data?.variants) setVariants(res.data.variants.map(v => ({ id: v.id, subject: v.subject || '', body: v.body || '' })));
        setResults(res?.data || null);
        const vs = await api.getVariantSuggestions({ campaign_id: campaignId });
        setSuggested(vs?.data?.suggestions || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, campaignId]);

  if (!open) return null;

  const addVariant = () => {
    const nextId = String.fromCharCode(65 + variants.length);
    setVariants([...variants, { id: nextId, subject: '', body: '' }]);
  };

  const save = async () => {
    setLoading(true);
    try {
      await api.request('/content/save-email-abtest', { method: 'POST', body: JSON.stringify({ campaign_id: campaignId, variants }) });
      onSaved && onSaved({ campaignId, variants });
      onClose();
    } finally { setLoading(false); }
  };

  const applySuggestion = (s) => {
    const nextId = String.fromCharCode(65 + variants.length);
    setVariants([...variants, { id: nextId, subject: s.subject || '', body: s.body || '' }]);
  };

  const autoAllocate = async () => {
    if (!results?.variants) return;
    const totals = results.variants.reduce((acc, v) => {
      acc[v.id] = Math.max(1, (v.open_rate || 0));
      return acc;
    }, {});
    const sum = Object.values(totals).reduce((a,b)=>a+b,0);
    const next = Object.fromEntries(Object.entries(totals).map(([k,v])=>[k, Math.round((v/sum)*100)]));
    setAllocation(next);
    await api.setTrafficAllocation(campaignId, next);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">A/B Test Setup</h2>
              <p className="text-sm text-gray-600">Test multiple variants to optimize performance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {variants.map((v, idx) => (
            <div key={v.id} className="border border-gray-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900 mb-3">Variant {v.id}</div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input value={v.subject} onChange={e=>setVariants(prev=>prev.map((pv,i)=>i===idx?{...pv,subject:e.target.value}:pv))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
                  <textarea value={v.body} onChange={e=>setVariants(prev=>prev.map((pv,i)=>i===idx?{...pv,body:e.target.value}:pv))} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm" />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addVariant} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2"/>Add Variant
          </button>

          {suggested.length>0 && (
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <div className="font-semibold text-gray-900 mb-3 flex items-center"><Sparkles className="w-4 h-4 text-purple-600 mr-2"/>Agent-suggested variants</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggested.map(s => (
                  <div key={s.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="text-sm font-medium text-gray-800 mb-1">{s.subject}</div>
                    <div className="text-xs text-gray-600 mb-2 line-clamp-2">{s.body}</div>
                    <button onClick={()=>applySuggestion(s)} className="px-3 py-1 bg-purple-600 text-white rounded-md text-xs hover:bg-purple-700 transition-colors">Add as Variant</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && results.winner && (
            <div className="rounded-lg border border-green-200 p-4 bg-green-50 flex items-center">
              <Trophy className="w-5 h-5 text-green-700 mr-2"/>
              <span className="text-sm font-medium text-gray-900">Current winner: Variant {results.winner}</span>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="font-semibold text-gray-900 mb-3">Traffic Allocation</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.keys(allocation).map((k)=> (
                <div key={k} className="flex items-center">
                  <span className="w-12 font-medium text-gray-700">Var {k}</span>
                  <input type="number" min={0} max={100} value={allocation[k]} onChange={(e)=>setAllocation(prev=>({...prev,[k]:parseInt(e.target.value||'0',10)}))} className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  <span className="ml-1 text-gray-600">%</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={autoAllocate} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-sm">
                Auto-select winner and shift
              </button>
              <button onClick={async()=>{ await api.setTrafficAllocation(campaignId, allocation); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Apply Allocation
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button onClick={save} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
            {loading?'Saving...':'Save Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ABTestSetupModal;
