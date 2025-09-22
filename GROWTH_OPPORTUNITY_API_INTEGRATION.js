// Growth Opportunity Agent API Integration
// This file contains the API methods and hooks for the Growth Opportunity Agent

// API Service Extensions for Growth Opportunity Intelligence
export const GROWTH_OPPORTUNITY_API_ENDPOINTS = {
  // Get comprehensive growth analysis
  getGrowthAnalysis: '/growth/analysis',
  
  // Get opportunity pipeline
  getOpportunityPipeline: '/growth/pipeline',
  
  // Get growth opportunities
  getGrowthOpportunities: '/growth/opportunities',
  
  // Get impact matrix data
  getImpactMatrix: '/growth/impact-matrix',
  
  // Get growth tracking data
  getGrowthTracking: '/growth/tracking',
  
  // Accept opportunity
  acceptOpportunity: '/growth/accept-opportunity',
  
  // Decline opportunity
  declineOpportunity: '/growth/decline-opportunity',
  
  // Create new opportunity
  createOpportunity: '/growth/create-opportunity',
  
  // Update opportunity
  updateOpportunity: '/growth/update-opportunity',
  
  // Get growth KPIs
  getGrowthKPIs: '/growth/kpis'
};

// Enhanced API Service Class for Growth Opportunity Intelligence
export class GrowthOpportunityAPIService {
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

  // Growth Opportunity Methods
  async getGrowthAnalysis() {
    const result = await this.request(GROWTH_OPPORTUNITY_API_ENDPOINTS.getGrowthAnalysis);
    return result || this.getMockGrowthAnalysis();
  }

  async getOpportunityPipeline() {
    const result = await this.request(GROWTH_OPPORTUNITY_API_ENDPOINTS.getOpportunityPipeline);
    return result || this.getMockOpportunityPipeline();
  }

  async getGrowthOpportunities(filter = 'all', sortBy = 'impact') {
    const result = await this.request(`${GROWTH_OPPORTUNITY_API_ENDPOINTS.getGrowthOpportunities}?filter=${filter}&sort=${sortBy}`);
    return result || this.getMockGrowthOpportunities(filter, sortBy);
  }

  async getImpactMatrix() {
    const result = await this.request(GROWTH_OPPORTUNITY_API_ENDPOINTS.getImpactMatrix);
    return result || this.getMockImpactMatrix();
  }

  async getGrowthTracking() {
    const result = await this.request(GROWTH_OPPORTUNITY_API_ENDPOINTS.getGrowthTracking);
    return result || this.getMockGrowthTracking();
  }

  async acceptOpportunity(opportunityId, acceptanceData = {}) {
    return this.request(GROWTH_OPPORTUNITY_API_ENDPOINTS.acceptOpportunity, {
      method: 'POST',
      body: JSON.stringify({ opportunity_id: opportunityId, ...acceptanceData })
    });
  }

  async declineOpportunity(opportunityId, declineReason = '') {
    return this.request(GROWTH_OPPORTUNITY_API_ENDPOINTS.declineOpportunity, {
      method: 'POST',
      body: JSON.stringify({ opportunity_id: opportunityId, reason: declineReason })
    });
  }

  async createOpportunity(opportunityData) {
    return this.request(GROWTH_OPPORTUNITY_API_ENDPOINTS.createOpportunity, {
      method: 'POST',
      body: JSON.stringify(opportunityData)
    });
  }

  async updateOpportunity(opportunityId, opportunityData) {
    return this.request(GROWTH_OPPORTUNITY_API_ENDPOINTS.updateOpportunity, {
      method: 'POST',
      body: JSON.stringify({ opportunity_id: opportunityId, ...opportunityData })
    });
  }

  async getGrowthKPIs() {
    const result = await this.request(GROWTH_OPPORTUNITY_API_ENDPOINTS.getGrowthKPIs);
    return result || this.getMockGrowthKPIs();
  }

