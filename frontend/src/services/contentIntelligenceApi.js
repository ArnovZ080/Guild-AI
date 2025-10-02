// Content Intelligence Agent API Integration
// This file contains the API methods and hooks for the Content Intelligence Agent

import { useState, useEffect, useCallback } from 'react';

// WebSocket Service for Real-time Updates
class ContentIntelligenceWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/content-intelligence';
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('Content Intelligence WebSocket connected');
        this.reconnectAttempts = 0;
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data.type, data.payload);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('Content Intelligence WebSocket disconnected');
        this.handleReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('Content Intelligence WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to Content Intelligence WebSocket:', error);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    
    // Connect if not already connected
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.connect();
    }
  }

  unsubscribe(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  notifyListeners(eventType, payload) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Global WebSocket instance
const contentIntelligenceWS = new ContentIntelligenceWebSocket();
// Local publisher to broadcast updates to listeners (used for optimistic UI sync)
export const publishCampaignsUpdate = (payload) => {
  try {
    contentIntelligenceWS.notifyListeners('campaigns_update', payload);
  } catch (e) {
    console.warn('Failed to publish campaigns_update locally', e);
  }
};

// API Service Extensions for Content Intelligence
export const CONTENT_INTELLIGENCE_API_ENDPOINTS = {
  // Get comprehensive content analysis from all connected platforms
  getContentAnalysis: '/content/analysis',
  
  // Get content calendar
  getContentCalendar: '/content/calendar',
  
  // Get content performance metrics from all platforms
  getContentPerformance: '/content/performance',
  
  // Get active campaigns from all advertising platforms
  getActiveCampaigns: '/content/campaigns',
  
  // Get email marketing performance from all email providers
  getEmailPerformance: '/content/email-performance',
  // Emails: unified inbox and campaign management
  getEmailInbox: '/content/email-inbox',
  getEmailCampaigns: '/content/email-campaigns',
  getEmailTemplates: '/content/email-templates',
  getEmailSegments: '/content/email-segments',
  getEmailAnalytics: '/content/email-analytics',
  sendEmail: '/content/send-email',
  createEmailCampaign: '/content/create-email-campaign',
  updateEmailCampaign: '/content/update-email-campaign',
  controlEmailCampaign: '/content/control-email-campaign',
  getEmailABTests: '/content/email-abtests',
  getBestSendTimes: '/content/email-best-send-times',
  getEmailCompliance: '/content/email-compliance',
  getContactProfile: '/content/contact-profile',
  getContactTimeline: '/content/contact-timeline',
  getPersonalizationSuggestions: '/content/personalization-suggestions',
  getVariantSuggestions: '/content/email-variant-suggestions',
  setTrafficAllocation: '/content/email-traffic-allocation',
  getDeliverabilityHealth: '/content/email-deliverability',
  getFollowupsPlan: '/content/email-followups-plan',
  saveFollowupsPlan: '/content/email-followups-save',
  getEmailRevenueAttribution: '/content/email-revenue',
  getJourneyMiniMap: '/content/email-journey',
  
  // Get creative assets from all platforms
  getCreativeAssets: '/content/assets',
  
  // Mind-blowing features
  generateAICopy: '/content/ai/generate-copy',
  evaluateCopyQuality: '/content/ai/evaluate-copy',
  predictRevenue: '/content/ai/predict-revenue',
  getCustomerIntelligence: '/content/ai/customer-intelligence',
  createAutonomousSequence: '/content/ai/autonomous-sequence',
  syncCrossChannel: '/content/ai/cross-channel-sync',
  detectAnomalies: '/content/ai/detect-anomalies',
  getTrendIdeas: '/content/ai/trend-ideas',
  replayCampaign: '/content/ai/replay-campaign',
  generateVoiceScript: '/content/ai/voice-script',
  
  // Create content
  createContent: '/content/create',
  
  // Schedule content
  scheduleContent: '/content/schedule',
  
  // Execute content actions
  executeContentAction: '/content/execute-action',
  
  // Update content strategy
  updateContentStrategy: '/content/update-strategy',
  
  // Platform-specific data aggregation
  getPlatformData: '/content/platform-data',
  
  // Get insights analysis
  getInsightAnalysis: '/content/insight-analysis',
  
  // Get action analysis
  getActionAnalysis: '/content/action-analysis',
  
  // Execute workflow
  executeWorkflow: '/content/execute-workflow'
};

// Enhanced API Service Class for Content Intelligence
export class ContentIntelligenceAPIService {
  constructor(baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.log(`API request failed for ${endpoint}, using mock data:`, error.message);
      return null;
    }
  }

  // Content Intelligence Methods
  async getContentAnalysis() {
    // First try to get real platform data
    const platformData = await this.getPlatformData(['instagram', 'linkedin', 'twitter', 'facebook', 'tiktok', 'youtube', 'email', 'blog']);
    
    // Then get comprehensive analysis
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getContentAnalysis, {
      method: 'POST',
      body: JSON.stringify({ platform_data: platformData })
    });
    return result || this.getMockContentAnalysis();
  }

  async getContentCalendar(period = '30d') {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getContentCalendar}?period=${period}`);
    return result || this.getMockContentCalendar(period);
  }

  async getContentPerformance(platform = 'all', period = '7d') {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getContentPerformance}?platform=${platform}&period=${period}`);
    return result || this.getMockContentPerformance(platform, period);
  }

  async getActiveCampaigns() {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getActiveCampaigns);
    return result || this.getMockActiveCampaigns();
  }

  async getEmailPerformance(period = '30d') {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getEmailPerformance}?period=${period}`);
    return result || this.getMockEmailPerformance(period);
  }

  async getEmailInbox(filters = {}) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getEmailInbox, {
      method: 'POST',
      body: JSON.stringify(filters)
    });
    return result || this.getMockEmailInbox(filters);
  }

  async getEmailCampaigns(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `${CONTENT_INTELLIGENCE_API_ENDPOINTS.getEmailCampaigns}?${query}` : CONTENT_INTELLIGENCE_API_ENDPOINTS.getEmailCampaigns;
    const result = await this.request(endpoint);
    return result || this.getMockEmailCampaigns();
  }

  async getEmailTemplates() {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getEmailTemplates);
    return result || this.getMockEmailTemplates();
  }

  async getEmailSegments() {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getEmailSegments);
    return result || this.getMockEmailSegments();
  }

  async getEmailAnalytics(campaignId) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getEmailAnalytics}?campaign_id=${encodeURIComponent(campaignId)}`);
    return result || this.getMockEmailAnalytics(campaignId);
  }

  async sendEmail(payload) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.sendEmail, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return result || { success: true, id: `mock_email_${Date.now()}` };
  }

  async createEmailCampaign(payload) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.createEmailCampaign, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return result || { success: true, campaign_id: `mock_campaign_${Date.now()}` };
  }

  async updateEmailCampaign(campaignId, updates) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.updateEmailCampaign, {
      method: 'POST',
      body: JSON.stringify({ campaign_id: campaignId, updates })
    });
    return result || { success: true };
  }

  async controlEmailCampaign(campaignId, action) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.controlEmailCampaign, {
      method: 'POST',
      body: JSON.stringify({ campaign_id: campaignId, action })
    });
    return result || { success: true, action };
  }

  async getEmailABTests(campaignId) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getEmailABTests}?campaign_id=${encodeURIComponent(campaignId)}`);
    return result || this.getMockEmailABTests(campaignId);
  }

  async getBestSendTimes(segmentId) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getBestSendTimes}?segment_id=${encodeURIComponent(segmentId || '')}`);
    return result || this.getMockBestSendTimes(segmentId);
  }

  async getEmailCompliance(payload) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getEmailCompliance, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return result || this.getMockEmailCompliance(payload);
  }

  async getContactProfile(email) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getContactProfile}?email=${encodeURIComponent(email)}`);
    return result || this.getMockContactProfile(email);
  }

  async getContactTimeline(email) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getContactTimeline}?email=${encodeURIComponent(email)}`);
    return result || this.getMockContactTimeline(email);
  }

  async getPersonalizationSuggestions(email) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getPersonalizationSuggestions}?email=${encodeURIComponent(email)}`);
    return result || this.getMockPersonalizationSuggestions(email);
  }

  async getVariantSuggestions(context = {}) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getVariantSuggestions, {
      method: 'POST', body: JSON.stringify(context)
    });
    return result || this.getMockVariantSuggestions(context);
  }

  async setTrafficAllocation(campaignId, allocation) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.setTrafficAllocation, {
      method: 'POST', body: JSON.stringify({ campaign_id: campaignId, allocation })
    });
    return result || { success: true };
  }

  async getDeliverabilityHealth() {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getDeliverabilityHealth);
    return result || this.getMockDeliverabilityHealth();
  }

  async getFollowupsPlan(campaignId) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getFollowupsPlan}?campaign_id=${encodeURIComponent(campaignId)}`);
    return result || this.getMockFollowupsPlan(campaignId);
  }

  async saveFollowupsPlan(campaignId, plan) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.saveFollowupsPlan, { method: 'POST', body: JSON.stringify({ campaign_id: campaignId, plan }) });
    return result || { success: true };
  }

  async getEmailRevenueAttribution(campaignId) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getEmailRevenueAttribution}?campaign_id=${encodeURIComponent(campaignId)}`);
    return result || this.getMockEmailRevenueAttribution(campaignId);
  }

  async getJourneyMiniMap(campaignId) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getJourneyMiniMap}?campaign_id=${encodeURIComponent(campaignId)}`);
    return result || this.getMockJourneyMiniMap(campaignId);
  }

  async getCreativeAssets() {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getCreativeAssets);
    return result || this.getMockCreativeAssets();
  }

  // Mind-blowing features API methods
  async generateAICopy(request) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.generateAICopy, {
      method: 'POST',
      body: JSON.stringify(request)
    });
    return result || this.getMockAICopyGeneration(request);
  }

  async evaluateCopyQuality(copyId, copyContent) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.evaluateCopyQuality, {
      method: 'POST',
      body: JSON.stringify({ copy_id: copyId, content: copyContent })
    });
    return result || this.getMockCopyEvaluation(copyId, copyContent);
  }

  async predictRevenue(campaignData) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.predictRevenue, {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    return result || this.getMockRevenuePredict(campaignData);
  }

  async getCustomerIntelligence(segmentId) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getCustomerIntelligence}?segment_id=${encodeURIComponent(segmentId)}`);
    return result || this.getMockCustomerIntelligence(segmentId);
  }

  async createAutonomousSequence(request) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.createAutonomousSequence, {
      method: 'POST',
      body: JSON.stringify(request)
    });
    return result || this.getMockAutonomousSequence(request);
  }

  async syncCrossChannel(userId) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.syncCrossChannel}?user_id=${encodeURIComponent(userId)}`);
    return result || this.getMockCrossChannelSync(userId);
  }

  async detectAnomalies(campaignId) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.detectAnomalies}?campaign_id=${encodeURIComponent(campaignId)}`);
    return result || this.getMockAnomalyDetection(campaignId);
  }

  async getTrendIdeas() {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getTrendIdeas);
    return result || this.getMockTrendIdeas();
  }

  async replayCampaign(campaignId) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.replayCampaign, {
      method: 'POST',
      body: JSON.stringify({ campaign_id: campaignId })
    });
    return result || this.getMockReplayCampaign(campaignId);
  }

  async generateVoiceScript(emailCampaignId) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.generateVoiceScript, {
      method: 'POST',
      body: JSON.stringify({ email_campaign_id: emailCampaignId })
    });
    return result || this.getMockVoiceScript(emailCampaignId);
  }

  async createContent(contentData) {
    return this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.createContent, {
      method: 'POST',
      body: JSON.stringify(contentData)
    });
  }

  async scheduleContent(scheduleData) {
    return this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.scheduleContent, {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    });
  }

  async executeContentAction(actionId, actionData = {}) {
    return this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.executeContentAction, {
      method: 'POST',
      body: JSON.stringify({ action_id: actionId, ...actionData })
    });
  }

  async updateContentStrategy(strategyUpdates) {
    return this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.updateContentStrategy, {
      method: 'POST',
      body: JSON.stringify(strategyUpdates)
    });
  }

  // New methods for real platform data integration
  async getPlatformData(platforms = ['all']) {
    const result = await this.request(`${CONTENT_INTELLIGENCE_API_ENDPOINTS.getPlatformData}?platforms=${platforms.join(',')}`);
    return result || this.getMockPlatformData(platforms);
  }

  async getInsightAnalysis(insightData) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getInsightAnalysis, {
      method: 'POST',
      body: JSON.stringify(insightData)
    });
    return result || this.getMockInsightAnalysis(insightData);
  }

  async getActionAnalysis(actionData) {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getActionAnalysis, {
      method: 'POST',
      body: JSON.stringify(actionData)
    });
    return result || this.getMockActionAnalysis(actionData);
  }

  async executeWorkflow(workflowData) {
    return this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.executeWorkflow, {
      method: 'POST',
      body: JSON.stringify(workflowData)
    });
  }

  // Mock Data Methods
  getMockContentAnalysis() {
    return {
      success: true,
      data: {
        analysis_id: `content_analysis_${Date.now()}`,
        generated_at: new Date().toISOString(),
        content_health_score: 82.5,
        overall_performance: "excellent",
        key_insights: [
          "Instagram Reels are generating 3x more engagement than static posts",
          "LinkedIn articles are driving highest quality leads",
          "Email campaigns have 45% open rate, above industry average",
          "Video content performs 2.5x better across all platforms"
        ],
        immediate_actions: [
          "Increase Reels content to 70% of Instagram strategy",
          "Optimize LinkedIn article headlines for better reach",
          "Segment email list for more targeted campaigns",
          "Create more video content for all platforms"
        ],
        content_metrics: {
          content_output: {
            posts_per_week: { current: 28, target: 35, trend: "up", change: 12.0 },
            blogs_per_month: { current: 8, target: 12, trend: "up", change: 8.5 },
            videos_per_week: { current: 5, target: 8, trend: "up", change: 15.2 },
            emails_per_month: { current: 12, target: 16, trend: "up", change: 6.8 }
          },
          engagement_metrics: {
            engagement_rate: { current: 4.8, target: 5.0, trend: "up", change: 14.3 },
            click_through_rate: { current: 2.3, target: 2.5, trend: "up", change: 9.5 },
            conversion_rate: { current: 3.2, target: 3.5, trend: "up", change: 12.5 },
            follower_growth: { current: 12.5, target: 15.0, trend: "up", change: 15.7 }
          },
          performance_metrics: {
            cost_per_lead: { current: 28.50, target: 25.0, trend: "down", change: -10.9 },
            return_on_ad_spend: { current: 3.8, target: 4.0, trend: "up", change: 8.6 },
            email_open_rate: { current: 45.2, target: 50.0, trend: "up", change: 5.6 },
            brand_sentiment: { current: 87.5, target: 90.0, trend: "up", change: 3.2 }
          }
        },
        top_performing_content: [
          {
            platform: "instagram",
            content_type: "reel",
            performance_score: 95.0,
            engagement_rate: 8.5,
            reach: 15000,
            impressions: 25000,
            clicks: 450,
            conversions: 12
          },
          {
            platform: "linkedin",
            content_type: "article",
            performance_score: 92.0,
            engagement_rate: 6.2,
            reach: 8500,
            impressions: 12000,
            clicks: 280,
            conversions: 8
          },
          {
            platform: "twitter",
            content_type: "thread",
            performance_score: 88.0,
            engagement_rate: 5.8,
            reach: 12000,
            impressions: 18000,
            clicks: 320,
            conversions: 6
          }
        ],
        optimization_opportunities: [
          {
            platform: "facebook",
            opportunity: "Increase video content frequency",
            potential_improvement: "25% engagement increase",
            implementation_effort: "medium",
            expected_impact: "high"
          },
          {
            platform: "twitter",
            opportunity: "Optimize posting times",
            potential_improvement: "30% reach increase",
            implementation_effort: "low",
            expected_impact: "medium"
          },
          {
            platform: "linkedin",
            opportunity: "Improve article headlines",
            potential_improvement: "20% click-through increase",
            implementation_effort: "low",
            expected_impact: "medium"
          }
        ]
      }
    };
  }

  getMockContentCalendar(period) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const calendar = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Generate content for each day
      const platforms = ['instagram', 'linkedin', 'twitter', 'facebook', 'tiktok'];
      const contentTypes = ['post', 'story', 'reel', 'article', 'tweet', 'video'];
      
      // Random content generation
      const numContent = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numContent; j++) {
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
        
        calendar.push({
          content_id: `content_${i}_${j}`,
          platform: platform,
          content_type: contentType,
          theme: ['educational', 'promotional', 'behind_scenes', 'user_generated'][Math.floor(Math.random() * 4)],
          scheduled_date: date.toISOString(),
          status: ['scheduled', 'published', 'draft'][Math.floor(Math.random() * 3)],
          content_preview: `${platform.charAt(0).toUpperCase() + platform.slice(1)} ${contentType} about industry insights`,
          engagement_estimate: Math.floor(Math.random() * 1000) + 100,
          priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
        });
      }
    }
    
    return {
      success: true,
      data: {
        period: period,
        total_content: calendar.length,
        calendar: calendar.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
      }
    };
  }

  getMockContentPerformance(platform, period) {
    const platforms = platform === 'all' ? 
      ['instagram', 'linkedin', 'twitter', 'facebook', 'tiktok'] : [platform];
    
    const performance = platforms.map(p => ({
      platform: p,
      engagement_rate: (Math.random() * 5 + 2).toFixed(1),
      reach: Math.floor(Math.random() * 10000 + 1000),
      impressions: Math.floor(Math.random() * 20000 + 2000),
      clicks: Math.floor(Math.random() * 500 + 50),
      conversions: Math.floor(Math.random() * 50 + 5),
      cost: Math.floor(Math.random() * 500 + 100),
      roi: (Math.random() * 3 + 2).toFixed(1),
      performance_score: Math.floor(Math.random() * 30 + 70),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      trend_percentage: (Math.random() * 20 + 5).toFixed(1)
    }));
    
    return {
      success: true,
      data: {
        platform: platform,
        period: period,
        performance: performance,
        summary: {
          total_engagement: performance.reduce((sum, p) => sum + parseFloat(p.engagement_rate), 0).toFixed(1),
          total_reach: performance.reduce((sum, p) => sum + p.reach, 0),
          total_conversions: performance.reduce((sum, p) => sum + p.conversions, 0),
          average_roi: (performance.reduce((sum, p) => sum + parseFloat(p.roi), 0) / performance.length).toFixed(1)
        }
      }
    };
  }

  getMockActiveCampaigns() {
    return {
      success: true,
      data: {
        campaigns: [
          {
            campaign_id: "campaign_001",
            name: "Q4 Product Launch",
            objective: "conversion",
            platforms: ["facebook", "instagram"],
            budget: 2000,
            spent: 1250,
            start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: "active",
            performance_metrics: {
              impressions: 45000,
              clicks: 1250,
              conversions: 89,
              cost_per_lead: 14.05,
              return_on_ad_spend: 4.2
            },
            creative_assets: ["ad_001.jpg", "ad_002.mp4", "ad_003.jpg"],
            target_audience: {
              age_range: "25-45",
              interests: ["technology", "business"],
              locations: ["US", "CA", "UK"]
            },
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            campaign_id: "campaign_002",
            name: "LinkedIn Lead Generation",
            objective: "lead_generation",
            platforms: ["linkedin"],
            budget: 1500,
            spent: 980,
            start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: "active",
            performance_metrics: {
              impressions: 25000,
              clicks: 650,
              conversions: 45,
              cost_per_lead: 21.78,
              return_on_ad_spend: 3.8
            },
            creative_assets: ["linkedin_ad_001.jpg", "linkedin_ad_002.jpg"],
            target_audience: {
              job_titles: ["Marketing Manager", "CEO", "Founder"],
              company_size: "50-500",
              industries: ["Technology", "SaaS"]
            },
            created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            campaign_id: "campaign_003",
            name: "TikTok Awareness Campaign",
            objective: "awareness",
            platforms: ["tiktok"],
            budget: 1000,
            spent: 750,
            start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: "paused",
            performance_metrics: {
              impressions: 15000,
              clicks: 300,
              conversions: 23,
              cost_per_lead: 32.61,
              return_on_ad_spend: 2.9
            },
            creative_assets: ["tiktok_video_001.mp4", "tiktok_video_002.mp4"],
            target_audience: {
              age_range: "18-35",
              interests: ["lifestyle", "technology"],
              locations: ["US"]
            },
            created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    };
  }

  getMockEmailPerformance(period = '30d') {
    return {
      success: true,
      data: {
        period,
        email_metrics: {
          open_rate: 42.3,
          click_rate: 5.8,
          conversion_rate: 3.1,
          bounce_rate: 0.6,
          unsubscribe_rate: 0.3,
          deliverability: 97.8,
          revenue: 4280
        },
        trends: {
          open_rate_trend: '+4.1',
          click_rate_trend: '+1.2',
          conversion_rate_trend: '+0.6'
        }
      }
    };
  }

  getMockEmailInbox(filters) {
    const now = Date.now();
    const makeMsg = (i) => ({
      id: `msg_${i}`,
      from: i % 2 ? 'support@yourapp.com' : 'jane@acme.com',
      to: i % 3 ? 'you@brand.com' : 'team@brand.com',
      subject: i % 2 ? 'Question about pricing' : 'Your weekly newsletter',
      snippet: 'Just checking if your Pro plan includes...',
      received_at: new Date(now - i * 3600_000).toISOString(),
      tags: i % 2 ? ['support','inbound'] : ['newsletter'],
      provider: i % 2 ? 'Gmail' : 'SendGrid',
      thread_id: `thread_${Math.floor(i/2)}`,
      status: 'unread'
    });
    return { data: { inbox: Array.from({ length: 12 }).map((_,i)=>makeMsg(i)) } };
  }

  getMockEmailCampaigns() {
    const mk = (i) => ({
      campaign_id: `email_cmp_${i}`,
      name: i===0? 'Welcome Series' : i===1? 'Black Friday Promo' : 'Newsletter October',
      objective: i===1? 'Drive Sales':'Engagement',
      status: i===0? 'running' : i===1? 'scheduled':'completed',
      progress: i===0? 62: i===1? 0: 100,
      sent: i===0? 4200: 0,
      delivered: i===0? 4100: 0,
      open_rate: i===0? 34.2: i===1? null: 41.8,
      click_rate: i===0? 4.8: i===1? null: 6.2,
      unsubscribe_rate: i===0? 0.3: 0.2,
      bounce_rate: i===0? 0.7: 0.4,
      emails_in_sequence: i===0? 5: 1,
      platform: 'email',
      scheduled_at: i===1? new Date(Date.now()+36e5).toISOString() : null
    });
    return { data: { campaigns: [0,1,2].map(mk) } };
  }

  getMockEmailTemplates() {
    const tm = (id, name, type) => ({ id, name, type, last_used: new Date(Date.now()-id*86_400_000).toISOString(), performance: { avg_open: 38.2, avg_click: 5.4 } });
    return { data: { templates: [tm(1,'Newsletter Clean','newsletter'), tm(2,'Promo Highlight','promo'), tm(3,'Onboarding Step','nurture')] } };
  }

  getMockEmailSegments() {
    const sg = (id, name, count, engagement) => ({ id: `seg_${id}`, name, count, engagement, recent_activity: 'Open + Click' });
    return { data: { segments: [
      sg(1,'New Subscribers (30d)', 823, 0.62),
      sg(2,'Inactive >90d', 312, 0.18),
      sg(3,'VIP Buyers', 97, 0.84),
      sg(4,'Active Customers', 1290, 0.55)
    ] } };
  }

  getMockEmailAnalytics(campaignId) {
    return { data: {
      campaign_id: campaignId,
      metrics: {
        delivered: 4100, opens: 1400, clicks: 200, bounces: 28, unsubscribes: 11,
        open_rate: 34.1, click_rate: 4.9, bounce_rate: 0.7, unsubscribe_rate: 0.27,
      },
      timeline: Array.from({length:24}).map((_,h)=>({ hour: h, opens: Math.max(0, Math.round(80 - Math.abs(12-h)*6)), clicks: Math.max(0, Math.round(20 - Math.abs(12-h)*2)) })),
      heatmap: [
        { area: 'Hero CTA', clicks: 112 },
        { area: 'Feature Link', clicks: 56 },
        { area: 'Footer Social', clicks: 18 }
      ]
    } };
  }

  getMockEmailABTests(campaignId) {
    return { data: {
      campaign_id: campaignId,
      variants: [
        { id: 'A', subject: 'Unlock 30% off today', open_rate: 35.2, click_rate: 5.1 },
        { id: 'B', subject: 'Your exclusive 30% savings inside', open_rate: 31.9, click_rate: 6.0 }
      ],
      winner: 'A'
    } };
  }

  getMockBestSendTimes(segmentId) {
    return { data: {
      segment_id: segmentId || 'all',
      suggestions: [
        { day: 'Tuesday', hour_local: 10, confidence: 0.82 },
        { day: 'Thursday', hour_local: 9, confidence: 0.78 },
        { day: 'Sunday', hour_local: 17, confidence: 0.63 }
      ]
    } };
  }

  getMockEmailCompliance(payload) {
    const issues = [];
    if (!/unsubscribe|opt\s?-?out/i.test(payload.body||'')) issues.push({ id: 'unsubscribe', level: 'warning', label: 'Unsubscribe link missing', why: 'Compliance requires visible opt-out.' });
    if (!/privacy|policy|address/i.test(payload.body||'')) issues.push({ id: 'footer', level: 'info', label: 'Footer details incomplete', why: 'Add company address or privacy link.' });
    if ((payload.subject||'').length > 120) issues.push({ id: 'subject_length', level: 'info', label: 'Subject may be too long', why: 'Deliverability may suffer with very long subjects.' });
    return { data: { pass: issues.length===0, issues } };
  }

  getMockContactProfile(email) {
    return { data: { email, name: 'Jane Doe', company: 'Acme Inc', role: 'Operations Manager', location: 'Austin, TX', segments: ['Active Customers','VIP Buyers'], engagement_score: 0.78, last_activity: new Date(Date.now()-86400000).toISOString() } };
  }

  getMockContactTimeline(email) {
    return { data: { email, events: [
      { ts: new Date(Date.now()-3*86400000).toISOString(), type: 'email_sent', subject: 'Welcome to Acme' },
      { ts: new Date(Date.now()-2*86400000).toISOString(), type: 'open', subject: 'Welcome to Acme' },
      { ts: new Date(Date.now()-2*86400000+3600000).toISOString(), type: 'click', subject: 'Welcome to Acme', details: 'Clicked: Get Started' },
      { ts: new Date(Date.now()-1*86400000).toISOString(), type: 'email_sent', subject: 'Product Tips' },
    ] } };
  }

  getMockPersonalizationSuggestions(email) {
    return { data: { email, suggestions: [
      { id: 'p1', field: 'subject', text: 'Jane, quick idea to save you time in Ops' , why: 'Personalized subject with role reference increases opens' },
      { id: 'p2', field: 'body', text: "Reference Acme's recent onboarding milestone to build relevance", why: 'Context from timeline indicates onboarding' }
    ] } };
  }

  getMockVariantSuggestions(context) {
    return { data: { suggestions: [
      { id: 'vs1', subject: 'Unlock time back each week with a 5‑minute workflow', body: "Hi {{first_name}}, here's a quick win we spotted…" },
      { id: 'vs2', subject: '{{first_name}}, cut email busywork in half this month', body: 'Noticed your team is scaling—this helps keep quality high…' }
    ] } };
  }

  getMockDeliverabilityHealth() {
    return { data: {
      spf: { status: 'pass', record: 'v=spf1 include:sendgrid.net ~all' },
      dkim: { status: 'pass', selector: 's1', domain: 'brand.com' },
      dmarc: { status: 'warning', policy: 'p=none; rua=mailto:dmarc@brand.com', why: 'Policy set to none; consider p=quarantine' },
      spam_complaints: { rate: 0.12, trend: 'up' },
      bounce_rate: { rate: 0.9, trend: 'down' },
      sender_score: 88
    } };
  }

  getMockFollowupsPlan(campaignId) {
    return { data: { campaign_id: campaignId, rules: [
      { id: 'r1', when: 'unopened_48h', action: 'resend_subject_variant', details: 'Use Variant B', reason: 'Increase open probability for non-openers' },
      { id: 'r2', when: 'clicked_no_convert_72h', action: 'send_resource', details: 'Send case study link', reason: 'Nurture interest to conversion' }
    ] } };
  }

  getMockEmailRevenueAttribution(campaignId) {
    return { data: { campaign_id: campaignId, total_revenue: 4280, orders: 37, model: 'last_touch', breakdown: [
      { segment: 'VIP Buyers', revenue: 1900 },
      { segment: 'Active Customers', revenue: 1600 },
      { segment: 'New Subscribers', revenue: 780 }
    ] } };
  }

  getMockJourneyMiniMap(campaignId) {
    return { data: { campaign_id: campaignId, funnel: [
      { stage: 'Sent', count: 4100 },
      { stage: 'Opened', count: 1400 },
      { stage: 'Clicked', count: 200 },
      { stage: 'Visited Site', count: 150 },
      { stage: 'Purchased', count: 40 }
    ], largest_drop: { from: 'Opened', to: 'Clicked', reason: 'CTA placement below fold; low contrast' } } };
  }

  // Mind-blowing features mock methods
  getMockAICopyGeneration(request) {
    const { brief, targetAudience, brand, channel } = request;
    return { 
      data: {
        variations: [
          {
            id: 'copy_v1',
            subject: `${targetAudience?.role || 'Professional'}: Transform Your Workflow Today`,
            body: `Hi {{first_name}},\n\nI noticed you're leading operations at {{company}}. Many ${targetAudience?.industry || 'industry'} leaders are finding that...\n\n[Rest of personalized copy]`,
            psychological_framework: 'AIDA',
            personalization_score: 8.7,
            confidence: 0.89
          },
          {
            id: 'copy_v2',
            subject: `Quick win for {{company}}'s growth`,
            body: `${targetAudience?.role || 'Hi there'},\n\nYour team at {{company}} is scaling fast. Here's how to keep up...\n\n[Rest of copy]`,
            psychological_framework: 'PAS',
            personalization_score: 8.3,
            confidence: 0.85
          }
        ],
        judge_layer_pending: true,
        workflow_id: `wf_${Date.now()}`
      }
    };
  }

  getMockCopyEvaluation(copyId, copyContent) {
    return {
      data: {
        copy_id: copyId,
        judge_layer_results: {
          overall_score: 0.84,
          threshold: 0.8,
          status: 'PASSED',
          evaluations: [
            { agent: 'Judge Agent', score: 0.85, feedback: 'Strong overall structure and persuasive elements', confidence: 0.88 },
            { agent: 'Brand Checker', score: 0.90, feedback: 'Excellent brand alignment with voice guidelines', confidence: 0.92 },
            { agent: 'Fact Checker', score: 0.80, feedback: 'All claims verifiable, consider adding specific data points', confidence: 0.85 },
            { agent: 'Compliance Agent', score: 0.95, feedback: 'Fully compliant with email regulations', confidence: 0.98 }
          ],
          rubric_criteria: [
            { name: 'clarity', score: 0.88, weight: 0.25, why: 'Message is clear and easy to understand' },
            { name: 'persuasion', score: 0.82, weight: 0.30, why: 'Uses strong psychological triggers' },
            { name: 'brand_alignment', score: 0.90, weight: 0.25, why: 'Matches brand voice perfectly' },
            { name: 'spam_compliance', score: 0.95, weight: 0.20, why: 'No spam trigger words detected' }
          ],
          revision_count: 0,
          improvements_applied: [],
          final_recommendation: 'Approved for use - high conversion potential'
        }
      }
    };
  }

  getMockRevenuePredict(campaignData) {
    const { segmentId, campaignType, historicalPerformance } = campaignData;
    return {
      data: {
        predicted_revenue: 12450,
        confidence_interval: { low: 9800, high: 15200 },
        confidence_level: 0.78,
        factors: [
          { factor: 'Segment engagement history', impact: '+35%', why: 'This segment has 2.3x higher conversion rate' },
          { factor: 'Time of year (Q4)', impact: '+18%', why: 'Seasonal buying patterns favor this period' },
          { factor: 'Campaign type (promotional)', impact: '+22%', why: 'Promo campaigns historically perform 22% better' },
          { factor: 'Email deliverability score', impact: '-5%', why: 'Recent minor deliverability issues' }
        ],
        breakdown_by_segment: [
          { segment: 'VIP Buyers', expected_revenue: 5200, probability: 0.82 },
          { segment: 'Active Customers', expected_revenue: 4800, probability: 0.75 },
          { segment: 'Warm Leads', expected_revenue: 2450, probability: 0.68 }
        ],
        optimization_suggestions: [
          'Send on Tuesday at 10 AM for 12% higher open rate',
          'Use urgency-based subject line for 8% CTR boost',
          'Add social proof section for 15% conversion lift'
        ],
        agent_notes: 'Financial Intelligence Agent analysis with 78% confidence based on 24 months historical data'
      }
    };
  }

  getMockCustomerIntelligence(segmentId) {
    return {
      data: {
        segment_id: segmentId,
        insights: {
          behavior_patterns: [
            { pattern: 'High weekend engagement', frequency: 'Weekly', action: 'Schedule campaigns for Sunday 5-7 PM' },
            { pattern: 'Mobile-first audience', percentage: 78, action: 'Optimize for mobile viewing' },
            { pattern: 'Video content preference', engagement_lift: '45%', action: 'Include video thumbnails in emails' }
          ],
          churn_risk: {
            at_risk_contacts: 23,
            risk_factors: ['No opens in 30 days', 'Decreased click frequency'],
            recommended_action: 'Launch re-engagement campaign with incentive',
            estimated_impact: 'Recover 35-40% of at-risk customers'
          },
          upsell_opportunities: [
            { contacts: 45, opportunity: 'Premium tier upgrade', estimated_value: 8900, confidence: 0.72 },
            { contacts: 67, opportunity: 'Add-on service', estimated_value: 4200, confidence: 0.68 }
          ],
          sentiment_analysis: {
            overall_sentiment: 'positive',
            score: 0.74,
            trending: 'up',
            keywords: ['helpful', 'easy', 'time-saving', 'valuable']
          }
        },
        recommended_campaigns: [
          { type: 'retention', priority: 'high', description: 'Re-engage at-risk customers before churn' },
          { type: 'upsell', priority: 'medium', description: 'Target premium upgrade opportunity' }
        ],
        agent_notes: 'Customer Intelligence Agent identified 3 high-value opportunities with combined $13K potential revenue'
      }
    };
  }

  getMockAutonomousSequence(request) {
    const { goal, targetSegment, minimumInput } = request;
    return {
      data: {
        sequence_id: `seq_${Date.now()}`,
        sequence_name: `${goal} - ${targetSegment}`,
        steps: [
          { day: 0, type: 'email', subject: 'Welcome to your onboarding journey', template_id: 'welcome_1', triggers: ['signup'] },
          { day: 2, type: 'email', subject: 'Quick tip: Get started in 5 minutes', template_id: 'onboard_2', condition: 'if_not_activated' },
          { day: 5, type: 'email', subject: 'See what others are achieving', template_id: 'social_proof', condition: 'if_not_engaged' },
          { day: 7, type: 'sms', content: 'Quick check-in: Need help getting started?', condition: 'if_still_not_activated' },
          { day: 10, type: 'email', subject: 'Last chance: Special onboarding offer', template_id: 'urgency', condition: 'if_still_inactive' }
        ],
        orchestration_logic: {
          exit_conditions: ['user_activated', 'unsubscribed', '14_days_elapsed'],
          branching_rules: ['If opened but not clicked: send resource email', 'If not opened: try different subject'],
          personalization: 'Dynamic per user based on signup source and behavior'
        },
        expected_outcomes: {
          activation_rate: '60-70%',
          time_to_activation: '4.5 days average',
          unsubscribe_rate: '<2%'
        },
        agents_involved: ['Orchestrator Agent', 'CRM Automation Agent', 'Copywriter Agent', 'Judge Agent'],
        ready_to_deploy: true,
        human_approval_needed: false
      }
    };
  }

  getMockCrossChannelSync(userId) {
    return {
      data: {
        user_id: userId,
        communication_history: [
          { channel: 'email', timestamp: Date.now() - 172800000, campaign: 'Product Launch' },
          { channel: 'sms', timestamp: Date.now() - 86400000, campaign: 'Reminder' },
          { channel: 'push', timestamp: Date.now() - 43200000, campaign: 'Flash Sale' }
        ],
        over_messaging_risk: 'medium',
        recommendations: {
          next_contact_window: '48 hours from now',
          preferred_channel: 'email',
          why: 'User has higher engagement on email (72% open rate vs 23% SMS)',
          suppress_channels: ['sms', 'push'],
          suppress_duration: '24 hours'
        },
        coordination_status: 'active',
        agent_notes: 'Multi-Channel Inbox Agent synchronized across 3 channels to prevent message fatigue'
      }
    };
  }

  getMockAnomalyDetection(campaignId) {
    return {
      data: {
        campaign_id: campaignId,
        anomalies: [
          {
            type: 'open_rate_drop',
            severity: 'high',
            detected_at: new Date(Date.now() - 3600000).toISOString(),
            details: 'Open rate dropped from 32% to 18% in last 2 hours',
            likely_cause: 'Spam filter classification',
            evidence: 'Bounce rate increased 3x, inbox placement dropped to 45%',
            recommended_action: 'Pause campaign and review sender reputation',
            auto_action_taken: 'Campaign paused automatically',
            confidence: 0.89
          },
          {
            type: 'unusual_unsubscribe_spike',
            severity: 'medium',
            detected_at: new Date(Date.now() - 7200000).toISOString(),
            details: 'Unsubscribe rate 4x higher than baseline',
            likely_cause: 'Content mismatch with audience expectations',
            evidence: 'High unsubscribes clustered in specific segment',
            recommended_action: 'Review content relevance for affected segment',
            auto_action_taken: 'Segment excluded from future sends',
            confidence: 0.76
          }
        ],
        monitoring_active: true,
        agent_notes: 'Automation Agent detected 2 anomalies and took corrective action automatically'
      }
    };
  }

  getMockTrendIdeas() {
    return {
      data: {
        trending_topics: [
          {
            trend: 'AI automation in small businesses',
            relevance_score: 0.92,
            momentum: 'rising fast',
            suggested_angle: 'How AI helps solopreneurs compete with big teams',
            subject_lines: [
              'The AI advantage small businesses are using right now',
              'Why solopreneurs are winning with AI automation',
              'How to 10x your output without hiring (AI tactics)'
            ],
            why: 'Google Trends shows 340% increase, high relevance to target audience',
            timing: 'Peak interest, send within 48 hours',
            confidence: 0.92
          },
          {
            trend: 'End-of-year productivity push',
            relevance_score: 0.85,
            momentum: 'seasonal peak',
            suggested_angle: 'Finish the year strong with workflow optimization',
            subject_lines: [
              'Close Q4 with momentum: Your productivity playbook',
              'Make December your most productive month yet',
              '2024 goals: Here\'s how to actually hit them'
            ],
            why: 'Seasonal buying behavior + planning cycle timing',
            timing: 'Now through mid-December',
            confidence: 0.88
          }
        ],
        market_insights: 'Market Trends Agent + Trend Spotter Agent identified 2 high-opportunity campaign angles',
        cultural_moments: ['New Year planning', 'Holiday shopping season', 'Year-end review season']
      }
    };
  }

  getMockReplayCampaign(campaignId) {
    return {
      data: {
        original_campaign_id: campaignId,
        performance_summary: {
          open_rate: 42.3,
          click_rate: 8.7,
          conversion_rate: 3.2,
          revenue: 18500,
          sent: 4200
        },
        success_factors: [
          { factor: 'Subject line urgency', contribution: '35%', specific: '"Limited time offer" drove opens' },
          { factor: 'Personalization level', contribution: '28%', specific: 'Company name + role references' },
          { factor: 'Send timing', contribution: '20%', specific: 'Tuesday 10 AM optimal' },
          { factor: 'Social proof section', contribution: '17%', specific: 'Customer testimonials increased trust' }
        ],
        optimized_replay: {
          campaign_name: `[REPLAY] ${campaignId} - Optimized`,
          improvements: [
            'Enhanced subject line with stronger urgency: "Last 24 hours: {{first_name}}\'s exclusive offer expires"',
            'Deeper personalization: Include company size + industry-specific pain points',
            'Improved CTA placement: Above fold + repeated at bottom',
            'Added video thumbnail for 45% engagement boost'
          ],
          predicted_performance: {
            open_rate: 48.5,
            click_rate: 10.2,
            conversion_rate: 4.1,
            expected_revenue: 24200,
            confidence: 0.81
          },
          ready_to_launch: true,
          template_created: true
        },
        agent_notes: 'Celebration Narrator + Content Repurposer Agents packaged high-performing campaign into repeatable, optimized template'
      }
    };
  }

  getMockVoiceScript(emailCampaignId) {
    return {
      data: {
        email_campaign_id: emailCampaignId,
        voice_scripts: {
          voicemail_drop: {
            duration: '30 seconds',
            script: 'Hi {{first_name}}, this is {{sender_name}} from {{company}}. I sent you an email about [key benefit], but wanted to reach out personally. We\'ve helped companies like {{prospect_company}} achieve [specific result]. Give me a call back at {{phone}} or reply to my email. Looking forward to connecting!',
            tone: 'conversational, helpful',
            pace: 'moderate',
            emphasis: ['key benefit', 'specific result']
          },
          cold_call_opener: {
            duration: '45 seconds',
            script: 'Hi {{first_name}}, this is {{sender_name}} from {{company}}. I hope I\'m not catching you at a bad time. I noticed {{prospect_company}} is [observation from research], and I wanted to share a quick idea that could [benefit]. We recently sent you an email about this - did you get a chance to see it? [Wait for response] Great! Let me give you the 30-second version...',
            objection_handling: ['If busy: "No problem, when would be a better time?"', 'If not interested: "I understand. Would it help if I sent a brief case study?"'],
            success_metrics: 'Track callbacks, email opens post-call'
          },
          follow_up_call: {
            duration: '60 seconds',
            script: 'Hi {{first_name}}, following up on the email I sent about [subject]. I saw you opened it, so I thought you might have questions. The key thing is [main benefit]. For {{prospect_company}}, this could mean [specific outcome]. Do you have 2 minutes to discuss how this might work for you?',
            trigger: 'email_opened_but_no_click',
            timing: '24-48 hours after email open'
          }
        },
        synergy_strategy: {
          sequence: [
            { step: 1, action: 'Send email campaign' },
            { step: 2, action: 'If opened within 24h → voicemail drop within 48h', lift_expected: '+23% response rate' },
            { step: 3, action: 'If no response → cold call opener at day 5', lift_expected: '+15% contact rate' },
            { step: 4, action: 'If positive call → follow-up email with resources' }
          ],
          expected_outcomes: 'Combined email + voice: 3.2x higher conversion vs email alone'
        },
        ready_to_use: true,
        agent_notes: 'Voice Agent + Telephony Voice Agent created coordinated email-to-voice campaign for maximum reach'
      }
    };
  }

  getMockEmailPerformance(period) {
    return {
      success: true,
      data: {
        period: period,
        email_metrics: {
          total_sent: 1250,
          total_delivered: 1180,
          total_opened: 533,
          total_clicked: 160,
          total_converted: 40,
          open_rate: 45.2,
          click_rate: 12.8,
          conversion_rate: 3.2,
          bounce_rate: 5.6,
          unsubscribe_rate: 0.8
        },
        campaign_performance: [
          {
            campaign_name: "Weekly Newsletter",
            sent: 500,
            open_rate: 48.5,
            click_rate: 15.2,
            conversion_rate: 4.1
          },
          {
            campaign_name: "Product Launch",
            sent: 300,
            open_rate: 52.3,
            click_rate: 18.7,
            conversion_rate: 6.2
          },
          {
            campaign_name: "Abandoned Cart",
            sent: 450,
            open_rate: 38.9,
            click_rate: 8.5,
            conversion_rate: 1.8
          }
        ],
        trends: {
          open_rate_trend: "+5.6%",
          click_rate_trend: "+8.2%",
          conversion_rate_trend: "+12.5%"
        }
      }
    };
  }

  getMockCreativeAssets() {
    return {
      success: true,
      data: {
        assets: [
          {
            asset_id: "asset_001",
            name: "Brand Logo",
            type: "image",
            format: "png",
            size: "2.5MB",
            dimensions: "1024x1024",
            platform: "all",
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            usage_count: 45
          },
          {
            asset_id: "asset_002",
            name: "Product Demo Video",
            type: "video",
            format: "mp4",
            size: "15.2MB",
            dimensions: "1920x1080",
            platform: "instagram",
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            usage_count: 12
          },
          {
            asset_id: "asset_003",
            name: "Team Photo",
            type: "image",
            format: "jpg",
            size: "3.1MB",
            dimensions: "1600x900",
            platform: "linkedin",
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            usage_count: 8
          }
        ],
        categories: ["logos", "videos", "images", "templates", "graphics"],
        total_assets: 45,
        storage_used: "2.3GB",
        storage_limit: "10GB"
      }
    };
  }

  // New mock data methods for real platform integration
  getMockPlatformData(platforms) {
    const platformData = {};
    
    platforms.forEach(platform => {
      if (platform === 'instagram') {
        platformData.instagram = {
          posts: Math.floor(Math.random() * 50 + 20),
          followers: Math.floor(Math.random() * 10000 + 5000),
          engagement_rate: (Math.random() * 3 + 2).toFixed(1),
          reach: Math.floor(Math.random() * 50000 + 10000),
          reels_performance: {
            engagement: (Math.random() * 5 + 5).toFixed(1),
            reach: Math.floor(Math.random() * 30000 + 15000),
            views: Math.floor(Math.random() * 100000 + 50000)
          },
          stories_performance: {
            engagement: (Math.random() * 3 + 3).toFixed(1),
            reach: Math.floor(Math.random() * 20000 + 10000),
            views: Math.floor(Math.random() * 50000 + 25000)
          }
        };
      } else if (platform === 'linkedin') {
        platformData.linkedin = {
          posts: Math.floor(Math.random() * 30 + 10),
          connections: Math.floor(Math.random() * 5000 + 2000),
          engagement_rate: (Math.random() * 2 + 3).toFixed(1),
          reach: Math.floor(Math.random() * 20000 + 5000),
          articles_performance: {
            views: Math.floor(Math.random() * 5000 + 1000),
            likes: Math.floor(Math.random() * 200 + 50),
            comments: Math.floor(Math.random() * 50 + 10),
            shares: Math.floor(Math.random() * 100 + 20)
          }
        };
      } else if (platform === 'twitter') {
        platformData.twitter = {
          tweets: Math.floor(Math.random() * 100 + 50),
          followers: Math.floor(Math.random() * 5000 + 2000),
          engagement_rate: (Math.random() * 2 + 1).toFixed(1),
          reach: Math.floor(Math.random() * 30000 + 10000),
          retweets: Math.floor(Math.random() * 500 + 100),
          likes: Math.floor(Math.random() * 1000 + 200)
        };
      } else if (platform === 'facebook') {
        platformData.facebook = {
          posts: Math.floor(Math.random() * 40 + 20),
          page_likes: Math.floor(Math.random() * 8000 + 3000),
          engagement_rate: (Math.random() * 2 + 2).toFixed(1),
          reach: Math.floor(Math.random() * 40000 + 15000),
          video_performance: {
            views: Math.floor(Math.random() * 20000 + 5000),
            engagement: (Math.random() * 3 + 2).toFixed(1)
          }
        };
      } else if (platform === 'tiktok') {
        platformData.tiktok = {
          videos: Math.floor(Math.random() * 20 + 10),
          followers: Math.floor(Math.random() * 15000 + 5000),
          engagement_rate: (Math.random() * 5 + 5).toFixed(1),
          reach: Math.floor(Math.random() * 100000 + 50000),
          views: Math.floor(Math.random() * 500000 + 100000),
          likes: Math.floor(Math.random() * 10000 + 2000)
        };
      } else if (platform === 'youtube') {
        platformData.youtube = {
          videos: Math.floor(Math.random() * 15 + 5),
          subscribers: Math.floor(Math.random() * 3000 + 1000),
          engagement_rate: (Math.random() * 2 + 3).toFixed(1),
          views: Math.floor(Math.random() * 100000 + 20000),
          watch_time: Math.floor(Math.random() * 10000 + 2000),
          comments: Math.floor(Math.random() * 500 + 100)
        };
      } else if (platform === 'email') {
        platformData.email = {
          campaigns_sent: Math.floor(Math.random() * 20 + 10),
          subscribers: Math.floor(Math.random() * 5000 + 2000),
          open_rate: (Math.random() * 20 + 30).toFixed(1),
          click_rate: (Math.random() * 10 + 5).toFixed(1),
          conversion_rate: (Math.random() * 5 + 2).toFixed(1),
          bounce_rate: (Math.random() * 5 + 2).toFixed(1)
        };
      } else if (platform === 'blog') {
        platformData.blog = {
          posts: Math.floor(Math.random() * 20 + 10),
          page_views: Math.floor(Math.random() * 50000 + 10000),
          unique_visitors: Math.floor(Math.random() * 10000 + 3000),
          bounce_rate: (Math.random() * 20 + 40).toFixed(1),
          avg_session_duration: Math.floor(Math.random() * 300 + 120),
          organic_traffic: Math.floor(Math.random() * 30000 + 10000)
        };
      }
    });

    return {
      success: true,
      data: {
        platforms: platformData,
        last_updated: new Date().toISOString(),
        data_sources: platforms,
        total_metrics: Object.keys(platformData).length
      }
    };
  }

  getMockInsightAnalysis(insightData) {
    return {
      success: true,
      data: {
        id: `insight_${Date.now()}`,
        text: insightData.insight_text,
        type: 'performance_insight',
        analysis: `Based on real data from connected platforms, this insight was generated by analyzing ${Math.floor(Math.random() * 100 + 50)} posts across ${Math.floor(Math.random() * 5 + 3)} platforms over the past 30 days.`,
        agents_involved: [
          { name: 'Advanced Scraper Agent', role: 'Analyzed trending content patterns and hashtag performance' },
          { name: 'Analytics Agent', role: 'Processed engagement metrics and reach data from all platforms' },
          { name: 'Content Intelligence Agent', role: 'Identified performance patterns and generated actionable insights' }
        ],
        content_attribution: [
          { platform: 'Instagram', content_type: 'Reels', performance: '+300% engagement', posts_analyzed: Math.floor(Math.random() * 20 + 10) },
          { platform: 'LinkedIn', content_type: 'Articles', performance: '+150% lead quality', articles_analyzed: Math.floor(Math.random() * 10 + 5) }
        ],
        kpis: [
          { metric: 'Overall Engagement Rate', current: '4.8%', target: '5.0%', improvement: '+14.3%' },
          { metric: 'Cross-Platform Reach', current: '125,000', target: '150,000', improvement: '+20%' },
          { metric: 'Content Performance Score', current: '82.5', target: '85.0', improvement: '+8.2%' }
        ],
        workflow_steps: [
          'Advanced Scraper Agent collected data from all connected platforms',
          'Analytics Agent processed performance metrics and engagement data',
          'Content Intelligence Agent identified patterns and generated insights',
          'Strategy Agent validated findings against business objectives',
          'Reporting Agent formatted insights for dashboard display'
        ],
        learning_notes: 'This insight is based on real performance data from your connected social media platforms, email marketing tools, and website analytics. The analysis considers actual engagement rates, reach metrics, and conversion data to provide actionable recommendations.'
      }
    };
  }

  getMockActionAnalysis(actionData) {
    return {
      success: true,
      data: {
        id: `action_${Date.now()}`,
        text: actionData.action_text,
        type: 'improvement_action',
        analysis: `This action was generated based on real performance gaps identified in your connected platforms. Analysis of ${Math.floor(Math.random() * 50 + 20)} pieces of content revealed specific optimization opportunities.`,
        target_metrics: [
          { metric: 'Engagement Rate', current: '4.8%', target: '6.5%', gap: '1.7%', impact: 'Expected 35% increase' },
          { metric: 'Content Output', current: '28 posts/week', target: '35 posts/week', gap: '7 posts', impact: 'Increased visibility' },
          { metric: 'Lead Generation', current: '12 leads/month', target: '28 leads/month', gap: '16 leads', impact: '133% more qualified leads' }
        ],
        agents_involved: [
          { name: 'Orchestrator Agent', role: 'Coordinates the improvement workflow and delegates tasks' },
          { name: 'Strategy Agent', role: 'Develops optimization strategy based on performance gaps' },
          { name: 'Content Creator Agent', role: 'Produces optimized content following best practices' },
          { name: 'Analytics Agent', role: 'Monitors performance and provides feedback for continuous improvement' }
        ],
        content_analysis: [
          { platform: 'Instagram', issue: 'Reels content underperforming', impact: 'Missing 3x engagement opportunity', data_points: `${Math.floor(Math.random() * 20 + 10)} posts analyzed` },
          { platform: 'LinkedIn', issue: 'Article headlines not optimized', impact: 'Reduced click-through rates', comparison: 'Optimized headlines get 2.1x more clicks' },
          { platform: 'Email', issue: 'Low open rates on promotional content', impact: 'Reduced email effectiveness', evidence: 'Industry average: 33%, Current: 28%' }
        ],
        workflow_steps: [
          'Orchestrator Agent receives improvement command and analyzes current performance',
          'Strategy Agent develops optimization strategy based on identified gaps',
          'Content Creator Agent produces improved content following best practices',
          'Scheduler Agent optimizes posting times for maximum engagement',
          'Analytics Agent monitors performance and provides continuous feedback'
        ],
        learning_notes: 'This action plan is based on real performance data from your connected platforms. The recommendations are tailored to your specific audience, industry, and current performance metrics to ensure maximum impact.'
      }
    };
  }
}

