/**
 * Unified Orchestrator Service - Fortune 500 Level Business Intelligence Service
 * Consolidates all orchestrator services into a single, comprehensive system.
 * Integrates with Vertex AI, Business Intelligence Agents, and all dashboards.
 */

import axios from 'axios';

class UnifiedOrchestratorService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.apiPrefix = '/api/unified-orchestrator';
    this.requestTimeout = 30000; // 30 seconds for complex orchestration
    
    // Initialize axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: this.requestTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('Unified Orchestrator API Error:', error);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        } else if (error.response?.status === 429) {
          // Rate limited
          throw new Error('Rate limited. Please wait a moment and try again.');
        } else if (error.code === 'ECONNABORTED') {
          // Timeout
          throw new Error('Request timed out. The orchestrator is processing a complex task.');
        } else if (!error.response) {
          // Network error
          throw new Error('Network error. Please check your connection.');
        }
        
        throw error;
      }
    );
  }

  /**
   * Process a unified orchestrator request
   * @param {Object} request - Orchestrator request object
   * @returns {Promise<Object>} - Orchestrator response
   */
  async processRequest(request) {
    try {
      console.log('Processing unified orchestrator request:', request);
      
      const response = await this.api.post(`${this.apiPrefix}/process`, request);
      
      console.log('Unified orchestrator response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Failed to process orchestrator request:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Execute a workflow with autonomous orchestration
   * @param {Object} workflowRequest - Workflow execution request
   * @returns {Promise<Object>} - Workflow execution response
   */
  async executeWorkflow(workflowRequest) {
    try {
      console.log('Executing workflow:', workflowRequest);
      
      const response = await this.api.post(`${this.apiPrefix}/workflow/execute`, workflowRequest);
      
      console.log('Workflow execution response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Coordinate multiple agents for complex tasks
   * @param {Object} coordinationRequest - Agent coordination request
   * @returns {Promise<Object>} - Coordination response
   */
  async coordinateAgents(coordinationRequest) {
    try {
      console.log('Coordinating agents:', coordinationRequest);
      
      const response = await this.api.post(`${this.apiPrefix}/agents/coordinate`, coordinationRequest);
      
      console.log('Agent coordination response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Failed to coordinate agents:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get comprehensive business intelligence
   * @param {Object} intelligenceRequest - Business intelligence request
   * @returns {Promise<Object>} - Intelligence response
   */
  async getBusinessIntelligence(intelligenceRequest) {
    try {
      console.log('Getting business intelligence:', intelligenceRequest);
      
      const response = await this.api.post(`${this.apiPrefix}/business-intelligence`, intelligenceRequest);
      
      console.log('Business intelligence response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Failed to get business intelligence:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get orchestrator status and capabilities
   * @returns {Promise<Object>} - Status response
   */
  async getStatus() {
    try {
      const response = await this.api.get(`${this.apiPrefix}/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to get orchestrator status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Health check for unified orchestrator
   * @returns {Promise<Object>} - Health check response
   */
  async healthCheck() {
    try {
      const response = await this.api.get(`${this.apiPrefix}/health`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get agent capabilities and loaded agents
   * @returns {Promise<Object>} - Capabilities response
   */
  async getCapabilities() {
    try {
      const status = await this.getStatus();
      return {
        orchestrator_available: status.orchestrator_available,
        business_agents_available: status.business_agents_available,
        vertex_ai_enabled: status.vertex_ai_enabled,
        agents_loaded: status.agents_loaded || [],
        orchestrators_loaded: status.orchestrators_loaded || [],
        capabilities: status.capabilities || []
      };
    } catch (error) {
      console.error('Failed to get capabilities:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a business intelligence request
   * @param {string} intelligenceType - Type of intelligence (financial, customer, content, marketing)
   * @param {string} analysisDepth - Depth of analysis (quick, standard, comprehensive)
   * @param {Object} options - Additional options
   * @returns {Object} - Business intelligence request
   */
  createBusinessIntelligenceRequest(intelligenceType, analysisDepth = 'comprehensive', options = {}) {
    return {
      intelligence_type: intelligenceType,
      analysis_depth: analysisDepth,
      timeframe: options.timeframe || null,
      specific_metrics: options.metrics || null,
      dashboard_sync: options.dashboard_sync !== false
    };
  }

  /**
   * Create an agent coordination request
   * @param {string} primaryAgent - Primary agent for coordination
   * @param {Array} supportingAgents - Supporting agents
   * @param {string} objective - Coordination objective
   * @param {Object} context - Additional context
   * @param {number} qualityThreshold - Quality threshold
   * @returns {Object} - Agent coordination request
   */
  createAgentCoordinationRequest(primaryAgent, supportingAgents, objective, context = {}, qualityThreshold = 0.8) {
    return {
      primary_agent: primaryAgent,
      supporting_agents: supportingAgents,
      objective: objective,
      context: context,
      quality_threshold: qualityThreshold
    };
  }

  /**
   * Create a workflow execution request
   * @param {string} workflowId - Workflow ID
   * @param {string} userInput - User input for workflow
   * @param {Object} parameters - Workflow parameters
   * @param {boolean} autoExecute - Auto execute flag
   * @param {boolean} qualityCheck - Quality check flag
   * @returns {Object} - Workflow execution request
   */
  createWorkflowExecutionRequest(workflowId, userInput, parameters = {}, autoExecute = false, qualityCheck = true) {
    return {
      workflow_id: workflowId,
      user_input: userInput,
      parameters: parameters,
      auto_execute: autoExecute,
      quality_check: qualityCheck
    };
  }

  /**
   * Analyze user input to determine task characteristics
   * @param {string} userInput - User input text
   * @returns {Object} - Task characteristics
   */
  analyzeUserInput(userInput) {
    const lowerInput = userInput.toLowerCase();
    
    // Determine task type
    let taskType = 'chat';
    if (lowerInput.includes('customer') || lowerInput.includes('client')) {
      taskType = 'customer';
    } else if (lowerInput.includes('financial') || lowerInput.includes('revenue') || lowerInput.includes('profit')) {
      taskType = 'financial';
    } else if (lowerInput.includes('content') || lowerInput.includes('marketing') || lowerInput.includes('campaign')) {
      taskType = 'content';
    } else if (lowerInput.includes('strategy') || lowerInput.includes('plan') || lowerInput.includes('business')) {
      taskType = 'strategy';
    } else if (lowerInput.includes('workflow') || lowerInput.includes('automate')) {
      taskType = 'workflow';
    }

    // Determine complexity
    let complexity = 'medium';
    const complexKeywords = ['analyze', 'comprehensive', 'detailed', 'complete', 'thorough'];
    const simpleKeywords = ['quick', 'simple', 'basic', 'summary'];
    
    if (complexKeywords.some(keyword => lowerInput.includes(keyword))) {
      complexity = 'high';
    } else if (simpleKeywords.some(keyword => lowerInput.includes(keyword))) {
      complexity = 'low';
    }

    // Determine priority
    let priority = 'medium';
    if (lowerInput.includes('urgent') || lowerInput.includes('asap') || lowerInput.includes('critical')) {
      priority = 'urgent';
    } else if (lowerInput.includes('low') || lowerInput.includes('when possible')) {
      priority = 'low';
    }

    return { taskType, complexity, priority };
  }

  /**
   * Create a unified orchestrator request
   * @param {string} userInput - User input
   * @param {Object} options - Request options
   * @returns {Object} - Unified orchestrator request
   */
  createOrchestratorRequest(userInput, options = {}) {
    const analysis = this.analyzeUserInput(userInput);
    
    return {
      user_input: userInput,
      task_type: options.task_type || analysis.taskType,
      complexity: options.complexity || analysis.complexity,
      priority: options.priority || analysis.priority,
      context: options.context || {},
      dashboard_integration: options.dashboard || null,
      agent_coordination: options.agents || null,
      quality_requirements: {
        accuracy: options.accuracy || 0.9,
        completeness: options.completeness || 0.85,
        relevance: options.relevance || 0.9,
        actionability: options.actionability || 0.8
      }
    };
  }

  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - API error
   * @returns {Error} - User-friendly error
   */
  handleError(error) {
    if (error.response?.data?.detail) {
      return new Error(error.response.data.detail);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('An unexpected error occurred');
    }
  }

  /**
   * Get comprehensive business intelligence for all types
   * @param {Object} options - Options for intelligence gathering
   * @returns {Promise<Object>} - Combined intelligence response
   */
  async getAllBusinessIntelligence(options = {}) {
    try {
      const intelligenceTypes = ['financial', 'customer', 'content', 'marketing'];
      const results = {};

      // Get intelligence for each type
      for (const type of intelligenceTypes) {
        try {
          const request = this.createBusinessIntelligenceRequest(type, options.analysisDepth || 'comprehensive', options);
          results[type] = await this.getBusinessIntelligence(request);
        } catch (error) {
          console.error(`Failed to get ${type} intelligence:`, error);
          results[type] = { error: error.message };
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to get all business intelligence:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Coordinate multiple business intelligence agents
   * @param {string} objective - Coordination objective
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} - Coordination response
   */
  async coordinateBusinessIntelligenceAgents(objective, context = {}) {
    try {
      const request = this.createAgentCoordinationRequest(
        'business_intelligence',
        ['customer_intelligence', 'financial_intelligence', 'content_intelligence'],
        objective,
        context
      );

      return await this.coordinateAgents(request);
    } catch (error) {
      console.error('Failed to coordinate business intelligence agents:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Execute a comprehensive business analysis workflow
   * @param {string} analysisType - Type of analysis
   * @param {Object} parameters - Analysis parameters
   * @returns {Promise<Object>} - Analysis results
   */
  async executeBusinessAnalysisWorkflow(analysisType, parameters = {}) {
    try {
      // Create workflow execution request
      const workflowRequest = this.createWorkflowExecutionRequest(
        `business_analysis_${analysisType}`,
        `Execute comprehensive ${analysisType} analysis`,
        parameters,
        true, // auto execute
        true  // quality check
      );

      return await this.executeWorkflow(workflowRequest);
    } catch (error) {
      console.error('Failed to execute business analysis workflow:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get real-time orchestrator metrics
   * @returns {Promise<Object>} - Metrics response
   */
  async getMetrics() {
    try {
      const status = await this.getStatus();
      const health = await this.healthCheck();
      
      return {
        status: status,
        health: health,
        timestamp: new Date().toISOString(),
        uptime: Date.now() - (status.timestamp ? new Date(status.timestamp).getTime() : Date.now())
      };
    } catch (error) {
      console.error('Failed to get metrics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Test orchestrator connectivity and capabilities
   * @returns {Promise<Object>} - Test results
   */
  async testConnectivity() {
    try {
      const startTime = Date.now();
      
      // Test basic connectivity
      const health = await this.healthCheck();
      const status = await this.getStatus();
      
      // Test simple request processing
      const testRequest = this.createOrchestratorRequest("Test connectivity", {
        complexity: 'low',
        priority: 'low'
      });
      
      const response = await this.processRequest(testRequest);
      const endTime = Date.now();
      
      return {
        success: true,
        health: health,
        status: status,
        testResponse: response,
        responseTime: endTime - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Connectivity test failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const unifiedOrchestratorService = new UnifiedOrchestratorService();

export { unifiedOrchestratorService };
export default unifiedOrchestratorService;