  // Mock Data Methods
  getMockGrowthAnalysis() {
    return {
      success: true,
      data: {
        analysis_id: `growth_analysis_${Date.now()}`,
        generated_at: new Date().toISOString(),
        opportunity_pipeline_health: 82.5,
        overall_growth_potential: "excellent",
        key_insights: [
          "5 high-impact opportunities identified with combined potential of $675K revenue",
          "Quick wins represent 40% of opportunities with average 4.4x ROI",
          "Strategic initiatives show strong cross-agent validation and market demand",
          "Opportunity pipeline balanced across revenue growth, efficiency, and market expansion"
        ],
        immediate_actions: [
          "Prioritize 'Optimize Ad Spend Allocation' for immediate implementation",
          "Begin planning for 'Automate Customer Onboarding' quick win",
          "Initiate market research for 'Expand to German Market' strategic opportunity",
          "Set up tracking system for implemented opportunities"
        ],
        opportunity_pipeline: {
          total_opportunities: 5,
          opportunities_by_type: {
            quick_win: 2,
            strategic: 2,
            long_term: 1
          },
          opportunities_by_status: {
            discovered: 0,
            evaluated: 0,
            prioritized: 5,
            presented: 0,
            accepted: 0,
            implemented: 0
          },
          acceptance_rate: 0.0,
          average_roi: 4.9,
          total_potential_revenue: 675000,
          total_implementation_cost: 137000
        },
        opportunity_quality_metrics: {
          average_impact_score: 7.8,
          average_effort_score: 5.9,
          average_confidence_score: 7.9,
          cross_agent_validation_rate: 85.0,
          high_quality_opportunities: 3
        },
        strategic_alignment: {
          revenue_growth_alignment: 80.0,
          cost_reduction_alignment: 60.0,
          efficiency_improvement_alignment: 70.0,
          market_expansion_alignment: 90.0,
          overall_strategic_fit: 75.0
        },
        top_opportunities: [
          {
            title: "Launch Premium Tier",
            impact_effort_ratio: 1.38,
            potential_revenue: 180000,
            roi_estimate: 7.2,
            timeframe: "3-6_months",
            confidence_score: 8.0
          },
          {
            title: "Partner with Enterprise Integrators",
            impact_effort_ratio: 0.94,
            potential_revenue: 300000,
            roi_estimate: 5.0,
            timeframe: "12+_months",
            confidence_score: 6.5
          },
          {
            title: "Expand to German Market",
            impact_effort_ratio: 1.21,
            potential_revenue: 125000,
            roi_estimate: 3.6,
            timeframe: "6-12_months",
            confidence_score: 7.5
          }
        ],
        growth_attribution: {
          revenue_opportunities: 3,
          cost_saving_opportunities: 1,
          efficiency_opportunities: 1,
          market_expansion_opportunities: 2,
          estimated_annual_growth_impact: 45.2
        }
      }
    };
  }

  getMockOpportunityPipeline() {
    return {
      success: true,
      data: {
        pipeline_id: `pipeline_${Date.now()}`,
        period: "current_month",
        total_opportunities: 5,
        opportunities_by_type: {
          quick_win: 2,
          strategic: 2,
          long_term: 1
        },
        opportunities_by_status: {
          discovered: 0,
          evaluated: 0,
          prioritized: 5,
          presented: 0,
          accepted: 0,
          declined: 0,
          implemented: 0,
          completed: 0
        },
        acceptance_rate: 0.0,
        average_roi: 4.9,
        total_potential_revenue: 675000,
        total_implementation_cost: 137000,
        quality_score: 82.5,
        created_at: new Date().toISOString()
      }
    };
  }