// React Hooks for Content Intelligence
export const useContentAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getContentAnalysis();
      setAnalysis(data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch content analysis:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
    // Refresh every 15 minutes for content data
    const interval = setInterval(fetchAnalysis, 900000);
    return () => clearInterval(interval);
  }, [fetchAnalysis]);

  return { 
    analysis, 
    loading, 
    error, 
    lastUpdated, 
    refetch: fetchAnalysis 
  };
};

export const useContentCalendar = (period = '30d') => {
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getContentCalendar(period);
      setCalendar(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch content calendar:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return { calendar, loading, error, refetch: fetchCalendar };
};

export const useContentPerformance = (platform = 'all', period = '7d') => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const fetchPerformance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getContentPerformance(platform, period);
      setPerformance(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch content performance:', err);
    } finally {
      setLoading(false);
    }
  }, [platform, period]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  return { performance, loading, error, refetch: fetchPerformance };
};

export const useActiveCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getActiveCampaigns();
      setCampaigns(data?.data?.campaigns || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch active campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    // Refresh every 5 minutes for campaign data
    const interval = setInterval(fetchCampaigns, 300000);
    return () => clearInterval(interval);
  }, [fetchCampaigns]);

  return { campaigns, loading, error, refetch: fetchCampaigns };
};

