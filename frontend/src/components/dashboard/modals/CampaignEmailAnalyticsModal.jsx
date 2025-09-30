import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const CampaignEmailAnalyticsModal = ({ campaignId, open, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const api = new ContentIntelligenceAPIService();

  useEffect(() => {
    const run = async () => {
      if (!open || !campaignId) return;
      setLoading(true);
      try {
        const analytics = await api.getEmailAnalytics(campaignId);
        setData(analytics?.data || null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open, campaignId]);

  if (!open) return null;

  const m = data?.metrics || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10 rounded-t-xl">
          <div className="font-semibold">Campaign Analytics</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          {loading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="border rounded p-3"><div className="text-gray-600">Delivered</div><div className="text-xl font-semibold">{m.delivered ?? '-'}</div></div>
                <div className="border rounded p-3"><div className="text-gray-600">Opens</div><div className="text-xl font-semibold">{m.opens ?? '-'}</div></div>
                <div className="border rounded p-3"><div className="text-gray-600">Clicks</div><div className="text-xl font-semibold">{m.clicks ?? '-'}</div></div>
                <div className="border rounded p-3"><div className="text-gray-600">Bounces</div><div className="text-xl font-semibold">{m.bounces ?? '-'}</div></div>
              </div>
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-2">Hourly engagement</div>
                <div className="grid grid-cols-12 gap-1">
                  {(data?.timeline||[]).map(pt => (
                    <div key={pt.hour} className="h-16 bg-blue-100 relative" title={`h${pt.hour}: opens ${pt.opens}, clicks ${pt.clicks}`}>
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-500" style={{ height: `${Math.min(100, pt.opens)}%` }} />
                      <div className="absolute bottom-0 left-0 right-0 bg-green-500 opacity-70" style={{ height: `${Math.min(100, pt.clicks)}%` }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-2">Click heatmap</div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {(data?.heatmap||[]).map(h => (
                    <div key={h.area} className="border rounded p-2 flex items-center justify-between">
                      <span>{h.area}</span><span className="font-semibold">{h.clicks}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="p-4 border-t flex justify-end sticky bottom-0 bg-white rounded-b-xl">
          <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CampaignEmailAnalyticsModal;


