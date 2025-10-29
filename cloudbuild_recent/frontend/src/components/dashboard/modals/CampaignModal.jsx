import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  X, 
  Calendar, 
  Users, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Zap,
  Info
} from 'lucide-react';

const CampaignModal = ({ campaign, onClose, onSave, onDelete, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goals: '',
    target_audience: '',
    start_date: '',
    end_date: '',
    budget: '',
    platforms: [],
    content_themes: [],
    status: 'planning', // planning, active, completed, paused
    priority: 'medium',
    campaign_type: 'awareness', // awareness, engagement, conversion, retention
    success_metrics: [],
    brand_guidelines: '',
    competitor_analysis: false,
    seasonal_timing: false,
    ai_optimization: true
  });

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [campaignContent, setCampaignContent] = useState([]);

  // Initialize form data if editing
  useEffect(() => {
    if (isEdit && campaign) {
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        goals: campaign.goals || '',
        target_audience: campaign.target_audience || '',
        start_date: campaign.start_date || '',
        end_date: campaign.end_date || '',
        budget: campaign.budget || '',
        platforms: campaign.platforms || [],
        content_themes: campaign.content_themes || [],
        status: campaign.status || 'planning',
        priority: campaign.priority || 'medium',
        campaign_type: campaign.campaign_type || 'awareness',
        success_metrics: campaign.success_metrics || [],
        brand_guidelines: campaign.brand_guidelines || '',
        competitor_analysis: campaign.competitor_analysis || false,
        seasonal_timing: campaign.seasonal_timing || false,
        ai_optimization: campaign.ai_optimization !== false
      });
      setCampaignContent(campaign.content || []);
    }
  }, [campaign, isEdit]);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', icon: '📺' },
    { id: 'pinterest', name: 'Pinterest', icon: '📌' },
    { id: 'email', name: 'Email', icon: '📧' }
  ];

  const contentThemes = [
    'Educational', 'Behind-the-scenes', 'User-generated content', 'Product showcases', 
    'Industry insights', 'Company culture', 'Customer stories', 'How-to guides', 
    'Trending topics', 'Seasonal content', 'Thought leadership', 'Community building'
  ];

  const campaignTypes = [
    { id: 'awareness', name: 'Brand Awareness', description: 'Increase brand recognition and reach' },
    { id: 'engagement', name: 'Engagement', description: 'Boost interaction and community building' },
    { id: 'conversion', name: 'Lead Generation', description: 'Drive leads and sales' },
    { id: 'retention', name: 'Customer Retention', description: 'Maintain and grow existing customers' }
  ];

  const successMetrics = [
    { id: 'reach', name: 'Reach', description: 'Number of people who see your content' },
    { id: 'engagement', name: 'Engagement Rate', description: 'Likes, comments, shares per post' },
    { id: 'clicks', name: 'Click-through Rate', description: 'Clicks on links or CTAs' },
    { id: 'conversions', name: 'Conversions', description: 'Leads, sales, or desired actions' },
    { id: 'brand_mentions', name: 'Brand Mentions', description: 'Mentions and user-generated content' },
    { id: 'follower_growth', name: 'Follower Growth', description: 'Increase in social media followers' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlatformToggle = (platformId) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleThemeToggle = (theme) => {
    setFormData(prev => ({
      ...prev,
      content_themes: prev.content_themes.includes(theme)
        ? prev.content_themes.filter(t => t !== theme)
        : [...prev.content_themes, theme]
    }));
  };

  const handleMetricToggle = (metricId) => {
    setFormData(prev => ({
      ...prev,
      success_metrics: prev.success_metrics.includes(metricId)
        ? prev.success_metrics.filter(m => m !== metricId)
        : [...prev.success_metrics, metricId]
    }));
  };

  const handleSave = () => {
    const campaignData = {
      ...formData,
      id: campaign?.id || `campaign_${Date.now()}`,
      created_at: campaign?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      content: campaignContent
    };
    onSave(campaignData);
  };

  const getCampaignAnalytics = () => {
    if (!campaignContent.length) return null;

    const analytics = {
      totalContent: campaignContent.length,
      publishedContent: campaignContent.filter(item => item.status === 'published').length,
      scheduledContent: campaignContent.filter(item => item.status === 'scheduled').length,
      draftContent: campaignContent.filter(item => item.status === 'draft').length,
      platformDistribution: {},
      themeDistribution: {},
      engagementEstimate: 0,
      reachEstimate: 0
    };

    // Calculate platform distribution
    campaignContent.forEach(item => {
      analytics.platformDistribution[item.platform] = (analytics.platformDistribution[item.platform] || 0) + 1;
    });

    // Calculate theme distribution
    campaignContent.forEach(item => {
      if (item.theme) {
        analytics.themeDistribution[item.theme] = (analytics.themeDistribution[item.theme] || 0) + 1;
      }
    });

    // Calculate engagement estimate
    const engagementScores = campaignContent.map(item => item.engagement_estimate || 0);
    analytics.engagementEstimate = engagementScores.length > 0 
      ? Math.round(engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length)
      : 0;

    // Calculate reach estimate
    const reachScores = campaignContent.map(item => item.reach_estimate || 0);
    analytics.reachEstimate = reachScores.length > 0 
      ? Math.round(reachScores.reduce((sum, score) => sum + score, 0) / reachScores.length)
      : 0;

    return analytics;
  };

  const analytics = getCampaignAnalytics();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Target className="w-6 h-6 text-purple-500 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEdit ? 'Edit Campaign' : 'Create New Campaign'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isEdit ? 'Update campaign details and settings' : 'Set up a comprehensive content campaign'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEdit && (
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                </button>
              )}
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Summer Product Launch"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
                    <select
                      value={formData.campaign_type}
                      onChange={(e) => handleInputChange('campaign_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {campaignTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="3"
                      placeholder="Describe your campaign objectives and strategy..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Goals & Objectives</label>
                    <textarea
                      value={formData.goals}
                      onChange={(e) => handleInputChange('goals', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="2"
                      placeholder="What do you want to achieve with this campaign?"
                    />
                  </div>
                </div>
              </div>

              {/* Target Audience & Timing */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Audience & Timing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <textarea
                      value={formData.target_audience}
                      onChange={(e) => handleInputChange('target_audience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="2"
                      placeholder="Describe your target audience..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget (Optional)</label>
                    <input
                      type="text"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., $5,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Platforms */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Platforms</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platforms.map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformToggle(platform.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.platforms.includes(platform.id)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{platform.icon}</div>
                      <div className="text-sm font-medium">{platform.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Themes */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Themes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {contentThemes.map(theme => (
                    <button
                      key={theme}
                      onClick={() => handleThemeToggle(theme)}
                      className={`p-2 rounded-md border text-sm transition-all ${
                        formData.content_themes.includes(theme)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Success Metrics */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {successMetrics.map(metric => (
                    <button
                      key={metric.id}
                      onClick={() => handleMetricToggle(metric.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.success_metrics.includes(metric.id)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{metric.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Competitor Analysis</div>
                      <div className="text-sm text-gray-600">Analyze competitor campaigns for insights</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.competitor_analysis}
                      onChange={(e) => handleInputChange('competitor_analysis', e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Seasonal Timing</div>
                      <div className="text-sm text-gray-600">Optimize for seasonal trends and events</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.seasonal_timing}
                      onChange={(e) => handleInputChange('seasonal_timing', e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">AI Optimization</div>
                      <div className="text-sm text-gray-600">Use AI to optimize content and scheduling</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.ai_optimization}
                      onChange={(e) => handleInputChange('ai_optimization', e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Campaign Status */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Campaign Status</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Campaign Analytics */}
              {showAnalytics && analytics && (
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Campaign Analytics
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-600">{analytics.totalContent}</div>
                        <div className="text-xs text-blue-700">Total Content</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">{analytics.publishedContent}</div>
                        <div className="text-xs text-green-700">Published</div>
                      </div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">{analytics.engagementEstimate}</div>
                      <div className="text-xs text-purple-700">Avg Engagement</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600">{analytics.reachEstimate}</div>
                      <div className="text-xs text-orange-700">Est. Reach</div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-blue-500" />
                  AI Recommendations
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Optimal Timing</div>
                      <div className="text-gray-600">Post during peak hours for your audience</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Content Mix</div>
                      <div className="text-gray-600">Balance educational and promotional content</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Cross-Platform</div>
                      <div className="text-gray-600">Adapt content for each platform's audience</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Tip */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-blue-900">Campaign Strategy Tip</div>
                    <div className="text-xs text-blue-700 mt-1">
                      Successful campaigns align content themes with business goals, target the right audience 
                      on appropriate platforms, and track meaningful metrics. Our AI helps optimize each element.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="flex space-x-2">
              {isEdit && (
                <button
                  onClick={() => onDelete && onDelete(campaign.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Campaign
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isEdit ? 'Update Campaign' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CampaignModal;