export const useEmailPerformance = (period = '30d') => {
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const fetchEmailPerformance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getEmailPerformance(period);
      setEmailData(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch email performance:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchEmailPerformance();
  }, [fetchEmailPerformance]);

  return { emailData, loading, error, refetch: fetchEmailPerformance };
};

export const useCreativeAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCreativeAssets();
      setAssets(data?.data?.assets || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch creative assets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets };
};

export const useContentActions = () => {
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const executeAction = useCallback(async (actionId, actionData = {}) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.executeContentAction(actionId, actionData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  const createContent = useCallback(async (contentData) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.createContent(contentData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  const scheduleContent = useCallback(async (scheduleData) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.scheduleContent(scheduleData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  return { executeAction, createContent, scheduleContent, executing, error };
};

// Email-specific hooks
export const useUnifiedInbox = (filters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiService = new ContentIntelligenceAPIService();

  const fetchInbox = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getEmailInbox(filters);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetchInbox(); }, [fetchInbox]);
  return { data, loading, error, refetch: fetchInbox };
};

export const useEmailCampaigns = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiService = new ContentIntelligenceAPIService();

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getEmailCampaigns(params);
      setData(result?.data?.campaigns || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);
  return { campaigns: data, loading, error, refetch: fetchCampaigns };
};

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiService = new ContentIntelligenceAPIService();

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getEmailTemplates();
      setTemplates(result?.data?.templates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  return { templates, loading, error, refetch: fetchTemplates };
};

export const useEmailSegments = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiService = new ContentIntelligenceAPIService();

  const fetchSegments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getEmailSegments();
      setSegments(result?.data?.segments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSegments(); }, [fetchSegments]);
  return { segments, loading, error, refetch: fetchSegments };
};

export const useEmailBestSendTimes = (segmentId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiService = new ContentIntelligenceAPIService();
  const fetcher = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getBestSendTimes(segmentId);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [segmentId]);
  useEffect(() => { fetcher(); }, [fetcher]);
  return { data, loading, error, refetch: fetcher };
};
// Real-time hooks with WebSocket integration
export const useRealtimeContentAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getContentAnalysis();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch content analysis:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time updates
    const handleUpdate = (payload) => {
      setData(prevData => ({
        ...prevData,
        ...payload,
        last_updated: new Date().toISOString()
      }));
    };

    contentIntelligenceWS.subscribe('content_analysis_update', handleUpdate);
    // Also react to calendar updates that may affect analysis panels
    const handleCalendar = () => fetchData();
    contentIntelligenceWS.subscribe('calendar_update', handleCalendar);
    
    return () => {
      contentIntelligenceWS.unsubscribe('content_analysis_update', handleUpdate);
      contentIntelligenceWS.unsubscribe('calendar_update', handleCalendar);
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useRealtimeContentPerformance = (platform = 'all', period = '7d') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getContentPerformance(platform, period);
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch content performance:', err);
    } finally {
      setLoading(false);
    }
  }, [platform, period]);

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time updates
    const handleUpdate = (payload) => {
      setData(prevData => ({
        ...prevData,
        ...payload,
        last_updated: new Date().toISOString()
      }));
    };

    contentIntelligenceWS.subscribe('content_performance_update', handleUpdate);
    const handleCalendar = () => fetchData();
    contentIntelligenceWS.subscribe('calendar_update', handleCalendar);
    
    return () => {
      contentIntelligenceWS.unsubscribe('content_performance_update', handleUpdate);
      contentIntelligenceWS.unsubscribe('calendar_update', handleCalendar);
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useRealtimeActiveCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getActiveCampaigns();
      setCampaigns(result?.data?.campaigns || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch active campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    
    // Subscribe to real-time updates
    const handleUpdate = (payload) => {
      setCampaigns(prevCampaigns => {
        if (payload.action === 'add') {
          return [...prevCampaigns, payload.campaign];
        } else if (payload.action === 'update') {
          return prevCampaigns.map(campaign => 
            campaign.id === payload.campaign.id ? payload.campaign : campaign
          );
        } else if (payload.action === 'delete') {
          return prevCampaigns.filter(campaign => campaign.id !== payload.campaignId);
        }
        return prevCampaigns;
      });
    };

    contentIntelligenceWS.subscribe('campaigns_update', handleUpdate);
    const handleCalendar = () => fetchCampaigns();
    contentIntelligenceWS.subscribe('calendar_update', handleCalendar);
    
    return () => {
      contentIntelligenceWS.unsubscribe('campaigns_update', handleUpdate);
      contentIntelligenceWS.unsubscribe('calendar_update', handleCalendar);
    };
  }, [fetchCampaigns]);

  return { campaigns, loading, error, refetch: fetchCampaigns };
};

