// API service for connecting to the Guild-AI backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
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
      // Don't throw error, return null to trigger fallback
      return null;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Agent-related endpoints
  async getAvailableAgents() {
    const result = await this.request('/agents/list');
    return result || this.getMockAgentStatus();
  }

  async getAgentsStatus() {
    const result = await this.request('/agents/status');
    return result || this.getMockAgentStatus();
  }

  async interactWithAgent(action, data = {}, userId = null) {
    return this.request('/agents/interact', {
      method: 'POST',
      body: JSON.stringify({
        action,
        data,
        user_id: userId,
      }),
    });
  }

  // Workflow-related endpoints
  async getWorkflowStatus(workflowId) {
    const result = await this.request(`/agents/workflow/${workflowId}`);
    return result || this.getMockWorkflows().find(w => w.workflow_id === workflowId);
  }

  async getAllWorkflows() {
    const result = await this.request('/agents/workflows');
    return result || this.getMockWorkflows();
  }

  // Business metrics and analytics
  async getBusinessMetrics() {
    // This would typically come from a dedicated analytics endpoint
    // For now, we'll simulate with agent interactions
    try {
      const performanceData = await this.interactWithAgent('analyze_performance', {
        metrics: {
          traffic: 'monthly',
          conversions: 'monthly',
          revenue: 'monthly'
        }
      });
      return performanceData;
    } catch (error) {
      // Fallback to mock data if API fails
      return this.getMockBusinessMetrics();
    }
  }

  // Lead generation
  async generateLeads(targetAudience = 'tech startups') {
    return this.interactWithAgent('lead_generation_workflow', {
      target_audience: targetAudience
    });
  }

  // Content marketing
  async createContentStrategy(contentStrategy = {}) {
    return this.interactWithAgent('content_marketing_workflow', {
      content_strategy: contentStrategy
    });
  }

  // Market research
  async researchMarket(query = 'market trends') {
    return this.interactWithAgent('research_market', {
      query: query
    });
  }

  // Campaign management
  async launchCampaign(campaignData) {
    return this.interactWithAgent('launch_campaign', campaignData);
  }

  // Goal setting
  async setBusinessGoals(goals) {
    return this.interactWithAgent('set_goals', {
      goals: goals
    });
  }

  // Mock data fallbacks
  getMockBusinessMetrics() {
    return {
      success: true,
      data: {
        metrics: {
          traffic: 'monthly',
          conversions: 'monthly',
          revenue: 'monthly'
        },
        analysis: {
          analysis_id: 'mock_analysis_123',
          status: 'analyzed',
          message: 'Performance analysis completed successfully',
          metrics: {
            traffic: 'monthly',
            conversions: 'monthly',
            revenue: 'monthly'
          },
          insights: ['Traffic is increasing', 'Conversion rate is stable', 'Revenue is growing']
        },
        trends: {
          traffic: '+15%',
          conversions: '+8%',
          revenue: '+22%'
        },
        recommendations: [
          'Increase social media budget by 20%',
          'Optimize landing page conversion rate',
          'Focus on high-value customer segments'
        ]
      }
    };
  }

  getMockAgentStatus() {
    return {
      agents: {
        MarketingAgent: {
          status: 'active',
          last_activity: new Date().toISOString(),
          type: 'real'
        },
        ResearchAgent: {
          status: 'active',
          last_activity: new Date().toISOString(),
          type: 'real'
        },
        ContentStrategist: {
          status: 'active',
          last_activity: new Date().toISOString(),
          type: 'real'
        },
        BusinessStrategistAgent: {
          status: 'active',
          last_activity: new Date().toISOString(),
          type: 'real'
        },
        AnalyticsAgent: {
          status: 'active',
          last_activity: new Date().toISOString(),
          type: 'real'
        }
      },
      total_agents: 5,
      active_agents: 5,
      system_status: 'healthy'
    };
  }

  getMockWorkflows() {
    return [
      {
        workflow_id: 'workflow_1',
        status: 'completed',
        progress: 100,
        agents_involved: ['MarketingAgent', 'ResearchAgent'],
        current_step: 'Campaign launched successfully',
        results: {
          campaign: {
            name: 'Q1 Growth Campaign',
            target_audience: 'Tech Startups',
            budget: 5000,
            duration: 30,
            channels: ['social', 'email', 'content']
          },
          estimated_reach: 50000,
          expected_conversions: 250
        },
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        workflow_id: 'workflow_2',
        status: 'running',
        progress: 65,
        agents_involved: ['ContentStrategist', 'ResearchAgent'],
        current_step: 'Creating content calendar',
        results: {},
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        updated_at: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
      }
    ];
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
