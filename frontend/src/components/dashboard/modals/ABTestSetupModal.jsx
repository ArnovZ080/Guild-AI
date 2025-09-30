import React, { useEffect, useState } from 'react';
import { X, Plus, Trophy } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10 rounded-t-xl">
          <div className="font-semibold">A/B Test Setup</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-4 space-y-4 text-sm overflow-y-auto">
          {variants.map((v, idx) => (
            <div key={v.id} className="border rounded p-3">
              <div className="font-medium mb-2">Variant {v.id}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Subject</label>
                  <input value={v.subject} onChange={e=>setVariants(prev=>prev.map((pv,i)=>i===idx?{...pv,subject:e.target.value}:pv))} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Body</label>
                  <textarea value={v.body} onChange={e=>setVariants(prev=>prev.map((pv,i)=>i===idx?{...pv,body:e.target.value}:pv))} rows={6} className="w-full border rounded px-2 py-1 font-mono" />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addVariant} className="px-3 py-2 border rounded text-sm flex items-center"><Plus className="w-4 h-4 mr-1"/>Add Variant</button>

          {suggested.length>0 && (
            <div className="border rounded p-3">
              <div className="font-medium mb-2">Agent-suggested variants</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggested.map(s => (
                  <div key={s.id} className="border rounded p-2 text-sm">
                    <div className="text-gray-800">{s.subject}</div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-3">{s.body}</div>
                    <button onClick={()=>applySuggestion(s)} className="mt-2 px-2 py-1 border rounded text-xs">Add as Variant</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && results.winner && (
            <div className="rounded border p-3 bg-green-50 border-green-200 flex items-center text-sm">
              <Trophy className="w-4 h-4 text-green-700 mr-2"/> Current winner: Variant {results.winner}
            </div>
          )}

          <div className="border rounded p-3">
            <div className="font-medium mb-2">Traffic Allocation</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.keys(allocation).map((k)=> (
                <div key={k} className="flex items-center">
                  <span className="w-8">{k}</span>
                  <input type="number" min={0} max={100} value={allocation[k]} onChange={(e)=>setAllocation(prev=>({...prev,[k]:parseInt(e.target.value||'0',10)}))} className="w-24 border rounded px-2 py-1 ml-2" />
                  <span className="ml-1">%</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <button onClick={autoAllocate} className="px-3 py-2 border rounded text-sm">Auto-select winner and shift</button>
              <button onClick={async()=>{ await api.setTrafficAllocation(campaignId, allocation); }} className="px-3 py-2 border rounded text-sm">Apply Allocation</button>
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end sticky bottom-0 bg-white rounded-b-xl">
          <button onClick={save} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ABTestSetupModal;


