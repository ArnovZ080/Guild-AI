/**
 * Achievements Data Service
 * 
 * Manages achievement tracking, storage, and backend integration.
 * Monitors agent activities and automatically detects milestone achievements.
 */

const ACHIEVEMENTS_STORAGE_KEY = 'guild_achievements';
const ACHIEVEMENT_THRESHOLDS_KEY = 'guild_achievement_thresholds';

// Default achievement thresholds (these can be customized by the user)
const DEFAULT_THRESHOLDS = {
  social: {
    instagram_followers: [100, 500, 1000, 5000, 10000, 50000, 100000],
    twitter_followers: [100, 500, 1000, 5000, 10000, 50000, 100000],
    linkedin_connections: [100, 500, 1000, 2500, 5000, 10000],
    facebook_likes: [100, 500, 1000, 5000, 10000, 50000],
    tiktok_followers: [100, 500, 1000, 10000, 50000, 100000],
    youtube_subscribers: [100, 500, 1000, 10000, 50000, 100000],
    post_engagement_rate: [5, 10, 15, 20, 25], // percentage
    reel_views: [1000, 5000, 10000, 50000, 100000, 500000, 1000000],
    video_views: [1000, 5000, 10000, 50000, 100000, 500000, 1000000]
  },
  financial: {
    monthly_revenue: [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000],
    annual_revenue: [10000, 50000, 100000, 250000, 500000, 1000000],
    profit_margin: [10, 15, 20, 25, 30, 35, 40], // percentage
    cost_reduction: [5, 10, 15, 20, 25, 30], // percentage
    mrr_growth: [10, 25, 50, 100], // percentage
    customer_ltv: [100, 500, 1000, 2500, 5000, 10000]
  },
  marketing: {
    email_open_rate: [15, 20, 25, 30, 35, 40], // percentage
    email_click_rate: [2, 5, 8, 10, 15, 20], // percentage
    campaign_roi: [200, 300, 400, 500, 1000], // percentage
    conversion_rate: [1, 2, 3, 5, 7, 10], // percentage
    lead_generation: [100, 500, 1000, 5000, 10000],
    campaign_impressions: [10000, 50000, 100000, 500000, 1000000]
  },
  growth: {
    total_customers: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
    active_users: [50, 100, 500, 1000, 5000, 10000, 50000],
    customer_retention: [70, 75, 80, 85, 90, 95], // percentage
    churn_rate_reduction: [5, 10, 15, 20, 25], // percentage (lower is better)
    nps_score: [30, 40, 50, 60, 70, 80, 90]
  },
  productivity: {
    automation_percentage: [10, 25, 50, 75, 90], // percentage
    tasks_automated: [10, 25, 50, 100, 250, 500],
    time_saved_hours: [10, 50, 100, 250, 500, 1000],
    process_efficiency: [10, 20, 30, 40, 50], // percentage improvement
  },
  team: {
    team_size: [5, 10, 25, 50, 100],
    employee_satisfaction: [70, 75, 80, 85, 90, 95], // percentage
    training_completion: [50, 75, 90, 100], // percentage
  },
  content: {
    content_pieces_published: [10, 50, 100, 250, 500, 1000],
    blog_traffic: [1000, 5000, 10000, 50000, 100000],
    content_engagement: [5, 10, 15, 20, 25], // percentage
  }
};

class AchievementsDataService {
  constructor() {
    this.achievements = this.loadAchievements();
    this.thresholds = this.loadThresholds();
  }

  // ===== STORAGE MANAGEMENT =====
  
  loadAchievements() {
    try {
      const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading achievements:', error);
      return [];
    }
  }

