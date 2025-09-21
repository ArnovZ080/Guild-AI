// API Integration Service for Guild-AI Frontend
// This service handles all API communications with the backend

// Base API URL configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

// Connector Setup API Endpoints
export const CONNECTOR_ENDPOINTS = {
  // List all available connectors
  LIST_CONNECTORS: `${API_BASE_URL}/api/connectors`,
  
  // Start a new setup session
  START_SETUP: `${API_BASE_URL}/api/connectors/setup/start`,
  
  // Get next step in setup process
  GET_NEXT_STEP: (sessionId) => `${API_BASE_URL}/api/connectors/setup/${sessionId}/next`,
  
  // Submit step data
  SUBMIT_STEP: (sessionId) => `${API_BASE_URL}/api/connectors/setup/${sessionId}/submit`,
  
  // Complete setup
  COMPLETE_SETUP: (sessionId) => `${API_BASE_URL}/api/connectors/setup/${sessionId}/complete`,
  
  // Cancel setup
  CANCEL_SETUP: (sessionId) => `${API_BASE_URL}/api/connectors/setup/${sessionId}/cancel`,
  
  // WebSocket for real-time updates
  WEBSOCKET_URL: `${WS_BASE_URL}/ws/connector-setup`
};

// OAuth Connection Endpoints
export const OAUTH_ENDPOINTS = {
  // Get OAuth providers
  GET_PROVIDERS: `${API_BASE_URL}/oauth/providers`,
  
  // Start OAuth flow
  START_OAUTH: (provider) => `${API_BASE_URL}/oauth/${provider}/start`,
  
  // Get credentials
  GET_CREDENTIALS: `${API_BASE_URL}/oauth/credentials`,
  
  // Delete credential
  DELETE_CREDENTIAL: (credentialId) => `${API_BASE_URL}/oauth/credentials/${credentialId}`,
  
  // Refresh token
  REFRESH_TOKEN: (credentialId) => `${API_BASE_URL}/oauth/credentials/${credentialId}/refresh`
};

// Workflow and Campaign Endpoints
export const WORKFLOW_ENDPOINTS = {
  // Create campaign
  CREATE_CAMPAIGN: `${API_BASE_URL}/api/campaigns`,
  
  // Get campaign status
  GET_CAMPAIGN_STATUS: (campaignId) => `${API_BASE_URL}/api/campaigns/${campaignId}/status`,
  
  // Execute campaign
  EXECUTE_CAMPAIGN: (campaignId) => `${API_BASE_URL}/api/campaigns/${campaignId}/execute`,
  
  // Get workflow nodes
  GET_WORKFLOW_NODES: (workflowId) => `${API_BASE_URL}/api/workflows/${workflowId}/nodes`
};

// Error handling utility
const handleApiError = (error, context = 'API call') => {
  console.error(`${context} failed:`, error);
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    throw new Error(`Server error (${status}): ${data.message || 'Unknown error'}`);
  } else if (error.request) {
    // Network error
    throw new Error('Network error: Unable to connect to server');
  } else {
    // Other error
    throw new Error(`Request error: ${error.message}`);
  }
};

// Generic API call wrapper
const apiCall = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      // Add authentication headers here if needed
      // 'Authorization': `Bearer ${getAuthToken()}`
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    handleApiError(error, `API call to ${url}`);
  }
};

