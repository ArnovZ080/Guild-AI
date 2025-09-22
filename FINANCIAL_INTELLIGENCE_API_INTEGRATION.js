// Financial Intelligence Agent API Integration
// This file contains the API methods and hooks for the Financial Intelligence Agent

// API Service Extensions for Financial Intelligence
export const FINANCIAL_INTELLIGENCE_API_ENDPOINTS = {
  // Get comprehensive financial analysis
  getFinancialAnalysis: '/financial/analysis',
  
  // Get cash flow projections
  getCashFlowProjections: '/financial/cash-flow-projections',
  
  // Get financial risks
  getFinancialRisks: '/financial/risks',
  
  // Get expense breakdown
  getExpenseBreakdown: '/financial/expense-breakdown',
  
  // Get revenue analysis
  getRevenueAnalysis: '/financial/revenue-analysis',
  
  // Execute financial actions
  executeFinancialAction: '/financial/execute-action',
  
  // Update financial targets
  updateFinancialTargets: '/financial/update-targets',
  
  // Get financial forecasts
  getFinancialForecasts: '/financial/forecasts'
};

// Enhanced API Service Class for Financial Intelligence
export class FinancialIntelligenceAPIService {
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

  // Financial Intelligence Methods
  async getFinancialAnalysis() {
    const result = await this.request(FINANCIAL_INTELLIGENCE_API_ENDPOINTS.getFinancialAnalysis);
    return result || this.getMockFinancialAnalysis();
  }

  async getCashFlowProjections(scenario = 'expected', period = '30d') {
    const result = await this.request(`${FINANCIAL_INTELLIGENCE_API_ENDPOINTS.getCashFlowProjections}?scenario=${scenario}&period=${period}`);
    return result || this.getMockCashFlowProjections(scenario, period);
  }

  async getFinancialRisks() {
    const result = await this.request(FINANCIAL_INTELLIGENCE_API_ENDPOINTS.getFinancialRisks);
    return result || this.getMockFinancialRisks();
  }

  async getExpenseBreakdown(period = '30d') {
    const result = await this.request(`${FINANCIAL_INTELLIGENCE_API_ENDPOINTS.getExpenseBreakdown}?period=${period}`);
    return result || this.getMockExpenseBreakdown(period);
  }

  async getRevenueAnalysis(period = '30d') {
    const result = await this.request(`${FINANCIAL_INTELLIGENCE_API_ENDPOINTS.getRevenueAnalysis}?period=${period}`);
    return result || this.getMockRevenueAnalysis(period);
  }

  async executeFinancialAction(actionId, actionData = {}) {
    return this.request(FINANCIAL_INTELLIGENCE_API_ENDPOINTS.executeFinancialAction, {
      method: 'POST',
      body: JSON.stringify({ action_id: actionId, ...actionData })
    });
  }

  async updateFinancialTargets(targetUpdates) {
    return this.request(FINANCIAL_INTELLIGENCE_API_ENDPOINTS.updateFinancialTargets, {
      method: 'POST',
      body: JSON.stringify(targetUpdates)
    });
  }

  async getFinancialForecasts(period = '90d') {
    const result = await this.request(`${FINANCIAL_INTELLIGENCE_API_ENDPOINTS.getFinancialForecasts}?period=${period}`);
    return result || this.getMockFinancialForecasts(period);
  }

  // Mock Data Methods
  getMockFinancialAnalysis() {
    return {
      success: true,
      data: {
        analysis_id: `financial_analysis_${Date.now()}`,
        generated_at: new Date().toISOString(),
        financial_health_score: 75.5,
        cash_flow_status: "stable",
        key_insights: [
          "Revenue growth is steady at 15% month-over-month",
          "Cash runway is adequate at 8.5 months",
          "Ad spend efficiency needs improvement",
          "Expense optimization opportunities identified"
        ],
        immediate_actions: [
          "Optimize ad spend allocation across platforms",
          "Implement expense approval workflow for amounts >$5,000",
          "Set up automated invoice reminders for overdue accounts"
        ],
        financial_metrics: {
          revenue_metrics: {
            mrr: { current: 45000, target: 50000, trend: "up", change: 15.2 },
            arr: { current: 540000, target: 600000, trend: "up", change: 12.8 },
            growth_rate: { current: 15.2, target: 20.0, trend: "up", change: 2.1 }
          },
          profitability_metrics: {
            gross_margin: { current: 68.5, target: 70.0, trend: "up", change: 1.5 },
            net_profit_margin: { current: 26.7, target: 30.0, trend: "up", change: 2.1 },
            ebitda: { current: 18000, target: 20000, trend: "up", change: 8.5 }
          },
          cash_flow_metrics: {
            operating_cash_flow: { current: 32000, target: 35000, trend: "stable", change: 5.2 },
            cash_runway: { current: 8.5, target: 12.0, trend: "down", change: -1.2 },
            burn_rate: { current: 8500, target: 7000, trend: "up", change: 12.0 }
          }
        },
        risk_assessment: {
          high_risk_items: ["Cash runway below 6 months"],
          medium_risk_items: ["Ad spend efficiency declining"],
          low_risk_items: ["Seasonal revenue fluctuations"]
        },
        opportunities: [
          "Upsell existing customers for 25% revenue increase",
          "Optimize ad spend for 20% cost reduction",
          "Automate expense management for efficiency gains"
        ]
      }
    };
  }

