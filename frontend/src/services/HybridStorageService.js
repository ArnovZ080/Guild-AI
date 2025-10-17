/**
 * Hybrid Storage Service
 * 
 * This service provides hybrid storage functionality that saves data to both
 * localStorage (for immediate responsiveness) and the backend API (for persistence).
 * It handles sync, conflict resolution, and graceful fallbacks.
 */

import apiService from './api.js';

class HybridStorageService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.syncInProgress = false;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Auto-sync when the service is initialized
    this.initializeSync();
  }

  /**
   * Initialize sync on service startup
   */
  async initializeSync() {
    if (this.isOnline) {
      await this.syncPendingData();
    }
  }

  /**
   * Save agent configuration with hybrid storage
   */
  async saveAgentConfiguration(agentId, configuration) {
    const configData = {
      agent_id: agentId,
      agent_name: configuration.agentName || 'Unknown Agent',
      custom_instructions: configuration.customInstructions || '',
      duration: configuration.duration || 'indefinite',
      priority: configuration.priority || 'normal',
      notifications: configuration.notifications !== false,
      custom_config: configuration.custom_config || null,
      updated_at: new Date().toISOString()
    };

    // Always save to localStorage first (immediate responsiveness)
    this.saveToLocalStorage('agent_configurations', agentId, configData);

    // Try to save to backend if online
    if (this.isOnline) {
      try {
        const response = await apiService.post('/user-config/agent-configs', configData);
        if (response.success) {
          console.log('Agent configuration saved to backend:', agentId);
          // Update localStorage with server timestamp
          configData.synced_at = new Date().toISOString();
          this.saveToLocalStorage('agent_configurations', agentId, configData);
        }
      } catch (error) {
        console.warn('Failed to save agent configuration to backend:', error);
        // Queue for later sync
        this.queueForSync('agent_configuration', agentId, configData);
      }
    } else {
      // Queue for later sync when online
      this.queueForSync('agent_configuration', agentId, configData);
    }

    return configData;
  }

  /**
   * Get agent configuration with hybrid storage
   */
  async getAgentConfiguration(agentId) {
    // First try to get from localStorage (fastest)
    const localConfig = this.getFromLocalStorage('agent_configurations', agentId);
    
    // If online, try to get from backend and merge
    if (this.isOnline && !localConfig) {
      try {
        const response = await apiService.get(`/user-config/agent-configs/${agentId}`);
        if (response.success && response.data) {
          // Save to localStorage for future use
          this.saveToLocalStorage('agent_configurations', agentId, response.data);
          return response.data;
        }
      } catch (error) {
        console.warn('Failed to get agent configuration from backend:', error);
      }
    }
    
    return localConfig;
  }

  /**
   * Get all agent configurations with hybrid storage
   */
  async getAllAgentConfigurations() {
    // Get from localStorage first
    const localConfigs = this.getAllFromLocalStorage('agent_configurations');
    
    // If online, sync with backend
    if (this.isOnline) {
      try {
        const response = await apiService.get('/user-config/agent-configs');
        if (response.success && response.data) {
          // Merge local and server data (server takes precedence for conflicts)
          const mergedConfigs = this.mergeConfigurations(localConfigs, response.data);
          
          // Update localStorage with merged data
          this.saveAllToLocalStorage('agent_configurations', mergedConfigs);
          
          return mergedConfigs;
        }
      } catch (error) {
        console.warn('Failed to get agent configurations from backend:', error);
      }
    }
    
    return localConfigs;
  }

  /**
   * Save workflow template with hybrid storage
   */
  async saveWorkflowTemplate(workflowId, templateData) {
    const template = {
      workflow_id: workflowId,
      name: templateData.name || 'Untitled Workflow',
      description: templateData.description || '',
      workflow_data: templateData.workflow_data || {},
      is_public: templateData.is_public || false,
      tags: templateData.tags || [],
      updated_at: new Date().toISOString()
    };

    // Always save to localStorage first
    this.saveToLocalStorage('workflow_templates', workflowId, template);

    // Try to save to backend if online
    if (this.isOnline) {
      try {
        const response = await apiService.post('/user-config/workflow-templates', template);
        if (response.success) {
          console.log('Workflow template saved to backend:', workflowId);
          template.synced_at = new Date().toISOString();
          this.saveToLocalStorage('workflow_templates', workflowId, template);
        }
      } catch (error) {
        console.warn('Failed to save workflow template to backend:', error);
        this.queueForSync('workflow_template', workflowId, template);
      }
    } else {
      this.queueForSync('workflow_template', workflowId, template);
    }

    return template;
  }

  /**
   * Get all workflow templates with hybrid storage
   */
  async getAllWorkflowTemplates() {
    const localTemplates = this.getAllFromLocalStorage('workflow_templates');
    
    if (this.isOnline) {
      try {
        const response = await apiService.get('/user-config/workflow-templates');
        if (response.success && response.data) {
          const mergedTemplates = this.mergeConfigurations(localTemplates, response.data);
          this.saveAllToLocalStorage('workflow_templates', mergedTemplates);
          return mergedTemplates;
        }
      } catch (error) {
        console.warn('Failed to get workflow templates from backend:', error);
      }
    }
    
    return localTemplates;
  }

  /**
   * Delete agent configuration with hybrid storage
   */
  async deleteAgentConfiguration(agentId) {
    // Remove from localStorage
    this.removeFromLocalStorage('agent_configurations', agentId);

    // Try to delete from backend if online
    if (this.isOnline) {
      try {
        const response = await apiService.delete(`/user-config/agent-configs/${agentId}`);
        if (response.success) {
          console.log('Agent configuration deleted from backend:', agentId);
        }
      } catch (error) {
        console.warn('Failed to delete agent configuration from backend:', error);
      }
    }

    return true;
  }

  /**
   * Delete workflow template with hybrid storage
   */
  async deleteWorkflowTemplate(workflowId) {
    // Remove from localStorage
    this.removeFromLocalStorage('workflow_templates', workflowId);

    // Try to delete from backend if online
    if (this.isOnline) {
      try {
        const response = await apiService.delete(`/user-config/workflow-templates/${workflowId}`);
        if (response.success) {
          console.log('Workflow template deleted from backend:', workflowId);
        }
      } catch (error) {
        console.warn('Failed to delete workflow template from backend:', error);
      }
    }

    return true;
  }

  /**
   * Sync all pending data to the backend
   */
  async syncPendingData() {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;

    try {
      // Get all local data
      const localData = {
        agent_configurations: this.getAllFromLocalStorage('agent_configurations'),
        workflow_templates: this.getAllFromLocalStorage('workflow_templates')
      };

      // Sync with backend
      const response = await apiService.post('/user-config/sync', localData);
      if (response.success) {
        console.log('Data synced successfully to backend');
        this.clearSyncQueue();
      }
    } catch (error) {
      console.warn('Failed to sync data to backend:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Queue data for later sync
   */
  queueForSync(type, id, data) {
    this.syncQueue.push({ type, id, data, timestamp: Date.now() });
    
    // Store queue in localStorage
    localStorage.setItem('guild_sync_queue', JSON.stringify(this.syncQueue));
  }

  /**
   * Clear sync queue
   */
  clearSyncQueue() {
    this.syncQueue = [];
    localStorage.removeItem('guild_sync_queue');
  }

  /**
   * Load sync queue from localStorage
   */
  loadSyncQueue() {
    const queueData = localStorage.getItem('guild_sync_queue');
    if (queueData) {
      try {
        this.syncQueue = JSON.parse(queueData);
      } catch (error) {
        console.warn('Failed to parse sync queue:', error);
        this.syncQueue = [];
      }
    }
  }

  // LocalStorage helper methods
  saveToLocalStorage(category, id, data) {
    const key = `guild_${category}`;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    existing[id] = data;
    localStorage.setItem(key, JSON.stringify(existing));
  }

  getFromLocalStorage(category, id) {
    const key = `guild_${category}`;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    return existing[id] || null;
  }

  getAllFromLocalStorage(category) {
    const key = `guild_${category}`;
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  saveAllToLocalStorage(category, data) {
    const key = `guild_${category}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  removeFromLocalStorage(category, id) {
    const key = `guild_${category}`;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    delete existing[id];
    localStorage.setItem(key, JSON.stringify(existing));
  }

  /**
   * Merge local and server configurations (server takes precedence for conflicts)
   */
  mergeConfigurations(local, server) {
    const merged = { ...local };
    
    for (const [id, serverConfig] of Object.entries(server)) {
      const localConfig = local[id];
      
      if (!localConfig) {
        // Server has data that local doesn't have
        merged[id] = serverConfig;
      } else {
        // Compare timestamps - use the newer one
        const localTime = new Date(localConfig.updated_at || 0).getTime();
        const serverTime = new Date(serverConfig.updated_at || 0).getTime();
        
        if (serverTime >= localTime) {
          merged[id] = serverConfig;
        }
        // Otherwise keep local (it's newer)
      }
    }
    
    return merged;
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingSyncCount: this.syncQueue.length,
      lastSyncAttempt: localStorage.getItem('guild_last_sync_attempt')
    };
  }

  /**
   * Force sync all data
   */
  async forceSync() {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    
    await this.syncPendingData();
  }
}

// Create singleton instance
const hybridStorageService = new HybridStorageService();

export default hybridStorageService;
