// Enhanced API Integration for Business Intelligence Agent CEO Snapshot
// This file contains the API methods and hooks for the CEO snapshot functionality

// API Service Extensions for CEO Snapshot
export const CEO_SNAPSHOT_API_ENDPOINTS = {
  // Get comprehensive CEO snapshot
  getCEOSnapshot: '/bi/ceo-snapshot',
  
  // Get specific KPI details
  getKPIDetails: '/bi/kpi-details',
  
  // Update KPI targets
  updateKPITargets: '/bi/update-kpi-targets',
  
  // Get KPI historical data
  getKPIHistory: '/bi/kpi-history',
  
  // Execute immediate actions
  executeImmediateAction: '/bi/execute-immediate-action',
  
  // Get business health trends
  getBusinessHealthTrends: '/bi/business-health-trends'
};

// Enhanced API Service Class Extensions
export class BusinessIntelligenceAPIService {
  constructor(baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.log(`API request failed for ${endpoint}, using mock data:`, error.message);
      return null;
    }
  }

  // CEO Snapshot Methods
  async getCEOSnapshot() {
    const result = await this.request(CEO_SNAPSHOT_API_ENDPOINTS.getCEOSnapshot);
    return result || this.getMockCEOSnapshot();
  }

  async getKPIDetails(kpiId) {
    const result = await this.request(`${CEO_SNAPSHOT_API_ENDPOINTS.getKPIDetails}/${kpiId}`);
    return result || this.getMockKPIDetails(kpiId);
  }

  async updateKPITargets(kpiUpdates) {
    return this.request(CEO_SNAPSHOT_API_ENDPOINTS.updateKPITargets, {
      method: 'POST',
      body: JSON.stringify(kpiUpdates)
    });
  }

  async getKPIHistory(kpiId, period = '12months') {
    const result = await this.request(`${CEO_SNAPSHOT_API_ENDPOINTS.getKPIHistory}/${kpiId}?period=${period}`);
    return result || this.getMockKPIHistory(kpiId, period);
  }

  async executeImmediateAction(actionId, actionData = {}) {
    return this.request(CEO_SNAPSHOT_API_ENDPOINTS.executeImmediateAction, {
      method: 'POST',
      body: JSON.stringify({ action_id: actionId, ...actionData })
    });
  }

  async getBusinessHealthTrends(period = '6months') {
    const result = await this.request(`${CEO_SNAPSHOT_API_ENDPOINTS.getBusinessHealthTrends}?period=${period}`);
    return result || this.getMockBusinessHealthTrends(period);
  }

  // Mock Data Methods
  getMockCEOSnapshot() {
    return {
      success: true,
      data: {
        snapshot_id: `ceo_snapshot_${Date.now()}`,
        generated_at: new Date().toISOString(),
        overall_business_health: {
          score: 78.5,
          status: "Good",
          color: "blue",
          trend: "improving"
        },
        kpi_summary: {
          total_kpis: 11,
          excellent: 3,
          good: 5,
          warning: 2,
          critical: 1
        },
        core_kpis: {
          revenue_growth_rate: {
            kpi_id: "rev_growth_001",
            name: "Revenue Growth Rate",
            current_value: 20.0,
            previous_value: 15.2,
            target_value: 25.0,
            unit: "percent",
            category: "financial",
            trend_direction: "up",
            trend_percentage: 20.0,
            status: "good",
            calculation_method: "((Current Revenue - Previous Revenue) / Previous Revenue) * 100",
            data_sources: ["bookkeeping_agent", "analytics_agent"],
            last_updated: new Date().toISOString(),
            business_impact: "high"
          },
          net_profit_margin: {
            kpi_id: "profit_margin_001",
            name: "Net Profit Margin",
            current_value: 26.7,
            previous_value: 24.5,
            target_value: 30.0,
            unit: "percent",
            category: "financial",
            trend_direction: "up",
            trend_percentage: 9.0,
            status: "good",
            calculation_method: "(Net Profit / Total Revenue) * 100",
            data_sources: ["bookkeeping_agent"],
            last_updated: new Date().toISOString(),
            business_impact: "high"
          },
          customer_acquisition_cost: {
            kpi_id: "cac_001",
            name: "Customer Acquisition Cost",
            current_value: 60.0,
            previous_value: 65.0,
            target_value: 50.0,
            unit: "USD",
            category: "customer",
            trend_direction: "down",
            trend_percentage: -7.7,
            status: "warning",
            calculation_method: "Total Marketing Spend / New Customers",
            data_sources: ["marketing_agent", "analytics_agent"],
            last_updated: new Date().toISOString(),
            business_impact: "high"
          },
          customer_lifetime_value: {
            kpi_id: "clv_001",
            name: "Customer Lifetime Value",
            current_value: 3000.0,
            previous_value: 2800.0,
            target_value: 3500.0,
            unit: "USD",
            category: "customer",
            trend_direction: "up",
            trend_percentage: 7.1,
            status: "good",
            calculation_method: "Average Monthly Revenue * Customer Lifespan",
            data_sources: ["analytics_agent", "crm_agent"],
            last_updated: new Date().toISOString(),
            business_impact: "high"
          },
          campaign_roi: {
            kpi_id: "campaign_roi_001",
            name: "Campaign ROI",
            current_value: 200.0,
            previous_value: 180.0,
            target_value: 200.0,
            unit: "percent",
            category: "marketing",
            trend_direction: "up",
            trend_percentage: 11.1,
            status: "excellent",
            calculation_method: "((Revenue - Spend) / Spend) * 100",
            data_sources: ["marketing_agent", "analytics_agent"],
            last_updated: new Date().toISOString(),
            business_impact: "high"
          },
          funnel_conversion_rates: {
            kpi_id: "funnel_conv_001",
            name: "Overall Conversion Rate",
            current_value: 2.5,
            previous_value: 2.1,
            target_value: 3.5,
            unit: "percent",
            category: "sales",
            trend_direction: "up",
            trend_percentage: 19.0,
            status: "good",
            calculation_method: "(Customers / Leads) * 100",
            data_sources: ["crm_agent", "analytics_agent"],
            last_updated: new Date().toISOString(),
            business_impact: "high"
          },
          churn_rate: {
            kpi_id: "churn_001",
            name: "Customer Churn Rate",
            current_value: 4.0,
            previous_value: 3.8,
            target_value: 3.0,
            unit: "percent",
            category: "customer",
            trend_direction: "up",
            trend_percentage: 5.3,
            status: "warning",
            calculation_method: "(Customers Lost / Customers at Start) * 100",
            data_sources: ["crm_agent", "analytics_agent"],
            last_updated: new Date().toISOString(),
            business_impact: "high"
          },
          net_promoter_score: {
            kpi_id: "nps_001",
            name: "Net Promoter Score",
            current_value: 54.0,
            previous_value: 48.0,
            target_value: 60.0,
            unit: "score",
            category: "customer",
            trend_direction: "up",
            trend_percentage: 12.5,
            status: "good",
            calculation_method: "((Promoters - Detractors) / Total Respondents) * 100",
            data_sources: ["crm_agent", "customer_support_agent"],
            last_updated: new Date().toISOString(),
            business_impact: "medium"
          },
          operational_efficiency: {
            kpi_id: "op_eff_001",
            name: "Operational Efficiency",
            current_value: 78.4,
            previous_value: 75.2,
            target_value: 85.0,
            unit: "percent",
            category: "operational",
            trend_direction: "up",
            trend_percentage: 4.3,
            status: "good",
            calculation_method: "(Automated Tasks / Total Tasks) * 100",
            data_sources: ["workflow_manager", "automation_agent"],
            last_updated: new Date().toISOString(),
            business_impact: "medium"
          },
          time_saved_agents: {
            kpi_id: "time_saved_001",
            name: "Time Saved via Agents",
            current_value: 32.0,
            previous_value: 30.0,
            target_value: 35.0,
            unit: "hours/week",
            category: "operational",
            trend_direction: "up",
            trend_percentage: 6.7,
            status: "good",
            calculation_method: "Estimated Manual Time - Actual Time Spent",
            data_sources: ["workflow_manager", "all_agents"],
            last_updated: new Date().toISOString(),
            business_impact: "medium"
          },
          cash_runway: {
            kpi_id: "runway_001",
            name: "Cash Runway",
            current_value: 8.3,
            previous_value: 6.8,
            target_value: 12.0,
            unit: "months",
            category: "financial",
            trend_direction: "up",
            trend_percentage: 22.1,
            status: "critical",
            calculation_method: "Current Cash / Monthly Burn Rate",
            data_sources: ["bookkeeping_agent", "financial_analytics"],
            last_updated: new Date().toISOString(),
            business_impact: "critical"
          }
        },
        executive_summary: "Business health is good with a score of 78.5/100. Revenue is growing at 20.0%, below the 25.0% target. Profit margins are healthy at 26.7%, meeting targets. Cash runway is critical at 8.3 months - immediate action needed.",
        actionable_insights: [
          "Revenue growth is 20.0% vs 25.0% target. Consider increasing marketing spend or optimizing conversion rates.",
          "CLV:CAC ratio is 50.0:1, above the recommended 3:1 ratio. Customer acquisition efficiency is strong.",
          "Customer churn rate is 4.0% vs 3.0% target. Implement customer retention strategies.",
          "Overall conversion rate is 2.5% vs 3.5% target. Optimize funnel stages and improve lead quality.",
          "Cash runway is critical at 8.3 months. Focus on increasing revenue or reducing burn rate immediately."
        ],
        top_priorities: {
          critical_issues: ["Cash Runway"],
          attention_needed: ["Customer Acquisition Cost", "Customer Churn Rate"],
          immediate_actions: [
            "URGENT: Increase revenue or reduce burn rate to extend cash runway"
          ]
        }
      }
    };
  }

  getMockKPIDetails(kpiId) {
    return {
      success: true,
      data: {
        kpi_id: kpiId,
        detailed_metrics: {
          current_performance: "above_average",
          benchmark_comparison: "industry_leading",
          seasonal_adjustment: "normal",
          forecast_accuracy: "high"
        },
        recommendations: [
          "Continue current strategy",
          "Monitor for seasonal changes",
          "Consider expansion opportunities"
        ],
        related_metrics: ["revenue", "profit_margin", "customer_satisfaction"],
        last_updated: new Date().toISOString()
      }
    };
  }

  getMockKPIHistory(kpiId, period) {
    const months = period === '12months' ? 12 : 6;
    const history = [];
    
    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      history.push({
        date: date.toISOString(),
        value: Math.random() * 100 + 50, // Mock value
        target: 75,
        status: Math.random() > 0.5 ? 'good' : 'warning'
      });
    }
    
    return {
      success: true,
      data: {
        kpi_id: kpiId,
        period: period,
        history: history,
        trend: "improving",
        volatility: "low"
      }
    };
  }

  getMockBusinessHealthTrends(period) {
    return {
      success: true,
      data: {
        period: period,
        overall_trend: "improving",
        key_trends: [
          {
            metric: "Revenue Growth",
            trend: "up",
            change: "+15%",
            impact: "positive"
          },
          {
            metric: "Customer Satisfaction",
            trend: "up", 
            change: "+8%",
            impact: "positive"
          },
          {
            metric: "Operational Efficiency",
            trend: "up",
            change: "+5%",
            impact: "positive"
          }
        ],
        risk_factors: [
          {
            factor: "Cash Runway",
            severity: "high",
            probability: "medium"
          }
        ],
        opportunities: [
          {
            opportunity: "Market Expansion",
            potential_impact: "high",
            effort_required: "medium"
          }
        ]
      }
    };
  }
}

