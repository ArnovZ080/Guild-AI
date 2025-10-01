import React, { useEffect, useState } from 'react';
import { X, DollarSign } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Revenue Attribution</h2>
              <p className="text-sm text-gray-600">Campaign revenue breakdown</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {loading && <div className="text-sm text-gray-600">Loading…</div>}
          {data && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="border border-green-200 rounded-lg p-4 bg-green-50 text-center">
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="text-2xl font-bold text-green-700">${data.total_revenue}</div>
                </div>
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 text-center">
                  <div className="text-sm text-gray-600">Orders</div>
                  <div className="text-2xl font-bold text-blue-700">{data.orders}</div>
                </div>
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 text-center">
                  <div className="text-sm text-gray-600">Model</div>
                  <div className="text-lg font-semibold text-purple-700 capitalize">{data.model?.replace('_', ' ')}</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-3">Revenue by Segment</div>
                <div className="space-y-2">
                  {(data.breakdown||[]).map((b,i)=> (
                    <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-sm text-gray-700">{b.segment}</span>
                      <span className="font-semibold text-green-700">${b.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
              </>
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

export default RevenueAttributionModal;
