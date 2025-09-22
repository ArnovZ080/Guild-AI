import React, { useEffect, useState } from 'react';
import { financialApi } from '../services/financialApi.js';
import { DollarSign, Receipt, TrendingUp, AlertTriangle } from 'lucide-react';

const Pill = ({ tone = 'info', children }) => {
  const map = {
    info: 'bg-blue-50 text-blue-700',
    good: 'bg-green-50 text-green-700',
    warn: 'bg-amber-50 text-amber-700',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[tone] || map.info}`}>{children}</span>;
};

const FinancialDashboardView = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await financialApi.getFinancialAnalysis();
      setAnalysis(res?.data || {});
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-lg animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const score = analysis?.financial_health_score ?? '--';
  const runway = analysis?.financial_metrics?.cash_flow_metrics?.cash_runway?.current;

  return (
    <div className="space-y-6">
      {/* Front page: key metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Income
            </h3>
            <Pill tone="good">Up</Pill>
          </div>
          <div className="text-2xl font-bold text-gray-900">${analysis?.financial_metrics?.revenue_metrics?.mrr?.current?.toLocaleString?.() || '—'}</div>
          <div className="text-xs text-gray-500 mt-1">Monthly Recurring Revenue</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
              Expenses
            </h3>
            <Pill tone="info">Stable</Pill>
          </div>
          <div className="text-2xl font-bold text-gray-900">${analysis?.financial_metrics?.cash_flow_metrics?.burn_rate?.current?.toLocaleString?.() || '—'}</div>
          <div className="text-xs text-gray-500 mt-1">Monthly Burn</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-blue-500" />
              Invoices
            </h3>
            <Pill tone="warn">Needs Attention</Pill>
          </div>
          <div className="text-2xl font-bold text-gray-900">—</div>
          <div className="text-xs text-gray-500 mt-1">Pending approvals</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
              Cashflow
            </h3>
            <Pill tone={runway >= 12 ? 'good' : runway >= 6 ? 'info' : 'warn'}>{runway >= 12 ? 'Comfortable' : runway >= 6 ? 'Okay' : 'Needs Attention'}</Pill>
          </div>
          <div className="text-2xl font-bold text-gray-900">{runway ?? '—'} months</div>
          <div className="text-xs text-gray-500 mt-1">Projected runway</div>
        </div>
      </div>

      {/* Tabs scaffold (to be filled next steps) */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-2 text-sm rounded-md bg-gray-100">Overview</button>
          <button className="px-3 py-2 text-sm rounded-md hover:bg-gray-100">Income & Expenses</button>
          <button className="px-3 py-2 text-sm rounded-md hover:bg-gray-100">Cashflow Analytics</button>
          <button className="px-3 py-2 text-sm rounded-md hover:bg-gray-100">Growth Opportunities</button>
          <button className="px-3 py-2 text-sm rounded-md hover:bg-gray-100">Invoices/Payments</button>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboardView;


