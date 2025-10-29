import React, { useEffect, useState } from 'react';
import { X, TrendingUp, AlertTriangle } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Customer Journey Mini‑Map</h2>
              <p className="text-sm text-gray-600">Visualize email-to-purchase funnel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {loading && <div className="text-sm text-gray-600">Loading…</div>}
          {data && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-3">
                {(data.funnel||[]).map((s,i)=> (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 text-center bg-gradient-to-b from-white to-gray-50">
                    <div className="font-semibold text-gray-900 mb-1">{s.stage}</div>
                    <div className="text-3xl font-bold text-indigo-600">{s.count}</div>
                  </div>
                ))}
              </div>

              {data.largest_drop && (
                <div className="rounded-lg border border-yellow-200 p-4 bg-yellow-50 flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-700 mr-3 mt-0.5"/>
                  <div>
                    <div className="font-semibold text-gray-900">Largest drop: {data.largest_drop.from} → {data.largest_drop.to}</div>
                    <div className="text-sm text-gray-700 mt-1">Why: {data.largest_drop.reason}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerJourneyMiniMapModal;