// Connector Setup API functions
export const connectorSetupAPI = {
  async getAvailableConnectors() {
    return await apiCall(CONNECTOR_ENDPOINTS.LIST_CONNECTORS);
  },
  
  async startSetup(connectorId, userId) {
    return await apiCall(CONNECTOR_ENDPOINTS.START_SETUP, {
      method: 'POST',
      body: JSON.stringify({ 
        connector_id: connectorId, 
        user_id: userId 
      })
    });
  },
  
  async getNextStep(sessionId) {
    return await apiCall(CONNECTOR_ENDPOINTS.GET_NEXT_STEP(sessionId));
  },
  
  async submitStepData(sessionId, stepData) {
    return await apiCall(CONNECTOR_ENDPOINTS.SUBMIT_STEP(sessionId), {
      method: 'POST',
      body: JSON.stringify(stepData)
    });
  },
  
  async completeSetup(sessionId) {
    return await apiCall(CONNECTOR_ENDPOINTS.COMPLETE_SETUP(sessionId), {
      method: 'POST'
    });
  },
  
  async cancelSetup(sessionId) {
    return await apiCall(CONNECTOR_ENDPOINTS.CANCEL_SETUP(sessionId), {
      method: 'DELETE'
    });
  }
};

// OAuth Connection API functions
export const oauthAPI = {
  async getProviders() {
    return await apiCall(OAUTH_ENDPOINTS.GET_PROVIDERS);
  },
  
  async startOAuthFlow(provider) {
    return await apiCall(OAUTH_ENDPOINTS.START_OAUTH(provider), {
      method: 'POST'
    });
  },
  
  async getCredentials() {
    return await apiCall(OAUTH_ENDPOINTS.GET_CREDENTIALS);
  },
  
  async deleteCredential(credentialId) {
    return await apiCall(OAUTH_ENDPOINTS.DELETE_CREDENTIAL(credentialId), {
      method: 'DELETE'
    });
  },
  
  async refreshToken(credentialId) {
    return await apiCall(OAUTH_ENDPOINTS.REFRESH_TOKEN(credentialId), {
      method: 'POST'
    });
  }
};

// Workflow and Campaign API functions
export const workflowAPI = {
  async createCampaign(campaignData) {
    return await apiCall(WORKFLOW_ENDPOINTS.CREATE_CAMPAIGN, {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
  },
  
  async getCampaignStatus(campaignId) {
    return await apiCall(WORKFLOW_ENDPOINTS.GET_CAMPAIGN_STATUS(campaignId));
  },
  
  async executeCampaign(campaignId) {
    return await apiCall(WORKFLOW_ENDPOINTS.EXECUTE_CAMPAIGN(campaignId), {
      method: 'POST'
    });
  },
  
  async getWorkflowNodes(workflowId) {
    return await apiCall(WORKFLOW_ENDPOINTS.GET_WORKFLOW_NODES(workflowId));
  }
};

// WebSocket connection management
export class WebSocketManager {
  constructor() {
    this.connections = new Map();
  }

  connect(sessionId, onMessage, onError, onClose) {
    const wsUrl = `${CONNECTOR_ENDPOINTS.WEBSOCKET_URL}/${sessionId}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) onError(error);
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket closed:', event);
      this.connections.delete(sessionId);
      if (onClose) onClose(event);
    };
    
    this.connections.set(sessionId, ws);
    return ws;
  }

  disconnect(sessionId) {
    const ws = this.connections.get(sessionId);
    if (ws) {
      ws.close();
      this.connections.delete(sessionId);
    }
  }

  sendMessage(sessionId, message) {
    const ws = this.connections.get(sessionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  disconnectAll() {
    this.connections.forEach((ws, sessionId) => {
      this.disconnect(sessionId);
    });
  }
}

// Create singleton instance
export const wsManager = new WebSocketManager();

// Utility functions for authentication (if needed)
export const authUtils = {
  getAuthToken() {
    // Implement token retrieval logic
    return localStorage.getItem('auth_token');
  },
  
  setAuthToken(token) {
    localStorage.setItem('auth_token', token);
  },
  
  removeAuthToken() {
    localStorage.removeItem('auth_token');
  },
  
  isAuthenticated() {
    return !!this.getAuthToken();
  }
};

// Export default API object
export default {
  CONNECTOR_ENDPOINTS,
  OAUTH_ENDPOINTS,
  WORKFLOW_ENDPOINTS,
  connectorSetupAPI,
  oauthAPI,
  workflowAPI,
  wsManager,
  authUtils
};