  getMockGrowthOpportunities(filter, sortBy) {
    const opportunities = [
      {
        opportunity_id: "opp_001",
        title: "Launch Premium Tier",
        description: "Introduce premium subscription tier with advanced features based on customer demand analysis",
        category: "revenue_growth",
        opportunity_type: "strategic",
        impact_score: 9.0,
        effort_score: 6.5,
        confidence_score: 8.0,
        timeframe: "3-6_months",
        potential_revenue: 180000,
        implementation_cost: 25000,
        roi_estimate: 7.2,
        resource_requirements: {
          time_required: "13 weeks",
          skills_needed: ["product_development", "market_research", "implementation"],
          budget_required: 25000
        },
        dependencies: [],
        risks: ["Market competition", "Resource constraints", "Timeline delays"],
        mitigation_plans: ["Conduct thorough market research", "Secure adequate resources", "Build buffer time"],
        cross_agent_validation: {
          financial_validation: "approved",
          customer_validation: "positive_demand_signals",
          content_validation: "marketing_feasible",
          judge_validation: "high_quality_opportunity"
        },
        status: "prioritized",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        last_updated: new Date().toISOString()
      },
      {
        opportunity_id: "opp_002",
        title: "Automate Customer Onboarding",
        description: "Implement automated onboarding flow to reduce manual setup time by 70% and improve conversion rates",
        category: "efficiency",
        opportunity_type: "quick_win",
        impact_score: 7.0,
        effort_score: 4.5,
        confidence_score: 8.5,
        timeframe: "1-3_months",
        potential_revenue: 45000,
        implementation_cost: 12000,
        roi_estimate: 3.8,
        resource_requirements: {
          time_required: "9 weeks",
          skills_needed: ["automation", "user_experience", "implementation"],
          budget_required: 12000
        },
        dependencies: [],
        risks: ["Technical complexity", "User adoption", "Integration challenges"],
        mitigation_plans: ["Pilot with small user group", "Provide training materials", "Test integrations thoroughly"],
        cross_agent_validation: {
          financial_validation: "approved",
          customer_validation: "positive_demand_signals",
          content_validation: "not_applicable",
          judge_validation: "high_quality_opportunity"
        },
        status: "prioritized",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        last_updated: new Date().toISOString()
      },
      {
        opportunity_id: "opp_003",
        title: "Expand to German Market",
        description: "Launch localized version of product for German-speaking markets with estimated 2.5M potential customers",
        category: "market_expansion",
        opportunity_type: "strategic",
        impact_score: 8.5,
        effort_score: 7.0,
        confidence_score: 7.5,
        timeframe: "6-12_months",
        potential_revenue: 125000,
        implementation_cost: 35000,
        roi_estimate: 3.6,
        resource_requirements: {
          time_required: "14 weeks",
          skills_needed: ["internationalization", "market_research", "localization"],
          budget_required: 35000
        },
        dependencies: ["Market research completion", "Legal compliance review"],
        risks: ["Regulatory compliance", "Cultural adaptation", "Competition"],
        mitigation_plans: ["Engage local legal counsel", "Conduct cultural research", "Analyze competitive landscape"],
        cross_agent_validation: {
          financial_validation: "requires_budget_approval",
          customer_validation: "positive_demand_signals",
          content_validation: "marketing_feasible",
          judge_validation: "moderate_quality_opportunity"
        },
        status: "prioritized",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        last_updated: new Date().toISOString()
      },
      {
        opportunity_id: "opp_004",
        title: "Optimize Ad Spend Allocation",
        description: "Reallocate advertising budget from low-performing channels to high-ROI platforms",
        category: "cost_reduction",
        opportunity_type: "quick_win",
        impact_score: 6.5,
        effort_score: 3.0,
        confidence_score: 9.0,
        timeframe: "immediate",
        potential_revenue: 25000,
        implementation_cost: 5000,
        roi_estimate: 5.0,
        resource_requirements: {
          time_required: "6 weeks",
          skills_needed: ["digital_marketing", "analytics", "optimization"],
          budget_required: 5000
        },
        dependencies: [],
        risks: ["Performance fluctuation", "Learning curve", "Budget constraints"],
        mitigation_plans: ["Start with small budget reallocation", "Monitor performance closely", "Maintain backup channels"],
        cross_agent_validation: {
          financial_validation: "approved",
          customer_validation: "neutral_impact",
          content_validation: "marketing_feasible",
          judge_validation: "high_quality_opportunity"
        },
        status: "prioritized",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        last_updated: new Date().toISOString()
      },
      {
        opportunity_id: "opp_005",
        title: "Partner with Enterprise Integrators",
        description: "Form strategic partnerships with enterprise system integrators for B2B market expansion",
        category: "market_expansion",
        opportunity_type: "long_term",
        impact_score: 8.0,
        effort_score: 8.5,
        confidence_score: 6.5,
        timeframe: "12+_months",
        potential_revenue: 300000,
        implementation_cost: 60000,
        roi_estimate: 5.0,
        resource_requirements: {
          time_required: "17 weeks",
          skills_needed: ["partnership_development", "enterprise_sales", "integration"],
          budget_required: 60000
        },
        dependencies: ["Enterprise product features", "Partnership agreements"],
        risks: ["Long sales cycles", "High resource requirements", "Market uncertainty"],
        mitigation_plans: ["Develop enterprise features first", "Start with smaller partners", "Conduct market validation"],
        cross_agent_validation: {
          financial_validation: "requires_budget_approval",
          customer_validation: "positive_demand_signals",
          content_validation: "marketing_feasible",
          judge_validation: "moderate_quality_opportunity"
        },
        status: "prioritized",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        last_updated: new Date().toISOString()
      }
    ];

    // Apply filtering
    let filteredOpportunities = opportunities;
    if (filter !== 'all') {
      if (['quick_win', 'strategic', 'long_term'].includes(filter)) {
        filteredOpportunities = opportunities.filter(opp => opp.opportunity_type === filter);
      } else {
        filteredOpportunities = opportunities.filter(opp => opp.category === filter);
      }
    }

    // Apply sorting
    filteredOpportunities.sort((a, b) => {
      switch (sortBy) {
        case 'impact':
          return b.impact_score - a.impact_score;
        case 'roi':
          return b.roi_estimate - a.roi_estimate;
        case 'revenue':
          return b.potential_revenue - a.potential_revenue;
        case 'confidence':
          return b.confidence_score - a.confidence_score;
        default:
          return 0;
      }
    });

    return {
      success: true,
      data: {
        opportunities: filteredOpportunities,
        total_count: filteredOpportunities.length,
        filter: filter,
        sort_by: sortBy
      }
    };
  }

