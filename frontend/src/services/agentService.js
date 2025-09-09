// Agent Service for interacting with Guild AI agents
class AgentService {
  constructor() {
    // Use environment variable if set, otherwise use localhost for development
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  }

  // Generic agent interaction method
  async interactWithAgent(action, data) {
    try {
      const response = await fetch(`${this.baseURL}/agents/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          data: data
        })
      });

      if (!response.ok) {
        throw new Error(`Agent interaction failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Agent interaction error:', error);
      throw error;
    }
  }

  // Specific agent methods
  async launchCampaign(campaignData) {
    return this.interactWithAgent('marketing', {
      action: 'launch_campaign',
      data: campaignData
    });
  }

  async generateReport(reportType, filters = {}) {
    return this.interactWithAgent('analytics', {
      action: 'generate_report',
      report_type: reportType,
      filters: filters
    });
  }

  async setGoals(goals) {
    return this.interactWithAgent('strategy', {
      action: 'set_goals',
      goals: goals
    });
  }

  async researchMarket(query) {
    return this.interactWithAgent('research', {
      action: 'market_research',
      query: query
    });
  }

  async createContent(contentRequest) {
    return this.interactWithAgent('content', {
      action: 'create_content',
      request: contentRequest
    });
  }

  async analyzePerformance(metrics) {
    return this.interactWithAgent('analytics', {
      action: 'analyze_performance',
      metrics: metrics
    });
  }

  // Multi-agent workflow methods
  async runLeadGenerationWorkflow(targetAudience) {
    return this.interactWithAgent('orchestrator', {
      action: 'run_workflow',
      workflow_type: 'lead_generation',
      target_audience: targetAudience
    });
  }

  async runContentMarketingWorkflow(contentStrategy) {
    return this.interactWithAgent('orchestrator', {
      action: 'run_workflow',
      workflow_type: 'content_marketing',
      strategy: contentStrategy
    });
  }

  // Get agent status
  async getAgentStatus(agentType) {
    try {
      const response = await fetch(`${this.baseURL}/agents/${agentType}/status`);
      if (!response.ok) {
        throw new Error(`Failed to get agent status: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get agent status error:', error);
      throw error;
    }
  }

  // Get all agents status
  async getAllAgentsStatus() {
    try {
      const response = await fetch(`${this.baseURL}/agents/status`);
      if (!response.ok) {
        throw new Error(`Failed to get agents status: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get all agents status error:', error);
      throw error;
    }
  }
}

export default new AgentService();
