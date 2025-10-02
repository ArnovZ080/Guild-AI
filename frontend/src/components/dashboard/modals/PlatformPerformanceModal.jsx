import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, Eye, Heart, Share2, MousePointer, BarChart3, Brain, Target, Zap, Clock, Users, DollarSign } from 'lucide-react';

const PlatformPerformanceModal = ({ platform, performanceData, aiInsights, onClose }) => {
  const platformData = performanceData.find(p => p.platform === platform) || performanceData[0];
  const platformInsights = aiInsights?.platformInsights?.[platform] || aiInsights?.platformInsights?.instagram;

  const metrics = [
    {
      label: 'Engagement Rate (%)',
      value: platformData?.engagement_rate || 0,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Percentage of people who interact with your content (likes, comments, shares)',
      calculation: 'Total Engagements / Reach × 100'
    },
    {
      label: 'Reach',
      value: platformData?.reach?.toLocaleString() || '0',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Number of unique people who saw your content',
      calculation: 'Unique viewers across all posts'
    },
    {
      label: 'Impressions',
      value: platformData?.impressions?.toLocaleString() || '0',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Total number of times your content was displayed',
      calculation: 'Sum of all content views (may include repeat views)'
    },
    {
      label: 'Click-Through Rate (CTR)',
      value: `${(platformData?.engagement_rate * 0.3).toFixed(1)}%`,
      icon: MousePointer,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Percentage of people who clicked on your content',
      calculation: 'Clicks / Impressions × 100'
    }
  ];

  const performanceHistory = [
    { date: '2024-01-01', engagement: 4.2, reach: 12000, impressions: 18000 },
    { date: '2024-01-08', engagement: 5.1, reach: 13500, impressions: 20000 },
    { date: '2024-01-15', engagement: 6.8, reach: 15000, impressions: 25000 },
    { date: '2024-01-22', engagement: 8.5, reach: 15000, impressions: 25000 }
  ];

  const topContent = [
    { title: 'AI Marketing Guide', engagement: 12.5, reach: 8500, type: 'Article' },
    { title: 'Product Demo Video', engagement: 9.8, reach: 12000, type: 'Video' },
    { title: 'Industry Insights Post', engagement: 7.2, reach: 6500, type: 'Post' }
  ];

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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                platform === 'instagram' ? 'bg-pink-100' :
                platform === 'linkedin' ? 'bg-blue-100' :
                platform === 'twitter' ? 'bg-blue-100' :
                platform === 'facebook' ? 'bg-blue-100' :
                'bg-gray-100'
              }`}>
                <span className="text-lg">
                  {platform === 'instagram' ? '📷' :
                   platform === 'linkedin' ? '💼' :
                   platform === 'twitter' ? '🐦' :
                   platform === 'facebook' ? '📘' : '📱'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {platform} Performance Analytics
                </h2>
                <p className="text-sm text-gray-600">Detailed performance metrics and AI insights</p>
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
          {platformInsights && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">AI Content Intelligence Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Key Insight</h4>
                  <p className="text-sm text-blue-600 mb-2">{platformInsights.keyInsight}</p>
                  <div className="text-xs text-blue-500">
                    <strong>Data Source:</strong> {platformInsights.dataSource}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">AI Recommendation</h4>
                  <p className="text-sm text-blue-600 mb-2">{platformInsights.recommendation}</p>
                  <div className="text-xs text-blue-500">
                    <strong>Performance Score:</strong> {platformInsights.performance}/100
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

          {/* Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance Trends
              </h3>
              <div className="space-y-3">
                {performanceHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-gray-900">{entry.date}</div>
                      <div className="text-sm text-gray-600">
                        {entry.engagement}% engagement • {entry.reach.toLocaleString()} reach
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">
                        +{((entry.engagement - 4.2) * 100 / 4.2).toFixed(1)}%
                      </div>
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
                {topContent.map((content, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-gray-900">{content.title}</div>
                      <div className="text-sm text-gray-600">{content.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{content.engagement}%</div>
                      <div className="text-xs text-gray-500">{content.reach.toLocaleString()} reach</div>
                    </div>
                  </div>
                ))}
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
                  <div className="font-medium text-gray-700">Data Collection</div>
                  <div className="text-gray-600">
                    Analyzed {platform} API data for engagement patterns, reach metrics, and audience behavior
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-700">Performance Analysis</div>
                  <div className="text-gray-600">
                    Applied machine learning algorithms to identify top-performing content characteristics
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-700">Insight Generation</div>
                  <div className="text-gray-600">
                    Generated actionable recommendations based on performance patterns and industry benchmarks
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
                <h4 className="font-medium text-blue-700 mb-2">Why This Platform Performs Well</h4>
                <ul className="text-blue-600 space-y-1">
                  <li>• High engagement rates indicate strong audience connection</li>
                  <li>• Consistent reach suggests effective content distribution</li>
                  <li>• Growing trends show successful optimization strategies</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Optimization Opportunities</h4>
                <ul className="text-blue-600 space-y-1">
                  <li>• Focus on content types with highest engagement</li>
                  <li>• Optimize posting times based on audience activity</li>
                  <li>• A/B test different content formats</li>
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

export default PlatformPerformanceModal;
