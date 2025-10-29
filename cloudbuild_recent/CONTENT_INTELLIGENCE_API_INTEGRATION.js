// Content Intelligence Agent API Integration
// This file contains the API methods and hooks for the Content Intelligence Agent

// API Service Extensions for Content Intelligence
export const CONTENT_INTELLIGENCE_API_ENDPOINTS = {
  // Get comprehensive content analysis
  getContentAnalysis: '/content/analysis',
  
  // Get content calendar
  getContentCalendar: '/content/calendar',
  
  // Get content performance metrics
  getContentPerformance: '/content/performance',
  
  // Get active campaigns
  getActiveCampaigns: '/content/campaigns',
  
  // Get email marketing performance
  getEmailPerformance: '/content/email-performance',
  
  // Get creative assets
  getCreativeAssets: '/content/assets',
  
  // Create content
  createContent: '/content/create',
  
  // Schedule content
  scheduleContent: '/content/schedule',
  
  // Execute content actions
  executeContentAction: '/content/execute-action',
  
  // Update content strategy
  updateContentStrategy: '/content/update-strategy'
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
    const result = await this.request(CONTENT_INTELLIGENCE_API_ENDPOINTS.getContentAnalysis);
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

// Utility Functions
export const formatEngagementRate = (rate) => {
  return `${rate.toFixed(1)}%`;
};

export const formatReach = (reach) => {
  if (reach >= 1000000) return `${(reach / 1000000).toFixed(1)}M`;
  if (reach >= 1000) return `${(reach / 1000).toFixed(1)}K`;
  return reach.toString();
};

export const formatROI = (roi) => {
  return `${roi}x`;
};

export const getPlatformColor = (platform) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return '#E4405F';
    case 'linkedin': return '#0077B5';
    case 'twitter': return '#1DA1F2';
    case 'facebook': return '#1877F2';
    case 'tiktok': return '#000000';
    case 'youtube': return '#FF0000';
    default: return '#6B7280';
  }
};

export const getContentTypeIcon = (contentType) => {
  switch (contentType.toLowerCase()) {
    case 'video': return '🎥';
    case 'image': return '🖼️';
    case 'text': return '📝';
    case 'story': return '📖';
    case 'reel': return '🎬';
    case 'article': return '📰';
    default: return '📄';
  }
};

export const calculateEngagementRate = (likes, comments, shares, reach) => {
  if (!reach || reach === 0) return 0;
  return ((likes + comments + shares) / reach * 100).toFixed(2);
};

export const calculateClickThroughRate = (clicks, impressions) => {
  if (!impressions || impressions === 0) return 0;
  return (clicks / impressions * 100).toFixed(2);
};

export const calculateConversionRate = (conversions, clicks) => {
  if (!clicks || clicks === 0) return 0;
  return (conversions / clicks * 100).toFixed(2);
};

export const calculateCostPerLead = (spend, leads) => {
  if (!leads || leads === 0) return 0;
  return (spend / leads).toFixed(2);
};

export const calculateReturnOnAdSpend = (revenue, spend) => {
  if (!spend || spend === 0) return 0;
  return (revenue / spend).toFixed(1);
};

// Export the API service instance
export const contentAPIService = new ContentIntelligenceAPIService();
