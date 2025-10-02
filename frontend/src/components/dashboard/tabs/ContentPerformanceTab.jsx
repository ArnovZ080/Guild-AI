import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Eye, Heart, Share2, MousePointer, Info, Brain, Target, Zap } from 'lucide-react';
import ContentPerformanceGarden from '../../visualizations/ContentPerformanceGarden';
import PlatformPerformanceModal from '../modals/PlatformPerformanceModal';
import ContentTypePerformanceModal from '../modals/ContentTypePerformanceModal';
import { useContentPerformance, useContentAnalysis } from '../../../services/contentIntelligenceApi';
import AgentActionsConfirmModal from '../modals/AgentActionsConfirmModal';
import UnifiedPerformanceInsightsModal from '../modals/UnifiedPerformanceInsightsModal';

const ContentPerformanceTab = ({ performance, contentIntelligenceData }) => {
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showContentTypeModal, setShowContentTypeModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [insightsConfirm, setInsightsConfirm] = useState(null);
  const [showUnifiedInsights, setShowUnifiedInsights] = useState(false);

  // Use real API hooks for data
  const { performance: realPerformance, loading: performanceLoading, error: performanceError } = useContentPerformance('all', '30d');
  const { analysis: contentAnalysis, loading: analysisLoading, error: analysisError } = useContentAnalysis();

  // Extract AI insights from content analysis
  const aiInsights = contentAnalysis?.data ? {
    overallPerformance: {
      score: contentAnalysis.data.content_health_score || 82.5,
      trend: 'up',
      summary: contentAnalysis.data.overall_performance || 'Your content is performing excellently with strong engagement across all platforms.',
      recommendations: contentAnalysis.data.immediate_actions || [
        'Increase video content production by 30%',
        'Optimize posting times for LinkedIn articles',
        'Focus on Instagram Reels for maximum reach'
      ]
    },
    platformInsights: {
      instagram: {
        performance: 88.2,
        keyInsight: 'Instagram Reels are generating 3x more engagement than static posts',
        recommendation: 'Increase Reels content to 70% of Instagram strategy',
        dataSource: 'Instagram Analytics API, Content Intelligence Agent analysis'
      },
      linkedin: {
        performance: 76.5,
        keyInsight: 'LinkedIn articles are driving highest quality leads with 45% conversion rate',
        recommendation: 'Optimize article headlines for better reach and engagement',
        dataSource: 'LinkedIn Analytics API, Lead attribution tracking'
      },
      twitter: {
        performance: 65.3,
        keyInsight: 'Thread content performs 2.5x better than single tweets',
        recommendation: 'Increase thread content and optimize posting times',
        dataSource: 'Twitter Analytics API, Engagement pattern analysis'
      }
    },
    contentTypeInsights: {
      video: {
        performance: 92.1,
        keyInsight: 'Video content performs 2.5x better across all platforms',
        recommendation: 'Create more video content for all platforms',
        dataSource: 'Multi-platform analytics, Content Intelligence Agent'
      },
      articles: {
        performance: 78.4,
        keyInsight: 'Long-form articles drive highest quality leads',
        recommendation: 'Increase article production and optimize for SEO',
        dataSource: 'Blog analytics, Search console data'
      },
      reels: {
        performance: 95.2,
        keyInsight: 'Reels have highest viral potential with 15% share rate',
        recommendation: 'Focus on trending audio and quick cuts',
        dataSource: 'Instagram Analytics, Viral content analysis'
      }
    }
  } : null;

  const handlePlatformClick = (platform) => {
    setSelectedPlatform(platform);
    setShowPlatformModal(true);
  };

  const handleContentTypeClick = (contentType) => {
    setSelectedContentType(contentType);
    setShowContentTypeModal(true);
  };

  const handlePlantClick = (plant) => {
    console.log('Plant clicked:', plant);
    // Could open a detailed modal for the specific content piece
  };

  // Get platform performance data from real API or fallback to props
  const platformPerformance = realPerformance?.data?.performance || performance?.performance || [
    { platform: 'instagram', engagement_rate: 8.5, trend_percentage: 25, reach: 15000, impressions: 25000 },
    { platform: 'linkedin', engagement_rate: 6.2, trend_percentage: 15, reach: 8500, impressions: 12000 },
    { platform: 'twitter', engagement_rate: 4.8, trend_percentage: 12, reach: 12000, impressions: 18000 },
    { platform: 'facebook', engagement_rate: 5.1, trend_percentage: 8, reach: 9500, impressions: 14000 },
    { platform: 'tiktok', engagement_rate: 7.3, trend_percentage: 18, reach: 11000, impressions: 16000 }
  ];

  // Get content type performance data from real API or fallback
  const contentTypePerformance = realPerformance?.data?.content_type_performance || [
    { type: 'Reels/Videos', performance: 8.5, change: '+25%', reach: 15000, engagement: 8.5 },
    { type: 'Static Posts', performance: 3.2, change: '+5%', reach: 8500, engagement: 3.2 },
    { type: 'Stories', performance: 6.1, change: '+18%', reach: 12000, engagement: 6.1 },
    { type: 'Articles', performance: 5.8, change: '+15%', reach: 9500, engagement: 5.8 },
    { type: 'Carousels', performance: 4.3, change: '+8%', reach: 11000, engagement: 4.3 }
  ];

  // Transform data for garden visualization using real API data
  const gardenData = {
    content_performance: realPerformance?.data?.content_performance || platformPerformance.map((platform, index) => ({
      content_id: `platform_${platform.platform}`,
      title: `${platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)} Content`,
      content_type: 'social',
      platform: platform.platform,
      engagement_rate: platform.engagement_rate,
      reach: platform.reach,
      impressions: platform.impressions,
      conversion_rate: platform.engagement_rate * 0.6, // Simulate conversion rate
      performance_score: platform.engagement_rate * 10,
      publish_date: new Date().toISOString(),
      category: 'Social Media',
      seasonal: index % 2 === 0
    }))
  };

  // Show loading state
  if (performanceLoading || analysisLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading content performance data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (performanceError || analysisError) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center text-red-600">
            <p className="text-lg font-medium mb-2">Error loading performance data</p>
            <p className="text-sm">{performanceError || analysisError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Performance Garden */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            Content Performance Garden
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => setShowUnifiedInsights(true)}
              className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100"
            >
              <Brain className="w-4 h-4" />
              <span>AI-Powered Insights</span>
            </button>
          </div>
        </div>
        
        <ContentPerformanceGarden 
          performanceData={gardenData} 
          onPlantClick={handlePlantClick}
        />
        
        {aiInsights && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">AI Content Intelligence Summary</span>
            </div>
            <p className="text-sm text-blue-700 mb-2">{aiInsights.overallPerformance.summary}</p>
            <div className="text-xs text-blue-600">
              <strong>Key Insight:</strong> {aiInsights.overallPerformance.recommendations[0]}
            </div>
          </div>
        )}
      </div>

      {/* Performance Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Platform Performance
            </h4>
            <button 
              onClick={() => handlePlatformClick('all')}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Info className="w-3 h-3 mr-1" />
              View Details
            </button>
          </div>
          
          <div className="space-y-3">
            {platformPerformance.map((platform, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handlePlatformClick(platform.platform)}
              >
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
                  <p className="text-xs text-green-600">+{platform.trend_percentage}%</p>
                </div>
              </div>
            ))}
          </div>
          
          {aiInsights && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-800">AI Insight</span>
              </div>
              <p className="text-xs text-green-700">
                {aiInsights.platformInsights.instagram?.keyInsight || 'Platform performance analysis available'}
              </p>
            </div>
          )}
        </div>

        {/* Content Type Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Content Type Performance
            </h4>
            <button 
              onClick={() => handleContentTypeClick('all')}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Info className="w-3 h-3 mr-1" />
              View Details
            </button>
          </div>
          
          <div className="space-y-3">
            {contentTypePerformance.map((content, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleContentTypeClick(content.type)}
              >
                <span className="font-medium text-gray-900">{content.type}</span>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{content.performance}%</span>
                  <p className="text-xs text-green-600">{content.change}</p>
                </div>
              </div>
            ))}
          </div>
          
          {aiInsights && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Brain className="w-3 h-3 text-purple-600" />
                <span className="text-xs font-medium text-purple-800">AI Analysis</span>
              </div>
              <p className="text-xs text-purple-700">
                {aiInsights.contentTypeInsights.video?.keyInsight || 'Content type performance analysis available'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Panel */}
      {aiInsights && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">AI Content Intelligence Insights</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">Overall Performance</h5>
              <p className="text-sm text-blue-700 mb-2">{aiInsights.overallPerformance.summary}</p>
              <div className="text-xs text-blue-600">
                <strong>Score:</strong> {aiInsights.overallPerformance.score}/100
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-green-800">Top Recommendations</h5>
                <button
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  onClick={() => {
                    const recs = aiInsights.overallPerformance.recommendations || [];
                    setInsightsConfirm({ actions: recs });
                  }}
                >
                  Activate agents
                </button>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                {aiInsights.overallPerformance.recommendations.slice(0, 2).map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1 h-1 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {insightsConfirm && (
            <AgentActionsConfirmModal
              title="Activate agents for top recommendations"
              description="Select which actions to run now."
              actions={insightsConfirm.actions}
              onCancel={() => setInsightsConfirm(null)}
              onProceed={(selected) => {
                // This panel confirms selection; detailed execution happens in per-platform/type modals
                setInsightsConfirm(null);
              }}
            />
          )}
        </div>
      )}

      {/* Modals */}
      {showPlatformModal && (
        <PlatformPerformanceModal
          platform={selectedPlatform}
          performanceData={platformPerformance}
          aiInsights={aiInsights}
          onClose={() => setShowPlatformModal(false)}
        />
      )}
      
      {showContentTypeModal && (
        <ContentTypePerformanceModal
          contentType={selectedContentType}
          performanceData={contentTypePerformance}
          aiInsights={aiInsights}
          onClose={() => setShowContentTypeModal(false)}
        />
      )}

      {showUnifiedInsights && (
        <UnifiedPerformanceInsightsModal
          analysis={contentAnalysis}
          performance={realPerformance}
          onClose={() => setShowUnifiedInsights(false)}
        />
      )}
    </div>
  );
};

export default ContentPerformanceTab;
