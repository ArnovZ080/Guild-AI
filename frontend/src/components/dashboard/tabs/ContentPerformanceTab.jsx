import React from 'react';
import { TrendingUp } from 'lucide-react';

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
              {(performance?.performance?.map((platform, index) => (
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
              ))) || ['instagram', 'linkedin', 'twitter', 'facebook', 'tiktok'].map(platform => (
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

export default ContentPerformanceTab;
