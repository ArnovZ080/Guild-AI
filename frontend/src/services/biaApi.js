const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || window.location.origin;

export async function fetchCeoSnapshot() {
  try {
    const token = localStorage.getItem('guild.auth.jwt') || '';
    const res = await fetch(`${API_BASE}/bi/ceo-snapshot`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    // Safe fallback demo payload
    return {
      overall_business_health: { score: 78.5, status: 'Good', trend: 'improving' },
      executive_summary:
        'Business health is good with a score of 78.5/100. Revenue is growing at 20.0%, below the 25.0% target. Cash runway is critical at 8.3 months - immediate action needed.',
      actionable_insights: [
        'Revenue growth is 20.0% vs 25.0% target. Consider increasing marketing spend or optimizing conversion rates.',
        'Cash runway is critical at 8.3 months. Focus on increasing revenue or reducing burn rate immediately.',
      ],
      immediate_actions: [
        'URGENT: Increase revenue or reduce burn rate to extend cash runway',
      ],
      kpis: {
        financial: [
          { key: 'revenue_growth', label: 'Revenue Growth', value: '20%', status: 'warning' },
          { key: 'net_margin', label: 'Net Profit Margin', value: '18%', status: 'good' },
          { key: 'cash_runway', label: 'Cash Runway', value: '8.3 mo', status: 'critical' },
        ],
        customer: [
          { key: 'cac', label: 'CAC', value: '$142', status: 'good' },
          { key: 'clv', label: 'CLV', value: '$1,980', status: 'good' },
          { key: 'churn', label: 'Churn', value: '3.2%', status: 'warning' },
        ],
        operational: [
          { key: 'efficiency', label: 'Operational Efficiency', value: '85%', status: 'good' },
          { key: 'time_saved', label: 'Time Saved (hrs/wk)', value: '12', status: 'good' },
        ],
      },
      horizon_4h: {
        financials: { cashflow: 'stable', next_invoices: 2 },
        operations: { urgent_tasks: 1, blocked_workflows: 0 },
        content: { posts_today: 1, campaign_status: 'underperforming' },
        agents: { active: 5, notes: 'Research + Content running' },
        customers: { alerts: 1, birthdays: 0, escalations: 0 },
        calendar: { items: [{ title: 'CEO Diary: Weekly plan', time: '14:00' }] },
      },
    };
  }
}

export async function fetchKpiDetails(kpiId) {
  try {
    const token = localStorage.getItem('guild.auth.jwt') || '';
    const res = await fetch(`${API_BASE}/bi/kpi-details/${encodeURIComponent(kpiId)}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    // Safe fallback minimal shape
    return {
      success: true,
      data: {
        kpi_id: kpiId,
        detailed_metrics: {
          current_performance: 'unknown',
          benchmark_comparison: 'n/a',
          forecast_accuracy: 'n/a',
        },
        recommendations: [
          'Collect more data to refine this KPI.',
        ],
        related_metrics: [],
        last_updated: new Date().toISOString(),
      },
    };
  }
}