  getMockImpactMatrix() {
    return {
      success: true,
      data: {
        matrix_data: [
          { x: 1, y: 1, label: 'Fill-ins', count: 0, color: 'bg-gray-200' },
          { x: 1, y: 5, label: 'Quick Wins', count: 2, color: 'bg-green-200' },
          { x: 1, y: 9, label: 'Major Projects', count: 0, color: 'bg-blue-200' },
          { x: 5, y: 1, label: 'Thankless Tasks', count: 0, color: 'bg-red-200' },
          { x: 5, y: 5, label: 'Supporting Projects', count: 0, color: 'bg-yellow-200' },
          { x: 5, y: 9, label: 'Strategic Initiatives', count: 2, color: 'bg-purple-200' },
          { x: 9, y: 1, label: 'Questionable', count: 0, color: 'bg-orange-200' },
          { x: 9, y: 5, label: 'Overtime', count: 0, color: 'bg-pink-200' },
          { x: 9, y: 9, label: 'Long-term Bets', count: 1, color: 'bg-indigo-200' }
        ],
        opportunity_distribution: {
          quick_wins: 2,
          strategic_initiatives: 2,
          long_term_bets: 1,
          fill_ins: 0
        }
      }
    };
  }

  getMockGrowthTracking() {
    return {
      success: true,
      data: {
        growth_attribution: {
          revenue_opportunities: 3,
          cost_saving_opportunities: 1,
          efficiency_opportunities: 1,
          market_expansion_opportunities: 2
        },
        strategic_alignment: {
          revenue_growth_alignment: 80.0,
          cost_reduction_alignment: 60.0,
          efficiency_improvement_alignment: 70.0,
          market_expansion_alignment: 90.0,
          overall_strategic_fit: 75.0
        },
        execution_metrics: {
          opportunities_in_research: 0,
          opportunities_in_planning: 0,
          opportunities_ready_to_implement: 5,
          opportunities_active: 0,
          opportunities_completed: 0
        },
        success_metrics: {
          opportunity_success_rate: 0.0,
          average_time_to_execution: 0,
          roi_achieved_vs_predicted: 0.0
        }
      }
    };
  }

