/**
 * Dashboard Orchestrator Integration Hook
 * Connects all dashboards to enhanced orchestrator for autonomous operations
 */

import { useState, useEffect, useCallback } from 'react';
import enhancedOrchestratorService from '../services/EnhancedOrchestratorService.js';

/**
 * Hook for integrating dashboards with enhanced orchestrator
 * Enables any dashboard to trigger autonomous multi-agent workflows
 */
export const useOrchestratorDashboard = (dashboardType, userId) => {
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [lastOrchestration, setLastOrchestration] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Trigger autonomous workflow from dashboard action
   * @param {string} action - Action to perform
   * @param {Object} parameters - Action parameters
   * @returns {Promise<Object>} Orchestration result
   */
  const triggerOrchestration = useCallback(async (action, parameters = {}) => {
    setIsOrchestrating(true);
    setError(null);

    try {
      const result = await enhancedOrchestratorService.triggerDashboardOrchestration(
        dashboardType,
        action,
        userId,
        parameters
      );

      if (result.success) {
        setLastOrchestration(result);
        setActiveWorkflows(prev => [...prev, {
          id: result.workflow_id,
          action,
          started: new Date().toISOString(),
          status: 'running'
        }]);
        
        return result;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsOrchestrating(false);
    }
  }, [dashboardType, userId]);

  /**
   * Get workflow status
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Workflow status
   */
  const getWorkflowStatus = useCallback(async (workflowId) => {
    const result = await enhancedOrchestratorService.getWorkflowStatus(workflowId);
    return result;
  }, []);

  /**
   * Monitor active workflows and update their status
   */
  useEffect(() => {
    if (activeWorkflows.length === 0) return;

    const interval = setInterval(async () => {
      const updatedWorkflows = await Promise.all(
        activeWorkflows.map(async (workflow) => {
          const status = await getWorkflowStatus(workflow.id);
          return {
            ...workflow,
            status: status.status || workflow.status,
            progress: status.progress
          };
        })
      );

      setActiveWorkflows(updatedWorkflows);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeWorkflows, getWorkflowStatus]);

  return {
    triggerOrchestration,
    getWorkflowStatus,
    isOrchestrating,
    activeWorkflows,
    lastOrchestration,
    error
  };
};

/**
 * Hook for Customer Dashboard orchestration
 */
export const useCustomerDashboardOrchestration = (userId) => {
  const orchestrator = useOrchestratorDashboard('customer', userId);

  return {
    ...orchestrator,
    // Customer-specific actions
    analyzeSentiment: (customerId) => orchestrator.triggerOrchestration('analyze_sentiment', { customer_id: customerId }),
    enrichCustomerData: (customerId) => orchestrator.triggerOrchestration('enrich_data', { customer_id: customerId }),
    predictChurn: (customerId) => orchestrator.triggerOrchestration('predict_churn', { customer_id: customerId }),
    createRetentionCampaign: (customerId) => orchestrator.triggerOrchestration('retention_campaign', { customer_id: customerId })
  };
};

/**
 * Hook for Financial Dashboard orchestration
 */
export const useFinancialDashboardOrchestration = (userId) => {
  const orchestrator = useOrchestratorDashboard('financial', userId);

  return {
    ...orchestrator,
    // Financial-specific actions
    generateForecast: (timeframe) => orchestrator.triggerOrchestration('generate_forecast', { timeframe }),
    optimizeExpenses: () => orchestrator.triggerOrchestration('optimize_expenses', {}),
    analyzeRevenue: () => orchestrator.triggerOrchestration('analyze_revenue', {}),
    createFinancialReport: (reportType) => orchestrator.triggerOrchestration('create_report', { report_type: reportType })
  };
};

/**
 * Hook for Content Dashboard orchestration
 */
export const useContentDashboardOrchestration = (userId) => {
  const orchestrator = useOrchestratorDashboard('content', userId);

  return {
    ...orchestrator,
    // Content-specific actions
    optimizeContent: (contentId) => orchestrator.triggerOrchestration('optimize_performance', { content_id: contentId }),
    scheduleContent: (contentId, schedule) => orchestrator.triggerOrchestration('schedule_content', { content_id: contentId, schedule }),
    generateContent: (contentType) => orchestrator.triggerOrchestration('generate_content', { content_type: contentType }),
    analyzePerformance: (timeframe) => orchestrator.triggerOrchestration('analyze_performance', { timeframe })
  };
};

/**
 * Hook for Business Intelligence Dashboard orchestration
 */
export const useBusinessDashboardOrchestration = (userId) => {
  const orchestrator = useOrchestratorDashboard('business', userId);

  return {
    ...orchestrator,
    // Business intelligence actions
    generateInsights: () => orchestrator.triggerOrchestration('generate_insights', {}),
    identifyOpportunities: () => orchestrator.triggerOrchestration('identify_opportunities', {}),
    createCEOSnapshot: () => orchestrator.triggerOrchestration('create_ceo_snapshot', {}),
    analyzeCompetition: () => orchestrator.triggerOrchestration('analyze_competition', {})
  };
};

/**
 * Hook for Campaign Dashboard orchestration
 */
export const useCampaignDashboardOrchestration = (userId) => {
  const orchestrator = useOrchestratorDashboard('campaign', userId);

  return {
    ...orchestrator,
    // Campaign-specific actions
    createCampaign: (campaignData) => orchestrator.triggerOrchestration('create_campaign', campaignData),
    optimizeCampaign: (campaignId) => orchestrator.triggerOrchestration('optimize_campaign', { campaign_id: campaignId }),
    analyzeCampaignPerformance: (campaignId) => orchestrator.triggerOrchestration('analyze_performance', { campaign_id: campaignId }),
    pauseCampaign: (campaignId) => orchestrator.triggerOrchestration('pause_campaign', { campaign_id: campaignId })
  };
};

