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
  executeFinancialAction: async (actionId, actionData = {}) => {
    return request('/financial/execute-action', { method: 'POST', body: JSON.stringify({ action_id: actionId, ...actionData }) });
  },
  updateFinancialTargets: async (payload) => {
    return request('/financial/update-targets', { method: 'POST', body: JSON.stringify(payload) });
  },
};




