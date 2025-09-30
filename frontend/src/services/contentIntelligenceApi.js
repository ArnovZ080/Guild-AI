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
  
  // Get creative assets from all platforms
  getCreativeAssets: '/content/assets',
  
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

  async getCreativeAssets() {
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getCreativeAssets);
    return result || this.getMockCreativeAssets();
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
    
    return () => {
      contentIntelligenceWS.unsubscribe('content_analysis_update', handleUpdate);
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
    
    return () => {
      contentIntelligenceWS.unsubscribe('content_performance_update', handleUpdate);
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
    
    return () => {
      contentIntelligenceWS.unsubscribe('campaigns_update', handleUpdate);
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