  getMockGrowthKPIs() {
    return {
      success: true,
      data: {
        kpis: [
          {
            kpi_id: "opp_pipeline_001",
            name: "Opportunities Identified",
            current_value: 5.0,
            previous_value: 3.0,
            target_value: 8.0,
            unit: "opportunities/month",
            category: "pipeline",
            opportunity_type: "all",
            trend_direction: "up",
            trend_percentage: 66.7,
            status: "good",
            calculation_method: "Number of opportunities identified per month",
            data_sources: ["market_analysis", "internal_data_mining", "cross_agent_insights"],
            last_updated: new Date().toISOString(),
            business_impact: "high",
            growth_contribution: "revenue"
          },
          {
            kpi_id: "opp_acceptance_001",
            name: "Opportunity Acceptance Rate",
            current_value: 0.0,
            previous_value: 25.0,
            target_value: 40.0,
            unit: "percent",
            category: "pipeline",
            opportunity_type: "all",
            trend_direction: "down",
            trend_percentage: -100.0,
            status: "critical",
            calculation_method: "Accepted opportunities / Total opportunities presented",
            data_sources: ["user_decisions", "opportunity_tracking"],
            last_updated: new Date().toISOString(),
            business_impact: "medium",
            growth_contribution: "efficiency"
          },
          {
            kpi_id: "opp_roi_001",
            name: "Average Opportunity ROI",
            current_value: 4.9,
            previous_value: 3.8,
            target_value: 5.0,
            unit: "ratio",
            category: "quality",
            opportunity_type: "all",
            trend_direction: "up",
            trend_percentage: 28.9,
            status: "excellent",
            calculation_method: "Average ROI across all identified opportunities",
            data_sources: ["opportunity_evaluation", "financial_modeling"],
            last_updated: new Date().toISOString(),
            business_impact: "high",
            growth_contribution: "revenue"
          },
          {
            kpi_id: "opp_validation_001",
            name: "Cross-Agent Validation Rate",
            current_value: 85.0,
            previous_value: 75.0,
            target_value: 90.0,
            unit: "percent",
            category: "quality",
            opportunity_type: "all",
            trend_direction: "up",
            trend_percentage: 13.3,
            status: "good",
            calculation_method: "Opportunities validated by multiple agents / Total opportunities",
            data_sources: ["cross_agent_validation", "quality_assessment"],
            last_updated: new Date().toISOString(),
            business_impact: "high",
            growth_contribution: "efficiency"
          },
          {
            kpi_id: "opp_alignment_001",
            name: "Strategic Alignment Score",
            current_value: 75.0,
            previous_value: 70.0,
            target_value: 85.0,
            unit: "percent",
            category: "alignment",
            opportunity_type: "all",
            trend_direction: "up",
            trend_percentage: 7.1,
            status: "warning",
            calculation_method: "Opportunities aligned with business goals / Total opportunities",
            data_sources: ["strategic_planning", "goal_tracking"],
            last_updated: new Date().toISOString(),
            business_impact: "medium",
            growth_contribution: "revenue"
          }
        ]
      }
    };
  }
}

