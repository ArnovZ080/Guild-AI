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
  useRealtimeActiveCampaigns
} from '../../services/contentIntelligenceApi';

const ContentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [expandedContent, setExpandedContent] = useState(new Set());
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);

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

  const handleRepeatStrategy = async (insight) => {
    setIsOrchestrating(true);
    try {
      // Send command to orchestrator agent to repeat successful strategy
      await executeAction('repeat_strategy', {
        insight_id: insight.id,
        strategy_type: insight.type,
        target_improvement: insight.target_improvement,
        agents_involved: insight.agents_involved,
        content_attribution: insight.content_attribution
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
      // Send command to orchestrator agent to execute improvement workflow
      await executeAction('execute_improvement_workflow', {
        action_id: action.id,
        action_type: action.type,
        target_metrics: action.target_metrics,
        agents_involved: action.agents_involved,
        workflow_steps: action.workflow_steps
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

  // Debug state
  console.log('ContentDashboard render - selectedInsight:', selectedInsight, 'selectedAction:', selectedAction);

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
            <ContentOverviewTab contentAnalysis={contentData.content_analysis} onOpenInsight={setSelectedInsight} onOpenAction={setSelectedAction} />
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
    </AnimatePresence>
    </>
  );
};

// Content Overview Tab Component
const ContentOverviewTab = ({ contentAnalysis, onOpenInsight, onOpenAction }) => {
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
                  onClick={() => {
                    console.log('Insight Details clicked:', insight);
                    onOpenInsight({
                      id: `insight_${index}`,
                      text: insight,
                      type: 'performance_insight',
                      target_improvement: '15-25%',
                      agents_involved: ['Content Intelligence Agent', 'Strategy Agent', 'Content Creator Agent'],
                      content_attribution: [
                        { platform: 'Instagram', content_type: 'Reels', performance: '+300% engagement' },
                        { platform: 'LinkedIn', content_type: 'Articles', performance: '+150% lead quality' }
                      ],
                      kpis: [
                        { metric: 'Engagement Rate', current: '8.5%', target: '5.0%', improvement: '+70%' },
                        { metric: 'Lead Quality', current: 'High', target: 'Medium', improvement: '+200%' }
                      ]
                    });
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
                  onClick={() => {
                    console.log('Action Details clicked:', action);
                    onOpenAction({
                      id: `action_${index}`,
                      text: action,
                      type: 'improvement_action',
                      target_metrics: [
                        { metric: 'Instagram Reels Content', current: '30%', target: '70%', gap: '40%' },
                        { metric: 'Engagement Rate', current: '4.8%', target: '5.0%', gap: '0.2%' }
                      ],
                      agents_involved: ['Orchestrator Agent', 'Strategy Agent', 'Content Creator Agent', 'Social Media Agent'],
                      content_analysis: [
                        { platform: 'Instagram', issue: 'Low Reels content ratio', impact: 'Reduced engagement' },
                        { platform: 'LinkedIn', issue: 'Article headlines not optimized', impact: 'Lower reach' }
                      ],
                      workflow_steps: [
                        'Analyze current content mix',
                        'Develop Reels-focused strategy',
                        'Create content calendar',
                        'Execute content creation',
                        'Monitor performance'
                      ]
                    });
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

// Insight Details Modal Component
const InsightDetailsModal = ({ insight, onClose, onRepeatStrategy, isOrchestrating }) => {
  console.log('InsightDetailsModal rendering with insight:', insight);
  
  if (!insight) {
    console.log('No insight provided to modal');
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
              <p className="text-green-700">{insight.text}</p>
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
                <h3 className="font-semibold text-gray-800 mb-3">Agents Involved</h3>
                <div className="space-y-2">
                  {insight.agents_involved?.map((agent, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{agent}</span>
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

            {/* Target Improvement */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Target Improvement</h3>
              <p className="text-yellow-700">Expected improvement: {insight.target_improvement}</p>
            </div>

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
  console.log('ActionDetailsModal rendering with action:', action);
  
  if (!action) {
    console.log('No action provided to modal');
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
              <p className="text-red-700">{action.text}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {action.agents_involved?.map((agent, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-blue-700">{agent}</span>
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

export default ContentDashboard;
