import React from 'react';
import { 
  PenTool, 
  Heart, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

const ContentOverviewTab = ({ 
  contentAnalysis, 
  onOpenInsight, 
  onOpenAction, 
  onOpenContent,
  getInsightAnalysis,
  getActionAnalysis,
  platformData,
  analysis
}) => {
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

export default ContentOverviewTab;
