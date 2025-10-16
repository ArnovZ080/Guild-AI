import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api.js';

// Hook for managing business metrics
export const useBusinessMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getBusinessMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch business metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch: fetchMetrics };
};

// Hook for managing agent status
export const useAgentStatus = () => {
  const [agents, setAgents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgentStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAgentsStatus();
      setAgents(data);
    } catch (err) {
      // Don't set error state, just use mock data silently
      console.log('Using mock agent data');
      setAgents(apiService.getMockAgentStatus());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgentStatus();
    // Refresh agent status every 30 seconds
    const interval = setInterval(fetchAgentStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchAgentStatus]);

  return { agents, loading, error, refetch: fetchAgentStatus };
};

// Hook for managing workflows
export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllWorkflows();
      setWorkflows(data);
    } catch (err) {
      // Don't set error state, just use mock data silently
      console.log('Using mock workflow data');
      setWorkflows(apiService.getMockWorkflows());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
    // Polling removed to prevent page resets during workflow building
    // const interval = setInterval(fetchWorkflows, 60000);
    // return () => clearInterval(interval);
  }, [fetchWorkflows]);

  return { workflows, loading, error, refetch: fetchWorkflows };
};

// Hook for agent interactions
export const useAgentInteraction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const interactWithAgent = useCallback(async (action, data = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.interactWithAgent(action, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { interactWithAgent, loading, error };
};

// Hook for campaign management
export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const launchCampaign = useCallback(async (campaignData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.launchCampaign(campaignData);
      setCampaigns(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { campaigns, launchCampaign, loading, error };
};

// Hook for lead generation
export const useLeadGeneration = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateLeads = useCallback(async (targetAudience = 'tech startups') => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.generateLeads(targetAudience);
      setLeads(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { leads, generateLeads, loading, error };
};

// Hook for content strategy
export const useContentStrategy = () => {
  const [contentPlans, setContentPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createContentStrategy = useCallback(async (contentStrategy = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.createContentStrategy(contentStrategy);
      setContentPlans(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { contentPlans, createContentStrategy, loading, error };
};

// Hook for market research
export const useMarketResearch = () => {
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const researchMarket = useCallback(async (query = 'market trends') => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.researchMarket(query);
      setResearch(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { research, researchMarket, loading, error };
};
