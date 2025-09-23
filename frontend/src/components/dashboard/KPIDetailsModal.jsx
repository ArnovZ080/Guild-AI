import React from 'react';

const KPIDetailsModal = ({ open, onClose, title, details }) => {
  if (!open) return null;
  const d = details?.data || {};
  const metrics = d.detailed_metrics || {};
  const recs = d.recommendations || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{title || 'KPI Details'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Current Performance</h4>
            <div className="text-gray-800 text-sm">{metrics.current_performance || 'n/a'}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Benchmark</h4>
              <div className="text-gray-800 text-sm">{metrics.benchmark_comparison || 'n/a'}</div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Forecast Accuracy</h4>
              <div className="text-gray-800 text-sm">{metrics.forecast_accuracy || 'n/a'}</div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendations</h4>
            <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
              {recs.length ? recs.map((r, i) => <li key={i}>{r}</li>) : <li>No recommendations yet.</li>}
            </ul>
          </div>
          <div className="text-xs text-gray-500">Last updated: {new Date(d.last_updated || Date.now()).toLocaleString()}</div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm">Close</button>
        </div>
      </div>
    </div>
  );
};

export default KPIDetailsModal;





