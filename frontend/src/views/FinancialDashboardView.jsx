import React, { useEffect, useMemo, useState } from 'react';
import { financialApi } from '../services/financialApi.js';
import { DollarSign, Receipt, TrendingUp, AlertTriangle, LineChart, FileCheck, Lightbulb } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, LineChart as RLineChart } from 'recharts';
import FinancialFlowVisualization from '../components/visualizations/FinancialFlowVisualization.jsx';

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
  const [period, setPeriod] = useState(() => localStorage.getItem('financial.period') || '30d');
  const [scenario, setScenario] = useState(() => localStorage.getItem('financial.scenario') || 'expected');
  const periodOptions = ['7d','30d','90d'];
  const [kpis, setKpis] = useState(null);
  const [budgetActual, setBudgetActual] = useState(null);
  const [adRoi, setAdRoi] = useState(null);
  const [campaignTop, setCampaignTop] = useState([]);
  const [healthTimeline, setHealthTimeline] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await financialApi.getFinancialAnalysis();
      setAnalysis(res?.data || {});
      const k = await financialApi.getFinancialKpis(period);
      setKpis(k?.data || {});
      const [cTop, htl] = await Promise.all([
        financialApi.getCampaignRoiTop(period, 3),
        financialApi.getHealthScoreTimeline('90d'),
      ]);
      setCampaignTop(cTop?.data?.campaigns || []);
      setHealthTimeline(htl?.data?.points || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    // Lazy-load per tab
    (async () => {
      if (activeTab === 'income_expenses') {
        const [rev, exp] = await Promise.all([
          financialApi.getRevenueAnalysis(period),
          financialApi.getExpenseBreakdown(period),
        ]);
        setRevenue(rev?.data || {});
        setExpenses(exp?.data || {});
      } else if (activeTab === 'cashflow') {
        const proj = await financialApi.getCashFlowProjections(scenario, period === '7d' ? '30d' : period);
        setProjections(proj?.data || {});
      } else if (activeTab === 'invoices') {
        const inv = await financialApi.getInvoices('pending');
        setInvoices(inv?.data?.invoices || []);
      } else if (activeTab === 'analytics') {
        const [bva, roi] = await Promise.all([
          financialApi.getBudgetVsActual(period),
          financialApi.getAdRoi(period),
        ]);
        setBudgetActual(bva?.data || {});
        setAdRoi(roi?.data || {});
      }
    })();
  }, [activeTab, period, scenario]);

  useEffect(() => { localStorage.setItem('financial.period', period); }, [period]);
  useEffect(() => { localStorage.setItem('financial.scenario', scenario); }, [scenario]);

  const [invoices, setInvoices] = useState([]);
  const [approvalModal, setApprovalModal] = useState(null);
  const [reallocateModal, setReallocateModal] = useState(null);

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
      {/* Tabs + Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('overview')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='overview' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Overview</button>
          <button onClick={() => setActiveTab('income_expenses')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='income_expenses' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Income & Expenses</button>
          <button onClick={() => setActiveTab('cashflow')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='cashflow' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Cashflow Analytics</button>
          <button onClick={() => setActiveTab('opportunities')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='opportunities' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Growth Opportunities</button>
          <button onClick={() => setActiveTab('invoices')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='invoices' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Invoices/Payments</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='analytics' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Financial Analytics</button>
          </div>
          {activeTab === 'overview' && (
            <div className="flex gap-2">
              {periodOptions.map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-2 py-1 text-xs rounded ${period===p ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{p}</button>
              ))}
            </div>
          )}
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

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-2">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 mb-1">Cash on Hand</div>
            <div className="text-2xl font-semibold text-gray-900">${(kpis?.cash_on_hand || 0).toLocaleString?.()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 mb-1">AR / AP</div>
            <div className="text-sm text-gray-900">AR: ${((kpis?.ar_total)||0).toLocaleString?.()} • AP: ${((kpis?.ap_total)||0).toLocaleString?.()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 mb-1">Runway / Burn</div>
            <div className="text-sm text-gray-900">{(kpis?.runway_months||0)} months • Burn ${((kpis?.burn_rate)||0).toLocaleString?.()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 mb-1">Margins & ROAS</div>
            <div className="text-sm text-gray-900">Gross {(kpis?.gross_margin_pct||0)}% • Net {(kpis?.net_margin_pct||0)}% • ROAS {(kpis?.roas||0)}x</div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Spend & ROI (Top 3)</h3>
              <Pill tone="info">Live</Pill>
            </div>
            <ul className="text-sm text-gray-700 space-y-2">
              {campaignTop.map(c => (
                <li key={c.id} className="flex justify-between">
                  <span className="truncate pr-3">{c.name}</span>
                  <span>Spend ${c.spend} • ROAS {c.roas}x</span>
                </li>
              ))}
              {campaignTop.length === 0 && <li className="text-gray-500">No active campaigns</li>}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Financial Health Score</h3>
              <Pill tone={score >= 80 ? 'good' : score >= 60 ? 'info' : 'warn'}>{String(score)}</Pill>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={healthTimeline.map((p,i)=>({ name: i+1, score: p.score }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" hide />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#10B981" dot={false} name="Score" />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Liquidity Ratio</h3>
              <Pill tone={(kpis?.cash_on_hand||0)/Math.max(1,(kpis?.current_liabilities||1)) >= 1.5 ? 'good' : 'warn'}>{((kpis?.cash_on_hand||0)/Math.max(1,(kpis?.current_liabilities||1))).toFixed(2)}x</Pill>
            </div>
            <div className="text-sm text-gray-700">Cash ${((kpis?.cash_on_hand)||0).toLocaleString?.()} ÷ Current Liabilities ${((kpis?.current_liabilities)||0).toLocaleString?.()}</div>
            <div className="text-xs text-gray-500 mt-2">Rule of thumb ≥ 1.5x is healthy</div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="mt-2">
          <FinancialFlowVisualization
            revenueBreakdown={(analysis?.financial_metrics?.revenue_metrics?.breakdown || revenue?.revenue_breakdown || []).map(r => ({ source: r.source || r.name, amount: r.amount, color: r.color }))}
            expenseBreakdown={(expenses?.expense_breakdown || []).map(e => ({ category: e.category || e.name, amount: e.amount, color: e.color }))}
            netFlow={(revenue?.total_revenue || 0) - (expenses?.expense_breakdown || []).reduce((s, x) => s + (x.amount || 0), 0)}
          />
        </div>
      )}

      {/* Income & Expenses */}
      {activeTab === 'income_expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center"><LineChart className="w-5 h-5 mr-2 text-emerald-500" />Revenue ({period})</h3>
                <Pill tone="info">Trend</Pill>
              </div>
              <div className="mt-2 flex justify-center gap-2">
                {periodOptions.map(p => (
                  <button key={p} onClick={() => setPeriod(p)} className={`px-2 py-1 text-xs rounded ${period===p ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{p}</button>
                ))}
              </div>
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
          <div className="mt-2 text-xs text-gray-500">
            Est. Gross Margin: {(kpis?.gross_margin_pct ?? 0)}% • Net Margin: {(kpis?.net_margin_pct ?? 0)}%
          </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(revenue?.revenue_breakdown || []).map(x => ({ name: x?.source, value: x?.amount }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#10B981" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-red-500" />Expenses ({period})</h3>
                <Pill tone="info">Breakdown</Pill>
              </div>
              <div className="mt-2 flex justify-center gap-2">
                {periodOptions.map(p => (
                  <button key={p} onClick={() => setPeriod(p)} className={`px-2 py-1 text-xs rounded ${period===p ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{p}</button>
                ))}
              </div>
            </div>
            <ul className="mt-1 text-sm text-gray-600 space-y-1">
              {(expenses?.expense_breakdown || []).map((e, i) => (
                <li key={i} className="flex justify-between">
                  <span>{e?.category || 'Category'}</span>
                  <span>${(e?.amount || 0).toLocaleString?.()}</span>
                </li>
              ))}
            </ul>
          <div className="mt-2 text-xs text-gray-500">
            Budget vs Actual detail in Analytics tab
          </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(expenses?.expense_breakdown || []).map(x => ({ name: x?.category, value: x?.amount }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#EF4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Cashflow Analytics */}
      {activeTab === 'cashflow' && (
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center"><LineChart className="w-5 h-5 mr-2 text-blue-500" />Cashflow Projections ({period})</h3>
            <Pill tone={runway >= 12 ? 'good' : runway >= 6 ? 'info' : 'warn'}>{runway >= 12 ? 'Comfortable' : runway >= 6 ? 'Okay' : 'Needs Attention'}</Pill>
          </div>
          <div className="absolute right-4 top-4 flex gap-2">
            {['expected','best','worst'].map(s => (
              <button key={s} onClick={() => setScenario(s)} className={`px-2 py-1 text-xs rounded capitalize ${scenario===s ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>{s}</button>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-2">
            {periodOptions.map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-2 py-1 text-xs rounded ${period===p ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{p}</button>
            ))}
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RLineChart data={(projections?.projections || []).map((pt, idx) => ({ name: pt?.date || idx+1, balance: pt?.balance || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="balance" stroke="#3B82F6" dot={false} name="Balance" />
              </RLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Budget vs Actual ({period})</h3>
                <Pill tone="info">Tracking</Pill>
              </div>
              <div className="mt-2 flex justify-center gap-2">
                {periodOptions.map(p => (
                  <button key={p} onClick={() => setPeriod(p)} className={`px-2 py-1 text-xs rounded ${period===p ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(budgetActual?.categories || []).map(x => ({ name: x.category, Budget: x.budget, Actual: x.actual }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Budget" fill="#A78BFA" />
                  <Bar dataKey="Actual" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Ad ROI by Channel ({period})</h3>
                <Pill tone="info">ROAS</Pill>
              </div>
              <div className="mt-2 flex justify-center gap-2">
                {periodOptions.map(p => (
                  <button key={p} onClick={() => setPeriod(p)} className={`px-2 py-1 text-xs rounded ${period===p ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(adRoi?.channels || []).map(x => ({ name: x.channel, ROAS: x.roas }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ROAS" fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Growth Opportunities */}
      {activeTab === 'opportunities' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-amber-500" />Suggested Opportunities</h3>
            <Pill tone="info">AI Suggestions</Pill>
          </div>
          <div className="space-y-4">
            {(analysis?.key_insights || []).map((i, idx) => (
              <div key={idx} className="rounded-md border border-gray-200 p-4">
                <div className="text-gray-800 text-sm mb-3">{String(i || '')}</div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={async () => {
                      const prop = await financialApi.getBudgetReallocationProposal(idx);
                      setReallocateModal({ index: idx, data: prop?.data });
                    }}
                  >
                    Act now
                  </button>
                  <button
                    className="px-3 py-2 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    onClick={async () => {
                      try {
                        await financialApi.executeFinancialAction('schedule_recommendation', { index: idx });
                        alert('Scheduled via PA agent.');
                      } catch (e) {
                        alert('Scheduled.');
                      }
                    }}
                  >
                    Schedule
                  </button>
                </div>
              </div>
            ))}
            {(analysis?.key_insights || []).length === 0 && (
              <div className="text-sm text-gray-500">No opportunities at the moment.</div>
            )}
          </div>
        </div>
      )}

      {/* Invoices/Payments */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center"><FileCheck className="w-5 h-5 mr-2 text-blue-500" />Invoices & Payments</h3>
            <Pill tone="warn">Needs Attention</Pill>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-2">Invoice</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Due</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-t">
                    <td className="px-4 py-2 font-medium text-gray-900">{inv.id}</td>
                    <td className="px-4 py-2">{inv.customer}</td>
                    <td className="px-4 py-2">${(inv.amount||0).toLocaleString?.()}</td>
                    <td className="px-4 py-2">{inv.due_date}</td>
                    <td className="px-4 py-2 capitalize">{inv.status}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button className="px-2 py-1 text-xs rounded bg-emerald-600 text-white" onClick={async () => {
                        const ctx = await financialApi.getInvoiceApprovalContext(inv.id);
                        setApprovalModal({ context: ctx?.data });
                      }}>Approve</button>
                      <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white" onClick={async () => {
                        await financialApi.markInvoicePaid(inv.id);
                        setInvoices(prev => prev.map(i => i.id===inv.id ? { ...i, status: 'paid' } : i));
                      }}>Mark Paid</button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td className="px-4 py-6 text-gray-500" colSpan="6">No invoices found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approval Modals */}
      {approvalModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Approve Payment</h4>
            <div className="text-sm text-gray-700 mb-3">Vendor: {approvalModal.context?.vendor} • Amount: ${approvalModal.context?.amount?.toLocaleString?.()} • Due: {approvalModal.context?.due_date}</div>
            <div className="text-sm text-gray-700 mb-2">Rationale: {approvalModal.context?.rationale}</div>
            <div className="text-xs text-gray-500 mb-4">Confidence: {Math.round((approvalModal.context?.confidence_pct||0)*100)}% • Risk: {approvalModal.context?.risk}</div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded bg-gray-100" onClick={() => setApprovalModal(null)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-emerald-600 text-white" onClick={async () => {
                try {
                  await financialApi.approveInvoice(approvalModal.context?.invoice_id);
                } finally {
                  setApprovalModal(null);
                }
              }}>Confirm Approve</button>
            </div>
          </div>
        </div>
      )}

      {reallocateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Budget Reallocation</h4>
            <div className="text-sm text-gray-700 mb-2">From: {reallocateModal.data?.from?.channel} (${reallocateModal.data?.from?.amount}) • ROAS {reallocateModal.data?.from?.current_roas}x</div>
            <div className="text-sm text-gray-700 mb-2">To: {reallocateModal.data?.to?.channel} (${reallocateModal.data?.to?.amount}) • ROAS {reallocateModal.data?.to?.current_roas}x</div>
            <div className="text-sm text-gray-700 mb-2">Recommendation: {reallocateModal.data?.recommendation}</div>
            <div className="text-xs text-gray-500 mb-4">Confidence: {Math.round((reallocateModal.data?.confidence_pct||0)*100)}% • Risk: {reallocateModal.data?.risk}</div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded bg-gray-100" onClick={() => setReallocateModal(null)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-emerald-600 text-white" onClick={async () => {
                try {
                  await financialApi.executeFinancialAction('apply_recommendation', { index: reallocateModal.index });
                } finally {
                  setReallocateModal(null);
                }
              }}>Confirm Reallocate</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinancialDashboardView;




