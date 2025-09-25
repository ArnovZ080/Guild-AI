// Content Dashboard Component for Content Intelligence Agent
// This component provides Content & Marketing Director oversight and insights

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  BarChart3,
  Calendar,
  Play,
  Image,
  Mail,
  Share2,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Settings,
  Plus
} from 'lucide-react';

// Import API hooks
import { 
  useContentAnalysis, 
  useContentCalendar, 
  useContentPerformance, 
  useActiveCampaigns, 
  useEmailPerformance, 
  useCreativeAssets,
  useContentActions,
  useRealtimeContentAnalysis,
  useRealtimeContentPerformance,
  useRealtimeActiveCampaigns
} from '../../services/contentIntelligenceApi';

const ContentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [expandedContent, setExpandedContent] = useState(new Set());

  // API hooks with real-time updates
  const { data: analysis, loading: analysisLoading, error: analysisError } = useRealtimeContentAnalysis();
  const { data: calendar, loading: calendarLoading } = useContentCalendar(selectedTimeframe);
  const { data: performance, loading: performanceLoading } = useRealtimeContentPerformance('all', selectedTimeframe);
  const { campaigns, loading: campaignsLoading } = useRealtimeActiveCampaigns();
  const { emailData, loading: emailLoading } = useEmailPerformance(selectedTimeframe);
  const { assets, loading: assetsLoading } = useCreativeAssets();
  const { executeAction, createContent, scheduleContent, executing } = useContentActions();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'calendar', label: 'Content Calendar', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'assets', label: 'Assets', icon: Image }
  ];

  const timeframes = [
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const toggleContentExpansion = (contentId) => {
    const newExpanded = new Set(expandedContent);
    if (newExpanded.has(contentId)) {
      newExpanded.delete(contentId);
    } else {
      newExpanded.add(contentId);
    }
    setExpandedContent(newExpanded);
  };

  const handleContentAction = async (actionId, actionData) => {
    try {
      await executeAction(actionId, actionData);
    } catch (error) {
      console.error('Content action failed:', error);
    }
  };

  const handleCampaignAction = async (campaignId, action) => {
    try {
      await executeAction(`campaign_${action}`, { campaign_id: campaignId });
    } catch (error) {
      console.error('Campaign action failed:', error);
    }
  };

  if (analysisLoading) {
    return <ContentDashboardSkeleton />;
  }

  const contentData = {
    content_analysis: analysis?.data,
    content_calendar: calendar?.data,
    performance_metrics: performance?.data,
    campaigns: campaigns
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Content Health Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-4 md:p-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 space-y-4 md:space-y-0">
          <div className="flex items-center">
            <PenTool className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Content Dashboard</h1>
              <p className="text-sm md:text-base text-gray-600">Content & Marketing Director oversight and insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {timeframes.map(timeframe => (
                <option key={timeframe.id} value={timeframe.id}>
                  {timeframe.label}
                </option>
              ))}
            </select>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {contentData.content_analysis?.content_health_score || 82.5}/100
              </div>
              <p className="text-sm text-gray-600">Content Health Score</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Content Output</p>
                <p className="text-2xl font-bold text-purple-800">
                  {contentData.content_analysis?.content_metrics?.content_output?.posts_per_week?.current || 28}/week
                </p>
                <p className="text-xs text-purple-600">
                  +{contentData.content_analysis?.content_metrics?.content_output?.posts_per_week?.change || 12}% from last week
                </p>
              </div>
              <PenTool className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-green-800">
                  {contentData.content_analysis?.content_metrics?.engagement_metrics?.engagement_rate?.current || 4.8}%
                </p>
                <p className="text-xs text-green-600">
                  +{contentData.content_analysis?.content_metrics?.engagement_metrics?.engagement_rate?.change || 14.3}% from last week
                </p>
              </div>
              <Heart className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Click-Through Rate</p>
                <p className="text-2xl font-bold text-blue-800">
                  {contentData.content_analysis?.content_metrics?.engagement_metrics?.click_through_rate?.current || 2.3}%
                </p>
                <p className="text-xs text-blue-600">
                  +{contentData.content_analysis?.content_metrics?.engagement_metrics?.click_through_rate?.change || 9.5}% from last week
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Cost per Lead</p>
                <p className="text-2xl font-bold text-yellow-800">
                  ${contentData.content_analysis?.content_metrics?.performance_metrics?.cost_per_lead?.current || 28.50}
                </p>
                <p className="text-xs text-yellow-600">
                  {contentData.content_analysis?.content_metrics?.performance_metrics?.cost_per_lead?.change || -10.9}% from last week
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-2 md:p-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs md:text-sm font-medium hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentOverviewTab contentAnalysis={contentData.content_analysis} />
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentCalendarTab calendar={contentData.content_calendar} />
          </motion.div>
        )}

        {activeTab === 'performance' && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ContentPerformanceTab performance={contentData.performance_metrics} />
          </motion.div>
        )}

        {activeTab === 'campaigns' && (
          <motion.div
            key="campaigns"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CampaignsTab campaigns={contentData.campaigns} onCampaignAction={handleCampaignAction} />
          </motion.div>
        )}

        {activeTab === 'email' && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <EmailTab emailData={emailData} />
          </motion.div>
        )}

        {activeTab === 'assets' && (
          <motion.div
            key="assets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <AssetsTab assets={assets} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Content Overview Tab Component
const ContentOverviewTab = ({ contentAnalysis }) => {
  const metrics = contentAnalysis?.content_metrics || {};
  
  // Helper function to determine color based on target comparison
  const getTargetColor = (current, target, isLowerBetter = false) => {
    if (current === undefined || target === undefined) return 'text-gray-600';
    
    const isAboveTarget = isLowerBetter ? current < target : current > target;
    return isAboveTarget ? 'text-green-600' : 'text-red-600';
  };
  
  return (
    <div className="space-y-6">
      {/* Key Content Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Content Output Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PenTool className="w-5 h-5 text-purple-500 mr-2" />
            Content Output
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Posts per Week</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {metrics.content_output?.posts_per_week?.current || 28}
                </span>
                <span className="text-green-600 text-sm ml-2">
                  +{metrics.content_output?.posts_per_week?.change || 12}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Blogs per Month</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {metrics.content_output?.blogs_per_month?.current || 8}
                </span>
                <span className={`text-sm ml-2 ${getTargetColor(
                  metrics.content_output?.blogs_per_month?.current || 8,
                  metrics.content_output?.blogs_per_month?.target || 12
                )}`}>
                  Target: {metrics.content_output?.blogs_per_month?.target || 12}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Videos per Week</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {metrics.content_output?.videos_per_week?.current || 5}
                </span>
                <span className={`text-sm ml-2 ${getTargetColor(
                  metrics.content_output?.videos_per_week?.current || 5,
                  metrics.content_output?.videos_per_week?.target || 8
                )}`}>
                  Target: {metrics.content_output?.videos_per_week?.target || 8}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="w-5 h-5 text-red-500 mr-2" />
            Engagement
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Engagement Rate</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {metrics.engagement_metrics?.engagement_rate?.current || 4.8}%
                </span>
                <span className={`text-sm ml-2 ${getTargetColor(
                  metrics.engagement_metrics?.engagement_rate?.current || 4.8,
                  metrics.engagement_metrics?.engagement_rate?.target || 5.0
                )}`}>
                  Target: {metrics.engagement_metrics?.engagement_rate?.target || 5.0}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Click-Through Rate</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {metrics.engagement_metrics?.click_through_rate?.current || 2.3}%
                </span>
                <span className={`text-sm ml-2 ${getTargetColor(
                  metrics.engagement_metrics?.click_through_rate?.current || 2.3,
                  metrics.engagement_metrics?.click_through_rate?.target || 2.5
                )}`}>
                  Target: {metrics.engagement_metrics?.click_through_rate?.target || 2.5}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {metrics.engagement_metrics?.conversion_rate?.current || 3.2}%
                </span>
                <span className={`text-sm ml-2 ${getTargetColor(
                  metrics.engagement_metrics?.conversion_rate?.current || 3.2,
                  metrics.engagement_metrics?.conversion_rate?.target || 3.5
                )}`}>
                  Target: {metrics.engagement_metrics?.conversion_rate?.target || 3.5}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-blue-500 mr-2" />
            Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cost per Lead</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  ${metrics.performance_metrics?.cost_per_lead?.current || 28.50}
                </span>
                <span className={`text-sm ml-2 ${getTargetColor(
                  metrics.performance_metrics?.cost_per_lead?.current || 28.50,
                  metrics.performance_metrics?.cost_per_lead?.target || 25.00,
                  true // Lower is better for cost per lead
                )}`}>
                  Target: ${metrics.performance_metrics?.cost_per_lead?.target || 25.00}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ROAS</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {metrics.performance_metrics?.return_on_ad_spend?.current || 3.8}x
                </span>
                <span className={`text-sm ml-2 ${getTargetColor(
                  metrics.performance_metrics?.return_on_ad_spend?.current || 3.8,
                  metrics.performance_metrics?.return_on_ad_spend?.target || 4.0
                )}`}>
                  Target: {metrics.performance_metrics?.return_on_ad_spend?.target || 4.0}x
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Follower Growth</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {metrics.engagement_metrics?.follower_growth?.current || 12.5}%
                </span>
                <span className={`text-sm ml-2 ${getTargetColor(
                  metrics.engagement_metrics?.follower_growth?.current || 12.5,
                  metrics.engagement_metrics?.follower_growth?.target || 15.0
                )}`}>
                  Target: {metrics.engagement_metrics?.follower_growth?.target || 15.0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {contentAnalysis?.key_insights && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            Key Content Insights
          </h3>
          <div className="space-y-3">
            {contentAnalysis.key_insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immediate Actions */}
      {contentAnalysis?.immediate_actions && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Immediate Actions Required
          </h3>
          <div className="space-y-3">
            {contentAnalysis.immediate_actions.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 font-medium">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performing Content */}
      {contentAnalysis?.top_performing_content && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            Top Performing Content
          </h3>
          <div className="space-y-4">
            {contentAnalysis.top_performing_content.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    content.platform === 'instagram' ? 'bg-pink-500' :
                    content.platform === 'linkedin' ? 'bg-blue-500' :
                    content.platform === 'twitter' ? 'bg-blue-400' :
                    'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {content.platform} {content.content_type}
                    </p>
                    <p className="text-sm text-gray-600">
                      {content.engagement_rate}% engagement • {content.reach?.toLocaleString()} reach
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">
                    {content.performance_score}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Content Calendar Tab Component
const ContentCalendarTab = ({ calendar }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 text-purple-500 mr-2" />
            Content Calendar
          </h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Content
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dayContent = calendar?.calendar?.filter(item => 
              new Date(item.scheduled_date).toDateString() === date.toDateString()
            ) || [];
            
            return (
              <div key={i} className="min-h-[120px] border border-gray-200 rounded-lg p-2">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayContent.slice(0, 3).map((content, idx) => (
                    <div key={idx} className={`text-xs p-1 rounded ${
                      content.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                      content.platform === 'linkedin' ? 'bg-blue-100 text-blue-800' :
                      content.platform === 'twitter' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {content.platform}
                    </div>
                  ))}
                  {dayContent.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayContent.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Content Performance Tab Component
const ContentPerformanceTab = ({ performance }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
          Content Performance Analytics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Performance */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Platform Performance</h4>
            <div className="space-y-3">
              {performance?.performance?.map((platform, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      platform.platform === 'instagram' ? 'bg-pink-500' :
                      platform.platform === 'linkedin' ? 'bg-blue-500' :
                      platform.platform === 'twitter' ? 'bg-blue-400' :
                      platform.platform === 'facebook' ? 'bg-blue-600' :
                      'bg-black'
                    }`}></div>
                    <span className="font-medium text-gray-900 capitalize">{platform.platform}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{platform.engagement_rate}%</span>
                    <p className="text-xs text-green-600">{platform.trend_percentage}%</p>
                  </div>
                </div>
              )) || ['instagram', 'linkedin', 'twitter', 'facebook', 'tiktok'].map(platform => (
                <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      platform === 'instagram' ? 'bg-pink-500' :
                      platform === 'linkedin' ? 'bg-blue-500' :
                      platform === 'twitter' ? 'bg-blue-400' :
                      platform === 'facebook' ? 'bg-blue-600' :
                      'bg-black'
                    }`}></div>
                    <span className="font-medium text-gray-900 capitalize">{platform}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">4.8%</span>
                    <p className="text-xs text-green-600">+12.5%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Type Performance */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Content Type Performance</h4>
            <div className="space-y-3">
              {[
                { type: 'Reels/Videos', performance: 8.5, change: '+25%' },
                { type: 'Static Posts', performance: 3.2, change: '+5%' },
                { type: 'Stories', performance: 6.1, change: '+18%' },
                { type: 'Articles', performance: 5.8, change: '+15%' },
                { type: 'Carousels', performance: 4.3, change: '+8%' }
              ].map((content, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{content.type}</span>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{content.performance}%</span>
                    <p className="text-xs text-green-600">{content.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Campaigns Tab Component
const CampaignsTab = ({ campaigns, onCampaignAction }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="w-5 h-5 text-blue-500 mr-2" />
            Active Campaigns
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns?.map((campaign) => (
            <div key={campaign.campaign_id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">{campaign.platforms?.join(', ') || 'Multi-platform'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium">${campaign.budget?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spent:</span>
                  <span className="font-medium">${campaign.spent?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROAS:</span>
                  <span className="font-medium text-green-600">
                    {campaign.performance_metrics?.return_on_ad_spend || campaign.roas}x
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Leads:</span>
                  <span className="font-medium">{campaign.performance_metrics?.conversions || campaign.leads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CPL:</span>
                  <span className="font-medium">
                    ${campaign.performance_metrics?.cost_per_lead || campaign.cost_per_lead}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${((campaign.spent || 0) / (campaign.budget || 1)) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(((campaign.spent || 0) / (campaign.budget || 1)) * 100)}% of budget used
                </p>
              </div>
            </div>
          )) || []}
        </div>
      </div>
    </div>
  );
};

// Email Tab Component
const EmailTab = ({ emailData }) => {
  const emailMetrics = emailData?.data?.email_metrics || {};
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Mail className="w-5 h-5 text-blue-500 mr-2" />
          Email Marketing Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {emailMetrics.open_rate || 45.2}%
            </div>
            <p className="text-sm text-blue-700">Open Rate</p>
            <p className="text-xs text-green-600">
              +{emailData?.data?.trends?.open_rate_trend?.replace('+', '') || 5.6}% from last month
            </p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {emailMetrics.click_rate || 12.8}%
            </div>
            <p className="text-sm text-green-700">Click Rate</p>
            <p className="text-xs text-green-600">
              +{emailData?.data?.trends?.click_rate_trend?.replace('+', '') || 8.2}% from last month
            </p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {emailMetrics.conversion_rate || 3.2}%
            </div>
            <p className="text-sm text-purple-700">Conversion Rate</p>
            <p className="text-xs text-green-600">
              +{emailData?.data?.trends?.conversion_rate_trend?.replace('+', '') || 12.5}% from last month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Assets Tab Component
const AssetsTab = ({ assets }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Image className="w-5 h-5 text-green-500 mr-2" />
            Creative Assets Library
          </h3>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Upload Asset
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {assets?.map((asset, index) => (
            <div key={asset.asset_id || index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer">
              <div className="text-center">
                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600">{asset.name}</p>
                <p className="text-xs text-gray-500">{asset.type}</p>
              </div>
            </div>
          )) || Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton loading component
const ContentDashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          <div className="h-12 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ContentDashboard;
