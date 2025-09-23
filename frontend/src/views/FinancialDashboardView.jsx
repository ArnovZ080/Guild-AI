import React, { useEffect, useMemo, useState } from 'react';
import { financialApi } from '../services/financialApi.js';
import { DollarSign, Receipt, TrendingUp, AlertTriangle, LineChart, FileCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, LineChart as RLineChart, PieChart, Pie, Cell } from 'recharts';
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
  const [cashBalance, setCashBalance] = useState(null);
  const [receivables, setReceivables] = useState([]);
  const [payables, setPayables] = useState([]);
  const [wcCycle, setWcCycle] = useState(null);
  const [period, setPeriod] = useState(() => localStorage.getItem('financial.period') || '30d');
  const [scenario, setScenario] = useState(() => localStorage.getItem('financial.scenario') || 'expected');
  const periodOptions = ['7d','30d','90d'];
  const [kpis, setKpis] = useState(null);
  const [budgetActual, setBudgetActual] = useState(null);
  const [adRoi, setAdRoi] = useState(null);
  const [analyticsKpis, setAnalyticsKpis] = useState(null);
  const [campaignTop, setCampaignTop] = useState([]);
  const [healthTimeline, setHealthTimeline] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [expenseTrend, setExpenseTrend] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [fixedVariable, setFixedVariable] = useState(null);
  const [revView, setRevView] = useState('MTD');
  const [expView, setExpView] = useState('MTD');
  const [customerModal, setCustomerModal] = useState(null);
  const [vendorModal, setVendorModal] = useState(null);
  // Forecasts & Scenarios state
  const [forecastBaseline, setForecastBaseline] = useState(null);
  const [scenarioParams, setScenarioParams] = useState({ revenueDeltaPct: 0, adSpendDeltaPct: 0, hiresDelta: 0 });
  const [scenarioResult, setScenarioResult] = useState(null);
  const [breakEven, setBreakEven] = useState(null);
  const [runwayCalc, setRunwayCalc] = useState(null);
  // Derived scenario metrics for Forecasts tab (must be declared before any early returns)
  const scenarioAvgDailyCashflow = useMemo(() => {
    if (!scenarioResult?.points || scenarioResult.points.length === 0) return null;
    const total = scenarioResult.points.reduce((sum, p) => sum + (p.cashflow || 0), 0);
    return total / scenarioResult.points.length;
  }, [scenarioResult]);

  const scenarioRunwayMonths = useMemo(() => {
    if (scenarioAvgDailyCashflow == null) return null;
    const daily = Number(scenarioAvgDailyCashflow);
    const monthlyBurn = daily < 0 ? -daily * 30 : 0;
    const cash = (kpis?.cash_on_hand || 0);
    if (monthlyBurn <= 0) return Infinity;
    return Number((cash / monthlyBurn).toFixed(1));
  }, [scenarioAvgDailyCashflow, kpis]);

  const adjustedBreakEven = useMemo(() => {
    if (!breakEven) return null;
    const baseFixed = breakEven.fixed_costs || 0;
    const baseVar = breakEven.variable_cost_per_unit || 0;
    const price = breakEven.avg_price || 0;
    // Simple adjustments: hires increase fixed costs; ad spend slightly increases variable cost
    const fixedAdj = baseFixed + (scenarioParams?.hiresDelta || 0) * 6000;
    const varAdj = baseVar * (1 + Math.max(0, scenarioParams?.adSpendDeltaPct || 0) * 0.002);
    const cm = price - varAdj;
    if (cm <= 0) {
      return { ...breakEven, fixed_costs: fixedAdj, variable_cost_per_unit: varAdj, break_even_units: null, break_even_revenue: null };
    }
    const units = Math.ceil(fixedAdj / cm);
    const revenueBE = units * price;
    return { ...breakEven, fixed_costs: fixedAdj, variable_cost_per_unit: varAdj, break_even_units: units, break_even_revenue: revenueBE };
  }, [breakEven, scenarioParams]);
  const exportCsv = (rows, headers, filename) => {
    try {
      const headerLine = headers.join(',');
      const dataLines = rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(',')).join('\n');
      const blob = new Blob([headerLine + '\n' + dataLines], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = filename; link.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

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
        const [proj, cash, rec, pay, wcc] = await Promise.all([
          financialApi.getCashFlowProjections(scenario, period === '7d' ? '30d' : period),
          financialApi.getCashBalance(),
          financialApi.getReceivablesTimeline('90d'),
          financialApi.getPayablesTimeline('90d'),
          financialApi.getWorkingCapitalCycle(),
        ]);
        setProjections(proj?.data || {});
        setCashBalance(cash?.data || {});
        setReceivables(rec?.data?.items || []);
        setPayables(pay?.data?.items || []);
        setWcCycle(wcc?.data || {});
      } else if (activeTab === 'invoices') {
        const [pay, rec] = await Promise.all([
          financialApi.getInvoices('pending'),
          financialApi.getInvoices('receivable'),
        ]);
        setInvoices(pay?.data?.invoices || []);
        setReceivableInvoices(rec?.data?.invoices || []);
      } else if (activeTab === 'forecasts') {
        const [baseline, be, rw] = await Promise.all([
          financialApi.getBaselineForecast('90d'),
          financialApi.getBreakEven(),
          financialApi.getRunway(),
        ]);
        setForecastBaseline(baseline?.data || {});
        setBreakEven(be?.data || {});
        setRunwayCalc(rw?.data || {});
      } else if (activeTab === 'analytics') {
        const [bva, roi, kpis] = await Promise.all([
          financialApi.getBudgetVsActual(period),
          financialApi.getAdRoi(period),
          financialApi.getAnalyticsMetrics(period),
        ]);
        setBudgetActual(bva?.data || {});
        setAdRoi(roi?.data || {});
        setAnalyticsKpis(kpis?.data || {});
      } else if (activeTab === 'income_expenses') {
        const [rt, tc, et, tv, fv] = await Promise.all([
          financialApi.getRevenueTrend('90d'),
          financialApi.getTopCustomers(period, 10),
          financialApi.getExpenseTrend('90d'),
          financialApi.getTopVendors(period, 10),
          financialApi.getFixedVariableCosts(period),
        ]);
        setRevenueTrend(rt?.data?.points || []);
        setTopCustomers(tc?.data?.customers || []);
        setExpenseTrend(et?.data?.points || []);
        setTopVendors(tv?.data?.vendors || []);
        setFixedVariable(fv?.data || {});
      }
    })();
  }, [activeTab, period, scenario]);

  useEffect(() => { localStorage.setItem('financial.period', period); }, [period]);
  useEffect(() => { localStorage.setItem('financial.scenario', scenario); }, [scenario]);

  const [invoices, setInvoices] = useState([]);
  const [receivableInvoices, setReceivableInvoices] = useState([]);
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
          <button onClick={() => setActiveTab('forecasts')} className={`px-3 py-2 text-sm rounded-md ${activeTab==='forecasts' ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Forecasts & Scenarios</button>
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
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Income
            </h3>
            <Pill tone="good">Up</Pill>
          </div>
          <div className="text-xs text-gray-500 mb-1">Total recurring revenue flowing in this period.</div>
          <div className="text-2xl font-bold text-gray-900">${analysis?.financial_metrics?.revenue_metrics?.mrr?.current?.toLocaleString?.() || '—'}</div>
          <div className="text-xs text-gray-500 mt-1">Monthly Recurring Revenue</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
              Expenses
            </h3>
            <Pill tone="info">Stable</Pill>
          </div>
          <div className="text-xs text-gray-500 mb-1">Total operating costs for the selected period.</div>
          <div className="text-2xl font-bold text-gray-900">${analysis?.financial_metrics?.cash_flow_metrics?.burn_rate?.current?.toLocaleString?.() || '—'}</div>
          <div className="text-xs text-gray-500 mt-1">Monthly Burn</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-blue-500" />
              Invoices
            </h3>
            <Pill tone="warn">Needs Attention</Pill>
          </div>
          <div className="text-xs text-gray-500 mb-1">Bills awaiting approval or payment.</div>
          <div className="text-2xl font-bold text-gray-900">—</div>
          <div className="text-xs text-gray-500 mt-1">Pending approvals</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
              Cashflow
            </h3>
            <Pill tone={runway >= 12 ? 'good' : runway >= 6 ? 'info' : 'warn'}>{runway >= 12 ? 'Comfortable' : runway >= 6 ? 'Okay' : 'Needs Attention'}</Pill>
          </div>
          <div className="text-xs text-gray-500 mb-1">How long current cash is expected to last (runway).</div>
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
            <div className="text-[11px] text-gray-500">Liquid cash available right now.</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 mb-1">Accounts Receivable / Accounts Payable</div>
            <div className="text-sm text-gray-900">AR: ${((kpis?.ar_total)||0).toLocaleString?.()} • AP: ${((kpis?.ap_total)||0).toLocaleString?.()}</div>
            <div className="text-[11px] text-gray-500">Accounts Receivable vs Accounts Payable.</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 mb-1">Runway / Burn</div>
            <div className="text-sm text-gray-900">{(kpis?.runway_months||0)} months • Burn ${((kpis?.burn_rate)||0).toLocaleString?.()}</div>
            <div className="text-[11px] text-gray-500">Months of cash left at current burn rate.</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 mb-1">Margins & ROAS</div>
            <div className="text-sm text-gray-900">Gross {(kpis?.gross_margin_pct||0)}% • Net {(kpis?.net_margin_pct||0)}% • ROAS {(kpis?.roas||0)}x</div>
            <div className="text-[11px] text-gray-500">Profit margins and advertising efficiency.</div>
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
          {/* LEFT COLUMN: INCOME */}
          <div className="space-y-6">
            {/* Revenue Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center"><LineChart className="w-5 h-5 mr-2 text-emerald-500" />Revenue ({period})</h3>
                  <div className="flex items-center gap-2"><Pill tone="info">{revView}</Pill></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Income generated from all sources in the selected period.</div>
                <div className="mt-2 flex justify-center gap-2">
                  {periodOptions.map(p => (<button key={p} onClick={() => setPeriod(p)} className={`px-2 py-1 text-xs rounded ${period===p ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{p}</button>))}
                  <div className="ml-2 inline-flex rounded bg-gray-100">{['MTD','YTD'].map(v => (<button key={v} onClick={() => setRevView(v)} className={`px-2 py-1 text-[10px] rounded ${revView===v ? 'bg-gray-900 text-white' : ''}`}>{v}</button>))}</div>
                </div>
              </div>
              <div className="text-sm text-gray-700">Total {revView}: ${revenue?.total_revenue?.toLocaleString?.() || '—'}</div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-gray-50 rounded p-2"><div className="text-[10px] text-gray-500">MRR</div><div className="text-sm font-semibold text-gray-900">${(kpis?.mrr||0).toLocaleString?.()}</div></div>
                <div className="bg-gray-50 rounded p-2"><div className="text-[10px] text-gray-500">ARR</div><div className="text-sm font-semibold text-gray-900">${(kpis?.arr||0).toLocaleString?.()}</div></div>
                <div className="bg-gray-50 rounded p-2"><div className="text-[10px] text-gray-500">ARPU</div><div className="text-sm font-semibold text-gray-900">${(kpis?.arpu||0).toLocaleString?.()}</div></div>
                <div className="bg-gray-50 rounded p-2"><div className="text-[10px] text-gray-500">Churn</div><div className="text-sm font-semibold text-gray-900">{(kpis?.churn_rate_pct??0)}%</div></div>
              </div>
              <div className="mt-2 text-xs text-gray-500">Est. Gross {(kpis?.gross_margin_pct ?? 0)}% • Net {(kpis?.net_margin_pct ?? 0)}%</div>
            </div>

            {/* Revenue Streams */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-3"><h3 className="text-lg font-semibold text-gray-900">Revenue Streams</h3></div>
              <div className="text-xs text-gray-500 mb-2">Breakdown of revenue by product, subscription, or service.</div>
              <ul className="text-sm text-gray-700 space-y-1">
                {(revenue?.revenue_breakdown || []).map((r, i) => (
                  <li key={i} className="flex justify-between"><span>{r?.source || 'Source'}</span><span>${(r?.amount || 0).toLocaleString?.()}</span></li>
                ))}
                {((revenue?.revenue_breakdown || []).length===0) && (<li className="text-gray-500">No revenue data.</li>)}
              </ul>
              <div className="mt-4 h-48">
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

            {/* Revenue Trend (stacked) */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-3"><h3 className="text-lg font-semibold text-gray-900">Revenue Trend by Stream (90d)</h3></div>
              <div className="text-xs text-gray-500 mb-2">How each revenue stream has trended over time.</div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueTrend.map(p => ({ name: p.date, Products: p.streams?.Products, Subscriptions: p.streams?.Subscriptions, Consulting: p.streams?.Consulting }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Products" stackId="rev" fill="#10B981" />
                    <Bar dataKey="Subscriptions" stackId="rev" fill="#3B82F6" />
                    <Bar dataKey="Consulting" stackId="rev" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2"><h3 className="text-lg font-semibold text-gray-900">Top Customers</h3></div>
              <div className="text-xs text-gray-500 mb-2">Customers contributing the most revenue in this period.</div>
              <ul className="text-sm text-gray-700 space-y-1 max-h-40 overflow-y-auto">
                {topCustomers.map((c, i) => (<li key={i} className="flex justify-between hover:bg-gray-50 rounded px-1 cursor-pointer" onClick={() => setCustomerModal(c)}><span className="truncate pr-2">{c.customer}</span><span>${c.amount.toLocaleString?.()}</span></li>))}
                {topCustomers.length === 0 && <li className="text-gray-500">No customers in this period.</li>}
              </ul>
              <div className="mt-2 flex justify-end"><button className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={() => exportCsv(topCustomers.map(c=>({ customer:c.customer, amount:c.amount })), ['customer','amount'], 'top_customers.csv')}>Export CSV</button></div>
            </div>
          </div>

          {/* RIGHT COLUMN: EXPENSES */}
          <div className="space-y-6">
            {/* Expense Breakdown */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-red-500" />Expense Breakdown ({period})</h3>
                <Pill tone="info">{expView}</Pill>
              </div>
              <div className="text-xs text-gray-500 mb-2">Where money was spent by category in the selected period.</div>
              <div className="h-56">
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

            {/* Expense Trend */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-3"><h3 className="text-lg font-semibold text-gray-900">Expense Trend (90d)</h3></div>
              <div className="text-xs text-gray-500 mb-2">Overall spending trend across recent periods.</div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RLineChart data={expenseTrend.map(p => ({ name: p.date, total: p.total }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#EF4444" dot={false} name="Total" />
                  </RLineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Vendors */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2"><h3 className="text-lg font-semibold text-gray-900">Top Vendors</h3></div>
              <div className="text-xs text-gray-500 mb-2">Vendors with the highest spend in this period.</div>
              <ul className="text-sm text-gray-700 space-y-1 max-h-40 overflow-y-auto">
                {topVendors.map((v, i) => (<li key={i} className="flex justify-between hover:bg-gray-50 rounded px-1 cursor-pointer" onClick={() => setVendorModal(v)}><span className="truncate pr-2">{v.vendor}</span><span>${v.amount.toLocaleString?.()}</span></li>))}
                {topVendors.length === 0 && <li className="text-gray-500">No vendors in this period.</li>}
              </ul>
              <div className="mt-2 flex justify-end"><button className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={() => exportCsv(topVendors.map(v=>({ vendor:v.vendor, amount:v.amount })), ['vendor','amount'], 'top_vendors.csv')}>Export CSV</button></div>
            </div>

            {/* Fixed vs Variable */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2"><h3 className="text-lg font-semibold text-gray-900">Fixed vs Variable Costs</h3></div>
              <div className="text-xs text-gray-500 mb-2">Share of fixed vs variable expenses in this period.</div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie dataKey="value" data={[
                      { name: 'Fixed', value: fixedVariable?.fixed_pct || 0, color: '#64748B' },
                      { name: 'Variable', value: fixedVariable?.variable_pct || 0, color: '#F59E0B' },
                    ]} innerRadius={40} outerRadius={70}>
                      <Cell fill="#64748B" />
                      <Cell fill="#F59E0B" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Overruns */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2"><h3 className="text-lg font-semibold text-gray-900">Cost Overruns</h3></div>
              <div className="text-xs text-gray-500 mb-2">Categories where actual spend exceeded budget.</div>
              <ul className="text-xs text-gray-700 space-y-1">
                {(budgetActual?.categories||[]).filter(c => (c.actual||0) > (c.budget||0)).map((c,i) => (
                  <li key={i} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded px-2 py-1"><span>{c.category}</span><span>Actual ${c.actual} vs Budget ${c.budget}</span></li>
                ))}
                {((budgetActual?.categories||[]).filter(c => (c.actual||0) > (c.budget||0)).length===0) && (<li className="text-gray-500">No overruns detected.</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Customer / Vendor detail modals */}
      {customerModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Customer Details</h4>
            <div className="text-sm text-gray-700 mb-2">{customerModal.customer}</div>
            <div className="text-sm text-gray-700 mb-4">Revenue: ${customerModal.amount?.toLocaleString?.()}</div>
            <div className="text-xs text-gray-500 mb-4">More breakdowns to come (by product and period).</div>
            <div className="flex justify-end gap-2"><button className="px-3 py-2 text-sm rounded bg-gray-100" onClick={() => setCustomerModal(null)}>Close</button></div>
          </div>
        </div>
      )}
      {vendorModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Vendor Details</h4>
            <div className="text-sm text-gray-700 mb-2">{vendorModal.vendor}</div>
            <div className="text-sm text-gray-700 mb-4">Spend: ${vendorModal.amount?.toLocaleString?.()}</div>
            <div className="text-xs text-gray-500 mb-4">Contract and renewal details will appear here.</div>
            <div className="flex justify-end gap-2"><button className="px-3 py-2 text-sm rounded bg-gray-100" onClick={() => setVendorModal(null)}>Close</button></div>
          </div>
        </div>
      )}

      {/* Cashflow Analytics */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          {/* Cash balance & working capital */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-xs text-gray-500 mb-1">Cash on Hand</div>
              <div className="text-2xl font-semibold text-gray-900">${(cashBalance?.cash_on_hand||0).toLocaleString?.()}</div>
              <div className="text-xs text-gray-500 mt-1">Available Credit: ${((cashBalance?.available_credit)||0).toLocaleString?.()}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-xs text-gray-500 mb-1">Working Capital Cycle</div>
              <div className="text-sm text-gray-900">
                DSO (Days Sales Outstanding) {wcCycle?.dso_days||0}d • DPO (Days Payable Outstanding) {wcCycle?.dpo_days||0}d • DIO (Days Inventory Outstanding) {wcCycle?.dio_days||0}d
              </div>
              <div className="text-xs text-gray-500 mt-1">How quickly you collect, pay, and turn inventory. Cycle: {wcCycle?.cycle_days||0} days — lower is better.</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">Scenario</div>
                <div className="flex gap-2">
                  {['expected','best','worst'].map(s => (
                    <button key={s} onClick={() => setScenario(s)} className={`px-2 py-1 text-xs rounded capitalize ${scenario===s ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex justify-center gap-2">
                {periodOptions.map(p => (
                  <button key={p} onClick={() => setPeriod(p)} className={`px-2 py-1 text-xs rounded ${period===p ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Projections */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center"><LineChart className="w-5 h-5 mr-2 text-blue-500" />Cashflow Projections ({period})</h3>
              <Pill tone={runway >= 12 ? 'good' : runway >= 6 ? 'info' : 'warn'}>{runway >= 12 ? 'Comfortable' : runway >= 6 ? 'Okay' : 'Needs Attention'}</Pill>
            </div>
            <div className="text-xs text-gray-500 mb-2">Projected cash balance over time under the selected scenario.</div>
            <div className="h-64">
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

          {/* Receivables & Payables timelines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Receivables Timeline (90d)</h3>
              </div>
              <div className="text-xs text-gray-500 mb-2">Expected incoming customer payments by date.</div>
              <ul className="text-sm text-gray-700 space-y-2 max-h-64 overflow-y-auto">
                {receivables.map((r,i)=>(
                  <li key={i} className="flex items-center justify-between">
                    <span>{r.date} • {r.customer}</span>
                    <span>${(r.amount||0).toLocaleString?.()}</span>
                  </li>
                ))}
                {receivables.length===0 && (<li className="text-gray-500">No receivables on timeline.</li>)}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Payables Timeline (90d)</h3>
              </div>
              <div className="text-xs text-gray-500 mb-2">Upcoming vendor/supplier obligations by date.</div>
              <ul className="text-sm text-gray-700 space-y-2 max-h-64 overflow-y-auto">
                {payables.map((p,i)=>(
                  <li key={i} className="flex items-center justify-between">
                    <span>{p.date} • {p.vendor}</span>
                    <span>${(p.amount||0).toLocaleString?.()}</span>
                  </li>
                ))}
                {payables.length===0 && (<li className="text-gray-500">No payables on timeline.</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lifetime Value (LTV) */}
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer" onClick={()=>setCustomerModal({ title: 'Lifetime Value (LTV) Details', customer: 'Cohorts', amount: analyticsKpis?.ltv })}>
            <div className="flex items-center justify-between mb-1"><h3 className="text-lg font-semibold text-gray-900">Lifetime Value (LTV)</h3><Pill tone="info">Info</Pill></div>
            <div className="text-xs text-gray-500 mb-2">Total revenue expected from an average customer over their relationship.</div>
            <div className="text-2xl font-bold text-gray-900">${analyticsKpis?.ltv?.toLocaleString?.()}</div>
          </div>
          {/* Customer Acquisition Cost (CAC) */}
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer" onClick={()=>setVendorModal({ vendor: 'Acquisition', amount: analyticsKpis?.cac })}>
            <div className="flex items-center justify-between mb-1"><h3 className="text-lg font-semibold text-gray-900">Customer Acquisition Cost (CAC)</h3><Pill tone="info">Info</Pill></div>
            <div className="text-xs text-gray-500 mb-2">Average cost to acquire one new customer (marketing + sales).</div>
            <div className="text-2xl font-bold text-gray-900">${analyticsKpis?.cac?.toLocaleString?.()}</div>
          </div>
          {/* LTV:CAC Ratio */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-1"><h3 className="text-lg font-semibold text-gray-900">LTV:CAC Ratio</h3><Pill tone={analyticsKpis?.ltv_cac_ratio>=3?'good':'warn'}>Guide</Pill></div>
            <div className="text-xs text-gray-500 mb-2">Indicates scalability; rule of thumb ≥ 3x.</div>
            <div className="text-2xl font-bold text-gray-900">{analyticsKpis?.ltv_cac_ratio}x</div>
          </div>

          {/* Gross Margin % */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-1"><h3 className="text-lg font-semibold text-gray-900">Gross Margin %</h3><Pill tone={analyticsKpis?.gross_margin_pct>=60?'good':'info'}>Health</Pill></div>
            <div className="text-xs text-gray-500 mb-2">Percentage of revenue left after cost of goods sold.</div>
            <div className="text-2xl font-bold text-gray-900">{analyticsKpis?.gross_margin_pct}%</div>
          </div>
          {/* Operating Margin % */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-1"><h3 className="text-lg font-semibold text-gray-900">Operating Margin %</h3><Pill tone={analyticsKpis?.operating_margin_pct>=10?'good':'info'}>Health</Pill></div>
            <div className="text-xs text-gray-500 mb-2">Operating profit divided by revenue (EBIT / Revenue).</div>
            <div className="text-2xl font-bold text-gray-900">{analyticsKpis?.operating_margin_pct}%</div>
          </div>
          {/* CAC Payback Period */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-1"><h3 className="text-lg font-semibold text-gray-900">CAC Payback Period</h3><Pill tone={analyticsKpis?.payback_months<=3?'good':'warn'}>Goal</Pill></div>
            <div className="text-xs text-gray-500 mb-2">Months to recover acquisition cost from gross profit.</div>
            <div className="text-2xl font-bold text-gray-900">{analyticsKpis?.payback_months} mo</div>
          </div>

          {/* Debt-to-Equity Ratio */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-1"><h3 className="text-lg font-semibold text-gray-900">Debt-to-Equity Ratio</h3><Pill tone={analyticsKpis?.debt_to_equity<=0.5?'good':'warn'}>Risk</Pill></div>
            <div className="text-xs text-gray-500 mb-2">Measures leverage: lower generally safer.</div>
            <div className="text-2xl font-bold text-gray-900 mb-3">{analyticsKpis?.debt_to_equity ?? '—'}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">Debt</div>
                <ul className="space-y-1">
                  {(analyticsKpis?.debt_breakdown||[]).map((d,i)=>(<li key={i} className="flex justify-between"><span>{d.label}</span><span>${d.amount?.toLocaleString?.()}</span></li>))}
                  <li className="flex justify-between font-medium border-t pt-1"><span>Total</span><span>${(analyticsKpis?.debt_total||0).toLocaleString?.()}</span></li>
                </ul>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Equity</div>
                <ul className="space-y-1">
                  {(analyticsKpis?.equity_breakdown||[]).map((e,i)=>(<li key={i} className="flex justify-between"><span>{e.label}</span><span>${e.amount?.toLocaleString?.()}</span></li>))}
                  <li className="flex justify-between font-medium border-t pt-1"><span>Total</span><span>${(analyticsKpis?.equity_total||0).toLocaleString?.()}</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* ROI by Channel */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <div className="mb-1 flex items-center justify-between"><h3 className="text-lg font-semibold text-gray-900">ROI by Marketing Channel ({period})</h3><Pill tone="info">ROAS</Pill></div>
            <div className="text-xs text-gray-500 mb-2">Return on ad spend per channel (higher is better).</div>
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

          {/* Budget vs Actual */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-3">
            <div className="mb-1 flex items-center justify-between"><h3 className="text-lg font-semibold text-gray-900">Budget vs Actual ({period})</h3><div className="flex gap-2">{periodOptions.map(p => (<button key={p} onClick={()=>setPeriod(p)} className={`px-2 py-1 text-xs rounded ${period===p?'bg-gray-900 text-white':'bg-gray-100 hover:bg-gray-200'}`}>{p}</button>))}</div></div>
            <div className="text-xs text-gray-500 mb-2">Compare planned budgets to actual spend to spot variances.</div>
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
        </div>
      )}

      {/* Forecasts & Scenarios */}
      {activeTab === 'forecasts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Baseline Forecast (90d)</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={(forecastBaseline?.points || [])}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" dot={false} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" dot={false} name="Expenses" />
                  <Line type="monotone" dataKey="cashflow" stroke="#3B82F6" dot={false} name="Cashflow" />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Scenario Modeling</h3>
              <div className="text-xs text-gray-500">Play "what if" without a CFO</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Revenue change (%)</div>
                <input type="range" min="-50" max="50" step="1" value={scenarioParams.revenueDeltaPct} onChange={e=>setScenarioParams({...scenarioParams, revenueDeltaPct: Number(e.target.value)})} className="w-full" />
                <div className="text-xs text-gray-500 mt-1">{scenarioParams.revenueDeltaPct}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Ad spend change (%)</div>
                <input type="range" min="-50" max="50" step="1" value={scenarioParams.adSpendDeltaPct} onChange={e=>setScenarioParams({...scenarioParams, adSpendDeltaPct: Number(e.target.value)})} className="w-full" />
                <div className="text-xs text-gray-500 mt-1">{scenarioParams.adSpendDeltaPct}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Hiring change (heads)</div>
                <input type="range" min="-5" max="10" step="1" value={scenarioParams.hiresDelta} onChange={e=>setScenarioParams({...scenarioParams, hiresDelta: Number(e.target.value)})} className="w-full" />
                <div className="text-xs text-gray-500 mt-1">{scenarioParams.hiresDelta} hires</div>
              </div>
            </div>
            <div className="mt-4">
              <button onClick={async ()=>{ const res = await financialApi.simulateScenario(scenarioParams); setScenarioResult(res?.data||{}); }} className="px-3 py-2 rounded bg-blue-600 text-white text-sm">Simulate</button>
            </div>
            {scenarioResult?.points && (
              <div className="h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RLineChart data={scenarioResult.points}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10B981" dot={false} name="Revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" dot={false} name="Expenses" />
                    <Line type="monotone" dataKey="cashflow" stroke="#3B82F6" dot={false} name="Cashflow" />
                  </RLineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: 'Revenue -15%', params: { revenueDeltaPct: -15, adSpendDeltaPct: 0, hiresDelta: 0 } },
                { label: 'Ad spend +20%', params: { revenueDeltaPct: 0, adSpendDeltaPct: 20, hiresDelta: 0 } },
                { label: '+2 hires', params: { revenueDeltaPct: 0, adSpendDeltaPct: 0, hiresDelta: 2 } },
              ].map((t, i) => (
                <button
                  key={i}
                  onClick={async ()=>{ const res = await financialApi.simulateScenario(t.params); setScenarioResult(res?.data||{}); }}
                  className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Break-Even Analysis</h3>
              <div className="text-sm text-gray-700">Fixed Costs: ${adjustedBreakEven?.fixed_costs?.toLocaleString?.()} • Avg Price: ${adjustedBreakEven?.avg_price || breakEven?.avg_price} • Variable Cost: ${adjustedBreakEven?.variable_cost_per_unit?.toLocaleString?.()}</div>
              <div className="mt-2 text-sm text-gray-900">Break-even: {adjustedBreakEven?.break_even_units ?? '—'} units ({adjustedBreakEven?.break_even_revenue ? `$${adjustedBreakEven?.break_even_revenue?.toLocaleString?.()}` : '—'})</div>
              <div className="text-[11px] text-gray-500 mt-1">Adjusts with Ad Spend and Hires sliders</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Runway Calculator</h3>
              <div className="text-sm text-gray-700">Runway: {scenarioRunwayMonths != null && scenarioRunwayMonths !== Infinity ? `${scenarioRunwayMonths} months` : (runwayCalc?.months ?? '—')}</div>
              <div className="text-xs text-gray-500">Burn rate: ${runwayCalc?.burn_rate_monthly?.toLocaleString?.()} / mo • {scenarioAvgDailyCashflow != null ? 'Based on simulated cashflow' : (runwayCalc?.assumptions || '')}</div>
              {scenarioAvgDailyCashflow != null && (<div className="text-[11px] text-gray-500 mt-1">Updates when you click Simulate</div>)}
            </div>
          </div>

          
        </div>
      )}

      {/* Invoices/Payments */}
      {activeTab === 'invoices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash In / Payments Expected */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Cash In / Payments Expected</h3>
              <Pill tone="info">AR</Pill>
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
                  {receivableInvoices.map(inv => (
                    <tr key={inv.id} className="border-t">
                      <td className="px-4 py-2 font-medium text-gray-900">{inv.id}</td>
                      <td className="px-4 py-2">{inv.customer}</td>
                      <td className="px-4 py-2">${(inv.amount||0).toLocaleString?.()}</td>
                      <td className="px-4 py-2">{inv.due_date}</td>
                      <td className="px-4 py-2 capitalize">{inv.status}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white" onClick={async () => {
                          await financialApi.markInvoiceReceived(inv.id);
                          setReceivableInvoices(prev => prev.map(i => i.id===inv.id ? { ...i, status: 'received' } : i));
                        }}>Mark Received</button>
                      </td>
                    </tr>
                  ))}
                  {receivableInvoices.length === 0 && (
                    <tr><td className="px-4 py-6 text-gray-500" colSpan="6">No receivables found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cash Out / Invoices to Pay */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center"><FileCheck className="w-5 h-5 mr-2 text-blue-500" />Cash Out / Invoices to Pay</h3>
              <Pill tone="warn">Needs Attention</Pill>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="px-4 py-2">Invoice</th>
                    <th className="px-4 py-2">Vendor</th>
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
                      <td className="px-4 py-2">{inv.vendor}</td>
                      <td className="px-4 py-2">${(inv.amount||0).toLocaleString?.()}</td>
                      <td className="px-4 py-2">{inv.due_date}</td>
                      <td className="px-4 py-2 capitalize">{inv.status}</td>
                      <td className="px-4 py-2 align-top">
                        <div className="flex flex-col gap-2">
                          <button className="px-2 py-1 text-xs rounded bg-emerald-600 text-white" onClick={async () => {
                            const ctx = await financialApi.getInvoiceApprovalContext(inv.id);
                            setApprovalModal({ context: ctx?.data });
                          }}>Approve</button>
                          <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white" onClick={async () => {
                            await financialApi.markInvoicePaid(inv.id);
                            setInvoices(prev => prev.map(i => i.id===inv.id ? { ...i, status: 'paid' } : i));
                          }}>Mark Paid</button>
                        </div>
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




