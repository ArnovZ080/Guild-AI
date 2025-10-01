import React, { useEffect, useState } from 'react';
import { X, BarChart3 } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Campaign Analytics</h2>
              <p className="text-sm text-gray-600">Detailed performance metrics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="text-gray-600 text-sm">Delivered</div>
                  <div className="text-2xl font-bold text-blue-700">{m.delivered ?? '-'}</div>
                </div>
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="text-gray-600 text-sm">Opens</div>
                  <div className="text-2xl font-bold text-green-700">{m.opens ?? '-'}</div>
                </div>
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <div className="text-gray-600 text-sm">Clicks</div>
                  <div className="text-2xl font-bold text-purple-700">{m.clicks ?? '-'}</div>
                </div>
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="text-gray-600 text-sm">Bounces</div>
                  <div className="text-2xl font-bold text-red-700">{m.bounces ?? '-'}</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-3">Hourly Engagement</div>
                <div className="grid grid-cols-12 gap-1">
                  {(data?.timeline||[]).map(pt => (
                    <div key={pt.hour} className="h-24 bg-gray-100 rounded relative overflow-hidden" title={`${pt.hour}:00 - Opens: ${pt.opens}, Clicks: ${pt.clicks}`}>
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-500" style={{ height: `${Math.min(100, pt.opens)}%` }} />
                      <div className="absolute bottom-0 left-0 right-0 bg-green-500 opacity-70" style={{ height: `${Math.min(100, pt.clicks)}%` }} />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>Opens</div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded mr-1"></div>Clicks</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-3">Click Heatmap</div>
                <div className="space-y-2">
                  {(data?.heatmap||[]).map(h => (
                    <div key={h.area} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                      <span className="text-sm">{h.area}</span>
                      <span className="font-semibold text-purple-700">{h.clicks} clicks</span>
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

export default CampaignEmailAnalyticsModal;