  getMockCashFlowProjections(scenario, period) {
    const baseInflow = 45000;
    const baseOutflow = 28000;
    
    let multiplier = 1.0;
    let confidence = 0.8;
    
    switch (scenario) {
      case 'best_case':
        multiplier = 1.15;
        confidence = 0.7;
        break;
      case 'worst_case':
        multiplier = 0.95;
        confidence = 0.6;
        break;
      case 'expected':
      default:
        multiplier = 1.05;
        confidence = 0.8;
        break;
    }

    return {
      success: true,
      data: {
        scenario_type: scenario,
        period: period,
        projections: [
          {
            projection_id: `proj_${scenario}_${period}`,
            period: period,
            projected_cash_inflow: baseInflow * multiplier,
            projected_cash_outflow: baseOutflow * (scenario === 'worst_case' ? 1.1 : 1.0),
            projected_net_cash_flow: (baseInflow * multiplier) - (baseOutflow * (scenario === 'worst_case' ? 1.1 : 1.0)),
            projected_cash_balance: 32000 + ((baseInflow * multiplier) - (baseOutflow * (scenario === 'worst_case' ? 1.1 : 1.0))),
            confidence_level: confidence,
            scenario_type: scenario,
            assumptions: {
              revenue_growth: multiplier - 1,
              expense_growth: scenario === 'worst_case' ? 0.1 : 0.0,
              market_conditions: scenario
            },
            last_updated: new Date().toISOString()
          }
        ]
      }
    };
  }

  getMockFinancialRisks() {
    return {
      success: true,
      data: {
        risks: [
          {
            risk_id: "risk_001",
            risk_type: "cash_runway",
            severity: "high",
            description: "Cash runway is 8.5 months, below recommended 12-month minimum",
            impact_estimate: 255000, // 8.5 months * 30k monthly burn
            probability: 0.7,
            mitigation_actions: [
              "Reduce operating expenses by 15%",
              "Accelerate revenue collection",
              "Negotiate extended payment terms with vendors"
            ],
            detection_date: new Date().toISOString(),
            escalation_threshold: 6.0
          },
          {
            risk_id: "risk_002",
            risk_type: "ad_spend_efficiency",
            severity: "medium",
            description: "Ad spend ROI declining across Meta Ads platform",
            impact_estimate: 12000, // Monthly inefficient spend
            probability: 0.6,
            mitigation_actions: [
              "Pause underperforming ad campaigns",
              "Reallocate budget to higher ROI channels",
              "Optimize ad targeting and creative"
            ],
            detection_date: new Date().toISOString()
          }
        ]
      }
    };
  }

  getMockExpenseBreakdown(period) {
    return {
      success: true,
      data: {
        period: period,
        total_expenses: 28000,
        expense_breakdown: [
          {
            category: "ad_spend",
            amount: 8500,
            percentage: 30.4,
            trend: "up",
            change: 18.0,
            target: 7000,
            efficiency_score: 65
          },
          {
            category: "payroll",
            amount: 12000,
            percentage: 42.9,
            trend: "up",
            change: 3.0,
            target: 12000,
            efficiency_score: 95
          },
          {
            category: "software_tools",
            amount: 2800,
            percentage: 10.0,
            trend: "up",
            change: 5.0,
            target: 2500,
            efficiency_score: 80
          },
          {
            category: "operations",
            amount: 4700,
            percentage: 16.7,
            trend: "down",
            change: -2.0,
            target: 5000,
            efficiency_score: 90
          }
        ],
        optimization_opportunities: [
          {
            category: "ad_spend",
            potential_savings: 1500,
            recommendation: "Reduce Meta Ads spend and reallocate to Google Ads for 25% better ROI",
            implementation_effort: "medium"
          },
          {
            category: "software_tools",
            potential_savings: 400,
            recommendation: "Consolidate overlapping tools and negotiate better rates",
            implementation_effort: "low"
          }
        ]
      }
    };
  }

  getMockRevenueAnalysis(period) {
    return {
      success: true,
      data: {
        period: period,
        total_revenue: 45000,
        revenue_breakdown: [
          {
            source: "subscription_revenue",
            amount: 32000,
            percentage: 71.1,
            trend: "up",
            change: 16.0,
            target: 35000,
            growth_rate: 18.5
          },
          {
            source: "one_time_sales",
            amount: 8500,
            percentage: 18.9,
            trend: "up",
            change: 12.0,
            target: 10000,
            growth_rate: 14.2
          },
          {
            source: "services_revenue",
            amount: 4500,
            percentage: 10.0,
            trend: "stable",
            change: 2.0,
            target: 5000,
            growth_rate: 8.7
          }
        ],
        customer_metrics: {
          new_customers: 45,
          customer_acquisition_cost: 188.89,
          customer_lifetime_value: 3000,
          churn_rate: 3.2,
          net_promoter_score: 54
        },
        growth_opportunities: [
          {
            opportunity: "upsell_existing_customers",
            potential_revenue: 11250, // 25% increase
            implementation_effort: "medium",
            timeline: "3 months"
          },
          {
            opportunity: "expand_services",
            potential_revenue: 9000, // 200% increase in services
            implementation_effort: "high",
            timeline: "6 months"
          }
        ]
      }
    };
  }

  getMockFinancialForecasts(period) {
    const periods = {
      '30d': { multiplier: 1.05, expenses_mult: 1.02 },
      '60d': { multiplier: 1.08, expenses_mult: 1.05 },
      '90d': { multiplier: 1.12, expenses_mult: 1.08 },
      '6m': { multiplier: 1.25, expenses_mult: 1.15 }
    };

    const config = periods[period] || periods['90d'];

    return {
      success: true,
      data: {
        period: period,
        forecasts: [
          {
            forecast_id: `forecast_${period}`,
            period: period,
            projected_revenue: 45000 * config.multiplier,
            projected_expenses: 28000 * config.expenses_mult,
            projected_net_cash_flow: (45000 * config.multiplier) - (28000 * config.expenses_mult),
            projected_cash_balance: 32000 + ((45000 * config.multiplier) - (28000 * config.expenses_mult)),
            confidence_level: 0.75,
            assumptions: {
              revenue_growth: config.multiplier - 1,
              expense_growth: config.expenses_mult - 1,
              market_conditions: "stable"
            },
            last_updated: new Date().toISOString()
          }
        ],
        scenario_analysis: {
          best_case: {
            revenue_multiplier: config.multiplier * 1.1,
            expense_multiplier: config.expenses_mult * 0.95,
            probability: 0.25
          },
          expected: {
            revenue_multiplier: config.multiplier,
            expense_multiplier: config.expenses_mult,
            probability: 0.5
          },
          worst_case: {
            revenue_multiplier: config.multiplier * 0.9,
            expense_multiplier: config.expenses_mult * 1.1,
            probability: 0.25
          }
        }
      }
    };
  }
}

// React Hooks for Financial Intelligence
export const useFinancialAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const apiService = new FinancialIntelligenceAPIService();

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getFinancialAnalysis();
      setAnalysis(data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch financial analysis:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
    // Refresh every 10 minutes for financial data
    const interval = setInterval(fetchAnalysis, 600000);
    return () => clearInterval(interval);
  }, [fetchAnalysis]);

  return { 
    analysis, 
    loading, 
    error, 
    lastUpdated, 
    refetch: fetchAnalysis 
  };
};

export const useCashFlowProjections = (scenario = 'expected', period = '30d') => {
  const [projections, setProjections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new FinancialIntelligenceAPIService();

  const fetchProjections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCashFlowProjections(scenario, period);
      setProjections(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch cash flow projections:', err);
    } finally {
      setLoading(false);
    }
  }, [scenario, period]);

  useEffect(() => {
    fetchProjections();
  }, [fetchProjections]);

  return { projections, loading, error, refetch: fetchProjections };
};

export const useFinancialRisks = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new FinancialIntelligenceAPIService();

  const fetchRisks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getFinancialRisks();
      setRisks(data?.data?.risks || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch financial risks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRisks();
    // Refresh every 5 minutes for risk monitoring
    const interval = setInterval(fetchRisks, 300000);
    return () => clearInterval(interval);
  }, [fetchRisks]);

  return { risks, loading, error, refetch: fetchRisks };
};

export const useExpenseBreakdown = (period = '30d') => {
  const [expenses, setExpenses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new FinancialIntelligenceAPIService();

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getExpenseBreakdown(period);
      setExpenses(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch expense breakdown:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return { expenses, loading, error, refetch: fetchExpenses };
};

export const useRevenueAnalysis = (period = '30d') => {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new FinancialIntelligenceAPIService();

  const fetchRevenue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRevenueAnalysis(period);
      setRevenue(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch revenue analysis:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  return { revenue, loading, error, refetch: fetchRevenue };
};

export const useFinancialActions = () => {
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new FinancialIntelligenceAPIService();

  const executeAction = useCallback(async (actionId, actionData = {}) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.executeFinancialAction(actionId, actionData);
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
export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

export const getFinancialHealthColor = (score) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

export const getRiskSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return 'text-red-600 bg-red-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'low': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const calculateCashRunway = (cashBalance, monthlyBurnRate) => {
  if (monthlyBurnRate <= 0) return Infinity;
  return cashBalance / monthlyBurnRate;
};

export const calculateBurnRate = (expenses, timePeriod = 1) => {
  return expenses / timePeriod;
};

// Export the API service instance
export const financialAPIService = new FinancialIntelligenceAPIService();
