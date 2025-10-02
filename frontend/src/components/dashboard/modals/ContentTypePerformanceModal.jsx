import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, Eye, Heart, Share2, MousePointer, BarChart3, Brain, Target, Zap, Clock, Users, DollarSign, Video, FileText, Image, Music } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';

const ContentTypePerformanceModal = ({ contentType, performanceData, aiInsights, onClose }) => {
  const contentData = performanceData.find(c => c.type === contentType) || performanceData[0];
  const contentTypeInsights = aiInsights?.contentTypeInsights?.[contentType.toLowerCase().replace(/[^a-z]/g, '')] || 
                              aiInsights?.contentTypeInsights?.video;

  const getContentIcon = (type) => {
    const icons = {
      'Reels/Videos': Video,
      'Static Posts': Image,
      'Stories': Clock,
      'Articles': FileText,
      'Carousels': BarChart3
    };
    return icons[type] || BarChart3;
  };

  const ContentIcon = getContentIcon(contentType);

  const metrics = [
    {
      label: 'Performance Score (%)',
      value: contentData?.performance || 0,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Overall performance rating based on engagement, reach, and conversion',
      calculation: 'Weighted average of engagement rate, reach, and conversion metrics'
    },
    {
      label: 'Reach',
      value: contentData?.reach?.toLocaleString() || '0',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Number of unique people who saw this content type',
      calculation: 'Sum of unique viewers across all content pieces'
    },
    {
      label: 'Engagement Rate (%)',
      value: contentData?.engagement || 0,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Average engagement rate for this content type',
      calculation: 'Total engagements / Total reach × 100'
    },
    {
      label: 'Growth Trend',
      value: contentData?.change || '+0%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Performance change compared to previous period',
      calculation: 'Current period performance vs previous period'
    }
  ];

  const contentBreakdown = [
    { type: 'Video Content', count: 45, avgEngagement: 8.5, avgReach: 12000 },
    { type: 'Image Posts', count: 32, avgEngagement: 4.2, avgReach: 8500 },
    { type: 'Text Posts', count: 28, avgEngagement: 3.8, avgReach: 6500 },
    { type: 'Carousel Posts', count: 15, avgEngagement: 6.1, avgReach: 9500 },
    { type: 'Story Content', count: 38, avgEngagement: 5.3, avgReach: 7200 }
  ];

  const topPerformers = [
    { title: 'AI Marketing Tutorial', type: 'Video', engagement: 12.5, reach: 15000, views: 25000 },
    { title: 'Product Showcase Reel', type: 'Reel', engagement: 15.2, reach: 18000, views: 32000 },
    { title: 'Industry Insights Article', type: 'Article', engagement: 8.7, reach: 12000, views: 15000 }
  ];

  const optimizationTips = {
    'Reels/Videos': [
      'Keep videos under 15 seconds for maximum engagement',
      'Use trending audio and hashtags',
      'Post during peak hours (6-9 PM)',
      'Include captions for accessibility'
    ],
    'Static Posts': [
      'Use high-quality, visually appealing images',
      'Maintain consistent brand colors',
      'Include clear call-to-action',
      'Test different image formats (square vs landscape)'
    ],
    'Stories': [
      'Use interactive stickers (polls, questions)',
      'Post consistently throughout the day',
      'Include behind-the-scenes content',
      'Use location tags for local reach'
    ],
    'Articles': [
      'Write compelling headlines',
      'Use subheadings for readability',
      'Include relevant keywords for SEO',
      'Add visual elements (images, infographics)'
    ],
    'Carousels': [
      'Tell a story across slides',
      'Use consistent design elements',
      'Include clear navigation indicators',
      'End with strong call-to-action'
    ]
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
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <ContentIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {contentType} Performance Analytics
                </h2>
                <p className="text-sm text-gray-600">Detailed content type performance and optimization insights</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* AI Insights Section */}
          {contentTypeInsights && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">AI Content Intelligence Analysis</h3>
                </div>
                <button
                  className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  onClick={async () => {
                    try {
                      const api = new ContentIntelligenceAPIService();
                      const payload = {
                        workflow: 'implement_recommendations',
                        context: {
                          scope: 'content_type',
                          content_type: contentType,
                          recommendation: contentTypeInsights.recommendation,
                          key_insight: contentTypeInsights.keyInsight
                        },
                        agents: ['strategy_agent', 'orchestrator_agent', 'content_intelligence_agent', 'automation_agent']
                      };
                      await api.executeWorkflow(payload);
                      alert('Agents activated to implement content-type recommendations.');
                    } catch (e) {
                      alert('Could not activate agents right now.');
                    }
                  }}
                >
                  Activate agents
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-purple-700 mb-2">Key Insight</h4>
                  <p className="text-sm text-purple-600 mb-2">{contentTypeInsights.keyInsight}</p>
                  <div className="text-xs text-purple-500">
                    <strong>Data Source:</strong> {contentTypeInsights.dataSource}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-purple-700 mb-2">AI Recommendation</h4>
                  <p className="text-sm text-purple-600 mb-2">{contentTypeInsights.recommendation}</p>
                  <div className="text-xs text-purple-500">
                    <strong>Performance Score:</strong> {contentTypeInsights.performance}/100
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric, index) => (
              <div key={index} className={`p-4 rounded-lg ${metric.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                  <span className="text-xs text-gray-500">Last 30 days</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">{metric.label}</div>
                <div className="text-xs text-gray-500 mb-2">{metric.description}</div>
                <div className="text-xs text-gray-400">
                  <strong>Calculation:</strong> {metric.calculation}
                </div>
              </div>
            ))}
          </div>

          {/* Content Breakdown and Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Content Type Breakdown
              </h3>
              <div className="space-y-3">
                {contentBreakdown.map((content, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-gray-900">{content.type}</div>
                      <div className="text-sm text-gray-600">{content.count} pieces</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{content.avgEngagement}%</div>
                      <div className="text-xs text-gray-500">{content.avgReach.toLocaleString()} avg reach</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Top Performing Content
              </h3>
              <div className="space-y-3">
                {topPerformers.map((content, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-gray-900">{content.title}</div>
                      <div className="text-sm text-gray-600">{content.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{content.engagement}%</div>
                      <div className="text-xs text-gray-500">{content.views.toLocaleString()} views</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Optimization Tips */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Optimization Tips for {contentType}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm text-yellow-700">
                {(optimizationTips[contentType] || optimizationTips['Static Posts']).map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
              <div className="text-sm text-yellow-600">
                <h4 className="font-medium text-yellow-800 mb-2">Why These Tips Work</h4>
                <p className="mb-2">
                  These optimization strategies are based on analysis of your top-performing content and industry best practices.
                </p>
                <p>
                  The Content Intelligence Agent continuously monitors performance patterns to provide personalized recommendations.
                </p>
                <button
                  className="mt-3 text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                  onClick={async () => {
                    try {
                      const api = new ContentIntelligenceAPIService();
                      const payload = {
                        workflow: 'implement_recommendations',
                        context: {
                          scope: 'content_type_tips',
                          content_type: contentType,
                          tips: (optimizationTips[contentType] || optimizationTips['Static Posts'])
                        },
                        agents: ['strategy_agent', 'orchestrator_agent', 'content_intelligence_agent', 'automation_agent']
                      };
                      await api.executeWorkflow(payload);
                      alert('Agents activated to apply optimization tips.');
                    } catch (e) {
                      alert('Could not activate agents right now.');
                    }
                  }}
                >
                  Activate agents
                </button>
              </div>
            </div>
          </div>

          {/* Agent Actions Transparency */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Content Intelligence Agent Actions
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-700">Content Analysis</div>
                  <div className="text-gray-600">
                    Analyzed {contentType.toLowerCase()} performance patterns across all platforms to identify success factors
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-700">Performance Benchmarking</div>
                  <div className="text-gray-600">
                    Compared your {contentType.toLowerCase()} performance against industry standards and your historical data
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-700">Optimization Recommendations</div>
                  <div className="text-gray-600">
                    Generated personalized optimization strategies based on your content performance patterns
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Platform Features */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Learning Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Why {contentType} Performs This Way</h4>
                <ul className="text-blue-600 space-y-1">
                  <li>• High engagement indicates strong audience resonance</li>
                  <li>• Consistent reach suggests effective distribution strategy</li>
                  <li>• Growth trends show successful optimization efforts</li>
                  <li>• Performance patterns reveal audience preferences</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">How to Improve Performance</h4>
                <ul className="text-blue-600 space-y-1">
                  <li>• Focus on content types with highest engagement rates</li>
                  <li>• Optimize posting schedule based on audience activity</li>
                  <li>• A/B test different content formats and styles</li>
                  <li>• Monitor performance trends and adjust strategy</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContentTypePerformanceModal;