  saveAchievements() {
    try {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(this.achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  loadThresholds() {
    try {
      const stored = localStorage.getItem(ACHIEVEMENT_THRESHOLDS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_THRESHOLDS;
    } catch (error) {
      console.error('Error loading thresholds:', error);
      return DEFAULT_THRESHOLDS;
    }
  }

  saveThresholds() {
    try {
      localStorage.setItem(ACHIEVEMENT_THRESHOLDS_KEY, JSON.stringify(this.thresholds));
    } catch (error) {
      console.error('Error saving thresholds:', error);
    }
  }

  // ===== ACHIEVEMENT TRACKING =====

  /**
   * Track a metric and check if it crossed any achievement thresholds
   * @param {string} category - Category of the metric (social, financial, etc.)
   * @param {string} metric - Specific metric name
   * @param {number} value - Current value
   * @param {object} metadata - Additional context (agents involved, actions taken, etc.)
   * @returns {object|null} Achievement object if threshold was crossed, null otherwise
   */
  trackMetric(category, metric, value, metadata = {}) {
    const categoryThresholds = this.thresholds[category];
    if (!categoryThresholds || !categoryThresholds[metric]) {
      console.warn(`No thresholds defined for ${category}.${metric}`);
      return null;
    }

    const thresholds = categoryThresholds[metric];
    const alreadyAchieved = this.achievements
      .filter(a => a.category === category && a.metric === metric)
      .map(a => a.thresholdValue);

    // Find the highest threshold that was crossed but not yet achieved
    let crossedThreshold = null;
    for (const threshold of thresholds) {
      if (value >= threshold && !alreadyAchieved.includes(threshold)) {
        crossedThreshold = threshold;
      }
    }

    if (crossedThreshold) {
      return this.createAchievement(category, metric, value, crossedThreshold, metadata);
    }

    return null;
  }

  /**
   * Create a new achievement
   */
  createAchievement(category, metric, currentValue, thresholdValue, metadata = {}) {
    const achievement = {
      id: `achievement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      metric,
      currentValue,
      thresholdValue,
      title: this.generateAchievementTitle(category, metric, thresholdValue),
      description: this.generateAchievementDescription(category, metric, thresholdValue, currentValue),
      achievedAt: new Date().toISOString(),
      status: 'completed',
      impact: this.calculateImpact(category, metric, thresholdValue),
      celebration: this.generateCelebration(category, metric, thresholdValue),
      icon: this.getIconName(category),
      type: metadata.type || 'milestone',
      agentFlow: metadata.agentFlow || [],
      details: metadata.details || {},
      metadata: {
        ...metadata,
        source: 'automatic', // vs 'manual' or 'goal'
        nextThreshold: this.getNextThreshold(category, metric, thresholdValue)
      }
    };

    this.achievements.push(achievement);
    this.saveAchievements();

    // Trigger backend sync (if API is available)
    this.syncToBackend(achievement).catch(error => {
      console.warn('Backend sync failed:', error);
    });

    return achievement;
  }

  // ===== BACKEND INTEGRATION =====

  async syncToBackend(achievement) {
    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achievement)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Achievement synced to backend:', data);
        return data;
      }
    } catch (error) {
      // Silently fail - data is already saved locally
      console.warn('Achievement sync failed, but saved locally');
    }
    return achievement;
  }

  async fetchAchievementsFromBackend() {
    try {
      const response = await fetch('/api/achievements');
      if (response.ok) {
        const achievements = await response.json();
        // Merge with local achievements
        this.achievements = this.mergeAchievements(achievements, this.achievements);
        this.saveAchievements();
        return this.achievements;
      }
    } catch (error) {
      console.warn('Failed to fetch from backend, using local data');
    }
    return this.achievements;
  }

  mergeAchievements(remote, local) {
    const merged = [...remote];
    const remoteIds = new Set(remote.map(a => a.id));
    
    // Add local achievements that aren't in remote
    for (const localAch of local) {
      if (!remoteIds.has(localAch.id)) {
        merged.push(localAch);
      }
    }
    
    return merged.sort((a, b) => 
      new Date(b.achievedAt) - new Date(a.achievedAt)
    );
  }

  // ===== UTILITY METHODS =====

  generateAchievementTitle(category, metric, value) {
    const titles = {
      social: {
        instagram_followers: `${value.toLocaleString()} Instagram Followers!`,
        twitter_followers: `${value.toLocaleString()} Twitter Followers!`,
        linkedin_connections: `${value.toLocaleString()} LinkedIn Connections!`,
        reel_views: `${value.toLocaleString()} Reel Views!`,
        post_engagement_rate: `${value}% Engagement Rate!`
      },
      financial: {
        monthly_revenue: `$${value.toLocaleString()} Monthly Revenue!`,
        profit_margin: `${value}% Profit Margin!`,
        cost_reduction: `${value}% Cost Reduction!`
      },
      marketing: {
        email_open_rate: `${value}% Email Open Rate!`,
        campaign_roi: `${value}% Campaign ROI!`,
        conversion_rate: `${value}% Conversion Rate!`
      },
      growth: {
        total_customers: `${value.toLocaleString()} Total Customers!`,
        customer_retention: `${value}% Customer Retention!`
      }
    };

    return titles[category]?.[metric] || `${metric} milestone: ${value}`;
  }

  generateAchievementDescription(category, metric, threshold, current) {
    return `Successfully reached ${threshold.toLocaleString()} in ${metric.replace(/_/g, ' ')}. Current value: ${current.toLocaleString()}`;
  }

  generateCelebration(category, metric, value) {
    const celebrations = {
      social: '🎉 Social media milestone reached!',
      financial: '💰 Financial goal achieved!',
      marketing: '📈 Marketing success!',
      growth: '🚀 Growth milestone!',
      productivity: '⚡ Productivity boost!',
      team: '👥 Team milestone!',
      content: '✍️ Content achievement!'
    };
    return celebrations[category] || '🎊 Milestone achieved!';
  }

  calculateImpact(category, metric, value) {
    // Simple heuristic - can be made more sophisticated
    const highImpactMetrics = ['monthly_revenue', 'total_customers', 'profit_margin'];
    const mediumImpactMetrics = ['email_open_rate', 'customer_retention', 'automation_percentage'];
    
    if (highImpactMetrics.includes(metric) || value >= 10000) return 'high';
    if (mediumImpactMetrics.includes(metric) || value >= 1000) return 'medium';
    return 'low';
  }

  getIconName(category) {
    const icons = {
      social: 'Globe',
      financial: 'DollarSign',
      marketing: 'TrendingUp',
      growth: 'Users',
      productivity: 'Zap',
      team: 'Users',
      content: 'FileText'
    };
    return icons[category] || 'Award';
  }

  getNextThreshold(category, metric, currentThreshold) {
    const thresholds = this.thresholds[category]?.[metric] || [];
    const currentIndex = thresholds.indexOf(currentThreshold);
    return currentIndex >= 0 && currentIndex < thresholds.length - 1 
      ? thresholds[currentIndex + 1] 
      : null;
  }

  // ===== QUERY METHODS =====

  getAllAchievements() {
    return [...this.achievements].sort((a, b) => 
      new Date(b.achievedAt) - new Date(a.achievedAt)
    );
  }

  getAchievementById(id) {
    return this.achievements.find(a => a.id === id);
  }

  getAchievementsByCategory(category) {
    return this.achievements.filter(a => a.category === category);
  }

  getAchievementsByDateRange(startDate, endDate) {
    return this.achievements.filter(a => {
      const date = new Date(a.achievedAt);
      return date >= startDate && date <= endDate;
    });
  }

  getRecentAchievements(limit = 10) {
    return this.getAllAchievements().slice(0, limit);
  }

  // ===== STRATEGY REPLAY =====

  /**
   * Create a goal based on an achievement's strategy
   * @param {string} achievementId - ID of the achievement to replay
   * @param {object} params - New parameters for the goal (target, timeframe, etc.)
   * @returns {object} Goal object
   */
  async replayStrategy(achievementId, params = {}) {
    const achievement = this.getAchievementById(achievementId);
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    // Calculate next target (default: 2x the achieved value)
    const nextTarget = params.targetValue || (achievement.thresholdValue * 2);
    
    const goal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: params.title || `Repeat: ${achievement.title}`,
      description: params.description || `Achieve ${nextTarget.toLocaleString()} in ${achievement.metric.replace(/_/g, ' ')}`,
      category: achievement.category,
      metric: achievement.metric,
      status: 'active',
      priority: params.priority || 'medium',
      progress: 0,
      metrics: {
        current: achievement.currentValue,
        target: nextTarget,
        unit: this.getMetricUnit(achievement.metric)
      },
      target_date: params.targetDate || this.calculateTargetDate(params.timeframe || '3 months'),
      createdAt: new Date().toISOString(),
      sourceAchievementId: achievementId,
      agentFlow: achievement.agentFlow || [],
      milestones: this.generateMilestones(achievement.currentValue, nextTarget),
      metadata: {
        ...params.metadata,
        source: 'achievement_replay',
        originalAchievementId: achievementId,
        repeatCount: this.getRepeatCount(achievementId) + 1
      }
    };

    // Save goal
    await this.createGoalFromAchievement(goal);

    return goal;
  }

  async createGoalFromAchievement(goal) {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to create goal on backend, saving locally');
    }

    // Fallback: save to localStorage
    const goals = JSON.parse(localStorage.getItem('guild_goals') || '[]');
    goals.push(goal);
    localStorage.setItem('guild_goals', JSON.stringify(goals));
    
    return goal;
  }

  // ===== HELPER METHODS =====

  getMetricUnit(metric) {
    if (metric.includes('rate') || metric.includes('percentage') || metric.includes('margin')) {
      return '%';
    }
    if (metric.includes('revenue') || metric.includes('cost') || metric.includes('ltv')) {
      return '$';
    }
    return 'units';
  }

  calculateTargetDate(timeframe) {
    const now = new Date();
    const timeframeMap = {
      '1 month': 30,
      '3 months': 90,
      '6 months': 180,
      '1 year': 365
    };
    const days = timeframeMap[timeframe] || 90;
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  generateMilestones(current, target) {
    const diff = target - current;
    const milestones = [];
    const steps = [0.25, 0.5, 0.75, 1.0];
    
    for (const step of steps) {
      milestones.push({
        id: `milestone-${Date.now()}-${step}`,
        title: `Reach ${(current + diff * step).toLocaleString()}`,
        value: current + diff * step,
        completed: false,
        due_date: null
      });
    }
    
    return milestones;
  }

  getRepeatCount(achievementId) {
    const goals = JSON.parse(localStorage.getItem('guild_goals') || '[]');
    return goals.filter(g => g.sourceAchievementId === achievementId).length;
  }

  // ===== STATISTICS =====

  getStatistics() {
    return {
      total: this.achievements.length,
      byCategory: this.getAchievementCountByCategory(),
      byImpact: this.getAchievementCountByImpact(),
      recent: this.getRecentAchievements(5),
      thisMonth: this.getAchievementsThisMonth().length,
      thisYear: this.getAchievementsThisYear().length
    };
  }

  getAchievementCountByCategory() {
    const counts = {};
    for (const achievement of this.achievements) {
      counts[achievement.category] = (counts[achievement.category] || 0) + 1;
    }
    return counts;
  }

  getAchievementCountByImpact() {
    const counts = { high: 0, medium: 0, low: 0 };
    for (const achievement of this.achievements) {
      counts[achievement.impact] = (counts[achievement.impact] || 0) + 1;
    }
    return counts;
  }

  getAchievementsThisMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return this.getAchievementsByDateRange(start, end);
  }

  getAchievementsThisYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return this.getAchievementsByDateRange(start, end);
  }
}

// Export singleton instance
const achievementsDataService = new AchievementsDataService();
export default achievementsDataService;

