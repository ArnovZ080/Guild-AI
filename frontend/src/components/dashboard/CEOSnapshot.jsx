import React, { useEffect, useState } from 'react';
import { fetchCeoSnapshot } from '../../services/biaApi.js';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

const StatusPill = ({ status, children }) => {
  const map = {
    excellent: 'bg-emerald-100 text-emerald-800',
    good: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    critical: 'bg-red-100 text-red-800',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-800'}`}>{children}</span>;
};

const CEOSnapshot = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const payload = await fetchCeoSnapshot();
      if (mounted) {
        setData(payload);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">CEO Snapshot</h2>
          <p className="text-sm text-gray-600 mt-1">Business health overview powered by the Business Intelligence Agent</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-gray-900">{data?.overall_business_health?.score ?? '--'}</div>
          <div className="mt-1"><StatusPill status={(data?.overall_business_health?.status || '').toLowerCase()}>{data?.overall_business_health?.status}</StatusPill></div>
        </div>
      </div>

      {data?.executive_summary && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-700">{data.executive_summary}</div>
      )}

      {/* 4-hour horizon */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="font-medium text-gray-800 mb-2">Next 4 Hours</div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Financials: {data?.horizon_4h?.financials?.cashflow || 'n/a'} • invoices: {data?.horizon_4h?.financials?.next_invoices ?? 0}</li>
            <li>Operations: urgent {data?.horizon_4h?.operations?.urgent_tasks ?? 0}, blocked {data?.horizon_4h?.operations?.blocked_workflows ?? 0}</li>
            <li>Content: posts today {data?.horizon_4h?.content?.posts_today ?? 0}, {data?.horizon_4h?.content?.campaign_status || 'n/a'}</li>
            <li>Agents: active {data?.horizon_4h?.agents?.active ?? 0} • {data?.horizon_4h?.agents?.notes || ''}</li>
            <li>Customers: alerts {data?.horizon_4h?.customers?.alerts ?? 0}, escalations {data?.horizon_4h?.customers?.escalations ?? 0}</li>
            <li>Calendar: {data?.horizon_4h?.calendar?.items?.[0]?.title || 'No items'}</li>
          </ul>
        </div>
        <div className="border rounded-lg p-4">
          <div className="font-medium text-gray-800 mb-2">Immediate Actions</div>
          <ul className="text-sm text-gray-700 space-y-2">
            {(data?.immediate_actions || []).map((a, i) => (
              <li key={i} className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{a}</span>
              </li>
            ))}
            {!data?.immediate_actions?.length && <li className="text-gray-500">None</li>}
          </ul>
        </div>
        <div className="border rounded-lg p-4">
          <div className="font-medium text-gray-800 mb-2">Recommendations</div>
          <ul className="text-sm text-gray-700 space-y-2">
            {(data?.actionable_insights || []).slice(0,3).map((a, i) => (
              <li key={i} className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{a}</span>
              </li>
            ))}
            {!data?.actionable_insights?.length && <li className="text-gray-500">No recommendations</li>}
          </ul>
        </div>
      </div>

      {/* KPI blocks */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {(kpis.financial || []).map((k) => (
          <div key={k.key} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-800">{k.label}</div>
              <StatusPill status={k.status}>{k.status}</StatusPill>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{k.value}</div>
            <button className="mt-2 text-sm text-blue-600 hover:underline inline-flex items-center">View details <ArrowRight className="w-4 h-4 ml-1" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CEOSnapshot;


