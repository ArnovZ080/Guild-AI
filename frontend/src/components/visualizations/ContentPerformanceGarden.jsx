import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Mock content performance data
const mockContentData = [
  {
    id: '1',
    title: 'Product Demo Video',
    type: 'video',
    performance: 95,
    engagement: 8.7,
    reach: 12500,
    conversions: 45,
    status: 'published',
    publishDate: new Date(2024, 0, 10),
    category: 'product',
    tags: ['demo', 'product', 'video']
  },
  {
    id: '2',
    title: 'AI Trends 2024 Blog Post',
    type: 'blog',
    performance: 87,
    engagement: 6.2,
    reach: 8900,
    conversions: 23,
    status: 'published',
    publishDate: new Date(2024, 0, 8),
    category: 'thought-leadership',
    tags: ['ai', 'trends', 'blog']
  },
  {
    id: '3',
    title: 'Social Media Campaign',
    type: 'social',
    performance: 78,
    engagement: 12.4,
    reach: 15600,
    conversions: 67,
    status: 'active',
    publishDate: new Date(2024, 0, 12),
    category: 'marketing',
    tags: ['social', 'campaign', 'engagement']
  },
  {
    id: '4',
    title: 'Email Newsletter',
    type: 'email',
    performance: 82,
    engagement: 15.3,
    reach: 3200,
    conversions: 89,
    status: 'published',
    publishDate: new Date(2024, 0, 11),
    category: 'newsletter',
    tags: ['email', 'newsletter', 'subscribers']
  },
  {
    id: '5',
    title: 'Case Study: TechCorp Success',
    type: 'case-study',
    performance: 91,
    engagement: 7.8,
    reach: 6800,
    conversions: 34,
    status: 'published',
    publishDate: new Date(2024, 0, 9),
    category: 'case-study',
    tags: ['case-study', 'success', 'enterprise']
  },
  {
    id: '6',
    title: 'Webinar: Future of AI',
    type: 'webinar',
    performance: 88,
    engagement: 9.1,
    reach: 2100,
    conversions: 156,
    status: 'scheduled',
    publishDate: new Date(2024, 0, 15),
    category: 'education',
    tags: ['webinar', 'ai', 'education']
  },
  {
    id: '7',
    title: 'Infographic: Market Stats',
    type: 'infographic',
    performance: 76,
    engagement: 11.2,
    reach: 4200,
    conversions: 28,
    status: 'published',
    publishDate: new Date(2024, 0, 7),
    category: 'visual',
    tags: ['infographic', 'stats', 'visual']
  },
  {
    id: '8',
    title: 'Podcast Episode',
    type: 'podcast',
    performance: 83,
    engagement: 5.9,
    reach: 1800,
    conversions: 19,
    status: 'published',
    publishDate: new Date(2024, 0, 6),
    category: 'audio',
    tags: ['podcast', 'audio', 'interview']
  }
];

const ContentPerformanceGarden = () => {
  const [contentData, setContentData] = useState(mockContentData);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Filter content based on selected filters
  const filteredContent = contentData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesCategory && matchesType;
  });

  // Get performance color
  const getPerformanceColor = (performance) => {
    if (performance >= 90) return 'text-green-600 bg-green-100';
    if (performance >= 80) return 'text-blue-600 bg-blue-100';
    if (performance >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get type icon
  const getTypeIcon = (type) => {
    const icons = {
      video: '🎥',
      blog: '📝',
      social: '📱',
      email: '📧',
      'case-study': '📊',
      webinar: '🎓',
      infographic: '📈',
      podcast: '🎧'
    };
    return icons[type] || '📄';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Calculate garden metrics
  const totalContent = contentData.length;
  const avgPerformance = Math.round(contentData.reduce((sum, item) => sum + item.performance, 0) / totalContent);
  const totalReach = contentData.reduce((sum, item) => sum + item.reach, 0);
  const totalConversions = contentData.reduce((sum, item) => sum + item.conversions, 0);

  // Handle re-initiating content
  const handleReinitiateContent = (content) => {
    console.log('Re-initiating content:', content.title);
    // In real implementation, this would trigger the content agent to create similar content
    alert(`Re-initiating "${content.title}" - The content agent will create similar high-performing content!`);
  };

  return (
    <div className="space-y-6">
      {/* Garden Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{totalContent}</div>
          <div className="text-sm opacity-90">Total Content</div>
        </div>
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{avgPerformance}%</div>
          <div className="text-sm opacity-90">Avg Performance</div>
        </div>
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{totalReach.toLocaleString()}</div>
          <div className="text-sm opacity-90">Total Reach</div>
        </div>
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{totalConversions}</div>
          <div className="text-sm opacity-90">Total Conversions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Categories</option>
          <option value="product">Product</option>
          <option value="thought-leadership">Thought Leadership</option>
          <option value="marketing">Marketing</option>
          <option value="newsletter">Newsletter</option>
          <option value="case-study">Case Study</option>
          <option value="education">Education</option>
          <option value="visual">Visual</option>
          <option value="audio">Audio</option>
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Types</option>
          <option value="video">Video</option>
          <option value="blog">Blog</option>
          <option value="social">Social</option>
          <option value="email">Email</option>
          <option value="case-study">Case Study</option>
          <option value="webinar">Webinar</option>
          <option value="infographic">Infographic</option>
          <option value="podcast">Podcast</option>
        </select>
      </div>

      {/* Content Garden Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredContent.map((content, index) => (
          <motion.div
            key={content.id}
            className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Content Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getTypeIcon(content.type)}</span>
                <span className="text-xs font-medium text-gray-600 capitalize">{content.type}</span>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(content.status)}`}>
                {content.status}
              </span>
            </div>

            {/* Content Title */}
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{content.title}</h3>

            {/* Performance Score */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Performance</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(content.performance)}`}>
                  {content.performance}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    content.performance >= 90 ? 'bg-green-500' :
                    content.performance >= 80 ? 'bg-blue-500' :
                    content.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${content.performance}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-gray-600">Engagement</div>
                <div className="font-semibold">{content.engagement}%</div>
              </div>
              <div>
                <div className="text-gray-600">Reach</div>
                <div className="font-semibold">{content.reach.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-600">Conversions</div>
                <div className="font-semibold">{content.conversions}</div>
              </div>
              <div>
                <div className="text-gray-600">Published</div>
                <div className="font-semibold">{content.publishDate.toLocaleDateString()}</div>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1">
              {content.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
              {content.tags.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{content.tags.length - 2}
                </span>
              )}
            </div>

            {/* Re-initiate Button for High Performing Content */}
            {content.performance >= 80 && (
              <button
                onClick={() => handleReinitiateContent(content)}
                className="w-full mt-3 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
              >
                <span>🔄</span>
                <span>Re-initiate Content</span>
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Garden Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Performance Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Excellent (90%+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Good (80-89%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Average (70-79%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Needs Improvement (&lt;70%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPerformanceGarden;