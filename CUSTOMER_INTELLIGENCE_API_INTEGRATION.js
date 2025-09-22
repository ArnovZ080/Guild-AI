// Customer Intelligence Agent API Integration
// This file contains the API methods and hooks for the Customer Intelligence Agent

// API Service Extensions for Customer Intelligence
export const CUSTOMER_INTELLIGENCE_API_ENDPOINTS = {
  // Get comprehensive customer analysis
  getCustomerAnalysis: '/customer/analysis',
  
  // Get customer profiles
  getCustomerProfiles: '/customer/profiles',
  
  // Get customer segments
  getCustomerSegments: '/customer/segments',
  
  // Get customer funnel analysis
  getCustomerFunnel: '/customer/funnel',
  
  // Get retention analysis
  getRetentionAnalysis: '/customer/retention',
  
  // Get cross-agent meta KPIs
  getCrossAgentMetaKPIs: '/customer/meta-kpis',
  
  // Create customer segment
  createCustomerSegment: '/customer/create-segment',
  
  // Execute customer actions
  executeCustomerAction: '/customer/execute-action',
  
  // Update customer profile
  updateCustomerProfile: '/customer/update-profile'
};

// Enhanced API Service Class for Customer Intelligence
export class CustomerIntelligenceAPIService {
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

  // Customer Intelligence Methods
  async getCustomerAnalysis() {
    const result = await this.request(CUSTOMER_INTELLIGENCE_API_ENDPOINTS.getCustomerAnalysis);
    return result || this.getMockCustomerAnalysis();
  }

  async getCustomerProfiles(segment = 'all', limit = 50) {
    const result = await this.request(`${CUSTOMER_INTELLIGENCE_API_ENDPOINTS.getCustomerProfiles}?segment=${segment}&limit=${limit}`);
    return result || this.getMockCustomerProfiles(segment, limit);
  }

  async getCustomerSegments() {
    const result = await this.request(CUSTOMER_INTELLIGENCE_API_ENDPOINTS.getCustomerSegments);
    return result || this.getMockCustomerSegments();
  }

  async getCustomerFunnel(period = '30d') {
    const result = await this.request(`${CUSTOMER_INTELLIGENCE_API_ENDPOINTS.getCustomerFunnel}?period=${period}`);
    return result || this.getMockCustomerFunnel(period);
  }

  async getRetentionAnalysis(period = '30d') {
    const result = await this.request(`${CUSTOMER_INTELLIGENCE_API_ENDPOINTS.getRetentionAnalysis}?period=${period}`);
    return result || this.getMockRetentionAnalysis(period);
  }

  async getCrossAgentMetaKPIs() {
    const result = await this.request(CUSTOMER_INTELLIGENCE_API_ENDPOINTS.getCrossAgentMetaKPIs);
    return result || this.getMockCrossAgentMetaKPIs();
  }

  async createCustomerSegment(segmentData) {
    return this.request(CUSTOMER_INTELLIGENCE_API_ENDPOINTS.createCustomerSegment, {
      method: 'POST',
      body: JSON.stringify(segmentData)
    });
  }

  async executeCustomerAction(actionId, actionData = {}) {
    return this.request(CUSTOMER_INTELLIGENCE_API_ENDPOINTS.executeCustomerAction, {
      method: 'POST',
      body: JSON.stringify({ action_id: actionId, ...actionData })
    });
  }