// React Hooks for CEO Snapshot
export const useCEOSnapshot = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const apiService = new BusinessIntelligenceAPIService();

  const fetchSnapshot = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCEOSnapshot();
      setSnapshot(data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch CEO snapshot:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshot();
    // Refresh every 15 minutes for real-time updates
    const interval = setInterval(fetchSnapshot, 900000);
    return () => clearInterval(interval);
  }, [fetchSnapshot]);

  return { 
    snapshot, 
    loading, 
    error, 
    lastUpdated, 
    refetch: fetchSnapshot 
  };
};

export const useKPIDetails = (kpiId) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new BusinessIntelligenceAPIService();

  const fetchDetails = useCallback(async () => {
    if (!kpiId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getKPIDetails(kpiId);
      setDetails(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch KPI details:', err);
    } finally {
      setLoading(false);
    }
  }, [kpiId]);

  return { details, loading, error, fetchDetails };
};

export const useKPIHistory = (kpiId, period = '12months') => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new BusinessIntelligenceAPIService();

  const fetchHistory = useCallback(async () => {
    if (!kpiId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getKPIHistory(kpiId, period);
      setHistory(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch KPI history:', err);
    } finally {
      setLoading(false);
    }
  }, [kpiId, period]);

  return { history, loading, error, fetchHistory };
};

