/**
 * Unified Orchestrator Service - Fortune 500 Level Business Intelligence Service
 * Consolidates all orchestrator services into a single, comprehensive system.
 * Integrates with Vertex AI, Business Intelligence Agents, and all dashboards.
 */

class UnifiedOrchestratorService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.apiPrefix = '/api/unified-orchestrator';
    this.requestTimeout = 5000; // 5 seconds for fast responses
    this.complexRequestTimeout = 30000; // 30 seconds for complex orchestration
  }

  /**
   * Check if request is simple (should use fast timeout)
   */
  isSimpleRequest(userInput) {
    const simplePatterns = [
      'hello', 'hi', 'hey', 'how are you', 'good morning', 'good afternoon', 
      'good evening', 'what\'s up', 'how\'s it going', 'thanks', 'thank you',
      'bye', 'goodbye', 'see you later', 'have a good day'
    ];
    
    const messageLower = userInput.toLowerCase().trim();
    
    // Check if it's a simple greeting or common phrase
    for (const pattern of simplePatterns) {
      if (messageLower.includes(pattern)) {
        return true;
      }
    }
    
    // Check if it's very short (less than 20 characters)
    if (userInput.trim().length < 20) {
      return true;
    }
    
    return false;
  }

  /**
   * Make HTTP request using fetch API
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${this.apiPrefix}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    };

    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
      
      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          throw new Error('Unauthorized');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Unable to connect to the orchestrator. Please check your connection and try again.');
      } else if (error.message.includes('404')) {
        throw new Error('Orchestrator endpoint not found. The service may be temporarily unavailable.');
      } else if (error.message.includes('500')) {
        throw new Error('Internal server error. Please try again in a moment.');
      }
      throw error;
    }
  }

  /**
   * Initialize the unified orchestrator service
   */
  async initialize() {
    try {
      const response = await this.makeRequest('/health');
      console.log('Unified Orchestrator initialized:', response);
      return response;
    } catch (error) {
      console.error('Failed to initialize Unified Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Process a request through the unified orchestrator
   */
  async processRequest(request) {
    try {
      // Use appropriate timeout based on request complexity
      const isSimple = this.isSimpleRequest(request.user_input || '');
      const originalTimeout = this.requestTimeout;
      
      if (isSimple) {
        this.requestTimeout = 5000; // 5 seconds for simple requests
      } else {
        this.requestTimeout = this.complexRequestTimeout; // 30 seconds for complex requests
      }
      
      const response = await this.makeRequest('/chat/process', {
        method: 'POST',
        body: JSON.stringify(request)
      });
      
      // Restore original timeout
      this.requestTimeout = originalTimeout;
      
      return response;
    } catch (error) {
      console.error('Unified Orchestrator request failed:', error);
      throw error;
    }
  }

  /**
   * Get business intelligence from specific agent
   */
  async getBusinessIntelligence(intelligenceType, request) {
    try {
      const response = await this.makeRequest('/business-intelligence', {
        method: 'POST',
        body: JSON.stringify({
          intelligence_type: intelligenceType,
          ...request
        })
      });
      return response;
    } catch (error) {
      console.error('Business intelligence request failed:', error);
      throw error;
    }
  }

  /**
   * Execute workflow through orchestrator
   */
  async executeWorkflow(workflowRequest) {
    try {
      const response = await this.makeRequest('/execute-workflow', {
        method: 'POST',
        body: JSON.stringify(workflowRequest)
      });
      return response;
    } catch (error) {
      console.error('Workflow execution failed:', error);
      throw error;
    }
  }

  /**
   * Get orchestrator status and capabilities
   */
  async getStatus() {
    try {
      const response = await this.makeRequest('/status');
      return response;
    } catch (error) {
      console.error('Failed to get orchestrator status:', error);
      throw error;
    }
  }

  /**
   * Test agent coordination
   */
  async testAgentCoordination() {
    try {
      const response = await this.makeRequest('/test-agent-coordination', {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Agent coordination test failed:', error);
      throw error;
    }
  }

  /**
   * Get calendar insights through orchestrator
   */
  async getCalendarInsights(context) {
    try {
      const response = await this.makeRequest('/calendar-insights', {
        method: 'POST',
        body: JSON.stringify(context)
      });
      return response;
    } catch (error) {
      console.error('Calendar insights request failed:', error);
      throw error;
    }
  }

  /**
   * Get dashboard data through orchestrator
   */
  async getDashboardData(dashboardType, context = {}) {
    try {
      const response = await this.makeRequest(`/dashboard/${dashboardType}`, {
        method: 'POST',
        body: JSON.stringify(context)
      });
      return response;
    } catch (error) {
      console.error(`Dashboard ${dashboardType} data request failed:`, error);
      throw error;
    }
  }

  /**
   * Update dashboard through orchestrator
   */
  async updateDashboard(dashboardType, data) {
    try {
      const response = await this.makeRequest(`/dashboard/${dashboardType}/update`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      console.error(`Dashboard ${dashboardType} update failed:`, error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    try {
      const response = await this.makeRequest('/performance-metrics');
      return response;
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get cost analysis
   */
  async getCostAnalysis() {
    try {
      const response = await this.makeRequest('/cost-analysis');
      return response;
    } catch (error) {
      console.error('Failed to get cost analysis:', error);
      throw error;
    }
  }
}

export default UnifiedOrchestratorService;