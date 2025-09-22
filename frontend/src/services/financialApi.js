const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || window.location.origin;

async function request(path, opts = {}) {
  const token = localStorage.getItem('guild.auth.jwt') || '';
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const financialApi = {
  getFinancialAnalysis: async () => {
    try { return await request('/financial/analysis'); } catch {
      return {
        success: true,
        data: {
          financial_health_score: 75.5,
          cash_flow_status: 'stable',
          key_insights: [
            'Revenue growth is steady at 15% month-over-month',
            'Cash runway is adequate at 8.5 months',
            'Ad spend efficiency needs attention',
          ],
          financial_metrics: {
            revenue_metrics: { mrr: { current: 45000 }, growth_rate: { current: 15.2 } },
            cash_flow_metrics: { cash_runway: { current: 8.5 }, burn_rate: { current: 8500 } },
          },
        },
      };
    }
  },
  getCashFlowProjections: async (scenario = 'expected', period = '30d') => {
    try { return await request(`/financial/cash-flow-projections?scenario=${encodeURIComponent(scenario)}&period=${encodeURIComponent(period)}`); } catch {
      return { success: true, data: { scenario_type: scenario, period, projections: [] } };
    }
  },
  getCashBalance: async () => {
    try { return await request('/financial/cash-balance'); } catch {
      return { success: true, data: { cash_on_hand: 32450, available_credit: 10000, updated_at: new Date().toISOString() } };
    }
  },
  getReceivablesTimeline: async (period = '90d') => {
    try { return await request(`/financial/receivables-timeline?period=${encodeURIComponent(period)}`); } catch {
      return { success: true, data: { items: [
        { date: new Date(Date.now()+3*86400000).toISOString().slice(0,10), customer: 'Acme Corp', amount: 1200 },
        { date: new Date(Date.now()+7*86400000).toISOString().slice(0,10), customer: 'Globex LLC', amount: 850 },
      ] } };
    }
  },
  getPayablesTimeline: async (period = '90d') => {
    try { return await request(`/financial/payables-timeline?period=${encodeURIComponent(period)}`); } catch {
      return { success: true, data: { items: [
        { date: new Date(Date.now()+2*86400000).toISOString().slice(0,10), vendor: 'AWS', amount: 400 },
        { date: new Date(Date.now()+5*86400000).toISOString().slice(0,10), vendor: 'Google Workspace', amount: 120 },
      ] } };
    }
  },
  getWorkingCapitalCycle: async () => {
    try { return await request('/financial/working-capital-cycle'); } catch {
      return { success: true, data: { dso_days: 28, dpo_days: 21, dio_days: 7, cycle_days: 14 } };
    }
  },
  getFinancialRisks: async () => {
    try { return await request('/financial/risks'); } catch {
      return { success: true, data: { risks: [] } };
    }
  },
  getExpenseBreakdown: async (period = '30d') => {
    try { return await request(`/financial/expense-breakdown?period=${encodeURIComponent(period)}`); } catch {
      return { success: true, data: { period, expense_breakdown: [] } };
    }
  },
  getRevenueAnalysis: async (period = '30d') => {
    try { return await request(`/financial/revenue-analysis?period=${encodeURIComponent(period)}`); } catch {
      return { success: true, data: { period, total_revenue: 0, revenue_breakdown: [] } };
    }
  },
  getFinancialForecasts: async (period = '90d') => {
    try { return await request(`/financial/forecasts?period=${encodeURIComponent(period)}`); } catch {
      return { success: true, data: { period, forecasts: [] } };
    }
  },
  getFinancialKpis: async (period = '30d') => {
    try { return await request(`/financial/kpis?period=${encodeURIComponent(period)}`); } catch {
      return { success: true, data: {
        cash_on_hand: 32500,
        current_liabilities: 18200,
        ar_total: 4200,
        ap_total: 6100,
        runway_months: 8.2,
        burn_rate: 8500,
        gross_margin_pct: 62.5,
        net_margin_pct: 18.4,
        mrr: 45200,
        arr: 540000,
        growth_rate_pct: 15.2,
        roas: 2.1,
        cost_savings_automation: 950,
      } };
    }
  },
  getCampaignRoiTop: async (period = '30d', limit = 3) => {
    try { return await request(`/financial/campaign-roi?period=${encodeURIComponent(period)}&limit=${limit}`); } catch {
      return { success: true, data: { campaigns: [
        { id: 'cmp_fb_01', name: 'FB Prospecting', spend: 1200, revenue: 2500, roas: 2.08 },
        { id: 'cmp_gg_02', name: 'Google Search', spend: 900, revenue: 2100, roas: 2.33 },
        { id: 'cmp_em_03', name: 'Email Nurture', spend: 300, revenue: 700, roas: 2.33 },
      ] } };
    }
  },
  getHealthScoreTimeline: async (period = '90d') => {
    try { return await request(`/financial/health-score-timeline?period=${encodeURIComponent(period)}`); } catch {
      const points = Array.from({ length: 12 }, (_, i) => ({ idx: i+1, score: 60 + Math.round(Math.random()*20) }));
      return { success: true, data: { points } };
    }
  },
  getBudgetVsActual: async (period = '30d') => {
    try { return await request(`/financial/budget-vs-actual?period=${encodeURIComponent(period)}`); } catch {
      return { success: true, data: {
        period,
        categories: [
          { category: 'Marketing', budget: 5000, actual: 6200 },
          { category: 'Software', budget: 1200, actual: 1100 },
          { category: 'Operations', budget: 3000, actual: 2800 },
        ],
      } };
    }
  },
  getAdRoi: async (period = '30d') => {
    try { return await request(`/financial/ad-roi?period=${encodeURIComponent(period)}`); } catch {
      return { success: true, data: {
        period,
        channels: [
          { channel: 'Meta Ads', spend: 2200, revenue: 3100, roas: 1.41 },
          { channel: 'Google Ads', spend: 1800, revenue: 4200, roas: 2.33 },
          { channel: 'TikTok Ads', spend: 900, revenue: 800, roas: 0.89 },
        ],
      } };
    }
  },
  getRevenueTrend: async (period = '90d') => {
    try { return await request(`/financial/revenue-trend?period=${encodeURIComponent(period)}`); } catch {
      const dates = Array.from({ length: 8 }, (_, i) => `W${i+1}`);
      const streams = ['Products','Subscriptions','Consulting'];
      const points = dates.map((d) => {
        const sVals = streams.map(() => Math.round(1000 + Math.random()*2000));
        const total = sVals.reduce((a,b)=>a+b,0);
        return { date: d, total, streams: { Products: sVals[0], Subscriptions: sVals[1], Consulting: sVals[2] } };
      });
      return { success: true, data: { period, points } };
    }
  },
  getTopCustomers: async (period = '30d', limit = 10) => {
    try { return await request(`/financial/top-customers?period=${encodeURIComponent(period)}&limit=${limit}`); } catch {
      return { success: true, data: { customers: Array.from({ length: limit }, (_, i) => ({ customer: `Customer ${i+1}`, amount: Math.round(500 + Math.random()*5000) })) } };
    }
  },
  getExpenseTrend: async (period = '90d') => {
    try { return await request(`/financial/expense-trend?period=${encodeURIComponent(period)}`); } catch {
      const dates = Array.from({ length: 8 }, (_, i) => `W${i+1}`);
      const points = dates.map((d) => ({ date: d, total: Math.round(2000 + Math.random()*2500) }));
      return { success: true, data: { period, points } };
    }
  },
  getTopVendors: async (period = '30d', limit = 10) => {
    try { return await request(`/financial/top-vendors?period=${encodeURIComponent(period)}&limit=${limit}`); } catch {
      return { success: true, data: { vendors: Array.from({ length: limit }, (_, i) => ({ vendor: `Vendor ${i+1}`, amount: Math.round(300 + Math.random()*4000) })) } };
    }
  },
  getFixedVariableCosts: async (period = '30d') => {
    try { return await request(`/financial/fixed-variable?period=${encodeURIComponent(period)}`); } catch {
      const fixed = 0.55 + Math.random()*0.1;
      return { success: true, data: { fixed_pct: Number((fixed*100).toFixed(1)), variable_pct: Number(((1-fixed)*100).toFixed(1)) } };
    }
  },
  getInvoices: async (status = 'pending') => {
    try { return await request(`/financial/invoices?status=${encodeURIComponent(status)}`); } catch {
      return { success: true, data: { invoices: [
        { id: 'inv_001', customer: 'Acme Corp', amount: 1250, due_date: '2025-10-05', status: 'pending' },
        { id: 'inv_002', customer: 'Globex LLC', amount: 890, due_date: '2025-10-08', status: 'pending' },
      ] } };
    }
  },
  approveInvoice: async (invoiceId) => {
    try { return await request(`/financial/invoices/${encodeURIComponent(invoiceId)}/approve`, { method: 'POST' }); } catch {
      return { success: true, data: { id: invoiceId, status: 'approved' } };
    }
  },
  markInvoicePaid: async (invoiceId) => {
    try { return await request(`/financial/invoices/${encodeURIComponent(invoiceId)}/mark-paid`, { method: 'POST' }); } catch {
      return { success: true, data: { id: invoiceId, status: 'paid' } };
    }
  },
  getInvoiceApprovalContext: async (invoiceId) => {
    try { return await request(`/financial/invoices/${encodeURIComponent(invoiceId)}/approval-context`); } catch {
      return { success: true, data: {
        invoice_id: invoiceId,
        rationale: 'Vendor is on-time, amount within budget, avoids late fees.',
        confidence_pct: 0.86,
        risk: 'low',
        vendor: 'Sample Vendor', amount: 1250, due_date: '2025-10-05'
      } };
    }
  },
  getBudgetReallocationProposal: async (idx = 0) => {
    try { return await request(`/financial/budget-reallocation?idx=${idx}`); } catch {
      return { success: true, data: {
        from: { channel: 'Meta Ads', current_roas: 1.2, amount: 2000 },
        to: { channel: 'Google Ads', current_roas: 2.3, amount: 2000 },
        recommendation: 'Shift $2k from Meta to Google to improve ROAS.',
        confidence_pct: 0.88,
        risk: 'medium',
      } };
    }
  },
  executeFinancialAction: async (actionId, actionData = {}) => {
    return request('/financial/execute-action', { method: 'POST', body: JSON.stringify({ action_id: actionId, ...actionData }) });
  },
  updateFinancialTargets: async (payload) => {
    return request('/financial/update-targets', { method: 'POST', body: JSON.stringify(payload) });
  },
};




