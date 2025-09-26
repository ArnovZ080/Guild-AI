import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, X, CheckCircle } from 'lucide-react';

const ContentDetailsModal = ({ content, onClose, onReplicate, isOrchestrating }) => {
  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items.center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 text-green-500 mr-3" />
              Top Content Details
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
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
                </div>
              </div>

              <div className="bg-white p-4 rounded border">
                <h3 className="font-semibold text-gray-800 mb-3">AI Annotations</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  {content.agent_insights && (
                    <>
                      <div>Content Strategist: {content.agent_insights.content_strategist}</div>
                      <div>Brand Strategist: {content.agent_insights.brand_strategist}</div>
                    </>
                  )}
                  <div className="flex items-center text-green-700"><CheckCircle className="w-4 h-4 mr-2"/> Quality: {Math.round((content.quality_score || 0.9) * 100)}%</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Close</button>
              {onReplicate && (
                <button
                  onClick={() => onReplicate(content)}
                  disabled={isOrchestrating}
                  className="px-6 py-2 bg-green-600 text.white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  {isOrchestrating ? 'Orchestrating...' : 'Replicate'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContentDetailsModal;
