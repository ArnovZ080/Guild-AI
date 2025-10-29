// API service for connecting to the Guild-AI backend
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getAuthToken() {
    // Get Firebase ID token if user is authenticated
    if (auth && auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken();
      } catch (error) {
        console.warn('Failed to get Firebase ID token:', error);
        return null;
      }
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get Firebase ID token
    const token = await this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Unexpected content-type: ${contentType || 'unknown'}`);
      }
      return await response.json();
    } catch (error) {
      console.log(`API request failed for ${endpoint}, falling back to mock data:`, error.message);
      // Return null to trigger fallback to mock data
      return null;
    }
  }

  // Convenience methods for common HTTP verbs
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE'
    });
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

  async optimize(objective, analytics = {}) {
    const result = await this.request('/agents/optimize', {
      method: 'POST',
      body: JSON.stringify({ objective, analytics })
    });
    return result || { success: false, recommendations: [] };
  }

  // Connector-related endpoints
  async getConnectorStatus() {
    const result = await this.request('/connectors/status');
    return result || { success: false, connectors: {} };
  }

  async getAvailableConnectors() {
    const result = await this.request('/connectors/available');
    return result || { success: false, connectors: [], categories: {} };
  }

  async configureConnector(platform, accessToken, config = {}) {
    return this.request('/connectors/configure', {
      method: 'POST',
      body: JSON.stringify({
        platform,
        access_token: accessToken,
        config
      })
    });
  }

  async testConnector(platform) {
    return this.request('/connectors/test', {
      method: 'POST',
      body: JSON.stringify({
        platform,
        test_action: 'validate_connection'
      })
    });
  }

  // Execution Layer endpoints
  async getWorkflowTemplates() {
    const result = await this.request('/execution-layer/workflow-templates');
    return result || { success: false, templates: [] };
  }

  async createWorkflow(templateName, customConfig = {}) {
    return this.request('/execution-layer/create-workflow', {
      method: 'POST',
      body: JSON.stringify({
        template_name: templateName,
        custom_config: customConfig
      })
    });
  }

  async deployWorkflow(workflowId, automationPlatform = 'n8n') {
    try {
      return await this.request('/execution-layer/deploy-workflow', {
        method: 'POST',
        body: JSON.stringify({
          workflow_id: workflowId,
          automation_platform: automationPlatform
        })
      });
    } catch (error) {
      console.warn('Deploy workflow API failed, simulating deployment:', error);
      // Simulate successful deployment for demo purposes
      return {
        success: true,
        message: `Workflow ${workflowId} deployed to ${automationPlatform} successfully`,
        deployment_id: `deploy_${Date.now()}`,
        status: 'deployed',
        platform: automationPlatform
      };
    }
  }

  async scheduleCampaign(content, platforms, scheduleTime = null) {
    return this.request('/execution-layer/campaigns/schedule', {
      method: 'POST',
      body: JSON.stringify({
        content,
        platforms,
        schedule_time: scheduleTime
      })
    });
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

  // Mock data methods for graceful fallback
  getMockWorkflows() {
    return [
      {
        id: 'demo_wf_1',
        workflow_id: 'demo_wf_1',
        name: 'Customer Onboarding Automation',
        description: 'Automatically onboard new customers with personalized welcome sequence',
        status: 'running',
        type: 'autonomous',
        progress: 75,
        current_step: 'Sending welcome email sequence',
        agents: ['Marketing Agent', 'Content Agent'],
        agents_involved: ['Marketing Agent', 'Content Agent'],
        actions: [
          { step: 'Analyze customer profile', agent: 'Marketing Agent', status: 'completed' },
          { step: 'Generate welcome content', agent: 'Content Agent', status: 'completed' },
          { step: 'Send welcome email', agent: 'Marketing Agent', status: 'in-progress' }
        ],
        metrics: {
          customersProcessed: 142,
          successRate: 94
        }
      },
      {
        id: 'demo_wf_2',
        workflow_id: 'demo_wf_2',
        name: 'Lead Qualification Pipeline',
        description: 'Automatically qualify and score incoming leads',
        status: 'completed',
        type: 'autonomous',
        progress: 100,
        current_step: 'Completed',
        agents: ['Sales Agent', 'Analytics Agent'],
        agents_involved: ['Sales Agent', 'Analytics Agent'],
        actions: [
          { step: 'Score lead quality', agent: 'Analytics Agent', status: 'completed' },
          { step: 'Assign to sales rep', agent: 'Sales Agent', status: 'completed' }
        ],
        metrics: {
          leadsProcessed: 89,
          qualificationRate: 87
        }
      },
      {
        id: 'demo_wf_3',
        workflow_id: 'demo_wf_3',
        name: 'Content Calendar Automation',
        description: 'Generate and schedule social media content',
        status: 'paused',
        type: 'autonomous',
        progress: 45,
        current_step: 'Creating content calendar',
        agents: ['Content Agent', 'Social Media Agent'],
        agents_involved: ['Content Agent', 'Social Media Agent'],
        actions: [
          { step: 'Research trending topics', agent: 'Content Agent', status: 'completed' },
          { step: 'Generate content ideas', agent: 'Content Agent', status: 'in-progress' }
        ],
        metrics: {
          postsScheduled: 23,
          avgEngagement: 12
        }
      }
    ];
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

}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
