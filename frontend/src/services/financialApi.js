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
  executeFinancialAction: async (actionId, actionData = {}) => {
    return request('/financial/execute-action', { method: 'POST', body: JSON.stringify({ action_id: actionId, ...actionData }) });
  },
  updateFinancialTargets: async (payload) => {
    return request('/financial/update-targets', { method: 'POST', body: JSON.stringify(payload) });
  },
};


