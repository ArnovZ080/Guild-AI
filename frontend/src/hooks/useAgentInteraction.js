import { useState, useCallback } from 'react';
import agentService from '../services/agentService';

export const useAgentInteraction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const executeAgentAction = useCallback(async (action, data = {}) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await agentService.interactWithAgent(action, data);
      setResult(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAgentStatus = useCallback(async (agentType) => {
    try {
      return await agentService.getAgentStatus(agentType);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getAllAgentsStatus = useCallback(async () => {
    try {
      return await agentService.getAllAgentsStatus();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    executeAgentAction,
    getAgentStatus,
    getAllAgentsStatus,
    isLoading,
    error,
    result
  };
};
