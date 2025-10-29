import React from 'react';
import { X, BarChart3 } from 'lucide-react';

const TemplateAnalyticsModal = ({ open, onClose, templateId }) => {
  if (!open) return null;

  // Mock template performance data
  const data = {
    templateId,
    timesUsed: 24,
    avgOpenRate: 38.2,
    avgClickRate: 5.4,
    avgConversionRate: 2.1,
    lastUsed: '2025-09-28',
    bestPerformingCampaign: 'Welcome Series',
    worstPerformingCampaign: 'Promo May'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Template Performance Analytics</h2>
              <p className="text-sm text-gray-600">Historical performance when used in campaigns</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{data.timesUsed}</div>
              <div className="text-xs text-gray-600">Times Used</div>
            </div>
            <div className="border border-blue-200 rounded-lg p-3 bg-blue-50 text-center">
              <div className="text-2xl font-bold text-blue-700">{data.avgOpenRate}%</div>
              <div className="text-xs text-gray-600">Avg Open Rate</div>
            </div>
            <div className="border border-green-200 rounded-lg p-3 bg-green-50 text-center">
              <div className="text-2xl font-bold text-green-700">{data.avgClickRate}%</div>
              <div className="text-xs text-gray-600">Avg Click Rate</div>
            </div>
            <div className="border border-purple-200 rounded-lg p-3 bg-purple-50 text-center">
              <div className="text-2xl font-bold text-purple-700">{data.avgConversionRate}%</div>
              <div className="text-xs text-gray-600">Avg Conversion</div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-900 mb-2">Performance Insights</div>
            <div className="space-y-2 text-sm text-gray-700">
              <div>Last used: {data.lastUsed}</div>
              <div>Best performing campaign: <span className="font-semibold text-green-700">{data.bestPerformingCampaign}</span></div>
              <div>Lowest performing campaign: <span className="font-semibold text-red-700">{data.worstPerformingCampaign}</span></div>
            </div>
          </div>
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

export default TemplateAnalyticsModal;

