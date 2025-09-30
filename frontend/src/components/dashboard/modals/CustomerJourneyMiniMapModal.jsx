import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const CustomerJourneyMiniMapModal = ({ open, onClose, campaignId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const api = new ContentIntelligenceAPIService();

  useEffect(() => {
    const load = async () => {
      if (!open || !campaignId) return;
      setLoading(true);
      try {
        const res = await api.getJourneyMiniMap(campaignId);
        setData(res?.data || null);
      } finally { setLoading(false); }
    };
    load();
  }, [open, campaignId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Customer Journey Mini‑Map</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-4 text-sm">
          {loading && <div className="text-gray-600">Loading…</div>}
          {data && (
            <>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {(data.funnel||[]).map((s,i)=> (
                  <div key={i} className="border rounded p-2 text-center">
                    <div className="font-medium">{s.stage}</div>
                    <div className="text-xl">{s.count}</div>
                  </div>
                ))}
              </div>
              <div className="rounded border p-3 bg-yellow-50 border-yellow-200">
                Largest drop: {data.largest_drop?.from} → {data.largest_drop?.to}. Why: {data.largest_drop?.reason}
              </div>
            </>
          )}
        </div>
        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerJourneyMiniMapModal;


