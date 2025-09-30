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
  const api = new ContentIntelligenceAPIService();

  useEffect(() => {
    const load = async () => {
      if (!open || !campaignId) return;
      setLoading(true);
      try {
        const res = await api.getEmailABTests(campaignId);
        if (res?.data?.variants) setVariants(res.data.variants.map(v => ({ id: v.id, subject: v.subject || '', body: v.body || '' })));
        setResults(res?.data || null);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">A/B Test Setup</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-4 space-y-4 text-sm">
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

          {results && results.winner && (
            <div className="rounded border p-3 bg-green-50 border-green-200 flex items-center text-sm">
              <Trophy className="w-4 h-4 text-green-700 mr-2"/> Current winner: Variant {results.winner}
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end">
          <button onClick={save} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ABTestSetupModal;


