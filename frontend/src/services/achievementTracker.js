/**
 * Achievement Tracker
 * 
 * Monitors agent activities and automatically detects achievement milestones.
 * Listens to events from all agents and triggers achievement creation when thresholds are crossed.
 */

import achievementsDataService from './achievementsDataService';

class AchievementTracker {
  constructor() {
    this.listeners = [];
    this.agentActivityLog = [];
  }

  /**
   * Track an agent activity and check for achievements
   * @param {object} activity - Agent activity data
   */
  trackActivity(activity) {
    const { agentName, action, category, metric, value, metadata = {} } = activity;

    // Log the activity
    this.logActivity(activity);

    // Check if this crosses any achievement thresholds
    const achievement = achievementsDataService.trackMetric(
      category,
      metric,
      value,
      {
        agentFlow: this.buildAgentFlow(category, metric),
        details: metadata.details || {},
        ...metadata
      }
    );

    if (achievement) {
      // Notify all listeners
      this.notifyListeners(achievement);
      
      // Show celebration
      this.triggerCelebration(achievement);
    }

    return achievement;
  }

  /**
   * Register a listener for new achievements
   */
  onAchievementUnlocked(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners about a new achievement
   */
  notifyListeners(achievement) {
    for (const listener of this.listeners) {
      try {
        listener(achievement);
      } catch (error) {
        console.error('Error in achievement listener:', error);
      }
    }
  }

  /**
   * Log agent activity for building achievement context
   */
  logActivity(activity) {
    this.agentActivityLog.push({
      ...activity,
      timestamp: new Date().toISOString()
    });

    // Keep only last 1000 activities
    if (this.agentActivityLog.length > 1000) {
      this.agentActivityLog = this.agentActivityLog.slice(-1000);
    }
  }

  /**
   * Build agent flow from recent activities
   */
  buildAgentFlow(category, metric) {
    // Get relevant recent activities
    const recentActivities = this.agentActivityLog
      .filter(a => a.category === category || a.metric === metric)
      .slice(-10); // Last 10 relevant activities

    // Group by agent and action
    const agentActions = new Map();
    
    for (const activity of recentActivities) {
      const key = `${activity.agentName}-${activity.action}`;
      if (!agentActions.has(key)) {
        agentActions.set(key, {
          agent: activity.agentName,
          action: activity.action,
          description: activity.description || `${activity.action} in ${category}`,
          timestamp: activity.timestamp
        });
      }
    }

    return Array.from(agentActions.values()).sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
  }

  /**
   * Trigger celebration UI
   */
  triggerCelebration(achievement) {
    // Dispatch custom event for UI to handle
    const event = new CustomEvent('achievement-unlocked', {
      detail: achievement
    });
    window.dispatchEvent(event);

    console.log('🎉 Achievement Unlocked:', achievement.title);
  }

  // ===== HELPER METHODS FOR COMMON INTEGRATIONS =====

  /**
   * Track social media metrics
   */
  trackSocialMetric(platform, metric, value, metadata = {}) {
    return this.trackActivity({
      agentName: 'Social Media Agent',
      action: `Update ${metric}`,
      category: 'social',
      metric: `${platform}_${metric}`,
      value,
      metadata: {
        ...metadata,
        platform,
        details: {
          platform,
          metric,
          value
        }
      }
    });
  }

  /**
   * Track financial metrics
   */
  trackFinancialMetric(metric, value, metadata = {}) {
    return this.trackActivity({
      agentName: 'Financial Intelligence Agent',
      action: `Update ${metric}`,
      category: 'financial',
      metric,
      value,
      metadata: {
        ...metadata,
        details: {
          metric,
          value,
          currency: 'USD'
        }
      }
    });
  }

  /**
   * Track marketing metrics
   */
  trackMarketingMetric(metric, value, campaignId = null, metadata = {}) {
    return this.trackActivity({
      agentName: 'Marketing Agent',
      action: `Campaign Performance`,
      category: 'marketing',
      metric,
      value,
      metadata: {
        ...metadata,
        campaignId,
        details: {
          metric,
          value,
          campaignId
        }
      }
    });
  }

  /**
   * Track growth metrics
   */
  trackGrowthMetric(metric, value, metadata = {}) {
    return this.trackActivity({
      agentName: 'Growth Agent',
      action: `Track ${metric}`,
      category: 'growth',
      metric,
      value,
      metadata: {
        ...metadata,
        details: {
          metric,
          value
        }
      }
    });
  }

  /**
   * Track productivity metrics
   */
  trackProductivityMetric(metric, value, metadata = {}) {
    return this.trackActivity({
      agentName: 'Automation Agent',
      action: `Process Automation`,
      category: 'productivity',
      metric,
      value,
      metadata: {
        ...metadata,
        details: {
          metric,
          value
        }
      }
    });
  }

  /**
   * Track content metrics
   */
  trackContentMetric(metric, value, metadata = {}) {
    return this.trackActivity({
      agentName: 'Content Agent',
      action: `Content Performance`,
      category: 'content',
      metric,
      value,
      metadata: {
        ...metadata,
        details: {
          metric,
          value
        }
      }
    });
  }

  // ===== BATCH TRACKING =====

  /**
   * Track multiple metrics at once (e.g., from a dashboard update)
   */
  trackBatch(activities) {
    const achievements = [];
    
    for (const activity of activities) {
      const achievement = this.trackActivity(activity);
      if (achievement) {
        achievements.push(achievement);
      }
    }
    
    return achievements;
  }

  // ===== INTEGRATION HELPERS =====

  /**
   * Create tracking function for specific agent
   */
  createAgentTracker(agentName, category) {
    return (metric, value, metadata = {}) => {
      return this.trackActivity({
        agentName,
        action: `Update ${metric}`,
        category,
        metric,
        value,
        metadata
      });
    };
  }

  /**
   * Listen to backend events (SSE, WebSocket, etc.)
   */
  connectToBackend() {
    // This would connect to your backend's event stream
    // Example with SSE:
    /*
    const eventSource = new EventSource('/api/metrics/stream');
    
    eventSource.addEventListener('metric_update', (event) => {
      const data = JSON.parse(event.data);
      this.trackActivity(data);
    });
    
    return () => eventSource.close();
    */
    
    console.log('Backend connection would be established here');
  }

  /**
   * Sync with analytics platforms
   */
  async syncAnalytics() {
    try {
      // Fetch latest metrics from analytics endpoints
      const [social, financial, marketing] = await Promise.all([
        fetch('/api/analytics/social').then(r => r.json()).catch(() => null),
        fetch('/api/analytics/financial').then(r => r.json()).catch(() => null),
        fetch('/api/analytics/marketing').then(r => r.json()).catch(() => null)
      ]);

      // Track each metric
      if (social) {
        for (const [metric, value] of Object.entries(social)) {
          this.trackSocialMetric('instagram', metric, value);
        }
      }

      if (financial) {
        for (const [metric, value] of Object.entries(financial)) {
          this.trackFinancialMetric(metric, value);
        }
      }

      if (marketing) {
        for (const [metric, value] of Object.entries(marketing)) {
          this.trackMarketingMetric(metric, value);
        }
      }

      console.log('Analytics synced successfully');
    } catch (error) {
      console.error('Failed to sync analytics:', error);
    }
  }

  /**
   * Manual achievement creation (for testing or manual entry)
   */
  createManualAchievement(data) {
    const achievement = achievementsDataService.createAchievement(
      data.category,
      data.metric,
      data.currentValue,
      data.thresholdValue,
      {
        ...data.metadata,
        type: 'manual',
        source: 'manual_entry'
      }
    );

    this.notifyListeners(achievement);
    this.triggerCelebration(achievement);

    return achievement;
  }
}

// Export singleton instance
const achievementTracker = new AchievementTracker();

// Auto-connect to backend if available
if (typeof window !== 'undefined') {
  // Try to sync analytics periodically (every 5 minutes)
  setInterval(() => {
    achievementTracker.syncAnalytics();
  }, 5 * 60 * 1000);
}

export default achievementTracker;