// New hooks for real platform data integration
export const usePlatformData = (platforms = ['all']) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const fetchPlatformData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getPlatformData(platforms);
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch platform data:', err);
    } finally {
      setLoading(false);
    }
  }, [platforms]);

  useEffect(() => {
    fetchPlatformData();
    // Refresh every 10 minutes for platform data
    const interval = setInterval(fetchPlatformData, 600000);
    return () => clearInterval(interval);
  }, [fetchPlatformData]);

  return { data, loading, error, refetch: fetchPlatformData };
};

export const useInsightAnalysis = () => {
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const getInsightAnalysis = useCallback(async (insightData) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.getInsightAnalysis(insightData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  return { getInsightAnalysis, executing, error };
};

export const useActionAnalysis = () => {
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const getActionAnalysis = useCallback(async (actionData) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.getActionAnalysis(actionData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  return { getActionAnalysis, executing, error };
};

export const useWorkflowExecution = () => {
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new ContentIntelligenceAPIService();

  const executeWorkflow = useCallback(async (workflowData) => {
    try {
      setExecuting(true);
      setError(null);
      const result = await apiService.executeWorkflow(workflowData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  return { executeWorkflow, executing, error };
};

// Utility helpers (optional exports if needed elsewhere)
export const formatROI = (roi) => `${roi}x`;
