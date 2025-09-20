import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useCelebrations, CelebrationType } from '../components/psychological/EnhancedMicroCelebrations.tsx';

const AgentCommunicationContext = createContext();

export const useAgentCommunication = () => {
  const context = useContext(AgentCommunicationContext);
  if (!context) {
    throw new Error('useAgentCommunication must be used within an AgentCommunicationProvider');
  }
  return context;
};

export const AgentCommunicationProvider = ({ children }) => {
  const { triggerCelebration } = useCelebrations();
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeSessions, setActiveSessions] = useState({});
  const [pendingResponses, setPendingResponses] = useState({});
  const [agentMessages, setAgentMessages] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Connect to WebSocket
  const connectWebSocket = useCallback((userId = 'default_user', sessionId = null) => {
    if (ws) {
      ws.close();
    }

    // Only connect to WebSocket in development or when backend is available
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasBackend = window.location.hostname === 'localhost' || process.env.REACT_APP_BACKEND_URL;
    
    if (!isDevelopment && !hasBackend) {
      console.log('WebSocket disabled in production - backend not available');
      return;
    }

    const wsUrl = sessionId 
      ? `ws://localhost:8000/api/agents/ws/${userId}/${sessionId}`
      : `ws://localhost:8000/api/agents/ws/${userId}/general`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setWs(websocket);
      triggerCelebration(CelebrationType.COLLABORATION, {
        message: "Connected to AI Agents! 🤖",
        intensity: 'subtle'
      });
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleAgentMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      // Don't show error in production if backend is not available
      if (process.env.NODE_ENV === 'development') {
        console.warn('WebSocket connection failed - backend may not be running');
      }
    };

    setWs(websocket);
  }, [ws, triggerCelebration]);

  // Handle incoming agent messages
  const handleAgentMessage = useCallback((message) => {
    console.log('Received agent message:', message);
    
    // Add to messages list
    setAgentMessages(prev => [...prev, {
      id: message.id,
      agentId: message.agent_id,
      type: message.message_type,
      content: message.content,
      timestamp: new Date(message.timestamp),
      requiresResponse: message.requires_user_response,
      metadata: message.metadata,
      context: message.context
    }]);

    // Handle different message types
    switch (message.message_type) {
      case 'clarification_request':
        handleClarificationRequest(message);
        break;
      case 'status':
        handleStatusUpdate(message);
        break;
      case 'response':
        handleAgentResponse(message);
        break;
      case 'error':
        handleAgentError(message);
        break;
      default:
        console.log('Unknown message type:', message.message_type);
    }
  }, []);

  // Handle clarification requests
  const handleClarificationRequest = useCallback((message) => {
    setPendingResponses(prev => ({
      ...prev,
      [message.id]: {
        agentId: message.agent_id,
        question: message.content,
        context: message.context,
        timestamp: new Date(message.timestamp)
      }
    }));

    triggerCelebration(CelebrationType.COLLABORATION, {
      message: `${message.agent_id} needs clarification! 💬`,
      intensity: 'normal'
    });
  }, [triggerCelebration]);

  // Handle status updates
  const handleStatusUpdate = useCallback((message) => {
    const { status, progress, details } = message.metadata || {};
    
    if (status === 'completed') {
      triggerCelebration(CelebrationType.MILESTONE, {
        message: `Task completed by ${message.agent_id}! 🎉`,
        intensity: 'normal'
      });
    } else if (status === 'started') {
      triggerCelebration(CelebrationType.EFFICIENCY, {
        message: `${message.agent_id} started working! ⚡`,
        intensity: 'subtle'
      });
    }
  }, [triggerCelebration]);

  // Handle agent responses
  const handleAgentResponse = useCallback((message) => {
    triggerCelebration(CelebrationType.COLLABORATION, {
      message: `${message.agent_id} responded! 🤖`,
      intensity: 'subtle'
    });
  }, [triggerCelebration]);

  // Handle agent errors
  const handleAgentError = useCallback((message) => {
    triggerCelebration(CelebrationType.FAILURE, {
      message: `${message.agent_id} encountered an issue ⚠️`,
      intensity: 'subtle'
    });
  }, [triggerCelebration]);

  // Send task to agent
  const sendTaskToAgent = useCallback(async (task, preferredAgentId = null) => {
    try {
      const response = await fetch('http://localhost:8000/api/agents/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: task.description,
          context: task.context || {},
          preferred_agent_id: preferredAgentId,
          priority: task.priority || 'normal',
          metadata: task.metadata || {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update active sessions
      setActiveSessions(prev => ({
        ...prev,
        [result.session_id]: {
          agentId: result.agent_id,
          status: result.status,
          task: task,
          startedAt: new Date(),
          estimatedDuration: result.estimated_duration
        }
      }));

      setCurrentSessionId(result.session_id);
      
      // Connect WebSocket for this session
      connectWebSocket('default_user', result.session_id);

      return result;
    } catch (error) {
      console.error('Error sending task to agent:', error);
      throw error;
    }
  }, [connectWebSocket]);

  // Send response to agent
  const sendResponseToAgent = useCallback(async (messageId, response) => {
    try {
      const responseData = {
        message_id: messageId,
        session_id: currentSessionId,
        response: response,
        metadata: {}
      };

      // Send via WebSocket if connected
      if (ws && isConnected) {
        ws.send(JSON.stringify({
          type: 'user_response',
          ...responseData,
          timestamp: new Date().toISOString()
        }));
      } else {
        // Fallback to HTTP
        await fetch('http://localhost:8000/api/agents/respond', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(responseData)
        });
      }

      // Remove from pending responses
      setPendingResponses(prev => {
        const updated = { ...prev };
        delete updated[messageId];
        return updated;
      });

      triggerCelebration(CelebrationType.COLLABORATION, {
        message: "Response sent to agent! 📤",
        intensity: 'subtle'
      });

    } catch (error) {
      console.error('Error sending response to agent:', error);
      throw error;
    }
  }, [ws, isConnected, currentSessionId, triggerCelebration]);

  // Get available agents
  const getAvailableAgents = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/agents/available');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.agents;
    } catch (error) {
      console.error('Error fetching available agents:', error);
      return [];
    }
  }, []);

  // Get agent capabilities
  const getAgentCapabilities = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/agents/capabilities');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching agent capabilities:', error);
      return {};
    }
  }, []);

  // Cancel task
  const cancelTask = useCallback(async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/agents/cancel/${sessionId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update session status
      setActiveSessions(prev => ({
        ...prev,
        [sessionId]: {
          ...prev[sessionId],
          status: 'cancelled'
        }
      }));

      return await response.json();
    } catch (error) {
      console.error('Error cancelling task:', error);
      throw error;
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const value = {
    // Connection state
    isConnected,
    ws,
    
    // Messages and sessions
    agentMessages,
    activeSessions,
    pendingResponses,
    currentSessionId,
    
    // Actions
    sendTaskToAgent,
    sendResponseToAgent,
    getAvailableAgents,
    getAgentCapabilities,
    cancelTask,
    connectWebSocket,
    
    // Utilities
    hasPendingResponses: Object.keys(pendingResponses).length > 0,
    getPendingResponse: (messageId) => pendingResponses[messageId],
    clearMessages: () => setAgentMessages([])
  };

  return (
    <AgentCommunicationContext.Provider value={value}>
      {children}
    </AgentCommunicationContext.Provider>
  );
};
