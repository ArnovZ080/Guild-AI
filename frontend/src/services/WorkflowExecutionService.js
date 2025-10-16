/**
 * Workflow Execution Service
 * Manages running workflows and their status tracking
 */

class WorkflowExecutionService {
  constructor() {
    this.runningWorkflowsKey = 'guild_running_workflows';
    this.completedWorkflowsKey = 'guild_completed_workflows';
  }

  /**
   * Get all running workflows
   * @returns {Array} Array of running workflows
   */
  getRunningWorkflows() {
    try {
      const workflows = localStorage.getItem(this.runningWorkflowsKey);
      return workflows ? JSON.parse(workflows) : [];
    } catch (error) {
      console.error('Failed to get running workflows:', error);
      return [];
    }
  }

  /**
   * Get all completed workflows
   * @returns {Array} Array of completed workflows
   */
  getCompletedWorkflows() {
    try {
      const workflows = localStorage.getItem(this.completedWorkflowsKey);
      return workflows ? JSON.parse(workflows) : [];
    } catch (error) {
      console.error('Failed to get completed workflows:', error);
      return [];
    }
  }

  /**
   * Add a new running workflow
   * @param {Object} workflow - Workflow object with execution details
   */
  addRunningWorkflow(workflow) {
    try {
      const workflows = this.getRunningWorkflows();
      workflows.push({
        ...workflow,
        id: workflow.id || `wf_${Date.now()}`,
        status: 'running',
        started_at: workflow.started_at || new Date().toISOString(),
        last_updated: new Date().toISOString()
      });
      localStorage.setItem(this.runningWorkflowsKey, JSON.stringify(workflows));
      return workflow.id;
    } catch (error) {
      console.error('Failed to add running workflow:', error);
      throw error;
    }
  }

  /**
   * Update workflow status
   * @param {string} workflowId - Workflow ID
   * @param {string} status - New status (running, completed, failed, paused)
   * @param {Object} updates - Additional updates
   */
  updateWorkflowStatus(workflowId, status, updates = {}) {
    try {
      const workflows = this.getRunningWorkflows();
      const index = workflows.findIndex(w => w.id === workflowId);
      
      if (index !== -1) {
        workflows[index] = {
          ...workflows[index],
          status,
          last_updated: new Date().toISOString(),
          ...updates
        };

        // Move to completed if finished
        if (status === 'completed' || status === 'failed') {
          const completedWorkflow = workflows[index];
          completedWorkflow.completed_at = new Date().toISOString();
          
          // Add to completed workflows
          const completed = this.getCompletedWorkflows();
          completed.push(completedWorkflow);
          localStorage.setItem(this.completedWorkflowsKey, JSON.stringify(completed));
          
          // Remove from running
          workflows.splice(index, 1);
        }

        localStorage.setItem(this.runningWorkflowsKey, JSON.stringify(workflows));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update workflow status:', error);
      return false;
    }
  }

  /**
   * Get workflow by ID
   * @param {string} workflowId - Workflow ID
   * @returns {Object|null} Workflow object or null
   */
  getWorkflow(workflowId) {
    const running = this.getRunningWorkflows();
    const completed = this.getCompletedWorkflows();
    
    return running.find(w => w.id === workflowId) || 
           completed.find(w => w.id === workflowId) || 
           null;
  }

  /**
   * Stop/cancel a running workflow
   * @param {string} workflowId - Workflow ID
   */
  stopWorkflow(workflowId) {
    return this.updateWorkflowStatus(workflowId, 'cancelled', {
      cancelled_at: new Date().toISOString()
    });
  }

  /**
   * Get workflow execution history
   * @param {string} workflowId - Workflow ID
   * @returns {Array} Array of execution events
   */
  getWorkflowHistory(workflowId) {
    const workflow = this.getWorkflow(workflowId);
    return workflow ? (workflow.execution_history || []) : [];
  }

  /**
   * Add execution event to workflow history
   * @param {string} workflowId - Workflow ID
   * @param {Object} event - Event object
   */
  addExecutionEvent(workflowId, event) {
    try {
      const workflows = this.getRunningWorkflows();
      const index = workflows.findIndex(w => w.id === workflowId);
      
      if (index !== -1) {
        if (!workflows[index].execution_history) {
          workflows[index].execution_history = [];
        }
        
        workflows[index].execution_history.push({
          ...event,
          timestamp: new Date().toISOString()
        });
        
        localStorage.setItem(this.runningWorkflowsKey, JSON.stringify(workflows));
      }
    } catch (error) {
      console.error('Failed to add execution event:', error);
    }
  }

  /**
   * Get workflow statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const running = this.getRunningWorkflows();
    const completed = this.getCompletedWorkflows();
    
    const totalExecutions = running.length + completed.length;
    const successRate = completed.length > 0 
      ? (completed.filter(w => w.status === 'completed').length / completed.length) * 100 
      : 0;
    
    const avgExecutionTime = completed.length > 0
      ? completed.reduce((sum, w) => {
          const start = new Date(w.started_at);
          const end = new Date(w.completed_at || new Date());
          return sum + (end - start);
        }, 0) / completed.length
      : 0;

    return {
      totalExecutions,
      runningCount: running.length,
      completedCount: completed.length,
      successRate: Math.round(successRate),
      avgExecutionTimeMs: Math.round(avgExecutionTime),
      avgExecutionTimeMinutes: Math.round(avgExecutionTime / (1000 * 60))
    };
  }

  /**
   * Clear all workflow data (for testing/reset)
   */
  clearAll() {
    localStorage.removeItem(this.runningWorkflowsKey);
    localStorage.removeItem(this.completedWorkflowsKey);
  }
}

// Export singleton instance
const workflowExecutionService = new WorkflowExecutionService();
export default workflowExecutionService;