  async updateCustomerProfile(profileId, profileData) {
    return this.request(CUSTOMER_INTELLIGENCE_API_ENDPOINTS.updateCustomerProfile, {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, ...profileData })
    });
  }

  // Mock Data Methods
  getMockCustomerAnalysis() {
    return {
      success: true,
      data: {
        analysis_id: `customer_analysis_${Date.now()}`,
        generated_at: new Date().toISOString(),
        customer_health_score: 78.5,
        overall_customer_satisfaction: "good",
        key_insights: [
          "Customer retention rate improved by 12% this quarter",
          "High-value customer segment shows 95% retention rate",
          "New customer onboarding completion rate is 78%",
          "Customer support response time reduced to 1.8 hours"
        ],
        immediate_actions: [
          "Launch win-back campaign for 45 at-risk customers",
          "Implement VIP program for top 20 customers",
          "Optimize onboarding flow for new customers",
          "Set up automated customer health monitoring"
        ],
        customer_metrics: {
          acquisition_metrics: {
            customer_growth_rate: { current: 15.2, target: 20.0, trend: "up", change: 8.5 },
            customer_acquisition_cost: { current: 85.50, target: 75.0, trend: "down", change: -12.3 },
            funnel_conversion_rate: { current: 18.0, target: 25.0, trend: "up", change: 15.7 }
          },
          retention_metrics: {
            retention_rate: { current: 82.5, target: 85.0, trend: "up", change: 12.0 },
            churn_rate: { current: 12.8, target: 10.0, trend: "down", change: -17.4 },
            customer_lifetime_value: { current: 2850, target: 3200, trend: "up", change: 22.3 }
          },
          satisfaction_metrics: {
            net_promoter_score: { current: 68.5, target: 75.0, trend: "up", change: 9.2 },
            customer_satisfaction: { current: 87.2, target: 90.0, trend: "up", change: 5.8 },
            support_response_time: { current: 1.8, target: 2.0, trend: "down", change: -25.0 }
          }
        },
        customer_segments: {
          high_value_customers: {
            count: 45,
            average_lifetime_value: 8500,
            retention_rate: 95.2,
            growth_potential: "upsell"
          },
          at_risk_customers: {
            count: 28,
            average_lifetime_value: 3200,
            retention_rate: 64.2,
            growth_potential: "retention"
          },
          new_customers: {
            count: 67,
            average_lifetime_value: 1200,
            retention_rate: 78.5,
            growth_potential: "onboarding"
          }
        },
        optimization_opportunities: [
          {
            segment: "At Risk Customers",
            opportunity: "Implement proactive retention program",
            potential_improvement: "Increase retention by 20%",
            implementation_effort: "medium"
          },
          {
            segment: "New Customers",
            opportunity: "Optimize onboarding experience",
            potential_improvement: "Increase activation rate by 15%",
            implementation_effort: "low"
          }
        ]
      }
    };
  }

  getMockCustomerProfiles(segment, limit) {
    const profiles = [];
    const segments = ['high_value', 'at_risk', 'new_customers', 'inactive'];
    
    for (let i = 0; i < Math.min(limit, 50); i++) {
      const customerSegment = segments[i % segments.length];
      if (segment !== 'all' && segment !== customerSegment) continue;
      
      profiles.push({
        customer_id: `customer_${i.toString().padStart(3, '0')}`,
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        customer_segment: customerSegment,
        lifecycle_stage: ['lead', 'prospect', 'trial', 'customer', 'evangelist'][i % 5],
        lifetime_value: 1000 + (i * 50),
        health_score: 60 + (i % 40),
        churn_risk: ['low', 'medium', 'high', 'critical'][i % 4],
        engagement_score: 70 + (i % 30),
        last_activity: new Date(Date.now() - (i % 30) * 24 * 60 * 60 * 1000).toISOString(),
        total_orders: 1 + (i % 20),
        total_spent: 500 + (i * 25),
        support_tickets: i % 10,
        sentiment_score: 0.7 + ((i % 3) * 0.1),
        tags: ['VIP', 'Premium', 'Standard', 'Basic'][i % 4],
        created_at: new Date(Date.now() - (365 - i) * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return {
      success: true,
      data: {
        profiles: profiles,
        total_count: profiles.length,
        segment: segment
      }
    };
  }

  getMockCustomerSegments() {
    return {
      success: true,
      data: {
        segments: [
          {
            segment_id: "segment_high_value_customers",
            name: "High Value Customers",
            criteria: { lifetime_value: ">5000", orders: ">10" },
            customer_count: 45,
            average_lifetime_value: 8500,
            churn_rate: 5.2,
            engagement_level: "high",
            growth_potential: "upsell",
            recommended_actions: [
              "Implement VIP support program",
              "Create exclusive loyalty rewards",
              "Develop premium product offerings",
              "Schedule regular check-ins"
            ],
            created_at: new Date().toISOString()
          },
          {
            segment_id: "segment_at_risk_customers",
            name: "At Risk Customers",
            criteria: { churn_risk: "high", engagement_score: "<60" },
            customer_count: 28,
            average_lifetime_value: 3200,
            churn_rate: 35.8,
            engagement_level: "low",
            growth_potential: "retention",
            recommended_actions: [
              "Send win-back email campaign",
              "Offer special discounts",
              "Assign dedicated success manager",
              "Implement engagement tracking"
            ],
            created_at: new Date().toISOString()
          },
          {
            segment_id: "segment_new_customers",
            name: "New Customers",
            criteria: { lifecycle_stage: "customer", orders: "1-3" },
            customer_count: 67,
            average_lifetime_value: 1200,
            churn_rate: 15.2,
            engagement_level: "medium",
            growth_potential: "onboarding",
            recommended_actions: [
              "Optimize onboarding experience",
              "Send welcome email series",
              "Provide product tutorials",
              "Set up success metrics tracking"
            ],
            created_at: new Date().toISOString()
          },
          {
            segment_id: "segment_inactive_customers",
            name: "Inactive Customers",
            criteria: { last_activity: ">30_days", engagement_score: "<40" },
            customer_count: 18,
            average_lifetime_value: 2800,
            churn_rate: 60.5,
            engagement_level: "low",
            growth_potential: "win_back",
            recommended_actions: [
              "Launch re-engagement campaign",
              "Survey for feedback",
              "Offer reactivation incentives",
              "Analyze inactivity reasons"
            ],
            created_at: new Date().toISOString()
          }
        ]
      }
    };
  }

  getMockCustomerFunnel(period) {
    return {
      success: true,
      data: {
        period: period,
        funnel_analysis: {
          total_leads: 1000,
          funnel_stages: {
            lead: {
              count: 1000,
              conversion_rate: 100,
              drop_off_rate: 0,
              average_time_in_stage: "3 days",
              optimization_opportunities: ["Improve lead qualification", "Enhance initial touchpoints"]
            },
            prospect: {
              count: 600,
              conversion_rate: 60,
              drop_off_rate: 40,
              average_time_in_stage: "5 days",
              optimization_opportunities: ["Improve proposal quality", "Accelerate sales cycle"]
            },
            trial: {
              count: 300,
              conversion_rate: 50,
              drop_off_rate: 50,
              average_time_in_stage: "7 days",
              optimization_opportunities: ["Enhance trial experience", "Provide better onboarding"]
            },
            customer: {
              count: 180,
              conversion_rate: 60,
              drop_off_rate: 40,
              average_time_in_stage: "30 days",
              optimization_opportunities: ["Improve product adoption", "Enhance customer support"]
            },
            evangelist: {
              count: 54,
              conversion_rate: 30,
              drop_off_rate: 70,
              average_time_in_stage: "90 days",
              optimization_opportunities: ["Create referral programs", "Encourage case studies"]
            }
          }
        }
      }
    };
  }

  getMockRetentionAnalysis(period) {
    return {
      success: true,
      data: {
        period: period,
        retention_metrics: {
          retention_rate: { current: 82.5, target: 85.0, trend: "up", change: 12.0 },
          churn_rate: { current: 12.8, target: 10.0, trend: "down", change: -17.4 },
          customer_lifetime_value: { current: 2850, target: 3200, trend: "up", change: 22.3 },
          repeat_purchase_rate: { current: 65.2, target: 70.0, trend: "up", change: 8.7 }
        },
        churn_analysis: {
          total_customers: 200,
          churn_breakdown: {
            critical_risk: 8,
            high_risk: 12,
            medium_risk: 25,
            low_risk: 155
          },
          churn_reasons: [
            { reason: "Price sensitivity", percentage: 35.2 },
            { reason: "Poor onboarding", percentage: 28.7 },
            { reason: "Lack of engagement", percentage: 22.1 },
            { reason: "Better alternatives", percentage: 14.0 }
          ]
        },
        retention_strategies: [
          {
            strategy_id: "retention_001",
            name: "Win-back Campaign",
            target_segment: "inactive_customers",
            expected_impact: "15% reactivation rate",
            implementation_cost: 2500,
            expected_roi: 3.2
          },
          {
            strategy_id: "retention_002",
            name: "VIP Program",
            target_segment: "high_value_customers",
            expected_impact: "5% churn reduction",
            implementation_cost: 5000,
            expected_roi: 4.8
          }
        ]
      }
    };
  }

  getMockCrossAgentMetaKPIs() {
    return {
      success: true,
      data: {
        meta_kpis: [
          {
            meta_kpi_id: "meta_001",
            name: "Agent Accuracy",
            current_value: 92.5,
            target_value: 95.0,
            unit: "percent",
            category: "quality",
            agent_category: "all_agents",
            trend_direction: "up",
            trend_percentage: 3.2,
            status: "good",
            calculation_method: "Percentage of tasks judged as high quality by Judge Agent",
            last_updated: new Date().toISOString(),
            guild_performance_impact: "high"
          },
          {
            meta_kpi_id: "meta_002",
            name: "Agent Coverage",
            current_value: 87.3,
            target_value: 90.0,
            unit: "percent",
            category: "automation",
            agent_category: "all_agents",
            trend_direction: "up",
            trend_percentage: 8.7,
            status: "good",
            calculation_method: "Percentage of business areas handled autonomously by agents",
            last_updated: new Date().toISOString(),
            guild_performance_impact: "high"
          },
          {
            meta_kpi_id: "meta_003",
            name: "Human-in-the-Loop Overrides",
            current_value: 15.8,
            target_value: 10.0,
            unit: "percent",
            category: "automation",
            agent_category: "all_agents",
            trend_direction: "down",
            trend_percentage: -12.5,
            status: "warning",
            calculation_method: "How often users step in to override agent decisions",
            last_updated: new Date().toISOString(),
            guild_performance_impact: "medium"
          },
          {
            meta_kpi_id: "meta_004",
            name: "Workflow Efficiency",
            current_value: 78.5,
            target_value: 85.0,
            unit: "percent",
            category: "performance",
            agent_category: "orchestration",
            trend_direction: "up",
            trend_percentage: 15.2,
            status: "good",
            calculation_method: "Average task completion time vs manual baseline",
            last_updated: new Date().toISOString(),
            guild_performance_impact: "high"
          },
          {
            meta_kpi_id: "meta_005",
            name: "Recommendation Adoption Rate",
            current_value: 72.3,
            target_value: 80.0,
            unit: "percent",
            category: "engagement",
            agent_category: "all_agents",
            trend_direction: "up",
            trend_percentage: 18.7,
            status: "good",
            calculation_method: "How often users follow agent suggestions",
            last_updated: new Date().toISOString(),
            guild_performance_impact: "medium"
          },
          {
            meta_kpi_id: "meta_006",
            name: "Agent ROI Contribution",
            current_value: 4.2,
            target_value: 5.0,
            unit: "ratio",
            category: "financial",
            agent_category: "all_agents",
            trend_direction: "up",
            trend_percentage: 22.8,
            status: "good",
            calculation_method: "Revenue/efficiency attributed to each agent category",
            last_updated: new Date().toISOString(),
            guild_performance_impact: "high"
          },
          {
            meta_kpi_id: "meta_007",
            name: "Error Detection & Correction Rate",
            current_value: 89.7,
            target_value: 95.0,
            unit: "percent",
            category: "quality",
            agent_category: "judge_orchestrator",
            trend_direction: "up",
            trend_percentage: 6.3,
            status: "good",
            calculation_method: "Judge Agent + Orchestrator catching and correcting issues",
            last_updated: new Date().toISOString(),
            guild_performance_impact: "high"
          }
        ]
      }
    };
  }
}

// React Hooks for Customer Intelligence
export const useCustomerAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const apiService = new CustomerIntelligenceAPIService();

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCustomerAnalysis();
      setAnalysis(data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch customer analysis:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
    // Refresh every 20 minutes for customer data
    const interval = setInterval(fetchAnalysis, 1200000);
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

export const useCustomerProfiles = (segment = 'all', limit = 50) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new CustomerIntelligenceAPIService();

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCustomerProfiles(segment, limit);
      setProfiles(data?.data?.profiles || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch customer profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [segment, limit]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, error, refetch: fetchProfiles };
};

export const useCustomerSegments = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new CustomerIntelligenceAPIService();

  const fetchSegments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCustomerSegments();
      setSegments(data?.data?.segments || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch customer segments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  return { segments, loading, error, refetch: fetchSegments };
};

export const useCustomerFunnel = (period = '30d') => {
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new CustomerIntelligenceAPIService();

  const fetchFunnel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCustomerFunnel(period);
      setFunnel(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch customer funnel:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchFunnel();
  }, [fetchFunnel]);

  return { funnel, loading, error, refetch: fetchFunnel };
};

export const useRetentionAnalysis = (period = '30d') => {
  const [retention, setRetention] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new CustomerIntelligenceAPIService();

  const fetchRetention = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRetentionAnalysis(period);
      setRetention(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch retention analysis:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchRetention();
  }, [fetchRetention]);

  return { retention, loading, error, refetch: fetchRetention };
};

export const useCrossAgentMetaKPIs = () => {
  const [metaKPIs, setMetaKPIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new CustomerIntelligenceAPIService();

  const fetchMetaKPIs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCrossAgentMetaKPIs();
      setMetaKPIs(data?.data?.meta_kpis || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch cross-agent meta KPIs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetaKPIs();
    // Refresh every 10 minutes for meta KPIs
    const interval = setInterval(fetchMetaKPIs, 600000);
    return () => clearInterval(interval);
  }, [fetchMetaKPIs]);

  return { metaKPIs, loading, error, refetch: fetchMetaKPIs };
};

export const useCustomerActions = () => {
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new CustomerIntelligenceAPIService();

  const executeAction = useCallback(async (actionId, actionData = {}) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.executeCustomerAction(actionId, actionData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  const createSegment = useCallback(async (segmentData) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.createCustomerSegment(segmentData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileId, profileData) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.updateCustomerProfile(profileId, profileData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  return { executeAction, createSegment, updateProfile, executing, error };
};

// Utility Functions
export const formatCustomerLTV = (ltv) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(ltv);
};

export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

export const getChurnRiskColor = (risk) => {
  switch (risk.toLowerCase()) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'critical': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getSegmentColor = (segment) => {
  switch (segment.toLowerCase()) {
    case 'high_value': return 'text-purple-600 bg-purple-100';
    case 'at_risk': return 'text-red-600 bg-red-100';
    case 'new_customers': return 'text-blue-600 bg-blue-100';
    case 'inactive': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const calculateCustomerHealthScore = (engagement, satisfaction, ltv, churnRisk) => {
  const weights = { engagement: 0.3, satisfaction: 0.3, ltv: 0.2, churnRisk: 0.2 };
  const churnRiskScore = churnRisk === 'low' ? 100 : churnRisk === 'medium' ? 75 : churnRisk === 'high' ? 50 : 25;
  
  return Math.round(
    (engagement * weights.engagement) +
    (satisfaction * weights.satisfaction) +
    (Math.min(ltv / 1000, 100) * weights.ltv) +
    (churnRiskScore * weights.churnRisk)
  );
};

export const calculateRetentionRate = (customersAtStart, customersAtEnd, newCustomers) => {
  if (customersAtStart === 0) return 0;
  return ((customersAtEnd - newCustomers) / customersAtStart * 100).toFixed(1);
};

export const calculateChurnRate = (lostCustomers, totalCustomers) => {
  if (totalCustomers === 0) return 0;
  return (lostCustomers / totalCustomers * 100).toFixed(1);
};

export const calculateCustomerLifetimeValue = (averageOrderValue, purchaseFrequency, customerLifespan, grossMargin) => {
  return (averageOrderValue * purchaseFrequency * customerLifespan * grossMargin).toFixed(2);
};

export const calculateNetPromoterScore = (promoters, detractors, totalResponses) => {
  if (totalResponses === 0) return 0;
  const promoterPercentage = (promoters / totalResponses) * 100;
  const detractorPercentage = (detractors / totalResponses) * 100;
  return (promoterPercentage - detractorPercentage).toFixed(1);
};

// Export the API service instance
export const customerAPIService = new CustomerIntelligenceAPIService();
