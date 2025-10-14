/**
 * Enhanced Orchestrator Service
 * Connects frontend to enhanced orchestrator backend with full agent and integration awareness
 */

import apiService from './api.js';

const ORCHESTRATOR_BASE = '/api/orchestrator';

class EnhancedOrchestratorService {
  
  /**
   * Create autonomous workflow from chat message or user input
   * @param {string} objective - User's business objective
   * @param {string} userId - User ID
   * @param {Object} options - Additional options (audience, notes)
   * @returns {Promise<Object>} Workflow creation result
   */
  async createAutonomousWorkflow(objective, userId, options = {}) {
    try {
      const response = await apiService.post(`${ORCHESTRATOR_BASE}/workflow/create`, {
        objective,
        user_id: userId,
        audience: options.audience || null,
        additional_notes: options.notes || null,
        priority: options.priority || 'medium'
      });
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to create autonomous workflow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create workflow from predefined template
   * @param {string} templateName - Template name (customer_retention, content_optimization, etc.)
   * @param {Object} parameters - Template parameters
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Workflow creation result
   */
  async createWorkflowFromTemplate(templateName, parameters, userId) {
    try {
      const response = await apiService.post(`${ORCHESTRATOR_BASE}/workflow/template/create`, {
        template_name: templateName,
        parameters,
        user_id: userId,
        priority: parameters.priority || 'medium'
      });
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to create workflow from template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute workflow (usually happens automatically, but can be triggered manually)
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Execution result
   */
  async executeWorkflow(workflowId) {
    try {
      const response = await apiService.post(`${ORCHESTRATOR_BASE}/workflow/${workflowId}/execute`);
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get real-time workflow status with transparency logging
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Workflow status
   */
  async getWorkflowStatus(workflowId) {
    try {
      const response = await apiService.get(`${ORCHESTRATOR_BASE}/workflow/${workflowId}/status`);
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to get workflow status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get transparency log for workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Transparency log
   */
  async getTransparencyLog(workflowId) {
    try {
      const response = await apiService.get(`${ORCHESTRATOR_BASE}/workflow/${workflowId}/transparency`);
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to get transparency log:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Approve or reject a workflow step
   * @param {string} workflowId - Workflow ID
   * @param {string} stepId - Step ID
   * @param {boolean} approved - Approval decision
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Approval result
   */
  async approveWorkflow(workflowId) {
    try {
      const response = await apiService.post(`${ORCHESTRATOR_BASE}/workflow/${workflowId}/approve`);
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to approve workflow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async approveWorkflowStep(workflowId, stepId, approved, userId) {
    try {
      const response = await apiService.post(`${ORCHESTRATOR_BASE}/workflow/${workflowId}/step/approve`, {
        workflow_id: workflowId,
        step_id: stepId,
        approved,
        user_id: userId
      });
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to approve workflow step:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all available agents with their capabilities
   * @returns {Promise<Object>} Agent capabilities
   */
  async getAgentCapabilities() {
    try {
      const response = await apiService.get(`${ORCHESTRATOR_BASE}/agents/capabilities`);
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to get agent capabilities:', error);
      return {
        success: false,
        error: error.message,
        // Graceful fallback
        total_agents: 0,
        agents: [],
        by_category: {}
      };
    }
  }

  /**
   * Get agents by category
   * @param {string} category - Agent category
   * @returns {Promise<Object>} Agents in category
   */
  async getAgentsByCategory(category) {
    try {
      const response = await apiService.get(`${ORCHESTRATOR_BASE}/agents/category/${category}`);
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to get agents by category:', error);
      return {
        success: false,
        error: error.message,
        agents: []
      };
    }
  }

  /**
   * Get user's connected integrations
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User integrations
   */
  async getUserIntegrations(userId) {
    try {
      const response = await apiService.get(`${ORCHESTRATOR_BASE}/integrations/user/${userId}`);
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to get user integrations:', error);
      return {
        success: false,
        error: error.message,
        integrations: [],
        summary: { total_connected: 0 }
      };
    }
  }

  /**
   * Register new integration for user
   * @param {string} userId - User ID
   * @param {string} integrationId - Integration ID
   * @param {Object} credentials - Integration credentials
   * @returns {Promise<Object>} Registration result
   */
  async registerIntegration(userId, integrationId, credentials) {
    try {
      const response = await apiService.post(`${ORCHESTRATOR_BASE}/integrations/register`, {
        user_id: userId,
        integration_id: integrationId,
        credentials
      });
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to register integration:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get recent agent activity for transparency feed
   * @param {string} userId - User ID
   * @param {number} limit - Number of events to retrieve
   * @returns {Promise<Object>} Recent agent activity
   */
  async getRecentActivity(userId, limit = 50) {
    try {
      const response = await apiService.get(`${ORCHESTRATOR_BASE}/activity/recent/${userId}?limit=${limit}`);
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to get recent activity:', error);
      return {
        success: false,
        error: error.message,
        events: []
      };
    }
  }

  /**
   * Trigger orchestration from dashboard action
   * @param {string} dashboardType - Dashboard type (customer, financial, content, business)
   * @param {string} action - Action to perform
   * @param {string} userId - User ID
   * @param {Object} parameters - Action parameters
   * @returns {Promise<Object>} Orchestration result
   */
  async triggerDashboardOrchestration(dashboardType, action, userId, parameters = {}) {
    try {
      const response = await apiService.get(`${ORCHESTRATOR_BASE}/dashboard/${dashboardType}/orchestrate`, {
        params: {
          user_id: userId,
          action,
          parameters: JSON.stringify(parameters)
        }
      });
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to trigger dashboard orchestration:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get system health and capabilities
   * @returns {Promise<Object>} System health status
   */
  async getSystemHealth() {
    try {
      const response = await apiService.get(`${ORCHESTRATOR_BASE}/health`);
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to get system health:', error);
      return {
        success: false,
        error: error.message,
        status: 'unknown'
      };
    }
  }

  /**
   * Get complete system capabilities (agents + integrations)
   * @returns {Promise<Object>} System capabilities
   */
  async getSystemCapabilities() {
    try {
      const response = await apiService.get(`${ORCHESTRATOR_BASE}/system/capabilities`);
      
      // Handle null response (API not available)
      if (!response) {
        return {
          success: false,
          error: 'API not available',
          total_agents: 0,
          categories: {}
        };
      }
      
      return {
        success: true,
        ...(response.data || response)
      };
    } catch (error) {
      console.error('Failed to get system capabilities:', error);
      return {
        success: false,
        error: error.message,
        total_agents: 0,
        categories: {}
      };
    }
  }

  /**
   * Process chat message through enhanced orchestrator
   * @param {string} message - User message
   * @param {string} userId - User ID
   * @param {Object} context - Additional context (audience, notes)
   * @returns {Promise<Object>} Chat orchestration result
   */
  async processChatOrchestration(message, userId, context = {}) {
    try {
      const response = await apiService.post(`${ORCHESTRATOR_BASE}/chat/process`, {
        objective: message,
        user_id: userId,
        audience: context.audience || null,
        additional_notes: context.notes || null,
        priority: context.priority || 'medium'
      });
      
      // Handle null response
      if (!response) {
        return {
          success: false,
          error: 'API not available'
        };
      }
      
      return {
        success: true,
        ...(response.data || response)
      };
    } catch (error) {
      console.error('Failed to process chat orchestration:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get performance metrics for monitoring
   * @returns {Promise<Object>} Performance metrics
   */
  async getPerformanceMetrics() {
    try {
      const response = await apiService.get(`${ORCHESTRATOR_BASE}/performance/metrics`);
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return {
        success: false,
        error: error.message,
        metrics: {}
      };
    }
  }

  /**
   * Subscribe to real-time workflow updates (WebSocket)
   * @param {string} workflowId - Workflow ID
   * @param {Function} onUpdate - Callback for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToWorkflowUpdates(workflowId, onUpdate) {
    // Implementation would use WebSocket connection
    // For now, polling fallback
    const interval = setInterval(async () => {
      const status = await this.getWorkflowStatus(workflowId);
      if (status.success) {
        onUpdate(status);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }

  /**
   * Subscribe to agent activity feed (real-time updates)
   * @param {string} userId - User ID
   * @param {Function} onActivity - Callback for new activity
   * @returns {Function} Unsubscribe function
   */
  subscribeToAgentActivity(userId, onActivity) {
    // Implementation would use WebSocket connection
    // For now, polling fallback
    const interval = setInterval(async () => {
      const activity = await this.getRecentActivity(userId, 10);
      if (activity.success && activity.events.length > 0) {
        onActivity(activity.events);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }
}

// Export singleton instance
const enhancedOrchestratorService = new EnhancedOrchestratorService();
export default enhancedOrchestratorService;

