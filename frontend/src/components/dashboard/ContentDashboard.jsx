// Content Dashboard Component for Content Intelligence Agent
// This component provides Content & Marketing Director oversight and insights

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
  Plus,
  X
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
  useRealtimeActiveCampaigns,
  usePlatformData,
  useInsightAnalysis,
  useActionAnalysis,
  useWorkflowExecution
} from '../../services/contentIntelligenceApi';

const ContentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [expandedContent, setExpandedContent] = useState(new Set());
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedContentItem, setSelectedContentItem] = useState(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);

  // API hooks with real-time updates and platform integration
  const { data: analysis, loading: analysisLoading, error: analysisError } = useRealtimeContentAnalysis();
  const { data: calendar, loading: calendarLoading } = useContentCalendar(selectedTimeframe);
  const { data: performance, loading: performanceLoading } = useRealtimeContentPerformance('all', selectedTimeframe);
  const { campaigns, loading: campaignsLoading } = useRealtimeActiveCampaigns();
  const { emailData, loading: emailLoading } = useEmailPerformance(selectedTimeframe);
  const { assets, loading: assetsLoading } = useCreativeAssets();
  const { executeAction, createContent, scheduleContent, executing } = useContentActions();
  
  // Platform data integration for real metrics
  const { data: platformData, loading: platformLoading, error: platformError } = usePlatformData(['instagram', 'linkedin', 'twitter', 'facebook', 'tiktok', 'youtube', 'email', 'blog']);
  
  // Analysis hooks for dynamic insights and actions
  const { getInsightAnalysis, executing: insightExecuting, error: insightError } = useInsightAnalysis();
  const { getActionAnalysis, executing: actionExecuting, error: actionError } = useActionAnalysis();
  const { executeWorkflow, executing: workflowExecuting, error: workflowError } = useWorkflowExecution();

  // Debug state changes
  useEffect(() => {
    console.log('selectedContentItem changed:', selectedContentItem);
  }, [selectedContentItem]);

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

  const handleRepeatStrategy = async (insight) => {
    setIsOrchestrating(true);
    try {
      // Execute workflow using real platform data
      await executeWorkflow({
        workflow_type: 'repeat_strategy',
        insight_id: insight.id,
        strategy_type: insight.type,
        workflow_steps: insight.workflow_steps,
        agents_involved: insight.agents_involved,
        content_attribution: insight.content_attribution,
        platform_data: platformData?.data?.platforms || {},
        performance_data: analysis?.data?.content_metrics || {},
        content_analysis: analysis?.data || {}
      });
      
      // Show success message
      console.log('Strategy repeat initiated successfully');
    } catch (error) {
      console.error('Failed to repeat strategy:', error);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const handleExecuteAction = async (action) => {
    setIsOrchestrating(true);
    try {
      // Execute workflow using real platform data
      await executeWorkflow({
        workflow_type: 'execute_improvement_workflow',
        action_id: action.id,
        action_type: action.type,
        target_metrics: action.target_metrics,
        agents_involved: action.agents_involved,
        workflow_steps: action.workflow_steps,
        content_analysis: action.content_analysis,
        platform_data: platformData?.data?.platforms || {},
        performance_data: analysis?.data?.content_metrics || {},
        content_analysis: analysis?.data || {}
      });
      
      // Show success message
      console.log('Improvement workflow initiated successfully');
    } catch (error) {
      console.error('Failed to execute improvement workflow:', error);
    } finally {
      setIsOrchestrating(false);
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
    <>
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
            <ContentOverviewTab contentAnalysis={contentData.content_analysis} onOpenInsight={setSelectedInsight} onOpenAction={setSelectedAction} onOpenContent={setSelectedContentItem} />
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

    {/* Modals - Outside main container */}
    <AnimatePresence>
      {/* Insight Details Modal */}
      {selectedInsight && (
        <InsightDetailsModal
          insight={selectedInsight}
          onClose={() => setSelectedInsight(null)}
          onRepeatStrategy={handleRepeatStrategy}
          isOrchestrating={isOrchestrating}
        />
      )}

      {/* Action Details Modal */}
      {selectedAction && (
        <ActionDetailsModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onExecuteAction={handleExecuteAction}
          isOrchestrating={isOrchestrating}
        />
      )}

      {/* Content Details Modal */}
      {selectedContentItem && (
        <ContentDetailsModal
          content={selectedContentItem}
          onClose={() => setSelectedContentItem(null)}
          onReplicate={async (content) => {
            setIsOrchestrating(true);
            try {
              await executeWorkflow({
                workflow_type: 'replicate_top_content',
                content_id: content.id,
                platform: content.platform,
                content_type: content.content_type,
                source_post_url: content.post_url,
                attributes: {
                  hook: content.hook,
                  format: content.format,
                  length: content.length,
                  audio: content.audio,
                  hashtags: content.hashtags,
                  media_urls: content.media_urls
                },
                metrics: {
                  engagement_rate: content.engagement_rate,
                  reach: content.reach,
                  impressions: content.impressions,
                  clicks: content.clicks,
                  conversions: content.conversions
                },
                platform_data: platformData?.data?.platforms || {},
                performance_data: analysis?.data?.content_metrics || {},
                content_analysis: analysis?.data || {}
              });
              console.log('Replicate content workflow initiated');
            } catch (error) {
              console.error('Failed to replicate content:', error);
            } finally {
              setIsOrchestrating(false);
            }
          }}
          isOrchestrating={isOrchestrating}
        />
      )}
    </AnimatePresence>
    </>
  );
};

// Content Overview Tab Component
const ContentOverviewTab = ({ contentAnalysis, onOpenInsight, onOpenAction, onOpenContent }) => {
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
              <div key={index} className="flex items-start justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-start space-x-3 flex-1">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{insight}</p>
                </div>
                <button
                  onClick={async () => {
                    console.log('Insight Details clicked:', insight);
                    
                    try {
                      // Fetch detailed analysis from Content Intelligence Agent using real platform data
                      const insightAnalysis = await getInsightAnalysis({
                        insight_text: insight,
                        insight_index: index,
                        platform_data: platformData?.data?.platforms || {},
                        performance_data: analysis?.data?.content_metrics || {},
                        content_analysis: analysis?.data || {}
                      });
                      
                      onOpenInsight(insightAnalysis?.data || insightAnalysis);
                    } catch (error) {
                      console.error('Failed to fetch insight analysis:', error);
                      // Fallback to basic insight data
                      onOpenInsight({
                        id: `insight_${index}`,
                        text: insight,
                        type: 'performance_insight',
                        analysis: 'Analysis in progress...',
                        agents_involved: [],
                        content_attribution: [],
                        kpis: [],
                        workflow_steps: [],
                        learning_notes: ''
                      });
                    }
                  }}
                  className="ml-3 px-3 py-1 text-xs font-medium text-green-600 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                >
                  Details
                </button>
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
              <div key={index} className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start space-x-3 flex-1">
                  <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{action}</p>
                </div>
                <button
                  onClick={async () => {
                    console.log('Action Details clicked:', action);
                    
                    try {
                      // Fetch detailed analysis from Content Intelligence Agent using real platform data
                      const actionAnalysis = await getActionAnalysis({
                        action_text: action,
                        action_index: index,
                        platform_data: platformData?.data?.platforms || {},
                        performance_data: analysis?.data?.content_metrics || {},
                        current_metrics: analysis?.data?.content_metrics || {},
                        content_analysis: analysis?.data || {}
                      });
                      
                      onOpenAction(actionAnalysis?.data || actionAnalysis);
                    } catch (error) {
                      console.error('Failed to fetch action analysis:', error);
                      // Fallback to basic action data
                      onOpenAction({
                        id: `action_${index}`,
                        text: action,
                        type: 'improvement_action',
                        analysis: 'Analysis in progress...',
                        target_metrics: [],
                        agents_involved: [],
                        content_analysis: [],
                        workflow_steps: [],
                        learning_notes: ''
                      });
                    }
                  }}
                  className="ml-3 px-3 py-1 text-xs font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                >
                  Details
                </button>
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
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">
                      {content.performance_score}/100
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      console.log('Content Details clicked:', content);
                      // Open content details modal with this content item
                      const contentItem = {
                        ...content,
                        id: content.content_id || `content_${index}`
                      };
                      console.log('Setting selectedContentItem:', contentItem);
                      onOpenContent(contentItem);
                    }}
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Content Details Modal for Top Performing Content
const ContentDetailsModal = ({ content, onClose, onReplicate, isOrchestrating }) => {
  if (!content) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 text-green-500 mr-3" />
              Top Content Details
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 capitalize">{content.platform} {content.content_type}</h3>
                  {content.post_url && (
                    <a href={content.post_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm underline">View original post</a>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">{content.performance_score}/100</span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded border">
                <h3 className="font-semibold text-gray-800 mb-3">Key Metrics</h3>
                <div className="space-y-2 text-sm">
                  {content.engagement_rate !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Engagement Rate</span><span className="font-medium text-gray-900">{content.engagement_rate}%</span></div>
                  )}
                  {content.reach !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Reach</span><span className="font-medium text-gray-900">{content.reach?.toLocaleString?.() || content.reach}</span></div>
                  )}
                  {content.impressions !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Impressions</span><span className="font-medium text-gray-900">{content.impressions?.toLocaleString?.() || content.impressions}</span></div>
                  )}
                  {content.clicks !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Clicks</span><span className="font-medium text-gray-900">{content.clicks?.toLocaleString?.() || content.clicks}</span></div>
                  )}
                  {content.conversions !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Conversions</span><span className="font-medium text-gray-900">{content.conversions?.toLocaleString?.() || content.conversions}</span></div>
                  )}
                  {content.watch_time !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Watch Time (s)</span><span className="font-medium text-gray-900">{content.watch_time}</span></div>
                  )}
                  {content.comments !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Comments</span><span className="font-medium text-gray-900">{content.comments}</span></div>
                  )}
                </div>
              </div>

              {/* Content Attributes */}
              <div className="bg-white p-4 rounded border">
                <h3 className="font-semibold text-gray-800 mb-3">Content Attributes</h3>
                <div className="space-y-2 text-sm">
                  {content.hook && (<div className="flex justify-between"><span className="text-gray-600">Hook</span><span className="font-medium text-gray-900">{content.hook}</span></div>)}
                  {content.format && (<div className="flex justify-between"><span className="text-gray-600">Format</span><span className="font-medium text-gray-900 capitalize">{content.format}</span></div>)}
                  {content.length && (<div className="flex justify-between"><span className="text-gray-600">Length</span><span className="font-medium text-gray-900">{content.length}</span></div>)}
                  {content.audio && (<div className="flex justify-between"><span className="text-gray-600">Audio</span><span className="font-medium text-gray-900">{content.audio}</span></div>)}
                  {content.hashtags && (<div className="flex justify-between"><span className="text-gray-600">Hashtags</span><span className="font-medium text-gray-900">{Array.isArray(content.hashtags) ? content.hashtags.join(', ') : content.hashtags}</span></div>)}
                </div>
              </div>
            </div>

            {/* Media Previews */}
            {(content.media_urls || content.thumbnail_url) && (
              <div className="bg-white p-4 rounded border">
                <h3 className="font-semibold text-gray-800 mb-3">Media</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.isArray(content.media_urls) && content.media_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                      <img src={url} alt={`media_${i}`} className="w-full h-28 object-cover rounded" />
                    </a>
                  ))}
                  {content.thumbnail_url && (
                    <img src={content.thumbnail_url} alt="thumbnail" className="w-full h-28 object-cover rounded" />
                  )}
                </div>
              </div>
            )}

            {/* Useful Tips */}
            {content.tips && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Useful Tips</h3>
                <p className="text-yellow-700 text-sm">{content.tips}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onReplicate(content)}
                disabled={isOrchestrating}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center space-x-2"
              >
                {isOrchestrating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Orchestrating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Replicate Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Draggable Content Item Component
const DraggableContentItem = ({ content, onClick, onSelect, isSelected }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'content',
    item: { content },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onSelect(content.content_id, e.target.checked);
  };

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`text-xs p-1 rounded cursor-move hover:opacity-80 transition-opacity ${
        isDragging ? 'opacity-50' : ''
      } ${
        content.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
        content.platform === 'linkedin' ? 'bg-blue-100 text-blue-800' :
        content.platform === 'twitter' ? 'bg-blue-100 text-blue-800' :
        content.platform === 'facebook' ? 'bg-blue-100 text-blue-800' :
        content.platform === 'tiktok' ? 'bg-black text-white' :
        content.platform === 'youtube' ? 'bg-red-100 text-red-800' :
        content.platform === 'email' ? 'bg-green-100 text-green-800' :
        'bg-gray-100 text-gray-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium capitalize">{content.platform}</div>
          <div className="text-xs opacity-75">{content.content_type}</div>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
      </div>
    </div>
  );
};

// Droppable Calendar Day Component
const DroppableCalendarDay = ({ date, content, onContentMove, onContentClick, onContentSelect, selectedItems }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'content',
    drop: (item) => {
      const newDate = new Date(date);
      newDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      onContentMove(item.content, newDate);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`min-h-[120px] border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors ${
        isOver && canDrop ? 'bg-purple-50 border-purple-300' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-900">
          {date.getDate()}
        </div>
        {content.length > 0 && (
          <div className="text-xs text-purple-600 font-medium">
            {content.length}
          </div>
        )}
      </div>
      <div className="space-y-1">
        {content.slice(0, 3).map((item, idx) => (
          <DraggableContentItem
            key={idx}
            content={item}
            onClick={() => onContentClick(item)}
            onSelect={onContentSelect}
            isSelected={selectedItems.has(item.content_id)}
          />
        ))}
        {content.length > 3 && (
          <div className="text-xs text-gray-500">
            +{content.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Content Calendar Tab Component
const ContentCalendarTab = ({ calendar }) => {
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedContent, setSelectedContent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [localCalendar, setLocalCalendar] = useState(calendar?.calendar || []);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAISchedulingModal, setShowAISchedulingModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const platforms = ['all', 'instagram', 'linkedin', 'twitter', 'facebook', 'tiktok', 'youtube', 'email'];
  const statuses = ['all', 'scheduled', 'published', 'draft'];

  // Update local calendar when prop changes
  useEffect(() => {
    if (calendar?.calendar) {
      setLocalCalendar(calendar.calendar);
    }
  }, [calendar]);

  // Filter content based on search and filters
  const filteredCalendar = localCalendar.filter(item => {
    const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      item.content_preview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.platform?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content_type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPlatform && matchesStatus && matchesSearch;
  });

  // Get content for a specific date
  const getContentForDate = (date) => {
    return filteredCalendar.filter(item => 
      new Date(item.scheduled_date).toDateString() === date.toDateString()
    );
  };

  // Get content for current view
  const getViewContent = () => {
    const content = [];
    const today = new Date();
    
    if (viewMode === 'month') {
      // Show 30 days from today
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        content.push({
          date,
          content: getContentForDate(date)
        });
      }
    } else if (viewMode === 'week') {
      // Show 7 days from selected date
      const startDate = new Date(selectedDate);
      startDate.setDate(selectedDate.getDate() - selectedDate.getDay());
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        content.push({
          date,
          content: getContentForDate(date)
        });
      }
    } else if (viewMode === 'day') {
      // Show single day
      content.push({
        date: selectedDate,
        content: getContentForDate(selectedDate)
      });
    }
    
    return content;
  };

  const viewContent = getViewContent();

  // Handle content move via drag and drop
  const handleContentMove = (content, newDate) => {
    setLocalCalendar(prevCalendar => 
      prevCalendar.map(item => 
        item.content_id === content.content_id 
          ? { ...item, scheduled_date: newDate.toISOString() }
          : item
      )
    );
  };

  // Handle content click
  const handleContentClick = (content) => {
    setSelectedContent(content);
  };

  // Handle item selection for bulk operations
  const handleItemSelect = (contentId, isSelected) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(contentId);
      } else {
        newSet.delete(contentId);
      }
      setShowBulkActions(newSet.size > 0);
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.size === filteredCalendar.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set(filteredCalendar.map(item => item.content_id));
      setSelectedItems(allIds);
      setShowBulkActions(true);
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    const selectedContent = localCalendar.filter(item => selectedItems.has(item.content_id));
    
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedContent.length} content items?`)) {
          setLocalCalendar(prev => prev.filter(item => !selectedItems.has(item.content_id)));
          setSelectedItems(new Set());
          setShowBulkActions(false);
        }
        break;
      case 'publish':
        setLocalCalendar(prev => prev.map(item => 
          selectedItems.has(item.content_id) 
            ? { ...item, status: 'published' }
            : item
        ));
        setSelectedItems(new Set());
        setShowBulkActions(false);
        break;
      case 'schedule':
        setLocalCalendar(prev => prev.map(item => 
          selectedItems.has(item.content_id) 
            ? { ...item, status: 'scheduled' }
            : item
        ));
        setSelectedItems(new Set());
        setShowBulkActions(false);
        break;
      case 'draft':
        setLocalCalendar(prev => prev.map(item => 
          selectedItems.has(item.content_id) 
            ? { ...item, status: 'draft' }
            : item
        ));
        setSelectedItems(new Set());
        setShowBulkActions(false);
        break;
      default:
        break;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
      {/* Enhanced Header with Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-purple-500 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Content Calendar</h3>
              <p className="text-sm text-gray-600">Plan and schedule your content across all platforms</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'month', label: 'Month', icon: Calendar },
                { id: 'week', label: 'Week', icon: Clock },
                { id: 'day', label: 'Day', icon: Target }
              ].map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === mode.id
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.size} selected
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleBulkAction('publish')}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleBulkAction('schedule')}
                    className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  >
                    Schedule
                  </button>
                  <button
                    onClick={() => handleBulkAction('draft')}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Performance Analytics Button */}
            <button 
              onClick={() => setShowAnalyticsModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>

            {/* AI-Powered Scheduling Button */}
            <button 
              onClick={() => setShowAISchedulingModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI Schedule
            </button>

            {/* Create Content Button */}
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Select All Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredCalendar.length && filteredCalendar.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label className="ml-2 text-sm text-gray-700">Select All</label>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Platform Filter */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {platforms.map(platform => (
              <option key={platform} value={platform}>
                {platform === 'all' ? 'All Platforms' : platform.charAt(0).toUpperCase() + platform.slice(1)}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Performance Analytics Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
            Content Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {filteredCalendar.length}
              </div>
              <div className="text-sm text-gray-600">Total Scheduled</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredCalendar.filter(item => item.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredCalendar.filter(item => item.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredCalendar.filter(item => item.ai_generated).length}
              </div>
              <div className="text-sm text-gray-600">AI Generated</div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'month' && (
          <div className="space-y-4">
            {/* Month Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Month Grid */}
            <div className="grid grid-cols-7 gap-2">
              {viewContent.map((dayData, i) => (
                <DroppableCalendarDay
                  key={i}
                  date={dayData.date}
                  content={dayData.content}
                  onContentMove={handleContentMove}
                  onContentClick={handleContentClick}
                  onContentSelect={handleItemSelect}
                  selectedItems={selectedItems}
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'week' && (
          <div className="space-y-4">
            {/* Week Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {viewContent.map((dayData, i) => (
                <div key={i} className="text-center font-medium text-gray-600 py-2">
                  {dayData.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  <div className="text-sm text-gray-500">{dayData.date.getDate()}</div>
                </div>
              ))}
            </div>
            
            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-2">
              {viewContent.map((dayData, i) => (
                <DroppableCalendarDay
                  key={i}
                  date={dayData.date}
                  content={dayData.content}
                  onContentMove={handleContentMove}
                  onContentClick={handleContentClick}
                  onContentSelect={handleItemSelect}
                  selectedItems={selectedItems}
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'day' && (
          <div className="space-y-4">
            {/* Day Header */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
            </div>
            
            {/* Day Content */}
            <div className="space-y-3">
              {viewContent[0]?.content.map((content, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedContent(content)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        content.platform === 'instagram' ? 'bg-pink-500' :
                        content.platform === 'linkedin' ? 'bg-blue-500' :
                        content.platform === 'twitter' ? 'bg-blue-400' :
                        content.platform === 'facebook' ? 'bg-blue-600' :
                        content.platform === 'tiktok' ? 'bg-black' :
                        content.platform === 'youtube' ? 'bg-red-500' :
                        content.platform === 'email' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div>
                        <div className="font-medium capitalize">{content.platform} {content.content_type}</div>
                        <div className="text-sm text-gray-600">{content.content_preview}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        content.status === 'published' ? 'bg-green-100 text-green-800' :
                        content.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {content.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {viewContent[0]?.content.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No content scheduled for this day</p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Schedule Content
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content Details Modal */}
      {selectedContent && (
        <ContentDetailsModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onEdit={() => {
            setSelectedContent(null);
            setShowEditModal(true);
          }}
        />
      )}

      {/* Create Content Modal */}
      {showCreateModal && (
        <CreateContentModal
          onClose={() => setShowCreateModal(false)}
          onSave={(contentData) => {
            console.log('Creating content:', contentData);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Edit Content Modal */}
      {showEditModal && (
        <EditContentModal
          content={selectedContent}
          onClose={() => setShowEditModal(false)}
          onSave={(contentData) => {
            console.log('Updating content:', contentData);
            setShowEditModal(false);
          }}
        />
      )}

      {/* AI Scheduling Modal */}
      {showAISchedulingModal && (
        <AISchedulingModal
          onClose={() => setShowAISchedulingModal(false)}
          onSchedule={(suggestions) => {
            console.log('AI-generated content suggestions:', suggestions);
            // Add suggestions to calendar
            setLocalCalendar(prev => [...prev, ...suggestions]);
            setShowAISchedulingModal(false);
          }}
        />
      )}

      {/* Performance Analytics Modal */}
      {showAnalyticsModal && (
        <PerformanceAnalyticsModal
          calendar={localCalendar}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}
      </div>
    </DndProvider>
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

// Insight Details Modal Component
const InsightDetailsModal = ({ insight, onClose, onRepeatStrategy, isOrchestrating }) => {
  if (!insight) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
              Strategy Insight Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Insight Summary */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Insight Summary</h3>
              <p className="text-green-700 mb-3">{insight.text}</p>
              {insight.analysis && (
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-gray-800 mb-2">Why This Insight Was Generated:</h4>
                  <p className="text-gray-700 text-sm">{insight.analysis}</p>
                </div>
              )}
            </div>

            {/* KPIs and Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Key Performance Indicators</h3>
                <div className="space-y-2">
                  {insight.kpis?.map((kpi, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{kpi.metric}</span>
                      <div className="text-right">
                        <span className="font-medium text-gray-900">{kpi.current}</span>
                        <span className="text-xs text-gray-500 ml-2">Target: {kpi.target}</span>
                        <span className="text-xs text-green-600 ml-2">({kpi.improvement})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Agents Involved & Their Roles</h3>
                <div className="space-y-3">
                  {insight.agents_involved?.map((agent, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-800">{agent.name || agent}</span>
                      </div>
                      {agent.role && (
                        <p className="text-xs text-gray-600 ml-4">{agent.role}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Attribution */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">Content Attribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insight.content_attribution?.map((content, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900 capitalize">{content.platform}</span>
                        <span className="text-gray-600 ml-2 capitalize">{content.content_type}</span>
                      </div>
                      <span className="text-green-600 font-medium">{content.performance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Steps */}
            {insight.workflow_steps && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-3">How Agents Worked Together</h3>
                <div className="space-y-2">
                  {insight.workflow_steps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-purple-700 text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Notes */}
            {insight.learning_notes && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Useful Tips</h3>
                <p className="text-yellow-700 text-sm">{insight.learning_notes}</p>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onRepeatStrategy(insight)}
                disabled={isOrchestrating}
                className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center space-x-2"
              >
                {isOrchestrating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Orchestrating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Repeat Strategy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Action Details Modal Component
const ActionDetailsModal = ({ action, onClose, onExecuteAction, isOrchestrating }) => {
  if (!action) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              Action Required Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Action Summary */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Action Required</h3>
              <p className="text-red-700 mb-3">{action.text}</p>
              {action.analysis && (
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-gray-800 mb-2">Why This Action Is Required:</h4>
                  <p className="text-gray-700 text-sm">{action.analysis}</p>
                </div>
              )}
            </div>

            {/* Target Metrics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Target Metrics & Gaps</h3>
              <div className="space-y-3">
                {action.target_metrics?.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <span className="font-medium text-gray-900">{metric.metric}</span>
                      <div className="text-sm text-gray-600">
                        Current: {metric.current} | Target: {metric.target}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-red-600 font-medium">Gap: {metric.gap}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agents Involved */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">Agents Involved in Workflow</h3>
              <div className="space-y-3">
                {action.agents_involved?.map((agent, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-800">{agent.name || agent}</span>
                    </div>
                    {agent.role && (
                      <p className="text-xs text-gray-600 ml-4">{agent.role}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content Analysis */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-3">Content Analysis & Issues</h3>
              <div className="space-y-2">
                {action.content_analysis?.map((analysis, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-gray-900 capitalize">{analysis.platform}</span>
                        <p className="text-sm text-gray-600 mt-1">{analysis.issue}</p>
                      </div>
                      <span className="text-red-600 text-sm font-medium">{analysis.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Planned Workflow Steps</h3>
              <div className="space-y-2">
                {action.workflow_steps?.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-green-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Notes */}
            {action.learning_notes && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Useful Tips</h3>
                <p className="text-yellow-700 text-sm">{action.learning_notes}</p>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onExecuteAction(action)}
                disabled={isOrchestrating}
                className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center space-x-2"
              >
                {isOrchestrating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Orchestrating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Execute Action</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


// Create Content Modal
const CreateContentModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    platform: '',
    content_type: '',
    theme: '',
    content_preview: '',
    scheduled_date: '',
    priority: 'medium'
  });

  const platforms = ['instagram', 'linkedin', 'twitter', 'facebook', 'tiktok', 'youtube', 'email'];
  const contentTypes = ['post', 'story', 'reel', 'article', 'tweet', 'video', 'email'];
  const themes = ['educational', 'promotional', 'behind_scenes', 'user_generated', 'entertainment'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Plus className="w-6 h-6 text-purple-500 mr-3" />
              Create Content
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform *
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Platform</option>
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type *
                </label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Type</option>
                  {contentTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Theme</option>
                  {themes.map(theme => (
                    <option key={theme} value={theme}>
                      {theme.replace('_', ' ').charAt(0).toUpperCase() + theme.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Preview *
              </label>
              <textarea
                value={formData.content_preview}
                onChange={(e) => setFormData({ ...formData, content_preview: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Describe your content..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-md transition-colors"
              >
                Create Content
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Edit Content Modal
const EditContentModal = ({ content, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    platform: content?.platform || '',
    content_type: content?.content_type || '',
    theme: content?.theme || '',
    content_preview: content?.content_preview || '',
    scheduled_date: content?.scheduled_date ? new Date(content.scheduled_date).toISOString().slice(0, 16) : '',
    priority: content?.priority || 'medium'
  });

  const platforms = ['instagram', 'linkedin', 'twitter', 'facebook', 'tiktok', 'youtube', 'email'];
  const contentTypes = ['post', 'story', 'reel', 'article', 'tweet', 'video', 'email'];
  const themes = ['educational', 'promotional', 'behind_scenes', 'user_generated', 'entertainment'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 text-blue-500 mr-3" />
              Edit Content
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform *
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Platform</option>
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type *
                </label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Type</option>
                  {contentTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Theme</option>
                  {themes.map(theme => (
                    <option key={theme} value={theme}>
                      {theme.replace('_', ' ').charAt(0).toUpperCase() + theme.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Preview *
              </label>
              <textarea
                value={formData.content_preview}
                onChange={(e) => setFormData({ ...formData, content_preview: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Describe your content..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
              >
                Update Content
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// AI Scheduling Modal Component
const AISchedulingModal = ({ onClose, onSchedule }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    business_objectives: '',
    target_audience: '',
    platforms: [],
    content_themes: [],
    timeframe: '30d',
    content_frequency: 'medium'
  });

  const platforms = ['instagram', 'linkedin', 'twitter', 'facebook', 'tiktok', 'youtube', 'email'];
  const themes = ['educational', 'promotional', 'behind_scenes', 'user_generated', 'entertainment', 'trending'];

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock suggestions based on form data
      const mockSuggestions = generateMockSuggestions(formData);
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockSuggestions = (data) => {
    const suggestions = [];
    const days = data.timeframe === '7d' ? 7 : data.timeframe === '30d' ? 30 : 90;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Generate 1-3 content pieces per day based on frequency
      const numContent = data.content_frequency === 'low' ? 1 : 
                        data.content_frequency === 'medium' ? 2 : 3;
      
      for (let j = 0; j < numContent; j++) {
        const platform = data.platforms[Math.floor(Math.random() * data.platforms.length)] || 'instagram';
        const theme = data.content_themes[Math.floor(Math.random() * data.content_themes.length)] || 'educational';
        
        suggestions.push({
          content_id: `ai_suggestion_${i}_${j}`,
          platform: platform,
          content_type: getContentTypeForPlatform(platform),
          theme: theme,
          content_preview: generateContentPreview(theme, platform),
          scheduled_date: date.toISOString(),
          status: 'scheduled',
          priority: Math.random() > 0.7 ? 'high' : 'medium',
          engagement_estimate: Math.floor(Math.random() * 1000) + 100,
          ai_generated: true
        });
      }
    }
    
    return suggestions;
  };

  const getContentTypeForPlatform = (platform) => {
    const types = {
      instagram: ['post', 'story', 'reel'],
      linkedin: ['article', 'post'],
      twitter: ['tweet', 'thread'],
      facebook: ['post', 'video'],
      tiktok: ['video'],
      youtube: ['video'],
      email: ['newsletter', 'promotional']
    };
    const platformTypes = types[platform] || ['post'];
    return platformTypes[Math.floor(Math.random() * platformTypes.length)];
  };

  const generateContentPreview = (theme, platform) => {
    const previews = {
      educational: `Educational content about industry insights for ${platform}`,
      promotional: `Promotional content showcasing our latest product on ${platform}`,
      behind_scenes: `Behind-the-scenes look at our team and process for ${platform}`,
      user_generated: `User-generated content featuring customer stories on ${platform}`,
      entertainment: `Entertaining content to engage our audience on ${platform}`,
      trending: `Trending topic discussion tailored for ${platform}`
    };
    return previews[theme] || `Content for ${platform}`;
  };

  const handleSchedule = () => {
    onSchedule(suggestions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="w-6 h-6 text-purple-500 mr-3" />
              AI-Powered Content Scheduling
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Configuration Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Content Strategy Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Objectives
                  </label>
                  <textarea
                    value={formData.business_objectives}
                    onChange={(e) => setFormData({ ...formData, business_objectives: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Describe your business objectives..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <textarea
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Describe your target audience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platforms
                  </label>
                  <div className="space-y-2">
                    {platforms.map(platform => (
                      <label key={platform} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.platforms.includes(platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, platforms: [...formData.platforms, platform] });
                            } else {
                              setFormData({ ...formData, platforms: formData.platforms.filter(p => p !== platform) });
                            }
                          }}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Themes
                  </label>
                  <div className="space-y-2">
                    {themes.map(theme => (
                      <label key={theme} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.content_themes.includes(theme)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, content_themes: [...formData.content_themes, theme] });
                            } else {
                              setFormData({ ...formData, content_themes: formData.content_themes.filter(t => t !== theme) });
                            }
                          }}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{theme.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeframe
                  </label>
                  <select
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="90d">90 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Frequency
                  </label>
                  <select
                    value={formData.content_frequency}
                    onChange={(e) => setFormData({ ...formData, content_frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low (1 post/day)</option>
                    <option value="medium">Medium (2 posts/day)</option>
                    <option value="high">High (3+ posts/day)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <button
                onClick={handleGenerateSuggestions}
                disabled={isGenerating || formData.platforms.length === 0 || formData.content_themes.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating AI Suggestions...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate AI Content Suggestions
                  </>
                )}
              </button>
            </div>

            {/* Generated Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Generated Content Suggestions ({suggestions.length} items)
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {suggestions.slice(0, 10).map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          suggestion.platform === 'instagram' ? 'bg-pink-500' :
                          suggestion.platform === 'linkedin' ? 'bg-blue-500' :
                          suggestion.platform === 'twitter' ? 'bg-blue-400' :
                          suggestion.platform === 'facebook' ? 'bg-blue-600' :
                          suggestion.platform === 'tiktok' ? 'bg-black' :
                          suggestion.platform === 'youtube' ? 'bg-red-500' :
                          suggestion.platform === 'email' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}></div>
                        <div>
                          <div className="font-medium capitalize text-sm">
                            {suggestion.platform} {suggestion.content_type}
                          </div>
                          <div className="text-xs text-gray-600">{suggestion.content_preview}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(suggestion.scheduled_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {suggestions.length > 10 && (
                    <div className="text-center text-sm text-gray-500">
                      ... and {suggestions.length - 10} more suggestions
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              {suggestions.length > 0 && (
                <button
                  onClick={handleSchedule}
                  className="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-md transition-colors"
                >
                  Schedule All Suggestions
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Performance Analytics Modal Component
const PerformanceAnalyticsModal = ({ calendar, onClose }) => {
  // Calculate analytics from calendar data
  const analytics = {
    totalContent: calendar.length,
    publishedContent: calendar.filter(item => item.status === 'published').length,
    scheduledContent: calendar.filter(item => item.status === 'scheduled').length,
    draftContent: calendar.filter(item => item.status === 'draft').length,
    aiGenerated: calendar.filter(item => item.ai_generated).length,
    platformDistribution: calculatePlatformDistribution(calendar),
    themeDistribution: calculateThemeDistribution(calendar),
    weeklyDistribution: calculateWeeklyDistribution(calendar),
    engagementEstimates: calculateEngagementEstimates(calendar)
  };

  function calculatePlatformDistribution(calendar) {
    const distribution = {};
    calendar.forEach(item => {
      distribution[item.platform] = (distribution[item.platform] || 0) + 1;
    });
    return distribution;
  }

  function calculateThemeDistribution(calendar) {
    const distribution = {};
    calendar.forEach(item => {
      if (item.theme) {
        distribution[item.theme] = (distribution[item.theme] || 0) + 1;
      }
    });
    return distribution;
  }

  function calculateWeeklyDistribution(calendar) {
    const distribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // Sunday to Saturday
    calendar.forEach(item => {
      const dayOfWeek = new Date(item.scheduled_date).getDay();
      distribution[dayOfWeek]++;
    });
    return distribution;
  }

  function calculateEngagementEstimates(calendar) {
    const estimates = calendar
      .filter(item => item.engagement_estimate)
      .map(item => item.engagement_estimate);
    
    if (estimates.length === 0) return { average: 0, total: 0, max: 0, min: 0 };
    
    return {
      average: Math.round(estimates.reduce((sum, est) => sum + est, 0) / estimates.length),
      total: estimates.reduce((sum, est) => sum + est, 0),
      max: Math.max(...estimates),
      min: Math.min(...estimates)
    };
  }

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 text-blue-500 mr-3" />
              Content Performance Analytics
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analytics.totalContent}</div>
                <div className="text-sm text-blue-700">Total Content</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analytics.publishedContent}</div>
                <div className="text-sm text-green-700">Published</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{analytics.scheduledContent}</div>
                <div className="text-sm text-yellow-700">Scheduled</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analytics.aiGenerated}</div>
                <div className="text-sm text-purple-700">AI Generated</div>
              </div>
            </div>

            {/* Platform Distribution */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Platform Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.platformDistribution).map(([platform, count]) => (
                  <div key={platform} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{platform}</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((count / analytics.totalContent) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Distribution */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Content Theme Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(analytics.themeDistribution).map(([theme, count]) => (
                  <div key={theme} className="text-center">
                    <div className="text-xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{theme.replace('_', ' ')}</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((count / analytics.totalContent) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Distribution */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Weekly Content Distribution</h3>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {analytics.weeklyDistribution[index]}
                    </div>
                    <div className="text-xs text-gray-600">{day.slice(0, 3)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement Estimates */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Engagement Estimates</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.engagementEstimates.average}</div>
                  <div className="text-sm text-gray-600">Average</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.engagementEstimates.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analytics.engagementEstimates.max}</div>
                  <div className="text-sm text-gray-600">Max</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analytics.engagementEstimates.min}</div>
                  <div className="text-sm text-gray-600">Min</div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">AI Recommendations</h3>
              <div className="space-y-2">
                {analytics.platformDistribution.instagram > analytics.platformDistribution.linkedin * 2 && (
                  <div className="text-sm text-purple-700">
                    💡 Consider increasing LinkedIn content - Instagram is over-represented
                  </div>
                )}
                {analytics.weeklyDistribution[0] > analytics.weeklyDistribution[1] && (
                  <div className="text-sm text-purple-700">
                    💡 Sunday has more content than Monday - consider rebalancing for better weekday engagement
                  </div>
                )}
                {analytics.aiGenerated < analytics.totalContent * 0.3 && (
                  <div className="text-sm text-purple-700">
                    💡 Only {Math.round((analytics.aiGenerated / analytics.totalContent) * 100)}% of content is AI-generated - consider using AI scheduling for more efficiency
                  </div>
                )}
                {analytics.engagementEstimates.average < 500 && (
                  <div className="text-sm text-purple-700">
                    💡 Average engagement estimate is low - consider optimizing content themes and platforms
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContentDashboard;