// React Hooks for Growth Opportunity Intelligence
export const useGrowthAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const apiService = new GrowthOpportunityAPIService();

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getGrowthAnalysis();
      setAnalysis(data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch growth analysis:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
    // Refresh every 15 minutes for growth opportunities
    const interval = setInterval(fetchAnalysis, 900000);
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

export const useOpportunityPipeline = () => {
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new GrowthOpportunityAPIService();

  const fetchPipeline = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getOpportunityPipeline();
      setPipeline(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch opportunity pipeline:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  return { pipeline, loading, error, refetch: fetchPipeline };
};

export const useGrowthOpportunities = (filter = 'all', sortBy = 'impact') => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new GrowthOpportunityAPIService();

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getGrowthOpportunities(filter, sortBy);
      setOpportunities(data?.data?.opportunities || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch growth opportunities:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, sortBy]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return { opportunities, loading, error, refetch: fetchOpportunities };
};

export const useImpactMatrix = () => {
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new GrowthOpportunityAPIService();

  const fetchMatrix = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getImpactMatrix();
      setMatrix(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch impact matrix:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  return { matrix, loading, error, refetch: fetchMatrix };
};

export const useGrowthTracking = () => {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new GrowthOpportunityAPIService();

  const fetchTracking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getGrowthTracking();
      setTracking(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch growth tracking:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  return { tracking, loading, error, refetch: fetchTracking };
};

export const useGrowthKPIs = () => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new GrowthOpportunityAPIService();

  const fetchKPIs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getGrowthKPIs();
      setKpis(data?.data?.kpis || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch growth KPIs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
    // Refresh every 10 minutes for KPIs
    const interval = setInterval(fetchKPIs, 600000);
    return () => clearInterval(interval);
  }, [fetchKPIs]);

  return { kpis, loading, error, refetch: fetchKPIs };
};

export const useOpportunityActions = () => {
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new GrowthOpportunityAPIService();

  const acceptOpportunity = useCallback(async (opportunityId, acceptanceData = {}) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.acceptOpportunity(opportunityId, acceptanceData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  const declineOpportunity = useCallback(async (opportunityId, declineReason = '') => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.declineOpportunity(opportunityId, declineReason);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  const createOpportunity = useCallback(async (opportunityData) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.createOpportunity(opportunityData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  const updateOpportunity = useCallback(async (opportunityId, opportunityData) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.updateOpportunity(opportunityId, opportunityData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  return { 
    acceptOpportunity, 
    declineOpportunity, 
    createOpportunity, 
    updateOpportunity, 
    executing, 
    error 
  };
};

// Utility Functions
export const formatOpportunityRevenue = (revenue) => {
  if (revenue >= 1000000) {
    return `$${(revenue / 1000000).toFixed(1)}M`;
  } else if (revenue >= 1000) {
    return `$${(revenue / 1000).toFixed(0)}K`;
  } else {
    return `$${revenue.toFixed(0)}`;
  }
};

export const formatROI = (roi) => {
  return `${roi.toFixed(1)}x`;
};

export const getOpportunityTypeColor = (type) => {
  switch (type.toLowerCase()) {
    case 'quick_win': return 'text-green-600 bg-green-100';
    case 'strategic': return 'text-blue-600 bg-blue-100';
    case 'long_term': return 'text-purple-600 bg-purple-100';
    case 'fill_in': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getCategoryIcon = (category) => {
  switch (category.toLowerCase()) {
    case 'revenue_growth': return '💰';
    case 'cost_reduction': return '📉';
    case 'efficiency': return '⚡';
    case 'market_expansion': return '🌍';
    default: return '💡';
  }
};

export const calculateImpactEffortRatio = (impact, effort) => {
  return effort > 0 ? (impact / effort).toFixed(2) : 0;
};

export const getTimeframeColor = (timeframe) => {
  switch (timeframe.toLowerCase()) {
    case 'immediate': return 'text-green-600 bg-green-100';
    case '1-3_months': return 'text-blue-600 bg-blue-100';
    case '3-6_months': return 'text-yellow-600 bg-yellow-100';
    case '6-12_months': return 'text-orange-600 bg-orange-100';
    case '12+_months': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const calculateOpportunityScore = (impact, effort, confidence, roi) => {
  const impactWeight = 0.3;
  const effortWeight = 0.2;
  const confidenceWeight = 0.3;
  const roiWeight = 0.2;
  
  // Normalize effort (inverse relationship - lower effort is better)
  const normalizedEffort = 11 - effort;
  
  return (
    (impact * impactWeight) +
    (normalizedEffort * effortWeight) +
    (confidence * confidenceWeight) +
    (Math.min(roi, 10) * roiWeight)
  ).toFixed(1);
};

export const getPriorityLevel = (score) => {
  if (score >= 8.0) return 'high';
  if (score >= 6.0) return 'medium';
  return 'low';
};

export const formatTimeframe = (timeframe) => {
  return timeframe.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Export the API service instance
export const growthOpportunityAPIService = new GrowthOpportunityAPIService();
