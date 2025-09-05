import { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';

// Custom hook for using the data service
export const useDataService = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize the data service
    dataService.initialize();

    // Subscribe to connection status
    const unsubscribe = dataService.subscribe('connection', (data) => {
      setIsConnected(data.status === 'connected');
    });

    return () => {
      unsubscribe();
      dataService.destroy();
    };
  }, []);

  return {
    isConnected,
    error,
    dataService
  };
};

// Hook for real-time data updates
export const useRealtimeData = (dataType, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let newData;
      switch (dataType) {
        case 'businessPulse':
          newData = await dataService.getBusinessPulseData();
          break;
        case 'financialFlow':
          newData = await dataService.getFinancialFlowData();
          break;
        case 'customerJourney':
          newData = await dataService.getCustomerJourneyData();
          break;
        case 'agentStatus':
          newData = await dataService.getAgentStatusData();
          break;
        case 'workflows':
          newData = await dataService.getWorkflowData();
          break;
        case 'opportunities':
          newData = await dataService.getOpportunityData();
          break;
        case 'contentPerformance':
          newData = await dataService.getContentPerformanceData();
          break;
        case 'progressMomentum':
          newData = await dataService.getProgressMomentumData();
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }
      
      setData(newData);
    } catch (err) {
      setError(err.message);
      console.error(`Failed to fetch ${dataType} data:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [dataType]);

  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Subscribe to real-time updates
    const unsubscribe = dataService.subscribe(dataType, (newData) => {
      setData(newData);
    });

    // Set up periodic refresh (fallback for when WebSocket is not available)
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [dataType, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
};

// Hook for workflow operations
export const useWorkflow = () => {
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createWorkflow = useCallback(async (userInput) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await dataService.createWorkflow(userInput);
      
      // Refresh workflows list
      const updatedWorkflows = await dataService.getWorkflowData();
      setWorkflows(updatedWorkflows);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getWorkflowStatus = useCallback(async (workflowId) => {
    try {
      return await dataService.getWorkflowStatus(workflowId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getWorkflowExecutions = useCallback(async (workflowId) => {
    try {
      return await dataService.getWorkflowExecutions(workflowId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    // Initial workflows fetch
    const fetchWorkflows = async () => {
      try {
        setIsLoading(true);
        const data = await dataService.getWorkflowData();
        setWorkflows(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();

    // Subscribe to workflow updates
    const unsubscribe = dataService.subscribe('workflow', (newData) => {
      setWorkflows(prev => {
        const existingIndex = prev.findIndex(w => w.id === newData.id);
        if (existingIndex >= 0) {
          // Update existing workflow
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...newData };
          return updated;
        } else {
          // Add new workflow
          return [...prev, newData];
        }
      });
    });

    return unsubscribe;
  }, []);

  return {
    workflows,
    isLoading,
    error,
    createWorkflow,
    getWorkflowStatus,
    getWorkflowExecutions
  };
};

// Hook for agent operations
export const useAgents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial agents fetch
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const data = await dataService.getAgentStatusData();
        setAgents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();

    // Subscribe to agent updates
    const unsubscribe = dataService.subscribe('agent', (newData) => {
      setAgents(prev => {
        const existingIndex = prev.findIndex(a => a.id === newData.id);
        if (existingIndex >= 0) {
          // Update existing agent
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...newData };
          return updated;
        } else {
          // Add new agent
          return [...prev, newData];
        }
      });
    });

    return unsubscribe;
  }, []);

  return {
    agents,
    isLoading,
    error
  };
};
