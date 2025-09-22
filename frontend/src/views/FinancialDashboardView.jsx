import React, { useEffect, useState } from 'react';
import { financialApi } from '../services/financialApi.js';
import { DollarSign, Receipt, TrendingUp, AlertTriangle, LineChart, FileCheck, Lightbulb } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [revenue, setRevenue] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [projections, setProjections] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await financialApi.getFinancialAnalysis();
      setAnalysis(res?.data || {});
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    // Lazy-load per tab
    (async () => {
      if (activeTab === 'income_expenses') {
        const [rev, exp] = await Promise.all([
          financialApi.getRevenueAnalysis('30d'),
          financialApi.getExpenseBreakdown('30d'),
        ]);
        setRevenue(rev?.data || {});
        setExpenses(exp?.data || {});
      } else if (activeTab === 'cashflow') {
        const proj = await financialApi.getCashFlowProjections('expected', '90d');
        setProjections(proj?.data || {});
      }
    })();
  }, [activeTab]);

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
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('overview')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='overview' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Overview</button>
          <button onClick={() => setActiveTab('income_expenses')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='income_expenses' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Income & Expenses</button>
          <button onClick={() => setActiveTab('cashflow')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='cashflow' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Cashflow Analytics</button>
          <button onClick={() => setActiveTab('opportunities')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='opportunities' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Growth Opportunities</button>
          <button onClick={() => setActiveTab('invoices')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='invoices' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Invoices/Payments</button>
        </div>
      </div>

      {/* Overview: key metric cards */}
      {activeTab === 'overview' && (
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
      )}

      {/* Income & Expenses */}
      {activeTab === 'income_expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center"><LineChart className="w-5 h-5 mr-2 text-emerald-500" />Revenue (30d)</h3>
              <Pill tone="info">Trend</Pill>
            </div>
            <div className="text-sm text-gray-700">Total: ${revenue?.total_revenue?.toLocaleString?.() || '—'}</div>
            <ul className="mt-3 text-sm text-gray-600 space-y-1">
              {(revenue?.revenue_breakdown || []).map((r, i) => (
                <li key={i} className="flex justify-between">
                  <span>{r?.source || 'Source'}</span>
                  <span>${(r?.amount || 0).toLocaleString?.()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-red-500" />Expenses (30d)</h3>
              <Pill tone="info">Breakdown</Pill>
            </div>
            <ul className="mt-1 text-sm text-gray-600 space-y-1">
              {(expenses?.expense_breakdown || []).map((e, i) => (
                <li key={i} className="flex justify-between">
                  <span>{e?.category || 'Category'}</span>
                  <span>${(e?.amount || 0).toLocaleString?.()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Cashflow Analytics */}
      {activeTab === 'cashflow' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center"><LineChart className="w-5 h-5 mr-2 text-blue-500" />Cashflow Projections (90d)</h3>
            <Pill tone={runway >= 12 ? 'good' : runway >= 6 ? 'info' : 'warn'}>{runway >= 12 ? 'Comfortable' : runway >= 6 ? 'Okay' : 'Needs Attention'}</Pill>
          </div>
          <div className="text-sm text-gray-700">Scenario: {projections?.scenario_type || 'expected'}</div>
          <div className="mt-2 text-sm text-gray-600">Projection points: {(projections?.projections || []).length}</div>
          <div className="mt-4 text-xs text-gray-500">(Charts coming soon)</div>
        </div>
      )}

      {/* Growth Opportunities */}
      {activeTab === 'opportunities' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-amber-500" />Suggested Opportunities</h3>
            <Pill tone="info">AI Suggestions</Pill>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {(analysis?.key_insights || []).map((i, idx) => (
              <li key={idx}>{String(i || '')}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Invoices/Payments */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center"><FileCheck className="w-5 h-5 mr-2 text-blue-500" />Invoices & Payments</h3>
            <Pill tone="warn">Needs Attention</Pill>
          </div>
          <p className="text-sm text-gray-700">Pending approvals and due dates will appear here.</p>
          <button className="mt-4 px-3 py-2 rounded-md bg-gray-900 text-white text-sm" onClick={async () => {
            try {
              await financialApi.executeFinancialAction('request_invoice_summary');
              alert('Requested latest invoice summary.');
            } catch (e) {
              alert('Action queued.');
            }
          }}>Request Invoice Summary</button>
        </div>
      )}

    </div>
  );
};

export default FinancialDashboardView;