export const useBusinessHealthTrends = (period = '6months') => {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new BusinessIntelligenceAPIService();

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getBusinessHealthTrends(period);
      setTrends(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch business health trends:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  return { trends, loading, error, fetchTrends };
};

export const useImmediateActions = () => {
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new BusinessIntelligenceAPIService();

  const executeAction = useCallback(async (actionId, actionData = {}) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.executeImmediateAction(actionId, actionData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  return { executeAction, executing, error };
};

// Utility Functions
export const formatKPICurrency = (value, unit) => {
  if (unit === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  return `${value.toLocaleString()} ${unit}`;
};

export const getKPITrendColor = (trendDirection, trendPercentage) => {
  if (trendDirection === 'up') {
    return trendPercentage > 10 ? 'text-green-600' : 'text-green-500';
  } else if (trendDirection === 'down') {
    return trendPercentage < -10 ? 'text-red-600' : 'text-red-500';
  }
  return 'text-gray-500';
};

export const getKPITrendIcon = (trendDirection) => {
  return trendDirection === 'up' ? '↗️' : trendDirection === 'down' ? '↘️' : '→';
};

export const calculateKPIPerformance = (currentValue, targetValue, reverse = false) => {
  const percentage = (currentValue / targetValue) * 100;
  return reverse ? Math.max(0, 200 - percentage) : Math.min(100, percentage);
};

// Export the API service instance
export const biAPIService = new BusinessIntelligenceAPIService();
