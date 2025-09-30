import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const RevenueAttributionModal = ({ open, onClose, campaignId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const api = new ContentIntelligenceAPIService();

  useEffect(() => {
    const load = async () => {
      if (!open || !campaignId) return;
      setLoading(true);
      try {
        const res = await api.getEmailRevenueAttribution(campaignId);
        setData(res?.data || null);
      } finally { setLoading(false); }
    };
    load();
  }, [open, campaignId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Revenue Attribution</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-4 text-sm space-y-3">
          {loading && <div className="text-gray-600">Loading…</div>}
          {data && (
            <>
              <div>Total revenue: ${data.total_revenue} • Orders: {data.orders} • Model: {data.model}</div>
              <div className="border rounded p-3">
                <div className="font-medium mb-1">By Segment</div>
                <div className="space-y-1">
                  {(data.breakdown||[]).map((b,i)=> (
                    <div key={i} className="flex justify-between"><span>{b.segment}</span><span>${b.revenue}</span></div>
                  ))}
                </div>
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

export default RevenueAttributionModal;
