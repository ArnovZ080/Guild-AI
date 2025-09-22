// Centralized data service for connecting frontend components to backend APIs
class DataService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.wsConnection = null;
    this.subscribers = new Map();
  }

  // WebSocket connection for real-time updates
  connectWebSocket() {
    if (this.wsConnection) return;
    
    const wsUrl = this.baseURL.replace('http', 'ws') + '/ws';
    this.wsConnection = new WebSocket(wsUrl);
    
    this.wsConnection.onopen = () => {
      console.log('WebSocket connected');
      this.notifySubscribers('connection', { status: 'connected' });
    };
    
    this.wsConnection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifySubscribers(data.type, data.payload);
    };
    
    this.wsConnection.onclose = () => {
      console.log('WebSocket disconnected');
      this.notifySubscribers('connection', { status: 'disconnected' });
      // Reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  // Subscribe to real-time updates
  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(type);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(type);
        }
      }
    };
  }

  // Notify all subscribers of a specific type
  notifySubscribers(type, data) {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // API helper method
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Business Pulse Data
  async getBusinessPulseData() {
    try {
      // This would connect to actual business metrics API
      // const data = await this.apiCall('/api/business-pulse');
      // return data;
      
      // Simulated data for now - replace with real API call
      return {
        intensity: 0.75,
        activities: [
          { type: 'sales', count: 3 },
          { type: 'content', count: 5 },
          { type: 'support', count: 2 },
          { type: 'leads', count: 8 }
        ]
      };
    } catch (error) {
      console.error('Failed to fetch business pulse data:', error);
      return null;
    }
  }

  // Financial Flow Data
  async getFinancialFlowData() {
    try {
      // This would connect to actual financial data API
      // const data = await this.apiCall('/api/financial-flow');
      // return data;
      
      // Simulated data for now - replace with real API call
      return {
        revenue: [
          { source: 'Product Sales', amount: 15000, color: '#10B981' },
          { source: 'Consulting', amount: 8000, color: '#3B82F6' },
          { source: 'Subscriptions', amount: 5000, color: '#8B5CF6' }
        ],
        expenses: [
          { category: 'Marketing', amount: 3000, color: '#EF4444' },
          { category: 'Tools & Software', amount: 1500, color: '#F59E0B' },
          { category: 'Operations', amount: 2000, color: '#EC4899' }
        ],
        netFlow: 21500
      };
    } catch (error) {
      console.error('Failed to fetch financial flow data:', error);
      return null;
    }
  }

  // Customer Journey Data
  async getCustomerJourneyData() {
    try {
      // This would connect to actual customer data API
      // const data = await this.apiCall('/api/customers');
      // return data;
      
      // Simulated data for now - replace with real API call
      return [
        { 
          id: '1', 
          name: 'ACME Corp', 
          stage: 'customer', 
          value: 15000, 
          engagement: 0.9, 
          x: 60, 
          y: 40,
          journey: ['prospect', 'lead', 'customer'],
          connections: ['2', '4'],
          cluster: 'enterprise',
          lastActivity: Date.now() - 3600000
        },
        // ... more customers
      ];
    } catch (error) {
      console.error('Failed to fetch customer journey data:', error);
      return [];
    }
  }

  // Agent Status Data
  async getAgentStatusData() {
    try {
      // This would connect to actual agent status API
      // const data = await this.apiCall('/api/agents/status');
      // return data;
      
      // Simulated data for now - replace with real API call
      return [
        {
          id: 'research-1',
          name: 'Research Agent',
          type: 'research',
          status: 'working',
          currentTask: 'Analyzing market trends',
          position: { x: 20, y: 30 },
          progress: 0.65,
          efficiency: 0.92,
          lastActive: Date.now() - 300000
        },
        // ... more agents
      ];
    } catch (error) {
      console.error('Failed to fetch agent status data:', error);
      return [];
    }
  }

  // Workflow Data
  async getWorkflowData() {
    try {
      // This connects to the actual workflow API
      const data = await this.apiCall('/workflows');
      return data;
    } catch (error) {
      console.error('Failed to fetch workflow data:', error);
      return [];
    }
  }

  // Opportunity Data
  async getOpportunityData() {
    try {
      // This would connect to actual opportunity detection API
      // const data = await this.apiCall('/api/opportunities');
      // return data;
      
      // Simulated data for now - replace with real API call
      return [
        { id: '1', name: 'Tech Startup', type: 'high-value', value: 25000, distance: 0.3, angle: 45, urgency: 'high' },
        // ... more opportunities
      ];
    } catch (error) {
      console.error('Failed to fetch opportunity data:', error);
      return [];
    }
  }

  // Content Performance Data
  async getContentPerformanceData() {
    try {
      // This would connect to actual content analytics API
      // const data = await this.apiCall('/api/content-performance');
      // return data;
      
      // Simulated data for now - replace with real API call
      return [
        { id: '1', title: 'Blog Post: AI Trends', type: 'blog', performance: 0.85, growth: 0.3, lastWatered: Date.now() - 3600000 },
        // ... more content items
      ];
    } catch (error) {
      console.error('Failed to fetch content performance data:', error);
      return [];
    }
  }

  // Progress Momentum Data
  async getProgressMomentumData() {
    try {
      // This would connect to actual progress tracking API
      // const data = await this.apiCall('/api/progress-momentum');
      // return data;
      
      // Simulated data for now - replace with real API call
      return {
        currentMomentum: 0.75,
        dailyProgress: [
          { day: 'Mon', value: 0.6, tasks: 8 },
          { day: 'Tue', value: 0.8, tasks: 12 },
          // ... more days
        ],
        weeklyGoal: 100,
        completedTasks: 59
      };
    } catch (error) {
      console.error('Failed to fetch progress momentum data:', error);
      return null;
    }
  }

  // Create a new workflow
  async createWorkflow(userInput) {
    try {
      const data = await this.apiCall('/workflows/contracts', {
        method: 'POST',
        body: JSON.stringify(userInput)
      });
      return data;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  }

  // Get workflow status
  async getWorkflowStatus(workflowId) {
    try {
      const data = await this.apiCall(`/workflows/${workflowId}/status`);
      return data;
    } catch (error) {
      console.error('Failed to get workflow status:', error);
      throw error;
    }
  }

  // Get workflow executions
  async getWorkflowExecutions(workflowId) {
    try {
      const data = await this.apiCall(`/workflows/${workflowId}/executions`);
      return data;
    } catch (error) {
      console.error('Failed to get workflow executions:', error);
      throw error;
    }
  }

  // Initialize the data service
  initialize() {
    this.connectWebSocket();
    console.log('DataService initialized');
  }

  // Cleanup
  destroy() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.subscribers.clear();
  }
}

// Create and export a singleton instance
const dataService = new DataService();
export default dataService;
